/* AetheRiss — Trình phát nhạc dùng chung cho mọi Space.
   - Âm thanh nằm ở window.LofiXmas (js/music/player.js) và máy đĩa than ở js/music/turntable.js;
     cả hai đều nằm NGOÀI vòng đời mount()/unmount() của Space nên nhạc chạy liên tục khi bấm < hoặc >.
   - File này gom phần giao diện điều khiển: thanh tua, âm lượng, hẹn giờ tắt nhạc, nhãn đa ngôn ngữ,
     và giữ bố cục máy đĩa than/bảng nhạc khi đổi Space.
   - Chỉ khởi tạo MỘT lần (guard) → không nhân đôi sự kiện / bộ đếm. */
(function () {
  'use strict';
  if (window.AetheMusic) return;

  const $ = function (id) { return document.getElementById(id); };
  const L = window.LofiXmas;
  const X = function () { return window.CGOR_X(); };
  const deckPanel = $('deck-panel');
  if (!L || !deckPanel) return;

  const seek = $('dp-seek');
  const tCur = $('dp-time-cur');
  const tDur = $('dp-time-dur');
  const vol = $('dp-volume');
  const volVal = $('dp-vol-val');
  const muteBtn = $('dp-mute');
  const tLeft = $('dp-timer-left');
  const chips = Array.prototype.slice.call(deckPanel.querySelectorAll('.dp-chip[data-min]'));
  const customBtn = $('dp-t-custom');
  const customBox = $('dp-timer-custom');
  const customInput = $('dp-timer-input');
  const customSet = $('dp-timer-set');

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const ss = (s < 10 ? '0' : '') + s;
    if (h > 0) return h + ':' + (m < 10 ? '0' : '') + m + ':' + ss;
    return m + ':' + ss;
  }
  function paintRange(el) {
    const min = Number(el.min) || 0;
    const max = Number(el.max) || 100;
    const p = ((Number(el.value) - min) / (max - min)) * 100;
    el.style.setProperty('--pct', Math.max(0, Math.min(100, p)) + '%');
  }

  /* --- Thanh tua --- */
  let seeking = false;
  function updateSeek() {
    if (seeking) return;
    const dur = L.getDuration();
    const cur = L.getTime();
    seek.disabled = !dur;
    seek.value = dur ? Math.round((cur / dur) * 1000) : 0;
    paintRange(seek);
    tCur.textContent = fmt(cur);
    tDur.textContent = dur ? fmt(dur) : '--:--';
  }
  seek.addEventListener('input', function () {
    seeking = true;
    paintRange(seek);
    const dur = L.getDuration();
    tCur.textContent = fmt((Number(seek.value) / 1000) * dur);
  });
  function commitSeek() {
    if (!seeking) return;
    const dur = L.getDuration();
    if (dur) L.seek((Number(seek.value) / 1000) * dur);
    seeking = false;
    updateSeek();
  }
  seek.addEventListener('change', commitSeek);
  seek.addEventListener('pointerup', commitSeek);
  seek.addEventListener('touchend', commitSeek);

  /* --- Âm lượng --- */
  function syncVol() {
    const v = L.getVolume();
    const m = L.isMuted();
    vol.value = m ? 0 : v;
    paintRange(vol);
    volVal.textContent = m ? 0 : v;
    muteBtn.textContent = (m || v === 0) ? '🔇' : v < 35 ? '🔈' : v < 70 ? '🔉' : '🔊';
    muteBtn.setAttribute('aria-pressed', (m || v === 0) ? 'true' : 'false');
  }
  vol.addEventListener('input', function () { L.setVolume(Number(vol.value)); });
  vol.addEventListener('change', function () { L.setVolume(Number(vol.value)); });
  // Cảm ứng: tự tính giá trị theo vị trí ngón tay để thanh luôn kéo được trên web mobile
  (function () {
    let dragging = false;
    function setFromTouch(t) {
      const r = vol.getBoundingClientRect();
      if (!r.width) return;
      const ratio = Math.min(1, Math.max(0, (t.clientX - r.left) / r.width));
      const v = Math.round(ratio * 100);
      vol.value = v;
      paintRange(vol);
      volVal.textContent = v;
      L.setVolume(v);
    }
    vol.addEventListener('touchstart', function (e) {
      if (!e.touches.length) return;
      dragging = true;
      setFromTouch(e.touches[0]);
      e.preventDefault();
    }, { passive: false });
    vol.addEventListener('touchmove', function (e) {
      if (!dragging || !e.touches.length) return;
      setFromTouch(e.touches[0]);
      e.preventDefault();
    }, { passive: false });
    function endTouch() { dragging = false; }
    vol.addEventListener('touchend', endTouch);
    vol.addEventListener('touchcancel', endTouch);
  })();
  muteBtn.addEventListener('click', function () { L.toggleMute(); });
  L.on('volume', syncVol);

  /* --- Hẹn giờ tắt nhạc (countdown) --- */
  function syncTimer() {
    const m = L.getSleepMinutes();
    const presets = [30, 60, 120];
    chips.forEach(function (c) {
      const cm = Number(c.getAttribute('data-min'));
      c.setAttribute('aria-pressed', (cm === 0 ? m === 0 : cm === m) ? 'true' : 'false');
    });
    const isCustom = m > 0 && presets.indexOf(m) < 0;
    customBtn.setAttribute('aria-pressed', isCustom ? 'true' : 'false');
    updateTimerLeft();
  }
  function updateTimerLeft() {
    const r = L.getSleepRemaining();
    tLeft.textContent = r > 0 ? X().tLeft + ' ' + fmt(r) : '';
  }
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      L.setSleepTimer(Number(c.getAttribute('data-min')));
      customBox.classList.remove('open');
    });
  });
  customBtn.addEventListener('click', function () {
    const open = !customBox.classList.contains('open');
    customBox.classList.toggle('open', open);
    if (open) setTimeout(function () { customInput.focus(); }, 30);
  });
  function applyCustom() {
    const v = parseInt(customInput.value, 10);
    if (isFinite(v) && v >= 1 && v <= 720) {
      L.setSleepTimer(v);
      customInput.value = '';
      customInput.classList.remove('bad');
      customBox.classList.remove('open');
    } else {
      customInput.classList.add('bad');
      customInput.focus();
    }
  }
  customSet.addEventListener('click', applyCustom);
  customInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); applyCustom(); }
  });
  customInput.addEventListener('input', function () { customInput.classList.remove('bad'); });
  L.on('sleep', syncTimer);

  setInterval(function () {
    if (deckPanel.classList.contains('open')) {
      updateSeek();
      updateTimerLeft();
    }
  }, 250);
  L.onChange(function () { updateSeek(); });

  /* --- Nhãn đa ngôn ngữ (Việt / Anh / Trung) --- */
  function applyLang() {
    const t = X();
    seek.setAttribute('aria-label', t.seekAria);
    $('dp-vol-label').textContent = t.volLabel;
    vol.setAttribute('aria-label', t.volLabel);
    muteBtn.setAttribute('aria-label', t.muteAria || t.volLabel);
    syncVol();
    $('dp-timer-title').textContent = t.timerTitle;
    $('dp-t-off').textContent = t.tOff;
    $('dp-t-30').textContent = t.t30;
    $('dp-t-60').textContent = t.t60;
    $('dp-t-120').textContent = t.t120;
    customBtn.textContent = t.tCustom;
    customInput.placeholder = t.tPlaceholder;
    customSet.textContent = t.tSet;
    updateTimerLeft();
  }
  const prevBar = window.updateBarLanguage;
  window.updateBarLanguage = function (l) {
    if (prevBar) prevBar(l);
    applyLang();
  };
  const prevDeck = window.updateDeckLanguage;
  window.updateDeckLanguage = function () {
    if (prevDeck) prevDeck();
    applyLang();
  };

  /* --- Đổi Space: chỉ đồng bộ lại giao diện, KHÔNG đụng tới âm thanh --- */
  window.addEventListener('cgor-space', function () {
    updateSeek();
    syncVol();
    syncTimer();
  });

  applyLang();
  syncTimer();
  updateSeek();
  paintRange(seek);
  if (window.CGOR_MQ) window.CGOR_MQ.scan();

  window.AetheMusic = { player: L, syncAll: function () { updateSeek(); syncVol(); syncTimer(); } };
})();
