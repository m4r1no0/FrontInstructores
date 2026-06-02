// js/contrato.js
import { ContratoService } from './contrato.service.js';
import { InstructorService } from './instructor.service.js';

let contratosGlobal = [];
let dataTable = null;
let modalInstance = null;  // ✅ VARIABLE GLOBAL para el modal de actualización

// ============================
// INIT PRINCIPAL
// ============================
export async function initContrato() {
    console.log("🚀 INIT CONTRATO");

    const tabla = document.querySelector(".cuerpoTablaContrato");
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

        const response = await ContratoService.get_contrato_instructor();
        
        // Manejar diferentes estructuras de respuesta
        if (response && response.data) {
            contratosGlobal = response.data;
        } else if (Array.isArray(response)) {
            contratosGlobal = response;
        } else {
            contratosGlobal = [];
        }

        console.log("Contratos procesados:", contratosGlobal);
        console.log("Cantidad de contratos:", contratosGlobal.length);

        Swal.close();
        renderTable();
        reinicializarDataTable();
        bindEvents();
        setupFormHandler();
        setupDeleteFormHandler();
        setupModificacionHandler();
        setupUpdateFormHandler();

    } catch (error) {
        console.error("❌ Error cargando contratos:", error);
        Swal.close();
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los contratos',
            icon: 'error',
            confirmButtonText: 'Reintentar'
        });
    }
}

// ============================
// RENDER TABLA (SIN INNERHTML)
// ============================
function renderTable() {
    const tbody = document.querySelector(".cuerpoTablaContrato");
    if (!tbody) return;

    // Limpiar tbody
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    if (!contratosGlobal.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 9;
        cell.className = 'text-center';
        cell.textContent = 'No hay instructores disponibles';
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    contratosGlobal.forEach(contrato => {
        const tieneContrato = contrato.id_contrato && contrato.id_contrato !== 0 && contrato.id_contrato !== null;
        const row = document.createElement('tr');

        // Columna ACCIONES
        const cellAcciones = document.createElement('td');
        cellAcciones.className = 'text-center';
        
        if (!tieneContrato) {
            // Botón AGREGAR (cuando no existe contrato)
            const btnAgregar = document.createElement('button');
            btnAgregar.className = 'btn btn-success btn-sm btn-agregar-contrato';
            btnAgregar.setAttribute('data-id', contrato.id_instructor);
            btnAgregar.setAttribute('data-nombre', contrato.instructor_nombre || `${contrato.nombres || ''} ${contrato.apellidos || ''}`);
            btnAgregar.innerHTML = '<i class="bi bi-plus-circle"></i> Agregar Contrato';
            cellAcciones.appendChild(btnAgregar);
        } else {
            // Botón EDITAR
            const btnEditar = document.createElement('button');
            btnEditar.className = 'btn btn-warning btn-sm botonActualizar';
            btnEditar.setAttribute('data-id', contrato.id_contrato);
            btnEditar.innerHTML = '<i class="bi bi-pencil"></i> Editar';
            cellAcciones.appendChild(btnEditar);
            
            // Botón ELIMINAR
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn btn-danger btn-sm botonEliminar';
            btnEliminar.setAttribute('data-id', contrato.id_contrato);
            btnEliminar.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
            cellAcciones.appendChild(btnEliminar);
        }
        
        row.appendChild(cellAcciones);

        // Columna ID INSTRUCTOR
        const cellIdInstructor = document.createElement('td');
        cellIdInstructor.textContent = contrato.id_instructor || '';
        row.appendChild(cellIdInstructor);

        // Columna INSTRUCTOR
        const cellInstructor = document.createElement('td');
        const nombreCompleto = contrato.instructor_nombre || 
            (contrato.nombres && contrato.apellidos ? `${contrato.nombres} ${contrato.apellidos}` : 
            contrato.nombre || '-');
        cellInstructor.textContent = nombreCompleto;
        row.appendChild(cellInstructor);

        // Columna DOCUMENTO
        const cellDocumento = document.createElement('td');
        cellDocumento.textContent = contrato.numero_documento || '';
        row.appendChild(cellDocumento);

        // Columna NÚMERO CONTRATO
        const cellNumeroContrato = document.createElement('td');
        cellNumeroContrato.textContent = tieneContrato ? (contrato.numero_contrato || '') : '-';
        row.appendChild(cellNumeroContrato);

        // Columna CRP
        const cellCrp = document.createElement('td');
        cellCrp.textContent = tieneContrato ? (contrato.crp || '') : '-';
        row.appendChild(cellCrp);

        // Columna CDP
        const cellCdp = document.createElement('td');
        cellCdp.textContent = tieneContrato ? (contrato.cdp || '') : '-';
        row.appendChild(cellCdp);

        // Columna FECHA INICIO
        const cellFechaInicio = document.createElement('td');
        cellFechaInicio.textContent = tieneContrato && contrato.fecha_inicio ? new Date(contrato.fecha_inicio).toLocaleDateString() : '-';
        row.appendChild(cellFechaInicio);

        // Columna FECHA FIN
        const cellFechaFin = document.createElement('td');
        cellFechaFin.textContent = tieneContrato && contrato.fecha_fin ? new Date(contrato.fecha_fin).toLocaleDateString() : '-';
        row.appendChild(cellFechaFin);

        tbody.appendChild(row);
    });
}

// ============================
// DATATABLE CON BOTONES
// ============================
function reinicializarDataTable() {
    const table = $('#dataTableContrato');
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
                title: 'Contratos',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8],
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
                title: 'Contratos',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8],
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
                title: 'Contratos',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8],
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
                title: 'Contratos',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8]
                }
            },
            {
                extend: 'copy',
                text: '<i class="bi bi-files"></i> Copiar',
                className: 'btn btn-secondary btn-sm',
                title: 'Contratos',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8],
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
    const tabla = document.querySelector(".cuerpoTablaContrato");
    if (!tabla) return;

    tabla.removeEventListener("click", handleClick);
    tabla.addEventListener("click", handleClick);
}

