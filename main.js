/* ════════════════════════════════════════════════════════════
   BIRTHDAY WEBSITE — MAIN SCRIPT
   6-Page Interactive Experience
   ════════════════════════════════════════════════════════════ */

'use strict';

// ─── Page registry ───────────────────────────────────────────
const PAGE_IDS = [
  'page-envelope',  // 0
  'page-flowers',   // 1
  'page-gallery',   // 2
  'page-lock',      // 3
  'page-gifts',     // 4
  'page-slideshow'  // 5
];
let currentPage = 0;

// ─── Navigate to a page ──────────────────────────────────────
function goTo(index) {
  if (index === currentPage) return;

  const outEl = document.getElementById(PAGE_IDS[currentPage]);
  const inEl  = document.getElementById(PAGE_IDS[index]);
  const forward = index > currentPage;

  // Slide out current
  gsap.to(outEl, {
    opacity: 0,
    x: forward ? -80 : 80,
    scale: 0.94,
    duration: 0.55,
    ease: 'power2.in',
    onComplete: () => {
      outEl.classList.remove('active');
      gsap.set(outEl, { x: 0, scale: 1 });

      inEl.classList.add('active');
      gsap.fromTo(inEl,
        { opacity: 0, x: forward ? 80 : -80, scale: 1.04 },
        {
          opacity: 1, x: 0, scale: 1,
          duration: 0.65,
          ease: 'power2.out',
          onComplete: () => {
            currentPage = index;
            onEnter(index);
          }
        }
      );
    }
  });
}

// ─── onEnter hooks per page ──────────────────────────────────
function onEnter(index) {
  switch (index) {
    case 0: initEnvelope(); break;
    case 1: initFlowers(); break;
    case 2: initGallery(); break;
    case 3: initLock(); break;
    case 4: initGifts(); break;
    case 5: initSlideshow(); break;
  }
}

// ════════════════════════════════════════════════════════════
// PAGE 1 — ENVELOPE
// ════════════════════════════════════════════════════════════

function initEnvelope() {
  spawnParticles('particles1');
}

