// ===== VARIABLES GLOBALES =====
const WHATSAPP_NUMERO = "56962281579";
const INSTAGRAM_URL = "https://www.instagram.com/polagalleani?igsh=MWc3bDNjMmpkNHRkYQ==";
const DIRECCION_TIENDA = "Nva uno 1676, Santiago";
const ADMIN_HASH = "cd0d2c4e146b03fa5a2158d45d504ec55fc9070595c5b59683d2d3df43e0d2a2"; // Hash SHA-256 de la contraseña

// Productos: Se cargarán desde products.json
let productos = [];

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let filtroActual = "Todos";
let currentZoomIndex = 0;
let editingProductId = null;

// ===== ELEMENTOS DOM =====
let loadingScreen, header, catalogo, zoomGaleria, zoomImg, zoomNombre, zoomPrecio, zoomBadge, zoomDescripcion, zoomDetalles, zoomProgress;
let btnReserva, loginModal, adminModal, loginForm, productForm, productList;
let carritoBtn, carritoModal, carritoCount, carritoItems, carritoTotal, vaciarCarritoBtn, comprarCarritoBtn;
let instagramFeed;

// Elementos para carga de imágenes
let productImageUrl, loadUrlButton, urlImagePreview, urlPreviewImage, fileImagePreview, filePreviewImage;
let uploadArea, fileInput, uploadButton, imageType, productImage;

// Elementos para edición
let productId, isEditing, formButtons, editButtons, modoEdicion, cancelEditBtn;
let downloadCatalogBtn;

function initializeElements() {
    loadingScreen = document.getElementById("loadingScreen");
    header = document.getElementById("header");
    catalogo = document.getElementById("catalogo");
    zoomGaleria = document.getElementById("zoomGaleria");
    zoomImg = document.getElementById("zoomImg");
    zoomNombre = document.getElementById("zoomNombre");
    zoomPrecio = document.getElementById("zoomPrecio");
    zoomBadge = document.getElementById("zoomBadge");
    zoomDescripcion = document.getElementById("zoomDescripcion");
    zoomDetalles = document.getElementById("zoomDetalles");
    zoomProgress = document.getElementById("zoomProgress");

    btnReserva = document.getElementById("btnReserva");
    loginModal = document.getElementById("loginModal");
    adminModal = document.getElementById("adminModal");
    loginForm = document.getElementById("loginForm");
    productForm = document.getElementById("productForm");
    productList = document.getElementById("productList");

    carritoBtn = document.getElementById("carritoBtn");
    carritoModal = document.getElementById("carritoModal");
    carritoCount = document.getElementById("carritoCount");
    carritoItems = document.getElementById("carritoItems");
    carritoTotal = document.getElementById("carritoTotal");
    vaciarCarritoBtn = document.getElementById("vaciarCarrito");
    comprarCarritoBtn = document.getElementById("comprarCarrito");
    instagramFeed = document.getElementById("instagramFeed");

    // Elementos para carga de imágenes
    productImageUrl = document.getElementById("productImageUrl");
    loadUrlButton = document.getElementById("loadUrlButton");
    urlImagePreview = document.getElementById("urlImagePreview");
    urlPreviewImage = document.getElementById("urlPreviewImage");
    fileImagePreview = document.getElementById("fileImagePreview");
    filePreviewImage = document.getElementById("filePreviewImage");
    uploadArea = document.getElementById("uploadArea");
    fileInput = document.getElementById("fileInput");
    uploadButton = document.getElementById("uploadButton");
    imageType = document.getElementById("imageType");
    productImage = document.getElementById("productImage");

    // Elementos para edición
    productId = document.getElementById("productId");
    isEditing = document.getElementById("isEditing");
    formButtons = document.getElementById("formButtons");
    editButtons = document.getElementById("editButtons");
    modoEdicion = document.getElementById("modoEdicion");
    cancelEditBtn = document.getElementById("cancelEdit");
    downloadCatalogBtn = document.getElementById("downloadCatalogBtn");
    recommendationsGrid = document.getElementById("recommendationsGrid");
}

// ===== FUNCIONES PRINCIPALES =====

