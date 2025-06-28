// src/controllers/permissaoController.js
import { supabaseRequest } from '../supabaseClient.js';

export async function listarPermissoes(req, res) {
  try {
    const { data } = await supabaseRequest('GET', 'permissoes?select=*');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function criarPermissao(req, res) {
  try {
    const { chave, nivel, descricao, valor_padrao } = req.body;

    if (!chave)
      return res.status(400).json({ error: 'Chave da permissão é obrigatória' });

    const { status, data } = await supabaseRequest('POST', 'permissoes', {
      chave, nivel, descricao, valor_padrao
    });

    if (status >= 200 && status < 300)
      res.json({ status: 'Permissão criada', permissao: data[0] });
    else
      res.status(500).json({ error: 'Erro ao criar permissão' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// // src/controllers/permissaoController.js
// import { supabaseRequest } from '../supabaseClient.js';

// export async function listarPermissoes(req, res) {
//   try {
//     const { data } = await supabaseRequest('GET', 'permissoes?select=*');
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function criarPermissao(req, res) {
//   try {
//     const { chave, nivel_minimo, tipo_valor, valor_default, descricao } = req.body;
//     if (!chave || nivel_minimo === undefined || !tipo_valor)
//       return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

//     const { status, data } = await supabaseRequest('POST', 'permissoes', {
//       chave,
//       nivel_minimo,
//       tipo_valor,
//       valor_default,
//       descricao,
//     });

//     if (status >= 200 && status < 300) res.json(data);
//     else res.status(status).json({ error: 'Erro ao criar permissão' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }


// // src/controllers/permissaoController.js
// import { supabaseRequest } from '../supabaseClient.js';

// export async function listarPermissoes(req, res) {
//   try {
//     const { data, error } = await supabaseRequest('GET', 'permissoes?select=*');
//     if (error) throw new Error(error.message);
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function criarPermissao(req, res) {
//   try {
//     const { chave, descricao, nivel_minimo, tipo_valor, valor_padrao } = req.body;
//     if (!chave || !descricao)
//       return res.status(400).json({ error: 'chave e descricao obrigatórios' });

//     const payload = { chave, descricao, nivel_minimo, tipo_valor, valor_padrao };
//     const { data, error } = await supabaseRequest('POST', 'permissoes', payload);
//     if (error) throw new Error(error.message);

//     res.status(201).json(data[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function atualizarPermissao(req, res) {
//   try {
//     const { id } = req.params;
//     const { descricao, nivel_minimo, tipo_valor, valor_padrao } = req.body;

//     const payload = { descricao, nivel_minimo, tipo_valor, valor_padrao };
//     const { error } = await supabaseRequest('PATCH', `permissoes?id=eq.${id}`, payload);
//     if (error) throw new Error(error.message);

//     res.json({ status: 'Permissão atualizada com sucesso' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export async function excluirPermissao(req, res) {
//   try {
//     const { id } = req.params;
//     const { error } = await supabaseRequest('DELETE', `permissoes?id=eq.${id}`);
//     if (error) throw new Error(error.message);
//     res.json({ status: 'Permissão excluída com sucesso' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }
