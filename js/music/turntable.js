    (function () {
      const deckCanvas = document.getElementById('deck-canvas');
      const dCtx = deckCanvas.getContext('2d');
      const deckPanel = document.getElementById('deck-panel');
      const dpClose = document.getElementById('dp-close');
      const dpSong = document.getElementById('dp-song');
      const dpToggle = document.getElementById('dp-toggle');
      const dpNext = document.getElementById('dp-next');
      const dpChange = document.getElementById('dp-change');
      const dpSearch = document.getElementById('dp-search');
      const dpSearchWrap = document.getElementById('dp-search-wrap');
      const dpSearchInput = document.getElementById('dp-search-input');
      const dpSearchClear = document.getElementById('dp-search-clear');
      const dpRepeat = document.getElementById('dp-repeat');
      const dpShuffle = document.getElementById('dp-shuffle');
      const dpAddSong = document.getElementById('dp-add-song');
      const dpPick = document.getElementById('dp-pick');
      const dpList = document.getElementById('dp-list');

      // Box nhỏ đề xuất nhạc cho DEV duyệt
      const addSongBox = document.getElementById('add-song-box');
      const addSongClose = document.getElementById('add-song-close');
      const addSongForm = document.getElementById('add-song-form');
      const addSongInput = document.getElementById('add-song-input');
      const addSongSubmit = document.getElementById('add-song-submit');
      const addSongMsg = document.getElementById('add-song-msg');

      // Danh sách đề xuất chờ duyệt dành riêng cho DEV
      const devSongQueue = document.getElementById('dev-song-queue');
      const devSongList = document.getElementById('dev-song-list');
      const dsqCount = document.getElementById('dsq-count');
      const dsqRefresh = document.getElementById('dsq-refresh');

      let songSuggestions = [];
      let isRefreshingQueue = false;
      let discAngle = 0;
      let armAngle = 0;
      let lastT = performance.now();

      setTimeout(() => deckCanvas.classList.add('show'), 350);

      window.closeDeckPanel = function () {
        deckPanel.classList.remove('open');
      };

      window.closeAddSongBox = function () {
        addSongBox.classList.remove('open');
      };

      function toggleDeckPanel() {
        const willOpen = !deckPanel.classList.contains('open');
        if (window.closeAllFloatingPanels) {
          window.closeAllFloatingPanels(willOpen ? 'deck' : '');
        }
        deckPanel.classList.toggle('open', willOpen);
        if (willOpen) syncDeckUI();
      }

      deckCanvas.addEventListener('click', toggleDeckPanel);
      deckCanvas.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleDeckPanel();
        }
      });

      dpClose.addEventListener('click', () => {
        deckPanel.classList.remove('open');
      });

      function renderDevSongQueue() {
        const isDev = window.CGOR_IS_DEV ? window.CGOR_IS_DEV() : false;
        devSongQueue.classList.toggle('show', isDev);
        if (!isDev) return;

        const lang = window.getCGORLang ? window.getCGORLang() : 'vi';
        const dDict = (window.CGOR_I18N && window.CGOR_I18N[lang]) ? window.CGOR_I18N[lang].deck : null;
        const esc = window.CGOR_ESCAPE_HTML || (s => String(s));
        const fmtTime = window.CGOR_FORMAT_TIME || (s => String(s));

        dsqCount.textContent = songSuggestions.length;
        if (!songSuggestions.length) {
          devSongList.innerHTML = '<div class="dp-empty">' + ((dDict && dDict.devEmptyQueue) || 'Chưa có đề xuất nhạc nào.') + '</div>';
          return;
        }

        devSongList.innerHTML = songSuggestions.map((item, idx) => {
          const copyBtnText = (dDict && dDict.devCopyBtn) || '📋 Copy';
          return (
            '<div class="dsq-item">' +
              '<div class="dsq-top">' +
                '<span>👤 ' + esc(item.sender || 'Khách') + '</span>' +
                '<span>' + esc(fmtTime(item.time || '')) + '</span>' +
              '</div>' +
              '<div class="dsq-text">' + esc(item.content || '') + '</div>' +
              '<div class="dsq-actions">' +
                '<button type="button" class="dsq-copy-btn" data-idx="' + idx + '">' + copyBtnText + '</button>' +
                (item.row ? '<button type="button" class="dsq-del-btn" data-row="' + item.row + '" data-idx="' + idx + '">🗑</button>' : '') +
              '</div>' +
            '</div>'
          );
        }).join('');
      }

      async function loadSongSuggestions() {
  const apiUrl = window.CGOR_SHEET_API_URL;
  const user = window.CGOR_GET_USER ? window.CGOR_GET_USER() : null;
  if (apiUrl && user && user.token) {
    try {
      const res = await fetch(apiUrl + '?action=song_requests&token=' + encodeURIComponent(user.token));
      const data = await res.json();
      if (data && Array.isArray(data.requests)) {
        songSuggestions = data.requests;
      } else if (Array.isArray(data)) {
        songSuggestions = data;
      }
    } catch (e) {}
  }
        // Gộp thêm bản lưu cục bộ (phòng trường hợp Sheet chưa cập nhật action song_requests)
        try {
          const localList = JSON.parse(localStorage.getItem('cgor_song_suggestions') || '[]');
          if (Array.isArray(localList)) {
            localList.forEach(loc => {
              if (!songSuggestions.some(s => s.content === loc.content && s.time === loc.time)) {
                songSuggestions.unshift(loc);
              }
            });
          }
        } catch (e) {}

        renderDevSongQueue();
      }

      // Tài khoản DEV không cần ô nhập đề xuất nhạc (chỉ xem danh sách duyệt)
      function applySongBoxRole() {
        const isDev = !!(window.CGOR_IS_DEV && window.CGOR_IS_DEV());
        const hint = document.getElementById('add-song-hint');
        if (hint) hint.style.display = isDev ? 'none' : '';
        addSongForm.style.display = isDev ? 'none' : '';
        if (isDev) {
          addSongMsg.classList.remove('show');
          addSongMsg.textContent = '';
        }
        const t = document.getElementById('asb-title');
        if (t) t.style.display = '';
      }

      window.CGOR_applySongBoxRole = applySongBoxRole;

      // Bấm nút Thêm nhạc
      dpAddSong.addEventListener('click', () => {
        deckPanel.classList.remove('open');
        if (window.closeAllFloatingPanels) {
          window.closeAllFloatingPanels('add-song');
        }
        addSongMsg.classList.remove('show');
        addSongMsg.textContent = '';
        addSongBox.classList.add('open');
        applySongBoxRole();
        if (window.CGOR_IS_DEV && window.CGOR_IS_DEV()) {
          loadSongSuggestions();
        } else {
          setTimeout(() => addSongInput.focus(), 30);
        }
      });

      addSongClose.addEventListener('click', () => {
        addSongBox.classList.remove('open');
      });

      dsqRefresh.addEventListener('click', async () => {
        if (isRefreshingQueue) return;
        isRefreshingQueue = true;
        dsqRefresh.classList.add('reloading');
        dsqRefresh.disabled = true;
        const startAt = Date.now();
        await loadSongSuggestions();
        const elapsed = Date.now() - startAt;
        if (elapsed < 450) {
          await new Promise(resolve => setTimeout(resolve, 450 - elapsed));
        }
        dsqRefresh.classList.remove('reloading');
        dsqRefresh.disabled = false;
        isRefreshingQueue = false;
      });

      devSongList.addEventListener('click', async (e) => {
        const copyBtn = e.target.closest('.dsq-copy-btn');
        if (copyBtn) {
          const idx = parseInt(copyBtn.getAttribute('data-idx'), 10);
          const item = songSuggestions[idx];
          if (!item) return;
          const lang = window.getCGORLang ? window.getCGORLang() : 'vi';
          const dDict = (window.CGOR_I18N && window.CGOR_I18N[lang]) ? window.CGOR_I18N[lang].deck : null;
          try {
            await navigator.clipboard.writeText(item.content || '');
          } catch (err) {
            const ta = document.createElement('textarea');
            ta.value = item.content || '';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
          }
          copyBtn.textContent = (dDict && dDict.devCopiedBtn) || '✔ Đã copy';
          setTimeout(() => {
            copyBtn.textContent = (dDict && dDict.devCopyBtn) || '📋 Copy';
          }, 1600);
          return;
        }

        const delBtn = e.target.closest('.dsq-del-btn');
        if (delBtn) {
          const rowNum = parseInt(delBtn.getAttribute('data-row'), 10);
          const idx = parseInt(delBtn.getAttribute('data-idx'), 10);
          const removed = songSuggestions[idx];
          songSuggestions.splice(idx, 1);
          renderDevSongQueue();

          try {
            const localList = JSON.parse(localStorage.getItem('cgor_song_suggestions') || '[]');
            if (Array.isArray(localList) && removed) {
              localStorage.setItem('cgor_song_suggestions', JSON.stringify(localList.filter(x => x.content !== removed.content)));
            }
          } catch (err) {}

          const user = window.CGOR_GET_USER ? window.CGOR_GET_USER() : null;
          const apiUrl = window.CGOR_SHEET_API_URL;
          if (apiUrl && user && rowNum) {
            try {
              await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                  action: 'delete_song_request',
                  token: user.token,
                  row: rowNum
                })
              });
            } catch (err) {}
          }
        }
      });

      addSongForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawText = addSongInput.value.trim();
        if (!rawText) return;

        const lang = window.getCGORLang ? window.getCGORLang() : 'vi';
        const dDict = (window.CGOR_I18N && window.CGOR_I18N[lang]) ? window.CGOR_I18N[lang].deck : null;
        const user = window.CGOR_GET_USER ? window.CGOR_GET_USER() : null;
        const senderName = user ? (user.displayName + ' (@' + user.username + ')') : 'Khách';
        const nowIso = new Date().toISOString();

        addSongSubmit.disabled = true;

        // Lưu dự phòng cục bộ
        const reqItem = { sender: senderName, content: rawText, time: nowIso };
        try {
          const localList = JSON.parse(localStorage.getItem('cgor_song_suggestions') || '[]');
          localList.unshift(reqItem);
          localStorage.setItem('cgor_song_suggestions', JSON.stringify(localList.slice(0, 50)));
        } catch (err) {}

        // Gửi đề xuất lên Google Sheet cho DEV xem & duyệt
        const apiUrl = window.CGOR_SHEET_API_URL;
        if (apiUrl) {
          try {
            await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                action: 'suggest_song',
                token: user ? user.token : '',
                sender: senderName,
                content: rawText,
                ip: window.CGOR_GET_IP ? window.CGOR_GET_IP() : ''
              })
            });
          } catch (err) {}
        }

        addSongSubmit.disabled = false;
        addSongInput.value = '';
        addSongMsg.textContent = (dDict && dDict.addSentOk) ? dDict.addSentOk : '✅ Đã gửi đề xuất cho DEV! Khi DEV duyệt sẽ thêm vào danh sách phát.';
        addSongMsg.classList.add('show');

        if (window.CGOR_IS_DEV && window.CGOR_IS_DEV()) {
          loadSongSuggestions();
        }
      });

      dpToggle.addEventListener('click', () => {
        if (window.LofiXmas) window.LofiXmas.toggle();
      });

      dpNext.addEventListener('click', () => {
        if (window.LofiXmas) window.LofiXmas.nextSong();
      });

      dpChange.addEventListener('click', () => {
        const isOpen = dpList.classList.toggle('open');
        dpChange.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
        dpPick.style.display = isOpen ? 'block' : 'none';
        if (isOpen) setTimeout(scrollActiveIntoView, 30);
        if (!isOpen && dpSearchWrap.classList.contains('open')) {
          dpSearchWrap.classList.remove('open');
          dpSearch.setAttribute('aria-pressed', 'false');
        }
      });

      dpSearch.addEventListener('click', () => {
        const willOpen = !dpSearchWrap.classList.contains('open');
        dpSearchWrap.classList.toggle('open', willOpen);
        dpSearch.setAttribute('aria-pressed', willOpen ? 'true' : 'false');
        if (willOpen) {
          if (!dpList.classList.contains('open')) {
            dpList.classList.add('open');
            dpChange.setAttribute('aria-pressed', 'true');
            dpPick.style.display = 'block';
          }
          buildPlaylistItems();
          setTimeout(() => dpSearchInput.focus(), 30);
        } else {
          dpSearchInput.value = '';
          dpSearchClear.classList.remove('show');
          buildPlaylistItems();
        }
      });

      dpSearchInput.addEventListener('input', () => {
        dpSearchClear.classList.toggle('show', dpSearchInput.value.length > 0);
        buildPlaylistItems();
      });

      dpSearchClear.addEventListener('click', () => {
        dpSearchInput.value = '';
        dpSearchClear.classList.remove('show');
        buildPlaylistItems();
        dpSearchInput.focus();
      });

      dpRepeat.addEventListener('click', () => {
        if (window.LofiXmas) window.LofiXmas.toggleRepeatMode();
      });

      dpShuffle.addEventListener('click', () => {
        if (window.LofiXmas) window.LofiXmas.toggleShuffle();
      });

      function normalizeSearchStr(str) {
        return String(str || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .toLowerCase()
          .trim();
      }

      let lastActiveIdx = -1;

      function scrollActiveIntoView() {
        const act = dpList.querySelector('.dp-item.active');
        if (!act || !dpList.classList.contains('open')) return;
        const top = act.offsetTop - dpList.offsetTop;
        let st = Math.max(0, top - (dpList.clientHeight - act.offsetHeight) / 2);
        // nếu tiêu đề nhóm bị cắt dở ở mép trên thì cuộn lên hẳn tiêu đề
        let hdr = act.previousElementSibling;
        while (hdr && !hdr.classList.contains('dp-sec')) hdr = hdr.previousElementSibling;
        if (hdr) {
          const hTop = hdr.offsetTop - dpList.offsetTop;
          if (hTop < st && hTop + hdr.offsetHeight > st - 2) st = hTop;
        }
        dpList.scrollTop = st;
      }

      function buildPlaylistItems() {
        if (!window.LofiXmas) return;
        const lang = window.getCGORLang ? window.getCGORLang() : 'vi';
        const dDict = (window.CGOR_I18N && window.CGOR_I18N[lang]) ? window.CGOR_I18N[lang].deck : null;
        const xt = window.CGOR_X ? window.CGOR_X() : {};
        const MQ = window.CGOR_MQ;
        const songs = window.LofiXmas.getSongs();
        const curIdx = window.LofiXmas.getSongIdx();
        const q = normalizeSearchStr(dpSearchInput.value);

        if (MQ) dpList.querySelectorAll('.dp-item').forEach(MQ.unwatch);
        const prevScroll = dpList.scrollTop;
        dpList.innerHTML = '';

        // Đánh số riêng cho từng nhóm (nhóm hộp nhạc tách riêng khỏi danh sách nhạc)
        const groups = [
          { key: 'box', title: xt.boxTitle || '🎁 Nhạc hộp nhạc tích hợp', note: xt.boxNote || '' },
          { key: 'mp3', title: xt.mp3Title || '🎵 Danh sách nhạc', note: '' }
        ];
        let shown = 0;

        groups.forEach(g => {
          const inGroup = songs.filter(s => (g.key === 'box') === (s.group === 'box'));
          const items = inGroup
            .map((s, n) => ({ s, num: n + 1 }))
            .filter(o => !q || normalizeSearchStr(o.s.name).includes(q) || String(o.num) === q);
          if (!items.length) return;

          const sec = document.createElement('div');
          sec.className = 'dp-sec';
          const title = document.createElement('span');
          title.textContent = g.title;
          sec.appendChild(title);
          if (g.note) {
            const note = document.createElement('small');
            note.textContent = g.note;
            sec.appendChild(note);
          }
          dpList.appendChild(sec);

          items.forEach(o => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dp-item' + (o.s.index === curIdx ? ' active' : '');
            btn.textContent = o.num + '. ' + o.s.name;
            btn.title = o.s.name;
            btn.addEventListener('click', () => {
              window.LofiXmas.selectSong(o.s.index);
            });
            dpList.appendChild(btn);
            if (MQ) MQ.watch(btn);
            shown++;
          });
        });

        if (!shown) {
          const empty = document.createElement('div');
          empty.className = 'dp-empty';
          empty.textContent = (dDict && dDict.searchEmpty) ? dDict.searchEmpty : 'Không tìm thấy bài hát phù hợp.';
          dpList.appendChild(empty);
          return;
        }

        if (curIdx !== lastActiveIdx) {
          lastActiveIdx = curIdx;
          if (!q) scrollActiveIntoView();
        } else {
          dpList.scrollTop = prevScroll;
        }
      }

      function syncDeckUI() {
        if (!window.LofiXmas) return;
        const lang = window.getCGORLang ? window.getCGORLang() : 'vi';
        const dDict = (window.CGOR_I18N && window.CGOR_I18N[lang]) ? window.CGOR_I18N[lang].deck : null;
        const isPlaying = window.LofiXmas.isPlaying();
        const repMode = window.LofiXmas.getRepeatMode();
        const isShuf = window.LofiXmas.isShuffle();

        dpSong.textContent = window.LofiXmas.getSongName() || '-';
        dpSong.style.color = window.LofiXmas.getSongColor();

        if (dDict) {
          document.getElementById('dp-title').textContent = dDict.title;
          document.getElementById('dp-now-label').textContent = dDict.now;
          dpToggle.textContent = isPlaying ? dDict.pause : dDict.play;
          dpNext.textContent = dDict.next;
          dpChange.textContent = dDict.list;
          dpSearch.title = dDict.searchTitle || 'Tìm bài';
          dpSearchInput.placeholder = dDict.searchPlaceholder || 'Tìm tên bài hát...';
          dpPick.textContent = dDict.pick;
          dpRepeat.textContent = repMode === 'one' ? dDict.repOne : dDict.repAll;
          dpShuffle.textContent = isShuf ? dDict.shufOn : dDict.shufOff;
          dpAddSong.textContent = dDict.addBtn || '➕ Thêm nhạc';
          document.getElementById('asb-title').textContent = dDict.addTitle || '➕ Đề xuất thêm nhạc';
          document.getElementById('add-song-hint').textContent = dDict.addHint || 'Gợi ý: Điền tên bài hát (gửi cho DEV duyệt)';
          addSongInput.placeholder = dDict.addPlaceholder || 'Điền tên bài hát...';
          addSongSubmit.textContent = dDict.addSubmit || 'Gửi';
          const refreshLabel = dsqRefresh.querySelector('span:last-child');
          if (refreshLabel) refreshLabel.textContent = dDict.devRefreshBtn || 'Tải lại';
        }

        dpRepeat.classList.toggle('active', repMode === 'one');
        dpShuffle.classList.toggle('active', isShuf);
        dpShuffle.setAttribute('aria-pressed', isShuf ? 'true' : 'false');

        buildPlaylistItems();
        renderDevSongQueue();
      }

      window.updateDeckLanguage = syncDeckUI;
      if (window.LofiXmas && window.LofiXmas.onChange) {
        window.LofiXmas.onChange(syncDeckUI);
      }
      syncDeckUI();

      document.addEventListener('pointerdown', (e) => {
        if (deckPanel.classList.contains('open')) {
          if (!deckPanel.contains(e.target) && e.target !== deckCanvas) {
            deckPanel.classList.remove('open');
          }
        }
        if (addSongBox.classList.contains('open')) {
          if (!addSongBox.contains(e.target) && e.target !== dpAddSong && e.target !== deckCanvas) {
            addSongBox.classList.remove('open');
          }
        }
      });

      function drawDeck(now) {
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;

        const rect = deckCanvas.getBoundingClientRect();
        const size = Math.max(80, Math.round(rect.width || 132));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        if (deckCanvas.width !== size * dpr || deckCanvas.height !== size * dpr) {
          deckCanvas.width = size * dpr;
          deckCanvas.height = size * dpr;
        }

        dCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        dCtx.clearRect(0, 0, size, size);

        const isPlaying = window.LofiXmas ? window.LofiXmas.isPlaying() : false;
        const labelCol = window.LofiXmas ? window.LofiXmas.getSongColor() : '#ffd36b';

        if (isPlaying) {
          discAngle = (discAngle + dt * 2.4) % (Math.PI * 2);
          armAngle += (1 - armAngle) * 0.1;
        } else {
          armAngle += (0 - armAngle) * 0.1;
        }

        const pad = size * 0.06;
        const box = size - pad * 2;
        const rCorner = size * 0.14;

        dCtx.save();
        dCtx.beginPath();
        dCtx.roundRect(pad, pad, box, box, rCorner);
        dCtx.fillStyle = 'rgba(13, 22, 51, 0.92)';
        dCtx.fill();
        dCtx.lineWidth = 1.5;
        dCtx.strokeStyle = isPlaying ? '#ffd36b' : '#2a3b70';
        if (isPlaying) {
          dCtx.shadowColor = 'rgba(255, 211, 107, 0.35)';
          dCtx.shadowBlur = 12;
        }
        dCtx.stroke();
        dCtx.restore();

        const cx = size * 0.45;
        const cy = size * 0.52;
        const discR = size * 0.33;

        dCtx.save();
        dCtx.translate(cx, cy);
        dCtx.rotate(discAngle);

        dCtx.beginPath();
        dCtx.arc(0, 0, discR, 0, Math.PI * 2);
        dCtx.fillStyle = '#090d16';
        dCtx.fill();
        dCtx.lineWidth = 1.2;
        dCtx.strokeStyle = '#36497a';
        dCtx.stroke();

        [0.84, 0.70, 0.56].forEach(ratio => {
          dCtx.beginPath();
          dCtx.arc(0, 0, discR * ratio, 0, Math.PI * 2);
          dCtx.strokeStyle = 'rgba(207, 227, 255, 0.14)';
          dCtx.lineWidth = 0.8;
          dCtx.stroke();
        });

        dCtx.beginPath();
        dCtx.arc(0, 0, discR * 0.78, -0.5, 0.35);
        dCtx.strokeStyle = 'rgba(82, 240, 255, 0.32)';
        dCtx.lineWidth = 2;
        dCtx.stroke();

        dCtx.beginPath();
        dCtx.arc(0, 0, discR * 0.34, 0, Math.PI * 2);
        dCtx.fillStyle = labelCol;
        dCtx.fill();

        dCtx.beginPath();
        dCtx.arc(discR * 0.18, 0, discR * 0.055, 0, Math.PI * 2);
        dCtx.fillStyle = '#050a1a';
        dCtx.fill();

        dCtx.beginPath();
        dCtx.arc(0, 0, discR * 0.075, 0, Math.PI * 2);
        dCtx.fillStyle = '#eaf4ff';
        dCtx.fill();
        dCtx.restore();

        dCtx.beginPath();
        dCtx.arc(pad + size * 0.11, pad + size * 0.11, size * 0.026, 0, Math.PI * 2);
        dCtx.fillStyle = isPlaying ? '#4ef57b' : '#ff5c7c';
        dCtx.fill();

        const pivotX = pad + box * 0.82;
        const pivotY = pad + box * 0.22;
        const armLen = box * 0.50;
        const theta = 0.18 + armAngle * 0.44;

        dCtx.save();
        dCtx.translate(pivotX, pivotY);
        dCtx.rotate(theta);

        dCtx.beginPath();
        dCtx.arc(0, 0, size * 0.052, 0, Math.PI * 2);
        dCtx.fillStyle = '#243668';
        dCtx.fill();
        dCtx.strokeStyle = '#ffd36b';
        dCtx.lineWidth = 1.2;
        dCtx.stroke();

        dCtx.beginPath();
        dCtx.moveTo(0, 0);
        dCtx.lineTo(-armLen * 0.22, armLen);
        dCtx.strokeStyle = '#dce8ff';
        dCtx.lineWidth = Math.max(1.8, size * 0.018);
        dCtx.lineCap = 'round';
        dCtx.stroke();

        dCtx.fillStyle = '#ffd36b';
        dCtx.fillRect(-armLen * 0.22 - size * 0.025, armLen - size * 0.02, size * 0.05, size * 0.065);
        dCtx.restore();

        if (isPlaying) {
          const floatPhase = (now / 1000) % 1;
          const noteY = cy - discR * 0.5 - floatPhase * (size * 0.24);
          const noteX = cx + Math.sin(now / 320) * (size * 0.07);
          dCtx.globalAlpha = 1 - floatPhase;
          dCtx.fillStyle = '#52f0ff';
          dCtx.font = '700 ' + Math.round(size * 0.12) + 'px "JetBrains Mono", monospace';
          dCtx.fillText('♪', noteX, noteY);
          dCtx.globalAlpha = 1;
        }

        requestAnimationFrame(drawDeck);
      }

      requestAnimationFrame(drawDeck);
    })();
