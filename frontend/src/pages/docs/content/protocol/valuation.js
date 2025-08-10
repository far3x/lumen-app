export const renderValuation = () => `
    <h1 id="valuation-engine">The Valuation Engine: How Your Code is Priced</h1>
    <p class="lead text-xl text-text-secondary">At the heart of Lumen is a sophisticated, hybrid valuation engine that appraises the objective value of your code as a training asset. This multi-stage process goes far beyond simple line-counting to ensure that high-quality, unique, and complex contributions receive the highest rewards.</p>

    <blockquote>
        <strong>Our Commitment to Fair Value</strong>
        <br>
        This engine is the core of our protocol's intelligence. Your reward is not arbitrary; it's the output of a rigorous, multi-faceted analysis designed to be fair, transparent in its principles, and meritocratic in its results.
    </blockquote>

    <h2 id="phase-one-uniqueness">Phase 1: The Uniqueness & Novelty Engine</h2>
    <p>The protocol's primary goal is to acquire novel data that AI models have not seen before. This is the most critical phase, where we determine if your contribution adds new, valuable information to the network.</p>
    <ol>
        <li><strong>Semantic Fingerprinting:</strong> Your entire codebase is processed through an advanced semantic analysis model. This creates a high-dimensional vector, a unique "fingerprint", that captures the logical intent and meaning of your code, not just its keywords.</li>
        <li><strong>Proprietary Uniqueness Search:</strong> This fingerprint is then cross-referenced against our high-performance vector index, which contains the fingerprints of all previously contributed code on the network.</li>
        <li><strong>Decision Logic:</strong>
            <ul>
                <li>If similarity to another user's code is extremely high, the contribution is flagged as potential plagiarism and rejected.</li>
                <li>If similarity to one of your own previous submissions is very high, it's treated as an <strong>update</strong>. The valuation will be based on the "diff", the new code you've added. You cannot earn rewards for submitting the same unchanged code.</li>
                <li>If similarity is low, the contribution is considered novel and proceeds to the next phase with a high uniqueness score.</li>
            </ul>
        </li>
    </ol>
    
    <div class="my-8 p-6 bg-surface border border-primary rounded-lg">
        <h3 class="font-bold text-lg text-text-main mb-2">Our Key Differentiator: Holistic Context Analysis</h3>
        <p class="text-text-secondary">Unlike systems that rely on fragmented data chunks or retrieval-augmented generation (RAG), our AI review engine is provided with the <strong>entire context</strong> of your contribution. This allows for a much deeper and more accurate understanding of architectural quality, project clarity, and overall code excellence, resulting in a valuation that is fundamentally fairer and more precise.</p>
    </div>

    <h2 id="phase-two-quantitative-analysis">Phase 2: Quantitative Analysis (Code Metrics)</h2>
    <p>Once uniqueness is established, we perform a deep, language-agnostic analysis of the code's structure and content to establish an objective baseline of its substance.</p>
    <ul>
        <li><strong>Logical Lines of Code (LLOC):</strong> We measure the actual lines of executable code, ignoring whitespace and comments, to gauge the project's density.</li>
        <li><strong>Token Count:</strong> We get an accurate count of the tokens in your submission, which serves as a baseline for its size and complexity.</li>
        <li><strong>Structural Complexity:</strong> We measure the architectural complexity of your code. A project with intricate functions and logic will have a higher complexity score than simple, linear scripts.</li>
        <li><strong>Code Entropy:</strong> As a guardrail against low-effort data, we measure the code's entropy. Highly repetitive, boilerplate code is assigned a lower value.</li>
    </ul>

    <h2 id="phase-three-qualitative-analysis">Phase 3: Qualitative Analysis (AI Review)</h2>
    <p>Metrics alone don't tell the whole story. To understand the <em>quality</em> of the code's design, we leverage a fine-tuned Large Language Model as an expert reviewer. The LLM assesses the code on three key qualitative axes:</p>
    <ul>
        <li><strong>Project Clarity:</strong> How original and non-generic is the project's purpose? A unique, domain-specific tool is rated higher than a common tutorial project.</li>
        <li><strong>Architectural Quality:</strong> How well is the code structured? A well-organized, modular project is rated higher than a single monolithic file.</li>
        <li><strong>Code Quality:</strong> How clean and maintainable is the code itself? This assesses readability, variable names, and best practices.</li>
    </ul>

    <h2 id="phase-four-reward-calculation">Phase 4: The Final Reward Calculation</h2>
    <p>The final reward is a sophisticated synthesis of all previous stages, combined with network-wide factors. Instead of a rigid formula, the reward is determined by a model that weighs these key inputs:</p>
    <ul>
        <li><strong>The Base Value:</strong> Derived from the token count of the novel code contributed.</li>
        <li><strong>The Quality Multiplier:</strong> A weighted score from the AI's qualitative analysis (Clarity, Architecture, Quality).</li>
        <li><strong>The Rarity Multiplier:</strong> A bonus applied if your contribution's complexity is statistically rare compared to the network average.</li>
        <li><strong>The Network Growth Multiplier:</strong> A significant bonus for early contributors that decreases as the network matures, ensuring our foundational community is rewarded for their vision.</li>
    </ul>
    <p>This comprehensive process ensures that Lumen rewards are not just a measure of quantity, but a true reflection of the quality, novelty, and engineering skill embodied in the data you provide to the network.</p>
`;