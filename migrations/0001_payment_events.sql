CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  payer TEXT,
  tx_hash TEXT,
  network TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS payment_events_run_id_created_at
  ON payment_events (run_id, created_at);
