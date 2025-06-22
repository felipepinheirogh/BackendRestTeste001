const express = require('express');
const router = express.Router();
const LicencaController = require('./controllers/licencaController');

router.post('/solicitacao', LicencaController.solicitarLicenca);
router.post('/licenca/verificar', LicencaController.verificarLicenca);

// Futuro:
// router.get('/admin/solicitacoes', LicencaController.listarPendentes);
// router.post('/admin/aprovar/:id', LicencaController.aprovarSolicitacao);

module.exports = router;
