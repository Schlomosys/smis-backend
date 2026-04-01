import http from './http'

export default {
  getStatistics() {
    return http.get('/dashboard/statistics')
  },

  getRecentBeneficiaries() {
    return http.get('/dashboard/recent-beneficiaries')
  },

  getRecentSupports() {
    return http.get('/dashboard/recent-supports')
  },
}