async function init() {
    console.log("🚀 Inicializando Boutique con Firebase (Realtime)...");
    initializeElements();

    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = "0";
            setTimeout(() => {
                loadingScreen.style.display = "none";
            }, 800);
        }, 500);
    }

    // Escuchar cambios en Realtime Database
    db.ref("productos").on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Convertimos el objeto de Firebase en array y ordenamos por ID descendente
            productos = Object.keys(data).map(key => ({
                firestoreId: key, // Usamos firestoreId como nombre de variable para no romper el resto del código
                ...data[key]
            })).sort((a, b) => b.id - a.id);
        } else {
            console.warn("⚠️ La base de datos está vacía.");
            productos = [];

            // Auto-migración si detectamos productos locales
            if (typeof window.productsData !== 'undefined' && window.productsData.length > 0) {
                console.log("💡 Detectados productos locales. ¿Deseas migrarlos? Llama a 'migrarProductosAFirebase()'");
            }
        }

        console.log("📦 Productos actualizados desde Firebase:", productos.length);
        renderizarCatalogo();
        renderizarListaAdmin();
    }, (error) => {
        console.error("❌ Error de Firebase:", error);
    });

    renderizarCarrito();
    setupEventListeners();

    // Iniciar el resto de módulos
    window.addEventListener("scroll", handleScroll);
    cargarInstagramFeed();
    mejorarResponsiveCarrito();
    configurarCargaImagenes();
    iniciarNotificacionesVentas();

    // Registrar Service Worker para PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js?v=8')
                .then(reg => console.log('SW ok'))
                .catch(err => console.log('SW error', err));
        });
    }
}

// Helpers globales para evitar errores de referencia
function renderizarCatalogo() { if (typeof renderCatalogo === 'function') renderCatalogo(); }
function renderizarCarrito() { if (typeof actualizarCarritoUI === 'function') actualizarCarritoUI(); }
function renderizarListaAdmin() { if (typeof renderProductList === 'function') renderProductList(); }


function handleScroll() {
    header.classList.toggle("scrolled", window.scrollY > 100);
}

function renderCatalogo() {
    catalogo.innerHTML = "";

    if (productos.length === 0) {
        catalogo.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 3rem; margin-bottom: 20px;">👗</div>
                <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 15px;">
                    No hay productos disponibles
                </h3>
                <p style="color: #666; max-width: 400px; margin: 0 auto;">
                    Pronto agregaremos nuestra nueva colección.
                </p>
            </div>
        `;
        return;
    }

    const productosFiltrados = filtroActual === "Todos"
        ? productos
        : productos.filter(p => p.categoria === filtroActual);

    if (productosFiltrados.length === 0) {
        catalogo.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 3rem; margin-bottom: 20px;">🔍</div>
                <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 15px;">
                    No hay productos en esta categoría
                </h3>
                <p style="color: #666;">
                    Prueba con otra categoría o vuelve más tarde.
                </p>
            </div>
        `;
        return;
    }

    // Intersection Observer para animación de entrada
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    productosFiltrados.forEach((producto, index) => {
        const card = document.createElement("div");
        card.className = "card";
        card.setAttribute("role", "listitem");

        // Efecto staggered: Retraso dinámico basado en el índice (solo para las primeras 8 para evitar esperas largas)
        const delay = (index % 8) * 0.1;
        card.style.transitionDelay = `${delay}s`;

        // Determinar clase del badge
        let badgeClass = "";
        if (producto.badge) {
            if (producto.badge.toLowerCase().includes("nuevo")) badgeClass = "nuevo";
            else if (producto.badge.toLowerCase().includes("vendido")) badgeClass = "masvendido";
            else if (producto.badge.toLowerCase().includes("edición")) badgeClass = "edicion";
        }

        // Crear HTML de la tarjeta
        card.innerHTML = `
            ${producto.badge ? `<div class="badge ${badgeClass}">${producto.badge}</div>` : ''}
            ${index % 4 === 0 ? `<div class="badge escasez">¡Stock Limitado!</div>` : ''}
            <div class="image-container">
                <img src="${producto.imagen}" 
                     alt="${producto.nombre}" 
                     class="card-img"
                     loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNjMGMwYzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4='">
                <div class="zoom-indicator" aria-label="Ampliar imagen">🔍</div>
            </div>
            <div class="card-content">
                <h3 class="card-title">${producto.nombre}</h3>
                <div class="card-price">$${producto.precio.toLocaleString('es-CL')}</div>
                <p class="card-description">${producto.descripcion || 'Diseño exclusivo de alta costura.'}</p>
                <div class="card-actions">
                    <button class="btn-agregar-carrito" data-id="${producto.id}" aria-label="Agregar al carrito">
                        <span>🛒</span> Reservar
                    </button>
                    <button class="btn-reserva" data-id="${producto.id}" aria-label="Reservar por WhatsApp">
                        <span>💬</span> ¡Lo quiero!
                    </button>
                </div>
            </div>
        `;

        catalogo.appendChild(card);
        observer.observe(card);

        // Eventos para esta tarjeta
        const cardImg = card.querySelector('.zoom-indicator');
        const cardBtn = card.querySelector('.btn-reserva');
        const cardCarritoBtn = card.querySelector('.btn-agregar-carrito');

        // Necesitamos encontrar el índice real en el array completo para el zoom
        const realIndex = productos.findIndex(p => p.id === producto.id);

        cardImg.addEventListener('click', () => abrirZoom(realIndex));
        cardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirWhatsApp(producto);
        });
        cardCarritoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            agregarAlCarrito(producto.id);
        });
    });
}

