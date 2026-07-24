// Blog backend on Cloudflare Workers + D1.
// Implements the same API contract your front-end (blog-api.js) already expects.
//
// Bindings/secrets (see wrangler.toml + `wrangler secret put`):
//   DB              - D1 database binding
//   ADMIN_PASSWORD  - secret, your posting passphrase
//   TOKEN_SECRET    - secret, random string used to sign session tokens
//   ALLOW_ORIGIN    - var, your site origin (e.g. https://morganoc.me)

const TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12h sessions

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const method = request.method;

    if (method === 'OPTIONS') return corsPreflight(env);

    try {
      // ---- public reads ------------------------------------------------
      if (method === 'GET' && path === '/api/posts') {
        return json(await listPosts(env, url.searchParams.get('tag')), env);
      }

      if (method === 'GET' && path.startsWith('/api/posts/')) {
        const key = decodeURIComponent(path.slice('/api/posts/'.length));
        const post = await getPost(env, key);
        if (!post) return json({ error: 'Not found' }, env, 404);
        return json(post, env);
      }

      // ---- login -------------------------------------------------------
      if (method === 'POST' && path === '/api/login') {
        const { password } = await safeJson(request);
        if (!password || !(await constantTimeEqual(password, env.ADMIN_PASSWORD))) {
          // Same response shape + timing regardless of which part failed.
          return json({ error: 'Invalid password' }, env, 401);
        }
        return json({ token: await signToken(env) }, env);
      }

      // ---- everything below requires a valid token ---------------------
      const authed = await verifyBearer(request, env);
      if (!authed) return json({ error: 'Unauthorized' }, env, 401);

      if (method === 'POST' && path === '/api/posts') {
        return json(await createPost(env, await safeJson(request)), env, 201);
      }

      if (method === 'PUT' && path.startsWith('/api/posts/')) {
        const id = Number(path.slice('/api/posts/'.length));
        const updated = await updatePost(env, id, await safeJson(request));
        if (!updated) return json({ error: 'Not found' }, env, 404);
        return json(updated, env);
      }

      if (method === 'DELETE' && path.startsWith('/api/posts/')) {
        const id = Number(path.slice('/api/posts/'.length));
        await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
        return json({ ok: true }, env);
      }

      if (method === 'POST' && path === '/api/upload') {
        // Phase 2. Wire up R2 here (see notes in DEPLOY-BLOG.md).
        return json(
          { error: 'Image upload not enabled yet. Use an image URL for now.' },
          env,
          501
        );
      }

      return json({ error: 'Not found' }, env, 404);
    } catch (err) {
      return json({ error: 'Server error' }, env, 500);
    }
  },
};

// ---------------------------------------------------------------- queries

async function listPosts(env, tag) {
  let sql =
    'SELECT id, slug, title, excerpt, tags, images, created_at, updated_at FROM posts WHERE published = 1';
  const binds = [];
  if (tag) {
    // tags is a JSON array string; match the quoted tag inside it.
    sql += ' AND tags LIKE ?';
    binds.push(`%"${tag}"%`);
  }
  sql += ' ORDER BY created_at DESC';

  const { results } = await env.DB.prepare(sql).bind(...binds).all();
  return (results || []).map(shape);
}

async function getPost(env, key) {
  // Accept either numeric id or slug.
  const byId = /^\d+$/.test(key);
  const row = await env.DB.prepare(
    `SELECT * FROM posts WHERE ${byId ? 'id' : 'slug'} = ?`
  )
    .bind(byId ? Number(key) : key)
    .first();
  return row ? shape(row) : null;
}

async function createPost(env, data) {
  const now = new Date().toISOString();
  const title = (data.title || 'Untitled').trim();
  const slug = await uniqueSlug(env, data.slug || slugify(title));
  // Front-end sends the body as `contentHtml`; accept `body` as a fallback.
  const body = data.contentHtml ?? data.body ?? '';

  const res = await env.DB.prepare(
    `INSERT INTO posts (slug, title, body, excerpt, tags, images, published, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      slug,
      title,
      body,
      data.excerpt || '',
      JSON.stringify(Array.isArray(data.tags) ? data.tags : []),
      JSON.stringify(Array.isArray(data.images) ? data.images : []),
      data.published === false ? 0 : 1,
      now,
      now
    )
    .run();

  return await getPost(env, String(res.meta.last_row_id));
}

async function updatePost(env, id, data) {
  const existing = await env.DB.prepare('SELECT * FROM posts WHERE id = ?')
    .bind(id)
    .first();
  if (!existing) return null;

  const body = data.contentHtml ?? data.body ?? existing.body;

  await env.DB.prepare(
    `UPDATE posts SET title = ?, body = ?, excerpt = ?, tags = ?, images = ?, published = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(
      data.title ?? existing.title,
      body,
      data.excerpt ?? existing.excerpt,
      data.tags ? JSON.stringify(data.tags) : existing.tags,
      data.images ? JSON.stringify(data.images) : (existing.images || '[]'),
      data.published === false ? 0 : 1,
      new Date().toISOString(),
      id
    )
    .run();

  return await getPost(env, String(id));
}

// ------------------------------------------------------------------ utils

function shape(row) {
  let tags = [];
  let images = [];
  try { tags = JSON.parse(row.tags || '[]'); } catch { tags = []; }
  try { images = JSON.parse(row.images || '[]'); } catch { images = []; }
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    // body is only present on single-post SELECT * (not the list query)
    contentHtml: row.body,      // front-end reads p.contentHtml
    tags,
    images,
    published: row.published === 1,
    createdAt: row.created_at,   // front-end reads p.createdAt
    updatedAt: row.updated_at,   // front-end reads p.updatedAt
  };
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'post';
}

async function uniqueSlug(env, base) {
  let slug = base;
  let n = 1;
  // Loop is bounded in practice; slugs collide rarely.
  while (
    await env.DB.prepare('SELECT 1 FROM posts WHERE slug = ?').bind(slug).first()
  ) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

async function safeJson(request) {
  try { return await request.json(); } catch { return {}; }
}

// --------------------------------------------------------------- auth

// Workers are stateless and instances come and go, so in-memory token sets
// don't survive. These tokens are self-contained and HMAC-signed instead.
async function hmacKey(env) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.TOKEN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function b64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signToken(env) {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ exp })));
  const key = await hmacKey(env);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return `${payload}.${b64url(sig)}`;
}

async function verifyBearer(request, env) {
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) return false;
  const token = header.slice(7);
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;

  const key = await hmacKey(env);
  const expected = await crypto.subtle.sign(
    'HMAC', key, new TextEncoder().encode(payload)
  );
  if (b64url(expected) !== sig) return false;

  try {
    const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof exp === 'number' && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

// Compare via HMAC digests so timing doesn't leak length or content.
async function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const enc = new TextEncoder();
  const [da, db] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const ua = new Uint8Array(da), ub = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i];
  return diff === 0;
}

// --------------------------------------------------------------- responses

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function corsPreflight(env) {
  return new Response(null, { status: 204, headers: corsHeaders(env) });
}

function json(data, env, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(env),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}