require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const Tesseract = require("tesseract.js");

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumenta o limite para receber a foto

// Rota para cadastrar novos usuários
app.post("/api/cadastro", async (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  try {
    // Criptografa a senha que vem do frontend antes de salvar no banco
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

    const novoUsuario = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, perfil",
      [nome, email, senhaCriptografada, perfil]
    );

    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    res.status(500).json({ erro: "Erro ao cadastrar. O email já existe?" });
  }
});

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

// Rota para o Bibliotecário CADASTRAR um novo livro
app.post("/api/livros", async (req, res) => {
    const { titulo, autor, editora, quantidade } = req.body;
  
    try {
        // quantidade_total e quantidade_disponivel recebem o mesmo valor na hora do cadastro
        const novoLivro = await pool.query(
            "INSERT INTO livros (titulo, autor, editora, quantidade_total, quantidade_disponivel) VALUES ($1, $2, $3, $4, $4) RETURNING *",
            [titulo, autor, editora, quantidade]
        );
        res.status(201).json({ mensagem: "Livro cadastrado com sucesso!", livro: novoLivro.rows[0] });
    } catch (error) {
        // AGORA SIM: Se der erro, vamos ver o motivo exato que o Supabase está reclamando!
        console.error("ERRO REAL DO BANCO:", error.message);
        res.status(500).json({ erro: "Erro no banco de dados: " + error.message });
    }
});

// Rota para VER todos os livros cadastrados
app.get("/api/livros", async (req, res) => {
    try {
        const livros = await pool.query("SELECT * FROM livros ORDER BY id DESC");
        res.json(livros.rows);
    } catch (error) {
        console.error("Erro ao buscar livros:", error);
        res.status(500).json({ erro: "Erro ao carregar a lista de livros." });
    }
});

// Rota REAL da Inteligência Artificial (OCR com Tesseract)
// Rota da Inteligência Artificial (Megazord: OCR + Google Books)
// Rota da Inteligência Artificial (Megazord: OCR + Google Books)
app.post("/api/ler-capa", async (req, res) => {
    const { imagem } = req.body;

    if (!imagem) {
        return res.status(400).json({ erro: "Nenhuma imagem foi enviada." });
    }

    try {
        console.log("1. Tesseract lendo os pixels da imagem...");
        
        const { data: { text } } = await Tesseract.recognize(imagem, 'por');

        // LIMPEZA EXTREMA: Remove qualquer símbolo estranho (@, #, !, etc) que a IA inventar
        // Mantém apenas letras, números e espaços
        let textoLimpo = text.replace(/[^a-zA-Z0-9áéíóúãõçÁÉÍÓÚÃÕÇ ]/g, ' ').replace(/\s+/g, ' ').trim();
        console.log("Texto limpo para busca:", textoLimpo);

        // Se mesmo depois de limpar, sobrar pouca coisa
        if (!textoLimpo || textoLimpo.length < 4) {
            return res.status(404).json({ erro: "A IA não conseguiu ler a fonte desta capa. Use a busca por texto ao lado!" });
        }

        console.log("2. Perguntando ao Google Books...");
        
        // Pega no máximo os primeiros 40 caracteres pra não confundir o Google com texto demais
        const buscaPesquisa = encodeURIComponent(textoLimpo.substring(0, 40));
        const urlGoogleBooks = `https://www.googleapis.com/books/v1/volumes?q=${buscaPesquisa}&maxResults=1`;

        const respostaGoogle = await fetch(urlGoogleBooks);
        const dadosGoogle = await respostaGoogle.json();

        // SE O GOOGLE NÃO ACHAR, NÃO PREENCHE NADA COM LIXO!
        if (!dadosGoogle.items || dadosGoogle.items.length === 0) {
             return res.status(404).json({ erro: "Livro não encontrado na base de dados pela capa. Use a busca por texto!" });
        }

        // Se achou com sucesso, preenche certinho!
        const infoLivro = dadosGoogle.items[0].volumeInfo;

        res.json({
            titulo: infoLivro.title || "",
            autor: infoLivro.authors ? infoLivro.authors[0] : "",
            editora: infoLivro.publisher || ""
        });

    } catch (error) {
        console.error("Erro no processo de IA:", error);
        res.status(500).json({ erro: "Falha ao processar a leitura da imagem." });
    }
});

// Rota para buscar dados de um livro digitando o nome
// Rota REAL para buscar dados de um livro usando a API do Google Books
app.post("/api/buscar-livro", async (req, res) => {
    const { tituloBusca } = req.body;

    if (!tituloBusca) {
        return res.status(400).json({ erro: "Digite um título para buscar." });
    }

    try {
        console.log(`Consultando o Google Books para o livro: "${tituloBusca}"...`);
        
        // Formata o texto para a URL (ex: transforma espaços em %20)
        const buscaFormatada = encodeURIComponent(tituloBusca);
        const urlGoogleBooks = `https://www.googleapis.com/books/v1/volumes?q=intitle:${buscaFormatada}&maxResults=1`;

        // O Node.js vai na internet consultar o Google
        const respostaGoogle = await fetch(urlGoogleBooks);
        const dadosGoogle = await respostaGoogle.json();

        // Verifica se o Google encontrou algum livro
        if (!dadosGoogle.items || dadosGoogle.items.length === 0) {
            return res.status(404).json({ erro: "Livro não encontrado na base de dados do Google." });
        }

        // Pega as informações do primeiro livro que o Google retornou
        const infoLivro = dadosGoogle.items[0].volumeInfo;

        // Retorna para a sua tela do bibliotecário
        res.json({
            titulo: infoLivro.title || tituloBusca,
            // Se não achar o autor, deixa em branco ("")
            autor: infoLivro.authors ? infoLivro.authors[0] : "", 
            // Se não achar a editora, deixa em branco ("")
            editora: infoLivro.publisher || "" 
        });

    } catch (error) {
        console.error("Erro na busca online:", error);
        res.status(500).json({ erro: "Falha ao se conectar com o Google Books." });
    }
});