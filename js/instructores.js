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
    console.log(instructores);
    let iconoContrato = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-shop" viewBox="0 0 16 16">
  <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0M1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5M4 15h3v-5H4zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zm3 0h-2v3h2z"/>
</svg>`

    let iconoEliminar =`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
</svg>`
    let iconoActualizar =  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-repeat" viewBox="0 0 16 16">
  <path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z"/>
</svg>`

    instructores.data.forEach(inst => {
        let supervisor = ''
        supervisores.forEach(item =>{
            if(inst.id_supervisor == item.id_supervisor){
                supervisor = item.nombre
                console.log(supervisor)
            }
        })
        tabla.innerHTML += `
            <tr>
                <td><button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#ModalContratoNuevo">${iconoContrato}</button>
</td>
                <td>${supervisor}</td>
                <td>${inst.tipo_documento}</td>
                <td><button class='btn btn-fecha' id='fechas' data-bs-target="#ModalFecha" data-bs-toggle="modal" data-documento="${inst.numero_documento}">${inst.numero_documento}</button></td>
                <td>${inst.nombres}</td>
                <td>${inst.apellidos}</td>
                <td>
                    <button class="btn btn-danger botonEliminar">${iconoEliminar}</button>
                    <button data-bs-target="#ModalActualizar" data-bs-toggle="modal" class="btn btn-warning botonActualizar">${iconoActualizar}</button>
                </td>
            </tr>
        `;
        document.addEventListener("click", function (event) {

            if (event.target.classList.contains("btn-fecha")) {

                let datosBoton = event.target.getAttribute("data-documento");
                console.log('aqui bton',datosBoton );

                let dato_numero = Number(datosBoton)
                

                instructores.data.forEach(item =>{
                    if(item.numero_documento == dato_numero){
                        cuerpoFecha.innerHTML = `
                                                    <td>${item.numero_documento}</td>
                                                    <td>${item.fecha_nacimiento}</td>
                                                    <td>${item.fecha_expedicion}</td>
                                                `
                        console.log('item', item)
                    }
                })
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