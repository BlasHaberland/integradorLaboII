const { initConnection } = require('../db/conection');

async function notificacionesMiddleware(req, res, next) {
    if (req.usuario) {
        try {
            const db = await initConnection();
            const [rows] = await db.query(
                'SELECT COUNT(*) as count FROM notificaciones WHERE id_usuario = ? AND leida = 0',
                [req.usuario.id]
            );
            res.locals.notificacionesPendientes = rows[0].count;
        } catch (error) {
            console.error('Error in notificacionesMiddleware:', error);
            res.locals.notificacionesPendientes = 0;
        }
    } else {
        res.locals.notificacionesPendientes = 0;
    }
    next();
}

module.exports = notificacionesMiddleware;
