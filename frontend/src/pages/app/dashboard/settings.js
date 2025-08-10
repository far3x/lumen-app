import { api, updateUserProfile, fetchAndStoreUser, logout, changePassword, getUser } from '../../../lib/auth.js';
import { navigate } from '../../../router.js';
import { renderModal, renderWalletSelectionModal } from './utils.js';
import QRCode from 'qrcode';
import zxcvbn from 'zxcvbn';
import { walletService } from '../../../lib/wallet.js';
import { PublicKey } from '@solana/web3.js';

function bytesToHex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function refreshWalletCard() {
    const walletCard = document.getElementById('wallet-management-card');
    const user = getUser();
    if (walletCard && user) {
        walletCard.innerHTML = renderWalletManagementCard(user);
        attachWalletManagementListeners(user);
    }
}

async function handleLinkPhantomWallet(user) {
    const messageEl = document.getElementById('wallet-management-message');
    const button = document.getElementById('link-phantom-wallet-btn');

    if (!walletService.isWalletConnected() || !walletService.getAdapter() || walletService.getAdapter().name !== 'Phantom') {
        if (messageEl) {
            messageEl.textContent = 'Please connect your Phantom wallet first.';
            messageEl.className = 'block text-sm p-3 rounded-md bg-red-900/50 text-red-300 mt-4';
            messageEl.classList.remove('hidden');
        }
        renderWalletSelectionModal();
        return;
    }

    if (button) {
        button.disabled = true;
        button.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Linking...`;
    }
    if (messageEl) messageEl.classList.add('hidden');

    try {
        const nonce = new Date().getTime();
        const messageToSign = `Sign this message to link your wallet to your Lumen account.\n\nAddress: ${walletService.publicKey.toBase58()}\nNonce: ${nonce}`;
        
        const signatureBytes = await walletService.signMessage(new TextEncoder().encode(messageToSign));
        const signatureHex = bytesToHex(signatureBytes);

        await api.post('/users/me/link-wallet', {
            solana_address: walletService.publicKey.toBase58(),
            message: messageToSign,
            signature: signatureHex
        });
        
        await fetchAndStoreUser(); 
        
        if (messageEl) {
            messageEl.textContent = 'Wallet linked successfully! Reloading page to reflect changes...';
            messageEl.className = 'block text-sm p-3 rounded-md bg-green-900/50 text-green-300 mt-4';
            messageEl.classList.remove('hidden');
        }
        setTimeout(() => window.location.reload(), 2000);

    } catch (error) {
        let detail = 'Failed to link wallet. Please try again.';
        if (error.response?.data?.detail) {
            detail = error.response.data.detail;
        } else if (error.message?.includes('User rejected the request')) {
            detail = 'Wallet link cancelled by user.';
        }
        if (messageEl) {
            messageEl.textContent = detail;
            messageEl.className = 'block text-sm p-3 rounded-md bg-red-900/50 text-red-300 mt-4';
            messageEl.classList.remove('hidden');
        }
        if (button) {
            button.disabled = false;
            button.innerHTML = document.getElementById('link-phantom-wallet-btn').dataset.originalText || 'Link Phantom Wallet';
        }
    }
}

async function handleSaveManualWalletAddress(e) {
    e.preventDefault();
    const messageEl = document.getElementById('wallet-management-message');
    const button = document.getElementById('save-manual-wallet-btn');
    const inputEl = document.getElementById('manual-solana-address');
    const address = inputEl.value.trim();

    if (button) {
        button.disabled = true;
        button.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Saving...`;
    }
    if (messageEl) messageEl.classList.add('hidden');

    try {
        new PublicKey(address); 
    } catch (err) {
        if (messageEl) {
            messageEl.textContent = 'Invalid Solana address format.';
            messageEl.className = 'block text-sm p-3 rounded-md bg-red-900/50 text-red-300 mt-4';
            messageEl.classList.remove('hidden');
        }
        if (button) {
            button.disabled = false;
            button.innerHTML = 'Save Address';
        }
        return;
    }

    try {
        await api.post('/users/me/set-wallet-address', { solana_address: address });
        await fetchAndStoreUser();
        if (messageEl) {
            messageEl.textContent = 'Wallet address saved successfully! Reloading page...';
            messageEl.className = 'block text-sm p-3 rounded-md bg-green-900/50 text-green-300 mt-4';
            messageEl.classList.remove('hidden');
        }
        setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
        const detail = error.response?.data?.detail || 'Failed to save address. Please try again.';
        if (messageEl) {
            messageEl.textContent = detail;
            messageEl.className = 'block text-sm p-3 rounded-md bg-red-900/50 text-red-300 mt-4';
            messageEl.classList.remove('hidden');
        }
        if (button) {
            button.disabled = false;
            button.innerHTML = 'Save Address';
        }
    }
}

