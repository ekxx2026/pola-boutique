// ===== APP ENTRY POINT =====
import * as Utils from './modules/utils.js';
import * as Auth from './modules/auth.js';
import * as Cart from './modules/cart.js';
import * as UI from './modules/ui.js';
import * as DB from './modules/db.js';
import * as Wishlist from './modules/wishlist.js';

let state = {
    productos: [],
    filtroActual: "Todos",
    currentZoomIndex: 0,
    editingProducto: null
};

let activeFocusTrap = null;

// Auto-run init
document.addEventListener('DOMContentLoaded', init);

async function init() {
    console.log("🚀 App v2.0 Modular Inicializada");

    // 1. Init UI References
    const dom = UI.initUIElements();

    // 2. Subscribe to Data
    // 2. Subscribe to Data
    const renderApp = () => {
        UI.renderCatalog(
            state.productos,
            state.filtroActual,
            (prod) => { Cart.addToCart(prod); UI.showToast(`Añadido: ${prod.nombre}`, 'success'); },
            openZoom,
            Wishlist.toggleWishlist,
            Wishlist.getWishlist()
        );
    };

    DB.subscribeToProducts((list) => {
        state.productos = list;
        renderApp();
        UI.renderAdminList(state.productos, startEdit, deleteProduct);
        checkHash();
    });

    Wishlist.subscribeToWishlist(() => renderApp());

    Cart.subscribeToCart(updateCartUI);

    // 3. Setup Auth
    Auth.initAuthObserver({
        onLogin: (user) => UI.toggleAdmin(true),
        onLogout: () => UI.toggleAdmin(false)
    });

    UI.setupImageHandlers();
    setupGlobalEvents(dom);

    if (dom.header) {
        window.addEventListener('scroll', () => {
            dom.header.classList.toggle('scrolled', window.scrollY > 100);
        });
    }

    initSalesToast();
    initInstagramFeed();

    // 5. Routing
    window.addEventListener('hashchange', checkHash);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            UI.closeZoomModal();
            if (dom.carritoModal) dom.carritoModal.classList.remove('active');
            if (dom.adminModal) dom.adminModal.classList.remove('active');
            if (dom.loginModal) dom.loginModal.classList.remove('active');
            history.pushState(null, null, ' ');
            releaseFocusTrap();
        }
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js?v=10').catch(() => {});
        });
    }
}


// ===== BUSINESS LOGIC HANDLERS =====

function checkHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#product/')) {
        const parts = hash.split('/');
        const id = parseInt(parts[1]);
        if (!isNaN(id)) {
            const prod = state.productos.find(p => p.id === id);
            if (prod) openZoom(prod, false); // false = don't push state again
        }
    } else {
        UI.closeZoomModal();
    }
}

function openZoom(prod, updateHistory = true) {
    const index = state.productos.findIndex(p => p.id === prod.id);
    state.currentZoomIndex = index;

    // Update URL logic
    if (updateHistory) {
        const slug = Utils.slugify(prod.nombre);
        const newHash = `#product/${prod.id}/${slug}`;
        if (window.location.hash !== newHash) {
            history.pushState(null, null, newHash);
        }
    }

    UI.showZoomModal(
        prod,
        state.productos,
        index,
        (newIndex) => {
            state.currentZoomIndex = newIndex;
            if (state.productos[newIndex]) {
                openZoom(state.productos[newIndex]);
            }
        },
        (prod) => { Cart.addToCart(prod); UI.showToast(`Añadido: ${prod.nombre}`, 'success'); },
        Wishlist.toggleWishlist,
        Wishlist.getWishlist()
    );
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

    if (totalEl) totalEl.textContent = Utils.formatPrice(Cart.getCartTotal());
}


function initSalesToast() {
    const nombres = ["María", "Claudia", "Fernanda", "Javiera", "Valentina", "Pola", "Andrea"];
    const comunas = ["Santiago", "Las Condes", "Vitacura", "Providencia", "Ñuñoa", "Lo Barnechea"];

    const toast = document.getElementById('salesToast');
    const toastImg = document.getElementById('salesToastImg');
    const toastTitle = document.getElementById('salesToastTitle');
    const toastText = document.getElementById('salesToastText');

    if (!toast || !toastImg || !toastTitle || !toastText) return;

    function mostrarRandom() {
        if (!state.productos || !state.productos.length) return;

        const randomProd = state.productos[Math.floor(Math.random() * state.productos.length)];
        const randomNombre = nombres[Math.floor(Math.random() * nombres.length)];
        const randomComuna = comunas[Math.floor(Math.random() * comunas.length)];

        toastImg.src = randomProd.imagen;
        toastTitle.textContent = randomNombre + " de " + randomComuna;
        toastText.textContent = "Acaba de reservar un " + randomProd.nombre;

        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 5000);
    }

    setTimeout(() => {
        mostrarRandom();
        const intervalo = Math.random() * (60000 - 30000) + 30000;
        setInterval(mostrarRandom, intervalo);
    }, 10000);
}

