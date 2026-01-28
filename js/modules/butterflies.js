
export function initButterflies() {
    const container = document.querySelector('.header-butterflies-container');
    if (!container) return;

    // Number of butterflies to spawn
    const BUTTERFLY_COUNT = 8;

    for (let i = 0; i < BUTTERFLY_COUNT; i++) {
        spawnButterfly(container, i * 2500); // Stagger spawn time
    }
}

function spawnButterfly(container, delay) {
    const butterfly = document.createElement('div');
    butterfly.className = 'living-butterfly';

    // Create wings
    const leftWing = document.createElement('div');
    leftWing.className = 'wing left-wing';
    const rightWing = document.createElement('div');
    rightWing.className = 'wing right-wing';

    butterfly.appendChild(leftWing);
    butterfly.appendChild(rightWing);

    // Randomize properties
    const size = Math.random() * (40 - 20) + 20; // 20px to 40px base size
    const duration = Math.random() * (25 - 15) + 15; // 15s to 25s flight
    const startY = Math.random() * 80 + 10; // 10% to 90% vertical start

    // Apply styles
    butterfly.style.width = `${size}px`;
    butterfly.style.height = `${size}px`;
    butterfly.style.top = `${startY}%`;
    butterfly.style.left = '-100px';
    butterfly.style.setProperty('--flight-duration', `${duration}s`);
    butterfly.style.setProperty('--flap-speed', `${Math.random() * 0.2 + 0.15}s`);
    butterfly.style.setProperty('--delay', `${delay}ms`);

    container.appendChild(butterfly);
}
