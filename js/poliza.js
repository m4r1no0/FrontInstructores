// poliza.js
import { PolizaService } from './poliza.service.js';

// =============================
// FUNCIONES DE UTILIDAD (primero)
// =============================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO');
    } catch (error) {
        return 'Fecha inválida';
    }
}

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

// =============================
// CONFIGURACIÓN DE FORMULARIOS (antes de initPoliza)
// =============================
function setupFormHandler() {
    const formCrear = document.getElementById('formPoliza');
    if (formCrear) {
        formCrear.removeEventListener('submit', handleCreateSubmit);
        formCrear.addEventListener('submit', handleCreateSubmit);
        console.log("✅ Event listener del formulario de creación configurado");
    } else {
        console.log("⚠️ No se encontró el formulario con id 'formPoliza'");
    }
}

function setupUpdateFormHandler() {
    const formEditar = document.getElementById('formEditarPoliza');
    if (formEditar) {
        formEditar.removeEventListener('submit', handleUpdateSubmit);
        formEditar.addEventListener('submit', handleUpdateSubmit);
        console.log("✅ Event listener del formulario de actualización configurado");
    } else {
        console.log("⚠️ No se encontró el formulario con id 'formEditarPoliza'");
    }
}

function setupDeleteFormHandler() {
    const formEliminar = document.getElementById('formEliminarPoliza');
    if (formEliminar) {
        formEliminar.removeEventListener('submit', handleDeleteSubmit);
        formEliminar.addEventListener('submit', handleDeleteSubmit);
        console.log("✅ Event listener del formulario de eliminación configurado");
    } else {
        console.log("⚠️ No se encontró el formulario con id 'formEliminarPoliza'");
    }
}

function setupModalButtons() {
    // Botón para AGREGAR póliza
    $(document).on('click', '.btn-agregar-poliza', function(e) {
        const id_instructor = $(this).data('id');
        console.log("🔑 ID Instructor capturado del botón:", id_instructor);
        
        const inputIdInstructor = document.getElementById('id_instructor_poliza');
        if (inputIdInstructor) {
            inputIdInstructor.value = id_instructor;
            console.log("✅ ID asignado al input hidden:", inputIdInstructor.value);
        } else {
            console.error("❌ No se encontró el input hidden 'id_instructor_poliza'");
        }
    });
    
    // Botón para EDITAR póliza
    $(document).on('click', '.btn-editar-poliza', async function(e) {
        const id_poliza = $(this).data('id-poliza');
        console.log("✏️ ID Póliza a editar:", id_poliza);
        
        if (id_poliza) {
            try {
                const response = await PolizaService.get_poliza_by_id(id_poliza);
                const poliza = response.data || response;
                console.log("📋 Datos de la póliza:", poliza);
                
                document.getElementById('edit_id_poliza').value = poliza.id_poliza;
                document.getElementById('edit_id_instructor').value = poliza.id_instructor;
                document.getElementById('edit_numero_poliza').value = poliza.numero_poliza || '';
                document.getElementById('edit_tipo_poliza').value = poliza.tipo_poliza || '';
                document.getElementById('edit_aseguradora').value = poliza.aseguradora || '';
                document.getElementById('edit_fecha_inicio').value = poliza.fecha_inicio || '';
                document.getElementById('edit_fecha_fin').value = poliza.fecha_fin || '';
                document.getElementById('edit_valor_asegurado').value = poliza.valor_asegurado || '';
                document.getElementById('edit_estado').value = poliza.estado || '';
                document.getElementById('edit_observaciones').value = poliza.observaciones || '';
                
                console.log("✅ Formulario de edición llenado");
            } catch (error) {
                console.error("❌ Error al cargar datos de la póliza:", error);
                alert("Error al cargar los datos de la póliza");
            }
        }
    });
    
    // Botón para ELIMINAR póliza
    $(document).on('click', '.btn-eliminar-poliza', function(e) {
        const id_poliza = $(this).data('id-poliza');
        console.log("🔑 ID Póliza capturado del botón:", id_poliza);
        
        const inputIdPoliza = document.getElementById('id_poliza_eliminar');
        if (inputIdPoliza && id_poliza) {
            inputIdPoliza.value = id_poliza;
            console.log("✅ ID Póliza asignado al input hidden:", inputIdPoliza.value);
        }
    });
    
    // Evento show.bs.modal para AGREGAR
    $('#ModalAgregarPoliza').on('show.bs.modal', function(e) {
        const button = $(e.relatedTarget);
        const id_instructor = button.data('id');
        if (id_instructor) {
            document.getElementById('id_instructor_poliza').value = id_instructor;
        }
    });
    
    // Limpiar modales al cerrar
    $('#ModalAgregarPoliza').on('hidden.bs.modal', function() {
        const form = document.getElementById('formPoliza');
        if (form) form.reset();
        const inputIdInstructor = document.getElementById('id_instructor_poliza');
        if (inputIdInstructor) inputIdInstructor.value = '';
    });
    
    $('#ModalEditarPoliza').on('hidden.bs.modal', function() {
        const form = document.getElementById('formEditarPoliza');
        if (form) form.reset();
    });
    
    $('#ModalEliminarPoliza').on('hidden.bs.modal', function() {
        const inputIdPoliza = document.getElementById('id_poliza_eliminar');
        if (inputIdPoliza) inputIdPoliza.value = '';
    });
}

