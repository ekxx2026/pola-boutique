// ===== APP ENTRY POINT =====
import * as Utils from './modules/utils.js';
import * as Auth from './modules/auth.js';
import * as Cart from './modules/cart.js';
import * as UI from './modules/ui.js';
import * as DB from './modules/db.js';

let state = {
    productos: [],
    filtroActual: "Todos",
    currentZoomIndex: 0,
    editingProducto: null
};

// Auto-run init
document.addEventListener('DOMContentLoaded', init);

async function init() {
    console.log("🚀 App v2.0 Modular Inicializada");

    // 1. Init UI References
    const dom = UI.initUIElements();

    // 2. Subscribe to Data
    DB.subscribeToProducts((list) => {
        state.productos = list;
        UI.renderCatalog(state.productos, state.filtroActual, Cart.addToCart, openZoom);
        UI.renderAdminList(state.productos, startEdit, deleteProduct);

        // Hide loading once data is ready (or empty)
        UI.hideLoadingScreen();
    });

    Cart.subscribeToCart(updateCartUI);

    // 3. Setup Auth
    Auth.initAuthObserver({
        onLogin: (user) => UI.toggleAdmin(true),
        onLogout: () => UI.toggleAdmin(false)
    });

    // 4. Bind Events
    UI.setupImageHandlers(); // Init image logic
    setupGlobalEvents(dom);
}


// ===== BUSINESS LOGIC HANDLERS =====

function openZoom(prod) {
    const index = state.productos.findIndex(p => p.id === prod.id);
    state.currentZoomIndex = index;
    UI.showZoomModal(prod, state.productos, index, (newIndex) => {
        state.currentZoomIndex = newIndex;
        if (state.productos[newIndex]) {
            UI.showZoomModal(state.productos[newIndex], state.productos, newIndex, openZoom);
            // Recursive hack for navigation callback, refactor later
        }
    });
}

function updateCartUI(cartItems) {
    // Update count badge
    const count = Cart.getCartCount();
    const badge = document.getElementById('carritoCount');
    if (badge) badge.textContent = count;

    // Render internals if modal is open (or just always update DOM)
    // Simplified rendering logic here or in UI module
    const list = document.getElementById('carritoItems');
    const totalEl = document.getElementById('carritoTotal');
    if (list) {
        list.innerHTML = cartItems.map(item => `
            <div class="cart-item">
                <img src="${item.imagen}" width="50">
                <div>
                    <b>${item.nombre}</b><br>
                    $${Utils.formatPrice(item.precio)} x ${item.cantidad}
                </div>
                <div class="controls">
                    <button class="btn-qty" data-id="${item.id}" data-action="minus">-</button>
                    ${item.cantidad}
                    <button class="btn-qty" data-id="${item.id}" data-action="plus">+</button>
                </div>
            </div>
        `).join('');

        // Bind dynamic buttons in cart
        list.querySelectorAll('.btn-qty').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.dataset.id); // Assuming IDs are numbers
                const act = btn.dataset.action;
                Cart.updateQuantity(id, act === 'plus' ? 1 : -1);
            };
        });
    }

    if (totalEl) totalEl.textContent = `$${Utils.formatPrice(Cart.getCartTotal())}`;
}


// ===== ADMIN LOGIC =====

function startEdit(prod) {
    state.editingProducto = prod;
    document.getElementById('productId').value = prod.id; // Sync hidden ID
    UI.fillProductForm(prod);
    document.getElementById('modoEdicion').style.display = 'block';
    document.getElementById('formButtons').style.display = 'none';
    document.getElementById('editButtons').style.display = 'flex';
    document.querySelector('.admin-form').scrollTop = 0;
}

