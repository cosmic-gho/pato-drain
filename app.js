/* =============================================
   DanGo Airdrop — app.js
   ============================================= */

'use strict';

// =============================================
// 1. BACKGROUND PARTICLE CANVAS
// =============================================
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H, raf;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle() {
    return {
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      r: randomBetween(0.5, 2),
      vx: randomBetween(-0.15, 0.15),
      vy: randomBetween(-0.2, -0.05),
      alpha: randomBetween(0.2, 0.7),
      color: ['#7c3aed','#06b6d4','#34d399','#f472b6'][Math.floor(Math.random() * 4)]
    };
  }

  function initParticles() {
    const count = Math.min(Math.floor(W * H / 14000), 120);
    particles = Array.from({ length: count }, createParticle);
  }

  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${0.12 * (1 - dist / maxDist)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = H + 10; p.x = randomBetween(0, W); }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });
    raf = requestAnimationFrame(loop);
  }

  resize();
  initParticles();
  loop();
  window.addEventListener('resize', () => { resize(); initParticles(); });
})();

// =============================================
// 2. NAVBAR SCROLL EFFECT
// =============================================
(function initNavbar() {
  const nav = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
})();

// =============================================
// 3. COUNTDOWN TIMER
// =============================================
(function initCountdown() {
  // Set airdrop end: 14 days from now
  const end = new Date();
  end.setDate(end.getDate() + 14);
  end.setHours(23, 59, 59, 0);

  const dEl = document.getElementById('days');
  const hEl = document.getElementById('hours');
  const mEl = document.getElementById('minutes');
  const sEl = document.getElementById('seconds');

  function pad(n) { return String(n).padStart(2, '0'); }
  function animateFlip(el, newVal) {
    if (el.textContent !== newVal) {
      el.style.transform = 'translateY(-6px)';
      el.style.opacity = '0.5';
      setTimeout(() => {
        el.textContent = newVal;
        el.style.transform = '';
        el.style.opacity = '';
      }, 200);
    }
  }

  function tick() {
    const now  = Date.now();
    const diff = Math.max(0, end - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  /   60000);
    const s = Math.floor((diff % 60000)    /    1000);
    animateFlip(dEl, pad(d));
    animateFlip(hEl, pad(h));
    animateFlip(mEl, pad(m));
    animateFlip(sEl, pad(s));
  }

  // Style transitions for the countdown values
  [dEl, hEl, mEl, sEl].forEach(el => {
    el.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
  });

  tick();
  setInterval(tick, 1000);
})();

// =============================================
// 4. ANIMATED COUNTER — Hero Stats
// =============================================
(function initCounters() {
  function animateNumber(el, from, to, duration, suffix = '') {
    const start = performance.now();
    function update(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(from + (to - from) * ease).toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const claimedEl = document.getElementById('stat-claimed');
  let ran = false;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !ran) {
        ran = true;
        animateNumber(claimedEl, 0, 3650000, 2200, '');
        claimedEl.textContent = '3,650,000';
        obs.disconnect();
      }
    });
  }, { threshold: 0.4 });
  obs.observe(claimedEl);
})();

