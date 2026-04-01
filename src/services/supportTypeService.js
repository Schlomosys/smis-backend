import http from './http.js'

class SupportTypeService {
  async getAll(params = {}) {
    const response = await http.get('/support-types', { params })
    return response.data
  }

  async getById(id) {
    const response = await http.get(`/support-types/${id}`)
    return response.data
  }

  async create(data) {
    const response = await http.post('/support-types', data)
    return response.data
  }

  async update(id, data) {
    const response = await http.put(`/support-types/${id}`, data)
    return response.data
  }

  async delete(id) {
    const response = await http.delete(`/support-types/${id}`)
    return response.data
  }

  async getDropdownList(params = {}) {
    const response = await http.get('/support-types-list', { params })
    return response.data
  }
}

export default new SupportTypeService()
