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
    realisations: "/content/realisations/realisations.json",
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

  function getTikTokId(url) {
    if (!url) return null;
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
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

  function renderRealisations(data) {
    const introEl = document.getElementById("realisations-intro");
    if (introEl) introEl.textContent = (data && data.intro) || "";

    const wrap = document.getElementById("project-grid");
    if (!wrap) return;
    wrap.innerHTML = "";

    if (!data || !Array.isArray(data.items)) return;

    const sorted = [...data.items].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    sorted.forEach((item) => {
      const videoId = getTikTokId(item.tiktok_url);
      if (!videoId) return;

      const card = el("article", "tiktok-card reveal");
      card.innerHTML = `
        <div class="tiktok-player-wrapper">
          <iframe 
            src="https://www.tiktok.com/embed/v2/${videoId}" 
            class="tiktok-iframe" 
            loading="lazy" 
            allowfullscreen 
            scrolling="no"
            title="${item.title || "Vidéo TikTok"}"
          ></iframe>
        </div>
        <div class="tiktok-meta">
          <span class="tiktok-partner">${item.partner || ""}</span>
          <h3 class="tiktok-title">${item.title || ""}</h3>
          <p class="tiktok-description">${item.description || ""}</p>
          <a href="${item.tiktok_url}" target="_blank" rel="noopener" class="btn btn-ghost tiktok-cta">
            <span>${item.cta_label || "Voir sur TikTok"}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="width:12px;height:12px;"><path d="M7 17L17 7M7 7h10v10"/></svg>
          </a>
        </div>
      `;
      wrap.appendChild(card);
    });

    window.PORTFOLIO_PROJECTS = sorted;
    document.dispatchEvent(new CustomEvent("projects:rendered"));
  }

  async function init() {
    document.getElementById("footer-year").textContent = new Date().getFullYear();

    const [profile, settings, skills, services, experiences, education, collaborations, model, realisations] =
      await Promise.all([
        fetchJSON(CONTENT.profile),
        fetchJSON(CONTENT.settings),
        fetchJSON(CONTENT.skills),
        fetchJSON(CONTENT.services),
        fetchJSON(CONTENT.experiences),
        fetchJSON(CONTENT.education),
        fetchJSON(CONTENT.collaborations),
        fetchJSON(CONTENT.model),
        fetchJSON(CONTENT.realisations),
      ]);

    renderProfile(profile);
    renderSettings(settings);
    renderSkills(skills);
    renderServices(services);
    renderExperiences(experiences);
    renderEducation(education);
    renderCollaborations(collaborations);
    renderModel(model);
    renderRealisations(realisations);

    document.dispatchEvent(new CustomEvent("content:ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
