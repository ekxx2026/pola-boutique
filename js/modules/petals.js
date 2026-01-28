
export function initPetals() {
    const container = document.querySelector('.header-butterflies-container');
    if (!container) return;

    // Clear existing butterflies if any
    container.innerHTML = '';

    // Number of petals
    const PETAL_COUNT = 15; // More particles for a nice wind effect

    for (let i = 0; i < PETAL_COUNT; i++) {
        spawnPetal(container, i * 1500); // Stagger spawn
    }
}

function spawnPetal(container, delay) {
    const petal = document.createElement('div');
    petal.className = 'gold-petal';

    // Randomize properties
    const size = Math.random() * (25 - 12) + 12; // 12px to 25px
    const duration = Math.random() * (35 - 20) + 20; // 20s to 35s float time
    const startTop = Math.random() * 90 + 5; // 5% to 95% vertical start

    // Apply styles
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.top = `${startTop}%`;
    petal.style.left = '-50px';
    petal.style.setProperty('--float-duration', `${duration}s`);
    petal.style.setProperty('--delay', `${delay}ms`);

    // Physics variables
    petal.style.setProperty('--tumble-speed', `${Math.random() * 3 + 2}s`);
    petal.style.setProperty('--sway-amount', `${Math.random() * 40 + 20}px`); // 20-60px vertical sway
    petal.style.setProperty('--rotate-offset', `${Math.random() * 360}deg`);

    container.appendChild(petal);
}
