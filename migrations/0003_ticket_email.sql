ALTER TABLE registrations ADD COLUMN ticket_id TEXT;
ALTER TABLE registrations ADD COLUMN ticket_emailed INTEGER NOT NULL DEFAULT 0;