function cancelEdit() {
    state.editingProducto = null;
    document.getElementById('productId').value = '';
    document.getElementById('productForm').reset();
    document.getElementById('modoEdicion').style.display = 'none';
    document.getElementById('formButtons').style.display = 'flex';
    document.getElementById('editButtons').style.display = 'none';

    // Reset image previews
    document.getElementById('urlImagePreview').style.display = 'none';
    document.getElementById('fileImagePreview').style.display = 'none';
    document.getElementById('urlPreviewImage').src = '';
    document.getElementById('filePreviewImage').src = '';
    document.getElementById('imageType').value = 'url';
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const btn = e.submitter || document.querySelector('#productForm button[type="submit"]'); // Fallback for submitter
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
        const type = document.getElementById('imageType').value;
        let finalImageUrl = document.getElementById('productImage').value;
        const fileInput = document.getElementById('fileInput');

        // Handle File Upload
        if (type === "file" && fileInput.files.length > 0) {
            finalImageUrl = await DB.subirImagenImgBB(fileInput.files[0]);
            console.log("✅ Imagen subida a ImgBB:", finalImageUrl);
        } else if (type === "url") {
            finalImageUrl = document.getElementById('productImageUrl').value || document.getElementById('productImage').value;
        }

        // Fallback or validation
        if (!finalImageUrl) throw new Error("Debes proporcionar una imagen (URL o Archivo)");

        const formData = {
            nombre: document.getElementById('productName').value,
            precio: parseInt(document.getElementById('productPrice').value),
            categoria: document.getElementById('productCategory').value,
            descripcion: document.getElementById('productDescription').value,
            badge: document.getElementById('productBadge').value,
            detalles: document.getElementById('productDetails').value.split('\n').filter(l => l.trim().length > 0),
            id: state.editingProducto ? state.editingProducto.id : Date.now(),
            imagen: finalImageUrl
        };

        if (state.editingProducto) {
            await DB.updateProduct(state.editingProducto.firestoreId, formData);
            alert('✅ Producto actualizado correctamente');
        } else {
            await DB.addProduct(formData);
            alert('✅ Producto creado correctamente');
        }
        cancelEdit();
    } catch (err) {
        console.error(err);
        alert("❌ Error: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

async function deleteProduct(prod) {
    if (confirm('¿Borrar ' + prod.nombre + '?')) {
        await DB.deleteProduct(prod.firestoreId);
    }
}


// ===== EVENT BINDING =====

function setupGlobalEvents(dom) {
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('instagram-tab')) return;
            if (tab.id === 'btnAdmin') {
                if (auth.currentUser) dom.adminModal.classList.add('active');
                else dom.loginModal.classList.add('active');
                return;
            }

            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.filtroActual = tab.dataset.categoria;
            UI.renderCatalog(state.productos, state.filtroActual, Cart.addToCart, openZoom);
        });
    });

    // Modals
    if (dom.carritoBtn) dom.carritoBtn.onclick = () => dom.carritoModal.classList.add('active');
    if (dom.carritoModal) dom.carritoModal.onclick = (e) => { if (e.target === dom.carritoModal) dom.carritoModal.classList.remove('active'); };
    if (dom.vaciarCarritoBtn) dom.vaciarCarritoBtn.onclick = () => Cart.clearCart();

    // Zoom Nav
    document.getElementById('prev').onclick = () => {
        let newIdx = state.currentZoomIndex - 1;
        if (newIdx < 0) newIdx = state.productos.length - 1;
        openZoom(state.productos[newIdx]);
    };
    document.getElementById('next').onclick = () => {
        let newIdx = state.currentZoomIndex + 1;
        if (newIdx >= state.productos.length) newIdx = 0;
        openZoom(state.productos[newIdx]);
    };
    document.querySelector('.close-zoom').onclick = () => UI.closeZoomModal();

    // Login
    if (dom.loginForm) dom.loginForm.onsubmit = async (e) => {
        e.preventDefault();
        try {
            await Auth.loginWithEmail(dom.adminEmail.value, dom.adminPassword.value);
            dom.loginModal.classList.remove('active');
            dom.adminModal.classList.add('active');
            dom.loginForm.reset();
        } catch (err) {
            alert(err.message);
        }
    };
    document.getElementById('cancelLogin').onclick = () => dom.loginModal.classList.remove('active');

    // Admin
    if (dom.logoutBtn) dom.logoutBtn.onclick = () => {
        Auth.logout();
        dom.adminModal.classList.remove('active');
    };
    if (dom.cancelAdmin) dom.cancelAdmin.onclick = () => dom.adminModal.classList.remove('active');
    if (dom.productForm) dom.productForm.onsubmit = handleProductSubmit;
    if (dom.cancelEdit) dom.cancelEdit.onclick = cancelEdit;
}
