CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL DEFAULT 'KL',
  ticket_tier TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  job_title TEXT NOT NULL,
  industry TEXT NOT NULL,
  ai_stage TEXT,
  goals TEXT,
  hear_about TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
