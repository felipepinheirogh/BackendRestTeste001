import { supabaseRequest } from '../supabaseClient.js';
import { validarFingerprint, extrairDadosFingerprint } from '../services/fingerprintService.js';
import { gerarToken, lerToken } from '../services/tokenService.js';

export async function solicitarLicenca(req, res) {
  try {
    const { device_id, fingerprint } = req.body;

    if (!device_id)
      return res.status(400).json({ error: 'device_id ausente' });
    if (!fingerprint)
      return res.status(400).json({ error: 'fingerprint ausente' });
    if (!validarFingerprint(fingerprint))
      return res.status(403).json({ error: 'Fingerprint inválido' });

    // Extrai dados do fingerprint para preencher cliente e dispositivo
    const dados = extrairDadosFingerprint(fingerprint);
    // Espera-se: { nomerazao, telefone, sistema, modelo }

    // Verifica se dispositivo já existe
    const { data: dispositivos = [] } = await supabaseRequest(
      'GET',
      `dispositivos?device_id=eq.${device_id}&select=*,clientes(*)`
    );

    let clienteId;

    if (dispositivos.length > 0) {
      clienteId = dispositivos[0].cliente_id;
    } else {
      // Cria novo cliente
      const clientePayload = {
        nomerazao: dados.nomerazao || 'Cliente não informado',
        telefone: dados.telefone || '',
        email: '',
      };
      const { status: statusCliente, data: clienteData } = await supabaseRequest(
        'POST',
        'clientes',
        clientePayload
      );
      if (statusCliente < 200 || statusCliente >= 300)
        return res.status(500).json({ error: 'Erro ao criar cliente' });

      clienteId = clienteData.id;

      // Cria dispositivo vinculado ao cliente
      const dispositivoPayload = {
        cliente_id: clienteId,
        device_id,
        sistema: dados.sistema || '',
        modelo: dados.modelo || '',
      };
      const { status: statusDisp } = await supabaseRequest(
        'POST',
        'dispositivos',
        dispositivoPayload
      );
      if (statusDisp < 200 || statusDisp >= 300)
        return res.status(500).json({ error: 'Erro ao criar dispositivo' });
    }

    // Verifica se já existe solicitação pendente para este device_id
    const { data: pendente = [] } = await supabaseRequest(
      'GET',
      `solicitacoes?device_id=eq.${device_id}&select=*`
    );
    if (pendente.length > 0)
      return res.json({ status: 'pendente' });

    // Cria nova solicitação vinculada ao cliente
    const solicitacaoPayload = {
      cliente_id: clienteId,
      device_id,
      status: 'pendente',
    };
    const { status: statusSol } = await supabaseRequest(
      'POST',
      'solicitacoes',
      solicitacaoPayload
    );
    if (statusSol < 200 || statusSol >= 300)
      return res.status(500).json({ error: 'Erro ao criar solicitação' });

    return res.json({ status: 'pendente' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function verificarLicenca(req, res) {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ error: 'token ausente' });

    const { data = [] } = await supabaseRequest(
      'GET',
      `licencas?token=eq.${token}&autorizado=eq.true&select=*,clientes(*)`
    );

    const licenca = data[0];
    if (!licenca)
      return res.status(404).json({ error: 'Licença inválida ou não autorizada' });

    const validade = new Date(licenca.data_validade);
    const dias = Math.floor((validade - new Date()) / (1000 * 60 * 60 * 24));

    return res.json({
      dias_restantes: dias,
      data_validade: licenca.data_validade,
      erp_nome: licenca.erp_nome,
      payload: {
        cliente_id: licenca.cliente_id,
        nome_razao: licenca.clientes?.nome_razao || '',
        telefone: licenca.clientes?.telefone || '',
        erp_nome: licenca.erp_nome,
        dias_restantes: dias,
        data_validade: licenca.data_validade,
        device_id: licenca.device_id,
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
