import http from './http.js'

class FamilyProfileService {
  async getAll(params = {}) {
    const response = await http.get('/family-profiles', { params })
    return response.data
  }

  async getById(id) {
    const response = await http.get(`/family-profiles/${id}`)
    return response.data
  }

  async create(data) {
    const response = await http.post('/family-profiles', data)
    return response.data
  }

  async update(id, data) {
    const response = await http.put(`/family-profiles/${id}`, data)
    return response.data
  }

  async delete(id) {
    const response = await http.delete(`/family-profiles/${id}`)
    return response.data
  }
}

export default new FamilyProfileService()
