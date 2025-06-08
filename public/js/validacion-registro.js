document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registroForm');
    const pristine = new Pristine(form);
    const claveError = document.getElementById('clave-error');

    form.addEventListener('submit', function(e){
        const clave = form.querySelector('input[name="clave"]').value;
        const clave2 = form.querySelector('input[name="clave2"]').value;
        let valido = true;

        // Limpiar mensaje anterior
        claveError.textContent = '';

        if(clave !== clave2){
            claveError.textContent = 'Las contraseñas no coinciden';
            valido = false;
        }
        if(!pristine.validate()){
            valido = false;
        }
        if(!valido){
            e.preventDefault();
        }
    });
});