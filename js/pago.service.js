import { request } from './apiClient.js';

export const PagoService = {
    // =====================================
    // CREAR PAGO
    // =====================================
    create_pago: (data) => {
        return request('/pagos/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    },

    // =====================================
    // OBTENER PAGO POR ID
    // =====================================
    get_pago_by_id: (id) => {
        return request(`/pagos/${id}`);
    },

    // =====================================
    // OBTENER PAGOS POR CONTRATO
    // =====================================
    get_pagos_by_contrato: (id_contrato) => {
        return request(`/pagos/contrato/${id_contrato}`);
    },

    // =====================================
    // OBTENER PAGOS POR INSTRUCTOR
    // =====================================
    get_pagos_by_instructor: (id_instructor) => {
        return request(`/pagos/instructor/${id_instructor}`);
    },

    // =====================================
    // OBTENER TODOS LOS PAGOS
    // =====================================
    get_all_pagos: () => {
        return request('/pago/all');
    },

    // =====================================
    // ACTUALIZAR PAGO
    // =====================================
    update_pago: (id, data) => {
        return request(`/pagos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    },

    // =====================================
    // ELIMINAR PAGO
    // =====================================
    delete_pago: (id) => {
        return request(`/pagos/${id}`, {
            method: 'DELETE'
        });
    },

    // =====================================
    // REPORTES
    // =====================================
    get_resumen_instructores: () => {
        return request('/pagos/reportes/resumen-instructores');
    },

    get_saldos_pendientes: () => {
        return request('/pagos/reportes/saldos-pendientes');
    }
};