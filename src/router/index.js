import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guards'
import authRoutes from './routes/auth.routes'
import adminRoutes from './routes/admin.routes'
import alumniRoutes from './routes/alumni.routes'
import socialRoutes from './routes/social.routes'

const routes = [
  ...authRoutes,
  ...adminRoutes,
  ...alumniRoutes,
  ...socialRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

setupGuards(router)

export default router
