import api from '../lib/api.js';
import { navigate } from '../router.js';
import { setAuthData, isAuthenticated } from '../lib/auth.js';

async function handleAccept() {
    const container = document.getElementById('accept-invite-container');
    const messageEl = document.getElementById('accept-invite-message');
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        if (messageEl) messageEl.textContent = 'No invitation token found. Redirecting...';
        setTimeout(() => navigate('/app/overview'), 3000);
        return;
    }

    if (!isAuthenticated()) {
        const fullPath = window.location.pathname + window.location.search;
        localStorage.setItem('post_login_redirect', fullPath);
        navigate('/login');
        return;
    }

    try {
        const response = await api.post(`/business/team/invites/accept/${token}`);
        setAuthData(response.data);
        if (container) {
             container.innerHTML = `
                <div class="w-16 h-16 mx-auto mb-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 class="text-3xl font-bold text-text-headings">Success!</h1>
                <p class="text-text-body mt-3">You have joined the team. Redirecting to your new dashboard...</p>
             `;
        }
        setTimeout(() => window.location.reload(), 2000); // Reload to ensure all state is fresh
    } catch (error) {
        if (container) {
             container.innerHTML = `
                <div class="w-16 h-16 mx-auto mb-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center">
                     <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h1 class="text-3xl font-bold text-text-headings">Invitation Failed</h1>
                <p class="text-text-body mt-3">${error.response?.data?.detail || 'Failed to accept invitation. You may already be part of a team or the invite may have expired.'}</p>
             `;
        }
    }
}

export function renderAcceptInvitePage() {
    setTimeout(handleAccept, 100);
    return `
    <div class="bg-white py-24 sm:py-32 flex-grow flex items-center">
        <div class="container mx-auto px-6 max-w-lg">
            <div id="accept-invite-container" class="text-center">
                <span class="animate-spin inline-block w-12 h-12 border-4 border-transparent border-t-primary rounded-full mb-6"></span>
                <h1 class="text-3xl font-bold text-text-headings">Processing Invitation...</h1>
                <p id="accept-invite-message" class="text-text-body mt-3">Please wait while we add you to the team.</p>
            </div>
        </div>
    </div>
    `;
}