/* Floating particles */
function spawnParticles(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const colors = [
    'rgba(255,218,185,.55)', 'rgba(255,179,71,.50)',
    'rgba(255,140,105,.40)', 'rgba(255,192,203,.45)',
    'rgba(255,160,122,.35)'
  ];

  for (let i = 0; i < 55; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 7 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      background:${colors[i % colors.length]};
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 12 + 9}s;
      animation-delay:-${Math.random() * 14}s;
    `;
    container.appendChild(p);
  }
}

/* Envelope click → open flap → burst → next page */
let envelopeOpened = false;

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  const seal = document.getElementById('wax-seal');
  const flap = document.getElementById('env-flap');

  // Seal pulse
  gsap.to(seal, {
    scale: 1.35, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 1,
    onComplete: () => {
      // Open flap
      flap.classList.add('flap-open');
      playTone(700, 0.08, 'sine');

      // Wrapper shake
      gsap.to('#envelope-wrapper', {
        x: 7, duration: 0.09, repeat: 6, yoyo: true, ease: 'power1.inOut',
        onComplete: () => {
          // Flash burst overlay
          burstTransition(() => goTo(1));
        }
      });
    }
  });
}

function burstTransition(cb) {
  const burst = document.createElement('div');
  Object.assign(burst.style, {
    position: 'fixed', inset: '0',
    background: 'radial-gradient(circle, rgba(255,210,160,.9), rgba(255,140,80,.6) 50%, transparent)',
    zIndex: '500', pointerEvents: 'none',
    opacity: '0'
  });
  document.body.appendChild(burst);
  gsap.to(burst, {
    opacity: 1, duration: 0.22, ease: 'power2.out',
    onComplete: () => {
      if (cb) cb();
      gsap.to(burst, {
        opacity: 0, duration: 0.55,
        onComplete: () => burst.remove()
      });
    }
  });
}

// Attach envelope events
document.getElementById('envelope-wrapper').addEventListener('click', openEnvelope);


// ════════════════════════════════════════════════════════════
// PAGE 2 — FLOWERS & PETALS
// ════════════════════════════════════════════════════════════

let petalRafId = null;
let petalParticles = [];
let heartInterval = null;

function initFlowers() {
  // Bloom the three flowers with stagger
  ['flower1', 'flower2', 'flower3'].forEach((id, i) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('blooming');
    }, i * 420);
  });

  // Start canvas petal shower
  startPetalsCanvas();

  // Float hearts repeatedly
  if (heartInterval) clearInterval(heartInterval);
  floatHeartsBatch();
  heartInterval = setInterval(floatHeartsBatch, 3200);

  playTone(440, 0.05, 'sine');
}

function startPetalsCanvas() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  petalParticles = [];

  const colors = ['#FFB6C1','#FF69B4','#FFDAB9','#FFB347','#FFC0CB','#FF9999','#FFAEB0'];

  function newPetal() {
    return {
      x: Math.random() * canvas.width,
      y: -18,
      vx: (Math.random() - 0.5) * 1.6,
      vy: Math.random() * 2.2 + 0.9,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 4.5,
      sz: Math.random() * 13 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.35,
      sway: Math.random() * 1.8,
      swayS: Math.random() * 0.025,
      swayO: Math.random() * Math.PI * 2,
    };
  }

  // Seed initial batch with stagger
  for (let i = 0; i < 65; i++) {
    setTimeout(() => { petalParticles.push(newPetal()); }, i * 140);
  }

  function draw(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petalParticles.forEach((p, i) => {
      p.y  += p.vy;
      p.x  += p.vx + Math.sin(p.swayO + ts * p.swayS) * p.sway;
      p.rot += p.rotV;
      if (p.y > canvas.height + 30) petalParticles[i] = newPetal();

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.sz * 0.45, p.sz, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    });
    petalRafId = requestAnimationFrame(draw);
  }

  if (petalRafId) cancelAnimationFrame(petalRafId);
  petalRafId = requestAnimationFrame(draw);
}

function stopPetals() {
  if (petalRafId) { cancelAnimationFrame(petalRafId); petalRafId = null; }
  if (heartInterval) { clearInterval(heartInterval); heartInterval = null; }
  petalParticles = [];
}

function floatHeartsBatch() {
  const layer = document.getElementById('hearts-layer');
  if (!layer) return;
  const emojis = ['💕','❤️','🌸','💖','💗','🌺','💝','✨','🌷'];

  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'heart-float';
      h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const dur = Math.random() * 3.5 + 4;
      const sz  = Math.random() * 1.4 + 0.9;
      h.style.cssText = `
        left:${Math.random() * 96}%;
        bottom:${Math.random() * 10}%;
        font-size:${sz}rem;
        animation-duration:${dur}s;
        animation-delay:${Math.random() * 1}s;
      `;
      layer.appendChild(h);
      h.addEventListener('animationend', () => h.remove());
    }, i * 220);
  }
}

document.getElementById('btn-flowers-next').addEventListener('click', () => {
  stopPetals();
  goTo(2);
});


// ════════════════════════════════════════════════════════════
// PAGE 3 — PHOTO GALLERY
// ════════════════════════════════════════════════════════════

function initGallery() {
  const rows = document.querySelectorAll('.g-row');
  rows.forEach((row, ri) => {
    const frames = row.querySelectorAll('.photo-frame');
    const anim = row.dataset.anim;

    setTimeout(() => {
      frames.forEach((frame, fi) => {
        setTimeout(() => animatePhotoFrame(frame, anim), fi * 220);
      });
    }, ri * 650);
  });
}

function animatePhotoFrame(frame, anim) {
  let from = {};
  switch (anim) {
    case 'slide-left':
      from = { x: -160, opacity: 0, scale: 0.9 };
      break;
    case 'fade-up':
      from = { y: 90, opacity: 0, scale: 0.85 };
      break;
    case 'flip':
      from = { rotationY: 95, opacity: 0, scale: 0.9 };
      break;
    default:
      from = { scale: 0.5, opacity: 0 };
  }
  gsap.fromTo(frame, from, {
    x: 0, y: 0, opacity: 1, scale: 1, rotationY: 0,
    duration: 0.72,
    ease: 'back.out(1.5)',
    clearProps: 'transform'
  });
}

document.getElementById('btn-gallery-next').addEventListener('click', () => goTo(3));


// ════════════════════════════════════════════════════════════
// PAGE 4 — LOCK SCREEN
// ════════════════════════════════════════════════════════════

// ⭐ CHANGE THIS to the actual 8-digit birthday code
const CORRECT_CODE = '19042001';

let codeBuffer = '';

function initLock() {
  codeBuffer = '';
  updateDots();
  setLockMsg('', '');

  // Animate polaroid in
  gsap.fromTo('#memory-polaroid',
    { x: -100, opacity: 0, rotate: -8 },
    { x: 0, opacity: 1, rotate: -4, duration: 0.9, ease: 'back.out(1.4)' }
  );

  // Sparkle the polaroid
  setTimeout(spawnPolaroidSparkles, 1000);
}

function spawnPolaroidSparkles() {
  const container = document.getElementById('polaroid-sparkles');
  if (!container) return;
  const emojis = ['✨','⭐','💫','🌟'];
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      const s = document.createElement('span');
      s.textContent = emojis[i % emojis.length];
      s.style.cssText = `
        position:absolute;
        left:${Math.random()*280}px;
        top:${Math.random()*380}px;
        font-size:${Math.random()*1+0.7}rem;
        pointer-events:none;
        opacity:0;
      `;
      container.appendChild(s);
      gsap.fromTo(s,
        { opacity: 0, scale: 0.2, y: 0 },
        { opacity: 1, scale: 1, y: -30, duration: 0.6, ease: 'power2.out',
          onComplete: () => gsap.to(s, { opacity: 0, y: -55, duration: 0.4, onComplete: () => s.remove() })
        }
      );
    }, i * 180);
  }
}

function updateDots() {
  for (let i = 0; i < 8; i++) {
    const d = document.getElementById(`dot-${i}`);
    if (!d) continue;
    d.classList.toggle('filled', i < codeBuffer.length);
    d.classList.remove('error-dot');
  }
}

function setLockMsg(text, type) {
  const el = document.getElementById('lock-msg');
  if (!el) return;
  el.textContent = text;
  el.className = 'lock-msg' + (type ? ` lock-${type}` : '');
}

function lockPressDigit(digit) {
  if (codeBuffer.length >= 8) return;
  codeBuffer += digit;
  updateDots();
  playTone(550 + codeBuffer.length * 40, 0.04, 'sine');

  if (codeBuffer.length === 8) {
    setTimeout(checkCode, 350);
  }
}

function lockClear() {
  if (!codeBuffer) return;
  codeBuffer = codeBuffer.slice(0, -1);
  updateDots();
}

function checkCode() {
  if (codeBuffer === CORRECT_CODE) {
    // SUCCESS ✅
    setLockMsg('Unlocked! 💖', 'ok');
    document.getElementById('lock-icon-anim').textContent = '🔓';

    playTone(700, 0.07, 'sine');
    setTimeout(() => playTone(900, 0.07), 130);
    setTimeout(() => playTone(1100, 0.07), 260);
    setTimeout(() => playTone(1400, 0.08), 400);

    gsap.to('#page-lock', {
      scale: 1.025, duration: 0.3, yoyo: true, repeat: 1,
      onComplete: () => setTimeout(() => goTo(4), 700)
    });
  } else {
    // WRONG ❌
    setLockMsg('Hmm… try again 💝', 'error');
    playTone(180, 0.1, 'sawtooth');

    // Turn dots red
    for (let i = 0; i < 8; i++) {
      const d = document.getElementById(`dot-${i}`);
      if (d) d.classList.add('error-dot');
    }

    // Shake panel
    const panel = document.querySelector('.lock-panel');
    if (panel) {
      panel.classList.add('shake');
      setTimeout(() => panel.classList.remove('shake'), 500);
    }

    setTimeout(() => {
      codeBuffer = '';
      updateDots();
      setLockMsg('', '');
    }, 900);
  }
}

// Numpad event listeners
document.querySelectorAll('.np-btn[data-digit]').forEach(btn => {
  btn.addEventListener('click', () => lockPressDigit(btn.dataset.digit));
});
document.getElementById('np-clear').addEventListener('click', lockClear);
document.getElementById('np-enter').addEventListener('click', () => {
  if (codeBuffer.length === 8) checkCode();
});


// ════════════════════════════════════════════════════════════
// PAGE 5 — GIFT BOXES
// ════════════════════════════════════════════════════════════

const openedGifts = new Set();
let giftsInitialised = false;

function initGifts() {
  if (giftsInitialised) return;
  giftsInitialised = true;

  // Add 3D tilt to each gift
  [1, 2, 3].forEach(n => {
    const box = document.getElementById(`gift-${n}`);
    if (!box) return;

    box.addEventListener('mousemove', (e) => {
      const r = box.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(`#gift-inner-${n}`, {
        rotateX: -y * 22,
        rotateY:  x * 22,
        duration: 0.2,
        ease: 'power2.out',
        transformPerspective: 700
      });
    });

    box.addEventListener('mouseleave', () => {
      gsap.to(`#gift-inner-${n}`, {
        rotateX: 0, rotateY: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.45)'
      });
    });

    // Entrance animation
    gsap.fromTo(`#gift-${n}`,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.75, delay: (n - 1) * 0.2, ease: 'back.out(1.6)' }
    );
  });
}

