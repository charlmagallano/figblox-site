(function () {
  "use strict";

  /** Avoid restored scroll position (often lands on #pricing after a prior visit; mobile Safari is aggressive). */
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

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

  /** IntersectionObserver: fade in when entering view, fade out (reverse) when leaving */
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
          } else {
            entry.target.classList.remove("is-visible");
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

  /** Same-page hash links: scroll target (center by default; pricing uses start on desktop) */
  var prefersReducedMotionScroll =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function isMobileNavBreakpoint() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 900px)").matches
    );
  }

  /** Pin element top edge just under sticky header (scrollIntoView is inconsistent on iOS with scroll-margin). */
  function scrollBlockStartBelowHeader(el, smooth) {
    if (!el || typeof el.getBoundingClientRect !== "function") return;
    var header = document.querySelector(".site-header");
    var pad = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    var gap = 6;
    var y = el.getBoundingClientRect().top + window.scrollY - pad - gap;
    window.scrollTo({
      top: Math.max(0, y),
      behavior: smooth && !prefersReducedMotionScroll ? "smooth" : "auto",
    });
  }

  function normalizePathname(pathname) {
    return pathname.replace(/\/?index\.html$/i, "/").replace(/\/+/g, "/") || "/";
  }

  function isSamePageUrl(url) {
    if (url.origin !== window.location.origin) return false;
    if (url.search !== window.location.search) return false;
    return normalizePathname(url.pathname) === normalizePathname(window.location.pathname);
  }

  function scrollTargetForHash(el, smooth) {
    if (!el) return;
    if (isMobileNavBreakpoint()) {
      scrollBlockStartBelowHeader(el, smooth);
      return;
    }
    if (typeof el.scrollIntoView !== "function") return;
    var behavior = "auto";
    if (smooth && !prefersReducedMotionScroll) {
      behavior = "smooth";
    }
    var block = el.id === "pricing" ? "start" : "center";
    el.scrollIntoView({ block: block, inline: "nearest", behavior: behavior });
  }

  function scrollToIdFromHash(smooth) {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    var id = decodeURIComponent(hash.slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    scrollTargetForHash(el, smooth);
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
    scrollTargetForHash(el, true);
  });

  function runHashAlignAfterPaint(smooth) {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        scrollToIdFromHash(smooth);
      });
    });
  }

  function hasMeaningfulHash() {
    return window.location.hash && window.location.hash.length > 1;
  }

  function scrollTopUnlessDeepLink() {
    if (hasMeaningfulHash()) return;
    window.scrollTo(0, 0);
  }

  if (hasMeaningfulHash()) {
    runHashAlignAfterPaint(false);
  } else {
    scrollTopUnlessDeepLink();
  }

  window.addEventListener("hashchange", function () {
    scrollToIdFromHash(!prefersReducedMotionScroll);
  });

  window.addEventListener("load", function () {
    if (hasMeaningfulHash()) {
      scrollToIdFromHash(false);
    } else {
      scrollTopUnlessDeepLink();
    }
  });

  window.addEventListener("pageshow", function (ev) {
    if (!ev.persisted) return;
    scrollTopUnlessDeepLink();
  });

  /** Hero video: muted autoplay + loop, no UI; resume if paused while page is visible */
  var heroVideo = document.querySelector(".hero-video__media");
  if (heroVideo) {
    var heroReduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (heroReduceMotion) {
      var heroWrap = heroVideo.closest(".hero-video-wrap");
      if (heroWrap) {
        heroWrap.hidden = true;
      }
      heroVideo.removeAttribute("autoplay");
      try {
        heroVideo.pause();
      } catch (err) {}
    } else {
      heroVideo.muted = true;

      function heroTryPlay() {
        var playPromise = heroVideo.play();
        if (playPromise !== undefined && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }

      heroTryPlay();
      heroVideo.addEventListener(
        "loadeddata",
        function () {
          heroTryPlay();
        },
        { once: true }
      );

      heroVideo.addEventListener("pause", function () {
        if (document.visibilityState !== "visible") return;
        window.requestAnimationFrame(heroTryPlay);
      });

      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") {
          heroTryPlay();
        }
      });
    }
  }

})();
