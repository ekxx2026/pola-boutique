// ===== APP ENTRY POINT =====
import * as Utils from './modules/utils.js';
import * as Auth from './modules/auth.js';
import * as Cart from './modules/cart.js';
import * as UI from './modules/ui.js';
import * as DB from './modules/db.js';
import * as Wishlist from './modules/wishlist.js';
import { Analytics } from './modules/analytics.js';
import { CONFIG, TEXTS } from './config.js';

let state = {
    productos: [],
    filtroActual: localStorage.getItem('filtroActual') || "Todos",
    tagFilter: null,
    searchQuery: "",
    currentZoomIndex: 0,
    editingProducto: null
};

let activeFocusTrap = null;

// Auto-run init
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // 1. Init UI References
    const dom = UI.initUIElements();

    // 2. Subscribe to Data
    const renderApp = () => {
        let products = state.productos;

        // Search Filter
        if (state.searchQuery) {
            const q = state.searchQuery.toLowerCase();
            products = products.filter(p =>
                p.nombre.toLowerCase().includes(q) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(q))
            );
        }

        UI.renderCatalog(
            products,
            state.filtroActual,
            (prod) => { Cart.addToCart(prod); UI.showToast(`Añadido: ${prod.nombre}`, 'success'); },
            openZoom,
            Wishlist.toggleWishlist,
            Wishlist.getWishlist(),
            state.tagFilter
        );
    };

    DB.subscribeToProducts((list) => {
        state.productos = list;
        renderApp();
        UI.renderAdminList(state.productos, startEdit, deleteProduct);
        checkHash();
        UI.hideLoadingScreen();
    });

    initInstagramFeed();

    Wishlist.subscribeToWishlist(() => renderApp());

    Cart.subscribeToCart(updateCartUI);

    // 3. Setup Auth
    Auth.initAuthObserver({
        onLogin: (user) => UI.toggleAdmin(true),
        onLogout: () => UI.toggleAdmin(false)
    });

    // 4. Connection Monitor
    let wasOffline = false;
    DB.monitorConnection((isConnected) => {
        if (!isConnected) {
            wasOffline = true;
            // Optional: UI.showToast('Conexión inestable...', 'info');
        } else {
            if (wasOffline) {
                UI.showToast('Conexión restablecida 🟢', 'success');
                wasOffline = false;
            }
        }
    });

    // Helper: Smooth Transition
    const animateCatalogUpdate = (updateFn) => {
        const catalogo = document.getElementById('catalogo');
        if (!catalogo) {
            updateFn();
            return;
        }

        catalogo.classList.add('fade-out');

        setTimeout(() => {
            updateFn();
            // Optional: scroll to top of catalog if needed
            // window.scrollTo({ top: catalogo.offsetTop - 100, behavior: 'smooth' });

            catalogo.classList.remove('fade-out');
            catalogo.classList.add('fade-in');

            setTimeout(() => {
                catalogo.classList.remove('fade-in');
            }, 400);
        }, 300); // 300ms matches CSS transition
    };

    UI.setupImageHandlers();
    setupGlobalEvents(dom, renderApp, animateCatalogUpdate);

    // Search Listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim();
            renderApp();
        });
    }

    if (dom.header) {
        window.addEventListener('scroll', () => {
            dom.header.classList.toggle('scrolled', window.scrollY > 100);
        });
    }

    // Modules Init
    Wishlist.init();
    Analytics.init(); // Start tracking
    initSalesToast(); // Notificacion venta

    // 5. Routing
    window.addEventListener('hashchange', checkHash);

    // Global Escape Handler (Capturing phase for maximum reliability)
    const handleEscape = (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            UI.closeAllModals();
        }
    };
    document.removeEventListener('keydown', handleEscape, true);
    document.addEventListener('keydown', handleEscape, true);

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js?v=11').catch(() => { });
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

    // === CINEMATIC VIEW TRANSITION ===
    if (!document.startViewTransition) {
        // Fallback for browsers without support
        showZoomUI(prod);
        return;
    }

    // 1. Find source image
    let sourceImg = null;
    const allImages = document.querySelectorAll('.card-img');
    for (let img of allImages) {
        // Match by src since we don't have IDs on imgs. 
        // Note: prod.imagen might be relative or full, so we check includes
        if (img.src === prod.imagen || img.src.includes(prod.imagen)) {
            sourceImg = img;
            break;
        }
    }

    // 2. Prepare "Before" state
    if (sourceImg) {
        sourceImg.style.viewTransitionName = 'zoom-image';
        sourceImg.style.contain = 'layout paint'; // Perf optimization
    }

    // 3. Start Transition
    const transition = document.startViewTransition(() => {
        // === DOM UPDATE ===
        // Remove name from source so it doesn't conflict in "After" state
        if (sourceImg) sourceImg.style.viewTransitionName = '';

        // Show Modal
        showZoomUI(prod);

        // Add name to target (Modal Image)
        const targetImg = document.getElementById('zoomImg');
        if (targetImg) {
            targetImg.style.viewTransitionName = 'zoom-image';
            // Reset GSAP opacity/scale if any, so ViewTransition handles the geometry
            targetImg.style.opacity = "1";
            targetImg.classList.remove('showZoom'); // Avoid CSS conflict
        }
    });

    // 4. Cleanup after transition
    transition.finished.then(() => {
        const targetImg = document.getElementById('zoomImg');
        if (targetImg) targetImg.style.viewTransitionName = '';
        if (sourceImg) sourceImg.style.viewTransitionName = '';
    });
}

