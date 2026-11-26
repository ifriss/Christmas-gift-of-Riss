    (function () {
      const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxrsc-RtFFOPjfbTAjcTsxFcmlUMXPCkRslxr_ZotyQ0XaXHj0TecatX7oRseX22Zs24A/exec";
      window.CGOR_SHEET_API_URL = SHEET_API_URL;

      const I18N = {
        vi: {
          langBadge: '🌐 VI',
          nameTitle: 'Nhấn để quản lý tài khoản / đổi tên',
          rot: 'góc xoay',
          lights: 'đèn',
          chars: 'ký tự',
          devWish: 'chúc mọi người giáng sinh vui vẻ 🎄',
          cdBtn: 'Đếm ngược',
          notiBtn: 'Thông báo',
          notiTitle: '🔔 Thông báo từ DEV',
          notiLoading: 'Đang tải thông báo...',
          notiEmpty: 'Chưa có thông báo nào từ DEV.',
          notiPlaceholder: 'Đăng thông báo mới từ DEV... (Shift+Enter xuống dòng)',
          notiSend: 'Đăng',
          notiNewTag: 'MỚI',
          mailBtn: 'Bảng tin',
          cdTitle: '⏳ Đếm ngược Giáng Sinh (GMT+7)',
          cdDays: 'Ngày',
          cdHours: 'Giờ',
          cdMins: 'Phút',
          cdSecs: 'Giây',
          cdNote: (y) => 'Đếm ngược tới 25/12/' + y + ' (GMT+7) 🎄',
          cdMerry: '🎅 MERRY CHRISTMAS! CHÚC MỪNG GIÁNG SINH 🎄',
          mbTitle: '📰 Bảng tin',
          mbLoading: 'Đang tải bảng tin...',
          mbEmpty: 'Chưa có bài viết nào. Hãy là người đầu tiên!',
          mbPlaceholder: 'Chia sẻ lên Bảng tin... (Shift+Enter xuống dòng)',
          repPlaceholder: (n) => 'Viết trả lời cho ' + n + '...',
          replyingTo: (n) => '↳ Đang trả lời: ' + n,
          repEmpty: 'Chưa có phản hồi nào.',
          repWriteBtn: '+ Viết trả lời',
          mbSend: 'Gửi',
          pinLabel: '📌 Đã ghim',
          lockText: '🔒 Đăng nhập để đăng bài, phản hồi & thả tim.',
          lockBtn: 'Đăng nhập',
          deck: {
            title: '💿 Máy đĩa than',
            now: 'Đang phát',
            play: '▶ Phát nhạc',
            pause: '⏸ Tắt nhạc',
            next: '⏭ Bài tiếp',
            list: '📋 Danh sách',
            searchTitle: 'Tìm bài',
            searchPlaceholder: 'Tìm tên bài hát...',
            searchEmpty: 'Không tìm thấy bài hát phù hợp.',
            pick: 'Chọn bài hát',
            repAll: '🔁 Cả danh sách',
            repOne: '🔂 Lặp 1 bài',
            shufOn: '🔀 Trộn: Bật',
            shufOff: '🔀 Trộn: Tắt',
            addBtn: '➕ Thêm nhạc',
            addTitle: '➕ Đề xuất thêm nhạc',
            addHint: 'Gợi ý: Điền tên bài hát (gửi cho DEV duyệt)',
            addPlaceholder: 'Điền tên bài hát...',
            addSubmit: 'Gửi',
            addSentOk: '✅ Đã gửi đề xuất cho DEV! Khi DEV duyệt sẽ thêm vào danh sách phát.',
            devQueueTitle: '🛠️ Đề xuất chờ duyệt',
            devRefreshBtn: 'Tải lại',
            devCopyBtn: '📋 Copy',
            devCopiedBtn: '✔ Đã copy',
            devEmptyQueue: 'Chưa có đề xuất nhạc nào.'
          },
          modalTitle: 'CHÀO MỪNG ĐẾN VỚI AETHERISS',
          tabs: { guest: 'Khách', login: 'Đăng nhập', register: 'Đăng ký' },
          guestDesc: 'Khám phá các không gian & nghe nhạc ngay (đăng nhập để đăng bài lên Bảng tin).',
          lblGuestName: 'Tên hiển thị (tùy chọn)',
          btnGuestGo: 'Vào khám phá',
          lblLoginUser: 'Tên tài khoản',
          lblLoginPass: 'Mật khẩu',
          btnLoginGo: 'Đăng nhập',
          ipSuggestTitle: '✨ Tìm thấy bài viết cũ từ mạng của bạn (chạm để nhận lại):',
          ipChipCount: (n) => n + ' bài viết',
          lblRegDisplay: 'Tên hiển thị (có thể có dấu & emoji)',
          lblRegUser: 'Tên tài khoản (viết liền không dấu, 3-20 ký tự)',
          lblRegPass: 'Mật khẩu (tối thiểu 4 ký tự)',
          btnRegGo: 'Tạo tài khoản',
          lblProfDisplay: 'Đổi tên hiển thị mới',
          btnProfSave: 'Lưu tên',
          btnLogout: 'Đăng xuất',
          btnProfClose: 'Đóng',
          profAccount: 'Tài khoản',
          profBadge: 'Danh hiệu',
          profNoBadge: 'Thành viên',
          claimedAlert: (n) => '✅ Đã tự động nhận lại ' + n + ' bài viết cũ của bạn!',
          errors: {
            INVALID_USERNAME: 'Tên tài khoản phải dài 3-20 ký tự, chỉ gồm chữ thường a-z, số 0-9, dấu . hoặc _',
            INVALID_DISPLAY_NAME: 'Vui lòng nhập tên hiển thị hợp lệ (1-32 ký tự).',
            WEAK_PASSWORD: 'Mật khẩu phải có ít nhất 4 ký tự.',
            USERNAME_TAKEN: 'Tên tài khoản này đã có người dùng, vui lòng chọn tên khác.',
            WRONG_PASSWORD: 'Mật khẩu không chính xác.',
            USER_NOT_FOUND: 'Không tìm thấy tên tài khoản này.',
            NETWORK: 'Lỗi kết nối máy chủ, vui lòng thử lại.'
          },
          bar: {
            music: 'Nhạc',
            song: 'Bài',
            replay: 'Chạy lại',
            style: 'Kiểu',
            modes: ['Dâng lên', 'Xoắn ốc', 'Quét ngang', 'Nở hoa'],
            spin: 'Xoay',
            lights: 'Đèn',
            orn: 'Quả châu',
            star: 'Ngôi sao',
            gifts: 'Hộp quà',
            santa: 'Ông già Noel',
            snow: 'Tuyết',
            sparkle: 'Lấp lánh',
            aurora: 'Cực quang',
            fire: 'Pháo hoa',
            burst: 'Bắn pháo'
          }
        },
        en: {
          langBadge: '🌐 EN',
          nameTitle: 'Click to manage account / change name',
          rot: 'rotation',
          lights: 'lights',
          chars: 'letters',
          devWish: 'wishes everyone a Merry Christmas 🎄',
          cdBtn: 'Countdown',
          notiBtn: 'Notices',
          notiTitle: '🔔 DEV Announcements',
          notiLoading: 'Loading announcements...',
          notiEmpty: 'No announcements from DEV yet.',
          notiPlaceholder: 'Post a new DEV announcement... (Shift+Enter for new line)',
          notiSend: 'Post',
          notiNewTag: 'NEW',
          mailBtn: 'Feed',
          cdTitle: '⏳ Christmas Countdown (GMT+7)',
          cdDays: 'Days',
          cdHours: 'Hours',
          cdMins: 'Mins',
          cdSecs: 'Secs',
          cdNote: (y) => 'Counting down to Dec 25, ' + y + ' (GMT+7) 🎄',
          cdMerry: '🎅 MERRY CHRISTMAS! HAPPY HOLIDAYS 🎄',
          mbTitle: '📰 Feed',
          mbLoading: 'Loading feed...',
          mbEmpty: 'No posts yet. Be the first to post!',
          mbPlaceholder: 'Share to the Feed... (Shift+Enter for new line)',
          repPlaceholder: (n) => 'Write a reply to ' + n + '...',
          replyingTo: (n) => '↳ Replying to: ' + n,
          repEmpty: 'No replies yet.',
          repWriteBtn: '+ Write a reply',
          mbSend: 'Send',
          pinLabel: '📌 Pinned',
          lockText: '🔒 Log in to post, reply & like.',
          lockBtn: 'Log In',
          deck: {
            title: '💿 Vinyl Turntable',
            now: 'Now Playing',
            play: '▶ Play',
            pause: '⏸ Pause',
            next: '⏭ Next',
            list: '📋 Playlist',
            searchTitle: 'Search track',
            searchPlaceholder: 'Search song title...',
            searchEmpty: 'No matching songs found.',
            pick: 'Select a track',
            repAll: '🔁 Repeat All',
            repOne: '🔂 Repeat One',
            shufOn: '🔀 Shuffle: On',
            shufOff: '🔀 Shuffle: Off',
            addBtn: '➕ Add Song',
            addTitle: '➕ Suggest a Song',
            addHint: 'Hint: Enter the song title (sent to DEV for approval)',
            addPlaceholder: 'Enter song title...',
            addSubmit: 'Send',
            addSentOk: '✅ Sent to DEV! Once approved, DEV will add it to the playlist.',
            devQueueTitle: '🛠️ Pending Song Requests',
            devRefreshBtn: 'Reload',
            devCopyBtn: '📋 Copy',
            devCopiedBtn: '✔ Copied',
            devEmptyQueue: 'No pending song requests.'
          },
          modalTitle: 'WELCOME TO AETHERISS',
          tabs: { guest: 'Guest', login: 'Log In', register: 'Sign Up' },
          guestDesc: 'Explore the spaces & listen to music now (log in to post to the Feed).',
          lblGuestName: 'Display name (optional)',
          btnGuestGo: 'Start Exploring',
          lblLoginUser: 'Username',
          lblLoginPass: 'Password',
          btnLoginGo: 'Log In',
          ipSuggestTitle: '✨ Found past posts from your network (tap to claim):',
          ipChipCount: (n) => n + ' posts',
          lblRegDisplay: 'Display Name (spaces & emojis allowed)',
          lblRegUser: 'Username (lowercase a-z, 0-9, 3-20 chars)',
          lblRegPass: 'Password (min 4 characters)',
          btnRegGo: 'Create Account',
          lblProfDisplay: 'Change display name',
          btnProfSave: 'Save',
          btnLogout: 'Log Out',
          btnProfClose: 'Close',
          profAccount: 'Account',
          profBadge: 'Badge',
          profNoBadge: 'Member',
          claimedAlert: (n) => '✅ Automatically claimed ' + n + ' of your past posts!',
          errors: {
            INVALID_USERNAME: 'Username must be 3-20 chars (a-z, 0-9, . or _).',
            INVALID_DISPLAY_NAME: 'Please enter a valid display name (1-32 chars).',
            WEAK_PASSWORD: 'Password must be at least 4 characters.',
            USERNAME_TAKEN: 'This username is already taken.',
            WRONG_PASSWORD: 'Incorrect password.',
            USER_NOT_FOUND: 'Username not found.',
            NETWORK: 'Server connection error, please try again.'
          },
          bar: {
            music: 'Music',
            song: 'Song',
            replay: 'Replay',
            style: 'Style',
            modes: ['Rise', 'Spiral', 'Sweep', 'Bloom'],
            spin: 'Spin',
            lights: 'Lights',
            orn: 'Ornaments',
            star: 'Star',
            gifts: 'Gifts',
            santa: 'Santa',
            snow: 'Snow',
            sparkle: 'Sparkles',
            aurora: 'Aurora',
            fire: 'Fireworks',
            burst: 'Burst'
          }
        },
        zh: {
          langBadge: '🌐 中文',
          nameTitle: '点击管理账号 / 修改名字',
          rot: '旋转角度',
          lights: '彩灯',
          chars: '字符数',
          devWish: '祝大家圣诞快乐 🎄',
          cdBtn: '倒计时',
          notiBtn: '通知',
          notiTitle: '🔔 开发者公告',
          notiLoading: '正在加载公告...',
          notiEmpty: '暂无开发者公告。',
          notiPlaceholder: '发布新的开发者公告... (Shift+Enter 换行)',
          notiSend: '发布',
          notiNewTag: '新',
          mailBtn: '动态',
          cdTitle: '⏳ 圣诞节倒计时 (GMT+7)',
          cdDays: '天',
          cdHours: '时',
          cdMins: '分',
          cdSecs: '秒',
          cdNote: (y) => '距离 ' + y + ' 年 12 月 25 日 (GMT+7) 还有 🎄',
          cdMerry: '🎅 圣诞快乐！MERRY CHRISTMAS 🎄',
          mbTitle: '📰 动态',
          mbLoading: '正在加载动态...',
          mbEmpty: '暂无动态，快来发布第一条吧！',
          mbPlaceholder: '发布到动态... (Shift+Enter 换行)',
          repPlaceholder: (n) => '回复 ' + n + '...',
          replyingTo: (n) => '↳ 正在回复：' + n,
          repEmpty: '暂无回复。',
          repWriteBtn: '+ 写回复',
          mbSend: '发送',
          pinLabel: '📌 置顶',
          lockText: '🔒 登录后即可发布动态、回复和点赞。',
          lockBtn: '登录',
          deck: {
            title: '💿 黑胶唱片机',
            now: '正在播放',
            play: '▶ 播放',
            pause: '⏸ 暂停',
            next: '⏭ 下一首',
            list: '📋 歌单',
            searchTitle: '搜索歌曲',
            searchPlaceholder: '搜索歌名...',
            searchEmpty: '未找到匹配的歌曲。',
            pick: '选择歌曲',
            repAll: '🔁 列表循环',
            repOne: '🔂 单曲循环',
            shufOn: '🔀 随机：开',
            shufOff: '🔀 随机：关',
            addBtn: '➕ 添加音乐',
            addTitle: '➕ 推荐添加音乐',
            addHint: '提示：填写歌曲名称（提交给 DEV 审核）',
            addPlaceholder: '输入歌曲名称...',
            addSubmit: '提交',
            addSentOk: '✅ 已提交给 DEV 审核！通过后 DEV 会添加到歌单。',
            devQueueTitle: '🛠️ 待审核点歌推荐',
            devRefreshBtn: '刷新',
            devCopyBtn: '📋 复制',
            devCopiedBtn: '✔ 已复制',
            devEmptyQueue: '暂无待审核的歌曲推荐。'
          },
          modalTitle: '欢迎来到 AETHERISS',
          tabs: { guest: '游客访问', login: '登录', register: '注册' },
          guestDesc: '立即探索各个空间并聆听音乐（登录后即可发布动态）。',
          lblGuestName: '显示名称（选填）',
          btnGuestGo: '开始探索',
          lblLoginUser: '账号名',
          lblLoginPass: '密码',
          btnLoginGo: '登录',
          ipSuggestTitle: '✨ 检测到你此前发布的动态（点击认领）：',
          ipChipCount: (n) => n + ' 条动态',
          lblRegDisplay: '显示名称（支持中文与表情符号）',
          lblRegUser: '账号名（仅限小写字母、数字，3-20位）',
          lblRegPass: '密码（至少4位）',
          btnRegGo: '创建账号',
          lblProfDisplay: '修改显示名称',
          btnProfSave: '保存',
          btnLogout: '退出登录',
          btnProfClose: '关闭',
          profAccount: '账号',
          profBadge: '头衔徽章',
          profNoBadge: '正式成员',
          claimedAlert: (n) => '✅ 已自动认领你之前的 ' + n + ' 条动态！',
          errors: {
            INVALID_USERNAME: '账号名需为3-20位小写字母、数字、点或下划线。',
            INVALID_DISPLAY_NAME: '请输入有效的显示名称（1-32个字符）。',
            WEAK_PASSWORD: '密码至少需要4个字符。',
            USERNAME_TAKEN: '该账号名已被注册，请换一个。',
            WRONG_PASSWORD: '密码错误。',
            USER_NOT_FOUND: '未找到该账号。',
            NETWORK: '网络错误，请稍后重试。'
          },
          bar: {
            music: '音乐',
            song: '曲目',
            replay: '重播动画',
            style: '出场',
            modes: ['升起', '螺旋', '横扫', '绽放'],
            spin: '旋转',
            lights: '彩灯',
            orn: '圣诞球',
            star: '星星',
            gifts: '礼盒',
            santa: '圣诞老人',
            snow: '飘雪',
            sparkle: '星光',
            aurora: '极光',
            fire: '烟花',
            burst: '放烟花'
          }
        }
      };

      const LANG_ORDER = ['vi', 'en', 'zh'];
      let curLang = 'vi';
      try {
        const savedLang = localStorage.getItem('cgor_lang');
        if (LANG_ORDER.includes(savedLang)) curLang = savedLang;
      } catch (e) {}

      window.CGOR_I18N = I18N;
      window.getCGORLang = () => curLang;

      let currentUser = null;
      let cachedUserIP = '';

      try {
        const savedUser = JSON.parse(localStorage.getItem('cgor_auth_user') || 'null');
        if (savedUser && savedUser.token && savedUser.username) {
          currentUser = savedUser;
        }
      } catch (e) {}

      function saveCurrentUser(u) {
        currentUser = u;
        try {
          if (u) localStorage.setItem('cgor_auth_user', JSON.stringify(u));
          else localStorage.removeItem('cgor_auth_user');
        } catch (e) {}
        syncAuthUI();
      }

      const modal = document.getElementById('modal');
      const nameLabel = document.getElementById('name');
      const authTabsWrap = document.getElementById('auth-tabs');
      const authTabBtns = document.querySelectorAll('.auth-tab');
      const authError = document.getElementById('auth-error');

      const paneGuest = document.getElementById('pane-guest');
      const paneLogin = document.getElementById('pane-login');
      const paneRegister = document.getElementById('pane-register');
      const profilePane = document.getElementById('profile-pane');

      const guestNameInput = document.getElementById('guest-name-input');
      const loginUserInput = document.getElementById('login-user');
      const loginPassInput = document.getElementById('login-pass');

      const regDisplayInput = document.getElementById('reg-display');
      const regUserInput = document.getElementById('reg-user');
      const regPassInput = document.getElementById('reg-pass');
      const ipSuggestBox = document.getElementById('ip-suggest-box');
      const ipSuggestChips = document.getElementById('ip-suggest-chips');

      const profileInfo = document.getElementById('profile-info');
      const profDisplayInput = document.getElementById('prof-display-input');

      const mbGuestLock = document.getElementById('mb-guest-lock');
      const mbGuestLoginBtn = document.getElementById('mb-guest-login-btn');
      const mbCompose = document.getElementById('mb-compose');

      function showError(codeOrText) {
        if (!codeOrText) {
          authError.classList.remove('active');
          authError.textContent = '';
          return;
        }
        const tDict = I18N[curLang];
        authError.textContent = (tDict.errors && tDict.errors[codeOrText]) ? tDict.errors[codeOrText] : codeOrText;
        authError.classList.add('active');
      }

      function switchAuthTab(tabName) {
        showError('');
        profilePane.classList.remove('active');
        authTabsWrap.style.display = 'grid';

        authTabBtns.forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
        });
        paneGuest.classList.toggle('active', tabName === 'guest');
        paneLogin.classList.toggle('active', tabName === 'login');
        paneRegister.classList.toggle('active', tabName === 'register');
      }

      authTabBtns.forEach(b => {
        b.addEventListener('click', () => switchAuthTab(b.getAttribute('data-tab')));
      });

      function openAuthModal(defaultTab) {
        showError('');
        if (currentUser) {
          const tDict = I18N[curLang];
          authTabsWrap.style.display = 'none';
          paneGuest.classList.remove('active');
          paneLogin.classList.remove('active');
          paneRegister.classList.remove('active');
          profilePane.classList.add('active');

          const badgeText = currentUser.badge
            ? '<span class="user-badge">' + escapeHTML(currentUser.badge) + '</span>'
            : '<span style="color:var(--dim)">' + tDict.profNoBadge + '</span>';

          profileInfo.innerHTML =
            '<div><b>' + tDict.profAccount + ':</b> @' + escapeHTML(currentUser.username) + '</div>' +
            '<div><b>' + tDict.profBadge + ':</b> ' + badgeText + '</div>';
          profDisplayInput.value = currentUser.displayName;
        } else {
          switchAuthTab(defaultTab || 'guest');
        }
        modal.style.display = 'flex';
      }

      function isDevUser() {
        if (!currentUser) return false;
        return String(currentUser.badge || '').toUpperCase().includes('DEV');
      }

      window.CGOR_IS_DEV = isDevUser;
      window.CGOR_GET_USER = () => currentUser;
      window.CGOR_GET_IP = () => cachedUserIP;
      window.CGOR_FORMAT_TIME = formatTimeVN;
      window.CGOR_ESCAPE_HTML = escapeHTML;

      function syncAuthUI() {
        const notiComposeEl = document.getElementById('noti-compose');
        if (currentUser) {
          const badgeStr = currentUser.badge ? ' [' + currentUser.badge + ']' : '';
          nameLabel.textContent = currentUser.displayName + badgeStr;
          mbGuestLock.classList.remove('active');
          mbCompose.style.display = 'flex';
          if (notiComposeEl) notiComposeEl.style.display = isDevUser() ? 'flex' : 'none';
        } else {
          let guestSaved = '';
          try { guestSaved = localStorage.getItem('xmas_custom_name') || ''; } catch (e) {}
          nameLabel.textContent = guestSaved || 'AetheRiss';
          guestNameInput.value = guestSaved;
          mbGuestLock.classList.add('active');
          mbCompose.style.display = 'none';
          if (notiComposeEl) notiComposeEl.style.display = 'none';
        }
        if (typeof renderNotices === 'function') renderNotices();
        if (window.updateDeckLanguage) window.updateDeckLanguage();
        if (window.CGOR_applySongBoxRole) window.CGOR_applySongBoxRole();
      }

      function slugifyUsername(str) {
        return String(str || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .toLowerCase()
          .replace(/[^a-z0-9_.]/g, '')
          .slice(0, 20);
      }

      async function fetchIpAndSuggestions() {
        try {
          const ipRes = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipRes.json();
          cachedUserIP = ipData.ip || '';
          if (!cachedUserIP) return;

          const sugRes = await fetch(SHEET_API_URL + '?action=suggest_names&ip=' + encodeURIComponent(cachedUserIP));
          const sugData = await sugRes.json();
          if (sugData && Array.isArray(sugData.suggestions) && sugData.suggestions.length > 0) {
            const tDict = I18N[curLang];
            ipSuggestChips.innerHTML = sugData.suggestions.map(s => {
              return '<button type="button" class="ip-chip" data-name="' + escapeHTML(s.name) + '">' +
                escapeHTML(s.name) + ' (' + tDict.ipChipCount(s.count) + ')' +
              '</button>';
            }).join('');
            ipSuggestBox.classList.add('active');
          }
        } catch (e) {}
      }

      ipSuggestChips.addEventListener('click', function (e) {
        const chip = e.target.closest('.ip-chip');
        if (!chip) return;
        const pickedName = chip.getAttribute('data-name') || '';
        regDisplayInput.value = pickedName;
        if (!regUserInput.value.trim()) {
          regUserInput.value = slugifyUsername(pickedName);
        }
        regPassInput.focus();
      });

      paneGuest.addEventListener('submit', function (e) {
        e.preventDefault();
        const val = guestNameInput.value.trim();
        try {
          if (val) localStorage.setItem('xmas_custom_name', val);
          else localStorage.removeItem('xmas_custom_name');
        } catch (err) {}
        syncAuthUI();
        modal.style.display = 'none';
        if (window.LofiXmas) window.LofiXmas.start();
      });

      paneLogin.addEventListener('submit', async function (e) {
        e.preventDefault();
        showError('');
        const username = loginUserInput.value.trim().toLowerCase();
        const password = loginPassInput.value;
        if (!username || !password) return;

        const btnLogin = document.getElementById('btn-login-go');
        btnLogin.disabled = true;
        try {
          const res = await fetch(SHEET_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'login',
              username: username,
              password: password,
              ip: cachedUserIP
            })
          });
          const data = await res.json();
          if (data && data.ok && data.user) {
            saveCurrentUser(data.user);
            loginPassInput.value = '';
            modal.style.display = 'none';
            if (window.LofiXmas) window.LofiXmas.start();
            loadWishes();
          } else {
            showError((data && data.error) || 'NETWORK');
          }
        } catch (err) {
          showError('NETWORK');
        }
        btnLogin.disabled = false;
      });

      paneRegister.addEventListener('submit', async function (e) {
        e.preventDefault();
        showError('');
        const displayName = regDisplayInput.value.trim();
        const username = regUserInput.value.trim().toLowerCase();
        const password = regPassInput.value;

        const btnReg = document.getElementById('btn-register-go');
        btnReg.disabled = true;
        try {
          const res = await fetch(SHEET_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'register',
              username: username,
              displayName: displayName,
              password: password,
              ip: cachedUserIP
            })
          });
          const data = await res.json();
          if (data && data.ok && data.user) {
            saveCurrentUser(data.user);
            regPassInput.value = '';
            modal.style.display = 'none';
            if (window.LofiXmas) window.LofiXmas.start();
            if (data.claimedCount > 0) {
              alert(I18N[curLang].claimedAlert(data.claimedCount));
            }
            loadWishes();
          } else {
            showError((data && data.error) || 'NETWORK');
          }
        } catch (err) {
          showError('NETWORK');
        }
        btnReg.disabled = false;
      });

      profilePane.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!currentUser) return;
        const newDisp = profDisplayInput.value.trim();
        if (!newDisp) return;

        const btnSave = document.getElementById('btn-prof-save');
        btnSave.disabled = true;
        try {
          const res = await fetch(SHEET_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'update_profile',
              token: currentUser.token,
              displayName: newDisp
            })
          });
          const data = await res.json();
          if (data && data.ok && data.user) {
            saveCurrentUser(data.user);
            modal.style.display = 'none';
          }
        } catch (err) {}
        btnSave.disabled = false;
      });

      document.getElementById('btn-logout').addEventListener('click', function () {
        saveCurrentUser(null);
        switchAuthTab('guest');
      });

      document.getElementById('btn-prof-close').addEventListener('click', function () {
        modal.style.display = 'none';
      });

      nameLabel.addEventListener('click', function () {
        openAuthModal('guest');
      });

      mbGuestLoginBtn.addEventListener('click', function () {
        openAuthModal('login');
      });

      if (currentUser) {
        modal.style.display = 'none';
      }

      // --- Điều khiển đóng/mở độc quyền giữa Đếm ngược, Bảng tin & Máy đĩa than ---
      const langBtn = document.getElementById('lang-btn');
      document.getElementById('refresh-btn').addEventListener('click', function () {
        location.reload();
      });
      const cdBtn = document.getElementById('cd-btn');
      const cdBox = document.getElementById('cd-box');
      const cdClose = document.getElementById('cd-close');

      const notiBtn = document.getElementById('noti-btn');
      const notiBox = document.getElementById('noti-box');
      const notiClose = document.getElementById('noti-close');

      const mailBtn = document.getElementById('mail-btn');
      const mailbox = document.getElementById('mailbox');
      const mbClose = document.getElementById('mb-close');

      function closeCountdown() {
        cdBox.classList.remove('open');
        cdBtn.classList.remove('active');
      }

      function closeNotiBox() {
        notiBox.classList.remove('open');
        notiBtn.classList.remove('active');
      }

      function closeMailbox() {
        mailbox.classList.remove('open');
        mailBtn.classList.remove('active');
      }

      window.closeAllFloatingPanels = function (except) {
        if (except !== 'cd') closeCountdown();
        if (except !== 'noti') closeNotiBox();
        if (except !== 'mail') closeMailbox();
        if (except !== 'ctl' && window.closeCtlPanel) window.closeCtlPanel();
        if (except !== 'deck' && window.closeDeckPanel) window.closeDeckPanel();
        if (except !== 'add-song' && window.closeAddSongBox) window.closeAddSongBox();
        if (except !== 'qa' && window.closeQaBox) window.closeQaBox();
      };

      cdBtn.addEventListener('click', function () {
        const willOpen = !cdBox.classList.contains('open');
        window.closeAllFloatingPanels(willOpen ? 'cd' : '');
        if (willOpen) {
          cdBox.classList.add('open');
          cdBtn.classList.add('active');
        } else {
          closeCountdown();
        }
      });

      cdClose.addEventListener('click', closeCountdown);

      mailBtn.addEventListener('click', function () {
        const willOpen = !mailbox.classList.contains('open');
        window.closeAllFloatingPanels(willOpen ? 'mail' : '');
        if (willOpen) {
          mailbox.classList.add('open');
          mailBtn.classList.add('active');
          loadWishes();
        } else {
          closeMailbox();
        }
      });

      mbClose.addEventListener('click', closeMailbox);

      // --- Đồng hồ đếm ngược Giáng Sinh theo giờ Việt Nam (GMT+7) ---
      const cdD = document.getElementById('cd-d');
      const cdH = document.getElementById('cd-h');
      const cdM = document.getElementById('cd-m');
      const cdS = document.getElementById('cd-s');
      const cdNote = document.getElementById('cd-note');

      function getVietnamNow() {
        const now = new Date();
        const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
        return new Date(utcMs + 7 * 3600000);
      }

      function updateCountdown() {
        const tDict = I18N[curLang];
        const vnNow = getVietnamNow();
        const year = vnNow.getFullYear();
        let xmas = new Date(year, 11, 25, 0, 0, 0);

        if (vnNow.getMonth() === 11 && vnNow.getDate() === 25) {
          cdD.textContent = '00';
          cdH.textContent = '00';
          cdM.textContent = '00';
          cdS.textContent = '00';
          cdNote.textContent = tDict.cdMerry;
          cdNote.style.color = '#ffd36b';
          return;
        }

        if (vnNow > xmas) {
          xmas = new Date(year + 1, 11, 25, 0, 0, 0);
        }

        const diff = xmas - vnNow;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        cdD.textContent = String(d).padStart(2, '0');
        cdH.textContent = String(h).padStart(2, '0');
        cdM.textContent = String(m).padStart(2, '0');
        cdS.textContent = String(s).padStart(2, '0');
        cdNote.textContent = tDict.cdNote(xmas.getFullYear());
        cdNote.style.color = '#4ef57b';
      }

      // --- Xử lý Bảng tin (Badge, Reply, Ghim, Thả tim) ---
      const mbList = document.getElementById('mb-list');
      const mbForm = document.getElementById('mb-form');
      const mbInput = document.getElementById('mb-input');
      const mbSend = document.getElementById('mb-send');
      const mailCount = document.getElementById('mail-count');
      const replyBanner = document.getElementById('reply-banner');
      const replyBannerText = document.getElementById('reply-banner-text');
      const replyCancel = document.getElementById('reply-cancel');

      let wishes = [];
      let loadedOnce = false;
      const REACTION_EMOJIS = ['❤️', '👍', '😆', '😮', '😢', '😡'];
      const REACT_DEBOUNCE_MS = 800;
      const REACT_HOLD_MS = 15000; // giữ số liệu client khi dữ liệu Sheet tải về còn cũ
      const reactState = {};
      const reactTimers = {};
      let reactQueue = Promise.resolve();
      let openRepliesSet = new Set();
      let replyingTarget = null;

      function setReplyTarget(target) {
        replyingTarget = target;
        const tDict = I18N[curLang];
        if (target) {
          replyBanner.classList.add('active');
          replyBannerText.textContent = tDict.replyingTo(target.name);
          mbInput.placeholder = tDict.repPlaceholder(target.name);
          mbInput.focus();
        } else {
          replyBanner.classList.remove('active');
          mbInput.placeholder = tDict.mbPlaceholder;
        }
      }

      replyCancel.addEventListener('click', function () {
        setReplyTarget(null);
      });

      function escapeHTML(str) {
        return String(str).replace(/[&<>"']/g, function (m) {
          return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
          }[m];
        });
      }

      function formatTimeVN(raw) {
        if (!raw) return '';
        const str = String(raw).replace(/^'/, '').trim();
        if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
          const d = new Date(str);
          if (!isNaN(d.getTime())) {
            const parts = new Intl.DateTimeFormat('en-GB', {
              timeZone: 'Asia/Ho_Chi_Minh',
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }).formatToParts(d);
            const map = {};
            parts.forEach(p => (map[p.type] = p.value));
            return map.day + '/' + map.month + ' ' + map.hour + ':' + map.minute + ' (GMT+7)';
          }
        }
        return str.includes('GMT+7') ? str : str + ' (GMT+7)';
      }

      function getDeviceInfo() {
        const ua = navigator.userAgent;
        let os = 'Khác';
        if (/Windows NT 10\.0/.test(ua)) os = 'Windows 10/11';
        else if (/Mac OS X/.test(ua)) os = 'macOS';
        else if (/iPhone/.test(ua)) os = 'iPhone';
        else if (/iPad/.test(ua)) os = 'iPad';
        else if (/Android/.test(ua)) {
          const match = ua.match(/Android\s[\d.]+;\s([^;)]+)/);
          os = match ? 'Android (' + match[1].trim() + ')' : 'Android';
        } else if (/Linux/.test(ua)) os = 'Linux';

        let browser = 'Browser';
        if (/Edg\//.test(ua)) browser = 'Edge';
        else if (/Chrome\//.test(ua)) browser = 'Chrome';
        else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
        else if (/Firefox\//.test(ua)) browser = 'Firefox';

        return os + ' - ' + browser + ' (' + screen.width + 'x' + screen.height + ')';
      }

      function renderWishes() {
        const tDict = I18N[curLang];
        mailCount.textContent = wishes.length;
        if (!wishes.length) {
          mbList.innerHTML = '<div style="color:var(--dim);text-align:center;padding:16px 0">' +
            (loadedOnce ? tDict.mbEmpty : tDict.mbLoading) +
            '</div>';
          return;
        }
        // Tách chuỗi danh hiệu "DEV🎄, VIP" thành từng pill riêng (bỏ qua 'def' và rỗng)
        function renderUserBadges(raw) {
          return String(raw || '')
            .split(',')
            .map(function (b) { return b.trim(); })
            .filter(function (b) { return b && b.toLowerCase() !== 'def'; })
            .map(function (b) { return '<span class="user-badge">' + escapeHTML(b) + '</span>'; })
            .join('');
        }

        mbList.innerHTML = wishes.map(function (w, idx) {
          const rowKey = w.row ? String(w.row) : ('tmp_' + idx);
          const myReact = getMyReaction(w);
          const isRepOpen = openRepliesSet.has(rowKey);
          const myHeart = getMyItems(w)['❤️'] || 0;
          const reps = Array.isArray(w.replies) ? w.replies : [];
          const repCount = reps.length;
          const pinCls = w.pinned ? ' pinned' : '';
          const pinHtml = w.pinned ? '<span class="pin-badge">' + tDict.pinLabel + '</span>' : '';
          const badgeHtml = renderUserBadges(w.badge);
          const verifiedHtml = w.username ? '<span class="verified-tick" title="@' + escapeHTML(w.username) + '">✔</span>' : '';

          const repItemsHtml = reps.length
            ? reps.map(function (r) {
                const rBadge = renderUserBadges(r.badge);
                return (
                  '<div class="rep-item">' +
                    '<div class="rep-meta">' +
                      '<div class="rep-meta-left">' + escapeHTML(r.name) + rBadge + '</div>' +
                      '<span class="rep-time">' + escapeHTML(formatTimeVN(r.time)) + '</span>' +
                    '</div>' +
                    '<div class="mb-msg-text">' + escapeHTML(r.msg) + '</div>' +
                  '</div>'
                );
              }).join('')
            : '<div class="rep-empty">' + tDict.repEmpty + '</div>';

          return (
            '<div class="mb-item' + pinCls + '">' +
              '<div class="mb-meta">' +
                '<div class="mb-sender-wrap">' + escapeHTML(w.name) + verifiedHtml + badgeHtml + pinHtml + '</div>' +
                '<span class="mb-time">' + escapeHTML(formatTimeVN(w.time)) + '</span>' +
              '</div>' +
              '<div class="mb-msg-text">' + escapeHTML(String(w.msg || '')) + '</div>' +
              (w.row
                ? '<div class="mb-foot">' +
                    '<button type="button" class="rep-toggle-btn' + (isRepOpen ? ' open' : '') + '" data-row="' + w.row + '" data-idx="' + idx + '">' +
                      '💬 <span>' + repCount + '</span> ' + (isRepOpen ? '▴' : '▾') +
                    '</button>' +
                    reactionSummaryHtml(w) +
                    '<button type="button" class="like-btn' + (myReact ? ' liked' : '') + '" data-row="' + w.row + '" data-idx="' + idx + '" title="❤️">' +
                      '❤️' + (myHeart > 1 ? '<span class="my-cnt">×' + myHeart + '</span>' : '') +
                    '</button>' +
                  '</div>' +
                  '<div class="rep-list' + (isRepOpen ? ' open' : '') + '">' +
                    repItemsHtml +
                    '<button type="button" class="rep-write-link" data-row="' + w.row + '" data-idx="' + idx + '">' + tDict.repWriteBtn + '</button>' +
                  '</div>'
                : '') +
            '</div>'
          );
        }).join('');
      }

      mbList.addEventListener('click', async function (e) {
        const btnRepToggle = e.target.closest('.rep-toggle-btn');
        if (btnRepToggle) {
          const rowNum = parseInt(btnRepToggle.getAttribute('data-row'), 10);
          const idx = parseInt(btnRepToggle.getAttribute('data-idx'), 10);
          if (!rowNum || isNaN(idx) || !wishes[idx]) return;

          const rowKey = String(rowNum);
          if (openRepliesSet.has(rowKey)) openRepliesSet.delete(rowKey);
          else openRepliesSet.add(rowKey);
          renderWishes();
          return;
        }

        const btnRepWrite = e.target.closest('.rep-write-link');
        if (btnRepWrite) {
          if (!currentUser) {
            openAuthModal('login');
            return;
          }
          const rowNum = parseInt(btnRepWrite.getAttribute('data-row'), 10);
          const idx = parseInt(btnRepWrite.getAttribute('data-idx'), 10);
          if (!rowNum || isNaN(idx) || !wishes[idx]) return;
          setReplyTarget({ row: rowNum, idx: idx, name: wishes[idx].name });
          return;
        }

        const btnLike = e.target.closest('.like-btn');
        if (btnLike) {
          if (reactHoldFired) return;
          if (!currentUser) {
            openAuthModal('login');
            return;
          }
          const row = btnLike.getAttribute('data-row');
          const w = findWishByRow(row);
          if (!w) return;
          doReact(row, '❤️', btnLike.getBoundingClientRect());
          closeReactPicker();
          return;
        }
        const btnSum = e.target.closest('.react-sum');
        if (btnSum) showReactDetail(btnSum);
      });

      // ================= CẢM XÚC KIỂU ZALO (cộng dồn, chọn biểu cảm, thu hồi) =================
      function findWishByRow(row) {
        const k = String(row);
        for (let i = 0; i < wishes.length; i++) {
          if (String(wishes[i].row) === k) return wishes[i];
        }
        return null;
      }
      function getReactState(k) {
        return reactState[k] || (reactState[k] = { pending: 0, pendingMap: {}, inflight: 0, ts: 0, likes: 0, reactions: null, combo: 0, comboTs: 0, comboEmoji: '' });
      }
      function syncReactState(st, w) {
        st.likes = parseInt(w.likes, 10) || 0;
        st.reactions = w.reactions;
        st.ts = Date.now();
      }
      function myUname() {
        return currentUser ? String(currentUser.username || '').toLowerCase() : '';
      }
      // Mỗi người có thể thả NHIỀU loại cảm xúc: reactions[user] = { emoji, count, items: { '❤️': 2, '👍': 1 } }
      // (tương thích dữ liệu cũ dạng { emoji, count })
      function userItems(r) {
        const out = {};
        if (!r || typeof r !== 'object') return out;
        if (r.items && typeof r.items === 'object') {
          Object.keys(r.items).forEach(function (em) {
            const c = parseInt(r.items[em], 10) || 0;
            if (c > 0) out[em] = c;
          });
        } else if (r.emoji && (parseInt(r.count, 10) || 0) > 0) {
          out[r.emoji] = parseInt(r.count, 10);
        }
        return out;
      }
      function itemsTotal(items) {
        return Object.keys(items).reduce(function (n, em) { return n + (items[em] || 0); }, 0);
      }
      function storeUserItems(w, uname, items, lastEmoji) {
        if (!w.reactions || typeof w.reactions !== 'object' || Array.isArray(w.reactions)) w.reactions = {};
        const total = itemsTotal(items);
        if (total <= 0) { delete w.reactions[uname]; return; }
        const main = (lastEmoji && items[lastEmoji]) ? lastEmoji
          : Object.keys(items).sort(function (x, y) { return items[y] - items[x]; })[0];
        w.reactions[uname] = { emoji: main, count: total, items: items };
      }
      function getMyItems(w) {
        return (currentUser && w && w.reactions && typeof w.reactions === 'object') ? userItems(w.reactions[myUname()]) : {};
      }
      function getMyReaction(w) {
        const it = getMyItems(w);
        const total = itemsTotal(it);
        return total > 0 ? { items: it, count: total } : null;
      }
      function reactTally(w) {
        const rx = (w && w.reactions && typeof w.reactions === 'object') ? w.reactions : {};
        const tally = {};
        let total = 0;
        Object.keys(rx).forEach(function (u) {
          const it = userItems(rx[u]);
          Object.keys(it).forEach(function (em) { tally[em] = (tally[em] || 0) + it[em]; total += it[em]; });
        });
        return { tally: tally, total: total };
      }
      // Nút giữa: hiện các cảm xúc nổi bật + tổng số, bấm để xem ai đã thả
      function reactionSummaryHtml(w) {
        const t = reactTally(w);
        const total = t.total > 0 ? t.total : (parseInt(w.likes, 10) || 0);
        const top = Object.keys(t.tally).sort(function (a, b) { return t.tally[b] - t.tally[a]; }).slice(0, 3);
return '<button type="button" class="react-sum' + (t.total > 0 ? ' has' : '') + '" data-row="' + w.row + '">' +
  (top.length ? escapeHTML(top.join('')) : '🤍') + ' <span>' + total + '</span></button>';
      }
      async function postReact(payload) {
        try {
          const res = await fetch(SHEET_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
          });
          return await res.json();
        } catch (err) {
          return null;
        }
      }
      function applyServerReact(st, w, data) {
        if (w && st.pending === 0 && st.inflight === 0 && data && data.reactions && typeof data.reactions === 'object') {
          w.likes = parseInt(data.likes, 10) || 0;
          w.reactions = data.reactions;
          syncReactState(st, w);
          renderWishes();
        }
      }
      function flyCombo(rect, emoji, combo) {
        if (!rect) return;
        const el = document.createElement('div');
        el.className = 'react-fly';
        el.textContent = emoji + ' +' + combo;
        el.style.left = (rect.left + rect.width / 2) + 'px';
        el.style.top = Math.max(8, rect.top - 6) + 'px';
        document.body.appendChild(el);
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 950);
      }

      // +1 cảm xúc (optimistic) rồi gom nhiều lần bấm thành request sau 800ms (mỗi loại emoji 1 request)
      function doReact(row, emoji, rect) {
        const w = findWishByRow(row);
        if (!w || !currentUser) return;
        const uname = myUname();
        const items = getMyItems(w);
        items[emoji] = (items[emoji] || 0) + 1;
        storeUserItems(w, uname, items, emoji);
        w.likes = (parseInt(w.likes, 10) || 0) + 1;

        const k = String(row);
        const st = getReactState(k);
        st.pending++;
        st.pendingMap[emoji] = (st.pendingMap[emoji] || 0) + 1;
        syncReactState(st, w);
        const now = Date.now();
        st.combo = (now - st.comboTs < 1200 && st.comboEmoji === emoji) ? st.combo + 1 : 1;
        st.comboTs = now;
        st.comboEmoji = emoji;

        renderWishes();
        flyCombo(rect, emoji, st.combo);
        clearTimeout(reactTimers[k]);
        reactTimers[k] = setTimeout(function () { flushReact(k); }, REACT_DEBOUNCE_MS);
      }

      function flushReact(k) {
        const st = reactState[k];
        if (!st || st.pending <= 0 || !currentUser) return;
        const batch = st.pendingMap;
        st.pendingMap = {};
        st.pending = 0;
        const token = currentUser.token;
        const uname = currentUser.username;
        Object.keys(batch).forEach(function (emoji) {
          const delta = batch[emoji];
          if (!(delta > 0)) return;
          st.inflight++;
          reactQueue = reactQueue.then(function () {
            return postReact({ action: 'react', token: token, wishId: Number(k), row: Number(k), username: uname, emoji: emoji, delta: delta });
          }).then(function (data) {
            st.inflight--;
            const w = findWishByRow(k);
            if (data && data.ok) {
              applyServerReact(st, w, data);
            } else if (w) {
              const key = String(uname).toLowerCase();
              const items = userItems(w.reactions && w.reactions[key]);
              items[emoji] = (items[emoji] || 0) - delta;
              if (items[emoji] <= 0) delete items[emoji];
              storeUserItems(w, key, items);
              w.likes = Math.max(0, (parseInt(w.likes, 10) || 0) - delta);
              syncReactState(st, w);
              renderWishes();
            }
          });
        });
      }

      // Thu hồi: emoji = 1 loại cụ thể (tắt loại đó) hoặc bỏ trống = thu hồi toàn bộ cảm xúc của mình
      function removeReact(row, emoji) {
        const w = findWishByRow(row);
        if (!w || !currentUser) return;
        const mine = getMyItems(w);
        const removed = {};
        if (emoji) { if (mine[emoji]) removed[emoji] = mine[emoji]; }
        else Object.keys(mine).forEach(function (em) { removed[em] = mine[em]; });
        const removedTotal = itemsTotal(removed);
        if (removedTotal <= 0) return;

        const k = String(row);
        const st = getReactState(k);
        const uname = myUname();
        const token = currentUser.token;
        let remain = {};
        if (emoji) {
          Object.keys(mine).forEach(function (em) { if (em !== emoji) remain[em] = mine[em]; });
          st.pending -= (st.pendingMap[emoji] || 0);
          delete st.pendingMap[emoji];
        } else {
          st.pending = 0;
          st.pendingMap = {};
          clearTimeout(reactTimers[k]);
        }
        storeUserItems(w, uname, remain);
        w.likes = Math.max(0, (parseInt(w.likes, 10) || 0) - removedTotal);
        syncReactState(st, w);
        st.inflight++;
        renderWishes();

        const payload = { action: 'react', token: token, wishId: Number(k), row: Number(k), username: uname, clear: true };
        if (emoji) payload.emoji = emoji;
        reactQueue = reactQueue.then(function () {
          return postReact(payload);
        }).then(function (data) {
          st.inflight--;
          const cur = findWishByRow(k);
          if (data && data.ok) {
            applyServerReact(st, cur, data);
          } else if (cur) {
            const items = getMyItems(cur);
            Object.keys(removed).forEach(function (em) { items[em] = (items[em] || 0) + removed[em]; });
            storeUserItems(cur, uname, items);
            cur.likes = (parseInt(cur.likes, 10) || 0) + removedTotal;
            syncReactState(st, cur);
            renderWishes();
          }
        });
      }
      function clearReact(row) { removeReact(row); }

      // ----- Thanh chọn biểu cảm (hover PC / giữ ~400ms trên mobile) -----
      const reactPicker = document.createElement('div');
      reactPicker.className = 'react-picker';
      reactPicker.innerHTML = REACTION_EMOJIS.map(function (em) {
        return '<button type="button" data-emoji="' + em + '">' + em + '</button>';
      }).join('') + '<button type="button" class="rp-clear" data-clear="1" title="Thu hồi / Undo">✕</button>';
      document.body.appendChild(reactPicker);

      const reactDetail = document.createElement('div');
      reactDetail.className = 'react-detail';
      document.body.appendChild(reactDetail);

      let pickerRow = null;
      let pickerRect = null;
      let pickerOpenTimer = null;
      let pickerCloseTimer = null;
      let reactHoldTimer = null;
      let reactHoldFired = false;
      let reactTouchStart = { x: 0, y: 0 };
      const canHoverReact = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);

      function placeFloating(el, rect) {
        const w = el.offsetWidth, h = el.offsetHeight;
        let left = rect.left + rect.width / 2 - w / 2;
        left = Math.max(6, Math.min(left, window.innerWidth - w - 6));
        let top = rect.top - h - 6;
        if (top < 6) top = rect.bottom + 6;
        el.style.left = left + 'px';
        el.style.top = top + 'px';
      }
      function openReactPicker(btn) {
        if (!currentUser) { openAuthModal('login'); return; }
        closeReactDetail();
        pickerRow = btn.getAttribute('data-row');
        pickerRect = btn.getBoundingClientRect();
        reactPicker.classList.add('show');
        const mineItems = getMyItems(findWishByRow(pickerRow));
        reactPicker.querySelectorAll('[data-emoji]').forEach(function (eb) {
          const c = mineItems[eb.getAttribute('data-emoji')] || 0;
          eb.classList.toggle('mine', c > 0);
          eb.setAttribute('data-n', c > 0 ? String(c) : '');
        });
        reactPicker.querySelector('.rp-clear').classList.toggle('dim', !getMyReaction(findWishByRow(pickerRow)));
        placeFloating(reactPicker, pickerRect);
      }
      function closeReactPicker() {
        clearTimeout(pickerOpenTimer);
        clearTimeout(pickerCloseTimer);
        reactPicker.classList.remove('show');
      }
      function schedulePickerClose() {
        clearTimeout(pickerCloseTimer);
        pickerCloseTimer = setTimeout(closeReactPicker, 350);
      }
      let detailRow = null;
      function showReactDetail(btn) {
        const row = btn.getAttribute('data-row');
        if (reactDetail.classList.contains('show') && detailRow === row) { closeReactDetail(); return; }
        const w = findWishByRow(row);
        const rx = (w && w.reactions) || {};
        const me = myUname();
        const users = Object.keys(rx).filter(function (u) { return itemsTotal(userItems(rx[u])) > 0; })
          .sort(function (x, y) { return itemsTotal(userItems(rx[y])) - itemsTotal(userItems(rx[x])); });
        if (!users.length) return;
        closeReactPicker();
        detailRow = row;
        reactDetail.textContent = '';
        users.forEach(function (u) {
          const it = userItems(rx[u]);
          const line = document.createElement('div');
          Object.keys(it).sort(function (x, y) { return it[y] - it[x]; }).forEach(function (em) {
            const chip = document.createElement('span');
            chip.className = 'rd-chip';
            chip.appendChild(document.createTextNode(em + ' ×' + it[em]));
            if (u === me) {
              const x = document.createElement('button');
              x.type = 'button';
              x.className = 'rd-x';
              x.setAttribute('data-remove', em);
              x.title = 'Bỏ ' + em;
              x.textContent = '✕';
              chip.appendChild(x);
            }
            line.appendChild(chip);
          });
          line.appendChild(document.createTextNode('@' + u));
          reactDetail.appendChild(line);
        });
        reactDetail.classList.add('show');
        placeFloating(reactDetail, btn.getBoundingClientRect());
      }
      function closeReactDetail() { reactDetail.classList.remove('show'); }

      reactPicker.addEventListener('click', function (e) {
        const b = e.target.closest('button');
        if (!b) return;
        e.stopPropagation();
        const row = pickerRow;
        if (b.getAttribute('data-clear')) clearReact(row);
        else if (b.getAttribute('data-emoji')) doReact(row, b.getAttribute('data-emoji'), pickerRect);
        closeReactPicker();
      });
      reactDetail.addEventListener('click', function (e) {
        const x = e.target.closest('[data-remove]');
        if (!x) return;
        e.stopPropagation();
        removeReact(detailRow, x.getAttribute('data-remove'));
        closeReactDetail();
      });
      reactPicker.addEventListener('mouseenter', function () { clearTimeout(pickerCloseTimer); });
      reactPicker.addEventListener('mouseleave', schedulePickerClose);

      // PC: rê chuột vào nút tim
      mbList.addEventListener('mouseover', function (e) {
        if (!canHoverReact) return;
        const b = e.target.closest('.like-btn');
        if (!b) return;
        clearTimeout(pickerCloseTimer);
        clearTimeout(pickerOpenTimer);
        pickerOpenTimer = setTimeout(function () { if (b.isConnected) openReactPicker(b); }, 250);
      });
      mbList.addEventListener('mouseout', function (e) {
        if (!canHoverReact) return;
        if (!e.target.closest('.like-btn')) return;
        clearTimeout(pickerOpenTimer);
        schedulePickerClose();
      });

      // Mobile: nhấn giữ ~400ms
      mbList.addEventListener('touchstart', function (e) {
        const b = e.target.closest('.like-btn');
        if (!b || !e.touches[0]) return;
        reactTouchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        clearTimeout(reactHoldTimer);
        reactHoldTimer = setTimeout(function () {
          reactHoldTimer = null;
          reactHoldFired = true;
          openReactPicker(b);
          try { if (navigator.vibrate) navigator.vibrate(15); } catch (err) {}
        }, 400);
      }, { passive: true });
      mbList.addEventListener('touchmove', function (e) {
        if (!reactHoldTimer || !e.touches[0]) return;
        if (Math.abs(e.touches[0].clientX - reactTouchStart.x) > 10 || Math.abs(e.touches[0].clientY - reactTouchStart.y) > 10) {
          clearTimeout(reactHoldTimer);
          reactHoldTimer = null;
        }
      }, { passive: true });
      ['touchend', 'touchcancel'].forEach(function (ev) {
        mbList.addEventListener(ev, function () {
          if (reactHoldTimer) { clearTimeout(reactHoldTimer); reactHoldTimer = null; }
          if (reactHoldFired) setTimeout(function () { reactHoldFired = false; }, 450); // chặn click sinh ra sau khi nhấn giữ
        }, { passive: true });
      });
      mbList.addEventListener('contextmenu', function (e) {
        if (e.target.closest('.like-btn')) e.preventDefault();
      });

      document.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.react-picker, .react-detail, .like-btn, .react-sum')) return;
        closeReactPicker();
        closeReactDetail();
      });
      window.addEventListener('scroll', function () { closeReactPicker(); closeReactDetail(); }, true);

      async function loadWishes() {
        try {
          const res = await fetch(SHEET_API_URL);
          const data = await res.json();
          loadedOnce = true;
          if (Array.isArray(data)) {
            const nowMs = Date.now();
            data.forEach(w => {
              if (!w.reactions || typeof w.reactions !== 'object' || Array.isArray(w.reactions)) w.reactions = {};
              const k = String(w.row);
              const st = reactState[k];
              if (!st) return;
              if (st.pending > 0 || st.inflight > 0 || nowMs - st.ts < REACT_HOLD_MS) {
                w.likes = st.likes;
                if (st.reactions) w.reactions = st.reactions;
              } else {
                delete reactState[k];
              }
            });
            wishes = data;
          }
          renderWishes();
        } catch (err) {
          loadedOnce = true;
          renderWishes();
        }
      }

      // --- Cập nhật giao diện khi đổi ngôn ngữ ---
      function applyLanguage() {
        const tDict = I18N[curLang];
        document.documentElement.lang = curLang === 'zh' ? 'zh-CN' : curLang;
        langBtn.textContent = tDict.langBadge;
        nameLabel.title = tDict.nameTitle;
        document.getElementById('lbl-rot').textContent = tDict.rot;
        document.getElementById('lbl-lights').textContent = tDict.lights;
        document.getElementById('lbl-chars').textContent = tDict.chars;
        document.getElementById('dc-wish-text').textContent = tDict.devWish;

        document.getElementById('cd-btn-txt').textContent = tDict.cdBtn;
        document.getElementById('noti-btn-txt').textContent = tDict.notiBtn;
        document.getElementById('mail-btn-txt').textContent = tDict.mailBtn;
        document.getElementById('noti-title').textContent = tDict.notiTitle;
        document.getElementById('noti-input').placeholder = tDict.notiPlaceholder;
        document.getElementById('noti-send').textContent = tDict.notiSend;
        document.getElementById('cd-title').textContent = tDict.cdTitle;
        document.getElementById('cd-lbl-d').textContent = tDict.cdDays;
        document.getElementById('cd-lbl-h').textContent = tDict.cdHours;
        document.getElementById('cd-lbl-m').textContent = tDict.cdMins;
        document.getElementById('cd-lbl-s').textContent = tDict.cdSecs;

        document.getElementById('mb-title').textContent = tDict.mbTitle;
        document.getElementById('mb-lock-text').textContent = tDict.lockText;
        mbGuestLoginBtn.textContent = tDict.lockBtn;
        mbSend.textContent = tDict.mbSend;

        if (replyingTarget) {
          replyBannerText.textContent = tDict.replyingTo(replyingTarget.name);
          mbInput.placeholder = tDict.repPlaceholder(replyingTarget.name);
        } else {
          mbInput.placeholder = tDict.mbPlaceholder;
        }

        document.getElementById('modal-title').textContent = tDict.modalTitle;
        document.getElementById('tab-guest').textContent = tDict.tabs.guest;
        document.getElementById('tab-login').textContent = tDict.tabs.login;
        document.getElementById('tab-register').textContent = tDict.tabs.register;

        document.getElementById('guest-desc').textContent = tDict.guestDesc;
        document.getElementById('lbl-guest-name').textContent = tDict.lblGuestName;
        document.getElementById('btn-guest-go').textContent = tDict.btnGuestGo;

        document.getElementById('lbl-login-user').textContent = tDict.lblLoginUser;
        document.getElementById('lbl-login-pass').textContent = tDict.lblLoginPass;
        document.getElementById('btn-login-go').textContent = tDict.btnLoginGo;

        document.getElementById('ip-suggest-title').textContent = tDict.ipSuggestTitle;
        document.getElementById('lbl-reg-display').textContent = tDict.lblRegDisplay;
        document.getElementById('lbl-reg-user').textContent = tDict.lblRegUser;
        document.getElementById('lbl-reg-pass').textContent = tDict.lblRegPass;
        document.getElementById('btn-register-go').textContent = tDict.btnRegGo;

        document.getElementById('lbl-prof-display').textContent = tDict.lblProfDisplay;
        document.getElementById('btn-prof-save').textContent = tDict.btnProfSave;
        document.getElementById('btn-logout').textContent = tDict.btnLogout;
        document.getElementById('btn-prof-close').textContent = tDict.btnProfClose;

        updateCountdown();
        if (typeof renderNotices === 'function') renderNotices();
        renderWishes();
        if (window.updateBarLanguage) {
          window.updateBarLanguage(curLang);
        }
        if (window.updateDeckLanguage) {
          window.updateDeckLanguage();
        }
      }

      langBtn.addEventListener('click', function () {
        const nextIdx = (LANG_ORDER.indexOf(curLang) + 1) % LANG_ORDER.length;
        curLang = LANG_ORDER[nextIdx];
        try {
          localStorage.setItem('cgor_lang', curLang);
        } catch (e) {}
        applyLanguage();
      });

      function autoResizeInput() {
        mbInput.style.height = 'auto';
        mbInput.style.height = Math.min(mbInput.scrollHeight, 120) + 'px';
      }

      mbInput.addEventListener('input', autoResizeInput);

      mbInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          mbForm.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });

      mbForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!currentUser) {
          openAuthModal('login');
          return;
        }
        const rawTxt = mbInput.value.trim();
        if (!rawTxt) return;

        const nowStr = formatTimeVN(new Date().toISOString());

        if (replyingTarget) {
          const target = replyingTarget;
          const targetWish = wishes[target.idx];
          if (targetWish) {
            if (!Array.isArray(targetWish.replies)) targetWish.replies = [];
            targetWish.replies.push({
              name: currentUser.displayName,
              username: currentUser.username,
              badge: currentUser.badge || '',
              msg: rawTxt,
              time: nowStr
            });
            openRepliesSet.add(String(target.row));
          }

          setReplyTarget(null);
          renderWishes();
          mbInput.value = '';
          autoResizeInput();

          mbSend.disabled = true;
          mbSend.textContent = '...';
          try {
            const res = await fetch(SHEET_API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                action: 'reply',
                token: currentUser.token,
                row: target.row,
                msg: rawTxt
              })
            });
            const data = await res.json();
            if (data && data.ok) {
              await loadWishes();
            } else {
              alert('Không lưu được trả lời lên Sheet: ' + ((data && data.error) || 'Chưa cập nhật Code.gs'));
            }
          } catch (err) {
            setTimeout(loadWishes, 2500);
          }

          mbSend.disabled = false;
          mbSend.textContent = I18N[curLang].mbSend;
          return;
        }

        const fullMsg = rawTxt;

        const firstNormalIdx = wishes.findIndex(item => !item.pinned);
        const newWishObj = {
          name: currentUser.displayName,
          username: currentUser.username,
          badge: currentUser.badge || '',
          msg: fullMsg,
          time: nowStr,
          pinned: false,
          likes: 0,
          replies: []
        };
        if (firstNormalIdx === -1) wishes.push(newWishObj);
        else wishes.splice(firstNormalIdx, 0, newWishObj);

        renderWishes();
        mbInput.value = '';
        autoResizeInput();

        mbSend.disabled = true;
        mbSend.textContent = '...';
        try {
          const res = await fetch(SHEET_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'wish',
              token: currentUser.token,
              msg: fullMsg,
              ip: cachedUserIP,
              device: getDeviceInfo()
            })
          });
          const data = await res.json();
          if (data && data.ok === false) {
            alert((I18N[curLang].errors && I18N[curLang].errors[data.error]) || data.error || I18N[curLang].errors.NETWORK);
          }
          await loadWishes();
        } catch (err) {
          setTimeout(loadWishes, 1500);
        }

        mbSend.disabled = false;
        mbSend.textContent = I18N[curLang].mbSend;
      });

      // --- Xử lý Thông báo từ DEV & đếm số lượng chưa xem ---
      const notiList = document.getElementById('noti-list');
      const notiForm = document.getElementById('noti-form');
      const notiInput = document.getElementById('noti-input');
      const notiSend = document.getElementById('noti-send');
      const notiCount = document.getElementById('noti-count');

      let notices = [];
      let noticesLoadedOnce = false;
      let seenNotiSet = new Set();
      let sessionHighlightKeys = new Set();

      try {
        const savedSeen = JSON.parse(localStorage.getItem('cgor_seen_notices') || '[]');
        if (Array.isArray(savedSeen)) seenNotiSet = new Set(savedSeen);
      } catch (e) {}

      function saveSeenNotiSet() {
        try {
          localStorage.setItem('cgor_seen_notices', JSON.stringify(Array.from(seenNotiSet)));
        } catch (e) {}
      }

      function getNoticeKey(n, idx) {
        if (n && n.id) return 'id_' + String(n.id);
        if (n && n.row) return 'row_' + String(n.row);
        const t = String((n && n.time) || '');
        const m = String((n && n.msg) || '').slice(0, 32);
        return (t || m) ? ('tm_' + t + '_' + m) : ('idx_' + idx);
      }

      function getUnreadNoticeCount() {
        let count = 0;
        notices.forEach(function (n, idx) {
          if (!seenNotiSet.has(getNoticeKey(n, idx))) count++;
        });
        return count;
      }

      function updateNotiBadge() {
        const unread = getUnreadNoticeCount();
        if (unread > 0) {
          notiCount.textContent = unread;
          notiCount.style.display = 'inline-block';
        } else {
          notiCount.textContent = '0';
          notiCount.style.display = 'none';
        }
      }

      function markAllNoticesSeen(highlightNew) {
        let changed = false;
        if (highlightNew) sessionHighlightKeys.clear();
        notices.forEach(function (n, idx) {
          const k = getNoticeKey(n, idx);
          if (!seenNotiSet.has(k)) {
            if (highlightNew) sessionHighlightKeys.add(k);
            seenNotiSet.add(k);
            changed = true;
          }
        });
        if (changed) saveSeenNotiSet();
        updateNotiBadge();
      }

      function renderNotices() {
        const tDict = I18N[curLang];
        if (!notices.length) {
          notiList.innerHTML = '<div style="color:var(--dim);text-align:center;padding:16px 0">' +
            (noticesLoadedOnce ? tDict.notiEmpty : tDict.notiLoading) +
            '</div>';
          updateNotiBadge();
          return;
        }
        const canManage = isDevUser();
        notiList.innerHTML = notices.map(function (n, idx) {
          const key = getNoticeKey(n, idx);
          const isNew = sessionHighlightKeys.has(key) || !seenNotiSet.has(key);
          const badgeHtml = '<span class="user-badge">' + escapeHTML(n.badge || 'DEV') + '</span>';
          const newTagHtml = isNew ? '<span class="noti-new-badge">' + tDict.notiNewTag + '</span>' : '';
          const delBtnHtml = (canManage && n.row)
            ? '<button type="button" class="noti-del-btn" data-row="' + n.row + '" title="Xóa thông báo">🗑</button>'
            : '';
          return (
            '<div class="noti-item' + (isNew ? ' unread' : '') + '">' +
              '<div class="mb-meta">' +
                '<div class="mb-sender-wrap">' + escapeHTML(n.name || 'DEV') + badgeHtml + newTagHtml + '</div>' +
                '<div style="display:flex;align-items:center;gap:4px">' +
                  '<span class="mb-time">' + escapeHTML(formatTimeVN(n.time)) + '</span>' +
                  delBtnHtml +
                '</div>' +
              '</div>' +
              '<div class="mb-msg-text">' + escapeHTML(n.msg || '') + '</div>' +
            '</div>'
          );
        }).join('');
        updateNotiBadge();
      }

      async function loadNotices() {
        try {
          const res = await fetch(SHEET_API_URL + '?action=notices');
          const data = await res.json();
          noticesLoadedOnce = true;
          if (data && Array.isArray(data.notices)) {
            notices = data.notices;
          } else if (Array.isArray(data)) {
            const looksLikeWishes = data.length > 0 && ('likes' in data[0] || 'replies' in data[0]) && !data[0].isNotice;
            if (!looksLikeWishes) notices = data;
          }
          if (notiBox.classList.contains('open')) {
            markAllNoticesSeen(false);
          }
          renderNotices();
        } catch (err) {
          noticesLoadedOnce = true;
          renderNotices();
        }
      }

      notiBtn.addEventListener('click', function () {
        const willOpen = !notiBox.classList.contains('open');
        window.closeAllFloatingPanels(willOpen ? 'noti' : '');
        if (willOpen) {
          notiBox.classList.add('open');
          notiBtn.classList.add('active');
          markAllNoticesSeen(true);
          renderNotices();
          loadNotices();
        } else {
          closeNotiBox();
        }
      });

      notiClose.addEventListener('click', closeNotiBox);

      function autoResizeNotiInput() {
        notiInput.style.height = 'auto';
        notiInput.style.height = Math.min(notiInput.scrollHeight, 120) + 'px';
      }

      notiInput.addEventListener('input', autoResizeNotiInput);

      notiInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          notiForm.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });

      notiList.addEventListener('click', async function (e) {
        const delBtn = e.target.closest('.noti-del-btn');
        if (!delBtn || !isDevUser()) return;
        const rowNum = parseInt(delBtn.getAttribute('data-row'), 10);
        if (!rowNum) return;

        notices = notices.filter(item => parseInt(item.row, 10) !== rowNum);
        renderNotices();

        try {
          await fetch(SHEET_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'delete_notice',
              token: currentUser.token,
              row: rowNum
            })
          });
          await loadNotices();
        } catch (err) {}
      });

      notiForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!isDevUser()) return;
        const rawTxt = notiInput.value.trim();
        if (!rawTxt) return;

        const nowIso = new Date().toISOString();
        const tempNotice = {
          id: 'tmp_' + Date.now(),
          name: currentUser.displayName,
          username: currentUser.username,
          badge: currentUser.badge || 'DEV',
          msg: rawTxt,
          time: nowIso,
          isNotice: true
        };

        notices.unshift(tempNotice);
        seenNotiSet.add(getNoticeKey(tempNotice, 0));
        saveSeenNotiSet();
        renderNotices();

        notiInput.value = '';
        autoResizeNotiInput();

        notiSend.disabled = true;
        notiSend.textContent = '...';
        try {
          const res = await fetch(SHEET_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'post_notice',
              token: currentUser.token,
              msg: rawTxt
            })
          });
          const data = await res.json();
          if (data && data.ok === false) {
            alert('Không đăng được thông báo: ' + (data.error || 'Chưa cập nhật action post_notice trong Code.gs'));
          }
          await loadNotices();
        } catch (err) {
          setTimeout(loadNotices, 1500);
        }

        notiSend.disabled = false;
        notiSend.textContent = I18N[curLang].notiSend;
      });

      syncAuthUI();
      applyLanguage();
      setInterval(updateCountdown, 1000);
      loadWishes();
      loadNotices();
      setInterval(loadNotices, 45000);
      fetchIpAndSuggestions();
    })();
