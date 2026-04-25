// Caveman Web content script.
//
// Privacy contract:
//   * We only read the editor element the user is typing into.
//   * We never read, persist, or transmit any chat-history message text.
//   * We never store prompt or response text — only numeric counters.
//   * We never make network requests.
//
// Submission flow:
//   1. User presses Enter (no Shift) or clicks the send button.
//   2. We intercept in the capture phase and call preventDefault().
//   3. We rewrite the editor with `[Caveman <mode>] <instruction>\n---\n<text>`.
//   4. We click the site's send button. The marker prevents re-injection.
//
// We listen on `document` because send buttons are not always inside the
// editor container; we early-exit on every event that is not an Enter key
// in the editor or a click on the send button.
(function () {
  var ns = globalThis.CavemanWeb;
  if (!ns) return;

  var state = null;
  var processing = false;
  var debugFromUrl = false;

  try {
    debugFromUrl = /[?&]caveman-debug=1\b/.test(location.search);
  } catch (_) { /* opaque origin */ }

  function isDebug() {
    if (debugFromUrl) return true;
    return !!(state && state.debug);
  }

  function dlog() {
    if (!isDebug()) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift("[Caveman Web]");
    // eslint-disable-next-line no-console
    console.log.apply(console, args);
  }

  function dwarn() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("[Caveman Web]");
    // eslint-disable-next-line no-console
    console.warn.apply(console, args);
  }

  function withDefaults(obj) {
    var d = ns.defaults;
    var merged = Object.assign({}, d, obj || {});
    merged.sites = Object.assign({}, d.sites, (obj && obj.sites) || {});
    merged.stats = Object.assign({}, d.stats, (obj && obj.stats) || {});
    return merged;
  }

  async function loadState() {
    var raw = await ns.storage.getAll();
    state = withDefaults(raw);
  }

  function activeAdapter() {
    var a = ns.adapters.pickAdapter();
    if (!a || a.key === "generic") return null;
    return a;
  }

  function siteEnabled(adapter) {
    if (!state || !state.enabled) return false;
    if (!adapter) return false;
    return state.sites[adapter.key] !== false;
  }

  function updateBadge() {
    var adapter = ns.adapters.pickAdapter();
    if (state && state.enabled && state.showBadge && siteEnabled(adapter)) {
      ns.badge.show(state.mode);
    } else {
      ns.badge.hide();
    }
  }

  async function bumpStats(userText, instruction) {
    var userTok = ns.tokens.estimate(userText);
    var instrTok = ns.tokens.estimate(instruction);
    var savedTok = Math.round(userTok * (state.assumedOutputSavingPct || 0.4));
    var stats = {
      promptsEnhanced: (state.stats.promptsEnhanced || 0) + 1,
      instructionTokens: (state.stats.instructionTokens || 0) + instrTok,
      userPromptTokens: (state.stats.userPromptTokens || 0) + userTok,
      estSavedOutputTokens: (state.stats.estSavedOutputTokens || 0) + savedTok
    };
    state.stats = stats;
    await ns.storage.set({ stats: stats });
  }

  async function injectIntoEditor(adapter, editor) {
    var current = (adapter.getEditorText(editor) || "").trim();
    if (!current) return false;
    if (ns.prompt.hasMarker(current)) {
      dlog("skip injection: marker already present");
      return false;
    }
    var built = ns.prompt.build(state.mode, current);
    adapter.setEditorText(editor, built);
    // Stats only — we pass the user text length to the estimator and then
    // drop the variable from scope. Nothing is persisted but counts.
    await bumpStats(current, ns.prompt.getInstruction(state.mode));
    dlog("injected", { adapter: adapter.key, mode: state.mode, chars: current.length });
    return true;
  }

  function eventInsideEditor(e, editor) {
    if (!editor) return false;
    var t = e.target;
    if (!t) return false;
    return editor === t || (editor.contains && editor.contains(t));
  }

  async function handleKeyDown(e) {
    if (processing) return;
    if (!state || !state.enabled) return;
    if (e.key !== "Enter") return;
    if (e.shiftKey || e.altKey) return;          // newline / soft breaks
    if (e.isComposing || e.keyCode === 229) return; // IME composition
    var adapter = activeAdapter();
    if (!siteEnabled(adapter)) return;
    var editor = adapter.findEditor();
    if (!editor) {
      dwarn("editor not found on Enter; site DOM may have changed", adapter.key);
      return;
    }
    if (!eventInsideEditor(e, editor)) return;
    var text = (adapter.getEditorText(editor) || "").trim();
    if (!text) return;
    if (ns.prompt.hasMarker(text)) {
      dlog("Enter: marker present, letting site handle send");
      return; // do NOT preventDefault — let site send the already-marked text
    }

    processing = true;
    e.preventDefault();
    e.stopImmediatePropagation();

    try {
      await injectIntoEditor(adapter, editor);
      await new Promise(function (r) { requestAnimationFrame(function () { r(); }); });
      var btn = adapter.findSendButton();
      if (btn) {
        adapter.submit(btn);
      } else {
        dwarn("send button not found after Enter inject; user may need to click manually", adapter.key);
      }
    } finally {
      setTimeout(function () { processing = false; }, 250);
    }
  }

  async function handleClick(e) {
    if (processing) return;
    if (!state || !state.enabled) return;
    var adapter = activeAdapter();
    if (!siteEnabled(adapter)) return;
    var clicked = e.target && e.target.closest ? e.target.closest('button, [role="button"]') : null;
    if (!clicked) return; // not a button click — let it pass
    var sendBtn = adapter.findSendButton();
    if (!sendBtn) return; // can't identify send → don't interfere
    if (clicked !== sendBtn && !sendBtn.contains(clicked) && !clicked.contains(sendBtn)) return;

    var editor = adapter.findEditor();
    if (!editor) {
      dwarn("editor not found on send click", adapter.key);
      return;
    }
    var text = (adapter.getEditorText(editor) || "").trim();
    if (!text) return;
    if (ns.prompt.hasMarker(text)) {
      dlog("click: marker present, letting site send");
      return;
    }

    processing = true;
    e.preventDefault();
    e.stopImmediatePropagation();

    try {
      await injectIntoEditor(adapter, editor);
      await new Promise(function (r) { requestAnimationFrame(function () { r(); }); });
      var fresh = adapter.findSendButton();
      if (fresh) adapter.submit(fresh);
    } finally {
      setTimeout(function () { processing = false; }, 250);
    }
  }

  async function cycleMode() {
    var order = ["lite", "full", "ultra", "wenyan"];
    var i = order.indexOf(state.mode);
    var next = order[(i + 1) % order.length];
    state.mode = next;
    await ns.storage.set({ mode: next });
    updateBadge();
    dlog("mode cycled to", next);
  }

  function attachListeners() {
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("click", handleClick, true);
    window.addEventListener("caveman:cycle-mode", cycleMode);
  }

  ns.storage.onChanged(function (changes) {
    if (!state) return;
    Object.keys(changes).forEach(function (k) {
      state[k] = changes[k].newValue;
    });
    if (!state.sites) state.sites = ns.defaults.sites;
    if (!state.stats) state.stats = ns.defaults.stats;
    updateBadge();
  });

  (async function () {
    try {
      await loadState();
      var adapter = ns.adapters.pickAdapter();
      dlog("init", {
        adapter: adapter && adapter.key,
        enabled: state.enabled,
        mode: state.mode,
        host: location.hostname
      });
      attachListeners();
      updateBadge();
    } catch (err) {
      dwarn("init failed", err);
    }
  })();
})();
