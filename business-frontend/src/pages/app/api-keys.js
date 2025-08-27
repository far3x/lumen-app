import api from '../../lib/api.js';

let apiKeys = [];
let isLoading = true;

function renderApiKeysPage() {
    const headerHtml = `
        <div class="flex-1"><h1 class="page-headline">API Keys</h1></div>
        <div><button id="generate-key-btn" class="btn btn-primary">+ Generate New Key</button></div>
    `;

    const pageHtml = `
        <div class="dashboard-container">
            <div class="widget-card">
                <div id="api-key-list-container">
                    <!-- Content will be rendered by renderKeyList -->
                </div>
            </div>
        </div>
    `;
    
    setTimeout(initialize, 0);
    return { pageHtml, headerHtml };
}

function renderKeyList() {
    const container = document.getElementById('api-key-list-container');
    if (!container) return;

    if (isLoading) {
        container.innerHTML = `<div class="p-8 text-center text-text-muted">Loading API keys...</div>`;
        return;
    }

    const tableContent = apiKeys.length === 0 ? `
        <tbody>
            <tr>
                <td colspan="6" class="text-center p-12 text-text-muted">
                    <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7h3a5 5 0 015 5 5 5 0 01-5 5h-3m-6 0H6a5 5 0 01-5-5 5 5 0 015-5h3.172a2 2 0 011.414.586l.828.828a2 2 0 001.414.586H15M9 12h6" /></svg>
                    <p class="mt-4 font-semibold text-text-headings">No API keys yet</p>
                    <p class="text-sm">Generate your first key to start accessing Lumen data.</p>
                </td>
            </tr>
        </tbody>
    ` : `
        <tbody>
            ${apiKeys.map(key => `
                <tr class="group hover:bg-app-accent-hover">
                    <td class="font-semibold">${key.name}</td>
                    <td class="font-mono text-text-muted">${key.key_prefix}...</td>
                    <td><span class="px-2 py-1 text-xs font-semibold ${key.is_active ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'} rounded-full">${key.is_active ? 'Active' : 'Revoked'}</span></td>
                    <td>${new Date(key.created_at).toLocaleDateString()}</td>
                    <td>${key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</td>
                    <td class="text-right">
                        <button data-key-id="${key.id}" data-key-name="${key.name}" class="revoke-key-btn text-red-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity ${!key.is_active ? 'hidden' : ''}">
                            Revoke
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr><th>Name</th><th>Key Prefix</th><th>Status</th><th>Created</th><th>Last Used</th><th class="text-right">Actions</th></tr>
            </thead>
            ${tableContent}
        </table>`;
    
    attachEventListeners();
}

function attachEventListeners() {
    document.getElementById('generate-key-btn')?.addEventListener('click', showGenerateKeyModal);
    document.querySelectorAll('.revoke-key-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { keyId, keyName } = e.currentTarget.dataset;
            showRevokeKeyModal(keyId, keyName);
        });
    });
}

function showGenerateKeyModal() {
    const modalId = 'generate-key-modal';
    const existingModal = document.getElementById(modalId);
    if(existingModal) return;

    const modalHtml = `
    <div id="${modalId}" class="modal-overlay">
        <div class="bg-app-surface w-full max-w-md rounded-xl border border-app-border shadow-2xl">
            <header class="p-4 border-b border-app-border flex justify-between items-center">
                <h2 class="text-lg font-bold text-text-headings">Generate New API Key</h2>
                <button class="modal-close-btn p-1 text-text-muted rounded-full hover:bg-app-accent-hover">&times;</button>
            </header>
            <div id="modal-content-area" class="p-6">
                 <form id="generate-key-form">
                    <label for="key-name" class="form-label">Key Name</label>
                    <input type="text" id="key-name" required class="form-input" placeholder="e.g., Production Model V3" minlength="3" maxlength="50">
                    <div id="modal-error-message" class="hidden text-red-600 text-sm mt-2"></div>
                    <button type="submit" class="btn btn-primary w-full mt-4">Generate Key</button>
                </form>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.classList.add('modal-open');

    const modal = document.getElementById(modalId);
    const form = document.getElementById('generate-key-form');
    
    const closeModal = () => {
        modal.remove();
        if (document.querySelectorAll('.modal-overlay').length === 0) {
            document.body.classList.remove('modal-open');
        }
    };

    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    form.addEventListener('submit', (e) => handleGenerateKey(e, closeModal));
}

async function handleGenerateKey(e, closeModal) {
    e.preventDefault();
    const form = e.target;
    const nameInput = form.querySelector('#key-name');
    const errorEl = form.querySelector('#modal-error-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (nameInput.value.length < 3) {
        errorEl.textContent = 'Key name must be at least 3 characters long.';
        errorEl.classList.remove('hidden');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;
    errorEl.classList.add('hidden');

    try {
        const response = await api.post('/business/api-keys', { name: nameInput.value });
        const newKey = response.data.key;
        
        document.getElementById('modal-content-area').innerHTML = `
            <h3 class="font-semibold text-text-headings">API Key Generated Successfully</h3>
            <p class="text-sm text-text-muted mt-2">Please copy your new API key. You will not be able to see it again.</p>
            <div class="mt-4 p-3 pr-12 relative bg-app-bg border border-app-border rounded-md font-mono text-sm break-all">${newKey}</div>
            <button id="copy-key-btn" data-key="${newKey}" class="absolute top-1/2 right-10 transform -translate-y-1/2 p-2 text-text-muted hover:text-text-headings">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <button id="key-copied-btn" class="btn btn-secondary w-full mt-4">Close</button>
        `;
        document.getElementById('key-copied-btn').addEventListener('click', closeModal);
        document.getElementById('copy-key-btn').addEventListener('click', e => {
            navigator.clipboard.writeText(e.currentTarget.dataset.key);
            e.currentTarget.innerHTML = `<svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
        });
        await fetchApiKeys();
    } catch (error) {
        errorEl.textContent = error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || 'Failed to generate key.';
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Generate Key`;
    }
}

function showRevokeKeyModal(keyId, keyName) {
    const modalId = 'revoke-key-modal';
    const existingModal = document.getElementById(modalId);
    if(existingModal) return;

    const modalHtml = `
    <div id="${modalId}" class="modal-overlay">
        <div class="bg-app-surface w-full max-w-md rounded-xl border border-app-border shadow-2xl">
            <header class="p-4 border-b border-app-border">
                <h2 class="text-lg font-bold text-red-700">Revoke API Key</h2>
            </header>
            <div class="p-6">
                 <p class="text-text-body">Are you sure you want to revoke the key <strong class="font-semibold text-text-headings">${keyName}</strong>? This action is permanent and cannot be undone.</p>
                 <p class="text-sm text-text-muted mt-4">To confirm, please type "revoke" in the box below.</p>
                 <input type="text" id="revoke-confirm-input" class="form-input mt-2" autocomplete="off">
                 <div class="flex gap-4 mt-6">
                    <button id="cancel-revoke-btn" class="btn btn-secondary w-full">Cancel</button>
                    <button id="confirm-revoke-btn" class="btn btn-danger w-full" disabled>Revoke Key</button>
                 </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.classList.add('modal-open');

    const modal = document.getElementById(modalId);
    const confirmInput = document.getElementById('revoke-confirm-input');
    const confirmBtn = document.getElementById('confirm-revoke-btn');

    const closeModal = () => {
        modal.remove();
        if (document.querySelectorAll('.modal-overlay').length === 0) {
            document.body.classList.remove('modal-open');
        }
    };
    
    modal.querySelector('#cancel-revoke-btn').addEventListener('click', closeModal);
    confirmInput.addEventListener('input', () => {
        confirmBtn.disabled = confirmInput.value !== 'revoke';
    });
    confirmBtn.addEventListener('click', () => handleRevokeKey(keyId, closeModal));
}

async function handleRevokeKey(keyId, closeModal) {
    try {
        await api.delete(`/business/api-keys/${keyId}`);
        closeModal();
        await fetchApiKeys();
    } catch (error) {
        alert('Failed to revoke API key. Please try again.');
    }
}

async function fetchApiKeys() {
    isLoading = true;
    renderKeyList();
    try {
        const response = await api.get('/business/api-keys');
        apiKeys = response.data;
    } catch (error) {
        console.error("Failed to fetch API keys:", error);
        apiKeys = [];
    } finally {
        isLoading = false;
        renderKeyList();
    }
}

function initialize() {
    fetchApiKeys();
}

export { renderApiKeysPage };