// ============================
// CLICK TABLE
// ============================
function handleClick(e) {
    const add = e.target.closest(".btn-agregar-contrato");
    if (add) {
        abrirModalAgregar(add.dataset.id, add.dataset.nombre);
        return;
    }

    const edit = e.target.closest(".botonActualizar");
    if (edit) {
        openEditModal(edit.dataset.id);
        return;
    }

    const del = e.target.closest(".botonEliminar");
    if (del) {
        eliminarContrato(del.dataset.id);
        return;
    }
}

// ============================
// MODAL AGREGAR
// ============================
function abrirModalAgregar(idInstructor, nombreInstructor) {
    document.getElementById("id_instructor_agregar").value = idInstructor;
    
    // Mostrar el nombre del instructor en el modal
    const instructorNombreSpan = document.getElementById("instructor_nombre_agregar");
    if (instructorNombreSpan) {
        instructorNombreSpan.textContent = nombreInstructor || `ID: ${idInstructor}`;
    }
    
    // Limpiar formulario
    document.getElementById("numero_contrato_agregar").value = '';
    document.getElementById("crp_agregar").value = '';
    document.getElementById("cdp_agregar").value = '';
    document.getElementById("rubro_agregar").value = '';
    document.getElementById("dependencia_agregar").value = '';
    document.getElementById("fecha_inicio_agregar").value = '';
    document.getElementById("fecha_fin_agregar").value = '';
    document.getElementById("valor_contrato_agregar").value = '';
    document.getElementById("valor_mes_agregar").value = '';

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("ModalAgregarContrato")
    ).show();
}

