import { request } from './apiClient.js';

export const AreaFormacionService = {

    create_area_formacion: (data) => {
        return request('/area_formacion/create',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    },

    get_area_formacion_by_id:(id) => {
        return request(`/area_formacion/${id}`)
    },

    get_all_areas:() =>{
    return request(`/area_formacion/all`)
    },

    update_area_formacion:(id) =>{
        return request (`/area_formacion/${id}`)
    },

    delete_area_formacion:(id) =>{
        return request (`/area_formacion/${id}`,{
            method: 'DELETE'
        })
    },
    get_all_direcciones:() =>{
        return request('/direccion/all')
    }

}