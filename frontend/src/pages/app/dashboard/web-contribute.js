import { api, getUser } from '../../../lib/auth.js';
import { parseAndFilterProject, getAllFilesFromDataTransfer } from '../../../lib/contributionParser.js';
import { icons } from './utils.js';

let state = {
    view: 'upload',
    project: null,
    errorMessage: '',
};

function setState(newState) {
    Object.assign(state, newState);
    render();
}

function renderPrinciplesOfValue() {
    const principles = [
        { number: '01', title: 'Prioritize Novelty', text: 'The protocol rewards what AI has not seen. Your unique solutions, personal projects, or unpublished work are the most valuable assets for training.' },
        { number: '02', title: 'Focus on Quality', text: 'Value is tied to substance. Well-structured applications, thoughtful architectural patterns, and clean, efficient code earn more than simple scripts.' },
        { number: '03', title: 'Iterate and Update', text: 'The engine rewards progress. Regularly contributing updates to your active projects is a great way to earn, as the protocol values the new logic you add over time.' },
    ];

    return `
    <div class="mt-8">
        <h3 class="font-bold text-lg text-text-main mb-4">Principles of Value</h3>
        <div class="relative bg-surface rounded-xl border border-primary overflow-hidden">
            <div class="flex flex-col md:flex-row">
            ${principles.map((principle, index) => `
                <div class="flex-1 p-6 relative ${index > 0 ? 'md:border-l md:border-primary' : ''}">
                    <span class="absolute top-4 right-4 text-5xl font-bold gradient-text opacity-10">${principle.number}</span>
                    <div class="relative">
                        <h4 class="font-bold text-text-main">${principle.title}</h4>
                        <p class="text-sm text-text-secondary mt-1">${principle.text}</p>
                    </div>
                </div>
            `).join('')}
            </div>
        </div>
    </div>
    `;
}

function buildFileTreeHtml(tree) {
    let html = '<ul>';
    const entries = Object.entries(tree).sort(([a], [b]) => {
        const isAFolder = a.endsWith('/');
        const isBFolder = b.endsWith('/');
        if (isAFolder && !isBFolder) return -1;
        if (!isAFolder && isBFolder) return 1;
        return a.localeCompare(b);
    });

    for (const [name, children] of entries) {
        const isFolder = name.endsWith('/');
        const cleanName = isFolder ? name.slice(0, -1) : name;
        const icon = isFolder ? icons.folder : icons.file;

        if (isFolder) {
            html += `<li>
                <details open>
                    <summary class="folder-item file-item">${icon} ${cleanName}</summary>
                    ${buildFileTreeHtml(children)}
                </details>
            </li>`;
        } else {
            html += `<li><div class="file-item">${icon} ${cleanName}</div></li>`;
        }
    }
    html += '</ul>';
    return html;
}

async function processFiles(fileList) {
    setState({ view: 'analyzing' });
    try {
        const project = await parseAndFilterProject(fileList);
        setState({ view: 'confirm', project });
    } catch (error) {
        setState({ view: 'error', errorMessage: error.message });
    }
}

async function handleSubmit() {
    setState({ view: 'submitting' });
    try {
        const response = await api.post('/users/me/contribute/web', {
            codebase: state.project.payload,
        });
        setState({ view: 'success', project: { ...state.project, id: response.data.contribution_id } });
    } catch (error) {
        setState({ view: 'error', errorMessage: error.response?.data?.detail || 'An unexpected error occurred during submission.' });
    }
}

