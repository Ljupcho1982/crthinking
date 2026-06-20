/* ===== CRThinking — interactions v2 ===== */
document.getElementById('year').textContent = new Date().getFullYear();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Nav scroll state + progress */
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
const onScroll = () => {
  nav.classList.toggle('scrolled', scrollY > 30);
  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (scrollY / h * 100) + '%';
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* Mobile menu */
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => { toggle.classList.toggle('open'); links.classList.toggle('open'); });
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { toggle.classList.remove('open'); links.classList.remove('open'); }));

/* Reveal + stagger */
document.querySelectorAll('.cards,.pillars,.work-grid,.faq,.timeline').forEach(g => {
  [...g.children].forEach((c, i) => c.style.setProperty('--d', (i * 0.07) + 's'));
});
const io = new IntersectionObserver((es) => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* Count-up stats */
const animateCount = (el) => {
  const target = +el.dataset.count, suffix = el.dataset.suffix || '', dur = 1500, t0 = performance.now();
  const tick = (now) => {
    const p = Math.min((now - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const statIO = new IntersectionObserver((es) => {
  es.forEach(e => { if (e.isIntersecting) { animateCount(e.target); statIO.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => statIO.observe(el));

/* Hero headline — word-by-word neon reveal (keeps .grad phrases intact) */
(function () {
  const title = document.querySelector('.hero-title');
  if (!title) return;
  const out = document.createDocumentFragment();
  const units = [];
  [...title.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      n.textContent.split(/(\s+)/).forEach(part => {
        if (part === '') return;
        if (/^\s+$/.test(part)) { out.appendChild(document.createTextNode(part)); return; }
        const s = document.createElement('span'); s.className = 'word'; s.textContent = part;
        out.appendChild(s); units.push(s);
      });
    } else if (n.nodeType === 1) {
      const wrap = document.createElement('span'); wrap.className = 'word';
      wrap.appendChild(n); out.appendChild(wrap); units.push(wrap);
    } else { out.appendChild(n); }
  });
  title.textContent = '';
  title.appendChild(out);
  if (reduce) { units.forEach(w => w.classList.add('lit')); return; }
  units.forEach((w, i) => setTimeout(() => w.classList.add('lit'), 120 + i * 85));
})();

/* Footer "tears in rain" typewriter */
(function () {
  const el = document.getElementById('tears');
  if (!el) return;
  const line = '“All those moments will be lost in time, like tears in rain.”';
  if (reduce) { el.textContent = line; return; }
  const obs = new IntersectionObserver((es) => {
    if (!es[0].isIntersecting) return;
    obs.disconnect();
    let i = 0;
    const tick = () => { el.textContent = line.slice(0, i++); if (i <= line.length) setTimeout(tick, 45); };
    tick();
  }, { threshold: 0.5 });
  obs.observe(el.closest('.footer'));
})();

/* Typewriter in mockup */
const typed = document.getElementById('typed');
if (typed && !reduce) {
  const lines = [
    'Fine-tuning local model on your call data…',
    'Voice agent live — fully offline, 38 ms.',
    'Booking confirmed. Zero data left the building.'
  ];
  let li = 0, ci = 0, deleting = false;
  const loop = () => {
    const cur = lines[li];
    typed.textContent = deleting ? cur.slice(0, ci--) : cur.slice(0, ci++);
    let delay = deleting ? 28 : 42;
    if (!deleting && ci > cur.length) { deleting = true; delay = 1600; }
    else if (deleting && ci < 0) { deleting = false; ci = 0; li = (li + 1) % lines.length; delay = 320; }
    setTimeout(loop, delay);
  };
  loop();
}

/* 3D tilt — hero mockup */
const tilt = document.getElementById('tilt');
if (tilt && !reduce) {
  const vis = tilt.closest('.hero-visual');
  vis.addEventListener('mousemove', (e) => {
    const r = vis.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    tilt.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
    const mr = tilt.getBoundingClientRect();
    tilt.style.setProperty('--gx', ((e.clientX - mr.left) / mr.width * 100) + '%');
    tilt.style.setProperty('--gy', ((e.clientY - mr.top) / mr.height * 100) + '%');
  });
  vis.addEventListener('mouseleave', () => { tilt.style.transform = ''; });
}

/* Subtle tilt — service cards */
if (!reduce) {
  document.querySelectorAll('.tilt-s').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-7px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* Founder avatar — mouse-reactive 3D tilt + parallax */
if (!reduce) {
  const fp = document.querySelector('.founder-photo');
  const av = document.querySelector('.avatar');
  const span = av && av.querySelector('span');
  if (fp && av) {
    fp.addEventListener('mousemove', (e) => {
      const r = fp.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      av.style.transition = 'transform .08s linear';
      av.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 22}deg)`;
      if (span) span.style.transform = `translate(${x * 14}px, ${y * 14}px)`;
    });
    fp.addEventListener('mouseleave', () => {
      av.style.transition = 'transform .4s cubic-bezier(.16,1,.3,1)';
      av.style.transform = '';
      if (span) span.style.transform = '';
    });
  }
}

/* Contact form — AJAX submit to FormSubmit */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('cfStatus');
  const btn = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form._honey && form._honey.value) return;          // bot trap
    btn.disabled = true;
    status.className = 'cf-status sending';
    status.textContent = 'Transmitting…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      if (!res.ok) throw new Error('bad response');
      form.reset();
      status.className = 'cf-status ok';
      status.textContent = '✓ Message received. I’ll be in touch shortly.';
    } catch (err) {
      status.className = 'cf-status err';
      status.innerHTML = 'Could not send — email <a href="mailto:ljupco.semov@gmail.com" style="color:inherit;text-decoration:underline">ljupco.semov@gmail.com</a> directly.';
    } finally {
      btn.disabled = false;
    }
  });
})();

/* Founder card — cursor-following glow */
(function () {
  const fw = document.querySelector('.founder-wrap');
  if (!fw) return;
  fw.addEventListener('mousemove', (e) => {
    const r = fw.getBoundingClientRect();
    fw.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    fw.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
})();

/* Work-card spotlight follow */
document.querySelectorAll('.work-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

/* Magnetic buttons */
if (!reduce) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* Timeline progress fill */
const tlFill = document.getElementById('tlFill');
const tlLine = document.querySelector('.tl-line');
if (tlFill && tlLine) {
  const update = () => {
    const r = tlLine.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight * 0.75 - r.top) / r.height, 0), 1);
    tlFill.style.height = (p * 100) + '%';
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

/* Blade Runner rain canvas */
const canvas = document.getElementById('neural');
const ctx = canvas.getContext('2d');
let w, h, drops, raf;
const RAIN_TINTS = ['rgba(0,233,255,', 'rgba(255,46,136,', 'rgba(255,177,92,', 'rgba(170,200,210,'];
function resize() {
  w = canvas.width = innerWidth; h = canvas.height = innerHeight;
  const count = Math.min(160, Math.floor(w * h / 9000));
  drops = Array.from({ length: count }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    len: 12 + Math.random() * 26, speed: 7 + Math.random() * 10,
    slant: 0.6 + Math.random() * 0.5,
    tint: RAIN_TINTS[(Math.random() * RAIN_TINTS.length) | 0],
    a: 0.12 + Math.random() * 0.28
  }));
}
let last = 0, paused = false, cleared = false;
function draw(now) {
  raf = requestAnimationFrame(draw);
  if (paused) { if (!cleared) { ctx.clearRect(0, 0, w, h); cleared = true; } return; }
  cleared = false;
  if (now - last < 33) return;      // ~30fps — spare the integrated GPU
  last = now;
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1.1;
  for (const d of drops) {
    ctx.strokeStyle = d.tint + d.a + ')';
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x + d.slant * d.len, d.y + d.len);
    ctx.stroke();
    d.y += d.speed; d.x += d.slant * d.speed * 0.5;
    if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
  }
}
if (!reduce) {
  resize(); raf = requestAnimationFrame(draw);
  addEventListener('resize', () => { resize(); });
  // pause the rain once the hero is scrolled away
  const heroEl = document.getElementById('home');
  new IntersectionObserver(es => { paused = !es[0].isIntersecting; }, { threshold: 0 }).observe(heroEl);
}

/* Parallax orbs */
if (!reduce) {
  const orbs = document.querySelectorAll('.bg-orb');
  addEventListener('mousemove', (e) => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    orbs.forEach((o, i) => { o.style.transform = `translate(${x * (i + 1) * 18}px, ${y * (i + 1) * 18}px)`; });
  });
}
