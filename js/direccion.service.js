import { request } from './apiClient.js';

export const DireccionService = {

    create_direccion: (data) => {
        return request('/direccion/create',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    },

    get_direccion_by_id:(id) => {
        return request(`/direccion/${id}`)
    },

    get_direcciones_by_instructor:(id) =>{
    return request(`/direccion/${id}`)
    },

    update_direccion:(id) =>{
        return request (`/direccion/${id}`)
    },

    delete_direccion:(id) =>{
        return request (`/direccion/${id}`,{
            method: 'DELETE'
        })
    },
    get_all_direcciones:() =>{
        return request('/direccion/all')
    }

}