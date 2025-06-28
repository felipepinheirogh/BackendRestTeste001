import { supabaseRequest } from '../supabaseClient.js';

export async function listarGrupos(req, res) {
  try {
    const { data } = await supabaseRequest('GET', 'grupos_de_permissoes?select=*');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function criarGrupo(req, res) {
  try {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome do grupo é obrigatório' });

    const { data, status } = await supabaseRequest('POST', 'grupos_de_permissoes', {
      nome,
      descricao,
    });

    if (status < 200 || status >= 300)
      return res.status(500).json({ error: 'Erro ao criar grupo' });

    res.json({ status: 'Criado com sucesso', grupo: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function atualizarGrupo(req, res) {
  try {
    const { id, nome, descricao } = req.body;
    if (!id) return res.status(400).json({ error: 'ID ausente' });

    const { status } = await supabaseRequest('PATCH', `grupos_de_permissoes?id=eq.${id}`, {
      nome,
      descricao
    });

    if (status < 200 || status >= 300)
      return res.status(500).json({ error: 'Erro ao atualizar grupo' });

    res.json({ status: 'Atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function excluirGrupo(req, res) {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID ausente' });

    await supabaseRequest('DELETE', `grupo_permissao_item?grupo_id=eq.${id}`);
    await supabaseRequest('DELETE', `grupos_de_permissoes?id=eq.${id}`);

    res.json({ status: 'Excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function atualizarPermissoesDoGrupo(req, res) {
  try {
    const { grupo_id, permissoes_ids = [] } = req.body;
    if (!grupo_id) return res.status(400).json({ error: 'grupo_id ausente' });

    // Apaga permissões anteriores
    await supabaseRequest('DELETE', `grupo_permissao_item?grupo_id=eq.${grupo_id}`);

    // Insere novas permissões
    for (const permissao_id of permissoes_ids) {
      await supabaseRequest('POST', 'grupo_permissao_item', {
        grupo_id,
        permissao_id,
      });
    }

    res.json({ status: 'Permissões atualizadas' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


// // src/controllers/grupoPermissaoController.js
// import { supabaseRequest } from '../supabaseClient.js';

// export async function listarGrupos(req, res) {
//   try {
//     const { data } = await supabaseRequest('GET', 'permissoes_grupo?select=*');
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function criarGrupo(req, res) {
//   try {
//     const { nome } = req.body;

//     if (!nome) return res.status(400).json({ error: 'Nome do grupo é obrigatório' });

//     const { data, status } = await supabaseRequest('POST', 'permissoes_grupo', { nome });

//     if (status >= 200 && status < 300)
//       res.json({ status: 'Grupo criado com sucesso', grupo: data[0] });
//     else
//       res.status(500).json({ error: 'Erro ao criar grupo' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// // src/controllers/grupoPermissaoController.js
// import { supabaseRequest } from '../supabaseClient.js';

// export async function listarGrupos(req, res) {
//   try {
//     const { data } = await supabaseRequest('GET', 'grupos_permissao?select=*');
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function criarGrupo(req, res) {
//   try {
//     const { nome, descricao } = req.body;
//     if (!nome) return res.status(400).json({ error: 'Nome do grupo obrigatório' });

//     const { status, data } = await supabaseRequest('POST', 'grupos_permissao', {
//       nome,
//       descricao,
//     });

//     if (status < 200 || status >= 300)
//       return res.status(500).json({ error: 'Erro ao criar grupo' });

//     res.json({ status: 'Grupo criado com sucesso', data });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function excluirGrupo(req, res) {
//   try {
//     const { id } = req.body;
//     if (!id) return res.status(400).json({ error: 'ID do grupo obrigatório' });

//     await supabaseRequest('DELETE', `grupos_permissao?id=eq.${id}`);

//     res.json({ status: 'Grupo excluído com sucesso' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }
