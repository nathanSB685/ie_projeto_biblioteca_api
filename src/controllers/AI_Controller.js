const Groq = require("groq-sdk");

// Inicializa a IA da Groq com a sua chave secreta
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const analisarCapa = async (req, res) => {
  // Verifica se a imagem realmente chegou
  if (!req.file) {
    return res.status(400).json({ erro: "Nenhuma imagem foi enviada." });
  }

  try {
    console.log("🧠 1. Imagem recebida. Chamando a Groq (Llama 3.2 Vision)...");

    // Converte a imagem da memória para o formato Base64 URL que a Groq aceita
    const base64Image = req.file.buffer.toString("base64");
    const imagemParaIA = `data:${req.file.mimetype};base64,${base64Image}`;

    // Envia a requisição para a AI
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Analise a imagem desta capa de livro. Retorne um JSON com os campos "titulo", "autor" e "editora". Se não encontrar alguma informação, deixe a string vazia "".',
            },
            {
              type: "image_url",
              image_url: { url: imagemParaIA },
            },
          ],
        },
      ],
      // Modelo usado de AI
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0,
      // Força a AI devolver em JSON
      response_format: { type: "json_object" },
    });

    console.log("🧠 2. A Groq respondeu!");

    // Pega a resposta de texto
    const respostaTexto = chatCompletion.choices[0].message.content;

    // Converte o texto em Objeto JavaScript
    const dadosDoLivro = JSON.parse(respostaTexto);

    // Devolve pro Front-end
    res.json(dadosDoLivro);
  } catch (error) {
    console.error("Erro na IA:", error);
    res
      .status(500)
      .json({ erro: "A IA falhou ao ler a imagem. Tente novamente." });
  }
};

module.exports = { analisarCapa };
