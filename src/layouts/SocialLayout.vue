<template>
  <div>
    <AppNavbar />
    <div class="container mt-4"><router-view /></div>
    <AppFooter />
  </div>
</template>
<script setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>
