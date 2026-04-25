// Popup controller. Reads/writes settings via the storage helper.
(function () {
  var ns = globalThis.CavemanWeb;
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  var state = null;

  function withDefaults(obj) {
    var d = ns.defaults;
    var merged = Object.assign({}, d, obj || {});
    merged.sites = Object.assign({}, d.sites, (obj && obj.sites) || {});
    merged.stats = Object.assign({}, d.stats, (obj && obj.stats) || {});
    return merged;
  }

  async function save(patch) {
    Object.assign(state, patch);
    await ns.storage.set(patch);
  }

  function render() {
    $("#enabled").checked = !!state.enabled;
    $$('input[name="mode"]').forEach(function (r) { r.checked = (r.value === state.mode); });
    $$('input[data-site]').forEach(function (c) {
      c.checked = state.sites[c.dataset.site] !== false;
    });
    $("#showBadge").checked = !!state.showBadge;
    $("#visibleInjection").checked = state.visibleInjection !== false;
    $("#debug").checked = !!state.debug;
    renderPreview();
    renderStats();
  }

  function renderPreview() {
    var instr = ns.prompt.getInstruction(state.mode);
    $("#mode-preview").textContent = instr;
  }

  function renderStats() {
    $("#stat-prompts").textContent = state.stats.promptsEnhanced || 0;
    $("#stat-instr").textContent = state.stats.instructionTokens || 0;
    $("#stat-user").textContent = state.stats.userPromptTokens || 0;
    $("#stat-saved").textContent = state.stats.estSavedOutputTokens || 0;
  }

  function bind() {
    $("#enabled").addEventListener("change", function (e) { save({ enabled: e.target.checked }); });

    $$('input[name="mode"]').forEach(function (r) {
      r.addEventListener("change", function (e) {
        if (e.target.checked) {
          state.mode = e.target.value;
          save({ mode: e.target.value }).then(renderPreview);
        }
      });
    });

    $$('input[data-site]').forEach(function (c) {
      c.addEventListener("change", function () {
        var sites = Object.assign({}, state.sites);
        sites[c.dataset.site] = c.checked;
        state.sites = sites;
        save({ sites: sites });
      });
    });

    $("#showBadge").addEventListener("change", function (e) { save({ showBadge: e.target.checked }); });
    $("#visibleInjection").addEventListener("change", function (e) { save({ visibleInjection: e.target.checked }); });
    $("#debug").addEventListener("change", function (e) { save({ debug: e.target.checked }); });

    $("#resetStats").addEventListener("click", function () {
      var fresh = {
        promptsEnhanced: 0,
        instructionTokens: 0,
        userPromptTokens: 0,
        estSavedOutputTokens: 0
      };
      state.stats = fresh;
      save({ stats: fresh }).then(renderStats);
    });
  }

  ns.storage.onChanged(function (changes) {
    Object.keys(changes).forEach(function (k) {
      state[k] = changes[k].newValue;
    });
    if (!state.sites) state.sites = ns.defaults.sites;
    if (!state.stats) state.stats = ns.defaults.stats;
    render();
  });

  (async function () {
    var raw = await ns.storage.getAll();
    state = withDefaults(raw);
    render();
    bind();
  })();
})();
