// script/index.js
document.getElementById('formLogin').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const divMensagem = document.getElementById('mensagem');

    try {
        const resposta = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divMensagem.style.color = 'green';
            divMensagem.innerText = 'Login com sucesso! Redirecionando...';
            
            localStorage.setItem('token', dados.token);
            localStorage.setItem('perfil', dados.usuario.perfil);
            if (dados.usuario.perfil === 'BIBLIOTECARIO') {
                window.location.href = 'dashboard-bibliotecario.html';
            } else {
                console.log("Vai para tela do Aluno (Em breve)");
            }
        } else {
            divMensagem.style.color = 'red';
            divMensagem.innerText = dados.erro;
        }
    } catch (erro) {
        divMensagem.innerText = 'Erro ao conectar com o servidor.';
    }
});