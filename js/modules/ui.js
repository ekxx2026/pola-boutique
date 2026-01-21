// ===== UI MODULE =====
import { formatPrice, getBadgeClass, WHATSAPP_NUMERO } from './utils.js';

// DOM Cache
const elements = {};

export function initUIElements() {
    const ids = [
        'loadingScreen', 'header', 'catalogo', 'zoomGaleria', 'zoomImg',
        'zoomNombre', 'zoomPrecio', 'zoomBadge', 'zoomDescripcion', 'zoomDetalles', 'zoomProgress',
        'zoomAddToCart', 'zoomWhatsapp', 'zoomWishlist', 'zoomShare',
        'loginModal', 'adminModal', 'loginForm', 'productForm', 'productList',
        'carritoBtn', 'carritoModal', 'carritoCount', 'carritoItems', 'carritoTotal',
        'vaciarCarrito', 'comprarCarrito', 'recommendationsGrid',
        'productName', 'productPrice', 'productCategory', 'productDescription', 'productBadge', 'productDetails',
        'adminEmail', 'adminPassword', 'logoutBtn', 'cancelAdmin', 'cancelEdit'
    ];

    ids.forEach(id => {
        elements[id] = document.getElementById(id);
    });

    return elements;
}

// === LOADING SCREEN ===
export function hideLoadingScreen() {
    if (elements.loadingScreen) {
        // Eliminamos el timeout artificial para mejorar UX/LCP
        elements.loadingScreen.style.opacity = "0";
        setTimeout(() => {
            elements.loadingScreen.style.display = "none";
        }, 500);
    }
}

// === CATALOGO ===
export function renderCatalog(productos, filtro = "Todos", onAddToCart, onOpenZoom, onToggleWishlist, wishlistState = []) {
    if (!elements.catalogo) return;
    elements.catalogo.innerHTML = "";

    if (productos.length === 0) {
        elements.catalogo.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 3rem; margin-bottom: 20px;">👗</div>
                <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 15px;">Colección en camino</h3>
                <p style="color: #666; max-width: 400px; margin: 0 auto;">Pronto agregaremos nuestra nueva colección.</p>
            </div>`;
        return;
    }

    const filtrados = filtro === "Todos" ? productos : productos.filter(p => p.categoria === filtro);

    if (filtrados.length === 0) {
        elements.catalogo.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 3rem; margin-bottom: 20px;">🔍</div>
                <h3>No hay productos en esta categoría</h3>
            </div>`;
        return;
    }

    // Observer para animacion
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    filtrados.forEach((prod, index) => {
        const card = document.createElement("div");
        card.className = "card";
        const delay = (index % 8) * 0.1;
        card.style.transitionDelay = `${delay}s`;

        let badgeHtml = '';
        if (prod.badge) {
            const cls = getBadgeClass(prod.badge);
            badgeHtml = `<div class="badge ${cls}">${prod.badge}</div>`;
        }
        if (index % 4 === 0) badgeHtml += `<div class="badge escasez">¡Stock Limitado!</div>`;

        card.innerHTML = `
            ${badgeHtml}
            <div class="image-container">
                <img src="${prod.imagen}" alt="${prod.nombre}" class="card-img" loading="lazy">
                <div class="zoom-indicator">🔍</div>
                <button class="wishlist-btn ${wishlistState.includes(prod.id) ? 'active' : ''}" aria-label="Añadir a lista de deseos">
                    ${wishlistState.includes(prod.id) ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="card-content">
                <h3 class="card-title">${prod.nombre}</h3>
                <div class="card-price">$${formatPrice(prod.precio)}</div>
                <p class="card-description">${prod.descripcion || 'Diseño exclusivo.'}</p>
                <div class="card-actions">
                    <button class="btn-agregar-carrito action-reserved"><span>🛒</span> Reservar</button>
                    <button class="btn-reserva action-whatsapp"><span>💬</span> ¡Lo quiero!</button>
                </div>
            </div>
        `;

        elements.catalogo.appendChild(card);
        observer.observe(card);

        // Bind Events
        card.querySelector('.zoom-indicator').addEventListener('click', () => onOpenZoom(prod));
        card.querySelector('.image-container').addEventListener('click', (e) => {
            // Ignore if clicked on wishlist btn
            if (e.target.closest('.wishlist-btn')) return;
            onOpenZoom(prod);
        });

        const wishBtn = card.querySelector('.wishlist-btn');
        if (wishBtn) wishBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const added = onToggleWishlist(prod.id);
            // Visual update immediately
            if (added) {
                wishBtn.innerHTML = '❤️';
                wishBtn.classList.add('active');
                showToast('Añadido a lista de deseos', 'success');
            } else {
                wishBtn.innerHTML = '🤍';
                wishBtn.classList.remove('active');
            }
        });
        card.querySelector('.action-reserved').addEventListener('click', (e) => {
            e.stopPropagation();
            onAddToCart(prod);
            // Visual feedback
            const btn = e.currentTarget;
            btn.innerHTML = '<span>✅</span> Agregado';
            btn.style.background = '#4CAF50';
            setTimeout(() => {
                btn.innerHTML = '<span>🛒</span> Reservar';
                btn.style.background = '';
            }, 2000);
        });
        card.querySelector('.action-whatsapp').addEventListener('click', (e) => {
            e.stopPropagation();
            openWhatsappProduct(prod);
        });
    });
}

