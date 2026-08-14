/**
 * main.js
 * ---------------------------------------------------------------
 * Comportements d'interface généraux : navbar au scroll, menu mobile
 * plein écran, animations de révélation au scroll, suivi du lien actif.
 * Respecte prefers-reduced-motion.
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navbar au scroll ---------- */
  const navbar = document.getElementById("navbar");
  function onScroll() {
    navbar.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile plein écran ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  function closeMobileMenu() {
    document.documentElement.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Ouvrir le menu");
  }

  navToggle.addEventListener("click", () => {
    const isOpen = document.documentElement.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  /* ---------- Révélation au scroll ---------- */
  function observeReveals(root = document) {
    const targets = root.querySelectorAll(".reveal:not(.is-observed), .reveal-scale:not(.is-observed)");
    if (!targets.length) return;

    if (prefersReducedMotion) {
      targets.forEach((t) => {
        t.classList.add("is-visible", "is-observed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((t) => {
      t.classList.add("is-observed");
      observer.observe(t);
    });
  }

  observeReveals();
  // Le contenu dynamique (compétences, services, projets…) arrive après
  // le chargement JSON : on ré-observe une fois prêt.
  document.addEventListener("content:ready", () => observeReveals());
  document.addEventListener("projects:rendered", () => observeReveals());

  /* ---------- Lien de navigation actif ---------- */
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = `#${entry.target.id}`;
            navLinks.forEach((link) => {
              link.classList.toggle("active", link.getAttribute("href") === id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }
})();
