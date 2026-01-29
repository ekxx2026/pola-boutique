# 🔐 Configuración de Edge Function - Instrucciones

## Paso 1: Configurar Variable de Entorno en Vercel

### Opción A: Desde el Dashboard de Vercel (Recomendado)

1. **Ir a tu proyecto en Vercel**
   - Abre https://vercel.com/
   - Selecciona el proyecto `pola-boutique`

2. **Acceder a Settings**
   - Clic en "Settings" en el menú superior
   - Luego clic en "Environment Variables" en el menú lateral

3. **Agregar la variable**
   - **Name:** `IMGBB_API_KEY`
   - **Value:** `d9bd33d5542aa36bb37534513c186e5e`
   - **Environment:** Selecciona las 3 opciones:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Clic en "Save"

### Opción B: Desde la Terminal (CLI)

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Login a Vercel
vercel login

# Navegar a tu proyecto
cd "C:\Users\josen\OneDrive\Desktop\proyectos  copias\deppsekk modelo - copia"

# Agregar variable de entorno
vercel env add IMGBB_API_KEY
# Cuando pregunte, pega: d9bd33d5542aa36bb37534513c186e5e
# Selecciona: Production, Preview, Development (todas)
```

---

## Paso 2: Re-Deploy del Sitio

### Opción A: Push a Git (Automático)

```bash
git add .
git commit -m "feat: Secure API keys with Edge Function"
git push origin main
```

Vercel detectará el cambio y desplegará automáticamente.

### Opción B: Deploy Manual

```bash
vercel --prod
```

---

## Paso 3: Verificar el Funcionamiento

### Test Local (Desarrollo)

1. **Crear archivo `.env.local`** en la raíz del proyecto:
```
IMGBB_API_KEY=d9bd33d5542aa36bb37534513c186e5e
```

2. **Instalar Vercel CLI y correr el proyecto**:
```bash
vercel dev
```

3. **Abrir** `http://localhost:3000`

4. **Prueba**:
   - Inicia sesión en el admin
   - Intenta subir una imagen desde tu PC
   - Debería funcionar sin errores

### Test en Producción

1. **Abrir** `https://pola-boutique.vercel.app/`

2. **Abrir DevTools** (F12)
   - Ve a la pestaña "Network"
   - Filtra por "fetch/XHR"

3. **Prueba de upload**:
   - Inicia sesión en admin
   - Sube una imagen
   - Verifica que aparezca una petición a `/api/upload-image`
   - **NO debería aparecer** ninguna petición directa a `api.imgbb.com`

4. **Verificar seguridad**:
   - Ve a la pestaña "Sources" en DevTools
   - Busca `config.js`
   - **Confirma:** La key `IMGBB_API_KEY` ya NO está en el código

---

## ✅ Checklist de Verificación

Marca cada item cuando lo completes:

- [ ] Variable `IMGBB_API_KEY` configurada en Vercel
- [ ] Código actualizado (ya hecho ✅)
- [ ] Deploy exitoso en Vercel
- [ ] Test local funciona (opcional)
- [ ] Test en producción funciona
- [ ] API key NO visible en DevTools → Sources
- [ ] Peticiones van a `/api/upload-image` y NO a `api.imgbb.com`

---

## 🔍 Troubleshooting

### Error: "IMGBB_API_KEY not configured in environment variables"

**Causa:** La variable no está configurada en Vercel  
**Solución:** Revisa el Paso 1 y asegúrate de guardar la variable

### Error: "failed to fetch /api/upload-image"

**Causa:** La Edge Function no está desplegada  
**Solución:** Haz push a git o ejecuta `vercel --prod`

### La imagen no se sube

**Causa 1:** Archivo demasiado grande (>32MB)  
**Solución:** Reduce el tamaño de la imagen

**Causa 2:** Tipo de archivo no soportado  
**Solución:** Usa JPG, PNG, GIF o WebP

### "Network Error" en local

**Causa:** Archivo `.env.local` falta  
**Solución:** Crea el archivo como indica el Paso 3

---

## 📊 Impacto de la Mejora

### Antes (Inseguro)
```javascript
// Cliente puede ver:
IMGBB_API_KEY: 'd9bd33d5542aa36bb37534513c186e5e'
```
- ❌ Cualquiera puede robar tu key
- ❌ Pueden subir imágenes usando tu cuenta
- ❌ Podrías alcanzar el límite de ImgBB sin saberlo

### Después (Seguro)
```javascript
// Cliente NO puede ver la key
// Solo ve la llamada a /api/upload-image
```
- ✅ API key oculta en el servidor
- ✅ Solo tu sitio puede usar la key
- ✅ Puedes agregar rate limiting si quieres
- ✅ Mejor práctica de seguridad

---

## 🚀 Siguiente Paso

Una vez que hayas completado esta configuración, deberías:

1. **Probar que todo funciona**
2. **Continuar con las siguientes mejoras del plan**:
   - Firebase Security Rules
   - Critical CSS
   - WebP Images
   - GA4 Events

¿Tienes alguna pregunta sobre estos pasos?
