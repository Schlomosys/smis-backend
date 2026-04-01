<template>
  <app-form-field
    :model-value="normalizedValue"
    type="select"
    :label="label"
    :required="required"
    :disabled="disabled || loading"
    :error="error"
    :help="loading ? loadingText : help"
    input-class="form-select"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #options>
      <option value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="getOptionValue(option)"
        :value="String(getOptionValue(option))"
      >
        {{ getOptionLabel(option) }}
      </option>
    </template>
  </app-form-field>
</template>

<script setup>
import { computed } from 'vue'
import AppFormField from '@/components/ui/AppFormField.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Selectionner une option',
  },
  help: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: 'Chargement...',
  },
  options: {
    type: Array,
    default: () => [],
  },
  optionValue: {
    type: String,
    default: 'id',
  },
  optionLabel: {
    type: String,
    default: 'name',
  },
  optionLabelFn: {
    type: Function,
    default: null,
  },
})

defineEmits(['update:modelValue'])

const normalizedValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) return ''
  return String(props.modelValue)
})

function getOptionValue(option) {
  return option?.[props.optionValue] ?? option?.id ?? ''
}

function getOptionLabel(option) {
  if (props.optionLabelFn) {
    return props.optionLabelFn(option)
  }

  return option?.[props.optionLabel] ?? option?.name ?? ''
}
</script>
