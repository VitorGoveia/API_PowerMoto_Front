const API_BASE_URL = 'http://127.0.0.1:5000';
let deletePedidoId = null;
let createItemCount = 0;
let editItemCount = 0;
let currentPedidoItens = [];

function goBack() {
    window.location.href = '../Home.html';
}

async function loadPedidos() {
    const pedidosList = document.getElementById('pedidosList');
    pedidosList.innerHTML = '<div class="loading">Carregando pedidos...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar pedidos');
        }

        const data = await response.json();
        const pedidos = data.dados;

        if (pedidos.length === 0) {
            pedidosList.innerHTML = '<div class="loading">Nenhum pedido cadastrado</div>';
            return;
        }

        pedidosList.innerHTML = '';
        pedidos.forEach(pedido => {
            pedidosList.innerHTML += createPedidoCard(pedido);
        });

    } catch (error) {
        console.error('Erro:', error);
        pedidosList.innerHTML = `
            <div class="error-message">
                ❌ Erro ao carregar pedidos: ${error.message}
            </div>
        `;
    }
}

function createPedidoCard(pedido) {
    const itensIds = pedido['item pedido'] || [];
    const itensBadges = itensIds.map(id => `<span class="item-badge">${id.SKU_item}</span>`).join('');

    console.log(pedido['id do pedido'])

    return `
        <div class="pedido-card">
            <div class="pedido-header">
                <div class="pedido-id">${pedido['id do pedido']}</div>
                <div class="pedido-info">
                    <div class="pedido-date">📅 ${pedido.data}</div>
                    <div class="pedido-phone">👨🏻‍💼 Cliente: ${pedido['nome cliente']} - 📞 ${pedido['telefone cliente']}</div>
                </div>
                <div class="pedido-actions">
                    <button class="btn-view-itens" onclick="viewItens(${JSON.stringify(pedido['id do pedido']).replace(/"/g, '&quot;')})">
                        👁️ Ver Pedido
                    </button>
                    <button class="btn-edit" onclick="fillEditForm(${pedido['id do pedido']}, '${pedido['telefone cliente']}', ${JSON.stringify(itensIds).replace(/"/g, '&quot;')})">
                        ✏️ Editar
                    </button>
                    <button class="btn-delete" onclick="confirmDelete(${pedido['id do pedido']})">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
            <div class="pedido-itens">
                <div class="pedido-itens-header">SKU dos itens do Pedido:</div>
                <div class="pedido-itens-list">
                    ${itensBadges || '<span class="item-badge">Nenhum item</span>'}
                </div>
            </div>
        </div>
    `;
}

async function viewItens(PedidoId) {
    const modal = document.getElementById('itensModal');
    const content = document.getElementById('itensModalContent');

    content.innerHTML = '<div class="loading">Carregando itens...</div>';
    modal.classList.add('active');

    try {   
        const response = await fetch(`${API_BASE_URL}/pedidos/${PedidoId}`);
        const response_json = await response.json();

        content.innerHTML = '';

            if (response_json.sucesso && response_json.dados) {
                const itensPedido = response_json.dados["item pedido"] || [response_json.dados];
                console.log(itensPedido)

                itensPedido.forEach(it => {
                    const sku = it.SKU_item || it.SKU || it.sku;
                    const valor = it.Valor_item_pedido || it.valor_item_pedido || 0;

                    const valorPrazo = it.Prazo ?? it.prazo; 
                    const prazo = valorPrazo ? `${valorPrazo} dias` : "À pronta entrega";

                    const quantidade = it.Quantidade || it.quantidade || 1;
                    const nome = it.Nome || it.nome || "Não_encontrado";

                    content.innerHTML += `
                        <div class="item-modal-card">
                            <div class="item-modal-line">
                                <strong>${nome} (${sku})</strong> - ${quantidade} UNIDADES
                            </div>
                            <div class="item-modal-line">
                                Valor: R$ ${valor.toFixed(2)}
                            </div>
                            <div class="item-modal-line">
                                Prazo: ${prazo}
                                </br></br>
                            </div>
                        </div>
                    `;
                });
            }
        if (content.innerHTML === '') {
            content.innerHTML = '<div class="loading">Nenhum item encontrado</div>';
        }

    } catch (error) {
        console.error('Erro:', error);
        content.innerHTML = `
            <div class="error-message">
                ❌ Erro ao carregar itens: ${error.message}
            </div>
        `;
    }
}

function closeItensModal() {
    document.getElementById('itensModal').classList.remove('active');
}

