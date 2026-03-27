import { ContratoService } from './contrato.service.js';

export async function initContrato() {
    console.log("=== INITCONTRATO EJECUTÁNDOSE ===");
    
    const contratos = await ContratoService.get_contrato_instructor();
    let contratoLeft = contratos.data;
    console.log(contratos);

    // Configurar el event listener del formulario
    setupFormHandler();

    // Esperar a que el DOM esté listo
    const initialize = () => {
        console.log("Inicializando tabla...");
        
        // Verificar que la tabla existe
        const tabla = document.getElementById('dataTableContrato');
        if (!tabla) {
            console.error("❌ No se encontró la tabla");
            return;
        }
        
        // Verificar el número de columnas en el thead
        const thead = tabla.querySelector('thead tr');
        if (thead) {
            const numColumnas = thead.querySelectorAll('th').length;
            console.log("Número de columnas en thead:", numColumnas);
            if (numColumnas !== 6) {
                console.warn(`⚠️ La tabla tiene ${numColumnas} columnas pero debería tener 6`);
            }
        }
        
        // Verificar jQuery
        if (typeof $ === 'undefined') {
            console.error("❌ jQuery no está cargado");
            return;
        }
        
        // Verificar DataTable
        if (typeof $.fn.DataTable === 'undefined') {
            console.error("❌ DataTable no está cargado");
            return;
        }
        
        console.log("✅ jQuery y DataTable disponibles");
        
        // Obtener la tabla
        const $table = $('#dataTableContrato');
        
        // Destruir instancia anterior si existe
        if ($.fn.DataTable.isDataTable('#dataTableContrato')) {
            console.log("Destruyendo DataTable existente");
            $table.DataTable().destroy();
        }
        
        // Limpiar el tbody
        const $tbody = $table.find('tbody');
        $tbody.empty();
        console.log("✅ tbody limpiado");
        
        // Llenar los datos manualmente
        if (contratoLeft && contratoLeft.length > 0) {
            contratoLeft.forEach((contrato) => {
                const row = `
                    <tr>
                        <td class="text-center">
                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#ModalAgregarContrato">
                                +
                            </button>
                        </td>
                        <td>${contrato.id_instructor || ''}</td>
                        <td>${contrato.numero_contrato || ''}</td>
                        <td>${(contrato.nombres || '') + ' ' + (contrato.apellidos || '')}</td>
                        <td>${contrato.numero_documento || ''}</td>
                        <td>${contrato.crp || ''}</td>
                    </tr>
                `;
                $tbody.append(row);
            });
        } else {
            $tbody.append('<tr><td colspan="6" class="text-center">No hay contratos disponibles</td></tr>');
        }
        
        console.log(`✅ ${contratoLeft?.length || 0} filas agregadas al tbody`);
        console.log("Filas en tbody:", $tbody.find('tr').length);
        
        // Inicializar DataTable con botones de exportación
        try {
            const dataTable = $table.DataTable({
                responsive: true,
                dom: 'lBfrtip', // l: lengthMenu, B: buttons, f: filter, r: processing, t: table, i: info, p: pagination
                pageLength: 10,
                lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Todos"]],
                order: [[2, 'desc']], // Ordenar por No. Contrato (índice 2)
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
                },
                // 🔥 BOTONES DE EXPORTACIÓN
                buttons: [
                    {
                        extend: 'excel',
                        text: '<i class="bi bi-file-earmark-excel"></i> Excel',
                        className: 'btn btn-success btn-sm',
                        title: 'Contratos',
                        exportOptions: {
                            columns: [1, 2, 3, 4, 5], // Exportar columnas: Instructor, No. Contrato, Nombre, Documento, CRP
                            format: {
                                body: function(data, type, row, meta) {
                                    // Limpiar HTML de los datos
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
                        orientation: 'landscape',
                        pageSize: 'A4',
                        exportOptions: {
                            columns: [1, 2, 3, 4, 5],
                            format: {
                                body: function(data, type, row, meta) {
                                    return data.replace(/<[^>]*>/g, '').trim();
                                }
                            }
                        }
                    },
                    {
                        extend: 'csv',
                        text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV',
                        className: 'btn btn-primary btn-sm',
                        title: 'Contratos',
                        exportOptions: {
                            columns: [1, 2, 3, 4, 5],
                            format: {
                                body: function(data, type, row, meta) {
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
                            columns: [1, 2, 3, 4, 5],
                            format: {
                                body: function(data, type, row, meta) {
                                    return data.replace(/<[^>]*>/g, '').trim();
                                }
                            }
                        }
                    },
                    {
                        extend: 'copy',
                        text: '<i class="bi bi-files"></i> Copiar',
                        className: 'btn btn-secondary btn-sm',
                        title: 'Contratos',
                        exportOptions: {
                            columns: [1, 2, 3, 4, 5],
                            format: {
                                body: function(data, type, row, meta) {
                                    return data.replace(/<[^>]*>/g, '').trim();
                                }
                            }
                        }
                    }
                ],
                columnDefs: [
                    {
                        targets: 0, // Columna de acciones (botón +)
                        orderable: false, // No permitir ordenar
                        searchable: false, // No permitir búsqueda en esta columna
                        exportOptions: {
                            columns: [0], // No exportar esta columna
                            format: {
                                body: function(data, type, row, meta) {
                                    return ''; // Dejar vacío en exportación
                                }
                            }
                        }
                    }
                ],
                destroy: true,
                retrieve: false,
                paging: true,
                searching: true,
                info: true
            });
            
            console.log("✅✅✅ DATATABLE INICIALIZADO CON ÉXITO ✅✅✅");
            console.log("Total registros:", dataTable.rows().count());
            
            // Forzar redibujo
            dataTable.draw();
            
        } catch (error) {
            console.error("Error al inicializar DataTable:", error);
            console.log("Intentando inicializar sin opciones complejas...");
            
            // Intentar con opciones mínimas
            try {
                const dataTable = $table.DataTable({
                    responsive: true
                });
                console.log("✅ DataTable inicializado con opciones mínimas");
            } catch (error2) {
                console.error("Error incluso con opciones mínimas:", error2);
            }
        }
    };
    
    // Ejecutar después de que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // Pequeño retraso para asegurar que todo esté renderizado
        setTimeout(initialize, 50);
    }
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
// FORMATEO DE DINERO
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

// =============================
// MANEJAR ENVÍO DEL FORMULARIO
// =============================
async function handleCreateSubmit(event) {
    event.preventDefault();
    console.log("📝 Enviando formulario de contrato...");

    const newData = {
        numeroContrato: document.getElementById('numeroContrato')?.value || '',
        crp: document.getElementById('CRP')?.value || '',
        cdp: document.getElementById('CDP')?.value || '',
        rubro: document.getElementById('rubro')?.value || '',
        dependencia: document.getElementById('dependencia')?.value || '',
        fechaInicio: document.getElementById('fecha_inicio')?.value || '',
        fechaFin: document.getElementById('fechaFin')?.value || '',
        valorContrato: document.getElementById('valorContrato')?.value || '',
        valorMes: document.getElementById('valorMes')?.value || ''
    };

    // Validar campos requeridos
    if (!newData.numeroContrato) {
        console.error("❌ Número de contrato es requerido");
        alert("Por favor ingrese el número de contrato");
        return;
    }

    try {
        console.log("Enviando datos:", newData);
        await ContratoService.create_contrato(newData);
        console.log("✅ Contrato creado exitosamente");

        // Cerrar modal
        const modalElement = document.getElementById("ModalAgregarContrato");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }

        // Limpiar formulario
        event.target.reset();

        // Recargar la tabla con los nuevos datos
        await initContrato();

    } catch (error) {
        console.error("❌ Error al crear contrato:", error);
        alert("Error al crear el contrato. Por favor verifique los datos e intente nuevamente.");
    }
}