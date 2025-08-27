import api from '../../lib/api.js';
import { stateService } from '../../lib/state.js';

let teamMembers = [];
let isLoading = true;

function renderTeamPage() {
    const { user } = stateService.getState();
    const isAdmin = user && user.role === 'admin';

    const headerHtml = `
        <div class="flex-1"><h1 class="page-headline">Team Management</h1></div>
        <div>
            ${isAdmin ? '<button id="invite-member-btn" class="btn btn-primary">+ Invite Team Member</button>' : ''}
        </div>
    `;

    const pageHtml = `
         <div class="dashboard-container">
            <div class="widget-card">
                <div id="team-list-container"></div>
            </div>
        </div>
    `;

    setTimeout(initialize, 0);
    return { pageHtml, headerHtml };
}

function renderTeamList() {
    const container = document.getElementById('team-list-container');
    if (!container) return;
    
    if (isLoading) {
        container.innerHTML = `<div class="p-8 text-center text-text-muted">Loading team members...</div>`;
        return;
    }

    const { user: currentUser } = stateService.getState();
    const isAdmin = currentUser && currentUser.role === 'admin';

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr><th>Member</th><th>Role</th><th>Joined</th>${isAdmin ? '<th></th>' : ''}</tr>
            </thead>
            <tbody>
                ${teamMembers.map(member => `
                    <tr class="group hover:bg-app-accent-hover">
                        <td>
                            <p class="font-semibold text-text-headings">${member.full_name} ${member.id === currentUser.id ? '(You)' : ''}</p>
                            <p class="text-xs text-text-muted">${member.email}</p>
                        </td>
                        <td><span class="px-2 py-1 text-xs font-semibold ${member.role === 'admin' ? 'text-purple-800 bg-purple-100' : 'text-gray-800 bg-gray-100'} rounded-full capitalize">${member.role}</span></td>
                        <td>${new Date(member.created_at).toLocaleDateString()}</td>
                        ${isAdmin ? `
                        <td class="text-right">
                            ${member.id !== currentUser.id ? `<button data-user-id="${member.id}" data-user-name="${member.full_name}" class="remove-member-btn text-red-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>` : ''}
                        </td>
                        ` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    attachEventListeners();
}

function attachEventListeners() {
    document.getElementById('invite-member-btn')?.addEventListener('click', showInviteModal);
    document.querySelectorAll('.remove-member-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const { userId, userName } = e.currentTarget.dataset;
            showRemoveMemberModal(userId, userName);
        });
    });
}

async function fetchTeam() {
    isLoading = true;
    renderTeamList();
    try {
        const response = await api.get('/business/team');
        teamMembers = response.data;
    } catch (error) {
        console.error("Failed to fetch team:", error);
        teamMembers = [];
    } finally {
        isLoading = false;
        renderTeamList();
    }
}

function showInviteModal() {
    const modalId = 'invite-member-modal';
    if(document.getElementById(modalId)) return;

    const modalHtml = `
    <div id="${modalId}" class="modal-overlay">
        <div class="bg-app-surface w-full max-w-md rounded-xl border border-app-border shadow-2xl">
            <header class="p-4 border-b border-app-border flex justify-between items-center">
                <h2 class="text-lg font-bold text-text-headings">Invite Team Member</h2>
                <button class="modal-close-btn p-1 text-text-muted rounded-full hover:bg-app-accent-hover">&times;</button>
            </header>
            <div id="invite-modal-content" class="p-6">
                 <form id="invite-member-form" class="space-y-4">
                    <div>
                        <label for="invite-name" class="form-label">Full Name</label>
                        <input type="text" id="invite-name" required class="form-input">
                    </div>
                    <div>
                        <label for="invite-email" class="form-label">Email Address</label>
                        <input type="email" id="invite-email" required class="form-input">
                    </div>
                    <div id="modal-error-message" class="hidden text-red-600 text-sm"></div>
                    <button type="submit" class="btn btn-primary w-full mt-2">Send Invitation</button>
                </form>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.classList.add('modal-open');

    const modal = document.getElementById(modalId);
    const closeModal = () => {
        modal.remove();
        if (document.querySelectorAll('.modal-overlay').length === 0) {
            document.body.classList.remove('modal-open');
        }
    };
    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('invite-member-form').addEventListener('submit', (e) => handleInviteSubmit(e, closeModal));
}

async function handleInviteSubmit(e, closeModal) {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('#invite-name').value;
    const email = form.querySelector('#invite-email').value;
    const errorEl = form.querySelector('#modal-error-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    errorEl.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Sending...`;

    try {
        await api.post('/business/team/invite', { full_name: name, email, role: 'member' });
        
        const contentArea = document.getElementById('invite-modal-content');
        contentArea.innerHTML = `
            <div class="text-center py-8">
                <h3 class="font-semibold text-text-headings">Invitation Sent!</h3>
                <p class="text-sm text-text-muted mt-2">An invitation has been sent to ${email}. They will need to check their inbox to get started.</p>
                <button id="invite-success-close" class="btn btn-secondary mt-4">Close</button>
            </div>
        `;
        document.getElementById('invite-success-close').addEventListener('click', closeModal);
        await fetchTeam();
    } catch (error) {
        errorEl.textContent = error.response?.data?.detail || 'Failed to send invitation.';
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Invitation';
    }
}

function showRemoveMemberModal(userId, userName) {
    const modalId = 'remove-member-modal';
    if(document.getElementById(modalId)) return;

    const modalHtml = `
    <div id="${modalId}" class="modal-overlay">
        <div class="bg-app-surface w-full max-w-md rounded-xl border border-app-border shadow-2xl">
            <header class="p-4 border-b border-app-border"><h2 class="text-lg font-bold text-red-700">Remove Team Member</h2></header>
            <div class="p-6">
                 <p class="text-text-body">Are you sure you want to remove <strong class="font-semibold text-text-headings">${userName}</strong> from the team? This action is permanent.</p>
                 <div class="flex gap-4 mt-6">
                    <button id="cancel-remove-btn" class="btn btn-secondary w-full">Cancel</button>
                    <button id="confirm-remove-btn" class="btn btn-danger w-full">Remove Member</button>
                 </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.classList.add('modal-open');

    const modal = document.getElementById(modalId);
    const closeModal = () => {
        modal.remove();
        if (document.querySelectorAll('.modal-overlay').length === 0) {
            document.body.classList.remove('modal-open');
        }
    };
    modal.querySelector('#cancel-remove-btn').addEventListener('click', closeModal);
    document.getElementById('confirm-remove-btn').addEventListener('click', () => handleRemoveSubmit(userId, closeModal));
}

async function handleRemoveSubmit(userId, closeModal) {
    try {
        await api.delete(`/business/team/${userId}`);
        closeModal();
        await fetchTeam();
    } catch (error) {
        alert('Failed to remove team member. Please try again.');
    }
}

function initialize() {
    fetchTeam();
}

export { renderTeamPage };