/*
 * SR Design — logo 3D animé (Three.js vanilla, sans framework, sans build step)
 * -----------------------------------------------------------------------------
 * - Extrusion 3D du monogramme "SR" (chemin vectorisé depuis le logo PNG) + anneau
 *   néon procédural. Aucune dépendance à SVGLoader : un mini-parseur de "path"
 *   alimente THREE.ShapePath (détection des trous incluse) -> zéro poids superflu.
 * - Chargement 100% différé : Three.js n'est importé (import() dynamique) que
 *   lorsque le conteneur approche du viewport ET si l'appareil est capable.
 *   => n'impacte jamais le temps de chargement initial de la page.
 * - Dégradations : pas de WebGL -> on garde l'image de repli ; reduced-motion ->
 *   rendu statique (pas de boucle) ; tactile -> pas de parallaxe souris ;
 *   onglet caché -> boucle mise en pause.
 *
 * Intégration (voir logo3d-demo.html) :
 *   <div data-sr-logo3d style="height:320px">
 *     <img src="assets/logo.png" alt="SR Design" data-sr-fallback>
 *   </div>
 *   <script type="module" src="assets/logo3d.js"></script>
 */

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.min.js';

/* Chemin du monogramme "SR" vectorisé (potrace) — repère 440x204, y vers le bas. */
const SR_PATH = "M296.61,77.30C295.79,77.70 292.24,77.77 276.71,77.80L257.80,77.80L256.15,78.76C254.02,80.02 238.73,95.27 238.73,96.16C238.73,96.53 239.99,98.05 241.68,99.70L244.64,102.61L266.16,102.61L287.66,102.61L289.32,103.41C291.61,104.50 292.77,105.79 293.13,107.77C293.30,108.67 293.53,109.83 293.66,110.32C294.06,112.04 292.27,116.67 290.58,118.20C288.09,120.48 287.89,120.48 261.49,120.48L237.67,120.48L234.72,123.39C233.06,125.01 231.77,126.57 231.77,126.90C231.77,127.66 239.99,136.06 241.72,137.09C242.35,137.48 245.73,140.60 249.21,144.04C252.70,147.44 255.75,150.26 255.98,150.26C256.21,150.26 259.13,152.94 262.45,156.21C265.80,159.49 268.68,162.17 268.92,162.17C269.15,162.17 271.34,164.12 273.76,166.50C277.87,170.54 278.27,170.84 279.10,170.60C279.63,170.44 283.61,170.27 287.96,170.21L295.88,170.07L298.84,167.20C300.50,165.54 301.76,164.02 301.76,163.66C301.76,162.93 289.58,150.59 287.82,149.53C286.43,148.70 279.86,142.32 279.86,141.82C279.86,141.62 280.33,141.03 280.89,140.46L281.89,139.50L287.43,139.34C290.64,139.24 293.36,138.97 293.89,138.74C294.43,138.51 295.39,138.35 296.05,138.35C302.88,138.31 314.92,127.56 317.91,118.86C318.51,117.10 318.97,115.12 319.00,114.42C319.00,113.73 319.24,112.64 319.50,111.98C319.77,111.35 320.00,110.45 320.00,110.06C320.00,109.66 319.77,108.77 319.50,108.14C319.24,107.48 319.00,106.19 319.00,105.26C319.00,102.28 315.92,95.04 313.53,92.39C311.97,90.67 312.14,89.68 314.56,86.96C316.09,85.28 316.02,85.01 313.30,82.20C309.45,78.26 307.79,77.57 301.42,77.30C300.23,77.27 298.90,77.14 298.44,77.04C297.97,76.94 297.18,77.04 296.61,77.30Z M145.36,78.30C144.83,78.56 143.53,78.76 142.54,78.79C134.77,78.89 122.97,87.36 118.69,95.90C117.76,97.78 117.00,99.67 117.00,100.13C117.00,100.59 116.76,101.52 116.50,102.18C116.17,102.94 116.00,104.47 116.00,106.58C116.00,108.70 116.17,110.22 116.50,110.98C116.76,111.65 117.00,112.80 117.00,113.53C117.00,116.01 120.71,122.13 124.36,125.64C127.54,128.72 130.69,130.60 134.97,132.09L138.72,133.35L163.43,133.38L188.15,133.38L189.80,132.42C191.89,131.20 204.23,118.86 204.23,118.00C204.23,117.63 202.97,116.11 201.28,114.46L198.33,111.55L174.51,111.55C151.06,111.55 150.66,111.55 148.54,110.85C143.70,109.26 142.70,106.58 145.79,103.51L147.51,101.79L181.94,101.79C200.85,101.79 216.81,101.92 217.40,102.08C218.36,102.35 218.60,102.22 220.22,100.73C221.18,99.83 222.51,98.77 223.14,98.38C224.93,97.32 236.08,85.97 236.08,85.24C236.08,84.08 230.34,78.79 229.15,78.79C228.55,78.79 227.55,78.56 226.89,78.30C225.20,77.57 146.92,77.60 145.36,78.30Z M209.91,124.22C206.69,127.39 203.54,130.27 202.87,130.67C201.38,131.56 195.61,137.48 195.61,138.11C195.61,138.38 195.81,139.11 196.07,139.70C196.64,141.06 196.37,141.79 194.95,143.14L193.92,144.14L168.01,144.23L142.11,144.30L137.26,149.06C134.61,151.65 131.89,154.09 131.26,154.49C129.57,155.52 122.30,162.96 122.30,163.69C122.30,164.02 123.63,165.61 125.25,167.20L128.21,170.11L135.21,170.11C140.71,170.11 142.47,170.21 143.43,170.60C144.06,170.87 145.36,171.10 146.28,171.10C148.28,171.10 151.89,172.22 153.35,173.32C154.81,174.41 155.21,174.31 157.50,172.16L159.55,170.27L178.99,170.11C193.52,169.97 198.66,169.84 199.36,169.51C199.89,169.31 200.82,169.11 201.45,169.11C202.84,169.11 209.24,167.03 211.03,165.97C213.59,164.48 220.95,156.64 222.28,153.99L223.47,151.58L223.47,138.15L223.47,124.68L220.36,121.60C218.27,119.49 217.00,118.49 216.51,118.49C215.98,118.49 214.02,120.18 209.91,124.22Z";

