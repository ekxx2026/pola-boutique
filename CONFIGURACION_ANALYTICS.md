# 📊 Guía de Configuración y Verificación de Google Analytics 4

## ✅ Eventos Implementados

Tu sitio web ahora rastrea **automáticamente** todos estos eventos críticos de e-commerce:

### 🛍️ Eventos de Productos

| Evento | Cuándo se dispara | Datos enviados |
|--------|-------------------|----------------|
| **view_item** | Usuario abre el modal de zoom de un producto | ID, nombre, precio, categoría |
| **add_to_cart** | Usuario agrega producto al carrito | ID, nombre, precio, categoría |
| **remove_from_cart** | Usuario reduce cantidad a 0 | ID, nombre, precio, categoría |
| **view_cart** | Usuario abre el carrito | Lista de productos + total |
| **begin_checkout** | Usuario click en "Comprar WhatsApp" | Lista completa + total |

### 🔍 Eventos de Navegación

| Evento | Cuándo se dispara | Datos enviados |
|--------|-------------------|----------------|
| **search** | Usuario busca en el catálogo (1s después de dejar de escribir) | Término de búsqueda |
| **view_item_list** | Usuario cambia de categoría/filtro | Nombre de categoría |

### ❤️ Eventos de Wishlist

| Evento | Cuándo se dispara | Datos enviados |
|--------|-------------------|----------------|
| **add_to_wishlist** | Usuario agrega a favoritos | ID, nombre, precio, categoría |
| **remove_from_wishlist** | Usuario remueve de favoritos | ID, nombre, precio, categoría |

---

## 🔧 Paso 1: Configurar Google Analytics 4

### 1.1 Crear Propiedad GA4 (si no tienes)

1. **Ir a:** https://analytics.google.com/
2. **Admin** → **Crear propiedad**
3. **Nombre:** "Pola Galleani Boutique"
4. **Zona horaria:** Chile (GMT-3)
5. **Moneda:** Peso chileno (CLP)
6. **Crear una transmisión de datos web**

### 1.2 Obtener tu Measurement ID

1. En GA4 → **Admin** → **Flujos de datos**
2. Click en tu flujo de datos web
3. **Copiar** el **ID de medición** (formato: `G-XXXXXXXXXX`)

### 1.3 Agregar el ID a tu sitio

Abre el archivo `js/config.js` y agrega tu Measurement ID:

```javascript
const CONFIG = {
    GA_MEASUREMENT_ID: 'G-TU_ID_AQUI',  // ← Pegar aquí
    // ... resto del config
};
```

**Guardar** el archivo y hacer commit:
```bash
git add js/config.js
git commit -m "config: Add GA4 Measurement ID"
git push origin main
```

---

## 🧪 Paso 2: Verificar que Funciona

### Método 1: Realtime en GA4 (Más fácil)

1. **Abre GA4:** https://analytics.google.com/
2. **Informes** → **En tiempo real**
3. **En otra pestaña:** Abre tu sitio https://pola-boutique.vercel.app/
4. **Realiza acciones:**
   - Busca algo
   - Abre un producto
   - Agrégalo al carrito
   - Abre el carrito
   - Click en "Comprar WhatsApp"

5. **Verifica en "Eventos por nombre de evento":**
   - ✅ `view_item`
   - ✅ `add_to_cart`
   - ✅ `view_cart`
   - ✅ `begin_checkout`
   - ✅ `search`

### Método 2: Consola del Navegador

1. Abre tu sitio: https://pola-boutique.vercel.app/
2. **F12** → **Console**
3. Todos los eventos se logean con emojis 📊:

```
✅ Analytics Initialized: G-XXXXXXXXX
📊 Analytics: search - "vestido"
📊 Analytics: view_item - Vestido Negro Elegante
📊 Analytics: add_to_cart - Vestido Negro Elegante
📊 Analytics: view_cart - 1 items, $45000
📊 Analytics: begin_checkout - 1 items, $45000
```

### Método 3: Google Tag Assistant (Chrome Extension)

1. **Instalar:** [Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-companion/ehoopddfhgofcooplfamglmgbefngfck)
2. **Abrir** tu sitio
3. **Click** en la extensión
4. **Conectar**
5. **Realiza acciones** en el sitio
6. **Verifica** que aparecen los eventos

