// js/instructor.js
import { InstructorService } from './instructor.service.js';
import { SupervisorService } from './supervisor.service.js';


export async function init() {

    const tabla = document.querySelector(".cuerpoTabla");
    if (!tabla) return;

    const instructores = await InstructorService.get_all_instructores_paginated(1, 50);

    const cuerpoFecha =document.querySelector('.cuerpoFecha');



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
                <td><button class='btn btn-fecha' id='fechas' data-bs-target="#ModalFecha" data-bs-toggle="modal" data-documento="${inst.numero_documento}">${inst.numero_documento}</button></td>
                <td>${inst.nombres}</td>
                <td>${inst.apellidos}</td>
                <td>
                    <button class="btn btn-danger botonEliminar"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
</svg></button>
                    <button data-bs-target="#ModalActualizar" data-bs-toggle="modal" class="btn btn-warning botonActualizar"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-repeat" viewBox="0 0 16 16">
  <path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z"/>
</svg></i></button>
                </td>
            </tr>
        `;
        document.addEventListener("click", function (event) {

            if (event.target.classList.contains("btn-fecha")) {

                let datosBoton = event.target.getAttribute("data-documento");

                console.log('aqui bton',datosBoton );

            }
        });


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

    document
  .getElementById("formInstructorActualizar")
  .addEventListener("submit", handleUpdateSubmit);

    async function handleUpdateSubmit(event){
        event.preventDefault();

        const id_instructor = document.getElementById('edit-produccion-id').value;
        const updatedData = {
        tipo_documento:'',
        numero_documento: 0,
        nombres: '',
        apellidos: '',
        fecha_nacimiento: '',
        fecha_expedicion: '',
        arl: '',
        id_supervisor: 0
    };
        try{
            await InstructorService.update_user_by_id(id_instructor,updatedData);
            alert("actualizacion existosa")

        }catch(error){
            console.error(error)
        }
    }




}