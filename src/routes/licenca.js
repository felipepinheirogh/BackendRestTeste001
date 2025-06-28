// src/routes/licenca.js
import express from 'express';
import {
  solicitarLicenca,
  verificarLicenca,
} from '../controllers/licencaController.js';

const router = express.Router();

router.post('/', solicitarLicenca);           // /licenca/
router.post('/verificar', verificarLicenca); // /licenca/verificar

export default router;

// import express from 'express';
// import {
//   solicitarLicenca,
//   verificarLicenca,
// } from '../controllers/licencaController.js';

// const router = express.Router();

// router.post('/', solicitarLicenca);           // /solicitacao
// router.post('/verificar', verificarLicenca); // /licenca/verificar

// export default router;
