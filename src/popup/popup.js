// Popup settings.
(function () {
  var ns = globalThis.CavemanWeb;
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  var state = null;
  var customSite = "chatgpt";
  var siteNames = {
    chatgpt: "ChatGPT",
    claude: "Claude",
    gemini: "Gemini",
    deepseek: "DeepSeek",
    mistral: "Mistral",
    qwen: "Qwen",
    perplexity: "Perplexity",
    poe: "Poe"
  };

  var copy = {
    en: {
      tagline: "Make AI answer shorter.",
      enable: "Enable Caveman",
      mode: "Mode",
      sites: "Sites",
      send: "Send",
      preview: "Preview before send",
      hotkeys: "Hotkeys",
      placement: "Instruction",
      language: "UI",
      hotkeyHelp: "Ctrl+Shift+M cycles mode. Ctrl+Shift+E toggles the extension.",
      custom: "Custom prompt",
      display: "Display",
      badge: "Show badge",
      visible: "Visible injection",
      visibleHelp: "Hidden request editing stays off. It needs broader powers and is harder to trust.",
      advanced: "Advanced",
      debug: "Debug logging",
      statsHelp: "Stats are local estimates. No chat text is stored.",
      footer: "No tracking. No chat storage. Local only."
    },
    pt: {
      tagline: "Faz a IA responder mais curto.",
      enable: "Ativar Caveman",
      mode: "Modo",
      sites: "Sites",
      send: "Envio",
      preview: "Prévia antes de enviar",
      hotkeys: "Atalhos",
      placement: "Instrução",
      language: "UI",
      hotkeyHelp: "Ctrl+Shift+M troca o modo. Ctrl+Shift+E liga ou desliga.",
      custom: "Prompt custom",
      display: "Tela",
      badge: "Mostrar badge",
      visible: "Injeção visível",
      visibleHelp: "Edição escondida de request fica desligada. Pede poderes demais.",
      advanced: "Avançado",
      debug: "Log de debug",
      statsHelp: "Stats são estimativas locais. Nenhum chat é salvo.",
      footer: "Sem tracking. Sem salvar chat. Tudo local."
    },
    zh: {
      tagline: "让 AI 回答更短。",
      enable: "启用 Caveman",
      mode: "模式",
      sites: "网站",
      send: "发送",
      preview: "发送前预览",
      hotkeys: "快捷键",
      placement: "指令位置",
      language: "界面",
      hotkeyHelp: "Ctrl+Shift+M 切换模式。Ctrl+Shift+E 开关扩展。",
      custom: "自定义提示",
      display: "显示",
      badge: "显示标记",
      visible: "显示注入内容",
      visibleHelp: "不做隐藏请求改写。权限更大，也更难信任。",
      advanced: "高级",
      debug: "调试日志",
      statsHelp: "统计只是本地估算。不保存聊天内容。",
      footer: "无跟踪。不保存聊天。只在本地。"
    },
    ja: {
      tagline: "AI の返事を短くする。",
      enable: "Caveman を有効化",
      mode: "モード",
      sites: "サイト",
      send: "送信",
      preview: "送信前に確認",
      hotkeys: "ショートカット",
      placement: "指示",
      language: "UI",
      hotkeyHelp: "Ctrl+Shift+M でモード切替。Ctrl+Shift+E でオンオフ。",
      custom: "カスタムプロンプト",
      display: "表示",
      badge: "バッジを表示",
      visible: "注入を表示",
      visibleHelp: "隠しリクエスト編集は使いません。権限が広くなりすぎます。",
      advanced: "詳細",
      debug: "デバッグログ",
      statsHelp: "統計はローカル推定です。チャット文は保存しません。",
      footer: "追跡なし。チャット保存なし。ローカルだけ。"
    }
  };

  function withDefaults(obj) {
    var d = ns.defaults;
    var merged = Object.assign({}, d, obj || {});
    merged.sites = Object.assign({}, d.sites, (obj && obj.sites) || {});
    merged.customPrompts = Object.assign({}, d.customPrompts, (obj && obj.customPrompts) || {});
    merged.stats = Object.assign({}, d.stats, (obj && obj.stats) || {});
    return merged;
  }

  async function save(patch) {
    Object.assign(state, patch);
    await ns.storage.set(patch);
  }

  function render() {
    applyLanguage();
    $("#enabled").checked = !!state.enabled;
    $$('input[name="mode"]').forEach(function (r) { r.checked = (r.value === state.mode); });
    $$('input[data-site]').forEach(function (c) {
      c.checked = state.sites[c.dataset.site] !== false;
    });
    $("#showBadge").checked = !!state.showBadge;
    $("#visibleInjection").checked = state.visibleInjection !== false;
    $("#previewBeforeSend").checked = !!state.previewBeforeSend;
    $("#hotkeys").checked = state.hotkeys !== false;
    $("#promptPlacement").value = state.promptPlacement || "prepend";
    $("#uiLanguage").value = state.uiLanguage || "en";
    $("#debug").checked = !!state.debug;
    renderCustomSites();
    renderCustomPrompt();
    renderPreview();
    renderStats();
  }

  function applyLanguage() {
    var dict = copy[state.uiLanguage] || copy.en;
    $$("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
  }

  function renderPreview() {
    var instr = ns.prompt.getInstruction(state.mode, state.customPrompts[customSite]);
    $("#mode-preview").textContent = instr;
  }

  function renderCustomSites() {
    var select = $("#customSite");
    if (select.options.length) return;
    Object.keys(siteNames).forEach(function (key) {
      var opt = document.createElement("option");
      opt.value = key;
      opt.textContent = siteNames[key];
      select.appendChild(opt);
    });
    select.value = customSite;
  }

  function renderCustomPrompt() {
    $("#customSite").value = customSite;
    $("#customPrompt").value = state.customPrompts[customSite] || "";
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
    $("#previewBeforeSend").addEventListener("change", function (e) { save({ previewBeforeSend: e.target.checked }); });
    $("#hotkeys").addEventListener("change", function (e) { save({ hotkeys: e.target.checked }); });
    $("#promptPlacement").addEventListener("change", function (e) { save({ promptPlacement: e.target.value }); });
    $("#uiLanguage").addEventListener("change", function (e) {
      save({ uiLanguage: e.target.value }).then(render);
    });
    $("#debug").addEventListener("change", function (e) { save({ debug: e.target.checked }); });

    $("#customSite").addEventListener("change", function (e) {
      customSite = e.target.value;
      renderCustomPrompt();
      renderPreview();
    });

    $("#customPrompt").addEventListener("input", function (e) {
      var customPrompts = Object.assign({}, state.customPrompts);
      customPrompts[customSite] = e.target.value;
      state.customPrompts = customPrompts;
      ns.storage.set({ customPrompts: customPrompts });
      renderPreview();
    });

    $("#clearCustom").addEventListener("click", function () {
      var customPrompts = Object.assign({}, state.customPrompts);
      customPrompts[customSite] = "";
      state.customPrompts = customPrompts;
      save({ customPrompts: customPrompts }).then(render);
    });

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
    if (!state.customPrompts) state.customPrompts = ns.defaults.customPrompts;
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
