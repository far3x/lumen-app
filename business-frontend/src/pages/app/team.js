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
                                <p class="text-xs text-light-text-secondary">jane@acme.com</p>
                            </td>
                            <td>Admin</td>
                            <td><span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Joined</span></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>
                                <p class="font-semibold">John Smith</p>
                                <p class="text-xs text-light-text-secondary">john@acme.com</p>
                            </td>
                            <td>Member</td>
                            <td><span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Joined</span></td>
                            <td><button class="text-light-text-tertiary">...</button></td>
                        </tr>
                        <tr>
                            <td>
                                <p class="font-semibold">sara@acme.com</p>
                                <p class="text-xs text-light-text-secondary">Invitation sent 2 days ago</p>
                            </td>
                            <td>Member</td>
                            <td><span class="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pending</span></td>
                            <td><button class="text-light-text-tertiary">...</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return { pageHtml, headerHtml };
}