function renderWalletManagementCard(user) {
    const adapter = walletService.getAdapter();
    const isPhantomSiteConnected = walletService.isWalletConnected() && adapter && adapter.name === 'Phantom';
    const siteConnectedPhantomAddress = isPhantomSiteConnected ? walletService.publicKey.toBase58() : null;
    const linkedRewardsAddress = user?.solana_address;

    let content = '';
    const primaryWalletActionClasses = "w-full flex justify-center py-2.5 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity";
    const secondaryWalletActionClasses = "w-full flex justify-center py-2.5 px-6 border border-subtle rounded-md text-sm font-medium text-text-main bg-primary hover:bg-subtle transition-colors";

    if (linkedRewardsAddress) {
        const truncatedRewardsAddress = `${linkedRewardsAddress.slice(0, 6)}...${linkedRewardsAddress.slice(-6)}`;
        content = `
            <p class="text-sm text-text-secondary mt-1 mb-2">Your rewards will be sent to this permanent address:</p>
            <div class="bg-primary p-4 rounded-lg flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span class="font-mono text-text-main">${truncatedRewardsAddress}</span>
                </div>
            </div>
            <p class="text-xs text-text-secondary text-center mt-4">To ensure fairness and prevent abuse, wallet addresses cannot be changed. Please contact support if you have lost access to this wallet.</p>
        `;
    } else {
        content = `<p class="text-sm text-text-secondary mt-1 mb-4 text-center">Link a Solana wallet to receive your $LUM rewards. This is a permanent, one-time action.</p>`;
        
        if (isPhantomSiteConnected) {
            const truncatedSiteAddress = `${siteConnectedPhantomAddress.slice(0,6)}...${siteConnectedPhantomAddress.slice(-6)}`;
            content += `
                <p class="text-sm text-text-secondary text-center mt-1 mb-4">Phantom wallet <strong class="font-mono text-text-main">${truncatedSiteAddress}</strong> is connected. Link it for rewards, or enter another address manually.</p>
                <button id="link-phantom-wallet-btn" data-original-text="Link Connected Phantom Wallet" class="${primaryWalletActionClasses}">
                    Link Connected Phantom Wallet
                </button>
            `;
        } else {
            content += `
                <button id="settings-connect-phantom-btn" class="${primaryWalletActionClasses}">
                    Connect Phantom Wallet
                </button>
            `;
        }
        
        content += `
            <div class="my-4 flex items-center">
                <div class="flex-grow border-t border-primary"></div>
                <span class="flex-shrink mx-4 text-xs text-subtle uppercase">Or</span>
                <div class="flex-grow border-t border-primary"></div>
            </div>
            <form id="manual-wallet-form">
                <p class="text-sm text-text-secondary mt-1 mb-2 text-center">Enter any Solana address manually:</p>
                <input type="text" id="manual-solana-address" placeholder="Your Solana Address" class="w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                <button id="save-manual-wallet-btn" type="submit" class="mt-3 ${secondaryWalletActionClasses}">
                    Save Address
                </button>
            </form>
        `;
    }

    return `
        <div class="p-6 h-full flex flex-col">
            <h3 class="font-bold text-lg">Rewards Wallet</h3>
            <div id="wallet-management-message" class="hidden mt-4"></div>
            <div class="mt-1 mb-6 flex-grow flex flex-col justify-center">${content}</div>
        </div>
    `;
}

function attachWalletManagementListeners(user) {
    document.getElementById('settings-connect-phantom-btn')?.addEventListener('click', renderWalletSelectionModal);
    
    const linkPhantomBtn = document.getElementById('link-phantom-wallet-btn');
    if(linkPhantomBtn) {
        linkPhantomBtn.dataset.originalText = linkPhantomBtn.textContent.trim();
        linkPhantomBtn.addEventListener('click', () => handleLinkPhantomWallet(user));
    }
    
    document.getElementById('manual-wallet-form')?.addEventListener('submit', handleSaveManualWalletAddress);
}

