export const renderFaq = () => `
    <h1 id="faq">Frequently Asked Questions</h1>
    <p class="lead text-xl text-text-secondary">Your questions, answered. If you don't find what you're looking for, join our community channels to ask the team directly.</p>
    
    <h2 id="faq-security">Security & Privacy</h2>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">How can I be sure my secrets and IP are safe?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    This is our single most important security guarantee. The entire anonymization pipeline runs <strong>locally on your machine</strong> via our open-source CLI. Your raw code is never transmitted. We scrub secrets, API keys, and PII before anything is packaged for submission. The CLI itself is open-source, so you or anyone else can audit its behavior at any time to verify our claims.
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
        <summary class="flex items-center justify-between font-bold p-6">Is there a risk of my code being de-anonymized?</summary>
         <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    We've designed the anonymizer to be highly robust, removing not just explicit secrets but also contextual clues. While no system can claim to be 100% infallible against a highly motivated state-level actor, the risk is extremely low for any typical proprietary codebase. For maximum security, we recommend contributing mature code where business logic is well-separated from configuration and explicit user identifiers. The open-source nature of the CLI allows the community to continuously vet and improve the anonymization logic over time.
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
                    Value is determined primarily by <strong>uniqueness and complexity</strong>. A proprietary, closed-source project with complex algorithms will be valued far more highly than a simple public to-do list app. The ideal contribution is a project you've built for a specific, niche purpose that isn't already available on GitHub.
                </p>
            </div>
        </div>
    </details>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">Can I contribute the same project multiple times?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Yes, and this is encouraged for actively developed projects. However, the protocol's valuation engine is intelligent. It identifies your submission as an update and rewards you based on the <strong>new value you've added (the "diff")</strong>. You cannot earn rewards by repeatedly submitting the same unchanged code. We reward innovation, not repetition.
                </p>
            </div>
        </div>
    </details>

    <h2 id="faq-general">General Questions</h2>
    <details class="group bg-surface border border-subtle/50 rounded-lg cursor-pointer my-4">
        <summary class="flex items-center justify-between font-bold p-6">Why did you choose the Solana blockchain?</summary>
        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div class="overflow-hidden">
                <p class="text-text-secondary px-6 pb-6">
                    Our choice of Solana was deliberate and strategic. A data protocol that issues potentially thousands of micro-rewards per day requires a network with extremely high throughput and near-zero transaction costs. Solana's performance ensures that reward claims are fast and affordable for every contributor, regardless of the size of their reward. This makes the entire economic model feasible and user-friendly.
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
`;