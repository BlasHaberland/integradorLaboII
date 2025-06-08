const express = require('express');
const router = express.Router();
const { initConnection } = require('../db/conection');

router.get('/', async (req, res) => { 
    res.render('home', { title: 'Home' });
})

module.exports = router;