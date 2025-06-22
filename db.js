import Database from 'better-sqlite3';
import fs from 'fs';

const dbPath = './licenciamento.sqlite';
const db = new Database(dbPath);

// Cria tabela se não existir
db.exec(`
CREATE TABLE IF NOT EXISTS solicitacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  serial TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  token TEXT,
  dias_restantes INTEGER,
  data_validade TEXT,
  erp_nome TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

export default db;
