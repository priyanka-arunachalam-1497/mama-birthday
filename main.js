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
    'rgba(255,183,197,.55)', 'rgba(255,160,185,.50)',
    'rgba(244,130,154,.40)', 'rgba(255,218,230,.45)',
    'rgba(255,192,210,.35)'
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
document.getElementById('envelope-wrapper')?.addEventListener('click', openEnvelope);


// ════════════════════════════════════════════════════════════
// PAGE 2 — BLOOMING PEACH ROSE
// ════════════════════════════════════════════════════════════

let petalRafId = null;
let petalParticles = [];
let heartInterval = null;

function initFlowers() {
  const page = document.getElementById('page-flowers');
  if (page) {
    page.classList.remove('not-loaded');
    const flowersContainer = page.querySelector('.flowers');
    if (flowersContainer) {
      const clone = flowersContainer.cloneNode(true);
      flowersContainer.parentNode.replaceChild(clone, flowersContainer);
    }
  }

  // Reset surprise text
  const surprise = document.getElementById('bloom-surprise');
  if (surprise) {
    gsap.set(surprise, { opacity: 0, scale: 0.85, willChange: 'transform, opacity' });
  }

  // 1. "A small gift for my love" — appears after flowers fully bloom (~4.5s)
  gsap.fromTo('#bloom-surprise',
    { opacity: 0, scale: 0.85 },
    {
      opacity: 1, scale: 1,
      duration: 1.2,
      delay: 4.5,
      ease: 'back.out(1.6)',
      onStart: () => {
        if (surprise) surprise.style.willChange = 'transform, opacity';
      },
      onComplete: () => {
        if (surprise) surprise.style.willChange = 'auto';
      }
    }
  );

  // 2. Continue button entrance (after surprise text settles)
  const nextBtn = document.getElementById('btn-flowers-next');
  if (nextBtn) {
    gsap.set(nextBtn, { willChange: 'transform, opacity' });
    gsap.to(nextBtn, {
      opacity: 1, y: 0,
      duration: 0.75,
      delay: 5.8,
      ease: 'power2.out',
      onComplete: () => {
        nextBtn.style.pointerEvents = 'all';
        nextBtn.style.willChange = 'auto';
      }
    });
  }

  // Start canvas petal shower (keeps falling gently)
  startPetalsCanvas();

  // Float hearts repeatedly
  if (heartInterval) clearInterval(heartInterval);
  floatHeartsBatch();
  heartInterval = setInterval(floatHeartsBatch, 3500);

  playTone(480, 0.06, 'sine');
}

function startPetalsCanvas() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  petalParticles = [];

  const colors = ['#FFB7C5','#FFDDE6','#F4829A','#FFC8D8','#FADADD','#E8608A','#FFB0C8'];

  function newPetal() {
    return {
      x: Math.random() * canvas.width,
      y: -18,
      vx: (Math.random() - 0.5) * 1.2,
      vy: Math.random() * 1.8 + 0.8,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 3.5,
      sz: Math.random() * 11 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.4 + 0.3,
      sway: Math.random() * 1.5,
      swayS: Math.random() * 0.02,
      swayO: Math.random() * Math.PI * 2,
    };
  }

  for (let i = 0; i < 40; i++) {
    setTimeout(() => { petalParticles.push(newPetal()); }, i * 160);
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

  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'heart-float';
      h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const dur = Math.random() * 3.5 + 4;
      const sz  = Math.random() * 1.3 + 0.8;
      h.style.cssText = `
        left:${Math.random() * 96}%;
        bottom:${Math.random() * 10}%;
        font-size:${sz}rem;
        animation-duration:${dur}s;
        animation-delay:${Math.random() * 1}s;
      `;
      layer.appendChild(h);
      h.addEventListener('animationend', () => h.remove());
    }, i * 250);
  }
}

document.getElementById('btn-flowers-next').addEventListener('click', () => {
  stopPetals();
  goTo(2);
});


// ════════════════════════════════════════════════════════════
// PAGE 3 — MEMORY LANE (STORY STYLE)
// ════════════════════════════════════════════════════════════