// === ZOOM MODAL ===
export function showZoomModal(prod, allProducts, currentIndex, onNavigate, onAddToCart, onToggleWishlist, wishlistState = []) {
    if (!elements.zoomGaleria) return;

    elements.zoomImg.classList.remove("showZoom");
    setTimeout(() => {
        elements.zoomImg.src = prod.imagen;
        elements.zoomNombre.textContent = prod.nombre;
        elements.zoomPrecio.textContent = `$${formatPrice(prod.precio)}`;
        elements.zoomDescripcion.textContent = prod.descripcion || "";

        elements.zoomBadge.style.display = prod.badge ? "inline-block" : "none";
        if (prod.badge) {
            elements.zoomBadge.className = `zoom-badge ${getBadgeClass(prod.badge)}`;
            elements.zoomBadge.textContent = prod.badge;
        }

        // Detalles
        elements.zoomDetalles.innerHTML = '';
        const detalles = prod.detalles || ['Alta calidad', 'Diseño exclusivo'];
        detalles.forEach(d => {
            const li = document.createElement('li');
            li.textContent = d;
            elements.zoomDetalles.appendChild(li);
        });

        // Bind Actions
        if (elements.zoomAddToCart) elements.zoomAddToCart.onclick = () => {
            onAddToCart(prod);
            showToast('Añadido al carrito', 'success');
        };

        if (elements.zoomWhatsapp) elements.zoomWhatsapp.onclick = () => openWhatsappProduct(prod);

        if (elements.zoomShare) elements.zoomShare.onclick = async () => {
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: prod.nombre,
                        text: `Mira este increíble ${prod.nombre} en Pola Galleani`,
                        url: window.location.href
                    });
                } else {
                    await navigator.clipboard.writeText(window.location.href);
                    showToast('Enlace copiado', 'success');
                }

                // === Analytics (Share) ===
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'share', {
                        method: navigator.share ? 'native' : 'clipboard',
                        content_type: 'product',
                        item_id: prod.id
                    });
                }

            } catch (err) {
                console.log('Share cancelled');
            }
        };

        if (elements.zoomWishlist) {
            const isWished = wishlistState.includes(prod.id);
            elements.zoomWishlist.innerHTML = isWished ? '❤️' : '🤍';
            elements.zoomWishlist.className = `wishlist-btn-zoom ${isWished ? 'active' : ''}`;
            elements.zoomWishlist.onclick = () => {
                const added = onToggleWishlist(prod.id);
                if (added) {
                    elements.zoomWishlist.innerHTML = '❤️';
                    elements.zoomWishlist.classList.add('active');
                    showToast('Añadido a favoritos', 'success');
                } else {
                    elements.zoomWishlist.innerHTML = '🤍';
                    elements.zoomWishlist.classList.remove('active');
                }
            };
        }

        // Recommendations (Simple random logic for now)
        if (elements.recommendationsGrid) {
            elements.recommendationsGrid.innerHTML = '';
            const recs = allProducts
                .filter(p => p.id !== prod.id && p.categoria === prod.categoria)
                .slice(0, 3);

            recs.forEach(r => {
                const div = document.createElement('div');
                div.className = 'rec-item';
                div.innerHTML = `<img src="${r.imagen}"><div class="rec-item-info">${r.nombre}</div>`;
                div.onclick = () => onNavigate(allProducts.findIndex(p => p.id === r.id));
                elements.recommendationsGrid.appendChild(div);
            });
        }

        elements.zoomGaleria.classList.add("show");
        document.body.style.overflow = "hidden";
        setTimeout(() => elements.zoomImg.classList.add("showZoom"), 50);

        // SEO: Update tags
        updateSEOTags(prod);

        // === Analytics (View Item) ===
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_item', {
                currency: 'CLP',
                value: prod.precio,
                items: [{
                    item_id: prod.id,
                    item_name: prod.nombre,
                    item_category: prod.categoria,
                    price: prod.precio
                }]
            });
        }

    }, 200);
}

