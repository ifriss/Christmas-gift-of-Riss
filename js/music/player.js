    window.LofiXmas = (function () {
      /* =====================================================================
         TRÌNH PHÁT NHẠC
         - MỌI bài (kể cả 3 bài hộp nhạc) đều phát qua MỘT thẻ <audio> duy nhất.
           Nhờ vậy khi tắt màn hình / chạy ngầm, trình duyệt xử lý như một trình
           phát nhạc thật (không còn setTimeout bị bóp nhịp, không còn AudioContext
           bị treo/tiếp tục lại gây tiếng nhỏ thất thường).
         - 3 bài hộp nhạc được "dựng sẵn" thành file WAV bằng OfflineAudioContext.
         ===================================================================== */
      const audioEl = new Audio();
      audioEl.preload = 'auto';
      audioEl.setAttribute('playsinline', '');

      // Thẻ phụ chỉ để nạp trước bài kế tiếp (giảm khoảng trễ khi tự chuyển bài lúc tắt màn hình)
      const preEl = new Audio();
      preEl.preload = 'auto';
      preEl.muted = true;
      let preKey = '';

      const FADE_SEC = 8; // mờ dần âm lượng trong 8 giây cuối của hẹn giờ

      SONGS.forEach(function (s) { s.group = s.type === 'bell' ? 'box' : 'mp3'; });

      // Bài mở đầu mặc định: bài mp3 đầu tiên (3 bài hộp nhạc không tự chuyển bài nên không dùng làm bài mở đầu)
      const DEFAULT_IDX = Math.max(0, SONGS.findIndex(function (s) { return s.group === 'mp3'; }));

      let playing = false;
      let songIdx = DEFAULT_IDX;
      let repeatMode = 'all';          // 'all' | 'one' (chỉ áp dụng cho nhóm mp3)
      let shuffle = false;             // chỉ áp dụng cho nhóm mp3
      let playHistory = [];
      let nextPlanned = null;
      let volume = 80;                 // thang 0..100
      let muted = false;
      let sleepEnd = 0;
      let sleepMin = 0;
      let sleepTimeout = null;
      let internal = false;            // đang tự đổi nguồn => bỏ qua sự kiện pause
      let playToken = 0;
      let errCount = 0;
      let currentKey = '';
      let volumeOK = true;
      const boxUrl = {};
      const boxPending = {};
      const handlers = { change: [], volume: [], sleep: [] };

      try {
        const savedRep = localStorage.getItem('cgor_repeat_mode');
        if (savedRep === 'one' || savedRep === 'all') repeatMode = savedRep;
        shuffle = localStorage.getItem('cgor_shuffle') === 'true';
        const sv = parseInt(localStorage.getItem('cgor_volume'), 10);
        if (isFinite(sv) && sv >= 0 && sv <= 100) volume = sv;
        muted = localStorage.getItem('cgor_muted') === 'true';
      } catch (e) {}

      function on(name, fn) {
        if (handlers[name] && typeof fn === 'function') handlers[name].push(fn);
      }
      function emit(name) {
        (handlers[name] || []).forEach(function (fn) {
          try { fn(); } catch (e) {}
        });
      }
      function onChange(fn) { on('change', fn); }

      /* ---------------- Âm lượng (thang 100) + mờ dần khi hẹn giờ ---------------- */
      function effVolume() {
        if (muted) return 0;
        let v = volume / 100;
        if (sleepEnd) {
          const left = (sleepEnd - Date.now()) / 1000;
          if (left < FADE_SEC) v *= Math.max(0, left / FADE_SEC);
        }
        return Math.min(1, Math.max(0, v));
      }
      // Pre-amp độc lập: MỌI thiết bị đều đưa <audio> qua GainNode (khởi tạo 1 lần) để thanh âm lượng
      // của web nhân biên độ trước khi ra phần cứng (web 50% × phần cứng 100% = 50%).
      // Nếu có bài khác origin (không có CORS) thì không nối, quay về audio.volume.
      let gainCtx = null, gainNode = null, gainTried = false;
      function sameOriginAll() {
        try {
          return SONGS.every(function (s) {
            if (!s.src) return true;
            const u = new URL(s.src, location.href);
            return u.origin === location.origin;
          });
        } catch (e) { return false; }
      }
      function ensureGain() {
        if (gainTried) return;
        gainTried = true;
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC || !sameOriginAll()) return;
          gainCtx = new AC();
          const src = gainCtx.createMediaElementSource(audioEl);
          gainNode = gainCtx.createGain();
          src.connect(gainNode);
          gainNode.connect(gainCtx.destination);
          audioEl.volume = 1;
          gainCtx.onstatechange = function () {
            if (gainCtx.state !== 'running') resumeGain();
            applyVolume();
          };
        } catch (e) { gainCtx = null; gainNode = null; }
      }
      function resumeGain() {
        try {
          if (gainCtx && gainCtx.state !== 'running' && gainCtx.state !== 'closed') {
            const p = gainCtx.resume();
            if (p && p.then) p.then(applyVolume, function () {});
          }
        } catch (e) {}
      }
      function applyVolume() {
        const v = effVolume();
        if (gainNode) {
          try { gainNode.gain.value = v; } catch (e) {}
          return;
        }
        try { audioEl.volume = v; } catch (e) {}
      }
      // iPhone/iPad không cho web chỉnh volume của thẻ audio (luôn = 1) → báo để UI nhắc dùng nút cứng
      function detectVolumeSupport() {
        try {
          const old = audioEl.volume;
          const probe = old > 0.45 && old < 0.55 ? 0.3 : 0.5;
          audioEl.volume = probe;
          volumeOK = Math.abs(audioEl.volume - probe) < 0.01;
          audioEl.volume = old;
        } catch (e) { volumeOK = false; }
      }
      detectVolumeSupport();
      applyVolume();

      function setVolume(v) {
        v = Math.round(Number(v));
        if (!isFinite(v)) return;
        volume = Math.min(100, Math.max(0, v));
        if (volume > 0 && muted) {
          muted = false;
          try { localStorage.setItem('cgor_muted', 'false'); } catch (e) {}
        }
        try { localStorage.setItem('cgor_volume', String(volume)); } catch (e) {}
        ensureGain(); resumeGain();
        applyVolume();
        emit('volume');
      }
      function toggleMute() {
        muted = !muted;
        if (!muted && volume === 0) volume = 50;
        try {
          localStorage.setItem('cgor_muted', muted ? 'true' : 'false');
          localStorage.setItem('cgor_volume', String(volume));
        } catch (e) {}
        ensureGain(); resumeGain();
        applyVolume();
        emit('volume');
      }

      /* ---------------- Chọn bài kế tiếp (theo nhóm) ---------------- */
      function idxsOf(group) {
        const out = [];
        SONGS.forEach(function (s, i) { if (s.group === group) out.push(i); });
        return out;
      }

      // Hàm "thuần": không đổi trạng thái. Nhóm hộp nhạc không bao giờ trộn / tự chuyển.
      function pickNextIndex() {
        const g = SONGS[songIdx].group;
        const pool = idxsOf(g);
        if (pool.length <= 1) return songIdx;
        if (g === 'box' || !shuffle) {
          return pool[(pool.indexOf(songIdx) + 1) % pool.length];
        }
        const hist = playHistory.filter(function (i) { return pool.indexOf(i) >= 0; });
        if (hist.indexOf(songIdx) < 0) hist.push(songIdx);
        let cand = pool.filter(function (i) { return hist.indexOf(i) < 0; });
        if (!cand.length) cand = pool.filter(function (i) { return i !== songIdx; });
        return cand[Math.floor(Math.random() * cand.length)];
      }

      function markPlayed(i) {
        if (!shuffle || SONGS[i].group !== 'mp3') return;
        const pool = idxsOf('mp3');
        if (playHistory.length >= pool.length) playHistory = [];
        if (playHistory.indexOf(i) < 0) playHistory.push(i);
      }

      function planNext() {
        nextPlanned = null;
        const s = SONGS[songIdx];
        if (s.group !== 'mp3') return;
        nextPlanned = pickNextIndex();
        const nx = SONGS[nextPlanned];
        try {
          const saver = navigator.connection && navigator.connection.saveData;
          if (!saver && nx && nx.src && preKey !== nx.src) {
            preKey = nx.src;
            preEl.src = nx.src;
          }
        } catch (e) {}
      }

      /* ---------------- Dựng sẵn 3 bài hộp nhạc thành WAV ---------------- */
      function encodeWav(buf) {
        const ch = buf.getChannelData(0);
        const n = ch.length;
        const sr = buf.sampleRate;
        let peak = 0;
        for (let i = 0; i < n; i++) {
          const a = Math.abs(ch[i]);
          if (a > peak) peak = a;
        }
        const gain = peak > 0.95 ? 0.95 / peak : 1;
        const ab = new ArrayBuffer(44 + n * 2);
        const v = new DataView(ab);
        const wr = function (o, s) { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
        wr(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); wr(8, 'WAVE'); wr(12, 'fmt ');
        v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
        v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
        wr(36, 'data'); v.setUint32(40, n * 2, true);
        for (let i = 0; i < n; i++) {
          const s = Math.max(-1, Math.min(1, ch[i] * gain));
          v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        }
        return new Blob([ab], { type: 'audio/wav' });
      }

      function sChord(c, dest, freqs, t, dur) {
        const lpf = c.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(1020, t);
        lpf.frequency.exponentialRampToValueAtTime(560, t + dur);
        const g = c.createGain();
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.14, t + 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        lpf.connect(g);
        g.connect(dest);
        freqs.forEach(function (f, idx) {
          const osc = c.createOscillator();
          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f * (1 + (Math.random() - 0.5) * 0.003), t);
          osc.connect(lpf);
          osc.start(t);
          osc.stop(t + dur + 0.05);
        });
      }

      function sBell(c, dest, freq, t, dur) {
        if (!freq) return;
        const osc = c.createOscillator();
        const sub = c.createOscillator();
        osc.type = 'sine';
        sub.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        sub.frequency.setValueAtTime(freq * 2, t);
        const lpf = c.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = 1750;
        const g = c.createGain();
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.095, t + 0.018);
        g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
        const subG = c.createGain();
        subG.gain.value = 0.16;
        osc.connect(lpf);
        sub.connect(subG);
        subG.connect(lpf);
        lpf.connect(g);
        g.connect(dest);
        osc.start(t);
        sub.start(t);
        osc.stop(t + dur + 0.05);
        sub.stop(t + dur + 0.05);
      }

      function sKick(c, dest, t) {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(118, t);
        osc.frequency.exponentialRampToValueAtTime(44, t + 0.14);
        g.gain.setValueAtTime(0.32, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(g);
        g.connect(dest);
        osc.start(t);
        osc.stop(t + 0.22);
      }

      function sNoise(c, dest, noiseBuf, t, isSnare) {
        const noise = c.createBufferSource();
        noise.buffer = noiseBuf;
        const filter = c.createBiquadFilter();
        filter.type = isSnare ? 'lowpass' : 'highpass';
        filter.frequency.value = isSnare ? 1450 : 6500;
        const g = c.createGain();
        g.gain.setValueAtTime(isSnare ? 0.11 : 0.035, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + (isSnare ? 0.12 : 0.032));
        noise.connect(filter);
        filter.connect(g);
        g.connect(dest);
        noise.start(t);
        noise.stop(t + (isSnare ? 0.13 : 0.04));
      }

      function renderBox(song) {
        if (boxUrl[song.id]) return Promise.resolve(boxUrl[song.id]);
        if (boxPending[song.id]) return boxPending[song.id];
        const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!OAC) return Promise.reject(new Error('no-offline-audio'));

        const sr = 44100;
        const steps = song.seq.length * 4 * 2; // 2 vòng điệp khúc
        const beat = song.beatSec;
        const secs = steps * beat + 1.4;
        const oc = new OAC(1, Math.ceil(secs * sr), sr);

        const master = oc.createGain();
        master.gain.value = 0.28;
        master.connect(oc.destination);

        // Tiếng xì xạo của đĩa than
        const cb = sr * 3;
        const cbuf = oc.createBuffer(1, cb, sr);
        const cd = cbuf.getChannelData(0);
        for (let i = 0; i < cb; i++) {
          cd[i] = Math.random() > 0.9985 ? (Math.random() * 2 - 1) * 0.28 : (Math.random() * 2 - 1) * 0.008;
        }
        const crackle = oc.createBufferSource();
        crackle.buffer = cbuf;
        crackle.loop = true;
        const cf = oc.createBiquadFilter();
        cf.type = 'bandpass';
        cf.frequency.value = 1800;
        cf.Q.value = 0.9;
        const cg = oc.createGain();
        cg.gain.value = 0.22;
        crackle.connect(cf);
        cf.connect(cg);
        cg.connect(master);
        crackle.start(0);

        const mkNoise = function (len) {
          const b = oc.createBuffer(1, Math.floor(sr * len), sr);
          const d = b.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
          return b;
        };
        const snareBuf = mkNoise(0.13);
        const hatBuf = mkNoise(0.035);

        for (let step = 0; step < steps; step++) {
          const t = step * beat;
          const item = song.seq[Math.floor(step / 4) % song.seq.length];
          const b = step % 4;
          if (b === 0) {
            sChord(oc, master, item.chord, t, beat * 3.9);
            sKick(oc, master, t);
          }
          if (b === 1 || b === 3) sNoise(oc, master, snareBuf, t, true);
          if (b === 2) sKick(oc, master, t + beat * 0.33);
          sNoise(oc, master, hatBuf, t, false);
          sNoise(oc, master, hatBuf, t + beat * 0.53, false);
          if (item.mel[b]) sBell(oc, master, item.mel[b], t, beat * 1.5);
        }

        const p = new Promise(function (resolve, reject) {
          try {
            const r = oc.startRendering();
            if (r && typeof r.then === 'function') r.then(resolve, reject);
            else oc.oncomplete = function (e) { resolve(e.renderedBuffer); };
          } catch (err) { reject(err); }
        }).then(function (buf) {
          const url = URL.createObjectURL(encodeWav(buf));
          boxUrl[song.id] = url;
          delete boxPending[song.id];
          return url;
        }).catch(function (err) {
          delete boxPending[song.id];
          throw err;
        });
        boxPending[song.id] = p;
        return p;
      }

      // Dựng sẵn lúc rảnh để lần bấm phát đầu tiên không phải chờ
      function prerenderAll() {
        const boxes = SONGS.filter(function (s) { return s.group === 'box'; });
        let i = 0;
        (function next() {
          if (i >= boxes.length) return;
          renderBox(boxes[i++]).catch(function () {}).then(function () { setTimeout(next, 120); });
        })();
      }
      setTimeout(prerenderAll, 1600);

      /* ---------------- Phát / dừng ---------------- */
      function setAudioSession() {
        try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
      }

      function playUrl(url, song) {
        setAudioSession();
        internal = true;
        if (currentKey !== url) {
          currentKey = url;
          audioEl.src = url;
        }
        audioEl.loop = song.group === 'box' || repeatMode === 'one';
        ensureGain();
        resumeGain();
        applyVolume();
        const tok = ++playToken;
        const pr = audioEl.play();
        playing = true;
        markPlayed(songIdx);
        syncBtn();
        if (pr && typeof pr.then === 'function') {
          pr.then(function () {
            if (tok === playToken) { internal = false; errCount = 0; }
          }).catch(function () {
            if (tok !== playToken) return; // bị thay bằng lệnh phát mới → không phải lỗi thật
            internal = false;
            playing = false;
            syncBtn();
          });
        } else {
          internal = false;
        }
        planNext();
      }

      function start() {
        const song = SONGS[songIdx];
        if (song.group === 'box') {
          const url = boxUrl[song.id];
          if (url) { playUrl(url, song); return; }
          playing = true;
          syncBtn();
          renderBox(song).then(function (u) {
            if (SONGS[songIdx] === song && playing) playUrl(u, song);
          }).catch(function () {
            playing = false;
            syncBtn();
          });
        } else {
          playUrl(song.src, song);
        }
      }

      function stop() {
        playing = false;
        playToken++;
        internal = false;
        audioEl.pause();
        syncBtn();
      }

      function advanceTrack() {
        songIdx = nextPlanned != null ? nextPlanned : pickNextIndex();
        nextPlanned = null;
        start();
        return songIdx;
      }

      function nextSong() { return advanceTrack(); }

      function prevSong() {
        const pool = idxsOf(SONGS[songIdx].group);
        songIdx = pool[(pool.indexOf(songIdx) - 1 + pool.length) % pool.length];
        nextPlanned = null;
        start();
        return songIdx;
      }

      function selectSong(i) {
        if (i < 0 || i >= SONGS.length) return songIdx;
        songIdx = i;
        nextPlanned = null;
        if (shuffle && SONGS[i].group === 'mp3' && playHistory.indexOf(i) < 0) playHistory.push(i);
        start();
        return songIdx;
      }

      function toggleRepeatMode() {
        repeatMode = repeatMode === 'all' ? 'one' : 'all';
        try { localStorage.setItem('cgor_repeat_mode', repeatMode); } catch (e) {}
        audioEl.loop = SONGS[songIdx].group === 'box' || repeatMode === 'one';
        syncBtn();
        return repeatMode;
      }

      function toggleShuffle() {
        shuffle = !shuffle;
        playHistory = shuffle && SONGS[songIdx].group === 'mp3' ? [songIdx] : [];
        try { localStorage.setItem('cgor_shuffle', shuffle ? 'true' : 'false'); } catch (e) {}
        planNext();
        syncBtn();
        return shuffle;
      }

      /* ---------------- Tua nhạc ---------------- */
      function getTime() { return audioEl.currentTime || 0; }
      function getDuration() { return isFinite(audioEl.duration) ? audioEl.duration : 0; }
      function seek(sec) {
        const dur = getDuration();
        if (!dur || !isFinite(sec)) return;
        try { audioEl.currentTime = Math.min(Math.max(0, sec), Math.max(0, dur - 0.05)); } catch (e) {}
      }

      /* ---------------- Hẹn giờ tắt nhạc ---------------- */
      function sleepFire() {
        if (!sleepEnd) return;
        const left = sleepEnd - Date.now();
        if (left > 150) {
          sleepTimeout = setTimeout(sleepFire, Math.max(250, left));
          return;
        }
        sleepEnd = 0;
        sleepMin = 0;
        clearTimeout(sleepTimeout);
        stop();
        applyVolume();
        emit('sleep');
        try { window.dispatchEvent(new CustomEvent('cgor-sleep-done')); } catch (e) {}
      }
      function setSleepTimer(min) {
        clearTimeout(sleepTimeout);
        min = Math.round(Number(min));
        if (isFinite(min) && min > 0) {
          sleepMin = Math.min(min, 720);
          sleepEnd = Date.now() + sleepMin * 60000;
          sleepTimeout = setTimeout(sleepFire, sleepMin * 60000 + 60);
        } else {
          sleepMin = 0;
          sleepEnd = 0;
        }
        applyVolume();
        emit('sleep');
      }
      function getSleepRemaining() {
        return sleepEnd ? Math.max(0, Math.round((sleepEnd - Date.now()) / 1000)) : 0;
      }

      /* ---------------- Sự kiện của thẻ audio ---------------- */
      let lastPosPush = 0;
      audioEl.addEventListener('timeupdate', function () {
        // timeupdate vẫn chạy khi tắt màn hình → dùng làm "đồng hồ" dự phòng cho hẹn giờ
        if (sleepEnd) {
          if (Date.now() >= sleepEnd) sleepFire();
          else if (sleepEnd - Date.now() <= FADE_SEC * 1000) applyVolume();
        }
        const now = Date.now();
        if (now - lastPosPush > 15000) {
          lastPosPush = now;
          updatePosition();
        }
      });

      audioEl.addEventListener('ended', function () {
        if (SONGS[songIdx].group === 'box' || repeatMode === 'one') {
          audioEl.currentTime = 0;
          audioEl.play().catch(function () {});
        } else {
          advanceTrack();
        }
      });

      audioEl.addEventListener('pause', function () {
        if (internal || audioEl.ended || !audioEl.paused || !playing) return;
        playing = false; // người dùng/hệ thống tạm dừng (phím media, màn hình khoá...)
        syncBtn();
      });

      audioEl.addEventListener('play', function () {
        if (!playing && !internal) { playing = true; syncBtn(); }
      });

      audioEl.addEventListener('error', function () {
        if (!currentKey) return;
        const song = SONGS[songIdx];
        if (song.group === 'mp3' && playing && errCount < 3) {
          errCount++;
          setTimeout(function () { if (playing) advanceTrack(); }, 900);
          return;
        }
        playing = false;
        syncBtn();
      });

      audioEl.addEventListener('durationchange', updatePosition);
      ['play', 'pause', 'seeked', 'ratechange', 'loadedmetadata'].forEach(function (ev) {
        audioEl.addEventListener(ev, updatePosition);
      });
      function reassertVolume() {
        if (document.visibilityState === 'hidden') return;
        resumeGain();
        applyVolume();
      }
      document.addEventListener('visibilitychange', reassertVolume);
      window.addEventListener('pageshow', reassertVolume);
      window.addEventListener('focus', reassertVolume);

      /* ---------------- Nhật ký chẩn đoán âm thanh ----------------
         Chỉ bật khi mở web với ?audiodebug=1 (tắt bằng ?audiodebug=0). Ghi lại sự kiện phát/dừng/đệm,
         âm lượng, trạng thái màn hình… để biết chính xác chuyện gì xảy ra khi tắt màn hình.
         Có nút 🐞 để xem và sao chép nhật ký.                                                    */
      (function audioDebug() {
        let enabled = false;
        try {
          const q = new URLSearchParams(location.search).get('audiodebug');
          if (q === '1') localStorage.setItem('cgor_audiodebug', '1');
          if (q === '0') localStorage.removeItem('cgor_audiodebug');
          enabled = localStorage.getItem('cgor_audiodebug') === '1';
        } catch (e) {}
        if (!enabled) return;

        const KEY = 'cgor_audiolog';
        let log = [];
        try { log = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}
        const pad = function (n) { return String(n).padStart(2, '0'); };

        function snap(tag, extra) {
          const d = new Date();
          log.push(
            pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' ' + tag +
            ' | vis=' + document.visibilityState +
            ' vol=' + Number(audioEl.volume).toFixed(2) + (audioEl.muted ? ' MUTED' : '') +
            ' t=' + (audioEl.currentTime || 0).toFixed(1) +
            ' rs=' + audioEl.readyState + ' ns=' + audioEl.networkState +
            ' ctx=' + (gainCtx ? gainCtx.state : '-') +
            ' song=' + songIdx + (extra ? ' ' + extra : '')
          );
          if (log.length > 400) log.splice(0, log.length - 400);
          try { localStorage.setItem(KEY, JSON.stringify(log)); } catch (e) {}
        }

        ['play', 'pause', 'playing', 'waiting', 'stalled', 'ended', 'emptied', 'volumechange', 'seeking', 'suspend', 'error']
          .forEach(function (ev) {
            audioEl.addEventListener(ev, function () {
              snap(ev, ev === 'error' && audioEl.error ? 'code=' + audioEl.error.code : '');
            });
          });
        document.addEventListener('visibilitychange', function () { snap('visibility'); });
        let lastTick = 0;
        audioEl.addEventListener('timeupdate', function () {
          const n = Date.now();
          if (n - lastTick > 20000) { lastTick = n; snap('tick'); }
        });
        snap('debug-on ' + navigator.userAgent.slice(0, 100));

        // Nút 🐞 + bảng xem nhật ký
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = '🐞';
        btn.setAttribute('aria-label', 'Audio log');
        btn.style.cssText = 'position:fixed;left:8px;top:calc(env(safe-area-inset-top,0px) + 110px);z-index:100000;width:34px;height:34px;padding:0;border-radius:50%;font-size:16px;';
        const box = document.createElement('div');
        box.style.cssText = 'position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 150px);bottom:12px;z-index:100000;display:none;flex-direction:column;gap:6px;padding:8px;background:#050a1af2;border:1px solid #ffd36b88;border-radius:10px;';
        const ta = document.createElement('textarea');
        ta.readOnly = true;
        ta.style.cssText = 'flex:1;min-height:0;width:100%;resize:none;background:#02060f;color:#bfe;border:1px solid #2a3b70;border-radius:8px;font:10px/1.4 monospace;padding:6px;';
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:6px;';
        function mkBtn(label, fn) {
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = label;
          b.style.cssText = 'flex:1;padding:7px;';
          b.addEventListener('click', fn);
          row.appendChild(b);
        }
        mkBtn('Sao chép', function () {
          ta.focus(); ta.select();
          try { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); else document.execCommand('copy'); } catch (e) {}
        });
        mkBtn('Xóa', function () { log = []; try { localStorage.removeItem(KEY); } catch (e) {} ta.value = ''; });
        mkBtn('Đóng', function () { box.style.display = 'none'; });
        box.appendChild(ta);
        box.appendChild(row);
        btn.addEventListener('click', function () {
          ta.value = log.join('\n');
          box.style.display = box.style.display === 'none' ? 'flex' : 'none';
          ta.scrollTop = ta.scrollHeight;
        });
        document.body.appendChild(btn);
        document.body.appendChild(box);
      })();

      /* ---------------- Media Session (điều khiển trên màn hình khoá) ---------------- */
      function updatePosition() {
        try {
          if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
          const d = getDuration();
          if (!d) return;
          navigator.mediaSession.setPositionState({
            duration: d,
            playbackRate: audioEl.playbackRate || 1,
            position: Math.min(d, Math.max(0, getTime()))
          });
        } catch (e) {}
      }

      function updateMediaSession() {
        try {
          if (!('mediaSession' in navigator)) return;
          const s = SONGS[songIdx];
          if (window.MediaMetadata) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: s.name,
              artist: 'Christmas gift of Riss',
              album: s.group === 'box' ? 'Music box' : 'Playlist'
            });
          }
          navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
        } catch (e) {}
      }

      (function setupMediaSession() {
        if (!('mediaSession' in navigator)) return;
        const ms = navigator.mediaSession;
        const set = function (a, f) { try { ms.setActionHandler(a, f); } catch (e) {} };
        set('play', function () { start(); });
        set('pause', function () { stop(); });
        set('nexttrack', function () { nextSong(); });
        set('previoustrack', function () { prevSong(); });
        set('seekto', function (d) { if (d && isFinite(d.seekTime)) seek(d.seekTime); });
        set('seekforward', function (d) { seek(getTime() + ((d && d.seekOffset) || 10)); });
        set('seekbackward', function (d) { seek(getTime() - ((d && d.seekOffset) || 10)); });
      })();

      function syncBtn() {
        const b = document.getElementById('btn-music');
        if (b) b.setAttribute('aria-pressed', playing ? 'true' : 'false');
        updateMediaSession();
        emit('change');
      }

      /* ---------------- Tiếng cười "Ho ho ho" của ông già Noel ----------------
         Tổng hợp giọng: nguồn thanh (2 sóng răng cưa lệch nhẹ + sóng con nửa tần số)
         + rung giọng (vibrato) + nhịp bụng (13 Hz) → qua 3 bộ cộng hưởng nguyên âm "o"
         (F1≈520, F2≈880, F3≈2450 Hz) + tiếng thở "h" + vang nhẹ.
         Chỉnh nhanh: mảng syl (cao độ f0→f1), giá trị gain của formant (fg).            */
      function playHoHoHo() {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return 0;
        const vol = (muted || volume === 0) ? 0 : 0.4 + 0.6 * (volume / 100);
        if (!vol) return 0;
        let c;
        try { c = new AC(); } catch (e) { return 0; }
        if (c.state === 'suspended') c.resume();

        const t0 = c.currentTime + 0.04;
        const out = c.createGain();
        out.gain.value = 0.9 * vol;
        const comp = c.createDynamicsCompressor();
        comp.threshold.value = -20;
        comp.knee.value = 14;
        comp.ratio.value = 6;
        comp.attack.value = 0.004;
        comp.release.value = 0.2;
        out.connect(comp);
        comp.connect(c.destination);

        // vang ngắn
        const irLen = Math.floor(c.sampleRate * 1.1);
        const ir = c.createBuffer(2, irLen, c.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const d = ir.getChannelData(ch);
          for (let i = 0; i < irLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.6);
        }
        const conv = c.createConvolver();
        conv.buffer = ir;
        const wet = c.createGain();
        wet.gain.value = 0.2;
        out.connect(conv);
        conv.connect(wet);
        wet.connect(comp);

        const nb = c.createBuffer(1, Math.floor(c.sampleRate * 0.2), c.sampleRate);
        const nd = nb.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

        const syl = [
          { t: 0.00, f0: 176, f1: 140, d: 0.30, a: 0.85 },
          { t: 0.40, f0: 156, f1: 124, d: 0.30, a: 0.92 },
          { t: 0.82, f0: 138, f1: 92, d: 0.62, a: 1.00 }
        ];

        syl.forEach(function (s) {
          const t = t0 + s.t;
          const v0 = t + 0.045;
          const vd = s.d - 0.045;

          // hơi thở "h"
          const n = c.createBufferSource();
          n.buffer = nb;
          const nf = c.createBiquadFilter();
          nf.type = 'bandpass';
          nf.frequency.value = 1500;
          nf.Q.value = 0.7;
          const ng = c.createGain();
          ng.gain.setValueAtTime(0.0001, t);
          ng.gain.linearRampToValueAtTime(0.22 * s.a, t + 0.012);
          ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
          n.connect(nf);
          nf.connect(ng);
          ng.connect(out);
          n.start(t);
          n.stop(t + 0.12);

          // nguồn thanh
          const o1 = c.createOscillator();
          const o2 = c.createOscillator();
          const o3 = c.createOscillator();
          o1.type = 'sawtooth';
          o2.type = 'sawtooth';
          o3.type = 'sine';
          o1.detune.value = -7;
          o2.detune.value = 9;
          [o1, o2].forEach(function (o) {
            o.frequency.setValueAtTime(s.f0, v0);
            o.frequency.exponentialRampToValueAtTime(s.f1, v0 + vd);
          });
          o3.frequency.setValueAtTime(s.f0 / 2, v0);
          o3.frequency.exponentialRampToValueAtTime(s.f1 / 2, v0 + vd);

          // rung giọng
          const lfo = c.createOscillator();
          lfo.frequency.value = 5.4;
          const lg = c.createGain();
          lg.gain.value = 16;
          lfo.connect(lg);
          lg.connect(o1.detune);
          lg.connect(o2.detune);

          const src = c.createGain();
          src.gain.value = 0.7;
          const sub = c.createGain();
          sub.gain.value = 0.5;
          o1.connect(src);
          o2.connect(src);
          o3.connect(sub);
          sub.connect(src);

          // nhịp bụng (cười rung)
          const pulse = c.createGain();
          pulse.gain.value = 0.82;
          const plfo = c.createOscillator();
          plfo.frequency.value = 13;
          const pg = c.createGain();
          pg.gain.value = 0.18;
          plfo.connect(pg);
          pg.connect(pulse.gain);
          src.connect(pulse);

          // bao biên độ + formant nguyên âm "o"
          const env = c.createGain();
          env.gain.setValueAtTime(0.0001, v0);
          env.gain.linearRampToValueAtTime(s.a, v0 + 0.03);
          env.gain.setValueAtTime(s.a, v0 + vd * 0.55);
          env.gain.exponentialRampToValueAtTime(0.0001, v0 + vd);
          [[700, 520, 9, 1.0], [1150, 880, 11, 0.6], [2600, 2450, 14, 0.18]].forEach(function (f) {
            const bp = c.createBiquadFilter();
            bp.type = 'bandpass';
            bp.Q.value = f[2];
            bp.frequency.setValueAtTime(f[0], v0);
            bp.frequency.exponentialRampToValueAtTime(f[1], v0 + 0.1);
            const fg = c.createGain();
            fg.gain.value = f[3] * 3;
            pulse.connect(bp);
            bp.connect(fg);
            fg.connect(env);
          });
          env.connect(out);

          [o1, o2, o3, lfo, plfo].forEach(function (o) {
            o.start(v0);
            o.stop(v0 + vd + 0.06);
          });
        });

        setTimeout(function () { try { c.close(); } catch (e) {} }, 2800);
        return 1.5;
      }

      return {
        start: start,
        stop: stop,
        toggle: function () { return playing ? stop() : start(); },
        nextSong: nextSong,
        prevSong: prevSong,
        selectSong: selectSong,
        playHoHoHo: playHoHoHo,
        on: on,
        onChange: onChange,
        toggleRepeatMode: toggleRepeatMode,
        toggleShuffle: toggleShuffle,
        getRepeatMode: function () { return repeatMode; },
        isShuffle: function () { return shuffle; },
        getSongIdx: function () { return songIdx; },
        getSongColor: function () {
          const palette = ['#ffd36b', '#ff5c7c', '#52f0ff', '#4ef57b', '#ff9a3c', '#b47aff', '#ff7ad9'];
          const s = SONGS[songIdx];
          return (s && s.color) ? s.color : palette[songIdx % palette.length];
        },
        isPlaying: function () { return playing; },
        getSongs: function () {
          return SONGS.map(function (s, i) { return { index: i, name: s.name, type: s.type, group: s.group }; });
        },
        getSongName: function () { return SONGS[songIdx] ? SONGS[songIdx].name : ''; },
        getTime: getTime,
        getDuration: getDuration,
        seek: seek,
        getVolume: function () { return volume; },
        setVolume: setVolume,
        isMuted: function () { return muted; },
        toggleMute: toggleMute,
        isGainRouted: function () { return !!gainNode; },
        isVolumeSupported: function () { return !!gainNode || volumeOK; },
        setSleepTimer: setSleepTimer,
        getSleepMinutes: function () { return sleepMin; },
        getSleepRemaining: getSleepRemaining
      };
    })();
