/* =================================================================
   morgan.me — Single blog post page
   Requires blog-api.js. Reads ?id=<slug|id> from the URL.
   ================================================================= */
(function () {
  'use strict';
  var API = window.BlogAPI;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  function id() { return new URLSearchParams(location.search).get('id'); }

  function show(stateId) {
    ['loading-state', 'error-state', 'notfound-state', 'post-full'].forEach(function (s) {
      var el = document.getElementById(s); if (el) el.style.display = (s === stateId ? 'block' : 'none');
    });
  }

  function render(p) {
    document.title = 'morgan.me :: ' + p.title;
    $('#pf-title').textContent = p.title;
    $('#pf-crumb').textContent = p.title;
    $('#pf-byline').innerHTML = 'Posted <b>' + API.fmtDateTime(p.createdAt) + '</b> by Morgan' +
      (p.updatedAt && p.updatedAt !== p.createdAt ? ' &middot; updated ' + API.fmtDate(p.updatedAt) : '');
    // tags
    var tw = $('#pf-tags');
    if (p.tags && p.tags.length) {
      tw.innerHTML = p.tags.map(function (t) {
        return '<a class="tag-chip" href="blog.html?tag=' + encodeURIComponent(t) + '">' + API.escapeHtml(t) + '</a>';
      }).join('');
    } else { tw.style.display = 'none'; }
    // body (admin-authored HTML)
    $('#pf-body').innerHTML = p.contentHtml || '';

    // admin controls
    if (API.isAdmin()) {
      var row = $('#pf-admin'); row.style.display = 'flex';
      $('#pf-edit').href = 'blog.html?edit=' + encodeURIComponent(p.id);
      $('#pf-del').addEventListener('click', async function (e) {
        e.preventDefault();
        if (confirm('Delete this post?')) {
          try { await API.deletePost(p.id); location.href = 'blog.html'; }
          catch (err) { alert('Could not delete (are you logged in?).'); }
        }
      });
    }
    show('post-full');
  }

  async function boot() {
    if (!API.configured()) { show('error-state'); return; }
    var key = id();
    if (!key) { show('notfound-state'); return; }
    show('loading-state');
    try {
      var p = await API.getPost(key);
      if (!p) { show('notfound-state'); return; }
      render(p);
    } catch (e) { show('error-state'); }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
