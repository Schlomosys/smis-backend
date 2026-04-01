import { defineStore } from 'pinia'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false
  }),
  getters: {
    isLoggedIn: state => !!state.token,
    role: state => {
      if (!state.user) return null
      // Handle different role structures from API
      if (state.user.role) return state.user.role
      if (state.user.roles) {
        if (Array.isArray(state.user.roles)) {
          return state.user.roles[0]?.name || null
        }
        return state.user.roles.name || null
      }
      return null
    }
  },
  actions: {
    async login(credentials) {
      this.loading = true
      try {
        const { data } = await authService.login(credentials)
        this.token = data.token
        this.user = data.user
        localStorage.setItem('SMIS_TOKEN', this.token)
        localStorage.setItem('SMIS_USER', JSON.stringify(this.user))
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('SMIS_TOKEN')
      localStorage.removeItem('SMIS_USER')
    },
    initialize() {
      const token = localStorage.getItem('SMIS_TOKEN')
      const userJson = localStorage.getItem('SMIS_USER')
      this.token = token || null
      this.user = userJson ? JSON.parse(userJson) : null
    }
  }
})