export function closeZoomModal() {
    if (elements.zoomGaleria) {
        elements.zoomGaleria.classList.remove("show");
        document.body.style.overflow = "auto";
        resetSEOTags();
        // Clear hash silently if needed, but app.js will handle history
    }
}

// === SEO HELPERS ===
function updateSEOTags(prod) {
    // Title
    document.title = `${prod.nombre} | Pola Galleani`;

    // Meta Description
    const desc = `Compra ${prod.nombre} - ${prod.categoria}. ${prod.descripcion || 'Moda exclusiva y elegante.'}`;
    setMeta('description', desc);
    setMeta('og:description', desc);

    // OG Tags
    setMeta('og:title', `${prod.nombre} | $${formatPrice(prod.precio)}`);
    setMeta('og:image', prod.imagen);
    setMeta('og:url', window.location.href);

    // JSON-LD
    const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": prod.nombre,
        "image": prod.imagen,
        "description": desc,
        "brand": {
            "@type": "Brand",
            "name": "Pola Galleani"
        },
        "offers": {
            "@type": "Offer",
            "priceCurrency": "CLP",
            "price": prod.precio,
            "availability": "https://schema.org/InStock"
        }
    };
    injectJSONLD(schema);
}

function resetSEOTags() {
    document.title = "Pola Galleani | Boutique Ultra-Lujo";
    const desc = "Descubre la última colección de moda de lujo en Pola Galleani. Vestidos, blusas y más.";
    setMeta('description', desc);
    setMeta('og:description', desc);
    setMeta('og:title', "Pola Galleani | Boutique Ultra-Lujo");
    setMeta('og:image', "https://i.ibb.co/example/default-preview.jpg"); // Fallback or keep current
    // We don't remove JSON-LD, just let it be or clear it
    const script = document.getElementById('json-ld-product');
    if (script) script.remove();
}

function setMeta(name, content) {
    let element = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
    if (!element) {
        element = document.createElement('meta');
        if (name.startsWith('og:')) element.setAttribute('property', name);
        else element.setAttribute('name', name);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
}

function injectJSONLD(data) {
    let script = document.getElementById('json-ld-product');
    if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-product';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
}

// === WHATSAPP ===
export function openWhatsappProduct(prod) {
    const msg = `Hola, me interesa: *${prod.nombre}* ($${formatPrice(prod.precio)}). ¿Disponible?`;
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`, '_blank');
}

export function openWhatsappCart(cartItems, total) {
    let msg = "Hola, quiero pedir:\n\n";
    cartItems.forEach(item => {
        msg += `- ${item.nombre} (x${item.cantidad}): $${formatPrice(item.precio * item.cantidad)}\n`;
    });
    msg += `\n*Total: $${formatPrice(total)}*`;
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`, '_blank');
}

// === ADMIN UI ===
export function toggleAdmin(isLoggedIn) {
    const btn = document.getElementById('btnAdmin'); // Dynamic ref
    if (btn) {
        btn.style.opacity = isLoggedIn ? '1' : '0.1';
        btn.style.filter = isLoggedIn ? 'none' : 'grayscale(100%)';
    }
}

export function renderAdminList(productos, onEdit, onDelete) {
    if (!elements.productList) return;
    elements.productList.innerHTML = '';

    productos.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-item';
        div.innerHTML = `
            <div class="product-item-info">
                <strong>${p.nombre}</strong> <small>$${formatPrice(p.precio)}</small>
            </div>
            <div class="product-item-actions">
                <button class="btn-editar">✏️</button>
                <button class="btn-eliminar">🗑️</button>
            </div>
        `;
        div.querySelector('.btn-editar').onclick = () => onEdit(p);
        div.querySelector('.btn-eliminar').onclick = () => onDelete(p);
        elements.productList.appendChild(div);
    });
}

