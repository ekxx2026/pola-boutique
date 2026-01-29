export function initExitIntent() {
    console.log('🎁 Exit Intent: WAITING FOR ACTION...');

    // Force reset with new key
    const STORAGE_KEY = 'pola_exit_popup_debug_v3';

    if (localStorage.getItem(STORAGE_KEY) === 'true') {
        console.log('🎁 Popup blocked by localStorage (Already shown)');
        // Forcing show anyway for this test if they requested it
        // return; 
    }

    let hasInteraction = true; // Assume interaction for testing

    // Trigger Function
    function triggerPopup(source) {
        if (localStorage.getItem(STORAGE_KEY) === 'true') return;

        console.log(`🎁 TRIGGERED BY: ${source}`);
        showExitModal();
        localStorage.setItem(STORAGE_KEY, 'true');
    }

    // 1. Mouse Leave Strategy (Standard)
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 50) triggerPopup('Mouse Leave (Top)');
    });

    // 2. Mouse Out Strategy (Fallback for older browsers/specific cases)
    document.addEventListener('mouseout', (e) => {
        if (e.relatedTarget === null && e.clientY <= 50) {
            triggerPopup('Mouse Out (Top)');
        }
    });

    // 3. FAIL-SAFE TIMER (Show after 10s no matter what)
    // Esto garantiza que el usuario vea que el popup EXISTE visualmente
    setTimeout(() => {
        triggerPopup('Fail-Safe Timer (10s)');
    }, 10000);
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
