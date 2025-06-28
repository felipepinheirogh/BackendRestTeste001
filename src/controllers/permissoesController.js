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
    const { chave, descricao, nivel_minimo = 0, valor_default = '', tipo = 'texto' } = req.body;

    if (!chave || !tipo)
      return res.status(400).json({ error: 'Chave e tipo são obrigatórios' });

    const { status, data } = await supabaseRequest('POST', 'permissoes', {
      chave,
      descricao,
      nivel_minimo,
      valor_default,
      tipo,
    });

    if (status < 200 || status >= 300)
      return res.status(500).json({ error: 'Erro ao criar permissão' });

    res.json({ status: 'Criado com sucesso', permissao: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function atualizarPermissao(req, res) {
  try {
    const { id, ...campos } = req.body;
    if (!id) return res.status(400).json({ error: 'ID da permissão ausente' });

    const { status } = await supabaseRequest('PATCH', `permissoes?id=eq.${id}`, campos);

    if (status < 200 || status >= 300)
      return res.status(500).json({ error: 'Erro ao atualizar permissão' });

    res.json({ status: 'Atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function excluirPermissao(req, res) {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID ausente' });

    const { status } = await supabaseRequest('DELETE', `permissoes?id=eq.${id}`);

    if (status < 200 || status >= 300)
      return res.status(500).json({ error: 'Erro ao excluir permissão' });

    res.json({ status: 'Excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
