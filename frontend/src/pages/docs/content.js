export const renderIntroduction = () => `
    <h1 id="introduction">Introduction to Lumen</h1>
    <p class="lead text-xl text-text-secondary">Welcome to the decentralized data backbone for the future of Artificial Intelligence. Lumen is a peer-to-peer network that creates a transparent, fair, and liquid market for high-quality, structured data—starting with source code.</p>
    
    <h2 id="the-problem">The Problem: AI's Data Scarcity Crisis</h2>
    <p>Large Language Models (LLMs) are revolutionary, but their growth is fundamentally bottlenecked by a dwindling supply of high-quality training data. The public internet has been scraped, and the most valuable, human-written logical data—source code—remains locked away in millions of private repositories. This creates a centralized system where a few corporate giants control the data pipelines, while the creators who produced that value receive nothing.</p>
    <blockquote>The AI industry is rapidly approaching a future where progress is not limited by algorithms or hardware, but by a sheer lack of new, high-quality data. Lumen was built to solve this.</blockquote>
    
    <h2 id="the-solution">The Solution: A Developer-Centric Data Economy</h2>
    <p>Lumen flips the model. Instead of scraping, we empower developers to become the primary data source for the next wave of AI. Our protocol creates a two-sided marketplace:</p>
    <ul>
        <li><strong>Contributors:</strong> Developers who use the secure Lumen CLI to anonymously contribute code from their private projects. They are rewarded with <strong>$LUM</strong> tokens, giving them a direct stake in the value they create.</li>
        <li><strong>Consumers:</strong> AI companies and researchers who purchase access to these ethically-sourced, high-signal datasets to train next-generation models.</li>
    </ul>
    <p>This creates a powerful, symbiotic ecosystem. Developers finally monetize their most valuable asset, and AI innovators get the high-quality fuel they need to push the boundaries of what's possible. Welcome to the new data economy.</p>
`;

export const renderWhyLumen = () => `
    <h1 id="why-lumen">Why Lumen?</h1>
    <p class="lead text-xl text-text-secondary">Lumen is engineered from the ground up to be the most efficient, secure, and rewarding way to participate in the AI data economy.</p>

    <h2 id="for-contributors">For Contributors & Developers</h2>
    <ul>
        <li><strong>Monetize Your Work:</strong> Your private code is immensely valuable. Lumen provides the first viable way to anonymously monetize that asset without selling your IP.</li>
        <li><strong>Effortless & Secure:</strong> Our CLI is designed for a frictionless experience. It integrates into your workflow, and all sensitive processing happens locally on your machine. Your code never leaves your device until it's been fully anonymized.</li>
        <li><strong>Shape the Future of AI:</strong> By contributing, you directly influence the quality and capabilities of future AI models, ensuring they are trained on diverse, high-quality, human-written logic.</li>
        <li><strong>True Ownership:</strong> As a contributor, you earn $LUM tokens, making you a stakeholder in the protocol you help build.</li>
    </ul>

    <h2 id="for-ai-companies">For AI Companies & Researchers</h2>
    <ul>
        <li><strong>Access to Unprecedented Data:</strong> Tap into a continuously growing ocean of high-quality, structured source code that is unavailable anywhere else.</li>
        <li><strong>Ethically Sourced & Compliant:</strong> Bypass the legal and ethical gray zones of web scraping. All data on Lumen is willingly contributed by its owners under a clear licensing framework.</li>
        <li><strong>Superior Signal-to-Noise Ratio:</strong> Unlike the noisy, often low-quality data from the public web, Lumen's datasets are pure source code, providing rich logical and structural information ideal for training sophisticated models.</li>
        <li><strong>Targeted Datasets:</strong> Acquire datasets based on specific criteria such as programming language, complexity, or paradigm, allowing for the creation of specialized, high-performing models.</li>
    </ul>
`;

