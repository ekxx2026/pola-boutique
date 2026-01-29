import { db } from '../firebase-config.js';

export default async function handler(req, res) {
    try {
        const snapshot = await db.ref('productos').once('value');
        const productos = snapshot.val() || {};

        const baseUrl = 'https://pola-boutique.vercel.app';
        const date = new Date().toISOString().split('T')[0];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

        Object.values(productos).forEach(p => {
            xml += `
  <url>
    <loc>${baseUrl}/#producto-${p.id}</loc>
    <lastmod>${date}</lastmod> // Idealmente usar p.timestamp si existe
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        xml += `
</urlset>`;

        res.setHeader('Content-Type', 'text/xml');
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache por 24h
        res.status(200).send(xml);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).json({ error: 'Error generating sitemap' });
    }
}
