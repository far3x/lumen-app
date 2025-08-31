export function renderApiSearch() {
    const codeBlock = (language, code) => `
        <div class="code-block">
            <div class="code-block-header"><span>${language}</span></div>
            <div class="code-block-content"><pre><code>${code.trim()}</code></pre></div>
        </div>
    `;

    return `
        <h1 id="search">Endpoint: Search Contributions</h1>
        <p class="lead">Discover contributions using a wide range of filters. This endpoint returns metadata and is free to use.</p>
        <p><code>POST /api/v1/business/api/search</code></p>
        
        <h2 id="parameters">Request Body Parameters</h2>
        <p>The search endpoint accepts a JSON object in the request body with the following optional parameters:</p>
        <div class="overflow-x-auto"><table class="w-full">
            <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
            <tbody>
                <tr><td><code>keywords</code></td><td>string</td><td>A space-separated string of keywords to search for in the AI analysis summary.</td></tr>
                <tr><td><code>languages</code></td><td>array[string]</td><td>An array of programming languages to include (e.g., <code>["Python", "Rust"]</code>).</td></tr>
                <tr><td><code>min_tokens</code></td><td>integer</td><td>The minimum number of tokens in the contribution.</td></tr>
                <tr><td><code>max_tokens</code></td><td>integer</td><td>The maximum number of tokens in the contribution.</td></tr>
                <tr><td><code>min_clarity</code></td><td>float</td><td>Minimum clarity score (0.0 to 10.0).</td></tr>
                <tr><td><code>min_arch</code></td><td>float</td><td>Minimum architecture score (0.0 to 10.0).</td></tr>
                <tr><td><code>min_quality</code></td><td>float</td><td>Minimum code quality score (0.0 to 10.0).</td></tr>
                <tr><td><code>limit</code></td><td>integer</td><td>Number of results to return per page. Default: 20. Max: 100.</td></tr>
                <tr><td><code>skip</code></td><td>integer</td><td>Number of results to skip for pagination. Default: 0.</td></tr>
            </tbody>
        </table></div>

        <h2 id="response">Response Object</h2>
        <p>A successful request returns a JSON object with two keys: <code>total</code> (the total number of matching results) and <code>items</code> (an array of contribution preview objects).</p>
        
        <h4>Example 200 OK Response</h4>
        ${codeBlock('JSON', `{
  "items": [
    {
      "id": 1234,
      "created_at": "2025-09-01T10:00:00Z",
      "language": "Python",
      "tokens": 15200,
      "clarity_score": 9.1,
      "arch_score": 8.8,
      "quality_score": 9.5,
      "is_unlocked": false,
      "analysis_summary": "A well-architected asynchronous web scraper...",
      "files_preview": [
        {
          "path": "scraper/main.py",
          "content": "import asyncio\\nimport httpx\\n..."
        }
      ],
      "language_breakdown": { "Python": 4 }
    }
  ],
  "total": 1
}`)}
        
        <h2 id="example">Example Requests</h2>
        <h4>cURL</h4>
        ${codeBlock('cURL', `curl -X POST "https://business.lumen.onl/api/v1/business/api/search" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "languages": ["Python"],
    "min_quality": 8.5,
    "min_tokens": 10000
  }'`)}

        <h4>Python (requests)</h4>
        ${codeBlock('Python', `import requests
import json
import os

API_KEY = os.environ.get("LUMEN_API_KEY")
BASE_URL = "https://business.lumen.onl/api/v1/business/api"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

search_payload = {
    "languages": ["Python"],
    "min_quality": 8.5,
    "min_tokens": 10000
}

try:
    response = requests.post(f"{BASE_URL}/search", headers=headers, data=json.dumps(search_payload))
    response.raise_for_status()
    
    results = response.json()
    print(f"Found {results['total']} total matching contributions.")
    for item in results['items']:
        print(f"  - ID: {item['id']}, Tokens: {item['tokens']}, Quality: {item['quality_score']}")

except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")`)}

        <h4>JavaScript (fetch)</h4>
        ${codeBlock('JavaScript', `const apiKey = process.env.LUMEN_API_KEY;
const baseUrl = "https://business.lumen.onl/api/v1/business/api";

const headers = {
  "Authorization": \`Bearer \${apiKey}\`,
  "Content-Type": "application/json"
};

const searchPayload = {
    languages: ["Python"],
    min_quality: 8.5,
    min_tokens: 10000
};

async function searchData() {
  try {
    const response = await fetch(\`\${baseUrl}/search\`, { 
        method: 'POST',
        headers,
        body: JSON.stringify(searchPayload)
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const results = await response.json();
    console.log(\`Found \${results.total} total matching contributions.\`);
    results.items.forEach(item => {
        console.log(\`  - ID: \${item.id}, Tokens: \${item.tokens}, Quality: \${item.quality_score}\`);
    });
  } catch (error) {
    console.error("Failed to search data:", error);
  }
}

searchData();`)}
    `;
}