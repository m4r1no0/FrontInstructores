// initContrato.js
import { ContratoService } from './contrato.service.js';

export async function initContrato() {
    console.log("=== INITCONTRATO EJECUTÁNDOSE ===");
    
    try {
        const contratos = await ContratoService.get_contrato_instructor();
        let contratoLeft = contratos.data;
        console.log("Datos recibidos:", contratoLeft);

        // Configurar event listeners
        setupFormHandler();
        setupModalButtons();

        // Inicializar la tabla
        initializeTable(contratoLeft);
        
    } catch (error) {
        console.error("Error en initContrato:", error);
    }
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
                        <button class="btn btn-danger btn-sm btn-agregar-contrato" 
                                data-bs-toggle="modal" 
                                data-bs-target="#ModalEliminarContrato" 
                                data-id="${contrato.id_instructor}">
                            <i class="bi bi-clipboard-minus-fill"></i>
                        </button>
                    </td>
                    <td>${contrato.id_instructor || ''}</td>
                    <td>${contrato.numero_contrato || ''}</td>
                    <td>${(contrato.nombres || '') + ' ' + (contrato.apellidos || '')}</td>
                    <td>${contrato.numero_documento || ''}</td>
                    <td>${contrato.crp || ''}</td>
                    <td>${contrato.cdp || ''}</td>
                </tr>
            `;
            $tbody.append(row);
        });
        console.log(`✅ ${contratoLeft.length} filas agregadas`);
    } else {
        $tbody.append('<tr><td colspan="6" class="text-center">No hay contratos disponibles</td></tr>');
    }
    
    // Inicializar DataTable
    try {
        const dataTable = $table.DataTable({
            responsive: true,
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
    // Usar event delegation para botones dinámicos (incluyendo los de DataTable)
    $(document).on('click', '.btn-agregar-contrato', function(e) {
        // Obtener el ID del data-id del botón
        const id_instructor = $(this).data('id');
        
        console.log("🔑 ID Instructor capturado del botón:", id_instructor);
        
        // Asignar al input hidden del formulario
        const inputIdInstructor = document.getElementById('id_instructor');
        if (inputIdInstructor) {
            inputIdInstructor.value = id_instructor;
            console.log("✅ ID asignado al input hidden:", inputIdInstructor.value);
        } else {
            console.error("❌ No se encontró el input hidden 'id_instructor'");
        }
        
        // Opcional: Mostrar en el modal quién es el instructor
        const nombreInstructor = $(this).closest('tr').find('td:eq(3)').text();
        console.log("📌 Instructor seleccionado:", nombreInstructor);
    });
    
    // Evento cuando el modal se abre (método alternativo)
    $('#ModalAgregarContrato').on('show.bs.modal', function(e) {
        const button = $(e.relatedTarget);
        const id_instructor = button.data('id');
        
        if (id_instructor) {
            document.getElementById('id_instructor').value = id_instructor;
            console.log("🎯 Modal abierto - ID asignado:", id_instructor);
        }
    });
    
    // Limpiar el input hidden cuando el modal se cierra
    $('#ModalAgregarContrato').on('hidden.bs.modal', function() {
        const inputIdInstructor = document.getElementById('id_instructor');
        if (inputIdInstructor) {
            // No limpiar inmediatamente por si acaso, pero puedes hacerlo
            console.log("Modal cerrado, ID actual:", inputIdInstructor.value);
        }
    });
}

// =============================
// CONFIGURACIÓN DEL FORMULARIO
// =============================
function setupFormHandler() {
    const formCrear = document.getElementById('formContrato');
    if (formCrear) {
        formCrear.removeEventListener('submit', handleCreateSubmit);
        formCrear.addEventListener('submit', handleCreateSubmit);
        console.log("✅ Event listener del formulario configurado");
    } else {
        console.warn("⚠️ No se encontró el formulario con id 'formContrato'");
    }
}

// =============================
// MANEJAR ENVÍO DEL FORMULARIO
// =============================
async function handleCreateSubmit(event) {
    event.preventDefault();
    console.log("📝 Enviando formulario de contrato...");

    // Capturar el ID del input hidden
    const idInstructorInput = document.getElementById('id_instructor');
    const id_instructor = idInstructorInput ? idInstructorInput.value : null;
    
    console.log("📌 ID Instructor a enviar:", id_instructor);
    
    // Validar que el ID esté presente
    if (!id_instructor || id_instructor === '') {
        console.error("❌ No se ha seleccionado ningún instructor");
        alert("Error: Por favor seleccione un instructor de la tabla primero");
        return;
    }
    
    // Validar campos requeridos
    const numero_contrato = document.getElementById('numero_contrato')?.value || '';
    if (!numero_contrato) {
        console.error("❌ Número de contrato es requerido");
        alert("Por favor ingrese el número de contrato");
        return;
    }

    
    // Construir objeto con los datos
    const newData = {
        id_instructor: parseInt(id_instructor), // Asegurar que sea número
        numero_contrato: numero_contrato,
        crp: parseInt(document.getElementById('CRP').value),
        cdp: parseInt(document.getElementById('CDP').value),
        rubro: document.getElementById('rubro')?.value || '',
        dependencia: document.getElementById('dependencia')?.value || '',
        fecha_inicio: document.getElementById('fecha_inicio')?.value || '',
        fecha_fin: document.getElementById('fecha_fin')?.value || '',
        valor_contrato: parseFloat(document.getElementById('valor_contrato').value),
        valor_mes: parseFloat(document.getElementById('valorMes').value),
        estado : 'Activo',
        vigencia:  document.getElementById('fecha_fin')?.value || '',
        valorAdDi  : null 
    };
    
    console.log("📦 Datos a enviar:", newData);

    try {
        console.log("🚀 Enviando datos al servidor...");
        await ContratoService.create_contrato(newData);
        console.log("✅ Contrato creado exitosamente");

        // Cerrar modal
        const modalElement = document.getElementById("ModalAgregarContrato");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            } else {
                // Si no hay instancia, cerrar de otra forma
                const modalInstance = new bootstrap.Modal(modalElement);
                modalInstance.hide();
            }
        }

        // Limpiar formulario
        event.target.reset();
        
        // Limpiar el input hidden
        if (idInstructorInput) {
            idInstructorInput.value = '';
        }

        // Mostrar mensaje de éxito
        alert("Contrato creado exitosamente");

        // Recargar la tabla con los nuevos datos
        await initContrato();

    } catch (error) {
        console.error("❌ Error al crear contrato:", error);
        alert("Error al crear el contrato. Por favor verifique los datos e intente nuevamente.");
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