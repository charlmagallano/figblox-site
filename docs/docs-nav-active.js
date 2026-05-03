(function () {
  var page = document.body.getAttribute("data-doc-page");
  if (!page) return;
  var nav = document.getElementById("docs-nav");
  if (!nav) return;
  var file = page === "index" ? "index.html" : page + ".html";
  nav.querySelectorAll("a.docs-nav__link").forEach(function (a) {
    var href = (a.getAttribute("href") || "").split("/").pop();
    if (href === file) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    }
  });
})();
