require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Importa as rotas
const authRoutes = require("./src/routes/authRoutes");
const livroRoutes = require("./src/routes/livroRoutes");
const AI_Routes = require("./src/routes/AI_Routes");
const emprestimoRoutes = require("./src/routes/emprestimoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Diz para o Express usar as rotas de autenticação
// O '/api' é um prefixo. Então a rota final fica: /api/login
app.use("/api", authRoutes);
app.use("/api", livroRoutes);
app.use("/api", AI_Routes);
app.use("/api", emprestimoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
