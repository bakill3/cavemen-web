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
      statusOn: "On",
      statusOff: "Off",
      enable: "Enable Caveman",
      mode: "Mode",
      tokens: "Token estimate",
      sites: "Sites",
      send: "Send",
      preview: "Preview before send",
      hotkeys: "Hotkeys",
      placement: "Instruction",
      language: "UI",
      before: "Before prompt",
      after: "After prompt",
      hotkeyHelp: "Ctrl+Shift+M cycles mode. Ctrl+Shift+E toggles the extension.",
      custom: "Custom prompt",
      clearCustom: "clear custom prompt",
      display: "Display",
      badge: "Show badge",
      visible: "Visible injection",
      visibleHelp: "Hidden request editing stays off. It needs broader powers and is harder to trust.",
      advanced: "Advanced",
      debug: "Debug logging",
      reset: "reset",
      statPrompts: "prompts enhanced",
      statSaved: "est. saved output tokens",
      statInstr: "instruction tokens added",
      statNet: "est. net tokens saved",
      statsHelp: "Estimates only. No chat text stored.",
      howTitle: "How it works",
      how1: "You write your message normally.",
      how2: "Caveman Web adds a short instruction locally before send.",
      how3: "The AI site answers shorter. Sometimes a lot shorter.",
      how4: "Settings stay on your device. Token counts are estimates.",
      examplesTitle: "Before / after",
      exNormal: "Normal",
      exCaveman: "Caveman",
      footer: "Local only. No tracking. No chat storage."
    },
    pt: {
      tagline: "Faz a IA responder mais curto.",
      statusOn: "Ligado",
      statusOff: "Desligado",
      enable: "Ativar Caveman",
      mode: "Modo",
      tokens: "Estimativa de tokens",
      sites: "Sites",
      send: "Envio",
      preview: "Prévia antes de enviar",
      hotkeys: "Atalhos",
      placement: "Instrução",
      language: "UI",
      before: "Antes do prompt",
      after: "Depois do prompt",
      hotkeyHelp: "Ctrl+Shift+M troca o modo. Ctrl+Shift+E liga ou desliga.",
      custom: "Prompt custom",
      clearCustom: "limpar prompt custom",
      display: "Tela",
      badge: "Mostrar badge",
      visible: "Injeção visível",
      visibleHelp: "Edição escondida de request fica desligada. Pede poderes demais.",
      advanced: "Avançado",
      debug: "Log de debug",
      reset: "zerar",
      statPrompts: "prompts melhorados",
      statSaved: "tokens de saída poupados (est.)",
      statInstr: "tokens de instrução adicionados",
      statNet: "tokens líquidos poupados (est.)",
      statsHelp: "Só estimativas. Nenhum chat é salvo.",
      howTitle: "Como funciona",
      how1: "Você escreve normal.",
      how2: "Caveman Web adiciona uma instrução curta antes do envio, local.",
      how3: "O site de IA responde mais curto. Às vezes muito mais.",
      how4: "Configurações ficam no seu aparelho. Contagens são estimativas.",
      examplesTitle: "Antes / depois",
      exNormal: "Normal",
      exCaveman: "Caveman",
      footer: "Tudo local. Sem tracking. Sem salvar chat."
    },
    zh: {
      tagline: "让 AI 回答更短。",
      statusOn: "开",
      statusOff: "关",
      enable: "启用 Caveman",
      mode: "模式",
      tokens: "Token 估算",
      sites: "网站",
      send: "发送",
      preview: "发送前预览",
      hotkeys: "快捷键",
      placement: "指令位置",
      language: "界面",
      before: "放在 prompt 前",
      after: "放在 prompt 后",
      hotkeyHelp: "Ctrl+Shift+M 切换模式。Ctrl+Shift+E 开关扩展。",
      custom: "自定义提示",
      clearCustom: "清除自定义提示",
      display: "显示",
      badge: "显示标记",
      visible: "显示注入内容",
      visibleHelp: "不做隐藏请求改写。权限更大，也更难信任。",
      advanced: "高级",
      debug: "调试日志",
      reset: "重置",
      statPrompts: "已增强的 prompt",
      statSaved: "估算节省输出 token",
      statInstr: "指令增加的 token",
      statNet: "估算净节省 token",
      statsHelp: "仅为估算。不保存聊天内容。",
      howTitle: "如何工作",
      how1: "你正常输入。",
      how2: "Caveman Web 在发送前本地加一段简短指令。",
      how3: "AI 回答更短。有时短很多。",
      how4: "设置保留在本机。Token 数为估算。",
      examplesTitle: "前 / 后",
      exNormal: "普通",
      exCaveman: "Caveman",
      footer: "本地运行。无跟踪。不保存聊天。"
    },
    ja: {
      tagline: "AI の返事を短くする。",
      statusOn: "オン",
      statusOff: "オフ",
      enable: "Caveman を有効化",
      mode: "モード",
      tokens: "トークン概算",
      sites: "サイト",
      send: "送信",
      preview: "送信前に確認",
      hotkeys: "ショートカット",
      placement: "指示",
      language: "UI",
      before: "プロンプトの前",
      after: "プロンプトの後",
      hotkeyHelp: "Ctrl+Shift+M でモード切替。Ctrl+Shift+E でオンオフ。",
      custom: "カスタムプロンプト",
      clearCustom: "カスタムを消す",
      display: "表示",
      badge: "バッジを表示",
      visible: "注入を表示",
      visibleHelp: "隠しリクエスト編集は使いません。権限が広くなりすぎます。",
      advanced: "詳細",
      debug: "デバッグログ",
      reset: "リセット",
      statPrompts: "強化したプロンプト",
      statSaved: "節約推定 出力トークン",
      statInstr: "指示で増えたトークン",
      statNet: "純節約 推定トークン",
      statsHelp: "概算のみ。チャット文は保存しません。",
      howTitle: "仕組み",
      how1: "普通に入力する。",
      how2: "送信前に Caveman Web が短い指示をローカルで追加する。",
      how3: "AI の返事が短くなる。時にはかなり短く。",
      how4: "設定は端末内。トークン数は概算。",
      examplesTitle: "ビフォー / アフター",
      exNormal: "普通",
      exCaveman: "Caveman",
      footer: "ローカルのみ。追跡なし。チャット保存なし。"
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
    renderStatusPill();
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

  function renderStatusPill() {
    var pill = $("#status-pill");
    if (!pill) return;
    var dict = copy[state.uiLanguage] || copy.en;
    var on = !!state.enabled;
    pill.textContent = on ? dict.statusOn : dict.statusOff;
    pill.classList.toggle("on", on);
    pill.classList.toggle("off", !on);
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
    var s = state.stats || {};
    $("#stat-prompts").textContent = s.promptsEnhanced || 0;
    $("#stat-instr").textContent = s.instructionTokens || 0;
    $("#stat-saved").textContent = s.estSavedOutputTokens || 0;
    var net = s.estNetSavedTokens;
    if (typeof net !== "number") {
      net = Math.max(0, (s.estSavedOutputTokens || 0) - (s.instructionTokens || 0));
    }
    $("#stat-net").textContent = net;
  }

  function bind() {
    $("#enabled").addEventListener("change", function (e) {
      save({ enabled: e.target.checked }).then(renderStatusPill);
    });

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
        estSavedOutputTokens: 0,
        estNetSavedTokens: 0
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
