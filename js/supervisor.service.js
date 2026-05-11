import { request } from './apiClient.js';

export const SupervisorService = {

  create_supervisor: (data) => {
    return request('/supervisor/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  get_supervisor_by_id: (email) => {
    return request(`/instructores/email/${email}`);
  },

  get_user_by_id: (id) => {
    return request(`/supervisor/${id}`);
  },


  update_supervisor: (id, data) => {
    return request(`/supervisor/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  get_all_supervisores: () => {
    return request(`/supervisor/`)
  }

}

