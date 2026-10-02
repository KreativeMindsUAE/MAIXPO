-- Update pricing for new dates (Dec 29-30) and early bird structure
UPDATE system_settings SET value = '4900' WHERE key = 'price_standard';
UPDATE system_settings SET value = '9900' WHERE key = 'price_vip';
UPDATE system_settings SET value = '1793404799' WHERE key = 'early_bird_end';

-- Add normal price columns for future reference
INSERT OR IGNORE INTO system_settings (key, value) VALUES
  ('price_standard_normal', '9900'),
  ('price_vip_normal', '19900');
