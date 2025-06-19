import { api, updateUserProfile, fetchAndStoreUser, logout, changePassword } from '../../../lib/auth.js';
import { navigate } from '../../../router.js';
import { renderModal } from './utils.js';
import QRCode from 'qrcode';
import zxcvbn from 'zxcvbn';

async function handleProfileSettingsSubmit(e, dashboardState) {
    e.preventDefault();
    const msgEl = document.getElementById('profile-settings-message');
    const btnEl = document.getElementById('save-profile-settings-btn');
    const originalBtnHTML = btnEl.innerHTML;
    
    msgEl.classList.add('hidden');
    btnEl.disabled = true;
    btnEl.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;

    const displayName = document.getElementById('display-name').value;
    const isInLeaderboard = document.getElementById('leaderboard-toggle').checked;

    try {
        await updateUserProfile(displayName, isInLeaderboard);
        const user = await fetchAndStoreUser();
        dashboardState.user = user;
        msgEl.textContent = 'Settings updated successfully!';
        msgEl.className = 'block text-sm p-3 rounded-md bg-green-900/50 text-green-300';
        msgEl.classList.remove('hidden');
        
        document.querySelectorAll('.navbar-user-display-name').forEach(el => {
            el.textContent = user?.display_name ?? 'User';
        });
        document.querySelector('#dashboard-sidebar-area .font-bold.text-lg').textContent = user?.display_name ?? 'User';

    } catch (error) {
        msgEl.textContent = error.response?.data?.detail || 'Failed to update settings.';
        msgEl.className = 'block text-sm p-3 rounded-md bg-red-900/50 text-red-300';
        msgEl.classList.remove('hidden');
    } finally {
        btnEl.disabled = false;
        btnEl.innerHTML = 'Save Changes';
        setTimeout(() => msgEl.classList.add('hidden'), 5000);
    }
}

async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const currentPassword = form['current-password'].value;
    const newPassword = form['new-password'].value;
    const confirmPassword = form['confirm-password'].value;
    const msgEl = document.getElementById('change-password-message');
    const btnEl = form.querySelector('button[type="submit"]');

    msgEl.classList.add('hidden');

    if (newPassword !== confirmPassword) {
        msgEl.textContent = "New passwords do not match.";
        msgEl.className = 'block text-sm p-3 rounded-md bg-red-900/50 text-red-300';
        msgEl.classList.remove('hidden');
        return;
    }

    const strength = zxcvbn(newPassword);
    if (strength.score < 2) {
        msgEl.textContent = strength.feedback.warning || "New password is too weak.";
        msgEl.className = 'block text-sm p-3 rounded-md bg-red-900/50 text-red-300';
        msgEl.classList.remove('hidden');
        return;
    }

    btnEl.disabled = true;
    btnEl.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;

    try {
        await changePassword(currentPassword, newPassword);
        alert("Password updated successfully. You will now be logged out for security.");
        await logout();
        navigate('/login');
    } catch (error) {
        msgEl.textContent = error.response?.data?.detail || 'Failed to change password.';
        msgEl.className = 'block text-sm p-3 rounded-md bg-red-900/50 text-red-300';
        msgEl.classList.remove('hidden');
        btnEl.disabled = false;
        btnEl.innerHTML = 'Update Password';
    }
}


async function handleDisable2FASubmit(e, dashboardState) {
    e.preventDefault();
    const password = document.getElementById('disable-2fa-password').value;
    const msgEl = document.getElementById('disable-2fa-message');
    const btnEl = e.submitter;
    const originalBtnHTML = btnEl.innerHTML;

    btnEl.disabled = true;
    btnEl.innerHTML = `<span class="animate-spin inline-block w-4 h-4 border-2 border-transparent border-t-white rounded-full"></span>`;
    msgEl.classList.add('hidden');

    try {
        await api.post('/security/2fa/disable', { password });
        const user = await fetchAndStoreUser();
        dashboardState.user = user;
        
        const twoFactorCard = document.getElementById('2fa-card');
        if (twoFactorCard) {
            twoFactorCard.innerHTML = render2FACardContent(user);
            document.getElementById('enable-2fa-btn')?.addEventListener('click', () => show2FASetupModal(dashboardState));
        }

    } catch (error) {
        msgEl.textContent = error.response?.data?.detail || 'Failed to disable 2FA.';
        msgEl.className = 'block text-sm p-2 rounded-md bg-red-900/50 text-red-300 mt-2';
        msgEl.classList.remove('hidden');
        btnEl.disabled = false;
        btnEl.innerHTML = originalBtnHTML;
    }
}

