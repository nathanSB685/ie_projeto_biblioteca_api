// script/cadastro.js
document.getElementById('formCadastro').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const perfil = document.getElementById('perfil').value;
    const divMensagem = document.getElementById('mensagem');

    try {
        const resposta = await fetch('http://localhost:3000/api/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, perfil })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divMensagem.style.color = 'green';
            divMensagem.innerText = dados.mensagem + ' Vá para a tela de login!';
        } else {
            divMensagem.style.color = 'red';
            divMensagem.innerText = dados.erro;
        }
    } catch (erro) {
        divMensagem.innerText = 'Erro ao conectar com o servidor.';
    }
});