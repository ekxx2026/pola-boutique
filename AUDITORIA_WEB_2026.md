# Informe de Auditoría Integral: Pola Galleani | Boutique Ultra-Lujo

## 1. Resumen Ejecutivo
El proyecto presenta una base visual sólida con una estética "premium" (Glassmorphism, tipografías elegantes), pero sufre de **vulnerabilidades de seguridad críticas** y una arquitectura monolítica difícil de escalar. La autenticación del panel de administración es insegura (validación en el cliente) y las credenciales de API están expuestas. Técnicamente, depende excesivamente de un solo archivo Javascript (`main.js` > 1300 líneas) y la renderización es puramente client-side, lo que daña el SEO.

**Recomendaciones Prioritarias:**
1.  **Seguridad:** Migrar autenticación de Admin a Firebase Auth (urgente).
2.  **Arquitectura:** Modularizar `main.js` y separar lógica de negocio de la UI.
3.  **SEO:** Implementar pre-renderizado o metaetiquetas dinámicas para que Google indexe los productos.

---

## 2. Lista Priorizada de Problemas y Oportunidades

| Prioridad | Área | Problema Detectado | Evidencia (Código) | Impacto | Coste/Tiempo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CRÍTICA** | **Seguridad** | **Autenticación Falsa (Client-Side)**. El login de administrador verifica el hash de la contraseña en el navegador. | `main.js`: `const ADMIN_HASH = "..."`. Validación lógica expuesta. | **Catastrófico** (Borrado de datos) | Bajo (1-2 días) |
| **Alta** | **Seguridad** | **Credenciales Expuestas**. La API Key de ImgBB está hardcodeada en el código. | `main.js`: `const IMGBB_API_KEY = "..."`. | Medio (Uso malicioso) | Bajo (2 horas) |
| **Alta** | **SEO** | **Contenido Invisible para Bots**. El catálogo se genera 100% con JS. El HTML inicial está vacío. | `index.html`: `<div id="catalogo">` vacío. | Alto (Invisibilidad en Google) | Medio (3-5 días) |
| **Media** | **Arquitectura** | **Código Monolítico**. `main.js` mezcla lógica de carrito, admin, UI, Firebase y eventos. | `main.js` posee +1300 líneas y funciones globales. | Medio (Deuda técnica) | Medio (5-7 días) |
| **Media** | **UX / Performance** | **Pantalla de Carga Artificial**. Se fuerza una espera de casi 1.3s aunque la web cargue rápido. | `main.js`: `setTimeout` anidado en `init`. | Medio (Fricción innecesaria) | Muy Bajo (30 min) |
| **Media** | **Accesibilidad** | **Fallas en Interacción**. Navegación por teclado deficiente en modales (Zoom, Carrito). | Ausencia de `trapFocus` en modales. | Medio (Exclusión usuarios) | Medio (2 días) |

---

## 3. Plan de Acción (Top 3 Prioridades)

### Prioridad 1: Blindaje de Seguridad (Urgente)
**Objetivo:** Eliminar la validación de contraseña en el cliente y asegurar la subida de archivos.
*   **Rol:** Backend/Fullstack Dev.
*   **Tiempo:** 1-2 Días.

1.  **Activar Firebase Auth:** En la consola de Firebase, habilitar "Email/Password".
2.  **Refactorizar Login:** Reemplazar el formulario de `ADMIN_HASH` por `firebase.auth().signInWithEmailAndPassword()`.
3.  **Proteger Base de Datos:** Configurar **Security Rules** en Firestore/Realtime DB:
    ```json
    {
      "rules": {
        ".read": true,
        ".write": "auth != null"
      }
    }
    ```
4.  **Ocultar API ImgBB:** Restringir la API Key por dominio (HTTP Referrer) en el panel de ImgBB.

### Prioridad 2: Migración a Arquitectura Modular
**Objetivo:** Hacer el código mantenible y escalable.
*   **Rol:** Frontend Dev.
*   **Tiempo:** 1 Semana.

1.  **Separación de Archivos:** Dividir `main.js` en módulos ES6:
    *   `modules/auth.js`
    *   `modules/cart.js`
    *   `modules/api.js`
    *   `modules/ui.js`
2.  **Eliminar Globales:** Usar `addEventListener` y export/import en lugar de asignar funciones a `window`.

### Prioridad 3: SEO y Visibilidad
**Objetivo:** Que Google indexe los productos.
*   **Rol:** SEO/Frontend.
*   **Tiempo:** 3-4 Días.

1.  **Meta Datos Dinámicos:** Actualizar `document.title` y `meta description` con JS al abrir vistas de detalle.
2.  **Sitemap:** Generar un `sitemap.xml` dinámico o actualizado periódicamente.
3.  **Datos Estructurados:** Inyectar JSON-LD de tipo `Product` dinámicamente.

---

## 4. Propuestas de Diseño y Copy

**Problema:** El copy actual es genérico ("Ropa al alcance de todos" choca con "Ultra-Lujo").
**Propuesta:** Enfocarse en *lujo accesible*.

**Propuesta A (Header):**
*   *Actual:* "BOUTIQUE ULTRA-LUJO | ROPA AL ALCANCE DE TODOS"
*   *Propuesta:* "POLA GALLEANI | **Lujo Accesible**"
*   *Subtítulo:* "Diseño de alta costura, precios reales."

**Propuesta B (Call to Action - WhatsApp):**
*   *Actual:* "Reservar por WhatsApp"
*   *Propuesta:* "✨ **Agendar Asesoría**"

---

## 5. Checklist Técnico y de Implementación

**Seguridad**
- [ ] Implementar Firebase Authentication.
- [ ] Configurar Security Rules en Firebase.
- [ ] Restringir API Key de ImgBB.
- [ ] Eliminar `ADMIN_HASH`.

**Rendimiento & UX**
- [ ] Eliminar `setTimeout` del Loading Screen.
- [ ] Implementar imágenes WebP.
- [ ] Persistencia robusta del carrito (validar stock al cargar).
- [ ] Toast de error/éxito visible.

---

## 6. Ideas de Tests A/B

**Test 1: Botón de Compra**
*   **Hipótesis:** "Comprar" directo funciona mejor que "Reservar".
*   **A:** "Reservar (WhatsApp)"
*   **B:** "Añadir a Bolsa" -> WhatsApp con pedido armado.
*   **Métrica:** % de mensajes enviados.

**Test 2: Orden del Catálogo**
*   **Hipótesis:** "Más Vendidos" primero aumenta el ticket.
*   **Métrica:** Valor total de pedidos.
