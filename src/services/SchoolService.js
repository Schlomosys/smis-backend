import http from './http.js'

class SchoolService {
  async getAll(params = {}) {
    const response = await http.get('/schools', { params })
    return response.data
  }

  async getById(id) {
    const response = await http.get(`/schools/${id}`)
    return response.data
  }

  async create(data) {
    const response = await http.post('/schools', data)
    return response.data
  }

  async update(id, data) {
    const response = await http.put(`/schools/${id}`, data)
    return response.data
  }

  async delete(id) {
    const response = await http.delete(`/schools/${id}`)
    return response.data
  }
}

export default new SchoolService()
