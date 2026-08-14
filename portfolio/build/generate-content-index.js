/**
 * generate-content-index.js
 * ---------------------------------------------------------------
 * Ce script tourne UNE FOIS au moment du build Netlify (voir netlify.toml).
 * Il ne crée ni base de données ni backend : il lit simplement le contenu
 * de /content/projects (des fichiers .json gérés par Decap CMS) et écrit
 * un fichier récapitulatif /content/projects/index.json.
 *
 * Pourquoi ? En JavaScript "vanilla" côté navigateur, il est impossible
 * de lister le contenu d'un dossier sur un hébergement statique comme
 * Netlify. On a donc besoin d'un petit index généré automatiquement.
 *
 * Résultat concret : quand Yendoutiene ajoute un nouveau projet depuis
 * /admin, Decap CMS crée un fichier project-XX.json, le commit sur GitHub,
 * Netlify relance un build, ce script régénère l'index, et le nouveau
 * projet apparaît sur le site — sans qu'aucune ligne de code ne soit
 * modifiée manuellement.
 */

const fs = require("fs");
const path = require("path");

const PROJECTS_DIR = path.join(__dirname, "..", "content", "projects");
const OUTPUT_FILE = path.join(PROJECTS_DIR, "index.json");

function buildProjectsIndex() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.warn(`[generate-content-index] Dossier introuvable: ${PROJECTS_DIR}`);
    return;
  }

  const files = fs
    .readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith(".json") && file !== "index.json");

  const projects = [];

  for (const file of files) {
    const fullPath = path.join(PROJECTS_DIR, file);
    try {
      const raw = fs.readFileSync(fullPath, "utf-8");
      const data = JSON.parse(raw);
      projects.push({ file, ...data });
    } catch (err) {
      console.warn(`[generate-content-index] Fichier ignoré (JSON invalide): ${file}`, err.message);
    }
  }

  projects.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), items: projects }, null, 2));
  console.log(`[generate-content-index] Index généré: ${projects.length} projet(s) → ${OUTPUT_FILE}`);
}

buildProjectsIndex();
