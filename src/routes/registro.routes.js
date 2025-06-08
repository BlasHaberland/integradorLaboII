const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { initConnection } = require('../db/conection');

//MIDLEWARES
const registroFormMiddleware = require('../middleware/registro-form.middleware');

//Mostrar formilario
router.get('/', (req, res) => {
  res.render('registro', { title: 'Registro' });
});

//REGISTRAR USUARIO
router.post('/', [registroFormMiddleware], async (req, res) => { 
    try {
        const { nombre, apellido, alias, email, clave } = req.body;
        const db = await initConnection();
        const hashClave = await bcrypt.hash(clave, 10);

        const formatoNombre = capitalizar(nombre);
        const formatoApellido = capitalizar(apellido);

        //imagen por defecto de usuario 
        const imagenDefault = 'default-user.jpg'

        await db.query(
             'INSERT INTO usuarios (nombre, apellido, email, clave, alias,imagen_perfil) VALUES (?, ?, ?, ?, ?, ?)', [formatoNombre, formatoApellido, email, hashClave, alias, imagenDefault]
        )

        res.redirect('/');
            
    } catch (error) {
        console.error('Error en el registro:', error);
        return res.status(500).render('registro', {
            title: 'Registro',
            error: 'Error al procesar el registro. Inténtalo de nuevo más tarde.'
        });      
    }
})



//FUNCIONES
//formato ej: blas -> Blas , BLAS -> Blas
function capitalizar(str) {
    console.log(str);
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

module.exports = router;