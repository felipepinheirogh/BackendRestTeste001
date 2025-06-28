// src/controllers/usuarioController.js
import { supabaseRequest } from '../supabaseClient.js';

// GET /usuarios
export async function listarUsuarios(req, res) {
  try {
    const { data } = await supabaseRequest('GET', 'usuarios?select=*,revendas(*)');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /usuarios
export async function criarUsuario(req, res) {
  try {
    const { nome, email, senha, nivel, ativo, grupo_id } = req.body;
    if (!nome || !email || !senha)
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

    const payload = {
      nome,
      email,
      senha,
      nivel: nivel ?? 0,
      ativo: ativo ?? true,
      grupo_id: grupo_id ?? null
    };

    const { data, status } = await supabaseRequest('POST', 'usuarios', payload);

    if (status >= 200 && status < 300)
      res.json({ status: 'Usuário criado com sucesso', usuario: data[0] });
    else
      res.status(500).json({ error: 'Erro ao criar usuário' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
