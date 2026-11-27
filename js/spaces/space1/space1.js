/* Space 1 — Cây thông Noel 3D ASCII + Ông già Noel + tuyết rơi.
   Logic & đồ họa giữ nguyên từ scene.js cũ; chỉ bọc trong vòng đời mount()/unmount(). */
(function () {
  'use strict';
  let cleanup = null;
  let barLang = null;

  // Bộ điều phối ổn định: control-panel.js bọc hàm này khi nạp, nên phải tồn tại từ lúc nạp file
  // (không được gán lại trong mount()).
  window.updateBarLanguage = function (lang) { if (barLang) barLang(lang); };

  /* ---------------------------------------------------------------------
     CHÒM SAO TÊN & DANH HIỆU LƠ LỬNG
     - Tên thuần (không kèm huy hiệu) → 1 cụm chòm sao + tên 11px.
     - Mỗi danh hiệu/badge → 1 thực thể riêng, trôi độc lập quanh vị trí "nhà".
     - Vị trí nhà được chọn sao cho KHÔNG chạm: cây thông/ngôi sao, Ông già Noel,
       dòng MERRY CHRISTMAS, và mọi nút/bảng điều khiển đang hiển thị (DOM).
     - Mọi nội dung gán bằng textContent (chống XSS).
     --------------------------------------------------------------------- */
  const NS = 'http://www.w3.org/2000/svg';
  const SKY_DOM = [
    '#deck-canvas', '#deck-panel', '#ctl-btn', '#ctl-panel', '#qa-btn', '#qa-box',
    '#santa-bubble', '#top-tools', '#hud', '#tt', '#cd-box', '#noti-box',
    '#mailbox', '#add-song-box', '#dev-credit'
  ];
  const SKY_AMP = 16;   // biên độ trôi tối đa (px)
  const SKY_PAD = 8;    // khoảng đệm an toàn quanh vật thể
  const SKY_TOP = 64;   // dưới thanh thông tin phía trên
  const SKY_GROUND = 12; // khoảng cách an toàn phía trên vạch đất / mặt tuyết
  const MAX_FLING = 1100; // tốc độ quán tính tối đa khi thả (px/s)
  const clampB = (v, lo, hi) => (hi < lo ? lo : v < lo ? lo : v > hi ? hi : v);

  // Tên & danh hiệu lấy từ social.js (không đọc DOM cũ, không có pill)
  function skyIdentity() {
    let u = null;
    try { u = window.CGOR_GET_USER ? window.CGOR_GET_USER() : null; } catch (e) { u = null; }
    if (u && u.username) {
      const badges = String(u.badge || '').split(',')
        .map(b => b.trim())
        .filter(b => b && b.toLowerCase() !== 'def');
      return { name: String(u.displayName || u.username), badges };
    }
    let guest = '';
    try { guest = localStorage.getItem('xmas_custom_name') || ''; } catch (e) {}
    return { name: guest || 'AetheRiss', badges: [] };
  }

  /* Bộ mẫu chòm sao: toạ độ điểm trong khung 0–100; nét nối = cặp chỉ số điểm [i, j].
     Mỗi mẫu tối đa CONS_N điểm và CONS_E nét; phần dư được ẩn khi chuyển mẫu. */
  const CONS_W = 150, CONS_H = 62;
  const CONS_N = 12, CONS_E = 14;
  const CONS_S = 0.58;                                  // tỉ lệ khung 100 → px
  const CONS_OX = (CONS_W - 100 * CONS_S) / 2, CONS_OY = 2;
  const CONS_DUR = 1200;                                // thời gian chuyển mẫu (ms)
  const CONS_PATTERNS = [
    // 12 cung hoàng đạo
    { p: [[15,30],[30,55],[50,65],[70,55],[85,30],[12,18],[88,18]], // Bạch Dương
      e: [[0,1],[1,2],[2,3],[3,4],[0,5],[4,6]] },
    { p: [[15,20],[35,45],[50,55],[65,45],[85,20],[35,70],[50,80],[65,70]], // Kim Ngưu
      e: [[0,1],[1,2],[2,3],[3,4],[1,5],[5,6],[6,7],[7,3]] },
    { p: [[25,10],[25,90],[75,10],[75,90],[15,15],[35,15],[65,15],[85,15],[15,90],[35,90],[65,90],[85,90]], // Song Tử
      e: [[0,1],[2,3],[4,0],[0,5],[6,2],[2,7],[1,8],[1,9],[3,10],[3,11]] },
    { p: [[10,40],[25,25],[45,30],[50,50],[35,60],[15,55],[90,60],[75,75],[55,70],[60,85],[80,90],[92,80]], // Cự Giải
      e: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[6,7],[7,8],[8,9],[9,10],[10,11]] },
    { p: [[25,30],[40,15],[60,18],[70,35],[55,50],[40,45],[60,70],[75,85],[90,80],[15,80],[25,70]], // Sư Tử
      e: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[4,6],[6,7],[7,8],[5,9],[9,10]] },
    { p: [[10,80],[10,20],[30,50],[50,20],[50,80],[62,80],[75,60],[90,70],[85,85]], // Xử Nữ
      e: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]] },
    { p: [[50,15],[12,35],[88,35],[15,62],[35,62],[65,62],[85,62],[50,80]], // Thiên Bình
      e: [[0,7],[1,2],[1,3],[3,4],[2,5],[5,6],[0,1],[0,2]] },
    { p: [[10,20],[10,55],[22,68],[35,55],[35,20],[48,70],[62,60],[70,45],[78,35],[90,30],[84,20]], // Bọ Cạp
      e: [[0,1],[1,2],[2,3],[3,4],[3,5],[5,6],[6,7],[7,8],[8,9],[9,10]] },
    { p: [[12,88],[78,22],[58,22],[78,42],[25,30],[42,42],[30,55],[50,50]], // Nhân Mã
      e: [[0,1],[1,2],[1,3],[4,5],[5,6],[4,6],[5,7]] },
    { p: [[15,15],[30,35],[50,40],[65,25],[55,60],[75,75],[90,65],[80,55],[70,85],[85,92],[95,80]], // Ma Kết
      e: [[0,1],[1,2],[2,3],[2,4],[4,5],[5,6],[6,7],[7,4],[5,8],[8,9],[9,10]] },
    { p: [[10,35],[25,25],[40,35],[55,25],[70,35],[85,25],[10,65],[25,55],[40,65],[55,55],[70,65],[85,55]], // Bảo Bình
      e: [[0,1],[1,2],[2,3],[3,4],[4,5],[6,7],[7,8],[8,9],[9,10],[10,11]] },
    { p: [[15,15],[10,40],[15,65],[85,15],[90,40],[85,65],[20,40],[50,45],[80,40]], // Song Ngư
      e: [[0,1],[1,2],[3,4],[4,5],[1,6],[6,7],[7,8],[8,4]] },
    // Chủ đề Giáng Sinh
    { p: [[50,8],[30,30],[70,30],[38,42],[62,42],[30,58],[50,70],[70,58],[25,85],[75,85]], // Ông già Noel
      e: [[0,1],[0,2],[1,2],[1,3],[2,4],[3,5],[5,6],[6,7],[7,4],[6,8],[7,9],[8,9]] },
    { p: [[50,5],[35,28],[65,28],[22,52],[78,52],[10,75],[90,75],[50,75],[50,92]], // Cây thông
      e: [[0,1],[0,2],[1,3],[2,4],[3,4],[3,5],[4,6],[5,6],[5,7],[6,7],[7,8]] },
    { p: [[50,5],[95,38],[78,92],[22,92],[5,38]], // Ngôi sao
      e: [[0,2],[2,4],[4,1],[1,3],[3,0]] },
    { p: [[50,50],[50,8],[86,29],[86,71],[50,92],[14,71],[14,29]], // Bông tuyết
      e: [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,2],[2,3],[3,4],[4,5],[5,6],[6,1]] },
    { p: [[15,40],[85,40],[85,85],[15,85],[10,28],[90,28],[90,40],[10,40],[50,28],[35,12],[65,12],[50,85]], // Hộp quà
      e: [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[8,9],[8,10],[8,11]] }
  ];

  function makeConstellation(name, auto) {
    const wrap = document.createElement('div');
    wrap.className = 'sp1-cons';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'sp1-cons-svg');
    svg.setAttribute('width', CONS_W);
    svg.setAttribute('height', CONS_H);
    svg.setAttribute('viewBox', '0 0 ' + CONS_W + ' ' + CONS_H);

    const lines = [], dots = [], circles = [];
    for (let k = 0; k < CONS_E; k++) {
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('class', 'sp1-line sp1-off');
      svg.appendChild(ln);
      lines.push(ln);
    }
    for (let i = 0; i < CONS_N; i++) {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'sp1-dot sp1-off');
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('class', 'sp1-star');
      c.setAttribute('r', (1.1 + Math.random()).toFixed(2));
      c.style.animationDelay = (-Math.random() * 3.2).toFixed(2) + 's';
      g.appendChild(c);
      svg.appendChild(g);
      dots.push(g);
      circles.push(c);
    }

    // Trạng thái: vị trí đang hiển thị (cur), điểm đầu/cuối của lần chuyển (from/to)
    const cur = [];
    for (let i = 0; i < CONS_N; i++) cur.push({ x: CONS_W / 2, y: CONS_H / 2 });
    let edges = [], count = 0, from = null, to = null, t0 = 0, anim = false, nextAt = 0, last = -1;

    function paint() {
      for (let i = 0; i < CONS_N; i++) {
        circles[i].setAttribute('cx', cur[i].x.toFixed(1));
        circles[i].setAttribute('cy', cur[i].y.toFixed(1));
      }
      for (let k = 0; k < CONS_E; k++) {
        const ed = edges[k];
        const ln = lines[k];
        if (!ed) { ln.classList.add('sp1-off'); continue; }
        ln.classList.remove('sp1-off');
        ln.setAttribute('x1', cur[ed[0]].x.toFixed(1));
        ln.setAttribute('y1', cur[ed[0]].y.toFixed(1));
        ln.setAttribute('x2', cur[ed[1]].x.toFixed(1));
        ln.setAttribute('y2', cur[ed[1]].y.toFixed(1));
      }
    }

    function setPattern(idx, now, instant) {
      last = idx;
      const pat = CONS_PATTERNS[idx];
      edges = pat.e;
      count = pat.p.length;
      const goal = cur.map((c, i) => i < count
        ? { x: CONS_OX + pat.p[i][0] * CONS_S, y: CONS_OY + pat.p[i][1] * CONS_S }
        : { x: c.x, y: c.y });
      for (let i = 0; i < CONS_N; i++) dots[i].classList.toggle('sp1-off', i >= count);
      if (instant) {
        for (let i = 0; i < CONS_N; i++) { cur[i].x = goal[i].x; cur[i].y = goal[i].y; }
        anim = false;
      } else {
        from = cur.map(c => ({ x: c.x, y: c.y }));
        to = goal;
        t0 = now;
        anim = true;
      }
      nextAt = now + 6000 + Math.random() * 4000;   // chu kỳ 6–10 s
      paint();
    }

    // Gọi mỗi khung hình (từ vòng lặp của createSky): nội suy mượt, rồi đến lúc thì đổi mẫu khác
    function step(now) {
      if (anim) {
        let k = (now - t0) / CONS_DUR;
        if (k >= 1) { k = 1; anim = false; }
        const e = k * k * (3 - 2 * k);
        for (let i = 0; i < CONS_N; i++) {
          cur[i].x = from[i].x + (to[i].x - from[i].x) * e;
          cur[i].y = from[i].y + (to[i].y - from[i].y) * e;
        }
        paint();
      } else if (auto && now >= nextAt) {
        let idx;
        do { idx = (Math.random() * CONS_PATTERNS.length) | 0; } while (idx === last);
        setPattern(idx, now, false);
      }
    }

    setPattern((Math.random() * CONS_PATTERNS.length) | 0, performance.now(), true);

    const label = document.createElement('div');
    label.className = 'sp1-cname';
    const chars = Array.from(name);
    label.textContent = chars.slice(0, 24).join('') + (chars.length > 24 ? '…' : '');

    wrap.appendChild(svg);
    wrap.appendChild(label);
    wrap.appendChild(makeHalo(11));
    return { el: wrap, step };
  }

  // Hào quang: các ngôi sao sáng nhỏ xếp thành vòng quanh chữ, quay & nhấp nháy (chỉ trang trí, không nhận chuột)
  function makeHalo(count) {
    const halo = document.createElement('div');
    halo.className = 'sp1-halo';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'sp1-hs';
      const a = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const rr = 0.84 + Math.random() * 0.16;
      s.style.left = (50 + Math.cos(a) * 49 * rr).toFixed(1) + '%';
      s.style.top = (50 + Math.sin(a) * 47 * rr).toFixed(1) + '%';
      const d = (2 + Math.random() * 2.2).toFixed(1) + 'px';
      s.style.width = d;
      s.style.height = d;
      s.style.animationDelay = (-Math.random() * 2.4).toFixed(2) + 's';
      halo.appendChild(s);
    }
    return halo;
  }

  function makeBadge(text) {
    const el = document.createElement('div');
    el.className = 'sp1-badge';
    el.textContent = text;
    el.appendChild(makeHalo(6));
    return el;
  }

  function skyOverlap(a, b, pad) {
    return a.x < b.x + b.w + pad && a.x + a.w > b.x - pad &&
           a.y < b.y + b.h + pad && a.y + a.h > b.y - pad;
  }

  function createSky(opt) {
    const amp = opt.calm ? 0 : SKY_AMP;
    const root = document.createElement('div');
    root.className = 'sp1-sky space1-only';
    root.setAttribute('aria-hidden', 'true');
    const probe = document.createElement('div');   // đọc vùng an toàn iPhone (env(safe-area-inset-*))
    probe.className = 'sp1-safe';
    root.appendChild(probe);
    document.body.appendChild(root);

    let items = [];
    let safe = { t: 0, r: 0, b: 0, l: 0 };
    let alive = true, raf = 0, timer = 0, resizeTimer = 0, last = 0;
    const t0 = performance.now();

    function readSafe() {
      const cs = getComputedStyle(probe);
      const v = p => parseFloat(cs.getPropertyValue(p)) || 0;
      safe = { t: v('padding-top'), r: v('padding-right'), b: v('padding-bottom'), l: v('padding-left') };
    }

    // Biên trôi của cụm (toạ độ "nhà", chưa tính dao động). Biên dưới luôn nằm TRÊN vạch đất.
    function bounds(it) {
      const g = opt.ground();
      let minX = safe.l + SKY_PAD + amp;
      let maxX = innerWidth - safe.r - it.w - SKY_PAD - amp;
      // Màn hình hẹp: nới đệm nhưng vẫn giữ cụm nằm trọn trong khung nhìn
      if (maxX < minX) { minX = safe.l; maxX = Math.max(minX, innerWidth - safe.r - it.w); }
      let maxY = Math.min(innerHeight - safe.b - it.h - amp, g - SKY_GROUND - it.h - amp);
      let minY = SKY_TOP + safe.t + amp;
      // Màn hình thấp (landscape): ưu tiên đứng trên vạch đất, trần thanh công cụ được nới
      if (maxY < minY) minY = Math.max(0, Math.min(SKY_TOP + safe.t, maxY));
      return { minX, maxX, minY, maxY };
    }

    // Vật thể cần tránh: hình học Space 1 (opt.worldRects) + các phần tử DOM đang hiển thị
    function obstacles() {
      const out = opt.worldRects();
      for (const sel of SKY_DOM) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width >= 2 && r.height >= 2) out.push({ x: r.left, y: r.top, w: r.width, h: r.height });
      }
      return out;
    }

    // Vùng cấm cây thông 3D: nếu cụm chồng lên → dịch sang trái/phải/trên đỉnh (nơi gần nhất còn trong biên),
    // đồng thời đảo vận tốc để rời xa tâm cây. Không bao giờ hút vào tâm.
    function pushFromTree(it, p, vel) {
      const tb = opt.treeBox && opt.treeBox();
      if (!tb || tb.w < 2 || tb.h < 2) return p;
      const pad = 2;   // treeBox là lõi cây (đã thu hẹp): cho phép lướt qua mép tán, chỉ đẩy nhẹ sang bên
      if (!skyOverlap({ x: p.x, y: p.y, w: it.w, h: it.h }, tb, pad)) return p;
      const b = bounds(it);
      const cand = [
        { x: tb.x - it.w - pad, y: p.y, d: 'l' },
        { x: tb.x + tb.w + pad, y: p.y, d: 'r' }
      ];
      let best = null, bestD = Infinity;
      for (const c of cand) {
        if (c.x < b.minX - 0.5 || c.x > b.maxX + 0.5 || c.y < b.minY - 0.5 || c.y > b.maxY + 0.5) continue;
        const dd = Math.abs(c.x - p.x) + Math.abs(c.y - p.y);
        if (dd < bestD) { bestD = dd; best = c; }
      }
      if (!best) {   // hết chỗ: dạt về phía có nhiều khoảng trống hơn, kẹp trong biên
        const goLeft = (p.x + it.w / 2) < (tb.x + tb.w / 2);   // dạt về phía đang ở gần hơn
        best = { x: goLeft ? tb.x - it.w - pad : tb.x + tb.w + pad, y: p.y, d: goLeft ? 'l' : 'r' };
      }
      const out = { x: clampB(best.x, b.minX, b.maxX), y: clampB(best.y, b.minY, b.maxY) };
      if (vel) {
        const away = best.d === 'l' ? -1 : 1;
        vel.x = away * (Math.abs(vel.x) * 0.6 + 30);   // đổi hướng nhẹ, không đẩy lên trên
      }
      return out;
    }

    const fitsObs = (r, obs) => !obs.some(o => skyOverlap(r, o, amp + SKY_PAD));
    const others = it => items
      .filter(o => o !== it && o.home && !o.hidden)
      .map(o => ({ x: o.home.x, y: o.home.y, w: o.w, h: o.h }));

    // Chọn "nhà": ưu tiên chỗ không chạm vật thể; nếu không có thì lấy chỗ chạm ít nhất. Không bao giờ trả về null (không ẩn).
    function findHome(it, obs) {
      const { minX, maxX, minY, maxY } = bounds(it);
      const oth = others(it);
      const cost = (x, y) => {
        const r = { x, y, w: it.w, h: it.h };
        let c = 0;
        for (const o of obs) if (skyOverlap(r, o, amp + SKY_PAD)) c++;
        for (const o of oth) if (skyOverlap(r, o, 2 * amp + SKY_PAD)) c++;
        return c;
      };
      let best = { x: minX, y: minY }, bestC = Infinity;
      const test = (x, y) => {
        const c = cost(x, y);
        if (c === 0) return true;
        if (c < bestC) { bestC = c; best = { x, y }; }
        return false;
      };
      for (let k = 0; k < 90; k++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        if (test(x, y)) return pushFromTree(it, { x, y });
      }
      const nx = Math.max(1, Math.ceil((maxX - minX) / 16));
      const ny = Math.max(1, Math.ceil((maxY - minY) / 16));
      for (let j = 0; j <= ny; j++) {
        for (let i = 0; i <= nx; i++) {
          const x = minX + ((maxX - minX) * i) / nx;
          const y = minY + ((maxY - minY) * j) / ny;
          if (test(x, y)) return pushFromTree(it, { x, y });
        }
      }
      return pushFromTree(it, best);
    }

    function sync(it) {
      it.el.classList.toggle('is-hidden', !!it.hidden);
    }

    // Kéo thả 1 cụm/1 danh hiệu. Chặn lan truyền sự kiện để không xoay/quét cảnh Space 1.
    function bindDrag(it) {
      const el = it.el;
      const down = e => {
        if (e.button > 0 || it.hidden) return;
        e.stopPropagation();
        e.preventDefault();
        it.cur.x += it.ox; it.cur.y += it.oy;   // giữ đúng vị trí đang hiển thị, không giật
        it.ox = 0; it.oy = 0;
        it.off.x = e.clientX - it.cur.x;
        it.off.y = e.clientY - it.cur.y;
        it.vel.x = 0; it.vel.y = 0;
        it.samp.x = e.clientX; it.samp.y = e.clientY; it.samp.t = performance.now();
        it.drag = true;
        el.classList.add('is-drag');
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
      };
      const move = e => {
        if (!it.drag) return;
        e.stopPropagation();
        const now = performance.now();
        const dt = (now - it.samp.t) / 1000;
        if (dt > 0.004) {
          const ivx = (e.clientX - it.samp.x) / dt, ivy = (e.clientY - it.samp.y) / dt;
          it.vel.x = it.vel.x * 0.5 + ivx * 0.5;
          it.vel.y = it.vel.y * 0.5 + ivy * 0.5;
          it.samp.x = e.clientX; it.samp.y = e.clientY; it.samp.t = now;
        }
        const b = bounds(it);
        it.cur.x = clampB(e.clientX - it.off.x, b.minX, b.maxX);
        it.cur.y = clampB(e.clientY - it.off.y, b.minY, b.maxY);
        const pf = pushFromTree(it, it.cur);   // kéo vào cây thông → kẹp ra ngoài biên cây
        it.cur.x = pf.x; it.cur.y = pf.y;
      };
      const up = e => {
        if (!it.drag) return;
        e.stopPropagation();
        it.drag = false;
        el.classList.remove('is-drag');
        try { el.releasePointerCapture(e.pointerId); } catch (err) {}
        const idle = performance.now() - it.samp.t > 90;   // đứng yên trước khi thả → không quán tính
        let vx = idle ? 0 : it.vel.x, vy = idle ? 0 : it.vel.y;
        const sp = Math.hypot(vx, vy);
        if (sp > MAX_FLING) { vx *= MAX_FLING / sp; vy *= MAX_FLING / sp; }
        it.vel.x = vx; it.vel.y = vy;
        it.roam = performance.now() + 2500 + Math.random() * 3000;   // thả xong sẽ bay tiếp tự nhiên
        if (Math.hypot(vx, vy) < 8) { it.vel.x = 0; it.vel.y = 0; it.home = { x: it.cur.x, y: it.cur.y }; }
      };
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('lostpointercapture', up);
      return () => {
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        el.removeEventListener('lostpointercapture', up);
      };
    }

    function build() {
      readSafe();
      items.forEach(it => { it.unbind(); it.el.remove(); });
      const id = skyIdentity();
      const cons = makeConstellation(id.name, !opt.calm);
      const els = [cons.el].concat(id.badges.map(makeBadge));
      items = [];
      els.forEach(el => {
        root.appendChild(el);
        const it = {
          el,
          morph: el === cons.el ? cons : null,
          w: el.offsetWidth,
          h: el.offsetHeight,
          home: null,
          cur: { x: 0, y: 0 },
          vel: { x: 0, y: 0 },
          off: { x: 0, y: 0 },
          samp: { x: 0, y: 0, t: 0 },
          ox: 0, oy: 0,
          roam: performance.now() + 3000 + Math.random() * 5000,   // lần đổi hướng bay kế tiếp
          drag: false,
          hidden: true,
          ph: Math.random() * Math.PI * 2,
          fx: 0.42 + Math.random() * 0.42,   // nhanh hơn rõ rệt so với bản trước
          fy: 0.36 + Math.random() * 0.4,
          ax: amp * (0.5 + Math.random() * 0.6),
          ay: amp * (0.4 + Math.random() * 0.5)
        };
        it.unbind = bindDrag(it);
        items.push(it);
      });
      const obs = obstacles();
      items.forEach(it => {
        it.home = findHome(it, obs);
        it.cur = { x: it.home.x, y: it.home.y };
        it.hidden = false;
        sync(it);
      });
    }

    // Mỗi ~1s: đo lại kích thước (font có thể tải muộn), kẹp "nhà" vào khung nhìn hiện tại,
    // và nếu có vật thể mới đè lên (ví dụ mở bảng) thì tìm chỗ khác
    function tick() {
      if (!alive) return;
      const obs = obstacles();
      items.forEach(it => {
        const w = it.el.offsetWidth, h = it.el.offsetHeight;
        if (w && h) { it.w = w; it.h = h; }
        if (it.drag) return;   // đang kéo: không đổi nhà
        const b = bounds(it);
        it.home.x = clampB(it.home.x, b.minX, b.maxX);
        it.home.y = clampB(it.home.y, b.minY, b.maxY);
        it.home = pushFromTree(it, it.home);
        const curRect = { x: it.cur.x, y: it.cur.y, w: it.w, h: it.h };
        const homeRect = { x: it.home.x, y: it.home.y, w: it.w, h: it.h };
        if (!fitsObs(curRect, obs) || !fitsObs(homeRect, obs)) it.home = findHome(it, obs);
        sync(it);
      });
    }

    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const tt = (now - t0) / 1000;
      const k = Math.min(1, dt * 1.2);
      for (const it of items) {
        if (it.morph) it.morph.step(now);
        if (!it.drag) {
          const b = bounds(it);
          if (it.vel.x || it.vel.y) {
            // quán tính sau khi thả: trôi tiếp rồi dừng lại, điểm dừng thành "nhà" mới
            it.cur.x += it.vel.x * dt;
            it.cur.y += it.vel.y * dt;
            const f = Math.exp(-dt * 3.2);
            it.vel.x *= f; it.vel.y *= f;
            if (it.cur.x < b.minX || it.cur.x > b.maxX) { it.cur.x = clampB(it.cur.x, b.minX, b.maxX); it.vel.x *= -0.4; }
            if (it.cur.y < b.minY || it.cur.y > b.maxY) { it.cur.y = clampB(it.cur.y, b.minY, b.maxY); it.vel.y *= -0.4; }
            if (Math.hypot(it.vel.x, it.vel.y) < 8) {
              it.vel.x = 0; it.vel.y = 0;
              it.home = { x: it.cur.x, y: it.cur.y };
            }
          } else {
            // Định kỳ chọn điểm đến mới trong toàn vùng trời (kể cả hai bên gốc cây) để bay linh hoạt, không đứng yên
            if (!opt.calm && now >= it.roam) {
              it.roam = now + 5000 + Math.random() * 6000;
              it.home = findHome(it, obstacles());
            }
            it.cur.x += (it.home.x - it.cur.x) * k;
            it.cur.y += (it.home.y - it.cur.y) * k;
          }
          it.cur.x = clampB(it.cur.x, b.minX, b.maxX);
          it.cur.y = clampB(it.cur.y, b.minY, b.maxY);
          const pf = pushFromTree(it, it.cur, it.vel);   // trôi/quán tính vào cây thông → đẩy bật ra
          it.cur.x = pf.x; it.cur.y = pf.y;
          it.home = pushFromTree(it, it.home);
          it.ox = Math.sin(tt * it.fx + it.ph) * it.ax;
          it.oy = Math.cos(tt * it.fy + it.ph * 1.3) * it.ay;
        }
        const x = it.cur.x + it.ox;
        const y = it.cur.y + it.oy;
        it.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      }
    }

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    };
    // Đổi tên ở tab khác / hồ sơ cập nhật → dựng lại cụm tên ngay
    const onStore = e => { if (!e || e.key === 'xmas_custom_name') build(); };
    window.addEventListener('cgor-auth', build);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('storage', onStore);

    build();
    raf = requestAnimationFrame(frame);
    timer = setInterval(tick, 1000);

    return {
      destroy() {
        alive = false;
        cancelAnimationFrame(raf);
        clearInterval(timer);
        clearTimeout(resizeTimer);
        window.removeEventListener('cgor-auth', build);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
        window.removeEventListener('storage', onStore);
        items.forEach(it => it.unbind());
        items = [];
        root.remove();
      }
    };
  }

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

      // Chòm sao tên & danh hiệu: né cây thông, Ông già Noel, dòng chữ và các nút/bảng đang mở
      const starSky = createSky({
        calm: rm,
        ground: () => groundRow * chh * zoom + panY,   // toạ độ màn hình của vạch chân trời (đỉnh mặt đất/tuyết)
        treeBox: () => {   // vùng cấm cây thông 3D + ngôi sao (toạ độ màn hình, đệm theo kích thước cây)
          // Chỉ lõi cây (thân + phần giữa tán): mép tán cho phép lướt/chạm nhẹ, vùng hai bên gốc cây để trống
          const x1 = cx - 0.17 * treeH, x2 = cx + 0.17 * treeH;
          const y1 = baseY - 1.16 * treeH, y2 = baseY + chh;
          const a = x1 * zoom + panX, b = y1 * zoom + panY, c = x2 * zoom + panX, d = y2 * zoom + panY;
          return { x: Math.min(a, c), y: Math.min(b, d), w: Math.abs(c - a), h: Math.abs(d - b) };
        },
        worldRects: () => {
          const out = [];
          const add = (x1, y1, x2, y2) => {
            const a = x1 * zoom + panX, b = y1 * zoom + panY;
            const c = x2 * zoom + panX, d = y2 * zoom + panY;
            out.push({ x: Math.min(a, c), y: Math.min(b, d), w: Math.abs(c - a), h: Math.abs(d - b) });
          };
          add(cx - 0.17 * treeH, baseY - 1.16 * treeH, cx + 0.17 * treeH, baseY + chh);      // lõi cây thông + ngôi sao
          const hw = (msg.length * cw) / 2 + cw;
          add(cx - hw, groundRow * chh, cx + hw, (groundRow + 7) * chh);                     // MERRY CHRISTMAS + mặt đất
          const Sx = window.CGOR_SANTA;
          if (Sx && Sx.on) {                                                                 // Ông già Noel (toạ độ màn hình)
            const half = 8 * cw * zoom;
            out.push({ x: Sx.x - half, y: Sx.y - chh * zoom, w: 2 * half, h: (Sx.b - Sx.y) + 2 * chh * zoom });
          }
          return out;
        }
      });
      disposers.push(starSky.destroy);

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
