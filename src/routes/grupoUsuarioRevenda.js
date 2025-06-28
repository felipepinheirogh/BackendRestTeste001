import express from 'express';
import {
  listarGruposDoUsuarioRevenda,
  atualizarGruposDoUsuarioRevenda
} from '../controllers/grupoUsuarioRevendaController.js';

const router = express.Router();

router.get('/', listarGruposDoUsuarioRevenda);
router.post('/', atualizarGruposDoUsuarioRevenda);

export default router;
