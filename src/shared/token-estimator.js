// Naive token estimator. Real BPE tokenization differs per model, but
// chars/4 is a widely cited rule of thumb for English. Stats based on this
// are clearly labeled as estimates in the popup UI.
(function () {
  function estimate(text) {
    if (!text) return 0;
    return Math.ceil(String(text).length / 4);
  }

  globalThis.CavemanWeb = globalThis.CavemanWeb || {};
  globalThis.CavemanWeb.tokens = { estimate: estimate };
})();
