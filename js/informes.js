// informes.js
import { ContratoService } from './contrato.service.js';

export const initInforme = () => {
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

// Ejecutar cuando el DOM esté listo
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initInforme);
// } else {
//     initInforme();
// }