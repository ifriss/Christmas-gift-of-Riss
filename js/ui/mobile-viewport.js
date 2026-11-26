    /* Gõ xong trên mobile → trả trang về toàn màn hình 1x (không còn bị phóng to / lệch do bàn phím) */
    (function () {
      const vp = document.querySelector('meta[name="viewport"]');
      const BASE = vp ? vp.getAttribute('content') : '';
      const coarse = matchMedia('(pointer: coarse)').matches;
      const isField = function (el) {
        return !!el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) &&
          !/^(range|checkbox|radio|button|submit)$/.test(el.type || '');
      };

      function restoreView() {
        try {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        } catch (e) {}
        const vv = window.visualViewport;
        if (vv && Math.abs(vv.scale - 1) > 0.01 && vp) {
          // iOS: nếu vẫn còn bị phóng to thì ép về 1x rồi trả lại meta cũ
          vp.setAttribute('content', 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
          setTimeout(function () { vp.setAttribute('content', BASE); }, 300);
        }
        try { window.dispatchEvent(new Event('resize')); } catch (e) {}
      }

      document.addEventListener('focusout', function (e) {
        if (!isField(e.target)) return;
        setTimeout(function () { if (!isField(document.activeElement)) restoreView(); }, 120);
        setTimeout(function () { if (!isField(document.activeElement)) restoreView(); }, 450); // bàn phím đóng xong mới chốt
      });

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function () {
          if (!isField(document.activeElement)) { try { window.scrollTo(0, 0); } catch (e) {} }
        });
      }

      // Gửi xong (bài Bảng tin, thông báo, đề xuất nhạc, hẹn giờ) → hạ bàn phím để về toàn màn hình
      if (coarse) {
        const blurSoon = function () {
          setTimeout(function () {
            const a = document.activeElement;
            if (isField(a)) a.blur();
          }, 80);
        };
        ['mb-send', 'noti-send', 'add-song-submit', 'dp-timer-set'].forEach(function (id) {
          const b = document.getElementById(id);
          if (b) b.addEventListener('click', blurSoon);
        });
        ['add-song-form'].forEach(function (id) {
          const f = document.getElementById(id);
          if (f) f.addEventListener('submit', blurSoon);
        });
      }
    })();
