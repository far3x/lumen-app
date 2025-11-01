export function renderDataExplorer() {
    return `
        <h1 id="explorer">Dashboard Guide: Data Explorer</h1>
        <p class="lead">The Data Explorer is your primary interface for discovering, analyzing, and acquiring high-quality data from the Lumen network. It's designed to give you precise control over your data sourcing pipeline.</p>
        
        <h2 id="filtering">Filtering Data</h2>
        <p>The left-hand filter panel allows you to narrow down the entire Lumen dataset to find exactly what you need. You can filter by:</p>
        <ul>
            <li><strong>Keywords in Summary:</strong> A full-text search across the AI-generated analysis summary for each contribution. This is useful for finding projects related to specific domains (e.g., "http server rust").</li>
            <li><strong>Languages:</strong> Select one or more programming languages to focus your search.</li>
            <li><strong>Token Count:</strong> Define a minimum and/or maximum token count to find projects of a specific size.</li>
            <li><strong>AI Quality Scores:</strong> Set minimum thresholds (from 0.0 to 10.0) for our three proprietary AI scores: Code Quality, Clarity, and Architecture. This is the most powerful feature for curating high-signal datasets.</li>
        </ul>

        <h2 id="previewing">Previewing Contributions</h2>
        <p>The central column displays a paginated list of contributions that match your filter criteria. Each result card shows a preview of key metadata:</p>
        <ul>
            <li><strong>Contribution ID:</strong> A unique identifier for the data asset.</li>
            <li><strong>Status:</strong> Whether the contribution is "Locked" or already "Unlocked" by your team.</li>
            <li><strong>Languages & Tokens:</strong> A summary of the technology and size.</li>
            <li><strong>Quality Score:</strong> The primary AI-driven score for a quick quality assessment.</li>
            <li><strong>Summary Snippet:</strong> The first few lines of the AI analysis summary.</li>
        </ul>
        <p>Clicking on any result card will load its full details in the right-hand panel without leaving the page.</p>
        
        <h2 id="unlocking">Unlocking & Downloading</h2>
        <p>The right-hand detail panel provides a deep dive into a selected contribution. Here you can see the full AI summary, a complete language breakdown, and a preview of the source code.</p>
        <p>If a contribution is locked, you will see an "Unlock" button displaying the token cost. Clicking this will debit the cost from your company's balance and grant your entire team perpetual access to the full source code. Once unlocked, the button will change to "Download Source," allowing you to retrieve the data at any time.</p>
    `;
}