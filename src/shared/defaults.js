// Default settings + stats. Loaded into both content scripts and the
// service worker (via importScripts). Safe to load anywhere — no I/O.
(function () {
  var DEFAULTS = {
    enabled: true,
    mode: "full", // "lite" | "full" | "ultra" | "wenyan"
    showBadge: true,
    visibleInjection: true,
    debug: false, // when true, logs adapter detection + injection events
    sites: {
      chatgpt: true,
      claude: true,
      gemini: true,
      deepseek: true
    },
    // Heuristic only. ~4 chars per token. Output saving is a rough estimate.
    assumedOutputSavingPct: 0.4,
    stats: {
      promptsEnhanced: 0,
      instructionTokens: 0,
      userPromptTokens: 0,
      estSavedOutputTokens: 0
    }
  };

  // Expose under a single namespace plus a SW-friendly global.
  globalThis.CavemanWeb = globalThis.CavemanWeb || {};
  globalThis.CavemanWeb.defaults = DEFAULTS;
  globalThis.CAVEMAN_DEFAULTS = DEFAULTS;
})();
