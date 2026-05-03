(function () {
  "use strict";

  var HEADER_SCROLLED_CLASS = "is-scrolled";
  var REVEAL_VISIBLE_CLASS = "is-visible";
  var NAV_OPEN_CLASS = "nav-open";
  var FAQ_OPEN_CLASS = "is-open";

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  /* Sticky header shadow on scroll */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function update() {
      if (window.scrollY > 12) {
        header.classList.add(HEADER_SCROLLED_CLASS);
      } else {
        header.classList.remove(HEADER_SCROLLED_CLASS);
      }
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* Fade-in-up with IntersectionObserver */
  function initReveal() {
    var els = document.querySelectorAll(".js-reveal");
    if (!els.length) return;

    var stagger = function (el) {
      var delay = el.getAttribute("data-delay");
      if (delay) {
        el.style.transitionDelay = delay + "ms";
      }
    };

    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        stagger(el);
        el.classList.add(REVEAL_VISIBLE_CLASS);
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          stagger(entry.target);
          entry.target.classList.add(REVEAL_VISIBLE_CLASS);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* Mobile menu */
  function initMobileNav() {
    var toggle = document.querySelector(".menu-toggle");
    var overlay = document.querySelector(".mobile-overlay");
    if (!toggle || !overlay) return;

    var links = overlay.querySelectorAll("a");

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      overlay.classList.toggle("is-open", open);
      overlay.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle(NAV_OPEN_CLASS, open);
    }

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!expanded);
    });

    links.forEach(function (a) {
      a.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* Smooth scroll for same-page anchors (respect fixed header) */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* Landing page: highlight nav by section */
  function initLandingNavSpy() {
    var links = document.querySelectorAll(".nav__link[data-section]");
    if (!links.length) return;

    var sections = [];
    links.forEach(function (link) {
      var sel = link.getAttribute("data-section");
      if (!sel) return;
      var sec = document.querySelector(sel);
      if (sec) sections.push({ link: link, el: sec });
    });

    if (!sections.length || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var target = entry.target;
          sections.forEach(function (item) {
            if (item.el === target) {
              sections.forEach(function (s) {
                s.link.classList.remove("is-active");
              });
              item.link.classList.add("is-active");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach(function (item) {
      io.observe(item.el);
    });
  }

  /* FAQ accordion */
  function initFaq() {
    var items = document.querySelectorAll(".faq-item");
    items.forEach(function (item) {
      var trigger = item.querySelector(".faq-item__trigger");
      var panel = item.querySelector(".faq-item__panel");
      if (!trigger || !panel) return;

      trigger.addEventListener("click", function () {
        var open = item.classList.contains(FAQ_OPEN_CLASS);
        items.forEach(function (other) {
          other.classList.remove(FAQ_OPEN_CLASS);
          var t = other.querySelector(".faq-item__trigger");
          if (t) t.setAttribute("aria-expanded", "false");
        });
        if (!open) {
          item.classList.add(FAQ_OPEN_CLASS);
          trigger.setAttribute("aria-expanded", "true");
        }
      });

      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", panel.id || "");
      if (!panel.id) {
        panel.id =
          "faq-panel-" + Math.random().toString(36).slice(2, 9);
        trigger.setAttribute("aria-controls", panel.id);
      }
    });
  }

  /* Docs: sidebar active state + mobile select */
  function initDocsSidebar() {
    var sidebarLinks = document.querySelectorAll(".docs-sidebar a[href^='#']");
    var headings = document.querySelectorAll(".docs-main h2[id], .docs-main h3[id]");
    var select = document.querySelector(".docs-mobile-toc select");

    function activateById(id) {
      if (!id) return;
      sidebarLinks.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
      });
      if (select) {
        var opt = "#" + id;
        if (Array.prototype.some.call(select.options, function (o) { return o.value === opt; })) {
          select.value = opt;
        }
      }
    }

    if (select) {
      select.addEventListener("change", function () {
        var v = select.value;
        if (v) {
          var target = document.querySelector(v);
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    if (!headings.length) return;

    if (!("IntersectionObserver" in window)) {
      activateById(headings[0].id);
      return;
    }

    var headingList = Array.prototype.slice.call(headings);

    var io = new IntersectionObserver(
      function (entries) {
        var intersecting = entries
          .filter(function (e) {
            return e.isIntersecting;
          })
          .map(function (e) {
            return e.target;
          });
        if (!intersecting.length) return;
        intersecting.sort(function (a, b) {
          return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        });
        activateById(intersecting[0].id);
      },
      { rootMargin: "-12% 0px -52% 0px", threshold: 0 }
    );

    headingList.forEach(function (h) {
      io.observe(h);
    });
  }

  onReady(function () {
    initHeaderScroll();
    initReveal();
    initMobileNav();
    initSmoothAnchors();
    initLandingNavSpy();
    initFaq();
    initDocsSidebar();
  });
})();
