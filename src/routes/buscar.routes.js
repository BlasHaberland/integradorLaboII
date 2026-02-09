const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');
const autMiddleware = require('../middleware/aut.middleware');

// BUSCAR USUARIO

// BUSCAR
router.get('/', [autMiddleware], async (req, res) => {
    try {
        const db = await initConnection();
        const query = req.query.query?.trim();
        if (!query) {
            return res.redirect('/home');
        }

        const wildQuery = `%${query}%`;

        // 1. BUSCAR USUARIOS (por alias, nombre o apellido)
        const [usuarios] = await db.query(
            'SELECT alias, nombre, apellido, imagen_perfil FROM usuarios WHERE alias LIKE ? OR nombre LIKE ? OR apellido LIKE ?',
            [wildQuery, wildQuery, wildQuery]
        );

        // 2. BUSCAR ÁLBUMES (por título o por tags)
        const [albumes] = await db.query(
            `SELECT DISTINCT a.* FROM albumes a 
             LEFT JOIN albumes_tags at ON a.id_album = at.id_album 
             LEFT JOIN tags t ON at.id_tag = t.id_tag 
             WHERE a.titulo LIKE ? OR t.nombre LIKE ?`,
            [wildQuery, wildQuery]
        );

        // 3. BUSCAR IMÁGENES (por título o descripción)
        const [imagenes] = await db.query(
            `SELECT i.*, a.id_usuario as id_owner 
             FROM imagenes i 
             JOIN albumes a ON i.id_album = a.id_album 
             WHERE (i.titulo LIKE ? OR i.descripcion LIKE ?) AND i.bloqueada = 0`,
            [wildQuery, wildQuery]
        );

        res.render('buscar-resultados', {
            query,
            usuarios,
            albumes,
            imagenes,
            usuarioLogueado: req.usuario
        });

    } catch (error) {
        console.error('Error al realizar la búsqueda:', error);
        res.status(500).send('Error interno en la búsqueda');
    }
})

// BUSQUEDA CON COINCIDENCIAS
router.get('/sugerencias', [autMiddleware], async (req, res) => {
    try {
        const db = await initConnection();
        const query = req.query.query?.trim();
        if (!query) return res.json([]);

        //UTILIZO EL LIKE CON LA QUERY DE BUSQUEDA MANDADA POR PARAMETERO
        const [usuarios] = await db.query(
            'SELECT alias, nombre, imagen_perfil FROM usuarios WHERE alias LIKE ? LIMIT 10',
            [`%${query}%`]
        );
        res.json(usuarios);
    } catch (error) {
        console.error('Error en sugerencias:', error);
        res.status(500).json([]);
    }
});



module.exports = router;
