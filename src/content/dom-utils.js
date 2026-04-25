// DOM helpers shared by all site adapters.
// We deliberately use native value setters + dispatched input events so
// React/Vue/Svelte controlled components see the change.
(function () {
  function dispatchInput(el) {
    el.dispatchEvent(
      new InputEvent("input", { bubbles: true, cancelable: true, inputType: "insertText" })
    );
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setTextareaValue(el, value) {
    var proto = HTMLTextAreaElement.prototype;
    var desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && desc.set) {
      desc.set.call(el, value);
    } else {
      el.value = value;
    }
    dispatchInput(el);
  }

  function setContentEditableText(el, value) {
    el.focus();
    var sel = document.getSelection();
    if (sel) {
      sel.removeAllRanges();
      var range = document.createRange();
      range.selectNodeContents(el);
      sel.addRange(range);
    }
    // execCommand is deprecated but still the most reliable way to drive
    // ProseMirror / Slate / Quill editors used by ChatGPT, Claude, Gemini.
    var ok = false;
    try {
      ok = document.execCommand("insertText", false, value);
    } catch (_) {
      ok = false;
    }
    if (!ok) {
      // Last-resort fallback. Loses formatting but preserves text.
      el.textContent = value;
      dispatchInput(el);
    }
  }

  function getContentEditableText(el) {
    return el.innerText || el.textContent || "";
  }

  function clearContentEditable(el) {
    var sel = document.getSelection();
    if (sel) {
      sel.removeAllRanges();
      var range = document.createRange();
      range.selectNodeContents(el);
      sel.addRange(range);
    }
    try {
      document.execCommand("delete", false);
    } catch (_) {
      el.textContent = "";
    }
  }

  function isVisible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  globalThis.CavemanWeb = globalThis.CavemanWeb || {};
  globalThis.CavemanWeb.dom = {
    dispatchInput: dispatchInput,
    setTextareaValue: setTextareaValue,
    setContentEditableText: setContentEditableText,
    getContentEditableText: getContentEditableText,
    clearContentEditable: clearContentEditable,
    isVisible: isVisible
  };
})();
