export function renderDashboardOverview() {
    return `
        <h1 id="dashboard">Dashboard Guide: Overview</h1>
        <p class="lead">Your dashboard is the central hub for managing your organization's data acquisition activities on Lumen. The Overview page provides a high-level summary of your account status and usage trends.</p>

        <h2 id="overview">Key Metrics</h2>
        <p>The top of the page displays four key metrics for a quick snapshot of your account:</p>
        <ul>
            <li><strong>Token Balance:</strong> Your current available token balance for unlocking new contributions. This is the most critical number for data acquisition.</li>
            <li><strong>Current Plan:</strong> The name of your active subscription plan (e.g., Free, Startup, Enterprise).</li>
            <li><strong>Team Members:</strong> The total number of users associated with your company account.</li>
            <li><strong>Active API Keys:</strong> The number of currently active (not revoked) API keys for programmatic access.</li>
        </ul>

        <h2 id="usage-overview">Token Usage Overview</h2>
        <p>This chart provides a visual representation of your token consumption over the last several months. It helps you understand your data acquisition velocity and forecast future needs.</p>
        
        <h2 id="api-key-usage">API Key Usage (Last 30d)</h2>
        <p>This widget breaks down token consumption by each of your active API keys over the past 30 days. It's a powerful tool for understanding which models or pipelines are driving your data usage.</p>
        
        <h2 id="recently-unlocked">Recently Unlocked</h2>
        <p>This feed provides a quick look at the most recent contributions your team has unlocked, giving you visibility into ongoing data sourcing efforts.</p>
    `;
}