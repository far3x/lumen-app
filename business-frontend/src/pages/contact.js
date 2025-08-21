export function renderContactPage() {
    
    const setupForm = () => {
        const form = document.getElementById('contact-form');
        const formContainer = document.getElementById('form-container');
        const successContainer = document.getElementById('success-container');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            
            submitButton.disabled = true;
            submitButton.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;

            const formData = {
                full_name: form.fullName.value,
                work_email: form.workEmail.value,
                company_name: form.companyName.value,
                job_title: form.jobTitle.value,
                contact_reason: form.contactReason.value,
                message: form.message.value
            };

            try {
                // NOTE: This assumes your main API is accessible.
                // You might need a more robust way to define the API URL.
                const response = await fetch('https://lumen.onl/api/v1/business/contact-sales', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                
                formContainer.classList.add('hidden');
                successContainer.classList.remove('hidden');

            } catch (error) {
                alert('There was an error submitting your request. Please try again later.');
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    requestAnimationFrame(setupForm);

    return `
    <div class="bg-white">
        <div class="container mx-auto px-6 py-24 md:py-32">
            <div class="max-w-4xl mx-auto text-center mb-16">
                <h1 class="text-4xl md:text-6xl font-bold text-text-headings tracking-tighter">Start the Conversation</h1>
                <p class="mt-6 text-lg md:text-xl text-text-body">Our team is ready to discuss your specific data needs, provide a tailored demo of our platform, and answer any questions you have about integrating Lumen's proprietary data into your AI workflow.</p>
            </div>

            <div class="grid lg:grid-cols-2 gap-16 items-start">
                <div class="bg-background p-8 md:p-10 rounded-lg border border-border">
                    <div id="form-container">
                        <h2 class="text-2xl font-bold text-text-headings mb-6">Get in Touch</h2>
                        <form id="contact-form" class="space-y-5">
                            <div>
                                <label for="fullName" class="block text-sm font-medium text-text-body">Full Name</label>
                                <input type="text" id="fullName" name="fullName" required class="mt-1 block w-full px-4 py-3 bg-white border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent-purple focus:border-accent-purple">
                            </div>
                             <div>
                                <label for="workEmail" class="block text-sm font-medium text-text-body">Work Email</label>
                                <input type="email" id="workEmail" name="workEmail" required class="mt-1 block w-full px-4 py-3 bg-white border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent-purple focus:border-accent-purple">
                            </div>
                             <div>
                                <label for="companyName" class="block text-sm font-medium text-text-body">Company Name</label>
                                <input type="text" id="companyName" name="companyName" required class="mt-1 block w-full px-4 py-3 bg-white border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent-purple focus:border-accent-purple">
                            </div>
                            <div>
                                <label for="jobTitle" class="block text-sm font-medium text-text-body">Job Title</label>
                                <input type="text" id="jobTitle" name="jobTitle" class="mt-1 block w-full px-4 py-3 bg-white border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent-purple focus:border-accent-purple">
                            </div>
                            <div>
                                <label for="contactReason" class="block text-sm font-medium text-text-body">Reason for Contact</label>
                                <select id="contactReason" name="contactReason" required class="mt-1 block w-full px-4 py-3 bg-white border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent-purple focus:border-accent-purple">
                                    <option>Data Acquisition & Pricing</option>
                                    <option>Partnership Inquiry</option>
                                    <option>Press & Media Inquiry</option>
                                    <option>Other</option>
                                </select>
                            </div>
                             <div>
                                <label for="message" class="block text-sm font-medium text-text-body">How can we help?</label>
                                <textarea id="message" name="message" rows="4" class="mt-1 block w-full px-4 py-3 bg-white border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent-purple focus:border-accent-purple"></textarea>
                            </div>
                            <div>
                                <button type="submit" class="w-full px-8 py-3 font-semibold text-white bg-accent-gradient rounded-md transition-all duration-300 hover:scale-105 hover:brightness-110">Submit Request</button>
                            </div>
                            <p class="text-xs text-text-muted text-center pt-2">By submitting this form, you agree to our <a href="/privacy" class="text-text-body hover:underline">Privacy Policy</a>.</p>
                        </form>
                    </div>
                    <div id="success-container" class="hidden text-center py-12">
                         <div class="w-20 h-20 mx-auto mb-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <h2 class="text-2xl font-bold text-text-headings">Thank You!</h2>
                        <p class="mt-2 text-text-body">We've received your message and will be in touch within one business day.</p>
                    </div>
                </div>
                <div class="space-y-8 pt-6">
                     <h3 class="text-2xl font-bold text-text-headings">What to Expect</h3>
                     <div class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-background rounded-lg text-text-headings border border-border">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                        <div>
                            <h4 class="font-semibold text-text-headings">A Private, Tailored Demo</h4>
                            <p class="text-text-muted">We'll schedule a call to showcase the data explorer, our API capabilities, and how our platform can meet your specific use case.</p>
                        </div>
                     </div>
                      <div class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-background rounded-lg text-text-headings border border-border">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </div>
                        <div>
                            <h4 class="font-semibold text-text-headings">Custom Dataset Consultation</h4>
                            <p class="text-text-muted">Discuss your model's needs, and we'll explain how you can curate bespoke, high-signal datasets with unparalleled precision.</p>
                        </div>
                     </div>
                      <div class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-background rounded-lg text-text-headings border border-border">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" /></svg>
                        </div>
                        <div>
                            <h4 class="font-semibold text-text-headings">Transparent Pricing & ROI Analysis</h4>
                            <p class="text-text-muted">Get clear, straightforward pricing for our Startup and Enterprise plans and discuss the tangible return on investment for your models.</p>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    </div>
    `;
}