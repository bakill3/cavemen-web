// Local token estimate. Not model-specific. Handles words, punctuation,
// and CJK better than chars/4. Also exposes per-mode output saving rates
// used by the popup stats card.
(function () {
  var SAVING_PCT = {
    lite:   0.20,
    full:   0.40,
    ultra:  0.60,
    wenyan: 0.65
  };

  var CJK_RE = /[㐀-鿿豈-﫿]/g;

  function estimate(text) {
    if (!text) return 0;
    var s = String(text).trim();
    if (!s) return 0;

    var cjk = (s.match(CJK_RE) || []).length;
    var ascii = s.replace(CJK_RE, " ");
    var words = ascii.match(/[A-Za-z0-9_]+(?:['.-][A-Za-z0-9_]+)*/g) || [];
    var punct = ascii.match(/[^\sA-Za-z0-9_]/g) || [];
    var longWordExtra = words.reduce(function (sum, word) {
      return sum + Math.max(0, Math.ceil(word.length / 8) - 1);
    }, 0);

    return Math.max(1, cjk + words.length + punct.length + longWordExtra);
  }

  function savingPct(mode) {
    var v = SAVING_PCT[mode];
    return typeof v === "number" ? v : SAVING_PCT.full;
  }

  // Rough chars-per-token heuristic. ~4 chars = 1 token for English text.
  function fromChars(charCount) {
    return Math.max(0, Math.round((charCount || 0) / 4));
  }

  globalThis.CavemanWeb = globalThis.CavemanWeb || {};
  globalThis.CavemanWeb.tokens = {
    estimate: estimate,
    savingPct: savingPct,
    fromChars: fromChars,
    SAVING_PCT: SAVING_PCT
  };
})();
