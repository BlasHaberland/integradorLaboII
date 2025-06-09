const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');  
const autMiddleware = require('../middleware/aut.middleware');
const albumFormMiddleware = require('../middleware/album-form.middleware');
const upload = require('../config/multer.config');  

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

module.exports = router;