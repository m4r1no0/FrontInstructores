import { request } from './apiClient.js';

export const InstructorService = {

  create_instructor: (data) => {
    return request('/instructores/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  get_user_by_email: (email) => {
    return request(`/instructores/email/${email}`);
  },

  get_user_by_id: (id) => {
    return request(`/instructores/${id}`);
  },

  get_instructor_with_contactos: (id) => {
    return request(`/instructores/${id}/contactos`);
  },

  get_instructores_by_supervisor: (id) => {
    return request(`/instructores/supervisor/${id}`);
  },

  update_user_by_id: (id, data) => {
    return request(`/instructores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  get_all_instructores_paginated: (page = 1, size = 10) => {
    return request(`/instructores?page=${page}&size=${size}`)
  }

}

