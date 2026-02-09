const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');
const autMiddleware = require('../middleware/aut.middleware');

const CANTIDAD_REPORTES = 4;

// CREAR REPORTE
router.post('/crear', autMiddleware, async (req, res) => {
    try {
        const { id_imagen, motivo, descripcion } = req.body;
        const id_reportador = req.usuario.id;

        const db = await initConnection();

        // Verifica el dueño
        const [ownerRows] = await db.query(
            'SELECT a.id_usuario FROM imagenes i JOIN albumes a ON i.id_album = a.id_album WHERE i.id_imagen = ?',
            [id_imagen]
        );

        if (ownerRows.length > 0 && ownerRows[0].id_usuario === id_reportador) {
            return res.status(403).json({ success: false, message: 'No puedes denunciar tus propias imágenes.' });
        }


        await db.query(
            'INSERT INTO denuncias (id_reportador, id_imagen, motivo, descripcion) VALUES (?, ?, ?, ?)',
            [id_reportador, id_imagen, motivo, descripcion]
        );


        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM denuncias WHERE id_imagen = ?',
            [id_imagen]
        );

        const totalReportes = rows[0].total;


        if (totalReportes >= CANTIDAD_REPORTES) {
            await db.query(
                'UPDATE imagenes SET bloqueada = 1 WHERE id_imagen = ?',
                [id_imagen]
            );


            const [seccion] = await db.query(
                'SELECT a.id_usuario FROM imagenes i JOIN albumes a ON i.id_album = a.id_album WHERE i.id_imagen = ?',
                [id_imagen]
            );

            if (seccion.length > 0) {
                const id_propietario = seccion[0].id_usuario;
                await db.query(
                    'INSERT INTO notificaciones (id_usuario, tipo, mensaje, id_referencia) VALUES (?, ?, ?, ?)',
                    [id_propietario, 'reporte', 'Una de tus imágenes ha sido bloqueada debido a múltiples reportes.', id_imagen]
                );
            }
        }

        res.json({ success: true, message: 'Reporte enviado correctamente.' });

    } catch (error) {
        console.error('Error al crear reporte:', error);
        res.status(500).json({ success: false, message: 'Error interno al procesar el reporte.' });
    }
});

module.exports = router;
