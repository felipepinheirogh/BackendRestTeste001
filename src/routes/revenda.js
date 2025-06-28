import express from 'express';
import {
  listarRevendas,
  criarRevenda
} from '../controllers/revendaController.js';

const router = express.Router();

router.get('/', listarRevendas);
router.post('/', criarRevenda);

export default router;
