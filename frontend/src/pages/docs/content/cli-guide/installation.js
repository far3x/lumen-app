export const renderInstallation = () => `
    <h1 id="installation">CLI Installation Guide</h1>
    <p class="lead text-xl text-text-secondary">The Lumen CLI (<code>pylumen</code>) is your gateway to the network. It's a lightweight, open-source Python tool designed to be simple to install and use.</p>

    <h2 id="prerequisites">Prerequisites</h2>
    <p>Before installing, please ensure your system meets the following requirements:</p>
    <ul>
        <li><strong>Python 3.8 or newer</strong>: The CLI is built on Python. You can check your version by running <code>python3 --version</code> or <code>python --version</code> in your terminal.</li>
        <li><strong>pip</strong>: The package installer for Python. It's typically included with modern Python distributions.</li>
    </ul>
    
    <h2 id="install-with-pip">Standard Installation with pip</h2>
    <p>With your terminal open (and your virtual environment activated), run the following command. This fetches the latest stable version of the Lumen CLI from the Python Package Index (PyPI) and installs it.</p>
    <div class="code-block">
        <div class="code-block-header"><div class="flex-grow text-center text-xs font-mono">bash</div></div>
        <div class="code-block-content"><span class="command">pip install pylumen</span></div>
    </div>
    
    <p>To update the CLI to the latest version in the future, simply add the <code>--upgrade</code> flag:</p>
    <div class="code-block">
        <div class="code-block-header"><div class="flex-grow text-center text-xs font-mono">bash</div></div>
        <div class="code-block-content"><span class="command">pip install --upgrade pylumen</span></div>
    </div>

    <h2 id="verifying">Verifying the Installation</h2>
    <p>Once the installation is complete, verify that the <code>lum</code> command is accessible in your system's PATH by checking its version.</p>
    <div class="code-block">
        <div class="code-block-header"><div class="flex-grow text-center text-xs font-mono">bash</div></div>
        <div class="code-block-content">
            <p><span class="command">lum version</span></p>
            <p><span class="output">pylumen, version 1.0.0</span></p>
        </div>
    </div>
    <p>If you see a version number, your installation was successful! You are now ready to authenticate.</p>

    <h2 id="troubleshooting">Troubleshooting Common Issues</h2>
    <p><strong>Error: <code>command not found: lum</code></strong></p>
    <p>This is the most frequent issue and it almost always means that the directory where pip installs command-line scripts is not in your system's PATH variable.</p>
    <ul>
        <li><strong>The Quick Fix:</strong> Try running the command as a Python module: <code>python3 -m lum version</code>. If this works, you can use <code>python3 -m lum</code> as a permanent alias for <code>lum</code>.</li>
        <li><strong>The Permanent Fix (Recommended):</strong> You need to add Python's user script directory to your shell's PATH.
            <ul>
                <li>On <strong>macOS</strong>, it's often <code>~/Library/Python/3.X/bin</code>. Add <code>export PATH="$HOME/Library/Python/3.X/bin:$PATH"</code> to your <code>~/.zshrc</code> or <code>~/.bash_profile</code>.</li>
                <li>On <strong>Linux</strong>, it's typically <code>~/.local/bin</code>. Add <code>export PATH="$HOME/.local/bin:$PATH"</code> to your <code>~/.bashrc</code> or <code>~/.zshrc</code>.</li>
                <li>On <strong>Windows</strong>, during the Python installation, ensure you check the box that says "Add Python to PATH". If you missed it, you'll need to find the Scripts directory (e.g., <code>%APPDATA%\\Python\\PythonXX\\Scripts</code>) and add it to your Environment Variables manually.</li>
            </ul>
        After modifying your PATH, remember to restart your terminal or run <code>source ~/.zshrc</code>.
    </li>
    </ul>
`;