const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');
const autMiddleware = require('../middleware/aut.middleware');
const upload = require('../config/multer.config');

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
        const { nombre, apellido, alias, email,antecedentes, intereses, imagen_perfil_actual } = req.body
        const portafolio_publico = req.body.portafolio_publico === "1" ? 1 : 0
        
        //verifica si se modifico la imagen de perfil
        let imagen_perfil = imagen_perfil_actual
        if (req.file) {
            imagen_perfil = '/uploads/' + req.file.filename;
        }

        //actualizar el usuario
        await db.query(
            `UPDATE usuarios SET nombre=?, apellido=?, alias=?, email=?, antecedentes=?,intereses=?, portafolio_publico=?, imagen_perfil=? WHERE id_usuario=?`,
            [nombre, apellido, alias, email, antecedentes,intereses, portafolio_publico, imagen_perfil, usuarioId]
        );

        res.redirect('/usuario/editar?mensaje=PerfilActualizado')

    } catch (error) {
        console.error('Error al editar el perfil:', error);
        res.status(500).send('Error al editar el perfil');
    }

})



router.get('/:alias',[autMiddleware], async (req, res) => {
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
        if (usuario.id_usuario !== req.usuario.id) {
            const [amistad] = await db.query(`
                SELECT * FROM amistades 
                WHERE 
                    (
                        (id_remitente = ? AND id_destinatario = ?)
                        OR
                        (id_remitente = ? AND id_destinatario = ?)
                    )
                    AND estado = 'aceptada'
                LIMIT 1
            `, [req.usuario.id, usuario.id_usuario, usuario.id_usuario, req.usuario.id]);
            amistadAceptada = amistad.length > 0;
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
            puedeVerAlbumes: usuario.portafolio_publico === 1 || amistadAceptada || usuario.id_usuario === req.usuario.id
        });

    } catch (error) {
        console.error('Error al cargar perfil:', error);
    }
});

module.exports = router;