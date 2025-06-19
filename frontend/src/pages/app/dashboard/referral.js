import { renderModal } from "./utils.js";

function handleNotifyClick() {
    const modalContent = `
        <div class="text-center">
            <p class="text-text-secondary mb-6">Confirm that you'd like to receive an email notification when the referral program is live.</p>
            <div class="flex justify-center gap-4">
                <button id="referral-cancel-btn" class="px-6 py-2 bg-primary hover:bg-subtle/80 text-text-main font-medium rounded-md transition-colors">Cancel</button>
                <button id="referral-confirm-btn" class="px-6 py-2 bg-accent-purple hover:bg-accent-purple/80 text-white font-medium rounded-md transition-colors">Confirm</button>
            </div>
        </div>
    `;

    const { modalId, closeModal } = renderModal('Get Notified', modalContent);

    document.getElementById('referral-cancel-btn')?.addEventListener('click', closeModal);
    
    document.getElementById('referral-confirm-btn')?.addEventListener('click', () => {
        const modalBody = document.getElementById(`modal-body-${modalId}`);
        if(modalBody) {
            modalBody.innerHTML = `
                <div class="text-center transition-all animate-fade-in-up">
                    <div class="w-16 h-16 mx-auto mb-4 bg-green-900/50 text-green-300 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 class="font-bold text-lg text-text-main">You're on the list!</h3>
                    <p class="text-text-secondary mt-2">We'll send you an email as soon as this feature is available. You can close this window now.</p>
                </div>
            `;
        }
    });
}

renderReferralPage.handleNotifyClick = handleNotifyClick;

export function renderReferralPage() {
    return `
        <div class="flex flex-col flex-grow items-center justify-center min-h-[60vh] bg-surface rounded-xl border border-primary text-center p-8">
            <div class="max-w-xl">
                <h1 class="text-5xl font-bold mb-4">
                    <span class="text-white">Grow the Network.</span>
                    <br>
                    <span class="gradient-text">Grow Your Rewards.</span>
                </h1>
                <p class="text-lg text-text-secondary mt-6">
                    Our referral program is under construction. Soon, you'll be able to invite fellow developers to Lumen and earn a percentage of their contribution rewards, forever.
                </p>
                <button id="notify-referral-btn" class="mt-8 px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/30 hover:brightness-110">
                    Notify Me When It's Ready
                </button>
            </div>
        </div>
    `;
}