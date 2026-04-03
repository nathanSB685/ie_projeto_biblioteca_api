require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importa as rotas
const authRoutes = require('./src/routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Diz para o Express usar as rotas de autenticação
// O '/api' é um prefixo. Então a rota final fica: /api/login
app.use('/api', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});