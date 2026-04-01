import http from './http.js'

class BeneficiaryService {
  isFormData(data) {
    return typeof FormData !== 'undefined' && data instanceof FormData
  }

  // CRUD Operations
  async getAll(params = {}) {
    const response = await http.get('/beneficiaries', { params })
    return response.data
  }

  async getById(id) {
    const response = await http.get(`/beneficiaries/${id}`)
    return response.data
  }

  async create(data) {
    const config = this.isFormData(data)
      ? {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      : {}

    const response = await http.post('/beneficiaries', data, config)
    return response.data
  }

  async update(id, data) {
    if (this.isFormData(data)) {
      data.append('_method', 'PUT')
      const response = await http.post(`/beneficiaries/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    }

    const response = await http.put(`/beneficiaries/${id}`, data)
    return response.data
  }

  async delete(id) {
    const response = await http.delete(`/beneficiaries/${id}`)
    return response.data
  }

  // Academic Records
  async getAcademicRecords(beneficiaryId) {
    const response = await http.get(`/beneficiaries/${beneficiaryId}/academic-records`)
    return response.data
  }

  async addAcademicRecord(beneficiaryId, data) {
    const response = await http.post(`/beneficiaries/${beneficiaryId}/academic-records`, data)
    return response.data
  }

  async updateAcademicRecord(beneficiaryId, recordId, data) {
    const response = await http.put(`/beneficiaries/${beneficiaryId}/academic-records/${recordId}`, data)
    return response.data
  }

  async deleteAcademicRecord(beneficiaryId, recordId) {
    const response = await http.delete(`/beneficiaries/${beneficiaryId}/academic-records/${recordId}`)
    return response.data
  }

  // Family Profile
  async getFamilyProfile(beneficiaryId) {
    const response = await http.get(`/beneficiaries/${beneficiaryId}/family-profile`)
    return response.data
  }

  async getFamilyHistory(beneficiaryId) {
    return this.getFamilyProfile(beneficiaryId)
  }

  async saveFamilyProfile(beneficiaryId, data) {
    const response = await http.post(`/beneficiaries/${beneficiaryId}/family-profile`, data)
    return response.data
  }

  async addFamilyHistory(beneficiaryId, data) {
    return this.saveFamilyProfile(beneficiaryId, data)
  }

  async updateFamilyProfile(beneficiaryId, data) {
    const response = await http.put(`/beneficiaries/${beneficiaryId}/family-profile`, data)
    return response.data
  }

  // Supports
  async getSupports(beneficiaryId) {
    const response = await http.get(`/beneficiaries/${beneficiaryId}/supports`)
    return response.data
  }

  async addSupport(beneficiaryId, data) {
    const response = await http.post(`/beneficiaries/${beneficiaryId}/supports`, data)
    return response.data
  }

  async updateSupport(beneficiaryId, supportId, data) {
    const response = await http.put(`/beneficiaries/${beneficiaryId}/supports/${supportId}`, data)
    return response.data
  }

  async deleteSupport(beneficiaryId, supportId) {
    const response = await http.delete(`/beneficiaries/${beneficiaryId}/supports/${supportId}`)
    return response.data
  }

  // Sponsorships
  async getSponsorships(beneficiaryId) {
    const response = await http.get(`/beneficiaries/${beneficiaryId}/sponsorships`)
    return response.data
  }

  async addSponsorship(beneficiaryId, data) {
    const response = await http.post(`/beneficiaries/${beneficiaryId}/sponsorships`, data)
    return response.data
  }

  async updateSponsorship(beneficiaryId, sponsorshipId, data) {
    const response = await http.put(`/beneficiaries/${beneficiaryId}/sponsorships/${sponsorshipId}`, data)
    return response.data
  }

  async deleteSponsorship(beneficiaryId, sponsorshipId) {
    const response = await http.delete(`/beneficiaries/${beneficiaryId}/sponsorships/${sponsorshipId}`)
    return response.data
  }

  // Documents
  async getDocuments(beneficiaryId) {
    const response = await http.get(`/beneficiaries/${beneficiaryId}/documents`)
    return response.data
  }

  async uploadDocument(beneficiaryId, formData) {
    const response = await http.post(`/beneficiaries/${beneficiaryId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  async deleteDocument(beneficiaryId, documentId) {
    const response = await http.delete(`/beneficiaries/${beneficiaryId}/documents/${documentId}`)
    return response.data
  }

  // Reference Data
  async getReferenceData() {
    const response = await http.get('/beneficiaries/reference-data')
    return response.data
  }

  // Statistics
  async getStatistics(params = {}) {
    const response = await http.get('/beneficiaries/statistics', { params })
    return response.data
  }

  // Export
  async export(params = {}) {
    const response = await http.get('/beneficiaries/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  // Bulk Operations
  async bulkUpdate(data) {
    const response = await http.post('/beneficiaries/bulk-update', data)
    return response.data
  }

  async bulkDelete(ids) {
    const response = await http.post('/beneficiaries/bulk-delete', { ids })
    return response.data
  }

  // Search
  async search(query, params = {}) {
    const response = await http.get('/beneficiaries/search', {
      params: { q: query, ...params }
    })
    return response.data
  }

  // Risk Assessment
  async updateRiskLevel(beneficiaryId, riskLevel, notes = '') {
    const response = await http.put(`/beneficiaries/${beneficiaryId}/risk-level`, {
      risk_level: riskLevel,
      notes
    })
    return response.data
  }

  // Global Score
  async updateGlobalScore(beneficiaryId, score, notes = '') {
    const response = await http.put(`/beneficiaries/${beneficiaryId}/global-score`, {
      global_score: score,
      notes
    })
    return response.data
  }

  // Exit Management
  async exitBeneficiary(beneficiaryId, exitData) {
    const response = await http.post(`/beneficiaries/${beneficiaryId}/exit`, exitData)
    return response.data
  }

  async reactivateBeneficiary(beneficiaryId, data = {}) {
    const response = await http.post(`/beneficiaries/${beneficiaryId}/reactivate`, data)
    return response.data
  }
}

export default new BeneficiaryService()