function abrirZoom(index) {
    currentZoomIndex = index;
    navegarZoomDirecto(currentZoomIndex);
}

function navegarZoomDirecto(index) {
    if (index < 0 || index >= productos.length) return;

    currentZoomIndex = index;
    const producto = productos[currentZoomIndex];

    // Animación de transición
    zoomImg.classList.remove("showZoom");

    setTimeout(() => {
        zoomImg.src = producto.imagen;
        zoomNombre.textContent = producto.nombre;
        zoomPrecio.textContent = `$${producto.precio.toLocaleString('es-CL')}`;

        if (producto.badge) {
            let badgeClass = "";
            if (producto.badge.toLowerCase().includes("nuevo")) badgeClass = "nuevo";
            else if (producto.badge.toLowerCase().includes("vendido")) badgeClass = "masvendido";
            else if (producto.badge.toLowerCase().includes("edición")) badgeClass = "edicion";

            zoomBadge.textContent = producto.badge;
            zoomBadge.className = `zoom-badge ${badgeClass}`;
            zoomBadge.style.display = "inline-block";
        } else {
            zoomBadge.style.display = "none";
        }

        zoomDescripcion.textContent = producto.descripcion || "Producto exclusivo de nuestra boutique.";

        // Actualizar detalles
        zoomDetalles.innerHTML = '';
        if (producto.detalles && producto.detalles.length > 0) {
            producto.detalles.forEach(detalle => {
                const li = document.createElement('li');
                li.textContent = detalle;
                zoomDetalles.appendChild(li);
            });
        } else {
            // Detalles por defecto
            const detallesDefault = {
                'Vestido': ['Tallas disponibles: S, M, L', 'Material premium', 'Entrega en 3-5 días'],
                'Short': ['Tallas: 26-32', 'Denim resistente', 'Entrega rápida'],
                'Blusa': ['Tallas: S, M, L', 'Tela suave', 'Diseño exclusivo'],
                'Palazo': ['Talla única', 'Ajuste perfecto', 'Tela ligera']
            };
            const detalles = detallesDefault[producto.categoria] || ['Alta calidad', 'Diseño exclusivo'];
            detalles.forEach(detalle => {
                const li = document.createElement('li');
                li.textContent = detalle;
                zoomDetalles.appendChild(li);
            });
        }

        // Actualizar progreso
        actualizarProgresoZoom();

        // Actualizar recomendaciones similares
        actualizarRecomendaciones(producto);

        // Mostrar zoom modal si no está visible
        if (!zoomGaleria.classList.contains("show")) {
            zoomGaleria.classList.add("show");
            document.body.style.overflow = "hidden";
        }

        setTimeout(() => {
            zoomImg.classList.add("showZoom");
        }, 50);
    }, 300);
}

function actualizarProgresoZoom() {
    zoomProgress.innerHTML = '';
    productos.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `progress-dot ${index === currentZoomIndex ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            navegarZoomDirecto(index);
        });
        zoomProgress.appendChild(dot);
    });
}

function cerrarZoom() {
    zoomGaleria.classList.remove("show");
    document.body.style.overflow = "auto";
    zoomImg.classList.remove("showZoom");
}

function navegarZoom(direccion) {
    const totalProductos = productos.length;

    if (direccion === 'next') {
        currentZoomIndex = (currentZoomIndex + 1) % totalProductos;
    } else {
        currentZoomIndex = (currentZoomIndex - 1 + totalProductos) % totalProductos;
    }

    navegarZoomDirecto(currentZoomIndex);
}

function actualizarRecomendaciones(productoActual) {
    if (!recommendationsGrid) return;
    recommendationsGrid.innerHTML = '';

    // Filtrar productos de la misma categoría que no sean el actual
    const similares = productos
        .filter(p => p.categoria === productoActual.categoria && p.id !== productoActual.id)
        .sort(() => 0.5 - Math.random()) // Mezclar aleatoriamente
        .slice(0, 3); // Tomar solo 3

    if (similares.length < 3) {
        // Si hay pocos de la misma categoría, rellenar con otros aleatorios
        const yaIncluidos = similares.map(p => p.id);
        yaIncluidos.push(productoActual.id);

        const otros = productos
            .filter(p => !yaIncluidos.includes(p.id))
            .sort(() => 0.5 - Math.random())
            .slice(0, 3 - similares.length);
        similares.push(...otros);
    }

    similares.forEach(prod => {
        const item = document.createElement('div');
        item.className = 'rec-item';
        item.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}" loading="lazy">
            <div class="rec-item-info">${prod.nombre}</div>
        `;
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = productos.findIndex(p => p.id === prod.id);
            if (index !== -1) navegarZoomDirecto(index);
        });
        recommendationsGrid.appendChild(item);
    });
}

