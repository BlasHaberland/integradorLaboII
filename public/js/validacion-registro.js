document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registroForm');
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const correo = document.getElementById('correo');
    const clave = document.getElementById('clave');
    const clave2 = document.getElementById('clave2');
    const alias = document.getElementById('alias');

    // Crear divs de error para cada campo
    function crearErrorDiv(input) {
        let div = document.createElement('div');
        div.className = 'text-red-200 bg-rose-900 rounded text-sm mt-1';
        input.parentNode.appendChild(div);
        return div;
    }

    const nombreError = crearErrorDiv(nombre);
    const apellidoError = crearErrorDiv(apellido);
    const correoError = crearErrorDiv(correo);
    const clave2Error = crearErrorDiv(clave2);
    const aliasError = crearErrorDiv(alias);

    function validarNombre() {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]{1,25}$/;
        if (nombre.value === '') {
            nombreError.textContent = '';
            return true;
        }
        if (!regex.test(nombre.value)) {
            nombreError.textContent = 'El nombre no tiene que tener numeros ni espacios y maximo 25 caracteres';
            return false;
        } else {
            nombreError.textContent = '';
            return true;
        }
    }

    function validarApellido() {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]{1,25}$/;
        if (apellido.value === '') {
            apellidoError.textContent = '';
            return true;
        }
        if (!regex.test(apellido.value)) {
            apellidoError.textContent = 'El apellido no tiene que tener numeros ni espacios y maximo 25 caracteres';
            return false;
        } else {
            apellidoError.textContent = '';
            return true;
        }
    }

    function validarCorreo() {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
        if (correo.value === '') {
            correoError.textContent = '';
            return true;
        }
        if (!regex.test(correo.value)) {
            correoError.textContent = 'Correo electrónico inválido';
            return false;
        } else {
            correoError.textContent = '';
            return true;
        }
    }

    function validarClaves() {
        if (clave.value === '' || clave2.value === '') {
            clave2Error.textContent = '';
            return true;
        }
        if (clave.value !== clave2.value) {
            clave2Error.textContent = 'Las contraseñas no coinciden';
            return false;
        } else {
            clave2Error.textContent = '';
            return true;
        }
    }

    function validarAlias() {
        if (alias.value === '') {
            aliasError.textContent = '';
            return true;
        }
        if (alias.value.length < 4) {
            aliasError.textContent = 'El alias debe tener al menos 4 caracteres';
            return false;
        } else {
            aliasError.textContent = '';
            return true;
        }
    }

    nombre.addEventListener('input', validarNombre);
    apellido.addEventListener('input', validarApellido);
    correo.addEventListener('input', validarCorreo);
    clave.addEventListener('input', validarClaves);
    clave2.addEventListener('input', validarClaves);
    alias.addEventListener('input', validarAlias);

    form.addEventListener('submit', function(e){
        let valido = true;
        if(!validarNombre()) valido = false;
        if(!validarApellido()) valido = false;
        if(!validarCorreo()) valido = false;
        if(!validarAlias()) valido = false;
        if(!validarClaves()) valido = false;
        if(!valido){
            e.preventDefault();
        }
    });
});