const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');
const autMiddleware = require('../middleware/aut.middleware');
const upload = require('../config/multer.config');
const bcrypt = require('bcryptjs');

//Editar perfil
//obterner el usuario logueado
router.get('/editar', [autMiddleware], async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const db = await initConnection();

        const [usuario] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [usuarioId]);
        if (!usuario || usuario.length === 0) {
            return res.status(404).render('no-encontrado', { query: usuarioId });
        }

        res.render('editar-usuario', {
            usuario: usuario[0],
        })

    } catch (error) {
        res.status(500).send('Error al cargar el perfil');
    }
})

router.post('/editar', [autMiddleware, upload.single('imagen_perfil')], async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const db = await initConnection();
        const { nombre, apellido, alias, email, antecedentes, intereses, imagen_perfil_actual } = req.body
        const portafolio_publico = req.body.portafolio_publico === "1" ? 1 : 0

        //verifica si se modifico la imagen de perfil
        let imagen_perfil = imagen_perfil_actual
        if (req.file) {
            imagen_perfil = '/uploads/' + req.file.filename;
        }

        //actualizar el usuario
        await db.query(
            `UPDATE usuarios SET nombre=?, apellido=?, alias=?, email=?, antecedentes=?,intereses=?, portafolio_publico=?, imagen_perfil=? WHERE id_usuario=?`,
            [nombre, apellido, alias, email, antecedentes, intereses, portafolio_publico, imagen_perfil, usuarioId]
        );

        res.redirect('/usuario/editar?mensaje=PerfilActualizado')

    } catch (error) {
        console.error('Error al editar el perfil:', error);
        res.status(500).send('Error al editar el perfil');
    }

})

// Cambiar contraseña - Vista
router.get('/cambiar-clave', [autMiddleware], async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const db = await initConnection();
        const [usuario] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [usuarioId]);

        res.render('cambiar-password', {
            usuario: usuario[0],
            mensaje: req.query.mensaje,
            error: req.query.error
        });
    } catch (error) {
        res.status(500).send('Error al cargar la página de cambio de clave');
    }
});

// Cambiar contraseña - Lógica
router.post('/cambiar-clave', [autMiddleware], async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { clave_actual, clave_nueva, clave_confirmar } = req.body;
        const db = await initConnection();

        if (clave_nueva !== clave_confirmar) {
            return res.redirect('/usuario/cambiar-clave?error=Las claves nuevas no coinciden');
        }

        const [usuario] = await db.query('SELECT clave FROM usuarios WHERE id_usuario = ?', [usuarioId]);

        if (!bcrypt.compareSync(clave_actual, usuario[0].clave)) {
            return res.redirect('/usuario/cambiar-clave?error=La clave actual es incorrecta');
        }

        const hashClave = await bcrypt.hash(clave_nueva, 10);
        await db.query('UPDATE usuarios SET clave = ? WHERE id_usuario = ?', [hashClave, usuarioId]);

        res.redirect('/usuario/editar?mensaje=ClaveActualizada');

    } catch (error) {
        console.error('Error al cambiar la clave:', error);
        res.status(500).send('Error interno al cambiar la clave');
    }
});



router.get('/:alias', [autMiddleware], async (req, res) => {
    try {
        const alias = req.params.alias;
        const db = await initConnection();
        const mensaje = req.query.mensaje;

        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE alias = ?', [alias]);
        if (!usuarios || usuarios.length === 0) {
            return res.status(404).render('no-encontrado', { query: alias });
        }
        const usuario = usuarios[0];

        let albumes = [];

        // Verificar si hay amistad aceptada
        let amistadAceptada = false;
        let amistadPendiente = false;
        let solicitudEnviadaPorMi = false;

        if (usuario.id_usuario !== req.usuario.id) {
            const [amistad] = await db.query(`
                SELECT * FROM amistades 
                WHERE id_remitente = ? AND id_destinatario = ?

            `, [req.usuario.id, usuario.id_usuario]);

            if (amistad.length > 0) {
                if (amistad[0].estado === 'aceptada') {
                    amistadAceptada = true;
                } else if (amistad[0].estado === 'pendiente') {
                    amistadPendiente = true;
                    solicitudEnviadaPorMi = amistad[0].id_remitente === req.usuario.id;
                }
            }
        }

        // Mostrar álbumes si el perfil es público o hay amistad aceptada
        if (usuario.portafolio_publico === 1 || amistadAceptada || usuario.id_usuario === req.usuario.id) {
            [albumes] = await db.query('SELECT * FROM albumes WHERE id_usuario = ?', [usuario.id_usuario]);
        }

        res.render('perfil', {
            usuario,
            albumes,
            mensaje,
            usuarioLogueado: req.usuario,
            puedeVerAlbumes: usuario.portafolio_publico === 1 || amistadAceptada || usuario.id_usuario === req.usuario.id,
            amistadAceptada,
            amistadPendiente,
            solicitudEnviadaPorMi
        });

    } catch (error) {
        console.error('Error al cargar perfil:', error);
    }
});

module.exports = router;