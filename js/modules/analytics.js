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
        console.log('✅ Analytics Initialized:', CONFIG.GA_MEASUREMENT_ID);
    },

    trackPageView: (pagePath) => {
        if (!window.gtag) return;
        gtag('event', 'page_view', {
            page_path: pagePath,
            page_title: document.title
        });
    },

    /**
     * Track when user views a product
     * @param {Object} product - Product details
     */
    trackViewItem: (product) => {
        if (!window.gtag) return;
        gtag('event', 'view_item', {
            currency: CONFIG.CURRENCY,
            value: product.precio,
            items: [{
                item_id: product.id,
                item_name: product.nombre,
                price: product.precio,
                item_category: product.categoria,
                item_brand: CONFIG.BRAND_NAME
            }]
        });
        console.log(`📊 Analytics: view_item - ${product.nombre}`);
    },

    /**
     * Track when user adds product to cart
     * @param {Object} product - Product details
     */
    trackAddToCart: (product) => {
        if (!window.gtag) return;
        gtag('event', 'add_to_cart', {
            currency: CONFIG.CURRENCY,
            value: product.precio,
            items: [{
                item_id: product.id,
                item_name: product.nombre,
                price: product.precio,
                quantity: 1,
                item_category: product.categoria,
                item_brand: CONFIG.BRAND_NAME
            }]
        });
        console.log(`📊 Analytics: add_to_cart - ${product.nombre}`);
    },

    /**
     * Track when user removes product from cart
     * @param {Object} product - Product details
     */
    trackRemoveFromCart: (product) => {
        if (!window.gtag) return;
        gtag('event', 'remove_from_cart', {
            currency: CONFIG.CURRENCY,
            value: product.precio,
            items: [{
                item_id: product.id,
                item_name: product.nombre,
                price: product.precio,
                quantity: 1,
                item_category: product.categoria
            }]
        });
        console.log(`📊 Analytics: remove_from_cart - ${product.nombre}`);
    },

    /**
     * Track when user views cart
     * @param {Array} cartItems - Array of cart items
     * @param {Number} totalValue - Total cart value
     */
    trackViewCart: (cartItems, totalValue) => {
        if (!window.gtag) return;
        gtag('event', 'view_cart', {
            currency: CONFIG.CURRENCY,
            value: totalValue,
            items: cartItems.map(item => ({
                item_id: item.id,
                item_name: item.nombre,
                price: item.precio,
                quantity: item.cantidad || 1,
                item_category: item.categoria
            }))
        });
        console.log(`📊 Analytics: view_cart - ${cartItems.length} items, $${totalValue}`);
    },

    /**
     * Track when user initiates checkout (clicks WhatsApp button)
     * @param {Array} cartItems - Array of cart items
     * @param {Number} totalValue - Total cart value
     */
    trackBeginCheckout: (cartItems, totalValue) => {
        if (!window.gtag) return;
        gtag('event', 'begin_checkout', {
            currency: CONFIG.CURRENCY,
            value: totalValue,
            items: cartItems.map(item => ({
                item_id: item.id,
                item_name: item.nombre,
                price: item.precio,
                quantity: item.cantidad || 1,
                item_category: item.categoria
            }))
        });
        console.log(`📊 Analytics: begin_checkout - ${cartItems.length} items, $${totalValue}`);
    },

    /**
     * Track search events
     * @param {String} searchTerm - What the user searched for
     */
    trackSearch: (searchTerm) => {
        if (!window.gtag || !searchTerm) return;
        gtag('event', 'search', {
            search_term: searchTerm
        });
        console.log(`📊 Analytics: search - "${searchTerm}"`);
    },

    /**
     * Track filter/category selection
     * @param {String} filter - Selected category/filter
     */
    trackFilterChange: (filter) => {
        if (!window.gtag) return;
        gtag('event', 'view_item_list', {
            item_list_name: filter,
            item_list_id: filter.toLowerCase().replace(/\s+/g, '_')
        });
        console.log(`📊 Analytics: filter_change - ${filter}`);
    },

    /**
     * Track product clicks from catalog
     * @param {Object} product - Product that was clicked
     * @param {String} listName - Where it was clicked from (e.g., "Catalog", "Related Products")
     */
    trackSelectItem: (product, listName = 'Catalog') => {
        if (!window.gtag) return;
        gtag('event', 'select_item', {
            item_list_name: listName,
            items: [{
                item_id: product.id,
                item_name: product.nombre,
                price: product.precio,
                item_category: product.categoria
            }]
        });
    },

    /**
     * Track wishlist actions
     * @param {Object} product - Product added/removed from wishlist
     * @param {Boolean} added - True if added, false if removed
     */
    trackWishlist: (product, added) => {
        if (!window.gtag) return;
        const action = added ? 'add_to_wishlist' : 'remove_from_wishlist';
        gtag('event', action, {
            currency: CONFIG.CURRENCY,
            value: product.precio,
            items: [{
                item_id: product.id,
                item_name: product.nombre,
                price: product.precio,
                item_category: product.categoria
            }]
        });
        console.log(`📊 Analytics: ${action} - ${product.nombre}`);
    },

    /**
     * Track when user shares a product
     * @param {Object} product - Product being shared
     * @param {String} method - How it's being shared (e.g., "whatsapp", "clipboard")
     */
    trackShare: (product, method) => {
        if (!window.gtag) return;
        gtag('event', 'share', {
            method: method,
            content_type: 'product',
            item_id: product.id
        });
        console.log(`📊 Analytics: share - ${product.nombre} via ${method}`);
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
