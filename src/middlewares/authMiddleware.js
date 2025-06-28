import jwt from 'jsonwebtoken';
import { supabaseRequest } from '../supabaseClient.js';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

export function requireAuth({ nivelMinimo = 0, permissoes = [] } = {}) {
  return async function (req, res, next) {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token ausente ou malformado' });

      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET);

      let usuario = null;
      let tipo = payload.tipo;

      if (tipo === 'usuario') {
        const { data } = await supabaseRequest(
          'GET',
          `usuarios?id=eq.${payload.id}&select=*`
        );
        if (!data?.[0]) return res.status(403).json({ error: 'Usuário não encontrado' });
        usuario = data[0];
      }

      if (tipo === 'usuario_revenda') {
        const { data } = await supabaseRequest(
          'GET',
          `usuario_revendas?id=eq.${payload.id}&select=*`
        );
        if (!data?.[0]) return res.status(403).json({ error: 'Usuário revenda não encontrado' });
        usuario = data[0];
      }

      if (!usuario)
        return res.status(403).json({ error: 'Usuário inválido' });

      // 🔒 Verifica nível
      if (usuario.nivel_permissao < nivelMinimo)
        return res.status(403).json({ error: 'Nível de permissão insuficiente' });

      // 🔑 Carrega permissões diretas e de grupo
      let permissoesUsuario = [];

      const { data: diretas = [] } = await supabaseRequest(
        'GET',
        `permissoes_usuarios?usuario_id=eq.${usuario.id}&select=*,permissoes(*)`
      );

      const { data: grupo = [] } = usuario.grupo_permissao_id
        ? await supabaseRequest(
            'GET',
            `permissoes_grupo_usuarios?grupo_id=eq.${usuario.grupo_permissao_id}&select=*,permissoes(*)`
          )
        : { data: [] };

      permissoesUsuario = [
        ...diretas.map(p => p.permissoes?.chave),
        ...grupo.map(p => p.permissoes?.chave),
      ].filter(Boolean);

      // ✅ Verifica se tem todas as permissões exigidas
      const faltantes = permissoes.filter(p => !permissoesUsuario.includes(p));
      if (faltantes.length > 0)
        return res.status(403).json({ error: `Permissões insuficientes: ${faltantes.join(', ')}` });

      req.usuario = {
        id: usuario.id,
        tipo,
        nivel: usuario.nivel_permissao,
        permissoes: permissoesUsuario,
      };

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  };
}

// Exemplo de uso em rota protegida
// js
// Copiar
// Editar
// import express from 'express';
// import { requireAuth } from '../middlewares/authMiddleware.js';
// import { listarLicencas } from '../controllers/adminController.js';

// const router = express.Router();

// router.get('/licencas',
//   requireAuth({ nivelMinimo: 100, permissoes: ['ver_licencas'] }),
//   listarLicencas
// );

// export default router;









// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

// export function autenticarToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader?.split(' ')[1];

//   if (!token) return res.sendStatus(401);

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// }


// // Exemplo de uso em rota protegida
// // js
// // Copiar
// // Editar
// // import express from 'express';
// // import { checkPermissao } from '../middlewares/checkPermissao.js';
// // import { autenticarToken } from '../middlewares/authMiddleware.js';

// // const router = express.Router();

// // // Somente quem tem a permissão 'LICENCA_APROVAR' com nível 10 ou mais
// // router.post('/licenca/aprovar', autenticarToken, checkPermissao('LICENCA_APROVAR'), (req, res) => {
// //   res.json({ status: 'Licença aprovada com sucesso (simulação)' });
// // });

// // export default router;