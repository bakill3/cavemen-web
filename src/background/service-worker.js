// Service worker. Kept minimal: seeds defaults on install/update.
// Uses importScripts (classic SW) so we can share defaults.js verbatim
// with content scripts and popup. Avoid module mode for compat simplicity.
self.importScripts("/src/shared/defaults.js");

self.addEventListener("install", function () {
  // Activate immediately so the popup can rely on defaults right after install.
  self.skipWaiting && self.skipWaiting();
});

chrome.runtime.onInstalled.addListener(async function () {
  try {
    var stored = await chrome.storage.local.get(null);
    var defaults = self.CAVEMAN_DEFAULTS;
    var merged = Object.assign({}, defaults, stored);
    merged.sites = Object.assign({}, defaults.sites, stored.sites || {});
    merged.stats = Object.assign({}, defaults.stats, stored.stats || {});
    await chrome.storage.local.set(merged);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[Caveman Web] onInstalled defaults failed:", err);
  }
});
