// Função para registrar o usuário
async function registerUser(user) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(user.password)) {
        alert('A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial.');
        return;
    }

    // Verifica se a confirmação da senha é igual à senha
    if (user.password !== user.password_confirmation) {
        alert('A confirmação da senha não corresponde à senha.');
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        if (!response.ok) {
            // Se a resposta não for bem-sucedida, tenta capturar os erros de validação
            const data = await response.json();
            if (response.status === 302) {
                // Exibe as mensagens de erro no frontend
                const errors = data.errors;
                let errorMessages = '';

                for (const key in errors) {
                    if (errors.hasOwnProperty(key)) {
                        errorMessages += `${errors[key].join(' ')}\n`; // Concatena todas as mensagens de erro
                    }
                }

                alert(errorMessages); // Exibe as mensagens de erro
            } else {
                // Exibe a mensagem de erro genérica, caso o status não seja 422
                alert(`Erro: ${data.message}`);
            }
            return;
        }

        const data = await response.json();

        if (data.status === 200) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'login.html'; // Redireciona para o login após o cadastro
        } else {
            alert(`Erro: ${data.message}`);
        }
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        alert('Erro ao cadastrar o usuário! ' + `${data.message}`);
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
                            <button class="btn btn-info btn-sm visualizar-usuario" data-id="${usuario.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-primary btn-sm editar-usuario" data-id="${usuario.id}">
                                <i class="fas fa-pen"></i>
                            </button>
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

                document.querySelectorAll('.editar-usuario').forEach(button => {
                    button.addEventListener('click', function() {
                        const userId = this.getAttribute('data-id');
                        editarUsuario(userId); // Chama a função para editar
                    });
                });

                // Adiciona o evento de clique para visualizar o usuário
                document.querySelectorAll('.visualizar-usuario').forEach(button => {
                    button.addEventListener('click', function() {
                        const userId = this.getAttribute('data-id');
                        visualizarUsuario(userId);
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

// Função para visualizar o usuário
function visualizarUsuario(userId) {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8000/api/user/visualizar/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {        
        // Preenche os dados do modal
        document.getElementById('usuarioNome').textContent = data.user.name;
        document.getElementById('usuarioEmail').textContent = data.user.email;

        const dataCriacao = new Date(data.user.created_at);
        document.getElementById('usuarioDataCriacao').textContent = dataCriacao.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        // Abre o modal de visualização
        const visualizarModal = new bootstrap.Modal(document.getElementById('visualizarUsuarioModal'));
        visualizarModal.show();
    })
    .catch(error => {
        console.error('Erro ao visualizar o usuário:', error);
    });
}

async function editarUsuario(userId) {
    const token = localStorage.getItem('token');

    document.getElementById('alterarSenhaBtn').addEventListener('click', function() {
        const senhaFields = document.getElementById('senhaFields');
        const senhaConfirmationFields = document.getElementById('senhaConfirmationFields');
    
        // Alterna a visibilidade dos campos de senha
        if (senhaFields.style.display === 'none') {
            senhaFields.style.display = 'block';
            senhaConfirmationFields.style.display = 'block';
        } else {
            senhaFields.style.display = 'none';
            senhaConfirmationFields.style.display = 'none';
        }
    });

    try {
        const response = await fetch(`http://localhost:8000/api/user/visualizar/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();

            // Preencher o formulário de edição com os dados do usuário
            document.getElementById('editName').value = data.user.name;
            document.getElementById('editEmail').value = data.user.email;
            document.getElementById('userId').value = userId; // Esconde o ID do usuário no formulário

            // Exibe o modal de edição (ou exibe um formulário em outro local)
            // document.getElementById('editarUsuarioModal').style.display = 'block';
            const editarUsuarioModal = new bootstrap.Modal(document.getElementById('editarUsuarioModal'));
            editarUsuarioModal.show();
        } else {
            alert('Erro ao carregar os dados do usuário.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar os dados do usuário.');
    }
}

async function atualizarUsuario(userUpdate, userId) {
    const token = localStorage.getItem('token');

    // Adiciona as senhas ao objeto userUpdate se elas foram preenchidas
    const newPassword = document.getElementById('editPassword').value;
    const passwordConfirmation = document.getElementById('editPasswordConfirmation').value;

    if (newPassword) {
        userUpdate.password = newPassword; // Adiciona nova senha se foi informada
        userUpdate.password_confirmation = passwordConfirmation; // Adiciona confirmação de senha
    }

    try {
        const response = await fetch(`http://localhost:8000/api/user/atualizar/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userUpdate)
        });

        const data = await response.json();

        if (response.ok && data.status === 200) {
            alert('Usuário atualizado com sucesso!');
            const editarUsuarioModal = bootstrap.Modal.getInstance(document.getElementById('editarUsuarioModal'));
            editarUsuarioModal.hide(); // Fecha o modal de edição
            listarUsuarios(); // Atualiza a lista de usuários
        } else {
            alert('Erro ao atualizar o usuário: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao atualizar o usuário:', error);
        alert('Erro ao atualizar o usuário.');
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
