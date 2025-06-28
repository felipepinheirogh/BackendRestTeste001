import { supabaseRequest } from '../supabaseClient.js';

export async function listarSolicitacoes(req, res) {
  try {
    const { data } = await supabaseRequest('GET', 'solicitacoes?select=*');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function aprovarSolicitacao(req, res) {
  try {
    const { device_id, cliente_id, token, erp_nome, dias } = req.body;
    if (!device_id || !cliente_id || !token || !erp_nome || !dias)
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

    // Verifica duplicidade device_id já aprovado
    const { data: existentes } = await supabaseRequest(
      'GET',
      `licencas?device_id=eq.${device_id}&select=id`
    );
    if (existentes.length > 0) {
      return res.status(409).json({ error: 'Dispositivo já possui uma licença aprovada' });
    }

    const validade = new Date();
    validade.setDate(validade.getDate() + parseInt(dias));
    const validadeStr = validade.toISOString().split('T')[0];

    await supabaseRequest('POST', 'licencas', {
      device_id,
      cliente_id,
      token,
      erp_nome,
      data_validade: validadeStr,
      autorizado: true,
    });

    await supabaseRequest('DELETE', `solicitacoes?device_id=eq.${device_id}`);

    res.json({ status: 'Licença aprovada com sucesso', validade: validadeStr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listarLicencas(req, res) {
  try {
    const status = req.query.status;
    let query = 'licencas?select=*,clientes(*)';
    if (status === 'ativo') query += '&autorizado=eq.true';
    else if (status === 'inativo') query += '&autorizado=eq.false';

    const { data } = await supabaseRequest('GET', query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function bloquearLicenca(req,
