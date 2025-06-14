const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');

// BUSCAR USUARIO

router.get('/', async (req, res) => {
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

        res.render('no-encontrado', {query})
    } catch (error) {
        console.error('Error al buscar usuario:', error);
    }
})

module.exports = router;