function showZoomUI(prod) {
    UI.showZoomModal(
        prod,
        state.productos,
        state.currentZoomIndex,
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

let cartTimerInterval;

function startCartTimer() {
    const timerEl = document.getElementById('cartTimer');
    if (!timerEl) return;

    // Get end time from storage or set new (15 mins)
    let endTime = localStorage.getItem('cartTimerEnd');
    if (!endTime) {
        endTime = Date.now() + 15 * 60 * 1000;
        localStorage.setItem('cartTimerEnd', endTime);
    }

    clearInterval(cartTimerInterval);

    function update() {
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
            timerEl.innerHTML = "Reserva expirada";
            localStorage.removeItem('cartTimerEnd');
            clearInterval(cartTimerInterval);
            return;
        }

        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        timerEl.innerHTML = `Su reserva expira en <span>${m}:${s.toString().padStart(2, '0')}</span>`;
    }

    update();
    cartTimerInterval = setInterval(update, 1000);
}

function updateCartUI(cartItems) {
    // Update count badge
    const count = Cart.getCartCount();
    const badge = document.getElementById('carritoCount');
    if (badge) badge.textContent = count;

    // Render internals
    const list = document.getElementById('carritoItems');
    const totalEl = document.getElementById('carritoTotal');
    const modalContent = document.querySelector('.carrito-content h3');

    // Inject or update timer container
    let timerContainer = document.getElementById('cartTimer');
    if (cartItems.length > 0 && !timerContainer && modalContent) {
        timerContainer = document.createElement('div');
        timerContainer.id = 'cartTimer';
        timerContainer.className = 'cart-timer';
        modalContent.after(timerContainer);
        startCartTimer();
    } else if (cartItems.length === 0 && timerContainer) {
        timerContainer.remove();
        clearInterval(cartTimerInterval);
        localStorage.removeItem('cartTimerEnd');
    }

    if (list) {
        if (cartItems.length === 0) {
            list.innerHTML = `
                <div class="empty-cart-container">
                    <p class="empty-cart-msg">${TEXTS.CART_EMPTY}</p>
                    <button class="btn-discover" onclick="document.querySelector('.carrito-modal').classList.remove('active'); document.getElementById('catalogo').scrollIntoView({behavior:'smooth'});">
                        ${TEXTS.CART_DISCOVER}
                    </button>
                </div>`;
        } else {
            list.innerHTML = cartItems.map(item => `
                <div class="cart-item">
                    <img src="${item.imagen}" width="60" alt="${item.nombre}">
                    <div class="cart-item-details">
                        <b>${item.nombre}</b>
                        <div class="cart-item-price">$${Utils.formatPrice(item.precio)}</div>
                    </div>
                    <div class="controls">
                        <button class="btn-qty" data-id="${item.id}" data-action="minus">-</button>
                        <span>${item.cantidad}</span>
                        <button class="btn-qty" data-id="${item.id}" data-action="plus">+</button>
                    </div>
                </div>
            `).join('');
        }

        // Bind dynamic buttons in cart
        // Bind dynamic buttons in cart
        const qtyBtns = list.querySelectorAll('.btn-qty');
        UI.attachRipple(qtyBtns); // Attach ripple to new buttons

        qtyBtns.forEach(btn => {
            btn.onclick = (e) => {
                // Ripple handles itself via click event, but we need logic
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
    const avatares = [
        "logo-pola.png",
        "logo.png"
    ];

    const toast = document.getElementById('salesToast');
    const toastImg = document.getElementById('salesToastImg');
    const toastTitle = document.getElementById('salesToastTitle');
    const toastText = document.getElementById('salesToastText');

    if (!toast || !toastImg || !toastTitle || !toastText) return;

    if (typeof localStorage !== 'undefined' && localStorage.getItem('salesToastShown') === '1') {
        return;
    }

    function mostrarRandom() {
        if (!state.productos || !state.productos.length) return;

        const randomProd = state.productos[Math.floor(Math.random() * state.productos.length)];
        const randomNombre = nombres[Math.floor(Math.random() * nombres.length)];
        const randomComuna = comunas[Math.floor(Math.random() * comunas.length)];
        const randomAvatar = avatares[Math.floor(Math.random() * avatares.length)];

        toastImg.src = randomAvatar;
        toastTitle.textContent = randomNombre + " de " + randomComuna;
        toastText.textContent = "Acaba de reservar un " + randomProd.nombre;

        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 5000);

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('salesToastShown', '1');
        }
    }

    const delay = Math.random() * (60000 - 30000) + 30000;
    setTimeout(mostrarRandom, delay);
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

    // Lazy load logic with IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                feed.innerHTML = '';
                imagenes.forEach((img, index) => {
                    const item = document.createElement('div');
                    item.className = 'instagram-item';
                    item.innerHTML = `<img src="${img}" alt="Publicación de Instagram ${index + 1}" loading="lazy" decoding="async">`;
                    feed.appendChild(item);
                });
                observer.disconnect();
            }
        });
    }, { rootMargin: "200px" });

    observer.observe(feed);
}


