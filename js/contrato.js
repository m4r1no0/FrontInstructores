// initContrato.js
import { ContratoService } from './contrato.service.js';
import { InstructorService } from './instructor.service.js';

export async function initContrato() {
    console.log("=== INITCONTRATO EJECUTÁNDOSE ===");

    try {
        const contratos = await ContratoService.get_contrato_instructor();
        let contratoLeft = contratos.data;

        // Configurar event listeners
        setupFormHandler();
        setupDeleteFormHandler(); // Nuevo: Configurar manejador de eliminación
        setupModalButtons();

        // Inicializar la tabla
        initializeTable(contratoLeft);

    } catch (error) {
        console.error("Error en initContrato:", error);
    }


    const SelectTipoModificacion = document.getElementById('tipo_modificacion');

    if (!SelectTipoModificacion) {
        console.error('ERROR: No existe el elemento con id="tipo_modificacion"');
        return;
    }

    SelectTipoModificacion.addEventListener('change', function () {
        const valorSeleccionado = this.value;
        console.log("Tipo de modificación seleccionado:", valorSeleccionado);

        const contenedorModificacion = document.querySelector('.contenedor_modificacion');
        const contenedorCesion = document.querySelector('.contenedor_cesion');

        console.log("Contenedor Modificación:", contenedorModificacion);
        console.log("Contenedor Cesión:", contenedorCesion);

        // Cambia estas comparaciones según los valores reales
        if (valorSeleccionado === 'modificacion') {
            contenedorModificacion.classList.remove('d-none');
            contenedorCesion.classList.add('d-none');
        } else if (valorSeleccionado === 'cesion') {
            contenedorModificacion.classList.add('d-none');
            contenedorCesion.classList.remove('d-none');
        } else {
            contenedorModificacion.classList.add('d-none');
            contenedorCesion.classList.add('d-none');
        }

        const selectNuevoInstructor = document.getElementById('id_nuevo_instructor');

        async function cargarInstructores() {
            try {
                const response = await InstructorService.get_all_instructores_paginated(1, 200);
                const instructores = response.data;

                selectNuevoInstructor.innerHTML = '<option value="">Seleccione un nuevo instructor</option>';
                console.log("Instructores cargados:", instructores);
                instructores.forEach(instructor => {
                    if (instructor.numero_contrato === null) {
                        const option = document.createElement('option');
                        option.value = instructor.id_instructor;
                        option.textContent = `${instructor.instructor_nombre}`;
                        selectNuevoInstructor.appendChild(option);
                    }
                });

            }

            catch (error) {
                console.error("Error al cargar instructores:", error);
            }
        }
        cargarInstructores();

    });

}

// =============================
// INICIALIZAR TABLA
// =============================
function initializeTable(contratoLeft) {
    console.log("Inicializando tabla...");

    // Verificar que la tabla existe
    const tabla = document.getElementById('dataTableContrato');
    if (!tabla) {
        console.error("❌ No se encontró la tabla");
        return;
    }

    // Verificar jQuery y DataTable
    if (typeof $ === 'undefined') {
        console.error("❌ jQuery no está cargado");
        return;
    }

    if (typeof $.fn.DataTable === 'undefined') {
        console.error("❌ DataTable no está cargado");
        return;
    }

    console.log("✅ jQuery y DataTable disponibles");

    const $table = $('#dataTableContrato');

    // Destruir instancia anterior si existe
    if ($.fn.DataTable.isDataTable('#dataTableContrato')) {
        console.log("Destruyendo DataTable existente");
        $table.DataTable().destroy();
    }

    // Limpiar el tbody
    const $tbody = $table.find('tbody');
    $tbody.empty();

    // Llenar los datos manualmente
    if (contratoLeft && contratoLeft.length > 0) {
        contratoLeft.forEach((contrato) => {
            const row = `
                <tr>
                    <td class="text-center">
                        <button class="btn btn-primary btn-sm btn-agregar-contrato" 
                                data-bs-toggle="modal" 
                                data-bs-target="#ModalAgregarContrato" 
                                data-id="${contrato.id_instructor}">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-eliminar-contrato" 
                                data-bs-toggle="modal" 
                                data-bs-target="#ModalEliminarContrato" 
                                data-id-contrato="${contrato.id_contrato}">  <!-- ✅ Correcto -->
                            <i class="bi bi-clipboard-minus-fill"></i>
                        </button>
                    </td>
                    <td>${contrato.id_instructor || ''}</td>
                    <td>${contrato.numero_contrato || ''}</td>
                    <td>${(contrato.nombres || '') + ' ' + (contrato.apellidos || '')}</td>
                    <td>${contrato.numero_documento || ''}</td>
                    <td>${contrato.crp || ''}</td>
                    <td>${contrato.cdp || ''}</td>
                    <td><button class="btn btn-warning btn-sm btn-modificar-contrato" data-bs-toggle="modal" data-bs-target="#ModalModificarContrato" data-id-contrato="${contrato.id_contrato}">Modificar</button></td>
                </tr>
            `;
            $tbody.append(row);
        });
        console.log(`✅ ${contratoLeft.length} filas agregadas`);
    } else {
        $tbody.append('<tr><td colspan="7" class="text-center">No hay contratos disponibles</td></tr>');
    }

    // Inicializar DataTable
    try {
        const dataTable = $table.DataTable({
            responsive: true,
            dom: 'lBfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ],
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
            },
            pageLength: 10,
            lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Todos"]],
            order: [[1, 'asc']], // Ordenar por ID
            columnDefs: [
                {
                    targets: 0, // Columna de acciones
                    orderable: false,
                    searchable: false
                }
            ]
        });

        console.log("✅ DataTable inicializada con éxito");

    } catch (error) {
        console.error("Error al inicializar DataTable:", error);
    }
}

