export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { clima, lugar, palabra } = body;

        // 1. Llamada a Gemini API para el mensaje
        let message = "Hoy es un día especial para ti. 🌻";
        
        if (env.GEMINI_API_KEY) {
            const prompt = `
            Actúa como un poeta contemporáneo muy empático, intuitivo y profundo. El usuario ha completado un cuestionario buscando descubrir su energía, revelando lo siguiente sobre su esencia interior:
            - Su clima ideal: ${clima}
            - El lugar donde su alma descansa: ${lugar}
            - La palabra que define su etapa de vida actual: "${palabra}"
            
            Tu objetivo es interpretar estas respuestas de forma profunda, psicológica y poética. No te limites a repetir lo que dijo ("te gusta la lluvia"); en su lugar, analiza qué tipo de alma tiene basándote en esos elementos y profundiza en su significado.
            
            A partir de esa interpretación emocional, sorpréndele revelando que este test en realidad es un regalo secreto por el 21 de septiembre (día de regalar flores amarillas como símbolo de amor, luz y admiración).
            
            Redacta un mensaje emotivo, hermoso y que llegue directamente al corazón. El mensaje debe:
            1. Describir la belleza de su esencia interior basándote en tu análisis de sus respuestas.
            2. Conectar la luz y energía que esa persona transmite con el motivo por el cual le regalas estas flores amarillas virtuales hoy.
            3. Sonar íntimo, cálido y auténtico, como una caricia al alma.
            4. Ser directo para el lector (hablándole de "tú"). 
            
            Extensión: unos dos párrafos cortos (unas 4-5 líneas en total).
            REGLA ESTRICTA: No uses formato Markdown (absolutamente cero asteriscos, cero negritas). Solo texto puro y emotivo.
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
