const API_BASE_URL = 'https://api-powermoto.onrender.com';
let deleteItemSKU = null; 

function goBack() {
    window.location.href = '../index.html';
}

async function loaditens() {
    const ItensList = document.getElementById('itensList');
    if (!ItensList) {
        console.error("Elemento 'itensList' não encontrado no HTML.");
        return;
    }
    ItensList.innerHTML = '<div class="loading">Carregando itens...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/itens`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar itens');
        }

        const data = await response.json();
        const itens = data.dados

        if (itens.length === 0) {
            ItensList.innerHTML = '<div class="loading">Nenhum item cadastrado</div>';
            return;
        }

        ItensList.innerHTML = '';
        itens.forEach(item => {
            ItensList.innerHTML += createItemCard(item);
        });

    } catch (error) {
        console.error('Erro:', error);
        ItensList.innerHTML = `
            <div class="error-message">
                ❌ Erro ao carregar itens: ${error.message}
            </div>
        `;
    }
}

function createItemCard(item) {
    const statusTexto = item.status ? 'ATIVO' : 'INATIVO';
    const statusClass = item.status === true ? 'status-ativo' : 'status-inativo';
    const statusValue = item.status ? 'ativo' : 'inativo';
    
    return `
        <div class="item-card">
            <div class="item-sku">${item.SKU}</div>
            <div class="item-info">
                <div class="item-name">${item.nome}</div>
                <div class="item-marca"> ${item.marca}</div>
                <div class="item-value"> R$ ${item.valor}</div>
            </div>
            <div class="item-status ${statusClass}">
                ${statusTexto}
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="fillEditForm('${item.SKU}', '${item.nome}', '${item.marca}', '${item.valor}', '${statusValue}')">
                    ✏️ Editar   
                </button>
                <button class="btn-delete" onclick="confirmDelete('${item.SKU}')">
                    🗑️ Excluir
                </button>
            </div>
        </div>
    `;
}

async function searchItemBySKU() {
    const searchSKU = document.getElementById('searchSKU').value;
    const resultBox = document.getElementById('searchResult');
    
    if (!searchSKU) {
        showMessage(resultBox, 'Por favor, digite um ID', 'error');
        return;
    }

    resultBox.classList.add('active');
    resultBox.innerHTML = '<div class="loading">Buscando...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/itens/${searchSKU}`);
        
        if (!response.ok) {
            throw new Error('Item não encontrado');
        }

        const data = await response.json();
        const item = data.dados

        const statusTexto = item.status ? 'ATIVO' : 'INATIVO';
        const statusClass = item.status === true ? 'status-ativo' : 'status-inativo';
        const statusValue = item.status ? 'ativo' : 'inativo';

        resultBox.innerHTML = `
            <div class="item-card">
            <div class="item-sku">${item.SKU}</div>
            <div class="item-info">
                <div class="item-name">${item.nome}</div>
                <div class="item-marca"> ${item.marca}</div>
                <div class="item-value"> R$ ${item.valor}</div>
            </div>
            <div class="item-status ${statusClass}">
                ${statusTexto}
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="fillEditForm('${item.SKU}', '${item.nome}', '${item.marca}', '${item.valor}', '${statusValue}')">
                    ✏️ Editar   
                </button>
                <button class="btn-delete" onclick="confirmDelete('${item.SKU}')">
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

async function createItem(event) {
    event.preventDefault();
    
    const SKU = document.getElementById('createSKU').value;
    const marca = document.getElementById('createMarca').value;
    const nome = document.getElementById('createNome').value;
    const valor = document.getElementById('createValor').value;

    const itemData = {
        SKU: SKU,
        marca: marca,
        nome: nome,
        valor: valor
    };

    try {
        const response = await fetch(`${API_BASE_URL}/itens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });

        if (!response.ok) {
            throw new Error('Erro ao criar item');
        }

        const result = await response.json();
        
        showTemporaryMessage('Item criado com sucesso!', 'success');
        
        document.getElementById('createForm').reset();

        loaditens() 

    } catch (error) {
        console.error('Erro:', error);
        showTemporaryMessage('Erro ao criar iteme: ' + error.message, 'error');
    }
}

function fillEditForm(SKU, nome, marca, valor, status) {
    document.getElementById('editSku').value = SKU;
    document.getElementById('editNome').value = nome;
    document.getElementById('editMarca').value = marca;
    document.getElementById('editValor').value = valor; 
    document.getElementById('editStatus').value = status;
    
    document.querySelector('.form-section:nth-of-type(3)').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

async function editItem(event) {
    event.preventDefault();
    
    const SKU = document.getElementById('editSku').value; 
    const nome = document.getElementById('editNome').value;
    const marca = document.getElementById('editMarca').value;
    const valor = document.getElementById('editValor').value;
    const status = document.getElementById('editStatus').value;
    const status_bool = status === 'ativo'

    const itemData = {
        nome: nome,
        marca: marca,
        valor: valor,
        status: status_bool
    };

    try {
        const response = await fetch(`${API_BASE_URL}/itens/${SKU}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar item');
        }

        const result = await response.json();
        
        showTemporaryMessage('Item atualizado com sucesso!', 'success');
        
        document.getElementById('editForm').reset();
        
        loaditens()

    
    } catch (error) {
        console.error('Erro:', error);
        showTemporaryMessage('Erro ao atualizar item: ' + error.message, 'error');

        console.log('🔍 Enviando dados:', itemData);
        console.log('📦 Dados enviados para API:', JSON.stringify(itemData));
    }
}

function confirmDelete(SKU) {
    deleteItemSKU = SKU;
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = 'Confirmar Exclusão';
    document.getElementById('modalMessage').textContent = 
        `Tem certeza que deseja excluir o item ${SKU}? Esta ação não pode ser desfeita.`;
    
    modal.classList.add('active');
    
    document.getElementById('modalConfirm').onclick = deleteItem;
}

async function deleteItem() {
    try {
        const response = await fetch(`${API_BASE_URL}/itens/${deleteItemSKU}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir item');
        }

        showTemporaryMessage('Item excluído com sucesso!', 'success');
        closeModal();
        loaditens() 

    } catch (error) {
        console.error('Erro:', error);
        showTemporaryMessage('Erro ao excluir item: ' + error.message, 'error');
        closeModal();
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    deleteItemSKU = null;
}

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

function showMessage(element, message, type) {
    const messageClass = type === 'success' ? 'success-message' : 'error-message';
    element.classList.add('active');
    element.innerHTML = `<div class="${messageClass}">${message}</div>`;
}

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

const modalElement = document.getElementById('modal');
if (modalElement) {
    modalElement.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', loaditens)