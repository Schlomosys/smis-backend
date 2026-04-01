import http from './http.js'

class CountryService {
  // CRUD Operations
  async getAll(params = {}) {
    const response = await http.get('/countries', { params })
    return response.data
  }

  async getById(id) {
    const response = await http.get(`/countries/${id}`)
    return response.data
  }

  async create(data) {
    const response = await http.post('/countries', data)
    return response.data
  }

  async update(id, data) {
    const response = await http.put(`/countries/${id}`, data)
    return response.data
  }

  async delete(id) {
    const response = await http.delete(`/countries/${id}`)
    return response.data
  }
}

export default new CountryService()