import { supabaseRequest } from '../supabaseClient.js';

export async function listarGruposDoUsuarioRevenda(req, res) {
  try {
    const { usuario_revenda_id } = req.query;
    if (!usuario_revenda_id) return res.status(400).json({ error: 'usuario_revenda_id ausente' });

    const { data } = await supabaseRequest(
      'GET',
      `grupo_usuario_revenda?usuario_revenda_id=eq.${usuario_revenda_id}&select=grupo_id`
    );
    res.json(data.map(e => e.grupo_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function atualizarGruposDoUsuarioRevenda(req, res) {
  try {
    const { usuario_revenda_id, grupos_ids = [] } = req.body;
    if (!usuario_revenda_id) return res.status(400).json({ error: 'usuario_revenda_id ausente' });

    await supabaseRequest('DELETE', `grupo_usuario_revenda?usuario_revenda_id=eq.${usuario_revenda_id}`);
    for (const grupo_id of grupos_ids) {
      await supabaseRequest('POST', 'grupo_usuario_revenda', {
        grupo_id,
        usuario_revenda_id,
      });
    }

    res.json({ status: 'Grupos atualizados' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
