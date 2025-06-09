const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');
const autMiddleware = require('../middleware/aut.middleware');

router.get('/', autMiddleware, async (req, res) => { 
    try {
        const db = await initConnection();
        const [usuario] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [req.usuario.id]);
        if (!usuario[0]) {
            return res.status(404).render('home', {
                title: 'Home',
                error: 'Usuario no encontrado',
                usuario: null,
                albumes: [],
                tags: []
            });
        }

        // Traer álbumes del usuario
        const [albumes] = await db.query('SELECT * FROM albumes WHERE id_usuario = ?', [req.usuario.id]);

        // Traer tags asociados a los álbumes del usuario
        const [albumesTags] = await db.query(`
            SELECT at.id_album, t.id_tag, t.nombre
            FROM albumes_tags at
            JOIN tags t ON at.id_tag = t.id_tag
            WHERE at.id_album IN (?)
        `, [albumes.map(a => a.id_album)]);

        // Asignar los tags a cada álbum
        albumes.forEach(album => {
            album.tags = albumesTags
                .filter(at => at.id_album === album.id_album)
                .map(at => ({ id: at.id_tag, nombre: at.nombre }));
        });

        // Traer todos los tags para el formulario
        const [tags] = await db.query('SELECT * FROM tags');

        res.render('home', {
            title: 'Home',
            usuario: usuario[0],
            albumes,
            tags
        });

    } catch (error) {
        console.error('Error en /home:', error);
        res.status(500).render('home', {
            title: 'Home',
            error: 'Error al obtener el usuario. Inténtalo de nuevo más tarde.',
            usuario: null,
            albumes: [],
            tags: []
        });
    }
})


module.exports = router;