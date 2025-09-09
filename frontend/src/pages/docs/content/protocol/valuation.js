export const renderValuation = () => `
    <h1 id="valuation-engine">The Valuation Engine: How Your Code is Priced</h1>
    <p class="lead text-xl text-text-secondary">At the heart of Lumen is a sophisticated, hybrid valuation engine that appraises the objective value of your code as a training asset. This multi-stage process goes far beyond simple line-counting to ensure that high-quality, unique, and complex contributions receive the highest rewards.</p>

    <blockquote>
        <strong>Our Commitment to Fair Value</strong>
        <br>
        This engine is the core of our protocol's intelligence. Your reward is not arbitrary; it is the output of a rigorous, multi-faceted analysis designed to be fair, transparent in its principles, and meritocratic in its results.
    </blockquote>

    <h2 id="phase-one-uniqueness">Phase 1: Uniqueness & Historical Context</h2>
    <p>The protocol's primary goal is to acquire novel data that AI models have not seen before. This is the most critical phase, where we determine if your contribution adds new, valuable information to the network.</p>
    <ol>
        <li><strong>Semantic Fingerprinting:</strong> Your entire codebase is processed to create a unique "fingerprint". This captures the logical intent of your code, not just its keywords.</li>
        <li><strong>Historical Analysis:</strong> This fingerprint is cross-referenced against our entire network index. This tells us if the code is brand new, an update to your previous work, or similar to another user's submission.</li>
        <li><strong>Decision Logic:</strong>
            <ul>
                <li>If similarity to another user's code is extremely high, the contribution is flagged as potential plagiarism and rejected.</li>
                <li>If the code is an update to one of your own previous submissions, the engine intelligently isolates only the new, changed code. Your reward will be based on the "innovation" you've added.</li>
                <li>If the contribution is novel, it proceeds with a high uniqueness score.</li>
            </ul>
        </li>
    </ol>
    
    <div class="my-8 p-6 bg-surface border border-primary rounded-lg">
        <h3 class="font-bold text-lg text-text-main mb-2">Our Key Differentiator: Holistic Context Analysis</h3>
        <p class="text-text-secondary">Unlike systems that analyze isolated snippets, our AI review engine is provided with the <strong>entire context</strong> of your contribution. This allows for a much deeper and more accurate understanding of architectural quality and project clarity, resulting in a valuation that is fundamentally fairer and more precise.</p>
    </div>

    <h2 id="phase-two-quantitative-analysis">Phase 2: Quantitative Analysis (Code Metrics)</h2>
    <p>Once uniqueness is established, we perform a deep, language-agnostic analysis of the code's structure to establish an objective baseline of its substance.</p>
    <ul>
        <li><strong>Logical Lines of Code (LLOC):</strong> We measure the actual lines of executable code, ignoring whitespace and comments, to gauge the project's density.</li>
        <li><strong>Structural Complexity:</strong> We measure the architectural complexity of your code. A project with intricate functions and logic will have a higher complexity score than simple, linear scripts. This score is calculated on a logarithmic scale to reward significant complexity jumps.</li>
        <li><strong>Language Breakdown:</strong> We identify all programming languages present and their respective file counts.</li>
    </ul>

    <h2 id="phase-three-qualitative-analysis">Phase 3: Qualitative Analysis (AI Review)</h2>
    <p>Metrics alone do not tell the whole story. To understand the <em>quality</em> of the code's design, we leverage a fine-tuned Large Language Model that acts as an expert senior engineer, reviewing the code on three key qualitative axes:</p>
    <ul>
        <li><strong>Project Clarity:</strong> How original and non-generic is the project's purpose? A unique, domain-specific tool is rated higher than a common tutorial project.</li>
        <li><strong>Architectural Quality:</strong> How well is the code structured? A well-organized, modular project is rated higher than a single monolithic file.</li>
        <li><strong>Code Quality:</strong> How clean and maintainable is the code itself? This assesses readability, variable names, and best practices.</li>
    </ul>

    <h2 id="phase-four-reward-calculation">Phase 4: The Final Reward Calculation</h2>
    <p>The final reward is a sophisticated synthesis of all previous stages, combined with network-wide factors and special modifiers to ensure fairness and network health.</p>
    <ul>
        <li><strong>Base Value:</strong> This is calculated from the substance (LLOC, complexity) and quality (AI scores) of your novel code.</li>
        <li><strong>Open Source Detection:</strong> The engine checks if snippets of the code are widely available in public repositories. If a strong match is found, the contribution is still accepted, but a "Public Code Modifier" is applied to significantly reduce the reward. This ensures we prioritize and reward truly proprietary and unique data.</li>
        <li><strong>Personal Reward Multiplier:</strong> Your personal account multiplier (e.g., from the Genesis Contributor program) is applied to the final calculated value.</li>
    </ul>
    <p>This comprehensive process, which includes automated retries for AI analysis to ensure system resilience, guarantees that Lumen rewards are not just a measure of quantity, but a true reflection of the quality, novelty, and engineering skill embodied in the data you provide to the network.</p>
`;