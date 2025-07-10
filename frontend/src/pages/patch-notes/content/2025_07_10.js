export function renderContent() {
    return `
        <h2>The Clarity Update: A Full Docs Redesign & UI Polish</h2>
        <p>This update is focused on refining the user experience across the platform, headlined by a complete visual and functional redesign of our documentation and patch notes. We've polished key interactions, squashed bugs, and made significant performance improvements to the dashboard.</p>
        
        <h3>Complete Documentation & Patch Notes Redesign</h3>
        <p>Our documentation is your guide to the protocol, and it now has a design that matches its importance. The entire section, including these patch notes, has been rebuilt for a superior reading and navigation experience.</p>
        <ul>
            <li><strong>Unified Visual Refresh:</strong> The new darker, more focused background gradient and signature gradient titles have been applied across both the Documentation and Patch Notes sections for a cohesive and professional look.</li>
            <li><strong>Enhanced Navigation:</strong> We've added GitBook-style 'Previous/Next' buttons at the bottom of every documentation page, allowing you to read through the docs sequentially with ease. The buttons themselves have also been redesigned for better alignment and aesthetics.</li>
            <li><strong>Responsive Design:</strong> The Patch Notes page is now fully responsive, with a mobile-friendly menu for easier navigation on smaller screens.</li>
        </ul>

        <h3>Key Bug Fixes & Performance Enhancements</h3>
        <ul>
            <li><strong>Optimized Rank Display:</strong> We've introduced a dedicated API endpoint just for fetching the current user's rank. This eliminates unnecessary and frequent fetching of the entire leaderboard, resulting in a faster, more efficient dashboard experience and reduced backend load.</li>
            <li><strong>Corrected Leaderboard Logic:</strong> The public leaderboard will no longer display non-verified users, ensuring all ranked participants are legitimate, active members of the community.</li>
            <li><strong>Real-Time Dashboard Updates:</strong> Resolved a persistent issue where the dashboard would not always update in real-time after a contribution was processed. The underlying WebSocket connection has been hardened, so your balance and history now update instantly without a page refresh.</li>
            <li><strong>Hardened Contribution Size Guardrail:</strong> To ensure system stability and provide clearer feedback, we have hardened our existing contribution size limit and made sure it works. The API will always return an immediate authorization failure if a payload exceeds the <strong>700,000 token limit</strong>, providing clear feedback instead of a timeout.</li>
            <li><strong>Corrected Page Scroll Behavior:</strong> Fixed a significant UI bug where the page would not scroll to the top when navigating between pages. All page transitions now correctly start you at the top of the new content.</li>
        </ul>
    `;
}