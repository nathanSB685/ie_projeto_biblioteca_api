// script/dashboard.js

// Verifica se o usuário realmente está logado antes de mostrar a tela
const token = localStorage.getItem('token');
const perfil = localStorage.getItem('perfil');

if (!token || perfil !== 'BIBLIOTECARIO') {
    alert("Acesso negado. Faça login como Bibliotecário.");
    window.location.href = 'index.html';
}

// Lógica de Cadastro do Livro
document.getElementById('formLivro').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const editora = document.getElementById('editora').value;
    const quantidade = document.getElementById('quantidade').value;
    const divMensagem = document.getElementById('mensagem');

    try {
        const resposta = await fetch('http://localhost:3000/api/livros', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Enviamos o token de segurança no cabeçalho
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ titulo, autor, editora, quantidade })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divMensagem.style.color = 'green';
            divMensagem.innerText = dados.mensagem;
            document.getElementById('formLivro').reset(); // Limpa o formulário
        } else {
            divMensagem.style.color = 'red';
            divMensagem.innerText = dados.erro;
        }
    } catch (erro) {
        divMensagem.style.color = 'red';
        divMensagem.innerText = 'Erro ao conectar com o servidor.';
    }
});

// Lógica do botão de Sair
document.getElementById('btnSair').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('perfil');
    window.location.href = 'index.html';
});

// A MÁGICA DA IA ACONTECE AQUI
document.getElementById('btnLerCapa').addEventListener('click', async () => {
    const inputFoto = document.getElementById('fotoCapa');
    const divMensagem = document.getElementById('mensagem');

    if (inputFoto.files.length === 0) {
        alert("Por favor, tire uma foto ou selecione uma imagem da capa primeiro.");
        return;
    }

    divMensagem.style.color = 'blue';
    divMensagem.innerText = '🤖 A IA está lendo a capa... aguarde!';

    const arquivo = inputFoto.files[0];
    
    // Transforma a imagem num formato que o Node entende (Base64)
    const leitor = new FileReader();
    leitor.readAsDataURL(arquivo);
    leitor.onload = async () => {
        const imagemBase64 = leitor.result;

        try {
            const resposta = await fetch('http://localhost:3000/api/ler-capa', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ imagem: imagemBase64 })
            });

            const dadosIA = await resposta.json();

            if (resposta.ok) {
                // Preenche os campos automaticamente com o que a IA devolveu!
                document.getElementById('titulo').value = dadosIA.titulo || '';
                document.getElementById('autor').value = dadosIA.autor || '';
                document.getElementById('editora').value = dadosIA.editora || '';
                divMensagem.style.color = 'green';
                divMensagem.innerText = '✨ Informações preenchidas! Revise e clique em Salvar.';
            } else {
                divMensagem.style.color = 'red';
                divMensagem.innerText = 'Erro na IA: ' + dadosIA.erro;
            }
        } catch (erro) {
            divMensagem.style.color = 'red';
            divMensagem.innerText = 'Erro ao conectar com a IA no servidor.';
        }
    };
});

// A MÁGICA DA BUSCA POR TEXTO ACONTECE AQUI
document.getElementById('btnBuscarTitulo').addEventListener('click', async () => {
    const tituloBusca = document.getElementById('buscaTitulo').value;
    const divMensagem = document.getElementById('mensagem');

    if (!tituloBusca) {
        alert("Por favor, digite o nome do livro primeiro.");
        return;
    }

    divMensagem.style.color = 'blue';
    divMensagem.innerText = '🔍 Buscando na base de dados online...';

    try {
        const resposta = await fetch('http://localhost:3000/api/buscar-livro', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tituloBusca })
        });

        const dadosAPI = await resposta.json();

        if (resposta.ok) {
            // Preenche os campos de baixo!
            document.getElementById('titulo').value = dadosAPI.titulo || '';
            document.getElementById('autor').value = dadosAPI.autor || '';
            document.getElementById('editora').value = dadosAPI.editora || '';
            
            divMensagem.style.color = 'green';
            divMensagem.innerText = '✨ Dados encontrados e preenchidos!';
        } else {
            divMensagem.style.color = 'red';
            divMensagem.innerText = 'Erro na busca: ' + dadosAPI.erro;
        }
    } catch (erro) {
        divMensagem.style.color = 'red';
        divMensagem.innerText = 'Erro ao conectar com a API de livros.';
    }
});