function openGift(n) {
  if (openedGifts.has(n)) return;
  openedGifts.add(n);

  const lid    = document.getElementById(`gift-lid-${n}`);
  const reveal = document.getElementById(`gift-reveal-${n}`);
  const openBtn = document.getElementById(`gift-open-${n}`);

  lid.classList.add('lid-open');
  playTone(500, 0.05); setTimeout(() => playTone(700, 0.06), 160);

  gsap.to(`#gift-${n}`, {
    y: -16, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut',
    onComplete: () => {
      reveal.classList.add('revealed');
      openBtn.classList.add('hidden');

      // Spawn confetti burst from this gift
      const rect = document.getElementById(`gift-${n}`).getBoundingClientRect();
      confetti({
        particleCount: 60, spread: 65, startVelocity: 28,
        origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: rect.top / window.innerHeight },
        colors: ['#FFDAB9','#FFB347','#FF8C69','#FFD700','#FF69B4']
      });

      // Check if all opened
      if (openedGifts.size === 3) {
        const nextBtn = document.getElementById('btn-gifts-next');
        gsap.to(nextBtn, { opacity: 1, duration: 0.6, delay: 0.3 });
        nextBtn.style.pointerEvents = 'all';
      }
    }
  });
}

function closeGiftAttempt() {
  showAngryCharacter();
}

