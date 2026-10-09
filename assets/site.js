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
    var panel = document.querySelector('.mac-dock');
    var dock = panel && panel.querySelector('.dock-container');
    if (!dock) return;
    var items = Array.prototype.slice.call(dock.querySelectorAll('.dock-item'));
    if (!items.length) return;

    // 横並び（スマートフォン）か縦並び（デスクトップ）かは
    // ブレークポイント直書きではなく実際の flex-direction から判定する
    function isHorizontal() {
      return getComputedStyle(dock).flexDirection.indexOf('row') === 0;
    }

    var pending = null;

    function reset() {
      pending = null;
      items.forEach(function (item) {
        item.style.transform = '';
        item.style.zIndex = '';
      });
    }

    function apply(point) {
      var h = isHorizontal();
      // 測定と書き込みは分ける。混ぜると項目ごとにレイアウトが走る
      var proximities = items.map(function (item) {
        var rect = item.getBoundingClientRect();
        var distance = h
          ? Math.abs(point.clientX - (rect.left + rect.width / 2))
          : Math.abs(point.clientY - (rect.top + rect.height / 2));
        return Math.max(0, 90 - distance);
      });
      items.forEach(function (item, i) {
        var proximity = proximities[i];
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

    var flush = onFrame(function () {
      if (pending) { apply(pending); pending = null; }
    });

    function magnify(point) {
      if (reduce.matches || !point) return;
      pending = { clientX: point.clientX, clientY: point.clientY };
      flush();
    }

    // 受けるのは内側の .dock-container ではなくパネル全体。
    // ガラスの余白（padding）の上でポインタが外れたことにならないように
    panel.addEventListener('mousemove', magnify);
    panel.addEventListener('mouseleave', reset);
    panel.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches.length) magnify(e.touches[0]);
    });
    panel.addEventListener('touchend', reset);
    panel.addEventListener('touchcancel', reset);
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

    // 出現し終えたら .reveal を外す。付けたままだと will-change による合成層と
    // .75s の遷移が残り、カード本来のホバー（.35s）や枠線の描画を狂わせる
    function show(el) {
      el.classList.add('is-visible');
      var done = function (e) {
        if (e.target !== el || e.propertyName !== 'transform') return;
        el.removeEventListener('transitionend', done);
        el.classList.remove('reveal', 'from-left', 'from-right');
      };
      el.addEventListener('transitionend', done);
    }

    var observerRan = false;

    var observer = new IntersectionObserver(function (entries) {
      observerRan = true;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);
        // 段差は transition-delay ではなくクラス付与を遅らせてつける。
        // inline の transition-delay はその後のホバーにも効いてしまうため
        var wait = Number(el.getAttribute('data-reveal-delay')) || 0;
        if (wait) setTimeout(function () { show(el); }, wait);
        else show(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    var watched = [];
    Array.prototype.forEach.call(targets, function (el) {
      // 入れ子の対象（.content-card の中の .qr など）は親の出現に任せる。
      // 二重に transform と opacity がかかり、中身だけ別に動いてしまうため
      if (el.parentElement && el.parentElement.closest('.reveal')) return;
      el.classList.add('reveal');
      // 2 言語並列は、日本語面は左から・英語面は右から差し込む
      if (el.closest && el.closest('.japanese-side')) el.classList.add('from-left');
      else if (el.closest && el.closest('.english-side')) el.classList.add('from-right');
      el.setAttribute('data-reveal-delay', (watched.length % 3) * 80);
      watched.push(el);
      observer.observe(el);
    });

    // 保険：.reveal は opacity:0 なので、observer が一度も動かなかったときだけ
    // 3 秒後に全部表示する（内容が消えたままにならない）。
    // observer が動いているなら触らない：触るとスクロール連動の出現が死ぬ
    setTimeout(function () {
      if (observerRan) return;
      observer.disconnect();
      watched.forEach(function (el) {
        el.classList.remove('reveal', 'from-left', 'from-right');
      });
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
