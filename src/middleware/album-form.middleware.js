const albumFormMiddleware = (req, res, next) => { 
    const titulo = req.body.titulo
    
    if (!titulo) {
        return res.status(400).render('home', {
            title: 'Nuevo Álbum',
            error: 'El título del álbum es obligatorio.',
            usuario: req.usuario,
            albumes: []
        });
    }
    
    next();
}

module.exports = albumFormMiddleware;