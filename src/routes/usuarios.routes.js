const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');
const autMiddleware = require('../middleware/aut.middleware');


router.get('/:alias',[autMiddleware], async (req, res) => {
    try {
        const alias = req.params.alias;
        const db = await initConnection();
        const mensaje = req.query.mensaje;
        
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE alias = ?', [alias]);
        if (!usuarios || usuarios.length === 0) {
            return res.status(404).render('no-encontrado', { query: alias });
        }
        const usuario = usuarios[0];

        const [albumes] = await db.query('SELECT * FROM albumes WHERE id_usuario = ?', [usuario.id_usuario]);


        res.render('perfil', {
            usuario,
            albumes,
            mensaje
        });

    } catch (error) {
        console.error('Error al cargar perfil:', error);
    }
});

module.exports = router;