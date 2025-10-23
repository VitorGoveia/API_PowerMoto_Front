// Configuração da URL base da API
const API_BASE_URL = 'http://127.0.0.1:5000';
let deleteClientId = null;

// Função para voltar à página anterior
function goBack() {
    window.location.href = '../Home.html';
}

// Função para carregar todos os clientes
async function loadClients() {
    const clientsList = document.getElementById('clientsList');
    clientsList.innerHTML = '<div class="loading">Carregando clientes...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/clientes`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar clientes');
        }

        const data = await response.json();
        const clients = data.dados

        if (clients.length === 0) {
            clientsList.innerHTML = '<div class="loading">Nenhum cliente cadastrado</div>';
            return;
        }

        clientsList.innerHTML = '';
        clients.forEach(client => {
            clientsList.innerHTML += createClientCard(client);
        });

    } catch (error) {
        console.error('Erro:', error);
        clientsList.innerHTML = `
            <div class="error-message">
                ❌ Erro ao carregar clientes: ${error.message}
            </div>
        `;
    }
}

function createClientCard(client) {
    const statusTexto = client.status ? 'ATIVO' : 'INATIVO';
    const statusClass = client.status ? 'status-ativo' : 'status-inativo';
    
    return `
        <div class="client-card">
            <div class="client-id">${client.id}</div>
            <div class="client-info">
                <div class="client-name">${client.nome}</div>
                <div class="client-phone">📞 ${client.telefone}</div>
            </div>
            <div class="client-status ${statusClass}">
                ${statusTexto}
            </div>
            <div class="client-actions">
                <button class="btn-edit" onclick="fillEditForm(${client.id}, '${client.nome}', '${client.telefone}', '${client.status}')">
                    ✏️ Editar   
                </button>
                <button class="btn-delete" onclick="confirmDelete(${client.id})">
                    🗑️ Excluir
                </button>
            </div>
        </div>
    `;
}

async function searchClientById() {
    const searchId = document.getElementById('searchId').value;
    const resultBox = document.getElementById('searchResult');
    
    if (!searchId) {
        showMessage(resultBox, 'Por favor, digite um ID', 'error');
        return;
    }

    resultBox.classList.add('active');
    resultBox.innerHTML = '<div class="loading">Buscando...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${searchId}`);
        
        if (!response.ok) {
            throw new Error('Cliente não encontrado');
        }

        const data = await response.json();
        const client = data.dados

        const statusTexto = client.status ? 'ATIVO' : 'INATIVO';
        const statusClass = client.status === true ? 'status-ativo' : 'status-inativo';
        resultBox.innerHTML = `
            <div class="client-card">
            <div class="client-id">${client.id}</div>
            <div class="client-info">
                <div class="client-name">${client.nome}</div>
                <div class="client-phone">📞 ${client.telefone}</div>
            </div>
            <div class="client-status ${statusClass}">
                ${statusTexto}
            </div>
            <div class="client-actions">
                <button class="btn-edit" onclick="fillEditForm(${client.id}, '${client.nome}', '${client.telefone}', '${client.status}')">
                    ✏️ Editar
                </button>
                <button class="btn-delete" onclick="confirmDelete(${client.id})">
                    🗑️ Excluir
                </button>
            </div>
            </div>
        `;

    } catch (error) {
        console.error('Erro:', error);
        resultBox.innerHTML = `
            <div class="error-message">
                ❌ ${error.message}
            </div>
        `;
    }
}

async function createClient(event) {
    event.preventDefault();
    
    const nome = document.getElementById('createNome').value;
    const telefone = document.getElementById('createTelefone').value;

    const clientData = {
        nome: nome,
        telefone: telefone
    };

    try {
        const response = await fetch(`${API_BASE_URL}/clientes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clientData)
        });

        if (!response.ok) {
            throw new Error('Erro ao criar cliente');
        }

        const result = await response.json();
        
        // Mostra mensagem de sucesso
        showTemporaryMessage('Cliente criado com sucesso!', 'success');
        
        // Limpa o formulário
        document.getElementById('createForm').reset();
        
        // Recarrega a lista
        loadClients();

    } catch (error) {
        console.error('Erro:', error);
        showTemporaryMessage('Erro ao criar cliente: ' + error.message, 'error');
    }
}

// Função para preencher formulário de edição
function fillEditForm(id, nome, telefone, status) {
    document.getElementById('editId').value = id;
    document.getElementById('editNome').value = nome;
    document.getElementById('editTelefone').value = telefone;
    document.getElementById('editStatus').value = status;
    
    // Scroll suave até o formulário
    document.querySelector('.form-section:nth-of-type(3)').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

// Função para editar cliente
async function editClient(event) {
    event.preventDefault();
    
    const id = document.getElementById('editId').value;
    const nome = document.getElementById('editNome').value;
    const telefone = document.getElementById('editTelefone').value;
    const status = document.getElementById('editStatus').value;
    const status_bool = status === 'ativo'

    const clientData = {
        nome: nome,
        telefone: telefone,
        status: status_bool
    };

    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clientData)
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar cliente');
        }

        const result = await response.json();
        
        // Mostra mensagem de sucesso
        showTemporaryMessage('Cliente atualizado com sucesso!', 'success');
        
        // Limpa o formulário
        document.getElementById('editForm').reset();
        
        // Recarrega a lista
        loadClients();

    

    } catch (error) {
        console.error('Erro:', error);
        showTemporaryMessage('Erro ao atualizar cliente: ' + error.message, 'error');

        console.log('🔍 Enviando dados:', clientData);
        console.log('📦 Dados enviados para API:', JSON.stringify(clientData));
    }
}

// Função para confirmar exclusão
function confirmDelete(id) {
    deleteClientId = id;
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = 'Confirmar Exclusão';
    document.getElementById('modalMessage').textContent = 
        `Tem certeza que deseja excluir o cliente ID ${id}? Esta ação não pode ser desfeita.`;
    
    modal.classList.add('active');
    
    // Define o botão de confirmação
    document.getElementById('modalConfirm').onclick = deleteClient;
}

// Função para excluir cliente
async function deleteClient() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${deleteClientId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir cliente');
        }

        showTemporaryMessage('Cliente excluído com sucesso!', 'success');
        closeModal();
        loadClients();

    } catch (error) {
        console.error('Erro:', error);
        showTemporaryMessage('Erro ao excluir cliente: ' + error.message, 'error');
        closeModal();
    }
}

// Função para fechar modal
function closeModal() {
    document.getElementById('modal').classList.remove('active');
    deleteClientId = null;
}

// Função para mostrar mensagem temporária
function showTemporaryMessage(message, type) {
    const messageClass = type === 'success' ? 'success-message' : 'error-message';
    const messageDiv = document.createElement('div');
    messageDiv.className = messageClass;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.minWidth = '300px';
    messageDiv.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Função auxiliar para mostrar mensagens em elementos específicos
function showMessage(element, message, type) {
    const messageClass = type === 'success' ? 'success-message' : 'error-message';
    element.classList.add('active');
    element.innerHTML = `<div class="${messageClass}">${message}</div>`;
}

// Adiciona animações CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Fechar modal ao clicar fora
document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Carrega os clientes ao carregar a página
document.addEventListener('DOMContentLoaded', loadClients);