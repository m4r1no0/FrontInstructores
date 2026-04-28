import { request } from './apiClient.js';

export const PolizaService = {
    // =====================================
    // CREAR PÓLIZA
    // =====================================
    create_poliza: (data) => {
        return request('/polizas/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    },

    // =====================================
    // OBTENER PÓLIZA POR ID
    // =====================================
    get_poliza_by_id: (id) => {
        return request(`/polizas/${id}`);
    },

    // =====================================
    // OBTENER PÓLIZAS POR INSTRUCTOR
    // =====================================
    get_polizas_by_instructor: (id_instructor) => {
        return request(`/polizas/instructor/${id_instructor}`);
    },

    // =====================================
    // OBTENER TODAS LAS PÓLIZAS
    // =====================================
    get_all_polizas: () => {
        return request('/poliza/');
    },

    // =====================================
    // OBTENER PÓLIZAS PRÓXIMAS A VENCER
    // =====================================
    get_polizas_por_vencer: (dias = 30) => {
        return request(`/polizas/por-vencer?dias=${dias}`);
    },

    // =====================================
    // ACTUALIZAR PÓLIZA
    // =====================================
    update_poliza: (id, data) => {
        return request(`/polizas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    },

    // =====================================
    // ELIMINAR PÓLIZA
    // =====================================
    delete_poliza: (id) => {
        return request(`/polizas/${id}`, {
            method: 'DELETE'
        });
    }
};