    (function () {
      const $ = function (id) { return document.getElementById(id); };
      const L = window.LofiXmas;
      const X = function () { return window.CGOR_X(); };
      const lang = function () { return (window.getCGORLang && window.getCGORLang()) || 'vi'; };

      /* =====================================================================
         A. NÚT NHỎ "BẢNG ĐIỀU KHIỂN" (dưới chữ MERRY CHRISTMAS) + BẢNG NỔI
         ===================================================================== */
      const ctlBtn = $('ctl-btn');
      const ctlPanel = $('ctl-panel');
      const ctlClose = $('ctl-close');

      function placeCtlBtn() {
        const lay = window.CGOR_LAYOUT;
        if (!lay) return;
        const safeB = 12;
        const top = Math.min(lay.msgBottomY + 6, lay.H - 40 - safeB);
        ctlBtn.style.top = Math.max(60, top) + 'px';
        if (ctlPanel.classList.contains('open')) placeCtlPanel();
      }

      function placeCtlPanel() {
        const r = ctlBtn.getBoundingClientRect();
        const below = innerHeight - r.bottom - 18;
        if (below >= 150) {
          ctlPanel.style.top = (r.bottom + 8) + 'px';
          ctlPanel.style.bottom = 'auto';
          ctlPanel.style.maxHeight = below + 'px';
        } else {
          ctlPanel.style.top = 'auto';
          ctlPanel.style.bottom = (innerHeight - r.top + 8) + 'px';
          ctlPanel.style.maxHeight = Math.max(120, r.top - 18) + 'px';
        }
      }

      function openCtl() {
        if (window.closeAllFloatingPanels) window.closeAllFloatingPanels('ctl');
        ctlPanel.classList.add('open');
        ctlBtn.setAttribute('aria-expanded', 'true');
        placeCtlPanel();
      }
      function closeCtl() {
        ctlPanel.classList.remove('open');
        ctlBtn.setAttribute('aria-expanded', 'false');
      }
      window.closeCtlPanel = closeCtl;

      ctlBtn.addEventListener('click', function () {
        if (ctlPanel.classList.contains('open')) closeCtl(); else openCtl();
      });
      ctlClose.addEventListener('click', closeCtl);
      document.addEventListener('pointerdown', function (e) {
        if (ctlPanel.classList.contains('open') && !ctlPanel.contains(e.target) && !ctlBtn.contains(e.target)) closeCtl();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && ctlPanel.classList.contains('open')) { closeCtl(); ctlBtn.focus(); }
      });
      window.addEventListener('cgor-layout', placeCtlBtn);
      window.addEventListener('resize', placeCtlBtn);
      placeCtlBtn();
      setTimeout(function () { ctlBtn.classList.add('show'); }, 5200);

      /* =====================================================================
         B. TRÌNH PHÁT NHẠC: đã chuyển sang js/core/music-player.js (dùng chung mọi Space)
         ===================================================================== */
      function applyExtraLang() {
        const t = X();
        $('ctl-btn-txt').textContent = t.ctlBtn;
        $('ctl-title').textContent = t.ctlTitle;
        ctlBtn.title = t.ctlBtn;
        placeCtlBtn();
      }
      const prevBar = window.updateBarLanguage;
      window.updateBarLanguage = function (l) {
        if (prevBar) prevBar(l);
        applyExtraLang();
      };
      const prevDeck = window.updateDeckLanguage;
      window.updateDeckLanguage = function () {
        if (prevDeck) prevDeck();
        applyExtraLang();
      };
      applyExtraLang();

      /* =====================================================================
         C. ÔNG GIÀ NOEL NÓI CHUYỆN (bóng nói tinh tế, tự canh vị trí)
         ===================================================================== */
      const SM = {
        vi: {
          hoho: 'Ho ho ho! 🎅',
          cd0: 'Hôm nay là Giáng Sinh! Merry Christmas! 🎅',
          cd1: 'Ngày mai là Giáng Sinh rồi! 🎄',
          cdN: function (n) { return 'Còn ' + n + ' ngày nữa là đến Giáng Sinh! 🎄'; },
          warm: 'Trời lạnh rồi, nhớ mặc ấm và uống chút nước ấm nhé! 🧣',
          musicOn: function (n) { return 'Đang phát: ' + n + ' 🎵'; },
          musicOff: 'Bấm vào máy đĩa than để nghe nhạc nhé! 💿',
          thanks: 'Cảm ơn DEV Riss đã tạo ra ta! 🙏',
          tap: 'Chạm vào nơi bất kì trên màn hình để bắn pháo hoa nhé! 🎆',
          drag: 'Kéo cây thông sang trái phải để xoay nè!',
          mail: 'Đừng quên ghé Bảng tin xem có gì mới nhé 📩',
          late: 'Khuya rồi, nhớ ngủ sớm nhé 🌙',
          rest: 'Nhớ nghỉ ngơi và ngủ đủ giấc nhé 😴',
          panel: 'Thử Bảng điều khiển dưới cây thông xem, nhiều hiệu ứng lắm đó! ⚙️',
          good: 'Ho ho ho! Năm nay bạn ngoan lắm đó 🎁',
          cocoa: 'Một cốc ca cao nóng lúc này thì tuyệt nhỉ? ☕',
          tapMe: 'Bấm vào ta để nghe tiếng cười Ho ho ho nè!',
          gifts: 'Mấy hộp quà dưới gốc cây là dành cho bạn đó 🎁',
          sleepOn: function (m) { return 'Nhạc sẽ tự tắt sau khoảng ' + m + ' phút nữa 🌙'; },
          sleepHint: 'Hẹn giờ tắt nhạc ở máy đĩa than để ngủ ngon nhé 😴',
          bye: 'Nhạc đã tắt. Chúc ngủ ngon, mơ đẹp nhé! 🌙',
          more: [
            'Tuần lộc của ta đang nghỉ ngơi, chờ đêm Giáng Sinh đây! 🦌',
            'Ta đang kiểm tra danh sách ngoan và nghịch… bạn nằm ở trang đầu nhé! 📜',
            'Nhớ gọi cho người thân, một lời hỏi thăm cũng là món quà đó 💌',
            'Bánh quy gừng và sữa ấm là món ta thích nhất! 🍪',
            'Tuyết rơi nhẹ thế này, thích hợp để nghe nhạc lofi ghê! ❄️',
            'Mỗi ngôi sao trên cây thông là một điều ước đó, thử ước xem! ⭐',
            'Hôm nay bạn đã cười chưa? Cười một cái đi, ta thấy rồi nha 😄',
            'Chúc bạn một mùa Giáng Sinh ấm áp bên những người thương yêu ❤️',
            'Xưởng đồ chơi ở Bắc Cực đang bận tối mắt luôn! 🛠️',
            'Đừng thức khuya quá, ta không muốn bạn mệt đâu 🌙',
            'Bạn thử bấm vào ta nhiều lần xem, ta cười to lắm đó! 🎅',
            'Giáng Sinh không cần quà đắt tiền, chỉ cần có nhau là đủ 🎄',
            'Ta mang cả bao tải quà, nhưng món đáng giá nhất vẫn là nụ cười của bạn 🎁',
            'Hãy đăng vài dòng lên Bảng tin để chia sẻ với mọi người nhé! ✉️',
            'Có gì thắc mắc cứ bấm nút "Hỏi đáp" dưới chân ta nhé! 🎅'
          ]
        },
        en: {
          hoho: 'Ho ho ho! 🎅',
          cd0: 'It’s Christmas today! Merry Christmas! 🎅',
          cd1: 'Christmas is tomorrow! 🎄',
          cdN: function (n) { return n + ' days left until Christmas! 🎄'; },
          warm: 'It’s chilly out there. Stay warm and sip something hot! 🧣',
          musicOn: function (n) { return 'Now playing: ' + n + ' 🎵'; },
          musicOff: 'Tap the record player to play some music! 💿',
          thanks: 'Thanks to DEV Riss for creating me! 🙏',
          tap: 'Tap anywhere on the screen to launch fireworks! 🎆',
          drag: 'Drag the tree left or right to spin it!',
          mail: 'Don’t forget to check the Feed for what’s new 📩',
          late: 'It’s getting late. Get some sleep soon! 🌙',
          rest: 'Remember to rest and get enough sleep 😴',
          panel: 'Try the Control panel under the tree. Lots of effects! ⚙️',
          good: 'Ho ho ho! You’ve been very good this year 🎁',
          cocoa: 'A cup of hot cocoa would be perfect right now, wouldn’t it? ☕',
          tapMe: 'Tap me to hear my Ho ho ho laugh!',
          gifts: 'The presents under the tree are for you 🎁',
          sleepOn: function (m) { return 'The music will stop in about ' + m + ' min 🌙'; },
          sleepHint: 'Use the sleep timer on the record player and rest well 😴',
          bye: 'Music off. Sleep well and sweet dreams! 🌙',
          more: [
            'My reindeer are resting up for Christmas Eve! 🦌',
            'I’m checking my nice list… you’re right at the top! 📜',
            'Call someone you love. A simple hello is a gift too 💌',
            'Gingerbread cookies and warm milk are my favorites! 🍪',
            'Snow falling softly like this is perfect for lofi music! ❄️',
            'Every star on the tree is a wish. Go ahead, make one! ⭐',
            'Have you smiled today? Go on, I can see you! 😄',
            'Wishing you a warm Christmas with the people you love ❤️',
            'The toy workshop at the North Pole is super busy right now! 🛠️',
            'Don’t stay up too late, I don’t want you to get tired 🌙',
            'Try tapping me a few times. My laugh is really loud! 🎅',
            'Christmas isn’t about expensive gifts, being together is enough 🎄',
            'My sack is full of presents, but your smile is the best one 🎁',
            'Post something on the Feed and share it with everyone! ✉️',
            'Got a question? Tap the “Ask Santa” button under my feet! 🎅'
          ]
        },
        zh: {
          hoho: '呵呵呵！🎅',
          cd0: '今天就是圣诞节！圣诞快乐！🎅',
          cd1: '明天就是圣诞节啦！🎄',
          cdN: function (n) { return '距离圣诞节还有 ' + n + ' 天！🎄'; },
          warm: '天冷了，记得穿暖和一点，多喝热水哦！🧣',
          musicOn: function (n) { return '正在播放：' + n + ' 🎵'; },
          musicOff: '点一下唱片机听音乐吧！💿',
          thanks: '感谢开发者 Riss 创造了我！🙏',
          tap: '点一下屏幕上的任意位置就能放烟花哦！🎆',
          drag: '左右拖动圣诞树可以旋转哦！',
          mail: '别忘了去动态看看有什么新鲜事 📩',
          late: '夜深了，早点休息吧 🌙',
          rest: '记得好好休息，睡饱觉哦 😴',
          panel: '试试树下的控制面板，有很多特效哦！⚙️',
          good: '呵呵呵！今年你很乖哦 🎁',
          cocoa: '这时候来一杯热可可就完美了 ☕',
          tapMe: '点我就能听到“呵呵呵”的笑声哦！',
          gifts: '树下的礼物是送给你的 🎁',
          sleepOn: function (m) { return '音乐将在大约 ' + m + ' 分钟后自动关闭 🌙'; },
          sleepHint: '用唱片机的定时功能，安心入睡吧 😴',
          bye: '音乐已关闭。晚安，好梦！🌙',
          more: [
            '我的驯鹿正在养精蓄锐，等待平安夜！🦌',
            '我在查看乖孩子名单……你排在第一页哦！📜',
            '记得给家人打个电话，一句问候也是礼物 💌',
            '姜饼和热牛奶是我的最爱！🍪',
            '雪花轻轻飘落，最适合听 lofi 音乐了！❄️',
            '树上的每颗星星都是一个愿望，快许一个吧！⭐',
            '今天你笑了吗？笑一个，我看到啦！😄',
            '祝你和所爱的人一起度过温暖的圣诞节 ❤️',
            '北极的玩具工坊现在忙得不可开交！🛠️',
            '别熬夜太晚，我不想你累着 🌙',
            '多点几下我试试，我的笑声可大啦！🎅',
            '圣诞节不需要昂贵的礼物，有彼此就足够了 🎄',
            '我的口袋里装满礼物，但最珍贵的是你的笑容 🎁',
            '来动态里发一句话和大家分享吧！✉️',
            '有问题就点我脚下的“问答”按钮吧！🎅'
          ]
        }
      };

      const bubble = $('santa-bubble');
      const sbText = $('sb-text');
      let idleTimer = null;
      let typeTimer = null;
      let busyUntil = 0;
      let bag = [];
      let curRender = null;   // hàm (T) → chữ của câu đang hiển thị, để dịch ngay khi đổi ngôn ngữ
      let first = true;

      function daysToXmas() {
        const n = new Date(Date.now() + 7 * 3600 * 1000); // giờ Việt Nam (GMT+7)
        const y = n.getUTCFullYear();
        const today = Date.UTC(y, n.getUTCMonth(), n.getUTCDate());
        let target = Date.UTC(y, 11, 25);
        if (today > target) target = Date.UTC(y + 1, 11, 25);
        return Math.round((target - today) / 86400000);
      }

      function build(TT) {
        const T = TT || SM[lang()] || SM.vi;
        const out = [];
        const d = daysToXmas();
        out.push(d === 0 ? T.cd0 : d === 1 ? T.cd1 : T.cdN(d));
        out.push(T.warm);
        out.push(L.isPlaying() && L.getSongName() ? T.musicOn(L.getSongName()) : T.musicOff);
        out.push(T.thanks, T.tap, T.drag, T.mail);
        const h = new Date().getHours();
        out.push(h >= 22 || h < 5 ? T.late : T.rest);
        out.push(T.panel, T.good, T.cocoa, T.tapMe, T.gifts);
        if (Array.isArray(T.more)) T.more.forEach(function (m) { out.push(m); });
        const mins = Math.ceil(L.getSleepRemaining() / 60);
        out.push(mins > 0 ? T.sleepOn(mins) : T.sleepHint);
        return out;
      }

      let lastIdx = -1;
      // Túi lưu CHỈ SỐ câu (không lưu chữ) → đổi ngôn ngữ vẫn dùng lại được, không cần tải lại trang
      function nextIdx() {
        if (!bag.length) {
          const all = [];
          const n = build().length;
          for (let i = 0; i < n; i++) all.push(i);
          const head = first ? all.shift() : null; // lần đầu luôn nói đếm ngược trước
          for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = all[i]; all[i] = all[j]; all[j] = tmp;
          }
          bag = head !== null ? [head].concat(all).reverse() : all;
        }
        let i = bag.pop();
        if (i === lastIdx && bag.length) i = bag.pop();
        first = false;
        lastIdx = i;
        return i;
      }

      function show(text, speed) {
        clearTimeout(typeTimer);
        const chars = Array.from(text);
        const a = document.createElement('span');
        const b = document.createElement('span');
        b.className = 'sb-h';
        sbText.textContent = '';
        sbText.appendChild(a);
        sbText.appendChild(b);
        bubble.classList.add('on');
        place();
        let i = 0;
        (function step() {
          i++;
          a.textContent = chars.slice(0, i).join('');
          b.textContent = chars.slice(i).join('');
          if (i < chars.length) typeTimer = setTimeout(step, speed);
        })();
        return chars.length;
      }
      function hide() {
        clearTimeout(typeTimer);
        bubble.classList.remove('on');
      }

      // Thời gian nói & nghỉ phụ thuộc độ dài câu: câu dài → hiển thị lâu hơn và nghỉ lâu hơn
      const holdMs = function (n) { return Math.min(8000, Math.max(3000, 1800 + n * 55)); };
      const gapMs = function (n) { return Math.min(9000, Math.max(3500, 2800 + n * 70)); };

      function idle() {
        clearTimeout(idleTimer);
        const S = window.CGOR_SANTA;
        if (document.hidden || !S || !S.on || Date.now() < busyUntil) {
          idleTimer = setTimeout(idle, 1200);
          return;
        }
        const idx = nextIdx();
        curRender = function (T) { return build(T)[idx]; };
        const n = show(curRender(SM[lang()] || SM.vi), 26);
        idleTimer = setTimeout(function () {
          hide();
          idleTimer = setTimeout(idle, gapMs(n));
        }, n * 26 + holdMs(n));
      }

      function say(textFn, speed) {
        clearTimeout(idleTimer);
        curRender = typeof textFn === 'function' ? textFn : function () { return textFn; };
        const n = show(curRender(SM[lang()] || SM.vi), speed || 26);
        busyUntil = Date.now() + n * (speed || 26) + 1500;
        idleTimer = setTimeout(function () {
          hide();
          idleTimer = setTimeout(idle, 2500);
        }, n * (speed || 26) + holdMs(n));
      }

      window.CGOR_santaHoHo = function () {
        const T = SM[lang()] || SM.vi;
        const S = window.CGOR_SANTA;
        if (!S || !S.on) return;
        clearTimeout(idleTimer);
        curRender = function (TT) { return TT.hoho; };
        const n = show(T.hoho, 115);
        busyUntil = Date.now() + 3600;
        idleTimer = setTimeout(function () {
          hide();
          idleTimer = setTimeout(idle, 3000);
        }, n * 115 + 1500);
      };

      window.addEventListener('cgor-sleep-done', function () {
        say(function (TT) { return TT.bye; });
      });

      // Đổi ngôn ngữ: ông già Noel đổi sang ngôn ngữ mới NGAY, kể cả câu đang hiện trên bóng nói
      let shownLang = lang();
      function refreshSantaLang() {
        const cur = lang();
        if (cur === shownLang) return;
        shownLang = cur;
        if (curRender && bubble.classList.contains('on')) {
          const T = SM[cur] || SM.vi;
          clearTimeout(typeTimer);
          const chars = Array.from(curRender(T));
          sbText.textContent = '';
          const a = document.createElement('span');
          const b = document.createElement('span');
          b.className = 'sb-h';
          a.textContent = chars.join('');
          sbText.appendChild(a);
          sbText.appendChild(b);
          place();
        }
      }
      const prevDeckSanta = window.updateDeckLanguage;
      window.updateDeckLanguage = function () {
        if (prevDeckSanta) prevDeckSanta();
        refreshSantaLang();
      };
      window.addEventListener('cgor-lang', refreshSantaLang);

      // Bóng nói bám theo đầu ông già Noel, luôn nằm gọn trong màn hình
      function place() {
        const S = window.CGOR_SANTA;
        if (!S || !S.on) { hide(); return; }
        const w = bubble.offsetWidth;
        const h = bubble.offsetHeight;
        let left = S.x - 26;
        left = Math.max(8, Math.min(innerWidth - w - 8, left));
        const tail = Math.max(14, Math.min(w - 20, S.x - left));
        const top = Math.max(54, S.y - h - 12);
        bubble.style.translate = Math.round(left) + 'px ' + Math.round(top) + 'px';
        bubble.style.setProperty('--tail', Math.round(tail) + 'px');
      }
      function follow() {
        requestAnimationFrame(follow);
        if (bubble.classList.contains('on')) place();
      }
      requestAnimationFrame(follow);


      /* =====================================================================
         D. HỎI ĐÁP VỚI ÔNG GIÀ NOEL (câu hỏi soạn sẵn + AI miễn phí)
         ===================================================================== */
      // Dịch vụ AI miễn phí (không cần khóa API). Đổi địa chỉ này nếu muốn dùng dịch vụ khác.
      const AI_ENDPOINT = 'https://text.pollinations.ai/openai';

      const QA = {
        vi: {
          btn: 'Hỏi đáp 🎅',
          title: '🎅 Hỏi đáp với ông già Noel',
          ph: 'Hỏi ông già Noel điều gì đó…',
          send: 'Gửi',
          greet: 'Ho ho ho! Chọn một câu hỏi bên dưới, hoặc gõ câu hỏi của bạn nhé! 🎄',
          thinking: 'Ông già Noel đang suy nghĩ…',
          err: 'Ôi, tuyết rơi dày quá nên ta chưa nghe rõ. Bạn thử lại sau chút nhé! ❄️ (Bạn vẫn có thể bấm các câu hỏi gợi ý bên trên)',
          slow: 'Từ từ thôi nào, cho ta thở một chút rồi hãy hỏi tiếp nhé! 🎅',
          note: 'Ông già Noel là AI không phải con người, mà dù là người hay AI cũng có lần mắc sai sót mà. Mong các bạn thông cảm cho ta.',
          sys: 'You are a cheerful, kind Santa Claus chatting on a Christmas greeting website. Answer in the same language as the user (Vietnamese by default). Answer ANY question the user asks, on any topic (math, science, school, life advice, games, tech, general knowledge and more), correctly and helpfully; being accurate matters more than staying on the Christmas theme. Keep the warm, friendly Santa tone, but do not refuse a normal question just because it is not about Christmas. Keep answers short (about 80 words) unless the user asks for more detail, and use at most one emoji. Only decline requests that are truly harmful or inappropriate for all ages (for example weapons, self-harm methods, sexual content, hate), politely and briefly. Never ask for or store personal information.',
          d0: 'Hôm nay chính là Giáng Sinh đó! Merry Christmas! 🎄',
          d1: 'Chỉ còn 1 ngày nữa thôi, ngày mai là Giáng Sinh rồi! 🎄',
          dN: function (n) { return 'Còn ' + n + ' ngày nữa là đến Giáng Sinh (25/12)! 🎄'; },
          jokes: [
            'Vì sao ông già Noel hay cười? Vì ông luôn nói "Ho ho ho" thay vì "Ha ha ha"! 😄',
            'Cây thông Noel đi học trễ vì sao? Vì bị kẹt… tuyết! ❄️',
            'Người tuyết thích ăn gì? Cháo… đá! ⛄',
            'Tuần lộc đi làm bằng gì? Bằng… xe trượt tuyết công cộng! 🦌'
          ],
          items: [
            { q: 'Còn bao nhiêu ngày nữa là Giáng Sinh?', a: function (T) { const d = daysToXmas(); return d === 0 ? T.d0 : d === 1 ? T.d1 : T.dN(d); } },
            { q: 'Ông già Noel là ai?', a: 'Hình ảnh ông già Noel bắt nguồn từ thánh Nicholas, người nổi tiếng với lòng tốt và những món quà bí mật cho trẻ em. Ngày nay ông được kể là sống ở Bắc Cực, tặng quà cho các bạn nhỏ ngoan vào đêm Giáng Sinh. 🎅' },
            { q: 'Vì sao có cây thông Noel?', a: 'Cây thông xanh quanh năm tượng trưng cho sự sống và hy vọng giữa mùa đông. Tục trang trí cây thông Giáng Sinh phổ biến ở Đức từ khoảng thế kỷ 16, rồi lan ra khắp thế giới. 🎄' },
            { q: 'Tuần lộc của ông tên gì?', a: 'Đội tuần lộc kéo xe gồm Dasher, Dancer, Prancer, Vixen, Comet, Cupid, Donner và Blitzen. Rudolph mũi đỏ được thêm vào sau và dẫn đường trong đêm sương mù! 🦌' },
            { q: 'Cách dùng trang web này?', a: '• Kéo cây thông sang trái phải để xoay.\n• Chạm bất kì nơi nào để bắn pháo hoa.\n• Chạm vào ta để nghe tiếng cười.\n• Bấm máy đĩa than để nghe nhạc.\n• Mở Bảng tin để đăng bài, và Bảng điều khiển để đổi hiệu ứng. 🎁' },
            { q: 'Đăng bài lên Bảng tin như thế nào?', a: 'Bạn đăng nhập tài khoản, mở Bảng tin 📩 rồi gõ nội dung và đăng. Bạn cũng có thể thả tim 🤍 hoặc phản hồi bài viết của mọi người nhé!' },
            { q: 'Đổi nhạc và hẹn giờ tắt nhạc?', a: 'Bấm vào máy đĩa than để mở trình phát: chọn bài, tua nhạc, chỉnh âm lượng và đặt hẹn giờ tắt nhạc để ngủ ngon. Muốn có bài mới thì bấm "Thêm nhạc" để gửi đề xuất cho DEV duyệt. 🎵' },
            { q: 'Kể một chuyện cười đi!', a: function (T) { return T.jokes[Math.floor(Math.random() * T.jokes.length)]; } }
          ]
        },
        en: {
          btn: 'Ask Santa 🎅',
          title: '🎅 Ask Santa',
          ph: 'Ask Santa anything…',
          send: 'Send',
          greet: 'Ho ho ho! Pick a question below, or type your own! 🎄',
          thinking: 'Santa is thinking…',
          err: 'Oh dear, the snow is so heavy I couldn’t hear you. Please try again in a moment! ❄️ (You can still tap the suggested questions above)',
          slow: 'Easy now, let me catch my breath before the next question! 🎅',
          note: 'Santa is an AI, not a human, but whether human or AI, everyone makes mistakes sometimes. Please be kind to me.',
          sys: 'You are a cheerful, kind Santa Claus chatting on a Christmas greeting website. Answer in the same language as the user (English by default). Answer ANY question the user asks, on any topic (math, science, school, life advice, games, tech, general knowledge and more), correctly and helpfully; being accurate matters more than staying on the Christmas theme. Keep the warm, friendly Santa tone, but do not refuse a normal question just because it is not about Christmas. Keep answers short (about 80 words) unless the user asks for more detail, and use at most one emoji. Only decline requests that are truly harmful or inappropriate for all ages (for example weapons, self-harm methods, sexual content, hate), politely and briefly. Never ask for or store personal information.',
          d0: 'It’s Christmas today! Merry Christmas! 🎄',
          d1: 'Just one more day, Christmas is tomorrow! 🎄',
          dN: function (n) { return n + ' days left until Christmas (Dec 25)! 🎄'; },
          jokes: [
            'Why does Santa love gardening? Because he loves to “ho ho ho”! 😄',
            'What do snowmen eat for breakfast? Frosted flakes! ⛄',
            'Why was the Christmas tree late for school? It got stuck in the… snow! ❄️',
            'How do reindeer get to work? By sleigh-share! 🦌'
          ],
          items: [
            { q: 'How many days until Christmas?', a: function (T) { const d = daysToXmas(); return d === 0 ? T.d0 : d === 1 ? T.d1 : T.dN(d); } },
            { q: 'Who is Santa Claus?', a: 'Santa Claus is inspired by Saint Nicholas, remembered for his kindness and secret gifts to children. Today he’s said to live at the North Pole and bring presents to good children on Christmas Eve. 🎅' },
            { q: 'Why do we have Christmas trees?', a: 'Evergreen trees symbolize life and hope in the middle of winter. Decorating a Christmas tree became popular in Germany around the 16th century and spread around the world. 🎄' },
            { q: 'What are your reindeer called?', a: 'The sleigh team is Dasher, Dancer, Prancer, Vixen, Comet, Cupid, Donner and Blitzen. Red-nosed Rudolph joined later to light the way on foggy nights! 🦌' },
            { q: 'How do I use this website?', a: '• Drag the tree left or right to spin it.\n• Tap anywhere for fireworks.\n• Tap me to hear my laugh.\n• Tap the record player for music.\n• Open the Feed to post, and the Control panel for effects. 🎁' },
            { q: 'How do I post to the Feed?', a: 'Log in, open the Feed 📩, then type your post and send it. You can also like 🤍 or reply to other people’s posts!' },
            { q: 'Change music or set a sleep timer?', a: 'Tap the record player to open the player: pick a song, seek, adjust the volume and set a sleep timer. To suggest a new song, tap “Add music” and the DEV will review it. 🎵' },
            { q: 'Tell me a joke!', a: function (T) { return T.jokes[Math.floor(Math.random() * T.jokes.length)]; } }
          ]
        },
        zh: {
          btn: '问答 🎅',
          title: '🎅 问问圣诞老人',
          ph: '问问圣诞老人吧…',
          send: '发送',
          greet: '呵呵呵！选一个下面的问题，或者输入你自己的问题吧！🎄',
          thinking: '圣诞老人正在思考…',
          err: '哎呀，雪下得太大了，我没听清。请稍后再试！❄️（你仍然可以点上面的推荐问题）',
          slow: '慢一点哦，让我喘口气再回答下一个问题！🎅',
          note: '圣诞老人是 AI，不是真人，但无论是人还是 AI，都有出错的时候。请多多包涵哦。',
          sys: 'You are a cheerful, kind Santa Claus chatting on a Christmas greeting website. Answer in the same language as the user (Simplified Chinese by default). Answer ANY question the user asks, on any topic (math, science, school, life advice, games, tech, general knowledge and more), correctly and helpfully; being accurate matters more than staying on the Christmas theme. Keep the warm, friendly Santa tone, but do not refuse a normal question just because it is not about Christmas. Keep answers short (about 80 words) unless the user asks for more detail, and use at most one emoji. Only decline requests that are truly harmful or inappropriate for all ages (for example weapons, self-harm methods, sexual content, hate), politely and briefly. Never ask for or store personal information.',
          d0: '今天就是圣诞节！圣诞快乐！🎄',
          d1: '只剩 1 天啦，明天就是圣诞节！🎄',
          dN: function (n) { return '距离圣诞节（12月25日）还有 ' + n + ' 天！🎄'; },
          jokes: [
            '圣诞老人为什么总是笑呵呵？因为他每次开口都是“呵呵呵”！😄',
            '雪人早餐吃什么？冰霜麦片！⛄',
            '圣诞树为什么上学迟到？因为被…雪困住啦！❄️',
            '驯鹿怎么上班？当然是乘共享雪橇！🦌'
          ],
          items: [
            { q: '还有几天到圣诞节？', a: function (T) { const d = daysToXmas(); return d === 0 ? T.d0 : d === 1 ? T.d1 : T.dN(d); } },
            { q: '圣诞老人是谁？', a: '圣诞老人的形象源自圣尼古拉，他以善良和悄悄送给孩子们礼物而闻名。如今传说他住在北极，在平安夜给乖孩子送礼物。🎅' },
            { q: '为什么要有圣诞树？', a: '常青的松树象征寒冬中的生命与希望。大约从 16 世纪起，装饰圣诞树的习俗在德国流行，后来传遍全世界。🎄' },
            { q: '你的驯鹿叫什么名字？', a: '拉雪橇的驯鹿有 Dasher、Dancer、Prancer、Vixen、Comet、Cupid、Donner 和 Blitzen。红鼻子鲁道夫后来加入，在雾夜里带路！🦌' },
            { q: '这个网站怎么玩？', a: '• 左右拖动圣诞树可以旋转。\n• 点屏幕任意位置放烟花。\n• 点我听我的笑声。\n• 点唱片机听音乐。\n• 打开动态发帖，用控制面板换特效。🎁' },
            { q: '怎么在动态发帖？', a: '先登录账号，打开动态 📩，输入内容后发布。你也可以给别人的帖子点赞 🤍 或回复！' },
            { q: '怎么换歌和设置定时关闭？', a: '点唱片机打开播放器：选歌、拖动进度、调音量，还能设置定时关闭音乐。想推荐新歌就点“添加音乐”，由开发者审核。🎵' },
            { q: '讲个笑话吧！', a: function (T) { return T.jokes[Math.floor(Math.random() * T.jokes.length)]; } }
          ]
        }
      };

      const qaBtn = $('qa-btn');
      const qaBox = $('qa-box');
      const qaClose = $('qa-close');
      const qaTitle = $('qa-title');
      const qaLog = $('qa-log');
      const qaChips = $('qa-chips');
      const qaForm = $('qa-form');
      const qaInput = $('qa-input');
      const qaSend = $('qa-send');
      const qaNote = $('qa-note');