export const renderInstallation = () => `
    <h1 id="installation">CLI Installation</h1>
    <p class="lead text-xl text-text-secondary">The Lumen CLI (<code>pylumen</code>) is a lightweight Python tool. Installing it is the first step to becoming a contributor.</p>

    <h2 id="prerequisites">Prerequisites</h2>
    <p>Before installing, ensure your system meets these requirements:</p>
    <ul>
        <li><strong>Python 3.8+</strong>: The core runtime for the CLI.</li>
        <li><strong>pip</strong>: Python's package installer, which is included with modern Python installations.</li>
        <li><strong>Git</strong>: Required only if you plan to contribute code from public GitHub repositories for analysis.</li>
    </ul>
    <p>You can verify your Python installation by running the following in your terminal:</p>
    <div class="code-block">
        <div class="code-block-header">
            <div class="traffic-lights"><div class="traffic-light light-red"></div><div class="traffic-light light-yellow"></div><div class="traffic-light light-green"></div></div>
            <div class="flex-grow text-center text-xs font-mono">bash</div>
        </div>
        <div class="code-block-content"><span class="command">python3 --version</span></div>
    </div>
    <blockquote><strong>Pro Tip:</strong> When installing Python on Windows, make sure to check the box that says "Add Python to PATH". This is the most common cause of installation issues.</blockquote>
    
    <h2 id="install-with-pip">Installation with pip</h2>
    <p>Open your terminal or command prompt and run the following command. This will download and install the latest version of Lumen from the Python Package Index (PyPI).</p>
    <div class="code-block">
        <div class="code-block-header">
            <div class="traffic-lights"><div class="traffic-light light-red"></div><div class="traffic-light light-yellow"></div><div class="traffic-light light-green"></div></div>
            <div class="flex-grow text-center text-xs font-mono">bash</div>
        </div>
        <div class="code-block-content"><span class="command">pip install pylumen</span></div>
    </div>
    
    <p>To upgrade to a newer version in the future, use the <code>--upgrade</code> flag:</p>
    <div class="code-block">
        <div class="code-block-header">
            <div class="traffic-lights"><div class="traffic-light light-red"></div><div class="traffic-light light-yellow"></div><div class="traffic-light light-green"></div></div>
            <div class="flex-grow text-center text-xs font-mono">bash</div>
        </div>
        <div class="code-block-content"><span class="command">pip install --upgrade pylumen</span></div>
    </div>

    <h2 id="verifying">Verifying the Installation</h2>
    <p>After a successful installation, you can verify that the <code>lum</code> command is available by checking its version:</p>
    <div class="code-block">
        <div class="code-block-header">
            <div class="traffic-lights"><div class="traffic-light light-red"></div><div class="traffic-light light-yellow"></div><div class="traffic-light light-green"></div></div>
            <div class="flex-grow text-center text-xs font-mono">bash</div>
        </div>
        <div class="code-block-content">
            <p><span class="command">lum --version</span></p>
            <p><span class="output">pylumen, version 1.0.0</span></p>
        </div>
    </div>
    <p>If you see the version number, you're all set! If you get a "command not found" error, it's likely a PATH issue. Refer to the troubleshooting section below.</p>

    <h2 id="troubleshooting">Troubleshooting</h2>
    <h3>Command 'lum' not found</h3>
    <p>This is the most common issue. It means the directory containing Python scripts isn't in your system's PATH variable, so your terminal doesn't know where to find the <code>lum</code> executable.</p>
    <ul>
        <li><strong>Solution:</strong> The best fix is often to reinstall Python, ensuring the "Add to PATH" option is enabled. Alternatively, you can find your Python scripts directory (e.g., <code>~/.local/bin</code> on Linux/macOS or <code>%APPDATA%\\Python\\PythonXX\\Scripts</code> on Windows) and add it to your PATH manually.</li>
    </ul>
`;

