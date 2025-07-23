export const renderRoadmap = () => `
    <h1 id="roadmap">Protocol Roadmap</h1>
    <p class="lead text-xl text-text-secondary">Our vision is ambitious: to build the core data layer for the next generation of AI. This is a multi-year journey, executed in distinct phases. Here is our public roadmap.</p>
    
    <div class="mt-8 space-y-12 relative border-l-2 border-primary pl-8">
        <!-- Phase 1 -->
        <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-accent-purple border-2 border-background ring-4 ring-accent-purple/30 animate-pulse"></div>
            <p class="text-sm font-bold text-accent-purple">PHASE 1: FOUNDATION (Q3-Q4 2024)</p>
            <h3 class="text-xl font-bold mt-1">Protocol Launch & Contributor Onboarding</h3>
            <p class="text-text-secondary mt-1">Focus: Build the core product, prove the model, and bootstrap the supply-side of the network.</p>
            <ul class="list-disc list-inside text-text-secondary mt-2">
                <li class="text-green-400">✅ Protocol Mainnet Launch</li>
                <li class="text-green-400">✅ Release of <code>pylumen</code> CLI v1.0 with local-first anonymization.</li>
                <li class="text-green-400">✅ Secure device-flow authentication and account system.</li>
                <li class="text-green-400">✅ Launch of the Genesis Contributor Program to reward early adopters.</li>
                <li class="text-yellow-400">▶️ Initial $LUM Token Generation Event (TGE) and DEX Listing.</li>
                <li>Onboarding the first 1,000 developers and securing the first 10,000 contributions.</li>
            </ul>
        </div>
        <!-- Phase 2 -->
        <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-accent-pink border-2 border-background"></div>
            <p class="text-sm font-bold text-accent-pink">PHASE 2: MARKETPLACE (Q1-Q2 2025)</p>
            <h3 class="text-xl font-bold mt-1">Data Consumption & Ecosystem Tools</h3>
            <p class="text-text-secondary mt-1">Focus: Activate the demand-side of the network and enhance the developer experience.</p>
            <ul class="list-disc list-inside text-text-secondary mt-2">
                <li>Launch of the Data Marketplace v1, allowing partners to purchase datasets with $LUM.</li>
                <li>Onboard the first wave of AI company partners and researchers as data consumers.</li>
                <li>Release official VS Code and JetBrains extensions for one-click contributions.</li>
                <li>Launch of the initial Lumen Governance Forum for community discussions.</li>
                <li>Expand the valuation engine to support new languages and data types.</li>
            </ul>
        </div>
        <!-- Phase 3 -->
        <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-accent-cyan border-2 border-background"></div>
            <p class="text-sm font-bold text-accent-cyan">PHASE 3: DECENTRALIZATION (Q3-Q4 2025)</p>
            <h3 class="text-xl font-bold mt-1">Staking & Community Governance</h3>
            <p class="text-text-secondary mt-1">Focus: Transition core protocol functions to the community and establish long-term economic sustainability.</p>
            <ul class="list-disc list-inside text-text-secondary mt-2">
                <li>Implementation of $LUM staking for network security and revenue sharing.</li>
                <li>Launch of the first on-chain governance proposals (LIPs) via the Lumen DAO.</li>
                <li>Transition of Treasury control to a community-governed multi-sig.</li>
                <li>Research and development into Layer-2 scaling solutions for faster, cheaper transactions.</li>
                <li>Exploration of new data verticals beyond source code, such as scientific research, financial models, and creative assets.</li>
            </ul>
        </div>
    </div>
`;