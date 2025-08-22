export function renderApiKeysPage() {
    const headerHtml = `
        <div class="flex-1"><h1 class="page-headline">API Keys</h1></div>
        <div><button class="btn btn-primary">+ Generate New Key</button></div>
    `;

    const pageHtml = `
        <div class="dashboard-container">
            <div class="widget-card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Key</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Last Used</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Production Model V2</td>
                            <td class="font-mono">lum_biz_...a4f8</td>
                            <td><span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Active</span></td>
                            <td>Jul 15, 2025</td>
                            <td>2 hours ago</td>
                            <td><button class="text-light-text-tertiary">...</button></td>
                        </tr>
                        <tr>
                            <td>Staging Environment</td>
                            <td class="font-mono">lum_biz_...b9c1</td>
                            <td><span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Active</span></td>
                            <td>Jun 02, 2025</td>
                            <td>1 day ago</td>
                            <td><button class="text-light-text-tertiary">...</button></td>
                        </tr>
                        <tr>
                            <td>Old Model (Deprecated)</td>
                            <td class="font-mono">lum_biz_...d3e7</td>
                            <td><span class="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Revoked</span></td>
                            <td>Mar 20, 2025</td>
                            <td>3 months ago</td>
                            <td><button class="text-light-text-tertiary">...</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return { pageHtml, headerHtml };
}