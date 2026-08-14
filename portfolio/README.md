# MINAA — Portfolio de PIENO Yendoutiene Yachmine (_minaa_27)

Portfolio éditorial, statique, sans base de données. Le contenu (profil,
services, expériences, projets, photos, réseaux sociaux) est séparé du code
et modifiable depuis une interface d'administration (`/admin`), propulsée par
**Decap CMS** (anciennement Netlify CMS) — un CMS "Git-based" : chaque
modification devient un commit GitHub, et Netlify redéploie le site
automatiquement.

```
Interface Admin (/admin)  →  GitHub (contenu + médias)  →  Netlify (build + déploiement)
```

Aucune base de données (MySQL, Firebase, Supabase…) n'est utilisée.

---

## 1. Structure du projet

```
portfolio/
├── index.html                 → structure du site (ne pas y écrire de contenu en dur)
├── css/style.css               → design
├── js/
│   ├── content.js              → charge le contenu JSON et l'injecte dans la page
│   ├── portfolio.js            → filtres de la galerie + modal projet
│   └── main.js                 → navigation, animations, menu mobile
├── content/                    → TOUT le contenu du site, en JSON
│   ├── profile/profile.json
│   ├── services/services.json
│   ├── skills/skills.json
│   ├── experiences/experiences.json
│   ├── education/education.json
│   ├── collaborations/collaborations.json
│   ├── model/model.json
│   ├── settings/settings.json
│   └── projects/               → 1 fichier JSON par projet (project-01.json…)
├── assets/images/               → toutes les photos, organisées par section
├── admin/
│   ├── index.html               → page d'administration (Decap CMS)
│   └── config.yml                → déclare tous les champs modifiables
├── build/generate-content-index.js → script exécuté au build Netlify
├── netlify.toml
└── package.json
```

**Règle d'or : la propriétaire du site ne touche jamais à `index.html`,
`style.css` ou aux fichiers `.js`.** Tout se passe dans `/admin` ou, à défaut,
directement dans les fichiers `.json` de `content/`.

---

## 2. Lancer le projet en local

Aucune installation lourde n'est nécessaire, c'est un site statique.

```bash
# Depuis le dossier du projet
npx serve . -l 8080
# puis ouvrir http://localhost:8080
```

Ou avec l'extension "Live Server" de VS Code, ou n'importe quel serveur
statique. `/admin` ne fonctionnera pas en local (il a besoin de Netlify
Identity + Git Gateway, voir plus bas) — mais tout le reste du site,
navigation comprise, s'affiche normalement.

---

## 3. Connecter le dépôt GitHub

1. Créer un nouveau dépôt GitHub (ex. `minaa27-portfolio`).
2. Depuis le dossier du projet :
   ```bash
   git init
   git add .
   git commit -m "Portfolio initial"
   git branch -M main
   git remote add origin https://github.com/<votre-compte>/minaa27-portfolio.git
   git push -u origin main
   ```

---

## 4. Déployer sur Netlify

