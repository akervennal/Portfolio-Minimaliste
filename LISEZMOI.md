# Portfolio Photographe — Guide d'utilisation

## Structure du projet

```
portfolio/
├── index.html          ← Le site complet (tout est dans ce fichier)
├── images/             ← Dossier pour tes photos (à créer)
│   ├── hero.jpg        ← Ta photo principale d'accueil
│   ├── portraits-urbains/
│   │   ├── photo-01.jpg
│   │   ├── photo-02.jpg
│   │   └── ...
│   ├── nantes-la-nuit/
│   │   └── ...
│   └── (un dossier par projet)
└── LISEZMOI.md         ← Ce fichier
```

---

## Démarrage rapide

### 1. Ouvre le projet dans VS Code
- Ouvre VS Code
- `Fichier > Ouvrir un dossier` → sélectionne le dossier `portfolio/`

### 2. Installe l'extension Live Server
- Va dans Extensions (icône carrée à gauche, ou `Ctrl+Shift+X`)
- Cherche **"Live Server"** par Ritwick Dey
- Clique **Installer**
- Maintenant, clic droit sur `index.html` → **"Open with Live Server"**
- Ton site s'ouvre dans le navigateur et se rafraîchit automatiquement à chaque modification !

### 3. Ajoute tes photos
- Crée un dossier `images/` à côté de `index.html`
- Mets ta photo principale dedans (ex: `hero.jpg`)
- Crée un sous-dossier par projet

### 4. Remplace les placeholders
Dans `index.html`, cherche les blocs gris (les `<div style="...">`) et remplace-les par :
```html
<img src="images/nom-du-dossier/ta-photo.jpg" alt="Description de la photo">
```

---

## Comment customiser

### Changer les couleurs
En haut du CSS, modifie les variables dans `:root` :
```css
--bg: #ffffff;        /* Fond blanc → essaye #1a1a1a pour un mode sombre */
--text: #1a1a1a;      /* Texte → mets #f0f0f0 si fond sombre */
--text-light: #666;   /* Texte secondaire */
```

### Changer la police
1. Va sur https://fonts.google.com
2. Choisis une police, copie le lien
3. Remplace le `<link>` Google Fonts dans le `<head>`
4. Change `--font-main` dans le CSS

### Ajouter un nouveau projet
1. Ajoute un lien dans la sidebar :
```html
<a href="#" data-project="mon-nouveau-projet">mon nouveau projet</a>
```
2. Ajoute une section dans le contenu :
```html
<section class="project-page" id="project-mon-nouveau-projet">
    <div class="project-title">mon nouveau projet</div>
    <div class="project-meta">lieu, année</div>
    <div class="gallery">
        <img src="images/mon-nouveau-projet/photo-01.jpg" alt="Description">
        <img src="images/mon-nouveau-projet/photo-02.jpg" alt="Description">
    </div>
</section>
```
⚠️ Le `data-project` du lien DOIT être identique à la fin de l'`id` de la section (après "project-").

### Changer le layout de la galerie
- `class="gallery"` → 1 photo par ligne (pleine largeur)
- `class="gallery two-col"` → 2 photos par ligne (grille)

---

## Mettre en ligne gratuitement (GitHub Pages)

### 1. Crée un repo GitHub
- Va sur github.com (tu as déjà un compte : akervennal)
- Nouveau repository → nomme-le `portfolio` (ou ce que tu veux)
- Public, pas de README

### 2. Push ton code
```bash
cd portfolio/
git init
git add .
git commit -m "premier commit portfolio"
git branch -M main
git remote add origin https://github.com/akervennal/portfolio.git
git push -u origin main
```

### 3. Active GitHub Pages
- Va dans Settings > Pages
- Source : "Deploy from a branch"
- Branch : `main`, dossier `/` (root)
- Clique Save

Ton site sera en ligne sur : `https://akervennal.github.io/portfolio/`

### 4. Nom de domaine custom (optionnel)
- Achète un domaine sur OVH, Gandi, ou Namecheap (~10-15€/an)
- Dans les DNS du domaine, ajoute un CNAME pointant vers `akervennal.github.io`
- Dans GitHub Pages, ajoute ton domaine custom

---

## Optimisation des images

Tes photos du D7500 sont lourdes (6000x4000px, ~15-25 Mo en JPEG).
Pour le web, exporte depuis Lightroom avec ces réglages :
- **Largeur max** : 2000px (suffisant pour tout écran)
- **Qualité JPEG** : 80% (bon compromis taille/qualité)
- **Espace colorimétrique** : sRGB (standard web)
- **Résolution** : 72 dpi

Ça donnera des fichiers de ~300-500 Ko au lieu de 15 Mo.

---

## Ce que tu peux ajouter plus tard

- **Lightbox** : clic sur une photo → affichage plein écran (librairie : GLightbox)
- **Lazy loading** : ajoute `loading="lazy"` à tes `<img>` pour un chargement progressif
- **Favicon** : petite icône dans l'onglet du navigateur
- **Google Analytics** : pour suivre tes visiteurs
- **Formulaire de contact** : via Formspree.io (gratuit, pas de backend nécessaire)
