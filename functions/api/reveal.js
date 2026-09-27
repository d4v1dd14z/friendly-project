export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { clima, lugar, palabra } = body;

        // 1. Llamada a Gemini API para el mensaje
        let message = "Hoy es un día especial para ti. 🌻";
        
        if (env.GEMINI_API_KEY) {
            const prompt = `
            Actúa como una persona muy detallista y empática. El usuario acaba de completar un pequeño test con estas respuestas:
            - Clima ideal: ${clima}
            - Lugar ideal: ${lugar}
            - Palabra que le define: ${palabra}
            
            Tu objetivo es revelarle que este "test" en realidad es una sorpresa por el 21 de septiembre (día en que se regalan flores amarillas para demostrar cariño, alegría y buenas energías).
            Escríbele un mensaje de unas 3-4 líneas. El mensaje debe:
            1. Conectar sus respuestas del test con las flores amarillas.
            2. Sonar cálido, como un abrazo virtual.
            3. Ser directo para el lector (hablándole de "tú").
            No uses formato Markdown (ni negritas ni asteriscos).
            `;

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
            const geminiRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (geminiRes.ok) {
                const geminiData = await geminiRes.json();
                message = geminiData.candidates[0].content.parts[0].text;
            } else {
                console.error("Error from Gemini API:", await geminiRes.text());
                // Fallback message
                message = `Aunque hubo un pequeño error cósmico, no quería dejar pasar el 21 de septiembre sin regalarte estas flores amarillas. Que tu día sea tan ${palabra} como tu energía, y que sientas la paz de un ${lugar}. ¡Disfruta! 🌻`;
            }
        } else {
            message = "⚠️ (Falta configurar GEMINI_API_KEY en Cloudflare). Pero igual... ¡Feliz 21 de septiembre! Te regalo estas flores amarillas virtuales. 🌻";
        }

        // 2. Llamada a Unsplash API para el fondo (Opcional)
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
