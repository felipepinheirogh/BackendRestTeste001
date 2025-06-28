// src/routes/admin.js
import express from 'express';
import {
  listarSolicitacoes,
  aprovarSolicitacao,
  listarLicencas,
  bloquearLicenca,
  reativarLicenca,
  excluirLicenca,
  excluirSolicitacao,
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/solicitacoes', listarSolicitacoes);
router.post('/aprovar', aprovarSolicitacao);
router.get('/licencas', listarLicencas);
router.post('/bloquear', bloquearLicenca);
router.post('/reativar', reativarLicenca);
router.post('/excluir-licenca', excluirLicenca);
router.post('/excluir-solicitacao', excluirSolicitacao);

export default router;

// import express from 'express';
// import {
//   listarSolicitacoes,
//   aprovarSolicitacao,
//   listarLicencas,
//   bloquearLicenca,
//   reativarLicenca,
//   excluirLicenca,
//   excluirSolicitacao,
// } from '../controllers/adminController.js';

// const router = express.Router();

// router.get('/solicitacoes', listarSolicitacoes);
// router.post('/aprovar', aprovarSolicitacao);
// router.get('/licencas', listarLicencas);
// router.post('/bloquear', bloquearLicenca);
// router.post('/reativar', reativarLicenca);
// router.post('/excluir-licenca', excluirLicenca);
// router.post('/excluir-solicitacao', excluirSolicitacao);

// export default router;
