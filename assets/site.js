/* ==========================================================================
   筑波大学人文社会系 公開講演会 — 共通スクリプト
     1. ドックの拡大（Mac 風）
     2. スクロール進行バー
     3. スクロール連動の出現（左右から差し込む）
     4. カードのカーソル追従ハイライト
     5. ヘッダー装飾の視差
     6. ボタンの磁力ホバー
   すべて prefers-reduced-motion を尊重。JS 無効でも内容は静的に正しく表示される。
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var coarse = window.matchMedia('(hover: none)');

  function onFrame(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fn(); });
    };
  }

  /* ---------------------------------------------------------------- ドック */
  function initDock() {
    var dock = document.querySelector('.dock-container');
    if (!dock) return;
    var items = Array.prototype.slice.call(dock.querySelectorAll('.dock-item'));
    if (!items.length) return;

    // 横並び（スマートフォン）か縦並び（デスクトップ）かは
    // ブレークポイント直書きではなく実際の flex-direction から判定する
    function isHorizontal() {
      return getComputedStyle(dock).flexDirection.indexOf('row') === 0;
    }

    function reset() {
      items.forEach(function (item) {
        item.style.transform = '';
        item.style.zIndex = '';
      });
    }

    function magnify(point) {
      if (reduce.matches) return;
      var h = isHorizontal();
      items.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        var distance = h
          ? Math.abs(point.clientX - (rect.left + rect.width / 2))
          : Math.abs(point.clientY - (rect.top + rect.height / 2));
        var proximity = Math.max(0, 90 - distance);
        if (proximity > 0) {
          var scale = 1 + (proximity / 90) * 0.34;
          item.style.transform = h
            ? 'scale(' + scale + ') translateY(-' + proximity / 12 + 'px)'
            : 'scale(' + scale + ') translateX(' + proximity / 10 + 'px)';
          item.style.zIndex = String(Math.round(proximity));
        } else {
          item.style.transform = '';
          item.style.zIndex = '';
        }
      });
    }

    dock.addEventListener('mousemove', magnify);
    dock.addEventListener('mouseleave', reset);
    dock.addEventListener('touchmove', function (e) { magnify(e.touches[0]); });
    dock.addEventListener('touchend', reset);
    window.addEventListener('resize', reset);
  }

  /* ------------------------------------------------------------ 進行バー */
  function initProgress() {
    if (reduce.matches) return;
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var update = onFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? window.scrollY / max : 0;
      bar.style.width = Math.min(100, Math.max(0, ratio * 100)) + '%';
    });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* -------------------------------------------------- 出現アニメーション */
  function initReveal() {
    if (reduce.matches || !('IntersectionObserver' in window)) return;

    var targets = document.querySelectorAll(
      '.profile-section, .content-card, .details, .feature, .cards article, .sponsors, .qr, main > section:not(.profile-section) > h2, main > h2'
    );
    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    Array.prototype.forEach.call(targets, function (el, i) {
      el.classList.add('reveal');
      // 2 言語並列は、日本語面は左から・英語面は右から差し込む
      if (el.closest && el.closest('.japanese-side')) el.classList.add('from-left');
      else if (el.closest && el.closest('.english-side')) el.classList.add('from-right');
      el.style.transitionDelay = (i % 3) * 80 + 'ms';
      observer.observe(el);
    });

    // 保険：.reveal は opacity:0 なので、何かの理由で observer が働かなくても
    // 3 秒後には必ず表示されるようにしておく（内容が消えたままにならない）
    setTimeout(function () {
      Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-visible'); });
    }, 3000);
  }

  /* ------------------------------------------ カードのカーソル追従ハイライト */
  function initPointerGlow() {
    if (reduce.matches || coarse.matches) return;
    var cards = document.querySelectorAll('.content-card, .details');
    Array.prototype.forEach.call(cards, function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* -------------------------------------------------------- ヘッダーの視差 */
  function initParallax() {
    if (reduce.matches) return;
    var header = document.querySelector('header');
    if (!header) return;
    var glow = header.querySelector('.header-gradient-glow');
    var grid = header.querySelector('.header-grid');
    var emblem = header.querySelector('.tsukuba-emblem');
    var content = header.querySelector('.header-content');
    if (!glow && !grid && !emblem) return;

    var update = onFrame(function () {
      var y = window.scrollY;
      if (y > header.offsetHeight + 200) return;   // ヘッダーが画面外なら触らない
      if (grid) grid.style.transform = 'translate3d(0,' + y * 0.18 + 'px,0)';
      if (emblem) emblem.style.translate = '0 ' + y * 0.26 + 'px';
      if (content) {
        content.style.transform = 'translate3d(0,' + y * 0.10 + 'px,0)';
        content.style.opacity = String(Math.max(0, 1 - y / (header.offsetHeight * 0.95)));
      }
    });
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ------------------------------------------------ ヘッダーのスポットライト */
  function initSpotlight() {
    if (reduce.matches || coarse.matches) return;
    var header = document.querySelector("header");
    var content = header && header.querySelector(".header-content");
    if (!content) return;
    header.addEventListener("mousemove", function (e) {
      var r = content.getBoundingClientRect();
      content.style.setProperty("--hx", ((e.clientX - r.left) / r.width * 100) + "%");
      content.style.setProperty("--hy", ((e.clientY - r.top) / r.height * 100) + "%");
    });
  }

  /* -------------------------------------------------------- 磁力ボタン */
  function initMagnetic() {
    if (reduce.matches || coarse.matches) return;
    var buttons = document.querySelectorAll('.action, .link, .button010 a');
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform = 'translate(' + dx * 7 + 'px,' + (dy * 5 - 3) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  function init() {
    // 1 つが失敗しても他の機能と本文表示に波及させない
    [initDock, initProgress, initReveal, initPointerGlow, initParallax, initSpotlight, initMagnetic]
      .forEach(function (fn) {
        try { fn(); } catch (e) { if (window.console) console.warn('site.js:', fn.name, e); }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
