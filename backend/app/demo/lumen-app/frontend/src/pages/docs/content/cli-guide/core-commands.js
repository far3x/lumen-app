export const renderCoreCommands = () => `
    <h1 id="core-commands">Core CLI Commands</h1>
    <p class="lead text-xl text-text-secondary">This is a quick reference for the main Lumen CLI commands. For a comprehensive list of all options and subcommands, always use <code>lum --help</code>.</p>
    
    <h2 id="network-commands">Network Commands</h2>
    <p>These commands interact directly with the Lumen Protocol network and require you to be logged in.</p>
    <div class="space-y-4 mt-8">
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-red-600 text-base">lum contribute</code>
            <p class="mt-1 text-text-secondary">The primary command. Run from a project's root directory. The CLI will automatically analyze, anonymize, and submit the current project to the network for valuation and rewards.</p>
        </div>
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-red-600 text-base">lum login</code>
            <p class="mt-1 text-text-secondary">Initiates the secure, browser-based device authorization flow to link your CLI to your Lumen Protocol account.</p>
        </div>
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-red-600 text-base">lum history</code>
            <p class="mt-1 text-text-secondary">Displays the status of your last 10 contributions, including their ID, status, and final reward amount.</p>
        </div>
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-red-600 text-base">lum logout</code>
            <p class="mt-1 text-text-secondary">Logs out of the current account and securely removes the local authentication token from your machine.</p>
        </div>
    </div>
    
    <h2 id="local-generation">Local Prompt Generation</h2>
    <p>These commands are for generating prompts for use with local or third-party LLMs. <strong>These commands do not send any data to the Lumen network.</strong></p>
    <div class="space-y-4 mt-8">
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-red-600 text-base">lum local [path]</code>
            <p class="mt-1 text-text-secondary">Analyzes a local directory and copies a complete, structured prompt to your clipboard. If no path is provided, it uses the current directory.</p>
        </div>
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-red-600 text-base">lum local -g <URL></code>
            <p class="mt-1 text-text-secondary">Analyzes a public GitHub repository. The CLI will clone the repository to a temporary directory, generate the prompt, and then clean up the cloned files.</p>
        </div>
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-red-600 text-base">lum local -t <filename></code>
            <p class="mt-1 text-text-secondary">Instead of copying to the clipboard, this saves the generated prompt to a text file (e.g., <code>lum local -t my_prompt</code> saves to <code>my_prompt.txt</code>).</p>
        </div>
         <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-red-600 text-base">lum local -l [number]</code>
            <p class="mt-1 text-text-secondary">Displays a leaderboard of the most token-heavy files in the project, helping you understand your project's structure. Defaults to the top 20 files.</p>
        </div>
    </div>

    <h2 id="configuration">Configuration</h2>
    <div class="space-y-4 mt-8">
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-red-600 text-base">lum config --edit</code>
            <p class="mt-1 text-text-secondary">Opens your local <code>config.json</code> file in your system's default text editor, allowing you to customize ignored files and folders.</p>
        </div>
         <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-red-600 text-base">lum config --reset</code>
            <p class="mt-1 text-text-secondary">Resets your local configuration to the latest default settings. This is useful if you want to start fresh after a CLI update.</p>
        </div>
    </div>
`;