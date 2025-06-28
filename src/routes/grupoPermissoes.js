import express from 'express';
import {
  listarGrupos,
  criarGrupo,
  atualizarGrupo,
  excluirGrupo,
  atualizarPermissoesDoGrupo
} from '../controllers/gruposPermissaoController.js';

const router = express.Router();

router.get('/', listarGrupos);
router.post('/', criarGrupo);
router.patch('/', atualizarGrupo);
router.delete('/', excluirGrupo);
router.post('/permissoes', atualizarPermissoesDoGrupo); // corpo: { grupo_id, permissoes_ids: [] }

export default router;

// import express from 'express';
// import {
//   listarGrupos,
//   criarGrupo
// } from '../controllers/grupoPermissaoController.js';

// const router = express.Router();

// router.get('/', listarGrupos);
// router.post('/', criarGrupo);

// export default router;
