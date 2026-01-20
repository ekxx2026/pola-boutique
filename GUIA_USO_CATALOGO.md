# Guía de Gestión del Catálogo Pola Galleani

Esta guía explica cómo mantener actualizado tu catálogo de productos utilizando el sistema gratuito y estático que hemos implementado.

## 1. Acceso al Panel de Administración
- Ve al pie de página de la web y haz clic en el enlace **"Admin"**.
- Ingresa la contraseña de administrador (por defecto: `admin123`).

## 2. Gestión de Imágenes (ImgBB)
Como el sitio es estático, las imágenes deben estar alojadas en internet. Usaremos **ImgBB** (es gratis).

1. Ve a [https://es.imgbb.com/](https://es.imgbb.com/).
2. Haz clic en "Comienza a subir" y selecciona tu foto.
3. En "No eliminar automáticamente", déjalo así.
4. Una vez subida, en el menú desplegable "Códigos de inserción", elige **"Enlace directo"** (Viewer links NO, HTML NO, BBCode NO).
   - *El enlace debe terminar en .jpg, .png o .webp*.
5. Copia ese enlace.

## 3. Agregar o Editar Productos
- **URL de la Imagen:** Pega el "Enlace directo" que copiaste de ImgBB. Haz clic en "🔗 Cargar" para verificarla.
- Rellena nombre, precio, categoría, etc.
- Haz clic en **"Agregar Producto"** o **"Actualizar Producto"**.
- Verás que el producto aparece en el catálogo inmediatamente (pero solo en TU navegador por ahora).

## 4. GUARDAR LOS CAMBIOS PERMANENTEMENTE
**Este es el paso más importante.** Al no usar base de datos ni servidores de pago, debemos guardar el archivo de datos manualmente.

1. Realiza TODOS los cambios que necesites en el panel (agrega 5 vestidos, borra 2, etc.).
2. En la parte superior del panel de administración, haz clic en el botón azul **"📥 JSON"**.
3. Se descargará un archivo llamado `products.js` a tu carpeta de Descargas.
4. **Mueve este archivo** a la carpeta de tu proyecto, reemplazando el archivo `products.js` que ya existe allí.

## 5. Publicar en Internet (Vercel)
Para que todo el mundo vea los cambios:

1. Asegúrate de haber reemplazado el archivo `products.js` en tu carpeta de proyecto.
2. Abre la terminal en la carpeta de tu proyecto.
3. Sube los cambios a Vercel. Si usas Vercel CLI:
   ```bash
   vercel --prod
   ```
   O si usas GitHub, haz un `git push` con los cambios.

¡Y listo! Tu tienda estará actualizada.
