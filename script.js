// Enhanced starfield with multiple particle layers, twinkle, and mouse-triggered bursts
(function(){
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const TAU = Math.PI * 2;

  // Particle layers
  const bgStars = [];
  const mainStars = [];
  const dust = [];
  const sparks = [];

  let mouse = { x: -9999, y: -9999 };

  function area() { return Math.max(400000, W * H); }

  function initAll() {
    bgStars.length = 0; mainStars.length = 0; dust.length = 0; sparks.length = 0;
    const a = area();
  // more background stars, slightly fewer main moving stars, dust similar
  const BG_COUNT = Math.floor(a / 45000); // doubled density of background stars
  const MAIN_COUNT = Math.floor(a / 140000) + 200; // a bit fewer moving stars
  const DUST_COUNT = Math.floor(a / 22000) * 2;

    for (let i = 0; i < BG_COUNT; i++) {
      bgStars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 0.9 + 0.2, alpha: 0.12 + Math.random() * 0.45, tw: Math.random() * TAU });
    }
    for (let i = 0; i < MAIN_COUNT; i++) {
      mainStars.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.14, vy: (Math.random() - 0.5) * 0.14, r: Math.random() * 1.6 + 0.4, alpha: 0.6 + Math.random() * 0.6, twPhase: Math.random() * TAU, color: Math.random() < 0.06 ? '255,220,150' : '255,255,255' });
    }
    for (let i = 0; i < DUST_COUNT; i++) {
      dust.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.8 + 0.6, alpha: 0.03 + Math.random() * 0.07 });
    }
  }

  initAll();

  addEventListener('resize', () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; initAll(); });
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; emitSparksTrail(e.clientX, e.clientY); });
  addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

  // pointer-ring removed: visual ring was intentionally deleted to simplify DOM

  function emitSpark(x, y) { sparks.push({ x, y, vx: (Math.random() - 0.5) * 2.2, vy: (Math.random() - 0.5) * 2.2, r: Math.random() * 1.8 + 0.4, life: 18 + Math.random() * 22, age: 0, color: Math.random() < 0.12 ? '255,200,120' : '200,220,255' }); }
  // reduce trail density to be less obtrusive
  function emitSparksTrail(x, y) { for (let i = 0; i < 2; i++) emitSpark(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8); }

  function step() {
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(2,6,23,0.35)');
    g.addColorStop(1, 'rgba(0,0,5,0.85)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // background twinkling dots
    for (const s of bgStars) {
      s.tw += 0.003;
      const a = s.alpha * (0.7 + Math.sin(s.tw) * 0.35);
      ctx.beginPath(); ctx.fillStyle = `rgba(200,220,255,${a})`; ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }

    // main stars
    for (const s of mainStars) {
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x += W; if (s.x > W) s.x -= W; if (s.y < 0) s.y += H; if (s.y > H) s.y -= H;
      s.twPhase += 0.012;
      const tw = 0.78 + Math.sin(s.twPhase) * 0.3;
      const dx = s.x - mouse.x; const dy = s.y - mouse.y; const d2 = dx * dx + dy * dy; const R = 180;
      if (d2 < R * R) { const d = Math.sqrt(d2) || 0.001; const f = (1 - (d / R)) * 1.4; s.vx += (dx / d) * f * 0.9; s.vy += (dy / d) * f * 0.9; emitSpark(s.x, s.y); }
      s.vx *= 0.986; s.vy *= 0.986;
      const speed = Math.min(4, Math.abs(s.vx) + Math.abs(s.vy));
      ctx.beginPath(); ctx.fillStyle = `rgba(${s.color},${Math.min(1, s.alpha * tw)})`; ctx.arc(s.x, s.y, s.r + speed * 1.3, 0, TAU); ctx.fill();
    }

    // dust
    for (const d of dust) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0) d.x += W; if (d.x > W) d.x -= W; if (d.y < 0) d.y += H; if (d.y > H) d.y -= H;
      const dx = d.x - mouse.x, dy = d.y - mouse.y; const d2 = dx * dx + dy * dy;
      if (d2 < 30000) { const dd = Math.sqrt(d2) || 0.001; const force = (1 - dd / 200) * 0.18; d.vx += (dx / dd) * force; d.vy += (dy / dd) * force; }
      d.vx *= 0.996; d.vy *= 0.996;
      ctx.beginPath(); ctx.fillStyle = `rgba(180,200,255,${d.alpha})`; ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill();
    }

    // sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i]; p.age++; if (p.age >= p.life) { sparks.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy *= 0.95; const a = Math.max(0, 1 - (p.age / p.life));
      ctx.beginPath(); ctx.fillStyle = `rgba(${p.color},${a})`; ctx.arc(p.x, p.y, p.r * a, 0, TAU); ctx.fill();
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);

  // Menu toggle (remove save/load buttons — they were removed from HTML)
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('main-nav');
  // menu is open by default — ensure aria reflects that
  if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
  // ensure menu starts open
  if (mainNav) { mainNav.classList.add('open'); mainNav.classList.remove('closed'); }
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      if (isOpen) mainNav.classList.remove('closed'); else mainNav.classList.add('closed');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      // toggle visual state handled by CSS (.open)
    });
  }

  // Contact form handler: build a mailto: link with encoded subject/body
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = (document.getElementById('contactName')||{value:''}).value.trim();
      const email = (document.getElementById('contactEmail')||{value:''}).value.trim();
      const subject = (document.getElementById('contactSubject')||{value:''}).value.trim() || 'Contact portfolio';
      const message = (document.getElementById('contactMessage')||{value:''}).value.trim();
      if (!name || !email || !message) { alert('Veuillez renseigner votre nom, votre e‑mail et le message.'); return; }
      const emailOK = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      if (!emailOK) { alert('Adresse e‑mail invalide.'); return; }

      const payload = { name, email, subject, message };
      try {
        const res = await fetch('/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { alert('Message envoyé. Merci !'); contactForm.reset(); return; }
        const txt = await res.text();
        console.error('send failed:', res.status, txt);
        alert('Échec envoi serveur, ouverture du client mail en secours.');
      } catch (err) {
        console.error('network error', err);
        alert('Impossible de joindre le serveur, ouverture du client mail en secours.');
      }
      // fallback to mailto if server unavailable
      const to = 'margueray.marius@gmail.com';
      const body = `Nom: ${name}%0D%0AEmail: ${encodeURIComponent(email)}%0D%0A%0D%0A${encodeURIComponent(message)}`;
      const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
      window.location.href = mailto;
    });
  }

  // File preview (client-side only)
  const fileInput = document.getElementById('fileInput');
  const filesList = document.getElementById('filesList');
  if (fileInput) {
    fileInput.addEventListener('change', e => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) { filesList.textContent = 'Aucun document chargé.'; return; }
      filesList.innerHTML = '';
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

})();
