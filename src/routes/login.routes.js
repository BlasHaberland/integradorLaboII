const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { initConnection } = require('../db/conection');

//Mostrar formilario
router.get('/', (req, res) => {
  res.render('login', { title: 'LogIn' });
});

router.post('/', async (req, res) => { 
    try {
      const { alias, clave } = req.body;
      const db = await initConnection();

      const [usuario] = await db.query('SELECT * FROM usuarios WHERE alias = ?', [alias]);


      if (!usuario[0]) {
            return res.status(401).render('login', {
                title: 'LogIn',
                error: 'Alias o clave incorrectos'
            });
        }

      // Compara la clave proporcionada con la clave hasheada almacenada
      if (!bcrypt.compareSync(clave, usuario[0].clave)) { 
        return res.status(401).render('login',{
            title: 'LogIn',
            error: 'Alias o clave incorrectos'
          }); 
      }

      const firmaUsuario = { id: usuario[0].id_usuario, alias: usuario[0].alias, email: usuario[0].email };
      const usuarioData = jwt.sign(firmaUsuario, process.env.JWT_CLAVE);

      res.cookie('aut_cookie', usuarioData, { httpOnly: true })


      res.redirect('/home')


    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      res.status(500).render('login', {
        title: 'LogIn',
        error: 'Error al procesar el inicio de sesión. Inténtalo de nuevo más tarde.'
      });
    }
} )

module.exports = router;