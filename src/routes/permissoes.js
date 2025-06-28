import express from 'express';
import {
  getPermissoesEfetivasUsuario,
  getPermissoesEfetivasUsuarioRevenda,
} from '../controllers/permissaoResolver.js';

const router = express.Router();

// Permissões do usuário por ID
router.get('/usuario/:id', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const permissoes = await getPermissoesEfetivasUsuario(usuarioId);
    res.json(permissoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Permissões do usuário revenda por ID
router.get('/usuario_revenda/:id', async (req, res) => {
  try {
    const usuarioRevendaId = req.params.id;
    const permissoes = await getPermissoesEfetivasUsuarioRevenda(usuarioRevendaId);
    res.json(permissoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

// import express from 'express';
// import {
//   listarPermissoes,
//   criarPermissao,
//   atualizarPermissao,
//   excluirPermissao
// } from '../controllers/permissoesController.js';

// const router = express.Router();

// router.get('/', listarPermissoes);
// router.post('/', criarPermissao);
// router.patch('/', atualizarPermissao);
// router.delete('/', excluirPermissao);

// export default router;


// import express from 'express';
// import {
//   listarPermissoes,
//   criarPermissao
// } from '../controllers/permissaoController.js';

// const router = express.Router();

// router.get('/', listarPermissoes);
// router.post('/', criarPermissao);

// export default router;