// =============================
// MANEJADORES DE ENVÍO
// =============================
async function handleCreateSubmit(event) {
    event.preventDefault();
    console.log("📝 Enviando formulario de póliza...");

    const idInstructorInput = document.getElementById('id_instructor_poliza');
    const id_instructor = idInstructorInput ? idInstructorInput.value : null;
    
    if (!id_instructor || id_instructor === '') {
        alert("Error: Por favor seleccione un instructor de la tabla primero");
        return;
    }
    
    const numero_poliza = document.getElementById('numero_poliza')?.value || '';
    if (!numero_poliza) {
        alert("Por favor ingrese el número de póliza");
        return;
    }

    const newData = {
        id_instructor: parseInt(id_instructor),
        numero_poliza: numero_poliza,
        tipo_poliza: document.getElementById('tipo_poliza')?.value || '',
        aseguradora: document.getElementById('aseguradora')?.value || '',
        fecha_inicio: document.getElementById('fecha_inicio')?.value || null,
        fecha_fin: document.getElementById('fecha_fin')?.value || null,
        valor_asegurado: parseFloat(document.getElementById('valor_asegurado')?.value || 0),
        estado: document.getElementById('estado')?.value || 'ACTIVA',
        observaciones: document.getElementById('observaciones')?.value || ''
    };
    
    try {
        await PolizaService.create_poliza(newData);
        
        const modalElement = document.getElementById("ModalAgregarPoliza");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        event.target.reset();
        if (idInstructorInput) idInstructorInput.value = '';
        
        alert("Póliza creada exitosamente");
        await initPoliza();
    } catch (error) {
        console.error("❌ Error al crear póliza:", error);
        alert("Error al crear la póliza");
    }
}

async function handleUpdateSubmit(event) {
    event.preventDefault();
    const id_poliza = document.getElementById('edit_id_poliza')?.value;
    
    if (!id_poliza) {
        alert("Error: No se ha seleccionado ninguna póliza");
        return;
    }

    const updateData = {
        tipo_poliza: document.getElementById('edit_tipo_poliza')?.value || '',
        aseguradora: document.getElementById('edit_aseguradora')?.value || '',
        fecha_inicio: document.getElementById('edit_fecha_inicio')?.value || null,
        fecha_fin: document.getElementById('edit_fecha_fin')?.value || null,
        valor_asegurado: parseFloat(document.getElementById('edit_valor_asegurado')?.value || 0),
        estado: document.getElementById('edit_estado')?.value || 'ACTIVA',
        observaciones: document.getElementById('edit_observaciones')?.value || ''
    };
    
    try {
        await PolizaService.update_poliza(id_poliza, updateData);
        
        const modalElement = document.getElementById("ModalEditarPoliza");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        alert("Póliza actualizada exitosamente");
        await initPoliza();
    } catch (error) {
        console.error("❌ Error al actualizar póliza:", error);
        alert("Error al actualizar la póliza");
    }
}

async function handleDeleteSubmit(event) {
    event.preventDefault();
    const idPolizaInput = document.getElementById('id_poliza_eliminar');
    const id_poliza = idPolizaInput ? idPolizaInput.value : null;
    
    if (!id_poliza || id_poliza === '') {
        alert("Error: Por favor seleccione una póliza de la tabla primero");
        return;
    }
    
    const confirmar = confirm(`¿Está seguro que desea eliminar la póliza #${id_poliza}?`);
    if (!confirmar) return;

    try {
        await PolizaService.delete_poliza(id_poliza);
        
        const modalElement = document.getElementById("ModalEliminarPoliza");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        if (idPolizaInput) idPolizaInput.value = '';
        
        alert("Póliza eliminada exitosamente");
        await initPoliza();
    } catch (error) {
        console.error("❌ Error al eliminar póliza:", error);
        alert("Error al eliminar la póliza");
    }
}