// =============================
// CONFIGURAR BOTONES DEL MODAL
// =============================
function setupModalButtons() {
    // Botón para AGREGAR contrato
    $(document).on('click', '.btn-agregar-contrato', function (e) {
        const id_instructor = $(this).data('id');

        console.log("🔑 ID Instructor capturado del botón:", id_instructor);

        const inputIdInstructor = document.getElementById('id_instructor');
        if (inputIdInstructor) {
            inputIdInstructor.value = id_instructor;
            console.log("✅ ID asignado al input hidden:", inputIdInstructor.value);
        } else {
            console.error("❌ No se encontró el input hidden 'id_instructor'");
        }

        const nombreInstructor = $(this).closest('tr').find('td:eq(3)').text();
        console.log("📌 Instructor seleccionado:", nombreInstructor);
    });

    // Botón para ELIMINAR contrato
    $(document).on('click', '.btn-eliminar-contrato', function (e) {
        // jQuery convierte data-id-contrato a dataIdContrato (camelCase)
        const id_contrato = $(this).data('idContrato');  // ← Así se escribe

        console.log("🔑 ID Contrato capturado del botón:", id_contrato);
        console.log("Data attributes completos:", $(this).data()); // Para depuración

        const inputIdContrato = document.getElementById('id_contrato_eliminar');
        if (inputIdContrato && id_contrato) {
            inputIdContrato.value = id_contrato;
            console.log("✅ ID Contrato asignado al input hidden:", inputIdContrato.value);
        } else {
            console.error("❌ No se encontró el ID del contrato");
        }
    });

    // Evento show.bs.modal para AGREGAR (método alternativo)
    $('#ModalAgregarContrato').on('show.bs.modal', function (e) {
        const button = $(e.relatedTarget);
        const id_instructor = button.data('id');

        if (id_instructor) {
            document.getElementById('id_instructor').value = id_instructor;
            console.log("🎯 Modal Agregar abierto - ID asignado:", id_instructor);
        }
    });

    // Evento show.bs.modal para ELIMINAR (método alternativo)
    $('#ModalEliminarContrato').on('show.bs.modal', function (e) {
        const button = $(e.relatedTarget);
        const id_contrato = button.data('id-contrato');

        if (id_contrato) {
            document.getElementById('id_contrato').value = id_contrato;
            console.log("🎯 Modal Eliminar abierto - ID Contrato asignado:", id_contrato);
        }
    });

    // Limpiar inputs cuando los modales se cierran
    $('#ModalAgregarContrato').on('hidden.bs.modal', function () {
        const inputIdInstructor = document.getElementById('id_instructor');
        if (inputIdInstructor) {
            console.log("Modal Agregar cerrado, ID actual:", inputIdInstructor.value);
        }
    });

    $('#ModalEliminarContrato').on('hidden.bs.modal', function () {
        const inputIdContrato = document.getElementById('id_contrato');
        if (inputIdContrato) {
            inputIdContrato.value = '';
            console.log("Modal Eliminar cerrado, ID limpiado");
        }
    });
}

// =============================
// CONFIGURACIÓN DEL FORMULARIO DE CREACIÓN
// =============================
function setupFormHandler() {
    const formCrear = document.getElementById('formContrato');
    if (formCrear) {
        formCrear.removeEventListener('submit', handleCreateSubmit);
        formCrear.addEventListener('submit', handleCreateSubmit);
        console.log("✅ Event listener del formulario de creación configurado");
    } else {
        console.log("⚠️ No se encontró el formulario con id 'formContrato'");
    }
}

