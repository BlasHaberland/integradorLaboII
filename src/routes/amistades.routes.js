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

module.exports = router;