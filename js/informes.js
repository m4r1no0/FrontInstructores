// informes.js
import { ContratoService } from './contrato.service.js';

let instructoresGlobal = [];
let dataTable = null;
export const initInforme = () => {
    cargarInstructores();
    console.log('🚀 Inicializando página de informes...');

    document.addEventListener('click', async (event) => {
        const btnInforme = event.target.closest('.btn-generar-informe');
        const btnActa = event.target.closest('.btn-generar-acta');

        if (btnInforme) {
            await manejarGeneracion(event, {
                button: btnInforme,
                servicio: ContratoService.generar_informe_contrato,
                texto: 'Informe'
            });
        }

        if (btnActa) {
            await manejarGeneracion(event, {
                button: btnActa,
                servicio: ContratoService.generar_acta_contrato,
                texto: 'Acta'
            });
        }
    });

    console.log('✅ Evento de descarga configurado correctamente');
};


let enProceso = new Set();

/**
 * Función reutilizable para generar documentos (Informe / Acta)
 */
const manejarGeneracion = async (event, { button, servicio, texto }) => {
    event.preventDefault();

    const idInstructor = button.getAttribute('data-id');
    console.log(`📋 ID del instructor (${texto}):`, idInstructor);

    if (!idInstructor) {
        console.error('❌ No se encontró el ID del instructor');
        alert('Error: No se pudo identificar el instructor');
        return;
    }

    // Evitar múltiples ejecuciones para el mismo instructor
    if (enProceso.has(idInstructor)) return;
    enProceso.add(idInstructor);

    try {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';

        const resultado = await servicio(idInstructor);

        console.log(`✅ Resultado ${texto}:`, resultado);

        if (resultado.success) {
            alert(`${texto} generado correctamente`);
        }

    } catch (error) {
        console.error(`❌ Error al generar ${texto}:`, error);
        alert(`Error al generar ${texto}: ${error.message}`);

    } finally {
        enProceso.delete(idInstructor);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-file-word"></i> Generar ${texto}`;
    }
};


const cargarInstructores = async () => {
    try {
        let response = await ContratoService.get_contrato_instructor();
        instructoresGlobal = response.data;

        const cuerpoTable = document.querySelector('.tablaInstrutoresInforme');

        if (cuerpoTable) {
            cuerpoTable.innerHTML = '';

            if (instructoresGlobal && instructoresGlobal.length > 0) {
                instructoresGlobal.forEach(item => {
                    const fila = cuerpoTable.insertRow();

                    fila.insertCell(0).innerHTML = item.id_instructor || '-';
                    fila.cells[0].classList.add('d-none');

                    fila.insertCell(1).innerHTML = item.numero_documento || '-';
                    fila.insertCell(2).innerHTML = item.nombres || '-';
                    fila.insertCell(3).innerHTML = item.apellidos || '-';
                    fila.insertCell(4).innerHTML = item.numero_contrato || '-';
                    fila.insertCell(5).innerHTML = item.crp || '-';

                    fila.insertCell(6).innerHTML = `
                        <button class="btn btn-primary btn-sm btn-generar-informe" 
                                data-id="${item.id_instructor}">
                            <i class="fas fa-file-word"></i> Generar Informe
                        </button>
                        <button class="btn btn-primary btn-sm btn-generar-acta" 
                                data-id="${item.id_instructor}">
                            <i class="fas fa-file-word"></i> Generar Acta
                        </button>
                    `;
                });
            } else {
                const fila = cuerpoTable.insertRow();
                const celda = fila.insertCell(0);
                celda.colSpan = 7;
                celda.className = 'text-center';
                celda.innerHTML = '<i class="fas fa-info-circle"></i> No hay instructores registrados';
            }

            // DataTable
            if (typeof $ !== 'undefined' && $.fn.DataTable) {
                if (dataTable) {
                    dataTable.destroy();
                }

                dataTable = $('#dataTableInforme').DataTable({
                    language: {
                        sProcessing: "Procesando...",
                        sLengthMenu: "Mostrar _MENU_ registros",
                        sZeroRecords: "No se encontraron resultados",
                        sEmptyTable: "Ningún dato disponible en esta tabla",
                        sInfo: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                        sInfoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
                        sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
                        sSearch: "Buscar:",
                        oPaginate: {
                            sFirst: "Primero",
                            sLast: "Último",
                            sNext: "Siguiente",
                            sPrevious: "Anterior"
                        }
                    },
                    pageLength: 10,
                    order: [[0, 'desc']]
                });
            }
        }

    } catch (error) {
        console.error('❌ Error al cargar instructores:', error);
    }
};