const registroFormMiddleware = (req, res, next) => { 
    const{nombre, apellido, alias, email, clave, clave2} = req.body;
    
    //Validar campos
    if(!nombre || !apellido || !alias || !email || !clave || !clave2) {
        return res.status(400).render('registro', {
            title: 'Registro',
            error: 'Todos los campos son obligatorios'
        });
    }

    //Validar nombre y apellido
    const nombreApellidoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;
    if (!nombreApellidoRegex.test(nombre) || !nombreApellidoRegex.test(apellido)) {
        return res.status(400).json({
            title: 'Registro',
            error: 'El nombre y el apellido solo deben contener letras y espacios',
        });
    }

    //Validar alias
    const aliasRegex = /^[^\s]{1,25}$/;
    if (!aliasRegex.test(alias)) {
        return res.status(400).render('registro', {
            title: 'Registro',
            error: 'El alias no debe contener espacios y debe tener un máximo de 25 caracteres'
        });
    }

    //Validar formato de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
        return res.status(400).render('registro', {
            title: 'Registro',
            error: 'El formato del email es incorrecto'
        });
    }

    //Validar longitud de la contraseña
     if (clave.length < 4) {
        return res.status(400).render('registro', {
            title: 'Registro',
            error: 'La contraseña debe tener al menos 4 caracteres'
        });
    }

    //Validar que las contraseñas coincidan
    if (clave != clave2) {
        return res.status(400).render('registro', {
            title: 'Registro',
            error: 'Las contraseñas no coinciden'
        });
    }

    next();
}

module.exports = registroFormMiddleware;

// TODO: validar correctamente la clave, por ejemplo, que contenga al menos un número y una letra mayúscula