function initInstagramFeed() {
    const imagenes = [
        "https://i.ibb.co/0pgLs2ds/Ajustes-de-Imagen-15.jpg",
        "https://i.ibb.co/Z1YdX5vt/Ajustes-de-Imagen-14.jpg",
        "https://i.ibb.co/bjXyPNCW/Ajustes-de-Imagen-13.jpg",
        "https://i.ibb.co/WWz6y4By/Ajustes-de-Imagen-12.jpg",
        "https://i.ibb.co/LhtVL4F1/Ajustes-de-Imagen-11.jpg",
        "https://i.ibb.co/HDv2Pzpy/Ajustes-de-Imagen-8.jpg"
    ];

    const feed = document.getElementById('instagramFeed');
    if (!feed) return;

    feed.innerHTML = '';
    imagenes.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'instagram-item';
        item.innerHTML = `<img src="${img}" alt="Publicación de Instagram ${index + 1}" loading="lazy">`;
        feed.appendChild(item);
    });
}


function trapFocus(modal) {
    releaseFocusTrap();
    if (!modal) return;
    const selectors = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(modal.querySelectorAll(selectors)).filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function onKeyDown(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }
    modal.addEventListener('keydown', onKeyDown);
    first.focus();
    activeFocusTrap = { modal, onKeyDown };
}

function releaseFocusTrap() {
    if (!activeFocusTrap) return;
    activeFocusTrap.modal.removeEventListener('keydown', activeFocusTrap.onKeyDown);
    activeFocusTrap = null;
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
            UI.showToast('Producto actualizado correctamente', 'success');
        } else {
            await DB.addProduct(formData);
            UI.showToast('Producto creado correctamente', 'success');
        }
        cancelEdit();
    } catch (err) {
        console.error(err);
        UI.showToast("Error: " + err.message, 'error');
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
                if (auth.currentUser) {
                    dom.adminModal.classList.add('active');
                    trapFocus(dom.adminModal);
                } else {
                    dom.loginModal.classList.add('active');
                    trapFocus(dom.loginModal);
                }
                return;
            }

            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.filtroActual = tab.dataset.categoria;
            // Trigger render with current data
            UI.renderCatalog(
                state.productos,
                state.filtroActual,
                (prod) => { Cart.addToCart(prod); UI.showToast(`Añadido: ${prod.nombre}`, 'success'); },
                openZoom,
                Wishlist.toggleWishlist,
                Wishlist.getWishlist()
            );
        });
    });

    if (dom.carritoBtn) dom.carritoBtn.onclick = () => {
        if (dom.carritoModal) {
            dom.carritoModal.classList.add('active');
            trapFocus(dom.carritoModal);
        }
    };
    if (dom.carritoModal) dom.carritoModal.onclick = (e) => {
        if (e.target === dom.carritoModal) {
            dom.carritoModal.classList.remove('active');
            releaseFocusTrap();
        }
    };
    if (dom.vaciarCarrito) dom.vaciarCarrito.onclick = () => Cart.clearCart();

    // CRO: Botón Comprar con WhatsApp (Fase 3.1)
    const comprarBtn = document.getElementById('comprarCarrito');
    if (comprarBtn) {
        comprarBtn.onclick = () => {
            if (Cart.getCart().length === 0) {
                UI.showToast('El carrito está vacío', 'error');
                return;
            }

            const whatsappUrl = Cart.generarEnlaceWhatsApp();
            if (whatsappUrl) window.open(whatsappUrl, '_blank');

            UI.showToast('Redirigiendo a WhatsApp...', 'success');
        };
    }


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
    document.querySelector('.close-zoom').onclick = () => {
        UI.closeZoomModal();
        history.pushState(null, null, ' '); // Clear hash
    };

    if (dom.loginForm) dom.loginForm.onsubmit = async (e) => {
        e.preventDefault();
        try {
            await Auth.loginWithEmail(dom.adminEmail.value, dom.adminPassword.value);
            dom.loginModal.classList.remove('active');
            dom.adminModal.classList.add('active');
            dom.loginForm.reset();
            releaseFocusTrap();
        } catch (err) {
            UI.showToast(err.message, 'error');
        }
    };
    document.getElementById('cancelLogin').onclick = () => {
        dom.loginModal.classList.remove('active');
        releaseFocusTrap();
    };

    if (dom.logoutBtn) dom.logoutBtn.onclick = () => {
        Auth.logout();
        dom.adminModal.classList.remove('active');
        releaseFocusTrap();
    };
    if (dom.cancelAdmin) dom.cancelAdmin.onclick = () => {
        dom.adminModal.classList.remove('active');
        releaseFocusTrap();
    };
    if (dom.productForm) dom.productForm.onsubmit = handleProductSubmit;
    if (dom.cancelEdit) dom.cancelEdit.onclick = cancelEdit;

    // Sitemap
    const sitemapBtn = document.getElementById('downloadSitemapBtn');
    if (sitemapBtn) {
        sitemapBtn.onclick = () => {
            if (!state.productos || !state.productos.length) return UI.showToast("No hay productos.", 'error');
            const xml = Utils.generateSitemap(state.productos);
            const blob = new Blob([xml], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sitemap.xml';
            a.click();
            URL.revokeObjectURL(url);
        };
    }
}

