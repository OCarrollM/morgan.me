// Spotify "now playing" backend — zero dependencies, Node 18+ (built-in fetch).
// Holds your Spotify secrets server-side and returns the JSON shape your page expects.

const http = require('http');

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN,
  ALLOW_ORIGIN = '*',
  PORT = '8080',
} = process.env;

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';

// In-memory access-token cache. Spotify access tokens last ~1h; we refresh early.
let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 30_000) return cachedToken;

  const basic = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

async function getNowPlaying() {
  const token = await getAccessToken();
  const res = await fetch(NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // 204 = nothing playing. Any error = fail soft to "offline".
  if (res.status === 204 || !res.ok) return { isPlaying: false };

  const text = await res.text();
  if (!text) return { isPlaying: false };

  const song = JSON.parse(text);
  const item = song && song.item;
  if (!item) return { isPlaying: false }; // ads / private session / podcast w/o item

  return {
    isPlaying: song.is_playing === true,
    title: item.name,
    artist: (item.artists || []).map((a) => a.name).join(', '),
    album: item.album ? item.album.name : '',
    albumArt: item.album?.images?.[0]?.url || '',
    songUrl: item.external_urls?.spotify || '',
    progressMs: song.progress_ms || 0,
    durationMs: item.duration_ms || 0,
  };
}

const server = http.createServer(async (req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    return res.end();
  }

  // Health endpoint for k8s liveness/readiness probes.
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('ok');
  }

  try {
    const payload = await getNowPlaying();
    res.writeHead(200, {
      ...cors,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify(payload));
  } catch (err) {
    console.error(err);
    // Fail soft so the widget shows "offline" rather than erroring.
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ isPlaying: false }));
  }
});

// Fail fast on startup if secrets are missing.
const missing = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REFRESH_TOKEN']
  .filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

server.listen(Number(PORT), () => {
  console.log(`now-playing listening on :${PORT}`);
});