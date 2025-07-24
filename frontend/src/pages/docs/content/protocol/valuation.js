export const renderValuation = () => `
    <h1 id="valuation-engine">The Valuation Engine: How Your Code Gets Priced</h1>
    <p class="lead text-xl text-text-secondary">At the heart of Lumen is a sophisticated, hybrid valuation engine that appraises the objective value of your code as training data. This multi-stage process goes far beyond simple line counting to ensure that high-quality, unique, and complex contributions receive the highest rewards.</p>

    <blockquote>This engine is the core of our protocol's intelligence, ensuring a fair and meritocratic distribution of rewards. Your reward is not arbitrary; it's the output of a rigorous analysis.</blockquote>
    
    <h2 id="phase-one-uniqueness">Phase 1: The Uniqueness & Novelty Engine</h2>
    <p>This is the most critical phase. The protocol's primary goal is to acquire novel data that isn't already available. We use advanced machine learning techniques to achieve this.</p>
    <ol>
        <li><strong>Semantic Embedding:</strong> Your entire codebase is converted into a high-dimensional vector representation using a sentence-transformer model. This "embedding" captures the semantic meaning and logical intent of your code, not just its keywords.</li>
        <li><strong>Cosine Similarity Search:</strong> This new embedding is then compared against a vector database containing the embeddings of all previously contributed code on the network. We calculate the cosine similarity to find the most similar existing contribution.</li>
        <li><strong>Decision Logic:</strong>
            <ul>
                <li>If similarity to another user's code is extremely high, the contribution is flagged as potential plagiarism and rejected.</li>
                <li>If similarity to one of your own previous submissions is very high, it's treated as an <strong>update</strong>. The valuation will be based on the "diff", the new code you've added. You cannot earn rewards for submitting the same code twice.</li>
                <li>If similarity is low, the contribution is considered novel and proceeds to the next phase with a high uniqueness score.</li>
            </ul>
        </li>
    </ol>

    <h2 id="phase-two-quantitative-analysis">Phase 2: Quantitative Analysis (Code Metrics)</h2>
    <p>Once uniqueness is established, we perform a deep, language-agnostic analysis of the code's structure and content using the powerful <code>scc</code> (Sloc, Cloc and Code) tool and other metrics.</p>
    <ul>
        <li><strong>Logical Lines of Code (LLOC):</strong> We measure the number of actual lines of executable code, ignoring whitespace and comments.</li>
        <li><strong>Token Count:</strong> We use a high-performance tokenizer (<code>tiktoken</code>) to get an accurate count of the tokens in your submission, which serves as a baseline for its size.</li>
        <li><strong>Cyclomatic Complexity:</strong> We measure the structural complexity of your code. A project with intricate functions, nested loops, and conditional logic will have a higher complexity score than simple, linear scripts.</li>
        <li><strong>Language Breakdown:</strong> We identify the languages used and their prevalence, which can factor into rarity multipliers.</li>
        <li><strong>Compression Ratio:</strong> As a guardrail against low-effort or "garbage" data, we measure the code's entropy via zlib compression. Highly repetitive code compresses very well and is assigned a low value.</li>
    </ul>

    <h2 id="phase-three-qualitative-analysis">Phase 3: Qualitative Analysis (AI Review)</h2>
    <p>Metrics alone don't tell the whole story. To understand the <em>quality</em> of the code's design, we use a fine-tuned Large Language Model as an expert reviewer. The LLM is given the code and the metrics from Phase 2, and is tasked with providing scores on a 0.0 to 1.0 scale for:</p>
    <ul>
        <li><strong>Project Clarity Score:</strong> How original and non-generic is the project's purpose? A simple to-do app is rated low, while a specialized, domain-specific tool is rated high.</li>
        <li><strong>Architectural Quality Score:</strong> How well is the code structured? Does it follow good design patterns? A single monolithic file is rated low, while a well-organized, modular project is rated high.</li>
        <li><strong>Code Quality Score:</strong> How clean is the code itself? This assesses variable names, readability, and potential for bugs. Clean, maintainable code is rated high.</li>
    </ul>
    <p>The AI's summary and scores are passed to the final reward calculation, providing a crucial qualitative dimension to the valuation.</p>
    
    <h2 id="phase-four-reward-calculation">Phase 4: The Final Reward Calculation</h2>
    <p>The final reward is a synthesis of all previous stages, combined with network-wide factors:</p>
    <p><code>Final Reward = (Base Value * Quality Multiplier * Rarity Multiplier) * Network Growth Multiplier</code></p>
    <ul>
        <li><strong>Base Value:</strong> Derived primarily from the token count of the novel code contributed.</li>
        <li><strong>Quality Multiplier:</strong> A weighted average of the AI's qualitative scores (Clarity, Architecture, Quality).</li>
        <li><strong>Rarity Multiplier:</strong> If your contribution's complexity is statistically rare compared to the network average, you receive a bonus multiplier.</li>
        <li><strong>Network Growth Multiplier:</strong> To incentivize early adoption, contributions made when the network is young receive a significant bonus multiplier. This multiplier decreases as the network matures.</li>
    </ul>
    <p>This comprehensive process ensures that Lumen rewards are not just a measure of quantity, but a true reflection of the quality, novelty, and complexity of the data you provide to the network.</p>
`;