import { api, getUser } from '../../../lib/auth.js';
import { parseAndFilterProject, getAllFilesFromDataTransfer } from '../../../lib/contributionParser.js';
import { icons } from './utils.js';
import { navigate } from '../../../router.js';

let state = {
    view: 'select-mode',
    project: null,
    errorMessage: '',
    repos: [],
    selectedRepo: null,
    isLoadingRepos: false,
    repoListScrollTop: 0,
};
let currentDashboardState = null;

function setState(newState) {
    const repoListContainer = document.querySelector('.custom-scrollbar');
    if (state.view === 'github-list' && repoListContainer) {
        state.repoListScrollTop = repoListContainer.scrollTop;
    }

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
        <div class="bg-surface rounded-lg border border-primary overflow-hidden">
            <div class="grid md:grid-cols-3">
            ${principles.map((principle, index) => `
                <div class="p-6 relative ${index < 2 ? 'md:border-r md:border-primary' : ''}">
                    <span class="absolute top-4 right-4 text-5xl font-bold text-accent-primary opacity-10">${principle.number}</span>
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
        const icon = isFolder ? icons.folder.replace('text-accent-cyan', 'text-accent-primary') : icons.file;

        if (isFolder) {
            html += `<li class="mt-1">
                <details open>
                    <summary class="folder-item file-item">${icon} ${cleanName}</summary>
                    <ul class="pl-4">${buildFileTreeHtml(children)}</ul>
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
        handleSuccess(response.data.contribution_id);
    } catch (error) {
        setState({ view: 'error', errorMessage: error.response?.data?.detail || 'An unexpected error occurred during submission.' });
    }
}

async function handleGithubSubmit() {
     if (!state.selectedRepo) return;
     setState({ view: 'submitting' });
     try {
        const response = await api.post('/users/me/contribute/github', {
            repo_full_name: state.selectedRepo.full_name,
            default_branch: state.selectedRepo.default_branch
        });
        handleSuccess(response.data.contribution_id);
     } catch (error) {
         setState({ view: 'error', errorMessage: error.response?.data?.detail || 'Failed to submit GitHub repository.' });
     }
}

function handleSuccess(contributionId) {
    const placeholderContribution = {
        id: contributionId,
        created_at: new Date().toISOString(),
        status: 'PENDING',
        reward_amount: 0,
        valuation_details: {},
    };

    if (currentDashboardState.paginatedContributions) {
        currentDashboardState.paginatedContributions.unshift(placeholderContribution);
    }
    if (currentDashboardState.allUserContributions) {
        currentDashboardState.allUserContributions.unshift(placeholderContribution);
    }
    if (window.contributionsState) {
        window.contributionsState.totalContributions += 1;
    }

    setState({ view: 'success', project: { id: contributionId } });
}

async function fetchGithubRepos() {
    setState({ view: 'github-list', isLoadingRepos: true });
    try {
        const response = await api.get('/users/me/github/repos');
        setState({ repos: response.data, isLoadingRepos: false });
    } catch (error) {
        setState({ view: 'error', errorMessage: error.response?.data?.detail || 'Failed to fetch repositories. Make sure your GitHub account is linked.' });
    }
}

function render() {
    const container = document.getElementById('web-contribute-container');
    if (!container) return;

    let content = '';
    
    const modeSelector = `
        <div class="flex justify-center space-x-6 mb-8">
             <button id="mode-upload" class="px-6 py-3 rounded-lg font-bold transition-all shadow-sm ${state.view === 'upload' || state.view === 'analyzing' || state.view === 'confirm' ? 'bg-accent-primary text-white shadow-md transform scale-105' : 'bg-white border border-subtle text-text-main hover:bg-gray-50 hover:border-accent-primary/50'}">Upload Folder</button>
             <button id="mode-github" class="px-6 py-3 rounded-lg font-bold transition-all shadow-sm ${state.view === 'github-list' ? 'bg-accent-primary text-white shadow-md transform scale-105' : 'bg-white border border-subtle text-text-main hover:bg-gray-50 hover:border-accent-primary/50'}">Import from GitHub</button>
        </div>
    `;

    switch (state.view) {
        case 'select-mode':
            setState({ view: 'upload' }); 
            return;

        case 'upload':
             const user = getUser();
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const successfulStatuses = ['PROCESSED', 'REJECTED_NO_NEW_CODE', 'REJECTED_NO_REWARD'];
            
            const contributionsToday = (currentDashboardState?.allUserContributions || [])
                .filter(c => 
                    new Date(c.created_at) > oneDayAgo &&
                    successfulStatuses.includes(c.status)
                );
            
            const contributionsLeft = Math.max(0, 3 - contributionsToday.length);
            
            content = `
                ${modeSelector}
                <div class="text-center mb-6">
                    <p class="text-sm font-medium ${contributionsLeft > 0 ? 'text-text-secondary' : 'text-amber-600'}">
                        You have ${contributionsLeft} / 3 successful contributions remaining today.
                    </p>
                </div>
                <div id="drop-zone" class="drop-zone flex flex-col justify-center bg-white border-2 border-dashed border-subtle rounded-xl p-12 transition-colors ${contributionsLeft === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent-primary hover:bg-blue-50/30'}">
                    <div class="flex flex-col items-center">
                        <div class="w-20 h-20 text-accent-primary mb-4 flex items-center justify-center bg-primary/30 rounded-full">${icons.upload}</div>
                        <span class="font-bold text-xl text-text-main">Drag & drop your project folder here</span>
                        <span class="text-text-secondary mt-2">or</span>
                        <label for="folder-input" class="mt-3 font-bold text-accent-primary hover:text-red-700 cursor-pointer text-lg transition-colors">
                            Select a folder
                            <input type="file" id="folder-input" webkitdirectory directory class="sr-only" ${contributionsLeft === 0 ? 'disabled' : ''}>
                        </label>
                        <p class="text-sm text-text-secondary mt-6">Max project size: 5 MB. All processing is done in your browser before upload.</p>
                    </div>
                </div>
            `;
            break;

        case 'github-list':
            let repoListHtml = '';
            if (state.isLoadingRepos) {
                repoListHtml = `<div class="text-center p-12 bg-white rounded-lg border border-subtle"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-primary rounded-full"></span><p class="mt-4 text-text-secondary font-medium">Fetching your repositories...</p></div>`;
            } else if (state.repos.length === 0) {
                repoListHtml = `<div class="text-center p-12 bg-white rounded-lg border border-subtle text-text-secondary">No repositories found.</div>`;
            } else {
                repoListHtml = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 p-2 custom-scrollbar">
                    ${state.repos.map(repo => `
                        <div class="repo-item p-5 bg-white border border-subtle rounded-xl cursor-pointer transition-all duration-200 relative ${state.selectedRepo?.id === repo.id ? 'ring-2 ring-accent-primary border-transparent shadow-xl transform scale-[1.02] z-50' : 'hover:border-accent-primary hover:shadow-md z-0'}" data-repo='${JSON.stringify(repo)}'>
                            <div class="flex justify-between items-start">
                                <h4 class="font-bold text-text-main truncate text-lg">${repo.name}</h4>
                                ${repo.private ? '<span class="px-2.5 py-1 bg-gray-100 text-xs font-semibold rounded-full text-gray-600 border border-gray-200">Private</span>' : ''}
                            </div>
                            <p class="text-sm text-text-secondary mt-2 line-clamp-2 h-10">${repo.description || 'No description available'}</p>
                            <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                <div class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full bg-accent-primary"></span>
                                    <span class="text-xs font-medium text-text-main">${repo.language || 'Unknown'}</span>
                                </div>
                                <span class="text-xs text-text-secondary">Updated ${new Date(repo.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-8 flex justify-end">
                     <button id="submit-repo-btn" class="px-8 py-4 font-bold text-lg bg-accent-primary text-white rounded-lg shadow-lg hover:bg-red-700 hover:shadow-xl hover:scale-105 transition-all transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" ${!state.selectedRepo ? 'disabled' : ''}>
                        Import Selected Repository
                     </button>
                </div>
                `;
            }

            content = `
                ${modeSelector}
                <div class="bg-surface p-6 sm:p-8 rounded-xl border border-primary">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="font-bold text-xl text-text-main">Select a Repository</h3>
                        <span class="text-sm text-text-secondary">${state.repos.length} repositories found</span>
                    </div>
                    ${repoListHtml}
                </div>
            `;
            break;

        case 'analyzing':
            content = `
                <div class="text-center p-12 bg-white rounded-xl border border-subtle shadow-sm">
                    <span class="animate-spin inline-block w-12 h-12 border-4 border-transparent border-t-accent-primary rounded-full"></span>
                    <p class="mt-6 text-lg text-text-main font-bold">Analyzing project locally...</p>
                    <p class="text-sm text-text-secondary mt-2">Your code has not left your browser.</p>
                </div>
            `;
            break;

        case 'confirm':
            content = `
                <h2 class="text-2xl font-bold mb-2 text-text-main">Confirm Your Contribution</h2>
                <p class="text-text-secondary mb-8">Review the project structure that will be submitted. Our filters have been applied.</p>
                <div class="grid lg:grid-cols-3 gap-6">
                    <div data-lenis-prevent class="lg:col-span-1 h-96 overflow-y-auto bg-white p-4 rounded-lg border border-subtle file-tree shadow-inner">
                        ${buildFileTreeHtml(state.project.fileTree)}
                    </div>
                    <div class="lg:col-span-2 bg-white p-6 rounded-lg border border-subtle shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 class="font-bold text-lg text-text-main mb-4 pb-2 border-b border-subtle">Submission Summary</h3>
                            <div class="space-y-4 text-sm">
                                <div class="flex justify-between items-center">
                                    <span class="text-text-secondary">Files included:</span>
                                    <strong class="font-mono text-base text-text-main bg-primary px-2 py-1 rounded">${state.project.includedCount}</strong>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-text-secondary">Files excluded:</span>
                                    <strong class="font-mono text-base text-text-main bg-primary px-2 py-1 rounded">${state.project.excludedCount}</strong>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-text-secondary">Payload size:</span>
                                    <strong class="font-mono text-base text-text-main bg-primary px-2 py-1 rounded">${(state.project.totalSize / 1024 / 1024).toFixed(2)} MB</strong>
                                </div>
                            </div>
                            <div class="mt-6 text-xs p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex gap-3">
                                <svg class="w-5 h-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p><strong>Reward Notice:</strong> To encourage use of the secure, open-source CLI, contributions made via the web interface receive a modified reward (1/1.5 of the standard rate).</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4 mt-8">
                             <button id="cancel-btn" class="w-1/3 py-3 text-sm font-bold bg-surface border border-subtle text-text-main hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                            <button id="submit-btn" class="w-2/3 py-3 text-sm font-bold bg-accent-primary text-white rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5">Confirm & Contribute</button>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'submitting':
             content = `<div class="text-center p-16 bg-white rounded-xl border border-subtle shadow-sm">
                <span class="animate-spin inline-block w-12 h-12 border-4 border-transparent border-t-accent-primary rounded-full"></span>
                <p class="mt-6 text-lg text-text-main font-bold">Submitting securely to the network...</p>
            </div>`;
            break;
            
        case 'success':
            content = `<div class="text-center p-16 bg-white rounded-xl border border-subtle shadow-sm">
                <div class="w-20 h-20 mx-auto mb-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-sm">${icons.checkCircle}</div>
                <h2 class="text-2xl font-bold text-text-main">Contribution Received!</h2>
                <p class="text-text-secondary mt-2">Your submission (ID: #${state.project.id}) is now in the processing queue.</p>
                <p class="text-sm text-subtle mt-6">Redirecting to your history...</p>
            </div>`;
            setTimeout(() => {
                navigate('/app/dashboard?tab=my-contributions');
            }, 2500);
            break;

        case 'error':
             content = `<div class="text-center p-16 bg-white rounded-xl border border-subtle shadow-sm">
                <div class="w-20 h-20 mx-auto mb-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm">${icons.errorCircle}</div>
                <h2 class="text-2xl font-bold text-text-main">An Error Occurred</h2>
                <p class="text-text-secondary mt-4 max-w-md mx-auto">${state.errorMessage}</p>
                <button id="try-again-btn" class="mt-8 px-8 py-3 font-bold bg-primary text-text-main hover:bg-subtle rounded-lg transition-colors shadow-sm">Try Again</button>
            </div>`;
            break;
    }
    container.innerHTML = content;
    
    const repoListContainer = document.querySelector('.custom-scrollbar');
    if (state.view === 'github-list' && repoListContainer && state.repoListScrollTop > 0) {
        repoListContainer.scrollTop = state.repoListScrollTop;
    }
    
    attachListeners();
}

function attachListeners() {
    if (state.view === 'upload' || state.view === 'github-list') {
        document.getElementById('mode-upload')?.addEventListener('click', () => setState({ view: 'upload' }));
        document.getElementById('mode-github')?.addEventListener('click', () => fetchGithubRepos());
    }

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
    } else if (state.view === 'github-list') {
        document.querySelectorAll('.repo-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const repo = JSON.parse(e.currentTarget.dataset.repo);
                if (!state.selectedRepo || state.selectedRepo.id !== repo.id) {
                    setState({ selectedRepo: repo });
                }
            });
        });
        document.getElementById('submit-repo-btn')?.addEventListener('click', handleGithubSubmit);
    } else if (state.view === 'confirm') {
        document.getElementById('submit-btn')?.addEventListener('click', handleSubmit);
        document.getElementById('cancel-btn')?.addEventListener('click', () => setState({ view: 'upload', project: null }));
    } else if (state.view === 'error') {
        document.getElementById('try-again-btn')?.addEventListener('click', () => setState({ view: 'upload', errorMessage: '' }));
    }
}

export function attachWebContributeListeners(dashboardState) {
    currentDashboardState = dashboardState;
    render();
}

export function renderWebContributePage(dashboardState) {
    currentDashboardState = dashboardState;
    state = { view: 'upload', project: null, errorMessage: '', repos: [], selectedRepo: null, isLoadingRepos: false, repoListScrollTop: 0 };
    
    if (window.contributionTimerInterval) {
        clearInterval(window.contributionTimerInterval);
        window.contributionTimerInterval = null;
    }
    
    return `
        <header>
            <h1 class="text-3xl font-bold">Web Contribute</h1>
            <p class="text-text-secondary mt-1">Easily contribute a project directly from your browser or import from GitHub.</p>
        </header>
        ${renderPrinciplesOfValue()}
        <div id="web-contribute-container" class="mt-8">
        </div>
    `;
}

export function cleanupWebContribute() {
    if (window.contributionTimerInterval) {
        clearInterval(window.contributionTimerInterval);
        window.contributionTimerInterval = null;
    }
}