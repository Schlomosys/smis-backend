<template>
  <app-form-field
    :model-value="internalValue"
    type="select"
    :label="label"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled || supportTypeStore.loadingDropdown"
    :error="errorMessage"
    :help="helpText"
    input-class="form-select"
    @update:model-value="handleUpdate"
  >
    <template #options>
      <option value="">{{ placeholderOption }}</option>
      <option
        v-for="supportType in supportTypeStore.dropdownItems"
        :key="supportType.id"
        :value="String(supportType.id)"
      >
        {{ supportType.name }}
      </option>
    </template>
  </app-form-field>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AppFormField from '@/components/ui/AppFormField.vue'
import { useSupportTypeStore } from '@/stores/supportTypes.js'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: "Type d'appui",
  },
  placeholderOption: {
    type: String,
    default: 'Selectionner un type d appui',
  },
  placeholder: {
    type: String,
    default: '',
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
  autoLoad: {
    type: Boolean,
    default: true,
  },
  returnObject: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const supportTypeStore = useSupportTypeStore()

const internalValue = computed(() => {
  if (props.returnObject) {
    return props.modelValue?.id ? String(props.modelValue.id) : ''
  }

  return props.modelValue === null || props.modelValue === undefined
    ? ''
    : String(props.modelValue)
})

const errorMessage = computed(() => props.error || supportTypeStore.dropdownError || '')
const helpText = computed(() => {
  if (props.help) return props.help
  if (supportTypeStore.loadingDropdown) return 'Chargement des types d appui...'
  return ''
})

onMounted(async () => {
  if (!props.autoLoad || supportTypeStore.dropdownItems.length > 0) return

  try {
    await supportTypeStore.fetchDropdownList()
  } catch {
    // The store already exposes the error state to the field.
  }
})

function handleUpdate(value) {
  if (props.returnObject) {
    const selected = supportTypeStore.dropdownItems.find((item) => String(item.id) === String(value)) || null
    emit('update:modelValue', selected)
    return
  }

  emit('update:modelValue', value)
}
</script>
