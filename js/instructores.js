// js/instructor.js
import { InstructorService } from './instructor.service.js';
import { SupervisorService } from './supervisor.service.js';


export async function init() {

    const tabla = document.querySelector(".cuerpoTabla");
    if (!tabla) return;

    const instructores = await InstructorService.get_all_instructores_paginated(1, 50);


    tabla.innerHTML = "";

    const supervisores = await SupervisorService.get_all_supervisores();

    const selectSupervisor = document.querySelector('#selectSupervisor')

    supervisores.forEach(supervisor => {
        const option = document.createElement("option");
        option.value = supervisor.id;
        option.textContent = supervisor.nombre;
        selectSupervisor.appendChild(option);
        });




    console.log(supervisores);

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
                <td><button class="btn btn-primary">+</button></td>
            </tr>
        `;
    });

    // 🔥 CLAVE: destruir si ya existe
    if ($.fn.DataTable.isDataTable('#dataTableInstru')) {
        $('#dataTableInstru').DataTable().destroy();
    }

    // Inicializar DataTable
    $('#dataTableInstru').DataTable();

    console.log(document.querySelector(".cuerpoTabla"));



document
  .getElementById("formInstructor")
  .addEventListener("submit", handleCreateSubmit);

async function handleCreateSubmit(event) {
  event.preventDefault();

  const newData = {
    id_supervisor: 1,
    tipo_documento: document.getElementById("tipo_documento").value,
    numero_documento: document.getElementById("documento").value,
    nombres: document.getElementById("nombre").value,
    apellidos: document.getElementById("apellido").value,
    fecha_nacimiento: document.getElementById("fecha_nacimiento").value,
    fecha_expedicion: document.getElementById("fecha_expedicion").value,
    arl: '0'
  };

  try {
    await InstructorService.create_instructor(newData);

    alert("Creación exitosa");

    const modalElement = document.getElementById("ModalAgregar");
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();

    event.target.reset();
    init();

  } catch (error) {
  console.log(error)
}
}

}