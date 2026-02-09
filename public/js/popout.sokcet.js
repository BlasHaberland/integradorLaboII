console.log('Popout cargado');
if (window.socket) {
    function incrementarContador() {
        let counter = document.getElementById('notif-counter');
        if (counter) {
            let count = parseInt(counter.textContent.trim()) || 0;
            counter.textContent = count + 1;
            counter.classList.remove('hidden');
        } else {
            // Si no existe, lo creamos dentro del link de notificaciones
            const link = document.querySelector('a[href="/notificaciones"]');
            if (link) {
                const span = document.createElement('span');
                span.id = 'notif-counter';
                span.className = 'absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#1E1E1E]';
                span.textContent = '1';
                link.appendChild(span);
            }
        }
    }

    function showSolicitud(mensaje) {
        const popout = document.getElementById('popout-solicitud');
        const msgSpan = document.getElementById('popout-solicitud-msg');

        if (popout && msgSpan) {
            msgSpan.textContent = mensaje;
            
            // Mostrar con animación
            popout.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10');
            popout.classList.add('opacity-100', 'translate-y-0');

            // Ocultar automáticamente tras 5 segundos
            setTimeout(() => {
                popout.classList.add('opacity-0', 'pointer-events-none', 'translate-y-10');
                popout.classList.remove('opacity-100', 'translate-y-0');
            }, 5000);
        }
    }

    window.socket.on('nuevaSolicitud', function (data) {
        incrementarContador();
        showSolicitud('¡Tienes una nueva solicitud de amistad!');
    });

    window.socket.on('respuestaAmistad', function (data) {
        incrementarContador();
        showSolicitud(data.mensaje);
    });

    //notificaciones de comentarios
    window.socket.on('nuevoComentario', function (data) {
        incrementarContador();
        console.log('Notificación de comentario recibida:', data);
        const popout = document.getElementById('popout-comentario');
        const msg = document.getElementById('popout-comentario-msg');
        const autorImg = document.getElementById('popout-comentario-img');

        if (popout && msg) {
            msg.innerHTML = `<strong>${data.autor}</strong> comentó: "${data.extracto}"`;

            if (autorImg) {
                autorImg.src = data.imagen_autor;
            }

            // Mostrar con animación
            popout.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10');
            popout.classList.add('opacity-100', 'translate-y-0');

            setTimeout(() => {
                popout.classList.add('opacity-0', 'pointer-events-none', 'translate-y-10');
                popout.classList.remove('opacity-100', 'translate-y-0');
            }, 5000);
        }
    });
}