1. Sur [app.netlify.com](https://app.netlify.com), cliquer **Add new site →
   Import an existing project**.
2. Choisir GitHub, puis sélectionner le dépôt `minaa27-portfolio`.
3. Les réglages de build sont déjà définis dans `netlify.toml` :
   - **Build command** : `node build/generate-content-index.js`
   - **Publish directory** : `.`
4. Cliquer **Deploy site**. Netlify build et publie le site.
5. (Optionnel) Dans **Site settings → Domain management**, configurer un
   domaine personnalisé (ex. `minaa27.com`).

> Le script `build/generate-content-index.js` régénère automatiquement la
> liste des projets (`content/projects/index.json`) à chaque déploiement. Il
> n'y a donc rien à faire manuellement quand un projet est ajouté ou
> supprimé depuis `/admin`.

---

## 5. Configurer l'authentification de `/admin`

`/admin` n'est jamais librement modifiable : Yendoutiene doit se connecter.
Aucun mot de passe n'est stocké dans le code — l'authentification est gérée
par **Netlify Identity**.

1. Dans le tableau de bord Netlify du site : **Site configuration → Identity
   → Enable Identity**.
2. Dans **Identity → Registration**, choisir **Invite only** (recommandé,
   pour que seule Yendoutiene puisse créer un compte).
3. Dans **Identity → Services**, activer **Git Gateway**. C'est ce service
   qui permet à Decap CMS de committer sur GitHub au nom de l'utilisatrice
   connectée, sans qu'elle ait besoin d'un compte GitHub personnel ni de
   token à gérer.
4. Toujours dans **Identity**, cliquer **Invite users**, saisir l'e-mail de
   Yendoutiene. Elle reçoit un e-mail d'invitation, clique sur le lien,
   choisit un mot de passe.

Une fois ces étapes faites, `/admin` est prêt à l'emploi.

---

## 6. Accéder à `/admin`

1. Aller sur `https://<votre-site>.netlify.app/admin`.
2. Se connecter avec l'e-mail et le mot de passe créés à l'étape précédente.
3. L'interface Decap CMS affiche les collections : **Profil, Compétences,
   Services, Expériences, Formation, Projets, Section Modèle,
   Collaborations, Réglages du site**.

---

## 7. Ajouter ou modifier une photo

1. Ouvrir la collection concernée (ex. **Profil** pour la photo de couverture,
   **Projets** pour la galerie d'un projet).
2. Cliquer sur le champ image (ex. "Photo principale"), puis **Choose an
   image** → **Upload** pour envoyer une nouvelle photo depuis l'ordinateur
   ou le téléphone.
3. Cliquer **Publish** (ou **Save** puis **Publish**) en haut à droite.

La photo est automatiquement enregistrée dans `assets/images/…`, un commit
est créé sur GitHub, et le site se met à jour en 1 à 2 minutes.

---

## 8. Ajouter un nouveau projet

1. Dans `/admin`, ouvrir la collection **Projets**.
2. Cliquer **New Projets**.
3. Remplir : titre, catégorie (PHOTO / VIDEO / CONTENT / EVENTS /
   COLLABORATIONS), date, rôle, description, image principale, galerie
   (plusieurs images), vidéo ou lien externe si besoin, et l'ordre
   d'affichage.
4. Cliquer **Publish**.

Le projet apparaît automatiquement dans la section **Réalisations** du site,
avec le bon filtre de catégorie — sans aucune intervention sur le code.

Pour **supprimer** un projet : ouvrir le projet dans la liste, menu **⋯ →
Delete entry**.

---

## 9. Modifier une expérience ou en ajouter une

1. Ouvrir la collection **Expériences**.
2. Cliquer sur **+ Add "Expériences"** dans la liste pour ajouter une ligne,
   ou modifier une entrée existante (structure, fonction, période,
   description, logo).
3. **Publish**.

Même logique pour **Formation** (ajouter un nouveau diplôme) et
**Collaborations** (ajouter une structure partenaire).

---

## 10. Modifier les réseaux sociaux et les informations de contact

1. Ouvrir la collection **Profil**.
2. Modifier les champs **Email**, **Téléphone**, **WhatsApp**, **Instagram**,
   **TikTok**, **LinkedIn**.
3. **Publish**.

Ces informations sont utilisées automatiquement dans la navigation, le pied
de page et la section finale "Travailler avec moi".

---

## 11. Publier les changements

Dans Decap CMS, chaque clic sur **Publish** :
1. crée un commit sur la branche `main` du dépôt GitHub ;
2. déclenche automatiquement un nouveau build Netlify ;
3. le site en ligne est mis à jour en général en moins de 2 minutes.

Aucune action supplémentaire n'est nécessaire.

---

## 12. Faire évoluer le design (développeur)

- Tout le style vit dans `css/style.css`, organisé en tokens (`:root`) puis
  en composants commentés par section.
- Le HTML dans `index.html` ne contient que la structure : les textes
  affichés proviennent de `content/*.json` via `js/content.js`.
- Modifier la palette, les typographies ou les espacements se fait
  uniquement via les variables CSS en haut du fichier — cela ne casse jamais
  le contenu existant.

## 13. Accessibilité & performance déjà en place

- HTML sémantique, `alt` sur les images, focus clavier visible.
- `prefers-reduced-motion` respecté (animations désactivées si demandé par
  le système).
- Images chargées en `object-fit: cover` avec transition de fondu ; prévoir
  des exports **WebP** pour les meilleures performances.
- SEO : title, meta description, Open Graph et données structurées générés
  depuis `content/settings/settings.json` et `content/profile/profile.json`.

---

Des questions sur Netlify Identity, Git Gateway ou Decap CMS : consulter
[docs.netlify.com/visitor-access/git-gateway](https://docs.netlify.com/visitor-access/git-gateway/)
et [decapcms.org/docs/intro](https://decapcms.org/docs/intro/).