// =============================
// CONFIGURACIÓN DEL FORMULARIO DE ELIMINACIÓN
// =============================
function setupDeleteFormHandler() {
    const formEliminar = document.getElementById('formEliminarContrato');
    if (formEliminar) {
        formEliminar.removeEventListener('submit', handleDeleteSubmit);
        formEliminar.addEventListener('submit', handleDeleteSubmit);
        console.log("✅ Event listener del formulario de eliminación configurado");
    } else {
        console.log("⚠️ No se encontró el formulario con id 'formEliminarContrato'");
    }
}

// =============================
// MANEJAR ENVÍO DEL FORMULARIO DE CREACIÓN
// =============================
async function handleCreateSubmit(event) {
    event.preventDefault();
    console.log("📝 Enviando formulario de contrato...");

    const idInstructorInput = document.getElementById('id_instructor');
    const id_instructor = idInstructorInput ? idInstructorInput.value : null;

    console.log("📌 ID Instructor a enviar:", id_instructor);

    if (!id_instructor || id_instructor === '') {
        console.error("❌ No se ha seleccionado ningún instructor");
        alert("Error: Por favor seleccione un instructor de la tabla primero");
        return;
    }

    const numero_contrato = document.getElementById('numero_contrato')?.value || '';
    if (!numero_contrato) {
        console.error("❌ Número de contrato es requerido");
        alert("Por favor ingrese el número de contrato");
        return;
    }

    const newData = {
        id_instructor: parseInt(id_instructor),
        numero_contrato: numero_contrato,
        crp: parseInt(document.getElementById('CRP').value),
        cdp: parseInt(document.getElementById('CDP').value),
        rubro: document.getElementById('rubro')?.value || '',
        dependencia: document.getElementById('dependencia')?.value || '',
        fecha_inicio: document.getElementById('fecha_inicio')?.value || '',
        fecha_fin: document.getElementById('fecha_fin')?.value || '',
        valor_contrato: parseFloat(document.getElementById('valor_contrato').value),
        valor_mes: parseFloat(document.getElementById('valorMes').value),
        estado: 'Activo',
        vigencia: document.getElementById('fecha_fin')?.value || '',
        valorAdDi: null
    };

    console.log("📦 Datos a enviar:", newData);

    try {
        console.log("🚀 Enviando datos al servidor...");
        await ContratoService.create_contrato(newData);
        console.log("✅ Contrato creado exitosamente");

        const modalElement = document.getElementById("ModalAgregarContrato");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            } else {
                const modalInstance = new bootstrap.Modal(modalElement);
                modalInstance.hide();
            }
        }

        event.target.reset();

        if (idInstructorInput) {
            idInstructorInput.value = '';
        }

        alert("Contrato creado exitosamente");
        await initContrato();

    } catch (error) {
        console.error("❌ Error al crear contrato:", error);
        alert("Error al crear el contrato. Por favor verifique los datos e intente nuevamente.");
    }
}

// =============================
// MANEJAR ENVÍO DEL FORMULARIO DE ELIMINACIÓN
// =============================
async function handleDeleteSubmit(event) {
    event.preventDefault();
    console.log("📝 Eliminar contrato...");

    const idContratoInput = document.getElementById('id_contrato');
    const id_contrato = idContratoInput ? idContratoInput.value : null;

    console.log("📌 ID Contrato a enviar:", id_contrato);

    if (!id_contrato || id_contrato === '') {
        console.error("❌ No se ha seleccionado ningún contrato");
        alert("Error: Por favor seleccione un contrato de la tabla primero");
        return;
    }

    // Confirmar eliminación
    const confirmar = confirm(`¿Está seguro que desea eliminar el contrato #${id_contrato}?`);
    if (!confirmar) {
        console.log("Eliminación cancelada por el usuario");
        return;
    }

    try {
        console.log("🚀 Enviando datos al servidor...");
        await ContratoService.delete_contrato(id_contrato);
        console.log("✅ Contrato eliminado exitosamente");

        const modalElement = document.getElementById("ModalEliminarContrato");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }

        alert("Contrato eliminado exitosamente");

        // Limpiar el input hidden
        if (idContratoInput) {
            idContratoInput.value = '';
        }

        await initContrato();

    } catch (error) {
        console.error("❌ Error al eliminar contrato:", error);
        alert("Error al eliminar el contrato. Por favor verifique los datos e intente nuevamente.");
    }
}

// =============================
// FORMATEO DE DINERO (opcional)
// =============================
function formatMoney(amount) {
    if (!amount && amount !== 0) return '$0';
    const numero = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numero)) return '$0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numero);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initContrato());
} else {
    initContrato();
}
