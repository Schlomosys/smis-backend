<template>
  <app-modal
    v-if="show"
    :title="modalTitle"
    size="lg"
    centered
    @close="handleClose"
  >
    <div v-if="formError" class="alert alert-danger mb-3" role="alert">
      {{ formError }}
    </div>

    <form @submit.prevent="handleSubmit">
      <app-form-field
        v-model="form.name"
        label="Nom"
        placeholder="Nom du type d'appui"
        :error="errors.name"
        :required="true"
      />

      <app-form-field
        v-model="form.description"
        type="textarea"
        label="Description"
        placeholder="Description du type d'appui"
        :error="errors.description"
        :rows="4"
        wrapper-class="mb-0"
      />
    </form>

    <template #footer>
      <button type="button" class="btn btn-secondary" :disabled="saving" @click="handleClose">
        Annuler
      </button>
      <button type="button" class="btn btn-primary" :disabled="saving" @click="handleSubmit">
        <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
        {{ submitLabel }}
      </button>
    </template>
  </app-modal>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import AppFormField from '@/components/ui/AppFormField.vue'
import AppModal from '@/components/ui/AppModal.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  supportType: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  formError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'submit'])

const form = reactive({
  name: '',
  description: '',
})

const errors = reactive({})

const isEditing = computed(() => Boolean(props.supportType?.id))
const modalTitle = computed(() =>
  isEditing.value ? "Modifier le type d'appui" : "Nouveau type d'appui",
)
const submitLabel = computed(() => (isEditing.value ? 'Mettre a jour' : 'Creer'))

watch(
  () => [props.show, props.supportType],
  () => {
    if (!props.show) return
    resetForm()
  },
  { immediate: true },
)

function resetValidation() {
  Object.keys(errors).forEach((key) => {
    delete errors[key]
  })
}

function resetForm() {
  resetValidation()
  form.name = props.supportType?.name || ''
  form.description = props.supportType?.description || ''
}

function validateForm() {
  resetValidation()

  if (!form.name.trim()) {
    errors.name = 'Le nom est requis.'
  }

  return Object.keys(errors).length === 0
}

function buildPayload() {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
  }
}

function handleSubmit() {
  if (!validateForm()) return

  emit('submit', {
    id: props.supportType?.id || null,
    payload: buildPayload(),
  })
}

function handleClose() {
  resetForm()
  emit('close')
}
</script>
