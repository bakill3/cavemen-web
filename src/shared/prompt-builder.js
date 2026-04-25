// Prompt builder. Pure functions. Returns the instruction text to prepend
// to the user's message and helpers for marker detection (to avoid
// double-injection on retry, edit-resend, or paste-from-prior-chat).
(function () {
  var PROMPTS = {
    lite:
      "Reply concise. Reduce filler. Keep accuracy. Keep code, commands, errors, names, URLs, and technical terms exact.",
    full:
      "CAVEMAN MODE. Use terse direct prose. No filler. No pleasantries. No long explanations unless needed. Keep full technical accuracy. Preserve code, commands, errors, paths, names, URLs, and technical terms exactly. Prefer bullets. Say only what matters.",
    ultra:
      "CAVEMAN ULTRA. Maximum compression. Short phrases. No filler. No intro/outro. No repetition. Keep all technical facts. Preserve code, commands, errors, paths, names, URLs, numbers, and API names exactly. Use compact bullets. Do not omit important warnings.",
    wenyan:
      "文言文 / ultra-terse mode. Respond extremely concisely. Preserve all code, commands, errors, paths, names, URLs, numbers, and technical terms exactly. No filler. Technical accuracy first."
  };

  // Marker regex: matches our own tag OR the unique opening of any of the
  // four mode instructions. Detects:
  //   1. Re-submit / edit-resend (sites repopulate the editor with our
  //      previously-injected text).
  //   2. Paste-from-prior-chat where the user copied a Caveman message.
  //   3. Retry after intercept where the marker is already present.
  //
  // Width-vs-precision: anchored on bracket tag + first sentence of each
  // mode. Short enough to never false-positive on normal user prose.
  var MARKER_RE = new RegExp(
    [
      "\\[Caveman (?:lite|full|ultra|wenyan)\\]",
      "CAVEMAN MODE\\.",
      "CAVEMAN ULTRA\\.",
      "Reply concise\\. Reduce filler\\.",
      "文言文 \\/ ultra-terse mode"
    ].join("|"),
    "i"
  );

  // Hard cap on text length we will scan / embed. Prevents pathological
  // inputs from causing regex backtracking or memory pressure. Real chat
  // inputs are far smaller than this.
  var MAX_INPUT_CHARS = 50000;

  function getInstruction(mode) {
    return PROMPTS[mode] || PROMPTS.full;
  }

  function build(mode, userText) {
    var instr = getInstruction(mode);
    var safe = userText == null ? "" : String(userText);
    if (safe.length > MAX_INPUT_CHARS) safe = safe.slice(0, MAX_INPUT_CHARS);
    return "[Caveman " + (mode || "full") + "] " + instr + "\n\n---\n" + safe;
  }

  function hasMarker(text) {
    if (!text) return false;
    var s = String(text);
    if (s.length > MAX_INPUT_CHARS) s = s.slice(0, MAX_INPUT_CHARS);
    return MARKER_RE.test(s);
  }

  globalThis.CavemanWeb = globalThis.CavemanWeb || {};
  globalThis.CavemanWeb.prompt = {
    PROMPTS: PROMPTS,
    build: build,
    getInstruction: getInstruction,
    hasMarker: hasMarker,
    MAX_INPUT_CHARS: MAX_INPUT_CHARS
  };
})();
