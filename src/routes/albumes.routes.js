const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');
const autMiddleware = require('../middleware/aut.middleware');
const albumFormMiddleware = require('../middleware/album-form.middleware');
const upload = require('../config/multer.config');
const imagenFormMiddleware = require('../middleware/imagen-form.middleware');


//crear un nuevo album
router.post('/nuevo', [autMiddleware, upload.single('portada'), albumFormMiddleware], async (req, res) => {

    try {
        const db = await initConnection();
        const id_usuario = req.usuario.id;
        const { titulo, descripcion, tags } = req.body;
        const portada = req.file ? '/uploads/' + req.file.filename : '/default-album.jpg';

        const [album] = await db.query("INSERT INTO albumes (id_usuario,titulo,descripcion,portada) VALUES (?,?,?,?)", [id_usuario, titulo, descripcion, portada]);
        const albumId = album.insertId;

        if (tags) {
            let tagsArray = tags;
            if (!Array.isArray(tagsArray)) {
                tagsArray = [tagsArray];
            }
            // Filtrar tags vacíos o nulos
            tagsArray = tagsArray.filter(tagId => tagId && tagId !== '');
            for (const tagId of tagsArray) {
                await db.query("INSERT INTO albumes_tags (id_album, id_tag) VALUES (?, ?)", [albumId, tagId]);
            }
        }

        res.redirect('/home');

    } catch (error) {
        console.error(error);
        res.status(500).render('home', {
            title: 'Error',
            error: 'Error al crear el álbum. Inténtalo de nuevo más tarde.',
            usuario: req.usuario, // o null
            albumes: [],
            tags: []
        });
    }
})

// Mostrar imagenes de un album
router.get('/:id', [autMiddleware], async (req, res) => {
    try {
        const id_album = req.params.id;

        const db = await initConnection();

        // Obtener datos del álbum
        const [albumRows] = await db.query("SELECT * FROM albumes WHERE id_album = ?", [id_album]);
        if (albumRows.length === 0) return res.status(404).send('Álbum no encontrado');
        const album = albumRows[0];

        let imagenes = [];
        if (album.id_usuario_compartido) {
            // Es un álbum compartido: traemos imágenes del usuario compartido que estén marcadas como compartidas
            [imagenes] = await db.query(
                `SELECT i.* FROM imagenes i 
                 JOIN albumes a ON i.id_album = a.id_album 
                 WHERE a.id_usuario = ? AND i.compartida = 1 AND i.bloqueada = 0`,
                [album.id_usuario_compartido]
            );
        } else {
            // Es un álbum normal: traemos sus imágenes
            [imagenes] = await db.query("SELECT * FROM imagenes WHERE id_album = ? AND bloqueada = 0", [id_album]);
        }

        for (let img of imagenes) {
            const [comentarios] = await db.query(
                "SELECT c.texto, c.creado_en, u.alias, u.imagen_perfil FROM comentarios c JOIN usuarios u ON c.id_usuario = u.id_usuario WHERE c.id_imagen = ? ORDER BY c.creado_en ASC", [img.id_imagen]
            );
            img.comentarios = comentarios; // Array de comentarios para esa imagen
            img.url = img.ruta || img.url;
        }
        res.render('album', {
            album,
            imagenes,
            usuario: req.usuario
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error interno');
    }
});

// Subir una imagen
router.post('/:id/imagenes/nueva', [autMiddleware, upload.single('imagen')], imagenFormMiddleware, async (req, res) => {
    try {
        const id_album = req.params.id;
        const db = await initConnection();
        const { titulo, descripcion } = req.body;

        // Validar límite de 20 imágenes
        const [countResult] = await db.query("SELECT COUNT(*) as total FROM imagenes WHERE id_album = ?", [id_album]);
        if (countResult[0].total >= 20) {
            return res.status(400).send('El álbum ya ha alcanzado el límite máximo de 20 imágenes.');
        }

        if (!req.file) {
            return res.status(400).send('No se ha subido ninguna imagen');
        }

        const url = '/uploads/' + req.file.filename;
        await db.query("INSERT INTO imagenes (id_album, titulo, descripcion, url) VALUES (?, ?, ?, ?)",
            [id_album, titulo, descripcion, url]
        )
        res.redirect(`/albumes/${id_album}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al subir la imagen');
    }
})


// Alternar estado de compartir imagen
router.post('/imagenes/:id/compartir', [autMiddleware], async (req, res) => {
    try {
        const id_imagen = req.params.id;
        const db = await initConnection();
        const usuarioId = req.usuario.id;

        // Verificar que la imagen pertenece al usuario
        const [imagenData] = await db.query(
            `SELECT a.id_usuario FROM imagenes i 
             JOIN albumes a ON i.id_album = a.id_album 
             WHERE i.id_imagen = ?`,
            [id_imagen]
        );

        if (imagenData.length === 0 || imagenData[0].id_usuario !== usuarioId) {
            return res.status(403).json({ success: false, error: 'No tienes permiso' });
        }

        await db.query(
            "UPDATE imagenes SET compartida = NOT compartida WHERE id_imagen = ?",
            [id_imagen]
        );

        const [newStatus] = await db.query("SELECT compartida FROM imagenes WHERE id_imagen = ?", [id_imagen]);
        res.json({ success: true, compartida: newStatus[0].compartida });

    } catch (error) {
        console.error('Error al alternar compartir:', error);
        res.status(500).json({ success: false });
    }
});

// Redireccionar desde notificación a imagen
router.get('/ver-imagen-notif/:id_imagen', [autMiddleware], async (req, res) => {
    try {
        const id_imagen = req.params.id_imagen;
        const db = await initConnection();
        const [rows] = await db.query("SELECT id_album FROM imagenes WHERE id_imagen = ?", [id_imagen]);

        if (rows.length > 0) {
            res.redirect(`/albumes/${rows[0].id_album}#img-${id_imagen}`);
        } else {
            res.redirect('/home');
        }
    } catch (error) {
        res.redirect('/home');
    }
});

module.exports = router;