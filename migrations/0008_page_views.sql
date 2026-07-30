CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  referrer TEXT,
  country TEXT,
  visitor_hash TEXT,
  visited_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_pv_visited_at ON page_views(visited_at);
CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views(path);
