// Per-site editor and send-button adapters.
(function () {
  var dom = globalThis.CavemanWeb.dom;

  function setEditorText(el, text) {
    if (!el) return;
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      dom.setTextareaValue(el, text);
    } else {
      dom.setContentEditableText(el, text);
    }
  }

  function getEditorText(el) {
    if (!el) return "";
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") return el.value || "";
    return dom.getContentEditableText(el);
  }

  function clickIfEnabled(btn) {
    if (!btn) return false;
    if (btn.disabled) return false;
    if (btn.getAttribute && btn.getAttribute("aria-disabled") === "true") return false;
    btn.click();
    return true;
  }

  function scopedSendButton(editor, selectors) {
    if (!editor) return null;
    var scope = editor.closest("form") ||
                editor.closest('[role="form"]') ||
                editor.closest("footer") ||
                editor.parentElement;
    for (var i = 0; i < selectors.length && scope; i++) {
      var node = scope.querySelector(selectors[i]);
      if (node) return node;
      var up1 = scope.parentElement;
      if (up1) {
        node = up1.querySelector(selectors[i]);
        if (node) return node;
      }
    }
    return document.querySelector(selectors[0]) || null;
  }

  function genericEditor() {
    var selectors = [
      'textarea',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      '[role="textbox"]'
    ];
    for (var i = 0; i < selectors.length; i++) {
      var nodes = document.querySelectorAll(selectors[i]);
      for (var j = 0; j < nodes.length; j++) {
        if (dom.isVisible(nodes[j])) return nodes[j];
      }
    }
    return null;
  }

  function genericSend(editor) {
    return scopedSendButton(editor, [
      'button[aria-label*="Send" i]',
      'button[data-testid*="send" i]',
      'button[type="submit"]',
      '[role="button"][aria-label*="Send" i]'
    ]);
  }

  // -------- ChatGPT --------
  var chatgpt = {
    key: "chatgpt",
    matches: function () {
      return /(^|\.)chatgpt\.com$/.test(location.hostname) ||
             /(^|\.)chat\.openai\.com$/.test(location.hostname);
    },
    findEditor: function () {
      return (
        document.querySelector('#prompt-textarea') ||
        document.querySelector('div[contenteditable="true"][role="textbox"]') ||
        document.querySelector('textarea[data-id]') ||
        document.querySelector('main textarea')
      );
    },
    findSendButton: function () {
      var editor = this.findEditor();
      return scopedSendButton(editor, [
        '[data-testid="send-button"]',
        '[data-testid="fruitjuice-send-button"]',
        'button[aria-label*="Send" i]'
      ]);
    },
    setEditorText: setEditorText,
    getEditorText: getEditorText,
    submit: clickIfEnabled
  };

  // -------- Claude --------
  var claude = {
    key: "claude",
    matches: function () {
      return /(^|\.)claude\.ai$/.test(location.hostname);
    },
    findEditor: function () {
      return (
        document.querySelector('div[contenteditable="true"][role="textbox"]') ||
        document.querySelector('div.ProseMirror[contenteditable="true"]') ||
        document.querySelector('[contenteditable="true"]')
      );
    },
    findSendButton: function () {
      var editor = this.findEditor();
      return scopedSendButton(editor, [
        'button[aria-label*="Send" i]',
        'button[aria-label*="message" i]',
        'button[type="submit"]'
      ]);
    },
    setEditorText: setEditorText,
    getEditorText: getEditorText,
    submit: clickIfEnabled
  };

  // -------- Gemini --------
  var gemini = {
    key: "gemini",
    matches: function () {
      return /(^|\.)gemini\.google\.com$/.test(location.hostname);
    },
    findEditor: function () {
      return (
        document.querySelector('rich-textarea div[contenteditable="true"]') ||
        document.querySelector('div.ql-editor[contenteditable="true"]') ||
        document.querySelector('div[contenteditable="true"][role="textbox"]')
      );
    },
    findSendButton: function () {
      var editor = this.findEditor();
      return scopedSendButton(editor, [
        'button[aria-label*="Send message" i]',
        'button[aria-label*="Send" i]',
        'button.send-button'
      ]);
    },
    setEditorText: setEditorText,
    getEditorText: getEditorText,
    submit: clickIfEnabled
  };

  var deepseek = {
    key: "deepseek",
    matches: function () {
      return /(^|\.)chat\.deepseek\.com$/.test(location.hostname);
    },
    findEditor: function () {
      return (
        document.querySelector('textarea#chat-input') ||
        document.querySelector('textarea[placeholder]') ||
        document.querySelector('textarea')
      );
    },
    findSendButton: function () {
      var editor = this.findEditor();
      if (!editor) return null;
      // Walk up to the input row container.
      var row = editor.closest('[class*="chat"]') ||
                editor.closest('form') ||
                editor.parentElement && editor.parentElement.parentElement;
      var candidates = [
        'button[aria-label*="Send" i]',
        'button[type="submit"]',
        'div[role="button"][aria-disabled="false"]',
        'div[role="button"]'
      ];
      for (var i = 0; i < candidates.length; i++) {
        var btn = row && row.querySelector(candidates[i]);
        if (btn) return btn;
      }
      return null;
    },
    setEditorText: setEditorText,
    getEditorText: getEditorText,
    submit: clickIfEnabled
  };

  var mistral = {
    key: "mistral",
    matches: function () {
      return /(^|\.)chat\.mistral\.ai$/.test(location.hostname) ||
             /(^|\.)lechat\.mistral\.ai$/.test(location.hostname);
    },
    findEditor: genericEditor,
    findSendButton: function () {
      return genericSend(this.findEditor());
    },
    setEditorText: setEditorText,
    getEditorText: getEditorText,
    submit: clickIfEnabled
  };

  var qwen = {
    key: "qwen",
    matches: function () {
      return /(^|\.)chat\.qwen\.ai$/.test(location.hostname);
    },
    findEditor: genericEditor,
    findSendButton: function () {
      return genericSend(this.findEditor());
    },
    setEditorText: setEditorText,
    getEditorText: getEditorText,
    submit: clickIfEnabled
  };

  var perplexity = {
    key: "perplexity",
    matches: function () {
      return /(^|\.)perplexity\.ai$/.test(location.hostname);
    },
    findEditor: genericEditor,
    findSendButton: function () {
      return genericSend(this.findEditor());
    },
    setEditorText: setEditorText,
    getEditorText: getEditorText,
    submit: clickIfEnabled
  };

  var poe = {
    key: "poe",
    matches: function () {
      return /(^|\.)poe\.com$/.test(location.hostname);
    },
    findEditor: genericEditor,
    findSendButton: function () {
      return genericSend(this.findEditor());
    },
    setEditorText: setEditorText,
    getEditorText: getEditorText,
    submit: clickIfEnabled
  };

  var fallback = {
    key: "generic",
    matches: function () { return true; },
    findEditor: function () {
      return (
        document.querySelector('textarea') ||
        document.querySelector('[contenteditable="true"]') ||
        document.querySelector('[role="textbox"]')
      );
    },
    findSendButton: function () {
      return (
        document.querySelector('button[type="submit"]') ||
        document.querySelector('button[aria-label*="Send" i]')
      );
    },
    setEditorText: setEditorText,
    getEditorText: getEditorText,
    submit: clickIfEnabled
  };

  function pickAdapter() {
    var ordered = [chatgpt, claude, gemini, deepseek, mistral, qwen, perplexity, poe];
    for (var i = 0; i < ordered.length; i++) {
      if (ordered[i].matches()) return ordered[i];
    }
    return fallback;
  }

  globalThis.CavemanWeb = globalThis.CavemanWeb || {};
  globalThis.CavemanWeb.adapters = {
    chatgpt: chatgpt,
    claude: claude,
    gemini: gemini,
    deepseek: deepseek,
    mistral: mistral,
    qwen: qwen,
    perplexity: perplexity,
    poe: poe,
    fallback: fallback,
    pickAdapter: pickAdapter
  };
})();