async function searchPedidoById() {
    const searchId = document.getElementById('searchId').value;
    const resultBox = document.getElementById('searchResult');
    
    if (!searchId) {
        showMessage(resultBox, 'Por favor, digite um ID', 'error');
        return;
    }

    resultBox.classList.add('active');
    resultBox.innerHTML = '<div class="loading">Buscando...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${searchId}`);
        
        if (!response.ok) {
            throw new Error('Pedido não encontrado');
        }

        const data = await response.json();

        if (Array.isArray(data.dados)) {
        resultBox.innerHTML = "";
        data.dados.forEach(item => {
            resultBox.innerHTML += createPedidoCard(item);
        });
        } else {
        const pedido = data.dados || data; 
        resultBox.innerHTML = createPedidoCard(pedido);
        }

    } catch (error) {
        console.error('Erro:', error);
        resultBox.innerHTML = `
            <div class="error-message">
                ❌ ${error.message}
            </div>
        `;
    }
}

function addItemCreate() {
    createItemCount++;
    const itensContainer = document.getElementById('createItens');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-row item-field';
    itemDiv.id = `create-item-${createItemCount}`;
    itemDiv.innerHTML = `
            <div class="input"> 
            <label class="input" >SKU do Item</label>
            <input type="text" class="create-sku" required placeholder="Ex: A1">
            </div>
            <div class="input"> 
            <label class="input">Quantidade</label>
            <input type="number" class="create-quantidade" required min="1" placeholder="1">
            </div>
            <div class="input">  
            <label class="input">Prazo (dias)</label>
            <input type="number" class="create-prazo" required min="0" placeholder="10">
            </div>
            <div class="input"> 
            <label class="input">Remover</label>
            <button type="button" class="btn-remove-item" onclick="removeItem('create-item-${createItemCount}')">
            🗑️
            </button></div>
    `;
    itensContainer.appendChild(itemDiv);
}

function addItemEditWithData(itemData) {
    editItemCount++;
    const itemHtml = `
        <div class="item-row item-field" data-item-id="${itemData.ID}">
            <div class="input"> 
            <label class="input">SKU do Item</label>
            <input type="text" class="edit-item-sku" value="${itemData.SKU_item}" placeholder="Ex: A1" required>
            </div>

            <div class="input"> 
            <label class="input">Quantidade</label>
            <input type="number" class="edit-item-quantidade" value="${itemData.Quantidade}" placeholder="1" required min="1">
            </div>

            <div class="input"> 
            <label class="input">Prazo</label>
            <input type="number" class="edit-item-prazo" value="${itemData.Prazo}" placeholder="10" required min="0">
            </div>

            <div class="input"> 
            <label class="input" >Remover</label>
            <button type="button" class="btn-remove-item" onclick="removeItemEdit(this, ${itemData.ID})">🗑️</button>
            </div>

        </div>
    `;
    document.getElementById('editItens').insertAdjacentHTML('beforeend', itemHtml);
}

function addItemEdit() {
    editItemCount++;
    const itemHtml = `
        <div class="item-row item-field" data-item-id="new">
            <div class="input"> 
            <label class="input" >SKU do Item</label>
            <input type="text" class="edit-item-sku" placeholder="Ex: A1" required>
            </div>

            <div class="input"> 
            <label class="input" >Quantidade</label>
            <input type="number" class="edit-item-quantidade" placeholder="1" required min="1">
            </div>

            <div class="input"> 
            <label class="input" >Prazo</label>
            <input type="number" class="edit-item-prazo" placeholder="10" required min="1">
            </div>

            <div class="input"> 
            <label class="input" >Remover</label>
            <button type="button" class="btn-remove-item" onclick="removeItemEdit(this, 'new')">🗑️</button>
            </div>
        </div>
    `;
    document.getElementById('editItens').insertAdjacentHTML('beforeend', itemHtml);
}

function removeItem(itemId) {
    const item = document.getElementById(itemId);
    if (item) {
        item.remove();
    }
}

