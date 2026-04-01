<template>
  <div
    :class="[
      'user-avatar',
      sizeClass,
      { 'd-inline-flex': !block }
    ]"
    :style="{ background: photoUrl ? 'transparent' : gradient }"
  >
    <img
      v-if="photoUrl"
      :src="photoUrl"
      :alt="`${firstName} ${lastName}`"
      class="avatar-image"
    />
    <span
      v-else
      class="avatar-initials"
    >
      {{ initials }}
    </span>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UserAvatar',
  props: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    photoUrl: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    block: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    initials() {
      return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase()
    },
    sizeClass() {
      return `avatar-${this.size}`
    },
    gradient() {
      const hash = this.firstName.length + this.lastName.length
      const colors = [
        'linear-gradient(135deg, #045480 0%, #006fb8 100%)',
        'linear-gradient(135deg, #02334d 0%, #045480 100%)',
        'linear-gradient(135deg, #006fb8 0%, #4da3d9 100%)',
        'linear-gradient(135deg, #045480 0%, #ff6900 100%)'
      ]
      return colors[hash % colors.length]
    }
  }
})
</script>

<style scoped>
.user-avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  overflow: hidden;
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 24px rgba(2, 51, 77, 0.18);
}

.avatar-xs {
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 0.875rem;
}

.avatar-md {
  width: 48px;
  height: 48px;
  font-size: 1rem;
}

.avatar-lg {
  width: 64px;
  height: 64px;
  font-size: 1.25rem;
}

.avatar-xl {
  width: 80px;
  height: 80px;
  font-size: 1.5rem;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-initials {
  letter-spacing: 0.08em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
}
</style>
