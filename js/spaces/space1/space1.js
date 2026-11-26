/* Space 1 — Cây thông Noel 3D ASCII + Ông già Noel + tuyết rơi.
   Logic & đồ họa giữ nguyên từ scene.js cũ; chỉ bọc trong vòng đời mount()/unmount(). */
(function () {
  'use strict';
  let cleanup = null;
  let barLang = null;

  // Bộ điều phối ổn định: control-panel.js bọc hàm này khi nạp, nên phải tồn tại từ lúc nạp file
  // (không được gán lại trong mount()).
  window.updateBarLanguage = function (lang) { if (barLang) barLang(lang); };

  function mount() {
    if (cleanup) return;
    const disposers = [];
    const on = (target, type, fn, opt) => {
      target.addEventListener(type, fn, opt);
      disposers.push(() => target.removeEventListener(type, fn, opt));
    };
    let alive = true, rafId = 0;
    {
      const $ = id => document.getElementById(id);
      const cv = $('c');
      const ctx = cv.getContext('2d');

      const PAL = [
        '#0d7a33', '#17b848', '#35e866', '#b4ffbe',
        '#ff3b3b', '#ffcf4a', '#4aa3ff', '#ffffff',
        '#ff7ad9', '#8aa0c8', '#eaf4ff', '#fff1a8',
        '#6b7fa6', '#46557c', '#52f0ff', '#ff9a3c',
        '#8b5a2b', '#c4301f', '#ffd2b0', '#1a1f3a'
      ];

      const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const S = {
        spin: !rm,
        snow: true,
        lights: true,
        garland: true,
        orn: true,
        star: true,
        gifts: true,
        santa: true,
        sparkle: true,
        aurora: false,
        fire: false
      };

      const F = {};
      for (const k in S) F[k] = 0;

      const TAU = Math.PI * 2;
      const rnd = Math.random;
      const cl = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
      const hs = (a, b) => {
        let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
      };

      let MODE = 0;
      let bp = -0.25;
      let mT = 0;

      let W, H, dpr, cw, chh, cols, rows, N, chars, colr, zb, cx, baseY, treeH, groundRow, sky, msg = '';
      const buckets = Array.from({ length: PAL.length * 8 }, () => []);

      function resize() {
        dpr = Math.min(devicePixelRatio || 1, 2);
        W = innerWidth;
        H = innerHeight;
        cv.width = W * dpr;
        cv.height = H * dpr;

        const isMobile = W < 640;
        cw = Math.max(5.0, Math.min(10, W / 76));
        chh = cw * 1.55;
        cols = Math.ceil(W / cw);
        rows = Math.ceil(H / chh);
        N = cols * rows;

        chars = new Array(N);
        colr = new Int16Array(N);
        zb = new Float32Array(N);

        treeH = Math.min(H * (isMobile ? 0.39 : 0.55), W * (isMobile ? 1.05 : 1.25));
        cx = W / 2;
        baseY = H * (isMobile ? 0.64 : 0.72);
        groundRow = Math.floor(baseY / chh);

        sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#03061a');
        sky.addColorStop(0.7, '#0a1636');
        sky.addColorStop(1, '#0d1c42');

        const m = 'MERRY CHRISTMAS';
        msg = m.length * 2 < cols - 4 ? m.split('').join(' ').replace(/ {3}/, '   ') : m;

        // Báo vị trí chữ MERRY CHRISTMAS để đặt nút "Bảng điều khiển" ngay bên dưới
        window.CGOR_LAYOUT = { msgBottomY: (groundRow + 5) * chh, msgHalfW: (msg.length * cw) / 2, W: W, H: H };
        try { window.dispatchEvent(new Event('cgor-layout')); } catch (e) {}
      }

      function put(c, r, ch, k, z, a = 1) {
        const lv = Math.round(a * 8);
        if (lv <= 0 || c < 0 || r < 0 || c >= cols || r >= rows) return;
        const i = r * cols + c;
        if (z >= zb[i]) {
          zb[i] = z;
          chars[i] = ch;
          colr[i] = k * 8 + Math.min(8, lv) - 1;
        }
      }

      const Rn = y => 0.37 * (1 - y) * (1 - 0.14 * ((y * 8) % 1)) + 0.003;
      const wrap = a => {
        a %= TAU;
        return a > Math.PI ? a - TAU : a < -Math.PI ? a + TAU : a;
      };

      function U(y, th, xs) {
        if (MODE === 0) return y;
        if (MODE === 1) return y * 0.7 + (((th / TAU) % 1 + 1) % 1) * 0.3;
        if (MODE === 2) return xs * (1 - y) * 0.5 + 0.5;
        return Math.min(1, Math.hypot(xs * (1 - y) * 0.52, y - 0.45) / 0.62);
      }

      const CH = '@#%&xWvo*^+-:<>/';
      const CL = CH.length;
      const SC = '01+*#%&$@=<>/\\|~^';
      const SCL = SC.length;
      const LC = [5, 4, 6, 11, 8, 14, 15, 7];
      const NL = 220;
      const LT = [];
      const OR = [];

      for (let k = 0; k < NL; k++) {
        LT.push({
          i: k,
          f: k / NL,
          y: 0.05 + 0.88 * (k / NL),
          th: (k / NL) * TAU * 7,
          k: LC[k % 8],
          ph: rnd() * TAU,
          sp: 1.5 + rnd() * 3
        });
      }

      for (let k = 0; k < 22; k++) {
        OR.push({
          i: k,
          y: 0.1 + 0.76 * ((k * 0.381 + 0.07) % 1),
          th: k * 2.7 + 1,
          k: [4, 6, 5, 8, 15, 4][k % 6]
        });
      }

      const spr = {};
      function glow(k) {
        if (spr[k]) return spr[k];
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const g = c.getContext('2d');
        const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        r.addColorStop(0, PAL[k]);
        r.addColorStop(0.25, PAL[k] + '88');
        r.addColorStop(1, PAL[k] + '00');
        g.fillStyle = r;
        g.fillRect(0, 0, 64, 64);
        return (spr[k] = c);
      }

      const BG = [];
      for (let i = 0; i < 230; i++) {
        BG.push({ fx: rnd(), fy: rnd() * 0.85, ph: rnd() * TAU, sp: 0.6 + rnd() * 2.4 });
      }

      const SN = [];
      const nsn = rm ? 80 : 240;
      for (let i = 0; i < nsn; i++) {
        SN.push({ f: i / nsn, on: false, fx: rnd(), fy: -1, v: 3 + rnd() * 7, z: rnd() * 1.2 - 0.6, ph: rnd() * TAU });
      }

      const PT = [];
      const SPC = '.+x**';
      const SCOL = [7, 11, 5, 14, 8];

      function spark(c, r, vx, vy, l, k) {
        if (PT.length < 900) PT.push({ c, r, vx, vy, l, a: 0, k });
      }

      function burst(c, r, n = 46, cs = SCOL, sp = 20) {
        for (let i = 0; i < n; i++) {
          const a = (TAU * i) / n + rnd() * 0.3;
          const v = 8 + rnd() * sp;
          spark(c, r, Math.cos(a) * v, Math.sin(a) * v * 0.55, 0.8 + rnd() * 0.9, cs[i % cs.length]);
        }
      }

      let santaZone = null;
      let hohoTimer = 0;
      let glowsRef = null;

      // Ông già Noel 13x14 ký tự: mũ + cục bông, mặt, ria & râu tơi xốp, áo đỏ có viền trắng,
      // thắt lưng vàng, ủng nâu. Tay phải vẫy, mắt chớp, miệng mở khi "Ho ho ho".
      const SANTA_G = [
        '     @@@     ',
        '    /###\\    ',
        '   /#####\\   ',
        '  FFFFFFFFF  ',
        '   (%%%%%)   ',
        '   (o%^%o)   ',
        '  FFFFmFFFF  ',
        '   FFFFFFF   ',
        '    FFFFF    ',
        '  (###F###)  ',
        ' /(###F###)  ',
        ' o(###F###)  ',
        '  EEEEGEEEE  ',
        '  KKKK KKKK  '
      ];
      const SANTA_FUR = '@W&%#';

      function drawSanta(sc, rb, al) {
        const HW = 6;
        const SH = SANTA_G.length;
        const rTop = rb - (SH - 1);
        santaZone = { c1: sc - HW, c2: sc + HW, r1: rTop - 1, r2: rb + 1 };

        const wavePhase = Math.sin(t * 5.2);
        const pomShift = Math.sin(t * 2.4) > 0.25 ? 1 : 0;
        const bob = Math.sin(t * 3.2) > 0.65 ? -1 : 0;
        const blink = (t % 3.6) > 3.48;
        const talking = hohoTimer > 0 && Math.sin(t * 22) > -0.2;
        const r0 = rTop + bob;
        const cl0 = sc - HW;

        const sp = (dc, dr, ch, k, z = 15) => {
          if (hs(sc + dc * 3, r0 + dr * 5) <= al) {
            put(cl0 + dc, r0 + dr, ch, k, z, 0.72 + 0.28 * al);
          }
        };

        for (let y = 0; y < SH; y++) {
          const row = SANTA_G[y];
          for (let x = 0; x < row.length; x++) {
            let ch = row[x];
            if (ch === ' ') continue;
            let k;
            let dx = x;
            let z = 15;
            if (y === 0) {                       // cục bông trên chóp mũ (đung đưa)
              ch = '@'; k = 7; dx = x + pomShift; z = 16;
            } else if (ch === 'F') {             // lông / râu: ký tự xen kẽ cho cảm giác tơi xốp
              const h = hs(x * 7 + 11, y * 5 + 3);
              ch = SANTA_FUR[(h * SANTA_FUR.length) | 0];
              k = h > 0.5 ? 7 : 10;
            } else if (ch === 'm') {             // miệng
              ch = talking ? 'O' : 'v';
              k = talking ? 4 : 8;
            } else if (y === 5 && ch === 'o') {  // mắt (chớp)
              ch = blink ? '-' : 'o';
              k = 6;
            } else if (ch === 'o') {             // găng tay trắng
              k = 7;
            } else if (ch === '^') {             // mũi
              k = 8;
            } else if (ch === '%' || (y >= 4 && y <= 5 && (ch === '(' || ch === ')'))) {
              k = 18;                            // da mặt
            } else if (ch === 'E') {
              k = 19;                            // thắt lưng
            } else if (ch === 'G') {
              k = 5;                             // khóa vàng
            } else if (ch === 'K') {
              k = 16;                            // ủng
            } else {
              k = x >= 8 ? 17 : 4;               // áo/mũ đỏ, nửa phải tối hơn để có khối
            }
            sp(dx, y, ch, k, z);
          }
        }

        // Tay phải vẫy
        if (wavePhase > 0.35) {
          sp(10, 9, '/', 4); sp(11, 8, 'o', 7); sp(12, 7, '*', 11);
        } else if (wavePhase > -0.35) {
          sp(10, 10, '-', 4); sp(11, 9, 'o', 7); sp(12, 9, '+', 7);
        } else {
          sp(10, 10, '\\', 4); sp(11, 11, 'o', 7);
        }

        if (glowsRef) glowsRef.push((sc + 0.5) * cw, (r0 + 6) * chh, 4, al * 0.5);

        // Vị trí đầu ông già Noel để bóng nói (HTML) bám theo
        // đổi sang toạ độ màn hình (tính cả zoom/pan) để bóng nói & nút hỏi đáp bám đúng chỗ
        const sx = (sc + 0.5) * cw * zoom + panX;
        const sy = r0 * chh * zoom + panY;
        const sb = (rb + 1) * chh * zoom + panY;
        window.CGOR_SANTA = { x: sx, y: sy, b: sb, on: al > 0.5 && sx > -10 && sx < W + 10 && sb > 40 && sy < H };
      }

      function box(c0, w, h, rb, k, al) {
        const r0 = rb - h + 1;
        const B = '%#X@';
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const mid = x === (w >> 1) || (y === 1 && h > 3);
            if (hs(c0 + x, r0 + y) > al) continue;
            put(c0 + x, r0 + y, mid ? '+' : B[(hs(x, y + 9) * 4) | 0], mid ? 5 : k, 14, 0.6 + 0.4 * al);
          }
        }
        for (const dx of [-1, 0, 1]) {
          if (hs(c0 + dx, r0) < al) {
            put(c0 + (w >> 1) + dx, r0 - 1, dx ? (dx < 0 ? '(' : ')') : '@', 5, 14, 0.6 + 0.4 * al);
          }
        }
      }

      let ang = 0, angV = 0, t = 0, drag = false, lastX = 0, lastT = 0, moved = 0;
      let spawnAcc = 0, ss = null, nextSS = 2.5, fps = 60, hudT = 0, litCount = 0, fw = 2;

      function frame(now) {
        if (!alive) return;
        rafId = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - (frame.l || now)) / 1000);
        frame.l = now;
        if (!dt) return;

        t += dt;
        fps += (1 / dt - fps) * 0.05;
        bp = Math.min(1.3, bp + dt / 4.8);
        if (bp > 1.1) mT += dt;

        const T = { ...S, star: S.star && bp > 0.95, gifts: S.gifts && bp > 1.05, santa: S.santa && bp > 1.02 };
        if (hohoTimer > 0) hohoTimer = Math.max(0, hohoTimer - dt);

        for (const k in F) {
          F[k] += ((T[k] ? 1 : 0) - F[k]) * Math.min(1, dt * (k === 'lights' || k === 'garland' ? 2 : 3));
        }

        if (!isFinite(angV)) angV = 0.4;
        angV = drag
          ? angV * Math.exp(-dt * 9)
          : angV + ((S.spin ? 0.4 : 0) + (bp < 1.1 ? 0.45 : 0) - angV) * Math.min(1, dt * 1.5);
        ang += angV * dt;

        colr.fill(-1);
        zb.fill(-99);

        const glows = [];
        glowsRef = glows;
        const fr = (t * 16) | 0;
        const c0 = (cx / cw) | 0;
        const wb = Math.round((0.37 * treeH) / cw);

        for (const s of BG) {
          const v = Math.sin(t * s.sp + s.ph);
          put((s.fx * cols) | 0, (s.fy * rows) | 0, v > 0.5 ? '+' : v > -0.3 ? '.' : '*', v > 0.2 ? 7 : 13, -9);
        }

        if (F.aurora > 0.02) {
          const hb = (rows * 0.4) | 0;
          for (let c = 0; c < cols; c++) {
            for (let r = 0; r < hb; r++) {
              const v = (Math.sin(c * 0.13 + t * 0.6 + Math.sin(r * 0.3 + t * 0.4) * 1.6) * 0.5 + 0.5) * (1 - r / hb) * F.aurora;
              if (v > 0.3) {
                put(c, r, v > 0.7 ? '|' : v > 0.5 ? ':' : '.', [2, 14, 8][((c * 0.04 + t * 0.15) % 3) | 0], -7);
              }
            }
          }
        }

        nextSS -= dt;
        if (!ss && nextSS <= 0) {
          ss = { x: rnd() * cols * 0.5, y: rnd() * rows * 0.18, t: 0 };
          nextSS = 5 + rnd() * 6;
        }
        if (ss) {
          ss.t += dt;
          const hx = ss.x + ss.t * 62;
          const hy = ss.y + ss.t * 29;
          for (let j = 0; j < 13; j++) {
            put((hx - j) | 0, (hy - j * 0.47) | 0, j ? (j < 4 ? '=' : j < 8 ? '-' : '.') : '*', j ? (j < 4 ? 7 : j < 8 ? 10 : 9) : 11, -8);
          }
          if (hx > cols + 14 || hy > rows) ss = null;
        }

        for (let r = groundRow; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const h = hs(c, r * 3);
            if (h < 0.55 && Math.abs(c - cols / 2) / (cols / 2) < cl(bp * 3 + 0.3)) {
              put(c, r, h < 0.3 ? '-' : '.', h < 0.1 ? 10 : 13, -5);
            }
          }
        }

        const rTop = Math.floor((baseY - treeH) / chh) - 1;
        const rBot = Math.floor(baseY / chh);
        for (let r = rTop; r <= rBot; r++) {
          const y = (baseY - (r + 0.5) * chh) / treeH;
          if (y < 0 || y > 1) continue;
          const Rp = Rn(y) * treeH;
          const wc = Math.ceil(Rp / cw);
          const ft = (y * 8) % 1;

          for (let dc = -wc; dc <= wc; dc++) {
            const X = (c0 + dc + 0.5) * cw - cx;
            if (Math.abs(X) > Rp) continue;

            const xs = X / Rp;
            const psi = Math.asin(xs);
            const th = psi - ang;
            const cs = Math.cos(psi);
            const tu = (((Math.round((th / TAU) * 56)) % 56) + 56) % 56;
            const c = c0 + dc;

            const h = hs(tu, r);
            const h2 = hs(tu + 99, r);
            const h3 = hs(tu + 7, r + 3);
            const rv = bp >= 1.2 ? 1 : cl((bp - U(y, th, xs)) / 0.12);

            if (rv <= 0) {
              if (h < 0.4) put(c, r, SC[((h * 997) | 0 + fr) % SCL], h < 0.1 ? 12 : 13, 0);
              continue;
            }
            if (rv < 1) {
              put(c, r, SC[((h * 997) | 0 + fr * 2) % SCL], rv < 0.5 ? 7 : 14, cs * 0.3 + 0.05);
              continue;
            }
            if (h2 > 0.94) continue;

            const lum = cl((0.3 + 0.75 * cs * (0.75 + 0.25 * h2)) * (0.82 + 0.18 * (1 - ft)), 0, 0.999);
            const z = cs * 0.3;
            const tint = h3 < 0.04 ? 14 : h3 < 0.065 ? 7 : h3 < 0.082 ? 4 : h3 < 0.095 ? 15 : h3 < 0.103 ? 6 : h3 < 0.108 ? 17 : -1;

            put(
              c,
              r,
              CH[((h * CL + (((t * 1.5 + h2 * 5) | 0) * 7)) | 0) % CL],
              tint >= 0 ? tint : lum < 0.4 ? 0 : lum < 0.68 ? 1 : lum < 0.92 ? 2 : 3,
              z
            );
          }
        }

        for (const o of OR) {
          const psi = wrap(o.th + ang);
          const cs = Math.cos(psi);
          if (cs < 0.15) continue;

          const xs = Math.sin(psi);
          const a = cl(F.orn * 1.3 - o.i * 0.012) * cl((bp - U(o.y, o.th, xs)) / 0.12);
          if (a <= 0.04) continue;

          const px = cx + xs * Rn(o.y) * treeH * 0.97;
          const py = baseY - o.y * treeH;
          const c = (px / cw) | 0;
          const r = (py / chh) | 0;
          const w = o.y < 0.55 ? 1 : 0;

          for (let dy = -1; dy <= 1; dy++) {
            const ww = dy === 0 ? w + 1 : w;
            for (let dx = -ww; dx <= ww; dx++) {
              if (hs(c + dx * 3, r + dy * 5) < a) {
                put(c + dx, r + dy, dy === 0 ? '@' : '#', o.k, 0.7 + cs * 0.1, 0.7 + 0.3 * a);
              }
            }
          }
          if (hs(c, r) < a) put(c - w, r - 1, '*', 7, 0.9, 1);
          glows.push(px, py, o.k, a * 0.6);
        }

        litCount = 0;
        for (const l of LT) {
          const s = cl(F.lights * 1.4 - l.f * 0.4);
          if (s <= 0.02) continue;

          const psi = wrap(l.th + ang);
          const cs = Math.cos(psi);
          if (cs < 0.12) continue;

          const xs = Math.sin(psi);
          const rv = cl((bp - U(l.y, l.th, xs)) / 0.12);
          const a = s * rv;
          if (hs(l.i, 3) > a) continue;

          const v = 0.5 + 0.5 * Math.sin(t * l.sp + l.ph);
          const px = cx + xs * Rn(l.y) * treeH;
          const py = baseY - l.y * treeH;
          const c = (px / cw) | 0;
          const r = (py / chh) | 0;
          litCount++;

          put(c, r, v > 0.55 ? '@' : 'O', l.k, 1, 0.55 + 0.45 * v);
          if (v > 0.75) {
            put(c - 1, r, 'o', l.k, 0.95, 0.8);
            put(c + 1, r, 'o', l.k, 0.95, 0.8);
          }
          glows.push(px, py, l.k, v * a);
        }

        const sA = F.star;
        if (sA > 0.03) {
          const Ro = treeH * 0.06;
          const Ri = Ro * 0.45;
          const sx = cx;
          const sy = baseY - treeH - Ro * 0.3;
          const pu = Math.sin(t * 3);
          const sc = (sx / cw) | 0;
          const sr = (sy / chh) | 0;
          const RC = Math.ceil((Ro * 1.3) / cw);
          const RR = Math.ceil((Ro * 1.3) / chh);

          for (let dy = -RR; dy <= RR; dy++) {
            for (let dx = -RC; dx <= RC; dx++) {
              const X = dx * cw;
              const Y = dy * chh;
              const rr = Math.hypot(X, Y);
              const th = Math.atan2(Y, X) + Math.PI / 2;
              const rb = Ri + (Ro - Ri) * Math.pow(Math.abs(Math.cos(2.5 * th)), 1.6);

              if (rr <= rb && hs(sc + dx, sr + dy) < sA) {
                const q = rr / rb;
                put(sc + dx, sr + dy, q < 0.45 ? '@' : q < 0.8 ? '#' : '%', [11, 5, 15][((Math.floor(th * 1.6 + t * 4) % 3) + 3) % 3], 10);
              }
            }
          }

          const len = Ro * 1.1 + cw * (3 + pu * 1.5);
          for (let d8 = 0; d8 < 8; d8++) {
            const an = (d8 * Math.PI) / 4;
            const ux = Math.sin(an);
            const uy = -Math.cos(an);
            const ch = d8 % 4 === 0 ? '|' : d8 % 4 === 2 ? '-' : d8 === 1 || d8 === 5 ? '/' : '\\';
            for (let d = Ro * 1.1; d < (d8 % 2 ? len * 0.7 : len); d += cw * 0.9) {
              put(((sx + ux * d) / cw) | 0, ((sy + uy * d) / chh) | 0, ch, pu > 0 ? 11 : 5, 9, sA * (1 - (d / len) * 0.6));
            }
          }
          glows.push(sx, sy, 11, (0.9 + 0.2 * pu) * sA * 1.3);
        }

        for (const [o, w, h, k, i] of [[-wb - 1, 9, 5, 6, 0], [-6, 13, 3, 4, 1], [wb - 9, 9, 3, 17, 2]]) {
          const a = cl(F.gifts * 1.4 - i * 0.12);
          if (a > 0.03) box(c0 + o, w, h, groundRow + 2, k, a);
        }

        if (F.santa > 0.03) {
          const santaOffset = W < 640 ? wb + 7 : wb + 13;
          const santaCol = Math.max(8, c0 - santaOffset);
          drawSanta(santaCol, groundRow + 2, F.santa);
        } else {
          santaZone = null;
          if (window.CGOR_SANTA) window.CGOR_SANTA.on = false;
        }

        for (const f of SN) {
          if (!f.on && f.f < F.snow) {
            f.on = true;
            f.fy = -rnd();
          }
          if (!f.on) continue;
          f.fy += (f.v * dt) / rows;
          if (f.fy > 1) {
            f.fy -= 1;
            f.fx = rnd();
            if (f.f >= F.snow) {
              f.on = false;
              continue;
            }
          }
          if (f.fy < 0) continue;
          const c = (f.fx * cols + Math.sin(t * 0.9 + f.ph) * 2 + Math.sin(t * 0.35) * 9 * f.fy) | 0;
          put(((c % cols) + cols) % cols, (f.fy * rows) | 0, f.z > 0.3 ? '+' : f.z > -0.2 ? '*' : '.', f.z > 0.3 ? 7 : f.z > -0.2 ? 10 : 9, f.z);
        }

        spawnAcc += dt * 24 * F.sparkle * cl(bp - 0.6);
        while (spawnAcc > 1) {
          spawnAcc--;
          const y = 0.08 + 0.85 * rnd();
          const Rp = Rn(y) * treeH;
          spark(((cx + (rnd() * 2 - 1) * Rp * 0.95) / cw) | 0, ((baseY - y * treeH) / chh) | 0, 0, 0, 0.5 + rnd() * 0.8, SCOL[(rnd() * 5) | 0]);
        }

        fw -= dt * F.fire;
        if (fw <= 0) {
          fw = 1 + rnd() * 1.3;
          burst((cols * (0.12 + rnd() * 0.76)) | 0, (rows * (0.08 + rnd() * 0.28)) | 0, 70, [[4, 5], [14, 7], [8, 11], [2, 3, 5]][(rnd() * 4) | 0], 26);
        }

        for (let i = PT.length - 1; i >= 0; i--) {
          const p = PT[i];
          p.a += dt;
          if (p.a >= p.l) {
            PT[i] = PT[PT.length - 1];
            PT.pop();
            continue;
          }
          p.c += p.vx * dt;
          p.r += p.vy * dt;
          p.vy += 10 * dt;
          p.vx *= 1 - dt * 1.2;
          put(p.c | 0, p.r | 0, SPC[Math.min(4, (Math.sin((Math.PI * p.a) / p.l) * 4.99) | 0)], p.k, 12);
        }

        const shown = Math.min(msg.length, (mT * 9) | 0);
        const mr = groundRow + 4;
        if (mr < rows - 1) {
          const m0 = (cols - msg.length) >> 1;
          for (let i = 0; i < shown; i++) {
            if (msg[i] !== ' ') {
              put(m0 + i, mr, i === shown - 1 && shown < msg.length ? SC[(i * 3 + fr) % SCL] : msg[i], [4, 5, 2][((i >> 1) + ((t * 1.5) | 0)) % 3], 13);
            }
          }
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        // Camera: phóng to / kéo quét (nền trời ở trên vẫn phủ kín màn hình)
        ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, dpr * panX, dpr * panY);

        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < glows.length; i += 4) {
          const s = glows[i + 3] * cw * 5;
          ctx.globalAlpha = Math.min(1, glows[i + 3] * 0.4);
          ctx.drawImage(glow(glows[i + 2]), glows[i] - s / 2, glows[i + 1] - s / 2, s, s);
        }

        ctx.globalCompositeOperation = 'source-over';
        for (const b of buckets) b.length = 0;
        let cnt = 0;
        for (let i = 0; i < N; i++) {
          const k = colr[i];
          if (k >= 0) {
            buckets[k].push(i);
            cnt++;
          }
        }

        ctx.font = '700 ' + (cw / 0.6).toFixed(1) + 'px "JetBrains Mono",ui-monospace,Menlo,monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let k = 0; k < buckets.length; k++) {
          const b = buckets[k];
          if (!b.length) continue;
          ctx.fillStyle = PAL[k >> 3];
          ctx.globalAlpha = ((k & 7) + 1) / 8;
          for (let j = 0; j < b.length; j++) {
            const i = b[j];
            const r = (i / cols) | 0;
            ctx.fillText(chars[i], (i - r * cols + 0.5) * cw, (r + 0.5) * chh);
          }
        }

        ctx.globalAlpha = 1;
        hudT += dt;
        if (hudT > 0.25) {
          hudT = 0;
          $('hr').textContent = ((((ang * 180) / Math.PI) % 360 + 360) % 360).toFixed(1);
          $('hl').textContent = litCount;
          $('hc').textContent = cnt.toLocaleString('en-US');
          $('hf').textContent = Math.round(fps);
          $('tt').textContent = 't ' + t.toFixed(2).padStart(5, '0');
        }
      }

      // Chỉ cho xoay khi chạm/bấm trúng vùng cây thông (thân + tán + ngôi sao)
      function hitTree(px, py, pad) {
        const yN = (baseY - py) / treeH;      // 0 = gốc, 1 = đỉnh cây
        if (yN < -0.1 || yN > 1.1) return false;
        const yy = Math.min(1, Math.max(0, yN));
        const R = Math.max(0.03, Rn(yy)) * treeH + pad;
        return Math.abs(px - cx) <= R;
      }
      // ---------------- Camera: zoom + kéo quét ----------------
      let zoom = 1, panX = 0, panY = 0;
      const ZMAX = 4;
      const clampCam = () => {
        zoom = cl(zoom, 1, ZMAX);
        panX = cl(panX, W * (1 - zoom), 0);
        panY = cl(panY, H * (1 - zoom), 0);
      };
      const toWorld = (x, y) => ({ x: (x - panX) / zoom, y: (y - panY) / zoom });
      const zoomAt = (sx, sy, nz) => {
        const w = toWorld(sx, sy);
        zoom = cl(nz, 1, ZMAX);
        panX = sx - w.x * zoom;
        panY = sy - w.y * zoom;
        clampCam();
      };
      window.CGOR_CAM = () => ({ zoom, panX, panY });

      // ---------------- Con trỏ: chạm = pháo hoa · vuốt trên cây = xoay · vuốt ngoài cây = quét · 2 ngón = zoom ----------------
      const ptrs = new Map();
      let mode = 'none';      // 'rotate' | 'pan' | 'pinch' | 'none'
      let tapDown = false;
      let multi = false;
      let pinch = null;
      let lastY = 0;
      const pdist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
      const idleCursor = () => (zoom > 1.001 ? 'move' : 'default');

      on(cv, 'pointerdown', e => {
        ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        if (ptrs.size === 1) {
          moved = 0;
          multi = false;
          tapDown = true;
          lastX = e.clientX;
          lastY = e.clientY;
          lastT = performance.now();
          const w = toWorld(e.clientX, e.clientY);
          const pad = (e.pointerType === 'touch' ? 0.07 : 0.03) * treeH;
          if (hitTree(w.x, w.y, pad)) {
            drag = true;
            mode = 'rotate';
            cv.style.cursor = 'grabbing';
          } else {
            drag = false;
            mode = zoom > 1.001 ? 'pan' : 'none';
            if (mode === 'pan') cv.style.cursor = 'grabbing';
          }
        } else if (ptrs.size === 2) {
          multi = true;
          tapDown = false;
          drag = false;
          mode = 'pinch';
          const [a, b] = [...ptrs.values()];
          pinch = { d: pdist(a, b) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
        }
      });

      on(cv, 'pointermove', e => {
        const p = ptrs.get(e.pointerId);
        if (!p) {
          if (e.pointerType === 'mouse') {
            const w = toWorld(e.clientX, e.clientY);
            cv.style.cursor = hitTree(w.x, w.y, 0.03 * treeH) ? 'grab' : idleCursor();
          }
          return;
        }
        p.x = e.clientX;
        p.y = e.clientY;

        if (mode === 'pinch' && ptrs.size >= 2 && pinch) {
          const [a, b] = [...ptrs.values()];
          const d = pdist(a, b) || 1;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const w = toWorld(pinch.mx, pinch.my);      // điểm thế giới đang nằm dưới trung điểm 2 ngón
          zoom = cl(zoom * (d / pinch.d), 1, ZMAX);
          panX = mx - w.x * zoom;
          panY = my - w.y * zoom;
          clampCam();
          pinch.d = d;
          pinch.mx = mx;
          pinch.my = my;
          return;
        }
        if (ptrs.size > 1) return;

        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const n = performance.now();
        moved += Math.abs(dx) + Math.abs(dy);
        if (mode === 'rotate') {
          const d = Math.max(1, n - lastT) / 1000;
          ang += dx * 0.01;
          angV = cl(angV * 0.5 + ((dx * 0.01) / d) * 0.5, -6, 6);
        } else if (mode === 'pan') {
          panX += dx;
          panY += dy;
          clampCam();
        }
        lastX = e.clientX;
        lastY = e.clientY;
        lastT = n;
      });

      function endPointer(e, cancelled) {
        if (!ptrs.has(e.pointerId)) return;
        ptrs.delete(e.pointerId);

        if (ptrs.size === 0) {
          const wasTap = tapDown && !multi && !cancelled && moved < 6;
          drag = false;
          tapDown = false;
          mode = 'none';
          pinch = null;
          if (e.pointerType === 'mouse') {
            const w = toWorld(e.clientX, e.clientY);
            cv.style.cursor = hitTree(w.x, w.y, 0.03 * treeH) ? 'grab' : idleCursor();
          } else {
            cv.style.cursor = idleCursor();
          }
          if (wasTap) {
            const w = toWorld(e.clientX, e.clientY);
            const clickC = (w.x / cw) | 0;
            const clickR = (w.y / chh) | 0;
            if (
              santaZone &&
              clickC >= santaZone.c1 &&
              clickC <= santaZone.c2 &&
              clickR >= santaZone.r1 &&
              clickR <= santaZone.r2
            ) {
              hohoTimer = 2.2;
              if (window.LofiXmas) window.LofiXmas.playHoHoHo();
              if (window.CGOR_santaHoHo) window.CGOR_santaHoHo();
              burst((santaZone.c1 + santaZone.c2) >> 1, santaZone.r1 - 1, 55, [4, 7, 5, 11], 22);
            } else {
              burst(clickC, clickR);
            }
          }
        } else if (ptrs.size === 1) {
          // nhả bớt 1 ngón sau khi zoom: ngón còn lại chuyển sang kéo quét (không tính là chạm)
          const r = [...ptrs.values()][0];
          lastX = r.x;
          lastY = r.y;
          lastT = performance.now();
          pinch = null;
          drag = false;
          mode = zoom > 1.001 ? 'pan' : 'none';
        }
      }
      on(cv, 'pointerup', e => endPointer(e, false));
      on(cv, 'pointercancel', e => endPointer(e, true));

      on(window, 'blur', () => { drag = false; tapDown = false; mode = 'none'; ptrs.clear(); });
      on(document, 'visibilitychange', () => { drag = false; tapDown = false; mode = 'none'; ptrs.clear(); });

      const bar = $('bar');
      const barRefs = {};

      function mk(idKey, fn, stateKey) {
        const b = document.createElement('button');
        if (stateKey) b.setAttribute('aria-pressed', S[stateKey]);
        b.onclick = () => {
          if (stateKey) {
            S[stateKey] = !S[stateKey];
            b.setAttribute('aria-pressed', S[stateKey]);
          }
          fn && fn(b);
        };
        bar.appendChild(b);
        barRefs[idKey] = b;
        return b;
      }

      const musicBtn = mk('music', () => {
        if (window.LofiXmas) window.LofiXmas.toggle();
      });
      musicBtn.id = 'btn-music';
      musicBtn.style.display = 'none';

      const songBtn = mk('song', () => {
        if (window.LofiXmas) window.LofiXmas.nextSong();
      });
      songBtn.style.display = 'none';

      const replay = () => { bp = -0.25; mT = 0; };
      mk('replay', replay);
      mk('style', b => {
        MODE = (MODE + 1) % 4;
        const bDict = window.CGOR_I18N[window.getCGORLang()].bar;
        b.textContent = bDict.style + ': ' + bDict.modes[MODE];
        replay();
      });

      ['spin', 'lights', 'orn', 'star', 'gifts', 'santa', 'snow', 'sparkle', 'aurora', 'fire'].forEach(k => {
        mk(k, null, k);
      });

      mk('burst', () => {
        for (let i = 0; i < 3; i++) {
          burst((cols * (0.25 + rnd() * 0.5)) | 0, (rows * (0.2 + rnd() * 0.4)) | 0);
        }
      });

      barLang = function (lang) {
        const bDict = window.CGOR_I18N[lang].bar;
        for (const k in barRefs) {
          if (k === 'style') {
            barRefs[k].textContent = bDict.style + ': ' + bDict.modes[MODE];
          } else if (k === 'song') {
            barRefs[k].textContent = '🎵 ' + (window.LofiXmas ? window.LofiXmas.getSongName() : '');
          } else {
            barRefs[k].textContent = bDict[k];
          }
        }
      };

      barLang(window.getCGORLang());

      on(window, 'resize', () => {
        const ae = document.activeElement;
        const typing = ae && /^(INPUT|TEXTAREA)$/.test(ae.tagName);
        if (typing && Math.abs(innerWidth - W) < 2) return;   // chỉ bàn phím bật/tắt → giữ nguyên bố cục
        resize();
        clampCam();
      });
      resize();
      rafId = requestAnimationFrame(frame);

      cleanup = function () {
        alive = false;
        cancelAnimationFrame(rafId);
        disposers.forEach(d => d());
        ptrs.clear();
        bar.textContent = '';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, cv.width, cv.height);
        cv.style.cursor = '';
        window.CGOR_SANTA = { x: 0, y: 0, b: 0, on: false };
        window.CGOR_CAM = () => ({ zoom: 1, panX: 0, panY: 0 });
        barLang = null;
      };
    }
  }

  function unmount() {
    if (!cleanup) return;
    cleanup();
    cleanup = null;
  }

  window.CGOR_SPACES = window.CGOR_SPACES || {};
  window.CGOR_SPACES.space1 = { id: 'space1', mount: mount, unmount: unmount };
})();
