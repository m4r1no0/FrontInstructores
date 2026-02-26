// js/instructor.js
import { InstructorService } from './instructor.service.js';
import { SupervisorService } from './supervisor.service.js';

let instructoresGlobal = [];
let supervisoresGlobal = [];
let modalInstance = null;

export async function init() {

  const tabla = document.querySelector(".cuerpoTabla");
  if (!tabla) return;

  try {

    // 🔵 Obtener datos
    const response = await InstructorService.get_all_instructores_paginated(1, 50);
    instructoresGlobal = response.data;

    supervisoresGlobal = await SupervisorService.get_all_supervisores();

    // 🔵 Renderizar select supervisores
    renderSupervisorSelect();

    // 🔵 Renderizar tabla
    renderTable();

    // 🔥 Destruir DataTable si ya existe
    if ($.fn.DataTable.isDataTable('#dataTableInstru')) {
      $('#dataTableInstru').DataTable().destroy();
    }

    $('#dataTableInstru').DataTable();

    // 🔵 Delegación de eventos
    tabla.removeEventListener('click', handleTableClick);
    tabla.addEventListener('click', handleTableClick);

    // 🔵 Form editar
    const formActualizar = document.getElementById('formInstructorActualizar');
    if (formActualizar) {
      formActualizar.removeEventListener('submit', handleUpdateSubmit);
      formActualizar.addEventListener('submit', handleUpdateSubmit);
    }

    // 🔵 Form crear
    const formCrear = document.getElementById('formCrearInstructor');
    if (formCrear) {
      formCrear.removeEventListener('submit', handleCreateSubmit);
      formCrear.addEventListener('submit', handleCreateSubmit);
    }

  } catch (error) {
    console.error("Error cargando instructores:", error);
  }
}

function renderSupervisorSelect() {

  const selectSupervisor = document.querySelector('#selectSupervisor');
  if (!selectSupervisor) return;

  selectSupervisor.innerHTML = '<option value="">Seleccione supervisor</option>';

  supervisoresGlobal.forEach(supervisor => {
    const option = document.createElement("option");
    option.value = supervisor.id_supervisor;
    option.textContent = supervisor.nombre;
    selectSupervisor.appendChild(option);
  });
}

async function recargarTabla() {

  const response = await InstructorService.get_all_instructores_paginated(1, 50);
  instructoresGlobal = response.data;

  // destruir DataTable si existe
  if ($.fn.DataTable.isDataTable('#dataTableInstru')) {
    $('#dataTableInstru').DataTable().destroy();
  }

  renderTable();

  $('#dataTableInstru').DataTable();
}


function renderTable() {

  const tabla = document.querySelector(".cuerpoTabla");
  tabla.innerHTML = "";

  instructoresGlobal.forEach(inst => {

    const supervisor = supervisoresGlobal.find(
      s => s.id_supervisor == inst.id_supervisor
    );

    tabla.innerHTML += `
      <tr>
        <td>
          <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#ModalContratoNuevo">
            📄
          </button>
        </td>

        <td>${supervisor ? supervisor.nombre : ''}</td>
        <td>${inst.tipo_documento}</td>

        <td>
          <button 
            class="btn btn-fecha"
            data-bs-toggle="modal"
            data-bs-target="#ModalFecha"
            data-documento="${inst.numero_documento}">
            ${inst.numero_documento}
          </button>
        </td>

        <td>${inst.nombres}</td>
        <td>${inst.apellidos}</td>

        <td>
          <button 
            class="btn btn-danger botonEliminar"
            data-id="${inst.id_instructor}">
            <i class="bi bi-trash"></i>
          </button>

          <button 
  class="btn btn-warning botonActualizar"
  data-id="${inst.id_instructor}"><i class="bi bi-repeat"></i></button>
        </td>
      </tr>
    `;
  });
}

