const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SUPABASE_URL = 'https://rigjmzuqlpzxbvsyrsqo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZ2ptenVxbHB6eGJ2c3lyc3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTAxMjksImV4cCI6MjA2NjQ2NjEyOX0.MdbKZkdinux2ZjXdXC3K-7DlJumWR2K1-u1y4maaOM0';

async function supabaseRequest(method, endpoint, body = null) {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Para PATCH e DELETE o supabase espera esse header para retorno mínimo e evitar erros
  if (method === 'DELETE' || method === 'PATCH') {
    headers['Prefer'] = 'return=minimal';
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);

  // Verifique status antes de chamar json()
  if (res.status === 204) {
    // 204 No Content - resposta vazia válida
    return { status: res.status, data: null };
  }

  const text = await res.text();

  // Tenta parsear JSON se tiver texto, senão retorna null
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Resposta inválida do Supabase: ${text}`);
    }
  }

  if (!res.ok) {
    // res.ok é false para status >= 400
    const msg = data?.message || JSON.stringify(data) || res.statusText;
    throw new Error(`Erro ${res.status}: ${msg}`);
  }

  return { status: res.status, data };
}

// 🔹 Solicitação de nova licença (cliente)
app.post('/solicitacao', async (req, res) => {
  const { device_id } = req.body;
  if (!device_id) return res.status(400).json({ error: 'device_id ausente' });

  try {
    const { data: licencas } = await supabaseRequest('GET', `licencas?device_id=eq.${device_id}&select=*`);
    const licenca = licencas?.[0];
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

// 🔹 Verificação de licença (cliente)
app.post('/licenca/verificar', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token ausente' });

  try {
    const { data } = await supabaseRequest('GET', `licencas?token=eq.${token}&autorizado=eq.true&select=*`);
    const licenca = data?.[0];
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

// 🔹 Ver solicitações pendentes (admin)
app.get('/admin/solicitacoes', async (req, res) => {
  try {
    const { data } = await supabaseRequest('GET', 'solicitacoes?select=*');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Aprovar uma solicitação (admin)
app.post('/admin/aprovar', async (req, res) => {
  const { device_id, token, erp_nome, dias } = req.body;
  if (!device_id || !token || !erp_nome || !dias)
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

  const data_validade = new Date();
  data_validade.setDate(data_validade.getDate() + parseInt(dias));
  const validadeStr = data_validade.toISOString().split('T')[0];

  try {
    // Inserir ou atualizar licença
    await supabaseRequest('POST', 'licencas', {
      device_id,
      token,
      erp_nome,
      data_validade: validadeStr,
      autorizado: true
    });

    // Remover solicitação aprovada
    await supabaseRequest('DELETE', `solicitacoes?device_id=eq.${device_id}`);

    res.json({ status: 'Licença aprovada e registrada', validade: validadeStr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Listar todas as licenças (admin)
app.get('/admin/licencas', async (req, res) => {
  const status = req.query.status;
  let query = 'licencas?select=*';
  if (status === 'ativo') query += '&autorizado=eq.true';
  else if (status === 'inativo') query += '&autorizado=eq.false';

  try {
    const { data } = await supabaseRequest('GET', query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Bloquear licença (admin)
app.post('/admin/bloquear', async (req, res) => {
  const { token, device_id } = req.body;
  if (!token && !device_id) return res.status(400).json({ error: 'Informe token ou device_id' });

  const filtro = token ? `token=eq.${token}` : `device_id=eq.${device_id}`;
  try {
    await supabaseRequest('PATCH', `licencas?${filtro}`, { autorizado: false });
    res.json({ status: 'Licença bloqueada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Reativar licença (admin)
app.post('/admin/reativar', async (req, res) => {
  const { token, device_id } = req.body;
  if (!token && !device_id) return res.status(400).json({ error: 'Informe token ou device_id' });

  const filtro = token ? `token=eq.${token}` : `device_id=eq.${device_id}`;
  try {
    await supabaseRequest('PATCH', `licencas?${filtro}`, { autorizado: true });
    res.json({ status: 'Licença reativada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inicialização
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de licenciamento rodando na porta ${PORT}`);
});
