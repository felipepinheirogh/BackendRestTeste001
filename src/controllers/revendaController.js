// src/controllers/revendaController.js
import { supabaseRequest } from '../supabaseClient.js';

export async function listarRevendas(req, res) {
  try {
    const { data } = await supabaseRequest('GET', 'revendas?select=*');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function criarRevenda(req, res) {
  try {
    const { nome, cnpj, contato } = req.body;

    if (!nome || !cnpj)
      return res.status(400).json({ error: 'Nome e CNPJ são obrigatórios' });

    const { data, status } = await supabaseRequest('POST', 'revendas', {
      nome, cnpj, contato
    });

    if (status >= 200 && status < 300)
      res.json({ status: 'Revenda cadastrada', revenda: data[0] });
    else
      res.status(500).json({ error: 'Erro ao cadastrar revenda' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