// =============================================
// 5. TOKENOMICS DONUT CHART
// =============================================
(function initDonutChart() {
  const canvas = document.getElementById('donut-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const slices = [
    { label: 'Airdrop',           pct: 0.05, color: '#7c3aed' },
    { label: 'Community',         pct: 0.30, color: '#06b6d4' },
    { label: 'Ecosystem',         pct: 0.25, color: '#10b981' },
    { label: 'Team & Advisors',   pct: 0.15, color: '#f59e0b' },
    { label: 'Reserve & Treasury',pct: 0.25, color: '#ec4899' },
  ];

  const cx = 160, cy = 160, outerR = 140, innerR = 90;
  let animPct = 0;
  let hovered = -1;
  let currentPct = 0;
  let raf;

  function drawChart(progress) {
    ctx.clearRect(0, 0, 320, 320);
    let angle = -Math.PI / 2;
    const gap = 0.03;

    slices.forEach((s, i) => {
      const sweep = (s.pct * progress) * 2 * Math.PI;
      if (sweep <= 0) return;
      const isHov = hovered === i;
      const offset = isHov ? 8 : 0;
      const midAngle = angle + sweep / 2;
      const ox = isHov ? Math.cos(midAngle) * offset : 0;
      const oy = isHov ? Math.sin(midAngle) * offset : 0;

      ctx.beginPath();
      ctx.moveTo(cx + ox, cy + oy);
      ctx.arc(cx + ox, cy + oy, outerR + (isHov ? 6 : 0), angle + gap / 2, angle + sweep - gap / 2);
      ctx.arc(cx + ox, cy + oy, innerR, angle + sweep - gap / 2, angle + gap / 2, true);
      ctx.closePath();

      // Shadow glow for hovered
      if (isHov) {
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 24;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      angle += sweep;
    });

    // Center circle overlay
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 4, 0, Math.PI * 2);
    ctx.fillStyle = '#050714';
    ctx.fill();
  }

  function animate(to) {
    cancelAnimationFrame(raf);
    const from = currentPct;
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / 1200, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      currentPct = from + (to - from) * ease;
      drawChart(currentPct);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
  }

  // Hover interaction
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (320 / rect.width);
    const my = (e.clientY - rect.top)  * (320 / rect.height);
    const dx = mx - cx, dy = my - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < innerR || dist > outerR + 10) { hovered = -1; drawChart(currentPct); return; }
    let angle = Math.atan2(dy, dx);
    if (angle < -Math.PI / 2) angle += 2 * Math.PI;
    angle += Math.PI / 2;
    let acc = 0;
    let found = -1;
    slices.forEach((s, i) => {
      const sweep = s.pct * currentPct * 2 * Math.PI;
      if (angle >= acc && angle < acc + sweep) found = i;
      acc += sweep;
    });
    if (found !== hovered) { hovered = found; drawChart(currentPct); }
  });
  canvas.addEventListener('mouseleave', () => { hovered = -1; drawChart(currentPct); });

  // Trigger animation on scroll
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animate(1); obs.disconnect(); }
  }, { threshold: 0.3 });
  obs.observe(canvas);

  drawChart(0);
})();

// =============================================
// 6. PROGRESS BAR ANIMATION
// =============================================
(function initProgressBar() {
  const fill = document.getElementById('progress-fill');
  const pctEl = document.getElementById('progress-pct');
  const target = 73;
  let ran = false;

  if (!fill) return;

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !ran) {
      ran = true;
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / 1800, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const cur = Math.round(target * ease);
        fill.style.width = cur + '%';
        pctEl.textContent = cur + '%';
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(fill);
})();

// =============================================
// 7. BREAKDOWN BAR ANIMATIONS
// =============================================
(function initBreakdownBars() {
  const fills = document.querySelectorAll('.breakdown-fill');
  let ran = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !ran) {
      ran = true;
      fills.forEach((el, i) => {
        const target = el.style.width;
        el.style.width = '0';
        setTimeout(() => { el.style.width = target; }, i * 120);
      });
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  if (fills[0]) obs.observe(fills[0]);
})();

// =============================================
// 8. SCROLL ANIMATIONS (Intersection Observer)
// =============================================
(function initScrollAnimations() {
  const targets = document.querySelectorAll(
    '.step-card, .tier-card, .faq-item, .progress-card, .token-breakdown, .claim-card'
  );
  targets.forEach((el, i) => {
    el.setAttribute('data-animate', '');
    el.setAttribute('data-delay', i % 4);
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => obs.observe(el));
})();

// =============================================
// 9. FAQ ACCORDION
// =============================================
(function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
      btn.setAttribute('aria-expanded', !isOpen);
    });
  });
})();

