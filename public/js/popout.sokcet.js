console.log('Popout cargado');
if (window.socket) {
    window.socket.on('nuevaSolicitud', function(data) {
        const popout = document.getElementById('popout-solicitud');
        const msg = document.getElementById('popout-solicitud-msg');
        if (popout && msg) {
            msg.textContent = '¡Tienes una nueva solicitud de amistad!';
            popout.classList.remove('opacity-0', 'pointer-events-none');
            popout.classList.add('opacity-100');
            // Ocultar automáticamente después de 5 segundos
            setTimeout(() => {
                popout.classList.add('opacity-0', 'pointer-events-none');
                popout.classList.remove('opacity-100');
            }, 5000);
        }
    });


    //notificaciones de comentarios
     window.socket.on('nuevoComentario', function(data) {
        console.log('Notificación de comentario recibida:', data);
        const popout = document.getElementById('popout-comentario');
        const msg = document.getElementById('popout-comentario-msg');
        const autorImg = document.getElementById('popout-comentario-img');
        
        if (popout && msg) {

            msg.innerHTML = `<strong>${data.autor}</strong> comentó: "${data.extracto}"`;
            

            if (autorImg) {
                autorImg.src = data.imagen_autor;
            }

            popout.classList.remove('opacity-0', 'pointer-events-none');
            popout.classList.add('opacity-100');

            setTimeout(() => {
                popout.classList.add('opacity-0', 'pointer-events-none');
                popout.classList.remove('opacity-100');
            }, 5000);
        }
    });
}