// Prompt builder and marker checks.
(function () {
  var PROMPTS = {
    lite:
      "Reply concise. Remove filler and pleasantries. Keep grammar natural. " +
      "Keep technical details, code, commands, paths, URLs, names, numbers, and errors exact.",
    full:
      "CAVEMAN MODE. Terse direct prose. No filler. No pleasantries. No hedging. " +
      "Fragments OK. Keep full technical accuracy. Preserve code, commands, paths, URLs, " +
      "names, numbers, errors, and technical terms exactly. Prefer compact bullets. " +
      "Say only what matters.",
    ultra:
      "CAVEMAN ULTRA. Maximum compression. Telegraphic style. No intro. No outro. " +
      "No repetition. Drop articles where safe. Keep all technical facts. Preserve code, " +
      "commands, paths, URLs, names, numbers, errors, and API names exactly. " +
      "Compact bullets. Important warnings stay.",
    wenyan:
      "文言文 mode. Extremely concise. Classical terse style where appropriate. " +
      "Preserve code, commands, paths, URLs, names, numbers, errors, and technical terms " +
      "exactly. Technical accuracy first. No filler."
  };

  var MARKER_RE = new RegExp(
    [
      "\\[Caveman (?:lite|full|ultra|wenyan)\\]",
      "CAVEMAN MODE\\.",
      "CAVEMAN ULTRA\\.",
      "Reply concise\\. Remove filler and pleasantries",
      "文言文 mode\\."
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