// Focus trap logic managed in UI.js


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

function setupGlobalEvents(dom, renderApp, animateCatalogUpdate) {
    // Zoom Card Flip Logic - Handled in UI.js
    document.querySelectorAll('.close-zoom, .close-zoom-back').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            UI.closeZoomModal();
        });
    });

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('instagram-tab')) return;
            if (tab.id === 'btnAdmin') {
                if (auth.currentUser) {
                    dom.adminModal.classList.add('active');
                    UI.trapFocus(dom.adminModal);
                } else {
                    dom.loginModal.classList.add('active');
                    UI.trapFocus(dom.loginModal);
                }
                return;
            }

            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.tagFilter = null;
            document.querySelectorAll('.tag-pill').forEach(pill => pill.classList.remove('active'));
            state.filtroActual = tab.dataset.categoria;
            localStorage.setItem('filtroActual', state.filtroActual);

            // Trigger render with animation
            if (animateCatalogUpdate) {
                animateCatalogUpdate(renderApp);
            } else {
                renderApp();
            }
        });
    });

    document.querySelectorAll('.tag-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const tag = pill.dataset.tag;
            if (!tag) return;
            const isActive = pill.classList.contains('active');
            document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
            if (isActive) {
                state.tagFilter = null;
            } else {
                pill.classList.add('active');
                state.tagFilter = tag;
            }

            if (animateCatalogUpdate) {
                animateCatalogUpdate(renderApp);
            } else {
                renderApp();
            }
        });
    });

    if (dom.carritoBtn) dom.carritoBtn.onclick = () => {
        if (dom.carritoModal) {
            dom.carritoModal.classList.add('active');
            UI.trapFocus(dom.carritoModal);
        }
    };
    if (dom.carritoModal) dom.carritoModal.onclick = (e) => {
        if (e.target === dom.carritoModal) {
            dom.carritoModal.classList.remove('active');
            UI.releaseFocus();
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

    // Swipe lateral handled in UI.showZoomModal
    // === RIPPLE EFFECTS ===
    // Attach ripple to static global buttons
    const rippleSelectors = [
        '#carritoBtn', '#vaciarCarrito', '#comprarCarrito',
        '#prev', '#next', '.close-zoom',
        '#logoutBtn', '#cancelAdmin', '#cancelEdit', '#cancelLogin',
        '.whatsapp-button', '.btn-qty', '.tab'
    ];

    // Convert selectors to elements
    const rippleElements = [];
    rippleSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => rippleElements.push(el));
    });

    // Also dynamic forms submit buttons
    if (dom.loginForm) rippleElements.push(dom.loginForm.querySelector('button[type="submit"]'));
    if (dom.productForm) rippleElements.push(dom.productForm.querySelector('button[type="submit"]'));

    UI.attachRipple(rippleElements);


    if (dom.loginForm) dom.loginForm.onsubmit = async (e) => {
        e.preventDefault();
        try {
            await Auth.loginWithEmail(dom.adminEmail.value, dom.adminPassword.value);
            dom.loginModal.classList.remove('active');
            dom.adminModal.classList.add('active');
            dom.loginForm.reset();
            UI.releaseFocus();
            UI.trapFocus(dom.adminModal);
        } catch (err) {
            UI.showToast(err.message, 'error');
        }
    };
    document.getElementById('cancelLogin').onclick = () => {
        dom.loginModal.classList.remove('active');
        UI.releaseFocus();
    };

    if (dom.logoutBtn) dom.logoutBtn.onclick = () => {
        Auth.logout();
        dom.adminModal.classList.remove('active');
        UI.releaseFocus();
    };
    if (dom.cancelAdmin) dom.cancelAdmin.onclick = () => {
        dom.adminModal.classList.remove('active');
        UI.releaseFocus();
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