// =============================
// INICIALIZAR TABLA
// =============================
function initializeTable(polizasData) {
    console.log("Inicializando tabla de pólizas...");
    
    const tabla = document.getElementById('dataTablePoliza');
    if (!tabla) {
        console.error("❌ No se encontró la tabla");
        return;
    }
    
    if (typeof $ === 'undefined' || typeof $.fn.DataTable === 'undefined') {
        console.error("❌ jQuery o DataTable no están cargados");
        return;
    }
    
    const $table = $('#dataTablePoliza');
    
    if ($.fn.DataTable.isDataTable('#dataTablePoliza')) {
        $table.DataTable().destroy();
    }
    
    const cuerpoTabla = document.querySelector('.cuerpoTabla');
    if (!cuerpoTabla) return;
    cuerpoTabla.innerHTML = '';
    
    if (polizasData && polizasData.length > 0) {
        polizasData.forEach((poliza) => {
            let estadoClass = '';
            switch (poliza.estado) {
                case 'ACTIVA': estadoClass = 'badge bg-success'; break;
                case 'VENCIDA': estadoClass = 'badge bg-danger'; break;
                case 'CANCELADA': estadoClass = 'badge bg-secondary'; break;
                case 'SUSPENDIDA': estadoClass = 'badge bg-warning text-dark'; break;
                case 'RENOVADA': estadoClass = 'badge bg-info text-dark'; break;
                default: estadoClass = 'badge bg-secondary';
            }
            
            const row = `
                <tr>
                    <td class="text-center">
                        <button class="btn btn-warning btn-sm btn-editar-poliza" 
                                data-bs-toggle="modal" 
                                data-bs-target="#ModalEditarPoliza" 
                                data-id-poliza="${poliza.id_poliza}">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-eliminar-poliza" 
                                data-bs-toggle="modal" 
                                data-bs-target="#ModalEliminarPoliza" 
                                data-id-poliza="${poliza.id_poliza}">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </td>
                    <td>${poliza.id_poliza || ''}</td>
                    <td>${poliza.nombre_instructor || poliza.nombre || ''}</td>
                    <td>${poliza.numero_poliza || ''}</td>
                    <td>${poliza.tipo_poliza || ''}</td>
                    <td>${poliza.aseguradora || ''}</td>
                    <td>${formatDate(poliza.fecha_inicio)}</td>
                    <td>${formatDate(poliza.fecha_fin)}</td>
                    <td class="text-end">${formatMoney(poliza.valor_asegurado)}</td>
                    <td><span class="${estadoClass}">${poliza.estado || 'N/A'}</span></td>
                    <td>${poliza.observaciones || '-'}</td>
                </tr>
            `;
            cuerpoTabla.innerHTML += row;
        });
        console.log(`✅ ${polizasData.length} filas agregadas`);
    } else {
        cuerpoTabla.innerHTML = '<tr><td colspan="11" class="text-center">No hay pólizas disponibles</td></tr>';
    }
    
    // Dentro de la función initializeTable, reemplaza la inicialización de DataTable:

try {
    const dataTable = $table.DataTable({
        responsive: true,
        language: {
            "decimal": "",
            "emptyTable": "No hay pólizas disponibles",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ pólizas",
            "infoEmpty": "Mostrando 0 a 0 de 0 pólizas",
            "infoFiltered": "(filtrado de _MAX_ pólizas totales)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "Mostrar _MENU_ pólizas",
            "loadingRecords": "Cargando...",
            "processing": "Procesando...",
            "search": "Buscar:",
            "zeroRecords": "No se encontraron pólizas",
            "paginate": {
                "first": "Primero",
                "last": "Último",
                "next": "Siguiente",
                "previous": "Anterior"
            },
            "aria": {
                "sortAscending": ": activar para ordenar ascendente",
                "sortDescending": ": activar para ordenar descendente"
            }
        },
        pageLength: 10,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Todos"]],
        order: [[1, 'desc']],
        columnDefs: [
            {
                targets: 0, // Columna de acciones
                orderable: false,
                searchable: false
            },
            {
                targets: 8, // Columna de valor asegurado
                orderable: true,
                searchable: false,
                className: 'text-end'
            }
        ]
    });
    
    console.log("✅ DataTable inicializada con éxito");
    
} catch (error) {
    console.error("Error al inicializar DataTable:", error);
}
}

// =============================
// FUNCIÓN PRINCIPAL (después de todas las definiciones)
// =============================
export async function initPoliza() {
    console.log("=== INITPOLIZA EJECUTÁNDOSE ===");
    
    const tabla = document.getElementById('dataTablePoliza');
    if (!tabla) {
        console.warn("⚠️ La tabla 'dataTablePoliza' no existe en el DOM");
        return;
    }
    
    try {
        const polizas = await PolizaService.get_all_polizas();
        let polizasData = polizas.data || polizas;
        console.log("Datos recibidos:", polizasData);

        setupFormHandler();
        setupDeleteFormHandler();
        setupUpdateFormHandler();
        setupModalButtons();
        initializeTable(polizasData);
        
    } catch (error) {
        console.error("Error en initPoliza:", error);
    }
}