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
        const { titulo, descripcion } = req.body;
        const portada = req.file ? '/uploads/' + req.file.filename : '/default-album.jpg';

        await db.query('INSERT INTO albumes (id_usuario,titulo,descripcion,portada) VALUES (?,?,?,?)', [id_usuario, titulo, descripcion, portada]);

        res.redirect('/home');

    } catch (error) {
        res.status(500).render('error', {
            title: 'Error',
            error: 'Error al crear el álbum. Inténtalo de nuevo más tarde.'
        });
    }
})   

module.exports = router;