// ===== DATABASE & API MODULE =====

const IMGBB_API_KEY = "d9bd33d5542aa36bb37534513c186e5e";

export async function subirImagenImgBB(file) {
    if (!file) return null;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            return result.data.url;
        } else {
            throw new Error("Error ImgBB: " + (result.error ? result.error.message : "Desconocido"));
        }
    } catch (error) {
        console.error("Error upload ImgBB:", error);
        throw error;
    }
}

export function subscribeToProducts(callback) {
    // db es global desde firebase-config.js
    if (typeof db === 'undefined') {
        console.error("Firebase DB no inicializado");
        return;
    }

    db.ref("productos").on("value", (snapshot) => {
        const data = snapshot.val();
        let productosList = [];
        if (data) {
            productosList = Object.keys(data).map(key => ({
                firestoreId: key,
                ...data[key]
            })).sort((a, b) => b.id - a.id);
        }
        callback(productosList);
    }, (error) => {
        console.error("❌ Error de Firebase:", error);
    });
}

export async function addProduct(productData) {
    return await db.ref("productos").push(productData);
}

export async function updateProduct(firestoreId, productData) {
    return await db.ref("productos").child(firestoreId).update(productData);
}

export async function deleteProduct(firestoreId) {
    return await db.ref("productos").child(firestoreId).remove();
}

// Migración manual
export async function migrarProductoIndividual(prod, finalUrl) {
    const { firestoreId, ...cleanProd } = prod;
    cleanProd.imagen = finalUrl;
    return await db.ref("productos").push(cleanProd);
}

// Monitor de conexión
export function monitorConnection(onStatusChange) {
    if (typeof db === 'undefined') return;
    
    const connectedRef = db.ref(".info/connected");
    connectedRef.on("value", (snap) => {
        if (snap.val() === true) {
            onStatusChange(true);
        } else {
            onStatusChange(false);
        }
    });
}
