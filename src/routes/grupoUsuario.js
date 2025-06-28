import express from 'express';
import {
  listarGruposDoUsuario,
  atualizarGruposDoUsuario
} from '../controllers/grupoUsuarioController.js';

const router = express.Router();

router.get('/', listarGruposDoUsuario);
router.post('/', atualizarGruposDoUsuario);

export default router;
