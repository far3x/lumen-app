export const renderFaq = () => `
    <h1 id="faq">Frequently Asked Questions</h1>
    <p class="lead text-xl text-text-secondary">Your questions, answered. If you don't find what you're looking for, feel free to use the feedback button in the footer to contact us.</p>
    
    <h2 id="faq-general">Fundamental Questions</h2>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">What is Lumen in simple terms?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Lumen is a platform that pays developers with crypto tokens ($LUM) for contributing their code. This code is then safely anonymized and used to create high-quality datasets for training better Artificial Intelligence models. It's a way for you to turn your private coding projects into a valuable, reward-earning asset.
                </p>
            </div>
        </div>
    </details>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">How do I contribute my code?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <div class="text-text-secondary px-6 pb-6">
                    <p>The process is designed to be simple and fit into your existing workflow:</p>
                    <ol class="!my-4 list-decimal list-inside space-y-2">
                        <li><strong>Install the CLI:</strong> Open your terminal and run <code>pip install pylumen</code>.</li>
                        <li><strong>Log In:</strong> Link the tool to your account with <code>lum login</code>. This will open your browser for secure authentication.</li>
                        <li><strong>Contribute:</strong> Navigate to your project's root folder in the terminal and run <code>lum contribute</code>.</li>
                    </ol>
                    <p class="!mt-4">That's it! The CLI handles the rest.</p>
                </div>
            </div>
        </div>
    </details>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">What is the Genesis Contributor Program?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    To bootstrap the network and reward our earliest supporters, the protocol is in a limited beta phase. The first 500 developers to make a successful contribution will receive an exclusive, one-time reward of <strong>1,000 $LUM</strong>. Users who register after the beta is full are placed on a waitlist and will be granted access in batches.
                </p>
            </div>
        </div>
    </details>

    <h2 id="faq-rewards">Rewards & Value</h2>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">How does $LUM get its value?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                   The value of $LUM is directly tied to the value of the data on the network. AI companies and researchers must purchase $LUM from the open market (e.g., a decentralized exchange) to pay for access to datasets. This creates a constant buy pressure. As the protocol's data becomes more valuable and sought-after, the demand for $LUM increases, which in turn increases its market value and the value of rewards for contributors.
                </p>
            </div>
        </div>
    </details>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">What kind of code is most valuable?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Value is determined by <strong>uniqueness and complexity</strong>, not a specific programming language. A proprietary, closed-source project with complex algorithms will be valued far more highly than a simple to-do list app from a public tutorial. The ideal contribution is a project you've built for a specific, niche purpose that isn't already available on GitHub.
                </p>
            </div>
        </div>
    </details>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">Can I contribute the same project multiple times?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Yes, and this is encouraged for actively developed projects. The protocol's valuation engine is intelligent; it identifies your submission as an update and rewards you based on the <strong>new value you've added (the "diff")</strong>. You cannot earn rewards by repeatedly submitting the same unchanged code. We reward innovation, not repetition.
                </p>
            </div>
        </div>
    </details>

    <h2 id="faq-security">Security & Privacy</h2>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">What exactly happens to my data when I contribute?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    The entire process is designed for security. First, the Lumen CLI runs <strong>on your own computer</strong> to scan and remove sensitive information like API keys, passwords, and personal details. Only this clean, anonymized version of your code is sent to our servers. It is then added to our high-quality datasets that AI companies can purchase access to for training their models. Your original, raw code never leaves your machine.
                </p>
            </div>
        </div>
    </details>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">Do I lose ownership of my code when I contribute?</summary>
         <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    <strong>Absolutely not.</strong> You retain 100% ownership and all intellectual property rights to your original work. By contributing, you are granting the Lumen Protocol a non-exclusive license to use the <em>anonymized, transformed version</em> of your code within its datasets. You are free to continue developing, licensing, or selling your original project in any way you see fit.
                </p>
            </div>
        </div>
    </details>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">Can I choose which files to contribute from a project?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Yes. You have full control. The primary method is your project's <code>.gitignore</code> file, which the Lumen CLI respects completely. For more granular control, you can add specific files or entire folders to the <code>skipped_files</code> and <code>skipped_folders</code> arrays in your global Lumen configuration file (accessible via <code>lum config --edit</code>).
                </p>
            </div>
        </div>
    </details>
`;