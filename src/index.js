// 1. ABRA o arquivo: backend/index.js

const express = require('express');
const app = express();
const db = require('./db'); // conexão SQLite

app.use(express.json());

// --- COLE AQUI a função /solicitacao ---

app.post('/solicitacao', (req, res) => {
  const { device_id, serial, fingerprint } = req.body;

  if (!device_id || !serial) {
    return res.status(400).json({ error: 'device_id e serial são obrigatórios' });
  }

  const SELECT_SQL = `
    SELECT * FROM solicitacoes_licenca
    WHERE device_id = ? AND serial = ?
    ORDER BY id DESC LIMIT 1
  `;

  db.get(SELECT_SQL, [device_id, serial], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      switch (row.status) {
        case 'pendente':
          return res.json({ status: 'pending', id: row.id });
        case 'aprovada':
          return res.json({
            status: 'approved',
            token: row.token,
            dias_restantes: row.dias_restantes,
            data_validade: row.validade,
            erp_nome: row.erp_nome
          });
        case 'rejeitada':
          return res.json({ status: 'rejected' });
        default:
          return res.status(500).json({ error: 'Status desconhecido no banco.' });
      }
    }

    const INSERT_SQL = `
      INSERT INTO solicitacoes_licenca (device_id, serial, fingerprint, status)
      VALUES (?, ?, ?, 'pendente')
    `;

    const params = [device_id, serial, fingerprint || null];

    db.run(INSERT_SQL, params, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      return res.json({ status: 'pending', id: this.lastID });
    });
  });
});


// --- COLE AQUI o endpoint de aprovação ---

app.post('/admin/aprovar/:id', (req, res) => {
  const { id } = req.params;
  const { token, dias_restantes, data_validade, erp_nome } = req.body;

  if (!token || !dias_restantes || !data_validade || !erp_nome) {
    return res.status(400).json({ error: 'Dados incompletos para aprovação' });
  }

  const UPDATE_SQL = `
    UPDATE solicitacoes_licenca
    SET status = 'aprovada', token = ?, dias_restantes = ?, validade = ?, erp_nome = ?
    WHERE id = ?
  `;

  const params = [token, dias_restantes, data_validade, erp_nome, id];

  db.run(UPDATE_SQL, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ status: 'approved', id });
  });
});

// --- INICIALIZA SERVIDOR ---

app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});