function renderLocalProductList() {
    const localList = document.getElementById('localProductList');
    if (!localList || !window.productsData) return;

    localList.innerHTML = '';

    const pendientes = window.productsData.filter(lp =>
        !state.productos.some(p => (p.nombre || '').toLowerCase().trim() === (lp.nombre || '').toLowerCase().trim())
    );

    if (!pendientes.length) {
        localList.innerHTML = '<p style="text-align: center; padding: 10px; color: green;">✅ ¡Todos los productos están en la nube!</p>';
        return;
    }

    pendientes.forEach(prod => {
        const item = document.createElement('div');
        item.className = 'product-item';
        item.style.borderLeft = '4px solid #FF9800';
        item.innerHTML = `
            <div class="product-item-info">
                <strong>${prod.nombre}</strong>
                <small>${prod.categoria} - $${Utils.formatPrice(prod.precio)}</small>
            </div>
            <button class="btn-importar" onclick="window.cargarProductoLocal('${prod.nombre.replace(/'/g, "\\'")}')" 
                    style="background: #E65100; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                📥 Cargar Datos
            </button>
        `;
        localList.appendChild(item);
    });
}

window.toggleLocalList = function () {
    const section = document.getElementById('localProductSection');
    if (section) {
        const isHidden = section.style.display === 'none' || section.style.display === '';
        section.style.display = isHidden ? 'block' : 'none';
        if (isHidden) renderLocalProductList();
    }
};

window.cargarProductoLocal = function (nombre) {
    if (!window.productsData) return;
    const prod = window.productsData.find(p => p.nombre === nombre);
    if (!prod) return;

    const nameEl = document.getElementById('productName');
    const priceEl = document.getElementById('productPrice');
    const catEl = document.getElementById('productCategory');
    const descEl = document.getElementById('productDescription');
    const badgeEl = document.getElementById('productBadge');
    const detailsEl = document.getElementById('productDetails');

    if (!nameEl || !priceEl || !catEl || !descEl || !badgeEl || !detailsEl) return;

    nameEl.value = prod.nombre;
    priceEl.value = prod.precio;
    catEl.value = prod.categoria;
    descEl.value = prod.descripcion || "";
    badgeEl.value = prod.badge || "";
    detailsEl.value = (prod.detalles || []).join('\n');

    const adminForm = document.querySelector('.admin-form');
    if (adminForm) adminForm.scrollTop = 0;

    UI.showToast(`Datos de "${prod.nombre}" cargados. Ahora elige la foto y guarda.`, 'info');
};

window.migrarProductosAFirebase = async function () {
    if (!window.productsData || !window.productsData.length) {
        UI.showToast('No hay productos locales para migrar.', 'error');
        return;
    }

    if (!confirm(`¿Deseas sincronizar ${window.productsData.length} productos?\n\nNota: Solo se subirán los que no existan en la nube.`)) return;

    const migrationBtn = document.getElementById('migrateBtn');
    if (migrationBtn) {
        migrationBtn.disabled = true;
        migrationBtn.innerHTML = '<span>⏳</span> Migrando...';
    }

    let subidos = 0;
    let saltados = 0;

    try {
        for (const prod of window.productsData) {
            const existe = state.productos.some(p => (p.nombre || '').toLowerCase().trim() === (prod.nombre || '').toLowerCase().trim());

            if (existe) {
                saltados++;
                continue;
            }

            await DB.migrarProductoIndividual(prod, prod.imagen);
            subidos++;
        }

        UI.showToast(`Sincronización terminada. Subidos: ${subidos}. Ya existían: ${saltados}.`, 'success');
    } catch (error) {
        console.error('Error en migración:', error);
        UI.showToast('Error en migración: ' + error.message, 'error');
    } finally {
        if (migrationBtn) {
            migrationBtn.disabled = false;
            migrationBtn.innerHTML = '<span>📷</span> Importar Manual';
        }
    }
};

window.exportarCatalogoJS = function () {
    if (!state.productos || !state.productos.length) {
        UI.showToast('No hay productos para exportar.', 'error');
        return;
    }

    const exportList = state.productos.map(p => {
        const clone = { ...p };
        delete clone.firestoreId;
        return clone;
    });

    const jsonContent = JSON.stringify(exportList, null, 2);
    const jsContent = `window.productsData = ${jsonContent};`;

    const dataStr = "data:text/javascript;charset=utf-8," + encodeURIComponent(jsContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "products.js");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    UI.showToast("Catálogo descargado como 'products.js'.", 'success');
};
