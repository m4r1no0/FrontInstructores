// js/supervisor.js
import { SupervisorService } from './supervisor.service.js';

let supervisoresGlobal = [];
let dataTable = null;
let modalInstance = null;

// ============================
// INIT PRINCIPAL
// ============================
export async function initSupervisor() {
    console.log("🚀 INIT SUPERVISOR");

    const tabla = document.querySelector(".cuerpoTablaSupervisor");
    if (!tabla) return;

    try {
        Swal.fire({
            title: 'Cargando...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await SupervisorService.get_all_supervisores();
        
        if (response && response.data) {
            supervisoresGlobal = response.data;
        } else if (Array.isArray(response)) {
            supervisoresGlobal = response;
        } else {
            supervisoresGlobal = [];
        }

        console.log("Supervisores procesados:", supervisoresGlobal);
        console.log("Cantidad de supervisores:", supervisoresGlobal.length);

        Swal.close();
        renderTable();
        reinicializarDataTable();
        bindEvents();
        setupFormHandler();
        setupDeleteFormHandler();
        setupUpdateFormHandler();

    } catch (error) {
        console.error("❌ Error cargando supervisores:", error);
        Swal.close();
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los supervisores',
            icon: 'error',
            confirmButtonText: 'Reintentar'
        });
    }
}

