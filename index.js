const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const db = new sqlite3.Database('./licencas.db');

app.use(cors());
app.use(bodyParser.json());

// Criação das tabelas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS solicitacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT UNIQUE,
    data TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS licencas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT,
    token TEXT UNIQUE,
    erp_nome TEXT,
    data_validade TEXT,
    autorizado INTEGER DEFAULT 1
  )`);
});

// Rota: Solicitar nova licença
app.post('/solicitacao', (req, res) => {
  const { device_id } = req.body;
  if (!device_id) return res.status(400).json({ error: 'device_id ausente' });

  db.run(`INSERT OR IGNORE INTO solicitacoes (device_id, data) VALUES (?, datetime('now'))`, [device_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: 'Solicitação registrada' });
  });
});

// Rota: Verificar token de licença
app.post('/licenca/verificar', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token ausente' });

  db.get(`SELECT * FROM licencas WHERE token = ? AND autorizado = 1`, [token], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Licença inválida ou não autorizada' });

    const hoje = new Date();
    const validade = new Date(row.data_validade);
    const diffMs = validade.getTime() - hoje.getTime();
    const diasRestantes = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    res.json({
      dias_restantes: diasRestantes,
      data_validade: row.data_validade,
      erp_nome: row.erp_nome
    });
  });
});

// Rota: Admin - Ver solicitações pendentes
app.get('/admin/solicitacoes', (req, res) => {
  db.all(`SELECT * FROM solicitacoes`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Rota: Admin - Aprovar solicitação
app.post('/admin/aprovar', (req, res) => {
  const { device_id, token, erp_nome, data_validade } = req.body;
  if (!device_id || !token || !erp_nome || !data_validade)
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

  db.run(
    `INSERT OR REPLACE INTO licencas (device_id, token, erp_nome, data_validade, autorizado)
     VALUES (?, ?, ?, ?, 1)`,
    [device_id, token, erp_nome, data_validade],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run(`DELETE FROM solicitacoes WHERE device_id = ?`, [device_id]);
      res.json({ status: 'Licença aprovada e registrada' });
    }
  );
});

// Rota: Admin - Ver licenças ativas
app.get('/admin/licencas', (req, res) => {
  db.all(`SELECT * FROM licencas WHERE autorizado = 1`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Rota: Admin - Bloquear licença
app.post('/admin/bloquear', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token ausente' });

  db.run(`UPDATE licencas SET autorizado = 0 WHERE token = ?`, [token], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: 'Licença bloqueada' });
  });
});

app.listen(3000, () => {
  console.log('Servidor de licenciamento rodando na porta 3000');
});
