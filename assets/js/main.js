(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero entrance: stagger the wordmark letters, then mark the page loaded.
  var letters = document.querySelectorAll('.wordmark i');
  letters.forEach(function (el, i) { el.style.transitionDelay = (i * 55) + 'ms'; });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.classList.add('loaded'); });
  });

  // Scroll reveals, with a small stagger between siblings.
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sibs = Array.prototype.filter.call(e.target.parentNode.children, function (c) {
          return c.classList.contains('reveal') && !c.classList.contains('in');
        });
        e.target.style.transitionDelay = Math.min(sibs.indexOf(e.target), 5) * 80 + 'ms';
        e.target.classList.add('in');
        var b = e.target.querySelector('[data-count]');
        if (b) countUp(b);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Count-up numbers.
  function countUp(el) {
    var target = +el.dataset.count, suffix = el.dataset.suffix || '', sep = el.dataset.sep;
    var start = null, dur = 1400;
    function fmt(n) { return (sep ? n.toLocaleString('en-US') : String(n)) + suffix; }
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Work list: the active row drives the detail card (desktop) or opens inline (mobile).
  var rows = document.querySelectorAll('.row');
  var shot = document.querySelector('.shot');
  var sTitle = document.querySelector('.shot-title');
  var sStat = document.querySelector('.shot-stat');
  var sLabel = document.querySelector('.shot-label');
  var sText = document.querySelector('.shot-text');
  var sLink = document.querySelector('.shot-link');
  var timer;

  rows.forEach(function (row) {
    var d = row.dataset;
    var inline = document.createElement('div');
    inline.className = 'inline';
    var b = document.createElement('b'); b.textContent = d.stat;
    var s = document.createElement('small'); s.textContent = d.label;
    var p = document.createElement('p'); p.textContent = d.text;
    inline.appendChild(b); inline.appendChild(s); inline.appendChild(p);
    if (d.url) {
      var a = document.createElement('a');
      a.className = 'verify'; a.href = d.url; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = d.link + ' \u2197';
      inline.appendChild(a);
    }
    row.insertAdjacentElement('afterend', inline);
    row.setAttribute('aria-pressed', row.classList.contains('on'));
    row.addEventListener('click', function () { activate(row, true); });
    row.addEventListener('mouseenter', function () {
      if (window.matchMedia('(hover: hover) and (min-width: 961px)').matches) activate(row, true);
    });
  });

  function fill(row) {
    var d = row.dataset;
    sTitle.textContent = row.querySelector('span').textContent + '  /  ' + row.querySelector('em').textContent;
    sStat.textContent = d.stat; sLabel.textContent = d.label; sText.textContent = d.text;
    if (sLink) { sLink.hidden = !d.url; if (d.url) { sLink.href = d.url; sLink.textContent = d.link + ' \u2197'; } }
  }
  function activate(row, animate) {
    if (row.classList.contains('on') && animate) return;
    rows.forEach(function (r) { r.classList.toggle('on', r === row); r.setAttribute('aria-pressed', r === row); });
    if (!shot) return;
    if (!animate || reduce) { fill(row); return; }
    shot.classList.add('swap');
    clearTimeout(timer);
    timer = setTimeout(function () { fill(row); shot.classList.remove('swap'); }, 220);
  }
  var first = document.querySelector('.row.on') || rows[0];
  if (first && shot) fill(first);

  // Gentle parallax on the hero subject.
  var subject = document.querySelector('.hero-subject img');
  var mark = document.querySelector('.wordmark');
  if (subject && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          subject.style.transform = 'translateY(' + (y * -0.08) + 'px) scale(' + (1 + y * 0.00012) + ')';
          mark.style.transform = 'translateY(' + (y * 0.12) + 'px)';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  // Chat launcher: placeholder until the assistant is built.
  var fab = document.querySelector('.chat-fab');
  var tip = document.getElementById('chat-tip');
  if (fab && tip) {
    fab.addEventListener('click', function () {
      tip.hidden = !tip.hidden;
      fab.setAttribute('aria-expanded', String(!tip.hidden));
    });
  }

  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
