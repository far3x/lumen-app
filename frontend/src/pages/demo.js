import api from '../lib/api.js';

let state = {
    view: 'initial', // initial, loading, results, error
    loadingStep: 0,
    results: null,
    errorMessage: '',
};

const loadingSteps = [
    "Preparing sample project: The Lumen CLI...",
    "AI is analyzing code quality & architecture...",
    "Calculating final value based on uniqueness & complexity..."
];

function setState(newState) {
    Object.assign(state, newState);
    render();
}

function renderScore(label, score) {
    const normalizedScore = (score === undefined || score === null) ? 0 : Math.max(0, Math.min(1, score));
    const scoreText = (normalizedScore * 10).toFixed(1);

    return `
        <div class="flex justify-between items-center text-sm py-3 border-b border-primary/50">
            <span class="font-medium text-text-secondary">${label}</span>
            <span class="font-mono font-bold text-text-main">${scoreText}<span class="text-text-secondary font-sans">/10</span></span>
        </div>
    `;
}

async function handleStartDemo() {
    setState({ view: 'loading', loadingStep: 0 });
    
    let stepInterval;
    const advanceStep = () => {
        setState({ loadingStep: Math.min(state.loadingStep + 1, loadingSteps.length - 1) });
    };
    stepInterval = setInterval(advanceStep, 4000);

    try {
        const response = await api.post('/demo/analyze');
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

function render() {
    const container = document.getElementById('demo-page-container');
    if (!container) return;

    let content = '';

    switch (state.view) {
        case 'loading':
            content = `
                <div class="text-center p-12 transition-all duration-500 animate-fade-in-up">
                    <span class="animate-spin inline-block w-16 h-16 border-4 border-transparent border-t-accent-primary rounded-full mb-8"></span>
                    <h2 class="text-3xl font-bold text-text-main">Analyzing...</h2>
                    <p class="text-text-secondary mt-4 text-lg">${loadingSteps[state.loadingStep]}</p>
                </div>
            `;
            break;
        case 'results':
            const reward = state.results.final_reward_usd || 0.0;
            content = `
                <div class="bg-surface p-8 rounded-lg border border-primary animate-fade-in-up">
                    <div class="text-center mb-8 p-8 bg-primary rounded-lg border border-subtle">
                        <p class="text-sm font-bold text-text-secondary uppercase tracking-widest">Simulated Value</p>
                        <p class="text-5xl lg:text-6xl font-bold text-accent-primary mt-2">$${reward.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div class="bg-primary/50 p-6 rounded-lg border border-primary">
                            <h3 class="font-bold text-lg text-text-main mb-4">AI Analysis Summary</h3>
                            <p class="text-sm text-text-secondary leading-relaxed">${state.results.analysis_summary || 'No summary available.'}</p>
                        </div>
                        <div class="bg-primary/50 p-6 rounded-lg border border-primary">
                             <h3 class="font-bold text-lg text-text-main mb-2">Valuation Scores</h3>
                             ${renderScore('Project Clarity', state.results.project_clarity_score)}
                             ${renderScore('Architecture', state.results.architectural_quality_score)}
                             ${renderScore('Code Quality', state.results.code_quality_score)}
                        </div>
                    </div>
                    
                    <div class="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button id="run-again-btn" class="w-full sm:w-auto px-8 py-3 font-bold bg-primary text-text-main hover:bg-subtle/80 rounded-lg">Run Again</button>
                        <a href="/signup" class="w-full sm:w-auto px-8 py-3 font-bold bg-accent-primary text-white hover:bg-red-700 rounded-lg">Create Account & Start Earning</a>
                    </div>
                </div>
            `;
            break;
        case 'error':
            content = `
                <div class="text-center p-16 animate-fade-in-up">
                    <h2 class="text-3xl font-bold text-red-600">An Error Occurred</h2>
                    <p class="text-text-secondary mt-4 text-lg">${state.errorMessage}</p>
                    <button id="run-again-btn" class="mt-10 px-8 py-3 font-bold bg-primary text-text-main rounded-lg">Try Again</button>
                </div>
            `;
            break;
        case 'initial':
        default:
            content = `
                <div class="text-center animate-fade-in-up py-16 md:py-24">
                    <h1 class="text-5xl md:text-6xl font-bold text-accent-primary tracking-tighter">Try the Lumen Engine</h1>
                    <p class="mt-8 text-lg text-text-secondary max-w-3xl mx-auto">
                        Experience the Lumen Engine in action. This demo analyzes our own open-source 
                        <a href="https://github.com/far3x/lumen" target="_blank" rel="noopener noreferrer" data-external="true" class="text-accent-primary font-semibold hover:underline">Lumen CLI tool</a>
                        to simulate a real contribution. You'll see exactly how our AI appraises code for quality, complexity, and novelty. No account or coding required.
                    </p>
                    <div class="mt-12">
                        <button id="start-demo-btn" class="px-10 py-4 font-bold bg-accent-primary text-white hover:bg-red-700 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                            Start Live Demo
                        </button>
                    </div>
                </div>
            `;
            break;
    }
    container.innerHTML = content;
    
    document.getElementById('start-demo-btn')?.addEventListener('click', handleStartDemo);
    document.getElementById('run-again-btn')?.addEventListener('click', () => setState({ view: 'initial' }));
}

export function renderDemoPage() {
    setTimeout(() => {
        setState({ view: 'initial' });
    }, 0);
    return `
        <main class="flex-grow bg-background pt-28">
            <div class="container mx-auto px-6 py-12 md:py-20">
                <div id="demo-page-container" class="max-w-4xl mx-auto">
                    <!-- Dynamic content will be rendered here -->
                </div>
            </div>
        </main>
    `;
}