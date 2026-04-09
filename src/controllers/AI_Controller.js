const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializa a IA do Google com a sua chave secreta
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analisarCapa = async (req, res) => {
  // Verifica se a imagem realmente chegou
  if (!req.file) {
    return res.status(400).json({ erro: "Nenhuma imagem foi enviada." });
  }

  try {
    console.log("🧠 1. Imagem recebida. Chamando o Gemini...");

    // Prepara o modelo da IA (O 1.5 Flash é super rápido e ótimo para ler imagens)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Converte a imagem que o Multer guardou na memória para o formato que o Google exige
    const imagemParaIA = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    // O Prompt Mágico que controla a IA com mão de ferro
    const prompt = `
            Aja como um assistente de bibliotecário especialista em catalogação.
            Analise a imagem desta capa de livro.
            Retorne EXATAMENTE um objeto JSON válido, sem NENHUM texto antes ou depois, e sem formatação markdown (\`\`\`json).
            Se não encontrar alguma informação, retorne uma string vazia "".
            Use este formato exato:
            {
                "titulo": "Nome do Livro",
                "autor": "Nome do Autor",
                "editora": "Nome da Editora"
            }
        `;

    // Envia a imagem e o prompt para a IA
    const result = await model.generateContent([prompt, imagemParaIA]);
    const respostaTexto = result.response.text();

    console.log("🧠 2. O Gemini respondeu!");

    // Limpa a resposta caso a IA seja teimosa e mande blocos de código markdown (```json ... ```)
    const textoLimpo = respostaTexto
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Transforma o texto em um Objeto JavaScript de verdade
    const dadosDoLivro = JSON.parse(textoLimpo);

    // Devolve pro Front-end tudo mastigado
    res.json(dadosDoLivro);
  } catch (error) {
    console.error("Erro na IA:", error);
    res
      .status(500)
      .json({ erro: "A IA falhou ao ler a imagem. Tente novamente." });
  }
};

module.exports = { analisarCapa };
