export function renderContent() {
    return `
        <h2>Protocol Upgrade: Beta Program, Priority Queues & Infrastructure Hardening</h2>
        <p>This is a major protocol-level update that introduces a new Beta Program to reward early adopters, significantly improves the reliability of reward claims, hardens the database infrastructure, and polishes the user experience across the site.</p>
        
        <h3>New: Genesis Contributor Program (Beta)</h3>
        <p>To bootstrap the network with high-quality data and reward our earliest supporters, we have launched the Genesis Contributor Program:</p>
        <ul>
            <li><strong>Limited Access:</strong> Access to the protocol is initially limited to the <strong>first 500 registered users</strong>. This number is configurable and will be increased as the network stabilizes.</li>
            <li><strong>Waitlist System:</strong> Users who register after the beta slots are full will be placed on a sequential waitlist and granted access in batches. They will be able to see their position in the queue upon login.</li>
            <li><strong>1,000 $LUM Genesis Bonus:</strong> As a thank you, the first 500 users who gain access will receive a <strong>1,000 $LUM bonus</strong> on top of their normal reward for their first successful contribution.</li>
        </ul>
        
        <h3>Improvement: High-Priority Reward Claims</h3>
        <p>To ensure reward claims are always processed swiftly, we've re-architected our task processing system:</p>
        <ul>
            <li><strong>Asynchronous Claims:</strong> Claiming rewards is now an asynchronous process. This means the UI will respond instantly, and the on-chain transaction will be processed in the background.</li>
            <li><strong>Priority Queue:</strong> All claim requests are now sent to a dedicated "high_priority" queue, which is served by its own set of workers. This guarantees that even if there is a large backlog of contribution analyses, your reward claims will be processed immediately.</li>
        </ul>

        <h3>Infrastructure & Reliability</h3>
        <ul>
            <li><strong>PgBouncer Integration:</strong> To prepare for large-scale use, we've integrated PgBouncer into our production database stack. This provides a connection pool that significantly improves performance and stability under heavy load, ensuring the application remains fast and responsive as our community grows.</li>
            <li><strong>Startup Stability:</strong> Resolved a series of startup race conditions between the API, workers, and database services, leading to a much more reliable and deterministic startup sequence.</li>
        </ul>

        <h3>Logic & Bug Fixes</h3>
        <ul>
            <li><strong>Corrected New User Cooldown:</strong> The new account cooldown period was previously, and incorrectly, blocking new users from making contributions. This has been fixed. The cooldown now <strong>only applies to claiming rewards</strong>, allowing new users to start contributing and earning immediately, as was always intended.</li>
            <li><strong>Refined API Rate Limiting:</strong> Cleaned up the rate-limiting logic on the contribution endpoint to eliminate noisy and misleading error logs.</li>
        </ul>

        <h3>UI & UX Enhancements</h3>
        <p>We've polished key areas of the user interface to create a more professional and seamless experience:</p>
        <ul>
            <li><strong>Waitlist Page Redesigned:</strong> The waitlist page has been completely redesigned with a clean, on-brand aesthetic that clearly communicates the user's status.</li>
            <li><strong>Seamless Login Flow:</strong> The login process for waitlisted users is now smooth, redirecting them directly to the new waitlist page without showing an error.</li>
            <li><strong>Landing Page Improvements:</strong> The "Genesis Contributor" banner has been redesigned and moved to a dedicated, more visually appealing section. The background colors and transitions between sections on the landing page have also been refined for better visual flow.</li>
        </ul>
    `;
}