// ===== UI MODULE =====
import { formatPrice, getBadgeClass, WHATSAPP_NUMERO } from './utils.js';

// DOM Cache
const elements = {};

export function initUIElements() {
    const ids = [
        'loadingScreen', 'header', 'catalogo', 'zoomGaleria', 'zoomImg',
        'zoomNombre', 'zoomPrecio', 'zoomBadge', 'zoomDescripcion', 'zoomDetalles', 'zoomProgress',
        'btnReserva', 'loginModal', 'adminModal', 'loginForm', 'productForm', 'productList',
        'carritoBtn', 'carritoModal', 'carritoCount', 'carritoItems', 'carritoTotal',
        'vaciarCarritoBtn', 'comprarCarritoBtn', 'recommendationsGrid',
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
export function renderCatalog(productos, filtro = "Todos", onAddToCart, onOpenZoom) {
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
        card.querySelector('.image-container').addEventListener('click', () => onOpenZoom(prod));
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
export function showZoomModal(prod, allProducts, currentIndex, onNavigate) {
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
    }, 200);
}

export function closeZoomModal() {
    if (elements.zoomGaleria) {
        elements.zoomGaleria.classList.remove("show");
        document.body.style.overflow = "auto";
    }
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
