const API_URL = "https://sua-api-no-render.onrender.com/api";

// ==========================
// LOGIN
// ==========================
async function login(email, senha) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ email, senha })
    });

    const data = await response.json();
    
    if (data.token) {
        // Salva o token para usar nas outras rotas
        localStorage.setItem('token_biblioteca', data.token);
        console.log("Login realizado!");
    } else {
        console.log("Erro no login");
    }
}

// ==========================
// IA - LER CAPA
// ==========================
async function analisarCapaComIA(arquivoImagem) {
    const token = localStorage.getItem('token_biblioteca');

    const formData = new FormData();
    formData.append('imagem', arquivoImagem);

    const response = await fetch(`${API_URL}/ler-capa`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}` 
        },
        body: formData
    });

    return await response.json(); // { titulo, autor, editora }
}

// ==========================
// EMPRÉSTIMO
// ==========================
async function pegarLivroEmprestado(livroId, usuarioId) {
    const token = localStorage.getItem('token_biblioteca');

    const response = await fetch(`${API_URL}/emprestimos`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
            livro_id: livroId, 
            usuario_id: usuarioId 
        })
    });

    return await response.json();
}

// ==========================
// DEVOLUÇÃO
// ==========================
async function devolverLivro(emprestimoId) {
    const token = localStorage.getItem('token_biblioteca');

    const response = await fetch(`${API_URL}/emprestimos/${emprestimoId}/devolucao`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}` 
        }
    });

    return await response.json();
}

// ==========================
// HISTÓRICO
// ==========================
async function carregarMeuHistorico() {
    const token = localStorage.getItem('token_biblioteca');

    const response = await fetch(`${API_URL}/meus-emprestimos`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}` 
        }
    });

    return await response.json();
}

function Aba(id) {
    const abas = document.querySelectorAll('.tab-content');

    abas.forEach(aba => {
        aba.classList.remove('active');
    });

    document.getElementById(id).classList.add('active');
}

// Voltar para Home
function irParaHome() {
    Aba('home');
}

// ==========================
// BUSCA DE LIVROS (SIMPLES)
// ==========================
document.getElementById("btnBuscar").addEventListener("click", function () {
    const termo = document.getElementById("inputBusca").value;
    const resultado = document.getElementById("resultadoAPI");

    // Limpa resultados anteriores
    resultado.innerHTML = "";

    if (termo.trim() === "") {
        resultado.innerHTML = "<p>Digite algo para buscar.</p>";
        return;
    }

    // Simulação de resultado (sem API externa)
    const livro = `
        <div class="livro-card-item">
            <h4>${termo}</h4>
            <p>Autor desconhecido</p>
        </div>
    `;

    resultado.innerHTML += livro;
});

// ==========================
// CADASTRO DE LIVROS
// ==========================
document.getElementById("formCadastro").addEventListener("submit", function (e) {
    e.preventDefault(); // impede recarregar página

    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const ano = document.getElementById("ano").value;

    if (!titulo || !autor || !ano) {
        alert("Preencha todos os campos!");
        return;
    }

    alert(`Livro cadastrado!\n\nTítulo: ${titulo}\nAutor: ${autor}\nAno: ${ano}`);

    // Limpar formulário
    this.reset();
});

// ==========================
// INTERAÇÃO COM GÊNEROS
// ==========================
const generos = document.querySelectorAll(".genero-card");

generos.forEach(genero => {
    genero.addEventListener("click", () => {
        alert(`Você selecionou: ${genero.innerText}`);
    });
});
