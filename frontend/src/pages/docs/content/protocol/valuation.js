export const renderValuation = () => `
    <h1 id="valuation-engine">The Lumen Quality Engine: How We Quantify Intelligence in Code</h1>
    <p class="lead text-xl text-text-secondary">Our valuation process is not a black box. It's a sophisticated, multi-stage pipeline designed to transparently and fairly appraise the value of a code contribution as a strategic AI training asset. It combines objective, verifiable metrics with an advanced AI-driven layer for qualitative analysis.</p>

    <blockquote>
        <strong>Our Philosophy:</strong> We believe that great engineering has objective value. This engine is our attempt to quantify it, rewarding the quality, complexity, and novelty that AI models need to learn genuine reasoning.
    </blockquote>

    <h2 id="phase-one-uniqueness">Phase 1: Signal vs. Noise (Uniqueness & Historical Context)</h2>
    <p>The first and most critical step is to determine if a contribution adds new, valuable information to the network. We do this by checking for duplication and understanding the context of the submission.</p>
    <ol>
        <li><strong>Semantic Fingerprinting:</strong> The entire codebase is processed into a high-dimensional vector, a mathematical "fingerprint" that captures the code's logical meaning and structure, not just its text.</li>
        <li><strong>Network Indexing:</strong> This new fingerprint is compared against our entire database of existing contributions using a high-performance vector search (pgvector).</li>
        <li><strong>Decision Logic:</strong>
            <ul>
                <li><strong>Cross-User Plagiarism:</strong> If the similarity to another user's code is extremely high, the contribution is rejected to protect the integrity of the dataset.</li>
                <li><strong>Project Updates:</strong> If the code is an update to one of your own previous submissions, the engine applies an "innovation multiplier." You are rewarded primarily for the new logic and improvements you've added.</li>
                <li><strong>Novel Contribution:</strong> If the contribution is novel, it passes with a high uniqueness score and proceeds to the next stage.</li>
            </ul>
        </li>
    </ol>

    <h2 id="phase-two-quantitative-analysis">Phase 2: The Objective Foundation (Quantitative Analysis)</h2>
    <p>This phase establishes a verifiable, mathematical baseline of the code's substance using language-agnostic tools. This is the non-AI part of our analysis.</p>
    <ul>
        <li><strong>Logical Lines of Code (LLOC):</strong> We measure the actual lines of executable code, ignoring whitespace and comments, to gauge the project's density and substance.</li>
        <li><strong>Structural Complexity:</strong> We measure the cyclomatic complexity of the code. A project with intricate functions and deep logic will have a higher complexity score than simple, linear scripts. This metric is calculated on a logarithmic scale to heavily reward significant jumps in engineering complexity.</li>
        <li><strong>Language & Token Analysis:</strong> We identify all programming languages present and perform a precise token count using a standard tokenizer (tiktoken's \`cl100k_base\`).</li>
    </ul>

    <h2 id="phase-three-qualitative-analysis">Phase 3: The AI Layer (Qualitative Analysis)</h2>
    <p>After the objective metrics are calculated, we use a fine-tuned Large Language Model for a task that requires contextual understanding: assessing engineering intent. The AI acts as an expert senior engineer, reviewing the code on three key qualitative axes:</p>
    <ul>
        <li><strong>Project Clarity & Novelty:</strong> How original and non-generic is the project's purpose? A unique, domain-specific tool is rated higher than a common tutorial project.</li>
        <li><strong>Architectural Quality:</strong> How well is the code structured? A well-organized, modular project with clear separation of concerns is rated higher than a single monolithic file.</li>
        <li><strong>Code Quality & Readability:</strong> How clean and maintainable is the code itself? This assesses variable names, function clarity, and adherence to best practices.</li>
    </ul>

    <h2 id="phase-four-reward-calculation">Phase 4: Synthesizing the Final Value</h2>
    <p>The final reward is a synthesis of all previous stages, combined with network-wide factors to ensure a fair and dynamic system.</p>
    <ul>
        <li><strong>Hybrid Score Calculation:</strong> The objective metrics from Phase 2 are combined with the AI-driven scores from Phase 3 to create a single, comprehensive quality score.</li>
        <li><strong>Open Source Detection:</strong> Our engine checks if snippets of the code are widely available in public repositories. If a strong match is found, the contribution is still accepted, but a "Public Code Modifier" is applied to significantly reduce the reward. This ensures we prioritize and reward truly proprietary and unique data.</li>
        <li><strong>Personal Reward Multiplier:</strong> Finally, your account's reward multiplier (e.g., from the Genesis Contributor program) is applied to calculate the final USD value that is credited to your account.</li>
    </ul>
`;