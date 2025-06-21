export const renderAuthentication = () => `
    <h1 id="authentication">CLI Authentication</h1>
    <p class="lead text-xl text-text-secondary">To ensure your contributions are credited to your account, you must securely link the Lumen CLI to your identity on the network. We use a highly secure, browser-based device authorization flow.</p>

    <h2 id="the-process">The Device Authorization Flow</h2>
    <p>Lumen's authentication process is designed so that your primary account credentials (like a password or social login) are never exposed to the command-line tool. The CLI is only granted a specific, revocable token for making contributions.</p>
    <p>Here’s the step-by-step process:</p>

    <h3>Step 1: Initiate Login from the CLI</h3>
    <p>In your terminal, run the <code>login</code> command:</p>
    <div class="code-block">
        <div class="code-block-header">
            <div class="traffic-lights"><div class="traffic-light light-red"></div><div class="traffic-light light-yellow"></div><div class="traffic-light light-green"></div></div>
            <div class="flex-grow text-center text-xs font-mono">bash</div>
        </div>
        <div class="code-block-content">
            <p><span class="command">lum login</span></p>
            <p class="mt-2"><span class="output">[Lumen] To link this device, please complete the following steps:</span></p>
            <p><span class="output">1. Open your browser and go to: <strong class="text-accent-cyan">https://lumen.exchange/link</strong></span></p>
            <p><span class="output">2. Enter this one-time code: <strong class="text-accent-cyan">ABCD-EFGH</strong></span></p>
            <p><span class="output">Waiting for authorization...</span></p>
        </div>
    </div>
    <p>The CLI generates a unique code and begins polling the Lumen servers for authorization. This code is valid for 10 minutes.</p>

    <h3>Step 2: Authorize in Your Browser</h3>
    <p>Navigate to the provided URL (<code>lumen.exchange/link</code>) in your web browser. You will be prompted to log into your Lumen account if you aren't already. Then, you'll see a screen to enter the one-time code from your terminal.</p>
    <p>After entering the code, you will be asked to approve the new device (e.g., "Lumen CLI on MacBook Pro"). By approving, you are authorizing this specific CLI instance to submit contributions on your behalf.</p>

    <h3>Step 3: Confirmation</h3>
    <p>Once you approve in the browser, the Lumen servers notify the waiting CLI. Your terminal will update with a success message:</p>
    <div class="code-block">
        <div class="code-block-header">
             <div class="traffic-lights"><div class="traffic-light light-red"></div><div class="traffic-light light-yellow"></div><div class="traffic-light light-green"></div></div>
            <div class="flex-grow text-center text-xs font-mono">bash</div>
        </div>
        <div class="code-block-content">
             <p><span class="output text-green-400">✔ Success! Device authorized and authenticated as 'YourDisplayName'.</span></p>
        </div>
    </div>
    <p>The CLI securely stores a Personal Access Token (PAT) in its local configuration. This token will be used for all future contributions from this device.</p>
    
    <h2 id="token-security">Token Security and Storage</h2>
    <ul>
        <li><strong>Limited Scope:</strong> The PAT stored by the CLI is only authorized to submit contributions. It cannot be used to change your account settings, password, or access other sensitive data.</li>
        <li><strong>Secure Storage:</strong> The token is stored in a configuration file located at <code>~/.lum/config.json</code> on your system.</li>
        <li><strong>Logging Out:</strong> If you wish to de-authorize a device, simply run <code>lum logout</code>. This will delete the local token from your configuration file, effectively logging you out on that machine.</li>
    </ul>
`;