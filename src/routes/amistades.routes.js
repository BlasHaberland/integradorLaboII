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
        if(solicitud.length > 0) {
            return res.status(400)
        }

        await db.query(
            'INSERT INTO amistades (id_remitente, id_destinatario) VALUES (?, ?)',
            [id_remitente, id_destinatario]
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
        }else if(accion === 'rechazar') {
            await db.query(
                'DELETE FROM amistades WHERE id_amistad = ?',
                [id_amistad]
            );
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

        res.redirect(`/usuario/${req.body.alias || ''}?mensaje=Amistad cancelada`);
    } catch (error) {
        console.error('Error al cancelar amistad:', error);
        res.redirect('back');
    }
});

module.exports = router;