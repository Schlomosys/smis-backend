<template>
  <header class="app-navbar">
    <div class="app-navbar__inner">
      <div class="app-navbar__left">
        <button type="button" class="app-navbar__menu" @click="$emit('toggle-sidebar')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <div>
          <p class="app-navbar__eyebrow">SMIS DEDRAS</p>
          <h1 class="app-navbar__title">{{ pageTitle }}</h1>
        </div>
      </div>

      <div class="app-navbar__right">
        <button type="button" class="app-navbar__icon-button" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
            <path d="M10 17a2 2 0 0 0 4 0" />
          </svg>
        </button>

        <div class="app-navbar__user">
          <UserAvatar
            :first-name="firstName"
            :last-name="lastName"
            :photo-url="userPhoto"
            size="sm"
          />
          <div class="app-navbar__user-copy">
            <strong>{{ userName }}</strong>
            <span>{{ roleLabel }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UserAvatar from '@/components/shared/UserAvatar.vue'
import { useAuthStore } from '@/stores/auth'

defineEmits(['toggle-sidebar'])

const route = useRoute()
const authStore = useAuthStore()

const pageTitle = computed(() => route.meta?.title || 'Administration')
const user = computed(() => authStore.user || {})
const firstName = computed(() => user.value.first_name || user.value.firstName || 'SMIS')
const lastName = computed(() => user.value.last_name || user.value.lastName || 'User')
const userName = computed(() => {
  const parts = [firstName.value, lastName.value].filter(Boolean)
  return parts.join(' ') || 'SMIS User'
})
const userPhoto = computed(
  () => user.value.photo_url || user.value.avatar_url || user.value.photo || '',
)
const roleLabel = computed(() => authStore.role || 'Administrator')
</script>
