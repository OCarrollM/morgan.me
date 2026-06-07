/* morgan.me — IE6 edition behaviour */
document.addEventListener('DOMContentLoaded', function () {
  var now = new Date();
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // dates
  var lastupd = document.getElementById('lastupd');
  if (lastupd) lastupd.textContent = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = now.getFullYear();

  // uptime (age, born 2001)
  var uptime = document.getElementById('uptime');
  if (uptime) uptime.textContent = now.getFullYear() - 2001;

  // online now
  var online = document.getElementById('online');
  if (online) online.textContent = Math.floor(Math.random() * 7) + 2;

  // visitor number in preheader
  var stored = parseInt(localStorage.getItem('ie6_visits') || '0', 10);
  if (!stored) stored = 48213 + Math.floor(Math.random() * 900);
  stored += 1;
  localStorage.setItem('ie6_visits', String(stored));
  var visnum = document.getElementById('visnum');
  if (visnum) visnum.textContent = String(stored).padStart(6, '0');
  var hits = document.getElementById('hits');
  if (hits) hits.textContent = String(stored).padStart(6, '0');

  // odometer counter with spin
  var target = String(stored).padStart(6, '0').split('');
  var digits = document.querySelectorAll('#counter .d');
  digits.forEach(function (d, i) {
    var steps = 8 + i * 3, c = 0;
    var iv = setInterval(function () {
      d.textContent = Math.floor(Math.random() * 10);
      if (++c >= steps) { clearInterval(iv); d.textContent = target[i]; }
    }, 55);
  });

  // smooth-scroll for in-page nav
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var el = document.querySelector(id);
        if (el) { e.preventDefault(); window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 12, behavior: 'smooth' }); }
      }
    });
  });

  // guestbook
  var form = document.getElementById('gbform');
  if (form) {
    form.addEventListener('submit', function () {
      var nm = document.getElementById('gbname');
      var ms = document.getElementById('gbmsg');
      var name = (nm.value || '').trim() || 'AnonymousVisitor';
      var msg = (ms.value || '').trim();
      if (!msg) { ms.focus(); return false; }
      var entries = document.getElementById('gbentries');
      var el = document.createElement('div');
      el.className = 'gb-entry';
      var d = new Date();
      var datestr = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
      el.innerHTML = '<div class="gb-entry-top"><span class="gb-entry-name"></span><span class="gb-entry-date"></span></div><div class="gb-entry-msg"></div>';
      el.querySelector('.gb-entry-name').textContent = name;
      el.querySelector('.gb-entry-date').textContent = datestr;
      el.querySelector('.gb-entry-msg').textContent = msg;
      entries.insertBefore(el, entries.firstChild);
      nm.value = ''; ms.value = '';
      el.style.background = '#fff7d6';
      setTimeout(function () { el.style.transition = 'background .8s'; el.style.background = '#f4f7fa'; }, 60);
      return false;
    });
  }
});
