    (function () {
      /* ---------------- Chuỗi đa ngôn ngữ cho các tính năng mới ---------------- */
      const X = {
        vi: {
          ctlBtn: 'Bảng điều khiển',
          ctlTitle: '⚙️ Bảng điều khiển',
          boxTitle: '🎁 Nhạc hộp nhạc tích hợp',
          boxNote: '🎄🎄🎄',
          mp3Title: '🎵 Danh sách nhạc',
          seekAria: 'Tua nhạc',
          volLabel: 'Âm lượng',
          volHint: 'iPhone/iPad: hãy dùng nút âm lượng của máy.',
          volRouted: 'Đang dùng âm lượng trong web (iPhone). Nếu tắt màn hình mà nhạc nhỏ/ngắt: kéo về 100 rồi tải lại trang.',
          timerTitle: '⏲ Hẹn giờ tắt nhạc',
          tOff: 'Tắt',
          t30: '30 phút',
          t60: '1 giờ',
          t120: '2 giờ',
          tCustom: 'Tùy chỉnh',
          tPlaceholder: 'Số phút (1–720)',
          tSet: 'Đặt',
          tLeft: 'Còn'
        },
        en: {
          ctlBtn: 'Control panel',
          ctlTitle: '⚙️ Control panel',
          boxTitle: '🎁 Built-in music box',
          boxNote: '🎄🎄🎄',
          mp3Title: '🎵 Playlist',
          seekAria: 'Seek',
          volLabel: 'Volume',
          volHint: 'iPhone/iPad: please use the device volume buttons.',
          volRouted: 'Web volume is active (iPhone). If music gets quiet or cuts out with the screen off, set it to 100 and reload.',
          timerTitle: '⏲ Sleep timer',
          tOff: 'Off',
          t30: '30 min',
          t60: '1 hour',
          t120: '2 hours',
          tCustom: 'Custom',
          tPlaceholder: 'Minutes (1–720)',
          tSet: 'Set',
          tLeft: 'Left'
        },
        zh: {
          ctlBtn: '控制面板',
          ctlTitle: '⚙️ 控制面板',
          boxTitle: '🎁 内置音乐盒',
          boxNote: '🎄🎄🎄',
          mp3Title: '🎵 播放列表',
          seekAria: '进度',
          volLabel: '音量',
          volHint: 'iPhone/iPad 请使用设备音量键。',
          volRouted: '正在使用网页音量（iPhone）。若息屏后声音变小或中断，请调到 100 并刷新页面。',
          timerTitle: '⏲ 定时关闭音乐',
          tOff: '关闭',
          t30: '30 分钟',
          t60: '1 小时',
          t120: '2 小时',
          tCustom: '自定义',
          tPlaceholder: '分钟 (1–720)',
          tSet: '设定',
          tLeft: '剩余'
        }
      };
      window.CGOR_X = function () {
        const l = (window.getCGORLang && window.getCGORLang()) || 'vi';
        return X[l] || X.vi;
      };

      /* ---------------- Chữ chạy (marquee) cho nút / tên bài bị tràn ----------------
         Phần tử nào bị cắt chữ sẽ được gắn class .mq-ov + biến --mq-d (quãng chạy) và
         --mq-dur (thời lượng). CSS lo phần animation (text-indent) nên không phá vỡ
         việc script khác ghi đè textContent.                                              */
      const watched = new WeakSet();

      function measure(el) {
        if (!el || !el.isConnected) return;
        el.classList.remove('mq-ov');
        const w = el.clientWidth;
        const over = el.scrollWidth - w;
        if (w > 0 && over > 2) {
          el.style.setProperty('--mq-d', -(over + 8) + 'px');
          el.style.setProperty('--mq-dur', Math.max(3.4, (over + 8) / 24 + 3).toFixed(2) + 's');
          el.classList.add('mq-ov');
        }
      }

      const ro = ('ResizeObserver' in window)
        ? new ResizeObserver(function (entries) { entries.forEach(function (e) { measure(e.target); }); })
        : null;

      const mo = new MutationObserver(function (records) {
        const set = new Set();
        records.forEach(function (r) {
          let n = r.target;
          while (n && !(n.nodeType === 1 && watched.has(n))) n = n.parentNode;
          if (n) set.add(n);
        });
        set.forEach(measure);
      });

      function watch(el) {
        if (!el || watched.has(el)) return;
        watched.add(el);
        if (ro) ro.observe(el);
        mo.observe(el, { childList: true, characterData: true, subtree: true });
        measure(el);
      }
      function unwatch(el) {
        if (!el) return;
        watched.delete(el);
        if (ro) { try { ro.unobserve(el); } catch (e) {} }
      }
      function scan(root) {
        (root || document).querySelectorAll('.mq-auto').forEach(function (el) {
          if (watched.has(el)) measure(el); else watch(el);
        });
      }

      window.CGOR_MQ = { watch: watch, unwatch: unwatch, scan: scan, measure: measure };
      window.addEventListener('resize', function () { scan(); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { scan(); });
      scan();
    })();
