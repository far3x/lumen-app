export function renderContent() {
    return `
        <h2>The Velocity Update: 15x Faster Contributions & Smarter AI Valuation</h2>
        <p>This is one of the most significant infrastructure upgrades since the protocol's inception. We've completely overhauled our backend processing pipeline, resulting in a radical improvement to the contributor experience. What used to take around 30 seconds on average now completes in just <strong>~2 seconds</strong>.</p>
        
        <h3>From Minutes to Moments: A 15x Performance Gain with pgvector</h3>
        <p>The core of this speed enhancement comes from a fundamental change in how we handle data. Previously, our uniqueness engine performed similarity searches in-memory, a process that would slow down as the network grew. We've re-architected this from the ground up.</p>
        <ul>
            <li><strong>What's New:</strong> We have migrated our entire contribution embedding index to <code>pgvector</code>, a high-performance vector extension for our PostgreSQL database. This allows us to perform similarity searches at the database level with near-instantaneous results.</li>
            <li><strong>The Impact:</strong> This is more than a 15x speed-up. It's a guarantee of future performance. Contribution analysis now remains lightning-fast, ensuring that as we scale to millions of contributions, your experience will stay just as responsive. Less waiting, more contributing.</li>
        </ul>

        <h3>Smarter & More Realistic Valuation with Gemini Flash Lite</h3>
        <p>We're not just faster; we're smarter. We've upgraded our valuation engine to use the new <strong>Gemini 2.5 Flash Lite</strong> model. While our initial goal was efficiency, our testing and early results have revealed an unexpected and welcome surprise: the new model provides better feedback.</p>
         <ul>
            <li><strong>Higher Quality Feedback:</strong> We've found that Flash Lite provides more realistic, nuanced, and grounded analysis of code contributions compared to its predecessor. The summaries are more insightful and the scoring better reflects the nuances of real-world software development.</li>
            <li><strong>The Benefit to You:</strong> A smarter AI valuation engine means fairer, more accurate, and more consistent rewards for your high-quality work. It's better at recognizing true architectural quality and project originality.</li>
        </ul>
        <p>This isn't just a maintenance update; it's a foundational upgrade that makes the Lumen Protocol faster, more intelligent, and ready for hyperscale. We're committed to building a best-in-class experience for our contributors, and this is a major step in that direction.</p>
    `;
}