function render() {
    const container = document.getElementById('web-contribute-container');
    if (!container) return;

    let content = '';

    switch (state.view) {
        case 'analyzing':
            content = `
                <div class="text-center p-12">
                    <span class="animate-spin inline-block w-12 h-12 border-4 border-transparent border-t-accent-purple rounded-full"></span>
                    <p class="mt-4 text-text-secondary font-medium">Analyzing project locally...</p>
                    <p class="text-xs text-subtle mt-1">Your code has not left your browser.</p>
                </div>
            `;
            break;

        case 'confirm':
            content = `
                <h2 class="text-2xl font-bold mb-1">Confirm Your Contribution</h2>
                <p class="text-text-secondary mb-6">Review the project structure that will be submitted. Our filters have been applied.</p>
                <div class="grid lg:grid-cols-3 gap-6">
                    <div data-lenis-prevent class="lg:col-span-1 h-96 overflow-y-auto bg-primary/50 p-4 rounded-lg border border-subtle file-tree">
                        ${buildFileTreeHtml(state.project.fileTree)}
                    </div>
                    <div class="lg:col-span-2 bg-primary/50 p-6 rounded-lg border border-subtle flex flex-col justify-between">
                        <div>
                            <h3 class="font-bold text-lg">Submission Summary</h3>
                            <div class="mt-4 space-y-3 text-sm">
                                <div class="flex justify-between"><span>Files to be included:</span><strong class="font-mono">${state.project.includedCount}</strong></div>
                                <div class="flex justify-between"><span>Files/Folders excluded:</span><strong class="font-mono">${state.project.excludedCount}</strong></div>
                                <div class="flex justify-between"><span>Final payload size:</span><strong class="font-mono">${(state.project.totalSize / 1024 / 1024).toFixed(2)} MB</strong></div>
                            </div>
                            <div class="mt-4 text-xs p-3 bg-yellow-900/30 border border-yellow-500/30 text-yellow-200 rounded-md">
                                <strong>Reward Notice:</strong> To encourage use of the secure, open-source CLI, contributions made via the web interface receive a modified reward (1/3 of the standard rate).
                            </div>
                        </div>
                        <div class="flex items-center gap-4 mt-6">
                             <button id="cancel-btn" class="w-1/3 py-3 text-sm font-bold bg-primary hover:bg-subtle/80 rounded-lg transition-colors">Cancel</button>
                            <button id="submit-btn" class="w-2/3 py-3 text-sm font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:brightness-110">Confirm & Contribute</button>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'submitting':
             content = `<div class="text-center p-12">
                <span class="animate-spin inline-block w-12 h-12 border-4 border-transparent border-t-accent-purple rounded-full"></span>
                <p class="mt-4 text-text-secondary font-medium">Submitting securely to the network...</p>
            </div>`;
            break;
            
        case 'success':
            content = `<div class="text-center p-12">
                <div class="w-20 h-20 mx-auto mb-6 bg-green-900/50 text-green-300 rounded-full flex items-center justify-center">${icons.checkCircle}</div>
                <h2 class="text-2xl font-bold text-white">Contribution Received!</h2>
                <p class="text-text-secondary mt-2">Your submission (ID: #${state.project.id}) is now in the processing queue. You can track its status on the "My Contributions" page.</p>
                <button id="contribute-again-btn" class="mt-8 px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg">Contribute Another Project</button>
            </div>`;
            break;

        case 'error':
             content = `<div class="text-center p-12">
                <div class="w-20 h-20 mx-auto mb-6 bg-red-900/50 text-red-300 rounded-full flex items-center justify-center">${icons.errorCircle}</div>
                <h2 class="text-2xl font-bold text-white">An Error Occurred</h2>
                <p class="text-text-secondary mt-2">${state.errorMessage}</p>
                <button id="try-again-btn" class="mt-8 px-8 py-3 font-bold bg-primary hover:bg-subtle/80 rounded-lg transition-colors">Try Again</button>
            </div>`;
            break;

        default:
            const user = getUser();
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentContributions = (window.dashboardState?.allContributions || []).filter(c => new Date(c.created_at) > oneDayAgo);
            const contributionsToday = recentContributions.length;
            const contributionsLeft = Math.max(0, 3 - contributionsToday);
            
            content = `
                <div class="text-center mb-6">
                    <p class="text-sm font-medium ${contributionsLeft > 0 ? 'text-text-secondary' : 'text-yellow-400'}">
                        You have ${contributionsLeft} / 3 contributions remaining today.
                    </p>
                </div>
                <div id="drop-zone" class="drop-zone flex flex-col justify-center ${contributionsLeft === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent-purple hover:bg-surface/50'}">
                    <div class="flex flex-col items-center">
                        <div class="w-16 h-16 text-accent-purple mb-4 flex items-center justify-center">${icons.upload}</div>
                        <span class="font-bold text-lg text-text-main">Drag & drop your project folder here</span>
                        <span class="text-text-secondary mt-1">or</span>
                        <label for="folder-input" class="mt-2 font-semibold text-accent-cyan hover:underline cursor-pointer">
                            select a folder
                            <input type="file" id="folder-input" webkitdirectory directory class="sr-only" ${contributionsLeft === 0 ? 'disabled' : ''}>
                        </label>
                        <p class="text-xs text-subtle mt-4">Max project size: 5 MB. All processing is done in your browser before upload.</p>
                    </div>
                </div>
            `;
    }
    container.innerHTML = content;
    attachListeners();
}

function attachListeners() {
    if (state.view === 'upload') {
        const dropZone = document.getElementById('drop-zone');
        const folderInput = document.getElementById('folder-input');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('drag-over'); });
            dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('drag-over'); });
            dropZone.addEventListener('drop', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove('drag-over');
                const files = await getAllFilesFromDataTransfer(e.dataTransfer);
                processFiles(files);
            });
        }
        if (folderInput) {
            folderInput.addEventListener('change', (e) => {
                processFiles(e.target.files);
            });
        }
    } else if (state.view === 'confirm') {
        document.getElementById('submit-btn')?.addEventListener('click', handleSubmit);
        document.getElementById('cancel-btn')?.addEventListener('click', () => setState({ view: 'upload', project: null }));
    } else if (state.view === 'success') {
        document.getElementById('contribute-again-btn')?.addEventListener('click', () => setState({ view: 'upload', project: null }));
    } else if (state.view === 'error') {
        document.getElementById('try-again-btn')?.addEventListener('click', () => setState({ view: 'upload', errorMessage: '' }));
    }
}

export function attachWebContributeListeners() {
    render();
}

export function renderWebContributePage() {
    state = { view: 'upload', project: null, errorMessage: '' };
    
    return `
        <header>
            <h1 class="text-3xl font-bold">Web Contribute</h1>
            <p class="text-text-secondary mt-1">Easily contribute a project directly from your browser.</p>
        </header>
        ${renderPrinciplesOfValue()}
        <div id="web-contribute-container" class="bg-surface p-2 sm:p-6 rounded-lg border border-primary mt-8">
        </div>
    `;
}