const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SUPABASE_URL = 'https://rigjmzuqlpzxbvsyrsqo.supabase.co';
const SUPABASE_KEY = 'SUA_CHAVE_AQUI';

async function supabaseRequest(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
  const data = await res.json();
  return { status: res.status, data };
}

// Solicitação de nova licença (cliente)
app.post('/solicitacao', async (req, res) => {
  const { device_id } = req.body;
  if (!device_id) return res.status(400).json({ error: 'device_id ausente' });

  try {
    const { data: licencas } = await supabaseRequest('GET', `licencas?device_id=eq.${device_id}&select=*`);
    const licenca = licencas[0];
    if (licenca) {
      if (!licenca.autorizado) return res.json({ status: 'bloqueado' });
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

    const { data: pendente } = await supabaseRequest('GET', `solicitacoes?device_id=eq.${device_id}&select=*`);
    if (pendente.length > 0) return res.json({ status: 'pendente' });

    await supabaseRequest('POST', 'solicitacoes', {
      device_id,
      data: new Date().toISOString()
    });
    return res.json({ status: 'pendente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verificação de licença (cliente)
app.post('/licenca/verificar', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token ausente' });
  try {
    // Aqui o filtro pode continuar com eq.true pois é na URL (filtro)
    const { data } = await supabaseRequest('GET', `licencas?token=eq.${token}&autorizado=eq.true&select=*`);
    const licenca = data[0];
    if (!licenca) return res.status(404).json({ error: 'Licença inválida ou não autorizada' });
    const hoje = new Date();
    const validade = new Date(licenca.data_validade);
    const dias = Math.floor((validade - hoje) / (1000 * 60 * 60 * 24));
    res.json({
      dias_restantes: dias,
      data_validade: licenca.data_validade,
      erp_nome: licenca.erp_nome
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ver solicitações pendentes (admin)
app.get('/admin/solicitacoes', async (req, res) => {
  try {
    const { data } = await supabaseRequest('GET', 'solicitacoes?select=*');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aprovar uma solicitação (admin)
app.post('/admin/aprovar', async (req, res) => {
  const { device_id, token, erp_nome, dias } = req.body;
  if (!device_id || !token || !erp_nome || !dias)
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

  const data_validade = new Date();
  data_validade.setDate(data_validade.getDate() + parseInt(dias));
  const validadeStr = data_validade.toISOString().split('T')[0];

  try {
    // Aqui, enviar autorizado como número 1 (smallint)
    await supabaseRequest('POST', 'licencas', {
      device_id,
      token,
      erp_nome,
      data_validade: validadeStr,
      autorizado: 1
    });
    await supabaseRequest('DELETE', `solicitacoes?device_id=eq.${device_id}`);
    res.json({ status: 'Licença aprovada e registrada', validade: validadeStr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar todas as licenças (admin)
app.get('/admin/licencas', async (req, res) => {
  const status = req.query.status;
  let query = 'licencas?select=*';
  if (status === 'ativo') query += '&autorizado=eq.true'; // filtro URL pode ficar assim
  else if (status === 'inativo') query += '&autorizado=eq.false';

  try {
    const { data } = await supabaseRequest('GET', query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bloquear licença (admin)
app.post('/admin/bloquear', async (req, res) => {
  const { token, device_id } = req.body;
  if (!token && !device_id) return res.status(400).json({ error: 'Informe token ou device_id' });

  const filtro = token ? `token=eq.${token}` : `device_id=eq.${device_id}`;
  try {
    // Aqui enviar 0 (smallint) no corpo
    await supabaseRequest('PATCH', `licencas?${filtro}`, { autorizado: 0 });
    res.json({ status: 'Licença bloqueada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reativar licença (admin)
app.post('/admin/reativar', async (req, res) => {
  const { token, device_id } = req.body;
  if (!token && !device_id) return res.status(400).json({ error: 'Informe token ou device_id' });

  const filtro = token ? `token=eq.${token}` : `device_id=eq.${device_id}`;
  try {
    // Aqui enviar 1 (smallint) no corpo
    await supabaseRequest('PATCH', `licencas?${filtro}`, { autorizado: 1 });
    res.json({ status: 'Licença reativada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inicialização do servidor
app.listen(3000, () => {
  console.log('Servidor de licenciamento rodando na porta 3000');
});
