import { useAuthStore } from '@/stores/auth'

export function setupGuards(router) {
  router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    // Allow public routes
    if (to.meta.public) return next()

    // Not logged in: redirect to login
    if (!auth.isLoggedIn) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    // Role mismatch: redirect to appropriate dashboard
    if (to.meta.role && auth.role !== to.meta.role) {
      if (auth.role === 'admin') {
        return next({ name: 'admin-dashboard' })
      } else if (auth.role === 'alumni') {
        return next({ name: 'alumni-dashboard' })
      } else {
        // Unknown role: logout and redirect to login
        auth.logout()
        return next({ name: 'login' })
      }
    }

    next()
  })
}
