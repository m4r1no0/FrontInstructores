// apiClient.js
// Cliente HTTP para comunicación con el backend FastAPI

const API_BASE_URL = 'http://localhost:8000';

/**
 * Realiza peticiones HTTP al backend
 * @param {string} endpoint - Ruta del endpoint (ej: /informe/contrato/1)
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<any>} - Respuesta del servidor
 */
export const request = async (endpoint, options = {}) => {
    // Limpiar endpoint para evitar dobles slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${cleanEndpoint}`;
    
    // Log para debugging
    console.log('🌐 URL de petición:', url);
    console.log('📋 Método:', options.method || 'GET');
    
    // Headers base
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    // Agregar token de autenticación si existe
    const token = localStorage.getItem('access_token');
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    // Combinar headers
    const headers = {
        ...defaultHeaders,
        ...options.headers
    };
    
    try {
        // Realizar petición
        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        console.log('📡 Status:', response.status);
        console.log('📄 Content-Type:', response.headers.get('content-type'));
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (e) {
                // Si no es JSON, usar texto plano
                const textError = await response.text();
                if (textError) errorMessage = textError;
            }
            
            throw new Error(errorMessage);
        }
        
        // Determinar el tipo de contenido
        const contentType = response.headers.get('content-type');
        
        // ============================================
        // 1. DOCUMENTOS WORD (DOCX)
        // ============================================
        if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            console.log('📄 Recibiendo documento Word...');
            const blob = await response.blob();
            return { blob, response };
        }
        
        // ============================================
        // 2. OTROS ARCHIVOS BINARIOS
        // ============================================
        if (options.responseType === 'blob' || 
            (contentType && (contentType.includes('application/octet-stream') || 
             contentType.includes('application/msword') ||
             contentType.includes('application/pdf')))) {
            console.log('📄 Recibiendo archivo binario...');
            const blob = await response.blob();
            return { blob, response };
        }
        
        // ============================================
        // 3. RESPUESTAS JSON
        // ============================================
        if (contentType && contentType.includes('application/json')) {
            console.log('📦 Recibiendo JSON...');
            return await response.json();
        }
        
        // ============================================
        // 4. TEXTO PLANO
        // ============================================
        console.log('📝 Recibiendo texto plano...');
        return await response.text();
        
    } catch (error) {
        console.error('❌ Error en petición:', error);
        throw error;
    }
};

// ============================================
// SERVICIO DE INFORMES
// ============================================
export const informeService = {
    /**
     * Genera informe de contrato (obtiene el blob)
     * @param {number} id - ID del contrato
     * @returns {Promise<Object>} - Objeto con blob y response
     */
    async generarInformeContrato(id) {
        if (!id) {
            throw new Error('ID de contrato no proporcionado');
        }
        
        console.log('📄 Solicitando informe para contrato:', id);
        
        return await request(`/informe/contrato/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }
        });
    },
    
    /**
     * Genera y descarga automáticamente el informe de contrato
     * @param {number} id - ID del contrato
     * @returns {Promise<boolean>} - True si se descargó correctamente
     */
    async descargarInformeContrato(id) {
        try {
            console.log('🚀 Iniciando descarga para contrato:', id);
            
            // Obtener el blob del documento
            const { blob, response } = await this.generarInformeContrato(id);
            
            console.log('📦 Blob recibido:', {
                size: blob.size,
                type: blob.type
            });
            
            // Verificar que el blob no esté vacío
            if (blob.size === 0) {
                throw new Error('El documento generado está vacío');
            }
            
            // Extraer nombre del archivo del header Content-Disposition
            let filename = `Contrato_${id}.docx`;
            const contentDisposition = response.headers.get('content-disposition');
            
            if (contentDisposition) {
                // Buscar filename en el header
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    filename = match[1].replace(/['"]/g, '');
                    console.log('📄 Nombre del archivo:', filename);
                }
            }
            
            // Crear URL para el blob
            const url = window.URL.createObjectURL(blob);
            
            // Crear link de descarga
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            
            // Disparar la descarga
            console.log('⬇️ Iniciando descarga...');
            link.click();
            
            // Limpiar
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log('✅ Documento descargado correctamente:', filename);
            return true;
            
        } catch (error) {
            console.error('❌ Error al descargar informe:', error);
            throw error;
        }
    }
};

// ============================================
// SERVICIO GENÉRICO PARA DESCARGA DE ARCHIVOS
// ============================================
export const downloadService = {
    /**
     * Descarga cualquier archivo desde un endpoint
     * @param {string} endpoint - Endpoint del archivo
     * @param {string} filename - Nombre sugerido para el archivo
     * @returns {Promise<boolean>}
     */
    async downloadFile(endpoint, filename = null) {
        try {
            const result = await request(endpoint, {
                method: 'GET',
                responseType: 'blob'
            });
            
            // Si request devuelve un blob directamente (sin wrapper)
            let blob, response;
            if (result.blob) {
                blob = result.blob;
                response = result.response;
            } else {
                blob = result;
                response = null;
            }
            
            let finalFilename = filename;
            if (!finalFilename && response) {
                const contentDisposition = response.headers.get('content-disposition');
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (match && match[1]) {
                        finalFilename = match[1].replace(/['"]/g, '');
                    }
                }
            }
            
            if (!finalFilename) {
                finalFilename = 'documento';
            }
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = finalFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log('✅ Archivo descargado:', finalFilename);
            return true;
            
        } catch (error) {
            console.error('❌ Error al descargar archivo:', error);
            throw error;
        }
    }
};

// ============================================
// SERVICIO DE CONTRATOS (si lo necesitas aquí)
// ============================================
export const contratoAPI = {
    /**
     * Obtener todos los contratos
     */
    async getAll() {
        return await request('/contrato/', {
            method: 'GET'
        });
    },
    
    /**
     * Obtener contrato por ID
     */
    async getById(id) {
        return await request(`/contrato/${id}`, {
            method: 'GET'
        });
    },
    
    /**
     * Crear nuevo contrato
     */
    async create(data) {
        return await request('/contrato/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    /**
     * Actualizar contrato
     */
    async update(id, data) {
        return await request(`/contrato/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    /**
     * Eliminar contrato
     */
    async delete(id) {
        return await request(`/contrato/${id}`, {
            method: 'DELETE'
        });
    }
};

// Exportar todo como objeto por defecto
export default {
    request,
    informeService,
    downloadService,
    contratoAPI
};