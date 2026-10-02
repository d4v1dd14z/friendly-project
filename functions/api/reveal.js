export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        // Recibimos las respuestas del cuestionario (ya no usamos Gemini, pero el test sirve de fachada)
        const body = await request.json();

        // 1. Mensaje especial fijo y personalizado por ti
        const message = "To be honest, none of that other stuff really matters, because what truly counts is that you are such a sweet, kind-hearted person. I really hope we can start a beautiful friendship. Thank you for getting to know me and for welcoming me into your group. And well, since you like surprises and you guys don't celebrate this occasion over there, why not give you a few? They might be virtual, but hey, you get the gesture. Love you! P.S. I’m still going to keep teasing you <3";

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
