/*!
 * Post structure: wayfinding for long, structured posts.
 * Needs <div id="ps-anchor"></div> at the top of the post body; the anchor's parent is treated
 * as the post root. Adds eyebrows to "Part I · Title" / "Stage 2 · Title" headings, fills
 * <nav class="ps-contents">, shows a scroll-tracking side rail on wide screens and a
 * "you are here" pill on narrow ones. No dependencies.
 */
(function () {
  function init() {
    var anchor = document.getElementById('ps-anchor');
    if (!anchor || !anchor.parentElement) return;
    var root = anchor.parentElement;
    root.classList.add('ps-root');
    var docEl = document.documentElement;

    /* ---------- theme-following colors ---------- */
    function effectiveBg(el) {
      while (el) {
        var c = getComputedStyle(el).backgroundColor;
        if (c && c !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(c)) return c;
        el = el.parentElement;
      }
      return '';
    }
    function syncTheme() {
      var bg = effectiveBg(root);
      if (bg) docEl.style.setProperty('--ps-bg', bg);
      docEl.style.setProperty('--ps-fg', getComputedStyle(root).color);
      docEl.style.setProperty('--ps-body-font', getComputedStyle(document.body).fontFamily);
      /* the one accent color is the site's own link color */
      var probe = document.createElement('a');
      probe.href = '#';
      probe.style.cssText = 'position:absolute;visibility:hidden';
      root.appendChild(probe);
      var link = getComputedStyle(probe).color;
      root.removeChild(probe);
      if (link) docEl.style.setProperty('--ps-accent', link);
    }
    syncTheme();
    var mo = new MutationObserver(function () { setTimeout(syncTheme, 30); });
    mo.observe(docEl, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.addEventListener) mq.addEventListener('change', syncTheme);
    }

    /* ---------- headings ---------- */
    var SEP = ' · ';
    function outsideLab(el) { return !el.closest('.ols-lab'); }
    var heads = Array.prototype.filter.call(root.querySelectorAll('h2, h3'), outsideLab);
    Array.prototype.forEach.call(root.querySelectorAll('h4'), function (h) {
      if (outsideLab(h)) h.classList.add('ps-h-sub');
    });

    function splitHeading(h) {
      var node = h.firstChild;
      if (!node || node.nodeType !== 3) return null;
      var i = node.nodeValue.indexOf(SEP);
      if (i < 0) return null;
      var eb = node.nodeValue.slice(0, i).trim();
      node.nodeValue = node.nodeValue.slice(i + SEP.length);
      var span = document.createElement('span');
      span.className = 'ps-eyebrow';
      span.textContent = eb;
      h.insertBefore(span, node);
      return eb;
    }
    function titleText(h) {
      var clone = h.cloneNode(true);
      var eb = clone.querySelector('.ps-eyebrow');
      if (eb) eb.remove();
      return clone.textContent.trim();
    }
    function pieceFor(h) {
      var sec = h.closest('.ps-stage');
      var st = sec ? sec.getAttribute('data-stage') : null;
      return st === '1' ? 's' : st === '2' ? 'a' : st === '3' ? 'b' : (st === '4' || st === '5') ? 'c' : null;
    }

    var items = heads.map(function (h) {
      var eb = splitHeading(h);
      if (eb) h.classList.add(h.tagName === 'H2' ? 'ps-h-part' : 'ps-h-stage');
      else if (h.tagName === 'H2') h.classList.add('ps-h-part');
      if (!h.id) h.id = 'ps-' + titleText(h).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return { el: h, level: h.tagName === 'H2' ? 2 : 3, eyebrow: eb, title: titleText(h), piece: h.tagName === 'H3' ? pieceFor(h) : null };
    });

    /* group h3 under their h2 */
    var parts = [], current = null;
    items.forEach(function (it) {
      if (it.level === 2) { current = { item: it, subs: [] }; parts.push(current); }
      else if (current) { current.subs.push(it); it.part = current.item; }
    });
    items.forEach(function (it) { if (it.level === 2) it.part = it; });

    function shortStage(it) {
      if (!it.eyebrow) return it.title;
      var m = it.eyebrow.match(/(\d+)\s*$/);
      return m ? m[1] + ' ' + it.title : it.title;
    }
    function dot(piece) {
      return piece ? '<span class="ps-toc-dot" data-p="' + piece + '" aria-hidden="true"></span>' : '';
    }
    function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    /* ---------- inline contents ---------- */
    var nav = root.querySelector('.ps-contents');
    if (nav && parts.length) {
      var html = '<p class="ps-contents-title">In this post</p><ol>';
      parts.forEach(function (p) {
        html += '<li><a class="ps-toc-part" href="#' + p.item.el.id + '"><span class="ps-toc-eb">' + esc(p.item.eyebrow || '') + '</span><span>' + esc(p.item.title) + '</span></a>';
        if (p.subs.length) {
          html += '<div class="ps-toc-subs">' + p.subs.map(function (s) {
            return '<a href="#' + s.el.id + '">' + dot(s.piece) + esc(shortStage(s)) + '</a>';
          }).join('') + '</div>';
        }
        html += '</li>';
      });
      nav.innerHTML = html + '</ol>';
    }

    /* ---------- side rail ---------- */
    var rail = document.createElement('nav');
    rail.className = 'ps-rail';
    rail.setAttribute('aria-label', 'Sections');
    var rhtml = '<ol>';
    parts.forEach(function (p) {
      rhtml += '<li class="ps-rail-part"><a href="#' + p.item.el.id + '" data-id="' + p.item.el.id + '">' + esc((p.item.eyebrow ? p.item.eyebrow + ' · ' : '') + p.item.title) + '</a>';
      if (p.subs.length) {
        rhtml += '<ol>' + p.subs.map(function (s) {
          return '<li class="ps-rail-sub"><a href="#' + s.el.id + '" data-id="' + s.el.id + '"' + (s.piece ? ' data-p="' + s.piece + '"' : '') + '>' + esc(shortStage(s)) + '</a></li>';
        }).join('') + '</ol>';
      }
      rhtml += '</li>';
    });
    rail.innerHTML = rhtml + '</ol>';
    document.body.appendChild(rail);

    /* ---------- location pill ---------- */
    var pill = document.createElement('div');
    pill.className = 'ps-pill';
    pill.setAttribute('role', 'button');
    pill.setAttribute('tabindex', '0');
    pill.setAttribute('aria-label', 'Current section; tap to see all sections');
    pill.innerHTML = '<div class="ps-pill-text"></div><div class="ps-pill-bar"><i></i></div>';
    document.body.appendChild(pill);
    var pillText = pill.firstChild, pillBar = pill.lastChild.firstChild;
    function toContents() {
      var target = nav || root;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
    pill.addEventListener('click', toContents);
    pill.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toContents(); } });

    /* ---------- scroll tracking ---------- */
    var RAIL_W = 220, GAP = 48;
    var lastKey = '';
    function update() {
      var vh = window.innerHeight;
      var rr = root.getBoundingClientRect();
      var navGone = nav ? nav.getBoundingClientRect().bottom < 0 : rr.top < 0;
      var before = rr.bottom > vh * 0.5;
      var active = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].el.getBoundingClientRect().top < vh * 0.3) active = items[i]; else break;
      }
      var roomForRail = rr.left >= RAIL_W + GAP + 16;
      var showNav = navGone && before && !!active;

      rail.style.left = Math.max(16, rr.left - RAIL_W - GAP) + 'px';
      rail.classList.toggle('ps-show', showNav && roomForRail);
      pill.classList.toggle('ps-show', showNav && !roomForRail);

      var key = active ? active.el.id : '';
      if (key !== lastKey) {
        lastKey = key;
        Array.prototype.forEach.call(rail.querySelectorAll('a'), function (a) {
          var id = a.getAttribute('data-id');
          a.classList.toggle('ps-active', !!active && id === active.el.id);
          a.classList.toggle('ps-in', !!active && active.part && id === active.part.el.id);
        });
        if (active) {
          var part = active.part || active;
          var label = part.eyebrow ? '<b>' + esc(part.eyebrow) + '</b>' : '<b>' + esc(part.title) + '</b>';
          if (active !== part) label += ' · ' + (active.eyebrow ? esc(active.eyebrow) + ' · ' : '') + esc(active.title);
          else if (part.eyebrow) label += ' · ' + esc(part.title);
          pillText.innerHTML = dot(active.piece) + '<span>' + label + '</span>';
        }
      }
      var total = rr.height - vh;
      var prog = total > 0 ? Math.min(1, Math.max(0, -rr.top / total)) : 0;
      pillBar.style.width = (prog * 100).toFixed(1) + '%';
    }
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
