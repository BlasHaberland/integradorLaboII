const imagenFormMiddleware = (req, res, next) => {
    const titulo = req.body.titulo || ''

    if (!titulo.trim()) {
        return res.status(400).send('El título de la imagen es obligatoria')
    }

    if (!req.file) {
         return res.status(400).send('Debes subir una imagen')
    }
    next()
}

module.exports = imagenFormMiddleware;