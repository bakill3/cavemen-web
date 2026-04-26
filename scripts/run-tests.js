// Minimal test runner. Loads the shared modules into a stub global and runs
// a few assertions. Heavy frameworks would be overkill for this surface.

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function loadShared(ctx, file) {
  const code = fs.readFileSync(path.join(root, "src", "shared", file), "utf8");
  vm.runInContext(code, ctx);
}

function makeContext() {
  const sandbox = { globalThis: {}, console };
  sandbox.globalThis.globalThis = sandbox.globalThis;
  return vm.createContext(sandbox);
}

const failures = [];
function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

// --- prompt-builder ---
{
  const ctx = makeContext();
  loadShared(ctx, "token-estimator.js");
  loadShared(ctx, "prompt-builder.js");
  const ns = ctx.globalThis.CavemanWeb;
  const p = ns.prompt;

  assert(typeof p.build === "function", "prompt.build is a function");

  const built = p.build("full", "what is rust ownership", { placement: "prepend" });
  assert(/^\[Caveman full\]/.test(built), "prepend marker present");
  assert(/CAVEMAN MODE\./.test(built), "full instruction present");
  assert(/what is rust ownership$/.test(built), "user text preserved");

  const appended = p.build("ultra", "hi", { placement: "append" });
  assert(/^hi/.test(appended), "append keeps original first");
  assert(/\[Caveman ultra\]/.test(appended), "append marker present");
  assert(/CAVEMAN ULTRA\./.test(appended), "ultra instruction present");

  assert(p.hasMarker("[Caveman full] anything") === true, "marker tag detected");
  assert(p.hasMarker("CAVEMAN MODE. blah") === true, "full opener detected");
  assert(p.hasMarker("文言文 mode. test") === true, "wenyan opener detected");
  assert(p.hasMarker("normal message") === false, "no false positives");

  const customInstr = p.getInstruction("full", "  custom thing  ");
  assert(customInstr === "custom thing", "custom prompt overrides mode");

  const fallbackInstr = p.getInstruction("nonsense");
  assert(fallbackInstr === p.PROMPTS.full, "unknown mode falls back to full");

  // Length cap.
  const huge = "x".repeat(p.MAX_INPUT_CHARS + 500);
  const capped = p.build("lite", huge, {});
  assert(capped.length < huge.length + 5000, "input is capped");
}

// --- token-estimator ---
{
  const ctx = makeContext();
  loadShared(ctx, "token-estimator.js");
  const t = ctx.globalThis.CavemanWeb.tokens;

  assert(t.estimate("") === 0, "empty -> 0");
  assert(t.estimate("hello world") >= 2, "two words -> at least 2");
  assert(t.estimate("你好世界") >= 4, "CJK counted per character");

  assert(t.savingPct("lite")   === 0.20, "lite saving 0.20");
  assert(t.savingPct("full")   === 0.40, "full saving 0.40");
  assert(t.savingPct("ultra")  === 0.60, "ultra saving 0.60");
  assert(t.savingPct("wenyan") === 0.65, "wenyan saving 0.65");
  assert(t.savingPct("bogus")  === 0.40, "unknown mode falls back to full saving");

  assert(t.fromChars(0)  === 0, "fromChars 0");
  assert(t.fromChars(40) === 10, "fromChars ~chars/4");
}

if (failures.length) {
  console.error("FAILED:");
  for (const f of failures) console.error(" - " + f);
  process.exit(1);
}

console.log("ok " + "prompt-builder + token-estimator");
