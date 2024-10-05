// Função para registrar o usuário
async function registerUser(user) {    
    try {
        const response = await fetch('http://localhost:8000/api/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        const data = await response.json();

        if (data.status === 200) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'login.html'; // Redireciona para o login após o cadastro
        } else {
            alert(`Erro: ${data.message}`);
        }
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        alert('Erro ao cadastrar o usuário!');
    }
}

// Função para login do usuário
async function loginUser(email, password) {    
    try {
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Armazena o token e o ID do usuário logado no localStorage
            localStorage.setItem('token', data.usuario.token);
            localStorage.setItem('userId', data.usuario.id);

            alert('Login realizado com sucesso!');
            window.location.href = 'dashboard.html'; // Redireciona para o dashboard após o login
        } else {
            alert(`Erro: ${data.message}`);
        }
    } catch (error) {
        console.error('Erro ao logar:', error);
        alert('Erro ao realizar o login!');
    }
}

// Função para listar os usuários
async function listarUsuarios() {
    const token = localStorage.getItem('token');
    const userIdLogado = localStorage.getItem('userId');

    try {
        if (token) {
            const response = await fetch('http://localhost:8000/api/user/listar', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const usuarios = await response.json();
                const tabelaUsuarios = document.getElementById('tabelaUsuarios');
                tabelaUsuarios.innerHTML = '';

                usuarios.user.data.forEach((usuario, index) => {
                    const dataCriacao = new Date(usuario.created_at);
                    const dataFormatada = dataCriacao.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });                    

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${usuario.name}</td>
                        <td>${usuario.email}</td>
                        <td>${dataFormatada}</td>
                        <td>
                            ${
                                usuario.id != userIdLogado 
                                ? `<button class="btn btn-danger btn-sm excluir-usuario" data-id="${usuario.id}">
                                    <i class="fas fa-trash-alt"></i>
                                   </button>`
                                : ''
                            }
                        </td>
                    `;
                    tabelaUsuarios.appendChild(row);
                });

                // Evento para excluir o usuário
                document.querySelectorAll('.excluir-usuario').forEach(button => {
                    button.addEventListener('click', async function() {
                        const userId = this.getAttribute('data-id');
                        const confirmar = confirm('Tem certeza que deseja excluir este usuário?');
                        if (confirmar) {
                            await excluirUsuario(userId);
                        }
                    });
                });
            } else {
                throw new Error('Erro ao buscar os usuários');
            }
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar a lista de usuários');
    }
}

// Função para excluir o usuário
async function excluirUsuario(userId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:8000/api/deletar/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            alert('Usuário deletado com sucesso!');
            listarUsuarios(); // Atualiza a lista de usuários
        } else {
            alert(`Erro: ${data.message}`);
        }
    } catch (error) {
        console.error('Erro ao excluir o usuário:', error);
        alert('Erro ao excluir o usuário!');
    }
}

// Função para deslogar o usuário
function logoutUser() {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.ok) {
            localStorage.clear();
            alert('Deslogado com sucesso!');
            window.location.href = 'login.html';
        } else {
            alert('Erro ao deslogar.');
        }
    })
    .catch(error => {
        console.error('Erro ao deslogar:', error);
        alert('Erro ao deslogar!');
    });
}

// Função para carregar o dashboard
function carregarDashboard() {
    const welcomeMessage = document.getElementById('welcomeMessage');

    // Obter o token do localStorage
    const token = localStorage.getItem('token');

    if (token) {
        // Fazer uma requisição para a API protegida para obter os dados do usuário
        fetch('http://localhost:8000/api/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.usuario.name) {
                // Exibir o nome do usuário
                welcomeMessage.textContent = `Bem-vindo, ${data.usuario.name}!`;
            } else {
                // Se não encontrar os dados do usuário, redirecionar para a página de login
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.log("Erro ao obter os dados do usuário:", error);
            window.location.href = 'login.html'; // Redireciona se houver erro
        });
    } else {
        // Redireciona para o login se o token não existir
        window.location.href = 'login.html';
    }
}
