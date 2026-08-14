/**
 * portfolio.js
 * ---------------------------------------------------------------
 * Filtrage animé de la galerie de projets + modal de présentation
 * immersive au clic. Fonctionne avec les données injectées par
 * content.js (voir window.PORTFOLIO_PROJECTS).
 */

(function () {
  "use strict";

  const modal = document.getElementById("project-modal");
  const modalClose = document.getElementById("modal-close");
  const modalCoverImg = document.getElementById("modal-cover-img");
  const modalCoverFrame = document.getElementById("modal-cover-frame");
  const modalGallery = document.getElementById("modal-gallery");
  const modalCategory = document.getElementById("modal-category");
  const modalTitle = document.getElementById("modal-title");
  const modalDate = document.getElementById("modal-date");
  const modalRole = document.getElementById("modal-role");
  const modalDesc = document.getElementById("modal-desc");
  const modalLink = document.getElementById("modal-link");

  let lastFocusedEl = null;

  function loadImg(imgEl, src, alt) {
    imgEl.classList.remove("is-loaded");
    if (!src) return;
    imgEl.alt = alt || "";
    imgEl.onload = () => imgEl.classList.add("is-loaded");
    imgEl.onerror = () => imgEl.classList.remove("is-loaded");
    imgEl.src = src;
  }

  function openModal(project) {
    lastFocusedEl = document.activeElement;

    modalCategory.textContent = project.category || "";
    modalTitle.textContent = project.title || "";
    modalDate.textContent = formatDate(project.date);
    modalRole.textContent = project.role ? `Rôle — ${project.role}` : "";
    modalDesc.textContent = project.description || "";

    loadImg(modalCoverImg, project.cover, project.title);

    modalGallery.innerHTML = "";
    (project.gallery || []).forEach((src) => {
      const frame = document.createElement("div");
      frame.className = "media-frame";
      const img = document.createElement("img");
      frame.appendChild(img);
      modalGallery.appendChild(frame);
      loadImg(img, src, project.title);
    });

    if (project.link) {
      modalLink.style.display = "inline-flex";
      modalLink.href = project.link;
    } else {
      modalLink.style.display = "none";
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalClose.focus();

    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") closeModal();
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const [year, month] = dateStr.split("-");
    const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    const idx = parseInt(month, 10) - 1;
    return months[idx] ? `${months[idx]} ${year}` : dateStr;
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  window.PortfolioModal = { open: openModal, close: closeModal };

  // ---- Filtering ----
  function initFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    const grid = document.getElementById("project-grid");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const filter = btn.dataset.filter;
        const cards = grid.querySelectorAll(".project-card");
        cards.forEach((card) => {
          const match = filter === "ALL" || card.dataset.category === filter;
          card.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  document.addEventListener("projects:rendered", initFilters);
})();
