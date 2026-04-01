import http from './http.js'

class CommuneService {
  async getAll(params = {}) {
    const response = await http.get('/communes', { params })
    return response.data
  }

  async getById(id) {
    const response = await http.get(`/communes/${id}`)
    return response.data
  }

  async create(data) {
    const response = await http.post('/communes', data)
    return response.data
  }

  async update(id, data) {
    const response = await http.put(`/communes/${id}`, data)
    return response.data
  }

  async delete(id) {
    const response = await http.delete(`/communes/${id}`)
    return response.data
  }
}

export default new CommuneService()
