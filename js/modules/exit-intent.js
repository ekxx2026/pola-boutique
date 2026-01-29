export function initExitIntent() {
    // Check if already shown
    if (localStorage.getItem('pola_exit_popup_shown') === 'true') {
        return;
    }

    let hasInteraction = false;

    // Detect user engagement first
    const markInteraction = () => { hasInteraction = true; };
    document.addEventListener('scroll', markInteraction, { once: true });
    document.addEventListener('click', markInteraction, { once: true });

    // Desktop: Mouse leaves top of window
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 10 && hasInteraction && !localStorage.getItem('pola_exit_popup_shown')) {
            showExitModal();
        }
    });

    // Mobile: Show after 30s of inactivity or scroll up (simplified for now to timer/scroll)
    // For mobile "exit intent" is hard, often done via back button or scrolling up fast
    // We'll use a simple time-based trigger for mobile if they haven't bought yet
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            if (hasInteraction && !localStorage.getItem('pola_exit_popup_shown')) {
                showExitModal();
            }
        }, 45000); // 45 seconds
    }
}

function showExitModal() {
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
    localStorage.setItem('pola_exit_popup_shown', 'true');

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
