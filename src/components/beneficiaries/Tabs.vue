<template>
  <div class="tabs-shell">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="tab-button"
      :class="{ 'tab-button--active': modelValue === tab.value }"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.tabs-shell {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  padding: 0.5rem;
  border-radius: 1.25rem;
  background: #e6f3fb;
}

.tab-button {
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: #567184;
  padding: 0.8rem 1rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #02334d;
  background: #ffffff;
}

.tab-button--active {
  border-color: rgba(255, 105, 0, 0.14);
  background: #ffffff;
  color: #ff6900;
  box-shadow: 0 10px 24px rgba(4, 84, 128, 0.12);
}
</style>