export const renderAuthentication = () => `
    <h1 id="authentication">Authentication</h1>
    <p class="lead text-xl text-text-secondary">Securely linking your local CLI to your Lumen Protocol account is required to earn rewards for your contributions.</p>

    <h2 id="the-login-command">The <code>login</code> Command</h2>
    <p>Lumen uses a secure, browser-based OAuth2 flow. Your credentials are never stored or seen by the CLI.</p>
    <p>To begin, run:</p>
    <div class="code-block">
        <div class="code-block-header">
            <div class="traffic-lights"><div class="traffic-light light-red"></div><div class="traffic-light light-yellow"></div><div class="traffic-light light-green"></div></div>
            <div class="flex-grow text-center text-xs font-mono">bash</div>
        </div>
        <div class="code-block-content"><span class="command">lum login</span></div>
    </div>
    
    <p>This command initiates the following process:</p>
    <ol>
        <li>Your default web browser opens to the Lumen Protocol sign-in page.</li>
        <li>You can sign in or create an account using GitHub, Google, or email.</li>
        <li>After logging in, you'll be asked to authorize the "Lumen CLI" to submit contributions on your behalf.</li>
        <li>Upon approval, a secure authentication token is sent back to the CLI.</li>
        <li>The CLI saves this token locally in a configuration file, using it for all future submissions.</li>
    </ol>
    
    <blockquote><strong>Security First:</strong> This process ensures your primary account credentials remain protected. The CLI only ever has access to a limited-scope token specifically for making contributions.</blockquote>

    <h2 id="token-storage">Token Storage Location</h2>
    <p>The authentication token is stored in a configuration file within a hidden <code>.lum</code> directory in your user's home folder. The CLI reads from this file automatically.</p>

    <h2 id="logging-out">Logging Out</h2>
    <p>If you need to switch accounts or are using a shared machine, you can log out. This will remove the stored authentication token from your local configuration.</p>
    <div class="code-block">
        <div class="code-block-header">
            <div class="traffic-lights"><div class="traffic-light light-red"></div><div class="traffic-light light-yellow"></div><div class="traffic-light light-green"></div></div>
            <div class="flex-grow text-center text-xs font-mono">bash</div>
        </div>
        <div class="code-block-content"><span class="command">lum logout</span></div>
    </div>
`;

export const renderCoreCommands = () => `
    <h1 id="core-commands">Core Commands</h1>
    <p class="lead text-xl text-text-secondary">A quick reference for the main Lumen CLI commands. For a full list of options, always use <code>lum --help</code>.</p>
    
    <div class="space-y-4 mt-8">
        <div class="bg-surface border border-primary rounded-lg">
            <div class="p-4 flex flex-col md:flex-row items-start">
                <code class="font-mono text-accent-cyan bg-primary px-2 py-1 rounded-md text-base">lum</code>
                <p class="flex-1 md:ml-6 mt-2 md:mt-1 text-text-secondary">Run from a project's root. Analyzes, anonymizes, and submits the current project.</p>
            </div>
        </div>
        <div class="bg-surface border border-primary rounded-lg">
            <div class="p-4 flex flex-col md:flex-row items-start">
                <code class="font-mono text-accent-cyan bg-primary px-2 py-1 rounded-md text-base">lum login</code>
                <p class="flex-1 md:ml-6 mt-2 md:mt-1 text-text-secondary">Initiates the browser-based authentication flow to link your CLI to your Lumen account.</p>
            </div>
        </div>
        <div class="bg-surface border border-primary rounded-lg">
            <div class="p-4 flex flex-col md:flex-row items-start">
                <code class="font-mono text-accent-cyan bg-primary px-2 py-1 rounded-md text-base">lum logout</code>
                <p class="flex-1 md:ml-6 mt-2 md:mt-1 text-text-secondary">Logs out of the current account and removes the local auth token.</p>
            </div>
        </div>
        <div class="bg-surface border border-primary rounded-lg">
            <div class="p-4 flex flex-col md:flex-row items-start">
                <code class="font-mono text-accent-cyan bg-primary px-2 py-1 rounded-md text-base">lum -c</code>
                <p class="flex-1 md:ml-6 mt-2 md:mt-1 text-text-secondary">Opens your local <code>config.json</code> file in the default text editor for customization.</p>
            </div>
        </div>
        <div class="bg-surface border border-primary rounded-lg">
            <div class="p-4 flex flex-col md:flex-row items-start">
                <code class="font-mono text-accent-cyan bg-primary px-2 py-1 rounded-md text-base">lum -r</code>
                <p class="flex-1 md:ml-6 mt-2 md:mt-1 text-text-secondary">Resets your local configuration to the latest default settings.</p>
            </div>
        </div>
        <div class="bg-surface border border-primary rounded-lg">
            <div class="p-4 flex flex-col md:flex-row items-start">
                <code class="font-mono text-accent-cyan bg-primary px-2 py-1 rounded-md text-base">lum --version</code>
                <p class="flex-1 md:ml-6 mt-2 md:mt-1 text-text-secondary">Displays the currently installed version of the CLI.</p>
            </div>
        </div>
        <div class="bg-surface border border-primary rounded-lg">
            <div class="p-4 flex flex-col md:flex-row items-start">
                <code class="font-mono text-accent-cyan bg-primary px-2 py-1 rounded-md text-base">lum --help</code>
                <p class="flex-1 md:ml-6 mt-2 md:mt-1 text-text-secondary">Shows the full help message with all available commands and options.</p>
            </div>
        </div>
    </div>
`;