export function fillProductForm(prod) {
    if (!elements.productName) return; // Safety check
    elements.productName.value = prod.nombre;
    elements.productPrice.value = prod.precio;
    elements.productCategory.value = prod.categoria;
    elements.productDescription.value = prod.descripcion || '';
    elements.productBadge.value = prod.badge || '';
    elements.productDetails.value = (prod.detalles || []).join('\n');
    // Image handling logic
    const imgType = document.getElementById('imageType');
    const pImage = document.getElementById('productImage');
    const pImageUrl = document.getElementById('productImageUrl');
    const fileIn = document.getElementById('fileInput');
    const filePrev = document.getElementById('filePreviewImage');
    const urlPrev = document.getElementById('urlPreviewImage');

    if (prod.imagen && prod.imagen.startsWith('data:')) {
        imgType.value = "file";
        filePrev.src = prod.imagen;
        document.getElementById('fileImagePreview').style.display = 'block';
        pImage.value = prod.imagen;
        pImageUrl.value = '';
        document.getElementById('urlImagePreview').style.display = 'none';
        urlPrev.src = '';
    } else {
        imgType.value = "url";
        pImageUrl.value = prod.imagen || '';
        urlPrev.src = prod.imagen || '';
        document.getElementById('urlImagePreview').style.display = prod.imagen ? 'block' : 'none';
        pImage.value = prod.imagen || '';
        document.getElementById('fileImagePreview').style.display = 'none';
        filePrev.src = '';
    }
}

// === IMAGE HANDLING ===
export function setupImageHandlers() {
    const loadUrlBtn = document.getElementById('loadUrlButton');
    const productImageUrl = document.getElementById('productImageUrl');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const uploadArea = document.getElementById('uploadArea');
    const imageType = document.getElementById('imageType');

    // URL Handler
    if (loadUrlBtn) {
        // Remove ancient onclick if possible or just override behavior
        loadUrlBtn.onclick = (e) => {
            e.preventDefault();
            loadFromUrl();
        };
    }

    if (productImageUrl) {
        productImageUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                loadFromUrl();
            }
        });
        productImageUrl.addEventListener('input', () => {
            if (imageType) imageType.value = "url";
            const filePreview = document.getElementById('fileImagePreview');
            const fileImg = document.getElementById('filePreviewImage');
            if (filePreview) filePreview.style.display = 'none';
            if (fileImg) fileImg.src = '';
        });
    }

    // File Handler
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            if (imageType) imageType.value = "file";
            const urlPreview = document.getElementById('urlImagePreview');
            const urlImg = document.getElementById('urlPreviewImage');
            if (urlPreview) urlPreview.style.display = 'none';
            if (urlImg) urlImg.src = '';

            if (productImageUrl) productImageUrl.value = '';

            if (this.files.length > 0) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const fileImg = document.getElementById('filePreviewImage');
                    const filePreview = document.getElementById('fileImagePreview');
                    if (fileImg) fileImg.src = e.target.result;
                    if (filePreview) filePreview.style.display = 'block';
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // Trigger File Input
    const triggerFile = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Avoid double bubbling
        if (fileInput) fileInput.click();
    };

    if (uploadButton) uploadButton.onclick = triggerFile;
    if (uploadArea) uploadArea.onclick = (e) => {
        if (e.target !== uploadButton && e.target !== fileInput) triggerFile(e);
    };

    // Drag & Drop
    if (uploadArea) {
        uploadArea.ondragover = (e) => { e.preventDefault(); uploadArea.style.borderColor = '#4CAF50'; };
        uploadArea.ondragleave = (e) => { e.preventDefault(); uploadArea.style.borderColor = '#ccc'; };
        uploadArea.ondrop = (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ccc';
            if (e.dataTransfer.files.length && fileInput) {
                fileInput.files = e.dataTransfer.files;
                // Manually trigger change event
                const event = new Event('change');
                fileInput.dispatchEvent(event);
            }
        };
    }
}

function loadFromUrl() {
    const inputUrl = document.getElementById("productImageUrl");
    const imgPreview = document.getElementById("urlPreviewImage");
    const containerPreview = document.getElementById("urlImagePreview");
    const inputHidden = document.getElementById("productImage");
    const inputType = document.getElementById("imageType");

    if (!inputUrl) return;
    const url = inputUrl.value.trim();
    if (!url) {
        alert("Por favor, ingresa una URL.");
        return;
    }

    if (imgPreview) imgPreview.src = '';
    if (containerPreview) containerPreview.style.display = 'block';

    const imgTest = new Image();
    imgTest.crossOrigin = "Anonymous";
    imgTest.onload = function () {
        if (imgPreview) imgPreview.src = url;
        if (inputHidden) inputHidden.value = url;
        if (inputType) inputType.value = "url";
    };
    imgTest.onerror = function () {
        if (containerPreview) containerPreview.style.display = 'none';
        alert("No se pudo cargar la imagen. Verifica el enlace.");
    };
    imgTest.src = url;
}
// === NOTIFICACIONES TOAST ===
export function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Iconos según tipo
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Trigger reflow
    void toast.offsetWidth;
    toast.classList.add('show');

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 400); // Wait for transition
    }, 3000);
}
