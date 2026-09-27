export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        // Recibimos las respuestas del cuestionario (ya no usamos Gemini, pero el test sirve de fachada)
        const body = await request.json();

        // 1. Mensaje especial fijo y personalizado por ti
        const message = "Todo lo anterior la verdad no importa porque lo que importa es lo increible que eres, espero que tengas un bonito dia el dia de hoy aunque lo mas probable es que ni pueda estar. Pd: ando efermo :D";

        // 2. Llamada a Unsplash API para el fondo decorativo (Opcional)
        let imageUrl = null;
        if (env.UNSPLASH_API_KEY) {
            const unsplashUrl = `https://api.unsplash.com/photos/random?query=yellow+flowers+aesthetic&orientation=landscape&client_id=${env.UNSPLASH_API_KEY}`;
            const unsplashRes = await fetch(unsplashUrl);
            if (unsplashRes.ok) {
                const unsplashData = await unsplashRes.json();
                imageUrl = unsplashData.urls.regular;
            }
        }

        // 3. Devolver respuesta al frontend
        return new Response(JSON.stringify({
            message: message,
            imageUrl: imageUrl
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Error en el servidor" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
