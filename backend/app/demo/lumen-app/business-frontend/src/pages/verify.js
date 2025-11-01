import api from '../lib/api.js';

let status = 'verifying';
let errorMessage = '';

async function verifyToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        status = 'error';
        errorMessage = 'No verification token provided.';
        renderContent();
        return;
    }

    try {
        await api.get(`/business/verify-email?token=${token}`);
        status = 'success';
    } catch (error) {
        status = 'error';
        errorMessage = error.response?.data?.detail || 'An unknown error occurred.';
    } finally {
        renderContent();
    }
}

function renderContent() {
    const contentBox = document.getElementById('verify-content-box');
    if (!contentBox) return;

    if (status === 'verifying') {
        contentBox.innerHTML = `
            <span class="animate-spin inline-block w-12 h-12 border-4 border-transparent border-t-accent-purple rounded-full mb-6"></span>
            <h1 class="text-3xl font-bold text-text-headings">Verifying your account...</h1>
        `;
    } else if (status === 'success') {
        contentBox.innerHTML = `
            <div class="w-16 h-16 mx-auto mb-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 class="text-3xl font-bold text-text-headings">Account Verified!</h1>
            <p class="text-text-body mt-3">You can now log in to the business dashboard.</p>
            <a href="/login" class="mt-8 inline-block px-8 py-3 font-bold bg-accent-gradient text-white rounded-lg">Go to Login</a>
        `;
    } else if (status === 'error') {
         contentBox.innerHTML = `
            <div class="w-16 h-16 mx-auto mb-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h1 class="text-3xl font-bold text-text-headings">Verification Failed</h1>
            <p class="text-text-body mt-3">${errorMessage}</p>
            <a href="/signup" class="mt-8 inline-block px-8 py-3 font-bold bg-gray-700 text-white rounded-lg">Return to Signup</a>
        `;
    }
}

export function renderVerifyPage() {
    setTimeout(verifyToken, 100);
    
    return `
    <div class="bg-white py-24 sm:py-32 flex-grow flex items-center">
        <div class="container mx-auto px-6 max-w-lg">
            <div id="verify-content-box" class="text-center">
                 <span class="animate-spin inline-block w-12 h-12 border-4 border-transparent border-t-accent-purple rounded-full mb-6"></span>
                <h1 class="text-3xl font-bold text-text-headings">Verifying your account...</h1>
            </div>
        </div>
    </div>
    `;
}