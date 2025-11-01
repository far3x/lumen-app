export function renderCoreConcepts() {
    return `
        <h1 id="concepts">Core Concepts</h1>
        <p class="lead">Understanding these fundamental concepts is key to effectively using the Lumen for Business platform.</p>
        
        <h2 id="contributions">Contributions</h2>
        <p>A "Contribution" is a package of anonymized source code submitted to the Lumen network by a developer. Each contribution is a self-contained project or update, processed by our open-source CLI to remove sensitive data before it ever leaves the developer's machine.</p>
        <ul>
            <li><strong>Unique ID:</strong> Every contribution is assigned a unique, sequential ID (e.g., <code>Contribution #1234</code>).</li>
            <li><strong>Rich Metadata:</strong> Each one is enriched with valuable metadata, including token count, language breakdown, and our proprietary AI-driven scores for quality, clarity, and architecture.</li>
        </ul>

        <h2 id="tokens">Tokens (Usage Credits)</h2>
        <p>Your "Token Balance" is the currency of the Lumen platform. It functions like a prepaid credit system for data acquisition.</p>
        <ul>
            <li><strong>Unit of Value:</strong> One token corresponds to one token of source code, as measured by a standard tokenizer (tiktoken's <code>cl100k_base</code>).</li>
            <li><strong>Consumption:</strong> You consume tokens from your balance only when you "unlock" a contribution to gain access to its full source code. Searching and previewing data is free.</li>
            <li><strong>Acquisition:</strong> Tokens are acquired through our monthly subscription plans or by purchasing top-up packages.</li>
        </ul>

        <h2 id="unlocking">Unlocking Data</h2>
        <p>Unlocking is the act of acquiring the perpetual right to access the full, raw source code of a specific contribution. This is the primary action on the platform.</p>
        <ul>
            <li><strong>Token Debit:</strong> When you unlock a contribution, its total token count is permanently debited from your company's token balance.</li>
            <li><strong>Perpetual Access:</strong> Once unlocked, a contribution is yours to access forever. You can view it in the dashboard or download it via the API at any time without being charged again.</li>
            <li><strong>Team-Wide Access:</strong> Unlocks are performed at the company level. If one team member unlocks a contribution, it becomes available to all other members of your team.</li>
        </ul>
    `;
}