// ===== CART MODULE =====

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let listeners = []; // Para notificar a la UI cuando cambie el carrito

export function getCart() {
    return carrito;
}

function saveCart() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    notifyListeners();
}

export function subscribeToCart(callback) {
    listeners.push(callback);
    callback(carrito); // Notificar valor inicial
}

function notifyListeners() {
    listeners.forEach(cb => cb(carrito));
}

export function addToCart(producto) {
    const itemExistente = carrito.find(item => item.id === producto.id);

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1,
            precio: producto.precio,
            nombre: producto.nombre,
            imagen: producto.imagen
        });
    }

    // === Analytics Tracking ===
    if (typeof gtag !== 'undefined') {
        gtag('event', 'add_to_cart', {
            currency: 'CLP',
            value: producto.precio,
            items: [{
                item_id: producto.id,
                item_name: producto.nombre,
                price: producto.precio,
                quantity: 1
            }]
        });
    }
    if (typeof fbq !== 'undefined') {
        fbq('track', 'AddToCart', {
            content_name: producto.nombre,
            content_ids: [producto.id],
            content_type: 'product',
            value: producto.precio,
            currency: 'CLP'
        });
    }

    // === Cinematic Effect: Gold Confetti ===
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#F4E4A6', '#FFFFFF'] // Gold & White
        });
    }

    saveCart();
}

export function updateQuantity(id, change) {
    const index = carrito.findIndex(item => item.id === id);
    if (index !== -1) {
        if (change > 0) {
            carrito[index].cantidad += 1;
        } else {
            if (carrito[index].cantidad > 1) {
                carrito[index].cantidad -= 1;
            } else {
                carrito.splice(index, 1);
            }
        }
        saveCart();
    }
}

export function clearCart() {
    carrito = [];
    saveCart();
}

export function getCartTotal() {
    return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
}

export function getCartCount() {
    return carrito.reduce((sum, item) => sum + item.cantidad, 0);
}

// === CRO: WHATSAPP OPTIMIZADO (Fase 3.2) ===
export function generarEnlaceWhatsApp() {
    const productos = getCart();
    const WHATSAPP_NUMERO = '56962281579';

    if (productos.length === 0) return null;

    let mensaje = "¡Hola Pola Galleani! ✨✨\n\n";
    mensaje += "Me encantaría realizar un pedido de los siguientes productos:\n\n";

    productos.forEach(p => {
        const subtotal = p.precio * p.cantidad;
        mensaje += `🛍️ *${p.nombre}*\n`;
        mensaje += `   Cantidad: ${p.cantidad}\n`;
        mensaje += `   Precio unitario: $${p.precio.toLocaleString('es-CL')}\n`;
        mensaje += `   Subtotal: $${subtotal.toLocaleString('es-CL')}\n\n`;
    });

    const total = getCartTotal();
    mensaje += `--------------------------\n`;
    mensaje += `💰 *TOTAL A PAGAR: $${total.toLocaleString('es-CL')} CLP*\n`;
    mensaje += `--------------------------\n\n`;
    mensaje += `📍 *Link de la tienda:* ${window.location.origin}\n`;
    mensaje += "✨ ¿Me podrías confirmar disponibilidad y el proceso de pago?\n\n";
    mensaje += "¡Muchas gracias!";

    // Analytics (Begin Checkout)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'begin_checkout', {
            currency: 'CLP',
            value: total,
            items: productos.map(p => ({
                item_id: p.id,
                item_name: p.nombre,
                quantity: p.cantidad
            }))
        });
    }

    const encoded = encodeURIComponent(mensaje);
    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encoded}`;
}