async function handleProfileSettingsSubmit(e, dashboardState) {
    e.preventDefault();
    const msgEl = document.getElementById('profile-settings-message');
    const btnEl = document.getElementById('save-profile-settings-btn');
    
    if (msgEl) msgEl.classList.add('hidden');
    if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;
    }

    const displayName = document.getElementById('display-name').value;
    const isInLeaderboard = document.getElementById('leaderboard-toggle').checked;

    try {
        await updateUserProfile(displayName, isInLeaderboard);
        const user = await fetchAndStoreUser();
        if (dashboardState) dashboardState.user = user;
        if (msgEl) {
            msgEl.textContent = 'Settings updated successfully!';
            msgEl.className = 'block text-sm text-center text-green-300';
            msgEl.classList.remove('hidden');
        }
        
        document.querySelectorAll('.navbar-user-display-name').forEach(el => {
            el.textContent = user?.display_name ?? 'User';
        });
        const sidebarNameEl = document.querySelector('#dashboard-sidebar-area .font-bold.text-lg');
        if (sidebarNameEl) sidebarNameEl.textContent = user?.display_name ?? 'User';


    } catch (error) {
        if (msgEl) {
            msgEl.textContent = error.response?.data?.detail || 'Failed to update settings.';
            msgEl.className = 'block text-sm text-center text-red-300';
            msgEl.classList.remove('hidden');
        }
    } finally {
        if (btnEl) {
            btnEl.disabled = false;
            btnEl.innerHTML = 'Save Changes';
        }
        if (msgEl) setTimeout(() => msgEl.classList.add('hidden'), 3000);
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

    if (msgEl) msgEl.classList.add('hidden');

    if (newPassword !== confirmPassword) {
        if (msgEl) {
            msgEl.textContent = "New passwords do not match.";
            msgEl.className = 'block text-sm text-center text-red-300';
            msgEl.classList.remove('hidden');
        }
        return;
    }

    const strength = zxcvbn(newPassword);
    if (strength.score < 2) {
        if (msgEl) {
            msgEl.textContent = strength.feedback.warning || "New password is too weak.";
            msgEl.className = 'block text-sm text-center text-red-300';
            msgEl.classList.remove('hidden');
        }
        return;
    }

    if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;
    }

    try {
        await changePassword(currentPassword, newPassword);
        alert("Password updated successfully. You will now be logged out for security.");
        await logout();
        navigate('/login');
    } catch (error) {
        if (msgEl) {
            msgEl.textContent = error.response?.data?.detail || 'Failed to change password.';
            msgEl.className = 'block text-sm text-center text-red-300';
            msgEl.classList.remove('hidden');
        }
        if (btnEl) {
            btnEl.disabled = false;
            btnEl.innerHTML = 'Update Password';
        }
    } finally {
        if (msgEl) setTimeout(() => msgEl.classList.add('hidden'), 3000);
    }
}


