export function renderApiBalance() {
    const codeBlock = (language, code) => `
        <div class="code-block">
            <div class="code-block-header"><span>${language}</span></div>
            <div class="code-block-content"><pre><code>${code.trim()}</code></pre></div>
        </div>
    `;

    return `
        <h1 id="balance">Endpoint: Check Balance</h1>
        <p class="lead">Retrieve your company's current token balance and plan details.</p>
        <p><code>GET /api/v1/business/api/balance</code></p>
        
        <h2 id="response">Response Object</h2>
        <p>A successful request returns a JSON object with your company's details.</p>
        
        <h4>Example 200 OK Response</h4>
        ${codeBlock('JSON', `{
  "id": 1,
  "name": "Acme Research",
  "plan": "startup",
  "token_balance": 74850000,
  "company_size": "51-200",
  "industry": "AI Research"
}`)}
        
        <h2 id="example">Example Requests</h2>
        <h4>cURL</h4>
        ${codeBlock('cURL', `curl -X GET "https://business.lumen.onl/api/v1/business/api/balance" \\
  -H "Authorization: Bearer YOUR_API_KEY"`)}

        <h4>Python (requests)</h4>
        ${codeBlock('Python', `import requests
import os

API_KEY = os.environ.get("LUMEN_API_KEY")
BASE_URL = "https://business.lumen.onl/api/v1/business/api"

headers = {"Authorization": f"Bearer {API_KEY}"}

try:
    response = requests.get(f"{BASE_URL}/balance", headers=headers)
    response.raise_for_status()
    data = response.json()
    print(f"Company '{data['name']}' on plan '{data['plan']}' has {data['token_balance']:,} tokens.")
except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")`)}

        <h4>JavaScript (fetch)</h4>
        ${codeBlock('JavaScript', `const apiKey = process.env.LUMEN_API_KEY;
const baseUrl = "https://business.lumen.onl/api/v1/business/api";

const headers = {"Authorization": \`Bearer \${apiKey}\`};

async function getBalance() {
  try {
    const response = await fetch(\`\${baseUrl}/balance\`, { headers });
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    console.log(\`Company '\${data.name}' on plan '\${data.plan}' has \${data.token_balance.toLocaleString()} tokens.\`);
  } catch (error) {
    console.error("Failed to fetch balance:", error);
  }
}

getBalance();`)}
    `;
}