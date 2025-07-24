export const renderContributing = () => `
    <h1 id="contributing-data">Contributing Data</h1>
    <p class="lead text-xl text-text-secondary">Contributing to Lumen is the core of the protocol. It is the process by which you convert your work into value on the network. This guide explains how to contribute effectively and how your submissions are appraised.</p>

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
            <p class="mt-2"><span class="output">[Lumen] Starting contribution process...</span></p>
            <p><span class="output">[Lumen] 1. Assembling file structure...</span></p>
            <p><span class="output">[Lumen] 2. Sanitizing code and preparing payload...</span></p>
            <p><span class="output">[Lumen] 3. Submitting to Lumen network...</span></p>
            <p><span class="output text-green-400">✔ Contribution successful! (ID: 12345)</span></p>
            <p class="output">Your submission is now in the processing queue.</p>
            <p class="output">You can check its status at any time with 'lum history'.</p>
        </div>
    </div>

    <p>Behind the scenes, the CLI performs a series of critical local operations: it respects your <code>.gitignore</code>, discovers all relevant files, sanitizes their content to remove secrets and comments, and securely submits the anonymized package to the network for valuation.</p>
    
    <blockquote>
        <strong>Deep Dive: The Valuation Engine</strong>
        <br>
        Curious about the intricate details of how we determine the value of your code? We've dedicated an entire page to explaining our multi-stage valuation process.
        <br>
        <a href="/docs/valuation" class="text-accent-cyan hover:underline font-semibold mt-2 inline-block">Explore The Valuation Engine →</a>
    </blockquote>

    <h2 id="what-to-contribute">What to Contribute for Maximum Rewards</h2>
    <p>To maximize your <code>$LUM</code> earnings, focus on contributing code that embodies the qualities the valuation engine is designed to reward:</p>
    <ol>
        <li><strong>Proprietary & Private Projects:</strong> Your personal or professional projects that are not public on GitHub are the most valuable data source on the planet. They are guaranteed to be unique and contain novel logic.</li>
        <li><strong>Complex, Domain-Specific Logic:</strong> A custom physics engine, a financial modeling tool, a specialized data processing pipeline, this type of code contains the non-obvious patterns that AI models need to learn true reasoning.</li>
        <li><strong>Well-Structured and Mature Codebases:</strong> Projects that demonstrate clear architecture, good design patterns, and thoughtful structure provide higher-quality training data than monolithic scripts.</li>
        <li><strong>Updates and Iterations:</strong> The protocol is designed to reward innovation. Contributing updates to your existing projects is a fantastic way to earn, as the engine specifically values the new, complex code you've added since the last submission.</li>
    </ol>
    <p>In short, the more unique, complex, and thoughtful your code, the more valuable it is to the network, and the greater your reward will be.</p>
`;