<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
    class="field-input"
  >
    <option value="">Sélectionner une année académique</option>
    <option v-for="year in years" :key="year" :value="year">
      {{ year }}
    </option>
  </select>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const list = []
  // Generate options from currentYear - 6 to currentYear + 2
  // When currentYear is 2026, this generates: 2020 to 2028, i.e., 2020-2021 to 2027-2028.
  for (let y = currentYear - 6; y <= currentYear + 2; y++) {
    list.push(`${y}-${y + 1}`)
  }
  return list
})

const currentAcademicYear = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-indexed (Jan is 1, June is 6, Sept is 9)
  if (month >= 9) {
    return `${year}-${year + 1}`
  } else {
    return `${year - 1}-${year}`
  }
})

onMounted(() => {
  if (!props.modelValue) {
    emit('update:modelValue', currentAcademicYear.value)
  }
})
</script>