async function removeItemEdit(button, itemId) {
    const itemRow = button.parentElement;
    
    if (itemId !== 'new') {
        try {
            const response = await fetch(`${API_BASE_URL}/itensPedido/${itemId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao deletar item do pedido');
            }

            showTemporaryMessage('Item removido com sucesso!', 'success');
        } catch (error) {
            console.error('Erro:', error);
            showTemporaryMessage('Erro ao remover item: ' + error.message, 'error');
            return; 
        }
    }
    
    itemRow.remove();
    editItemCount--;
}

async function createPedido(event) {
    event.preventDefault();
    
    const telefone = document.getElementById('createTelefone').value;
    const itensRows = document.querySelectorAll('#createItens .item-row');
    
    if (itensRows.length === 0) {
        showTemporaryMessage('Adicione pelo menos um item ao pedido', 'error');
        return;
    }

    const itens = [];
    itensRows.forEach(row => {
        const sku = row.querySelector('.create-sku').value;
        const quantidade = parseInt(row.querySelector('.create-quantidade').value);
        const prazo = parseInt(row.querySelector('.create-prazo').value);
        
        itens.push({
            SKU_item: sku,
            quantidade: quantidade,
            prazo: prazo
        });
    });

    const pedidoData = {
        telefone_cliente: telefone,
        itens: itens
    };

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.mensagem || 'Erro ao criar pedido');
        }

        showTemporaryMessage('Pedido criado com sucesso!', 'success');
        document.getElementById('createForm').reset();
        document.getElementById('createItens').innerHTML = '';
        createItemCount = 0;
        loadPedidos();

    } catch (error) {
        console.error('Erro:', error);
        showTemporaryMessage('Erro ao criar pedido: ' + error.message, 'error');
    }
}


async function fillEditForm(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${id}`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar dados do pedido');
        }

        const data = await response.json();
        const pedido = data.dados;

        document.getElementById('editId').value = pedido['id do pedido'];
        document.getElementById('editTelefone').value = pedido['telefone cliente'];
        
        document.getElementById('editItens').innerHTML = '';
        editItemCount = 0;
        
        currentPedidoItens = pedido['item pedido'] || [];
        
        currentPedidoItens.forEach(item => {
            addItemEditWithData(item);
        });
        
        document.querySelector('.form-section:nth-of-type(3)').scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });

        showTemporaryMessage('Dados do pedido carregados com sucesso!', 'success');

    } catch (error) {
        console.error('Erro:', error);
        showTemporaryMessage('Erro ao carregar dados do pedido: ' + error.message, 'error');
    }
}

async function editPedido(event) {
    event.preventDefault();
    
    const id = document.getElementById('editId').value;
    const telefone = document.getElementById('editTelefone').value;
    const itensRows = document.querySelectorAll('#editItens .item-row');
    
    if (itensRows.length === 0) {
        showTemporaryMessage('Adicione pelo menos um item ao pedido', 'error');
        return;
    }

    try {
        for (const row of itensRows) {
            const itemId = row.getAttribute('data-item-id');
            const sku = row.querySelector('.edit-item-sku').value;
            const quantidade = parseInt(row.querySelector('.edit-item-quantidade').value);
            const prazo = parseInt(row.querySelector('.edit-item-prazo').value);
            
            const itemData = {
                SKU_item: sku,
                quantidade: quantidade,
                prazo: prazo,
                status: true
            };

            if (itemId === 'new') {
                const createData = {
                    ...itemData,
                    id_pedido: parseInt(id)
                };

                const response = await fetch(`${API_BASE_URL}/itensPedido`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(createData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.mensagem || 'Erro ao adicionar item');
                }
            } else {
                const response = await fetch(`${API_BASE_URL}/itensPedido/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(itemData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.mensagem || `Erro ao atualizar item ${itemId}`);
                }
            }
        }

        showTemporaryMessage('Pedido atualizado com sucesso!', 'success');
        document.getElementById('editForm').reset();
        document.getElementById('editItens').innerHTML = '';
        editItemCount = 0;
        currentPedidoItens = [];
        loadPedidos();

    } catch (error) {
        console.error('Erro:', error);
        showTemporaryMessage('Erro ao atualizar pedido: ' + error.message, 'error');
    }
}

function confirmDelete(id) {
    deletePedidoId = id;
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = 'Confirmar Exclusão';
    document.getElementById('modalMessage').textContent = 
        `Tem certeza que deseja excluir o pedido ID ${id}? Esta ação não pode ser desfeita.`;
    
    modal.classList.add('active');
    document.getElementById('modalConfirm').onclick = deletePedido;
}

async function deletePedido() {
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${deletePedidoId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir pedido');
        }

        showTemporaryMessage('Pedido excluído com sucesso!', 'success');
        closeModal();
        loadPedidos();

    } catch (error) {
        console.error('Erro:', error);
        showTemporaryMessage('Erro ao excluir pedido: ' + error.message, 'error');
        closeModal();
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    deletePedidoId = null;
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

document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

document.getElementById('itensModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeItensModal();
    }
});

document.addEventListener('DOMContentLoaded', loadPedidos);