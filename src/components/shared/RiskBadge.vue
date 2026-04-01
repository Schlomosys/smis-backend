<template>
  <span :class="['risk-badge', `risk-badge--${level}`]">
    <span class="risk-badge__dot"></span>
    {{ label }}
  </span>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RiskBadge',
  props: {
    level: {
      type: String,
      required: true,
      validator: (value) => ['low', 'medium', 'high'].includes(value),
    },
  },
  computed: {
    label() {
      switch (this.level) {
        case 'low':
          return 'Faible'
        case 'medium':
          return 'Moyen'
        case 'high':
          return 'Eleve'
        default:
          return 'Inconnu'
      }
    },
  },
})
</script>

<style scoped>
.risk-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  font-size: 0.82rem;
  font-weight: 700;
}

.risk-badge__dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: currentColor;
}

.risk-badge--low {
  background: rgba(77, 163, 217, 0.14);
  color: #045480;
}

.risk-badge--medium {
  background: rgba(252, 185, 0, 0.18);
  color: #9a6c00;
}

.risk-badge--high {
  background: rgba(255, 105, 0, 0.16);
  color: #c25100;
}
</style>
