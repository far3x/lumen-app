export const renderCoreCommands = () => `
    <h1 id="core-commands">Core CLI Commands</h1>
    <p class="lead text-xl text-text-secondary">This is a quick reference for the main Lumen CLI commands. For a comprehensive list of all options and subcommands, always use <code>lum --help</code>.</p>
    
    <h2 id="primary-commands">Primary Commands</h2>
    <div class="space-y-4 mt-8">
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-accent-cyan text-base">lum contribute</code>
            <p class="mt-1 text-text-secondary">The primary command. Run from a project's root directory. The CLI will automatically analyze, anonymize, and submit the current project for valuation. This is the command you will use most often.</p>
        </div>
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-accent-cyan text-base">lum login</code>
            <p class="mt-1 text-text-secondary">Initiates the secure, browser-based device authorization flow to link your CLI to your Lumen Protocol account.</p>
        </div>
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-accent-cyan text-base">lum logout</code>
            <p class="mt-1 text-text-secondary">Logs out of the current account and securely removes the local authentication token from your machine.</p>
        </div>
    </div>
    
    <h2 id="utility-commands">Utility & Configuration Commands</h2>
    <div class="space-y-4 mt-8">
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-accent-cyan text-base">lum config --edit</code>
            <p class="mt-1 text-text-secondary">Opens your local <code>config.json</code> file in your system's default text editor, allowing you to customize ignored files, folders, and other settings.</p>
        </div>
         <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-accent-cyan text-base">lum config --show</code>
            <p class="mt-1 text-text-secondary">Prints the contents of your current configuration file directly to the terminal.</p>
        </div>
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-accent-cyan text-base">lum config --reset</code>
            <p class="mt-1 text-text-secondary">Resets your local configuration to the latest default settings. This is useful if you've made an error in your config or want to start fresh after a CLI update.</p>
        </div>
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-accent-cyan text-base">lum --version</code>
            <p class="mt-1 text-text-secondary">Displays the currently installed version of the Lumen CLI.</p>
        </div>
        <div class="bg-surface border border-primary rounded-lg p-4">
            <code class="font-mono text-accent-cyan text-base">lum --help</code>
            <p class="mt-1 text-text-secondary">Shows the full help message with all available commands, options, and flags.</p>
        </div>
    </div>

    <h2 id="common-workflows">Common Workflows</h2>
    <h3>Contributing a New Project:</h3>
<pre class="code-block"><code class="language-bash">
# Navigate to your project directory
cd /path/to/my-new-project

# Log in (if it's your first time)
lum login

# Contribute the project
lum contribute
</code></pre>

    <h3>Contributing Updates to an Existing Project:</h3>
<pre class="code-block"><code class="language-bash">
# Navigate to your project directory
cd /path/to/my-existing-project

# No need to log in again

# Contribute the latest changes
lum contribute
</code></pre>
`;