async function handleDisable2FASubmit(e, dashboardState) {
    e.preventDefault();
    const passwordInput = document.getElementById('disable-2fa-password');
    const password = passwordInput ? passwordInput.value : '';
    const msgEl = document.getElementById('disable-2fa-message');
    const btnEl = e.submitter;

    if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerHTML = `<span class="animate-spin inline-block w-4 h-4 border-2 border-transparent border-t-white rounded-full"></span>`;
    }
    if (msgEl) msgEl.classList.add('hidden');

    try {
        await api.post('/security/2fa/disable', { password });
        const user = await fetchAndStoreUser();
        if (dashboardState) dashboardState.user = user;
        
        const twoFactorCard = document.getElementById('2fa-card');
        if (twoFactorCard && user) {
            twoFactorCard.innerHTML = render2FACardContent(user);
            document.getElementById('enable-2fa-btn')?.addEventListener('click', () => show2FASetupModal(dashboardState));
        }

    } catch (error) {
        if (msgEl) {
            msgEl.textContent = error.response?.data?.detail || 'Failed to disable 2FA.';
            msgEl.className = 'block text-sm p-2 rounded-md bg-red-900/50 text-red-300 mt-2 text-center';
            msgEl.classList.remove('hidden');
        }
        if (btnEl) {
            btnEl.disabled = false;
            btnEl.innerHTML = 'Disable 2FA';
        }
    } finally {
         if (msgEl) setTimeout(() => msgEl.classList.add('hidden'), 3000);
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

            <button id="save-backup-codes-txt" class="w-full mb-4 flex items-center justify-center gap-2 py-2.5 px-6 border border-subtle rounded-md text-sm font-medium text-text-main bg-primary hover:bg-subtle transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Save as .txt
            </button>

            <div class="my-4 p-4 bg-primary rounded-lg">
                <label for="backup-codes-checkbox" class="flex items-center justify-center cursor-pointer">
                    <input type="checkbox" id="backup-codes-checkbox" class="h-4 w-4 rounded bg-surface border-subtle text-accent-purple focus:ring-accent-purple focus:ring-offset-surface">
                    <span class="ml-3 text-sm text-text-secondary">I have securely saved my backup codes.</span>
                </label>
            </div>

            <button id="backup-codes-close-btn" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Done
            </button>
        </div>
    `;

    const { closeModal } = renderModal('Your Backup Codes', content);

    const saveButton = document.getElementById('save-backup-codes-txt');
    saveButton.addEventListener('click', () => {
        const textContent = `Lumen Protocol Backup Codes\n\nGenerated: ${new Date().toISOString()}\n\nStore these codes securely. Each code can only be used once.\n\n` + backupCodes.join('\n');
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lumen-backup-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    const checkbox = document.getElementById('backup-codes-checkbox');
    const closeButton = document.getElementById('backup-codes-close-btn');
    checkbox.addEventListener('change', () => {
        closeButton.disabled = !checkbox.checked;
    });

    closeButton.addEventListener('click', closeModal);
}

async function handleEnable2FASubmit(e, setupKey, dashboardState) {
    e.preventDefault();
    const tokenInput = document.getElementById('2fa-verification-code');
    const token = tokenInput ? tokenInput.value : '';
    const msgEl = document.getElementById('enable-2fa-message');
    const btnEl = e.submitter;

    if (msgEl) msgEl.classList.add('hidden');
    if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;
    }
    
    try {
        const response = await api.post('/security/2fa/enable', { token, setup_key: setupKey });
        const user = await fetchAndStoreUser();
        if (dashboardState) dashboardState.user = user;
        
        const setupModal = document.querySelector('.modal-overlay');
        if (setupModal) setupModal.remove();

        const twoFactorCard = document.getElementById('2fa-card');
        if(twoFactorCard && user) {
            twoFactorCard.innerHTML = render2FACardContent(user);
            document.getElementById('disable-2fa-form')?.addEventListener('submit', (event) => handleDisable2FASubmit(event, dashboardState));
        }
        
        renderBackupCodesModal(response.data.backup_codes);

    } catch(error) {
        if (msgEl) {
            msgEl.textContent = error.response?.data?.detail || 'Failed to enable 2FA.';
            msgEl.classList.remove('hidden');
        }
        if (btnEl) {
            btnEl.disabled = false;
            btnEl.innerHTML = 'Verify & Enable';
        }
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
                    <input type="text" id="2fa-verification-code" required autocomplete="one-time-code"
                           class="mt-1 block w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-accent-purple focus:outline-none">
                    <div id="enable-2fa-message" class="hidden text-sm p-3 rounded-md bg-red-900/50 text-red-300 mt-4 text-center"></div>
                    <button type="submit" class="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity">
                        Verify & Enable
                    </button>
                </form>
            </div>
        `;
        renderModal('Enable Two-Factor Authentication', content);
        
        const canvas = document.getElementById('qr-code-canvas');
        if (canvas) QRCode.toCanvas(canvas, provisioning_uri);
        
        document.getElementById('enable-2fa-form')?.addEventListener('submit', (e) => handleEnable2FASubmit(e, setup_key, dashboardState));

    } catch (error) {
        alert('Could not start 2FA setup process. Please try again.');
    }
}

