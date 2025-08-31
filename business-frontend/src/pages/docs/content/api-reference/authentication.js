export function renderApiAuth() {
    const codeBlock = (language, code) => `
        <div class="code-block">
            <div class="code-block-header"><span>${language}</span></div>
            <div class="code-block-content"><pre><code>${code.trim()}</code></pre></div>
        </div>
    `;

    return `
        <h1 id="authentication">Authentication</h1>
        <p class="lead">All requests to the Lumen Business API must be authenticated using an API key.</p>

        <h2 id="generating">Generating a Key</h2>
        <p>You can generate and manage your API keys from the <a href="/app/api-keys">API Keys</a> section of your dashboard. When you generate a key, you must provide a descriptive name. The full key string will be displayed only once.</p>
        <blockquote>
            <strong>Security Note:</strong> Treat your API keys like passwords. Store them securely and never expose them in client-side code or commit them to version control.
        </blockquote>

        <h2 id="making-requests">Making Authenticated Requests</h2>
        <p>To authenticate your API requests, include your API key in the <code>Authorization</code> header using the <code>Bearer</code> scheme.</p>
        
        ${codeBlock('HTTP Header', `Authorization: Bearer lum_biz_...`)}

        <p>If your API key is missing, invalid, or revoked, you will receive a <code>401 Unauthorized</code> error response.</p>
        
        <h4>Example with cURL</h4>
        ${codeBlock('cURL', `curl -X GET "https://business.lumen.onl/api/v1/business/api/balance" \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE"`)}

        <h4>Example with Python (requests)</h4>
        ${codeBlock('Python', `import requests
import os

API_KEY = os.environ.get("LUMEN_API_KEY")
BASE_URL = "https://business.lumen.onl/api/v1/business/api"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

try:
    response = requests.get(f"{BASE_URL}/balance", headers=headers)
    response.raise_for_status()  # Raises an exception for bad status codes
    
    data = response.json()
    print(f"Company: {data['name']}")
    print(f"Token Balance: {data['token_balance']:,}")

except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")`)}

        <h4>Example with JavaScript (fetch)</h4>
        ${codeBlock('JavaScript', `const apiKey = process.env.LUMEN_API_KEY;
const baseUrl = "https://business.lumen.onl/api/v1/business/api";

const headers = {
  "Authorization": \`Bearer \${apiKey}\`
};

async function getBalance() {
  try {
    const response = await fetch(\`\${baseUrl}/balance\`, { headers });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    console.log("Company:", data.name);
    console.log("Token Balance:", data.token_balance.toLocaleString());
  } catch (error) {
    console.error("Failed to fetch balance:", error);
  }
}

getBalance();`)}
    `;
}