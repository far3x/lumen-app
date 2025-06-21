export const renderContributing = () => `
    <h1 id="contributing-data">How to Contribute & Earn Rewards</h1>
    <p class="lead text-xl text-text-secondary">Contributing to Lumen is the core of the protocol. This guide explains how the process works and how you can maximize your rewards.</p>

    <h2 id="the-contribution-process">The Contribution Process</h2>
    <p>After you have <a href="/docs/installation">installed</a> and <a href="/docs/authentication">authenticated</a> the CLI, contributing is a single command. Navigate to the root directory of your project and run:</p>
    <div class="code-block">
        <div class="code-block-header">
            <div class="traffic-lights"><div class="traffic-light light-red"></div><div class="traffic-light light-yellow"></div><div class="traffic-light light-green"></div></div>
            <div class="flex-grow text-center text-xs font-mono">bash</div>
        </div>
        <div class="code-block-content">
            <p><span class="command">cd /path/to/my-awesome-project</span></p>
            <p><span class="command">lum contribute</span></p>
            <p class="mt-2"><span class="output">[Lumen] Analyzing 1,247 files...</span></p>
            <p><span class="output">[Lumen] Generating semantic embedding for uniqueness check...</span></p>
            <p><span class="output">[Lumen] Anonymizing sensitive data locally...</span></p>
            <p><span class="output">[Lumen] Submitting secure payload to the network...</span></p>
            <p><span class="output text-green-400">✔ Contribution successful! A reward of 157.82 $LUM has been credited to your account.</span></p>
        </div>
    </div>
    
    <h2 id="how-rewards-are-calculated">How Rewards Are Calculated: The Valuation Engine</h2>
    <p>Your reward is not arbitrary. It's calculated by a sophisticated, hybrid valuation engine that assesses the objective value of your contribution as training data. The key factors are:</p>
    <ul>
        <li><strong>Uniqueness (The Most Important Factor):</strong> The protocol uses advanced semantic embedding models (similar to those in LLMs) to compare your submission against all previously contributed code. A project that is semantically unique and novel will receive a significantly higher reward than one that is similar to existing data.</li>
        <li><strong>Size & Scope (Token Count):</strong> The raw amount of logical code, measured in tokens, serves as a baseline for the valuation. More code generally means more data, but this is heavily weighted by the other factors.</li>
        <li><strong>Complexity:</strong> The engine analyzes the cyclomatic complexity and structural depth of your code. A project with intricate algorithms and complex logic is more valuable for teaching AI than simple boilerplate or CRUD operations.</li>
        <li><strong>Network Demand & Rarity:</strong> The protocol may adjust rewards based on the current demand for certain languages or code patterns from data consumers, creating a dynamic market that rewards rare and sought-after data.</li>
    </ul>

    <h2 id="contributing-updates-rewards-for-innovation">Contributing Updates: Rewards for Innovation</h2>
    <p>Lumen is designed to value ongoing development. When you contribute a project you've previously submitted, the protocol is intelligent enough to identify it as an update.</p>
    <blockquote>You are rewarded based on the <strong>new value</strong> you've added. The system calculates a "diff" of your changes and bases your reward on the uniqueness and complexity of the new and modified code.</blockquote>
    <p>This means you are incentivized to continuously improve and expand your projects, but you cannot earn rewards by repeatedly submitting the same unchanged code.</p>

    <h2 id="what-to-contribute-for-maximum-rewards">What to Contribute for Maximum Rewards</h2>
    <p>To maximize your <code>$LUM</code> earnings, focus on contributing code that embodies the qualities the valuation engine looks for:</p>
    <ol>
        <li><strong>Proprietary & Private Projects:</strong> Your personal or professional projects that are not public on GitHub are the most valuable data source on the planet. They are guaranteed to be unique.</li>
        <li><strong>Complex, Domain-Specific Logic:</strong> A custom physics engine, a financial modeling tool, a specialized data processing pipeline—this type of code contains the novel patterns AI models need to learn.</li>
        <li><strong>Well-Structured and Mature Codebases:</strong> Projects that demonstrate clear architecture, good design patterns, and thoughtful structure provide higher-quality training data.</li>
    </ol>
`;