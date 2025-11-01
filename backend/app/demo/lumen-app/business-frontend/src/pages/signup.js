import { register } from '../lib/auth.js';
import { navigate } from '../router.js';
import zxcvbn from 'zxcvbn';

function setupEventListeners() {
    const form = document.getElementById('signup-form');
    if (!form) return;

    const passwordInput = document.getElementById('password');
    const strengthBarFill = document.getElementById('strength-bar-fill');
    const strengthText = document.getElementById('strength-text');

    passwordInput.addEventListener('input', () => {
        const result = zxcvbn(passwordInput.value);
        const score = result.score;
        strengthBarFill.style.width = ['0%', '25%', '50%', '75%', '100%'][score];
        strengthBarFill.className = `strength-bar-fill ${['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'][score]}`;
        strengthText.textContent = strengthBarFill.style.width === '0%' ? '' : ['Very Weak', 'Weak', 'Okay', 'Good', 'Strong'][score];
    });
    
    if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
        grecaptcha.render('recaptcha-container', {
          'sitekey' : import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY,
          'theme' : 'light'
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = e.target.fullName.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const companyName = e.target.companyName.value;
        const jobTitle = e.target.jobTitle.value;
        const companySize = e.target.companySize.value;
        const industry = e.target.industry.value;
        const recaptcha_token = grecaptcha.getResponse();
        
        const params = new URLSearchParams(window.location.search);
        const invite_token = params.get('invite_token');

        const submitButton = form.querySelector('button[type="submit"]');
        const errorMessageElement = document.getElementById('error-message');

        errorMessageElement.classList.add('hidden');
        
        if (!recaptcha_token) {
            errorMessageElement.textContent = "Please complete the reCAPTCHA challenge.";
            errorMessageElement.classList.remove('hidden');
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;

        try {
            await register(fullName, email, password, companyName, jobTitle, companySize, industry, recaptcha_token, invite_token);
            navigate('/check-email');
        } catch (error) {
            errorMessageElement.textContent = error.response?.data?.detail || 'An unknown error occurred.';
            errorMessageElement.classList.remove('hidden');
            grecaptcha.reset();
            submitButton.disabled = false;
            submitButton.innerHTML = 'Create Account';
        }
    });
}

export function renderSignupPage() {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get('invite_token');

    const companyFieldsClass = inviteToken ? 'hidden' : '';

    setTimeout(setupEventListeners, 0);
    return `
    <div class="flex-grow flex items-stretch bg-white min-h-[calc(100vh-6rem)]">
        <div class="hidden lg:flex flex-col w-2/5 bg-white p-12 lg:p-20 justify-between">
            <div>
                 <a href="/" class="flex items-center gap-3">
                    <img src="/logo.png?v=2" alt="Lumen Logo" class="h-10 w-10">
                    <span class="font-bold text-2xl text-text-headings">lumen</span>
                </a>
                <h2 class="text-3xl font-bold tracking-tight text-text-headings mt-12">The Strategic Data Advantage for AI</h2>
                <p class="mt-4 text-text-body">Create an account to unlock proprietary, ethically-sourced code and build world-class models without legal risk.</p>
                <ul class="mt-8 space-y-4 text-text-body">
                    <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-primary shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        <span><strong>Access Proprietary Data:</strong> Gain a competitive edge with high-signal, human-written code not found on public repositories.</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-primary shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        <span><strong>Manage Your Team:</strong> Invite members, manage API keys, and monitor usage from a unified dashboard.</span>
                    </li>
                     <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-primary shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        <span><strong>Secure API Access:</strong> Integrate Lumen's data into your MLOps pipeline with secure, revocable API keys.</span>
                    </li>
                </ul>
            </div>
        </div>
        <div class="w-full lg:w-3/5 flex flex-col items-center justify-center p-8 bg-gray-100 border-l border-border">
            <div class="max-w-lg w-full">
                <div>
                    <h2 class="text-3xl font-bold tracking-tight text-text-headings">Create your business account</h2>
                    <p class="mt-2 text-text-body">
                        ${inviteToken ? 'You are joining a team. Complete your profile to continue.' : 'The first user to register for a company becomes its administrator.'}
                    </p>
                    <p class="mt-1 text-text-muted">
                        Already have an account? <a href="/login" class="font-medium text-primary hover:text-accent-red-dark">Sign in</a>
                    </p>
                </div>
                <div class="mt-8">
                    <div id="error-message" class="hidden bg-red-100 border border-red-300 text-red-800 text-sm p-3 rounded-md mb-4"></div>
                    <form id="signup-form" class="space-y-4">
                        <div class="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label for="fullName" class="form-label">Full Name</label>
                                <input id="fullName" name="fullName" type="text" required class="form-input">
                            </div>
                            <div>
                                <label for="jobTitle" class="form-label">Job Title <span class="text-text-muted">(Optional)</span></label>
                                <input id="jobTitle" name="jobTitle" type="text" class="form-input">
                            </div>
                        </div>
                        <div>
                            <label for="email" class="form-label">Work Email</label>
                            <input id="email" name="email" type="email" autocomplete="email" required class="form-input">
                        </div>
                        <div>
                             <label for="password" class="form-label">Password</label>
                            <input id="password" name="password" type="password" required class="form-input" minlength="8">
                            <div class="mt-2 w-full bg-gray-200 rounded-full h-1.5"><div id="strength-bar-fill" class="h-1.5 rounded-full transition-all"></div></div>
                            <p id="strength-text" class="text-xs text-right text-gray-500 h-4 mt-1"></p>
                        </div>
                         <hr class="!my-6 border-border ${companyFieldsClass}"/>
                        <div class="grid sm:grid-cols-2 gap-4 ${companyFieldsClass}">
                             <div>
                                <label for="companyName" class="form-label">Company Name</label>
                                <input id="companyName" name="companyName" type="text" ${!inviteToken ? 'required' : ''} class="form-input">
                            </div>
                            <div>
                                <label for="companySize" class="form-label">Company Size <span class="text-text-muted">(Optional)</span></label>
                                <select id="companySize" name="companySize" class="form-input">
                                    <option value="">Select a size...</option>
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-1000">201-1,000 employees</option>
                                    <option value="1001+">1,001+ employees</option>
                                </select>
                            </div>
                        </div>
                        <div class="${companyFieldsClass}">
                            <label for="industry" class="form-label">Industry <span class="text-text-muted">(Optional)</span></label>
                            <input id="industry" name="industry" type="text" class="form-input" placeholder="e.g., AI Research, FinTech, Healthcare">
                        </div>
                        <div class="flex justify-center pt-2"><div id="recaptcha-container"></div></div>
                        <div class="pt-2">
                            <button type="submit" class="w-full px-8 py-3 font-bold bg-primary text-white hover:bg-accent-red-dark rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-out">Create Account</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <style>
        .form-input { @apply block w-full rounded-md border-0 py-2.5 px-3 bg-white text-text-body shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6; }
        .form-label { @apply block text-sm font-medium leading-6 text-text-body; }
        .strength-bar-fill { @apply transition-all duration-300; }
    </style>
    `;
}