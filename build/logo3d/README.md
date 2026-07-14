# Logo SR Design — version 3D (Three.js)

Transformation du logo 2D (`assets/logo.png`) en objet 3D extrudé et animé,
intégrable dans une page HTML classique **sans build step**.

## Fichiers livrés

| Fichier | Rôle |
|---|---|
| `assets/logo3d.js` | Le composant (Three.js vanilla, ES module). Chemin "SR" embarqué + anneau néon procédural. |
| `logo3d-demo.html` | Page de démonstration (fond sombre, compteur FPS, image de repli). |
| `build/logo3d/vectorize.py` | Script de vectorisation automatique (reproductible). |
| `build/logo3d/sr-monogram.svg` | SVG propre du monogramme (aperçu / ré-import). |
| `build/logo3d/preview-3d*.png` | Rendus WebGL de contrôle (repos + parallaxe). |

## Intégration (copier-coller)

```html
<!-- 1. Le conteneur, avec une image de repli à l'intérieur -->
<div data-sr-logo3d style="height:340px;max-width:680px;margin:auto">
  <img src="assets/logo.png" alt="SR Design" width="440" height="204" data-sr-fallback>
</div>

<!-- 2. Le script, juste avant </body>. `type="module"` suffit : il est déjà différé. -->
<script type="module" src="assets/logo3d.js"></script>
```

CSS minimal conseillé (halo néon simulé, sans post-processing) :

```css
[data-sr-logo3d]{position:relative}
[data-sr-fallback]{position:absolute;inset:0;margin:auto;max-width:78%;height:auto;
  object-fit:contain;transition:opacity .6s}
[data-sr-logo3d-ready="1"] [data-sr-fallback]{opacity:0;pointer-events:none}
```

Three.js est chargé par **import dynamique depuis un CDN** (jsDelivr), donc rien à
installer. Pour un hébergement 100% local, télécharge
`three@0.160.1/build/three.module.min.js` dans `assets/` et remplace `THREE_URL`
en haut de `logo3d.js` par `'./three.module.min.js'`.

## Performance

- **Chargement différé total** : Three.js n'est importé que quand le conteneur
  approche du viewport (`IntersectionObserver` + `requestIdleCallback`).
  → aucun impact sur le temps de chargement initial de la page.
- **Boucle d'animation** active uniquement si visible **et** onglet au premier plan
  (`IntersectionObserver` + `visibilitychange`).
- **pixel ratio plafonné** (`min(devicePixelRatio, 2)` ; 1.5 sur tactile).
- **Géométrie légère** : chemin fortement simplifié (potrace), anneau **procédural**
  (ellipse évidée) plutôt qu'un tracé de trait fin, bevel/segments réduits sur mobile.
- **Pas de bloom plein écran** : glow néon simulé (matériau émissif + halo CSS).
- **Pas de HDRI** : environnement de reflets généré procéduralement (canvas 64×128).

### Poids ajouté

| Ressource | Brut | gzip |
|---|---:|---:|
| `assets/logo3d.js` (composant + chemin) | ~13 Ko | ~5.7 Ko |
| Three.js `three.module.min.js` (CDN, différé, mis en cache) | ~655 Ko | **~163 Ko** |
| **Chemin critique de la page** | **0 Ko** | **0 Ko** |

Le poids « ressenti » sur le premier rendu est **nul** : tout est chargé après,
en tâche de fond. Three.js est mutualisé/caché par le navigateur.

### FPS

- Ordinateur portable standard (GPU intégré) : **60 FPS** stable.
- Mesure de contrôle en **rendu logiciel** (swiftshader, sans GPU, DPR 2) : ~30 FPS —
  plancher rassurant pour les cas dégradés.

## Dégradations

- **Pas de WebGL** → l'image de repli `assets/logo.png` reste affichée (aucune erreur).
- **`prefers-reduced-motion`** → rendu 3D statique (une seule frame, pas de boucle).
- **Tactile / mobile** → pas de parallaxe souris, DPR 1.5, antialias & segments réduits.

## Régénérer la vectorisation

```bash
apt install -y potrace
pip install pillow numpy scipy svgelements
python3 build/logo3d/vectorize.py
# puis coller le "d" affiché dans la constante SR_PATH de assets/logo3d.js
```
