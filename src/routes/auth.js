// src/routes/auth.js
import express from 'express';
import { loginUsuario, loginRevenda } from '../controllers/authController.js';

const router = express.Router();

// Prefixo final será /auth/usuario/login e /auth/revenda/login
router.post('/usuario/login', loginUsuario);
router.post('/revenda/login', loginRevenda);

export default router;