function renderBackupCodesModal(backupCodes) {
    const codesHtml = backupCodes.map(code => `<code class="block w-full text-center tracking-widest font-mono p-3 bg-primary rounded-md text-lg">${code}</code>`).join('');
    
    const content = `
        <div class="text-center">
             <div class="w-16 h-16 mx-auto mb-4 bg-yellow-900/50 text-yellow-300 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 class="font-bold text-lg text-white">Save Your Backup Codes</h3>
            <p class="text-text-secondary mt-2 mb-4">
                <strong>This is the only time you will see these codes.</strong> Store them somewhere extremely safe. If you lose your phone, these codes are the only way to get back into your account.
            </p>
            <div class="grid grid-cols-2 gap-3 my-6">${codesHtml}</div>
            <p class="text-xs text-subtle mb-6">Each code can only be used once.</p>
            <button id="backup-codes-close-btn" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-purple hover:bg-accent-purple/80 transition-colors">
                I have saved my codes securely
            </button>
        </div>
    `;

    const { closeModal } = renderModal('Your Backup Codes', content);
    document.getElementById('backup-codes-close-btn').addEventListener('click', closeModal);
}

async function handleEnable2FASubmit(e, setupKey, dashboardState) {
    e.preventDefault();
    const token = document.getElementById('2fa-verification-code').value;
    const msgEl = document.getElementById('enable-2fa-message');
    const btnEl = e.submitter;
    const originalBtnHTML = btnEl.innerHTML;

    msgEl.classList.add('hidden');
    btnEl.disabled = true;
    btnEl.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;
    
    try {
        const response = await api.post('/security/2fa/enable', { token, setup_key: setupKey });
        const user = await fetchAndStoreUser();
        dashboardState.user = user;
        
        const setupModal = document.querySelector('.modal-overlay');
        if (setupModal) setupModal.remove();

        const twoFactorCard = document.getElementById('2fa-card');
        if(twoFactorCard) {
            twoFactorCard.innerHTML = render2FACardContent(user);
            document.getElementById('disable-2fa-form')?.addEventListener('submit', (e) => handleDisable2FASubmit(e, dashboardState));
        }
        
        renderBackupCodesModal(response.data.backup_codes);

    } catch(error) {
        msgEl.textContent = error.response?.data?.detail || 'Failed to enable 2FA.';
        msgEl.classList.remove('hidden');
        btnEl.disabled = false;
        btnEl.innerHTML = originalBtnHTML;
    }
}

async function show2FASetupModal(dashboardState) {
    try {
        const response = await api.post('/security/2fa/setup');
        const { provisioning_uri, setup_key } = response.data;
        
        const content = `
            <div>
                <p class="text-center text-text-secondary mb-4">Scan the QR code with your authenticator app (like Google Authenticator or Authy).</p>
                <div class="flex justify-center bg-white p-4 rounded-lg my-4">
                    <canvas id="qr-code-canvas"></canvas>
                </div>
                <p class="text-center text-text-secondary text-sm">Or enter this key manually:</p>
                <code class="block w-full text-center tracking-widest font-mono p-2 bg-primary rounded-md">${setup_key}</code>

                <form id="enable-2fa-form" class="mt-6">
                    <label for="2fa-verification-code" class="text-sm font-medium text-text-secondary">Enter the 6-digit code from your app to confirm:</label>
                    <input type="text" id="2fa-verification-code" required autocomplete="off"
                           class="mt-1 block w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-accent-purple focus:outline-none">
                    <div id="enable-2fa-message" class="hidden text-sm p-3 rounded-md bg-red-900/50 text-red-300 mt-4"></div>
                    <button type="submit" class="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity">
                        Verify & Enable
                    </button>
                </form>
            </div>
        `;
        renderModal('Enable Two-Factor Authentication', content);
        
        const canvas = document.getElementById('qr-code-canvas');
        QRCode.toCanvas(canvas, provisioning_uri);
        
        document.getElementById('enable-2fa-form').addEventListener('submit', (e) => handleEnable2FASubmit(e, setup_key, dashboardState));

    } catch (error) {
        alert('Could not start 2FA setup process. Please try again.');
    }
}