export const renderContributing = () => `
    <h1 id="contributing-data">Contributing Data</h1>
    <p class="lead text-xl text-text-secondary">The core of the protocol: submitting your code is designed to be a single, frictionless command.</p>

    <h2 id="the-main-command">The Main Contribution Command</h2>
    <p>After authenticating, navigate to the root directory of any project you wish to contribute and run the <code>lum</code> command.</p>
    <div class="code-block">
        <div class="code-block-header">
            <div class="traffic-lights"><div class="traffic-light light-red"></div><div class="traffic-light light-yellow"></div><div class="traffic-light light-green"></div></div>
            <div class="flex-grow text-center text-xs font-mono">bash</div>
        </div>
        <div class="code-block-content">
            <p><span class="command">cd /path/to/my-awesome-project</span></p>
            <p><span class="command">lum</span></p>
            <p class="mt-2"><span class="output">[Lumen] Analyzing project structure...</span></p>
            <p><span class="output">[Lumen] Anonymizing sensitive data locally...</span></p>
            <p><span class="output">[Lumen] Submitting contribution to the network...</span></p>
            <p><span class="output text-green-400">✔ Contribution successful! +500 $LUM rewarded for Genesis contribution.</span></p>
        </div>
    </div>
    
    <h2 id="what-is-ignored">What Gets Ignored Automatically?</h2>
    <p>The CLI is intelligent about what it includes. By default, it will automatically ignore:</p>
    <ul>
        <li>All files and directories listed in your project's <code>.gitignore</code> file.</li>
        <li>Common dependency and build artifact directories (e.g., <code>node_modules</code>, <code>venv</code>, <code>target</code>, <code>build</code>).</li>
        <li>Binary files, images, and other non-code assets.</li>
        <li>Any custom folders or files you add to the <code>skipped_folders</code> and <code>skipped_files</code> lists in your config.</li>
    </ul>

    <h2 id="maximizing-rewards">Maximizing Your Rewards</h2>
    <p>The protocol's valuation engine is sophisticated. To maximize your <code>$LUM</code> earnings, focus on contributing code that is:</p>
    <ul>
        <li><strong>Unique:</strong> Code from private, proprietary repositories is far more valuable than public, open-source projects that are already widely indexed.</li>
        <li><strong>Complex:</strong> Projects with intricate logic, complex algorithms, and deep dependency graphs are valued more highly than simple scripts or boilerplate.</li>
        <li><strong>High-Quality:</strong> Well-structured, documented, and tested code is considered higher signal.</li>
        <li><strong>In-Demand:</strong> Code written in modern, in-demand languages (e.g., Rust, Go, TypeScript, advanced Python) may receive a premium based on market needs from data consumers.</li>
    </ul>
    <blockquote>Remember, you only earn rewards for the unique data you provide. Submitting the same project repeatedly will only reward you for the new code added since your last contribution.</blockquote>
`;

export const renderConfiguration = () => `
    <h1 id="configuration">Configuration</h1>
    <p class="lead text-xl text-text-secondary">Tailor Lumen to your exact needs by editing its configuration file. Use <code>lum -c</code> to open it easily.</p>

    <h2 id="config-file-structure">Config File Structure</h2>
    <p>Your settings are stored in <code>~/.lum/config.json</code>. Here's an example of its structure:</p>
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
        "*.egg-info",
        // ... more
    ],
    "skipped_files": [
        "package-lock.json",
        ".DS_Store"
    ],
    "allowed_file_types": [
        ".py",
        ".js",
        ".ts",
        ".java",
        // ... more
    ]
}</pre>
        </div>
    </div>

    <h2 id="key-settings">Key Settings Explained</h2>
    <ul>
        <li>
            <p><strong><code>skipped_folders</code></strong>: A list of directory names to ignore. This supports two matching patterns:</p>
            <ul class="!mt-2 !mb-4">
                <li><p><strong>Exact Match:</strong> A string like <code>"build"</code> will skip folders named exactly \`build\`.</p></li>
                <li><p><strong>Ends-With Match:</strong> A string prefixed with <code>*</code>, like <code>"*.log"</code>, will skip any folder whose name *ends with* <code>.log</code> (e.g., <code>app.log</code>, <code>server.log</code>).</p></li>
            </ul>
        </li>
        <li><p><strong><code>skipped_files</code></strong>: A list of specific file names to exclude entirely.</p></li>
        <li><p><strong><code>allowed_file_types</code></strong>: A whitelist of file extensions. The CLI will only process files with these extensions.</p></li>
    </ul>

    <blockquote>Lumen's configuration is future-proof. If new options are added in an update, your file will be intelligently updated to include them while preserving your custom settings. You can always start fresh with <code>lum -r</code>.</blockquote>
`;

