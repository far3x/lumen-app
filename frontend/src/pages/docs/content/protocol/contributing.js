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
            <p><span class="command">cd path/to/your/project</span></p>
            <p><span class="command">lum contribute</span></p>
            <p class="mt-2"><span class="output">Starting contribution process...</span></p>
            <p><span class="output"> 1. Assembling file structure...</span></p>
            <p><span class="output"> 2. Sanitizing code and preparing payload...</span></p>
            <p><span class="output"> 3. Submitting to Lumen network...</span></p>
            <p><span class="output text-green-400">✅ Contribution successful! (ID: xxx)</span></p>
            <p class="output">Your submission is now in the processing queue.</p>
            <p class="output">You can check its status at any time with 'lum history'.</p>
        </div>
    </div>

    <p>Behind the scenes, the CLI performs a series of critical local operations: it respects your <code>.gitignore</code>, discovers all relevant files, sanitizes their content to remove secrets, and securely submits the anonymized package to the network for valuation.</p>
    
    <h2 id="contribution-guidelines">Contribution Guidelines & Limits</h2>
    <p>To maintain the high quality of our dataset and ensure the network remains fair for all contributors, the following guidelines are in place:</p>
    <ul>
        <li><strong>Daily Contribution Limit:</strong> To encourage thoughtful, high-quality submissions, each user is limited to <strong>3 successful contributions per 24-hour period</strong>. This limit resets on a rolling basis and applies only to contributions that are successfully processed, not to submissions that fail validation.</li>
        <li><strong>Payload Size Limit:</strong> The protocol enforces a technical limit of <strong>700,000 tokens</strong> per contribution. This is a safeguard for platform stability and ensures that even very large projects can be processed efficiently.</li>
    </ul>
    <blockquote>These limits are designed to incentivize quality over quantity. By encouraging you to submit your most valuable and well-developed projects, we increase the overall value of the dataset, which in turn increases the value of everyone's rewards.</blockquote>

    <h2 id="what-to-contribute">What to Contribute for Maximum Rewards</h2>
    <p>The protocol rewards the principles of good engineering, regardless of programming language. To maximize your rewards, focus on code that embodies these qualities:</p>
    <ol>
        <li><strong>Novelty and Uniqueness:</strong> The protocol's primary goal is to acquire data that AI models have not seen before. Your unique solutions, personal projects, or unpublished work are the most valuable assets you can contribute. The more distinct your code is from public repositories, the higher its value.</li>
        <li><strong>Quality and Complexity:</strong> Value is tied to substance. A project with intricate logic, thoughtful architectural patterns, and clean, efficient code will always be valued more highly than simple scripts or boilerplate.</li>
        <li><strong>Iteration and Progress:</strong> The protocol is designed to reward active development. Contributing updates to your projects is highly encouraged, as the engine specifically identifies and rewards the new value you have added since your last submission.</li>
    </ol>
    <p>In short, the more unique, complex, and thoughtful your code, the more valuable it is to the network, and the greater your reward will be.</p>
`;