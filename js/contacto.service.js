import { request } from './apiClient.js';

export const ContactoService = {

    create_contacto: (data) => {
        return request('/contacto/create',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    },

    get_contacto_by_id:(id) => {
        return request(`/contacto/${id}`)
    },

    get_contactos_by_instructor:(id) =>{
    return request(`/contacto/${id}`)
    },

    update_contacto:(id) =>{
        return request (`/contacto/${id}`)
    },

    delete_contacto:(id) =>{
        return request (`/contacto/${id}`,{
            method: 'DELETE'
        })
    },
    get_all_contactos:() =>{
        return request('/contacto/all')
    }

}