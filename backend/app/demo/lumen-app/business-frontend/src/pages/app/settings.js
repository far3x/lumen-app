import api from '../../lib/api.js';
import { stateService } from '../../lib/state.js';

function renderSettingsPage() {
    const headerHtml = `<h1 class="page-headline">Settings</h1>`;
    const { user, company } = stateService.getState();

    const pageHtml = `
        <div class="dashboard-container">
            <div id="settings-message" class="hidden mb-4 p-3 rounded-md text-sm"></div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="widget-card">
                    <form id="profile-form" class="p-6">
                        <h2 class="text-lg font-semibold text-text-headings">Account Information</h2>
                        <p class="text-sm text-text-muted mt-1">Manage your personal profile.</p>
                        <div class="mt-4 border-t border-app-border pt-4 space-y-4">
                            <div>
                                <label for="fullName" class="form-label">Full Name</label>
                                <input type="text" id="fullName" value="${user.full_name}" class="form-input">
                            </div>
                            <div>
                                <label for="jobTitle" class="form-label">Job Title</label>
                                <input type="text" id="jobTitle" value="${user.job_title || ''}" class="form-input">
                            </div>
                        </div>
                        <div class="mt-4 pt-4 border-t border-app-border text-right">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
                 <div class="widget-card">
                    <form id="company-form" class="p-6">
                        <h2 class="text-lg font-semibold text-text-headings">Company Information</h2>
                        <p class="text-sm text-text-muted mt-1">Manage your company profile.</p>
                        <div class="mt-4 border-t border-app-border pt-4 space-y-4">
                            <div>
                                <label for="companyName" class="form-label">Company Name</label>
                                <input type="text" id="companyName" value="${company.name}" class="form-input">
                            </div>
                            <div>
                                <label for="industry" class="form-label">Industry</label>
                                <input type="text" id="industry" value="${company.industry || ''}" class="form-input">
                            </div>
                        </div>
                         <div class="mt-4 pt-4 border-t border-app-border text-right">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    setTimeout(attachSettingsListeners, 0);
    return { pageHtml, headerHtml };
}

function attachSettingsListeners() {
    const profileForm = document.getElementById('profile-form');
    const companyForm = document.getElementById('company-form');
    const messageEl = document.getElementById('settings-message');

    profileForm?.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = e.submitter;
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;
        
        try {
            const fullName = document.getElementById('fullName').value;
            const jobTitle = document.getElementById('jobTitle').value;
            const response = await api.put('/business/users/me', { full_name: fullName, job_title: jobTitle });
            stateService.setUser(response.data);
            localStorage.setItem('business_user', JSON.stringify(response.data));
            messageEl.textContent = 'Profile updated successfully!';
            messageEl.className = 'p-3 rounded-md text-sm mb-4 bg-green-100 text-green-800';
            messageEl.classList.remove('hidden');
        } catch (err) {
            messageEl.textContent = 'Failed to update profile.';
            messageEl.className = 'p-3 rounded-md text-sm mb-4 bg-red-100 text-red-800';
            messageEl.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Save Changes';
        }
    });

    companyForm?.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = e.submitter;
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;

        try {
            const companyName = document.getElementById('companyName').value;
            const industry = document.getElementById('industry').value;
            const response = await api.put('/business/company', { name: companyName, industry });
            stateService.setCompany(response.data);
            localStorage.setItem('business_company', JSON.stringify(response.data));
             messageEl.textContent = 'Company updated successfully!';
            messageEl.className = 'p-3 rounded-md text-sm mb-4 bg-green-100 text-green-800';
            messageEl.classList.remove('hidden');
        } catch (err) {
             messageEl.textContent = 'Failed to update company.';
            messageEl.className = 'p-3 rounded-md text-sm mb-4 bg-red-100 text-red-800';
            messageEl.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Save Changes';
        }
    });
}

export { renderSettingsPage };