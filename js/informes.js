import { ContratoService } from "./contrato.service.js";


export async function initInforme() {
     console.log('🚀 Iniciando generación de informe...');
    
    // Aquí debes obtener el ID de contrato de donde corresponda
    // Por ejemplo, de la URL, de un estado, etc.
    const idContrato = 1; // 🔴 CAMBIA ESTO POR EL ID REAL
    
    console.log('📋 ID de contrato:', idContrato);
    
    if (!idContrato) {
        console.error('❌ No se encontró ID de contrato');
        return;
    }
    
    try {
        const resultado = await ContratoService.generar_informe_contrato(idContrato);
        console.log('✅ Resultado:', resultado);
        
        if (resultado.success) {
            console.log('📄 Informe generado y descargado correctamente');
        }
        
    } catch (error) {
        console.error('❌ Error al generar informe:', error);
        alert(`Error: ${error.message}`);
    }
};

// Si quieres ejecutarlo automáticamente
// initInforme();
