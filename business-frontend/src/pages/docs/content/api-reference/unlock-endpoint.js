export function renderApiUnlock() {
    const codeBlock = (language, code) => `
        <div class="code-block">
            <div class="code-block-header"><span>${language}</span></div>
            <div class="code-block-content"><pre><code>${code.trim()}</code></pre></div>
        </div>
    `;

    return `
        <h1 id="unlock">Endpoint: Unlock Contribution</h1>
        <p class="lead">Acquire the full source code of a specific contribution. This action consumes tokens from your balance.</p>
        <p><code>POST /api/v1/business/api/unlock/{contribution_id}</code></p>
        
        <h2 id="response">Response Object</h2>
        <p>A successful request returns a JSON object containing the full, raw content of the contribution.</p>
        
        <h4>Example 200 OK Response</h4>
        ${codeBlock('JSON', `{
  "id": 1234,
  "created_at": "2025-09-01T10:00:00Z",
  "raw_content": "---lum--new--file--scraper/main.py\\nimport asyncio\\n..."
}`)}
        
        <h2 id="errors">Error Handling</h2>
        <ul>
            <li><strong><code>401 Unauthorized</code>:</strong> Your API key is invalid or missing.</li>
            <li><strong><code>402 Payment Required</code>:</strong> Your company's token balance is insufficient to unlock this contribution.</li>
            <li><strong><code>404 Not Found</code>:</strong> A contribution with the specified ID does not exist.</li>
        </ul>
        
        <h2 id="example">Example Requests</h2>
        <h4>cURL</h4>
        ${codeBlock('cURL', `curl -X POST "https://business.lumen.onl/api/v1/business/api/unlock/1234" \\
  -H "Authorization: Bearer YOUR_API_KEY"`)}

        <h4>Python (requests)</h4>
        ${codeBlock('Python', `import requests
import os

API_KEY = os.environ.get("LUMEN_API_KEY")
BASE_URL = "https://business.lumen.onl/api/v1/business/api"
CONTRIBUTION_ID = 1234

headers = {"Authorization": f"Bearer {API_KEY}"}

try:
    response = requests.post(f"{BASE_URL}/unlock/{CONTRIBUTION_ID}", headers=headers)
    response.raise_for_status()
    
    contribution_data = response.json()
    print(f"Successfully unlocked Contribution #{contribution_data['id']}")
    # print(contribution_data['raw_content']) # Uncomment to print the full code
    
except requests.exceptions.HTTPError as e:
    if e.response.status_code == 402:
        print("Error: Insufficient token balance to unlock this contribution.")
    else:
        print(f"An HTTP error occurred: {e}")
except requests.exceptions.RequestException as e:
    print(f"A network error occurred: {e}")`)}

        <h4>JavaScript (fetch)</h4>
        ${codeBlock('JavaScript', `const apiKey = process.env.LUMEN_API_KEY;
const baseUrl = "https://business.lumen.onl/api/v1/business/api";
const contributionId = 1234;

const headers = {"Authorization": \`Bearer \${apiKey}\`};

async function unlockContribution() {
  try {
    const response = await fetch(\`\${baseUrl}/unlock/\${contributionId}\`, { 
        method: 'POST',
        headers
    });

    if (response.status === 402) {
      console.error("Error: Insufficient token balance to unlock this contribution.");
      return;
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || \`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    console.log(\`Successfully unlocked Contribution #\${data.id}\`);
    // console.log(data.raw_content); // Uncomment to log the full code
  } catch (error) {
    console.error("Failed to unlock contribution:", error);
  }
}

unlockContribution();`)}
    `;
}