async function handleDeleteAccount(user) {
    const confirmationPhrase = "DELETE MY ACCOUNT";
    
    let modalContent = `
        <div>
            <p class="text-text-secondary mb-4">This action is irreversible. Please review the consequences carefully:</p>
            <ul class="list-disc list-inside space-y-2 text-sm text-text-secondary bg-primary p-4 rounded-lg mb-4">
                <li>Your email, display name, and social account links will be permanently deleted.</li>
                <li>Your account balance and rewards will be forfeited.</li>
                <li>All login sessions and access tokens will be invalidated.</li>
                <li>Your past contributions will be retained but fully dissociated from you. To request deletion of contribution data, you must contact <a href="mailto:contact@lumen.onl" class="text-accent-cyan hover:underline">contact@lumen.onl</a>.</li>
            </ul>
            <div id="delete-account-message" class="hidden text-sm p-3 rounded-md bg-red-900/50 text-red-300 my-4 text-center"></div>
    `;

    if (user.has_password) {
        modalContent += `
            <form id="delete-account-form">
                <div class="mb-4">
                    <label for="delete-password" class="block text-sm font-medium text-text-secondary mb-1">Confirm with your password</label>
                    <input type="password" id="delete-password" required class="w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                </div>
                <label for="delete-confirmation" class="block text-sm font-medium text-text-secondary mb-1">To confirm, type "<strong class="text-text-main">${confirmationPhrase}</strong>" in the box below.</label>
                <input type="text" id="delete-confirmation" required autocomplete="off" class="w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                <button type="submit" id="final-delete-btn" class="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-800 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Permanently Delete My Account
                </button>
            </form>
        </div>`;
    } else {
        modalContent += `
            <p class="text-center text-text-secondary">Because you use a social login, we must verify your identity by sending a confirmation link to your registered email address.</p>
            <button id="send-deletion-link-btn" class="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-800 hover:bg-red-700 transition-colors">
                Send Deletion Email
            </button>
        </div>
        `;
    }

    const { modalId, closeModal } = renderModal('Are you absolutely sure?', modalContent);
    const modalBody = document.getElementById(`modal-body-${modalId}`);

    if (user.has_password) {
        const form = document.getElementById('delete-account-form');
        const confirmInput = document.getElementById('delete-confirmation');
        const deleteBtn = document.getElementById('final-delete-btn');
        const msgEl = document.getElementById('delete-account-message');

        const validateForm = () => {
            deleteBtn.disabled = confirmInput.value !== confirmationPhrase;
        };
        confirmInput.addEventListener('input', validateForm);
        validateForm();

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Deleting...`;
            if (msgEl) msgEl.classList.add('hidden');
            try {
                const password = document.getElementById('delete-password').value;
                await api.delete('/users/me', { data: { password } });

                if (modalBody) {
                    modalBody.innerHTML = `
                        <div class="text-center transition-all animate-fade-in-up">
                            <h3 class="font-bold text-lg text-green-300">Account Deleted</h3>
                            <p class="text-text-secondary mt-2">You will be logged out and redirected shortly.</p>
                        </div>
                    `;
                }

                setTimeout(async () => {
                    await logout();
                }, 2000);
            } catch (error) {
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = 'Permanently Delete My Account';
                if (msgEl) {
                    msgEl.textContent = error.response?.data?.detail || 'An error occurred during deletion.';
                    msgEl.classList.remove('hidden');
                }
            }
        });
    } else {
        const sendLinkBtn = document.getElementById('send-deletion-link-btn');
        sendLinkBtn.addEventListener('click', async () => {
            sendLinkBtn.disabled = true;
            sendLinkBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Sending...`;

            try {
                await api.post('/users/me/request-deletion');
                if (modalBody) {
                    modalBody.innerHTML = `
                        <div class="text-center">
                            <h3 class="font-bold text-lg text-green-300">Email Sent!</h3>
                            <p class="text-text-secondary mt-2">Please check your inbox and click the link to finalize your account deletion.</p>
                        </div>
                    `;
                }
            } catch (error) {
                sendLinkBtn.disabled = false;
                sendLinkBtn.innerHTML = 'Send Deletion Email';
                const msgEl = document.getElementById('delete-account-message');
                if (msgEl) {
                    msgEl.textContent = error.response?.data?.detail || 'Failed to send email.';
                    msgEl.classList.remove('hidden');
                }
            }
        });
    }
}

