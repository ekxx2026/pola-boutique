export function initExitIntent() {
    // Production Storage Key
    const STORAGE_KEY = 'pola_exit_popup_completed';

    // Check if already shown
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
        return;
    }

    let hasInteraction = false;

    // Detect user engagement
    const markInteraction = () => { hasInteraction = true; };
    document.addEventListener('scroll', markInteraction, { once: true });
    document.addEventListener('click', markInteraction, { once: true });
    document.addEventListener('keydown', markInteraction, { once: true });

    // Trigger Function
    function triggerPopup() {
        if (localStorage.getItem(STORAGE_KEY) === 'true') return;

        // Require interaction to avoid showing to immediate bouncers or bots
        if (hasInteraction) {
            showExitModal();
            localStorage.setItem(STORAGE_KEY, 'true');
        }
    }

    // 1. Desktop: Mouse Leave Strategy
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 50) triggerPopup();
    });

    // 2. Desktop: Mouse Out Strategy (Fallback)
    document.addEventListener('mouseout', (e) => {
        if (e.relatedTarget === null && e.clientY <= 50) {
            triggerPopup();
        }
    });

    // 3. Mobile: Timer Logic (Only for mobile)
    if (window.innerWidth <= 768) {
        // Show after 45 seconds of reading if they haven't bought
        setTimeout(() => {
            triggerPopup();
        }, 45000);
    }
}

function showExitModal() {
    console.log('🎁 BUILDING DOM ELEMENTS...');
    // Create Modal HTML
    const modal = document.createElement('div');
    modal.className = 'exit-intent-modal';
    modal.innerHTML = `
        <div class="exit-intent-content">
            <button class="exit-close-btn" aria-label="Cerrar">&times;</button>
            <div class="exit-image">🎁</div>
            <h3>¡No te vayas aún!</h3>
            <p>Tenemos un regalo especial para ti.</p>
            <div class="discount-box">
                <span class="discount-percent">10% OFF</span>
                <span class="discount-text">en tu primer pedido</span>
            </div>
            <p class="coupon-text">Usa el código: <strong>POLA10</strong></p>
            
            <button class="btn-claim-discount">
                <span>💬</span> Reclamar en WhatsApp
            </button>
            <button class="btn-maybe-later">No gracias, prefiero pagar precio completo</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Save state immediately
    localStorage.setItem('pola_exit_popup_v2', 'true');

    // Slight delay for animation
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });

    // Event Listeners
    const closeBtn = modal.querySelector('.exit-close-btn');
    const maybeLaterBtn = modal.querySelector('.btn-maybe-later');
    const claimBtn = modal.querySelector('.btn-claim-discount');

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 400);
    };

    closeBtn.addEventListener('click', closeModal);
    maybeLaterBtn.addEventListener('click', closeModal);

    claimBtn.addEventListener('click', () => {
        const msg = encodeURIComponent("¡Hola! Quiero reclamar mi 10% de descuento con el código POLA10 🎁");
        window.open(`https://wa.me/56962281579?text=${msg}`, '_blank');
        closeModal();
    });
}
