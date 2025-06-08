
document.addEventListener('DOMContentLoaded', function () { 
    const form = document.getElementById('loginForm');
    const alias = document.getElementById('alias');
    const clave = document.getElementById('clave');

    // Crear divs de error para cada campo
    function crearErrorDiv(input) {
        let div = document.createElement('div');
        div.className = 'text-red-200 bg-rose-900 rounded text-sm mt-1 text-center';
        input.parentNode.appendChild(div);
        return div;
    }

    const aliasError = crearErrorDiv(alias);
    const claveError = crearErrorDiv(clave);


    function validarAlias() {
        if (alias.value === '') {
            console.log('Alias no puede estar vacío');
            aliasError.textContent = 'El alias es obligatorio';
            return false;
        } else {
            aliasError.textContent = '';
            return true;
        }
    }

    function validarClave() {
        if (clave.value === '') {
            console.log('Clave no puede estar vacía');
            claveError.textContent = 'La clave es obligatoria';
            return false;
        } else {
            claveError.textContent = '';
            return true;
        }
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Evita el envío del formulario

        const isAliasValid = validarAlias();
        const isClaveValid = validarClave();

        if (isAliasValid && isClaveValid) {
            console.log('Formulario válido, enviando datos...');
            form.submit(); // Envía el formulario si todo es válido
        }
    });

})