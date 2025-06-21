export const renderSecurity = () => `
    <h1 id="security">Security: Our Unwavering Commitment</h1>
    <p class="lead text-xl text-text-secondary">We understand that source code is one of the most sensitive assets a developer or company possesses. The security and privacy of your data are not features of Lumen; they are the absolute, non-negotiable foundation upon which the entire protocol is built.</p>
    
    <h2 id="the-cardinal-rule">The Cardinal Rule: Local-First Processing</h2>
    <p>Our entire security model is built around one simple, powerful promise: <strong>Your raw, identifiable source code will never, under any circumstances, leave your local machine.</strong> Every privacy-critical operation is performed on your device by the open-source Lumen CLI before a single byte of data is transmitted.</p>

    <h3 id="the-anonymization-pipeline">The On-Device Anonymization Pipeline</h3>
    <p>When you run <code>lum contribute</code>, the CLI executes a rigorous, multi-stage pipeline locally:</p>
    <ol>
        <li><strong>File Discovery:</strong> The CLI intelligently discovers relevant source files, automatically respecting your <code>.gitignore</code> and global configuration to ignore dependencies, build artifacts, and other non-essential files.</li>
        <li><strong>Secret & Credential Scrubbing:</strong> Using a combination of advanced regex patterns and high-entropy string detection, the CLI actively identifies and redacts a wide range of sensitive information, including:
            <ul>
                <li>API Keys (e.g., AWS, Stripe, OpenAI)</li>
                <li>Private Keys (e.g., RSA, PGP)</li>
                <li>Authentication Tokens (e.g., JWTs, OAuth tokens)</li>
                <li>Passwords and Database Connection Strings</li>
            </ul>
        </li>
        <li><strong>PII (Personally Identifiable Information) Removal:</strong> The anonymizer searches for and removes common PII patterns like email addresses, IP addresses, and names within comments and string literals.</li>
        <li><strong>Comment & String Analysis:</strong> All comments and string literals are analyzed for potentially sensitive proprietary information. While the goal is to preserve logical intent, overly descriptive or sensitive comments may be sanitized.</li>
        <li><strong>Secure Packaging:</strong> Only after this entire pipeline is complete is the fully anonymized, sanitized version of your code packaged for submission to the network.</li>
    </ol>
    
    <h2 id="radical-transparency-and-trust">Radical Transparency and Trust</h2>
    <p>We don't ask you to blindly trust our claims. We provide the proof.</p>
    <ul>
        <li><strong>Fully Open-Source CLI:</strong> The complete source code for the Lumen CLI is available for public inspection and audit. We encourage the security community to scrutinize our code, challenge our methods, and help us improve. Your ability to verify our process is the ultimate guarantee of your security.</li>
        <li><strong>Secure Authentication by Design:</strong> We deliberately chose a <a href="/docs/authentication">Device Authorization Flow</a>. This means the CLI never handles your password or primary social login. It only ever receives a limited-scope, revocable token, minimizing the attack surface.</li>
    </ul>

    <blockquote>Your trust is the most valuable asset in the Lumen ecosystem. We are committed to earning and maintaining it through uncompromising security design and radical transparency. Contribute with confidence.</blockquote>
`;