/* Repère commun (espace 440x204) — centre du logo complet et échelle -> unités 3D. */
const CX = 217, CY = 120, S = 0.05;
const RING = { rx: 132 * S, ry: 78 * S };      // anneau néon (mesuré sur le logo)
const px = (x) => (x - CX) * S;                 // -> X monde
const py = (y) => -(y - CY) * S;                // -> Y monde (inversion axe Y)

/* --- Mini-parseur "path" (M/L/C/Q/Z, coordonnées absolues) -> THREE.ShapePath --- */
function buildShapePath(THREE, d) {
  const sp = new THREE.ShapePath();
  const tokens = d.match(/[MLCQZ]|-?\d*\.?\d+/gi);
  let i = 0, x = 0, y = 0;
  const n = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    const c = tokens[i++];
    if (c === 'M') { x = n(); y = n(); sp.moveTo(px(x), py(y)); }
    else if (c === 'L') { x = n(); y = n(); sp.lineTo(px(x), py(y)); }
    else if (c === 'C') {
      const a1 = n(), b1 = n(), a2 = n(), b2 = n(); x = n(); y = n();
      sp.bezierCurveTo(px(a1), py(b1), px(a2), py(b2), px(x), py(y));
    }
    else if (c === 'Q') {
      const a1 = n(), b1 = n(); x = n(); y = n();
      sp.quadraticCurveTo(px(a1), py(b1), px(x), py(y));
    }
    else if (c === 'Z') { /* ShapePath.toShapes ferme automatiquement */ }
  }
  return sp;
}

/* Anneau néon procédural (ellipse évidée) — bien plus léger qu'un tracé de trait fin. */
function ringShape(THREE) {
  const s = new THREE.Shape();
  s.absellipse(0, 0, RING.rx, RING.ry, 0, Math.PI * 2, false, 0);
  const hole = new THREE.Path();
  hole.absellipse(0, 0, RING.rx - 0.42, RING.ry - 0.42, 0, Math.PI * 2, true, 0);
  s.holes.push(hole);
  return s;
}

/* Environnement procédural (dégradé + bande lumineuse) -> reflets chrome, sans HDRI. */
function makeEnv(THREE, renderer) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0.00, '#0a1830');
  grad.addColorStop(0.42, '#20406e');
  grad.addColorStop(0.50, '#dbeaff'); // bande "studio" -> reflet net sur le métal
  grad.addColorStop(0.58, '#2a5da0');
  grad.addColorStop(1.00, '#05080f');
  g.fillStyle = grad; g.fillRect(0, 0, 64, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  tex.dispose(); pmrem.dispose();
  return env;
}

function isTouch() {
  return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
}
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

