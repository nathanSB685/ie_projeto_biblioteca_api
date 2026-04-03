const pool = require('../config/db');

const cadastrarLivro = async (req, res) => {
    // adicionamos a capa_url aqui para receber do Front-end/IA
    const { titulo, autor, editora, isbn, capa_url, quantidade } = req.body;

    try {
        const query = `
            INSERT INTO livros (titulo, autor, editora, capa_url, quantidade_total, quantidade_disponivel)
            VALUES ($1, $2, $3, $4, $5, $5)
            RETURNING *;
        `;
        
        // a ordem dos valores precisa bater exatamente com a ordem dos $1, $2, etc...
        const valores = [titulo, autor, editora, capa_url, quantidade];
        const resultado = await pool.query(query, valores);

        res.status(201).json({
            mensagem: 'Livro cadastrado com sucesso!',
            livro: resultado.rows[0]
        });

    } catch (error) {
        console.error('Erro ao cadastrar livro:', error);
        
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

module.exports = { cadastrarLivro };