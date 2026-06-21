// One-time, runs on your laptop. Gets the long-lived REFRESH TOKEN.
// Usage:
//   export SPOTIFY_CLIENT_ID="..."      (Windows: set SPOTIFY_CLIENT_ID=...)
//   export SPOTIFY_CLIENT_SECRET="..."
//   node get-token.js
// Then click "Agree" in the browser tab that opens.

const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:8888/callback';
const SCOPES = 'user-read-currently-playing user-read-playback-state';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
  process.exit(1);
}

const state = crypto.randomBytes(8).toString('hex');
const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
  }).toString();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:8888');
  if (url.pathname !== '/callback') {
    res.writeHead(404);
    return res.end();
  }

  const code = url.searchParams.get('code');
  if (!code || url.searchParams.get('state') !== state) {
    res.writeHead(400);
    return res.end('Missing code or state mismatch. Re-run the script.');
  }

  try {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await tokenRes.json();
    if (!data.refresh_token) {
      res.writeHead(500);
      res.end('No refresh token returned — check the terminal.');
      console.error(data);
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h2>Done. Close this tab and return to the terminal.</h2>');

    console.log('\n==============  YOUR REFRESH TOKEN  ==============\n');
    console.log(data.refresh_token);
    console.log('\n=================================================\n');
    console.log('This is SPOTIFY_REFRESH_TOKEN. Copy it, then press Ctrl+C.');
  } catch (e) {
    res.writeHead(500);
    res.end('Error — check the terminal.');
    console.error(e);
  }
});

server.listen(8888, '127.0.0.1', () => {
  console.log('\nOpen this URL and click Agree (it should open automatically):\n');
  console.log(authUrl + '\n');
  const opener =
    process.platform === 'darwin' ? 'open' :
    process.platform === 'win32' ? 'start ""' : 'xdg-open';
  exec(`${opener} "${authUrl}"`, () => {});
});