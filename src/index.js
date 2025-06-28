import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import usuarioRoutes from './routes/usuario.js';
import revendaRoutes from './routes/revenda.js';
import permissoesRoutes from './routes/permissoes.js';
import grupoPermissoesRoutes from './routes/grupoPermissoes.js';

import { authorize } from './middlewares/authorize.js';

const app = express();
app.use(cors());
app.use(express.json());

// Rotas públicas
app.use('/auth', authRoutes);

// Rotas protegidas e organizadas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/revendas', revendaRoutes);
app.use('/api/permissoes', permissoesRoutes);
app.use('/api/permissoes/grupos', grupoPermissoesRoutes);

// Exemplo de rota protegida
app.get('/admin/dashboard', authorize('acesso_admin', 5, 'usuario'), (req, res) => {
  res.send('Dashboard Admin');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
