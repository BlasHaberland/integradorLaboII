// Función global para abrir el modal de reporte
window.abrirReporte = function (idImagen) {
    const modal = document.getElementById('modalReporte');
    const input = document.getElementById('reporteIdImagen');

    if (modal && input) {
        input.value = idImagen;
        modal.style.setProperty('display', 'flex', 'important');
        console.log('Modal abierto para imagen ID:', idImagen);
    } else {
        console.error('No se encontró el modal o el input de reporte');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalReporte');
    const closeBtn = document.getElementById('cerrarModalReporte');
    const form = document.getElementById('formReporte');

    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.preventDefault();
            modal.style.display = 'none';
        }
    }

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const pyload = Object.fromEntries(formData.entries());

            try {
                const res = await fetch('/reportes/crear', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pyload)
                });

                const result = await res.json();
                if (result.success) {
                    alert('Reporte enviado con éxito.');
                    modal.style.display = 'none';
                    form.reset();

                    // Cerrar el visor de imagen si está abierto
                    const modalVer = document.getElementById('modalVerImagen');
                    if (modalVer) modalVer.style.display = 'none';

                } else {
                    alert('Error: ' + result.message);
                }
            } catch (err) {
                console.error('Error:', err);
                alert('No se pudo enviar el reporte.');
            }
        };
    }

    // Cerrar al clickear fuera
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
