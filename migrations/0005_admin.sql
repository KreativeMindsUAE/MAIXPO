CREATE TABLE IF NOT EXISTS admin_otps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO system_settings (key, value) VALUES
  ('price_standard', '3999'),
  ('price_vip', '9999'),
  ('early_bird_active', '1'),
  ('early_bird_end', '1756684800');

CREATE TABLE IF NOT EXISTS sponsor_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sponsor_name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'Silver',
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'confirmed', 'declined')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
