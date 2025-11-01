import api from '../lib/api.js';

let state = {
    view: 'initial', // initial, loading, results, error
    loadingStep: 0,
    results: null,
    errorMessage: '',
    projects: [],
    selectedProjectId: null,
};

const loadingSteps = [
    "Preparing sample project...",
    "AI is analyzing code quality & architecture...",
    "Calculating final value based on uniqueness & complexity..."
];

function setState(newState) {
    Object.assign(state, newState);
    render();
}

function renderScore(label, score) {
    const normalizedScore = (score === undefined || score === null) ? 0 : Math.max(0, Math.min(1, score));
    const percentage = normalizedScore * 100;
    const scoreText = (normalizedScore * 10).toFixed(1);

    return `
        <div>
            <div class="flex justify-between items-center text-sm mb-1">
                <span class="font-medium text-text-secondary">${label}</span>
                <span class="font-mono font-bold text-text-main">${scoreText}<span class="text-text-secondary font-sans">/10</span></span>
            </div>
            <div class="w-full bg-primary rounded-full h-2.5">
                <div class="bg-accent-primary h-2.5 rounded-full" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

function renderKeyMetric(label, value, bold = false) {
    return `
        <div class="flex justify-between items-center text-sm py-2 border-b border-primary/50">
            <span class="${bold ? 'font-bold' : ''} text-text-secondary">${label}</span>
            <span class="font-mono text-text-main bg-primary px-2 py-1 rounded-md ${bold ? 'font-bold' : ''}">${value}</span>
        </div>
    `;
}

async function loadProjects() {
    try {
        const response = await api.get('/demo/projects');
        const projects = response.data.projects;
        setState({ 
            projects,
            selectedProjectId: projects.length > 0 ? projects[0].id : null  // Premier projet sélectionné par défaut
        });
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

function selectProject(projectId) {
    setState({ selectedProjectId: projectId });
    
    // Si on a déjà lancé une analyse (pas en état initial), relancer automatiquement
    if (state.view === 'results' || state.view === 'error') {
        handleStartDemo();
    }
}

async function handleStartDemo() {
    if (!state.selectedProjectId) {
        setState({ view: 'error', errorMessage: 'Please select a project first.' });
        return;
    }

    setState({ view: 'loading', loadingStep: 0 });
    
    let stepInterval;
    const advanceStep = () => {
        setState({ loadingStep: Math.min(state.loadingStep + 1, loadingSteps.length - 1) });
    };
    stepInterval = setInterval(advanceStep, 4000);

    try {
        const response = await api.post('/demo/analyze', {
            project_id: state.selectedProjectId
        });
        clearInterval(stepInterval);
        setState({ view: 'results', results: response.data });
    } catch (error) {
        clearInterval(stepInterval);
        let message = 'An unknown error occurred. Please try again later.';
        if (error.response?.status === 429) {
            message = 'Demo requests are limited. Please try again in an hour.';
        } else if (error.response?.data?.detail) {
            message = error.response.data.detail;
        }
        setState({ view: 'error', errorMessage: message });
    }
}

function renderProjectSelector() {
    if (state.projects.length === 0) {
        return `
            <div class="text-center text-text-secondary text-sm">
                <p>Loading projects...</p>
            </div>
        `;
    }

    return `
        <div class="space-y-2">
            <h3 class="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Select a demo project</h3>
            ${state.projects.map(project => `
                <button 
                    class="project-selector-btn w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        state.selectedProjectId === project.id 
                            ? 'bg-accent-primary text-white shadow-lg' 
                            : 'bg-surface text-text-main hover:bg-primary border border-subtle hover:border-primary'
                    }"
                    data-project-id="${project.id}"
                >
                    <div class="font-semibold">${project.display_name}</div>
                    <div class="text-xs opacity-80 mt-1">${project.description}</div>
                </button>
            `).join('')}
        </div>
    `;
}

function render() {
    const container = document.getElementById('demo-page-container');
    if (!container) return;

    let mainContent = '';

    switch (state.view) {
        case 'loading':
            mainContent = `
                <div class="text-center p-12 transition-all duration-500 animate-fade-in-up">
                    <span class="animate-spin inline-block w-16 h-16 border-4 border-transparent border-t-accent-primary rounded-full mb-8"></span>
                    <h2 class="text-3xl font-bold text-text-main">Analyzing...</h2>
                    <p class="text-text-secondary mt-4 text-lg">${loadingSteps[state.loadingStep]}</p>
                </div>
            `;
            break;
        case 'results':
            const reward = state.results.final_reward_usd || 0.0;
            const isOpenSource = state.results.is_open_source || false;
            const languageBreakdown = state.results.language_breakdown || {};
            const languageEntries = Object.entries(languageBreakdown);
            
            const openSourceWarningHtml = isOpenSource ? `
                <div class="mb-6 p-4 bg-yellow-400/10 border border-yellow-500/20 text-yellow-700 rounded-md text-sm">
                    <strong>⚠️ Public Code Detected:</strong> Our engine found a high similarity with public code. To prioritize novel data, the reward for this submission has been significantly reduced.
                </div>
            ` : '';
            
            mainContent = `
                <div class="bg-surface p-8 rounded-lg border border-primary animate-fade-in-up">
                    ${openSourceWarningHtml}
                    
                    <div class="text-center mb-8 p-8 bg-primary rounded-lg border border-subtle">
                        <p class="text-sm font-bold text-text-secondary uppercase tracking-widest">Simulated Value</p>
                        <p class="text-5xl lg:text-6xl font-bold text-accent-primary mt-2">$${reward.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</p>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-primary/50 p-6 rounded-lg border border-primary flex flex-col">
                            <h3 class="font-bold text-lg text-text-main mb-4 flex-shrink-0">AI Analysis Summary</h3>
                            <div class="text-sm text-text-secondary leading-relaxed flex-grow">
                                ${state.results.analysis_summary || 'No summary available.'}
                            </div>
                        </div>

                        <div class="space-y-6">
                            <div class="bg-primary/50 p-6 rounded-lg border border-primary">
                                <h3 class="font-bold text-lg text-text-main mb-4">Valuation Scores</h3>
                                <div class="space-y-4">
                                    ${renderScore('Project Clarity', state.results.project_clarity_score)}
                                    ${renderScore('Architecture', state.results.architectural_quality_score)}
                                    ${renderScore('Code Quality', state.results.code_quality_score)}
                                </div>
                            </div>
                            
                            <div class="bg-primary/50 p-6 rounded-lg border border-primary">
                                <h3 class="font-bold text-lg text-text-main mb-3">Key Metrics</h3>
                                <div class="space-y-1">
                                    ${renderKeyMetric('Tokens Analyzed', state.results.total_tokens?.toLocaleString() ?? 'N/A')}
                                    ${renderKeyMetric('Avg. Complexity', state.results.avg_complexity?.toFixed(2) ?? 'N/A')}
                                    ${renderKeyMetric('Uniqueness Multiplier', `${state.results.rarity_multiplier?.toFixed(2) ?? 'N/A'}x`)}
                                </div>
                                <div class="my-3 border-t border-subtle"></div>
                                <div class="space-y-1">
                                    ${renderKeyMetric('Total LLOC', state.results.total_lloc?.toLocaleString() ?? 'N/A')}
                                    ${renderKeyMetric('Code Ratio', state.results.compression_ratio?.toFixed(2) ?? 'N/A')}
                                    ${renderKeyMetric('Innovation Multiplier', `${state.results.rarity_multiplier?.toFixed(2) ?? 'N/A'}x`)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${languageEntries.length > 0 ? `
                        <div class="mt-6 bg-primary/50 p-6 rounded-lg border border-primary">
                            <h3 class="font-bold text-lg text-text-main mb-3">Language Breakdown</h3>
                            <div class="space-y-1 text-sm">
                                ${languageEntries.map(([lang, count]) => `
                                    <div class="flex justify-between items-center py-1 border-b border-primary/50">
                                        <span class="text-text-secondary">${lang}</span>
                                        <span class="font-mono text-text-main">${count.toLocaleString()} ${count === 1 ? 'file' : 'files'}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button id="run-again-btn" class="w-full sm:w-auto px-8 py-3 font-bold bg-primary text-text-main hover:bg-subtle/80 rounded-lg">Run Again</button>
                        <a href="/signup" class="w-full sm:w-auto px-8 py-3 font-bold bg-accent-primary text-white hover:bg-red-700 rounded-lg">Create Account & Start Earning</a>
                    </div>
                </div>
            `;
            break;
        case 'error':
            mainContent = `
                <div class="text-center p-16 animate-fade-in-up">
                    <h2 class="text-3xl font-bold text-red-600">An Error Occurred</h2>
                    <p class="text-text-secondary mt-4 text-lg">${state.errorMessage}</p>
                    <button id="run-again-btn" class="mt-10 px-8 py-3 font-bold bg-primary text-text-main rounded-lg">Try Again</button>
                </div>
            `;
            break;
        case 'initial':
        default:
            mainContent = `
                <div class="text-center animate-fade-in-up py-8 md:py-16">
                    <h1 class="text-4xl md:text-5xl font-bold text-accent-primary tracking-tighter">Try the Lumen Engine</h1>
                    <p class="mt-6 text-base text-text-secondary max-w-2xl mx-auto">
                        Experience the Lumen Engine in action. Select a demo project on the left and click the button below to see how our AI evaluates code quality, complexity, and novelty.
                    </p>
                    <div class="mt-8">
                        <button id="start-demo-btn" class="px-10 py-4 font-bold bg-accent-primary text-white hover:bg-red-700 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                            Start Live Demo
                        </button>
                    </div>
                </div>
            `;
            break;
    }

    const fullLayout = `
        <div class="flex flex-col lg:flex-row gap-6">
            <!-- Project Selector (Left) -->
            <div class="lg:w-72 flex-shrink-0">
                <div class="bg-surface p-6 rounded-lg border border-primary sticky top-32">
                    ${renderProjectSelector()}
                </div>
            </div>
            
            <!-- Main Content (Right) -->
            <div class="flex-1">
                ${mainContent}
            </div>
        </div>
    `;

    container.innerHTML = fullLayout;
    
    // Attach event listeners
    document.getElementById('start-demo-btn')?.addEventListener('click', handleStartDemo);
    document.getElementById('run-again-btn')?.addEventListener('click', () => {
        // Retour à l'état initial avec le premier projet sélectionné
        const firstProjectId = state.projects.length > 0 ? state.projects[0].id : null;
        setState({ view: 'initial', selectedProjectId: firstProjectId });
    });
    
    // Attach project selector listeners
    document.querySelectorAll('.project-selector-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.getAttribute('data-project-id');
            selectProject(projectId);
        });
    });
}

export function renderDemoPage() {
    setTimeout(() => {
        loadProjects();
        setState({ view: 'initial' });
    }, 0);
    return `
        <main class="flex-grow bg-background pt-28">
            <div class="container mx-auto px-6 py-12 md:py-20">
                <div id="demo-page-container" class="max-w-7xl mx-auto">
                    <!-- Dynamic content will be rendered here -->
                </div>
            </div>
        </main>
    `;
}