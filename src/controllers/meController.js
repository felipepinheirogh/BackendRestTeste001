import jwt from 'jsonwebtoken';
import { supabaseRequest } from '../supabaseClient.js';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

export async function obterPerfil(req, res) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer '))
      return res.status(401).json({ error: 'Token ausente ou malformado' });

    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);

    if (payload.tipo === 'usuario') {
      const { data: usuario } = await supabaseRequest(
        'GET',
        `usuarios?id=eq.${payload.id}&select=*`
      );

      if (!usuario.length)
        return res.status(404).json({ error: 'Usuário não encontrado' });

      return res.json({
        id: usuario[0].id,
        tipo: 'usuario',
        nome: usuario[0].nome,
        email: usuario[0].email,
        nivel_permissao: usuario[0].nivel_permissao,
        grupo_permissao_id: usuario[0].grupo_permissao_id
      });
    }

    if (payload.tipo === 'usuario_revenda') {
      const { data: usuario } = await supabaseRequest(
        'GET',
        `usuario_revendas?id=eq.${payload.id}&select=*,revendas(*)`
      );

      if (!usuario.length)
        return res.status(404).json({ error: 'Usuário revenda não encontrado' });

      return res.json({
        id: usuario[0].id,
        tipo: 'usuario_revenda',
        nome: usuario[0].nome,
        email: usuario[0].email,
        revenda_id: usuario[0].revenda_id,
        revenda_nome: usuario[0].revendas?.nome || '',
        nivel_permissao: usuario[0].nivel_permissao,
        grupo_permissao_id: usuario[0].grupo_permissao_id
      });
    }

    return res.status(403).json({ error: 'Tipo de token desconhecido' });

  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}