const QA_COOLDOWN_SEC = 10; // Số giây khóa nút Gửi 
      let qaBusy = false;
      let qaCooldownEnd = 0;
      let qaCooldownTimer = null;
      let qaHistory = [];

      function syncQaSendBtn() {
        const T = qaT();
        const left = Math.ceil((qaCooldownEnd - Date.now()) / 1000);
        if (left > 0) {
          qaSend.disabled = true;
          qaSend.textContent = left + 's';
        } else if (qaBusy) {
          qaSend.disabled = true;
          qaSend.textContent = '...';
        } else {
          qaSend.disabled = false;
          qaSend.textContent = T.send;
        }
      }

      function startQaCooldown(sec) {
        clearInterval(qaCooldownTimer);
        qaCooldownEnd = Date.now() + sec * 1000;
        syncQaSendBtn();
        qaCooldownTimer = setInterval(function () {
          if (Date.now() >= qaCooldownEnd) {
            clearInterval(qaCooldownTimer);
            qaCooldownTimer = null;
            qaCooldownEnd = 0;
          }
          syncQaSendBtn();
        }, 250);
      }

      function qaT() { return QA[lang()] || QA.vi; }

      function qaAddMsg(role, text) {
        const d = document.createElement('div');
        d.className = 'qa-msg ' + role;
        d.textContent = text;           // textContent: an toàn, không chèn HTML
        qaLog.appendChild(d);
        qaLog.scrollTop = qaLog.scrollHeight;
        return d;
      }

      function qaRenderChips() {
        const T = qaT();
        qaChips.textContent = '';
        T.items.forEach(function (it, i) {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'qa-chip';
          b.textContent = it.q;
          b.addEventListener('click', function () { qaAskPreset(i); });
          qaChips.appendChild(b);
        });
      }

      function applyQaLang() {
        const T = qaT();
        qaBtn.textContent = T.btn;
        qaTitle.textContent = T.title;
        qaInput.placeholder = T.ph;
        syncQaSendBtn();
        qaNote.textContent = T.note;
        qaRenderChips();
      }

      function qaAskPreset(i) {
        if (qaBusy) return;
        const T = qaT();
        const it = T.items[i];
        qaAddMsg('me', it.q);
        const ans = typeof it.a === 'function' ? it.a(T) : it.a;
        setTimeout(function () { qaAddMsg('bot', ans); }, 350);
      }

      async function qaFetch(url, opts, ms) {
        const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
        const timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
        try {
          opts.signal = ctrl ? ctrl.signal : undefined;
          return await fetch(url, opts);
        } finally {
          clearTimeout(timer);
        }
      }

  let qaMemCid = '';
      function qaClientId() {
        try {
          let id = localStorage.getItem('cgor_cid');
          if (!id) {
            id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
            localStorage.setItem('cgor_cid', id);
          }
          return id;
        } catch (e) {
          if (!qaMemCid) qaMemCid = Math.random().toString(36).slice(2, 12);
          return qaMemCid;
        }
      }

