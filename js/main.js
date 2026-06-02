// main.js (REFACTORIZADO)
import { init as initInstructores } from "./instructores.js";
import { initSupervisor } from "./supervisor.js";
import { initContrato } from "./contrato.js";
import { initDireccion } from "./direccion.js";
import { initInforme } from "./informes.js";
import { initContacto } from "./contacto.js";
import { initPoliza } from "./poliza.js";
import { initPago } from "./pago.js";
import { initAreaFormacion } from "./areaFormacion.js";

console.log("=== MAIN.JS CARGADO ===");

// Mapa de inicializadores por página
const inicializadores = {
    'contrato.html': initContrato,
    'informes.html': initInforme,
    'tabla.html': initInstructores,
    'supervisor.html': initSupervisor,
    'direccion.html': initDireccion,
    'contacto.html': initContacto,
    'poliza.html': initPoliza,
    'pagos.html': initPago,
    'area_formacion.html': initAreaFormacion
};

// Estado global simple para evitar dobles inicializaciones
let paginaActual = null;

document.addEventListener("click", async function (e) {
    const enlace = e.target.closest("[data-page]");

    if (!enlace) return;

    e.preventDefault();

    const pagina = enlace.dataset.page;

    if (!pagina) return;

    console.log("📄 Click en página:", pagina);

    try {
        const res = await fetch(pagina);
        const html = await res.text();

        const contenedor = document.getElementById("contenido");

        if (!contenedor) {
            console.error("❌ No existe #contenido");
            return;
        }

        // 🔥 Limpiar contenido anterior
        contenedor.innerHTML = "";

        // 🔥 Insertar nuevo HTML
        contenedor.innerHTML = html;

        console.log("✅ Página cargada:", pagina);

        const nombreArchivo = pagina.split('/').pop();

        // Evitar doble init de la misma página
        if (paginaActual === nombreArchivo) {
            console.log("⚠️ Misma página ya inicializada, se omite");
            return;
        }

        paginaActual = nombreArchivo;

        const inicializador = inicializadores[nombreArchivo];

        if (!inicializador) {
            console.log("⚠️ No hay inicializador para:", nombreArchivo);
            return;
        }

        // 🔥 IMPORTANTE: ejecutar después del render completo del DOM
        requestAnimationFrame(() => {
            setTimeout(() => {
                console.log(`🚀 Ejecutando init de: ${nombreArchivo}`);
                inicializador();
            }, 50);
        });

    } catch (error) {
        console.error("❌ Error cargando página:", error);
    }
});