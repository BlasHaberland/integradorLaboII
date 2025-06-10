const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');  
const autMiddleware = require('../middleware/aut.middleware');
const albumFormMiddleware = require('../middleware/album-form.middleware');
const upload = require('../config/multer.config');  
const imagenFormMiddleware = require('../middleware/imagen-form.middleware');

router.post('/nuevo',[autMiddleware,upload.single('portada'),albumFormMiddleware], async (req, res) => {

    try {
        const db = await initConnection();
        const id_usuario = req.usuario.id;
        const { titulo, descripcion, tags } = req.body;
        console.log('tags:', tags );
        const portada = req.file ? '/uploads/' + req.file.filename : '/default-album.jpg';

        const [album] = await db.query('INSERT INTO albumes (id_usuario,titulo,descripcion,portada) VALUES (?,?,?,?)', [id_usuario, titulo, descripcion, portada]);
        const albumId = album.insertId;

        if (tags) {
            let tagsArray = tags;
            if (!Array.isArray(tagsArray)) {
                tagsArray = [tagsArray];
            }
            // Filtrar tags vacíos o nulos
            tagsArray = tagsArray.filter(tagId => tagId && tagId !== '');
            for (const tagId of tagsArray) {
                await db.query('INSERT INTO albumes_tags (id_album, id_tag) VALUES (?, ?)', [albumId, tagId]);
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
router.get('/:id', async (req, res) => {

    try {
        const id_album = req.params.id;
        const db = await initConnection();  
        // Obtener datos del álbum
        const [albumRows] = await db.query('SELECT * FROM albumes WHERE id_album = ?', [id_album]);

        if (albumRows.length === 0) return res.status(404).send('Álbum no encontrado');
        const album = albumRows[0];

        // Obtener imágenes del álbum
        const [imagenes] = await db.query('SELECT * FROM imagenes WHERE id_album = ?', [id_album]);

        // Ajusta el campo de la URL de la imagen según tu base (ej: img.url o img.ruta)
        imagenes.forEach(img => {
            img.url = img.ruta || img.url; // Ajusta según tu campo real
        });

        res.render('album', { album, imagenes });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error interno');
    }
});

// Subir una imagen
router.post('/:id/imagenes/nueva', [autMiddleware, upload.single('imagen')],imagenFormMiddleware, async (req, res) => { 
    try {
        const id_album = req.params.id;
        const db = await initConnection();
        const { titulo, descripcion } = req.body;
        
        if(!req.file) {
            return res.status(400).send('No se ha subido ninguna imagen');
        }

        const url = '/uploads/' + req.file.filename;
        await db.query('INSERT INTO imagenes (id_album, titulo, descripcion, url) VALUES (?, ?, ?, ?)',
            [id_album, titulo, descripcion, url]
        )
        res.redirect(`/albumes/${id_album}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al subir la imagen');
    }
})

module.exports = router;