---

## 📈 Paso 3: Configurar Eventos de Conversión

Para que GA4 te muestre cuántas "conversiones" tienes (ventas):

1. **GA4** → **Admin** → **Eventos**
2. Espera 24 horas a que aparezcan los eventos
3. **Marca como conversión:**
   - ✅ `begin_checkout` ← Este es tu evento de conversión principal
   - (Opcional) `add_to_cart`

Ahora podrás ver:
- Cuántas personas inician compra
- Tasa de conversión (visitantes → compradores)
- Productos más populares

---

## 📊 Informes Útiles en GA4

### 1. Productos Más Vistos

**Explorar** → **Análisis de embudo** → Crear nuevo:
1. **Paso 1:** `page_view`
2. **Paso 2:** `view_item`
3. **Paso 3:** `add_to_cart`
4. **Paso 4:** `begin_checkout`

Esto muestra el **embudo de conversión**.

### 2. Búsquedas Populares

**Explorar** → Crear exploración personalizada:
- **Dimensión:** Término de búsqueda
- **Métrica:** Total de eventos
- **Filtro:** `search`

Ver qué buscan tus clientes te ayuda a:
- Entender qué productos les interesan
- Detectar productos faltantes en tu catálogo

### 3. Productos que Generan Más Ingresos Potenciales

**Informes** → **Ciclo de vida** → **Monetización** → **Comercio electrónico**  
(Disponible después de 24-48 horas con datos)

---

## 🔍 Debugging

### ❌ "No veo eventos en GA4"

**Causa 1:** Measurement ID no configurado  
**Solución:** Verifica `js/config.js` → `GA_MEASUREMENT_ID`

**Causa 2:** Ad blocker bloqueando Analytics  
**Solución:** Desactiva uBlock/AdBlock temporalmente para testing

**Causa 3:** Deploy pendiente  
**Solución:** Espera 1-2 minutos después de `git push`

### ❌ "Eventos duplicados"

**Causa:** Varias pestañas abiertas del sitio  
**Solución:** Normal. GA4 cuenta cada pestaña como sesión separada

### ❌ "Consola muestra errores de gtag"

**Causa:** Measurement ID vacío o inválido  
**Solución:** Verifica formato: `G-XXXXXXXXX` (10 caracteres después de G-)

---

## 📋 Checklist de Implementación

- [ ] Propiedad GA4 creada
- [ ] Measurement ID copiado
- [ ] ID agregado a `js/config.js`
- [ ] Commit y push realizados
- [ ] Deploy completado en Vercel
- [ ] Eventos visibles en GA4 Realtime
- [ ] `begin_checkout` marcado como conversión
- [ ] Informes personalizados creados

---

## 🎯 Próximos Pasos Opcionales

1. **Configurar audiencias** para remarketing
2. **Vincular Google Ads** para medir ROI de campañas
3. **Crear alertas personalizadas** (ej: si conversiones bajan 50%)
4. **Integrar BigQuery** para análisis avanzado (requiere plan 360)

---

## 💡 Consejos Pro

### 1. Revisar Semanalmente

Revisa cada lunes:
- ¿Qué productos se vieron más?
- ¿Qué búsquedas fueron populares?
- ¿Cuál fue la tasa de conversión?

### 2. A/B Testing

Con estos datos puedes probar:
- Cambiar fotos de productos poco clickeados
- Ajustar precios de productos con alta visualización pero baja conversión
- Agregar productos que la gente busca pero no tienes

### 3. Alertas de Conversión

Configura en GA4 para recibir email cuando:
- Alguien inicia checkout (begin_checkout)
- Se alcanza un umbral diario de ventas
- Caiga el tráfico significativamente

---

## 🚀 Resultado

Con esta implementación tienes:

✅ **Visibilidad completa** del comportamiento de usuarios  
✅ **Datos para tomar decisiones** de negocio  
✅ **Seguimiento de conversiones** automático  
✅ **Identificación de productos populares**  
✅ **Detección de oportunidades** (búsquedas sin resultados)

**Tiempo de implementación:** Completado ✅  
**Costo:** $0  
**Valor:** Invaluable para crecimiento del negocio

---

¿Necesitas ayuda configurando algún informe específico? ¡Solo pregunta! 📊
