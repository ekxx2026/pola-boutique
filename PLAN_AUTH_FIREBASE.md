# Plan de Implementación: Migración a Firebase Auth

Este plan detalla los pasos para reemplazar la autenticación insegura actual por Firebase Authentication (Email/Password), manteniendo el coste cero.

## Objetivo
Eliminar la vulnerabilidad crítica de `ADMIN_HASH` en JS y asegurar que solo el administrador autenticado pueda gestionar productos.

## User Review Required
> [!IMPORTANT]
> **Acción Manual Requerida:** Debes ir a la [Consola de Firebase](https://console.firebase.google.com/) > Authentication > Sign-in method y habilitar **"Email/Password"**. Luego crea manualmente tu usuario administrador (tu correo y contraseña) en la pestaña "Users".

## Cambios Propuestos

### Archivos
*   `main.js`:
    *   [DELETE] `const ADMIN_HASH = "..."`
    *   [MODIFY] Reemplazar función de validación de formulario de login por `auth.signInWithEmailAndPassword`.
    *   [MODIFY] Añadir observador de estado `auth.onAuthStateChanged` para mostrar/ocultar botones de admin automáticamente.
    *   [NEW] Función `logout` para cerrar sesión de manera segura.

### Flujo de Usuario (Admin)
1.  Admin abre modal de Login (candado).
2.  Ingresa Email y Contraseña (en lugar de solo password).
3.  Firebase valida credenciales.
4.  Si es correcto -> Se cierra modal y se muestran botones de edición.
5.  Si falla -> Muestra alerta de error real.

## Verificación
1.  Intentar login con credenciales incorrectas (debe fallar).
2.  Intentar login con el usuario creado en Firebase (debe entrar).
3.  Refrescar la página: la sesión debe mantenerse (o restaurarse automáticamente).
