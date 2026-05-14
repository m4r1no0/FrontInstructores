import { request } from './apiClient.js';

export const ContratoService = {

    create_contrato: (data) => {
        return request('/contrato/create',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    },

    get_contrato_by_id:(id) => {
        return request(`/contrato/${id}`)
    },

    get_all_contratos:() =>{
    return request('/contrato')
    },

    get_contratos_by_instructor:() =>{
<<<<<<< HEAD
        return request (`/contrato/pagos/`)
=======
        return request ('/contrato/pagos')
>>>>>>> 1e07be78a3d1e1784ca46af8d5bb05c8d9c5bab7
    },

    delete_contrato:(id) =>{
        return request (`/contrato/${id}`,{
            method: 'DELETE'
        })
    },
    generar_informe_contrato: async (id) => {
        console.log('🔄 Generando informe para ID:', id);
        
        try {
            // Llamar directamente al endpoint
            const response = await fetch(`http://localhost:8000/informe/contrato/${id}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }
            
            // Obtener el blob
            const blob = await response.blob();
            
            // Crear URL y descargar
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Contrato_${id}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log('✅ Descarga completada');
            
            return { success: true };
            
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },
    get_contrato_instructor:() =>{
    return request('/contrato/instructores_contratos')
    },
    generar_acta_contrato: async (id) => {
        console.log('🔄 Generando acta para ID:', id);
        
        try {
            // Llamar directamente al endpoint
            const response = await fetch(`http://localhost:8000/contratoDos/${id}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }
            
            // Obtener el blob
            const blob = await response.blob();
            
            // Crear URL y descargar
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Contrato_acta_${id}.docx`;
            document.body.appendChild(link);    
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log('✅ Descarga completada');
            
            return { success: true };
            
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

}