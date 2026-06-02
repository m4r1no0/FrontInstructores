// js/contacto.js
import { ContactoService } from './contacto.service.js';

let contactosGlobal = [];
let dataTable = null;
let modalInstance = null;  // ✅ VARIABLE GLOBAL para el modal de actualización

// ============================
// INIT PRINCIPAL
// ============================
export async function initContacto() {
    console.log("🚀 INIT CONTACTO");

    const tabla = document.querySelector(".cuerpoTablaContacto");
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

        const response = await ContactoService.get_all_contactos();
        contactosGlobal = response?.data ?? response ?? [];

        Swal.close();

        renderTable();
        reinicializarDataTable();
        bindEvents();

    } catch (error) {
        console.error("❌ Error cargando contactos:", error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los contactos',
            icon: 'error',
            confirmButtonText: 'Reintentar'
        });
    }
}

// ============================
// RENDER TABLA (SIN INNERHTML)
// ============================
function renderTable() {
    const tbody = document.querySelector(".cuerpoTablaContacto");
    if (!tbody) return;

    // Limpiar tbody
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    if (!contactosGlobal.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 5;
        cell.className = 'text-center';
        cell.textContent = 'No hay contactos disponibles';
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    contactosGlobal.forEach(contacto => {
        const tieneContacto = contacto.id_contacto && contacto.id_contacto !== 0 && contacto.id_contacto !== null;
        const row = document.createElement('tr');

        // Columna: INSTRUCTOR
        const cellInstructor = document.createElement('td');
        cellInstructor.textContent = contacto.nombre || contacto.instructor_nombre || '-';
        row.appendChild(cellInstructor);

        // Columna: CORREO PERSONAL
        const cellCorreoPersonal = document.createElement('td');
        cellCorreoPersonal.textContent = contacto.correo_personal || '-';
        row.appendChild(cellCorreoPersonal);

        // Columna: CORREO INSTITUCIONAL
        const cellCorreoInstitucional = document.createElement('td');
        cellCorreoInstitucional.textContent = contacto.correo_institucional || '-';
        row.appendChild(cellCorreoInstitucional);

        // Columna: TELEFONO
        const cellTelefono = document.createElement('td');
        cellTelefono.textContent = contacto.telefono || '-';
        row.appendChild(cellTelefono);

        // Columna: ACCIONES
        const cellAcciones = document.createElement('td');
        
        if (!tieneContacto) {
            // Botón AGREGAR (cuando no existe contacto)
            const btnAgregar = document.createElement('button');
            btnAgregar.className = 'btn btn-success btn-sm btn-agregar';
            btnAgregar.setAttribute('data-id', contacto.id_instructor);
            btnAgregar.innerHTML = '<i class="bi bi-plus-circle"></i> Agregar';
            cellAcciones.appendChild(btnAgregar);
        } else {
            // Botón ACTUALIZAR (cuando ya existe contacto)
            const btnActualizar = document.createElement('button');
            btnActualizar.className = 'btn btn-warning btn-sm botonActualizar';
            btnActualizar.setAttribute('data-id', contacto.id_contacto);
            btnActualizar.innerHTML = '<i class="bi bi-pencil"></i> Editar';
            cellAcciones.appendChild(btnActualizar);

            // Botón ELIMINAR
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn btn-danger btn-sm botonEliminar';
            btnEliminar.setAttribute('data-id', contacto.id_contacto);
            btnEliminar.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
            cellAcciones.appendChild(btnEliminar);
        }
        
        row.appendChild(cellAcciones);
        tbody.appendChild(row);
    });
}

// ============================
// DATATABLE CON BOTONES
// ============================
function reinicializarDataTable() {
    const table = $('#dataTableContacto');
    if (!table.length) return;

    // Destruir instancia anterior si existe
    if (dataTable) {
        dataTable.destroy();
        dataTable = null;
    }

    // Crear nueva instancia
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
                title: 'Contactos',
                exportOptions: {
                    columns: [0, 1, 2, 3],
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
                title: 'Contactos',
                exportOptions: {
                    columns: [0, 1, 2, 3],
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
                title: 'Contactos',
                exportOptions: {
                    columns: [0, 1, 2, 3],
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
                title: 'Contactos',
                exportOptions: {
                    columns: [0, 1, 2, 3]
                }
            },
            {
                extend: 'copy',
                text: '<i class="bi bi-files"></i> Copiar',
                className: 'btn btn-secondary btn-sm',
                title: 'Contactos',
                exportOptions: {
                    columns: [0, 1, 2, 3],
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
// EVENTOS
// ============================
function bindEvents() {
    const tabla = document.querySelector(".cuerpoTablaContacto");
    if (!tabla) return;

    tabla.removeEventListener("click", handleClick);
    tabla.addEventListener("click", handleClick);

    const formAgregar = document.getElementById("formAgregarContacto");
    if (formAgregar) {
        formAgregar.removeEventListener("submit", handleCreate);
        formAgregar.addEventListener("submit", handleCreate);
    }

    const formActualizar = document.getElementById('formActualizarContacto');
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
        eliminarContacto(del.dataset.id);
        return;
    }
}

// ============================
// MODAL AGREGAR
// ============================
function abrirModalAgregar(idInstructor) {
    document.getElementById("id_instructor_contacto").value = idInstructor;
    
    // Limpiar formulario
    document.getElementById("correo_personal").value = '';
    document.getElementById("correo_institucional").value = '';
    document.getElementById("telefono").value = '';

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("ModalAgregarContacto")
    ).show();
}

// ============================
// CREATE CONTACTO
// ============================
async function handleCreate(event) {
    event.preventDefault();

    const data = {
        id_instructor: Number(document.getElementById("id_instructor_contacto").value),
        correo_personal: document.getElementById("correo_personal").value.trim(),
        correo_institucional: document.getElementById("correo_institucional").value.trim(),
        telefono: document.getElementById("telefono").value.trim()
    };

    if (!data.id_instructor || !data.correo_personal) {
        Swal.fire({
            title: 'Campos incompletos',
            text: 'Por favor complete el correo personal',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    Swal.fire({
        title: 'Guardando...',
        text: 'Creando contacto',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        await ContactoService.create_contacto(data);

        const modal = bootstrap.Modal.getInstance(document.getElementById("ModalAgregarContacto"));
        if (modal) modal.hide();

        await recargar();

        Swal.fire({
            title: '¡Creado!',
            text: 'Contacto agregado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (err) {
        console.error(err);
        Swal.fire({
            title: 'Error',
            text: err.message || 'No se pudo crear el contacto',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    }
}

// ============================================
// FUNCIÓN openEditModal (ACTUALIZAR)
// ============================================
async function openEditModal(id) {
    const modalElement = document.getElementById('ModalActualizarContacto');
    
    if (!modalElement) {
        console.error('Modal element not found');
        Swal.fire('Error', 'No se encontró el modal de actualización', 'error');
        return;
    }

    // Usar variable global
    modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

    Swal.fire({
        title: 'Cargando...',
        text: 'Obteniendo datos del contacto',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const contacto = await ContactoService.get_contacto_by_id(id);
        
        document.getElementById('id_contacto').value = contacto.id_contacto;
        document.getElementById('correo_personalActualizar').value = contacto.correo_personal || '';
        document.getElementById('correo_institucionalActualizar').value = contacto.correo_institucional || '';
        document.getElementById('telefonoActualizar').value = contacto.telefono || '';

        Swal.close();
        modalInstance.show();
        
    } catch (error) {
        console.error("Error:", error);
        Swal.close();
        Swal.fire('Error', 'No se pudo cargar el contacto', 'error');
    }
}

// ============================================
// FUNCIÓN handleUpdateSubmit
// ============================================
async function handleUpdateSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('id_contacto').value;

    if (!id) {
        Swal.fire('Error', 'ID de contacto no encontrado', 'error');
        return;
    }

    const updatedData = {
        correo_personal: document.getElementById('correo_personalActualizar').value,
        correo_institucional: document.getElementById('correo_institucionalActualizar').value,
        telefono: document.getElementById('telefonoActualizar').value
    };

    // Confirmar actualización
    const result = await Swal.fire({
        title: '¿Guardar cambios?',
        text: '¿Está seguro de actualizar este contacto?',
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
        await ContactoService.update_contacto(id, updatedData);
        
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
            title: '¡Actualizado!',
            text: 'Contacto actualizado correctamente',
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
            text: error.message || 'No se pudo actualizar el contacto',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    }
}

// ============================================
// FUNCIÓN eliminarContacto
// ============================================
async function eliminarContacto(id) {
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
        await ContactoService.delete_contacto(id);
        
        await recargar();
        
        Swal.fire({
            title: '¡Eliminado!',
            text: 'Contacto eliminado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo eliminar el contacto',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    }
}

// ============================
// RECARGAR (CORREGIDO)
// ============================
async function recargar() {
    console.log("🔄 Recargando tabla de contactos...");

    try {
        // Mostrar loading
        Swal.fire({
            title: 'Recargando...',
            text: 'Actualizando tabla de contactos',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Recargar datos desde el servidor
        const response = await ContactoService.get_all_contactos();
        contactosGlobal = response?.data ?? response ?? [];

        // Destruir DataTable si existe
        if (dataTable) {
            dataTable.destroy();
            dataTable = null;
        }

        // Limpiar el tbody
        const tbody = document.querySelector(".cuerpoTablaContacto");
        if (tbody) {
            while (tbody.firstChild) {
                tbody.removeChild(tbody.firstChild);
            }
        }

        // Volver a renderizar la tabla
        renderTable();

        // Reinicializar DataTable con los nuevos datos
        reinicializarDataTable();

        Swal.close();
        console.log(`✅ Tabla recargada exitosamente. Total registros: ${contactosGlobal.length}`);

    } catch (error) {
        console.error("❌ Error recargando contactos:", error);
        Swal.close();
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron recargar los datos',
            icon: 'error',
            confirmButtonText: 'Reintentar'
        });
    }
}