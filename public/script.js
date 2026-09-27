document.getElementById('quiz-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // 1. Obtener respuestas
    const formData = new FormData(e.target);
    const answers = {
        clima: formData.get('clima'),
        lugar: formData.get('lugar'),
        palabra: formData.get('palabra')
    };

    // 2. Ocultar form, mostrar loader
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('loading-container').classList.remove('hidden');

    try {
        // 3. Llamar al backend (Cloudflare Function)
        const response = await fetch('/api/reveal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(answers)
        });

        if (!response.ok) {
            throw new Error('Error al conectar con las estrellas');
        }

        const data = await response.json();

        // 4. Aplicar cambios a la interfaz (La Revelación)
        
        // Cambiar fondo si hay imagen de Unsplash
        if (data.imageUrl) {
            document.body.style.backgroundImage = `url('${data.imageUrl}')`;
        }
        document.body.classList.add('revealed'); // Cambia a tema amarillo

        // Escribir el mensaje generado por Gemini
        document.getElementById('generated-message').textContent = data.message;

        // Ocultar loader, mostrar resultado
        document.getElementById('loading-container').classList.add('hidden');
        document.getElementById('reveal-container').classList.remove('hidden');

        // 5. ¡Lluvia de flores amarillas (confetti)!
        triggerFlowers();

    } catch (error) {
        console.error(error);
        alert("Parece que hubo una pequeña interferencia cósmica. Intenta de nuevo.");
        document.getElementById('loading-container').classList.add('hidden');
        document.getElementById('quiz-container').classList.remove('hidden');
    }
});

function triggerFlowers() {
    // Usamos canvas-confetti con colores amarillos y formas redondas simulando pétalos
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Colores de flores amarillas (girasoles, margaritas amarillas)
        const colors = ['#fde047', '#facc15', '#eab308', '#ca8a04', '#ffffff'];

        confetti(Object.assign({}, defaults, { 
            particleCount, 
            colors: colors,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            shapes: ['circle']
        }));
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            colors: colors,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            shapes: ['circle']
        }));
    }, 250);
}
