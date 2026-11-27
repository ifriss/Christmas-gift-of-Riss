/* Chữ ký gọn dạng pill, hiện ở mọi Space; màu/hiệu ứng đổi theo Space qua CSS (body[data-space]: space1 vàng, space2 tím, space3 xanh ngọc bích neon, space4 pill chibi viền vàng - xanh ngọc tươi; biến màu --sig-* khai báo trong css/core.css). */
(function () {
  'use strict';
  const el = document.createElement('div');
  el.id = 'signature';
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');

  const dot = document.createElement('span');
  dot.className = 'sig-dot';
  const sh = document.createElement('span');
  sh.className = 'sig-short';
  sh.textContent = 'RISS';
  const full = document.createElement('span');
  full.className = 'sig-full';
  full.textContent = 'RISS · Trương Thành Thông';
  el.append(dot, sh, full);
  el.title = 'AetheRiss — DEV: RISS - Trương Thành Thông';
  document.body.appendChild(el);

  // Đổi tiêu đề (tooltip) theo ngôn ngữ đang chọn
  const TITLES = {
    vi: 'AetheRiss — DEV: RISS - Trương Thành Thông',
    en: 'AetheRiss — DEV: RISS - Truong Thanh Thong',
    zh: 'AetheRiss — 开发者：RISS - Trương Thành Thông'
  };
  function syncLang() {
    let l = 'vi';
    try { l = localStorage.getItem('cgor_lang') || 'vi'; } catch (e) {}
    el.title = TITLES[l] || TITLES.vi;
    el.setAttribute('aria-label', el.title);
  }
  syncLang();
  window.addEventListener('cgor-lang', syncLang);

  // Chạm để xem tên đầy đủ trong vài giây
  let timer = 0;
  function toggle() {
    syncLang();
    el.classList.toggle('open');
    clearTimeout(timer);
    if (el.classList.contains('open')) timer = setTimeout(function () { el.classList.remove('open'); }, 3500);
  }
  el.addEventListener('click', toggle);
  el.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
})();
