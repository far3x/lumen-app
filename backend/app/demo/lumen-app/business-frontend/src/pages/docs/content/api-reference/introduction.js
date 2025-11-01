export function renderApiIntro() {
    return `
        <h1 id="introduction">API Introduction</h1>
        <p class="lead">The Lumen Business API provides programmatic access to our proprietary dataset, allowing you to integrate high-quality data sourcing directly into your MLOps pipelines and automated workflows.</p>

        <h2 id="workflow">The Core Workflow</h2>
        <p>The API is designed around a professional, three-step data acquisition workflow:</p>
        <ol>
            <li><strong>Search:</strong> Use the <code>/search</code> endpoint with granular filters to discover relevant contributions. This returns a list of contribution IDs and metadata, but not the raw content. This step is free.</li>
            <li><strong>Unlock:</strong> Use the <code>/unlock/{id}</code> endpoint with a specific contribution ID to acquire it. This action consumes tokens from your balance and returns the full source code.</li>
            <li><strong>Download:</strong> Use the <code>/download/{id}</code> endpoint to retrieve the content of a contribution you have already unlocked. This action is free.</li>
        </ol>
        <p>This separation allows for efficient and cost-effective data discovery before committing to an acquisition.</p>
        
        <h2 id="rate-limits">Rate Limits</h2>
        <p>To ensure platform stability, all API endpoints are subject to rate limiting. Limits are applied per API key. If you exceed the rate limit, you will receive a <code>429 Too Many Requests</code> response. Please contact us if you have specific high-throughput requirements for an Enterprise plan.</p>
        
        <h2 id="versioning">Versioning</h2>
        <p>The API is versioned to ensure stability for your integrations. The current version is v1, and all endpoints are prefixed with <code>/api/v1/</code>. We will announce any future versions with a clear migration path.</p>
    `;
}