function handleTableClick(event) {

  // 🔵 Botón FECHA
  const fechaButton = event.target.closest('.btn-fecha');
  if (fechaButton) {

    const numeroDocumento = fechaButton.dataset.documento;

    const instructor = instructoresGlobal.find(
      i => i.numero_documento == numeroDocumento
    );

    const cuerpoFecha = document.querySelector('.cuerpoFecha');

    if (instructor && cuerpoFecha) {
      cuerpoFecha.innerHTML = `
        <tr>
          <td>${instructor.numero_documento}</td>
          <td>${instructor.fecha_nacimiento}</td>
          <td>${instructor.fecha_expedicion}</td>
        </tr>
      `;
    }

    return;
  }

  // 🔵 Botón ACTUALIZAR
  const editButton = event.target.closest('.botonActualizar');
  if (editButton) {
    openEditModal(editButton.dataset.id);
    return;
  }

  // 🔵 Botón ELIMINAR
  const deleteButton = event.target.closest('.botonEliminar');
  if (deleteButton) {
    eliminarInstructor(deleteButton.dataset.id);
    return;
  }
}

async function openEditModal(id) {

  const modalElement = document.getElementById('ModalActualizar');
  modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

  try {

    const instructor = await InstructorService.get_user_by_id(id);

    // 🔥 GUARDAR ID REAL
    document.getElementById('idInstructorActualizar').value = instructor.id_instructor;

    document.getElementById('nombreActualizar').value = instructor.nombres;
    document.getElementById('apellidoActualizar').value = instructor.apellidos;
    document.getElementById('tipo_documentoActualizar').value = instructor.tipo_documento;
    document.getElementById('numero_documentoActualizar').value = instructor.numero_documento;
    document.getElementById('fecha_nacimientoActualizar').value = instructor.fecha_nacimiento;
    document.getElementById('fecha_expedicionActualizar').value = instructor.fecha_expedicion;
    document.getElementById('selectActualizar').value = instructor.id_supervisor;

    modalInstance.show();

  } catch (error) {
    console.error("Error:", error);
  }
}

async function handleUpdateSubmit(event) {
  event.preventDefault();

 const id = document.getElementById('idInstructorActualizar').value;

  const updatedData = {
    nombres: document.getElementById('nombreActualizar').value,
    apellidos: document.getElementById('apellidoActualizar').value,
    tipo_documento: document.getElementById('tipo_documentoActualizar').value,
    numero_documento: document.getElementById('numero_documentoActualizar').value,
    fecha_nacimiento: document.getElementById('fecha_nacimientoActualizar').value,
    fecha_expedicion: document.getElementById('fecha_expedicionActualizar').value,
    id_supervisor: 1
  };

  try {

    await InstructorService.update_user_by_id(id, updatedData);

    modalInstance.hide();

    await recargarTabla();

  } catch (error) {
    console.error("Error:", error);
    modalInstance.hide()
  }
}

async function handleCreateSubmit(event) {
  event.preventDefault();

  const newData = {
    nombres: document.getElementById('nombreCrear').value,
    apellidos: document.getElementById('apellidoCrear').value,
    tipo_documento: document.getElementById('tipo_documentoCrear').value,
    numero_documento: document.getElementById('numero_documentoCrear').value,
    fecha_nacimiento: document.getElementById('fecha_nacimientoCrear').value,
    fecha_expedicion: document.getElementById('fecha_expedicionCrear').value,
    id_supervisor: document.getElementById('selectSupervisor').value
  };

  try {

    await InstructorService.create_instructor(newData);
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("ModalCrear")
    );

    if (modal) modal.hide();

    event.target.reset();
    init();

  } catch (error) {
    console.error("Error:", error);
  }



  
}

// async function eliminarInstructor(id) {
//   if (!result.isConfirmed) return;

//   try {

//     await InstructorService.delete_instructor(id);
//     init();

//   } catch (error) {
//     console.error(error);
//   }
// }