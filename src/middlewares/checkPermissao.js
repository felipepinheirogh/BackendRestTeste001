import { supabaseRequest } from '../supabaseClient.js';

/**
 * Middleware que valida se o usuário tem permissão para executar uma ação
 * baseado no código da permissão e no nível mínimo exigido
 */
export function checkPermissao(codigoPermissao) {
  return async (req, res, next) => {
    try {
      const usuarioId = req.user?.id; // `req.user` vem do JWT (middleware de autenticação)

      if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado' });

      // 🔍 Busca a permissão
      const { data: permissoes } = await supabaseRequest('GET', `permissoes?codigo=eq.${codigoPermissao}&select=*`);
      const permissao = permissoes[0];

      if (!permissao) return res.status(403).json({ error: 'Permissão inexistente' });

      const nivelMinimo = permissao.nivel;

      // 🔐 Busca permissões do usuário
      const { data: permUsuario } = await supabaseRequest('GET', `usuario_permissoes?usuario_id=eq.${usuarioId}&permissao_id=eq.${permissao.id}`);
      const usuarioTemPermissaoDireta = permUsuario.length > 0;

      // 🔁 Busca grupo do usuário e permissões do grupo
      const { data: usuarios } = await supabaseRequest('GET', `usuarios?id=eq.${usuarioId}&select=grupo_permissao_id,nivel_permissao`);
      const usuario = usuarios[0];

      let permissaoVindaDoGrupo = false;

      if (usuario?.grupo_permissao_id) {
        const { data: grupoPerms } = await supabaseRequest('GET', `grupo_permissoes_itens?grupo_permissao_id=eq.${usuario.grupo_permissao_id}&permissao_id=eq.${permissao.id}`);
        permissaoVindaDoGrupo = grupoPerms.length > 0;
      }

      const nivelDoUsuario = usuario?.nivel_permissao ?? 0;

      if ((usuarioTemPermissaoDireta || permissaoVindaDoGrupo) && nivelDoUsuario >= nivelMinimo)
        return next();

      return res.status(403).json({ error: 'Acesso negado: permissão insuficiente' });

    } catch (err) {
      return res.status(500).json({ error: 'Erro ao validar permissão' });
    }
  };
}
