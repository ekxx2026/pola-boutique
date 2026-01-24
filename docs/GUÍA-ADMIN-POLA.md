Guía rápida panel admin Pola Galleani
====================================

Acceso
------

- Botón candado en el header (esquina derecha).
- Ingresa email y contraseña definidos para administración.

Crear producto
--------------

1. Abre el panel admin (botón candado).
2. Completa:
   - Nombre del producto.
   - Precio en CLP (solo números).
   - Categoría (Short, Vestido, Blusa, Palazo).
   - Descripción breve enfocada en beneficios.
   - Badge opcional:
     - “Nuevo”, “Más vendido”, “Edición limitada”, etc.
   - Detalles: una línea por punto (tallas, tela, fit).
3. Imagen:
   - Usa preferentemente URL optimizada (formato JPG/WebP).
   - Tamaño sugerido: 900–1200px de alto, peso < 400 KB.
4. Guarda el producto. Aparecerá en el catálogo al instante.

Editar producto
---------------

1. En la lista de productos, presiona el ícono ✏️.
2. Modifica la información necesaria.
3. Guarda para actualizar.

Eliminar producto
-----------------

1. En la lista, presiona el ícono 🗑️.
2. Confirma la eliminación.

Badges y escasez
----------------

- Badge:
  - “Nuevo” → etiqueta “Nuevo · Colección 2026”.
  - “Más vendido” → “Más vendido · Favorito”.
  - “Edición limitada” → “Edición limitada · 1 de 50”.
- Escasez:
  - Algunas tarjetas muestran “Stock limitado” de forma automática para dar sensación de exclusividad.

Flujo de compra
---------------

- Catálogo:
  - Cliente ve productos y abre el zoom al tocar la imagen.
- Zoom:
  - Puede añadir a su selección.
  - O confirmar directamente por WhatsApp.
- Carrito:
  - Muestra “Tu selección” con resumen de prendas.
  - Botón “Confirmar por WhatsApp” genera el mensaje listo para enviar.

Recomendaciones de uso
----------------------

- Mantén siempre al menos 8–12 productos activos para que el catálogo se sienta vivo.
- Usa fotos verticales donde se vea completo el look de la modelo.
- Actualiza badges con frecuencia (nuevos, más vendidos, edición limitada).

Despliegue
----------

- Cambios en código:
  - Se editan en el proyecto local.
  - Se prueban en el navegador (servidor local).
- Publicación:
  - Cuando estés conforme, haz commit de los cambios.
  - Haz push a la rama main conectada con Vercel.
  - Vercel toma la última versión de main y despliega automáticamente.

Soporte
-------

- Si algo deja de verse bien después de un cambio:
  - Revisa primero en el entorno local.
  - Si solo falla en producción, verifica que el deploy de Vercel haya terminado sin errores.
