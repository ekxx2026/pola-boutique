export function initPetals() {
    const container = document.querySelector('.header-butterflies-container');
    if (!container) return;

    container.innerHTML = '';

    // Mantenemos una buena densidad
    const BUTTERFLY_COUNT = 18;

    // Lista de mariposas disponibles
    const butterflyAssets = [
        'img/butterfly-animation-22.gif',
        'img/butterfly-animation-11.gif'
    ];

    for (let i = 0; i < BUTTERFLY_COUNT; i++) {
        // Generamos propiedades iniciales únicas para cada "individuo"
        const props = {
            // Tamaño reducido según la solicitud (antes 70-180, ahora 45-110)
            size: Math.random() * (110 - 45) + 45,
            top: Math.random() * 80 + 10,
            duration: Math.random() * (22 - 14) + 14,
            // Asignamos un tipo de mariposa aleatorio que será persistente
            asset: butterflyAssets[Math.floor(Math.random() * butterflyAssets.length)]
        };

        spawnHeroButterfly(container, props, Math.random() * 15000);
    }
}

/**
 * Crea una mariposa con propiedades persistentes para que parezca la misma al repetir
 */
function spawnHeroButterfly(container, props, delay = 0) {
    const wrapper = document.createElement('div');
    wrapper.className = 'butterfly-wrapper';

    const img = document.createElement('img');
    img.src = props.asset; // Usamos el activo asignado
    img.className = 'butterfly-img';

    wrapper.style.width = `${props.size}px`;
    wrapper.style.top = `${props.top}%`;
    wrapper.style.setProperty('--vuelo-duration', `${props.duration}s`);

    wrapper.appendChild(img);

    if (delay > 0) {
        wrapper.style.visibility = 'hidden';
        setTimeout(() => {
            if (container.contains(wrapper)) {
                wrapper.style.visibility = 'visible';
                animate(wrapper, container, props);
            }
        }, delay);
    } else {
        animate(wrapper, container, props);
    }

    container.appendChild(wrapper);
}

function animate(el, container, props) {
    el.style.animation = `vueloHorizontal var(--vuelo-duration) linear forwards`;

    const lifeTime = parseFloat(props.duration) * 1000;

    // Relevo anticipado (500ms) para fluidez total
    setTimeout(() => {
        if (container.contains(el)) {
            spawnHeroButterfly(container, props, 0);
        }
    }, lifeTime - 500);

    // Borrado al terminar
    setTimeout(() => {
        if (container.contains(el)) {
            el.remove();
        }
    }, lifeTime);
}
