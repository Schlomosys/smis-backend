import http from './http.js'

class ReportService {
  async beneficiariesByCommune() {
    const response = await http.get('/reports/beneficiaries/by-commune')
    return response.data
  }

  async beneficiariesBySchool() {
    const response = await http.get('/reports/beneficiaries/by-school')
    return response.data
  }
}

export default new ReportService()
