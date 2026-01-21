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

export function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

export function generateSitemap(products) {
    const baseUrl = window.location.origin + window.location.pathname;
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Home
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}</loc>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';

    // Products
    products.forEach(p => {
        const slug = slugify(p.nombre);
        // Using hash routing for now as requested
        const url = `${baseUrl}#product/${p.id}/${slug}`;

        xml += '  <url>\n';
        xml += `    <loc>${url}</loc>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        // xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`; // Optional if we tracked dates
        xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
}
