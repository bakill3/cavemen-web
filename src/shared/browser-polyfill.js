// Tiny browser/chrome compatibility shim.
// Privacy: this file does no I/O. It only aliases the extension API namespace
// so the rest of the code can call `browser.*` on Chrome (which exposes `chrome.*`)
// and on Firefox (which already exposes `browser.*`).
(function () {
  if (typeof globalThis.browser === "undefined" && typeof globalThis.chrome !== "undefined") {
    globalThis.browser = globalThis.chrome;
  }
})();