// Nguồn 1: Gọi Gemini thông qua Google Apps Script (Code.gs)
      async function aiGeminiProxy(T) {
        const url = window.CGOR_SHEET_API_URL;
        if (!url) return { text: '', err: 'NO_URL' };
        try {
          const res = await qaFetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'ask_ai',
              lang: lang(),
              cid: qaClientId(),
              sys: T.sys,
              messages: qaHistory
            })
          }, 45000);
          const raw = await res.text();
          let data = null;
          try {
            data = JSON.parse(raw);
          } catch (e) {
            return { text: '', err: 'SCRIPT_HTML_HTTP_' + res.status };
          }
          if (data && data.ok && data.text) return { text: data.text, err: '' };
          return { text: '', err: (data && data.error) || ('API_HTTP_' + res.status) };
        } catch (e) {
          return { text: '', err: (e && e.name === 'AbortError') ? 'TIMEOUT' : 'NET_ERR' };
        }
      }

      async function qaAskAI(text) {
        const T = qaT();
        if (qaBusy || Date.now() < qaCooldownEnd) return;
        qaBusy = true;
        startQaCooldown(QA_COOLDOWN_SEC);
        qaAddMsg('me', text);
        const wait = qaAddMsg('bot', T.thinking);
        wait.classList.add('wait');
        qaHistory.push({ role: 'user', content: text });
        qaHistory = qaHistory.slice(-6);

        let ans = '';
        let lastErr = '';
        if (navigator.onLine !== false) {
          const r = await aiGeminiProxy(T);
          let t = String(r.text || '').trim();
          if (/^\{\s*"error"/.test(t)) t = '';
          if (t) {
            ans = t.slice(0, 1200);
          } else {
            lastErr = r.err || 'UNKNOWN';
          }
        }

        wait.classList.remove('wait');
        if (ans) {
          wait.textContent = ans;
          qaHistory.push({ role: 'assistant', content: ans });
        } else {
          const isSlow = (lastErr === 'TOO_FAST' || lastErr === 'RATE_LIMITED');
          wait.textContent = ((isSlow && T.slow) ? T.slow : T.err) + ' [' + lastErr + ']';
          qaHistory.pop();
        }

        qaLog.scrollTop = qaLog.scrollHeight;
        qaBusy = false;
        syncQaSendBtn();
      }

      qaForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (qaBusy || Date.now() < qaCooldownEnd) return;
        const text = qaInput.value.trim().slice(0, 200);
        if (!text) return;
        qaInput.value = '';
        qaAskAI(text);
      });
      let qaGreeted = false;
      function openQa() {
        if (window.closeAllFloatingPanels) window.closeAllFloatingPanels('qa');
        qaBox.classList.add('open');
        if (!qaGreeted) { qaGreeted = true; qaAddMsg('bot', qaT().greet); }
        qaLog.scrollTop = qaLog.scrollHeight;
        // Máy tính: tự focus ô nhập. Điện thoại: không, để tránh bàn phím bật lên che màn hình
        if (!(window.matchMedia && matchMedia('(pointer: coarse)').matches)) {
          setTimeout(function () { qaInput.focus(); }, 30);
        }
      }
      window.closeQaBox = function () { qaBox.classList.remove('open'); };
      qaBtn.addEventListener('click', function () {
        if (qaBox.classList.contains('open')) window.closeQaBox(); else openQa();
      });
      qaClose.addEventListener('click', window.closeQaBox);
      document.addEventListener('pointerdown', function (e) {
        if (!qaBox.classList.contains('open')) return;
        if (qaBox.contains(e.target) || e.target === qaBtn) return;
        window.closeQaBox();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') window.closeQaBox();
      });

      // Nút bám dưới chân ông già Noel
      function placeQaBtn() {
        requestAnimationFrame(placeQaBtn);
        const S = window.CGOR_SANTA;
        if (!S || !S.on || S.b == null) { qaBtn.classList.remove('show'); return; }
        qaBtn.classList.add('show');
        const w = qaBtn.offsetWidth;
        const h = qaBtn.offsetHeight;
        let left = Math.max(6, Math.min(innerWidth - w - 6, S.x - w / 2));
        let top = Math.max(54, Math.min(innerHeight - h - 6, S.b + 4));

        // Màn hình hẹp: tránh đè lên chữ MERRY CHRISTMAS và nút "Bảng điều khiển" ở giữa
        const LY = window.CGOR_LAYOUT;
        if (LY && LY.msgHalfW) {
          const ctlHalf = ctlBtn && ctlBtn.offsetWidth ? ctlBtn.offsetWidth / 2 : 0;
          const half = Math.max(LY.msgHalfW, ctlHalf) + 8;
          const cxm = innerWidth / 2;
          const bandTop = LY.msgBottomY - 24;
          const bandBot = LY.msgBottomY + 6 + (ctlBtn && ctlBtn.offsetHeight ? ctlBtn.offsetHeight : 30) + 4;
          if (top < bandBot && top + h > bandTop && left + w > cxm - half && left < cxm + half) {
            const shifted = cxm - half - w;          // thử dịch sang trái cho vừa chỗ trống
            if (shifted >= 6) left = shifted;
            else top = Math.min(innerHeight - h - 6, bandBot + 4);   // hết chỗ: hạ xuống dưới nút Bảng điều khiển
          }
        }
        qaBtn.style.translate = Math.round(left) + 'px ' + Math.round(top) + 'px';
      }
      requestAnimationFrame(placeQaBtn);

      const prevDeckQa = window.updateDeckLanguage;
      window.updateDeckLanguage = function () {
        if (prevDeckQa) prevDeckQa();
        applyQaLang();
      };
      applyQaLang();

      idleTimer = setTimeout(idle, 4500);
