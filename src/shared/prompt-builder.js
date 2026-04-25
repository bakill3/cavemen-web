// Prompt builder and marker checks.
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

  var MAX_INPUT_CHARS = 50000;

  function cleanCustomPrompt(text) {
    return String(text || "").trim();
  }

  function getInstruction(mode, customPrompt) {
    var custom = cleanCustomPrompt(customPrompt);
    return custom || PROMPTS[mode] || PROMPTS.full;
  }

  function build(mode, userText, opts) {
    opts = opts || {};
    var instr = getInstruction(mode, opts.customPrompt);
    var safe = userText == null ? "" : String(userText);
    if (safe.length > MAX_INPUT_CHARS) safe = safe.slice(0, MAX_INPUT_CHARS);
    var marker = "[Caveman " + (mode || "full") + "]";
    if (opts.placement === "append") {
      return safe + "\n\n---\n" + marker + " " + instr;
    }
    return marker + " " + instr + "\n\n---\n" + safe;
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
    cleanCustomPrompt: cleanCustomPrompt,
    hasMarker: hasMarker,
    MAX_INPUT_CHARS: MAX_INPUT_CHARS
  };
})();
