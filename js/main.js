import { init } from "./instructores.js";
import { initSupervisor } from "./supervisor.js";
import { initContrato } from "./contrato.js";
import { initDireccion } from "./direccion.js";

document.addEventListener("click", function (e) {

    const enlace = e.target.closest("[data-page]");

    if (enlace) {

        e.preventDefault();

        const pagina = enlace.dataset.page;

        fetch(pagina)
            .then(res => res.text())
            .then(html => {

                document.getElementById("contenido").innerHTML = html;

                // 🔥 AQUÍ ES DONDE SE LLAMA
                if (pagina.includes("tabla.html")) {
                    init();
                    initSupervisor();
                    initContrato()
                }
                else if (pagina.includes("supervisor.html")){
                    initSupervisor();
                }
                else if (pagina.includes("direccion.html")){
                    initDireccion();
                }

            });

    }

});