// =============================================
// 10. NETWORK SWITCHER
// =============================================
(function initNetworkSwitcher() {
  const btns = document.querySelectorAll('.network-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
})();

// =============================================
// 11. PASTE BUTTON
// =============================================
document.getElementById('paste-btn')?.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    const input = document.getElementById('wallet-input');
    input.value = text.trim();
    input.focus();
    showToast('Pasted from clipboard!', 'success');
  } catch {
    showToast('Clipboard access denied. Please paste manually.', 'error');
  }
});

// =============================================
// 12. CLAIM FLOW SIMULATION
// =============================================
(function initClaimFlow() {
  const stepWallet   = document.getElementById('step-wallet');
  const stepChecking = document.getElementById('step-checking');
  const stepResult   = document.getElementById('step-result');
  const checkBtn     = document.getElementById('check-btn');
  const walletInput  = document.getElementById('wallet-input');

  function showStep(step) {
    [stepWallet, stepChecking, stepResult].forEach(s => s.classList.remove('active'));
    step.classList.add('active');
  }

  // Simulated eligibility results
  const tiers = [
    { eligible: false },
    { eligible: true, tier: 'Bronze',  amount: 500,   bonus: '+50 referral bonus' },
    { eligible: true, tier: 'Silver',  amount: 1000,  bonus: '+100 referral bonus' },
    { eligible: true, tier: 'Gold',    amount: 2500,  bonus: '+250 referral bonus' },
    { eligible: true, tier: 'Diamond', amount: 5000,  bonus: '+500 referral bonus' },
  ];

  function isValidAddress(addr) {
    addr = addr.trim();
    // ETH hex address
    if (/^0x[a-fA-F0-9]{40}$/.test(addr)) return true;
    // ENS name
    if (/^[a-z0-9\-]+\.eth$/i.test(addr)) return true;
    // Solana base58 ~32–44 chars
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)) return true;
    return false;
  }

  checkBtn?.addEventListener('click', () => {
    const addr = walletInput.value.trim();
    if (!addr) { shakeInput(walletInput); showToast('Please enter a wallet address.', 'error'); return; }
    if (!isValidAddress(addr)) { shakeInput(walletInput); showToast('Invalid wallet address format.', 'error'); return; }

    showStep(stepChecking);
    runCheckAnimation(addr);
  });

  function runCheckAnimation(addr) {
    const bar = document.getElementById('check-bar');
    const sub = document.getElementById('check-sub-text');
    const messages = [
      'Scanning on-chain data…',
      'Checking NFT holdings…',
      'Verifying staking history…',
      'Calculating allocation…',
      'Almost done…',
    ];
    let pct = 0;
    let msgIdx = 0;
    const interval = setInterval(() => {
      pct = Math.min(pct + randomInt(8, 22), 100);
      bar.style.width = pct + '%';
      if (msgIdx < messages.length && pct > msgIdx * 22) {
        sub.textContent = messages[msgIdx++];
      }
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => showResult(addr), 500);
      }
    }, 320);
  }

  function showResult(addr) {
    // Deterministic result based on address sum (demo)
    const sum = addr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const pick = tiers[sum % tiers.length];

    if (!pick.eligible) {
      stepResult.innerHTML = buildIneligible();
    } else {
      stepResult.innerHTML = buildEligible(pick, addr);
    }
    showStep(stepResult);

    // Wire up buttons
    stepResult.querySelectorAll('.result-back').forEach(btn => {
      btn.addEventListener('click', () => { walletInput.value = ''; showStep(stepWallet); });
    });
    stepResult.querySelector('#final-claim-btn')?.addEventListener('click', () => {
      showToast('🎉 Claim submitted! Tokens will arrive within 24–48 hours.', 'success');
    });
  }

  function buildEligible(tier, addr) {
    const short = addr.slice(0, 6) + '…' + addr.slice(-4);
    return `
      <div class="result-eligible">
        <span class="result-icon">🎉</span>
        <div class="result-title">You're Eligible!</div>
        <p class="result-sub">Wallet <strong style="color:var(--purple-400);font-family:var(--font-mono)">${short}</strong> qualifies for the $DANGO airdrop.</p>
        <div class="result-amount-box">
          <span class="result-amount-label">Your Allocation</span>
          <span class="result-amount-val">${tier.amount.toLocaleString()} $DANGO</span>
        </div>
        <div class="result-tier">
          <span>Tier</span>
          <span class="result-tier-badge">${tier.tier}</span>
        </div>
        <div class="result-tier" style="margin-top:-8px">
          <span>Referral Bonus</span>
          <span style="color:var(--green-400);font-weight:700">${tier.bonus}</span>
        </div>
        <button class="btn-primary full" id="final-claim-btn">
          <span class="btn-glow"></span>
          Claim ${tier.amount.toLocaleString()} $DANGO
        </button>
        <button class="result-back">← Check Another Wallet</button>
      </div>`;
  }

  function buildIneligible() {
    return `
      <div class="result-ineligible">
        <span class="result-icon">😔</span>
        <div class="result-title">Not Eligible</div>
        <p class="result-sub">This wallet doesn't meet the current eligibility criteria for Phase 1.</p>
        <div class="ineligible-box">
          Your wallet may not hold a DanGo NFT, may be too new, or may have been excluded due to sybil detection. Check the eligibility tiers above to see what's required.
        </div>
        <button class="result-back">← Try Another Wallet</button>
      </div>`;
  }

  function shakeInput(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => el.style.animation = '', 400);
  }

  function randomInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

  // Inject shake keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();

