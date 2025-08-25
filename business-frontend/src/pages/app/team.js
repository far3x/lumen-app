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
    // ... modal logic for inviting a user
}

function showRemoveMemberModal(userId, userName) {
    // ... modal logic for removing a user
}

function initialize() {
    fetchTeam();
}

export { renderTeamPage };