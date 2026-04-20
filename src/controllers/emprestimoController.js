// Importe a sua conexão com o banco de dados (ajuste o caminho se necessário)
const pool = require("../config/db");

const criarEmprestimo = async (req, res) => {
  const { livro_id, usuario_id } = req.body;

  if (!livro_id || !usuario_id) {
    return res
      .status(400)
      .json({ erro: "ID do livro e ID do usuário são obrigatórios." });
  }

  // Pega uma "linha direta" exclusiva com o banco para fazer a transação
  const client = await pool.connect();

  try {
    // INICIA A TRANSAÇÃO: Daqui pra baixo, nada é salvo até darmos o comando final
    await client.query("BEGIN");

    // 1. Verifica se o livro existe e se tem estoque
    const livroResult = await client.query(
      "SELECT quantidade_disponivel FROM livros WHERE id = $1",
      [livro_id],
    );

    if (livroResult.rows.length === 0) {
      throw new Error("Livro não encontrado.");
    }

    const estoqueAtual = livroResult.rows[0].quantidade_disponivel;

    if (estoqueAtual <= 0) {
      throw new Error("Este livro está sem estoque no momento.");
    }

    // 2. Tira uma unidade do estoque na tabela de livros
    await client.query(
      "UPDATE livros SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = $1",
      [livro_id],
    );

    // 3. Cria a data de devolução para daqui a 7 dias
    const dataDevolucao = new Date();
    dataDevolucao.setDate(dataDevolucao.getDate() + 7);

    // 4. Registra o empréstimo na tabela nova
    const emprestimoResult = await client.query(
      "INSERT INTO emprestimos (livro_id, usuario_id, data_devolucao_prevista) VALUES ($1, $2, $3) RETURNING *",
      [livro_id, usuario_id, dataDevolucao],
    );

    // CONFIRMA A TRANSAÇÃO: Salva tudo de uma vez no banco!
    await client.query("COMMIT");

    // Responde pro Front-end com sucesso
    res.status(201).json({
      mensagem: "Empréstimo realizado com sucesso!",
      emprestimo: emprestimoResult.rows[0],
    });
  } catch (error) {
    // CANCELA A TRANSAÇÃO: Se deu qualquer erro lá em cima, desfaz tudo (rollback)
    await client.query("ROLLBACK");
    console.error("Erro ao realizar empréstimo:", error);

    // Se for um erro que nós mesmos criamos (ex: sem estoque), mandamos a mensagem certinha
    if (
      error.message.includes("estoque") ||
      error.message.includes("encontrado")
    ) {
      return res.status(400).json({ erro: error.message });
    }

    res.status(500).json({ erro: "Falha interna ao processar o empréstimo." });
  } finally {
    // Libera a "linha direta" para outras requisições poderem usar
    client.release();
  }
};

const devolverLivro = async (req, res) => {
  // Pegamos o ID do empréstimo pela URL (ex: /emprestimos/1/devolucao)
  const { id } = req.params;

  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Inicia a transação

    // 1. Verifica se o empréstimo existe e pega o ID do livro
    const emprestimoResult = await client.query(
      "SELECT livro_id, status FROM emprestimos WHERE id = $1",
      [id],
    );

    if (emprestimoResult.rows.length === 0) {
      throw new Error("Empréstimo não encontrado.");
    }

    if (emprestimoResult.rows[0].status === "DEVOLVIDO") {
      throw new Error("Este livro já foi devolvido anteriormente.");
    }

    const livro_id = emprestimoResult.rows[0].livro_id;

    // 2. Atualiza o status do empréstimo e carimba a data atual
    await client.query(
      "UPDATE emprestimos SET status = 'DEVOLVIDO', data_devolucao_real = CURRENT_TIMESTAMP WHERE id = $1",
      [id],
    );

    // 3. Devolve o livro para a estante (Estoque + 1)
    await client.query(
      "UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = $1",
      [livro_id],
    );

    await client.query("COMMIT"); // Salva tudo
    res.json({
      mensagem: "Livro devolvido com sucesso! O estoque foi atualizado.",
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Cancela tudo se der erro
    console.error("Erro na devolução:", error);

    if (
      error.message.includes("encontrado") ||
      error.message.includes("devolvido")
    ) {
      return res.status(400).json({ erro: error.message });
    }
    res.status(500).json({ erro: "Falha interna ao processar a devolução." });
  } finally {
    client.release();
  }
};

const meusEmprestimos = async (req, res) => {
  // A MÁGICA DO JWT: O ID do usuário vem do token descriptografado!
  // O aluno não precisa mandar o ID dele, o sistema já sabe quem ele é.
  const usuario_id = req.usuario.id;

  try {
    // Usamos o JOIN para juntar a tabela de empréstimos com a de livros
    // Assim o aluno vê o "Título do Livro" em vez de apenas ver "livro_id: 1"
    const result = await pool.query(
      `
            SELECT 
                e.id AS emprestimo_id, 
                l.titulo, 
                l.autor, 
                e.data_emprestimo, 
                e.data_devolucao_prevista, 
                e.data_devolucao_real, 
                e.status 
            FROM emprestimos e
            JOIN livros l ON e.livro_id = l.id
            WHERE e.usuario_id = $1
            ORDER BY e.data_emprestimo DESC
        `,
      [usuario_id],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res
      .status(500)
      .json({ erro: "Falha ao buscar o seu histórico de livros." });
  }
};

const listarTodosEmprestimos = async (req, res) => {
  const client = await pool.connect();

  try {
    // Consulta poderosa com JOIN triplo e cálculo dinâmico de status
    const query = `
            SELECT 
                e.id AS emprestimo_id, 
                u.nome AS nome_aluno, 
                u.email AS email_aluno, 
                l.titulo AS titulo_livro, 
                e.data_emprestimo, 
                e.data_devolucao_prevista, 
                e.data_devolucao_real,
                -- A mágica do SQL: Se o prazo passou e ainda não devolveu, avisa que está ATRASADO
                CASE 
                    WHEN e.status = 'ATIVO' AND e.data_devolucao_prevista < CURRENT_TIMESTAMP THEN 'ATRASADO'
                    ELSE e.status 
                END AS status_atual
            FROM emprestimos e
            JOIN usuarios u ON e.usuario_id = u.id
            JOIN livros l ON e.livro_id = l.id
            ORDER BY 
                status_atual ASC, -- Mostra os ATIVOS e ATRASADOS no topo
                e.data_devolucao_prevista ASC; -- Ordena pela data de vencimento mais próxima
        `;

    const result = await client.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar todos os empréstimos:", error);
    res.status(500).json({ erro: "Falha ao buscar o painel de empréstimos." });
  } finally {
    client.release();
  }
};

module.exports = {
  criarEmprestimo,
  devolverLivro,
  meusEmprestimos,
  listarTodosEmprestimos,
};
