/**
 * Vercel Edge Function - Secure Image Upload to ImgBB
 * 
 * This function acts as a secure proxy between the client and ImgBB API.
 * The API key is stored safely in Vercel Environment Variables, not exposed to the client.
 * 
 * Usage: POST /api/upload-image with FormData containing the image file
 */

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed. Use POST.' }),
            {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    try {
        // Get the API key from environment variables (set in Vercel dashboard)
        const apiKey = process.env.IMGBB_API_KEY;

        if (!apiKey) {
            console.error('IMGBB_API_KEY not configured in environment variables');
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Get the form data from the request
        const formData = await request.formData();
        const imageFile = formData.get('image');

        if (!imageFile) {
            return new Response(
                JSON.stringify({ error: 'No image file provided' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(imageFile.type)) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP',
                    received: imageFile.type
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Validate file size (max 32MB as per ImgBB limits)
        const maxSize = 32 * 1024 * 1024; // 32MB
        if (imageFile.size > maxSize) {
            return new Response(
                JSON.stringify({
                    error: 'File too large. Maximum size: 32MB',
                    size: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Convert the file to base64
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        // Create form data for ImgBB
        const imgbbFormData = new FormData();
        imgbbFormData.append('image', base64Image);
        imgbbFormData.append('name', imageFile.name);

        // Upload to ImgBB
        const imgbbUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;
        const imgbbResponse = await fetch(imgbbUrl, {
            method: 'POST',
            body: imgbbFormData,
        });

        const imgbbData = await imgbbResponse.json();

        // Check if upload was successful
        if (!imgbbData.success) {
            console.error('ImgBB upload failed:', imgbbData);
            return new Response(
                JSON.stringify({
                    error: 'Image upload failed',
                    details: imgbbData.error?.message || 'Unknown error'
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Return successful response with image URL
        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    url: imgbbData.data.url,
                    display_url: imgbbData.data.display_url,
                    delete_url: imgbbData.data.delete_url,
                    thumb_url: imgbbData.data.thumb?.url,
                    medium_url: imgbbData.data.medium?.url,
                    size: imgbbData.data.size,
                    width: imgbbData.data.width,
                    height: imgbbData.data.height,
                }
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            }
        );

    } catch (error) {
        console.error('Edge Function error:', error);
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
