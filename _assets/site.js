/* دروس العربية — السكربت المشترك لكل الصفحات */
(function () {
  var root = document.documentElement, KEY = 'nahw-fs';
  root.classList.add('js');
  var g = function (id) { return document.getElementById(id); };

  /* حجم الخط والطباعة */
  function setFs(v) { v = Math.max(16, Math.min(36, v)); root.style.setProperty('--fs', v + 'px'); try { localStorage.setItem(KEY, v); } catch (e) {} }
  try { var fs0 = +localStorage.getItem(KEY); if (fs0) setFs(fs0); } catch (e) {}
  function cur() { return parseFloat(getComputedStyle(root).getPropertyValue('--fs')) || 22; }
  if (g('fs-plus')) g('fs-plus').onclick = function () { setFs(cur() + 2); };
  if (g('fs-minus')) g('fs-minus').onclick = function () { setFs(cur() - 2); };
  if (g('print')) g('print').onclick = function () { window.print(); };

  /* الصوت: ملف مسجّل (data-a) يُحمَّل عند الضغط فقط، وإلا صوت المتصفّح العربي */
  var audio = new Audio(), playing = null;
  audio.preload = 'none';
  function stop() { audio.pause(); if (playing) playing.classList.remove('on'); playing = null; if (window.speechSynthesis) speechSynthesis.cancel(); }
  audio.onended = stop;
  function ttsText(el) { var k = el.getAttribute('data-s') || el.getAttribute('data-play') || ''; return k.indexOf('tts:') === 0 ? k.slice(4) : ''; }
  function canSpeak() { return !!window.speechSynthesis; }
  function speak(t, btn) {
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t); u.lang = 'ar-SA'; u.rate = 0.85;
    var v = speechSynthesis.getVoices().filter(function (x) { return /^ar/i.test(x.lang); })[0]; if (v) u.voice = v;
    if (btn) { playing = btn; btn.classList.add('on'); u.onend = function () { btn.classList.remove('on'); if (playing === btn) playing = null; }; }
    speechSynthesis.speak(u);
  }
  function play(el, btn) {
    var again = btn && playing === btn; stop(); if (again) return;
    var src = el.getAttribute('data-a');
    if (src) { audio.src = src; var p = audio.play(); if (p && p.catch) p.catch(function () {}); if (btn) { playing = btn; btn.classList.add('on'); } return; }
    var t = ttsText(el); if (t && canSpeak()) speak(t, btn);
  }
  document.querySelectorAll('.say').forEach(function (b) {
    if (!b.getAttribute('data-a') && !(ttsText(b) && canSpeak())) { b.remove(); return; }
    b.setAttribute('aria-label', 'استمع'); b.title = 'استمع';
    b.addEventListener('click', function () { play(b, b); });
  });
  document.querySelectorAll('[data-play]').forEach(function (t) {
    t.addEventListener('click', function () {
      play(t, null); t.classList.add('on'); setTimeout(function () { t.classList.remove('on'); }, 900);
    });
  });

  /* الإعراب عند الضغط على الكلمة الملوّنة */
  document.querySelectorAll('mark[data-i]').forEach(function (m) {
    m.setAttribute('tabindex', '0'); m.setAttribute('role', 'button');
    function toggle() {
      var host = m.closest('.s,li,p,td') || m.parentNode, id = 'i-' + m.dataset.k, ex = g(id);
      if (ex) { ex.remove(); return; }
      var d = document.createElement('span'); d.className = 'irab'; d.id = id;
      d.innerHTML = '<b></b>: '; d.firstChild.textContent = m.textContent; d.appendChild(document.createTextNode(m.dataset.i)); host.appendChild(d);
    }
    m.addEventListener('click', toggle);
    m.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  /* التمارين: عند الخطأ يظهر الجواب الصحيح وسببه وما اختاره المتعلّم، مع زرّ لإعادة المحاولة */
  var rule = '';
  var defs = document.querySelectorAll('.def .txt');
  if (defs.length && !document.querySelector('.letter')) {
    rule = defs[0].textContent.replace(/🔊/g, '').replace(/\s+/g, ' ').trim();
    if (rule.length > 170) rule = rule.slice(0, 168) + '…';
  }
  var qs = document.querySelectorAll('.q'), right = 0, sc = g('score-v');
  function upd() { if (sc) sc.textContent = right + ' من ' + qs.length; }
  function line(parent, cls, label, text) {
    var p = document.createElement('p'); p.className = cls;
    if (label) { var b = document.createElement('b'); b.textContent = label; p.appendChild(b); p.appendChild(document.createTextNode(' ')); }
    p.appendChild(document.createTextNode(text)); parent.appendChild(p); return p;
  }
  qs.forEach(function (q) {
    var a = +q.dataset.a, fb = q.querySelector('.fb'), box = q.querySelector('.opts'),
        bs = [].slice.call(box.querySelectorAll('button')), first = true;
    bs.forEach(function (b, i) { b.dataset.i = i; });
    var correct = bs[a];
    function shuffle() {
      for (var j = bs.length - 1; j > 0; j--) { var r = Math.floor(Math.random() * (j + 1)); var t = bs[j]; bs[j] = bs[r]; bs[r] = t; }
      bs.forEach(function (b) { box.appendChild(b); });
    }
    shuffle();
    function label(b) { var t = b.textContent.trim(); if (!t) { var im = b.querySelector('img'); t = im ? (im.getAttribute('alt') || 'الصورة') : ''; } return t; }
    var why = q.dataset.why || '';
    function finish() { bs.forEach(function (x) { x.disabled = true; }); }
    bs.forEach(function (b) {
      b.addEventListener('click', function () {
        fb.innerHTML = '';
        if (b === correct) {
          b.classList.add('ok'); finish();
          fb.className = 'fb ok';
          line(fb, 'fv', 'أحسنت!', why);
          if (first) right++; upd(); first = false;
          return;
        }
        first = false; q.setAttribute('data-wrong', '1');
        b.classList.add('bad'); correct.classList.add('ok', 'reveal'); finish();
        fb.className = 'fb bad';
        line(fb, 'fv', 'إجابتك غير صحيحة.', 'اخترتَ «' + label(b) + '»، والصواب: «' + label(correct) + '».');
        if (why) line(fb, 'fw', 'السبب:', why);
        if (!why && rule) line(fb, 'fr', 'تذكّر:', rule.replace(/[:：]\s*$/, '.'));
        var again = document.createElement('button'); again.type = 'button'; again.className = 'again'; again.textContent = 'أعد المحاولة';
        again.addEventListener('click', function () {
          bs.forEach(function (x) { x.disabled = false; x.classList.remove('ok', 'bad', 'reveal'); });
          fb.innerHTML = ''; fb.className = 'fb'; shuffle(); bs[0].focus();
        });
        fb.appendChild(again);
      });
    });
  });
  upd();
  if (g('reset')) g('reset').onclick = function () { location.reload(); };

  /* تقويم الوحدة: قائمة الدروس التي تحتاج مراجعة (الدعم) */
  var sup = g('support');
  if (sup) {
    var supList = sup.querySelector('ul'), supNone = sup.querySelector('.none');
    var refresh = function () {
      var seen = {}, items = [];
      document.querySelectorAll('.q[data-wrong][data-from]').forEach(function (q) {
        var h = q.getAttribute('data-from'); if (!seen[h]) { seen[h] = 1; items.push(q); }
      });
      supList.innerHTML = '';
      items.forEach(function (q) {
        var li = document.createElement('li'), a = document.createElement('a');
        a.href = q.getAttribute('data-from'); a.textContent = q.getAttribute('data-from-t'); li.appendChild(a); supList.appendChild(li);
      });
      var answered = document.querySelectorAll('.q .opts button.ok').length;
      sup.hidden = !(items.length || answered === qs.length);
      if (supNone) supNone.hidden = !!items.length || answered < qs.length;
    };
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.q .opts button')) setTimeout(refresh, 0); });
  }

  /* التقدّم المحفوظ محلياً + الترتيب + الإملاء */
  function key(u) { try { return decodeURIComponent(new URL(u, location.href).pathname); } catch (e) { return u; } }
  function get(k) { try { return localStorage.getItem('done:' + k); } catch (e) { return null; } }
  function set(k) { try { localStorage.setItem('done:' + k, '1'); } catch (e) {} }
  var badge = g('donebadge'), me = key(location.href);
  if (qs.length) {
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.q .opts button')) setTimeout(function () {
        if (document.querySelectorAll('.q .opts button.ok').length === qs.length) { set(me); if (badge) badge.hidden = false; }
      }, 0);
    });
    if (get(me) && badge) badge.hidden = false;
  }
  document.querySelectorAll('.toc a[href]').forEach(function (a) { if (get(key(a.getAttribute('href')))) a.classList.add('done'); });
  document.querySelectorAll('[data-files]').forEach(function (el) {
    var fs = JSON.parse(el.getAttribute('data-files')), n = 0;
    fs.forEach(function (f) { if (get(key(f))) n++; });
    var o = el.querySelector('.prog'); if (o) o.textContent = 'أنجزتُ ' + n + ' من ' + fs.length;
  });
  document.querySelectorAll('.ord').forEach(function (o) {
    var ans = JSON.parse(o.getAttribute('data-ans')), pool = o.querySelector('.pool'), line = o.querySelector('.line'), fb = o.querySelector('.fb');
    pool.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) line.appendChild(b); });
    line.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pool.appendChild(b); });
    o.querySelector('.chk').onclick = function () {
      var got = [].map.call(line.querySelectorAll('button'), function (b) { return b.getAttribute('data-w'); });
      var ok = got.join(' ') === ans.join(' '); fb.className = 'fb ' + (ok ? 'ok' : 'bad');
      fb.textContent = ok ? 'أحسنت! الجملة صحيحة.' : (got.length < ans.length ? 'أكمل ترتيب الكلمات.' : 'ليس هذا الترتيب. استمع إلى الجملة مرّة أخرى.');
    };
    o.querySelector('.clr').onclick = function () { [].slice.call(line.querySelectorAll('button')).forEach(function (b) { pool.appendChild(b); }); fb.textContent = ''; };
  });
  document.querySelectorAll('.dict').forEach(function (d) {
    /* المقارنة: نتجاهل الحركات والمسافات وعلامات الترقيم فقط، ونبقي الهمزات والحروف كما هي */
    function norm(s) { return s.replace(/[ً-ْٰـ]/g, '').replace(/ی/g, 'ي').replace(/ک/g, 'ك')
      .replace(/[.،,؛;؟?!:«»"'()\-–]/g, ' ').replace(/\s+/g, ' ').trim(); }
    var ans = d.getAttribute('data-ans'), inp = d.querySelector('input'), fb = d.querySelector('.fb'), wr = d.classList.contains('wr');
    function go() {
      fb.innerHTML = '';
      if (!norm(inp.value)) { fb.className = 'fb'; fb.textContent = 'اكتب جوابك في الخانة أوّلاً.'; inp.focus(); return; }
      var ok = norm(inp.value) === norm(ans); fb.className = 'fb ' + (ok ? 'ok' : 'bad');
      if (ok) { line(fb, 'fv', 'أحسنت!', wr ? 'جواب صحيح.' : 'كتابة صحيحة.'); return; }
      line(fb, 'fv', wr ? 'إجابتك غير صحيحة.' : 'في الكتابة خطأ.', 'كتبتَ «' + inp.value.trim() + '»، والصواب: «' + ans + '».');
      line(fb, 'fr', 'نصيحة:', wr ? 'قارن جوابك بالصواب حرفاً حرفاً، ثمّ أعد كتابته.' : 'استمع مرّة أخرى، وانتبه إلى الحروف المتشابهة والهمزة والتاء.');
    }
    d.querySelector('.chk').onclick = go; inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  });

  /* تبويبات صفحة الوحدة */
  var tabs = document.querySelector('.tabs');
  if (tabs) {
    var btns = [].slice.call(tabs.querySelectorAll('[role="tab"]'));
    function show(id, focus) {
      btns.forEach(function (b) {
        var on = b.getAttribute('aria-controls') === id;
        b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
        g(b.getAttribute('aria-controls')).hidden = !on;
        if (on && focus) b.focus();
      });
      try { history.replaceState(null, '', '#' + id); } catch (e) {}
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { show(b.getAttribute('aria-controls')); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, n = btns.length, j = -1;
        if (k === 'ArrowLeft') j = (i + 1) % n; else if (k === 'ArrowRight') j = (i - 1 + n) % n;
        else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1;
        if (j >= 0) { e.preventDefault(); show(btns[j].getAttribute('aria-controls'), true); }
      });
    });
    var h = (location.hash || '').slice(1);
    show(btns.some(function (b) { return b.getAttribute('aria-controls') === h; }) ? h : btns[0].getAttribute('aria-controls'));
  }
})();

/* زرّ الرجوع: يعود إلى الصفحة السابقة نفسها (مع القسم المختار) إن جاء منها الزائر */
(function () {
  var bk = document.querySelector('.bar a.back'); if (!bk) return;
  bk.addEventListener('click', function (e) {
    try {
      var r = document.referrer ? new URL(document.referrer) : null, t = new URL(bk.getAttribute('href'), location.href);
      if (r && r.origin === location.origin && r.pathname === t.pathname && history.length > 1) { e.preventDefault(); history.back(); }
    } catch (x) {}
  });
})();

/* الهاتف: حين يظهر لوحة المفاتيح نُبقي خانة الكتابة ظاهرة */
(function () {
  document.querySelectorAll('.dict input').forEach(function (i) {
    i.addEventListener('focus', function () { setTimeout(function () { try { i.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} }, 320); });
  });
})();
