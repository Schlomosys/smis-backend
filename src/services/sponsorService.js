import http from './http.js'

class SponsorService {
  // CRUD Operations
  async getAll(params = {}) {
    const response = await http.get('/sponsors', { params })
    return response.data
  }

  async getById(id) {
    const response = await http.get(`/sponsors/${id}`)
    return response.data
  }

  async create(data) {
    const response = await http.post('/sponsors', data)
    return response.data
  }

  async update(id, data) {
    const response = await http.put(`/sponsors/${id}`, data)
    return response.data
  }

  async delete(id) {
    const response = await http.delete(`/sponsors/${id}`)
    return response.data
  }
}

export default new SponsorService()
