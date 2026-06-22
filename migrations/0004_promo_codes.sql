CREATE TABLE IF NOT EXISTS promo_codes (
  code TEXT PRIMARY KEY,
  discount_pct INTEGER NOT NULL,
  max_uses INTEGER,
  active INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE registrations ADD COLUMN promo_code TEXT;
ALTER TABLE registrations ADD COLUMN promo_discount_pct INTEGER;
