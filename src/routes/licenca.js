import express from 'express';
import {
  solicitarLicenca,
  verificarLicenca,
} from '../controllers/licencaController.js';

const router = express.Router();

router.post('/', solicitarLicenca);           // /solicitacao
router.post('/verificar', verificarLicenca); // /licenca/verificar

export default router;
