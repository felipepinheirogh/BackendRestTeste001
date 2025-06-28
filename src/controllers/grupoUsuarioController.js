import { supabaseRequest } from '../supabaseClient.js';

export async function listarGruposDoUsuario(req, res) {
  try {
    const { usuario_id } = req.query;
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id ausente' });

    const { data } = await supabaseRequest(
      'GET',
      `grupo_usuario?usuario_id=eq.${usuario_id}&select=grupo_id`
    );
    res.json(data.map(e => e.grupo_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function atualizarGruposDoUsuario(req, res) {
  try {
    const { usuario_id, grupos_ids = [] } = req.body;
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id ausente' });

    await supabaseRequest('DELETE', `grupo_usuario?usuario_id=eq.${usuario_id}`);
    for (const grupo_id of grupos_ids) {
      await supabaseRequest('POST', 'grupo_usuario', {
        grupo_id,
        usuario_id,
      });
    }

    res.json({ status: 'Grupos atualizados' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
