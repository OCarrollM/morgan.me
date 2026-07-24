/* =================================================================
   morgan.me — Blog API helper (shared by blog.js + post.js)
   Talks to your backend (see blog-backend/). Set API_BASE below to
   your deployed URL, e.g. 'https://api.morgan.me'.
   ================================================================= */
window.BlogAPI = (function () {
  'use strict';

  // ----- CONFIGURE ME (once your backend is deployed) -----
  var API_BASE = 'https://blog-api.morganoc.me'; // e.g. 'https://api.morgan.me'  (no trailing slash)

  var TOKEN_KEY = 'blog_admin_token';

  function base() { return (API_BASE || '').replace(/\/$/, ''); }
  function token() { try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } }
  function isAdmin() { return !!token(); }
  function setToken(t) { try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY); } catch (e) {} }

  function authHeaders(extra) {
    var h = extra || {};
    var t = token();
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  }

  function configured() { return !!base(); }

  // ----- auth -----
  async function login(password) {
    var res = await fetch(base() + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password }),
    });
    if (!res.ok) throw new Error('bad-password');
    var data = await res.json();
    setToken(data.token);
    return true;
  }
  function logout() { setToken(''); }

  // ----- posts -----
  async function listPosts() {
    var res = await fetch(base() + '/api/posts', { cache: 'no-store' });
    if (!res.ok) throw new Error('fetch-failed');
    return res.json(); // -> array, newest first (server sorts)
  }

  async function getPost(id) {
    var res = await fetch(base() + '/api/posts/' + encodeURIComponent(id), { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('fetch-failed');
    return res.json();
  }

  async function createPost(post) {
    var res = await fetch(base() + '/api/posts', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(post),
    });
    if (res.status === 401) throw new Error('unauthorized');
    if (!res.ok) throw new Error('save-failed');
    return res.json();
  }

  async function updatePost(id, post) {
    var res = await fetch(base() + '/api/posts/' + encodeURIComponent(id), {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(post),
    });
    if (res.status === 401) throw new Error('unauthorized');
    if (!res.ok) throw new Error('save-failed');
    return res.json();
  }

  async function deletePost(id) {
    var res = await fetch(base() + '/api/posts/' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.status === 401) throw new Error('unauthorized');
    if (!res.ok) throw new Error('delete-failed');
    return true;
  }

  // ----- image upload (multipart) -> { url } -----
  async function uploadImage(file) {
    var fd = new FormData();
    fd.append('image', file);
    var res = await fetch(base() + '/api/upload', {
      method: 'POST',
      headers: authHeaders(), // don't set Content-Type; browser sets multipart boundary
      body: fd,
    });
    if (res.status === 401) throw new Error('unauthorized');
    if (!res.ok) throw new Error('upload-failed');
    var data = await res.json();
    // server may return a relative path; make it absolute
    if (data.url && data.url.charAt(0) === '/') data.url = base() + data.url;
    return data.url;
  }

  // ----- helpers -----
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()] + ' ' + d.getFullYear();
  }
  function fmtDateTime(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' \u00b7 ' + hh + ':' + mm;
  }

  function slugify(s) {
    return (s || '').toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60) || 'post';
  }

  // strip tags -> plain text excerpt
  function excerptFrom(html, n) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    var text = (tmp.textContent || '').replace(/\s+/g, ' ').trim();
    n = n || 220;
    return text.length > n ? text.slice(0, n).replace(/\s+\S*$/, '') + '\u2026' : text;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  return {
    configured: configured, isAdmin: isAdmin,
    login: login, logout: logout,
    listPosts: listPosts, getPost: getPost,
    createPost: createPost, updatePost: updatePost, deletePost: deletePost,
    uploadImage: uploadImage,
    fmtDate: fmtDate, fmtDateTime: fmtDateTime,
    slugify: slugify, excerptFrom: excerptFrom, escapeHtml: escapeHtml,
    MONTHS: MONTHS,
  };
})();
