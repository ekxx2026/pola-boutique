# Plan de Mejora SEO (100% Gratuito y Estático)

El objetivo es mejorar la visibilidad en buscadores y redes sociales sin incurrir en costos de servidores. Dado que usamos una arquitectura SPA (Single Page Application) estática en Vercel con Firebase, implementaremos las siguientes estrategias:

## Estrategia

1.  **Meta Etiquetas Dinámicas (Client-Side):**
    *   Google Bot ejecuta Javascript, por lo que actualizaremos `document.title` y las etiquetas `<meta>` (description, og:image) dinámicamente al abrir un producto.
    *   *Nota:* Facebook/WhatsApp a veces no ejecutan JS al escanear enlaces ("scrapers" tontos). Para solucionar esto completamente se requeriría SSR (Next.js), pero mejoraremos lo posible vía JS.

2.  **Datos Estructurados (JSON-LD):**
    *   Inyectaremos un bloque de datos Schema.org (`Product`) en el `head` cuando se visualice un producto. Esto ayuda a Google a entender el precio, stock e imagen para mostrarlos en los resultados de búsqueda (Rich Snippets).

3.  **Sitemap XML Dinámico:**
    *   Crearemos una herramienta en el Panel de Admin para "Generar Sitemap".
    *   El administrador descargará el archivo `sitemap.xml` y lo subirá al repositorio (o carpeta raiz) manualmente. Esto es necesario porque no tenemos un servidor backend generando el XML al vuelo.

## Cambios Propuestos

### 1. Modificar `js/modules/ui.js`

#### [MODIFY] `showZoomModal`
*   Actualizar `document.title` con el nombre del producto.
*   Actualizar `<meta name="description">`.
*   Actualizar `<meta property="og:image">`.
*   Inyectar/Actualizar script JSON-LD con schema `Product`.

#### [MODIFY] `closeZoomModal`
*   Restaurar el título y descripción originales de la página ("Pola Galleani | Boutique").

### 2. Modificar `js/modules/utils.js`

#### [NEW] `generateSitemap(productos)`
*   Función que recibe la lista de productos y genera un string XML cumpliendo el estándar de Google.
*   Incluye URLs canónicas (aunque sean con hash `/#producto-id` o parámetros query si implementamos routing).
*   *Nota:* Actualmente el sitio no usa routing real (URL no cambia al abrir modal). **Mejora Crítica:** Necesitamos implementar un manejo básico de URL (hash routing) para que cada producto tenga un link único (ej. `pola-boutique.com/#/p/123`). Sin esto, el SEO es imposible porque no hay "páginas" individuales que indexar.

### 3. Implementar Hash Routing (Nuevo Requisito Detectado)
Para que el SEO funcione, cada producto DEBE tener una URL única.
*   **Acción:** Implementar lógica en `app.js` para leer el hash de la URL al cargar (ej. `window.location.hash`) y abrir el producto correspondiente automáticamente.
*   **Acción:** Al abrir/cerrar modales, actualizar el hash (`history.pushState`).

## Paso a Paso

1.  **Routing Básico:** Crear lógica en `app.js` para manejar URLs tipo `?id=123` o `#p123`.
2.  **SEO Dinámico:** Integrar la actualización de Meta Tags y JSON-LD en `ui.js`.
3.  **Generador Sitemap:** Agregar botón en Admin para descargar `sitemap.xml`.

## Verificación

*   **Manual:** Navegar a un producto, copiar la URL, abrirla en nueva pestaña incógnita y verificar que se abra el producto.
*   **Herramienta:** Usar la herramienta de prueba de resultados enriquecidos de Google con el código generado.
*   **Código:** Verificar en la consola que los tags `<meta>` cambien al navegar.
