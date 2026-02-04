const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');
const autMiddleware = require('../middleware/aut.middleware');
const { usuariosConectados } = require('../socket/socket-server');

//SOLICITAR AMISTAD

router.post('/solicitar', [autMiddleware], async (req, res) => {
    try {
        const id_remitente = req.usuario.id
        const id_destinatario = req.body.id_destinatario;

        const db = await initConnection();

        // Verifico si la solicitud ya existe
        const [solicitud] = await db.query(
            'SELECT * FROM amistades WHERE id_remitente = ? AND id_destinatario = ?',
            [id_remitente, id_destinatario]
        )
        if (solicitud.length > 0) {
            return res.status(400)
        }

        const [result] = await db.query(
            'INSERT INTO amistades (id_remitente, id_destinatario) VALUES (?, ?)',
            [id_remitente, id_destinatario]
        );

        const id_amistad = result.insertId;

        // Guardar notificación en DB
        const [remitente] = await db.query('SELECT alias FROM usuarios WHERE id_usuario = ?', [id_remitente]);
        await db.query(
            'INSERT INTO notificaciones (id_usuario, tipo, mensaje, id_referencia) VALUES (?, ?, ?, ?)',
            [id_destinatario, 'amistad', `${remitente[0].alias} te ha enviado una solicitud de amistad`, id_amistad]
        );

        // Consultas del destinatario
        // Usuario
        const [usuarios] = await db.query(
            'SELECT * FROM usuarios WHERE id_usuario = ?',
            [id_destinatario]
        );
        const usuario = usuarios[0];
        // Albumes
        const [albumes] = await db.query(
            'SELECT * FROM albumes WHERE id_usuario = ?',
            [id_destinatario]
        );


        //EMITIR EVENTO DE SOCKET
        const socketId = usuariosConectados[id_destinatario];
        console.log('SocketId destinatario:', socketId);
        if (socketId && req.app.get('io')) {
            console.log('Emitiendo nuevaSolicitud a', id_destinatario, 'por socket', socketId);
            req.app.get('io').to(socketId).emit('nuevaSolicitud', {
                de: id_remitente
            });
        }

        res.redirect(`/usuario/${usuario.alias}?mensaje=solicitud_enviada`);



    } catch (error) {
        console.error('Error al solicitar amistad:', error);
        res.status(500).send('Error interno al enviar la solicitud.')
    }
})

router.post('/actualizar', [autMiddleware], async (req, res) => {
    try {
        const { id_amistad, accion } = req.body;
        const db = await initConnection();

        if (accion === 'aceptar') {
            await db.query(
                "UPDATE amistades SET estado = 'aceptada' WHERE id_amistad = ?",
                [id_amistad]
            );

            // Marcar notificación como leída automáticamente
            await db.query(
                "UPDATE notificaciones SET leida = 1 WHERE id_referencia = ? AND id_usuario = ? AND tipo = 'amistad'",
                [id_amistad, req.usuario.id]
            );

            // Crear álbum automático para el remitente
            const [amistadData] = await db.query(
                "SELECT id_remitente, id_destinatario FROM amistades WHERE id_amistad = ?",
                [id_amistad]
            );

            if (amistadData.length > 0) {
                const { id_remitente, id_destinatario } = amistadData[0];

                // Obtener datos del destinatario (el que aceptó)
                const [destinatario] = await db.query(
                    "SELECT nombre, apellido FROM usuarios WHERE id_usuario = ?",
                    [id_destinatario]
                );

                if (destinatario.length > 0) {
                    const tituloAlbum = `${destinatario[0].nombre} ${destinatario[0].apellido}`;
                    await db.query(
                        "INSERT INTO albumes (id_usuario, titulo, descripcion, id_usuario_compartido) VALUES (?, ?, ?, ?)",
                        [id_remitente, tituloAlbum, `Álbum compartido de ${destinatario[0].nombre}`, id_destinatario]
                    );

                    // Notificar aceptación
                    await db.query(
                        'INSERT INTO notificaciones (id_usuario, tipo, mensaje, id_referencia) VALUES (?, ?, ?, ?)',
                        [id_remitente, 'amistad', `${destinatario[0].nombre} ${destinatario[0].apellido} aceptó tu solicitud de amistad`, id_destinatario]
                    );

                    // Emitir socket de respuesta si el remitente está conectado
                    const socketRemitente = usuariosConectados[id_remitente];
                    if (socketRemitente && req.app.get('io')) {
                        req.app.get('io').to(socketRemitente).emit('respuestaAmistad', {
                            mensaje: `${destinatario[0].nombre} aceptó tu solicitud`,
                            estado: 'aceptada'
                        });
                    }
                }
            }
        } else if (accion === 'rechazar') {
            // Marcar notificación como leída automáticamente
            await db.query(
                "UPDATE notificaciones SET leida = 1 WHERE id_referencia = ? AND id_usuario = ? AND tipo = 'amistad'",
                [id_amistad, req.usuario.id]
            );

            // Obtener datos antes de borrar
            const [amistadData] = await db.query(
                "SELECT id_remitente, id_destinatario FROM amistades WHERE id_amistad = ?",
                [id_amistad]
            );

            if (amistadData.length > 0) {
                const { id_remitente, id_destinatario } = amistadData[0];
                const [destinatario] = await db.query("SELECT nombre, apellido FROM usuarios WHERE id_usuario = ?", [id_destinatario]);

                await db.query(
                    'DELETE FROM amistades WHERE id_amistad = ?',
                    [id_amistad]
                );

                // Notificar rechazo
                await db.query(
                    'INSERT INTO notificaciones (id_usuario, tipo, mensaje, id_referencia) VALUES (?, ?, ?, ?)',
                    [id_remitente, 'amistad', `${destinatario[0].nombre} ${destinatario[0].apellido} rechazó tu solicitud de amistad`, id_destinatario]
                );
            }
        }

        res.redirect('/home');

    } catch (error) {
        console.error('Error al actualizar amistad:', error);
        res.status(500).send('Error interno al actualizar la solicitud de amistad.');
    }
})

router.post('/cancelar', autMiddleware, async (req, res) => {
    try {
        const db = await initConnection();
        const usuarioLogueadoId = req.usuario.id;
        const id_destinatario = req.body.id_destinatario;

        // Elimina la amistad en ambas direcciones
        await db.query(
            `DELETE FROM amistades 
             WHERE (id_remitente = ? AND id_destinatario = ?)
                OR (id_remitente = ? AND id_destinatario = ?)`,
            [usuarioLogueadoId, id_destinatario, id_destinatario, usuarioLogueadoId]
        );

        // Eliminar álbumes compartidos automáticos entre estos dos usuarios
        await db.query(
            `DELETE FROM albumes 
             WHERE (id_usuario = ? AND id_usuario_compartido = ?)
                OR (id_usuario = ? AND id_usuario_compartido = ?)`,
            [usuarioLogueadoId, id_destinatario, id_destinatario, usuarioLogueadoId]
        );

        res.redirect(`/usuario/${req.body.alias || ''}?mensaje=Amistad cancelada`);
    } catch (error) {
        console.error('Error al cancelar amistad:', error);
        res.redirect('back');
    }
});

module.exports = router;