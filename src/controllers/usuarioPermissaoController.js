// src/controllers/usuarioPermissaoController.js
import { supabaseRequest } from '../supabaseClient.js';

export async function associarPermissaoUsuario(req, res) {
  try {
    const { usuario_id, permissao_id, valor_override } = req.body;
    if (!usuario_id || !permissao_id)
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

    const { status, data } = await supabaseRequest('POST', 'usuario_permissoes', {
      usuario_id,
      permissao_id,
      valor_override,
    });

    if (status >= 200 && status < 300) res.json(data);
    else res.status(status).json({ error: 'Erro ao associar permissão' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}