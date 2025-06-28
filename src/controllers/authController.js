// src/controllers/authController.js
import { supabaseRequest } from '../supabaseClient.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'troque_essa_chave_para_producao';
const JWT_EXPIRE = '8h';

// Gera o token JWT
function gerarTokenJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

// Login para usuários administradores
export async function loginUsuario(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha)
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    const { data = [] } = await supabaseRequest(
      'GET',
      `usuarios?email=eq.${email}&select=*`
    );

    const usuario = data[0];
    if (!usuario)
      return res.status(401).json({ error: 'Usuário não encontrado' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida)
      return res.status(401).json({ error: 'Senha inválida' });

    const token = gerarTokenJWT({
      id: usuario.id,
      email: usuario.email,
      tipo: 'usuario',
      nivel: usuario.nivel
    });

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivel: usuario.nivel
      }
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Login para usuários de revenda
export async function loginRevenda(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha)
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    const { data = [] } = await supabaseRequest(
      'GET',
      `usuario_revenda?email=eq.${email}&select=*,revendas(*)`
    );

    const usuarioRevenda = data[0];
    if (!usuarioRevenda)
      return res.status(401).json({ error: 'Usuário de revenda não encontrado' });

    const senhaValida = await bcrypt.compare(senha, usuarioRevenda.senha_hash);
    if (!senhaValida)
      return res.status(401).json({ error: 'Senha inválida' });

    const token = gerarTokenJWT({
      id: usuarioRevenda.id,
      email: usuarioRevenda.email,
      tipo: 'revenda',
      nivel: usuarioRevenda.nivel || 0
    });

    return res.json({
      token,
      usuario: {
        id: usuarioRevenda.id,
        nome: usuarioRevenda.nome,
        email: usuarioRevenda.email,
        nivel: usuarioRevenda.nivel || 0,
        revendas: usuarioRevenda.revendas?.map(r => ({
          id: r.id,
          nome: r.nome
        })) || []
      }
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
