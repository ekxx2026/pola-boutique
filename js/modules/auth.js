// ===== AUTH MODULE =====

export function initAuthObserver(callbacks) {
    if (typeof auth === 'undefined') return;

    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("👤 Admin conectado:", user.email);
            if (callbacks.onLogin) callbacks.onLogin(user);
        } else {
            console.log("👤 Admin desconectado");
            if (callbacks.onLogout) callbacks.onLogout();
        }
    });
}

export async function loginWithEmail(email, password) {
    return await auth.signInWithEmailAndPassword(email, password);
}

export async function logout() {
    return await auth.signOut();
}