// Wire gift buttons
[1, 2, 3].forEach(n => {
  document.getElementById(`gift-open-${n}`)?.addEventListener('click', () => openGift(n));
  document.getElementById(`gift-close-${n}`)?.addEventListener('click', () => closeGiftAttempt());
});

document.getElementById('btn-gifts-next').addEventListener('click', () => goTo(5));


// ════════════════════════════════════════════════════════════
// ANGRY CHARACTER
// ════════════════════════════════════════════════════════════

let angryCooldown = false;

function showAngryCharacter() {
  if (angryCooldown) return;
  angryCooldown = true;

  const backdrop = document.getElementById('angry-backdrop');
  const card = document.getElementById('angry-card');

  backdrop.classList.add('show');

  // Pop in
  gsap.fromTo(card,
    { scale: 0, opacity: 0, rotate: -12 },
    { scale: 1, opacity: 1, rotate: 0, duration: 0.55, ease: 'back.out(1.8)',
      onComplete: spawnAngerSparks
    }
  );

  // Shake after 0.6s
  setTimeout(() => {
    gsap.to(card, {
      x: 12, duration: 0.09, repeat: 10, yoyo: true, ease: 'power1.inOut'
    });
  }, 650);

  // Play angry tone
  playTone(150, 0.12, 'sawtooth');
  setTimeout(() => playTone(120, 0.10, 'sawtooth'), 200);

  // Auto-dismiss after 3.2s
  setTimeout(hideAngryCharacter, 3200);
}

function hideAngryCharacter() {
  const backdrop = document.getElementById('angry-backdrop');
  const card = document.getElementById('angry-card');

  gsap.to(card, {
    scale: 0, opacity: 0, y: 40, rotate: 10,
    duration: 0.4, ease: 'back.in(1.8)',
    onComplete: () => {
      backdrop.classList.remove('show');
      gsap.set(card, { y: 0, rotate: 0 });
      angryCooldown = false;
    }
  });
}

function spawnAngerSparks() {
  const container = document.getElementById('anger-sparks');
  if (!container) return;
  container.innerHTML = '';

  for (let i = 0; i < 10; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    const angle = (i / 10) * 360;
    const dist  = Math.random() * 100 + 50;
    const rad   = angle * Math.PI / 180;
    s.style.cssText = `
      top: 50%; left: 50%;
      transform-origin: center;
      transform: translate(-50%, -50%) rotate(${angle}deg);
      animation-duration: ${Math.random() * 0.5 + 0.4}s;
      animation-delay: ${Math.random() * 0.2}s;
      opacity: 0;
    `;
    container.appendChild(s);
    gsap.to(s, {
      x: Math.cos(rad) * dist,
      y: Math.sin(rad) * dist,
      opacity: 0,
      duration: Math.random() * 0.5 + 0.4,
      delay: Math.random() * 0.2,
      ease: 'power2.out'
    });
  }
}

// Click backdrop to dismiss
document.getElementById('angry-backdrop').addEventListener('click', e => {
  if (e.target === e.currentTarget) hideAngryCharacter();
});


// ════════════════════════════════════════════════════════════
// PAGE 6 — SLIDESHOW
// ════════════════════════════════════════════════════════════

const SS_QUOTES = [
  '"Every moment with you is a treasure 💕"',
  '"Your smile lights up the whole world 🌟"',
  '"So grateful for every memory we share 🌸"',
  '"You make every day feel magical ✨"',
  '"Wishing you a lifetime of happiness 🎂"'
];

