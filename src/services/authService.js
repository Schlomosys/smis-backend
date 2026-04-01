import http from './http'

export default {
  login(credentials) { return http.post('/auth/login', credentials) },
  logout() { return http.post('/auth/logout') },
  profile() { return http.get('/auth/profile') },
  register(data) { return http.post('/auth/register', data) }
}
