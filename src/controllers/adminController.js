// src/controllers/adminController.js
import { supabaseRequest } from '../supabaseClient.js';

export async function listarSolicitacoes(req, res) {
  try {
    const { data } = await supabaseRequest('GET', 'solicitacoes?select=*,clientes(*),dispositivos(*)');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function aprovarSolicitacao(req, res) {
  try {
    const { device_id, cliente_id, erp_id, token, dias } = req.body;
    if (!device_id || !cliente_id || !token || !erp_id || !dias)
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

    // Verifica duplicidade device_id + erp_id já aprovado
    const { data: existentes } = await supabaseRequest(
      'GET',
      `licencas?device_id=eq.${device_id}&erp_id=eq.${erp_id}&select=id`
    );
    if (existentes.length > 0)
      return res.status(409).json({ error: 'Dispositivo já possui licença aprovada para esse ERP' });

    const validade = new Date();
    validade.setDate(validade.getDate() + parseInt(dias));
    const validadeStr = validade.toISOString().split('T')[0];

    await supabaseRequest('POST', 'licencas', {
      cliente_id,
      device_id,
      erp_id,
      token,
      data_validade: validadeStr,
      autorizado: true,
    });

    // Remove a solicitação vinculada ao dispositivo e cliente
    await supabaseRequest('DELETE', `solicitacoes?device_id=eq.${device_id}`);

    res.json({ status: 'Licença aprovada com sucesso', validade: validadeStr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listarLicencas(req, res) {
  try {
    const status = req.query.status;
    let query = 'licencas?select=*,clientes(*),erps(*)';

    if (status === 'ativo') query += '&autorizado=eq.true';
    else if (status === 'inativo') query += '&autorizado=eq.false';

    const { data } = await supabaseRequest('GET', query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function bloquearLicenca(req, res) {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID da licença ausente' });

    await supabaseRequest('PATCH', `licencas?id=eq.${id}`, {
      autorizado: false,
    });

    res.json({ status: 'Licença bloqueada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function reativarLicenca(req, res) {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID da licença ausente' });

    await supabaseRequest('PATCH', `licencas?id=eq.${id}`, {
      autorizado: true,
    });

    res.json({ status: 'Licença reativada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function excluirLicenca(req, res) {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID da licença ausente' });

    await supabaseRequest('DELETE', `licencas?id=eq.${id}`);
    res.json({ status: 'Licença excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function excluirSolicitacao(req, res) {
  try {
    const { device_id } = req.body;
    if (!device_id) return res.status(400).json({ error: 'device_id ausente' });

    await supabaseRequest('DELETE', `solicitacoes?device_id=eq.${device_id}`);
    res.json({ status: 'Solicitação excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// // src/controllers/adminController.js
// import { supabaseRequest } from '../supabaseClient.js';

// export async function listarSolicitacoes(req, res) {
//   try {
//     const { data } = await supabaseRequest('GET', 'solicitacoes?select=*');
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function aprovarSolicitacao(req, res) {
//   try {
//     const { device_id, cliente_id, token, erp_nome, dias } = req.body;
//     if (!device_id || !cliente_id || !token || !erp_nome || !dias)
//       return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

//     const { data: existentes } = await supabaseRequest(
//       'GET',
//       `licencas?device_id=eq.${device_id}&select=id`
//     );
//     if (existentes.length > 0)
//       return res.status(409).json({ error: 'Dispositivo já possui licença aprovada' });

//     const validade = new Date();
//     validade.setDate(validade.getDate() + parseInt(dias));
//     const validadeStr = validade.toISOString().split('T')[0];

//     await supabaseRequest('POST', 'licencas', {
//       cliente_id,
//       device_id,
//       token,
//       erp_nome,
//       data_validade: validadeStr,
//       autorizado: true,
//     });

//     await supabaseRequest('DELETE', `solicitacoes?device_id=eq.${device_id}`);

//     res.json({ status: 'Licença aprovada com sucesso', validade: validadeStr });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function listarLicencas(req, res) {
//   try {
//     const status = req.query.status;
//     let query = 'licencas?select=*,clientes(*)';

//     if (status === 'ativo') query += '&autorizado=eq.true';
//     else if (status === 'inativo') query += '&autorizado=eq.false';

//     const { data } = await supabaseRequest('GET', query);
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function bloquearLicenca(req, res) {
//   try {
//     const { id } = req.body;
//     if (!id) return res.status(400).json({ error: 'ID da licença ausente' });

//     await supabaseRequest('PATCH', `licencas?id=eq.${id}`, {
//       autorizado: false,
//     });

//     res.json({ status: 'Licença bloqueada com sucesso' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function reativarLicenca(req, res) {
//   try {
//     const { id } = req.body;
//     if (!id) return res.status(400).json({ error: 'ID da licença ausente' });

//     await supabaseRequest('PATCH', `licencas?id=eq.${id}`, {
//       autorizado: true,
//     });

//     res.json({ status: 'Licença reativada com sucesso' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function excluirLicenca(req, res) {
//   try {
//     const { id } = req.body;
//     if (!id) return res.status(400).json({ error: 'ID da licença ausente' });

//     await supabaseRequest('DELETE', `licencas?id=eq.${id}`);
//     res.json({ status: 'Licença excluída com sucesso' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function excluirSolicitacao(req, res) {
//   try {
//     const { device_id } = req.body;
//     if (!device_id) return res.status(400).json({ error: 'device_id ausente' });

//     await supabaseRequest('DELETE', `solicitacoes?device_id=eq.${device_id}`);
//     res.json({ status: 'Solicitação excluída com sucesso' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }
