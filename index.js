import express from 'express';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota para nova solicitação de licença
app.post('/solicitacao', (req, res) => {
  const { device_id, serial, fingerprint } = req.body;

  if (!device_id || !serial || !fingerprint) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  const solicitacaoExistente = db.prepare(`
    SELECT id, status FROM solicitacoes 
    WHERE device_id = ?
    ORDER BY created_at DESC LIMIT 1
  `).get(device_id);

  if (solicitacaoExistente) {
    return res.json({
      status: solicitacaoExistente.status,
      id: solicitacaoExistente.id
    });
  }

  const result = db.prepare(`
    INSERT INTO solicitacoes (device_id, serial, fingerprint, status)
    VALUES (?, ?, ?, 'pending')
  `).run(device_id, serial, fingerprint);

  return res.json({
    message: 'Solicitação registrada',
    id: result.lastInsertRowid
  });
});

// Rota para verificar status do dispositivo
app.get('/licenca/dispositivo', (req, res) => {
  const deviceID = req.header('x-device-id');
  if (!deviceID) {
    return res.status(400).json({ error: 'Header x-device-id ausente.' });
  }

  const licenca = db.prepare(`
    SELECT * FROM solicitacoes 
    WHERE device_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(deviceID);

  if (!licenca) {
    return res.status(404).json({ status: 'not_found' });
  }

  if (licenca.status === 'pending') {
    return res.json({ status: 'pending', id: licenca.id });
  }

  if (licenca.status === 'rejected') {
    return res.json({ status: 'rejected' });
  }

  if (licenca.status === 'approved') {
    return res.json({
      status: 'approved',
      token: licenca.token,
      dias_restantes: licenca.dias_restantes,
      data_validade: licenca.data_validade,
      erp_nome: licenca.erp_nome
    });
  }

  return res.status(500).json({ error: 'Status de licença desconhecido.' });
});

app.listen(PORT, () => {
  console.log(`Servidor licenciamento rodando na porta ${PORT}`);
});
