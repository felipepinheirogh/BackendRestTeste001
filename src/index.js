import express from 'express';
import cors from 'cors';

import usuarioRoutes from './routes/usuario.js';
import revendaRoutes from './routes/revenda.js';
import permissoesRoutes from './routes/permissoes.js';
import grupoPermissoesRoutes from './routes/grupoPermissoes.js';
const app = express();
app.use(cors());
app.use(express.json());

// 🔌 Rotas da API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/revendas', revendaRoutes);
app.use('/api/permissoes', permissoesRoutes);
app.use('/api/permissoes/grupos', grupoPermissoesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));




import permissoesRouter from './routes/permissoes.js';
import { authorize } from './middlewares/authorize.js';
// Exemplo de uso no app
app.use('/permissoes', permissoesRouter);

// Exemplo de rota protegida que exige permissão 'acesso_admin' nível mínimo 5
app.get('/admin/dashboard', authorize('acesso_admin', 5, 'usuario'), (req, res) => {
  res.send('Dashboard Admin');
});



import authRoutes from './routes/auth.js';
app.use('/auth', authRoutes);






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
