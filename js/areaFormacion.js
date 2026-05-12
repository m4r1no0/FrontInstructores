// js/instructor.js
import { AreaFormacionService } from './areaFormacion.service.js';


export async function initAreaFormacion() {

    const tabla = document.querySelector(".cuerpoTablaArea");
    if (!tabla) return;

    const areas = await AreaFormacionService.get_all_areas();
    tabla.innerHTML = ""; 

    console.log(areas)

    areas.forEach(inst => {
        tabla.innerHTML += `
            <tr>
                <td>${inst.id_area}</td>
                <td>${inst.id_programa}</td>
                <td>${inst.nombre_programa}</td>
                <td>${inst.nombre_area}</td>
                <td>${inst.objeto}</td>
                <td>${inst.descripcion}</td>
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

    console.log(document.querySelector(".cuerpoTablaArea"));

}