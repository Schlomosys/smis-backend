<template>
  <div class="admin-layout">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="admin-layout__content">
      <AppNavbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="admin-layout__main">
        <div class="admin-layout__container">
          <router-view />
        </div>
      </main>

      <AppFooter />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'

const route = useRoute()
const sidebarOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
  },
)
</script>