// Tự động tải câu thoại & hỏi đáp mới từ Google Sheet (sheet SantaConfig)
const SANTA_API_URL = window.CGOR_SHEET_API_URL || "https://script.google.com/macros/s/AKfycbxrsc-RtFFOPjfbTAjcTsxFcmlUMXPCkRslxr_ZotyQ0XaXHj0TecatX7oRseX22Zs24A/exec";
fetch(SANTA_API_URL + '?action=santa_data')
  .then(r => r.json())
  .then(data => {
    if (!data || !data.ok) return;
    if (Array.isArray(data.quotes) && data.quotes.length > 0) {
      ['vi', 'en', 'zh'].forEach(l => {
        const list = data.quotes.map(q => q[l] || q.vi || '').filter(Boolean);
        if (list.length > 0) SM[l].more = list;
      });
      bag = [];
    }
    if (Array.isArray(data.qaList) && data.qaList.length > 0) {
      ['vi', 'en', 'zh'].forEach(l => {
        data.qaList.forEach(item => {
          const entry = item[l] || item.vi;
          if (entry && entry.q && entry.a && !QA[l].items.some(x => x.q === entry.q)) {
            QA[l].items.push({ q: entry.q, a: entry.a });
          }
        });
      });
      if (typeof qaRenderChips === 'function') qaRenderChips();
    }
  })
  .catch(() => {});
      
    })();