export const renderSecurity = () => `
    <h1 id="security">Security</h1>
    <p class="lead text-xl text-text-secondary">Security and privacy are not features; they are the foundation of the Lumen Protocol. We understand that your code is your most sensitive asset.</p>
    
    <h2 id="security-by-design">Security by Design</h2>
    <p>Our entire system is architected around a core principle: **your source code in its original form must never leave your machine.**</p>

    <h3 id="local-first-processing">1. Local-First Processing</h3>
    <p>Every critical, privacy-sensitive operation happens locally on your computer via the open-source Lumen CLI. This includes:</p>
    <ul>
        <li>File discovery and analysis.</li>
        <li>Parsing code into Abstract Syntax Trees (ASTs).</li>
        <li>The entire multi-stage anonymization process.</li>
    </ul>
    <p>Only the final, anonymized package is ever transmitted to the network.</p>
    
    <h3 id="multi-stage-anonymization">2. Multi-Stage Anonymization</h3>
    <p>Before packaging, the CLI performs a rigorous anonymization routine:</p>
    <ul>
        <li><strong>Secret & Key Scrubbing:</strong> It uses advanced pattern matching and heuristics to find and redact API keys, passwords, tokens, and other credentials.</li>
        <li><strong>PII Removal:</strong> It actively searches for and removes personally identifiable information like names, email addresses, and IP addresses.</li>
        <li><strong>Comment Sanitization:</strong> Comments are analyzed for sensitive information and potentially scrubbed or removed.</li>
        <li><strong>Git History Exclusion:</strong> The CLI operates on the current state of your files and never touches or uploads your <code>.git</code> history.</li>
    </ul>

    <h3 id="transparency">3. Radical Transparency</h3>
    <ul>
        <li><strong>Open-Source CLI:</strong> The entire codebase for the Lumen CLI is open-source. We encourage you to inspect it, audit it, and verify its security claims for yourself.</li>
        <li><strong>Secure Authentication:</strong> We use the industry-standard OAuth2 protocol for authentication. The CLI never sees or stores your password, only a limited-scope token.</li>
    </ul>
    
    <blockquote>Your trust is our most important asset. We are committed to building a protocol where developers can contribute with absolute confidence and peace of mind.</blockquote>
`;

export const renderTokenomics = () => `
    <h1 id="tokenomics">$LUM Tokenomics</h1>
    <p class="lead text-xl text-text-secondary">The economic engine of the Lumen Protocol, designed to create a sustainable, self-reinforcing data economy.</p>

    <h2 id="core-utility">Core Utility of $LUM</h2>
    <p>The <code>$LUM</code> token is an integral part of the protocol with three primary functions:</p>
    <ol>
        <li><strong>Medium of Exchange:</strong> It is the exclusive currency for all transactions. Contributors are paid in $LUM, and data consumers pay in $LUM.</li>
        <li><strong>Governance:</strong> Holding $LUM grants voting rights on Lumen Improvement Proposals (LIPs). The community can decide on protocol upgrades, fee structures, and the allocation of ecosystem funds.</li>
        <li><strong>Staking & Security:</strong> In the future, token holders will be able to stake $LUM to help secure the network and earn a share of the protocol's revenue, creating a direct incentive to be a long-term holder.</li>
    </ol>
    
    <h2 id="supply-distribution">Total Supply & Distribution</h2>
    <p>The total supply of $LUM is fixed at <strong>1,000,000,000</strong> tokens, ensuring a non-inflationary model. The allocation is designed to prioritize the community and long-term health of the ecosystem.</p>
    <!-- Placeholder for allocation chart image or detailed table -->
    
    <h2 id="emission-schedule">Emission Schedule: Genesis & Epochs</h2>
    <p>To bootstrap the network and reward early adopters, the protocol features a special "Genesis" period for its first contributors. This is part of a larger "Epoch" system where rewards decrease over time, making early contributions the most valuable.</p>
    <ul>
        <li><strong>The Genesis Bonus:</strong> The first 500 unique contributors to the network receive a substantial, one-time bonus of <strong>500 $LUM</strong> on top of their regular contribution rewards. This is to bootstrap the critical initial dataset.</li>
        <li><strong>Epoch Halving:</strong> After the Genesis period, rewards are governed by Epochs. Each Epoch corresponds to a certain volume of data contributed. As the network matures and more data is collected, the base reward rate for new contributions decreases, similar to Bitcoin's halving.</li>
    </ul>
    <blockquote>This model heavily incentivizes early adoption. The first contributors during the Genesis period will earn tokens at the highest possible rate.</blockquote>
`;

