(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav__toggle");
  var overlay = document.querySelector(".nav-overlay");

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    if (!header || !toggle || !overlay) return;
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  function openMenu() {
    if (!header || !toggle || !overlay) return;
    header.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  if (toggle && overlay) {
    toggle.addEventListener("click", function () {
      if (header.classList.contains("menu-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /** FAQ accordion — one open at a time */
  var faqList = document.getElementById("faq-list");
  if (faqList) {
    faqList.querySelectorAll(".faq-item__q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        var panelId = btn.getAttribute("aria-controls");
        var panel = panelId ? document.getElementById(panelId) : null;

        faqList.querySelectorAll(".faq-item__q").forEach(function (other) {
          if (other === btn) return;
          other.setAttribute("aria-expanded", "false");
          var oid = other.getAttribute("aria-controls");
          var op = oid ? document.getElementById(oid) : null;
          if (op) {
            op.hidden = true;
          }
        });

        if (panel) {
          if (expanded) {
            btn.setAttribute("aria-expanded", "false");
            panel.hidden = true;
          } else {
            btn.setAttribute("aria-expanded", "true");
            panel.hidden = false;
          }
        }
      });
    });
  }

  /** IntersectionObserver fade-in-up */
  var fadeEls = document.querySelectorAll(".io-fade");
  if (fadeEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    fadeEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    fadeEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
