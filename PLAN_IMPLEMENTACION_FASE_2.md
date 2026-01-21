# Plan de Implementación Fase 2: UX de Excelencia

Este plan detalla los cambios técnicos para implementar las mejoras de Experiencia de Usuario aprobadas.

## 1. Notificaciones Toast (Reemplazo de alert)

### CSS (`styles.css`)
*   [NEW] Crear clase `.toast-container` (fixed, bottom-right).
*   [NEW] Crear clase `.toast` con animaciones de entrada/salida (slide-in).
*   Estilos para tipos: `.toast.success`, `.toast.error`, `.toast.info`.

### JS (`js/modules/ui.js`)
*   [NEW] `showToast(message, type)`:
    *   Crea elemento DOM.
    *   Añade al container.
    *   Elimina después de 3 segundos.

### Refactorización (`js/app.js` y `ui.js`)
*   Buscar todos los `alert()` y `confirm()` y reemplazarlos.
    *   *Nota:* Para `confirm()` (ej: borrar producto), usaremos un modal propio simple o el `confirm` nativo por ahora (ya que requiere callback), pero priorizaremos eliminar los `alert` informativos.

## 2. Wishlist (Lista de Deseos)

### JS (`js/modules/wishlist.js` - Nuevo Módulo)
*   **Estado:** Array de IDs guardado en `localStorage` (`pola_wishlist`).
*   **Funciones:** `toggleWishlist(id)`, `isInWishlist(id)`, `getWishlist()`.

### JS (`js/modules/ui.js`)
*   **Renderizado:**
    *   Añadir icono `❤️` (corazón outline/filled) en las tarjetas de producto y modal Zoom.
    *   Actualizar clase CSS al hacer click (`active`).
    *   Animación de "latido" al dar like.

### JS (`js/app.js`)
*   Delegación de eventos para clicks en el corazón.

## 3. Botón Compartir (Share API)

### JS (`js/modules/ui.js`)
*   En `showZoomModal`, añadir botón "Compartir" al lado de "Añadir al Carrito".
*   **Lógica:** Usar `navigator.share()` si está disponible (móviles).
*   **Fallback:** Copiar link al portapapeles y mostrar `showToast("Link copiado")`.

## 4. Skeleton Loading

### CSS (`styles.css`)
*   [NEW] Clase `.skeleton` con animación de brillo (`@keyframes shimmer`).
*   Estilos para `.skeleton-card`, `.skeleton-text`.

### JS (`js/modules/ui.js`)
*   `renderCatalog`: Mostrar tarjetas skeleton mientras `state.productos` está vacío (o en carga inicial ficticia si es muy rápida).
*   `showZoomModal`: Mostrar skeleton de imagen mientras `igm.onload` no se dispare.

---

## Orden de Ejecución

1.  **Toasts:** Base fundamental para feedback visual.
2.  **Wishlist:** Funcionalidad de alto valor.
3.  **Share:** Rápido de implementar.
4.  **Skeleton:** Refinamiento visual final.

## Verificación

*   **Toasts:** Provocar error (login fallido) y éxito (añadir carrito). Verificar animación.
*   **Wishlist:** Dar like, recargar página, verificar persistencia.
*   **Share:** Probar en móvil (menú nativo) y PC (copiar link).
