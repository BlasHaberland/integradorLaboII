const jwt = require('jsonwebtoken');

const usuarioMiddleware = (req, res, next) => {
    const token = req.cookies.aut_cookie;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_CLAVE);
            req.usuario = decoded;
            res.locals.usuarioLogueado = decoded;
        } catch (error) {
            console.error('Error al verificar el token:', error);
        }
    }
    next();
};

module.exports = usuarioMiddleware;
