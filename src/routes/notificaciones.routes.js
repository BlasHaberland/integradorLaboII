const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');
const autMiddleware = require('../middleware/aut.middleware');

// Listar notificaciones
router.get('/', [autMiddleware], async (req, res) => {
    try {
        const db = await initConnection();
        const usuarioId = req.usuario.id;

        const [notificaciones] = await db.query(
            'SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY creada_en DESC',
            [usuarioId]
        );

        res.render('notificaciones', {
            notificaciones,
            usuarioLogueado: req.usuario
        });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).send('Error interno');
    }
});

// Marcar como leída
router.post('/:id/leer', [autMiddleware], async (req, res) => {
    try {
        const db = await initConnection();
        const id_notificacion = req.params.id;
        const usuarioId = req.usuario.id;

        await db.query(
            'UPDATE notificaciones SET leida = 1 WHERE id_notificacion = ? AND id_usuario = ?',
            [id_notificacion, usuarioId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error al marcar notificación:', error);
        res.status(500).json({ success: false });
    }
});

// Marcar todas como leídas
router.post('/leer-todas', [autMiddleware], async (req, res) => {
    try {
        const db = await initConnection();
        const usuarioId = req.usuario.id;

        await db.query(
            'UPDATE notificaciones SET leida = 1 WHERE id_usuario = ?',
            [usuarioId]
        );

        res.redirect('/notificaciones');
    } catch (error) {
        console.error('Error al marcar todas las notificaciones:', error);
        res.status(500).send('Error interno');
    }
});

module.exports = router;
