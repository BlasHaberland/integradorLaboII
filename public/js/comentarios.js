const socket = window.socekt || io();

document.getElementById('formComentario').addEventListener('submit', function (event) { 
    event.preventDefault();

    const texto = document.getElementById('comentario').value;
    const id_imagen = document.getElementById('inputIdImagen').value;
    const alias = window.usuarioActual.alias;
    const imagen_perfil = window.usuarioActual.imagen_perfil;

    if (!texto.trim()) {
        return;
    }

    socket.emit('nuevo-comentario', {
        texto,
        id_imagen,
        id_usuario: window.usuarioActual.id_usuario,
        alias,
        imagen_perfil
    });

    document.getElementById('comentario').value = '';
});

socket.on('comentario-agregado', function(data) {
    const imgIdActual = document.getElementById('inputIdImagen').value;
    if (data.id_imagen === imgIdActual) {
        let rutaPerfil = data.imagen_perfil

        const nuevoComentario = `
            <div class="flex gap-2 items-start mb-2">
                <img src="${rutaPerfil}" class="w-8 h-8 rounded-full object-cover">
                <div>
                    <div class="font-semibold text-cyan-200 text-sm">${data.alias}</div>
                    <div class="text-white text-sm">${data.texto}</div>
                    <div class="text-xs text-cyan-400">${new Date().toLocaleString()}</div>
                </div>
            </div>
        `;
        document.getElementById('comentariosModal').innerHTML += nuevoComentario;
    }
});