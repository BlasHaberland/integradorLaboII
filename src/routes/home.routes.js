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
                usuario: null
            });
        }

        // Obtener los álbumes del usuario
        const [albumes] = await db.query('SELECT * FROM albumes WHERE id_usuario = ?', [req.usuario.id]);
        if (!albumes) {
            return res.status(404).render('home', {
                title: 'Home',
                error: 'No se encontraron álbumes para este usuario.',
                usuario: usuario[0]
            });
        }
        res.render('home', { title: 'Home', usuario: usuario[0], albumes });

    } catch (error) {
        console.error('Error en /home:', error);
        res.status(500).render('home', {
            title: 'Home',
            error: 'Error al obtener el usuario. Inténtalo de nuevo más tarde.',
            usuario: null
        });
    }
})

// // Mostrar el usuario registrado
// router.get('/usuario', async (req, res) => {
//     try {
//         const db = await initConnection();
//         const [usuario] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [req.user.id]);
        
//         if (!usuario[0]) {
//             return res.status(404).render('home', {
//                 title: 'Home',
//                 error: 'Usuario no encontrado'
//             });
//         }

//         res.render('usuario', { title: 'Usuario', usuario: usuario[0] });
        
//     } catch (error) {
//         console.error('Error al obtener el usuario:', error);
//         res.status(500).render('home', {
//             title: 'Home',
//             error: 'Error al obtener el usuario. Inténtalo de nuevo más tarde.'
//         });
//     }
// })

module.exports = router;