// js/instructor.js
import { InstructorService } from './instructor.service.js';

export async function init() {

    const tabla = document.querySelector(".cuerpoTabla");
    if (!tabla) return;

    const instructores = await InstructorService.get_all_instructores_paginated();
    tabla.innerHTML = "";

    console.log(instructores)

    instructores.data.forEach(inst => {
        tabla.innerHTML += `
            <tr>
                <td>${inst.id_instructor}</td>
                <td>${inst.id_supervisor}</td>
                <td>${inst.tipo_documento}</td>
                <td>${inst.numero_documento}</td>
                <td>${inst.nombres}</td>
                <td>${inst.apellidos}</td>
                <td>${inst.fecha_nacimiento}</td>
                <td>${inst.fecha_expedicion}</td>
                <td>${inst.arl}</td>
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