const STORIES = [
  { img: 'image1.png'   },
  { img: 'image2.jpeg'  },
  { img: 'image3.jpeg'  },
  { img: 'image4.jpeg'  },
  { img: 'image5.jpeg'  },
  { img: 'image6.jpeg'  },
  { img: 'image7.jpeg'  },
  { img: 'image8.jpeg'  },
  { img: 'image9.jpeg'  },
  { img: 'image10.jpeg' },
  { img: 'image11.jpeg' },
  { img: 'image12.jpeg' },
  { img: 'image13.jpeg' },
];

let storyIndex = 0;
let storyTimer = null;
const STORY_DURATION = 4200; // 4.2 seconds per image

function initGallery() {
  storyIndex = 0;
  setupStoryProgressBars();
  showStorySlide(0);
}

function setupStoryProgressBars() {
  const container = document.getElementById('story-progress');
  if (!container) return;
  container.innerHTML = '';

  for (let i = 0; i < STORIES.length; i++) {
    const bar = document.createElement('div');
    bar.className = 'story-progress-bar';
    const fill = document.createElement('div');
    fill.className = 'story-progress-fill';
    fill.id = `story-fill-${i}`;
    bar.appendChild(fill);
    container.appendChild(bar);
  }
}

function showStorySlide(idx) {
  if (idx < 0) idx = 0;
  if (idx >= STORIES.length) {
    // Gallery finished! Move to lock screen
    clearTimeout(storyTimer);
    goTo(3);
    return;
  }

  storyIndex = idx;

  // Setup photo transition
  const img = document.getElementById('story-img');
  const blurBg = document.getElementById('story-blur-bg');

  // Cancel existing animation/timer
  clearTimeout(storyTimer);

  // Set image source and blur background simultaneously
  const imgSrc = STORIES[storyIndex].img;
  img.src = imgSrc;
  if (blurBg) blurBg.style.backgroundImage = `url('${imgSrc}')`;

  // Set story fill percentages for progress bar
  for (let i = 0; i < STORIES.length; i++) {
    const fill = document.getElementById(`story-fill-${i}`);
    if (!fill) continue;
    gsap.killTweensOf(fill);
    if (i < storyIndex) {
      fill.style.width = '100%';
    } else if (i > storyIndex) {
      fill.style.width = '0%';
    } else {
      fill.style.width = '0%';
      // Animate current active progress bar
      gsap.to(fill, {
        width: '100%',
        duration: STORY_DURATION / 1000,
        ease: 'none'
      });
    }
  }

  // Choose dynamic transitions depending on index
  let from = {};
  const mod = storyIndex % 9;
  switch (mod) {
    case 0: from = { opacity: 0, scale: 1.05 };                      break;
    case 1: from = { xPercent: 100, opacity: 0.8, scale: 1 };        break;
    case 2: from = { scale: 0.3, opacity: 0 };                       break;
    case 3: from = { rotationY: 90, opacity: 0, scale: 0.9 };        break;
    case 4: from = { filter: 'blur(22px)', opacity: 0.4, scale: 1 }; break;
    case 5: from = { yPercent: 60, opacity: 0, scale: 1 };           break;
    case 6: from = { rotate: 15, scale: 0.5, opacity: 0 };           break;
    case 7: from = { scale: 0.2, opacity: 0 };                       break;
    case 8: from = { scale: 1.2, opacity: 0 };                       break;
  }

  // Execute transition
  const ease = mod === 7 ? 'back.out(1.6)' : 'power2.out';
  gsap.fromTo(img, from, {
    xPercent: 0, yPercent: 0, scale: 1, rotationY: 0, rotate: 0,
    filter: 'blur(0px)', opacity: 1,
    duration: 0.75,
    ease: ease,
    clearProps: 'all'
  });

  // Play touch tone
  playTone(520 + (storyIndex * 30), 0.04, 'sine');

  // Trigger next story slide on timeout
  storyTimer = setTimeout(() => {
    showStorySlide(storyIndex + 1);
  }, STORY_DURATION);
}

// Left and right tap actions
document.getElementById('story-tap-left')?.addEventListener('click', () => {
  if (storyIndex > 0) {
    showStorySlide(storyIndex - 1);
  }
});

document.getElementById('story-tap-right')?.addEventListener('click', () => {
  showStorySlide(storyIndex + 1);
});



