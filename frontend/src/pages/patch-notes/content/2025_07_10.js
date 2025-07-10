export function renderContent() {
    return `
        <h2>The Clarity Update: A Full Docs Redesign & UI Polish</h2>
        <p>This update is focused on refining the user experience across the platform, headlined by a complete visual and functional redesign of our documentation. We've polished key interactions and fixed nagging bugs to make the entire site feel more professional, intuitive, and robust.</p>
        
        <h3>Complete Documentation Overhaul</h3>
        <p>Our documentation is your guide to the protocol, and it now has a design that matches its importance. The entire section has been rebuilt for a superior reading and navigation experience.</p>
        <ul>
            <li><strong>Visual Refresh:</strong> We've implemented a cleaner, more focused background gradient on the documentation & patch-notes pages, and applied the signature Lumen gradient to all main titles for a professional and consistent look.</li>
            <li><strong>GitBook-Style Navigation:</strong> 'Next' and 'Previous' buttons have been added to the bottom of every page, allowing you to read through the documentation sequentially with ease. The buttons themselves have also been redesigned for better alignment and aesthetics.</li>
            <li><strong>Smoother Page Navigation:</strong> Fixed a significant UI bug where the page would not scroll to the top when navigating. All page transitions now correctly start you at the top of the new content.</li>
            <li><strong>Responsive Patch Notes:</strong> This page is now fully responsive, with a mobile-friendly menu for easier navigation on smaller screens.</li>
        </ul>

        <h3>Key Bug Fixes & Enhancements</h3>
        <ul>
            <li><strong>Real-Time Dashboard Updates:</strong> Resolved a persistent issue where the dashboard would not always update in real-time after a contribution was processed. The underlying WebSocket connection has been hardened, so your balance and history now update instantly without a page refresh.</li>
            <li><strong>Hardened Contribution Size Guardrail:</strong> To ensure system stability and provide clearer feedback, we have hardened our existing contribution size limit. The API will now correctly return an immediate authorization failure if a payload exceeds the <strong>700,000 token limit</strong>, providing clear feedback.</li>
        </ul>
    `;
}