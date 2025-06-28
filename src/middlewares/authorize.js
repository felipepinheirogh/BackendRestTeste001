import { getPermissoesEfetivasUsuario, getPermissoesEfetivasUsuarioRevenda } from '../controllers/permissaoResolver.js';

/**
 * Middleware genérico para validar permissão mínima requerida
 * @param {string} chavePermissao - chave da permissão a validar
 * @param {number} nivelMinimo - nível mínimo requerido para acessar o recurso
 * @param {('usuario'|'usuario_revenda')} tipoUsuario - tipo de usuário
 */
export function authorize(chavePermissao, nivelMinimo = 1, tipoUsuario = 'usuario') {
  return async (req, res, next) => {
    try {
      const userId = tipoUsuario === 'usuario' 
        ? req.user?.id 
        : req.userRevenda?.id;

      if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

      let permissoes;
      if (tipoUsuario === 'usuario') {
        permissoes = await getPermissoesEfetivasUsuario(userId);
      } else {
        permissoes = await getPermissoesEfetivasUsuarioRevenda(userId);
      }

      const permissao = permissoes[chavePermissao];

      if (!permissao) return res.status(403).json({ error: 'Permissão negada' });
      if (permissao.nivel < nivelMinimo) return res.status(403).json({ error: 'Nível de permissão insuficiente' });

      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}
