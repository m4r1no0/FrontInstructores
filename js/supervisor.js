// js/instructor.js
import { SupervisorService } from './supervisor.service.js';


export async function initSupervisor() {

    const tabla = document.querySelector(".cuerpoTabla");
    if (!tabla) return;

    const supervisores = await SupervisorService.get_all_supervisores();
    tabla.innerHTML = ""; 

    console.log(supervisores)

    supervisores.forEach(inst => {
        tabla.innerHTML += `
            <tr>
                <td>${inst.id_supervisor}</td>
                <td>${inst.nombre}</td>
                <td>${inst.cedula}</td>
                <td><button class="btn btn-primary">+</button></td>
            </tr>
        `;
    });

    // 🔥 CLAVE: destruir si ya existe
    if ($.fn.DataTable.isDataTable('#dataTable')) {
        $('#dataTable').DataTable().destroy();
    }

    // Inicializar DataTable
    $('#dataTable').DataTable();

    console.log(document.querySelector(".cuerpoTabla"));

}