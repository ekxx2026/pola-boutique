# Plan de Implementación: CRO - Optimización Funnel WhatsApp

## Objetivo
Aumentar la conversión de "Carrito → WhatsApp" del 8% actual al 12% (+50%) implementando un mensaje pre-rellenado automático que elimine la fricción de redactar manualmente el pedido.

## Cambios Propuestos

### 1. **cart.js** - Nueva función de generación de mensaje
**Archivo:** `js/modules/cart.js`

Añadir función `generarEnlaceWhatsApp()` que:
- Extrae productos del carrito
- Construye mensaje formateado con:
  - Saludo personalizado
  - Lista de productos con cantidades y precios
  - Total calculado
  - Link de la tienda
  - Call to action (pregunta sobre proceso de compra)
- Retorna URL de WhatsApp con mensaje encoded

**Código a añadir:**
```javascript
export function generarEnlaceWhatsApp() {
    const productos = getCart();
    const WHATSAPP_NUMERO = '56962281579';
    
    let mensaje = "Hola Pola Galleani! 👋\n\n";
    mensaje += "Me interesa comprar:\n";
    
    productos.forEach(p => {
        mensaje += `• ${p.nombre} (x${p.cantidad}) - $${formatPrice(p.precio * p.cantidad)}\n`;
    });
    
    mensaje += `\n💰 Total: $${formatPrice(getCartTotal())} CLP\n\n`;
    mensaje += `📦 Link: ${window.location.origin}\n`;
    mensaje += "¿Cuál es el proceso de compra?";
    
    const encoded = encodeURIComponent(mensaje);
    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encoded}`;
}
```

**Notas:**
- Requiere importar `formatPrice` de Utils
- Usar número de WhatsApp existente (56962281579)

### 2. **app.js** - Actualizar evento del botón "Comprar"
**Archivo:** `js/app.js`

Modificar el handler del botón `#comprarCarrito` para:
- Llamar a `Cart.generarEnlaceWhatsApp()`
- Abrir en nueva ventana
- (Placeholder para Analytics - se implementará en Fase 3.2)

**Ubicación:** Función `setupGlobalEvents()`, línea ~267

**Cambio:**
```javascript
// ANTES (no existe actualmente, tendremos que añadirlo)
// DESPUÉS:
const comprarBtn = document.getElementById('comprarCarrito');
if (comprarBtn) {
    comprarBtn.onclick = () => {
        if (Cart.getCart().length === 0) {
            UI.showToast('El carrito está vacío', 'error');
            return;
        }
        
        const whatsappUrl = Cart.generarEnlaceWhatsApp();
        window.open(whatsappUrl, '_blank');
        
        // Placeholder para Analytics (Fase 3.2)
        // gtag('event', 'begin_checkout', {...});
        
        UI.showToast('Redirigiendo a WhatsApp...', 'info');
    };
}
```

### 3. **utils.js** - Exportar formatPrice (si no está)
**Archivo:** `js/modules/utils.js`

Verificar que `formatPrice` esté exportado. Si no:
```javascript
export function formatPrice(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
```

### 4. **index.html** - Verificar botón existe
**Archivo:** `index.html`

Verificar que el botón `#comprarCarrito` existe en el modal del carrito.
Si no existe, añadirlo.

---

## Verificación

### Test Manual 1: Mensaje generado correctamente
**Pasos:**
1. Abrir sitio local en navegador
2. Añadir 2-3 productos al carrito
3. Abrir modal del carrito
4. Click en "Completar Pedido"
5. Verificar que se abre WhatsApp Web en nueva ventana
6. **Criterio de éxito:** El mensaje debe contener:
   - Saludo "Hola Pola Galleani! 👋"
   - Lista de productos con nombre, cantidad y precio
   - Total calculado correcto
   - Link a la tienda
   - Pregunta final sobre proceso

### Test Manual 2: Carrito vacío
**Pasos:**
1. Vaciar carrito
2. Click en "Completar Pedido"
3. **Criterio de éxito:** Debe aparecer Toast "El carrito está vacío"

### Test Manual 3: Caracteres especiales
**Pasos:**
1. Añadir productos con nombres que incluyan: á, é, í, ó, ú, ñ, ü
2. Proceder a WhatsApp
3. **Criterio de éxito:** Mensaje debe verse correctamente (sin caracteres raros)

### Test de Regresión
**Verificar que NO se rompan:**
- [ ] Añadir productos al carrito (debe seguir funcionando)
- [ ] Actualizar cantidades (+/-)
- [ ] Vaciar carrito
- [ ] Cerrar modal del carrito

---

## Estimación
- **Tiempo de implementación:** 3-4 horas
- **Complejidad:** Baja (solo lógica de string formatting)
- **Riesgo:** Bajo

---

## Métricas de Éxito (Post-Deploy)
- **Baseline actual:** 8% de usuarios que abren el carrito hacen click en WhatsApp
- **Target:** 12% (+50% improvement)
- **Medición:** Pendiente setup de Analytics en Fase 3.2

**Proxy metrics (inmediatas):**
- Click-through rate en botón "Completar Pedido"
- Feedback cualitativo del usuario (pruebas con 5 usuarios)

---

## Dependencias
- ✅ `UI.showToast()` ya implementado (Fase 2)
- ✅ `Cart.getCart()` ya existente
- ❓ `formatPrice()` - verificar si está en Utils
- ❓ Botón `#comprarCarrito` - verificar si existe en HTML

---

## Próximos Pasos (No en esta fase)
- Fase 3.2: Añadir tracking GA4 del evento `begin_checkout`
- Fase 3.2: Implementar A/B test (mensaje actual vs pre-rellenado)
- Futuro: Añadir "Compartir carrito por email/SMS"
