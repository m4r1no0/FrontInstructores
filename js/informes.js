// informes.js
import { ContratoService } from './contrato.service.js';
import { InstructorService } from './instructor.service.js';

let instructoresGlobal = [];
let dataTable = null;


const cargarInstructores = async () => {
    try {
        instructoresGlobal = await InstructorService.get_all_instructores_paginated();
        console.log(instructoresGlobal);
        
        const cuerpoTable = document.querySelector('.tablaInstrutoresInforme');
        console.log(cuerpoTable)
let datos = instructoresGlobal.data;

if (cuerpoTable) {
    // Limpiar tabla
    cuerpoTable.innerHTML = '';
    
    if (datos && datos.length > 0) {
        datos.forEach(item => {
            const fila = cuerpoTable.insertRow();
            
            // ID
            fila.insertCell(0).innerHTML = item.id_instructor || '-';
            
            // Documento
            fila.insertCell(1).innerHTML = `${item.tipo_documento || ''} ${item.numero_documento || '-'}`;
            
            // Nombres
            fila.insertCell(2).innerHTML = item.nombres || '-';
            
            // Apellidos
            fila.insertCell(3).innerHTML = item.apellidos || '-';
            
            // Teléfono
            fila.insertCell(4).innerHTML = item.telefono || '-';
            
            // Email
            fila.insertCell(5).innerHTML = item.email || '-';
            
            // Supervisor ID
            fila.insertCell(6).innerHTML = item.id_supervisor || '-';
            
            // Acciones
            fila.insertCell(7).innerHTML = `
                <button class="btn btn-primary btn-sm btn-generar-informe" 
                        data-id="${item.id_instructor}"
                        data-nombre="${item.nombres} ${item.apellidos}">
                    <i class="fas fa-file-word"></i> Generar Informe
                </button>
            `;
        });
    } else {
        // Mostrar mensaje si no hay datos
        const fila = cuerpoTable.insertRow();
        const celda = fila.insertCell(0);
        celda.colSpan = 8;
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



export const initInforme = () => {

    cargarInstructores();

    console.log('🚀 Inicializando página de informes...');
    
    // Seleccionar elementos
    const btnGenerar = document.querySelector('#btnGenerarInforme');
    const inputIdContrato = document.querySelector('#idContrato');
    
    // Verificar que los elementos existen
    if (!btnGenerar) {
        console.error('❌ Botón no encontrado');
        return;
    }
    
    if (!inputIdContrato) {
        console.error('❌ Input de ID no encontrado');
        return;
    }
    
    // Agregar evento click al botón
    btnGenerar.addEventListener('click', async function() {
        console.log('🖱️ Botón clickeado');
        
        // Obtener el valor del input
        const idContrato = inputIdContrato.value;
        
        console.log('📋 ID de contrato ingresado:', idContrato);
        
        // Validar que no esté vacío
        if (!idContrato) {
            console.error('❌ Por favor ingrese un ID de contrato');
            alert('Por favor ingrese un ID de contrato');
            return;
        }
        
        // Validar que sea un número
        const idNumerico = Number(idContrato);
        if (isNaN(idNumerico) || idNumerico <= 0) {
            console.error('❌ ID inválido:', idContrato);
            alert('Por favor ingrese un ID válido (número positivo)');
            return;
        }
        
        try {
            console.log('🔄 Generando informe para contrato ID:', idNumerico);

            
            // Mostrar indicador de carga (opcional)
            btnGenerar.disabled = true;
            btnGenerar.textContent = 'Generando...';
            
            // Llamar al servicio para generar y descargar el informe
            const resultado = await ContratoService.generar_informe_contrato(idNumerico);
            
            console.log('✅ Resultado:', resultado);
            
            if (resultado.success) {
                console.log('📄 Informe generado y descargado correctamente');
                alert('Informe generado correctamente');
                
                // Limpiar el input después de generar (opcional)
                inputIdContrato.value = '';
            }
            
        } catch (error) {
            console.error('❌ Error al generar informe:', error);
            alert(`Error al generar informe: ${error.message}`);
            
        } finally {
            // Restaurar botón
            btnGenerar.disabled = false;
            btnGenerar.textContent = 'Generar Informe';
        }
    });
    
    console.log('✅ Evento de descarga configurado correctamente');
};



