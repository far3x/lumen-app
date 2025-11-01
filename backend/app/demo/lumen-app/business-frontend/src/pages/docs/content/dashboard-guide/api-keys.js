export function renderApiKeys() {
    return `
        <h1 id="api-keys">Dashboard Guide: Managing API Keys</h1>
        <p class="lead">API keys are used for programmatic access to the Lumen network. They allow your MLOps pipelines and other automated systems to search for, unlock, and download data without manual intervention.</p>

        <h2 id="generating">Generating a New Key</h2>
        <p>To generate a new key, click the "+ Generate New Key" button. You will be prompted to provide a descriptive name for the key (e.g., "Production Model Finetuning" or "Data Science Team Sandbox").</p>
        <blockquote>
            <strong>Important:</strong> Your API key will be displayed <strong>only once</strong> upon creation. You must copy it and store it in a secure location, such as a password manager or your organization's secret management system. For security reasons, we do not store the raw key and cannot recover it for you.
        </blockquote>

        <h2 id="revoking">Revoking a Key</h2>
        <p>If a key is compromised or no longer needed, you can permanently revoke it. Hover over the key in the list and click the "Revoke" button. This action is immediate and irreversible. Any application using the revoked key will be denied access.</p>
        
        <h2 id="security">Security Best Practices</h2>
        <ul>
            <li><strong>One Key Per Service:</strong> Generate a unique key for each application or service that needs access. This allows you to revoke access for a single service without disrupting others.</li>
            <li><strong>Store Securely:</strong> Never commit API keys to your version control system (e.g., Git). Use environment variables or a dedicated secret management service.</li>
            <li><strong>Rotate Keys Regularly:</strong> As a good security practice, consider revoking and regenerating keys on a regular schedule (e.g., every 90 days).</li>
        </ul>
    `;
}