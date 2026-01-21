# 🔒 Guía: Restringir API Key de ImgBB

**Objetivo:** Proteger tu API key para que solo funcione desde tu dominio de Vercel.

**Tiempo estimado:** 5 minutos  
**Nivel de riesgo:** Bajo (reversible en cualquier momento)

---

## ⚠️ Por qué es importante

Actualmente tu API key está expuesta en el código fuente:
```javascript
// db.js línea 8
const IMGBB_API_KEY = "d9bd33d5542aa36bb37534513c186e5e";
```

**Riesgos sin restricción:**
- Cualquiera puede ver tu key en el código (View Source)
- Pueden usarla en otros sitios web
- Tu cuota de ImgBB podría agotarse
- Costos inesperados si tienes plan de pago

**Solución:**
Restringir por **HTTP Referrer** para que solo funcione desde tu dominio.

---

## 📋 Paso a Paso

### **Paso 1: Identificar tu dominio de Vercel**

Necesitas saber la URL de tu sitio. Ejemplo:
- `https://tu-sitio.vercel.app`
- `https://polagalleani.com` (si tienes dominio custom)

**¿Dónde encontrarlo?**
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Busca tu proyecto "deppsekk modelo" o similar
3. Copia la URL completa (ej: `https://deppsekk-modelo.vercel.app`)

---

### **Paso 2: Acceder al Dashboard de ImgBB**

1. **Ir a:** [https://api.imgbb.com/](https://api.imgbb.com/)
2. **Hacer login** con tu cuenta de ImgBB
3. Navegar a **"API"** o **"Settings"** en el menú

---

### **Paso 3: Encontrar la sección de Restricciones**

En el dashboard de ImgBB, busca tu API key existente:
- Debería mostrar: `d9bd33d5542aa36bb37534513c186e5e`

Busca una opción llamada:
- **"HTTP Referrer Restrictions"**
- **"Domain Whitelist"**
- **"Allowed Domains"**
- O similar

> **Nota:** ImgBB podría tener la interfaz en inglés. Si no encuentras esta opción, puede que ImgBB no ofrezca restricciones por referrer. En ese caso, salta al Paso 5 (Alternativa).

---

### **Paso 4: Configurar las Restricciones**

Si encuentras la opción de restricciones:

1. **Activar restricciones por HTTP Referrer**
2. **Agregar dominios permitidos:**
   ```
   https://tu-sitio.vercel.app/*
   https://www.tu-sitio.vercel.app/*
   ```
   
   Si tienes dominio custom, también agregarlo:
   ```
   https://polagalleani.com/*
   https://www.polagalleani.com/*
   ```

3. **Para desarrollo local (opcional):**
   ```
   http://localhost/*
   http://127.0.0.1/*
   ```

4. **Click en "Save" o "Update"**

---

### **Paso 5: Alternativa (si ImgBB no tiene restricciones)**

Si ImgBB no ofrece restricciones de dominio, considera estas opciones:

#### **Opción A: Rotación de API Key**
- Genera una nueva API key cada cierto tiempo
- Actualiza `db.js` con la nueva key
- Deploy a Vercel

#### **Opción B: Proxy Backend (Avanzado)**
Crear un endpoint en Vercel Serverless Functions:
```javascript
// api/upload-image.js (Vercel Function)
export default async function handler(req, res) {
  const IMGBB_KEY = process.env.IMGBB_API_KEY; // En variable de entorno
  // ... lógica de upload
}
```

Esto requiere refactorizar `db.js` para llamar a tu API en lugar de ImgBB directamente.

---

## ✅ Verificación

Después de configurar las restricciones:

1. **Test desde tu sitio de Vercel:**
   - Ir a Panel Admin
   - Subir una imagen de prueba
   - ✅ Debería funcionar normalmente

2. **Test desde otro dominio:**
   - Abrir [https://jsfiddle.net/](https://jsfiddle.net/)
   - Intentar usar tu API key
   - ❌ Debería fallar con error 403 o similar

---

## 📝 Checklist Final

- [ ] Obtuve mi dominio de Vercel
- [ ] Accedí al dashboard de ImgBB
- [ ] Configuré restricciones por HTTP Referrer (o verifiqué que no existe)
- [ ] Guardé los cambios
- [ ] Probé subir una imagen desde mi sitio (debe funcionar)
- [ ] (Opcional) Probé desde otro dominio (debe fallar)

---

## 🆘 Problemas Comunes

### "No encuentro la opción de restricciones en ImgBB"
**Solución:** ImgBB Free puede no tener esta feature. Considera:
- Rotación periódica de keys
- Migrar a Cloudinary (tiene plan gratuito con restricciones)

### "Después de restricción, mi sitio tampoco puede subir"
**Solución:**
- Verifica que agregaste `https://` (no `http://`)
- Verifica que incluiste el wildcard `/*` al final
- Espera 5-10 minutos (puede haber delay en propagación)

### "¿Qué pasa con el código local (localhost)?"
**Solución:**
- Agrega `http://localhost/*` a la whitelist
- O desactiva temporalmente restricciones durante desarrollo

---

## 🎯 Siguiente Paso

Una vez completada esta configuración, **actualiza task.md**:

```markdown
- [x] Restringir API Key de ImgBB ✅ COMPLETADO
```

---

**Creado:** 2026-01-21  
**Nivel de seguridad alcanzado:** 🔒 Medio → Alto