export function attachSettingsPageListeners(dashboardState) {
    document.getElementById('profile-settings-form')?.addEventListener('submit', (e) => handleProfileSettingsSubmit(e, dashboardState));
    document.getElementById('change-password-form')?.addEventListener('submit', handleChangePasswordSubmit);
    document.getElementById('enable-2fa-btn')?.addEventListener('click', () => show2FASetupModal(dashboardState));
    document.getElementById('disable-2fa-form')?.addEventListener('submit', (e) => handleDisable2FASubmit(e, dashboardState));
    
    document.querySelectorAll('.link-oauth-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const provider = e.currentTarget.dataset.provider;
            window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/users/link-oauth/${provider}`;
        });
    });

    const newPasswordInput = document.getElementById('new-password');
    if(newPasswordInput) {
        newPasswordInput.addEventListener('input', () => {
            const strengthBarFill = document.getElementById('new-password-strength-bar-fill');
            const strengthText = document.getElementById('new-password-strength-text');
            if (newPasswordInput.value) {
                const result = zxcvbn(newPasswordInput.value);
                strengthBarFill.style.width = ['0%', '25%', '50%', '75%', '100%'][result.score];
                strengthBarFill.className = `strength-bar-fill ${['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-500'][result.score]}`;
                strengthText.textContent = ['', 'Weak', 'Fair', 'Good', 'Strong'][result.score];
            } else {
                strengthBarFill.style.width = '0%';
                strengthText.textContent = '';
            }
        });
    }

    // Handle success/error messages from URL
    const params = new URLSearchParams(window.location.search);
    const linkMessageEl = document.getElementById('link-accounts-message');
    const status = params.get('status') || params.get('error');

    if (linkMessageEl && status) {
        let message = "An unknown error occurred.";
        let isSuccess = false;
        
        if (status === 'link_complete') {
            message = "Account linked successfully!";
            isSuccess = true;
        } else if (status === 'email_mismatch') {
            message = "Link failed: The email of the social account does not match your Lumen account email.";
        } else if (status === 'oauth_in_use') {
            message = "Link failed: This social account is already linked to another Lumen account.";
        }
        
        linkMessageEl.textContent = message;
        linkMessageEl.className = `block text-sm p-3 rounded-md mb-4 ${isSuccess ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`;
        linkMessageEl.classList.remove('hidden');
        
        // Clean URL after displaying the message
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('status');
        newUrl.searchParams.delete('error');
        newUrl.searchParams.delete('success');
        window.history.replaceState({}, '', newUrl);
    }
}

function render2FACardContent(user) {
    if (!user) return '<p>Loading security settings...</p>';
    const hasPasswordAuth = user.has_password;
    return `
        <div class="p-6">
            <h3 class="font-bold text-lg">Two-Factor Authentication (2FA)</h3>
            ${user.is_two_factor_enabled ? `
                <p class="text-sm text-green-400 mt-2">2FA is currently <strong>enabled</strong> on your account.</p>
                <form id="disable-2fa-form" class="mt-4">
                    <p class="text-xs text-text-secondary mb-2">To disable 2FA, please enter your password.</p>
                    <div class="flex items-start gap-4">
                        <div class="flex-grow">
                            <input type="password" id="disable-2fa-password" required placeholder="Current Password" class="w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none ${!hasPasswordAuth ? 'opacity-50 cursor-not-allowed' : ''}" ${!hasPasswordAuth ? 'disabled' : ''}>
                            <div id="disable-2fa-message" class="hidden mt-2 text-sm"></div>
                        </div>
                        <button type="submit" class="py-2 px-4 text-sm font-medium text-red-400 bg-red-900/30 hover:bg-red-900/60 rounded-md transition-colors ${!hasPasswordAuth ? 'opacity-50 cursor-not-allowed' : ''}" ${!hasPasswordAuth ? 'disabled' : ''}>Disable 2FA</button>
                    </div>
                     ${!hasPasswordAuth ? `<p class="text-xs text-yellow-400 mt-2">Password required. Cannot disable 2FA for accounts without a password.</p>` : ''}
                </form>
            ` : `
                <p class="text-sm text-text-secondary mt-2">Add an extra layer of security to your account using an authenticator app.</p>
                <button id="enable-2fa-btn" class="mt-4 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-purple hover:bg-accent-purple/80 transition-colors">
                    Enable 2FA
                </button>
            `}
        </div>
    `;
}

function renderLinkedAccountsCard(user) {
    if (!user) return '<p>Loading account settings...</p>';

    return `
        <div class="p-6">
            <h3 class="font-bold text-lg">Linked Accounts</h3>
            <p class="text-sm text-text-secondary mt-1 mb-6">Connect social accounts for quick and easy login.</p>
            <div id="link-accounts-message" class="hidden"></div>
            <div class="space-y-4">
                <div class="flex items-center justify-between bg-primary p-4 rounded-lg">
                    <div class="flex items-center gap-4">
                        <svg class="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,36.627,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                        <span class="font-medium">Google</span>
                    </div>
                    ${user.google_id
                        ? `<span class="text-sm font-medium text-green-400">Connected</span>`
                        : `<button data-provider="google" class="link-oauth-btn text-sm font-medium py-1 px-4 rounded-md bg-surface hover:bg-subtle transition-colors">Connect</button>`
                    }
                </div>
                <div class="flex items-center justify-between bg-primary p-4 rounded-lg">
                     <div class="flex items-center gap-4">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clip-rule="evenodd" /></svg>
                        <span class="font-medium">GitHub</span>
                    </div>
                    ${user.github_id
                        ? `<span class="text-sm font-medium text-green-400">Connected</span>`
                        : `<button data-provider="github" class="link-oauth-btn text-sm font-medium py-1 px-4 rounded-md bg-surface hover:bg-subtle transition-colors">Connect</button>`
                    }
                </div>
            </div>
        </div>
    `;
}

export function renderSettingsPage(user) {
    if (!user) {
        return `<div class="p-8 text-center text-text-secondary">Loading settings...</div>`;
    }
    const hasPasswordAuth = user.has_password;

    return `
        <header>
            <h1 class="text-3xl font-bold">Settings</h1>
            <p class="text-text-secondary mt-1">Manage your profile and account security.</p>
        </header>

        <div class="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            <div class="lg:col-span-2 space-y-8">
                <form id="profile-settings-form" class="bg-surface border border-primary rounded-xl overflow-hidden">
                    <div class="p-6">
                        <h3 class="font-bold text-lg">Profile Information</h3>
                        <p class="text-text-secondary text-sm mt-1 mb-6">This information may be displayed publicly.</p>
                        <div class="space-y-6">
                            <div>
                                <label for="display-name" class="block text-sm font-medium text-text-secondary mb-1">Display Name</label>
                                <input type="text" id="display-name" value="${user.display_name ?? ''}"
                                    class="w-full px-3 py-2 bg-primary border border-subtle rounded-md text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                            </div>
                            <div class="flex items-center justify-between pt-2">
                                <div>
                                    <label for="leaderboard-toggle" class="text-sm font-medium text-text-main">Leaderboard Visibility</label>
                                    <p class="text-xs text-text-secondary">Show my rank on public leaderboards.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="leaderboard-toggle" class="sr-only peer" ${user.is_in_leaderboard ? 'checked' : ''}>
                                    <div class="w-11 h-6 bg-primary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary after:border after:border-primary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-purple"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="bg-primary/50 border-t border-primary px-6 py-4 flex justify-end items-center">
                        <div id="profile-settings-message" class="hidden text-sm mr-auto"></div>
                        <button type="submit" id="save-profile-settings-btn"
                                class="flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-purple hover:bg-accent-purple/80 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
                
                 <div class="bg-surface border border-primary rounded-xl overflow-hidden">
                    ${renderLinkedAccountsCard(user)}
                </div>
            </div>

            <div class="lg:col-span-3 space-y-8">
                <div id="2fa-card" class="bg-surface border border-primary rounded-xl overflow-hidden">
                    ${render2FACardContent(user)}
                </div>
                
                <form id="change-password-form" class="bg-surface border border-primary rounded-xl overflow-hidden">
                    <div class="p-6">
                        <h3 class="font-bold text-lg">Change Password</h3>
                        <p class="text-text-secondary text-sm mt-1 mb-6">Update your password. You will be logged out after this action.</p>
                        ${!hasPasswordAuth ? `<p class="text-sm p-4 bg-primary rounded-lg text-text-secondary">Password management is unavailable for accounts created via social login. To enable, please contact support.</p>` : `
                        <div class="space-y-4">
                            <div>
                                <label for="current-password" class="block text-sm font-medium text-text-secondary mb-1">Current Password</label>
                                <input type="password" id="current-password" required class="w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                            </div>
                            <div>
                                <label for="new-password" class="block text-sm font-medium text-text-secondary mb-1">New Password</label>
                                <input type="password" id="new-password" required class="w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                                <div class="strength-bar"><div id="new-password-strength-bar-fill" class="strength-bar-fill"></div></div>
                                <div class="error-text h-4"><span id="new-password-strength-text" class="text-xs text-subtle"></span></div>
                            </div>
                            <div>
                                <label for="confirm-password" class="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
                                <input type="password" id="confirm-password" required class="w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                            </div>
                        </div>
                        `}
                    </div>
                    ${hasPasswordAuth ? `
                    <div class="bg-primary/50 border-t border-primary px-6 py-4 flex justify-end items-center">
                        <div id="change-password-message" class="hidden text-sm mr-auto"></div>
                        <button type="submit" class="w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-purple hover:bg-accent-purple/80 transition-colors">
                            Update Password
                        </button>
                    </div>
                    ` : ''}
                </form>
            </div>
        </div>
    `;
}