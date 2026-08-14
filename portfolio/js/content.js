/**
 * content.js
 * ---------------------------------------------------------------
 * Charge tout le contenu du portfolio depuis /content/*.json et
 * l'injecte dans le DOM. Aucune information n'est codée en dur ici :
 * modifier un fichier JSON (via /admin ou directement sur GitHub)
 * suffit à mettre à jour le site, sans toucher au HTML/CSS/JS.
 */

(function () {
  "use strict";

  const CONTENT = {
    profile: "/content/profile/profile.json",
    services: "/content/services/services.json",
    skills: "/content/skills/skills.json",
    experiences: "/content/experiences/experiences.json",
    education: "/content/education/education.json",
    collaborations: "/content/collaborations/collaborations.json",
    model: "/content/model/model.json",
    settings: "/content/settings/settings.json",
  };

  const cacheBust = `?v=${Date.now()}`;

  async function fetchJSON(url) {
    try {
      const res = await fetch(url + cacheBust, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[content.js] Impossible de charger ${url}`, err.message);
      return null;
    }
  }

  /**
   * Charge la liste des projets. En production, un index est généré au
   * build (voir build/generate-content-index.js). En développement local
   * sans étape de build, on retombe sur une détection séquentielle des
   * fichiers project-01.json, project-02.json, etc.
   */
  async function loadProjects() {
    const index = await fetchJSON("/content/projects/index.json");
    if (index && Array.isArray(index.items)) {
      return index.items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    }

    // Fallback local (sans build) : tente project-01.json à project-30.json
    const attempts = Array.from({ length: 30 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return fetchJSON(`/content/projects/project-${n}.json`);
    });
    const results = await Promise.all(attempts);
    return results.filter(Boolean).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }

  function setImage(imgEl, src, alt) {
    if (!imgEl) return;
    if (!src) return;
    imgEl.alt = alt || imgEl.alt || "";
    imgEl.addEventListener(
      "load",
      () => imgEl.classList.add("is-loaded"),
      { once: true }
    );
    imgEl.addEventListener(
      "error",
      () => imgEl.classList.remove("is-loaded"),
      { once: true }
    );
    imgEl.src = src;
  }

  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function renderProfile(data) {
    if (!data) return;

    document.getElementById("hero-kicker-text").textContent = data.hero_kicker || "";
    document.getElementById("hero-handle").textContent = "@" + (data.handle || "").replace(/^@/, "");
    document.getElementById("hero-tagline").textContent = data.tagline || "";
    document.getElementById("hero-title").innerHTML = formatDisplayName(data.name);
    setImage(document.getElementById("hero-img"), data.hero_photo, data.name);

    setImage(document.getElementById("about-img"), data.about_photo, data.name + " — univers");
    document.getElementById("about-quote").textContent = data.bio_quote ? `« ${data.bio_quote} »` : "";
    document.getElementById("about-bio").textContent = data.bio_long || data.bio_short || "";

    const keywordsWrap = document.getElementById("about-keywords");
    keywordsWrap.innerHTML = "";
    (data.keywords || []).forEach((kw) => keywordsWrap.appendChild(el("span", null, kw)));

    // Marquee
    const marqueeWrap = document.getElementById("marquee-track");
    const words = data.keywords && data.keywords.length ? data.keywords : ["MINAA"];
    const doubled = [...words, ...words, ...words, ...words];
    marqueeWrap.innerHTML = doubled.map((w) => `<span>${w}</span>`).join("");

    // CTA final
    document.getElementById("cta-title").textContent = data.cta_final_title || "";
    document.getElementById("cta-subtitle").textContent = data.cta_final_subtitle || "";

    const emailBtn = document.getElementById("cta-email-btn");
    if (data.email) emailBtn.href = `mailto:${data.email}`;
    const waBtn = document.getElementById("cta-whatsapp-btn");
    if (data.whatsapp) waBtn.href = `https://wa.me/${data.whatsapp.replace(/[^\d]/g, "")}`;

    // Footer
    const fEmail = document.getElementById("footer-email");
    if (data.email) { fEmail.textContent = data.email; fEmail.href = `mailto:${data.email}`; }
    const fPhone = document.getElementById("footer-phone");
    if (data.phone) { fPhone.textContent = data.phone; fPhone.href = `tel:${data.phone.replace(/\s/g, "")}`; }
    document.getElementById("footer-location").textContent = data.location || "";

    const socials = data.socials || {};
    bindSocial("footer-instagram", socials.instagram);
    bindSocial("footer-tiktok", socials.tiktok);
    bindSocial("footer-linkedin", socials.linkedin);

    // SEO
    if (data.name) {
      document.title = `${data.name} · ${data.handle || ""} — Portfolio`;
    }
  }

  function bindSocial(id, url) {
    const node = document.getElementById(id);
    if (!node) return;
    if (url) node.href = url;
    else node.style.display = "none";
  }

  function formatDisplayName(fullName) {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) return fullName;
    const last = parts[parts.length - 1];
    const rest = parts.slice(0, -1).join(" ");
    return `${rest}<br /><em>${last}</em>`;
  }

  function renderSettings(data) {
    if (!data) return;
    if (data.site_title) {
      document.getElementById("doc-title").textContent = data.site_title;
      document.title = data.site_title;
    }
    if (data.meta_description) {
      document.getElementById("meta-description").setAttribute("content", data.meta_description);
      document.getElementById("og-description").setAttribute("content", data.meta_description);
    }
    if (data.og_image) document.getElementById("og-image").setAttribute("content", data.og_image);
    if (data.site_url) {
      document.getElementById("og-url").setAttribute("content", data.site_url);
      document.getElementById("canonical-link").setAttribute("href", data.site_url);
    }
    if (data.nav_brand) document.getElementById("nav-brand").textContent = data.nav_brand;
    if (data.cta_nav_label) document.getElementById("nav-cta-label").firstChild.textContent = data.cta_nav_label + " ";
  }

  function renderSkills(data) {
    if (!data || !Array.isArray(data.items)) return;
    const wrap = document.getElementById("skills-list");
    wrap.innerHTML = "";
    data.items.forEach((skill, i) => {
      const row = el("div", "skill-row reveal");
      row.setAttribute("role", "listitem");
      row.tabIndex = 0;
      row.innerHTML = `
        <span class="idx">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <div class="title">${skill.title}</div>
          <div class="desc">${skill.description || ""}</div>
        </div>
        <div class="thumb media-frame"><img alt="${skill.title}" /></div>
      `;
      wrap.appendChild(row);
      const img = row.querySelector("img");
      setImage(img, skill.image, skill.title);

      row.addEventListener("click", () => row.classList.toggle("is-active"));
    });
  }

  function renderServices(data) {
    if (!data || !Array.isArray(data.items)) return;
    const wrap = document.getElementById("services-list");
    wrap.innerHTML = "";
    const sorted = [...data.items].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    sorted.forEach((service, i) => {
      const row = el("div", "service-row reveal");
      row.setAttribute("role", "listitem");
      row.innerHTML = `
        <span class="idx">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <h3>${service.title}</h3>
          <p>${service.description || ""}</p>
        </div>
      `;
      wrap.appendChild(row);
    });
  }

  function renderExperiences(data) {
    if (!data || !Array.isArray(data.items)) return;
    const wrap = document.getElementById("timeline-list");
    wrap.innerHTML = "";
    data.items.forEach((exp) => {
      const row = el("div", "timeline-item reveal");
      row.innerHTML = `
        <div class="period">${exp.period || ""}</div>
        <div>
          <h3>${exp.structure}</h3>
          <div class="role">${exp.role || ""}</div>
          <p>${exp.description || ""}</p>
        </div>
      `;
      wrap.appendChild(row);
    });
  }

  function renderEducation(data) {
    if (!data || !Array.isArray(data.items)) return;
    const wrap = document.getElementById("education-block");
    wrap.innerHTML = "";
    data.items.forEach((edu) => {
      const item = el("div", "education-item");
      item.innerHTML = `
        <h4>${edu.degree}</h4>
        <div class="school">${edu.school}</div>
        <div class="period">${edu.period || ""}</div>
      `;
      wrap.appendChild(item);
    });
  }

  function renderCollaborations(data) {
    if (!data || !Array.isArray(data.items)) return;
    const wrap = document.getElementById("collab-grid");
    wrap.innerHTML = "";
    data.items.forEach((collab) => {
      const card = el("div", "collab-card");
      const CardTag = collab.link ? "a" : "div";
      card.innerHTML = `
        <div class="collab-logo media-frame"><img alt="Logo ${collab.name}" /></div>
        <div>
          <h3>${collab.name}</h3>
          <div class="role">${collab.role || ""}</div>
          <p>${collab.description || ""}</p>
        </div>
      `;
      if (collab.link) {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => window.open(collab.link, "_blank", "noopener"));
      }
      wrap.appendChild(card);
      setImage(card.querySelector("img"), collab.logo, collab.name);
    });
  }

  function renderModel(data) {
    if (!data) return;
    document.getElementById("model-intro").textContent = data.intro || "";
    const wrap = document.getElementById("model-mosaic");
    wrap.innerHTML = "";
    (data.items || []).forEach((item) => {
      const cell = el("div", "model-item media-frame");
      cell.dataset.format = item.format || "square";
      cell.innerHTML = `
        <img alt="${item.caption || "Photo — modèle"}" />
        <span class="frame-tag-caption">${item.caption || ""}</span>
      `;
      wrap.appendChild(cell);
      setImage(cell.querySelector("img"), item.image, item.caption);
    });
  }

  function renderProjects(items) {
    const wrap = document.getElementById("project-grid");
    wrap.innerHTML = "";
    items.forEach((project) => {
      const card = el("article", "project-card reveal");
      card.dataset.category = project.category || "ALL";
      card.innerHTML = `
        <div class="media-frame">
          <img alt="${project.title}" />
          <span class="frame-tag">Photo à ajouter depuis /admin</span>
        </div>
        <div class="project-card-meta">
          <h3>${project.title}</h3>
          <span>${project.category || ""} · ${formatProjectDate(project.date)}</span>
        </div>
      `;
      setImage(card.querySelector("img"), project.cover, project.title);
      card.addEventListener("click", () => window.PortfolioModal && window.PortfolioModal.open(project));
      wrap.appendChild(card);
    });

    window.PORTFOLIO_PROJECTS = items;
    document.dispatchEvent(new CustomEvent("projects:rendered"));
  }

  function formatProjectDate(dateStr) {
    if (!dateStr) return "";
    const [year, month] = dateStr.split("-");
    const months = ["JAN","FÉV","MAR","AVR","MAI","JUIN","JUIL","AOÛT","SEP","OCT","NOV","DÉC"];
    const idx = parseInt(month, 10) - 1;
    return months[idx] ? `${months[idx]} ${year}` : dateStr;
  }

  async function init() {
    document.getElementById("footer-year").textContent = new Date().getFullYear();

    const [profile, settings, skills, services, experiences, education, collaborations, model, projects] =
      await Promise.all([
        fetchJSON(CONTENT.profile),
        fetchJSON(CONTENT.settings),
        fetchJSON(CONTENT.skills),
        fetchJSON(CONTENT.services),
        fetchJSON(CONTENT.experiences),
        fetchJSON(CONTENT.education),
        fetchJSON(CONTENT.collaborations),
        fetchJSON(CONTENT.model),
        loadProjects(),
      ]);

    renderProfile(profile);
    renderSettings(settings);
    renderSkills(skills);
    renderServices(services);
    renderExperiences(experiences);
    renderEducation(education);
    renderCollaborations(collaborations);
    renderModel(model);
    renderProjects(projects);

    document.dispatchEvent(new CustomEvent("content:ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
