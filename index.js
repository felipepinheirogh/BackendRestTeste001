const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./licencas.db');

app.use(cors());
app.use(bodyParser.json());

// Criação das tabelas (se ainda não existirem)
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

// 🔹 Solicitação de nova licença (cliente)
app.post('/solicitacao', (req, res) => {
  const { device_id } = req.body;
  if (!device_id) return res.status(400).json({ error: 'device_id ausente' });

  db.get(`SELECT * FROM licencas WHERE device_id = ?`, [device_id], (err, licenca) => {
    if (err) return res.status(500).json({ error: err.message });

    if (licenca) {
      if (licenca.autorizado === 0) return res.json({ status: 'bloqueado' });

      const validade = new Date(licenca.data_validade);
      const hoje = new Date();
      const dias = Math.floor((validade - hoje) / (1000 * 60 * 60 * 24));

      return res.json({
        status: 'aprovado',
        token: licenca.token,
        erp_nome: licenca.erp_nome,
        data_validade: licenca.data_validade,
        dias_restantes: dias
      });
    }

    db.get(`SELECT * FROM solicitacoes WHERE device_id = ?`, [device_id], (err, sol) => {
      if (err) return res.status(500).json({ error: err.message });

      if (sol) return res.json({ status: 'pendente' });

      db.run(`INSERT INTO solicitacoes (device_id, data) VALUES (?, datetime('now'))`, [device_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'pendente' });
      });
    });
  });
});

// 🔹 Verificação de licença (cliente)
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

// 🔹 Ver solicitações pendentes (admin)
app.get('/admin/solicitacoes', (req, res) => {
  db.all(`SELECT * FROM solicitacoes`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 🔹 Aprovar uma solicitação (admin)
app.post('/admin/aprovar', (req, res) => {
  const { device_id, token, erp_nome, dias } = req.body;
  if (!device_id || !token || !erp_nome || !dias)
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

  const data_validade = new Date();
  data_validade.setDate(data_validade.getDate() + parseInt(dias));
  const validadeStr = data_validade.toISOString().split('T')[0];

  db.run(
    `INSERT OR REPLACE INTO licencas (device_id, token, erp_nome, data_validade, autorizado)
     VALUES (?, ?, ?, ?, 1)`,
    [device_id, token, erp_nome, validadeStr],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run(`DELETE FROM solicitacoes WHERE device_id = ?`, [device_id]);
      res.json({ status: 'Licença aprovada e registrada', validade: validadeStr });
    }
  );
});

// 🔹 Listar todas as licenças (ativas/inativas) (admin)
app.get('/admin/licencas', (req, res) => {
  const status = req.query.status;
  let sql = `SELECT * FROM licencas`;

  if (status === 'ativo') sql += ` WHERE autorizado = 1`;
  else if (status === 'inativo') sql += ` WHERE autorizado = 0`;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 🔹 Bloquear licença (admin)
app.post('/admin/bloquear', (req, res) => {
  const { token, device_id } = req.body;
  if (!token && !device_id)
    return res.status(400).json({ error: 'Informe token ou device_id' });

  const whereClause = token ? `token = ?` : `device_id = ?`;
  const value = token || device_id;

  db.run(`UPDATE licencas SET autorizado = 0 WHERE ${whereClause}`, [value], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: 'Licença bloqueada com sucesso' });
  });
});

// 🔹 Reativar licença (admin)
app.post('/admin/reativar', (req, res) => {
  const { token, device_id } = req.body;
  if (!token && !device_id)
    return res.status(400).json({ error: 'Informe token ou device_id' });

  const whereClause = token ? `token = ?` : `device_id = ?`;
  const value = token || device_id;

  db.run(`UPDATE licencas SET autorizado = 1 WHERE ${whereClause}`, [value], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: 'Licença reativada com sucesso' });
  });
});

// 🔸 Inicialização
app.listen(3000, () => {
  console.log('Servidor de licenciamento rodando na porta 3000');
});
