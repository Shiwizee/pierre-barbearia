const express = require('express');
const cors = require('cors');
const { iniciarExpiracaoAutomatica } = require('./src/jobs/expirarAgendamentos');
require('dotenv').config();

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rotas
app.use('/auth', require('./src/routes/auth'));
app.use('/agendamentos', require('./src/routes/agendamentos'));
app.use('/servicos', require('./src/routes/servicos'));
app.use('/horarios', require('./src/routes/horarios'));
app.use('/usuarios', require('./src/routes/usuarios'));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ mensagem: 'API Pierre Barbearia funcionando!' });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  iniciarExpiracaoAutomatica();
});