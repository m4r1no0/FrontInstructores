// js/direccion.js
import { DireccionService } from './direccion.service.js';

let direccionesGlobal = [];
let dataTable = null;
let modalInstance = null;  // ✅ VARIABLE GLOBAL para el modal de actualización

// ============================
// INIT PRINCIPAL
// ============================
export async function initDireccion() {
    console.log("🚀 INIT DIRECCION");

    const tabla = document.querySelector(".cuerpoTablaDireccion");
    if (!tabla) return;

    try {
        // Mostrar loading
        Swal.fire({
            title: 'Cargando...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await DireccionService.get_all_direcciones();
        direccionesGlobal = response?.data ?? response ?? [];

        Swal.close();

        renderTable();
        reinicializarDataTable();
        bindEvents();

    } catch (error) {
        console.error("❌ Error cargando direcciones:", error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar las direcciones',
            icon: 'error',
            confirmButtonText: 'Reintentar'
        });
    }
}

// ============================
// RENDER TABLA
// ============================
function renderTable() {
    const tabla = document.querySelector(".cuerpoTablaDireccion");
    if (!tabla) return;

    // Limpiar tabla
    while (tabla.firstChild) {
        tabla.removeChild(tabla.firstChild);
    }

    if (!direccionesGlobal.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 6;
        cell.className = 'text-center';
        cell.textContent = 'No hay direcciones disponibles';
        row.appendChild(cell);
        tabla.appendChild(row);
        return;
    }

    direccionesGlobal.forEach(dir => {
        const tieneDireccion = dir.id_direccion && dir.id_direccion !== 0;
        const row = document.createElement('tr');

        // Columna NOMBRE
        const cellNombre = document.createElement('td');
        cellNombre.textContent = dir.nombre || dir.instructor_nombre || '-';
        row.appendChild(cellNombre);

        // Columna MUNICIPIO
        const cellMunicipio = document.createElement('td');
        cellMunicipio.textContent = dir.municipio || '-';
        row.appendChild(cellMunicipio);

        // Columna COMPLEMENTO
        const cellComplemento = document.createElement('td');
        cellComplemento.textContent = dir.complemento || '-';
        row.appendChild(cellComplemento);

        // Columna TELEFONO
        const cellTelefono = document.createElement('td');
        cellTelefono.textContent = dir.telefono || '-';
        row.appendChild(cellTelefono);

        // Columna CORREO
        const cellCorreo = document.createElement('td');
        cellCorreo.textContent = dir.correo_personal || '-';
        row.appendChild(cellCorreo);

        // Columna ACCIONES
        const cellAcciones = document.createElement('td');
        
        if (!tieneDireccion) {
            const btnAgregar = document.createElement('button');
            btnAgregar.className = 'btn btn-success btn-sm btn-agregar';
            btnAgregar.setAttribute('data-id', dir.id_instructor);
            btnAgregar.innerHTML = '<i class="bi bi-plus-circle"></i> Agregar';
            cellAcciones.appendChild(btnAgregar);
        } else {
            const btnEditar = document.createElement('button');
            btnEditar.className = 'btn btn-warning btn-sm botonActualizar';
            btnEditar.setAttribute('data-id', dir.id_direccion);
            btnEditar.innerHTML = '<i class="bi bi-pencil"></i> Editar';
            cellAcciones.appendChild(btnEditar);

            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn btn-danger btn-sm botonEliminar';
            btnEliminar.setAttribute('data-id', dir.id_direccion);
            btnEliminar.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
            cellAcciones.appendChild(btnEliminar);
        }
        
        row.appendChild(cellAcciones);
        tabla.appendChild(row);
    });
}

// ============================
// DATATABLE (SAFE)
// ============================
function reinicializarDataTable() {
    if (dataTable) {
        dataTable.destroy();
        dataTable = null;
    }

    const table = $('#dataTableDireccion');
    if (!table.length) return;

    dataTable = table.DataTable({
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
// EVENTS
// ============================
function bindEvents() {
    const tabla = document.querySelector(".cuerpoTablaDireccion");
    if (!tabla) return;

    tabla.removeEventListener("click", handleClick);
    tabla.addEventListener("click", handleClick);

    const formAgregar = document.getElementById("formAgregarDireccion");
    if (formAgregar) {
        formAgregar.removeEventListener("submit", handleCreate);
        formAgregar.addEventListener("submit", handleCreate);
    }

    const formActualizar = document.getElementById('formActualizarDireccion');
    if (formActualizar) {
        formActualizar.removeEventListener('submit', handleUpdateSubmit);
        formActualizar.addEventListener('submit', handleUpdateSubmit);
    }
}

// ============================
// CLICK TABLE
// ============================
function handleClick(e) {
    const add = e.target.closest(".btn-agregar");
    if (add) {
        abrirModalAgregar(add.dataset.id);
        return;
    }

    const edit = e.target.closest(".botonActualizar");
    if (edit) {
        openEditModal(edit.dataset.id);
        return;
    }

    const del = e.target.closest(".botonEliminar");
    if (del) {
        eliminarDireccion(del.dataset.id);
        return;
    }
}

// ============================
// MODAL AGREGAR
// ============================
function abrirModalAgregar(idInstructor) {
    document.getElementById("id_instructor_agregar").value = idInstructor;
    
    // Limpiar formulario
    document.getElementById("municipio_agregar").value = '';
    document.getElementById("complemento_agregar").value = '';

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("ModalAgregarDireccion")
    ).show();
}

// ============================
// CREATE
// ============================
async function handleCreate(event) {
    event.preventDefault();

    const data = {
        id_instructor: Number(document.getElementById("id_instructor_agregar").value),
        municipio: document.getElementById("municipio_agregar").value.trim(),
        complemento: document.getElementById("complemento_agregar").value.trim()
    };

    if (!data.id_instructor || !data.municipio) {
        Swal.fire({
            title: 'Campos incompletos',
            text: 'Por favor complete el municipio',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    Swal.fire({
        title: 'Guardando...',
        text: 'Creando dirección',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        await DireccionService.create_direccion(data);

        const modal = bootstrap.Modal.getInstance(document.getElementById("ModalAgregarDireccion"));
        if (modal) modal.hide();

        await recargar();

        Swal.fire({
            title: '¡Creada!',
            text: 'Dirección agregada correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (err) {
        console.error(err);
        Swal.fire({
            title: 'Error',
            text: err.message || 'No se pudo crear la dirección',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    }
}

// ============================================
// FUNCIÓN openEditModal (ACTUALIZAR)
// ============================================
async function openEditModal(id) {
    const modalElement = document.getElementById('ModalActualizarDireccion');
    
    if (!modalElement) {
        console.error('Modal element not found');
        Swal.fire('Error', 'No se encontró el modal de actualización', 'error');
        return;
    }

    // Usar variable global
    modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

    Swal.fire({
        title: 'Cargando...',
        text: 'Obteniendo datos de la dirección',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const direccion = await DireccionService.get_direccion_by_id(id);
        
        document.getElementById('id_direccion').value = direccion.id_direccion;
        document.getElementById('municipioActualizar').value = direccion.municipio || '';
        document.getElementById('complementoActualizar').value = direccion.complemento || '';

        Swal.close();
        modalInstance.show();
        
    } catch (error) {
        console.error("Error:", error);
        Swal.close();
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

    // Confirmar actualización
    const result = await Swal.fire({
        title: '¿Guardar cambios?',
        text: '¿Está seguro de actualizar esta dirección?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

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
        
        // Cerrar modal usando variable global
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
            title: '¡Actualizada!',
            text: 'Dirección actualizada correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error("Error:", error);
        
        if (modalInstance) {
            modalInstance.hide();
        }
        
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo actualizar la dirección',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
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

    Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        await DireccionService.delete_direccion(id);
        
        await recargar();
        
        Swal.fire({
            title: '¡Eliminada!',
            text: 'Dirección eliminada correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo eliminar la dirección',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    }
}

// ============================
// RECARGAR (CLAVE)
// ============================
async function recargar() {
    console.log("🔄 Recargando tabla de direcciones...");

    try {
        const response = await DireccionService.get_all_direcciones();
        direccionesGlobal = response?.data ?? response ?? [];

        if (dataTable) {
            dataTable.destroy();
            dataTable = null;
        }

        renderTable();
        reinicializarDataTable();

        console.log(`✅ Tabla recargada exitosamente. Total registros: ${direccionesGlobal.length}`);

    } catch (error) {
        console.error("❌ Error recargando direcciones:", error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron recargar los datos',
            icon: 'error',
            confirmButtonText: 'Reintentar'
        });
    }
}