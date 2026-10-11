-- Make optional fields actually nullable in registrations table
ALTER TABLE registrations RENAME TO registrations_old;

CREATE TABLE registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL DEFAULT 'KL',
  ticket_tier TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  job_title TEXT,
  industry TEXT,
  ai_stage TEXT,
  goals TEXT,
  hear_about TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  stripe_session_id TEXT,
  ticket_id TEXT,
  ticket_emailed INTEGER NOT NULL DEFAULT 0,
  promo_code TEXT,
  promo_discount_pct INTEGER
);

INSERT INTO registrations SELECT * FROM registrations_old;
DROP TABLE registrations_old;
