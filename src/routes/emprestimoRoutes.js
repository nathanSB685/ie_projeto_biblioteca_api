const express = require("express");
const router = express.Router();
const emprestimoController = require("../controllers/emprestimoController");

const {
  verificarToken,
  apenasBibliotecario,
} = require("../middlewares/authMiddleware");

// rota POST para criar um empréstimo (protegida pelo token JWT)
router.post(
  "/emprestimos",
  verificarToken,
  emprestimoController.criarEmprestimo,
);

// O ":id" na URL representa o ID do EMPRÉSTIMO (não do livro)
router.put(
  "/emprestimos/:id/devolucao",
  verificarToken,
  apenasBibliotecario,
  emprestimoController.devolverLivro,
);

// Histórico do aluno
router.get(
  "/meus-emprestimos",
  verificarToken,
  emprestimoController.meusEmprestimos,
);

// Painel Administrativo: Apenas a bibliotecária pode ver todos os empréstimos
router.get(
  "/todos-emprestimos",
  verificarToken,
  apenasBibliotecario,
  emprestimoController.listarTodosEmprestimos,
);

module.exports = router;