async function initScene(el) {
  const THREE = await import(THREE_URL);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = isTouch();
  const lowPower = touch && (navigator.hardwareConcurrency || 4) <= 4;
  const dprCap = touch ? 1.5 : 2;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 17);

  const renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';

  scene.environment = makeEnv(THREE, renderer);

  /* Géométries -------------------------------------------------------------- */
  const bevelSeg = lowPower ? 1 : 2;
  const curveSeg = lowPower ? 4 : 6;

  const srShapes = buildShapePath(THREE, SR_PATH).toShapes(true);
  const srGeo = new THREE.ExtrudeGeometry(srShapes, {
    depth: 1.0, bevelEnabled: true, bevelThickness: 0.12,
    bevelSize: 0.12, bevelSegments: bevelSeg, curveSegments: curveSeg
  });
  srGeo.center();
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x2b3c56, metalness: 0.92, roughness: 0.22, envMapIntensity: 1.5
  });
  const sr = new THREE.Mesh(srGeo, chromeMat);

  const ringGeo = new THREE.ExtrudeGeometry(ringShape(THREE), {
    depth: 0.6, bevelEnabled: true, bevelThickness: 0.08,
    bevelSize: 0.08, bevelSegments: bevelSeg, curveSegments: lowPower ? 24 : 48
  });
  ringGeo.center();
  const neonMat = new THREE.MeshStandardMaterial({
    color: 0x0a1c38, emissive: 0x3a9bff, emissiveIntensity: 1.35,
    metalness: 0.35, roughness: 0.4
  });
  const ring = new THREE.Mesh(ringGeo, neonMat);
  ring.position.z = -0.2;

  /* Petits points "circuit" néon (fidélité au logo, coût négligeable). */
  const dotGeo = new THREE.SphereGeometry(0.13, 10, 10);
  const dotMat = new THREE.MeshStandardMaterial({ color: 0x0a1c38, emissive: 0x6fc0ff, emissiveIntensity: 2.0 });
  const dotL = new THREE.Mesh(dotGeo, dotMat); dotL.position.set(px(96), py(120), 0.3);
  const dotR = new THREE.Mesh(dotGeo, dotMat); dotR.position.set(px(338), py(120), 0.3);

  const group = new THREE.Group();
  group.add(ring, sr, dotL, dotR);
  scene.add(group);

  /* Lumières (3 max, pas d'HDRI) ------------------------------------------- */
  scene.add(new THREE.HemisphereLight(0x9ccaff, 0x0a0f1a, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(4, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0x3a9bff, 1.8); rim.position.set(-6, -2, -4); scene.add(rim);

  el.dataset.srLogo3dReady = '1'; // masque le fallback via CSS

  /* Animation --------------------------------------------------------------- */
  const pointer = { x: 0, y: 0 };
  if (!touch) {
    window.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    }, { passive: true });
    el.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
  }

  function resize() {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(el);
  else window.addEventListener('resize', resize);

  let raf = 0, running = false;
  const clock = new THREE.Clock();
  let rx = 0, ry = 0;

  function frame() {
    const t = clock.getElapsedTime();
    // flottement automatique
    const floatX = Math.sin(t * 0.7) * 0.09;
    const floatY = Math.sin(t * 0.5) * 0.14;
    // parallaxe souris (retour doux au repos géré par pointer=0)
    const tgX = floatX + (-pointer.y * 0.28);
    const tgY = floatY + (pointer.x * 0.42);
    rx += (tgX - rx) * 0.06;
    ry += (tgY - ry) * 0.06;
    group.rotation.x = rx;
    group.rotation.y = ry;
    group.position.y = Math.sin(t * 0.9) * 0.16;
    // léger battement du néon
    neonMat.emissiveIntensity = 1.2 + Math.sin(t * 2.0) * 0.18;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; clock.start(); raf = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  if (reduced) {
    renderer.render(scene, camera); // rendu statique unique, aucune boucle
  } else {
    // ne tourne que visible + onglet actif
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { en.isIntersecting && !document.hidden ? start() : stop(); });
    }, { threshold: 0.01 });
    io.observe(el);
  }
}

/* Auto-init : différé, sans bloquer le rendu initial de la page. */
function boot() {
  const els = document.querySelectorAll('[data-sr-logo3d]');
  if (!els.length) return;
  if (!hasWebGL()) return; // pas de WebGL -> l'image de repli reste affichée

  els.forEach((el) => {
    const io = new IntersectionObserver((ents, obs) => {
      ents.forEach((en) => {
        if (en.isIntersecting) {
          obs.disconnect();
          // idle -> on n'entre jamais en concurrence avec le chargement critique
          const go = () => initScene(el).catch((e) => console.warn('[logo3d]', e));
          'requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 200);
        }
      });
    }, { rootMargin: '300px' });
    io.observe(el);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
