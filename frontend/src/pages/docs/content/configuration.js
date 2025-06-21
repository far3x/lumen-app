export const renderConfiguration = () => `
    <h1 id="configuration">Customizing the CLI</h1>
    <p class="lead text-xl text-text-secondary">The Lumen CLI is designed to work perfectly out-of-the-box, but you can tailor its behavior by editing its configuration file. To open it easily, use the command <code>lum config --edit</code>.</p>

    <h2 id="config-file-location">Configuration File Location</h2>
    <p>Your settings are stored in a simple JSON file located in a hidden <code>.lum</code> directory in your user's home folder. The full path is typically <code>~/.lum/config.json</code>.</p>

    <h2 id="default-configuration">Default Configuration Explained</h2>
    <p>Here is an example of the default configuration file, with explanations for each key setting.</p>
    <div class="code-block">
        <div class="code-block-header">
             <div class="traffic-lights"><div class="traffic-light light-red"></div><div class="traffic-light light-yellow"></div><div class="traffic-light light-green"></div></div>
             <div class="flex-grow text-center text-xs">~/.lum/config.json</div>
        </div>
        <div class="code-block-content">
<pre>{
    "skipped_folders": [
        ".git",
        "__pycache__",
        "node_modules",
        "venv",
        ".venv",
        "env",
        ".env",
        "target",
        "build",
        "dist",
        "*.egg-info"
    ],
    "skipped_files": [
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "poetry.lock",
        ".DS_Store"
    ],
    "allowed_file_types": [
        ".py", ".ipynb", ".js", ".ts", ".jsx", ".tsx", ".html", ".css",
        ".scss", ".java", ".kt", ".swift", ".c", ".cpp", ".h", ".hpp",
        ".cs", ".go", ".rs", ".php", ".rb", ".pl", ".sql", ".sh", ".md",
        ".json", ".xml", ".yml", ".yaml", ".toml", ".ini", ".cfg"
    ]
}</pre>
        </div>
    </div>

    <h2 id="key-settings">Customization Options</h2>
    <ul>
        <li>
            <p><strong><code>skipped_folders</code></strong>: A list of directory names the CLI should completely ignore during analysis. This is crucial for excluding dependencies and build artifacts.</p>
            <p>This list supports two powerful matching patterns:</p>
            <ul class="!mt-2 !mb-4">
                <li><p><strong>Exact Match:</strong> A string like <code>"temp"</code> will skip any folder named exactly \`temp\`.</p></li>
                <li><p><strong>Ends-With Match:</strong> A string prefixed with <code>*</code>, like <code>"*.cache"</code>, will skip any folder whose name *ends with* <code>.cache</code> (e.g., <code>pytest.cache</code>, <code>webpack.cache</code>). This is how <code>"*.egg-info"</code> works.</p></li>
            </ul>
        </li>
        <li><p><strong><code>skipped_files</code></strong>: A list of specific file names to exclude from contribution. This is ideal for lock files, environment configurations, and other machine-specific files that don't represent your unique logic.</p></li>
        <li><p><strong><code>allowed_file_types</code></strong>: A whitelist of file extensions. The CLI will only process files with these extensions, ignoring all others (like images, videos, or compiled binaries). You can add or remove extensions to suit the specific projects you work on.</p></li>
    </ul>

    <blockquote><strong>Future-Proof Updates:</strong> Your configuration file is designed to be persistent. When the Lumen CLI is updated with new configuration options, your existing file will be intelligently merged with the new defaults, preserving your customizations while granting you access to new settings.</blockquote>
`;