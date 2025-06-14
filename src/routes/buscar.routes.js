const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');
const autMiddleware = require('../middleware/aut.middleware');

// BUSCAR USUARIO

router.get('/',[autMiddleware], async (req, res) => {
    try {
        const db = await initConnection();
        const query = req.query.query?.trim();
        if (!query) {
            return res.redirect('/');
        }

        //BUSCAR ALIAS EXACTO
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE alias = ?', [query]);

        console.log('Usuarios encontrados:', usuarios);

        if (usuarios && usuarios.length > 0) {
            return res.redirect(`/usuario/${usuarios[0].alias}`);
        }

        res.status(404).redirect(`/home?mensaje=No existe ningún usuario con el alias "${query}".`);
    } catch (error) {
        console.error('Error al buscar usuario:', error);
    }
})

module.exports = router;
