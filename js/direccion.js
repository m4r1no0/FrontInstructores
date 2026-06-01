// js/direccion.js
import { DireccionService } from './direccion.service.js';

let direccionesGlobal = [];
let dataTable = null;
let modalInstance = null;  // ✅ VARIABLE GLOBAL para el modal de actualización

export async function initDireccion() {
  const tabla = document.querySelector(".cuerpoTablaDireccion");
  if (!tabla) return;

  try {
    // 🔵 Obtener datos
    const response = await DireccionService.get_all_direcciones();
    
    if (response && response.data) {
      direccionesGlobal = response.data;
    } else if (Array.isArray(response)) {
      direccionesGlobal = response;
    } else {
      direccionesGlobal = [];
    }
    
    // 🔵 Renderizar tabla
    renderTable();

    // 🔥 Destruir DataTable si ya existe
    if (dataTable) {
      dataTable.destroy();
      dataTable = null;
    }

    // 🔵 INICIALIZAR DATATABLE CON BOTONES
    dataTable = $('#dataTableDireccion').DataTable({
      responsive: true,
      autoWidth: false,
      dom: 'lBfrtip',
      buttons: [
        {
          extend: 'excel',
          text: '<i class="bi bi-file-earmark-excel"></i> Excel',
          className: 'btn btn-success btn-sm',
          title: 'Direcciones',
          exportOptions: {
            columns: [0, 1, 2, 3, 4],
            format: {
              body: function (data, type, row, meta) {
                return data.replace(/<[^>]*>/g, '').trim();
              }
            }
          }
        },
        {
          extend: 'pdf',
          text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
          className: 'btn btn-danger btn-sm',
          title: 'Direcciones',
          exportOptions: {
            columns: [0, 1, 2, 3, 4],
            format: {
              body: function (data, type, row, meta) {
                return data.replace(/<[^>]*>/g, '').trim();
              }
            }
          },
          orientation: 'landscape',
          pageSize: 'A4'
        },
        {
          extend: 'csv',
          text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV',
          className: 'btn btn-primary btn-sm',
          title: 'Direcciones',
          exportOptions: {
            columns: [0, 1, 2, 3, 4],
            format: {
              body: function (data, type, row, meta) {
                return data.replace(/<[^>]*>/g, '').trim();
              }
            }
          }
        },
        {
          extend: 'print',
          text: '<i class="bi bi-printer"></i> Imprimir',
          className: 'btn btn-info btn-sm',
          title: 'Direcciones',
          exportOptions: {
            columns: [0, 1, 2, 3, 4]
          }
        },
        {
          extend: 'copy',
          text: '<i class="bi bi-files"></i> Copiar',
          className: 'btn btn-secondary btn-sm',
          title: 'Direcciones',
          exportOptions: {
            columns: [0, 1, 2, 3, 4],
            format: {
              body: function (data, type, row, meta) {
                return data.replace(/<[^>]*>/g, '').trim();
              }
            }
          }
        }
      ],
      columnDefs: [
        {
          targets: 0,
          visible: true,
          orderable: true,
          searchable: true
        }
      ],
      language: {
        lengthMenu: 'Mostrar _MENU_ registros por página',
        zeroRecords: 'No se encontraron resultados',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        infoEmpty: 'Mostrando 0 a 0 de 0 registros',
        infoFiltered: '(filtrado de _MAX_ registros totales)',
        search: 'Buscar:',
        paginate: {
          first: 'Primero',
          last: 'Último',
          next: 'Siguiente',
          previous: 'Anterior'
        }
      }
    });

    // 🔵 Delegación de eventos
    tabla.removeEventListener('click', handleTableClick);
    tabla.addEventListener('click', handleTableClick);

    // 🔵 Form actualizar
    const formActualizar = document.getElementById('formActualizarDireccion');
    if (formActualizar) {
      formActualizar.removeEventListener('submit', handleUpdateSubmit);
      formActualizar.addEventListener('submit', handleUpdateSubmit);
      console.log("✅ Event listener del formulario de dirección configurado");
    } else {
      console.error("❌ No se encontró el formulario con id 'formActualizarDireccion'");
    }

  } catch (error) {
    console.error("Error cargando direcciones:", error);
    const tabla = document.querySelector(".cuerpoTablaDireccion");
    if (tabla) {
      tabla.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${error.message}</td></tr>`;
    }
  }
}

function renderTable() {
  const tabla = document.querySelector(".cuerpoTablaDireccion");
  if (!tabla) return;
  
  tabla.innerHTML = '';
  
  if (direccionesGlobal.length === 0) {
    tabla.innerHTML = '<tr><td colspan="6" class="text-center">No hay direcciones disponibles</td></tr>';
    return;
  }
  
  direccionesGlobal.forEach(dir => {
    // Verificar si tiene dirección
    const tieneDireccion = dir.id_direccion && dir.id_direccion !== 0;
    
    tabla.innerHTML += `
      <tr>
        <td>${dir.nombre || dir.instructor_nombre || '-'}</td>
        <td>${dir.municipio || '-'}</td>
        <td>${dir.complemento || '-'}</td>
        <td>${dir.telefono || '-'}</td>
        <td>${dir.correo_personal || '-'}</td>
        <td>
          ${!tieneDireccion ? `
            <button class="btn btn-success btn-sm btn-agregar" 
                    data-id="${dir.id_instructor}"
                    data-bs-toggle="modal" 
                    data-bs-target="#ModalAgregarDireccion"
                    title="Agregar dirección">
              <i class="bi bi-plus-circle"></i> Agregar
            </button>
          ` : `
            <button class="btn btn-warning btn-sm botonActualizar" 
                    data-id="${dir.id_direccion}"
                    data-bs-toggle="modal" 
                    data-bs-target="#ModalActualizarDireccion"
                    title="Actualizar dirección">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button class="btn btn-danger btn-sm botonEliminar" 
                    data-id="${dir.id_direccion}"
                    title="Eliminar dirección">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          `}
        </td>
      </tr>
    `;
  });
}

// ============================================
// MANEJADOR DE CLICKS EN LA TABLA
// ============================================
function handleTableClick(event) {
  // Botón AGREGAR
  const agregarButton = event.target.closest('.btn-agregar');
  if (agregarButton) {
    const idInstructor = agregarButton.dataset.id;
    console.log("Click agregar para instructor ID:", idInstructor);
    abrirModalAgregar(idInstructor);
    return;
  }

  // Botón ACTUALIZAR
  const editButton = event.target.closest('.botonActualizar');
  if (editButton) {
    openEditModal(editButton.dataset.id);
    return;
  }

  // Botón ELIMINAR
  const deleteButton = event.target.closest('.botonEliminar');
  if (deleteButton) {
    eliminarDireccion(deleteButton.dataset.id);
    return;
  }
}

// ============================================
// FUNCIÓN openEditModal
// ============================================
async function openEditModal(id) {
  const modalElement = document.getElementById('ModalActualizarDireccion');
  
  if (!modalElement) {
    console.error('Modal element not found');
    Swal.fire('Error', 'Modal no encontrado', 'error');
    return;
  }

  // ✅ Usar variable global
  modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

  try {
    const direccion = await DireccionService.get_direccion_by_id(id);

    document.getElementById('id_direccion').value = direccion.id_direccion;
    document.getElementById('municipioActualizar').value = direccion.municipio || '';
    document.getElementById('complementoActualizar').value = direccion.complemento || '';

    modalInstance.show();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire('Error', 'No se pudo cargar la dirección', 'error');
  }
}

// ============================================
// FUNCIÓN handleUpdateSubmit
// ============================================
async function handleUpdateSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('id_direccion').value;

  if (!id) {
    Swal.fire('Error', 'ID de dirección no encontrado', 'error');
    return;
  }

  const updatedData = {
    municipio: document.getElementById('municipioActualizar').value,
    complemento: document.getElementById('complementoActualizar').value
  };

  Swal.fire({
    title: 'Actualizando...',
    text: 'Por favor espere',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    await DireccionService.update_direccion(id, updatedData);
    
    if (modalInstance) {
      modalInstance.hide();
      setTimeout(() => {
        if (modalInstance) {
          modalInstance.dispose();
          modalInstance = null;
        }
      }, 300);
    }
    
    await recargarTabla();
    Swal.fire('¡Actualizado!', 'Dirección actualizada correctamente', 'success');
    
  } catch (error) {
    console.error("Error:", error);
    if (modalInstance) {
      modalInstance.hide();
    }
    Swal.fire('Error', error.message || 'No se pudo actualizar la dirección', 'error');
  }
}

// ============================================
// FUNCIÓN eliminarDireccion
// ============================================
async function eliminarDireccion(id) {
  const result = await Swal.fire({
    title: '¿Está seguro?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    await DireccionService.delete_direccion(id);
    console.log("✅ Dirección eliminada");
    await recargarTabla();
    Swal.fire('Eliminado', 'Dirección eliminada correctamente', 'success');
  } catch (error) {
    console.error("Error al eliminar:", error);
    Swal.fire('Error', 'No se pudo eliminar la dirección', 'error');
  }
}

// ============================================
// FUNCIÓN recargarTabla
// ============================================
async function recargarTabla() {
  console.log("🔄 Recargando tabla de direcciones...");

  try {
    const response = await DireccionService.get_all_direcciones();
    
    if (response && response.data) {
      direccionesGlobal = response.data;
    } else if (Array.isArray(response)) {
      direccionesGlobal = response;
    } else {
      direccionesGlobal = [];
    }
    
    console.log(`✅ Direcciones cargadas: ${direccionesGlobal.length}`);

    if (dataTable) {
      dataTable.destroy();
      dataTable = null;
    }

    renderTable();

    dataTable = $('#dataTableDireccion').DataTable({
      responsive: true,
      autoWidth: false,
      dom: 'lBfrtip',
      buttons: [
        {
          extend: 'excel',
          text: '<i class="bi bi-file-earmark-excel"></i> Excel',
          className: 'btn btn-success btn-sm',
          title: 'Direcciones',
          exportOptions: { columns: [0, 1, 2, 3, 4] }
        },
        {
          extend: 'pdf',
          text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
          className: 'btn btn-danger btn-sm',
          title: 'Direcciones',
          orientation: 'landscape',
          pageSize: 'A4',
          exportOptions: { columns: [0, 1, 2, 3, 4] }
        },
        {
          extend: 'csv',
          text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV',
          className: 'btn btn-primary btn-sm',
          title: 'Direcciones',
          exportOptions: { columns: [0, 1, 2, 3, 4] }
        },
        {
          extend: 'print',
          text: '<i class="bi bi-printer"></i> Imprimir',
          className: 'btn btn-info btn-sm',
          title: 'Direcciones',
          exportOptions: { columns: [0, 1, 2, 3, 4] }
        },
        {
          extend: 'copy',
          text: '<i class="bi bi-files"></i> Copiar',
          className: 'btn btn-secondary btn-sm',
          title: 'Direcciones',
          exportOptions: { columns: [0, 1, 2, 3, 4] }
        }
      ],
      language: {
        lengthMenu: 'Mostrar _MENU_ registros por página',
        zeroRecords: 'No se encontraron resultados',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        infoEmpty: 'Mostrando 0 a 0 de 0 registros',
        infoFiltered: '(filtrado de _MAX_ registros totales)',
        search: 'Buscar:',
        paginate: {
          first: 'Primero',
          last: 'Último',
          next: 'Siguiente',
          previous: 'Anterior'
        }
      }
    });

    console.log(`✅ Tabla recargada exitosamente. Total registros: ${direccionesGlobal.length}`);

  } catch (error) {
    console.error("❌ Error al recargar la tabla:", error);
    Swal.fire('Error', 'No se pudo recargar los datos', 'error');
  }
}

// ============================================
// ABRIR MODAL AGREGAR CON ID INSTRUCTOR
// ============================================
async function abrirModalAgregar(idInstructor) {
  console.log("Abriendo modal agregar para instructor ID:", idInstructor);
  
  if (!idInstructor || idInstructor === 'undefined') {
    console.error('ID de instructor inválido:', idInstructor);
    Swal.fire('Error', 'ID de instructor inválido', 'error');
    return;
  }
  
  const modalElement = document.getElementById('ModalAgregarDireccion');
  
  if (!modalElement) {
    console.error('Modal element not found');
    Swal.fire('Error', 'Modal no encontrado', 'error');
    return;
  }
  
  try {
    const idInstructorInput = document.getElementById('id_instructor_agregar');
    if (idInstructorInput) {
      idInstructorInput.value = idInstructor;
    }
    
    const municipioInput = document.getElementById('municipio_agregar');
    const complementoInput = document.getElementById('complemento_agregar');
    
    if (municipioInput) municipioInput.value = '';
    if (complementoInput) complementoInput.value = '';
    
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
  } catch (error) {
    console.error("Error al abrir modal:", error);
    Swal.fire('Error', 'No se pudo abrir el modal', 'error');
  }
}

// ============================================
// INICIALIZAR FORMULARIO DE AGREGAR
// ============================================
function initFormularioAgregar() {
  console.log("=== INICIALIZANDO FORMULARIO DE AGREGAR ===");
  
  const modalElement = document.getElementById('ModalAgregarDireccion');
  const form = document.getElementById('formAgregarDireccion');
  const btnGuardar = form ? form.querySelector('button[type="submit"]') : null;
  
  console.log("Modal encontrado:", !!modalElement);
  console.log("Formulario encontrado:", !!form);
  console.log("Botón guardar encontrado:", !!btnGuardar);
  
  console.log("✅ Inicializando formulario de agregar dirección");
  
  // ✅ Usar click en el botón en lugar de submit del formulario
  btnGuardar.addEventListener('click', async (e) => {
    console.log("=== CLICK EN BOTÓN GUARDAR ===");
    e.preventDefault();
    e.stopPropagation();
    
    const id_instructor = document.getElementById('id_instructor_agregar').value;
    const municipio = document.getElementById('municipio_agregar').value.trim();
    const complemento = document.getElementById('complemento_agregar').value.trim();
    
    console.log("ID Instructor:", id_instructor);
    console.log("Municipio:", municipio);
    
    if (!id_instructor) {
      Swal.fire('Error', 'No se ha seleccionado un instructor', 'error');
      return;
    }
    
    if (!municipio) {
      Swal.fire('Error', 'El municipio es obligatorio', 'error');
      return;
    }
    
    const data = {
      id_instructor: parseInt(id_instructor),
      municipio: municipio,
      complemento: complemento || null
    };
    
    console.log("DATOS A ENVIAR:", data);
    
    // Deshabilitar botón
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';
    
    Swal.fire({
      title: 'Guardando...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    try {
      console.log("📤 LLAMANDO A create_direccion...");
      const resultado = await DireccionService.create_direccion(data);
      console.log("✅ RESULTADO:", resultado);
      
      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal.hide();
      
      // Limpiar formulario
      form.reset();
      document.getElementById('id_instructor_agregar').value = '';
      
      Swal.fire('Éxito', 'Dirección agregada correctamente', 'success');
      
      // Recargar tabla
      await recargarTabla();
      
    } catch (error) {
      console.error("❌ ERROR:", error);
      Swal.fire('Error', error.message || 'No se pudo agregar la dirección', 'error');
      
    } finally {
      // Rehabilitar botón
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = 'Guardar Dirección';
    }
  });
  
  // Limpiar al cerrar modal
  modalElement.addEventListener('hidden.bs.modal', () => {
    console.log("Modal cerrado - Limpiando formulario");
    form.reset();
    document.getElementById('id_instructor_agregar').value = '';
  });
  
  console.log("✅ Evento click agregado al botón guardar");
}

// ============================================
// INICIALIZAR FORMULARIO DE ACTUALIZAR
// ============================================
function initFormularioActualizar() {
  const form = document.getElementById('formActualizarDireccion');
  if (!form) {
    console.error("Formulario 'formActualizarDireccion' no encontrado");
    return;
  }
  
  form.addEventListener('submit', handleUpdateSubmit);
}

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM cargado - Inicializando direcciones");
  initFormularioActualizar();
  initFormularioAgregar();
  
  if (document.querySelector(".cuerpoTablaDireccion")) {
    initDireccion();
  }
});