// =============================================
// 13. SHARE BUTTONS
// =============================================
document.getElementById('share-twitter')?.addEventListener('click', () => {
  const text = encodeURIComponent('🎉 Just claimed my free $DANGO tokens in the @DanGoNFT airdrop! Grab yours before it ends 👉');
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank');
});
document.getElementById('share-discord')?.addEventListener('click', () => {
  showToast('Copied airdrop link! Share it in Discord 🎮', 'info');
  navigator.clipboard.writeText(window.location.href).catch(() => {});
});

// =============================================
// 14. TOAST NOTIFICATIONS
// =============================================
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.classList.remove('show'); }, 3600);
}
window.showToast = showToast;

// =============================================
// 15. SMOOTH REVEAL — Hero Section
// =============================================
(function initHeroReveal() {
  const elements = [
    '.hero-tag', '.hero-title', '.hero-subtitle',
    '.countdown-wrapper', '.hero-actions', '.hero-stats'
  ];
  elements.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.7s ease ${i * 0.12}s, transform 0.7s ease ${i * 0.12}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });

  // Hero visual
  const visual = document.querySelector('.hero-visual');
  if (visual) {
    visual.style.opacity = '0';
    visual.style.transition = 'opacity 1s ease 0.6s';
    requestAnimationFrame(() => requestAnimationFrame(() => { visual.style.opacity = '1'; }));
  }
})();

// =============================================
// 16. TOKEN 3D PAUSE ON HOVER
// =============================================
(function initTokenHover() {
  const token = document.querySelector('.token-3d');
  if (!token) return;
  token.addEventListener('mouseenter', () => { token.style.animationPlayState = 'paused'; });
  token.addEventListener('mouseleave', () => { token.style.animationPlayState = 'running'; });
})();

