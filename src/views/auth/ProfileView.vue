<template>
  <div>
    <h1>Profil</h1>
    <pre>{{ user }}</pre>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const user = computed(() => auth.user)
</script>