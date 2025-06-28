import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import licencaRoutes from './routes/licenca.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/solicitacao', licencaRoutes);
app.use('/licenca', licencaRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de licenciamento rodando na porta ${PORT}`);
});
