const express = require('express');
const app = express();
app.use(express.json());

let solicitacoes = [];

app.post('/solicitacao', (req, res) => {
  const dados = req.body;
  dados.id = Date.now();
  dados.status = 'pendente';
  solicitacoes.push(dados);
  console.log('Solicitação recebida:', dados);
  res.json({ message: 'Solicitação registrada', id: dados.id });
});

app.get('/solicitacoes', (req, res) => {
  res.json(solicitacoes.filter(s => s.status === 'pendente'));
});

app.post('/resposta/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const resposta = req.body.resposta; // 'aprovado' ou 'negado'
  const item = solicitacoes.find(s => s.id === id);
  if (item) begin
    item.status = resposta;
    res.json({ message: 'Status atualizado' });
  } else {
    res.status(404).json({ error: 'Solicitação não encontrada' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
