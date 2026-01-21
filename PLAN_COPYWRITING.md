# Plan de Mejora de Copywriting y UX

El objetivo es elevar la percepción de marca de "Pola Galleani" a una boutique de "Lujo Accesible", utilizando un lenguaje más sofisticado pero acogedor. Además, eliminaremos fricción en la experiencia de usuario.

## 1. Actualización de Textos (Copywriting)

Se modificarán los textos clave en `index.html` para reflejar exclusividad y accesibilidad.

| Ubicación | Texto Actual | Nueva Propuesta |
| :--- | :--- | :--- |
| **Slogan Principal** | ROPA AL ALCANCE DE TODOS | **LUJO ACCESIBLE** |
| **Título Pestaña** | Boutique Ultra-Lujo | **Pola Galleani | Lujo Accesible** |
| **Meta Descripción** | ...Ropa de calidad al alcance de todos. | ...Diseños exclusivos que definen tu estilo. Alta costura a tu alcance. |
| **H1 Header** | BOUTIQUE ULTRA-LUJO | **POLA GALLEANI** |
| **Intro Catálogo** | Colección Exclusiva | **Nueva Colección 2026** |
| **Subtítulo Catálogo** | ...Moda exclusiva al alcance de todos. | Piezas seleccionadas para resaltar tu esencia. Calidad premium, precios reales. |
| **Testimonio 1** | "La calidad de los vestidos es increíble..." | "Cada prenda se siente única. El ajuste y la tela son de otro nivel." |
| **Testimonio 2** | "Excelente relación calidad-precio..." | "Lujo real sin precios exagerados. La atención al detalle es fascinante." |

## 2. Mejora de UX (Experiencia de Usuario)

### [DELETE] Loading Screen Artificial
*   **Problema:** El sitio tiene un `div#loadingScreen` y un `setTimeout` en `main.js` (ahora `app.js`) que fuerza al usuario a esperar 2-3 segundos innecesariamente.
*   **Solución:**
    1.  Eliminar el HTML del `loadingScreen` en `index.html`.
    2.  Eliminar la lógica de bloqueo en `js/app.js` (o reducirla a solo mostrarse si *realmente* está cargando datos pesados, pero por ahora es mejor eliminarla para sensación de instantaneidad).

## Pasos de Ejecución

1.  **HTML:** Aplicar cambios de texto en `index.html`.
2.  **HTML:** Eliminar bloque `<div id="loadingScreen">...</div>`.
3.  **JS:** Limpiar referencia a `loadingScreen` en `js/app.js`.

## Verificación

*   Revisar visualmente que los textos inspiren más confianza y exclusividad.
*   Comprobar que el sitio carga **instantáneamente** al refrescar, sin la pantalla negra de espera.
