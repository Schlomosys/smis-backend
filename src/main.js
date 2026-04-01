import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './plugins/bootstrap'
import './plugins/chartjs'
import './assets/scss/main.scss'

import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)
if (authStore && authStore.initialize) {
  authStore.initialize()
}

app.mount('#app')