// ════════════════════════════════════════════════════════════
// PAGE 4 — LOCK SCREEN
// ════════════════════════════════════════════════════════════

// ⭐ CHANGE THIS to the actual 8-digit birthday code
const CORRECT_CODE = '23071995';

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

// Map of gift number → fullscreen photo src (empty = no fullscreen)
const GIFT_PHOTOS = { 2: 'gift2.png' };

function openGift(n) {
  if (openedGifts.has(n)) return;
  openedGifts.add(n);

  const lid     = document.getElementById(`gift-lid-${n}`);
  const reveal  = document.getElementById(`gift-reveal-${n}`);
  const openBtn = document.getElementById(`gift-open-${n}`);

  lid.classList.add('lid-open');
  playTone(500, 0.05); setTimeout(() => playTone(700, 0.06), 160);

  gsap.to(`#gift-${n}`, {
    y: -16, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut',
    onComplete: () => {
      openBtn.classList.add('hidden');

      // Spawn confetti burst from this gift
      const rect = document.getElementById(`gift-${n}`).getBoundingClientRect();
      confetti({
        particleCount: 60, spread: 65, startVelocity: 28,
        origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: rect.top / window.innerHeight },
        colors: ['#FFDAB9','#FFB347','#FF8C69','#FFD700','#FF69B4']
      });

      // Show fullscreen photo if this gift has one, otherwise show in-box reveal
      if (GIFT_PHOTOS[n]) {
        setTimeout(() => showGiftPhoto(GIFT_PHOTOS[n]), 300);
      } else {
        reveal.classList.add('revealed');
      }

      // Check if all opened
      if (openedGifts.size === 3) {
        const nextBtn = document.getElementById('btn-gifts-next');
        gsap.to(nextBtn, { opacity: 1, duration: 0.6, delay: 0.3 });
        nextBtn.style.pointerEvents = 'all';
      }
    }
  });
}

function showGiftPhoto(src) {
  const overlay = document.getElementById('gift-photo-overlay');
  const img     = document.getElementById('gift-photo-img');
  const blurBg  = document.getElementById('gift-photo-blur-bg');

  img.src = src;
  blurBg.style.backgroundImage = `url('${src}')`;
  overlay.classList.add('active');
}

function closeGiftPhoto() {
  const overlay = document.getElementById('gift-photo-overlay');
  overlay.classList.remove('active');
  // Clear src after fade out
  setTimeout(() => {
    document.getElementById('gift-photo-img').src = '';
    document.getElementById('gift-photo-blur-bg').style.backgroundImage = '';
  }, 450);
}

// Close overlay on backdrop click or close button
document.getElementById('gift-photo-overlay').addEventListener('click', e => {
  if (e.target !== document.getElementById('gift-photo-close') &&
      e.target !== document.getElementById('gift-photo-img')) {
    closeGiftPhoto();
  }
});
document.getElementById('gift-photo-close').addEventListener('click', closeGiftPhoto);

function closeGiftAttempt() {
  showAngryCharacter();
}

