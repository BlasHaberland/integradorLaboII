const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');


router.get('/:alias', async (req, res) => {
    try {
        const alias = req.params.alias;
        const db = await initConnection();
        
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE alias = ?', [alias]);
        if (!usuarios || usuarios.length === 0) {
            return res.status(404).render('no-encontrado', { query: alias });
        }
        const usuario = usuarios[0];

        const [albumes] = await db.query('SELECT * FROM albumes WHERE id_usuario = ?', [usuario.id_usuario]);

        // Si quieres agregar imágenes a cada álbum:
        // for (let album of albumes) {
        //     const [imagenes] = await db.query('SELECT * FROM imagenes WHERE id_album = ?', [album.id_album]);
        //     album.imagenes = imagenes;
        // }

        res.render('perfil', {
            usuario,
            albumes
        });

    } catch (error) {
        console.error('Error al cargar perfil:', error);
    }
});

module.exports = router;