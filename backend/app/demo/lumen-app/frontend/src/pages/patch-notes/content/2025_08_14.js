export function renderContent() {
    return `
        <h2>The Launch of Lumen Client v1.0.0: The Pre-Launch Beta is Here</h2>
        <p>Lumen has been evolving at a rapid pace as we prepare for a scalable and robust public launch. Today marks a massive milestone in that journey: the official release of the Lumen Client v1.0.0.</p>
        
        <h3>Lumen Client v1.0.0 is Live!</h3>
        <p>This is more than just a version bump; it represents the culmination of countless bug fixes, security enhancements, and performance optimizations. The client is now a stable, reliable tool for contributing to the network.</p>
        <ul>
            <li><strong>Available on PyPI:</strong> The client is now officially available for installation via <code>pip install pylumen</code>.</li>
            <li><strong>Official GitHub Repository:</strong> Our full source code, a professional README, and an issue tracker are now available at our official repository. We believe in full transparency. Find a bug or have a suggestion? Let us know here: <a href="https://github.com/far3x/lumen" target="_blank" rel="noopener noreferrer" data-external="true">https://github.com/far3x/lumen</a>.</li>
            <li><strong>Key Bug Fixes:</strong> We've resolved numerous small but critical bugs, including a complex issue with <code>.gitignore</code> parsing that sometimes caused the client to ignore more files than intended.</li>
            <li><strong>The Evolution:</strong> This release marks the client's official evolution from a simple local AI tool to a full-fledged, secure data contribution client for the Lumen Protocol.</li>
        </ul>

        <h3>Pre-Launch Beta & Simulated Rewards</h3>
        <p>The client is live, and the pre-launch beta is officially open. This is a crucial period for us to test our technology at scale and gather feedback. Please note:</p>
        <ul>
            <li><strong>Rewards are Simulated:</strong> To be perfectly clear, all rewards earned during this beta period are for <strong>testing and simulation purposes only</strong>. They are not real and will be reset before the official token launch. This phase is about showcasing our technology and ensuring its stability.</li>
            <li><strong>Beta Limits:</strong> The beta is initially open to <strong>200 users</strong>. We have implemented a security rate limit of <strong>8 requests per day</strong>, and a logical limit of <strong>3 successful contributions per day</strong> to ensure fair testing for everyone.</li>
        </ul>

        <h3>Platform Infrastructure Upgrades</h3>
        <p>To support our growth, we've made significant upgrades to our infrastructure:</p>
        <ul>
            <li><strong>New Subdomains:</strong> We have migrated our documentation and status pages to dedicated subdomains for better separation of concerns and scalability. You can now find them at <a href="https://docs.lumen.onl" target="_blank" rel="noopener noreferrer" data-external="true">docs.lumen.onl</a> and <a href="https://status.lumen.onl" target="_blank" rel="noopener noreferrer" data-external="true">status.lumen.onl</a>.</li>
            <li><strong>Major Docs Overhaul:</strong> The documentation has been completely rewritten and reorganized for clarity, accuracy, and ease of use.</li>
            <li><strong>Landing Page Rework:</strong> Parts of the landing page have received a visual rework to better communicate our vision.</li>
        </ul>

        <h3>A Commitment to Quality</h3>
        <p>We've fixed countless small bugs and polished many minor details across the entire platform. We believe that caring about the small things is what creates a great user experience, and we're committed to that principle as we move forward.</p>
        <p>We can't wait to see how you all use the client and test the limits of our system. Your participation is invaluable as we prepare for the full public launch. Thank you for being a part of this journey!</p>
    `;
}