import { updateUserProfile, fetchAndStoreUser, logout } from '../../../lib/auth.js';
import { navigate } from '../../../router.js';

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
        msgEl.className = 'block text-sm p-3 rounded-md bg-green-900/50 text-green-300 mt-4';
        
        const navbarDisplayName = document.querySelector('.navbar-user-display-name');
        if (navbarDisplayName) navbarDisplayName.textContent = user?.display_name ?? 'User';

    } catch (error) {
        msgEl.textContent = error.response?.data?.detail || 'Failed to update settings.';
        msgEl.className = 'block text-sm p-3 rounded-md bg-red-900/50 text-red-300 mt-4';
    } finally {
        btnEl.innerHTML = 'Save Changes';
        btnEl.disabled = false;
        setTimeout(() => msgEl.classList.add('hidden'), 5000);
    }
}

function handleChangePasswordSubmit(e) {
    e.preventDefault();
    alert("Change password functionality is not yet implemented.");
}

function handleDeleteAccount() {
    const confirmation = window.prompt("This action is irreversible. To confirm, please type 'DELETE' in the box below.");
    if (confirmation === 'DELETE') {
        alert("Account deletion functionality is not yet implemented. For now, please contact support if you wish to delete your account.");
    } else {
        alert("Account deletion cancelled.");
    }
}

export function attachSettingsPageListeners(dashboardState) {
    document.getElementById('profile-settings-form')?.addEventListener('submit', (e) => handleProfileSettingsSubmit(e, dashboardState));
    document.getElementById('password-settings-form')?.addEventListener('submit', handleChangePasswordSubmit);
    document.getElementById('logout-button-settings')?.addEventListener('click', () => { logout(); navigate('/login'); });
    document.getElementById('delete-account-btn')?.addEventListener('click', handleDeleteAccount);
}

export function renderSettingsPage(user) {
    return `
        <header>
            <h1 class="text-3xl font-bold">Settings</h1>
            <p class="text-text-secondary mt-1">Manage your profile, visibility, and account preferences.</p>
        </header>

        <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <!-- Left Column -->
            <div class="space-y-8">
                <!-- Profile Settings -->
                <form id="profile-settings-form" class="bg-surface border border-primary rounded-xl overflow-hidden">
                    <div class="p-6">
                        <h3 class="gradient-text font-bold text-lg">Profile Information</h3>
                        <p class="text-text-secondary text-sm mt-1 mb-6">This information may be displayed publicly.</p>
                        <div class="space-y-6">
                            <div>
                                <label for="display-name" class="block text-sm font-medium text-text-secondary mb-1">Display Name</label>
                                <input type="text" id="display-name" value="${user?.display_name ?? ''}"
                                    class="w-full px-3 py-2 bg-primary border border-subtle rounded-md text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                            </div>
                            <div class="flex items-center justify-between pt-2">
                                <div>
                                    <label for="leaderboard-toggle" class="text-sm font-medium text-text-main">Leaderboard Visibility</label>
                                    <p class="text-xs text-text-secondary">Show my rank on public leaderboards.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="leaderboard-toggle" class="sr-only peer" ${user?.is_in_leaderboard ? 'checked' : ''}>
                                    <div class="w-11 h-6 bg-primary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary after:border after:border-primary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-purple"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="bg-primary/50 border-t border-primary px-6 py-4 flex justify-between items-center">
                        <div id="profile-settings-message" class="hidden text-sm"></div>
                        <button type="submit" id="save-profile-settings-btn"
                                class="w-auto ml-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-purple hover:bg-accent-purple/80 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>

                <!-- Change Password -->
                <form id="password-settings-form" class="bg-surface border border-primary rounded-xl overflow-hidden">
                    <div class="p-6">
                        <h3 class="gradient-text font-bold text-lg">Change Password</h3>
                        <p class="text-text-secondary text-sm mt-1 mb-6">For accounts created with email and password.</p>
                        <div class="space-y-4">
                             <div>
                                <label for="current-password" class="block text-sm font-medium text-text-secondary mb-1">Current Password</label>
                                <input type="password" id="current-password" class="w-full px-3 py-2 bg-primary border border-subtle rounded-md text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                            </div>
                            <div>
                                <label for="new-password" class="block text-sm font-medium text-text-secondary mb-1">New Password</label>
                                <input type="password" id="new-password" class="w-full px-3 py-2 bg-primary border border-subtle rounded-md text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                            </div>
                        </div>
                    </div>
                    <div class="bg-primary/50 border-t border-primary px-6 py-4 flex justify-end">
                         <button type="submit" class="w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-purple hover:bg-accent-purple/80 transition-colors opacity-50 cursor-not-allowed">
                            Update Password
                        </button>
                    </div>
                </form>
            </div>

            <!-- Right Column -->
            <div class="space-y-8">
                <!-- CLI Access Card -->
                 <div class="bg-surface border border-primary rounded-xl">
                    <div class="p-6">
                        <h3 class="gradient-text font-bold text-lg">CLI Access</h3>
                        <p class="text-text-secondary text-sm mt-1 mb-6">Manage tokens for authenticating with the Lumen CLI.</p>
                        <div class="p-8 text-center bg-primary rounded-lg border border-dashed border-subtle">
                            <p class="text-text-secondary text-sm">
                                This feature is in development. Soon, you'll be able to manage, revoke, and generate new Personal Access Tokens here.
                            </p>
                        </div>
                    </div>
                    <div class="bg-primary/50 border-t border-primary px-6 py-4 flex justify-end">
                         <button class="w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-subtle opacity-50 cursor-not-allowed">
                            Generate New Token
                        </button>
                    </div>
                </div>

                 <!-- Danger Zone -->
                <div class="bg-red-900/10 border border-red-900/50 rounded-xl">
                    <div class="p-6">
                        <h3 class="font-bold text-lg text-red-400">Danger Zone</h3>
                        <p class="text-text-secondary text-sm mt-1 mb-6">These actions have significant consequences.</p>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                 <div>
                                    <p class="text-text-main text-sm font-medium">Log Out</p>
                                    <p class="text-text-secondary text-xs">End your current session on this device.</p>
                                </div>
                                <button id="logout-button-settings" class="py-2 px-4 text-sm font-medium bg-primary hover:bg-subtle rounded-md transition-colors">Log Out</button>
                            </div>
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-red-400 text-sm font-medium">Delete Account</p>
                                    <p class="text-text-secondary text-xs">Permanently delete your account and all data.</p>
                                </div>
                                <button id="delete-account-btn" class="py-2 px-4 text-sm font-medium text-red-400 bg-red-900/30 hover:bg-red-900/60 rounded-md transition-colors">Delete Account</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}