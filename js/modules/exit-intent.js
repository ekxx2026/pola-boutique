export function initExitIntent() {
    console.log('🎁 Exit Intent Initialized (Debug Mode)');

    // Check if already shown (New key to force reset)
    if (localStorage.getItem('pola_exit_popup_v2') === 'true') {
        console.log('🎁 Popup already shown previously');
        return;
    }

    let hasInteraction = false;

    // Detect user engagement
    const markInteraction = () => {
        hasInteraction = true;
        console.log('🎁 User interaction detected');
    };
    document.addEventListener('mouseover', markInteraction, { once: true });
    document.addEventListener('scroll', markInteraction, { once: true });
    document.addEventListener('click', markInteraction, { once: true });
    document.addEventListener('keydown', markInteraction, { once: true });

    // Desktop: Mouse leaves top of window
    document.addEventListener('mouseleave', (e) => {
        // Increased sensitivity area from 10px to 50px
        if (e.clientY < 50 && !localStorage.getItem('pola_exit_popup_v2')) {
            console.log('🎁 Exit intent detected (Mouse leave)');
            showExitModal();
        }
    });

    // Mobile: Timer fallback
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            if (!localStorage.getItem('pola_exit_popup_v2')) {
                console.log('🎁 Exit intent detected (Mobile Timer)');
                showExitModal();
            }
        }, 15000); // Reduced to 15s for testing
    }
}

function showExitModal() {
    console.log('🎁 Showing Modal Now');
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
