const express = require('express');
const router = express.Router();
const livroController = require('../controllers/livroController');
const { verificarToken, apenasBibliotecario } = require('../middlewares/authMiddleware');

// ROTA PROTEGIDA: api/livros
// passa pelo verificador de token, verificador de perfil, e só então chega no cadastro
router.post('/livros', verificarToken, apenasBibliotecario, livroController.cadastrarLivro);

module.exports = router;