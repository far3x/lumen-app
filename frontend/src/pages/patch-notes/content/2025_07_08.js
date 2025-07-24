export function renderContent() {
    return `
        <h2>The Velocity Update: 15x Faster, Smarter & More Efficient</h2>
        <p>This is one of the most significant infrastructure upgrades since the protocol's inception. We've completely overhauled our backend processing pipeline, resulting in a radical improvement to the contributor experience. What used to take around 30 seconds on average now completes in just <strong>~2 seconds</strong>.</p>
        
        <h3>From Minutes to Moments: A 15x Performance Gain with pgvector</h3>
        <p>The core of this speed enhancement comes from a fundamental change in how we handle data. Previously, our uniqueness engine performed similarity searches in-memory, a process that would slow down as the network grew. We've re-architected this from the ground up.</p>
        <ul>
            <li><strong>What's New:</strong> We have migrated our entire contribution embedding index to <code>pgvector</code>, a high-performance vector extension for our PostgreSQL database. This allows us to perform similarity searches at the database level with near-instantaneous results.</li>
            <li><strong>The Impact:</strong> This is more than a 15x speed-up. It's a guarantee of future performance. Contribution analysis now remains lightning-fast, ensuring that as we scale to millions of contributions, your experience will stay just as responsive. Less waiting, more contributing.</li>
        </ul>

        <h3>Smarter & More Efficient AI Valuation with Gemini Flash Lite</h3>
        <p>We're not just faster; we're smarter and more efficient. We've upgraded our valuation engine to use the new <strong>Gemini 2.5 Flash Lite</strong> model and have streamlined our entire AI analysis process.</p>
         <ul>
            <li><strong>Higher Quality Feedback:</strong> Our testing and early results show that Flash Lite provides more realistic and nuanced analysis. The AI's scoring better reflects the subtleties of real-world software development, including a more sophisticated understanding of code <strong>complexity</strong> and architectural patterns.</li>
            <li><strong>Integrated Safety Analysis:</strong> We have consolidated our safety and security checks directly into the main valuation prompt. Previously, this required a separate AI call. This change not only <strong>halves our AI API usage</strong> per contribution, drastically reducing cost and processing time, but also allows the AI to consider code safety as a core component of its overall quality assessment in a single, efficient step.</li>
        </ul>
        <p>This isn't just a maintenance update; it's a foundational upgrade that makes the Lumen Protocol faster, more intelligent, and more efficient. We're committed to building a best-in-class experience for our contributors, and this is a major step in that direction.</p>
    `;
}