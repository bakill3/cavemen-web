// Small local token estimate. It is not model-specific, but it handles
// words, punctuation, whitespace, and CJK text better than chars/4.
(function () {
  function estimate(text) {
    if (!text) return 0;
    var s = String(text).trim();
    if (!s) return 0;

    var cjk = (s.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
    var ascii = s.replace(/[\u3400-\u9fff\uf900-\ufaff]/g, " ");
    var words = ascii.match(/[A-Za-z0-9_]+(?:['.-][A-Za-z0-9_]+)*/g) || [];
    var punct = ascii.match(/[^\sA-Za-z0-9_]/g) || [];
    var longWordExtra = words.reduce(function (sum, word) {
      return sum + Math.max(0, Math.ceil(word.length / 8) - 1);
    }, 0);

    return Math.max(1, cjk + words.length + punct.length + longWordExtra);
  }

  globalThis.CavemanWeb = globalThis.CavemanWeb || {};
  globalThis.CavemanWeb.tokens = { estimate: estimate };
})();
