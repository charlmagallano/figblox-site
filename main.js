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

  /** FAQ accordion: one open at a time */
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

  /** IntersectionObserver fade-in */
  var fadeEls = document.querySelectorAll(".io-fade");
  var prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    fadeEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else if (fadeEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.02 }
    );
    fadeEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    fadeEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /** Same-page hash links: scroll target to vertical center (stable layout, respects reduced motion) */
  var prefersReducedMotionScroll =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function normalizePathname(pathname) {
    return pathname.replace(/\/?index\.html$/i, "/").replace(/\/+/g, "/") || "/";
  }

  function isSamePageUrl(url) {
    if (url.origin !== window.location.origin) return false;
    if (url.search !== window.location.search) return false;
    return normalizePathname(url.pathname) === normalizePathname(window.location.pathname);
  }

  function scrollTargetToCenter(el, smooth) {
    if (!el || typeof el.scrollIntoView !== "function") return;
    var behavior = "auto";
    if (smooth && !prefersReducedMotionScroll) {
      behavior = "smooth";
    }
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: behavior });
  }

  function scrollToIdFromHash(smooth) {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    var id = decodeURIComponent(hash.slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    scrollTargetToCenter(el, smooth);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var raw = a.getAttribute("href");
    if (!raw || raw === "#") return;

    var resolved;
    try {
      resolved = new URL(raw, window.location.href);
    } catch (err) {
      return;
    }

    if (!isSamePageUrl(resolved)) return;
    if (!resolved.hash || resolved.hash.length < 2) return;

    var id = decodeURIComponent(resolved.hash.slice(1));
    var el = document.getElementById(id);
    if (!el) return;

    e.preventDefault();
    var next = resolved.pathname + resolved.search + resolved.hash;
    if (window.history && window.history.pushState) {
      window.history.pushState(null, "", next);
    } else {
      window.location.hash = resolved.hash;
    }
    scrollTargetToCenter(el, true);
  });

  function runHashAlignAfterPaint(smooth) {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        scrollToIdFromHash(smooth);
      });
    });
  }

  if (window.location.hash && window.location.hash.length > 1) {
    runHashAlignAfterPaint(false);
  }

  window.addEventListener("hashchange", function () {
    scrollToIdFromHash(!prefersReducedMotionScroll);
  });

  window.addEventListener("load", function () {
    if (window.location.hash && window.location.hash.length > 1) {
      scrollToIdFromHash(false);
    }
  });

})();
