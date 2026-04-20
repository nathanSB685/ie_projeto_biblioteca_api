# 📚 API - Sistema de Gestão de Biblioteca Integrado com IA

API desenvolvida em Node.js e Express para gerenciar o acervo e os empréstimos de uma biblioteca universitária. O sistema conta com autenticação via JWT, controle de perfis (Aluno/Bibliotecário) e integração com Inteligência Artificial (Groq - Llama Vision) para leitura automática de capas de livros.

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js, Express
- **Banco de Dados:** PostgreSQL (Supabase)
- **Segurança:** Autenticação via JWT (JSON Web Tokens)
- **Upload de Arquivos:** Multer
- **Inteligência Artificial:** Groq SDK (Llama 4 Scout Vision)

---

## ⚙️ Como rodar o projeto localmente

1. Clone este repositório.
2. Instale as dependências rodando o comando:
   `npm install`
3. Crie um arquivo `.env` na raiz do projeto com as seguintes chaves (peça os valores reais para a equipe):

   > PORT=3000
   > DATABASE_URL=sua_url_do_supabase_aqui
   > JWT_SECRET=sua_senha_secreta_jwt
   > GROQ_API_KEY=sua_chave_da_api_groq

4. Inicie o servidor de desenvolvimento:
   `npm run dev`

---

## 📌 Rotas da API

### 🔐 Autenticação

- **`POST /api/login`**
  - **Descrição:** Autentica o usuário e retorna o Token JWT.
  - **Body (JSON):** `email`, `senha`

### 📖 Gestão de Livros

- **`GET /api/livros`**
  - **Descrição:** Lista todos os livros disponíveis no acervo. (Acesso logado).
- **`POST /api/livros`**
  - **Descrição:** Cadastra um novo livro manualmente.
  - **Permissão:** 🛡️ Apenas Bibliotecários.
- **`POST /api/ler-capa`**
  - **Descrição:** Recebe a foto da capa de um livro e retorna Título, Autor e Editora usando IA.
  - **Body (Form-Data):** Enviar o arquivo de imagem pelo campo `imagem`.
  - **Permissão:** 🛡️ Apenas Bibliotecários.

### 🔄 Sistema de Empréstimos

- **`POST /api/emprestimos`**
  - **Descrição:** Realiza o empréstimo de um livro (diminui o estoque automaticamente).
  - **Body (JSON):** `livro_id`, `usuario_id`
  - **Permissão:** 👤 Alunos e Bibliotecários.
- **`GET /api/meus-emprestimos`**
  - **Descrição:** Retorna o histórico de empréstimos do aluno logado.
  - **Permissão:** 👤 Alunos e Bibliotecários.
- **`PUT /api/emprestimos/:id/devolucao`**
  - **Descrição:** Registra a devolução de um livro (aumenta o estoque e atualiza status). O `:id` na URL é o ID do empréstimo.
  - **Permissão:** 🛡️ Apenas Bibliotecários.
- **`GET /api/todos-emprestimos`**
  - **Descrição:** Painel de controle. Lista todos os empréstimos do sistema, identificando dinamicamente os atrasos.
  - **Permissão:** 🛡️ Apenas Bibliotecários.

---

_Projeto desenvolvido para a disciplina de Análise e Desenvolvimento de Sistemas._