function attachDeleteAccountListeners(user) {
    document.getElementById('delete-account-btn')?.addEventListener('click', () => handleDeleteAccount(user));
}

export async function attachSettingsPageListeners(dashboardState) {
    document.getElementById('profile-settings-form')?.addEventListener('submit', (e) => handleProfileSettingsSubmit(e, dashboardState));
    document.getElementById('change-password-form')?.addEventListener('submit', handleChangePasswordSubmit);
    document.getElementById('enable-2fa-btn')?.addEventListener('click', () => show2FASetupModal(dashboardState));
    document.getElementById('disable-2fa-form')?.addEventListener('submit', (e) => handleDisable2FASubmit(e, dashboardState));
    attachDeleteAccountListeners(dashboardState.user);
    
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
                if (strengthBarFill) strengthBarFill.style.width = ['0%', '25%', '50%', '75%', '100%'][result.score];
                if (strengthBarFill) strengthBarFill.className = `strength-bar-fill ${['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-500'][result.score]}`;
                if (strengthText) strengthText.textContent = ['', 'Weak', 'Fair', 'Good', 'Strong'][result.score];
            } else {
                if (strengthBarFill) strengthBarFill.style.width = '0%';
                if (strengthText) strengthText.textContent = '';
            }
        });
    }

    const params = new URLSearchParams(window.location.search);
    const linkMessageEl = document.getElementById('link-accounts-message');
    const status = params.get('status') || params.get('error');

    if (linkMessageEl && status) {
        let message = "An unknown error occurred.";
        let isSuccess = false;
        
        if (status === 'link_complete' || status === 'link_success') {
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
        
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('status');
        newUrl.searchParams.delete('error');
        newUrl.searchParams.delete('success');
        window.history.replaceState({}, '', newUrl);
    }
    
    const walletCard = document.getElementById('wallet-management-card');
    if (walletCard && dashboardState && dashboardState.user) {
        walletCard.innerHTML = renderWalletManagementCard(dashboardState.user);
        attachWalletManagementListeners(dashboardState.user);
    }

    document.removeEventListener('walletUpdate', refreshWalletCard); 
    document.addEventListener('walletUpdate', refreshWalletCard);
    
    refreshWalletCard();

    document.getElementById('request-disable-2fa-link-btn')?.addEventListener('click', async (e) => {
        const btnEl = e.currentTarget;
        const msgEl = document.getElementById('disable-2fa-message');

        btnEl.disabled = true;
        btnEl.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Sending...`;
        if (msgEl) msgEl.classList.add('hidden');
        
        try {
            await api.post('/security/2fa/request-disable');
            if (msgEl) {
                msgEl.textContent = 'Disable link sent! Please check your email.';
                msgEl.className = 'block text-sm p-3 rounded-md bg-green-900/50 text-green-300 mt-4 text-center';
                msgEl.classList.remove('hidden');
            }
            btnEl.classList.add('hidden');
        } catch (error) {
            if (msgEl) {
                msgEl.textContent = error.response?.data?.detail || 'Failed to send disable link.';
                msgEl.className = 'block text-sm p-3 rounded-md bg-red-900/50 text-red-300 mt-4 text-center';
                msgEl.classList.remove('hidden');
            }
            btnEl.disabled = false;
            btnEl.innerHTML = 'Send Disable Link to Email';
        }
    });

    const action = params.get('action');
    const token = params.get('token');

    if (action === 'disable-2fa' && token) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('action');
        newUrl.searchParams.delete('token');
        window.history.replaceState({}, '', newUrl);

        const { modalId, closeModal } = renderModal('Disabling 2FA', `<div class="text-center p-8"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span><p class="mt-4 text-text-secondary">Processing your request...</p></div>`);
        const modalBody = document.getElementById(`modal-body-${modalId}`);

        try {
            await api.post('/security/2fa/confirm-disable', { token });
            const user = await fetchAndStoreUser();
            if (dashboardState) dashboardState.user = user;

            if(modalBody) {
                modalBody.innerHTML = `<div class="text-center transition-all animate-fade-in-up">
                    <div class="w-16 h-16 mx-auto mb-4 bg-green-900/50 text-green-300 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 class="font-bold text-lg text-text-main">2FA Disabled</h3>
                    <p class="text-text-secondary mt-2">Two-Factor Authentication has been successfully disabled for your account.</p>
                </div>`;
            }

            const twoFactorCard = document.getElementById('2fa-card');
            if (twoFactorCard && user) {
                twoFactorCard.innerHTML = render2FACardContent(user);
                document.getElementById('enable-2fa-btn')?.addEventListener('click', () => show2FASetupModal(dashboardState));
            }
             setTimeout(closeModal, 3000);

        } catch (error) {
            if(modalBody) {
                const errorMessage = error.response?.data?.detail || 'An unknown error occurred.';
                modalBody.innerHTML = `<div class="text-center transition-all animate-fade-in-up">
                    <div class="w-16 h-16 mx-auto mb-4 bg-red-900/50 text-red-300 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <h3 class="font-bold text-lg text-text-main">Disable Failed</h3>
                    <p class="text-text-secondary mt-2">${errorMessage}</p>
                </div>`;
            }
            setTimeout(closeModal, 4000);
        }
    }

    if (action === 'confirm-delete' && token) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('action');
        newUrl.searchParams.delete('token');
        window.history.replaceState({}, '', newUrl);

        const { modalId } = renderModal('Confirming Deletion', `<div class="text-center p-8"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span><p class="mt-4 text-text-secondary">Processing your account deletion...</p></div>`);
        const modalBody = document.getElementById(`modal-body-${modalId}`);
        try {
            await api.delete('/users/me', { data: { token } });

            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="text-center transition-all animate-fade-in-up">
                        <h3 class="font-bold text-lg text-green-300">Account Deleted</h3>
                        <p class="text-text-secondary mt-2">You have been logged out. Redirecting now...</p>
                    </div>
                `;
            }
            
            setTimeout(async () => {
                await logout();
            }, 2000);
        } catch (error) {
            if (modalBody) {
                const errorMessage = error.response?.data?.detail || 'An unknown error occurred.';
                modalBody.innerHTML = `<div class="text-center transition-all animate-fade-in-up">
                    <h3 class="font-bold text-lg text-red-300">Deletion Failed</h3>
                    <p class="text-text-secondary mt-2">${errorMessage}</p>
                </div>`;
            }
        }
    }
}

