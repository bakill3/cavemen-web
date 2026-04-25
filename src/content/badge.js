// Floating badge. Click cycles modes through the content script.
(function () {
  var el = null;

  function ensure() {
    if (el && document.documentElement.contains(el)) return el;
    el = document.createElement("div");
    el.id = "caveman-web-badge";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.title = "Caveman Web - click to cycle mode";
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent("caveman:cycle-mode"));
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("caveman:cycle-mode"));
      }
    });
    document.documentElement.appendChild(el);
    return el;
  }

  function show(mode) {
    var n = ensure();
    n.textContent = "CAVEMAN " + String(mode || "full").toUpperCase();
    n.style.display = "flex";
  }

  function hide() {
    if (el) el.style.display = "none";
  }

  globalThis.CavemanWeb = globalThis.CavemanWeb || {};
  globalThis.CavemanWeb.badge = { show: show, hide: hide };
})();
