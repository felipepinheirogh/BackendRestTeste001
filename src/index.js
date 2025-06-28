import express from 'express';
import cors from 'cors';

// Importação de rotas
import authRoutes from './routes/auth.js';
import usuarioRoutes from './routes/usuario.js';
import revendaRoutes from './routes/revenda.js';
import permissoesRoutes from './routes/permissoes.js';
import grupoPermissoesRoutes from './routes/grupoPermissoes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Registro de rotas principais
app.use('/auth', authRoutes); // ⬅️ essa é a que ativa /auth/login
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/revendas', revendaRoutes);
app.use('/api/permissoes', permissoesRoutes);
app.use('/api/permissoes/grupos', grupoPermissoesRoutes);

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
