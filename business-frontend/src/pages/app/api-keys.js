import api from '../../lib/api.js';

let apiKeys = [];
let isLoading = true;

function renderApiKeysPage() {
    const headerHtml = `
        <div class="flex-1"><h1 class="page-headline">API Keys</h1></div>
        <div><button id="generate-key-btn" class="btn btn-accent">+ Generate New Key</button></div>
    `;

    const pageHtml = `
        <div class="dashboard-container">
            <div id="api-key-list-container" class="widget-card">
                <!-- Content will be rendered by renderKeyList -->
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
        container.innerHTML = `<div class="p-8 text-center text-app-text-secondary">Loading API keys...</div>`;
        return;
    }

    const tableContent = apiKeys.length === 0 ? `
        <tbody>
            <tr>
                <td colspan="6" class="text-center p-8 text-app-text-secondary">No API keys have been generated yet.</td>
            </tr>
        </tbody>
    ` : `
        <tbody>
            ${apiKeys.map(key => `
                <tr class="group">
                    <td>${key.name}</td>
                    <td class="font-mono">${key.key_prefix}...</td>
                    <td><span class="px-2 py-1 text-xs font-semibold ${key.is_active ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'} rounded-full">${key.is_active ? 'Active' : 'Revoked'}</span></td>
                    <td>${new Date(key.created_at).toLocaleDateString()}</td>
                    <td>${key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</td>
                    <td>
                        <button data-key-id="${key.id}" class="revoke-key-btn text-app-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity ${!key.is_active ? 'hidden' : ''}">
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
                <tr><th>Name</th><th>Key Prefix</th><th>Status</th><th>Created</th><th>Last Used</th><th></th></tr>
            </thead>
            ${tableContent}
        </table>`;
    
    attachEventListeners();
}

function attachEventListeners() {
    document.getElementById('generate-key-btn')?.addEventListener('click', showGenerateKeyModal);
    document.querySelectorAll('.revoke-key-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleRevokeKey(e.currentTarget.dataset.keyId));
    });
}

function showGenerateKeyModal() {
    const modalId = 'generate-key-modal';
    const existingModal = document.getElementById(modalId);
    if(existingModal) return;

    const modalHtml = `
    <div id="${modalId}" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-app-surface w-full max-w-md rounded-xl border border-app-border shadow-2xl">
            <header class="p-4 border-b border-app-border flex justify-between items-center">
                <h2 class="text-lg font-bold text-app-text-primary">Generate New API Key</h2>
                <button class="modal-close-btn p-2 text-app-text-secondary rounded-full hover:bg-app-accent-hover">&times;</button>
            </header>
            <div id="modal-content-area" class="p-6">
                 <form id="generate-key-form">
                    <label for="key-name" class="form-label">Key Name</label>
                    <input type="text" id="key-name" required class="form-input" placeholder="e.g., Production Model V3">
                    <div id="modal-error-message" class="hidden text-red-600 text-sm mt-2"></div>
                    <button type="submit" class="btn btn-accent w-full mt-4">Generate Key</button>
                </form>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById(modalId);
    const form = document.getElementById('generate-key-form');
    
    const closeModal = () => modal.remove();

    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    form.addEventListener('submit', (e) => handleGenerateKey(e, closeModal));
}

async function handleGenerateKey(e, closeModal) {
    e.preventDefault();
    const form = e.target;
    const nameInput = form.querySelector('#key-name');
    const errorEl = form.querySelector('#modal-error-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;
    errorEl.classList.add('hidden');

    try {
        const response = await api.post('/business/api-keys', { name: nameInput.value });
        const newKey = response.data.key;
        
        document.getElementById('modal-content-area').innerHTML = `
            <h3 class="font-semibold text-app-text-primary">API Key Generated Successfully</h3>
            <p class="text-sm text-app-text-secondary mt-2">Please copy your new API key. You will not be able to see it again.</p>
            <div class="mt-4 p-3 bg-app-bg border border-app-border rounded-md font-mono text-sm break-all">${newKey}</div>
            <button id="key-copied-btn" class="btn btn-secondary w-full mt-4">Close</button>
        `;
        document.getElementById('key-copied-btn').addEventListener('click', closeModal);
        await fetchApiKeys();
    } catch (error) {
        errorEl.textContent = error.response?.data?.detail || 'Failed to generate key.';
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Generate Key`;
    }
}

async function handleRevokeKey(keyId) {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
    try {
        await api.delete(`/business/api-keys/${keyId}`);
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