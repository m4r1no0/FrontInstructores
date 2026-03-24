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

    get_contratos_by_instructor:(id) =>{
        return request (`/contrato/instructor/${id}`)
    },

    delete_contrato:(id) =>{
        return request (`/contrato/${id}`,{
            method: 'DELETE'
        })
    }

}