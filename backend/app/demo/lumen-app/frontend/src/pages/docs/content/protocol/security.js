export const renderSecurity = () => `
    <h1 id="security-by-design">Security by Design</h1>
    <p class="lead text-xl text-text-secondary">We understand that source code is one of the most sensitive assets a developer possesses. The security and privacy of your data are not features of Lumen; they are the absolute, non-negotiable foundation upon which the entire protocol is built.</p>
    
    <h2 id="cli-security">CLI & Local-First Processing</h2>
    <p>Our entire security model is built around one simple, powerful promise: <strong>Your raw, identifiable source code will never, under any circumstances, leave your local machine.</strong> Every privacy-critical operation is performed on your device by the open-source Lumen CLI before a single byte of data is transmitted.</p>

    <h3>The On-Device Anonymization Pipeline</h3>
    <p>When you run <code>lum contribute</code>, the CLI executes a rigorous, multi-stage pipeline locally, leveraging trusted, open-source security tools:</p>
    <ol>
        <li><strong>File Discovery & Filtering:</strong> The CLI intelligently discovers relevant source files, automatically respecting your <code>.gitignore</code> and global configuration to ignore dependencies, build artifacts, and other non-essential files.</li>
        <li><strong>Secret Scanning with TruffleHog:</strong> We integrate the industry-standard <strong>TruffleHog</strong> engine to scan for secrets. It uses advanced entropy analysis and pattern matching to find and redact a wide range of sensitive credentials, including API Keys, private keys, and authentication tokens.</li>
        <li><strong>PII Redaction with Scrubadub:</strong> The codebase is then processed by <strong>Scrubadub</strong>, a robust library that identifies and removes common Personally Identifiable Information (PII) patterns like email addresses, phone numbers, and IP addresses found within comments and string literals.</li>
        <li><strong>Comment Removal:</strong> To further reduce the risk of exposing proprietary information, all comments are stripped from the code.</li>
        <li><strong>Secure Packaging:</strong> Only after this entire pipeline is complete is the fully anonymized, sanitized version of your code packaged for submission to the network.</li>
    </ol>

    <h2 id="platform-security">Platform & Account Security</h2>
    <p>Your Lumen account is the gateway to your rewards, and we protect it with industry-standard security measures.</p>
    <ul>
        <li><strong>Secure Password & Social Logins:</strong> We support both traditional email/password registration and OAuth 2.0 for providers like GitHub. Passwords are never stored in plaintext; they are hashed using the robust <strong>bcrypt</strong> algorithm via the <code>passlib</code> library.</li>
        <li><strong>Two-Factor Authentication (2FA):</strong> Users can add an essential layer of security by enabling time-based one-time password (TOTP) 2FA using an authenticator app. This ensures that even if your password is compromised, your account remains secure.</li>
        <li><strong>Secure Account Recovery:</strong> We provide secure, token-based flows for password resets and 2FA disabling, requiring email confirmation to prevent unauthorized account changes.</li>
    </ul>

    <h2 id="api-security">API & Transport Security</h2>
    <p>The communication between your CLI and the Lumen backend is hardened against tampering and eavesdropping.</p>
    <ul>
        <li><strong>Secure Device Authentication:</strong> Our <a href="/docs/authentication">Device Authorization Flow</a> ensures the CLI never handles your password. It only receives a limited-scope, revocable Personal Access Token (PAT).</li>
        <li><strong>HMAC Signature Verification:</strong> Every contribution submission from the CLI is signed with a unique HMAC (Hash-based Message Authentication Code). The signature is created using your PAT, a server-provided challenge, a timestamp, and a hash of the request body. This proves that the request is from you and that the payload has not been tampered with in transit.</li>
        <li><strong>TLS Encryption:</strong> All communication with the Lumen API is encrypted end-to-end using TLS 1.3, the standard for secure web communication, enforced by our Nginx reverse proxy.</li>
    </ul>

    <h2 id="on-chain-security">On-Chain Security</h2>
    <p>Your rewards are managed with transparency and security on the Solana blockchain.</p>
    <ul>
        <li><strong>Protocol Treasury Wallet:</strong> All USDC payouts are dispensed from a protocol-controlled treasury wallet on the Solana network. The private key for this wallet is stored securely as an environment variable, isolated from the main application database and other services.</li>
        <li><strong>Secure Wallet Linking:</strong> We use cryptographic signature verification (Ed25519) to confirm you own the Solana wallet you are linking for rewards, preventing unauthorized address changes.</li>
        <li><strong>Public & Auditable:</strong> All payout transactions are public on the Solana blockchain, providing a transparent and auditable record of rewards distribution that can be verified on any block explorer like Solscan.</li>
    </ul>
`