// =============================================
// 17. WALLET CONNECT MODAL
// =============================================
(function initWalletModal() {

  /* ── State ── */
  const overlay      = document.getElementById('wc-overlay');
  const modal        = document.getElementById('wc-modal');
  const closeBtn     = document.getElementById('wc-close');
  const backBtn      = document.getElementById('wc-back-btn');
  const copyUriBtn   = document.getElementById('wc-copy-uri');
  const proceedBtn   = document.getElementById('wc-proceed-btn');
  const disconnectBtn= document.getElementById('wc-disconnect');

  // All screens
  const screens = {
    list:       document.getElementById('wc-screen-list'),
    qr:         document.getElementById('wc-screen-qr'),
    connecting: document.getElementById('wc-screen-connecting'),
    connected:  document.getElementById('wc-screen-connected'),
  };

  let connectingTimer = null;

  /* ── Wallet meta ── */
  const WALLETS = {
    metamask:     { name: 'MetaMask',       network: 'Ethereum Mainnet', netSymbol: 'ETH', color: '#f6851b' },
    walletconnect:{ name: 'WalletConnect',  network: 'Ethereum Mainnet', netSymbol: 'ETH', color: '#3b99fc' },
    coinbase:     { name: 'Coinbase Wallet',network: 'Ethereum Mainnet', netSymbol: 'ETH', color: '#1652f0' },
    phantom:      { name: 'Phantom',        network: 'Solana Mainnet',   netSymbol: 'SOL', color: '#ab9ff2' },
    trust:        { name: 'Trust Wallet',   network: 'Ethereum Mainnet', netSymbol: 'ETH', color: '#3375bb' },
    okx:          { name: 'OKX Wallet',     network: 'Ethereum Mainnet', netSymbol: 'ETH', color: '#555' },
  };

  /* ── Helpers ── */
  function showScreen(key) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    if (screens[key]) screens[key].classList.add('active');
  }

  function openModal() {
    document.body.style.overflow = 'hidden';
    overlay.classList.add('open');
    showScreen('list');
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    clearTimeout(connectingTimer);
  }

  function randomHex(len) {
    return [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  function fakeAddress(wallet) {
    if (wallet === 'phantom') {
      // Solana-style base58
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      return [...Array(44)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
    return '0x' + randomHex(40);
  }

  function shortAddr(addr) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }

  function fakeBalance(symbol) {
    if (symbol === 'SOL') return (Math.random() * 30 + 0.5).toFixed(4) + ' SOL';
    return (Math.random() * 5 + 0.1).toFixed(4) + ' ETH';
  }

  const DANGO_TIERS = [500, 1000, 2500, 5000];
  function fakeDango() {
    return DANGO_TIERS[Math.floor(Math.random() * DANGO_TIERS.length)].toLocaleString() + ' $DANGO';
  }

  /* ── Open triggers ── */
  // All elements that should open the wallet modal
  function bindOpeners() {
    // Nav "Claim Now"
    document.getElementById('nav-claim-btn')?.addEventListener('click', openModal);
    // Mobile "Claim Now"
    document.getElementById('mobile-claim-btn')?.addEventListener('click', () => {
      document.getElementById('mobile-menu').classList.remove('open');
      openModal();
    });
    // Hero "Claim Airdrop"
    document.getElementById('hero-claim-btn')?.addEventListener('click', e => {
      e.preventDefault();
      openModal();
    });
  }

  /* ── Close ── */
  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── Back button (QR → list) ── */
  backBtn?.addEventListener('click', () => showScreen('list'));

  /* ── Wallet buttons → connecting flow ── */
  document.querySelectorAll('.wc-wallet-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const walletKey = btn.dataset.wallet;
      if (walletKey === 'walletconnect') {
        showQR();
        return;
      }
      startConnecting(walletKey);
    });
  });

  /* ── WalletConnect QR Screen ── */
  function showQR() {
    showScreen('qr');
    drawQR();
    // After 8s auto-simulate a connection via QR
    clearTimeout(connectingTimer);
    connectingTimer = setTimeout(() => startConnecting('walletconnect'), 8000);
  }

  /* ── Minimal QR Code Renderer (no lib needed) ── */
  function drawQR() {
    const canvas = document.getElementById('wc-qr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 220;
    const cellCount = 25;
    const cellSize = size / cellCount;

    // White bg
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Seeded pattern — deterministic enough to look like QR
    const seed = Date.now();
    function seededRand(i) {
      const x = Math.sin(i + seed * 0.001) * 43758.5453;
      return x - Math.floor(x);
    }

    // Finder patterns (3 corners)
    function drawFinder(ox, oy) {
      ctx.fillStyle = '#111827';
      ctx.fillRect(ox * cellSize, oy * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((ox + 1) * cellSize, (oy + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#111827';
      ctx.fillRect((ox + 2) * cellSize, (oy + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    }
    drawFinder(0, 0);
    drawFinder(cellCount - 7, 0);
    drawFinder(0, cellCount - 7);

    // Data modules
    for (let row = 0; row < cellCount; row++) {
      for (let col = 0; col < cellCount; col++) {
        // Skip finder pattern areas
        if ((row < 8 && col < 8) || (row < 8 && col > cellCount - 9) || (row > cellCount - 9 && col < 8)) continue;
        // Skip center (our logo goes here)
        const cx = cellCount / 2, cy = cellCount / 2;
        if (Math.abs(row - cy) < 4 && Math.abs(col - cx) < 4) continue;

        if (seededRand(row * cellCount + col) > 0.5) {
          ctx.fillStyle = '#111827';
          const r = cellSize * 0.12;
          const x = col * cellSize, y = row * cellSize, s = cellSize * 0.88;
          ctx.beginPath();
          ctx.moveTo(x + r, y); ctx.lineTo(x + s - r, y);
          ctx.quadraticCurveTo(x + s, y, x + s, y + r);
          ctx.lineTo(x + s, y + s - r);
          ctx.quadraticCurveTo(x + s, y + s, x + s - r, y + s);
          ctx.lineTo(x + r, y + s);
          ctx.quadraticCurveTo(x, y + s, x, y + s - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }

  /* ── Copy URI ── */
  copyUriBtn?.addEventListener('click', () => {
    const uri = document.getElementById('wc-uri-text')?.textContent || '';
    navigator.clipboard.writeText(uri).catch(() => {});
    const btn = copyUriBtn;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`; }, 2000);
    showToast('Connection URI copied!', 'success');
  });

  /* ── "Open directly" app pills ── */
  document.querySelectorAll('.wc-app-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      clearTimeout(connectingTimer);
      startConnecting('walletconnect');
    });
  });

  /* ── Connecting Screen ── */
  function startConnecting(walletKey) {
    const meta = WALLETS[walletKey] || WALLETS.metamask;
    clearTimeout(connectingTimer);

    // Update labels
    document.getElementById('wc-conn-label').textContent = `Connecting to ${meta.name}…`;
    document.getElementById('wc-conn-sub').textContent = 'Waiting for approval in your wallet';

    showScreen('connecting');

    // Simulate approval delay (2–4s)
    const delay = 2000 + Math.random() * 2000;
    connectingTimer = setTimeout(() => showConnected(walletKey, meta), delay);
  }

  /* ── Connected Screen ── */
  function showConnected(walletKey, meta) {
    const addr = fakeAddress(walletKey);
    const bal  = fakeBalance(meta.netSymbol);
    const dango = fakeDango();

    document.getElementById('wc-connected-addr').textContent = shortAddr(addr);
    document.getElementById('wc-connected-net').innerHTML =
      `<span class="wc-net-dot"></span> ${meta.network}`;
    document.getElementById('wc-eth-bal').textContent = bal;
    document.getElementById('wc-dango-alloc').textContent = dango;

    showScreen('connected');
    showToast(`✅ ${meta.name} connected!`, 'success');
  }

  /* ── Proceed (Claim) button ── */
  proceedBtn?.addEventListener('click', () => {
    closeModal();
    showToast('🎉 Claim submitted! Tokens arrive within 24–48 hours.', 'success');
  });

  /* ── Disconnect ── */
  disconnectBtn?.addEventListener('click', () => {
    showScreen('list');
    showToast('Wallet disconnected.', 'info');
  });

  /* ── Init ── */
  bindOpeners();

})();

