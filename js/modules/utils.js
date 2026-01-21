// ===== CONSTANTES Y UTILIDADES =====

export const WHATSAPP_NUMERO = "56962281579";
export const INSTAGRAM_URL = "https://www.instagram.com/polagalleani?igsh=MWc3bDNjMmpkNHRkYQ==";
export const DIRECCION_TIENDA = "Nva uno 1676, Santiago";

// Helpers de Formato
export function formatPrice(price) {
    return price.toLocaleString('es-CL');
}

export function getBadgeClass(badgeText) {
    if (!badgeText) return "";
    if (badgeText.toLowerCase().includes("nuevo")) return "nuevo";
    else if (badgeText.toLowerCase().includes("vendido")) return "masvendido";
    else if (badgeText.toLowerCase().includes("edición")) return "edicion";
    return "";
}

export function mostrarEstadoURL(mensaje, tipo, statusElementId = 'urlStatus') {
    const statusDiv = document.getElementById(statusElementId);
    if (statusDiv) {
        statusDiv.textContent = mensaje;
        statusDiv.className = '';
        if (tipo) statusDiv.classList.add(tipo);
        statusDiv.style.display = mensaje ? 'block' : 'none';
    }
}
