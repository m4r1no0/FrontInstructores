import { init } from "./instructores.js";

document.addEventListener("click", function (e) {

    const enlace = e.target.closest("[data-page]");

    if (enlace) {

        e.preventDefault();

        const pagina = enlace.dataset.page;

        fetch(pagina)
            .then(res => res.text())
            .then(html => {

                document.getElementById("content").innerHTML = html;

                // 🔥 AQUÍ ES DONDE SE LLAMA
                if (pagina.includes("tabla.html")) {
                    init();
                }

            });

    }

});