// Thin Promise wrapper around browser.storage.local.
// Privacy: only this module touches storage. We never store chat content;
// see content-script.js for what flows in.
(function () {
  var api =
    typeof globalThis.browser !== "undefined" && globalThis.browser.storage
      ? globalThis.browser
      : globalThis.chrome;

  function get(keys) {
    return new Promise(function (resolve) {
      api.storage.local.get(keys, function (items) {
        resolve(items || {});
      });
    });
  }

  function set(obj) {
    return new Promise(function (resolve) {
      api.storage.local.set(obj, function () {
        resolve();
      });
    });
  }

  function getAll() {
    return get(null);
  }

  function onChanged(cb) {
    api.storage.onChanged.addListener(function (changes, area) {
      if (area === "local") cb(changes);
    });
  }

  globalThis.CavemanWeb = globalThis.CavemanWeb || {};
  globalThis.CavemanWeb.storage = {
    get: get,
    set: set,
    getAll: getAll,
    onChanged: onChanged
  };
})();
