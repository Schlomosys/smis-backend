import http from './http.js'

class RegionService {
  // CRUD Operations
  async getAll(params = {}) {
    const response = await http.get('/regions', { params })
    return response.data
  }

  async getById(id) {
    const response = await http.get(`/regions/${id}`)
    return response.data
  }

  async create(data) {
    const response = await http.post('/regions', data)
    return response.data
  }

  async update(id, data) {
    const response = await http.put(`/regions/${id}`, data)
    return response.data
  }

  async delete(id) {
    const response = await http.delete(`/regions/${id}`)
    return response.data
  }
}

export default new RegionService()