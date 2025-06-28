// src/controllers/authController.js
import { supabaseRequest } from '../supabaseClient.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'troque_essa_chave_para_producao';
const JWT_EXPIRE = '8h'; // ajustar conforme política

// Função interna para gerar token JWT
function gerarTokenJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

// Login Usuário Admin
export async function loginUsuario(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    const { data = [] } = await supabaseRequest(
      'GET',
      `usuarios?email=eq.${email}&select=*`
    );

    const usuario = data[0];
    if (!usuario) return res.status(401).json({ error: 'Usuário não encontrado' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) return res.status(401).json({ error: 'Senha inválida' });

    const token = gerarTokenJWT({ id: usuario.id, email: usuario.email, tipo: 'admin' });

    return res.json({ token, usuario: { id: usuario.id, email: usuario.email, nome: usuario.nome } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Login Usuário Revenda
export async function loginRevenda(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    const { data = [] } = await supabaseRequest(
      'GET',
      `usuario_revenda?email=eq.${email}&select=*,revendas(*)`
    );

    const usuarioRevenda = data[0];
    if (!usuarioRevenda) return res.status(401).json({ error: 'Usuário de revenda não encontrado' });

    const senhaValida = await bcrypt.compare(senha, usuarioRevenda.senha_hash);
    if (!senhaValida) return res.status(401).json({ error: 'Senha inválida' });

    const token = gerarTokenJWT({ id: usuarioRevenda.id, email: usuarioRevenda.email, tipo: 'revenda' });

    return res.json({
      token,
      usuario: {
        id: usuarioRevenda.id,
        email: usuarioRevenda.email,
        nome: usuarioRevenda.nome,
        revendas: usuarioRevenda.revendas.map(r => ({ id: r.id, nome: r.nome }))
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}



// import jwt from 'jsonwebtoken';
// import { supabaseRequest } from '../supabaseClient.js';

// const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

// export async function login(req, res) {
//   try {
//     const { email, senha } = req.body;
//     if (!email || !senha)
//       return res.status(400).json({ error: 'Credenciais ausentes' });

//     // 🔍 Tenta autenticar como usuário interno
//     const { data: usuarios = [] } = await supabaseRequest(
//       'GET',
//       `usuarios?email=eq.${email}&senha=eq.${senha}&select=*`
//     );

//     if (usuarios.length > 0) {
//       const usuario = usuarios[0];

//       const token = jwt.sign(
//         {
//           tipo: 'usuario',
//           id: usuario.id,
//           email: usuario.email,
//         },
//         JWT_SECRET,
//         { expiresIn: '2h' }
//       );

//       return res.json({
//         tipo: 'usuario',
//         token,
//         usuario: {
//           id: usuario.id,
//           nome: usuario.nome,
//           email: usuario.email,
//           nivel: usuario.nivel_permissao,
//         },
//       });
//     }

//     // 🔍 Tenta autenticar como usuário revenda
//     const { data: revendas = [] } = await supabaseRequest(
//       'GET',
//       `usuario_revendas?email=eq.${email}&senha=eq.${senha}&select=*`
//     );

//     if (revendas.length > 0) {
//       const usuario = revendas[0];

//       const token = jwt.sign(
//         {
//           tipo: 'usuario_revenda',
//           id: usuario.id,
//           email: usuario.email,
//         },
//         JWT_SECRET,
//         { expiresIn: '2h' }
//       );

//       return res.json({
//         tipo: 'usuario_revenda',
//         token,
//         usuario: {
//           id: usuario.id,
//           nome: usuario.nome,
//           email: usuario.email,
//           nivel: usuario.nivel_permissao,
//           revenda_id: usuario.revenda_id,
//         },
//       });
//     }

//     return res.status(401).json({ error: 'Usuário ou senha inválidos' });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// }

// import jwt from 'jsonwebtoken';
// import { supabaseRequest } from '../supabaseClient.js';

// const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';
// const TOKEN_EXPIRA_EM = '12h';

// export async function login(req, res) {
//   try {
//     const { email, senha } = req.body;

//     if (!email || !senha)
//       return res.status(400).json({ error: 'Email e senha são obrigatórios' });

//     // 🔍 Verifica se é usuário padrão (admin do sistema)
//     const { data: usuarios } = await supabaseRequest(
//       'GET',
//       `usuarios?email=eq.${email}&senha=eq.${senha}&ativo=eq.true&select=*`
//     );

//     if (usuarios.length > 0) {
//       const user = usuarios[0];
//       const token = jwt.sign({
//         id: user.id,
//         tipo: 'usuario',
//         nivel_permissao: user.nivel_permissao,
//         grupo_permissao_id: user.grupo_permissao_id,
//       }, JWT_SECRET, { expiresIn: TOKEN_EXPIRA_EM });

//       return res.json({ token, tipo: 'usuario' });
//     }

//     // 🔍 Verifica se é usuário revenda
//     const { data: revendas } = await supabaseRequest(
//       'GET',
//       `usuario_revendas?email=eq.${email}&senha=eq.${senha}&ativo=eq.true&select=*`
//     );

//     if (revendas.length > 0) {
//       const user = revendas[0];
//       const token = jwt.sign({
//         id: user.id,
//         tipo: 'usuario_revenda',
//         revenda_id: user.revenda_id,
//         nivel_permissao: user.nivel_permissao,
//         grupo_permissao_id: user.grupo_permissao_id,
//       }, JWT_SECRET, { expiresIn: TOKEN_EXPIRA_EM });

//       return res.json({ token, tipo: 'usuario_revenda' });
//     }

//     return res.status(401).json({ error: 'Credenciais inválidas' });

//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// }
