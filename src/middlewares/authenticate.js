// // Exemplo de Uso
// import { authenticateUsuario, authenticateUsuarioRevenda } from './middlewares/authenticate.js';

// // Rota para usuários padrão
// app.use('/api/usuario', authenticateUsuario, usuarioRouter);

// // Rota para usuários revenda
// app.use('/api/usuario_revenda', authenticateUsuarioRevenda, usuarioRevendaRouter);


// middlewares/authenticate.js
import jwt from 'jsonwebtoken';
import { supabaseRequest } from '../supabaseClient.js';

const JWT_SECRET = process.env.JWT_SECRET || 'SuaChaveSecretaMuitoForte';

// Middleware para autenticar usuário padrão (clientes/admins)
export async function authenticateUsuario(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ error: 'Token JWT ausente' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Busca dados completos do usuário no banco
    const { data, error } = await supabaseRequest(
      'GET',
      `usuarios?id=eq.${decoded.id}&select=*`
    );

    if (error || !data || data.length === 0)
      return res.status(401).json({ error: 'Usuário inválido' });

    req.user = data[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Token expirado' });
    if (err.name === 'JsonWebTokenError')
      return res.status(401).json({ error: 'Token inválido' });
    return res.status(500).json({ error: err.message });
  }
}

// Middleware para autenticar usuário revenda
export async function authenticateUsuarioRevenda(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ error: 'Token JWT ausente' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Busca dados do usuário revenda no banco
    const { data, error } = await supabaseRequest(
      'GET',
      `usuario_revenda?id=eq.${decoded.id}&select=*`
    );

    if (error || !data || data.length === 0)
      return res.status(401).json({ error: 'Usuário revenda inválido' });

    req.userRevenda = data[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Token expirado' });
    if (err.name === 'JsonWebTokenError')
      return res.status(401).json({ error: 'Token inválido' });
    return res.status(500).json({ error: err.message });
  }
}
