// Defaults shared by popup, content scripts, and the service worker.
(function () {
  var DEFAULTS = {
    enabled: true,
    mode: "full", // "lite" | "full" | "ultra" | "wenyan"
    promptPlacement: "prepend", // "prepend" | "append"
    previewBeforeSend: false,
    hotkeys: true,
    showBadge: true,
    visibleInjection: true,
    uiLanguage: "en",
    debug: false,
    sites: {
      chatgpt: true,
      claude: true,
      gemini: true,
      deepseek: true,
      mistral: true,
      qwen: true,
      perplexity: true,
      poe: true
    },
    customPrompts: {
      chatgpt: "",
      claude: "",
      gemini: "",
      deepseek: "",
      mistral: "",
      qwen: "",
      perplexity: "",
      poe: ""
    },
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
