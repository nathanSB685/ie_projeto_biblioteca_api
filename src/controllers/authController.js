const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        // busca o usuário no banco de dados
        const userQuery = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        // verifica se o usuário existe
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ erro: 'Usuário não encontrado.' });
        }

        const usuario = userQuery.rows[0];
        
        // compara a senha digitada com a criptografada no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaValida) {
            return res.status(401).json({ erro: 'Senha incorreta.' });
        }

        // gera o Token JWT
        const token = jwt.sign(
            { id: usuario.id, perfil: usuario.perfil },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // retorna o token
        res.json({
            mensagem: 'Login realizado com sucesso!',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });

    } catch (error) {
        // se algo der errado cai aqui
        console.error('Erro no login:', error);
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

module.exports = { login };