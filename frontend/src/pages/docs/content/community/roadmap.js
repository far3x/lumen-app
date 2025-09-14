export const renderRoadmap = () => `
    <h1 id="roadmap-and-vision">Roadmap & Vision</h1>
    <p class="lead text-xl text-text-secondary">Our vision is to build the definitive data layer for the next generation of AI. This document outlines our clear, phased strategy to evolve from a foundational data network into an intelligent, indispensable development ecosystem for developers and AI companies alike.</p>
    
    <div class="mt-12 space-y-16">
        <div class="relative pl-12">
            <div class="absolute left-4 top-1 h-full w-0.5 bg-gray-200 -translate-x-1/2" aria-hidden="true"></div>
            <div class="absolute left-4 top-1 w-4 h-4 rounded-full bg-red-600 border-2 border-background ring-4 ring-red-600/30 -translate-x-1/2"></div>
            
            <p class="text-sm font-bold text-red-600">PHASE 1: LAUNCH & MARKET VALIDATION (COMPLETE)</p>
            <h3 id="phase-one" class="text-xl font-bold mt-1">Bootstrap the Data Economy & Prove the Model</h3>
            <p class="text-text-secondary mt-1">Focus: Execute a rapid launch, validate both the supply (developer contributions) and demand (AI company interest) sides of the marketplace, and secure pre-seed funding to accelerate growth.</p>
            <ul class="list-none text-text-secondary mt-2 space-y-2">
                <li class="flex items-start gap-3"><span class="text-green-700">✅</span><span class="text-green-700"><strong>Core Protocol & Valuation Engine:</strong> Developed and deployed the full backend infrastructure, including the hybrid valuation engine, asynchronous task processing, and the high-performance pgvector database for uniqueness checks.</span></li>
                <li class="flex items-start gap-3"><span class="text-green-700">✅</span><span class="text-green-700"><strong>Contributor Dashboard & Web App:</strong> Launched the complete user-facing application, featuring secure authentication, a real-time dashboard, contribution history, and account management.</span></li>
                <li class="flex items-start gap-3"><span class="text-green-700">✅</span><span class="text-green-700"><strong>Secure, Open-Source CLI:</strong> Released the <code>pylumen</code> command-line tool with robust local-first anonymization, secure device authorization, and a comprehensive suite of commands.</span></li>
                <li class="flex items-start gap-3"><span class="text-green-700">✅</span><span class="text-green-700"><strong>Secure Strategic Launch Partnership:</strong> Formalize our partnership with Heaven to ensure a successful launch, immediate distribution, and a high-quality initial supply of contributions.</span></li>
                <li class="flex items-start gap-3"><span class="text-green-700">✅</span><span class="text-green-700"><strong>Whitepaper & Pitch Deck:</strong> Finalize a comprehensive whitepaper detailing the protocol's technology and business model, alongside a professional pitch deck for fundraising.</span></li>
                <li class="flex items-start gap-3"><span class="text-green-700">✅</span><span class="text-green-700"><strong>Genesis Contributor Program:</strong> Onboard the first 200 developers via the limited Beta Program to build the foundational dataset.</span></li>
                <li class="flex items-start gap-3"><span class="text-green-700">✅</span><span class="text-green-700"><strong>Establish Initial Reward Stakes:</strong> Finalize the on-chain reward mechanism. All contributions made during the Genesis Phase will be recorded, securing your stake and reward multiplier for when the public token launch is activated.</span></li>
            </ul>
        </div>
        
        <div class="relative pl-12">
            <div class="absolute left-4 top-1 h-full w-0.5 bg-gray-200 -translate-x-1/2" aria-hidden="true"></div>
            <div class="absolute left-4 top-1 w-4 h-4 rounded-full bg-red-600 border-2 border-background ring-4 ring-red-600/30 animate-pulse -translate-x-1/2"></div>

            <p class="text-sm font-bold text-red-600">PHASE 2: SCALE & ECOSYSTEM GROWTH (CURRENT FOCUS)</p>
            <h3 id="phase-two" class="text-xl font-bold mt-1">Activate the Marketplace & Expand the Toolchain</h3>
            <p class="text-text-secondary mt-1">Focus: With the core protocol validated, we are now scaling our commercial operations, expanding the team, and enhancing the developer toolchain.</p>
            <ul class="list-none text-text-secondary mt-2 space-y-2">
                <li class="flex items-start gap-3"><span class="text-green-700">✅</span><span class="text-green-700"><strong>Launch Data Marketplace (business.lumen.onl):</strong> Go live with the commercial data portal, allowing enterprise clients to access data via secure APIs and generate the first wave of protocol revenue.</span></li>
                <li class="flex items-start gap-3"><span class="text-green-700">✅</span><span class="text-green-700"><strong>Algorithm V2 & Infrastructure Upgrade:</strong> Deployed a more intelligent and scalable valuation engine. This major upgrade introduces open-source code detection to allow for fair, adjusted rewards, a more sophisticated logarithmic uniqueness calculation, and an auto-retry mechanism for AI analysis, preparing the protocol to scale beyond the initial beta phase.</span></li>
                <li class="flex items-start gap-3"><span class="text-amber-700">▶️</span><span class="text-amber-700"><strong>Secure Seed Funding via Starseed:</strong> In partnership with the Heaven launchpad, we are initiating our first formal funding round through their Starseed program to secure the capital needed for aggressive scaling.</span></li>
                <li class="flex items-start gap-3"><span class="text-amber-700">▶️</span><span class="text-amber-700"><strong>Secure First Data Partnerships:</strong> Convert our pipeline of interested AI companies into our first signed Letters of Intent (LOIs), providing concrete validation of market demand for our proprietary data.</span></li>
                <li class="flex items-start gap-3"><span class="text-gray-400">●</span><span><strong>Team Expansion:</strong> Scale the organization from a founder-led project to a dedicated team, hiring key personnel in Engineering, Business Development, and Marketing.</span></li>
                <li class="flex items-start gap-3"><span class="text-gray-400">●</span><span><strong>Developer Ecosystem Tools:</strong> Release official SDKs (Python, TypeScript) and IDE extensions (VS Code, JetBrains) to make contributing a seamless, one-click part of the development workflow.</span></li>
                <li class="flex items-start gap-3"><span class="text-gray-400">●</span><span><strong>Community Growth & Incentive Programs:</strong> Launch the official referral program, contribution bounties for specific data types, and weekly/monthly leaderboards with bonus rewards to accelerate network growth.</span></li>
                <li class="flex items-start gap-3"><span class="text-gray-400">●</span><span><strong>Governance V1:</strong> Launch the Lumen Governance Forum and introduce the Lumen Improvement Proposal (LIP) framework, empowering the community to shape the future of the protocol.</span></li>
            </ul>
        </div>
        
        <div class="relative pl-12">
            <div class="absolute left-4 top-1 w-4 h-4 rounded-full bg-red-600 border-2 border-background ring-4 ring-red-600/30 -translate-x-1/2"></div>
            
            <p class="text-sm font-bold text-red-600">PHASE 3: INTELLIGENCE & DECENTRALIZATION (LONG-TERM VISION)</p>
            <h3 id="the-lumen-agent" class="text-xl font-bold mt-1">The Lumen Agent: An Autonomous Software Engineer</h3>
            <p class="text-text-secondary mt-1">Focus: Leverage our unique dataset to build a category-defining AI tool that goes beyond code completion, while progressively handing over protocol control to the community.</p>
            <p class="text-text-secondary mt-2">The Lumen Agent will not be a monolithic model. It will be an intelligent <strong>orchestration layer</strong> that dynamically utilizes a cascade of powerful, specialized AI models (from efficient ones like Gemini Flash to powerful ones like Gemini Pro). By breaking down complex engineering tasks and assigning sub-tasks to the most appropriate model, it will achieve an optimal balance of speed, cost, and intelligence. This allows the agent to tackle tasks like automated refactoring, complex feature implementation, and intelligent debugging with unprecedented autonomy.</p>
             <ul class="list-none text-text-secondary mt-2 space-y-2">
                <li class="flex items-start gap-3"><span class="text-gray-400">●</span><span><strong>New Data Verticals:</strong> Explore expansion into other high-value, proprietary data types such as legal documents, scientific research, and financial models.</span></li>
                <li class="flex items-start gap-3"><span class="text-gray-400">●</span><span><strong>Progressive Decentralization:</strong> Transfer all protocol control and treasury management to a fully on-chain, community-governed DAO, cementing Lumen as a true piece of public infrastructure.</span></li>
            </ul>
        </div>
    </div>
`;