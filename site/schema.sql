CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  lang TEXT,
  source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Pack de fiches offert contre un email (voir src/pack.js)
CREATE TABLE IF NOT EXISTS pack_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  lang TEXT NOT NULL DEFAULT 'fr',
  seq INTEGER NOT NULL DEFAULT 0,          -- 1 = a demandé les 2 emails de plus
  dl_token TEXT NOT NULL UNIQUE,           -- lien de téléchargement
  unsub_token TEXT NOT NULL UNIQUE,        -- lien de désinscription (envoyé par email seulement)
  source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  consent_at TEXT,
  e1_at TEXT, e2_at TEXT, e3_at TEXT,      -- date d'envoi, ou 'skipped'
  unsub_at TEXT
);
