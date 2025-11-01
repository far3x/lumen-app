export function renderApiSecurity() {
    return `
        <h1 id="security">API Security Best Practices</h1>
        <p class="lead">Protecting your API keys is crucial for maintaining the security of your Lumen account and data assets.</p>

        <h2 id="key-management">Key Management</h2>
        <ul>
            <li><strong>Do not share keys:</strong> Never share API keys in public places like GitHub, client-side code, or public forums.</li>
            <li><strong>Generate keys per application:</strong> Create a separate API key for each of your applications. If one key is compromised, you can revoke it without affecting your other integrations.</li>
            <li><strong>Store keys securely:</strong> Use a secret management system or environment variables to store your API keys. Do not hardcode them into your application source code.</li>
        </ul>
        
        <h2 id="monitoring">Monitoring Usage</h2>
        <p>Regularly check the "API Keys" and "Overview" pages in your dashboard to monitor token consumption per key. Unusually high usage on a specific key could indicate a potential leak or compromise, and the key should be revoked and replaced immediately.</p>
    `;
}