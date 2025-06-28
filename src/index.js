// src/index.js
import express from 'express';
import cors from 'cors';

import usuarioRoutes from './routes/usuario.js';
import revendaRoutes from './routes/revenda.js';
import permissoesRoutes from './routes/permissoes.js';
import grupoPermissoesRoutes from './routes/grupoPermissoes.js';
import authRoutes from './routes/auth.js';
import licencaRoutes from './routes/licenca.js';
import adminRoutes from './routes/admin.js';
import { authorize } from './middlewares/authorize.js';

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Rotas públicas
app.use('/auth', authRoutes);

// ✅ Rotas principais
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/revendas', revendaRoutes);
app.use('/api/permissoes', permissoesRoutes);
app.use('/api/permissoes/grupos', grupoPermissoesRoutes);
app.use('/api/licencas', licencaRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Rota protegida de exemplo com middleware de autorização
app.get('/admin/dashboard', authorize('acesso_admin', 5, 'usuario'), (req, res) => {
  res.send('Dashboard Admin');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));







// import express from 'express';
// import cors from 'cors';
// import bodyParser from 'body-parser';

// import licencaRoutes from './routes/licenca.js';
// import adminRoutes from './routes/admin.js';

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// // Rotas
// app.use('/solicitacao', licencaRoutes);
// app.use('/licenca', licencaRoutes);
// app.use('/admin', adminRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor de licenciamento rodando na porta ${PORT}`);
// });
