// ===== AUTH MODULE =====

export function initAuthObserver(callbacks) {
    if (typeof auth === 'undefined') return;

    auth.onAuthStateChanged(user => {
        if (user) {
            if (callbacks.onLogin) callbacks.onLogin(user);
        } else {
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
