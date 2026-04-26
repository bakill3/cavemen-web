// Main content script. It only touches the active editor and local counters.
(function () {
  var ns = globalThis.CavemanWeb;
  if (!ns) return;

  var state = null;
  var processing = false;
  var debugFromUrl = false;
  var previewEl = null;
  var pendingPreview = null;

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
    merged.customPrompts = Object.assign({}, d.customPrompts, (obj && obj.customPrompts) || {});
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
    var savedTok = Math.round(userTok * ns.tokens.savingPct(state.mode));
    var net = Math.max(0, savedTok - instrTok);
    var stats = {
      promptsEnhanced: (state.stats.promptsEnhanced || 0) + 1,
      instructionTokens: (state.stats.instructionTokens || 0) + instrTok,
      userPromptTokens: (state.stats.userPromptTokens || 0) + userTok,
      estSavedOutputTokens: (state.stats.estSavedOutputTokens || 0) + savedTok,
      estNetSavedTokens: (state.stats.estNetSavedTokens || 0) + net
    };
    state.stats = stats;
    await ns.storage.set({ stats: stats });
  }

  function customPromptFor(adapter) {
    if (!adapter || !state || !state.customPrompts) return "";
    return state.customPrompts[adapter.key] || "";
  }

  function buildPrompt(adapter, userText) {
    return ns.prompt.build(state.mode, userText, {
      customPrompt: customPromptFor(adapter),
      placement: state.promptPlacement
    });
  }

  function currentInstruction(adapter) {
    return ns.prompt.getInstruction(state.mode, customPromptFor(adapter));
  }

  async function injectIntoEditor(adapter, editor, overrideText) {
    var current = (adapter.getEditorText(editor) || "").trim();
    if (!current) return false;
    if (ns.prompt.hasMarker(current)) {
      dlog("skip injection: marker already present");
      return false;
    }
    var built = overrideText || buildPrompt(adapter, current);
    adapter.setEditorText(editor, built);
    await bumpStats(current, currentInstruction(adapter));
    dlog("injected", { adapter: adapter.key, mode: state.mode, chars: current.length });
    return true;
  }

  function eventInsideEditor(e, editor) {
    if (!editor) return false;
    var t = e.target;
    if (!t) return false;
    return editor === t || (editor.contains && editor.contains(t));
  }

  function closePreview() {
    if (previewEl && previewEl.parentNode) previewEl.parentNode.removeChild(previewEl);
    previewEl = null;
    pendingPreview = null;
  }

  function showPreview(adapter, editor, text) {
    closePreview();
    pendingPreview = { adapter: adapter, editor: editor, original: text };

    previewEl = document.createElement("div");
    previewEl.id = "caveman-web-preview";
    previewEl.innerHTML =
      '<div class="caveman-web-preview-head">' +
        '<strong>Caveman draft</strong>' +
        '<span class="caveman-web-preview-mode" data-caveman-mode></span>' +
        '<button type="button" data-caveman-close aria-label="Close">x</button>' +
      '</div>' +
      '<label class="caveman-web-preview-label">Original</label>' +
      '<div class="caveman-web-preview-original" data-caveman-original></div>' +
      '<label class="caveman-web-preview-label">Enhanced (with Caveman instruction)</label>' +
      '<textarea data-caveman-enhanced spellcheck="false"></textarea>' +
      '<div class="caveman-web-preview-actions">' +
        '<button type="button" data-caveman-cancel>Cancel</button>' +
        '<button type="button" data-caveman-send-original>Send original</button>' +
        '<button type="button" data-caveman-send class="primary">Send enhanced</button>' +
      '</div>';

    previewEl.querySelector("[data-caveman-mode]").textContent = String(state.mode || "full").toUpperCase();
    previewEl.querySelector("[data-caveman-original]").textContent = text;
    var textarea = previewEl.querySelector("[data-caveman-enhanced]");
    textarea.value = buildPrompt(adapter, text);

    function sendWith(value, opts) {
      if (!pendingPreview) return;
      processing = true;
      var ad = pendingPreview.adapter;
      var ed = pendingPreview.editor;
      var bumped = !!(opts && opts.bumpStats);
      (async function () {
        try {
          var current = (ad.getEditorText(ed) || "").trim();
          if (current && !ns.prompt.hasMarker(current)) {
            ad.setEditorText(ed, value);
            if (bumped) await bumpStats(text, currentInstruction(ad));
          }
          closePreview();
          await new Promise(function (r) { requestAnimationFrame(function () { r(); }); });
          var btn = ad.findSendButton();
          if (btn) ad.submit(btn);
        } finally {
          setTimeout(function () { processing = false; }, 250);
        }
      })();
    }

    previewEl.querySelector("[data-caveman-close]").addEventListener("click", closePreview);
    previewEl.querySelector("[data-caveman-cancel]").addEventListener("click", closePreview);
    previewEl.querySelector("[data-caveman-send]").addEventListener("click", function () {
      sendWith(textarea.value, { bumpStats: true });
    });
    previewEl.querySelector("[data-caveman-send-original]").addEventListener("click", function () {
      sendWith(text, { bumpStats: false });
    });

    document.documentElement.appendChild(previewEl);
    textarea.focus();
  }

  function maybePreview(adapter, editor, text) {
    if (!state.previewBeforeSend) return false;
    showPreview(adapter, editor, text);
    return true;
  }

  async function handleKeyDown(e) {
    if (state && state.hotkeys && e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey) {
      if (String(e.key).toLowerCase() === "m") {
        e.preventDefault();
        await cycleMode();
        return;
      }
      if (String(e.key).toLowerCase() === "e") {
        e.preventDefault();
        state.enabled = !state.enabled;
        await ns.storage.set({ enabled: state.enabled });
        updateBadge();
        return;
      }
    }

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
      return; // do NOT preventDefault - let site send the already-marked text
    }

    processing = true;
    e.preventDefault();
    e.stopImmediatePropagation();

    try {
      if (maybePreview(adapter, editor, text)) return;
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
    if (!clicked) return; // not a button click - let it pass
    var sendBtn = adapter.findSendButton();
    if (!sendBtn) return; // can't identify send, so leave it alone
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
      if (maybePreview(adapter, editor, text)) return;
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
    if (!state.customPrompts) state.customPrompts = ns.defaults.customPrompts;
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
