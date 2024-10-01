document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('registerForm');
    const mensagem = document.getElementById('mensagem');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const user = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            password_confirmation: document.getElementById('password_confirmation').value
        };

        // Enviar os dados do usuário via API
        fetch('http://localhost:8000/api/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 200) {
                console.log("🚀 ~ form.addEventListener ~ data:", data);
                // Sucesso no cadastro
                mensagem.textContent = `Usuário ${user.name} foi cadastrado com sucesso! Bem-vindo(a)!`;
                form.reset();
            } else {
                // Erro no cadastro
                console.log("🚀 ~ form.addEventListener ~ data error:", data);
                mensagem.textContent = 'Erro no cadastro: ' + data.mensagem;
            }
        })
        .catch(error => {
            // Erro na comunicação com a API
            console.log("🚀 ~ form.addEventListener ~ error:", error);
            mensagem.textContent = 'Erro ao realizar o cadastro. Tente novamente.';
        });
    });
});