// ============================
// CONFIGURACIÓN DEL FORMULARIO DE CREACIÓN
// ============================
function setupFormHandler() {
    const formCrear = document.getElementById('formAgregarContrato');
    if (formCrear) {
        formCrear.removeEventListener('submit', handleCreateSubmit);
        formCrear.addEventListener('submit', handleCreateSubmit);
        console.log("✅ Event listener del formulario de creación configurado");
    } else {
        console.log("⚠️ No se encontró el formulario con id 'formAgregarContrato'");
    }
}

// ============================
// MANEJAR ENVÍO DEL FORMULARIO DE CREACIÓN
// ============================
async function handleCreateSubmit(event) {
    event.preventDefault();
    console.log("📝 Enviando formulario de contrato...");

    const idInstructorInput = document.getElementById('id_instructor_agregar');
    const id_instructor = idInstructorInput ? idInstructorInput.value : null;

    if (!id_instructor || id_instructor === '') {
        Swal.fire({
            title: 'Error',
            text: 'No se ha seleccionado un instructor',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    const numero_contrato = document.getElementById('numero_contrato_agregar')?.value || '';
    if (!numero_contrato) {
        Swal.fire({
            title: 'Campo requerido',
            text: 'Por favor ingrese el número de contrato',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    const newData = {
        id_instructor: parseInt(id_instructor),
        numero_contrato: numero_contrato,
        crp: document.getElementById('crp_agregar')?.value || '',
        cdp: document.getElementById('cdp_agregar')?.value || '',
        rubro: document.getElementById('rubro_agregar')?.value || '',
        dependencia: document.getElementById('dependencia_agregar')?.value || '',
        fecha_inicio: document.getElementById('fecha_inicio_agregar')?.value || null,
        fecha_fin: document.getElementById('fecha_fin_agregar')?.value || null,
        valor_contrato: parseFloat(document.getElementById('valor_contrato_agregar').value) || 0,
        valor_mes: parseFloat(document.getElementById('valor_mes_agregar').value) || 0,
        estado: 'Activo'
    };

    Swal.fire({
        title: 'Guardando...',
        text: 'Creando contrato',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        await ContratoService.create_contrato(newData);

        const modalElement = document.getElementById("ModalAgregarContrato");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }

        event.target.reset();
        if (idInstructorInput) idInstructorInput.value = '';

        await recargar();

        Swal.fire({
            title: '¡Creado!',
            text: 'Contrato agregado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error("❌ Error al crear contrato:", error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo crear el contrato',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    }
}

// ============================================
// FUNCIÓN openEditModal (ACTUALIZAR) - CORREGIDA
// ============================================
async function openEditModal(id) {
    const idNumber = parseInt(id);
    
    if (isNaN(idNumber)) {
        Swal.fire('Error', 'ID de contrato inválido', 'error');
        return;
    }
    
    const modalElement = document.getElementById('ModalActualizarContrato');
    
    if (!modalElement) {
        console.error('Modal element not found');
        Swal.fire('Error', 'No se encontró el modal de actualización', 'error');
        return;
    }

    // Usar variable global
    modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

    Swal.fire({
        title: 'Cargando...',
        text: 'Obteniendo datos del contrato',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await ContratoService.get_contrato_by_id(idNumber);
        const contrato = response?.data ?? response;
        
        console.log("Contrato cargado:", contrato);
        
        document.getElementById('id_contrato_update').value = contrato.id_contrato;
        document.getElementById('numero_contrato_actualizar').value = contrato.numero_contrato || '';
        document.getElementById('crp_actualizar').value = contrato.crp || '';
        document.getElementById('cdp_actualizar').value = contrato.cdp || '';
        document.getElementById('rubro_actualizar').value = contrato.rubro || '';
        document.getElementById('dependencia_actualizar').value = contrato.dependencia || '';
        
        if (contrato.fecha_inicio) {
            const fechaInicio = new Date(contrato.fecha_inicio);
            document.getElementById('fecha_inicio_actualizar').value = fechaInicio.toISOString().split('T')[0];
        } else {
            document.getElementById('fecha_inicio_actualizar').value = '';
        }
        
        if (contrato.fecha_fin) {
            const fechaFin = new Date(contrato.fecha_fin);
            document.getElementById('fecha_fin_actualizar').value = fechaFin.toISOString().split('T')[0];
        } else {
            document.getElementById('fecha_fin_actualizar').value = '';
        }
        
        document.getElementById('valor_contrato_actualizar').value = contrato.valor_contrato || '';
        document.getElementById('valor_mes_actualizar').value = contrato.valor_mes || '';

        Swal.close();
        modalInstance.show();
        
    } catch (error) {
        console.error("Error:", error);
        Swal.close();
        Swal.fire('Error', 'No se pudo cargar el contrato', 'error');
    }
}

// ============================================
// FUNCIÓN handleUpdateSubmit - CORREGIDA
// ============================================
async function handleUpdateSubmit(event) {
    event.preventDefault();

    let id = document.getElementById('id_contrato_update').value;
    
    id = parseInt(id);
    
    if (isNaN(id)) {
        Swal.fire('Error', 'ID de contrato no encontrado', 'error');
        return;
    }

    const updatedData = {
        numero_contrato: document.getElementById('numero_contrato_actualizar').value,
        crp: document.getElementById('crp_actualizar').value,
        cdp: document.getElementById('cdp_actualizar').value,
        rubro: document.getElementById('rubro_actualizar').value,
        dependencia: document.getElementById('dependencia_actualizar').value,
        fecha_inicio: document.getElementById('fecha_inicio_actualizar').value || null,
        fecha_fin: document.getElementById('fecha_fin_actualizar').value || null,
        valor_contrato: parseFloat(document.getElementById('valor_contrato_actualizar').value) || 0,
        valor_mes: parseFloat(document.getElementById('valor_mes_actualizar').value) || 0
    };

    console.log("Datos a actualizar:", updatedData);

    // Confirmar actualización
    const result = await Swal.fire({
        title: '¿Guardar cambios?',
        text: '¿Está seguro de actualizar este contrato?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
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
        await ContratoService.update_contrato(id, updatedData);
        
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
            text: 'Contrato actualizado correctamente',
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
            text: error.message || 'No se pudo actualizar el contrato',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    }
}

// ============================================
// FUNCIÓN eliminarContrato - CORREGIDA
// ============================================
async function eliminarContrato(id) {
    const idNumber = parseInt(id);
    
    if (isNaN(idNumber)) {
        Swal.fire({
            title: 'Error',
            text: 'ID de contrato inválido',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
        return;
    }

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
        await ContratoService.delete_contrato(idNumber);
        
        await recargar();
        
        Swal.fire({
            title: '¡Eliminado!',
            text: 'Contrato eliminado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo eliminar el contrato',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    }
}

// ============================
// RECARGAR
// ============================
async function recargar() {
    console.log("🔄 Recargando tabla de contratos...");

    try {
        Swal.fire({
            title: 'Recargando...',
            text: 'Actualizando tabla de contratos',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await ContratoService.get_contrato_instructor();
        
        if (response && response.data) {
            contratosGlobal = response.data;
        } else if (Array.isArray(response)) {
            contratosGlobal = response;
        } else {
            contratosGlobal = [];
        }

        if (dataTable) {
            dataTable.destroy();
            dataTable = null;
        }

        const tbody = document.querySelector(".cuerpoTablaContrato");
        if (tbody) {
            while (tbody.firstChild) {
                tbody.removeChild(tbody.firstChild);
            }
        }

        renderTable();
        reinicializarDataTable();

        Swal.close();
        console.log(`✅ Tabla recargada exitosamente. Total registros: ${contratosGlobal.length}`);

    } catch (error) {
        console.error("❌ Error recargando contratos:", error);
        Swal.close();
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron recargar los datos',
            icon: 'error',
            confirmButtonText: 'Reintentar'
        });
    }
}

// ============================================
// CONFIGURACIÓN DEL FORMULARIO DE ELIMINACIÓN
// ============================================
function setupDeleteFormHandler() {
    const formEliminar = document.getElementById('formEliminarContrato');
    if (formEliminar) {
        formEliminar.removeEventListener('submit', handleDeleteSubmit);
        formEliminar.addEventListener('submit', handleDeleteSubmit);
        console.log("✅ Event listener del formulario de eliminación configurado");
    }
}

// =============================
// MANEJAR ENVÍO DEL FORMULARIO DE ELIMINACIÓN - CORREGIDO
// =============================
async function handleDeleteSubmit(event) {
    event.preventDefault();

    const idContratoInput = document.getElementById('id_contrato_eliminar');
    let id_contrato = idContratoInput ? idContratoInput.value : null;

    if (!id_contrato || id_contrato === '') {
        Swal.fire({
            title: 'Error',
            text: 'Por favor seleccione un contrato de la tabla primero',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    id_contrato = parseInt(id_contrato);
    
    if (isNaN(id_contrato)) {
        Swal.fire({
            title: 'Error',
            text: 'ID de contrato inválido',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
        return;
    }

    const result = await Swal.fire({
        title: '¿Está seguro?',
        text: `¿Desea eliminar el contrato #${id_contrato}?`,
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
        await ContratoService.delete_contrato(id_contrato);

        const modalElement = document.getElementById("ModalEliminarContrato");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }

        if (idContratoInput) idContratoInput.value = '';

        await recargar();

        Swal.fire({
            title: '¡Eliminado!',
            text: 'Contrato eliminado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error("❌ Error al eliminar contrato:", error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo eliminar el contrato',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    }
}

// ============================================
// CONFIGURACIÓN DEL FORMULARIO DE ACTUALIZACIÓN
// ============================================
function setupUpdateFormHandler() {
    const formActualizar = document.getElementById('formActualizarContrato');
    if (formActualizar) {
        formActualizar.removeEventListener('submit', handleUpdateSubmit);
        formActualizar.addEventListener('submit', handleUpdateSubmit);
        console.log("✅ Event listener del formulario de actualización configurado");
    } else {
        console.log("⚠️ No se encontró el formulario con id 'formActualizarContrato'");
    }
}

// =============================
// CONFIGURACIÓN DE MODIFICACIÓN (CESIÓN)
// =============================
function setupModificacionHandler() {
    const SelectTipoModificacion = document.getElementById('tipo_modificacion');
    
    if (!SelectTipoModificacion) {
        console.log('⚠️ No existe el elemento con id="tipo_modificacion"');
        return;
    }

    SelectTipoModificacion.addEventListener('change', async function () {
        const valorSeleccionado = this.value;

        const contenedorModificacion = document.querySelector('.contenedor_modificacion');
        const contenedorCesion = document.querySelector('.contenedor_cesion');

        if (valorSeleccionado === 'modificacion') {
            contenedorModificacion?.classList.remove('d-none');
            contenedorCesion?.classList.add('d-none');
        } else if (valorSeleccionado === 'cesion') {
            contenedorModificacion?.classList.add('d-none');
            contenedorCesion?.classList.remove('d-none');
            await cargarInstructoresCesion();
        } else {
            contenedorModificacion?.classList.add('d-none');
            contenedorCesion?.classList.add('d-none');
        }
    });
}

async function cargarInstructoresCesion() {
    const selectNuevoInstructor = document.getElementById('id_nuevo_instructor');
    if (!selectNuevoInstructor) return;

    try {
        const response = await InstructorService.get_all_instructores_paginated(1, 200);
        const instructores = response.data;

        selectNuevoInstructor.innerHTML = '<option value="">Seleccione un nuevo instructor</option>';
        
        instructores.forEach(instructor => {
            if (!instructor.numero_contrato) {
                const option = document.createElement('option');
                option.value = instructor.id_instructor;
                option.textContent = instructor.instructor_nombre;
                selectNuevoInstructor.appendChild(option);
            }
        });
    } catch (error) {
        console.error("Error al cargar instructores:", error);
    }
}