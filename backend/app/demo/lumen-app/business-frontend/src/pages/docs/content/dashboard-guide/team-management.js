export function renderTeamManagement() {
    return `
        <h1 id="team">Dashboard Guide: Team Management</h1>
        <p class="lead">Manage your organization's members and their access to the Lumen platform.</p>
        
        <h2 id="roles">Roles</h2>
        <p>Lumen uses a simple, two-role system for access control:</p>
        <ul>
            <li><strong>Admin:</strong> The first user who registers a company automatically becomes its Admin. Admins can manage all aspects of the account, including inviting and removing team members, managing billing, and accessing all data.</li>
            <li><strong>Member:</strong> Members are invited to join an existing company. They can access the dashboard, use the Data Explorer, and utilize the company's shared token balance to unlock data. They cannot manage team members or billing settings.</li>
        </ul>
        
        <h2 id="inviting">Inviting Members</h2>
        <p>Only Admins can invite new members. Click the "+ Invite Team Member" button and provide the full name and email address of the person you wish to invite.</p>
        <ul>
            <li><strong>New Users:</strong> If the invited email does not have a Lumen account, they will receive an email with a special signup link. When they create their account, they will be automatically added to your team as a Member.</li>
            <li><strong>Existing Users:</strong> If the invited email already has a Lumen account, they will receive an email with a link to accept the invitation. They will also see a notification banner in their dashboard. A user can only be a member of one team at a time.</li>
        </ul>
        
        <h2 id="removing">Removing Members</h2>
        <p>An Admin can remove any Member from the team by hovering over their name in the list and clicking the "Remove" button. This action will immediately revoke their access to your company's dashboard and data. An Admin cannot remove themselves.</p>
    `;
}