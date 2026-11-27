/* SPACE 3: Tiệm tạp hóa pixel RGB lơ lửng giữa vũ trụ xanh ngọc bích.
   Toàn bộ vẽ bằng Canvas pixel art + âm thanh 8-bit Web Audio, không dùng file ngoài.
   Vòng đời: mount() / unmount() — dọn sạch rAF, listener, AudioContext, DOM. */
(function () {
  'use strict';
  const reg = (window.CGOR_SPACES = window.CGOR_SPACES || {});

  // ---- Kích thước khung cảnh thiết kế (pixel logic) ----
  const DW = 176, DH = 206;
  const OUT = '#06100F', W0 = '#0E171B', W1 = '#132026', W2 = '#1E323B', W3 = '#2B4753';

  // ---- Bảng màu RGB neon theo chế độ ----
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  const STOPS = [
    ['#00F5D4', '#00FF87', '#9B5DE5', '#FF2A85'].map(hex), // 0: tự động chuyển màu
    ['#00F5D4', '#00FF87', '#34D399', '#6EE7B7'].map(hex), // 1: xanh ngọc bích
    ['#9B5DE5', '#FF2A85', '#C026D3', '#7C3AED'].map(hex)  // 2: tím hồng cyberpunk
  ];

  // ---- Chuỗi đa ngôn ngữ (chỉ gán qua textContent) ----
  const TXT = {
    cat: {
      vi: ['Meow~', 'Gừ gừ...', 'Meo meo~'],
      en: ['Meow~', 'Purr...', 'Mew mew~'],
      zh: ['喵~', '呼噜噜...', '喵喵~']
    },
    owner: {
      vi: ['Chào mừng quý khách! Mời xem hàng nhé~', 'Ting ting! Hôm nay có gì hay nè~', 'Ghé chơi nha, đừng ngại~'],
      en: ['Welcome in! Take a look around~', 'Ding-dong! Something cool today~', 'Come on in, don\'t be shy~'],
      zh: ['欢迎光临！随便看看~', '叮咚！今天有好东西~', '进来坐坐吧，别客气~']
    },
    vendPre: { vi: 'Bíp bốp! Đèn: ', en: 'Beep-boop! Lights: ', zh: '哔噗！灯光：' },
    vendMode: {
      vi: ['Tự động chuyển màu', 'Xanh ngọc bích', 'Tím hồng Cyberpunk'],
      en: ['Auto color cycle', 'Emerald', 'Cyberpunk purple-pink'],
      zh: ['自动变色', '翡翠绿', '赛博紫粉']
    },
    bird: {
      vi: ['Chíp chíp!', 'Chiu chíu~'],
      en: ['Chirp chirp!', 'Tweet~'],
      zh: ['啾啾！', '叽叽~']
    },
    crystal: { vi: ['Ting~ ✨', 'Lấp lánh~ ✨'], en: ['Ping~ ✨', 'Sparkle~ ✨'], zh: ['叮~ ✨', '闪闪~ ✨'] }
  };
  function lang() {
    try { const l = localStorage.getItem('cgor_lang'); return l === 'en' || l === 'zh' ? l : 'vi'; }
    catch (e) { return 'vi'; }
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  // ---- Font pixel 3x5 / 5x5 cho biển hiệu ----
  const GL = {
    M: ['10001', '11011', '10101', '10001', '10001'],
    E: ['111', '100', '110', '100', '111'],
    O: ['111', '101', '101', '101', '111'],
    W: ['10001', '10001', '10101', '11011', '10001'],
    A: ['111', '101', '111', '101', '101'],
    R: ['110', '101', '110', '101', '101'],
    T: ['111', '010', '010', '010', '010']
  };

  // ---- Trạng thái module ----
  let alive = false;
  let root = null, cv = null, ctx = null, bubble = null;
  let sc = null, bg = null, g = null;
  let raf = 0, last = 0, resizeTimer = 0, bubbleTimer = 0;
  let S = 2, W = 0, H = 0, ox = 0, oy = 0, curBob = 0;
  let mode = 0;
  let audio = null;
  let stars = [], dust = [], sparks = [], smoke = [];
  let fx = {}, smokeT = 0, vendCan = null;
  let zones = [];
  let reduce = false;

  const CRYSTALS = [
    { x: 56, w: 4, len: 6, ph: 1.2, snd: 1319 },
    { x: 69, w: 5, len: 10, ph: 0.4, snd: 1568 },
    { x: 86, w: 8, len: 18, ph: 2.1, snd: 1760 },
    { x: 104, w: 6, len: 12, ph: 3.3, snd: 2093 },
    { x: 117, w: 4, len: 7, ph: 4.6, snd: 2349 }
  ];

  // ---- Hình học đảo ----
  function islandHW(dy) { return Math.max(0, Math.round(76 * Math.pow(1 - dy / 35, 0.8))); }
  function islandBottomAt(x) {
    let by = 150;
    for (let dy = 0; dy <= 34; dy++) if (islandHW(dy) >= Math.abs(x - 88)) by = 150 + dy;
    return by;
  }

  // ---- Helper vẽ ----
  function R(x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
  function B(x, y, w, h, c) { R(x - 1, y - 1, w + 2, h + 2, OUT); R(x, y, w, h, c); }
  function brick(x, y, w, h) {
    R(x, y, w, h, W2);
    for (let r = 0; r * 4 < h; r++) {
      const yy = y + r * 4, rh = Math.min(3, y + h - yy);
      R(x, yy, w, 1, W3);
      if (yy + 3 < y + h) R(x, yy + 3, w, 1, W0);
      for (let xx = x + (r % 2) * 3; xx < x + w; xx += 6) R(xx, yy, 1, rh, W0);
    }
  }
  function brickB(x, y, w, h) { R(x - 1, y - 1, w + 2, h + 2, OUT); brick(x, y, w, h); }
  function ring(x, y, w, h, col, a) {
    ctx.globalAlpha = a; ctx.fillStyle = col;
    ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x, y + 1, 1, h - 2); ctx.fillRect(x + w - 1, y + 1, 1, h - 2);
    ctx.globalAlpha = 1;
  }
  function neonBox(x, y, w, h, col) {
    ring(x - 2, y - 2, w + 4, h + 4, col, 0.16);
    ring(x - 1, y - 1, w + 2, h + 2, col, 0.45);
    ring(x, y, w, h, col, 1);
  }
  function text(s, x, y, sc2, gap, c) {
    ctx.fillStyle = c;
    let cx = x;
    for (let i = 0; i < s.length; i++) {
      const gl = GL[s[i]]; if (!gl) continue;
      const w = gl[0].length;
      for (let r = 0; r < 5; r++) for (let k = 0; k < w; k++) if (gl[r][k] === '1') ctx.fillRect(cx + k * sc2, y + r * sc2, sc2, sc2);
      cx += w * sc2 + gap;
    }
  }
  function neon(p) {
    const s = STOPS[mode], n = s.length;
    let q = p % n; if (q < 0) q += n;
    const i = q | 0, f = q - i, a = s[i], b = s[(i + 1) % n];
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * f) + ',' + Math.round(a[1] + (b[1] - a[1]) * f) + ',' + Math.round(a[2] + (b[2] - a[2]) * f) + ')';
  }
  function fl(id, now, dur) {
    const t = fx[id];
    if (t == null) return 0;
    const f = 1 - (now - t) / dur;
    return f > 0 ? f : 0;
  }

  // ---- Dựng nền vũ trụ (một lần mỗi lần đổi kích thước) ----
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function buildBg() {
    bg = document.createElement('canvas');
    bg.width = W; bg.height = H;
    const b = bg.getContext('2d');
    const img = b.createImageData(W, H), d = img.data;
    const c0 = [2, 18, 16], c1 = [6, 44, 39], c2 = [12, 74, 66];
    const neb = [22, 170, 128], neb2 = [34, 160, 190];
    const R1 = Math.max(120, Math.min(W, H) * 0.55);
    const n1x = W / 2, n1y = oy + 92;
    const n2x = W * 0.2, n2y = H * 0.18, n3x = W * 0.85, n3y = H * 0.86;
    for (let y = 0; y < H; y++) {
      const t = y / Math.max(1, H - 1);
      for (let x = 0; x < W; x++) {
        const bay = BAYER[(y & 3) * 4 + (x & 3)] / 16;
        const tq = Math.min(1, Math.floor(t * 22 + bay) / 22);
        let r, gg, bl;
        if (tq < 0.5) { const k = tq * 2; r = c0[0] + (c1[0] - c0[0]) * k; gg = c0[1] + (c1[1] - c0[1]) * k; bl = c0[2] + (c1[2] - c0[2]) * k; }
        else { const k = (tq - 0.5) * 2; r = c1[0] + (c2[0] - c1[0]) * k; gg = c1[1] + (c2[1] - c1[1]) * k; bl = c1[2] + (c2[2] - c1[2]) * k; }
        const d1 = Math.hypot(x - n1x, y - n1y) / R1;
        const d2 = Math.hypot(x - n2x, y - n2y) / (R1 * 0.6);
        const d3 = Math.hypot(x - n3x, y - n3y) / (R1 * 0.7);
        const m1 = d1 < 1 ? (1 - d1) * (1 - d1) * 0.55 : 0;
        const m2 = d2 < 1 ? (1 - d2) * (1 - d2) * 0.3 : 0;
        const m3 = d3 < 1 ? (1 - d3) * (1 - d3) * 0.28 : 0;
        let m = m1 + m2 + m3;
        if (m > 0) {
          m = Math.min(0.8, Math.floor(m * 8 + bay) / 8);
          const mix2 = m2 / (m1 + m2 + m3);
          const nr = neb[0] + (neb2[0] - neb[0]) * mix2, ng = neb[1] + (neb2[1] - neb[1]) * mix2, nb = neb[2] + (neb2[2] - neb[2]) * mix2;
          r += (nr - r) * m; gg += (ng - gg) * m; bl += (nb - bl) * m;
        }
        const i = (y * W + x) * 4;
        d[i] = r; d[i + 1] = gg; d[i + 2] = bl; d[i + 3] = 255;
      }
    }
    b.putImageData(img, 0, 0);
  }

  function buildStars() {
    const n = Math.max(40, Math.min(260, Math.floor(W * H / 260)));
    const cols = ['#E6FFF7', '#E6FFF7', '#6EE7B7', '#22D3EE'];
    stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({ x: Math.floor(Math.random() * W), y: Math.floor(Math.random() * H), c: cols[(Math.random() * cols.length) | 0], ph: Math.random() * 6.28, sp: 0.8 + Math.random() * 2, big: Math.random() < 0.12 });
    }
    dust = [];
    if (!reduce) {
      for (let i = 0; i < 28; i++) dust.push({ x: Math.random() * W, y: Math.random() * H, vy: -(1.5 + Math.random() * 4), ph: Math.random() * 6.28, a: 0.25 + Math.random() * 0.3 });
    }
  }

  // ---- Dựng khung cảnh tĩnh (island, tòa nhà, biển hiệu nền...) ----
  function buildStatic() {
    sc = document.createElement('canvas');
    sc.width = DW; sc.height = DH;
    g = sc.getContext('2d');
    g.imageSmoothingEnabled = false;

    // Đảo đá lơ lửng
    for (let dy = 0; dy < 35; dy++) {
      const hw = islandHW(dy), y = 150 + dy;
      for (let x = 88 - hw; x < 88 + hw; x++) {
        const h = (((x * 73856093) ^ (y * 19349663)) >>> 0) % 13;
        let c;
        if (dy === 0) c = (x & 3) === 0 ? '#6EE7B7' : '#34D399';
        else if (dy < 3) c = h < 2 ? '#14B8A6' : '#0F766E';
        else c = h === 0 ? W3 : h === 1 ? '#0A1317' : ((dy >> 2) % 2 ? W2 : W1);
        R(x, y, 1, 1, c);
      }
      R(88 - hw - 1, y, 1, 1, OUT); R(88 + hw, y, 1, 1, OUT);
    }
    R(83, 185, 10, 1, OUT);

    // Cột tín hiệu bên trái
    B(21, 106, 14, 30, W2);
    R(22, 107, 1, 28, W3);
    R(24, 110, 8, 24, '#0B1A1D');
    B(15, 99, 26, 7, '#14796B');
    R(16, 99, 24, 1, '#2DD4BF'); R(16, 105, 24, 1, '#0F4F47');
    for (let x = 17; x < 39; x += 4) R(x, 100, 2, 3, '#0B1A1D');
    B(20, 95, 16, 4, '#0F4F47');
    B(27, 84, 2, 12, W3);
    B(26, 80, 4, 4, '#6EE7B7');
    brickB(16, 136, 24, 14);

    // Phần thân tiệm: nền trong nhà
    R(56, 68, 44, 56, '#0E2A2E');
    R(82, 68, 18, 56, '#050A0C');
    R(60, 69, 8, 1, '#A7F3D0'); R(72, 69, 8, 1, '#A7F3D0');
    B(60, 76, 22, 5, '#06100F');
    // chồng hộp
    B(59, 116, 14, 8, W3); R(59, 119, 14, 1, '#2DD4BF');
    B(61, 110, 11, 6, W2); R(65, 110, 3, 6, '#2DD4BF');
    B(62, 102, 9, 8, '#14796B');
    R(64, 105, 1, 1, OUT); R(68, 105, 1, 1, OUT); R(65, 107, 3, 1, OUT);
    // cột trụ
    B(49, 66, 7, 84, W3); R(50, 67, 1, 82, '#3E6572');
    B(100, 66, 7, 84, W3); R(101, 67, 1, 82, '#3E6572');
    // quầy
    B(56, 124, 44, 3, '#5E8A98'); R(56, 124, 44, 1, '#8FB8C2');
    brickB(56, 127, 44, 23);
    B(60, 131, 34, 14, '#0A1A1D');
    for (let yy = 133; yy < 143; yy += 3) for (let xx = 62; xx < 92; xx += 3) R(xx, yy, 1, 1, '#14796B');
    // biển hiệu mái
    B(50, 26, 56, 26, '#0B1A1D');
    B(107, 28, 3, 24, '#14302E');
    B(72, 20, 8, 5, W3);
    R(73, 20, 6, 1, OUT);
    // mascot nền (mắt vẽ động)
    R(54, 29, 2, 3, '#14796B'); R(63, 29, 2, 3, '#14796B');
    R(54, 31, 11, 9, '#14796B'); R(55, 33, 9, 6, '#2DD4BF');
    R(59, 38, 2, 1, '#FF2A85');
    // mái hiên sọc xanh ngọc - đen than
    R(54, 52, 49, 1, OUT);
    for (let r = 0; r < 9; r++) {
      const y = 53 + r, L = 54 - r, Rr = 103 + r;
      for (let x = L; x < Rr; x++) R(x, y, 1, 1, ((x + r) >> 2) % 2 ? '#0B1417' : '#14796B');
      R(L - 1, y, 1, 1, OUT); R(Rr, y, 1, 1, OUT);
    }
    for (let x = 46, i = 0; x < 110; x += 4, i++) { R(x, 62, 4, 6, i % 2 ? '#0B1417' : '#14796B'); R(x, 67, 4, 1, OUT); }
    R(45, 62, 1, 8, OUT); R(110, 62, 1, 8, OUT); R(45, 69, 66, 1, OUT);
    // biển dọc bên hông
    B(42, 73, 6, 26, '#0B1A1D'); R(48, 75, 2, 1, W3); R(48, 96, 2, 1, W3);

    // Khối bên phải: bụi cây, tường gạch, máy
    R(112, 24, 8, 2, '#0F4F47'); R(126, 24, 10, 2, '#0F4F47'); R(138, 25, 6, 1, '#0F4F47');
    B(110, 26, 36, 8, '#0F4F47');
    for (let x = 111; x < 146; x += 3) { R(x, 27 + (x % 5 % 3), 1, 1, '#2DD4BF'); R(x + 1, 31 - (x % 4 % 2), 1, 1, '#06302B'); }
    brickB(108, 34, 40, 24);
    B(108, 58, 40, 92, W2);
    R(108, 58, 1, 92, W3);
    for (let i = 0; i < 4; i++) {
      const x = 112 + 9 * i;
      B(x, 64, 8, 7, '#0B1A1D');
      R(x + 1, 65, 1, 1, W3); R(x + 6, 65, 1, 1, W3); R(x + 3, 67, 2, 1, '#3E6572'); R(x + 1, 69, 1, 1, W3); R(x + 6, 69, 1, 1, W3);
    }
    B(112, 75, 32, 4, '#06100F');
    for (let i = 0; i < 7; i++) R(114 + 4 * i, 76, 2, 2, '#14796B');
    // bảng menu
    B(113, 86, 30, 22, '#0B1A1D');
    R(116, 90, 4, 4, '#6EE7B7'); R(117, 94, 2, 2, W3);
    R(123, 90, 16, 1, '#14796B'); R(123, 93, 12, 1, '#14796B'); R(123, 96, 16, 1, '#14796B');
    R(116, 99, 4, 5, '#34D399'); R(123, 100, 16, 1, '#14796B'); R(123, 103, 10, 1, '#14796B');
    // máy bán hàng tự động
    B(118, 114, 22, 35, W3); R(118, 114, 22, 1, '#5E8A98');
    B(121, 118, 10, 16, '#06100F');
    const pc = ['#FF2A85', '#9B5DE5', '#00F5D4'];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) R(122 + c * 3, 119 + r * 5, 2, 4, pc[(r + c) % 3]);
    R(133, 118, 5, 16, '#0F4F47');
    R(134, 120, 3, 2, '#06100F'); R(134, 124, 3, 2, '#06100F'); R(135, 129, 1, 3, OUT);
    R(118, 135, 22, 2, '#0B1417');
    B(122, 138, 10, 6, '#06100F'); R(122, 138, 10, 1, '#3E6572');
    R(119, 149, 3, 2, OUT); R(136, 149, 3, 2, OUT);
    // thùng đặt mèo phải
    B(149, 140, 12, 10, W2); R(149, 144, 12, 1, W0); R(154, 140, 1, 10, W0);
  }

  // ---- Âm thanh 8-bit (Web Audio, AudioContext riêng của Space 3) ----
  function ensureAudio() {
    if (!audio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        const c = new AC();
        const master = c.createGain();
        master.gain.value = 0.45;
        master.connect(c.destination);
        const len = Math.floor(c.sampleRate * 0.3);
        const nb = c.createBuffer(1, len, c.sampleRate);
        const d = nb.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        audio = { ctx: c, master: master, noise: nb };
      } catch (e) { audio = null; return null; }
    }
    if (audio.ctx.state === 'suspended') {
      try { const p = audio.ctx.resume(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    }
    return audio;
  }
  function tone(a, o) {
    const c = a.ctx, t = c.currentTime + (o.at || 0);
    const osc = c.createOscillator(), gn = c.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + o.d);
    const v = o.v == null ? 0.2 : o.v;
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.linearRampToValueAtTime(v, t + 0.008);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + o.d);
    osc.connect(gn); gn.connect(a.master);
    osc.start(t); osc.stop(t + o.d + 0.03);
    osc.onended = function () { try { osc.disconnect(); gn.disconnect(); } catch (e) {} };
  }
  function noiseHit(a, at, d, v, cutoff) {
    const c = a.ctx, t = c.currentTime + at;
    const src = c.createBufferSource(), fi = c.createBiquadFilter(), gn = c.createGain();
    src.buffer = a.noise;
    fi.type = 'lowpass'; fi.frequency.value = cutoff;
    gn.gain.setValueAtTime(v, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(fi); fi.connect(gn); gn.connect(a.master);
    src.start(t); src.stop(t + d + 0.02);
    src.onended = function () { try { src.disconnect(); fi.disconnect(); gn.disconnect(); } catch (e) {} };
  }
  const SND = {
    meow: function (a, k) {
      tone(a, { f: 520 * k, f2: 980 * k, d: 0.13, type: 'square', v: 0.14 });
      tone(a, { f: 980 * k, f2: 430 * k, d: 0.28, type: 'square', v: 0.14, at: 0.13 });
    },
    purr: function (a) {
      for (let i = 0; i < 14; i++) tone(a, { f: 55 + Math.random() * 12, d: 0.05, type: 'sawtooth', v: 0.12, at: i * 0.045 });
    },
    ding: function (a) {
      tone(a, { f: 1318.5, d: 0.55, type: 'triangle', v: 0.22 });
      tone(a, { f: 2637, d: 0.3, type: 'sine', v: 0.05 });
      tone(a, { f: 1046.5, d: 0.85, type: 'triangle', v: 0.22, at: 0.22 });
      tone(a, { f: 2093, d: 0.4, type: 'sine', v: 0.05, at: 0.22 });
    },
    vend: function (a) {
      tone(a, { f: 880, d: 0.07, type: 'square', v: 0.12 });
      tone(a, { f: 1320, d: 0.07, type: 'square', v: 0.12, at: 0.09 });
      tone(a, { f: 660, d: 0.1, type: 'square', v: 0.12, at: 0.19 });
      tone(a, { f: 150, f2: 45, d: 0.2, type: 'triangle', v: 0.38, at: 0.43 });
      noiseHit(a, 0.43, 0.12, 0.25, 700);
    },
    chirp: function (a) {
      const at = [0, 0.09, 0.3, 0.39];
      for (let i = 0; i < 4; i++) tone(a, { f: 2200 + i * 120, f2: 3400, d: 0.06, type: 'square', v: 0.07, at: at[i] });
    },
    ping: function (a, f) {
      tone(a, { f: f, d: 1.4, type: 'sine', v: 0.2 });
      tone(a, { f: f * 1.5, d: 0.9, type: 'sine', v: 0.08 });
      tone(a, { f: f, d: 1.0, type: 'sine', v: 0.08, at: 0.22 });
    }
  };
  function play(fn, arg) {
    const a = ensureAudio();
    if (!a) return;
    try { fn(a, arg); } catch (e) {}
  }

  // ---- Hạt hiệu ứng ----
  function burst(x, y, cols, n) {
    for (let i = 0; i < n && sparks.length < 140; i++) {
      const ang = Math.random() * 6.28, sp = 10 + Math.random() * 22;
      sparks.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 10, age: 0, life: 0.5 + Math.random() * 0.6, c: cols[(Math.random() * cols.length) | 0], s: Math.random() < 0.3 ? 2 : 1 });
    }
  }

  // ---- Bong bóng thoại ----
  function showBubble(z, str) {
    if (!bubble) return;
    bubble.textContent = str;
    bubble.classList.remove('on');
    const rect = cv.getBoundingClientRect();
    const vw = root.clientWidth;
    const cx = rect.left + (z.x + z.w / 2 + ox) * S;
    let top = rect.top + (z.y + oy + curBob) * S - 10;
    const below = top < 90;
    if (below) top = rect.top + (z.y + z.h + oy + curBob) * S + 12;
    bubble.classList.toggle('below', below);
    const w = bubble.offsetWidth;
    bubble.style.left = Math.max(w / 2 + 8, Math.min(vw - w / 2 - 8, cx)) + 'px';
    bubble.style.top = top + 'px';
    void bubble.offsetWidth;
    bubble.classList.add('on');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { if (bubble) bubble.classList.remove('on'); }, 1900);
  }

  // ---- Tương tác ----
  function buildZones() {
    zones = [
      { id: 'catL', k: 'cat', x: 41, y: 141, w: 9, h: 9 },
      { id: 'catR', k: 'cat', x: 151, y: 131, w: 9, h: 9 },
      { id: 'owner', k: 'owner', x: 82, y: 98, w: 16, h: 26 },
      { id: 'vend', k: 'vend', x: 118, y: 112, w: 22, h: 37 },
      { id: 'bird', k: 'bird', x: 95, y: 19, w: 11, h: 7 },
      { id: 'tower', k: 'crystal', x: 15, y: 80, w: 26, h: 70, f: 1568 }
    ];
    CRYSTALS.forEach(function (c, i) {
      const top = islandBottomAt(c.x) - 1;
      zones.push({ id: 'cr' + i, k: 'crystal', x: c.x - Math.ceil(c.w / 2), y: top, w: c.w + 1, h: c.len, f: c.snd });
    });
  }
  function hit(lx, ly) {
    const m = 44 / S;
    let best = null, bd = 1e9;
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i];
      const ex = Math.max(0, (m - z.w) / 2), ey = Math.max(0, (m - z.h) / 2);
      if (lx >= z.x - ex && lx <= z.x + z.w + ex && ly >= z.y - ey && ly <= z.y + z.h + ey) {
        const d = Math.pow(lx - (z.x + z.w / 2), 2) + Math.pow(ly - (z.y + z.h / 2), 2);
        if (d < bd) { bd = d; best = z; }
      }
    }
    return best;
  }
  function unlock() { ensureAudio(); }
  function onClick(e) {
    ensureAudio();
    const rect = cv.getBoundingClientRect();
    const lx = (e.clientX - rect.left) / S - ox, ly = (e.clientY - rect.top) / S - oy - curBob;
    const z = hit(lx, ly);
    if (!z) return;
    const now = performance.now() / 1000, L = lang();
    fx[z.id] = now;
    const cx = z.x + z.w / 2, cy = z.y + z.h / 2;
    if (z.k === 'cat') {
      const i = Math.floor(Math.random() * 3);
      showBubble(z, TXT.cat[L][i]);
      if (i === 1) play(SND.purr); else play(SND.meow, z.id === 'catL' ? 1 : 0.82);
      burst(cx, z.y, ['#FF2A85', '#6EE7B7'], 6);
    } else if (z.k === 'owner') {
      showBubble(z, pick(TXT.owner[L]));
      play(SND.ding);
      burst(94, 121, ['#FBBF24', '#FFFFFF'], 8);
    } else if (z.k === 'vend') {
      mode = (mode + 1) % 3;
      vendCan = now;
      showBubble(z, TXT.vendPre[L] + TXT.vendMode[L][mode]);
      play(SND.vend);
      burst(cx, 125, [neon(0), neon(1.5), '#FFFFFF'], 10);
    } else if (z.k === 'bird') {
      showBubble(z, pick(TXT.bird[L]));
      play(SND.chirp);
      burst(cx, z.y, ['#FBBF24', '#22D3EE'], 5);
    } else {
      showBubble(z, pick(TXT.crystal[L]));
      play(SND.ping, z.f);
      burst(cx, z.id === 'tower' ? 97 : cy, ['#A7F3D0', '#FFFFFF', '#22D3EE'], 10);
    }
  }

  // ---- Vẽ các thành phần động ----
  function spike(cx, top, w, len, grow, c) {
    ctx.fillStyle = c;
    const total = len + grow;
    for (let i = 0; i < total; i++) {
      const hw = Math.round((w / 2 + grow) * (1 - i / (total + 1)));
      ctx.fillRect(cx - hw, top + i, hw * 2 + 1, 1);
    }
  }
  function drawCrystal(c, idx, now) {
    const top = islandBottomAt(c.x) - 1;
    const f = fl('cr' + idx, now, 0.7) + fl('tower', now, 0.7) * 0.5;
    const pulse = 0.5 + 0.5 * Math.sin(now * 2 + c.ph);
    ctx.globalAlpha = Math.min(0.9, 0.1 + 0.12 * pulse + 0.6 * f);
    spike(c.x, top, c.w, c.len, 2, f > 0.3 ? '#D1FAE5' : '#34D399');
    ctx.globalAlpha = 1;
    const hot = f > 0.35;
    for (let i = 0; i < c.len; i++) {
      const hw = Math.round((c.w / 2) * (1 - i / (c.len + 1)));
      const y = top + i;
      R2(c.x - hw, y, hw, 1, hot ? '#6EE7B7' : '#047857');
      R2(c.x, y, 1, 1, hot ? '#FFFFFF' : '#A7F3D0');
      R2(c.x + 1, y, hw, 1, hot ? '#D1FAE5' : '#10B981');
    }
    if (Math.sin(now * 3 + c.ph) > 0.85) R2(c.x - 1, top + 2, 1, 1, '#FFFFFF');
  }
  function R2(x, y, w, h, c) { if (w > 0) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); } }

  const CAT = ['1.....1', '11...11', '1111111', '1111111', '.11111.', '.11111.', '1111111', '1111111', '1111111'];
  function drawCat(id, x, y0, flip, ph, now) {
    const f = fl(id, now, 0.55);
    const jump = f > 0 ? Math.round(Math.abs(Math.sin((1 - f) * Math.PI * 2)) * 4) : 0;
    const y = y0 - jump;
    ctx.fillStyle = '#04080A';
    for (let r = 0; r < CAT.length; r++) for (let k = 0; k < 7; k++) if (CAT[r][k] === '1') ctx.fillRect(x + k, y + r, 1, 1);
    R2(x + 1, y + 2, 5, 1, '#0F3D38');
    // đuôi vẫy
    const wag = Math.sin(now * 3 + ph) > 0;
    const t1 = flip ? x - 1 : x + 7, t2 = flip ? x - 2 : x + 8;
    ctx.fillStyle = '#04080A';
    ctx.fillRect(t1, y + 8, 1, 1); ctx.fillRect(t2, y + 7, 1, 1); ctx.fillRect(t2, y + (wag ? 5 : 6), 1, wag ? 2 : 1);
    // mắt phát sáng
    const blink = ((now + ph) % 4.2) < 0.14;
    if (!blink) {
      const glow = 0.28 + 0.2 * Math.sin(now * 2.5 + ph);
      ctx.globalAlpha = glow + (f > 0 ? 0.3 : 0);
      R2(x + 1, y + 2, 2, 1, '#34D399'); R2(x + 4, y + 2, 2, 1, '#34D399');
      R2(x + 1, y + 4, 2, 1, '#34D399'); R2(x + 4, y + 4, 2, 1, '#34D399');
      ctx.globalAlpha = 1;
      R2(x + 1, y + 3, 2, 1, '#6EE7B7'); R2(x + 4, y + 3, 2, 1, '#6EE7B7');
    }
  }

  function drawOwner(now, p) {
    const f = fl('owner', now, 0.6);
    const fur = '#C9D8D2', shade = '#8FA8A0';
    const x = 83, y = 100 + (Math.sin(now * 2) > 0.6 ? 1 : 0) - (f > 0 ? 1 : 0);
    R2(x + 1, y, 2, 3, fur); R2(x + 11, y, 2, 3, fur);
    R2(x + 2, y + 1, 1, 2, '#FF8FB1'); R2(x + 11, y + 1, 1, 2, '#FF8FB1');
    R2(x + 1, y + 2, 12, 9, fur);
    R2(x + 1, y + 9, 12, 2, shade);
    const blink = (now % 5) < 0.12;
    R2(x + 3, y + 5, 2, blink ? 1 : 2, OUT); R2(x + 9, y + 5, 2, blink ? 1 : 2, OUT);
    if (!blink) { R2(x + 3, y + 5, 1, 1, '#6EE7B7'); R2(x + 9, y + 5, 1, 1, '#6EE7B7'); }
    R2(x + 6, y + 8, 2, 1, '#FF8FB1'); R2(x + 5, y + 9, 1, 1, OUT); R2(x + 8, y + 9, 1, 1, OUT);
    R2(x - 1, y + 7, 2, 1, shade); R2(x + 13, y + 7, 2, 1, shade);
    const bh = 124 - (y + 11);
    R2(x, y + 11, 14, bh, '#14796B');
    R2(x + 4, y + 16, 6, 1, '#0F4F47');
    R2(x + 5, y + 11, 4, 2, neon(p));
    if (f > 0) R2(x + 14, y + 9 + (Math.sin(now * 18) > 0 ? 0 : 1), 2, 6, fur);
    // chuông quầy
    ctx.fillStyle = f > 0.4 ? '#FFFFFF' : '#FBBF24';
    ctx.fillRect(92, 122, 4, 2); ctx.fillRect(93, 121, 2, 1);
  }

  function drawBird(now) {
    const f = fl('bird', now, 0.6);
    const bx = 96;
    let by = 20 - (f > 0 ? Math.round(Math.abs(Math.sin((1 - f) * Math.PI * 3)) * 5) : 0);
    const peck = (now % 5.3) < 0.15 ? 1 : 0;
    const body = '#CFFAFE', wing = '#22D3EE', beak = '#FBBF24';
    R2(bx + 1, by + peck, 3, 3, body);
    R2(bx + 1, by + 1 + peck, 1, 1, OUT);
    R2(bx - 1, by + 1 + peck, 2, 1, beak);
    if (f > 0 && Math.sin(now * 25) > 0) R2(bx - 1, by + 2 + peck, 1, 1, beak);
    R2(bx + 2, by + 2, 6, 3, body);
    R2(bx + 3, by + 3, 3, 2, wing);
    R2(bx + 8, by + 3 + ((now % 3) < 0.2 ? -1 : 0), 3, 1, wing);
    R2(bx + 4, by + 5, 1, 1, beak); R2(bx + 6, by + 5, 1, 1, beak);
  }

  function drawVend(now, p) {
    const f = fl('vend', now, 0.5);
    if (f > 0) { ctx.globalAlpha = f * 0.5; R2(121, 118, 10, 16, '#FFFFFF'); ctx.globalAlpha = 1; }
    R2(134, 120, 3, 2, neon(p)); R2(134, 124, 3, 2, neon(p + 1));
    if (vendCan != null) {
      const dt = now - vendCan;
      if (dt < 1.8 && dt >= 0.18) {
        const tt = Math.min(1, (dt - 0.18) / 0.25);
        const y = Math.round(122 + 17 * tt * tt);
        R2(124, y, 3, 4, neon(p + 2)); R2(124, y, 3, 1, '#FFFFFF');
      }
    }
  }

  function drawScene(now) {
    const p = now * 0.35;
    // viền neon RGB
    neonBox(51, 27, 54, 24, neon(p));
    text('MEOW', 68, 31, 2, 1, neon(p + 0.8));
    text('MART', 75, 43, 1, 2, neon(p + 1.6));
    R2(57, 35, 2, 2, neon(p + 0.4)); R2(61, 35, 2, 2, neon(p + 0.4));
    neonBox(42, 73, 6, 26, neon(p + 0.5));
    for (let y = 76; y < 97; y += 3) R2(44, y, 2, 1, neon(p + y * 0.05));
    neonBox(113, 86, 30, 22, neon(p + 1.2));
    neonBox(60, 131, 34, 14, neon(p + 2));
    R2(61, 78, 20, 1, neon(p + 1));
    neonBox(118, 114, 22, 35, neon(p + 2.6));
    // dải LED chạy viền mái hiên
    const ph = Math.floor(now * 6);
    for (let x = 47, i = 0; x < 109; x += 3, i++) {
      ctx.globalAlpha = (i + ph) % 4 === 0 ? 0.3 : 1;
      R2(x, 68, 2, 1, neon(p + x * 0.04));
    }
    ctx.globalAlpha = 1;
    // cột tín hiệu
    const tf = fl('tower', now, 0.7);
    for (let x = 16; x < 40; x += 2) R2(x, 101, 2, 1, neon(p + x * 0.05));
    for (let y = 110; y < 133; y += 3) R2(24, y, 2, 2, neon(p + y * 0.06));
    R2(29, 112, 3, 3, neon(p + 1));
    if (tf > 0) { ctx.globalAlpha = tf * 0.6; R2(16, 99, 24, 6, '#FFFFFF'); ctx.globalAlpha = 1; }
    for (let i = 0; i < 9; i++) {
      const wave = Math.round(Math.sin(now * 4 - i * 0.5));
      R2(30 + i, 84 + wave, 1, 7 - Math.round(i * 0.75), neon(p + 1.5));
    }
    // nhân vật
    drawVend(now, p);
    drawOwner(now, p + 0.3);
    drawBird(now);
    drawCat('catL', 41, 141, false, 0, now);
    drawCat('catR', 151, 131, true, 2.1, now);
  }

  // ---- Cập nhật & vẽ khung hình ----
  function update(dt, now) {
    // khói
    smokeT -= dt;
    if (smokeT <= 0 && smoke.length < 18) {
      smokeT = 0.42;
      smoke.push({ x: 76 + Math.random() * 2, y: 19, age: 0, life: 3.2, ph: Math.random() * 6.28 });
    }
    for (let i = smoke.length - 1; i >= 0; i--) {
      const s = smoke[i];
      s.age += dt; s.y -= 9 * dt;
      if (s.age > s.life) smoke.splice(i, 1);
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.age += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 40 * dt;
      if (s.age > s.life) sparks.splice(i, 1);
    }
    for (let i = 0; i < dust.length; i++) {
      const d = dust[i];
      d.y += d.vy * dt; d.x += Math.sin(now * 0.5 + d.ph) * 3 * dt;
      if (d.y < -2) { d.y = H + 2; d.x = Math.random() * W; }
    }
  }

  function draw(now) {
    ctx.globalAlpha = 1;
    ctx.drawImage(bg, 0, 0);
    // sao lấp lánh
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * s.sp + s.ph));
      ctx.globalAlpha = a; ctx.fillStyle = s.c;
      ctx.fillRect(s.x, s.y, 1, 1);
      if (s.big && a > 0.75) { ctx.fillRect(s.x - 1, s.y, 3, 1); ctx.fillRect(s.x, s.y - 1, 1, 3); }
    }
    // bụi sáng
    ctx.fillStyle = '#6EE7B7';
    for (let i = 0; i < dust.length; i++) {
      const d = dust[i];
      ctx.globalAlpha = d.a;
      ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, 1);
    }
    ctx.globalAlpha = 1;

    curBob = reduce ? 0 : Math.round(Math.sin(now * 1.2) * 2.5);
    ctx.save();
    ctx.translate(ox, oy + curBob);
    for (let i = 0; i < CRYSTALS.length; i++) drawCrystal(CRYSTALS[i], i, now);
    ctx.drawImage(sc, 0, 0);
    drawScene(now);
    // khói phát sáng
    for (let i = 0; i < smoke.length; i++) {
      const s = smoke[i], k = s.age / s.life;
      const sz = 2 + Math.floor(k * 3);
      ctx.globalAlpha = (1 - k) * 0.55;
      ctx.fillStyle = k < 0.5 ? '#A7F3D0' : '#34D399';
      ctx.fillRect(Math.round(s.x + Math.sin(s.age * 2 + s.ph) * 3 * k), Math.round(s.y), sz, sz);
    }
    // tia sáng / hạt
    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i];
      ctx.globalAlpha = Math.max(0, 1 - s.age / s.life);
      ctx.fillStyle = s.c;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.s, s.s);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const now = performance.now() / 1000;
    const dt = Math.min(0.05, now - last);
    last = now;
    update(dt, now);
    draw(now);
  }

  // ---- Bố cục theo kích thước màn hình (pixel nguyên theo thiết bị) ----
  function layout() {
    if (!root || !cv) return;
    const vw = root.clientWidth || window.innerWidth, vh = root.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const raw = Math.min(vw / DW, vh / DH);
    S = Math.max(1, Math.floor(raw * dpr) / dpr);
    W = Math.ceil(vw / S); H = Math.ceil(vh / S);
    cv.width = W; cv.height = H;
    cv.style.width = (W * S) + 'px';
    cv.style.height = (H * S) + 'px';
    ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ox = Math.floor((W - DW) / 2);
    oy = Math.floor((H - DH) / 2);
    buildBg();
    buildStars();
  }
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (alive) layout(); }, 120);
  }

  // ---- Vòng đời ----
  var CV_ARIA = {
    vi: 'Cửa hàng pixel RGB lơ lửng trong vũ trụ ngọc lục bảo',
    en: 'Floating pixel RGB shop in an emerald cosmos',
    zh: '翡翠宇宙中漂浮的像素 RGB 商店'
  };
  function setCvAria() { if (cv) cv.setAttribute('aria-label', CV_ARIA[lang()] || CV_ARIA.en); }

  function mount() {
    if (alive) return;
    alive = true;
    reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    root = document.createElement('div');
    root.id = 'space3-root';
    cv = document.createElement('canvas');
    cv.id = 'space3-canvas';
    cv.setAttribute('role', 'img');
    setCvAria();
    window.addEventListener('cgor-lang', setCvAria);
    bubble = document.createElement('div');
    bubble.className = 's3-bubble';
    bubble.setAttribute('aria-live', 'polite');
    root.append(cv, bubble);
    document.body.insertBefore(root, document.body.firstChild);

    mode = 0; fx = {}; sparks = []; smoke = []; smokeT = 0; vendCan = null;
    buildStatic();
    buildZones();
    layout();

    cv.addEventListener('click', onClick);
    cv.addEventListener('pointerdown', unlock, { passive: true });
    cv.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    last = performance.now() / 1000;
    raf = requestAnimationFrame(frame);
  }

  function unmount() {
    alive = false;
    cancelAnimationFrame(raf); raf = 0;
    clearTimeout(resizeTimer); clearTimeout(bubbleTimer);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onResize);
    window.removeEventListener('cgor-lang', setCvAria);
    if (cv) {
      cv.removeEventListener('click', onClick);
      cv.removeEventListener('pointerdown', unlock);
      cv.removeEventListener('touchend', unlock);
    }
    if (audio) {
      try { const p = audio.ctx.close(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
      audio = null;
    }
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = cv = ctx = bubble = sc = bg = g = null;
    stars = []; dust = []; sparks = []; smoke = []; zones = []; fx = {}; vendCan = null;
  }

  reg.space3 = { mount: mount, unmount: unmount };
})();
