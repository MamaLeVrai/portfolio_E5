
// ===============================
// Animation du ciel étoilé spatial
// ===============================
(function(){
  // On récupère le canvas (zone de dessin) et son contexte 2D
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  // Largeur et hauteur du canvas (plein écran)
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const TAU = Math.PI * 2; // Un tour complet (360°) en radians

  // Différents types de particules pour l'effet spatial
  const bgStars = [];   // Petites étoiles de fond (fixes, scintillent)
  const mainStars = []; // Étoiles principales (mobiles, repoussées par la souris)
  const dust = [];      // Poussières spatiales (légères, mobiles)
  const sparks = [];    // Étincelles (effet lors du passage de la souris)

  // Position de la souris (hors écran par défaut)
  let mouse = { x: -9999, y: -9999 };

  // Calcule la surface de l'écran pour adapter le nombre de particules
  function area() { return Math.max(400000, W * H); }

  // Initialise toutes les particules (appelé au chargement et au redimensionnement)
  function initAll() {
    // On vide tous les tableaux
    bgStars.length = 0; mainStars.length = 0; dust.length = 0; sparks.length = 0;
    const a = area();
    // Calcul du nombre de particules selon la taille de l'écran
    const BG_COUNT = Math.floor(a / 45000); // étoiles de fond
    const MAIN_COUNT = Math.floor(a / 140000) + 200; // étoiles mobiles
    const DUST_COUNT = Math.floor(a / 22000) * 2; // poussières

    // Création des étoiles de fond
    for (let i = 0; i < BG_COUNT; i++) {
      bgStars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 0.9 + 0.2, alpha: 0.12 + Math.random() * 0.45, tw: Math.random() * TAU });
    }
    // Création des étoiles principales
    for (let i = 0; i < MAIN_COUNT; i++) {
      mainStars.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.14, vy: (Math.random() - 0.5) * 0.14, r: Math.random() * 1.6 + 0.4, alpha: 0.6 + Math.random() * 0.6, twPhase: Math.random() * TAU, color: Math.random() < 0.06 ? '255,220,150' : '255,255,255' });
    }
    // Création des poussières
    for (let i = 0; i < DUST_COUNT; i++) {
      dust.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.8 + 0.6, alpha: 0.03 + Math.random() * 0.07 });
    }
  }

  // On initialise les particules au démarrage
  initAll();

  // Quand on redimensionne la fenêtre, on adapte le canvas et on relance l'init
  addEventListener('resize', () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; initAll(); });
  // Quand la souris bouge, on met à jour sa position et on génère des étincelles
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; emitSparksTrail(e.clientX, e.clientY); });
  // Quand la souris sort de la fenêtre, on la met hors écran
  addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

  // Génère une étincelle à une position donnée (effet lumineux)
  function emitSpark(x, y) {
    sparks.push({ x, y, vx: (Math.random() - 0.5) * 2.2, vy: (Math.random() - 0.5) * 2.2, r: Math.random() * 1.8 + 0.4, life: 18 + Math.random() * 22, age: 0, color: Math.random() < 0.12 ? '255,200,120' : '200,220,255' });
  }
  // Génère plusieurs étincelles autour de la souris (effet de traînée)
  function emitSparksTrail(x, y) {
    for (let i = 0; i < 2; i++) emitSpark(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8);
  }

  // Fonction principale d'animation, appelée à chaque image
  function step() {
    // Efface le canvas
    ctx.clearRect(0, 0, W, H);
    // Dégradé de fond spatial
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(2,6,23,0.35)');
    g.addColorStop(1, 'rgba(0,0,5,0.85)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // --- Affichage des étoiles de fond (scintillent) ---
    for (const s of bgStars) {
      s.tw += 0.003;
      const a = s.alpha * (0.7 + Math.sin(s.tw) * 0.35);
      ctx.beginPath(); ctx.fillStyle = `rgba(200,220,255,${a})`; ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }

    // --- Affichage des étoiles principales (mobiles, repoussées par la souris) ---
    for (const s of mainStars) {
      s.x += s.vx; s.y += s.vy;
      // Si l'étoile sort de l'écran, elle réapparaît de l'autre côté
      if (s.x < 0) s.x += W; if (s.x > W) s.x -= W; if (s.y < 0) s.y += H; if (s.y > H) s.y -= H;
      s.twPhase += 0.012;
      const tw = 0.78 + Math.sin(s.twPhase) * 0.3;
      // Calcul de la distance à la souris
      const dx = s.x - mouse.x; const dy = s.y - mouse.y; const d2 = dx * dx + dy * dy; const R = 180;
      // Si la souris est proche, l'étoile est repoussée (effet magnétique)
      if (d2 < R * R) {
        const d = Math.sqrt(d2) || 0.001;
        const f = (1 - (d / R)) * 1.4;
        s.vx += (dx / d) * f * 0.9;
        s.vy += (dy / d) * f * 0.9;
        emitSpark(s.x, s.y); // Génère une étincelle
      }
      // Ralentit progressivement l'étoile
      s.vx *= 0.986; s.vy *= 0.986;
      const speed = Math.min(4, Math.abs(s.vx) + Math.abs(s.vy));
      ctx.beginPath(); ctx.fillStyle = `rgba(${s.color},${Math.min(1, s.alpha * tw)})`; ctx.arc(s.x, s.y, s.r + speed * 1.3, 0, TAU); ctx.fill();
    }

    // --- Affichage des poussières spatiales (petits points mobiles) ---
    for (const d of dust) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0) d.x += W; if (d.x > W) d.x -= W; if (d.y < 0) d.y += H; if (d.y > H) d.y -= H;
      // Légère répulsion par la souris
      const dx = d.x - mouse.x, dy = d.y - mouse.y; const d2 = dx * dx + dy * dy;
      if (d2 < 30000) {
        const dd = Math.sqrt(d2) || 0.001;
        const force = (1 - dd / 200) * 0.18;
        d.vx += (dx / dd) * force;
        d.vy += (dy / dd) * force;
      }
      d.vx *= 0.996; d.vy *= 0.996;
      ctx.beginPath(); ctx.fillStyle = `rgba(180,200,255,${d.alpha})`; ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill();
    }

    // --- Affichage des étincelles (effet lumineux temporaire) ---
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i]; p.age++;
      if (p.age >= p.life) { sparks.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy *= 0.95;
      const a = Math.max(0, 1 - (p.age / p.life));
      ctx.beginPath(); ctx.fillStyle = `rgba(${p.color},${a})`; ctx.arc(p.x, p.y, p.r * a, 0, TAU); ctx.fill();
    }

    // Redemande une nouvelle image pour l'animation (boucle infinie)
    requestAnimationFrame(step);
  }

  // Démarre l'animation
  requestAnimationFrame(step);


  // ===============================
  // Gestion du menu de navigation (ouverture/fermeture)
  // ===============================
  const menuToggle = document.getElementById('menuToggle'); // bouton hamburger
  const mainNav = document.getElementById('main-nav');      // panneau de navigation
  // Par défaut, le menu est ouvert (classe .open)
  if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
  if (mainNav) { mainNav.classList.add('open'); mainNav.classList.remove('closed'); }
  // Quand on clique sur le bouton, on ouvre/ferme le menu (animation CSS)
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      if (isOpen) mainNav.classList.remove('closed'); else mainNav.classList.add('closed');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      // L'état visuel est géré par les classes CSS (.open/.closed)
    });
  }


  // ===============================
  // (Ancien) Formulaire de contact — désactivé, remplacé par infos statiques
  // ===============================
  // Le code ci-dessous n'est plus utilisé, car la section contact affiche maintenant
  // directement l'adresse, le mail et le téléphone. Il est laissé en exemple.
  // const contactForm = document.getElementById('contactForm');
  // if (contactForm) {
  //   contactForm.addEventListener('submit', async e => { ... });
  // }


  // ===============================
  // Prévisualisation des fichiers ajoutés (CV, rapports, etc.)
  // ===============================
  const fileInput = document.getElementById('fileInput'); // champ d'ajout de fichiers
  const filesList = document.getElementById('filesList'); // zone d'affichage des fichiers
  if (fileInput) {
    fileInput.addEventListener('change', e => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) { filesList.textContent = 'Aucun document chargé.'; return; }
      filesList.innerHTML = '';
      // Pour chaque fichier sélectionné, on crée un lien pour le visualiser/télécharger
      files.forEach(f => {
        const div = document.createElement('div');
        const a = document.createElement('a');
        a.textContent = f.name + ' (' + Math.round(f.size / 1024) + ' KB)';
        a.href = URL.createObjectURL(f);
        a.target = '_blank';
        div.appendChild(a);
        filesList.appendChild(div);
      });
    });
  }

})(); // Fin du script principal
