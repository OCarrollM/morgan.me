/* =================================================================
   morgan.me — Widgets behaviour
   1. Spotify now-playing  — set SPOTIFY_ENDPOINT to your backend URL.
   2. Space widget        — next launch + ISS position (public APIs).
   ================================================================= */
(function () {
  'use strict';

  /* ============================================================
     1) SPOTIFY NOW PLAYING
     ------------------------------------------------------------
     This page CANNOT talk to Spotify directly (it needs a secret
     token). Point SPOTIFY_ENDPOINT at a tiny backend of yours that
     returns JSON like:
       { "isPlaying": true, "title": "...", "artist": "...",
         "albumArt": "https://...", "songUrl": "https://...",
         "progressMs": 42000, "durationMs": 197000 }
     Until then it shows a friendly fallback.
     ============================================================ */
  var SPOTIFY_ENDPOINT = ''; // e.g. 'https://your-worker.workers.dev/now-playing'

  function fmt(ms) {
    if (ms == null) return '0:00';
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function renderNP(d) {
    var titleEl  = document.getElementById('np-title');
    var artistEl = document.getElementById('np-artist');
    var stateEl  = document.getElementById('np-state');
    var dotEl    = document.getElementById('np-dot');
    var artEl    = document.getElementById('np-art');
    var fillEl   = document.getElementById('np-fill');
    var curEl    = document.getElementById('np-cur');
    var durEl    = document.getElementById('np-dur');
    if (!titleEl) return;

    if (!d || !d.isPlaying) {
      titleEl.querySelector('.scroll').textContent = (d && d.title) ? d.title : 'Nothing playing right now';
      artistEl.textContent = (d && d.artist) ? d.artist : 'check back when I\u2019m at the keyboard';
      stateEl.textContent = 'Offline';
      dotEl.classList.add('off');
      if (fillEl) fillEl.style.width = '0%';
      if (curEl) curEl.textContent = '0:00';
      if (durEl) durEl.textContent = '0:00';
      if (artEl) { artEl.style.backgroundImage = 'none'; artEl.textContent = '\u266B'; }
      return;
    }

    var t = titleEl.querySelector('.scroll');
    t.textContent = d.title || 'Unknown track';
    // marquee only if it overflows
    setTimeout(function () {
      titleEl.classList.toggle('is-long', t.scrollWidth > titleEl.clientWidth + 4);
    }, 30);
    artistEl.textContent = d.artist || '';
    stateEl.textContent = 'Now Playing';
    dotEl.classList.remove('off');
    if (artEl) {
      if (d.albumArt) { artEl.style.backgroundImage = 'url("' + d.albumArt + '")'; artEl.textContent = ''; }
      else { artEl.style.backgroundImage = 'none'; artEl.textContent = '\u266B'; }
    }
    if (d.songUrl && titleEl.parentElement) {
      titleEl.parentElement.style.cursor = 'pointer';
      titleEl.parentElement.onclick = function () { window.open(d.songUrl, '_blank'); };
    }
    if (fillEl && d.durationMs) fillEl.style.width = Math.min(100, (d.progressMs / d.durationMs) * 100) + '%';
    if (curEl) curEl.textContent = fmt(d.progressMs);
    if (durEl) durEl.textContent = fmt(d.durationMs);
  }

  function pollSpotify() {
    if (!SPOTIFY_ENDPOINT) { renderNP(null); return; }
    fetch(SPOTIFY_ENDPOINT, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(renderNP)
      .catch(function () { renderNP(null); });
  }

  var NASA_KEY = 'Qrx9jBj8i86X6DfUpMOSlsaLEN1cv2abITZsqm6p';

  function loadAPOD() {
    var imgEl   = document.getElementById('apod-img');
    var titleEl = document.getElementById('apod-title');
    var linkEl  = document.getElementById('apod-link');
    fetch('https://api.nasa.gov/planetary/apod?thumbs=true&api_key=' + NASA_KEY)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (titleEl) titleEl.textContent = d.title || 'Astronomy Picture of the Day';
        var src = d.media_type === 'image' ? d.url : (d.thumbnail_url || '');
        if (imgEl) {
          if (src) {
            imgEl.style.backgroundImage = 'url("' + src + '")';
            imgEl.classList.remove('apod-empty');
            imgEl.textContent = '';
          } else {
            imgEl.classList.add('apod-empty');
            imgEl.textContent = '\uD83D\uDCF9';   // video day, no thumb
          }
        }
        if (linkEl) linkEl.href = (d.media_type === 'image' ? (d.hdurl || d.url) : d.url) || 'https://apod.nasa.gov/apod/';
      })
      .catch(function () {
        if (titleEl) titleEl.textContent = 'Couldn\u2019t reach NASA today';
        if (imgEl) { imgEl.classList.add('apod-empty'); imgEl.textContent = '\uD83D\uDE80'; }
      });
  }

  function loadISS() {
    var el = document.getElementById('space-iss-pos');
    if (!el) return;
    fetch('https://api.wheretheiss.at/v1/satellites/25544')
      .then(function (r) { return r.json(); })
      .then(function (p) {
        var lat = p.latitude.toFixed(1), lon = p.longitude.toFixed(1);
        var ns = p.latitude >= 0 ? 'N' : 'S', ew = p.longitude >= 0 ? 'E' : 'W';
        el.innerHTML = '<b>' + Math.abs(lat) + '\u00b0' + ns + ', ' + Math.abs(lon) + '\u00b0' + ew + '</b> &middot; ' + Math.round(p.velocity).toLocaleString() + ' km/h';
      })
      .catch(function () { el.textContent = 'position unavailable'; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Spotify
    renderNP(null);
    pollSpotify();
    setInterval(pollSpotify, 30000); // refresh every 30s

    // Space
    loadAPOD();
    loadISS();
    setInterval(loadISS, 20000);     // ISS moves fast — refresh often
    setInterval(loadAPOD, 3600000);  // APOD changes once a day — hourly recheck is plenty
  });
})();
