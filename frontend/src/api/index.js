import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Token ${token}`
  return cfg
})

export const auth = {
  login:    (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  me:       ()     => api.get('/auth/me/'),
  logout:   ()     => api.post('/auth/logout/'),
}

export const updates = {
  list:       (params) => api.get('/updates/', { params }),
  create:     (data)   => api.post('/updates/', data),
  update:     (id, data) => api.put(`/updates/${id}/`, data),
  delete:     (id)     => api.delete(`/updates/${id}/`),
  toggleDone: (id)     => api.post(`/updates/${id}/done/`),
}

export const notes = {
  list:          (params) => api.get('/notes/', { params }),
  create:        (formData) => api.post('/notes/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete:        (id) => api.delete(`/notes/${id}/delete/`),
  toggleHelpful: (id) => api.post(`/notes/${id}/helpful/`),
}

export default api