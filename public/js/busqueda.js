document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('barra-busqueda');
    const resultados = document.getElementById('resultados-busqueda');

    if (!input || !resultados) return;

    input.addEventListener('input', async () => {
        const valor = input.value.trim();
        if (!valor) {
            resultados.innerHTML = '';
            return;
        }
        const res = await fetch(`/buscar/sugerencias?query=${encodeURIComponent(valor)}`);
        const sugerencias = await res.json();
        resultados.innerHTML = sugerencias.map(u => 
            `<div class="p-2 hover:bg-cyan-100 cursor-pointer" onclick="location.href='/usuario/${u.alias}'">
                <img src="${u.imagen_perfil || '/default-profile.png'}" class="inline w-6 h-6 rounded-full mr-2">
                ${u.alias} <span class="text-gray-500">(${u.nombre})</span>
            </div>`
        ).join('');
    });

    // Opcional: ocultar sugerencias al perder foco
    input.addEventListener('blur', () => {
        setTimeout(() => resultados.innerHTML = '', 200);
    });
});