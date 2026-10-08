/* ==========================================================================
   筑波大学人文社会系 公開講演会 — 共通スクリプト
   1. ドックの拡大（Mac 風）
   2. スクロール進行バー
   3. スクロール連動の出現アニメーション
   いずれも prefers-reduced-motion を尊重し、JS 無効時は静的に正しく表示される。
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

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
      var h = isHorizontal();
      items.forEach(function (item) {
        item.style.transform = h ? 'scale(1)' : 'scale(1) translateY(0)';
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
        var proximity = Math.max(0, 80 - distance);
        if (proximity > 0) {
          var scale = 1 + (proximity / 80) * 0.32;
          item.style.transform = h
            ? 'scale(' + scale + ')'
            : 'scale(' + scale + ') translateX(' + proximity / 14 + 'px)';
          item.style.zIndex = String(Math.round(proximity));
        } else {
          item.style.transform = h ? 'scale(1)' : 'scale(1) translateY(0)';
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

  /* ------------------------------------------------------ 進行バー */
  function initProgress() {
    if (reduce.matches) return;
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var queued = false;
    function update() {
      queued = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? window.scrollY / max : 0;
      bar.style.width = Math.min(100, Math.max(0, ratio * 100)) + '%';
    }
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* -------------------------------------------------- 出現アニメーション */
  function initReveal() {
    if (reduce.matches || !('IntersectionObserver' in window)) return;

    var targets = document.querySelectorAll(
      '.profile-section, .content-card, .details, .feature, .cards article, .sponsors, main > section > h2'
    );
    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(targets, function (el, i) {
      el.classList.add('reveal');
      // 同じ行に並ぶ要素が順に立ち上がるよう、わずかにずらす
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      observer.observe(el);
    });
  }

  function init() {
    initDock();
    initProgress();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
