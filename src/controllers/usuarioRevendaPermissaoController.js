// src/controllers/usuarioRevendaPermissaoController.js
import { supabaseRequest } from '../supabaseClient.js';

export async function associarPermissaoUsuarioRevenda(req, res) {
  try {
    const { usuario_revenda_id, permissao_id, valor_override } = req.body;
    if (!usuario_revenda_id || !permissao_id)
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

    const { status, data } = await supabaseRequest('POST', 'usuario_revenda_permissoes', {
      usuario_revenda_id,
      permissao_id,
      valor_override,
    });

    if (status >= 200 && status < 300) res.json(data);
    else res.status(status).json({ error: 'Erro ao associar permissão' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}