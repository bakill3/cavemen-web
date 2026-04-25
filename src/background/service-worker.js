// Seeds defaults on install/update.
self.importScripts("/src/shared/defaults.js");

self.addEventListener("install", function () {
  self.skipWaiting && self.skipWaiting();
});

chrome.runtime.onInstalled.addListener(async function () {
  try {
    var stored = await chrome.storage.local.get(null);
    var defaults = self.CAVEMAN_DEFAULTS;
    var merged = Object.assign({}, defaults, stored);
    merged.sites = Object.assign({}, defaults.sites, stored.sites || {});
    merged.customPrompts = Object.assign({}, defaults.customPrompts, stored.customPrompts || {});
    merged.stats = Object.assign({}, defaults.stats, stored.stats || {});
    await chrome.storage.local.set(merged);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[Caveman Web] onInstalled defaults failed:", err);
  }
});
