# 🔒 Configuración de Firebase Security Rules

## ⚠️ Situación Actual

**PROBLEMA:** Actualmente tu base de datos Firebase está **completamente abierta**. Cualquier persona puede:
- ❌ Borrar todos tus productos
- ❌ Modificar precios
- ❌ Agregar productos falsos
- ❌ Destruir tu catálogo completo

**SOLUCIÓN:** Implementar reglas de seguridad que solo permitan escritura a administradores autenticados.

---

## 📋 Paso 1: Configurar Reglas en Firebase Console

### 1.1 Acceder a Firebase Console

1. Abre https://console.firebase.google.com/
2. Selecciona tu proyecto: **pola-boutique**
3. En el menú lateral, ve a **Realtime Database**
4. Click en la pestaña **"Rules"** (Reglas)

### 1.2 Reemplazar Reglas Actuales

**Reglas actuales (INSEGURAS):**
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Nuevas reglas (SEGURAS):**
```json
{
  "rules": {
    "productos": {
      ".read": true,
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()",
      ".indexOn": ["categoria", "precio", "id"]
    },
    "admins": {
      ".read": "auth != null && root.child('admins').child(auth.uid).exists()",
      ".write": false
    }
  }
}
```

### 1.3 Publicar Reglas

1. Copia las reglas de arriba y pégalas
2. Click en **"Publish"** (Publicar)
3. Confirma el cambio

---

## 📋 Paso 2: Crear Estructura de Administradores

### 2.1 Obtener tu UID de Firebase Auth

**Opción A: Desde Firebase Console**

1. Ve a **Authentication** → **Users** en Firebase Console
2. Busca tu email de admin
3. Copia el **User UID** (será algo como: `xYz123AbC456...`)

**Opción B: Desde el sitio web**

1. Abre tu sitio: https://pola-boutique.vercel.app/
2. Abre DevTools (F12)
3. Ve a Console
4. Pega este código:

```javascript
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log('Tu UID es:', user.uid);
    // Copia este UID
  } else {
    console.log('No estás autenticado, inicia sesión primero');
  }
});
```

4. Inicia sesión como admin
5. Copia el UID que aparece en la consola

### 2.2 Agregar tu UID a la lista de admins

1. En Firebase Console → **Realtime Database** → **Data**
2. Click en el símbolo **+** junto a la raíz
3. Crea una nueva entrada:
   - **Name:** `admins`
   - **Value:** (dejar en blanco por ahora)
4. Click en el **+** junto a `admins`
5. Agregar:
   - **Name:** `[TU_UID_AQUÍ]` (pega tu UID copiado)
   - **Value:** `true`

**Ejemplo de estructura final:**
```
pola-boutique-database/
├── productos/
│   ├── -ABC123.../
│   └── -XYZ789.../
└── admins/
    └── xYz123AbC456...: true  ← Tu UID aquí
```

---

## ✅ Paso 3: Verificar que Funciona

### 3.1 Test de Lectura Pública (Debe funcionar)

1. Abre tu sitio en **modo incógnito**: https://pola-boutique.vercel.app/
2. Deberías poder ver el catálogo de productos normalmente
3. ✅ **Esperado:** Productos se cargan correctamente

### 3.2 Test de Escritura Sin Auth (Debe fallar)

1. En modo incógnito, abre DevTools (F12)
2. Ve a Console
3. Pega este código:

```javascript
db.ref('productos').push({
  nombre: 'Test Hack',
  precio: 1
}).catch(err => {
  console.log('✅ CORRECTO: Acceso denegado', err.message);
});
```

4. ✅ **Esperado:** Error "Permission denied"

### 3.3 Test de Admin Autenticado (Debe funcionar)

1. Cierra modo incógnito
2. Abre tu sitio normalmente
3. Inicia sesión como admin (click en 🔒)
4. Intenta agregar, editar o eliminar un producto
5. ✅ **Esperado:** Funciona correctamente

---

## 🔍 Troubleshooting

### ❌ Error: "Permission denied" al hacer login como admin

**Causa:** Tu UID no está en la lista de admins

**Solución:**
1. Verifica que copiaste el UID correctamente en Paso 2.2
2. El UID debe estar exactamente como aparece en Authentication
3. Asegúrate de que el valor sea `true`, no un string `"true"`

### ❌ Los productos no se cargan en el sitio

**Causa:** Las reglas están mal configuradas

**Solución:**
1. Revisa que la regla de `.read` en `productos` sea `true`
2. Verifica que no haya errores de sintaxis JSON
3. En Firebase Console → Rules, verifica que estén publicadas

### ❌ "Error: auth is null"

**Causa:** Estás intentando escribir sin estar autenticado

**Solución:**
1. Cierra sesión e inicia sesión nuevamente
2. Verifica en DevTools → Application → IndexedDB que hay datos de Firebase Auth

---

## 📊 Comparación Antes/Después

| Aspecto | Antes (Inseguro) | Después (Seguro) |
|---------|------------------|------------------|
| **Lectura pública** | ✅ Permitida | ✅ Permitida |
| **Escritura sin login** | ❌ Permitida (PELIGRO) | ✅ Bloqueada |
| **Escritura con login no-admin** | ❌ Permitida (PELIGRO) | ✅ Bloqueada |
| **Escritura admin** | ✅ Permitida | ✅ Permitida |
| **Modificar lista admins** | ❌ Cualquiera (PELIGRO) | ✅ Solo desde consola |

---

## 🎯 Reglas Explicadas

### Regla de Productos
```json
"productos": {
  ".read": true,  // Cualquiera puede leer (catálogo público)
  ".write": "auth != null && root.child('admins').child(auth.uid).exists()",
  // Solo puede escribir si:
  // 1. Está autenticado (auth != null)
  // 2. Y su UID está en la lista de admins
  
  ".indexOn": ["categoria", "precio", "id"]
  // Índices para queries rápidas
}
```

### Regla de Admins
```json
"admins": {
  ".read": "auth != null && root.child('admins').child(auth.uid).exists()",
  // Solo admins pueden ver la lista de admins
  
  ".write": false
  // NADIE puede modificar la lista desde el código
  // Solo se modifica manualmente desde Firebase Console
}
```

---

## ✅ Checklist Final

- [ ] Reglas de seguridad publicadas en Firebase Console
- [ ] Tu UID agregado a `/admins/[UID]: true`
- [ ] Test en incógnito: productos se cargan ✅
- [ ] Test en incógnito: no se puede escribir ✅
- [ ] Test autenticado: puedes editar productos ✅
- [ ] Archivo `firebase-rules.json` guardado en el proyecto (backup)

---

## 🚀 Siguiente Paso

Una vez completada esta configuración, tu base de datos estará **100% protegida**. 

Procederías con:
- Critical CSS (rendimiento)
- Google Analytics Events (métricas)
- Imágenes WebP (velocidad)

**Tiempo estimado total de configuración:** 10-15 minutos