// Wire gift buttons
[1, 2, 3].forEach(n => {
  document.getElementById(`gift-open-${n}`)?.addEventListener('click', () => openGift(n));
  document.getElementById(`gift-refuse-${n}`)?.addEventListener('click', () => closeGiftAttempt());
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
// PAGE 6 — FINAL SURPRISE
// ════════════════════════════════════════════════════════════

let voiceInterval = null;
let floatingWordsInterval = null;
let voiceInitialised = false;
let finalSlideInterval = null;

// Photos for the polaroid slideshow on the final page
const FINAL_PHOTOS = [
  'f1.jpeg','f2.jpeg','f3.jpeg','f4.jpeg','f5.jpeg','f6.jpeg',
  'f7.jpeg','f8.jpeg','f9.jpeg','f10.jpeg','f11.jpeg'
];

function startFinalSlideshow() {
  if (finalSlideInterval) clearInterval(finalSlideInterval);

  const imgA = document.getElementById('final-photo-a');
  const imgB = document.getElementById('final-photo-b');
  if (!imgA || !imgB) return;

  let idx = 0;            // currently visible index
  let useA = true;        // which img is currently "on top"

  // Preload all images silently
  FINAL_PHOTOS.forEach(src => { const i = new Image(); i.src = src; });

  // Set first photo
  imgA.src = FINAL_PHOTOS[0];
  imgA.classList.add('active');
  imgB.classList.remove('active');

  finalSlideInterval = setInterval(() => {
    idx = (idx + 1) % FINAL_PHOTOS.length;
    const nextSrc = FINAL_PHOTOS[idx];

    if (useA) {
      // B becomes next photo → fade B in, fade A out
      imgB.src = nextSrc;
      imgB.classList.add('active');
      imgA.classList.remove('active');
    } else {
      // A becomes next photo → fade A in, fade B out
      imgA.src = nextSrc;
      imgA.classList.add('active');
      imgB.classList.remove('active');
    }
    useA = !useA;
  }, 2500); // change every 2.5 seconds
}

function initSlideshow() {
  if (voiceInitialised) return;
  voiceInitialised = true;

  // Start polaroid photo cycling immediately
  startFinalSlideshow();

  const audio = document.getElementById('voice-audio');
  const heartBtn = document.getElementById('heart-btn');
  const fill = document.getElementById('voice-progress-fill');
  const time = document.getElementById('voice-time');
  const capsule = document.getElementById('capsule-msg');
  const container = document.getElementById('iloveyou-container');

  if (!audio) return;

  // Click heart button to play/pause
  heartBtn.addEventListener('click', () => {
    if (audio.paused && !window.isSynthPlaying) {
      audio.play().then(() => {
        heartBtn.classList.add('playing');
        capsule.classList.add('pulse-active');
        startFloatingILoveYou();
      }).catch(err => {
        console.warn('voice.mp3 not found or blocked, running romantic melody fallback!', err);
        playFallbackVoiceMelody();
      });
    } else if (!audio.paused) {
      audio.pause();
      heartBtn.classList.remove('playing');
      capsule.classList.remove('pulse-active');
      stopFloatingILoveYou();
    }
  });

  // Track progress bar & time
  audio.addEventListener('timeupdate', () => {
    const pct = (audio.currentTime / audio.duration) * 100 || 0;
    if (fill) fill.style.width = pct + '%';

    // Format time
    const cur = formatTime(audio.currentTime);
    const tot = isNaN(audio.duration) ? '0:00' : formatTime(audio.duration);
    if (time) time.textContent = `${cur} / ${tot}`;
  });

  // When audio finishes
  audio.addEventListener('ended', () => {
    heartBtn.classList.remove('playing');
    capsule.classList.remove('pulse-active');
    stopFloatingILoveYou();
    showFinalWish();
  });
}

function playFallbackVoiceMelody() {
  if (window.isSynthPlaying) return;
  window.isSynthPlaying = true;

  const heartBtn = document.getElementById('heart-btn');
  const fill = document.getElementById('voice-progress-fill');
  const time = document.getElementById('voice-time');
  const capsule = document.getElementById('capsule-msg');

  heartBtn.classList.add('playing');
  capsule.classList.add('pulse-active');
  startFloatingILoveYou();

  const totalDuration = 8.0; // 8 seconds fallback
  const startTime = performance.now();

  // Romantic chord notes (freqs)
  const notes = [523.25, 659.25, 783.99, 880.00, 1046.50, 880.00, 783.99, 659.25];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      if (window.isSynthPlaying) playTone(freq, 0.08, 'sine');
    }, idx * 950);
  });

  const timer = setInterval(() => {
    const elapsed = (performance.now() - startTime) / 1000;
    const pct = Math.min((elapsed / totalDuration) * 100, 100);
    if (fill) fill.style.width = pct + '%';
    if (time) time.textContent = `${formatTime(elapsed)} / 0:08`;

    if (elapsed >= totalDuration) {
      clearInterval(timer);
      window.isSynthPlaying = false;
      heartBtn.classList.remove('playing');
      capsule.classList.remove('pulse-active');
      stopFloatingILoveYou();
      showFinalWish();
    }
  }, 100);
}

function startFloatingILoveYou() {
  if (floatingWordsInterval) clearInterval(floatingWordsInterval);
  spawnFloatingWord();
  floatingWordsInterval = setInterval(spawnFloatingWord, 700);
}

