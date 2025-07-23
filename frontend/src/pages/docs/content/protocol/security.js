export const renderSecurity = () => `
    <h1 id="security-by-design">Security by Design</h1>
    <p class="lead text-xl text-text-secondary">We understand that source code is one of the most sensitive assets a developer or company possesses. The security and privacy of your data are not features of Lumen; they are the absolute, non-negotiable foundation upon which the entire protocol is built.</p>
    
    <h2 id="cli-security">CLI & Local-First Processing</h2>
    <p>Our entire security model is built around one simple, powerful promise: <strong>Your raw, identifiable source code will never, under any circumstances, leave your local machine.</strong> Every privacy-critical operation is performed on your device by the open-source Lumen CLI before a single byte of data is transmitted.</p>

    <h3>The On-Device Anonymization Pipeline</h3>
    <p>When you run <code>lum contribute</code>, the CLI executes a rigorous, multi-stage pipeline locally:</p>
    <ol>
        <li><strong>File Discovery:</strong> The CLI intelligently discovers relevant source files, automatically respecting your <code>.gitignore</code> and global configuration to ignore dependencies, build artifacts, and other non-essential files.</li>
        <li><strong>Secret & Credential Scrubbing:</strong> Using a combination of advanced regex patterns and high-entropy string detection, the CLI actively identifies and redacts a wide range of sensitive information, including API Keys, private keys, authentication tokens, and database connection strings.</li>
        <li><strong>PII (Personally Identifiable Information) Removal:</strong> The anonymizer searches for and removes common PII patterns like email addresses and IP addresses within comments and string literals.</li>
        <li><strong>Comment & String Analysis:</strong> All comments and string literals are analyzed for potentially sensitive proprietary information. While the goal is to preserve logical intent, overly descriptive or sensitive comments may be sanitized.</li>
        <li><strong>Secure Packaging:</strong> Only after this entire pipeline is complete is the fully anonymized, sanitized version of your code packaged for submission to the network.</li>
    </ol>

    <h2 id="platform-security">Platform & Account Security</h2>
    <p>Your Lumen account is the gateway to your rewards, and we protect it with industry-standard security measures.</p>
    <ul>
        <li><strong>Secure Password & Social Logins:</strong> We support both traditional email/password registration and OAuth 2.0 for major providers like Google and GitHub. Passwords are never stored in plaintext; they are hashed using the robust bcrypt algorithm.</li>
        <li><strong>Two-Factor Authentication (2FA):</strong> Users can add an essential layer of security by enabling time-based one-time password (TOTP) 2FA. This ensures that even if your password is compromised, your account remains secure.</li>
        <li><strong>Secure Account Recovery:</strong> We provide secure, token-based flows for password resets and 2FA disabling, requiring email confirmation to prevent unauthorized account changes.</li>
    </ul>

    <h2 id="api-security">API & Transport Security</h2>
    <p>The communication between your CLI and the Lumen backend is hardened against tampering and eavesdropping.</p>
    <ul>
        <li><strong>Secure Device Authentication:</strong> Our <a href="/docs/authentication">Device Authorization Flow</a> ensures the CLI never handles your password. It only receives a limited-scope, revocable Personal Access Token (PAT).</li>
        <li><strong>HMAC Signature Verification:</strong> Every contribution submission from the CLI is signed with a unique HMAC (Hash-based Message Authentication Code). The signature is created using your PAT, a server-provided challenge, a timestamp, and a hash of the request body. This proves that the request is from you and that the payload has not been tampered with in transit.</li>
        <li><strong>TLS Encryption:</strong> All communication with the Lumen API is encrypted using TLS 1.2 or higher, the standard for secure web communication.</li>
    </ul>

    <h2 id="on-chain-security">On-Chain Security</h2>
    <p>Your rewards are managed with transparency and security on the Solana blockchain.</p>
    <ul>
        <li><strong>Secure Treasury:</strong> All protocol rewards are dispensed from a secure, hardware-wallet-backed treasury on the Solana network.</li>
        <li><strong>Wallet Linking:</strong> We use cryptographic signature verification (Ed25519) to confirm you own the Solana wallet you are linking for rewards, preventing unauthorized address changes.</li>
        <li><strong>Public & Auditable:</strong> All claim transactions are public on the Solana blockchain, providing a transparent and auditable record of rewards distribution.</li>
    </ul>
`;