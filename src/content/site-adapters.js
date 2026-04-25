// Per-site adapters. Each exposes the same interface so content-script.js
// stays site-agnostic. Selectors prefer ARIA / role / id over hashed CSS
// classes. Adjust `findEditor` / `findSendButton` first when a site breaks.
//
// Privacy: these functions only locate DOM nodes. They never read messages
// from chat history, only the editor (input area) the user is typing into.
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

  // Helper: find a send-button candidate scoped to the editor's nearest
  // form / toolbar ancestor. Reduces false positives from page-wide
  // role="button" matches (notably on DeepSeek).
  function scopedSendButton(editor, selectors) {
    if (!editor) return null;
    var scope = editor.closest("form") ||
                editor.closest('[role="form"]') ||
                editor.closest("footer") ||
                editor.parentElement;
    for (var i = 0; i < selectors.length && scope; i++) {
      var node = scope.querySelector(selectors[i]);
      if (node) return node;
      // Walk up two levels max — editor toolbars are usually 1-3 ancestors deep.
      var up1 = scope.parentElement;
      if (up1) {
        node = up1.querySelector(selectors[i]);
        if (node) return node;
      }
    }
    // Fallback to document-wide scan for the first selector only, so adapters
    // don't silently break on unusual layouts.
    return document.querySelector(selectors[0]) || null;
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

  // -------- DeepSeek --------
  // DeepSeek historically uses a div[role="button"] for send. Scope to the
  // editor's container so we never click an unrelated button on the page.
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

  // -------- Generic fallback (NOT used in production via manifest matches) --------
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
    var ordered = [chatgpt, claude, gemini, deepseek];
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
    fallback: fallback,
    pickAdapter: pickAdapter
  };
})();
