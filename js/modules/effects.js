
/**
 * Creative Effects Module
 * Handles high-end interactions: Custom Cursor, Marquee, Text Reveal
 */

export function initEffects() {
    // initCustomCursor(); // Disabled as per user request
    initHeroReveal();
    initMarquee();
}

function initCustomCursor() {
    // Only for desktop
    if (window.matchMedia("(max-width: 991px)").matches) return;

    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    const moveCursor = (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    };

    document.addEventListener('mousemove', moveCursor);

    // Hover effect for interactive elements
    const interactiveSelectors = 'a, button, .tab, .card, .tag-pill, input, select, textarea';
    const interactiveElements = document.querySelectorAll(interactiveSelectors);

    // Delegate event listener for better performance with dynamic content
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursor.classList.add('hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursor.classList.remove('hover');
        }
    });
}

function initHeroReveal() {
    const heroTitle = document.querySelector('.brand-title');
    const heroSubtitle = document.querySelector('.eslogan');

    if (!heroTitle) return;

    // Wrap text in spans for animation if not already done
    if (!heroTitle.classList.contains('animated')) {
        const text = heroTitle.innerText;
        heroTitle.innerHTML = text.split('').map((char, index) =>
            `<span class="char-reveal" style="animation-delay: ${index * 0.03}s">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
        heroTitle.classList.add('animated');
    }

    if (heroSubtitle) {
        heroSubtitle.style.opacity = '0';
        heroSubtitle.style.animation = 'fadeInUp 1s ease forwards 0.5s';
    }
}

function initMarquee() {
    const marqueeContainer = document.querySelector('.marquee-content');
    if (!marqueeContainer) return;

    // Clone content to ensure seamless loop
    // Ensure we have enough width to scroll
    const content = marqueeContainer.innerHTML;
    marqueeContainer.innerHTML = content + content + content + content;
}
