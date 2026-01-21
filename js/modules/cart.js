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
            // Guardamos solo lo necesario
            precio: producto.precio,
            nombre: producto.nombre,
            imagen: producto.imagen
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
