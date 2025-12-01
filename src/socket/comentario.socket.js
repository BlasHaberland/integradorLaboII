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

             const [imagenData] = await db.query(`
                SELECT a.id_usuario as propietario_id 
                FROM imagenes i 
                INNER JOIN albumes a ON i.id_album = a.id_album 
                WHERE i.id_imagen = ?
            `, [data.id_imagen]);


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

            //Enviar notificacion
              if (imagenData.length > 0 && imagenData[0].propietario_id !== data.id_usuario) {
                const propietarioId = imagenData[0].propietario_id;
                
                console.log('Enviando notificación de comentario a usuario:', propietarioId);
                
                // Crear extracto del comentario
                const extractoComentario = data.texto.length > 50 
                    ? data.texto.substring(0, 50) + '...' 
                    : data.texto;

                // Usar salas en lugar de usuariosConectados
                io.to(`usuario_${propietarioId}`).emit('nuevoComentario', {
                    autor: usuario[0].alias,
                    contenido: data.texto,
                    extracto: extractoComentario,
                    imagen_autor: (() => {
                        const img = usuario[0].imagen_perfil;
                        if (!img || img === 'default-user.jpg') return '/default-user.jpg';
                        if (img.startsWith('/uploads/')) return img;
                        return '/uploads/' + img.replace(/^\/+/, '');
                    })()
                });

                console.log('Notificación de comentario enviada exitosamente');
            }

        } catch (error) {
            console.error('Error al guardar comentario:', error);
        }
    });
}

module.exports = { comentarioSocket };