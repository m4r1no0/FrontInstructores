// informes.js
import { ContratoService } from './contrato.service.js';

let instructoresGlobal = [];
let dataTable = null;

export const initInforme = () => {
    cargarInstructores();
    console.log('🚀 Inicializando página de informes...');
    
    // Usar delegación de eventos para los botones dinámicos
    document.addEventListener('click', async function(event) {
        const button = event.target.closest('.btn-generar-informe');
        if (button) {
            event.preventDefault();
            console.log('🖱️ Botón clickeado');
            
            // Obtener el ID del data-id
            const idInstructor = button.getAttribute('data-id');
            console.log('📋 ID del instructor:', idInstructor);
            
            if (!idInstructor) {
                console.error('❌ No se encontró el ID del instructor');
                alert('Error: No se pudo identificar el instructor');
                return;
            }
            
            try {
                // Deshabilitar botón mientras procesa
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
                
                // Llamar al servicio para generar el informe
                const resultado = await ContratoService.generar_informe_contrato(idInstructor);
                
                console.log('✅ Resultado:', resultado);
                
                if (resultado.success) {
                    console.log('📄 Informe generado y descargado correctamente');
                    alert('Informe generado correctamente');
                }
                
            } catch (error) {
                console.error('❌ Error al generar informe:', error);
                alert(`Error al generar informe: ${error.message}`);
                
            } finally {
                // Restaurar botón
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-file-word"></i> Generar Informe';
            }
        }
    });
    
    console.log('✅ Evento de descarga configurado correctamente');
};

const cargarInstructores = async () => {
    try {
        let response = await ContratoService.get_contrato_instructor();
        instructoresGlobal = response.data;
        console.log(instructoresGlobal);
        
        const cuerpoTable = document.querySelector('.tablaInstrutoresInforme');
        console.log(cuerpoTable);
        
        let datos = instructoresGlobal;
        
        if (cuerpoTable) {
            // Limpiar tabla
            cuerpoTable.innerHTML = '';
            
            if (datos && datos.length > 0) {
                datos.forEach(item => {
                    const fila = cuerpoTable.insertRow();
                    
                    // ID
                fila.insertCell(0).innerHTML = item.id_instructor || '-';
                fila.cells[0].classList.add('d-none');
                
                // Documento
                fila.insertCell(1).innerHTML = item.numero_documento || '-';
                
                // Nombres
                fila.insertCell(2).innerHTML = item.nombres || '-';
                
                // Apellidos
                fila.insertCell(3).innerHTML = item.apellidos || '-';
                
                // No. Contrato
                fila.insertCell(4).innerHTML = item.numero_contrato || '-';
                
                // CRP
                fila.insertCell(5).innerHTML = item.crp || '-';
                
                // Acciones
                fila.insertCell(6).innerHTML = `
                    <button class="btn btn-primary btn-sm btn-generar-informe" 
                            data-id="${item.id_instructor}">
                        <i class="fas fa-file-word"></i> Generar Informe
                    </button>
                `;
                });
            } else {
                // Mostrar mensaje si no hay datos
                const fila = cuerpoTable.insertRow();
                const celda = fila.insertCell(0);
                celda.colSpan = 6;
                celda.className = 'text-center';
                celda.innerHTML = '<i class="fas fa-info-circle"></i> No hay instructores registrados';
            }
            
            // Inicializar DataTable si es necesario
            if (typeof $ !== 'undefined' && $.fn.DataTable) {
                if (dataTable) {
                    dataTable.destroy();
                }
                dataTable = $('#dataTableInforme').DataTable({
                    language: {
                        "sProcessing": "Procesando...",
                        "sLengthMenu": "Mostrar _MENU_ registros",
                        "sZeroRecords": "No se encontraron resultados",
                        "sEmptyTable": "Ningún dato disponible en esta tabla",
                        "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                        "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                        "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                        "sSearch": "Buscar:",
                        "oPaginate": {
                            "sFirst": "Primero",
                            "sLast": "Último",
                            "sNext": "Siguiente",
                            "sPrevious": "Anterior"
                        }
                    },
                    pageLength: 10,
                    order: [[0, 'desc']]
                });
            }
        }
        
    } catch (error) {
        console.error('Error al cargar instructores:', error);
    }
};