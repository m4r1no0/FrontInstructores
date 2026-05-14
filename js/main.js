// main.js actualizado
import { init } from "./instructores.js";
import { initSupervisor } from "./supervisor.js";
import { initContrato } from "./contrato.js";
import { initDireccion } from "./direccion.js";
import { initInforme } from "./informes.js";
import { initContacto } from "./contacto.js";
import { initPoliza } from "./poliza.js";
import { initPago } from "./pago.js";
<<<<<<< HEAD
=======
import { initAreaFormacion } from "./areaFormacion.js";
>>>>>>> 1e07be78a3d1e1784ca46af8d5bb05c8d9c5bab7

console.log("=== MAIN.JS CARGADO ===");

// Mapa de inicializadores por página
const inicializadores = {
    'contrato.html': initContrato,
    'informes.html': initInforme, // 👈 Agregar el inicializador para informes
    'tabla.html': () => {
        init();
        // initSupervisor();
        // initContrato();
        // initDireccion(); // 👈 Agregar el inicializador para pólizas
    },
    'supervisor.html': initSupervisor,
    'direccion.html': initDireccion,
    'contacto.html': initContacto,
    'poliza.html': initPoliza,
<<<<<<< HEAD
    'pagos.html': initPago
=======
    'pagos.html': initPago,
    'area_formacion.html': initAreaFormacion
>>>>>>> 1e07be78a3d1e1784ca46af8d5bb05c8d9c5bab7
};

document.addEventListener("click",   function (e) {
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
                    // Extraer solo el nombre del archivo de la ruta
                    const nombreArchivo = pagina.split('/').pop();
                    console.log("Nombre archivo:", nombreArchivo);
                    
                    // Buscar el inicializador correspondiente
                    const inicializador = inicializadores[nombreArchivo];
                    
                    if (inicializador) {
                        console.log(`>>> Ejecutando inicializador para ${pagina}`);
                        inicializador();
                    } else {
                        console.log(`No hay inicializador definido para: ${pagina}`);
                        console.log("Inicializadores disponibles:", Object.keys(inicializadores));
                    }
                }, 100);
            })
            .catch(error => {
                console.error("Error cargando página:", error);
            });
    }
});

