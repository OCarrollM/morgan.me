-- Blog schema for Cloudflare D1.
-- Apply with:  wrangler d1 execute morgan-blog --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS posts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  title       TEXT    NOT NULL,
  body        TEXT    NOT NULL DEFAULT '',
  excerpt     TEXT    NOT NULL DEFAULT '',
  tags        TEXT    NOT NULL DEFAULT '[]',   -- JSON array, e.g. ["space","k8s"]
  published   INTEGER NOT NULL DEFAULT 1,      -- 0 = draft, hidden from public list
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_created ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug    ON posts (slug);