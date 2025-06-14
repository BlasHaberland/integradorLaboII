const { initConnection } = require('../db/conection');

//COMENTAR IMAGENES
function comentarioSocket(socket, io) { 
    socket.on('nuevo-comentario', async (data) => {
        console.log('Evento nuevo-comentario recibido:', data);
        
        try {
            const db = await initConnection();
            console.log('id usuario:', data.id_usuario);
            const [usuario] = await db.query(
                'SELECT alias, imagen_perfil FROM usuarios WHERE id_usuario = ?', 
                [data.id_usuario]
            );
            
            if (!usuario[0]) {
                console.error('Usuario no encontrado');
                console.log()
                return; 
            }

            await db.query(
                'INSERT INTO comentarios (texto, id_imagen, id_usuario) VALUES (?, ?, ?)',
                [data.texto, data.id_imagen, data.id_usuario]
            );

            io.emit('comentario-agregado', {
                texto: data.texto,
                id_imagen: data.id_imagen,
                alias: usuario[0].alias,
                imagen_perfil: (() => {
                    const img = usuario[0].imagen_perfil;
                    if (!img || img === 'default-user.jpg') return '/default-user.jpg';
                    if (img.startsWith('/uploads/')) return img;
                    // Elimina cualquier slash inicial para evitar doble slash
                    return '/uploads/' + img.replace(/^\/+/, '');
                })(),
            });

        } catch (error) {
            console.error('Error al guardar comentario:', error);
        }
    });
}

module.exports = { comentarioSocket };