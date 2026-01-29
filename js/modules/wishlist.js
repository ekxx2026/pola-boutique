// ===== WISHLIST MODULE =====

const STORAGE_KEY = 'pola_wishlist';
let wishlist = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let listeners = [];

export function getWishlist() {
    return wishlist;
}

export function isInWishlist(productId) {
    return wishlist.includes(productId);
}

export function subscribeToWishlist(cb) {
    listeners.push(cb);
    cb(wishlist);
}

function notifyListeners() {
    listeners.forEach(cb => cb(wishlist));
}

export function toggleWishlist(productId, product = null) {
    // Ensure ID is correct type/format if needed, assuming match with product.id
    const index = wishlist.indexOf(productId);
    let added = false;

    if (index === -1) {
        wishlist.push(productId);
        added = true;
    } else {
        wishlist.splice(index, 1);
        added = false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    notifyListeners();

    // Track wishlist changes if Analytics module available and product data provided
    if (product && window.Analytics) {
        import('../modules/analytics.js').then(({ Analytics }) => {
            Analytics.trackWishlist(product, added);
        }).catch(() => { });
    }

    return added;
}

export function init() {
    // Wishlist initialization (if needed)
}
