import { supabaseRequest } from '../supabaseClient.js';
import { gerarToken, lerToken } from '../services/tokenService.js';
import { validarFingerprint } from '../services/fingerprintService.js';

export async function solicitarLicenca(req, res) {
  try {
    const { device_id, fingerprint } = req.body;

    if (!device_id) return res.status(400).json({ error: 'device_id ausente' });

    // Blindagem: fingerprint obrigatório para validação
    if (!fingerprint) return res.status(400).json({ error: 'fingerprint ausente' });

    // Valida o fingerprint (implementação pode ser customizada)
    if (!validarFingerprint(fingerprint))
      return res.status(403).json({ error: 'Fingerprint inválido' });

    // Consulta licenças aprovadas para device_id
    const { data: licencas } = await supabaseRequest(
      'GET',
      `licencas?device_id=eq.${device_id}&autorizado=eq.true&select=*,clientes(*)`
    );
    const licenca = licencas[0];

    if (licenca) {
      // Decodifica token para extrair dados compatíveis com Delphi
      const tokenDecoded = lerToken(licenca.token);

      const validade = new Date(licenca.data_validade);
      const hoje = new Date();
      const dias = Math.floor((validade - hoje) / (1000 * 60 * 60 * 24));

      return res.json({
        status: 'aprovado',
        token: licenca.token,
        tokenDecoded,
        erp_nome: licenca.erp_nome,
        data_validade: licenca.data_validade,
        dias_restantes: dias,
        payload: {
          cliente_id: licenca.cliente_id,
          nome_razao: licenca.clientes?.nome_razao,
          telefone: licenca.clientes?.telefone,
          erp_nome: licenca.erp_nome,
          dias_restantes: dias,
          data_validade: licenca.data_validade,
          device_id: licenca.device_id,
        },
      });
    }

    // Verifica se já existe solicitação pendente
    const { data: pendente } = await supabaseRequest(
      'GET',
      `solicitacoes?device_id=eq.${device_id}&select=*`
    );
    if (pendente.length > 0) return res.json({ status: 'pendente' });

    // Cria nova solicitação incluindo o fingerprint para pré-preenchimento
    await supabaseRequest('POST', 'solicitacoes', {
      device_id,
      fingerprint,
    });

    return res.json({ status: 'pendente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function verificarLicenca(req, res) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'token ausente' });

    const { data } = await supabaseRequest(
      'GET',
      `licencas?token=eq.${token}&autorizado=eq.true&select=*,clientes(*)`
    );
    const licenca = data[0];
    if (!licenca)
      return res.status(404).json({ error: 'Licença inválida ou não autorizada' });

    const validade = new Date(licenca.data_validade);
    const dias = Math.floor((validade - new Date()) / (1000 * 60 * 60 * 24));

    res.json({
      dias_restantes: dias,
      data_validade: licenca.data_validade,
      erp_nome: licenca.erp_nome,
      payload: {
        cliente_id: licenca.cliente_id,
        nome_razao: licenca.clientes?.nome_razao,
        telefone: licenca.clientes?.telefone,
        erp_nome: licenca.erp_nome,
        dias_restantes: dias,
        data_validade: licenca.data_validade,
        device_id: licenca.device_id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