function render2FACardContent(user) {
    if (!user) return '<p>Loading security settings...</p>';
    const hasPasswordAuth = user.has_password;
    return `
        <div class="p-6 h-full flex flex-col">
            <h3 class="font-bold text-lg">Two-Factor Authentication (2FA)</h3>
            <div class="mt-2 flex-grow flex flex-col justify-center">
            ${user.is_two_factor_enabled ? `
                <p class="text-sm text-green-400">2FA is currently <strong>enabled</strong> on your account.</p>
                ${hasPasswordAuth ? `
                    <form id="disable-2fa-form" class="mt-4">
                        <p class="text-xs text-text-secondary mb-2">To disable 2FA, please enter your password.</p>
                        <div class="flex items-start gap-4">
                            <div class="flex-grow">
                                <input type="password" id="disable-2fa-password" required placeholder="Current Password" class="w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                                <div id="disable-2fa-message" class="hidden mt-2 text-sm text-center"></div>
                            </div>
                            <button type="submit" class="py-2 px-4 text-sm font-medium text-red-400 bg-red-900/30 hover:bg-red-900/60 rounded-md transition-colors">Disable 2FA</button>
                        </div>
                    </form>
                ` : `
                    <p class="text-sm text-text-secondary mt-4">To disable 2FA for a passwordless account, we need to send a confirmation link to your registered email.</p>
                    <button id="request-disable-2fa-link-btn" class="mt-4 w-full flex justify-center py-2.5 px-6 border border-subtle rounded-md text-sm font-medium text-text-main bg-primary hover:bg-subtle transition-colors">
                        Send Disable Link to Email
                    </button>
                    <div id="disable-2fa-message" class="hidden mt-2 text-sm text-center"></div>
                `}
            ` : `
                <p class="text-sm text-text-secondary">Add an extra layer of security to your account using an authenticator app.</p>
                <button id="enable-2fa-btn" class="mt-4 w-full flex justify-center py-2.5 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity">
                    Enable 2FA
                </button>
            `}
            </div>
        </div>
    `;
}

