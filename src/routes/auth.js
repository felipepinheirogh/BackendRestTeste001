// src/routes/auth.js
import express from 'express';
import { loginUsuario, loginRevenda } from '../controllers/authController.js';

const router = express.Router();

router.post('/usuario/login', loginUsuario);
router.post('/revenda/login', loginRevenda);

export default router;


// import express from 'express';
// import { login } from '../controllers/authController.js';

// const router = express.Router();

// router.post('/login', login);

// export default router;


// Exemplo de Token gerado
// json
// {
//   "tipo": "usuario", // ou "usuario_revenda"
//   "id": "uuid-do-usuario",
//   "email": "exemplo@email.com",
//   "iat": 1234567890,
//   "exp": 1234569999
// }




// import express from 'express';
// import { login } from '../controllers/authController.js';

// const router = express.Router();

// router.post('/login', login);

// export default router;


// // Exemplo de payload do JWT gerado
// // json
// // {
// //   "id": "d242e612-xxxx",
// //   "tipo": "usuario",
// //   "nivel_permissao": 900,
// //   "grupo_permissao_id": "b2ff-xxxx-xxxx",
// //   "iat": 1719000000,
// //   "exp": 1719043200
// // }