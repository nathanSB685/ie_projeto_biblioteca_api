require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json()); // permite que o Express entenda JSON no body da requisição

// rota de login unificada
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    // verifica se o usuário existe no banco
    const userQuery = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email],
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado." });
    }

    const usuario = userQuery.rows[0];

    // compara a senha digitada com a hash criptografada no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha incorreta." });
    }

    // gera o Token JWT contendo o ID e o Perfil (Role) do usuário
    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }, // O token expira em 8 horas
    );

    res.json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil, // O front-end usará isso para saber qual tela mostrar
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
