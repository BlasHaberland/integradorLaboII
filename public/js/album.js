    //Subir una imagen
    document.getElementById('abrirModalImagen').onclick = function(e) {
        e.preventDefault();
        document.getElementById('modalVerImagen').classList.add('hidden');
        document.getElementById('modalImagen').classList.remove('hidden');
    };
    document.getElementById('cerrarModalImagen').onclick = function() {
        document.getElementById('modalImagen').classList.add('hidden');
    }


    //Ampliar imganes al hacer click
    document.querySelectorAll('.imagen-album').forEach(img => {
        img.onclick = function() {
            document.getElementById('modalImagen').classList.add('hidden');
            document.getElementById('imagenModalSrc').src = this.dataset.url;
            document.getElementById('tituloModal').textContent = this.dataset.titulo || 'Sin título';
            document.getElementById('descripcionModal').textContent = this.dataset.descripcion || '';
            document.getElementById('modalVerImagen').classList.remove('hidden');
            document.getElementById('inputIdImagen').value = this.dataset.id;
            
            // Mostrar comentarios
            var comentariosDiv = document.getElementById('comentarios-img-' + this.dataset.id);
            document.getElementById('comentariosModal').innerHTML = comentariosDiv ? comentariosDiv.innerHTML : '';
        }
    });
    document.getElementById('cerrarModalVerImagen').onclick = function() {
        document.getElementById('modalVerImagen').classList.add('hidden');
        document.getElementById('imagenModalSrc').src = '';
    }
    