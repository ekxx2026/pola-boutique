# Plan de Refactorización: Modularización de Javascript

## Objetivo
Dividir el archivo monolítico `main.js` (+1300 líneas) en módulos ES6 organizados por funcionalidad. Esto facilitará el mantenimiento, la escalabilidad y las futuras mejoras de SEO.

## Estructura de Archivos Propuesta
Crearemos una carpeta `src/js/` o utilizaremos la raíz si es más simple, pero organizando en carpetas:

```
/js
  /modules
    auth.js       (Lógica de Firebase Auth: login, logout, observadores)
    db.js         (Lógica de Firebase DB: listeners, CRUD)
    cart.js       (Lógica del carrito de compras)
    ui.js         (Renderizado de catálogo, manipulación del DOM)
    utils.js      (Helpers, formateadores, etc.)
  app.js          (Punto de entrada principal que reemplaza a main.js)
```

## Pasos de Implementación

1.  **Preparación:**
    *   Crear directorio `js/modules`.
    *   Hacer backup de `main.js` actual (por seguridad).

2.  **Migración Progresiva:**
    *   **Paso 1 (Utils):** Extraer constantes (`WHATSAPP_NUMERO`) y helpers (`formatPrice`, `getBadgeClass`) a `utils.js`.
    *   **Paso 2 (Auth/DB):** Extraer configuración y lógica de administración a `auth.js` y `db.js`.
    *   **Paso 3 (Cart):** Mover toda la lógica del carrito a `cart.js`.
    *   **Paso 4 (UI):** Mover renderizado de catálogo, modales y eventos de UI a `ui.js`.
    *   **Paso 5 (Entry Point):** Crear `app.js` que importe e inicialice todo.

3.  **Actualización de HTML:**
    *   Cambiar `<script src="main.js">` por `<script type="module" src="js/app.js">` en `index.html`.
    *   Asegurar que `firebase-config.js` sea compatible o importarlo dentro de los módulos.

## Consideraciones Técnicas
*   **ES Modules:** Usaremos `import` / `export`.
*   **Variables Globales:** Se eliminarán las dependencias globales (`window.funcion`) a menos que sean estrictamente necesarias para el HTML (ej. `onclick="..."`). En ese caso, las asignaremos explícitamente a window en `app.js`.

## Verificación
*   El sitio debe cargar igual que antes.
*   Login/Logout debe funcionar.
*   El carrito debe persistir.
*   "Loading screen" debe desaparecer correctamente.
