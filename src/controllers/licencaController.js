const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../../db/database.sqlite');

// Conexão SQLite
const db = new sqlite3.Database(dbPath);

// Cria tabela se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS solicitacoes_licenca (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      serial TEXT NOT NULL,
      fingerprint TEXT,
      status TEXT DEFAULT 'pendente',
      token TEXT,
      erp_nome TEXT,
      data_solicitacao TEXT DEFAULT CURRENT_TIMESTAMP,
      data_aprovacao TEXT,
      validade TEXT,
      dias_restantes INTEGER
    )
  `);
});

// POST /solicitacao
exports.solicitarLicenca = (req, res) => {
  const { device_id, serial, fingerprint } = req.body;

  if (!device_id || !serial) {
    return res.status(400).json({ error: 'device_id e serial são obrigatórios' });
  }

  const sql = `
    INSERT INTO solicitacoes_licenca (device_id, serial, fingerprint)
    VALUES (?, ?, ?)
  `;
  const params = [device_id, serial, fingerprint || null];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    return res.status(200).json({
      message: 'Solicitação registrada',
      id: this.lastID
    });
  });
};

// POST /licenca/verificar
exports.verificarLicenca = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token não informado' });
  }

  const sql = `
    SELECT * FROM solicitacoes_licenca
    WHERE token = ? AND status = 'aprovada'
  `;

  db.get(sql, [token], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row) {
      return res.status(404).json({ error: 'Token inválido ou não aprovado' });
    }

    // Calcula dias restantes se necessário
    const hoje = new Date();
    const validade = new Date(row.validade);
    const diffTime = validade.getTime() - hoje.getTime();
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diasRestantes <= 0) {
      return res.status(410).json({ error: 'Licença expirada' });
    }

    return res.json({
      dias_restantes: diasRestantes,
      data_validade: row.validade,
      erp_nome: row.erp_nome || 'gestao360'
    });
  });
};
