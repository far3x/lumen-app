export const renderPrivacyPolicy = () => `
    <h1 id="privacy-policy">Privacy Policy</h1>
    <p class="lead text-xl text-text-secondary">Last updated: July 23, 2025</p>
    <p>This privacy notice for Lumen Protocol ("we," "us," or "our"), describes how and why we might collect, store, use, and/or share ("process") your information when you use our services ("Services"), such as when you:</p>
    <ul>
        <li>Visit our website at https://lumen.onl, or any website of ours that links to this privacy notice.</li>
        <li>Engage with us in other related ways, including any sales, marketing, or events.</li>
    </ul>
    <p>Reading this privacy notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:contact@lumen.onl" class="text-red-600 hover:underline">contact@lumen.onl</a>.</p>

    <div class="my-8 p-6 bg-white border border-gray-200 rounded-lg">
        <h3 class="font-bold text-lg text-text-main mb-4">Summary of Key Points</h3>
        <p class="text-text-secondary">This summary provides key points from our privacy notice, but you can find out more details about any of these topics by using our table of contents below to find the section you are looking for.</p>
        <ul class="list-disc list-inside mt-4 space-y-2 text-text-secondary">
            <li><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.</li>
            <li><strong>Do we process any sensitive personal information?</strong> We do not process sensitive personal information.</li>
            <li><strong>Do we receive any information from third parties?</strong> We may receive information from public databases, marketing partners, social media platforms, and other outside sources.</li>
            <li><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</li>
            <li><strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties.</li>
            <li><strong>What are your privacy rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.</li>
            <li><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</li>
        </ul>
    </div>
    
    <div class="my-8 p-6 bg-white border border-gray-200 rounded-lg">
        <h3 class="font-bold text-lg text-text-main mb-4">Table of Contents</h3>
        <ol class="list-decimal list-inside space-y-2 text-red-600">
            <li><a href="#what-info" class="hover:underline">What Information Do We Collect?</a></li>
            <li><a href="#how-info" class="hover:underline">How Do We Process Your Information?</a></li>
            <li><a href="#legal-bases" class="hover:underline">What Legal Bases Do We Rely On to Process Your Information?</a></li>
            <li><a href="#share-info" class="hover:underline">When and With Whom Do We Share Your Personal Information?</a></li>
            <li><a href="#cookies" class="hover:underline">Do We Use Cookies and Other Tracking Technologies?</a></li>
            <li><a href="#keep-info" class="hover:underline">How Long Do We Keep Your Information?</a></li>
            <li><a href="#safe-info" class="hover:underline">How Do We Keep Your Information Safe?</a></li>
            <li><a href="#minors-info" class="hover:underline">Do We Collect Information From Minors?</a></li>
            <li><a href="#rights-info" class="hover:underline">What Are Your Privacy Rights?</a></li>
            <li><a href="#dnt" class="hover:underline">Controls for Do-Not-Track Features</a></li>
            <li><a href="#california-rights" class="hover:underline">Do California Residents Have Specific Privacy Rights?</a></li>
            <li><a href="#updates-info" class="hover:underline">Do We Make Updates to This Notice?</a></li>
            <li><a href="#contact-info" class="hover:underline">How Can You Contact Us About This Notice?</a></li>
        </ol>
    </div>

    <h2 id="what-info">1. What Information Do We Collect?</h2>
    <h3>Personal Information You Disclose to Us</h3>
    <p>We collect personal information that you voluntarily provide to us. The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:</p>
    <ul>
        <li>Email addresses</li>
        <li>Usernames</li>
        <li>Passwords (stored in hashed format)</li>
        <li>Contact preferences</li>
    </ul>
    <p>We do not process sensitive information.</p>

    <h3>Information automatically collected</h3>
    <p>We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.</p>

    <h3>User-Contributed Data (Source Code)</h3>
    <p>A core function of our Services is to process source code you contribute. Our security and privacy model is designed with a "local-first" principle:</p>
    <ul>
        <li><strong>Local Anonymization:</strong> Our command-line interface (CLI) tool processes your source code <strong>on your local machine</strong> to scrub it of sensitive information (e.g., API keys, secrets, personal identifiers) before it is ever transmitted.</li>
        <li><strong>Collection of Anonymized Data:</strong> We only collect the cleaned, anonymized version of your source code. We do not collect or store your original, raw source code on our servers.</li>
    </ul>

    <h2 id="how-info">2. How Do We Process Your Information?</h2>
    <p>We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</p>

    <h2 id="legal-bases">3. What Legal Bases Do We Rely On to Process Your Information?</h2>
    <p>We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e., legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to fulfill our legitimate business interests.</p>

    <h2 id="share-info">4. When and With Whom Do We Share Your Personal Information?</h2>
    <p>We may share information in specific situations and with specific categories of third parties. The anonymized data derived from your source code contributions is aggregated into datasets. These datasets may be licensed and shared with third parties, such as AI companies and researchers, for the purpose of training artificial intelligence models. Your personal account information is never included in these datasets.</p>

    <h2 id="cookies">5. Do We Use Cookies and Other Tracking Technologies?</h2>
    <p>We may use cookies and similar tracking technologies to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.</p>

    <h2 id="keep-info">6. How Long Do We Keep Your Information?</h2>
    <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law. When you delete your account, we will delete your personal information. The anonymized data from your contributions is considered part of the permanent, historical record of the protocol and may be retained indefinitely.</p>

    <h2 id="safe-info">7. How Do We Keep Your Information Safe?</h2>
    <p>We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.</p>

    <h2 id="minors-info">8. Do We Collect Information From Minors?</h2>
    <p>We do not knowingly solicit data from or market to children under 18 years of age. By using the Services, you represent that you are at least 18.</p>

    <h2 id="rights-info">9. What Are Your Privacy Rights?</h2>
    <p>In some regions (like the EEA, UK, and California), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section "How Can You Contact Us About This Notice?" below.</p>

    <h2 id="dnt">10. Controls for Do-Not-Track Features</h2>
    <p>Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.</p>

    <h2 id="california-rights">11. Do California Residents Have Specific Privacy Rights?</h2>
    <p>Yes, if you are a resident of California, you are granted specific rights regarding access to your personal information. California Civil Code Section 1798.83, also known as the "Shine The Light" law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year.</p>

    <h2 id="updates-info">12. Do We Make Updates to This Notice?</h2>
    <p>We may update this privacy notice from time to time. The updated version will be indicated by an updated "Last updated" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.</p>

    <h2 id="contact-info">13. How Can You Contact Us About This Notice?</h2>
    <p>If you have questions or comments about this notice, you may email us at <a href="mailto:contact@lumen.onl" class="text-red-600 hover:underline">contact@lumen.onl</a>.</p>
`;