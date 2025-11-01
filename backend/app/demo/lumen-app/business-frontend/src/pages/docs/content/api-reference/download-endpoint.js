export function renderApiDownload() {
    const codeBlock = (language, code) => `
        <div class="code-block">
            <div class="code-block-header"><span>${language}</span></div>
            <div class="code-block-content"><pre><code>${code.trim()}</code></pre></div>
        </div>
    `;

    return `
        <h1 id="download">Endpoint: Download Unlocked Contribution</h1>
        <p class="lead">Download the raw content of a contribution that your organization has already unlocked. This action does not consume tokens.</p>
        <p><code>GET /api/v1/business/api/download/{contribution_id}</code></p>
        
        <h2 id="response">Response</h2>
        <p>A successful request returns a <code>.zip</code> file containing a single text file (e.g., <code>contribution_1234.txt</code>) with the raw source code.</p>
        
        <h2 id="example">Example Requests</h2>
        <p>Use the <code>-O</code> or <code>--remote-name</code> flag with cURL to save the file with its original name from the server.</p>
        <h4>cURL</h4>
        ${codeBlock('cURL', `curl "https://business.lumen.onl/api/v1/business/api/download/1234" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  --remote-name`)}
        
        <h4>Python (requests)</h4>
        ${codeBlock('Python', `import requests
import os

API_KEY = os.environ.get("LUMEN_API_KEY")
BASE_URL = "https://business.lumen.onl/api/v1/business/api"
CONTRIBUTION_ID = 1234

headers = {"Authorization": f"Bearer {API_KEY}"}
output_filename = f"lumen_contribution_{CONTRIBUTION_ID}.zip"

try:
    with requests.get(f"{BASE_URL}/download/{CONTRIBUTION_ID}", headers=headers, stream=True) as r:
        r.raise_for_status()
        with open(output_filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192): 
                f.write(chunk)
    print(f"Successfully downloaded to {output_filename}")

except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")`)}

        <h4>JavaScript (Node.js)</h4>
        ${codeBlock('JavaScript', `const fs = require('fs');
const path = require('path');
const https = require('https');

const apiKey = process.env.LUMEN_API_KEY;
const contributionId = 1234;
const url = \`https://business.lumen.onl/api/v1/business/api/download/\${contributionId}\`;
const outputPath = path.join(__dirname, \`lumen_contribution_\${contributionId}.zip\`);

const options = {
    headers: { 'Authorization': \`Bearer \${apiKey}\` }
};

const file = fs.createWriteStream(outputPath);

https.get(url, options, (response) => {
    if (response.statusCode !== 200) {
        console.error(\`Request failed with status code \${response.statusCode}\`);
        return;
    }
    response.pipe(file);

    file.on('finish', () => {
        file.close();
        console.log(\`Download completed: \${outputPath}\`);
    });
}).on('error', (err) => {
    fs.unlink(outputPath, () => {}); // Delete the file on error
    console.error('Error downloading file:', err.message);
});`)}
    `;
}