function renderLinkedAccountsCard(user) {
    if (!user) return '<p>Loading account settings...</p>';

    return `
        <div class="p-6 h-full flex flex-col">
            <h3 class="font-bold text-lg">Linked Accounts</h3>
            <p class="text-sm text-text-secondary mt-1 mb-6">Connect a social account for quick and easy login.</p>
            <div id="link-accounts-message" class="hidden"></div>
            <div class="space-y-4 flex-grow flex flex-col justify-center">
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

function renderDeleteAccountCard() {
    return `
        <div class="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <h3 class="font-bold text-lg text-red-300">Danger Zone</h3>
            <p class="text-sm text-red-400/80 mt-1 mb-4">Be careful, these actions are permanent.</p>
            <button id="delete-account-btn" class="w-full text-center py-2.5 px-6 border border-red-500/50 rounded-md text-sm font-medium text-red-300 bg-red-900/30 hover:bg-red-900/60 transition-colors">
                Delete Account
            </button>
        </div>
    `;
}

export function renderSettingsPage(user) {
    if (!user) {
        return `<div class="p-8 text-center text-text-secondary">Loading settings...</div>`;
    }
    const hasPasswordAuth = user.has_password;

    const gradientButtonClasses = "w-full flex justify-center py-2.5 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity";

    return `
        <header>
            <h1 class="text-3xl font-bold">Settings</h1>
            <p class="text-text-secondary mt-1">Manage your profile and account security.</p>
        </header>

        <div class="mt-8 flex flex-col gap-8">
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
                <div class="lg:col-span-3 flex flex-col gap-8">
                    <form id="profile-settings-form" class="bg-surface border border-primary rounded-xl flex flex-col flex-1">
                        <div class="p-6 flex flex-col flex-grow">
                            <h3 class="font-bold text-lg">Profile Information</h3>
                            <p class="text-text-secondary text-sm mt-1 mb-6">This information may be displayed publicly.</p>
                            <div class="space-y-6 flex-grow">
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
                                        <div class="w-11 h-6 bg-primary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-purple rounded-full peer dark:bg-subtle peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-text-secondary after:border-gray-300 dark:after:border-primary after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-checked:bg-gradient-to-r dark:peer-checked:from-accent-purple dark:peer-checked:to-accent-pink"></div>
                                    </label>
                                </div>
                            </div>
                            <div class="mt-auto pt-6">
                                <button type="submit" id="save-profile-settings-btn" class="${gradientButtonClasses}">
                                    Save Changes
                                </button>
                                <div id="profile-settings-message" class="hidden text-sm mt-3 text-center"></div>
                            </div>
                        </div>
                    </form>
                    
                    <form id="change-password-form" class="bg-surface border border-primary rounded-xl flex flex-col flex-1">
                        <div class="p-6 flex flex-col flex-grow">
                            <h3 class="font-bold text-lg">Change Password</h3>
                            <p class="text-text-secondary text-sm mt-1 mb-6">Update your password. You will be logged out after this action.</p>
                            ${!hasPasswordAuth ? `<div class="flex-grow flex items-center justify-center"><p class="text-sm p-4 bg-primary rounded-lg text-text-secondary">Password management is unavailable for accounts created via social login.</p></div>` : `
                            <div class="space-y-4 flex-grow">
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
                        <div class="bg-primary/50 border-t border-primary px-6 py-4 mt-auto">
                            <button type="submit" class="${gradientButtonClasses}">
                                Update Password
                            </button>
                            <div id="change-password-message" class="hidden text-sm mt-3 text-center"></div>
                        </div>
                        ` : ''}
                    </form>
                </div>

                <div class="lg:col-span-2 flex flex-col gap-8">
                     <div id="wallet-management-card" class="bg-surface border border-primary rounded-xl flex flex-col flex-1">
                        ${renderWalletManagementCard(user)}
                    </div>
                    
                    <div id="2fa-card" class="bg-surface border border-primary rounded-xl flex flex-col flex-1">
                        ${render2FACardContent(user)}
                    </div>

                    <div class="bg-surface border border-primary rounded-xl flex flex-col flex-1">
                        ${renderLinkedAccountsCard(user)}
                    </div>
                </div>
            </div>

            <div id="danger-zone-card" class="w-full mt-4">
                ${renderDeleteAccountCard()}
            </div>
        </div>
    `;
}