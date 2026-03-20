import { init } from "./instructores.js";
import { initSupervisor } from "./supervisor.js";
import { initContrato } from "./contrato.js";
import { initDireccion } from "./direccion.js";

console.log("=== MAIN.JS CARGADO ===");

// Mapa de inicializadores por página
const inicializadores = {
    'contrato.html': initContrato,
    'tabla.html': () => {
        init();
        initSupervisor();
        initContrato();
    },
    'supervisor.html': initSupervisor,
    'direccion.html': initDireccion
};

document.addEventListener("click", function (e) {
    const enlace = e.target.closest("[data-page]");

    if (enlace) {
        e.preventDefault();
        const pagina = enlace.dataset.page;
        console.log("Click en página:", pagina);

        fetch(pagina)
            .then(res => res.text())
            .then(html => {
                document.getElementById("contenido").innerHTML = html;
                console.log("Contenido actualizado:", pagina);
                
                // Esperar a que el DOM se actualice
                setTimeout(() => {
                    // Buscar el inicializador correspondiente
                    const inicializador = inicializadores[pagina.split('/').pop()];
                    
                    if (inicializador) {
                        console.log(`>>> Ejecutando inicializador para ${pagina}`);
                        inicializador();
                    } else {
                        console.log(`No hay inicializador definido para: ${pagina}`);
                    }
                }, 100);
            })
            .catch(error => {
                console.error("Error cargando página:", error);
            });
    }
});