export const renderRoadmap = () => `
    <h1 id="roadmap">Roadmap</h1>
    <p class="lead text-xl text-text-secondary">Our vision for building the world's most important data exchange is ambitious. Here's how we plan to get there.</p>
    
    <div class="mt-8 space-y-12 relative border-l-2 border-primary pl-8">
        <!-- Phase 1 -->
        <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-accent-purple border-2 border-background"></div>
            <p class="text-sm font-bold text-accent-purple">Phase 1: Foundation (COMPLETE)</p>
            <h3 class="text-xl font-bold mt-1">Protocol Launch & Contributor Onboarding</h3>
            <ul class="list-disc list-inside text-text-secondary mt-2">
                <li class="text-green-400">✅ Protocol Mainnet Launch</li>
                <li class="text-green-400">✅ Release of <code>pylumen</code> CLI v1.0</li>
                <li class="text-green-400">✅ Secure Authentication & Account System</li>
                <li class="text-green-400">✅ Genesis Contributor Program Initiated</li>
                <li class="text-green-400">✅ Core Valuation Algorithm Deployed</li>
            </ul>
        </div>
        <!-- Phase 2 -->
        <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-accent-pink border-2 border-background"></div>
            <p class="text-sm font-bold text-accent-pink">Phase 2: Expansion (IN PROGRESS)</p>
            <h3 class="text-xl font-bold mt-1">Ecosystem & Data Consumption</h3>
            <ul class="list-disc list-inside text-text-secondary mt-2">
                <li class="text-yellow-400">▶️ Launch of Initial Governance Forum</li>
                <li class="text-yellow-400">▶️ Onboarding first wave of AI company partners to consume data.</li>
                <li>Release of VS Code Extension for seamless contribution.</li>
                <li>Expansion of CLI to support more languages and data types.</li>
                <li>Public dashboard with network statistics.</li>
            </ul>
        </div>
        <!-- Phase 3 -->
        <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-accent-cyan border-2 border-background"></div>
            <p class="text-sm font-bold text-accent-cyan">Phase 3: Decentralization (UPCOMING)</p>
            <h3 class="text-xl font-bold mt-1">Staking & Community Governance</h3>
            <ul class="list-disc list-inside text-text-secondary mt-2">
                <li>Implementation of $LUM staking to secure the network and earn protocol fees.</li>
                <li>Launch of the first on-chain governance proposals (LIPs).</li>
                <li>Transition of Treasury control to a community-governed DAO.</li>
                <li>Research into Layer-2 scaling solutions for faster, cheaper transactions.</li>
                <li>Exploration of new data verticals beyond source code (e.g., scientific data, creative assets).</li>
            </ul>
        </div>
    </div>
`;

