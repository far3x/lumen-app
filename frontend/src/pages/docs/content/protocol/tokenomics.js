export const renderTokenomics = () => `
    <h1 id="tokenomics">$LUM: The Data Sourcing Token</h1>
    <p class="lead text-xl text-text-secondary">$LUM is the native utility and governance token of the Lumen Protocol. It is an SPL token operating on the Solana blockchain, specifically designed to fuel the acquisition of high-value data for training artificial intelligence.</p>

    <h2 id="core-utility">Core Utility of $LUM</h2>
    <p>The $LUM token has a clear and focused set of utilities designed to create a self-sustaining economic loop:</p>
    <ol>
        <li><strong>Data Contribution Rewards:</strong> The primary function of $LUM is to be the reward mechanism for developers who contribute their anonymized code via the Lumen CLI. The amount of $LUM rewarded is directly proportional to the value of the data contributed, as determined by the <a href="/docs/valuation">Valuation Engine</a>.</li>
        <li><strong>Data Access Payments:</strong> AI companies and researchers who wish to access the curated, high-quality datasets from the Lumen network must purchase $LUM on the open market and use it to pay for access. This creates direct, sustainable demand for the token.</li>
        <li><strong>Governance:</strong> Holding and staking $LUM will grant voting rights over the Lumen Protocol itself. This will allow the community to guide the future of the valuation engine, reward structures, data policies, and the allocation of the community treasury.</li>
    </ol>
    
    <h2 id="deployment-on-solana">Deployment on Solana</h2>
    <p>$LUM is deployed as a standard SPL token on the Solana blockchain. This strategic choice was made for several key reasons:</p>
    <ul>
        <li><strong>Low Transaction Fees:</strong> Essential for making reward claims economically viable for all contributors, regardless of the size of their reward. Solana's consistently low fees (fractions of a cent) are ideal.</li>
        <li><strong>High Throughput & Scalability:</strong> The ability to process thousands of transactions per second is critical for a protocol designed to handle millions of data contributions and reward distributions.</li>
        <li><strong>Robust DeFi Ecosystem:</strong> Launching on Solana provides immediate access to a deep and liquid ecosystem of decentralized exchanges (DEXs), making it easy for AI companies to acquire $LUM and for contributors to trade their rewards.</li>
    </ul>

    <h2 id="supply-and-emission">Total Supply & Emission Schedule</h2>
    <p>The total supply of $LUM is fixed at <strong>1,000,000,000</strong> tokens, ensuring scarcity and preventing inflation. The emission schedule is designed to aggressively reward early adopters and bootstrap the network's data liquidity.</p>
    <ul>
        <li><strong>The Genesis Program:</strong> The first <strong>500 unique developers</strong> to make a valuable contribution will receive a one-time <strong>bonus of 500 $LUM</strong>, on top of their standard reward. This program is designed to bootstrap the initial, critical mass of high-quality data.</li>
        <li><strong>Epoch-Based Rewards:</strong> The base reward rate for contributions is governed by epochs tied to the total data contributed to the network. This means contributions made today will earn significantly more $LUM than those made in the future, creating a powerful incentive to join the network early and be a foundational contributor.</li>
    </ul>
`;