/* =================================================================
   morgan.me — Blog index + compose/edit editor
   Requires blog-api.js loaded first.
   ================================================================= */
(function () {
  'use strict';
  var API = window.BlogAPI;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var allPosts = [];
  var activeTag = null, activeArchive = null;
  var editingId = null;

  /* ----------------- render helpers ----------------- */
  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function renderList() {
    var host = $('#post-list');
    if (!host) return;
    var posts = allPosts.slice();
    if (activeTag) posts = posts.filter(function (p) { return (p.tags || []).indexOf(activeTag) !== -1; });
    if (activeArchive) posts = posts.filter(function (p) { return archiveKey(p.createdAt) === activeArchive; });

    // filter banner
    var banner = $('#filter-banner');
    if (activeTag || activeArchive) {
      banner.classList.add('on');
      $('#filter-label').textContent = activeTag ? ('tag: ' + activeTag) : activeArchive;
    } else { banner.classList.remove('on'); }

    if (!posts.length) {
      host.innerHTML = '';
      $('#empty-state').style.display = 'block';
      return;
    }
    $('#empty-state').style.display = 'none';

    var admin = API.isAdmin();
    host.innerHTML = posts.map(function (p) {
      var img = (p.images && p.images[0]) ? '<div class="post-thumb" style="background-image:url(\'' + p.images[0] + '\')"></div>' : '';
      var tags = (p.tags || []).map(function (t) {
        return '<a class="tag-chip" href="?tag=' + encodeURIComponent(t) + '">' + API.escapeHtml(t) + '</a>';
      }).join('');
      var url = 'post.html?id=' + encodeURIComponent(p.slug || p.id);
      var adminRow = admin ? (
        '<div class="post-admin-row"><a href="#" data-edit="' + p.id + '">&#9998; Edit</a>' +
        '<a href="#" class="del" data-del="' + p.id + '">&#10005; Delete</a></div>') : '';
      return '<article class="post">' +
        img +
        '<div class="post-title"><a href="' + url + '">' + API.escapeHtml(p.title) + '</a></div>' +
        '<div class="post-meta">Posted ' + API.fmtDate(p.createdAt) + ' &middot; by Morgan</div>' +
        '<p class="post-excerpt">' + API.escapeHtml(p.excerpt || API.excerptFrom(p.contentHtml)) + '</p>' +
        '<div class="post-more"><a href="' + url + '">Read more &raquo;</a></div>' +
        (tags ? '<div class="post-tags">' + tags + '</div>' : '') +
        adminRow +
      '</article>';
    }).join('');
  }

  function archiveKey(iso) {
    var d = new Date(iso);
    return API.MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function renderArchive() {
    var host = $('#archive-list');
    if (!host) return;
    var counts = {};
    allPosts.forEach(function (p) { var k = archiveKey(p.createdAt); counts[k] = (counts[k] || 0) + 1; });
    var keys = Object.keys(counts).sort(function (a, b) { return new Date('1 ' + b) - new Date('1 ' + a); });
    if (!keys.length) { host.innerHTML = '<li style="color:#8a97a4;font-size:10px;">No posts yet</li>'; return; }
    host.innerHTML = keys.map(function (k) {
      var on = activeArchive === k ? ' class="on"' : '';
      return '<li><a href="?archive=' + encodeURIComponent(k) + '"' + on + '>' + k + '<span class="count">(' + counts[k] + ')</span></a></li>';
    }).join('');
  }

  function renderTags() {
    var host = $('#tag-list');
    if (!host) return;
    var set = {};
    allPosts.forEach(function (p) { (p.tags || []).forEach(function (t) { set[t] = (set[t] || 0) + 1; }); });
    var keys = Object.keys(set).sort();
    if (!keys.length) { host.innerHTML = '<li style="color:#8a97a4;font-size:10px;">None yet</li>'; return; }
    host.innerHTML = keys.map(function (t) {
      var on = activeTag === t ? ' class="on"' : '';
      return '<li><a href="?tag=' + encodeURIComponent(t) + '"' + on + '>' + API.escapeHtml(t) + '<span class="count">(' + set[t] + ')</span></a></li>';
    }).join('');
  }

  /* ----------------- admin UI ----------------- */
  function renderAdminBar() {
    var bar = $('#admin-bar');
    if (!bar) return;
    if (API.isAdmin()) {
      bar.style.display = 'flex';
      $('#admin-login').style.display = 'none';
    } else {
      bar.style.display = 'none';
    }
  }

  function wireAdmin() {
    var key = $('#admin-key');
    if (key) key.addEventListener('click', function (e) {
      e.preventDefault();
      var box = $('#admin-login');
      box.style.display = box.style.display === 'block' ? 'none' : 'block';
      var inp = $('#admin-pass'); if (inp) inp.focus();
    });

    var loginBtn = $('#do-login');
    if (loginBtn) loginBtn.addEventListener('click', async function () {
      var pass = $('#admin-pass').value;
      var err = $('#login-err');
      err.style.display = 'none';
      if (!API.configured()) { err.textContent = 'Backend not configured yet (set API_BASE in blog-api.js).'; err.style.display = 'block'; return; }
      try {
        await API.login(pass);
        $('#admin-login').style.display = 'none';
        renderAdminBar(); renderList();
      } catch (e) { err.textContent = 'Wrong passphrase. Try again.'; err.style.display = 'block'; }
    });
    var passInp = $('#admin-pass');
    if (passInp) passInp.addEventListener('keydown', function (e) { if (e.key === 'Enter') loginBtn.click(); });

    var logoutBtn = $('#do-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', function () { API.logout(); renderAdminBar(); renderList(); });

    var newBtn = $('#new-post');
    if (newBtn) newBtn.addEventListener('click', function () { openCompose(null); });

    // delegated edit/delete on the list
    var list = $('#post-list');
    if (list) list.addEventListener('click', async function (e) {
      var ed = e.target.closest('[data-edit]');
      var dl = e.target.closest('[data-del]');
      if (ed) { e.preventDefault(); var p = byId(ed.getAttribute('data-edit')); if (p) openCompose(p); }
      if (dl) {
        e.preventDefault();
        var id = dl.getAttribute('data-del');
        if (confirm('Delete this post? This cannot be undone.')) {
          try { await API.deletePost(id); allPosts = allPosts.filter(function (p) { return p.id !== id; }); refreshAll(); }
          catch (err) { alert('Could not delete (are you still logged in?).'); }
        }
      }
    });
  }

  function byId(id) { for (var i = 0; i < allPosts.length; i++) if (allPosts[i].id === id) return allPosts[i]; return null; }

  /* ----------------- compose / edit ----------------- */
  function openCompose(post) {
    editingId = post ? post.id : null;
    $('#compose-title-bar').textContent = post ? 'Edit post' : 'New post';
    $('#f-title').value = post ? (post.title || '') : '';
    $('#f-tags').value = post ? ((post.tags || []).join(', ')) : '';
    $('#rt-editor').innerHTML = post ? (post.contentHtml || '') : '';
    setStatus('', false);
    $('#compose-overlay').classList.add('on');
    $('#f-title').focus();
  }
  function closeCompose() { $('#compose-overlay').classList.remove('on'); editingId = null; }

  function setStatus(msg, isErr) {
    var s = $('#compose-status');
    s.textContent = msg; s.className = 'status' + (isErr ? ' err' : '');
  }

  function exec(cmd, val) { document.execCommand(cmd, false, val || null); $('#rt-editor').focus(); }

  function wireToolbar() {
    var tb = $('#rt-toolbar');
    if (!tb) return;
    tb.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      e.preventDefault();
      var cmd = b.getAttribute('data-cmd');
      if (cmd === 'createLink') {
        var url = prompt('Link URL:', 'https://'); if (url) exec('createLink', url);
      } else if (cmd === 'formatBlock') {
        exec('formatBlock', b.getAttribute('data-val'));
      } else if (cmd === 'image-url') {
        var u = prompt('Image URL:', 'https://'); if (u) insertImage(u);
      } else if (cmd === 'image-file') {
        $('#img-file').click();
      } else {
        exec(cmd);
      }
    });

    var fileInp = $('#img-file');
    if (fileInp) fileInp.addEventListener('change', async function () {
      var f = fileInp.files[0]; if (!f) return;
      setStatus('Uploading image\u2026', false);
      try { var url = await API.uploadImage(f); insertImage(url); setStatus('', false); }
      catch (err) { setStatus(err.message === 'unauthorized' ? 'Not authorised \u2014 log in again.' : 'Image upload failed.', true); }
      fileInp.value = '';
    });
  }

  function insertImage(url) {
    $('#rt-editor').focus();
    document.execCommand('insertHTML', false, '<img src="' + url + '" alt="">');
  }

  function collectImages(html) {
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    return [].map.call(tmp.querySelectorAll('img'), function (i) { return i.getAttribute('src'); }).filter(Boolean);
  }

  function wireCompose() {
    var ov = $('#compose-overlay');
    if (!ov) return;
    $('#compose-cancel').addEventListener('click', closeCompose);
    $('#compose-x').addEventListener('click', closeCompose);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeCompose(); });

    $('#compose-save').addEventListener('click', async function () {
      var title = $('#f-title').value.trim();
      var html = $('#rt-editor').innerHTML.trim();
      if (!title) { setStatus('Give it a title first.', true); return; }
      if (!html || html === '<br>') { setStatus('Write something first.', true); return; }
      var tags = $('#f-tags').value.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
      var post = {
        title: title,
        slug: API.slugify(title),
        tags: tags,
        contentHtml: html,
        excerpt: API.excerptFrom(html),
        images: collectImages(html),
      };
      var btn = $('#compose-save'); btn.disabled = true; setStatus('Saving\u2026', false);
      try {
        var saved = editingId ? await API.updatePost(editingId, post) : await API.createPost(post);
        // merge into local list
        if (editingId) { allPosts = allPosts.map(function (p) { return p.id === editingId ? saved : p; }); }
        else { allPosts.unshift(saved); }
        closeCompose(); refreshAll();
      } catch (err) {
        setStatus(err.message === 'unauthorized' ? 'Session expired \u2014 log in again.' : 'Could not save. Is the backend running?', true);
      } finally { btn.disabled = false; }
    });
  }

  function refreshAll() { renderList(); renderArchive(); renderTags(); }

  /* ----------------- boot ----------------- */
  async function boot() {
    activeTag = qs('tag');
    activeArchive = qs('archive');
    wireAdmin(); wireToolbar(); wireCompose(); renderAdminBar();

    var host = $('#post-list');
    if (!API.configured()) {
      host.innerHTML = '';
      $('#empty-state').style.display = 'none';
      $('#error-state').style.display = 'block';
      renderArchive(); renderTags();
      return;
    }
    // loading
    $('#loading-state').style.display = 'block';
    try {
      allPosts = await API.listPosts();
      $('#loading-state').style.display = 'none';
      refreshAll();
      var editId = qs('edit');
      if (editId && API.isAdmin()) { var p = byId(editId); if (p) openCompose(p); }
    } catch (e) {
      $('#loading-state').style.display = 'none';
      $('#error-state').style.display = 'block';
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