function abrirWhatsApp(producto) {
    const mensaje = `Hola, estoy interesado/a en el producto:\n\n` +
        `*${producto.nombre}*\n` +
        `Precio: $${producto.precio.toLocaleString('es-CL')}\n\n` +
        `¿Podrías darme más información sobre disponibilidad?`;

    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// ===== CARRITO DE COMPRAS =====
function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const itemExistente = carrito.find(item => item.id === productoId);

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarCarritoUI();

    // Feedback visual
    const boton = document.querySelector(`.btn-agregar-carrito[data-id="${productoId}"]`);
    if (boton) {
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = '<span>✅</span> Agregado';
        boton.style.background = '#4CAF50';
        setTimeout(() => {
            boton.innerHTML = textoOriginal;
            boton.style.background = '';
        }, 2000);
    }
}

function actualizarCarritoUI() {
    // Actualizar contador
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    carritoCount.textContent = totalItems;

    // Actualizar lista del carrito
    carritoItems.innerHTML = '';

    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p style="text-align: center; color: #666;">Tu carrito está vacío</p>';
        carritoTotal.textContent = '0';
        return;
    }

    let total = 0;

    carrito.forEach(item => {
        const itemTotal = item.precio * item.cantidad;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'carrito-item';
        div.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}">
            <div class="carrito-item-info">
                <div class="carrito-item-titulo">${item.nombre}</div>
                <div class="carrito-item-precio">$${item.precio.toLocaleString('es-CL')}</div>
            </div>
            <div class="carrito-item-cantidad">
                <button class="decrementar" data-id="${item.id}">-</button>
                <span>${item.cantidad}</span>
                <button class="incrementar" data-id="${item.id}">+</button>
            </div>
        `;

        carritoItems.appendChild(div);
    });

    carritoTotal.textContent = total.toLocaleString('es-CL');

    // Agregar eventos a los botones de cantidad
    document.querySelectorAll('.incrementar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = carrito.find(item => item.id === id);
            if (item) {
                item.cantidad += 1;
                localStorage.setItem("carrito", JSON.stringify(carrito));
                actualizarCarritoUI();
            }
        });
    });

    document.querySelectorAll('.decrementar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const itemIndex = carrito.findIndex(item => item.id === id);
            if (itemIndex !== -1) {
                if (carrito[itemIndex].cantidad > 1) {
                    carrito[itemIndex].cantidad -= 1;
                } else {
                    carrito.splice(itemIndex, 1);
                }
                localStorage.setItem("carrito", JSON.stringify(carrito));
                actualizarCarritoUI();
            }
        });
    });
}

function vaciarCarrito() {
    if (carrito.length === 0) return;

    if (confirm('¿Estás seguro de vaciar el carrito?')) {
        carrito = [];
        localStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarCarritoUI();
    }
}

function comprarCarrito() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    let mensaje = "Hola, quiero realizar el siguiente pedido:\n\n";
    let total = 0;

    carrito.forEach(item => {
        const itemTotal = item.precio * item.cantidad;
        total += itemTotal;
        mensaje += `- ${item.nombre} (x${item.cantidad}): $${itemTotal.toLocaleString('es-CL')}\n`;
    });

    mensaje += `\n*Total: $${total.toLocaleString('es-CL')}*`;
    mensaje += `\n\nPor favor, contactenme para coordinar el pago y envío.`;

    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// ===== INSTAGRAM FEED =====
function cargarInstagramFeed() {
    const imagenes = [
        "https://i.ibb.co/0pgLs2ds/Ajustes-de-Imagen-15.jpg",
        "https://i.ibb.co/Z1YdX5vt/Ajustes-de-Imagen-14.jpg",
        "https://i.ibb.co/bjXyPNCW/Ajustes-de-Imagen-13.jpg",
        "https://i.ibb.co/WWz6y4By/Ajustes-de-Imagen-12.jpg",
        "https://i.ibb.co/LhtVL4F1/Ajustes-de-Imagen-11.jpg",
        "https://i.ibb.co/HDv2Pzpy/Ajustes-de-Imagen-8.jpg"
    ];

    if (instagramFeed) {
        instagramFeed.innerHTML = '';
        imagenes.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'instagram-item';
            item.innerHTML = `<img src="${img}" alt="Publicación de Instagram ${index + 1}" loading="lazy">`;
            instagramFeed.appendChild(item);
        });
    }
}

// CRUD Realtime Database
async function agregarProducto(e) {
    if (e) e.preventDefault();
    const submitBtn = productForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    const nuevoProducto = {
        id: Date.now(),
        nombre: document.getElementById('productName').value,
        precio: parseInt(document.getElementById('productPrice').value),
        categoria: document.getElementById('productCategory').value,
        descripcion: document.getElementById('productDescription').value,
        imagen: productImage.value || 'https://via.placeholder.com/300',
        badge: document.getElementById('productBadge').value,
        detalles: document.getElementById('productDetails').value.split('\n').filter(d => d.trim() !== '') || ["Consultar"]
    };

    try {
        await db.ref("productos").push(nuevoProducto);
        productForm.reset();
        if (urlImagePreview) urlImagePreview.classList.add('hidden');
        if (fileImagePreview) fileImagePreview.classList.add('hidden');
        alert('✅ ¡Producto subido a la nube!');
    } catch (error) {
        console.error("Error al guardar:", error);
        alert('❌ Error al guardar en Firebase: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Agregar Producto';
    }
}

async function actualizarProducto(e) {
    if (e) e.preventDefault();
    const updateBtn = document.getElementById('updateProduct');
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    const id = parseInt(productId.value);
    const prodRef = productos.find(p => p.id === id);

    if (!prodRef || !prodRef.firestoreId) {
        alert("Error: No se pudo encontrar el ID en la base de datos");
        updateBtn.disabled = false;
        updateBtn.textContent = 'Actualizar Producto';
        return;
    }

    const productoEditado = {
        nombre: document.getElementById('productName').value,
        precio: parseInt(document.getElementById('productPrice').value),
        categoria: document.getElementById('productCategory').value,
        descripcion: document.getElementById('productDescription').value,
        imagen: productImage.value,
        badge: document.getElementById('productBadge').value,
        detalles: document.getElementById('productDetails').value.split('\n').filter(d => d.trim() !== '')
    };

    try {
        await db.ref("productos").child(prodRef.firestoreId).update(productoEditado);
        alert('✅ Producto actualizado correctamente');
        cancelarEdicion();
    } catch (error) {
        console.error("Error al actualizar:", error);
        alert('❌ Error al actualizar en Firebase');
    } finally {
        updateBtn.disabled = false;
        updateBtn.textContent = 'Actualizar Producto';
    }
}

async function eliminarProducto(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto permanentemente de la nube?')) {
        const prod = productos.find(p => p.id === id);
        if (prod && prod.firestoreId) {
            try {
                await db.ref("productos").child(prod.firestoreId).remove();
                alert('🗑️ Producto eliminado de la nube');
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert('❌ Error al eliminar de Firebase');
            }
        }
    }
}


async function eliminarProducto(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto permanentemente de la nube?')) {
        const prod = productos.find(p => p.id === id);
        if (prod && prod.firestoreId) {
            try {
                await db.collection("productos").doc(prod.firestoreId).delete();
                alert('🗑️ Producto eliminado');
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert('❌ Error al eliminar');
            }
        }
    }
}

// ===== ADMIN FUNCTIONS =====
function renderProductList() {
    if (!productList) return;

    productList.innerHTML = '';

    if (productos.length === 0) {
        productList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No hay productos</p>';
        return;
    }

    productos.forEach((producto, index) => {
        const item = document.createElement('div');
        item.className = `product-item ${editingProductId === producto.id ? 'editing' : ''}`;

        item.innerHTML = `
            <div class="product-item-info">
                <strong>${producto.nombre}</strong>
                <small>${producto.categoria} - $${producto.precio.toLocaleString('es-CL')}</small>
                ${producto.badge ? `<div style="margin-top: 5px;"><span class="badge ${getBadgeClass(producto.badge)}" style="font-size: 0.7rem; padding: 3px 8px;">${producto.badge}</span></div>` : ''}
            </div>
            <div class="product-item-actions">
                <button class="btn-editar" data-id="${producto.id}" 
                        aria-label="Editar producto ${producto.nombre}">
                    ✏️ Editar
                </button>
                <button class="btn-eliminar" data-id="${producto.id}" 
                        aria-label="Eliminar producto ${producto.nombre}">
                    🗑️ Eliminar
                </button>
            </div>
        `;

        productList.appendChild(item);
    });

    // Event Listeners Dinámicos
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.dataset.id);
            editarProducto(id);
        });
    });

    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.dataset.id);
            eliminarProducto(id);
        });
    });
}

function getBadgeClass(badgeText) {
    if (!badgeText) return "";
    if (badgeText.toLowerCase().includes("nuevo")) return "nuevo";
    else if (badgeText.toLowerCase().includes("vendido")) return "masvendido";
    else if (badgeText.toLowerCase().includes("edición")) return "edicion";
    return "";
}

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    editingProductId = id;
    productId.value = id;
    isEditing.value = "true";

    modoEdicion.style.display = "block";
    formButtons.style.display = "none";
    editButtons.style.display = "flex";

    // Cargar datos
    document.getElementById('productName').value = producto.nombre;
    document.getElementById('productPrice').value = producto.precio;

    // Imagen
    if (producto.imagen.startsWith('data:')) {
        imageType.value = "file";
        filePreviewImage.src = producto.imagen;
        fileImagePreview.style.display = 'block';
        productImage.value = producto.imagen;
        productImageUrl.value = '';
        urlImagePreview.style.display = 'none';
        urlPreviewImage.src = '';
    } else {
        imageType.value = "url";
        productImageUrl.value = producto.imagen;
        urlPreviewImage.src = producto.imagen;
        urlImagePreview.style.display = 'block';
        productImage.value = producto.imagen;
        fileImagePreview.style.display = 'none';
        filePreviewImage.src = '';
    }

    document.getElementById('productCategory').value = producto.categoria;
    document.getElementById('productBadge').value = producto.badge || '';
    document.getElementById('productDescription').value = producto.descripcion || '';

    document.querySelector('.admin-form').scrollTop = 0;
    renderProductList();
    mostrarEstadoURL('Modo edición activo.', 'url-exitosa');
}

function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        const index = productos.findIndex(p => p.id === id);
        if (index !== -1) {
            productos.splice(index, 1);
            // No saved to local storage anymore, we rely on Download button manually
            // BUT for immediate session experience, we still update variable
            renderCatalogo();
            renderProductList();
        }

        const carritoIndex = carrito.findIndex(item => item.id === id);
        if (carritoIndex !== -1) {
            carrito.splice(carritoIndex, 1);
            localStorage.setItem("carrito", JSON.stringify(carrito));
            actualizarCarritoUI();
        }

        if (editingProductId === id) {
            cancelarEdicion();
        }
    }
}

function cancelarEdicion() {
    editingProductId = null;
    productId.value = '';
    isEditing.value = "false";

    modoEdicion.style.display = "none";
    formButtons.style.display = "flex";
    editButtons.style.display = "none";

    productForm.reset();
    urlImagePreview.style.display = 'none';
    fileImagePreview.style.display = 'none';
    urlPreviewImage.src = '';
    filePreviewImage.src = '';
    productImage.value = '';
    productImageUrl.value = '';
    imageType.value = "url";
    mostrarEstadoURL('', '');

    renderProductList();
}

// ===== EXPORTAR CATÁLOGO JS =====
// ===== EXPORTAR CATÁLOGO JS =====
window.exportarCatalogoJS = function () {
    if (!productos || productos.length === 0) {
        alert("No hay productos para exportar.");
        return;
    }

    // Crear contenido del archivo JS
    const jsonContent = JSON.stringify(productos, null, 2);
    // Asignamos a window.productsData para que sea global
    const jsContent = `window.productsData = ${jsonContent};`;

    const dataStr = "data:text/javascript;charset=utf-8," + encodeURIComponent(jsContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "products.js");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    alert("Archivo 'products.js' descargado. Reemplaza el archivo existente en tu carpeta del proyecto.");
};

// ===== FUNCIONES PARA CARGA DE IMÁGENES =====
function configurarCargaImagenes() {
    if (loadUrlButton) loadUrlButton.addEventListener('click', cargarImagenDesdeURL);

    if (productImageUrl) {
        productImageUrl.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                cargarImagenDesdeURL();
            }
        });

        productImageUrl.addEventListener('input', function () {
            imageType.value = "url";
            if (fileImagePreview) fileImagePreview.style.display = 'none';
            if (filePreviewImage) filePreviewImage.src = '';
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            imageType.value = "file";
            if (urlImagePreview) urlImagePreview.style.display = 'none';
            if (urlPreviewImage) urlPreviewImage.src = '';
            if (productImageUrl) productImageUrl.value = '';

            // Handle file selection
            if (this.files.length > 0) {
                const file = this.files[0];
                const reader = new FileReader();
                reader.onload = function (e) {
                    filePreviewImage.src = e.target.result;
                    fileImagePreview.style.display = 'block';
                    productImage.value = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (uploadButton) {
        uploadButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (fileInput) fileInput.click();
        });
    }
}

// Función Global para ser llamada desde HTML
window.cargarImagenDesdeURL = function () {
    // Buscar elementos directamente para asegurar que existan
    const inputUrl = document.getElementById("productImageUrl");
    const imgPreview = document.getElementById("urlPreviewImage");
    const containerPreview = document.getElementById("urlImagePreview");
    const inputHidden = document.getElementById("productImage");
    const inputType = document.getElementById("imageType");
    const statusDiv = document.getElementById("urlStatus");

    // Función local para mostrar mensajes
    const mostrarMsg = (msg, tipo) => {
        if (statusDiv) {
            statusDiv.textContent = msg;
            statusDiv.className = tipo || '';
            statusDiv.style.display = 'block';
        } else {
            console.log(msg); // Fallback
        }
    };

    if (!inputUrl) {
        alert("Error crítico: No se encuentra el campo de texto 'productImageUrl'.");
        return;
    }

    const url = inputUrl.value.trim();

    if (!url) {
        mostrarMsg('Por favor, ingresa una URL de imagen válida', 'url-error');
        alert("Por favor, ingresa una URL.");
        return;
    }

    if (url.includes('ibb.co') && !url.includes('i.ibb.co')) {
        mostrarMsg('⚠️ Es un enlace de visor. Usa el "Enlace directo" de ImgBB.', 'url-warning');
        alert('⚠️ Parece un enlace de visor. Usa el "Enlace directo" de ImgBB.');
        return;
    }

    mostrarMsg('Cargando imagen...', 'url-cargando');
    if (imgPreview) imgPreview.src = '';
    if (containerPreview) containerPreview.style.display = 'block';

    const imgTest = new Image();
    imgTest.crossOrigin = "Anonymous";

    imgTest.onload = function () {
        if (imgPreview) imgPreview.src = url;
        if (inputHidden) inputHidden.value = url;
        if (inputType) inputType.value = "url";
        mostrarMsg('✅ Imagen cargada correctamente', 'url-exitosa');
    };

    imgTest.onerror = function () {
        mostrarMsg('❌ Error al cargar. Verifica que el enlace sea directo.', 'url-error');
        if (containerPreview) containerPreview.style.display = 'none';
        alert("No se pudo cargar la imagen. Verifica el enlace.");
    };

    imgTest.src = url;
};

function mostrarEstadoURL(mensaje, tipo) {
    const statusDiv = document.getElementById('urlStatus');
    if (statusDiv) {
        statusDiv.textContent = mensaje;
        statusDiv.className = '';
        if (tipo) statusDiv.classList.add(tipo);
        statusDiv.style.display = mensaje ? 'block' : 'none';
    }
}

// ===== SEGURIDAD =====
async function checkPassword(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex === ADMIN_HASH;
}

// ===== SETUP EVENTS =====
function setupEventListeners() {
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            if (this.classList.contains('instagram-tab')) return;
            if (this.id === 'btnAdmin') {
                loginModal.classList.add('active');
                return;
            }

            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filtroActual = this.dataset.categoria;
            renderCatalogo();
        });
    });

    // Zoom
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    if (prev) prev.addEventListener('click', () => navegarZoom('prev'));
    if (next) next.addEventListener('click', () => navegarZoom('next'));

    const closeZoom = document.querySelector('.close-zoom');
    if (closeZoom) closeZoom.addEventListener('click', cerrarZoom);
    if (zoomGaleria) zoomGaleria.addEventListener('click', (e) => {
        if (e.target === zoomGaleria) cerrarZoom();
    });

    if (btnReserva) btnReserva.addEventListener('click', () => {
        const producto = productos[currentZoomIndex];
        abrirWhatsApp(producto);
    });

    // Carrito
    if (carritoBtn) carritoBtn.addEventListener('click', () => carritoModal.classList.add('active'));
    if (carritoModal) carritoModal.addEventListener('click', (e) => {
        if (e.target === carritoModal) carritoModal.classList.remove('active');
    });

    if (vaciarCarritoBtn) vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
    if (comprarCarritoBtn) comprarCarritoBtn.addEventListener('click', comprarCarrito);

    // Login
    const cancelLogin = document.getElementById('cancelLogin');
    if (cancelLogin) cancelLogin.addEventListener('click', () => loginModal.classList.remove('active'));

    if (loginForm) loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = "jose.nunez.galleani@gmail.com";
        const password = document.getElementById('adminPassword').value;
        console.log("🔑 Intentando login con:", email);

        const loginBtn = loginForm.querySelector('button[type="submit"]');
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';

        try {
            await auth.signInWithEmailAndPassword(email, password);
            loginModal.classList.remove('active');
            adminModal.classList.add('active');
            loginForm.reset();
        } catch (error) {
            console.error("Login Error:", error);
            alert('❌ Error de autenticación: ' + error.message);
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Entrar al Panel';
        }
    });

    // Admin
    const cancelAdmin = document.getElementById('cancelAdmin');
    if (cancelAdmin) cancelAdmin.addEventListener('click', () => {
        adminModal.classList.remove('active');
        cancelarEdicion();
    });

    if (adminModal) adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.classList.remove('active');
            cancelarEdicion();
        }
    });

    if (cancelEditBtn) cancelEditBtn.addEventListener('click', cancelarEdicion);

    if (productForm) productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('productName').value.trim();
        const precio = parseInt(document.getElementById('productPrice').value);
        const imagen = document.getElementById('productImage').value.trim();
        const editing = isEditing.value === "true";

        if (!nombre || !precio || !imagen) {
            alert('Completa todos los campos obligatorios.');
            return;
        }

        const nuevoProducto = {
            id: editing ? parseInt(productId.value) : (Date.now()), // ID simple con timestamp
            nombre,
            precio,
            imagen,
            categoria: document.getElementById('productCategory').value,
            badge: document.getElementById('productBadge').value,
            descripcion: document.getElementById('productDescription').value || 'Producto boutique.',
            detalles: ["Consultar detalles"]
        };

        if (editing) {
            const index = productos.findIndex(p => p.id === nuevoProducto.id);
            if (index !== -1) productos[index] = nuevoProducto;
        } else {
            productos.push(nuevoProducto);
        }

        renderCatalogo();
        renderProductList();

        if (!editing) {
            productForm.reset();
            mostrarEstadoURL('', '');
            if (urlPreviewImage) urlPreviewImage.src = '';
            if (urlImagePreview) urlImagePreview.style.display = 'none';
        } else {
            cancelarEdicion();
            setTimeout(() => {
                adminModal.classList.remove('active');
            }, 500);
        }

        alert(editing ? "Producto actualizado." : "Producto agregado.");
    });

    // Download Button Logic - New for Static Workflow
    if (downloadCatalogBtn) {
        downloadCatalogBtn.addEventListener('click', exportarCatalogoJS);
    }
}

// ===== NEUROMARKETING: NOTIFICACIONES DE VENTAS =====
function iniciarNotificacionesVentas() {
    const nombres = ["María", "Claudia", "Fernanda", "Javiera", "Valentina", "Pola", "Andrea"];
    const comunas = ["Santiago", "Las Condes", "Vitacura", "Providencia", "Ñuñoa", "Lo Barnechea"];

    const toast = document.getElementById('salesToast');
    const toastImg = document.getElementById('salesToastImg');
    const toastTitle = document.getElementById('salesToastTitle');
    const toastText = document.getElementById('salesToastText');

    if (!toast) return;

    function mostrarRandom() {
        if (productos.length === 0) return;

        const randomProd = productos[Math.floor(Math.random() * productos.length)];
        const randomNombre = nombres[Math.floor(Math.random() * nombres.length)];
        const randomComuna = comunas[Math.floor(Math.random() * comunas.length)];

        toastImg.src = randomProd.imagen;
        toastTitle.textContent = `${randomNombre} de ${randomComuna}`;
        toastText.textContent = `Acaba de reservar un ${randomProd.nombre}`;

        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 5000);
    }

    // Mostrar la primera a los 10 segundos
    setTimeout(() => {
        mostrarRandom();
        // Luego cada 30-60 segundos
        setInterval(mostrarRandom, Math.random() * (60000 - 30000) + 30000);
    }, 10000);
}

function mejorarResponsiveCarrito() {
    // Implementar si es necesario ajustes adicionales
}


// ===== UTILIDAD DE MIGRACIÓN (SÓLO PARA USO INICIAL) =====
async function migrarProductosAFirebase() {
    if (!window.productsData || window.productsData.length === 0) {
        alert("❌ No hay productos locales para migrar.");
        return;
    }

    if (!confirm(`¿Deseas subir ${window.productsData.length} productos a Firebase ahora?`)) return;

    console.log("🚀 Iniciando migración...");
    try {
        const ref = db.ref("productos");
        // Subimos cada uno
        for (const prod of window.productsData) {
            // Limpiamos el objeto por si tiene basura local
            const { firestoreId, ...cleanProd } = prod;
            await ref.push(cleanProd);
            console.log(`✅ Subido: ${prod.nombre}`);
        }
        alert("✨ ¡Migración completada con éxito! Ahora tus productos viven en la nube.");
    } catch (error) {
        console.error("Error migrando:", error);
        alert("❌ Error durante la migración: " + error.message);
    }
}

// Iniciar app
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
