<template>
  <router-view />

  <teleport to="body">
    <div class="app-toast-stack" aria-live="polite" aria-atomic="true">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="app-toast"
          :class="`app-toast--${toast.type}`"
          role="status"
        >
          <div class="app-toast__icon">
            <span v-if="toast.type === 'success'">✓</span>
            <span v-else-if="toast.type === 'error'">!</span>
            <span v-else-if="toast.type === 'warning'">•</span>
            <span v-else>i</span>
          </div>

          <div class="app-toast__content">
            <p v-if="toast.title" class="app-toast__title">{{ toast.title }}</p>
            <p class="app-toast__message">{{ toast.message }}</p>
          </div>

          <button
            type="button"
            class="app-toast__close"
            aria-label="Dismiss notification"
            @click="removeToast(toast.id)"
          >
            ×
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>