// ============================
// RENDER TABLA
// ============================
function renderTable() {
    const tbody = document.querySelector(".cuerpoTablaSupervisor");
    if (!tbody) return;

    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    if (!supervisoresGlobal.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.className = 'text-center';
        cell.textContent = 'No hay supervisores disponibles';
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    supervisoresGlobal.forEach(supervisor => {
        const row = document.createElement('tr');

        const cellId = document.createElement('td');
        cellId.textContent = supervisor.id_supervisor || '';
        row.appendChild(cellId);

        const cellNombre = document.createElement('td');
        cellNombre.textContent = supervisor.nombre || '-';
        row.appendChild(cellNombre);

        const cellDocumento = document.createElement('td');
        cellDocumento.textContent = supervisor.cedula || '-';
        row.appendChild(cellDocumento);

        const cellAcciones = document.createElement('td');
        cellAcciones.className = 'text-center';
        
        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn btn-warning btn-sm botonActualizar me-1';
        btnEditar.setAttribute('data-id', supervisor.id_supervisor);
        btnEditar.innerHTML = '<i class="bi bi-pencil"></i> Editar';
        cellAcciones.appendChild(btnEditar);
        
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn btn-danger btn-sm botonEliminar';
        btnEliminar.setAttribute('data-id', supervisor.id_supervisor);
        btnEliminar.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
        cellAcciones.appendChild(btnEliminar);
        
        row.appendChild(cellAcciones);
        tbody.appendChild(row);
    });
}

// ============================
// DATATABLE
// ============================
function reinicializarDataTable() {
    const table = $('#dataTableSupervisor');
    if (!table.length) return;

    if (dataTable) {
        dataTable.destroy();
        dataTable = null;
    }

    dataTable = table.DataTable({
        responsive: true,
        autoWidth: false,
        destroy: true,
        dom: 'lBfrtip',
        buttons: [
            {
                extend: 'excel',
                text: '<i class="bi bi-file-earmark-excel"></i> Excel',
                className: 'btn btn-success btn-sm',
                title: 'Supervisores',
                exportOptions: {
                    columns: [0, 1, 2]
                }
            },
            {
                extend: 'pdf',
                text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
                className: 'btn btn-danger btn-sm',
                title: 'Supervisores',
                exportOptions: {
                    columns: [0, 1, 2]
                },
                orientation: 'landscape',
                pageSize: 'A4'
            },
            {
                extend: 'csv',
                text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV',
                className: 'btn btn-primary btn-sm',
                title: 'Supervisores',
                exportOptions: {
                    columns: [0, 1, 2]
                }
            },
            {
                extend: 'print',
                text: '<i class="bi bi-printer"></i> Imprimir',
                className: 'btn btn-info btn-sm',
                title: 'Supervisores',
                exportOptions: {
                    columns: [0, 1, 2]
                }
            },
            {
                extend: 'copy',
                text: '<i class="bi bi-files"></i> Copiar',
                className: 'btn btn-secondary btn-sm',
                title: 'Supervisores',
                exportOptions: {
                    columns: [0, 1, 2]
                }
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
}

// ============================
// EVENTOS
// ============================
function bindEvents() {
    const tabla = document.querySelector(".cuerpoTablaSupervisor");
    if (!tabla) return;

    tabla.removeEventListener("click", handleClick);
    tabla.addEventListener("click", handleClick);
}

function handleClick(e) {
    const edit = e.target.closest(".botonActualizar");
    if (edit) {
        openEditModal(edit.dataset.id);
        return;
    }

    const del = e.target.closest(".botonEliminar");
    if (del) {
        eliminarSupervisor(del.dataset.id);
        return;
    }
}

// ============================
// FORMULARIOS
// ============================
function setupFormHandler() {
    const formCrear = document.getElementById('formAgregarSupervisor');
    if (formCrear) {
        formCrear.removeEventListener('submit', handleCreateSubmit);
        formCrear.addEventListener('submit', handleCreateSubmit);
        console.log("✅ Event listener del formulario de creación configurado");
    }
}

async function handleCreateSubmit(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre_agregar')?.value || '';
    const documento = document.getElementById('documento_agregar')?.value || '';

    if (!nombre || !documento) {
        Swal.fire({
            title: 'Campos requeridos',
            text: 'Por favor complete todos los campos',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    Swal.fire({
        title: 'Guardando...',
        text: 'Creando supervisor',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        await SupervisorService.create_supervisor({ nombre, documento });

        const modalElement = document.getElementById("ModalAgregarSupervisor");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }

        event.target.reset();
        await recargar();

        Swal.fire({
            title: '¡Creado!',
            text: 'Supervisor agregado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error("Error al crear supervisor:", error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo crear el supervisor',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    }
}

async function openEditModal(id) {
    const idNumber = parseInt(id);
    
    if (isNaN(idNumber)) {
        Swal.fire('Error', 'ID de supervisor inválido', 'error');
        return;
    }
    
    const modalElement = document.getElementById('ModalActualizarSupervisor');
    if (!modalElement) {
        Swal.fire('Error', 'No se encontró el modal de actualización', 'error');
        return;
    }

    modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

    Swal.fire({
        title: 'Cargando...',
        text: 'Obteniendo datos del supervisor',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await SupervisorService.get_user_by_id(idNumber);
        const supervisor = response?.data ?? response;
        
        document.getElementById('id_supervisor_update').value = supervisor.id_supervisor;
        document.getElementById('nombre_actualizar').value = supervisor.nombre || '';
        document.getElementById('documento_actualizar').value = supervisor.cedula || '';

        Swal.close();
        modalInstance.show();
        
    } catch (error) {
        Swal.close();
        Swal.fire('Error', 'No se pudo cargar el supervisor', 'error');
    }
}

function setupUpdateFormHandler() {
    const formActualizar = document.getElementById('formActualizarSupervisor');
    if (formActualizar) {
        formActualizar.removeEventListener('submit', handleUpdateSubmit);
        formActualizar.addEventListener('submit', handleUpdateSubmit);
        console.log("✅ Event listener del formulario de actualización configurado");
    }
}

async function handleUpdateSubmit(event) {
    event.preventDefault();

    let id = document.getElementById('id_supervisor_update').value;
    id = parseInt(id);
    
    if (isNaN(id)) {
        Swal.fire('Error', 'ID de supervisor no encontrado', 'error');
        return;
    }

    const updatedData = {
        nombre: document.getElementById('nombre_actualizar').value,
        cedula: document.getElementById('documento_actualizar').value
    };

    const result = await Swal.fire({
        title: '¿Guardar cambios?',
        text: '¿Está seguro de actualizar este supervisor?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: 'Actualizando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        await SupervisorService.update_supervisor(id, updatedData);
        
        if (modalInstance) {
            modalInstance.hide();
            setTimeout(() => {
                if (modalInstance) {
                    modalInstance.dispose();
                    modalInstance = null;
                }
            }, 300);
        }
        
        await recargar();
        
        Swal.fire({
            title: '¡Actualizado!',
            text: 'Supervisor actualizado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error("Error:", error);
        if (modalInstance) modalInstance.hide();
        Swal.fire('Error', error.message || 'No se pudo actualizar el supervisor', 'error');
    }
}

function setupDeleteFormHandler() {
    const formEliminar = document.getElementById('formEliminarSupervisor');
    if (formEliminar) {
        formEliminar.removeEventListener('submit', handleDeleteSubmit);
        formEliminar.addEventListener('submit', handleDeleteSubmit);
        console.log("✅ Event listener del formulario de eliminación configurado");
    }
}

async function handleDeleteSubmit(event) {
    event.preventDefault();

    const idSupervisorInput = document.getElementById('id_supervisor_eliminar');
    let id_supervisor = idSupervisorInput ? idSupervisorInput.value : null;

    if (!id_supervisor || id_supervisor === '') {
        Swal.fire('Error', 'Por favor seleccione un supervisor de la tabla primero', 'error');
        return;
    }

    id_supervisor = parseInt(id_supervisor);
    
    if (isNaN(id_supervisor)) {
        Swal.fire('Error', 'ID de supervisor inválido', 'error');
        return;
    }

    const result = await Swal.fire({
        title: '¿Está seguro?',
        text: `¿Desea eliminar el supervisor #${id_supervisor}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        await SupervisorService.delete_supervisor(id_supervisor);

        const modalElement = document.getElementById("ModalEliminarSupervisor");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }

        if (idSupervisorInput) idSupervisorInput.value = '';
        await recargar();

        Swal.fire({
            title: '¡Eliminado!',
            text: 'Supervisor eliminado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error("Error al eliminar supervisor:", error);
        Swal.fire('Error', error.message || 'No se pudo eliminar el supervisor', 'error');
    }
}

async function eliminarSupervisor(id) {
    const idNumber = parseInt(id);
    
    if (isNaN(idNumber)) {
        Swal.fire('Error', 'ID de supervisor inválido', 'error');
        return;
    }

    const result = await Swal.fire({
        title: '¿Está seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        await SupervisorService.delete_supervisor(idNumber);
        await recargar();
        
        Swal.fire({
            title: '¡Eliminado!',
            text: 'Supervisor eliminado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        Swal.fire('Error', error.message || 'No se pudo eliminar el supervisor', 'error');
    }
}

async function recargar() {
    try {
        const response = await SupervisorService.get_all_supervisores();
        
        if (response && response.data) {
            supervisoresGlobal = response.data;
        } else if (Array.isArray(response)) {
            supervisoresGlobal = response;
        } else {
            supervisoresGlobal = [];
        }

        if (dataTable) {
            dataTable.destroy();
            dataTable = null;
        }

        const tbody = document.querySelector(".cuerpoTablaSupervisor");
        if (tbody) {
            while (tbody.firstChild) {
                tbody.removeChild(tbody.firstChild);
            }
        }

        renderTable();
        reinicializarDataTable();

        console.log(`✅ Tabla recargada. Total: ${supervisoresGlobal.length}`);

    } catch (error) {
        console.error("Error recargando:", error);
    }
}   