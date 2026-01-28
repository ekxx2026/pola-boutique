import { CONFIG } from '../config.js';

// Initialize the Data Layer
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }

export const Analytics = {
    init: () => {
        if (!CONFIG.GA_MEASUREMENT_ID || CONFIG.GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
            console.warn('Analytics: No Measurement ID provided.');
            return;
        }

        // Initialize GA4
        gtag('js', new Date());
        gtag('config', CONFIG.GA_MEASUREMENT_ID);
        console.log('Analytics Initialized:', CONFIG.GA_MEASUREMENT_ID);
    },

    trackPageView: (pagePath) => {
        if (!window.gtag) return;
        gtag('event', 'page_view', {
            page_path: pagePath,
            page_title: document.title
        });
    },

    trackViewItem: (product) => {
        if (!window.gtag) return;
        gtag('event', 'view_item', {
            currency: CONFIG.CURRENCY,
            value: product.precio,
            items: [{
                item_id: product.id,
                item_name: product.nombre,
                price: product.precio,
                item_category: product.categoria
            }]
        });
    },

    trackAddToCart: (product) => {
        if (!window.gtag) return;
        gtag('event', 'add_to_cart', {
            currency: CONFIG.CURRENCY,
            value: product.precio,
            items: [{
                item_id: product.id,
                item_name: product.nombre,
                price: product.precio,
                item_category: product.categoria
            }]
        });
    },

    trackPurchase: (cartTotal, items) => {
        if (!window.gtag) return;
        gtag('event', 'purchase', {
            transaction_id: 'WhatsApp_' + Date.now(),
            value: cartTotal,
            currency: CONFIG.CURRENCY,
            items: items.map(item => ({
                item_id: item.id,
                item_name: item.nombre,
                price: item.precio,
                quantity: 1
            }))
        });
    }
};
