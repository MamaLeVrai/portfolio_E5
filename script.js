// ============================================
// Portfolio BTS SIO SLAM — Script principal
// ============================================
(function () {

  // -------------------------------------------
  // 1. Animation de fond interactive (souris)
  // -------------------------------------------
  const canvas = document.getElementById('starfield');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W = canvas.width = innerWidth;
    let H = canvas.height = innerHeight;
    const TAU = Math.PI * 2;

    const bgStars = [];
    const mainStars = [];
    const dust = [];
    const sparks = [];
    let mouse = { x: -9999, y: -9999 };

    function area() { return Math.max(400000, W * H); }

    function initParticles() {
      bgStars.length = 0; mainStars.length = 0; dust.length = 0; sparks.length = 0;
      const a = area();

      // Etoiles de fond (fixes, scintillent)
      const BG = Math.floor(a / 45000);
      for (let i = 0; i < BG; i++) {
        bgStars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 0.9 + 0.2, alpha: 0.12 + Math.random() * 0.45, tw: Math.random() * TAU });
      }

      // Etoiles principales (repoussees par la souris)
      const MAIN = Math.floor(a / 140000) + 200;
      for (let i = 0; i < MAIN; i++) {
        mainStars.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.14, vy: (Math.random() - 0.5) * 0.14,
          r: Math.random() * 1.6 + 0.4,
          alpha: 0.6 + Math.random() * 0.6,
          twPhase: Math.random() * TAU,
          color: Math.random() < 0.06 ? '255,220,150' : '255,255,255'
        });
      }

      // Poussieres spatiales
      const DUST = Math.floor(a / 22000) * 2;
      for (let i = 0; i < DUST; i++) {
        dust.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.8 + 0.6,
          alpha: 0.03 + Math.random() * 0.07
        });
      }
    }

    initParticles();

    window.addEventListener('resize', () => {
      W = canvas.width = innerWidth;
      H = canvas.height = innerHeight;
      initParticles();
    });

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      // Trainee d'etincelles derriere la souris
      for (let i = 0; i < 2; i++) {
        sparks.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 2.2, vy: (Math.random() - 0.5) * 2.2,
          r: Math.random() * 1.8 + 0.4,
          life: 18 + Math.random() * 22, age: 0,
          color: Math.random() < 0.12 ? '255,200,120' : '200,220,255'
        });
      }
    });

    window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

    function animate() {
      ctx.clearRect(0, 0, W, H);

      // Degrade de fond
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgba(2,6,23,0.35)');
      g.addColorStop(1, 'rgba(0,0,5,0.85)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      // Etoiles de fond (scintillement)
      for (const s of bgStars) {
        s.tw += 0.003;
        const a = s.alpha * (0.7 + Math.sin(s.tw) * 0.35);
        ctx.beginPath(); ctx.fillStyle = `rgba(200,220,255,${a})`; ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
      }

      // Etoiles principales (interaction souris)
      const R = 180;
      for (const s of mainStars) {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x += W; if (s.x > W) s.x -= W;
        if (s.y < 0) s.y += H; if (s.y > H) s.y -= H;
        s.twPhase += 0.012;
        const tw = 0.78 + Math.sin(s.twPhase) * 0.3;

        const dx = s.x - mouse.x, dy = s.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 0.001;
          const f = (1 - d / R) * 1.4;
          s.vx += (dx / d) * f * 0.9;
          s.vy += (dy / d) * f * 0.9;
        }
        s.vx *= 0.986; s.vy *= 0.986;

        const speed = Math.min(4, Math.abs(s.vx) + Math.abs(s.vy));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${s.color},${Math.min(1, s.alpha * tw)})`;
        ctx.arc(s.x, s.y, s.r + speed * 1.3, 0, TAU);
        ctx.fill();
      }

      // Poussieres
      for (const d of dust) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x += W; if (d.x > W) d.x -= W;
        if (d.y < 0) d.y += H; if (d.y > H) d.y -= H;
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 30000) {
          const dd = Math.sqrt(d2) || 0.001;
          const force = (1 - dd / 200) * 0.18;
          d.vx += (dx / dd) * force;
          d.vy += (dy / dd) * force;
        }
        d.vx *= 0.996; d.vy *= 0.996;
        ctx.beginPath(); ctx.fillStyle = `rgba(180,200,255,${d.alpha})`; ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill();
      }

      // Etincelles (trainee souris)
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]; p.age++;
        if (p.age >= p.life) { sparks.splice(i, 1); continue; }
        p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy *= 0.95;
        const a = Math.max(0, 1 - p.age / p.life);
        ctx.beginPath(); ctx.fillStyle = `rgba(${p.color},${a})`; ctx.arc(p.x, p.y, p.r * a, 0, TAU); ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // -------------------------------------------
  // 2. Navbar : scroll effect + active link
  // -------------------------------------------
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const sections = document.querySelectorAll('.section, .hero');

  // Scroll shadow on navbar
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // Mobile menu toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active nav link based on scroll position
  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    const allLinks = document.querySelectorAll('.nav-links a');

    sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (scrollPos >= top && scrollPos < bottom) {
        const id = section.getAttribute('id');
        allLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // -------------------------------------------
  // 3. Reveal on scroll (IntersectionObserver)
  // -------------------------------------------
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => revealObserver.observe(el));
  }

  // -------------------------------------------
  // 4. Footer year
  // -------------------------------------------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -------------------------------------------
  // 5. Contact form
  // -------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  if (contactForm && contactStatus) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const formLoadedAt = Date.now();

    const setStatus = (msg, isError = false) => {
      contactStatus.textContent = msg;
      contactStatus.classList.toggle('error', isError);
    };

    contactForm.addEventListener('submit', (evt) => {
      evt.preventDefault();

      const name = (document.getElementById('contactName')?.value || '').trim();
      const email = (document.getElementById('contactEmail')?.value || '').trim();
      const subject = (document.getElementById('contactSubject')?.value || '').trim();
      const message = (document.getElementById('contactMessage')?.value || '').trim();
      const honeypot = (document.getElementById('contactWebsite')?.value || '');
      const elapsed = Date.now() - formLoadedAt;

      if (!name || !email || !message || !emailPattern.test(email)) {
        setStatus('Merci de remplir correctement tous les champs obligatoires.', true);
        return;
      }

      if (honeypot || elapsed < 3000) return;

      const mailSubject = encodeURIComponent(`[Portfolio] ${subject || 'Sans sujet'}`);
      const mailBody = encodeURIComponent(`Nom : ${name}\nEmail : ${email}\n\n${message}`);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=margueray.marius@gmail.com&su=${mailSubject}&body=${mailBody}`;
      window.open(gmailUrl, '_blank');

      setStatus('Gmail s\'ouvre dans un nouvel onglet. Merci !');
      contactForm.reset();
    });
  }

})();
