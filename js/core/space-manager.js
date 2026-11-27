/* Quản lý các Space của AetheRiss: đăng ký, chuyển cảnh mượt, nhớ Space hiện tại. */
(function () {
  'use strict';
  const KEY = 'aetheriss.space';
  const ORDER = ['space1', 'space2', 'space3', 'space4'];
  const reg = window.CGOR_SPACES || {};
  let current = null;
  let busy = false;

  const veil = document.createElement('div');
  veil.id = 'space-veil';
  document.body.appendChild(veil);

  function mkNav(id, label, text) {
    const b = document.createElement('button');
    b.id = id;
    b.className = 'space-nav';
    b.type = 'button';
    b.textContent = text;
    b.setAttribute('aria-label', label);
    document.body.appendChild(b);
    return b;
  }
  const next = mkNav('space-next', 'Space kế tiếp', '>');
  const prev = mkNav('space-prev', 'Space trước', '<');
  const NAV_LABELS = {
    vi: { next: 'Space kế tiếp', prev: 'Space trước' },
    en: { next: 'Next space', prev: 'Previous space' },
    zh: { next: '下一个空间', prev: '上一个空间' }
  };
  function syncNavLang() {
    let l = 'vi';
    try { l = localStorage.getItem('cgor_lang') || 'vi'; } catch (e) {}
    const t = NAV_LABELS[l] || NAV_LABELS.vi;
    next.setAttribute('aria-label', t.next);
    prev.setAttribute('aria-label', t.prev);
  }
  syncNavLang();
  window.addEventListener('cgor-lang', syncNavLang);

  function saved() {
    try { const v = localStorage.getItem(KEY); return ORDER.indexOf(v) >= 0 && reg[v] ? v : ORDER[0]; }
    catch (e) { return ORDER[0]; }
  }
  function save(id) { try { localStorage.setItem(KEY, id); } catch (e) {} }

  function apply(id) {
    if (current && reg[current]) reg[current].unmount();
    current = id;
    document.body.dataset.space = id;
    save(id);
    if (reg[id]) reg[id].mount();
    try { window.dispatchEvent(new CustomEvent('cgor-space', { detail: { id: id } })); } catch (e) {}
  }

  function go(id) {
    if (busy || id === current || !reg[id]) return;
    busy = true;
    veil.classList.add('on');
    setTimeout(function () {
      apply(id);
      requestAnimationFrame(function () {
        veil.classList.remove('on');
        setTimeout(function () { busy = false; }, 230);
      });
    }, 230);
  }

  function step(d) {
    go(ORDER[(ORDER.indexOf(current) + d + ORDER.length) % ORDER.length]);
  }
  function cycle() { step(1); }

  next.addEventListener('click', cycle);
  prev.addEventListener('click', function () { step(-1); });

  window.SpaceManager = { go: go, next: cycle, prev: function () { step(-1); }, current: function () { return current; }, order: ORDER };
  apply(saved());
})();
