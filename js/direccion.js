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
    tabla.innerHTML += `
      <tr>
        <td>${dir.nombre || dir.instructor_nombre || '-'}</td>
        <td>${dir.municipio || '-'}</td>
        <td>${dir.complemento || '-'}</td>
        <td>${dir.telefono || '-'}</td>
        <td>${dir.correo_personal || '-'}</td>
        <td>
          <button class="btn btn-danger btn-sm botonEliminar" data-id="${dir.id_direccion}">
            <i class="bi bi-trash"></i>
          </button>
          <button class="btn btn-warning btn-sm botonActualizar" data-id="${dir.id_direccion}">
            <i class="bi bi-pencil"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

function handleTableClick(event) {
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
    return;
  }

  // ✅ Usar variable global (sin let)
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

  // Mostrar loading
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
    
    // ✅ Cerrar modal usando variable global
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

    console.log(`✅ Tabla recargada exitosamente. Total registros: ${direccionesGlobal.length}`);

  } catch (error) {
    console.error("❌ Error al recargar la tabla:", error);
    Swal.fire('Error', 'No se pudo recargar los datos', 'error');
  }
}