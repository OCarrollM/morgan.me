/* morgan.me — MSN portal edition behaviour */
document.addEventListener('DOMContentLoaded', function () {
  var now = new Date();
  var daysFull = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var monthsFull = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // long date (MSN style)
  var datebar = document.getElementById('datebar');
  if (datebar) datebar.textContent = daysFull[now.getDay()] + ', ' + monthsFull[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();

  // year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = now.getFullYear();

  // visitor number / hits
  var stored = parseInt(localStorage.getItem('msn_visits') || '0', 10);
  if (!stored) stored = 48213 + Math.floor(Math.random() * 900);
  stored += 1;
  localStorage.setItem('msn_visits', String(stored));
  var padded = String(stored).padStart(6, '0');
  var visnum = document.getElementById('visnum'); if (visnum) visnum.textContent = padded;
  var hits = document.getElementById('hits'); if (hits) hits.textContent = padded;

  // smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var el = document.querySelector(id);
        if (el) { e.preventDefault(); window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 10, behavior: 'smooth' }); }
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
      var d = new Date();
      var datestr = d.getDate() + ' ' + monthsShort[d.getMonth()] + ' ' + d.getFullYear();
      var el = document.createElement('div');
      el.className = 'gb-entry';
      el.style.cssText = 'background:#fff7d6;border:1px solid #dfe5ea;padding:8px 10px;';
      el.innerHTML = '<div style="display:flex;justify-content:space-between;font-size:10px;"><span style="font-weight:bold;color:#0b4ea2;"></span><span style="color:#8a97a4;"></span></div><div style="font-size:11px;color:#4a5563;margin-top:3px;"></div>';
      var spans = el.querySelectorAll('span');
      spans[0].textContent = name;
      spans[1].textContent = datestr;
      el.querySelector('div:last-child').textContent = msg;
      entries.insertBefore(el, entries.firstChild);
      nm.value = ''; ms.value = '';
      setTimeout(function () { el.style.transition = 'background .8s'; el.style.background = '#f4f7fa'; }, 60);
      return false;
    });
  }
});
