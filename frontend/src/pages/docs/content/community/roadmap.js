export const renderRoadmap = () => `
    <h1 id="roadmap-and-vision">Roadmap & Vision</h1>
    <p class="lead text-xl text-text-secondary">Our vision is to build the definitive data layer for the next generation of AI. This document outlines our clear, phased strategy to evolve from a foundational data network into an intelligent, indispensable development ecosystem for developers and AI companies alike.</p>
    
    <div class="mt-8 space-y-12 relative border-l-2 border-primary pl-8">
        <!-- Phase 1 -->
        <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-accent-purple border-2 border-background ring-4 ring-accent-purple/30 animate-pulse"></div>
            <p class="text-sm font-bold text-accent-purple">PHASE 1: GENESIS & FOUNDATION (Q3-Q4 2025)</p>
            <h3 id="phase-one" class="text-xl font-bold mt-1">Bootstrap the Data Economy & Secure Funding</h3>
            <p class="text-text-secondary mt-1">Focus: Solidify the core product, launch the data marketplace MVP to prove the economic model, and secure initial funding for accelerated growth.</p>
            <ul class="list-none text-text-secondary mt-2 space-y-2">
                <li class="flex items-start gap-3"><span>✅</span><span class="text-green-400"><strong>Core Protocol & Valuation Engine:</strong> Developed and deployed the full backend infrastructure, including the hybrid valuation engine, asynchronous task processing, and the high-performance pgvector database for uniqueness checks.</span></li>
                <li class="flex items-start gap-3"><span>✅</span><span class="text-green-400"><strong>Contributor Dashboard & Web App:</strong> Launched the complete user-facing application, featuring secure authentication, a real-time dashboard, contribution history, and account management.</span></li>
                <li class="flex items-start gap-3"><span>✅</span><span class="text-green-400"><strong>Secure, Open-Source CLI:</strong> Released the <code>pylumen</code> command-line tool with robust local-first anonymization, secure device authorization, and a comprehensive suite of commands.</span></li>
                <li class="flex items-start gap-3"><span>▶️</span><span class="text-yellow-400"><strong>Genesis Contributor Program:</strong> Onboard the first 500 developers via the limited Beta Program to build the foundational dataset.</span></li>
                <li class="flex items-start gap-3"><span>▶️</span><span class="text-yellow-400"><strong>Data Marketplace:</strong> Launch the dedicated business portal (<code>business.lumen.onl</code>) for data consumers, featuring API key management, usage analytics, and secure access to filtered data samples.</span></li>
                <li class="flex items-start gap-3"><span>▶️</span><span class="text-yellow-400"><strong>Forge Strategic Launch Partnership:</strong> Secure a collaboration with a major ecosystem partner or established web3 platform to maximize initial user acquisition, distribution, and market trust at launch.</span></li>
                <li class="flex items-start gap-3"><span>▶️</span><span class="text-yellow-400"><strong>Whitepaper & Pitch Deck:</strong> Finalize a comprehensive whitepaper detailing the protocol's technology and tokenomics, alongside a professional pitch deck for fundraising.</span></li>
            </ul>
        </div>
        <!-- Phase 2 -->
        <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-accent-pink border-2 border-background"></div>
            <p class="text-sm font-bold text-accent-pink">PHASE 2: GROWTH & ECOSYSTEM (Q1-Q2 2026)</p>
            <h3 id="phase-two" class="text-xl font-bold mt-1">Activate the Marketplace & Scale the Organization</h3>
            <p class="text-text-secondary mt-1">Focus: Following a successful funding round, scale the team, activate both sides of the marketplace, and dramatically expand the developer toolchain.</p>
            <ul class="list-none text-text-secondary mt-2 space-y-2">
                <li class="flex items-start gap-3"><span class="text-subtle">●</span><span><strong>Team Expansion:</strong> Scale the organization from a solo founder to a dedicated team, hiring specialists in protocol development, AI research, and crypto-economics to accelerate growth.</span></li>
                <li class="flex items-start gap-3"><span class="text-subtle">●</span><span><strong>Public Token Launch ($LUM):</strong> Enable on-chain reward claims and establish initial liquidity on a decentralized exchange, completing the economic loop.</span></li>
                <li class="flex items-start gap-3"><span class="text-subtle">●</span><span><strong>Developer Ecosystem Tools:</strong> Release official SDKs (Python, TypeScript) and IDE extensions (VS Code, JetBrains) to make contributing a seamless, one-click part of the development workflow.</span></li>
                <li class="flex items-start gap-3"><span class="text-subtle">●</span><span><strong>Community Growth & Incentive Programs:</strong> Launch the official referral program, contribution bounties for specific data types, and weekly/monthly leaderboards with bonus rewards to accelerate network growth.</span></li>
                <li class="flex items-start gap-3"><span class="text-subtle">●</span><span><strong>Governance V1:</strong> Launch the Lumen Governance Forum and introduce the Lumen Improvement Proposal (LIP) framework, allowing the community to formally propose and debate changes to the protocol.</span></li>
            </ul>
        </div>
        <!-- The Future -->
        <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-accent-cyan border-2 border-background"></div>
            <p class="text-sm font-bold text-accent-cyan">PHASE 3: INTELLIGENCE & EXPANSION (H2 2026 & BEYOND)</p>
            <h3 id="the-lumen-agent" class="text-xl font-bold mt-1">The Lumen Agent: An Autonomous Software Engineer</h3>
            <p class="text-text-secondary mt-1">Focus: Leverage our unique, high-signal dataset to build a category-defining AI tool that goes beyond code completion.</p>
            <p class="text-text-secondary mt-2">The Lumen Agent is not another LLM. It is an intelligent <strong>orchestration layer</strong> that dynamically wields a cascade of powerful models (from Gemini 2.5 Flash Lite to Pro) to solve complex engineering tasks with maximum efficiency. By breaking down problems and assigning sub-tasks to the most appropriate model, it achieves an optimal balance of speed, cost, and intelligence.</p>
            <p class="text-text-secondary mt-2">This multi-model, iterative workflow allows the agent to tackle tasks with unprecedented autonomy, learning from each step and maintaining a history of its attempts to find the optimal solution.</p>
            <ul class="list-none text-text-secondary mt-2 space-y-2">
                <li class="flex items-start gap-3"><span class="text-subtle">●</span><span><strong>Automated Refactoring:</strong> Instruct the agent to "Refactor the auth service to a repository pattern." It uses Flash Lite to identify all relevant files, Flash to generate a detailed step-by-step plan, and finally Gemini 2.5 Pro to execute the plan with perfect code implementation across the entire codebase.</span></li>
                <li class="flex items-start gap-3"><span class="text-subtle">●</span><span><strong>Complex Feature Implementation:</strong> Give it a high-level task like "Add two-factor authentication." The agent plans the feature, considering component structure and UI/UX principles, then iteratively implements and refines the code until the feature is fully functional.</span></li>
                <li class="flex items-start gap-3"><span class="text-subtle">●</span><span><strong>Intelligent Debugging:</strong> Feed it an error trace. The agent forms a hypothesis, implements a potential fix with Gemini 2.5 Pro, and verifies the outcome. It uses Flash Lite to document the attempt and the result, creating a "history" of its thought process. It repeats this loop until the bug is resolved.</span></li>
                <li class="flex items-start gap-3"><span class="text-subtle">●</span><span><strong>Automated Documentation:</strong> Generate comprehensive, consistent documentation for an entire project, understanding the connections between different modules to create truly cohesive and useful developer guides.</span></li>
            </ul>
             <h3 id="expansion" class="text-xl font-bold mt-6">Expansion & Progressive Decentralization</h3>
             <ul class="list-none text-text-secondary mt-2 space-y-2">
                <li class="flex items-start gap-3"><span class="text-subtle">●</span><span><strong>New Data Verticals:</strong> Explore expansion into other high-value, proprietary data types such as legal documents, scientific research, and financial models.</span></li>
                <li class="flex items-start gap-3"><span class="text-subtle">●</span><span><strong>Full Decentralization:</strong> Progressively transfer all protocol control and treasury management to a fully on-chain, community-governed DAO, making Lumen a true piece of public infrastructure.</span></li>
            </ul>
        </div>
    </div>
`;