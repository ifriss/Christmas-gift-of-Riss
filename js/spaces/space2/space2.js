/* Space 2 — Aether Cosmic Lounge: cực quang + bầu trời sao, chạm tạo gợn sóng, vuốt tạo sao băng. */
(function () {
  'use strict';

  const I18N = {
    vi: { title: 'Aether Cosmic Lounge', sub: 'Dải ngân hà đang thức giấc', aurora: 'Cực quang', stars: 'Sao băng', time: 'Giờ VN', hint: 'Chạm để tạo gợn sáng · Vuốt để thả sao băng',
          lv: ['Yên tĩnh', 'Nhẹ', 'Sôi động', 'Rực rỡ'] },
    en: { title: 'Aether Cosmic Lounge', sub: 'The galaxy is waking up', aurora: 'Aurora', stars: 'Meteors', time: 'Local time', hint: 'Tap for ripples · Swipe for shooting stars',
          lv: ['Calm', 'Gentle', 'Active', 'Radiant'] },
    zh: { title: '以太星空休息室', sub: '银河正在苏醒', aurora: '极光', stars: '流星', time: '当地时间', hint: '轻触生成涟漪 · 滑动放出流星',
          lv: ['平静', '轻柔', '活跃', '绚烂'] }
  };

  let root = null, canvas = null, ctx = null, raf = 0, ro = 0;
  let W = 0, H = 0, dpr = 1, t0 = 0, last = 0;
  let stars = [], meteors = [], ripples = [], meteorCount = 0;
  let els = {}, clockTimer = 0, listeners = [], lastSwipe = null;
  let lang = 'vi';

  function getLang() {
    let l = 'vi';
    try { l = localStorage.getItem('cgor_lang') || 'vi'; } catch (e) {}
    return I18N[l] ? l : 'vi';
  }
  function T() { return I18N[lang] || I18N.vi; }

  function on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    listeners.push([target, type, fn, opts]);
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function buildDom() {
    root = el('div');
    root.id = 'space2-root';
    canvas = el('canvas', 's2-canvas');
    root.appendChild(canvas);

    const card = el('div', 's2-card');
    els.title = el('div', 's2-title');
    els.sub = el('div', 's2-sub');
    els.clock = el('div', 's2-clock');
    els.clockLbl = el('div', 's2-lbl');

    const row = el('div', 's2-row');
    const c1 = el('div', 's2-cell'), c2 = el('div', 's2-cell');
    els.auroraLbl = el('div', 's2-lbl');
    els.auroraVal = el('div', 's2-val');
    els.bar = el('div', 's2-bar');
    els.barFill = el('i');
    els.bar.appendChild(els.barFill);
    c1.append(els.auroraLbl, els.auroraVal, els.bar);
    els.metLbl = el('div', 's2-lbl');
    els.metVal = el('div', 's2-val', '0');
    c2.append(els.metLbl, els.metVal);
    row.append(c1, c2);

    els.hint = el('div', 's2-hint');
    card.append(els.title, els.sub, els.clock, els.clockLbl, row, els.hint);
    root.appendChild(card);
    document.body.appendChild(root);
    ctx = canvas.getContext('2d');
  }

  function applyLang() {
    lang = getLang();
    const s = T();
    els.title.textContent = s.title;
    els.sub.textContent = s.sub;
    els.clockLbl.textContent = s.time;
    els.auroraLbl.textContent = s.aurora;
    els.metLbl.textContent = s.stars;
    els.hint.textContent = s.hint;
  }

  function tickClock() {
    if (!els.clock) return;
    try {
      els.clock.textContent = new Date().toLocaleTimeString(lang === 'vi' ? 'vi-VN' : lang === 'zh' ? 'zh-CN' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      els.clock.textContent = new Date().toTimeString().slice(0, 5);
    }
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = root.clientWidth || window.innerWidth;
    H = root.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    const n = Math.round(Math.min(160, Math.max(60, W * H / 7000)));
    stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, z: 0.3 + Math.random() * 0.7,
                   p: Math.random() * 6.28, s: 0.5 + Math.random() * 1.3 });
    }
  }

  function addMeteor(x, y, vx, vy) {
    if (meteors.length > 8) return;
    meteors.push({ x: x, y: y, vx: vx, vy: vy, life: 1 });
    meteorCount++;
    if (els.metVal) els.metVal.textContent = String(meteorCount);
  }

  function autoMeteor() {
    const fromLeft = Math.random() < 0.5;
    addMeteor(fromLeft ? Math.random() * W * 0.5 : W * (0.5 + Math.random() * 0.5), Math.random() * H * 0.35,
      (fromLeft ? 1 : -1) * (260 + Math.random() * 200), 120 + Math.random() * 120);
  }

  // ---- Cực quang: vài dải sin dịch chuyển, vẽ bằng gradient dọc (nhẹ, không filter) ----
  const BANDS = [
    { h: 165, a: 0.22, f: 0.9, sp: 0.18, y: 0.30 },
    { h: 205, a: 0.18, f: 1.3, sp: -0.13, y: 0.36 },
    { h: 270, a: 0.16, f: 0.7, sp: 0.10, y: 0.42 }
  ];

  function drawAurora(t) {
    const step = Math.max(8, Math.round(W / 70));
    let intensity = 0;
    for (let b = 0; b < BANDS.length; b++) {
      const B = BANDS[b];
      const hue = B.h + Math.sin(t * 0.08 + b) * 30;
      const amp = H * 0.07;
      const base = H * B.y;
      const bh = H * 0.34;
      for (let x = 0; x < W + step; x += step) {
        const k = x / W;
        const wave = Math.sin(k * 6 * B.f + t * B.sp * 3) * amp + Math.sin(k * 11 + t * 0.4 + b) * amp * 0.4;
        const pulse = 0.55 + 0.45 * Math.sin(k * 5 + t * 0.5 * (b + 1));
        const a = B.a * pulse;
        intensity += pulse;
        const y0 = base + wave - bh * 0.5;
        const g = ctx.createLinearGradient(0, y0, 0, y0 + bh);
        g.addColorStop(0, 'hsla(' + hue + ',90%,60%,0)');
        g.addColorStop(0.35, 'hsla(' + hue + ',90%,62%,' + a + ')');
        g.addColorStop(1, 'hsla(' + (hue + 50) + ',90%,55%,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x, y0, step + 1, bh);
      }
    }
    return intensity / (BANDS.length * (W / step + 1));
  }

  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (!t0) { t0 = ts; last = ts; }
    const dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    const t = (ts - t0) / 1000;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, Math.max(W, H) * 1.1);
    bg.addColorStop(0, '#1a1450');
    bg.addColorStop(0.55, '#0a0824');
    bg.addColorStop(1, '#04030f');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // sao (parallax nhẹ theo thời gian)
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const tw = 0.5 + 0.5 * Math.sin(t * 1.5 * s.z + s.p);
      s.y += s.z * 3 * dt;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      ctx.globalAlpha = 0.25 + 0.75 * tw * s.z;
      ctx.fillStyle = '#e8f1ff';
      ctx.fillRect(s.x, s.y, s.s * s.z + 0.4, s.s * s.z + 0.4);
    }
    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation = 'lighter';
    const inten = drawAurora(t);

    // sao băng
    ctx.lineCap = 'round';
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx * dt; m.y += m.vy * dt; m.life -= dt * 0.9;
      if (m.life <= 0 || m.x < -80 || m.x > W + 80 || m.y > H + 80) { meteors.splice(i, 1); continue; }
      const len = 0.12;
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * len, m.y - m.vy * len);
      g.addColorStop(0, 'rgba(255,255,255,' + Math.min(1, m.life * 1.4) + ')');
      g.addColorStop(1, 'rgba(125,249,255,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * len, m.y - m.vy * len);
      ctx.stroke();
    }

    // gợn sóng ánh sáng
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.age += dt;
      const k = r.age / 1.2;
      if (k >= 1) { ripples.splice(i, 1); continue; }
      ctx.strokeStyle = 'rgba(160,140,255,' + (0.7 * (1 - k)) + ')';
      ctx.lineWidth = 2 * (1 - k) + 0.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 8 + k * 110, 0, 6.283);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(125,249,255,' + (0.5 * (1 - k)) + ')';
      ctx.beginPath();
      ctx.arc(r.x, r.y, 4 + k * 70, 0, 6.283);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';

    // cập nhật widget (nhẹ: chỉ khi đổi mức)
    if (els.barFill) {
      const pct = Math.max(5, Math.min(100, Math.round(inten * 150)));
      els.barFill.style.width = pct + '%';
      const lv = pct < 35 ? 0 : pct < 55 ? 1 : pct < 75 ? 2 : 3;
      const txt = T().lv[lv];
      if (els.auroraVal.textContent !== txt) els.auroraVal.textContent = txt;
    }
  }

  function pos(e) {
    const r = root.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function mount() {
    if (root) return;
    buildDom();
    applyLang();
    tickClock();
    // Không có sự kiện đổi ngôn ngữ toàn cục → kiểm tra nhẹ mỗi giây (chỉ đọc localStorage)
    clockTimer = setInterval(function () {
      if (getLang() !== lang) applyLang();
      tickClock();
    }, 1000);
    resize();

    on(window, 'resize', resize);
    on(window, 'orientationchange', resize);
    on(window, 'cgor-lang', function () { applyLang(); tickClock(); });
    on(window, 'storage', function (e) { if (e.key === 'cgor_lang') { applyLang(); tickClock(); } });

    on(root, 'pointerdown', function (e) {
      const p = pos(e);
      lastSwipe = { x: p.x, y: p.y, t: performance.now() };
      if (ripples.length < 6) ripples.push({ x: p.x, y: p.y, age: 0 });
    });
    on(root, 'pointermove', function (e) {
      if (!lastSwipe || e.buttons === 0 && e.pointerType === 'mouse') return;
      const p = pos(e);
      const now = performance.now();
      const dt = (now - lastSwipe.t) / 1000;
      const dx = p.x - lastSwipe.x, dy = p.y - lastSwipe.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dt > 0 && dist > 40 && dist / dt > 500) {
        const sp = Math.min(dist / dt, 900);
        addMeteor(p.x, p.y, dx / dist * sp * 0.6, dy / dist * sp * 0.6);
        lastSwipe = { x: p.x, y: p.y, t: now + 250 }; // chống spam
      } else if (dt > 0.12) {
        lastSwipe = { x: p.x, y: p.y, t: now };
      }
    });
    const end = function () { lastSwipe = null; };
    on(root, 'pointerup', end);
    on(root, 'pointercancel', end);

    on(document, 'visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf && root) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });

    meteorCount = 0;
    t0 = 0;
    raf = requestAnimationFrame(frame);
    // sao băng tự động thưa thớt
    clockTimer2 = setInterval(function () { if (!document.hidden && Math.random() < 0.6) autoMeteor(); }, 3500);
  }
  let clockTimer2 = 0;

  function unmount() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    clearInterval(clockTimer); clearInterval(clockTimer2);
    clockTimer = clockTimer2 = 0;
    listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
    listeners = [];
    if (canvas) { canvas.width = canvas.height = 0; }
    if (root) root.remove();
    root = canvas = ctx = null;
    els = {}; stars = []; meteors = []; ripples = []; lastSwipe = null;
  }

  window.CGOR_SPACES = window.CGOR_SPACES || {};
  window.CGOR_SPACES.space2 = { id: 'space2', mount: mount, unmount: unmount };
})();