export const renderGovernance = () => `
    <h1 id="governance">Governance</h1>
    <p class="lead text-xl text-text-secondary">Lumen is designed to be a public good, governed by the people who build and use it: the $LUM token holders.</p>

    <h2 id="lumen-improvement-proposals">Lumen Improvement Proposals (LIPs)</h2>
    <p>The formal process for proposing changes and upgrades to the protocol is through Lumen Improvement Proposals (LIPs). Any community member can draft a LIP to suggest new features, changes to the fee structure, or other significant modifications.</p>
    <p>The process will generally follow these steps:</p>
    <ol>
        <li><strong>Discussion:</strong> The proposal is first discussed informally on the community governance forum.</li>
        <li><strong>Drafting:</strong> A formal LIP is drafted following a standardized template.</li>
        <li><strong>Voting:</strong> The LIP is put to an on-chain vote, where the voting power of each participant is proportional to the amount of $LUM they hold or have staked.</li>
        <li><strong>Implementation:</strong> If the vote passes, the core development team or a community grant recipient will implement the changes.</li>
    </ol>

    <h2 id="progressive-decentralization">Progressive Decentralization</h2>
    <p>Our goal is to transition full control of the protocol to a decentralized autonomous organization (DAO) over time. This is a careful, phased process to ensure the network remains stable and secure as it matures.</p>
    <blockquote>Initially, the core team will act as stewards, but as the community grows and the governance framework solidifies, more and more control will be handed over to the DAO.</blockquote>
`;

export const renderFaq = () => `
    <h1 id="faq">Frequently Asked Questions</h1>
    <p class="lead text-xl text-text-secondary">Can't find the answer you're looking for? Ask in our community channels.</p>
    
    <h2 id="faq-security">Security & Privacy</h2>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">Is contributing my code safe?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Yes. This is our highest priority. The entire anonymization process runs locally on your machine via our open-source CLI. Sensitive data like secrets, PII, and API keys are scrubbed *before* anything is ever transmitted. You can audit the code yourself for full transparency.
                </p>
            </div>
        </div>
    </details>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">Do I lose ownership of my code?</summary>
         <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Absolutely not. You retain 100% ownership and all IP rights to your original work. By contributing, you are granting the protocol a license to use the *anonymized version* of your code within its datasets. You are free to continue developing, licensing, or selling your original project as you see fit.
                </p>
            </div>
        </div>
    </details>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">Is there a risk of my code being de-anonymized?</summary>
         <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    We've designed the anonymizer to be highly robust. While no system is infallible, the risk is extremely low for well-structured code. The process removes not just explicit secrets but also contextual clues. For maximum security, we recommend contributing mature code where business logic is separated from configuration and explicit identifiers. The open-source nature of the CLI allows the community to continuously vet and improve the anonymization logic.
                </p>
            </div>
        </div>
    </details>

    <h2 id="faq-rewards">Rewards & Value</h2>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">What kind of code is most valuable?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Value is determined by uniqueness, complexity, and market demand. Novel algorithms, well-structured proprietary business logic, and projects in modern languages like Rust, Go, and TypeScript tend to earn higher rewards. The protocol values quality and novelty over sheer quantity.
                </p>
            </div>
        </div>
    </details>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">What happens if I contribute code with bugs?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Buggy code is still valuable data. AI models learn from mistakes just as much as they learn from perfect code. A bug is a valid, real-world example of code structure and logic. Your reward is based on the code's complexity and uniqueness, not its bug-free status.
                </p>
            </div>
        </div>
    </details>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">Can I contribute the same project multiple times?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Yes, and this is encouraged for active projects. However, you will only be rewarded for the new, unique code added since your last contribution (the "diff"). The protocol is designed to de-duplicate content, so submitting the exact same code repeatedly will yield zero additional rewards. We reward innovation, not repetition.
                </p>
            </div>
        </div>
    </details>

    <h2 id="faq-general">General Questions</h2>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">Can I choose which files to contribute from a project?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Absolutely. The primary way to control this is via your project's <code>.gitignore</code> file. The Lumen CLI respects this file completely. For more granular control, you can add specific files or entire folders to the <code>skipped_files</code> and <code>skipped_folders</code> arrays in your global Lumen configuration (<code>lum -c</code>).
                </p>
            </div>
        </div>
    </details>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">How is the $LUM token's value determined?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Like any market asset, the value of $LUM will be determined by supply and demand. Demand is driven by AI companies and researchers who need to purchase the token to access the high-quality data on the Lumen network. As more valuable data is contributed, the network becomes more attractive to consumers, which in turn drives demand for the token. Future mechanisms like staking and fee burning are designed to further enhance its economic utility.
                </p>
            </div>
        </div>
    </details>
`;