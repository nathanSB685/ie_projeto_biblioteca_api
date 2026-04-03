const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // pega o token do cabeçalho da requisição
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN_AQUI"

    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    try {
        // verifica se o token é verdadeiro e foi gerado com o nosso segredo
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decodificado; // guarda as informações (id, perfil) para usar depois
        next(); // deixa a requisição passar para o Controller
    } catch (error) {
        res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
};

const apenasBibliotecario = (req, res, next) => {
    if (req.usuario.perfil !== 'BIBLIOTECARIO') {
        return res.status(403).json({ erro: 'Acesso negado. Apenas bibliotecários podem realizar esta ação.' });
    }
    next();
};

module.exports = { verificarToken, apenasBibliotecario };