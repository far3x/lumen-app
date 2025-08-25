export function renderTeamPage() {
    const headerHtml = `
        <div class="flex-1"><h1 class="page-headline">Team Management</h1></div>
        <div><button class="btn btn-primary">+ Invite Team Member</button></div>
    `;

    const pageHtml = `
         <div class="dashboard-container">
            <div class="widget-card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <p class="font-semibold">Jane Doe (You)</p>
                                <p class="text-xs text-app-text-secondary">jane@acme.com</p>
                            </td>
                            <td><span class="px-2 py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full">Admin</span></td>
                            <td><span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Joined</span></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colspan="4" class="text-center p-8 text-app-text-secondary">
                                Team management features are coming soon.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return { pageHtml, headerHtml };
}