const SS_DURATION = 5500; // ms per slide
let ssIndex   = 0;
let ssPlaying = true;
let ssStart   = 0;
let ssRafId   = null;
let ssTotal   = 0;

function initSlideshow() {
  const slides = document.querySelectorAll('.slide');
  ssTotal = slides.length;
  ssIndex = 0;
  ssPlaying = true;

  goSlide(0);
  startSsTimer();
}

function goSlide(idx, dir) {
  const slides = document.querySelectorAll('.slide');
  slides[ssIndex].classList.remove('slide-active');
  ssIndex = ((idx % ssTotal) + ssTotal) % ssTotal;

  const next = slides[ssIndex];
  next.classList.add('slide-active');

  // Quote transition
  const quoteEl = document.getElementById('ss-quote');
  gsap.to(quoteEl, {
    opacity: 0, y: -18, duration: 0.4,
    onComplete: () => {
      quoteEl.textContent = SS_QUOTES[ssIndex] || SS_QUOTES[0];
      gsap.fromTo(quoteEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
    }
  });

  // Counter
  const counter = document.getElementById('ss-counter');
  if (counter) counter.textContent = `${ssIndex + 1} / ${ssTotal}`;
}

function startSsTimer() {
  if (ssRafId) cancelAnimationFrame(ssRafId);
  ssStart = performance.now();

  function tick(now) {
    if (!ssPlaying) return;
    const elapsed = now - ssStart;
    const pct = Math.min((elapsed / SS_DURATION) * 100, 100);
    const pb = document.getElementById('ss-progress-bar');
    if (pb) pb.style.width = pct + '%';

    if (elapsed >= SS_DURATION) {
      ssStart = now;
      pb.style.width = '0%';

      if (ssIndex === ssTotal - 1) {
        showEndCard();
        return;
      }
      goSlide(ssIndex + 1);
    }
    ssRafId = requestAnimationFrame(tick);
  }
  ssRafId = requestAnimationFrame(tick);
}

function showEndCard() {
  ssPlaying = false;
  if (ssRafId) cancelAnimationFrame(ssRafId);

  const ec = document.getElementById('end-card');
  ec.classList.add('show');

  // Triple confetti blasts
  setTimeout(() => confettiBlast(), 300);
  setTimeout(() => confettiBlast(), 1500);
  setTimeout(() => confettiBlast(), 3000);
}

function confettiBlast() {
  const peachColors = ['#FFDAB9','#FFB347','#FF8C69','#FFD700','#FF69B4','#FFA07A'];
  confetti({
    particleCount: 120, spread: 75,
    origin: { y: 0.58 },
    colors: peachColors
  });
  setTimeout(() => {
    confetti({ particleCount: 70, angle: 55,  spread: 60, origin: { x: 0 }, colors: peachColors });
    confetti({ particleCount: 70, angle: 125, spread: 60, origin: { x: 1 }, colors: peachColors });
  }, 250);
}

// Controls
document.getElementById('ss-prev').addEventListener('click', () => {
  goSlide(ssIndex - 1);
  ssStart = performance.now();
  document.getElementById('ss-progress-bar').style.width = '0%';
  if (ssPlaying) startSsTimer();
});

document.getElementById('ss-next').addEventListener('click', () => {
  if (ssIndex === ssTotal - 1) { showEndCard(); return; }
  goSlide(ssIndex + 1);
  ssStart = performance.now();
  document.getElementById('ss-progress-bar').style.width = '0%';
  if (ssPlaying) startSsTimer();
});

document.getElementById('ss-play').addEventListener('click', () => {
  ssPlaying = !ssPlaying;
  document.getElementById('ss-play').textContent = ssPlaying ? '⏸' : '▶';
  if (ssPlaying) { ssStart = performance.now(); startSsTimer(); }
  else if (ssRafId) cancelAnimationFrame(ssRafId);
});


// ════════════════════════════════════════════════════════════
// WEB AUDIO TONES
// ════════════════════════════════════════════════════════════

let audioCtx = null;

function getAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq = 440, vol = 0.06, type = 'sine') {
  try {
    const ctx  = getAudio();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (_) { /* silently ignore audio errors */ }
}


// ════════════════════════════════════════════════════════════
// BOOTSTRAP
// ════════════════════════════════════════════════════════════

window.addEventListener('load', () => {
  // Ensure first page is visible, then fade in
  const firstPage = document.getElementById(PAGE_IDS[0]);
  firstPage.classList.add('active');

  gsap.fromTo(firstPage,
    { opacity: 0, scale: 1.06 },
    { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out',
      onComplete: () => initEnvelope()
    }
  );
});
