const express = require('express');
const router = express.Router();

router.post('/', (req, res) => { 
    try {
        res.clearCookie('aut_cookie'); 
        res.render('login', {
            message: 'Has cerrado sesión correctamente.'
        })

    } catch (error) {
        console.error('error al cerrar sesion:', error)
    }
})

module.exports = router;