function stopFloatingILoveYou() {
  if (floatingWordsInterval) {
    clearInterval(floatingWordsInterval);
    floatingWordsInterval = null;
  }
}

function spawnFloatingWord() {
  const container = document.getElementById('iloveyou-container');
  if (!container) return;

  const words = ['I Love You 💕', 'Love You ✨', 'Always 💖', 'Forever 💕', 'My Love 💕', 'Sweetheart 🌸', 'My dear Love 💞'];
  const el = document.createElement('div');
  el.className = 'iloveyou-float';
  el.textContent = words[Math.floor(Math.random() * words.length)];

  // Random size, sway, delay and duration
  const x = Math.random() * 80 + 10; // 10% - 90%
  const size = Math.random() * 0.9 + 1.1; // 1.1rem - 2.0rem
  const duration = Math.random() * 2.5 + 2.5; // 2.5s - 5.0s

  el.style.left = x + '%';
  el.style.fontSize = size + 'rem';
  el.style.animationDuration = duration + 's';
  el.style.bottom = '0%';

  container.appendChild(el);

  // Auto remove
  el.addEventListener('animationend', () => el.remove());
}

function showFinalWish() {
  const wish = document.getElementById('end-card');
  if (!wish) return;

  wish.classList.add('show');
  gsap.fromTo(wish,
    { opacity: 0, scale: 0.96 },
    { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }
  );

  // Celebration Confetti blasts!
  triggerCelebrationConfetti();
}

function triggerCelebrationConfetti() {
  const colors = ['#FFC0D4', '#F4829A', '#E05C7A', '#FFD700', '#FFB7C5'];
  confetti({
    particleCount: 140, spread: 80,
    origin: { y: 0.58 },
    colors: colors
  });
  
  // Staggered sides explosion
  setTimeout(() => {
    confetti({ particleCount: 80, angle: 60,  spread: 55, origin: { x: 0 }, colors: colors });
    confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
  }, 350);

  setTimeout(() => {
    confetti({ particleCount: 50, angle: 90, spread: 100, origin: { y: 0.7 }, colors: colors });
  }, 750);
}


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
// GLOBAL SAKURA (PEACH BLOSSOM) FALLING ANIMATION
// ════════════════════════════════════════════════════════════

const SAKURA_COUNT = 18; // Gentle, not too many

function createSakuraPetal() {
  const overlay = document.getElementById('sakura-overlay');
  if (!overlay) return null;

  const el = document.createElement('div');
  el.className = 'sakura-petal';

  // Simple oval petal sizes — like the reference image
  const w = Math.random() * 10 + 8;   // 8–18px wide
  const h = w * (Math.random() * 0.5 + 1.5); // 1.5–2x taller (elongated oval)
  el.style.width  = w + 'px';
  el.style.height = h + 'px';

  // Random start position across full width
  const startX = Math.random() * 100;

  // Gentle sway — small horizontal drift like reference image
  const swayDir = Math.random() > 0.5 ? 1 : -1;
  const swayAmt = (Math.random() * 60 + 20) * swayDir;  // 20–80px drift
  const spinDeg = (Math.random() * 120 + 60) * swayDir; // 60–180deg rotation
  const startRot = Math.random() * 360;                  // random start angle
  const duration = Math.random() * 8 + 8;               // 8–16s — slow & peaceful
  const delay    = Math.random() * 16;                   // spread across time

  el.style.left = startX + 'vw';
  el.style.setProperty('--sway', swayAmt + 'px');
  el.style.setProperty('--spin', spinDeg + 'deg');
  el.style.setProperty('--start-rot', startRot + 'deg');
  el.style.animationDuration = duration + 's';
  el.style.animationDelay = '-' + delay + 's'; // already in flight
  el.style.opacity = (Math.random() * 0.25 + 0.45).toString(); // 0.45–0.70

  overlay.appendChild(el);
  return el;
}

function initSakuraOverlay() {
  for (let i = 0; i < SAKURA_COUNT; i++) {
    createSakuraPetal();
  }
}


// ════════════════════════════════════════════════════════════
// BOOTSTRAP
// ════════════════════════════════════════════════════════════

window.addEventListener('load', () => {
  // Start global sakura falling animation immediately
  initSakuraOverlay();

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
