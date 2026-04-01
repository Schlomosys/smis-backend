<template>
  <app-modal
    v-if="show"
    :title="modalTitle"
    size="xl"
    centered
    scrollable
    @close="handleClose"
  >
    <div v-if="formError" class="alert alert-danger mb-3" role="alert">
      {{ formError }}
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="row g-3">
        <div class="col-md-6">
          <app-form-field
            v-model="form.unique_code"
            label="Numero d'inscription"
            placeholder="Numero d'inscription"
            :error="errors.unique_code"
            :required="true"
          />
        </div>
        <div class="col-md-6">
          <app-form-field
            v-model="form.first_name"
            label="Prenom"
            placeholder="Prenom"
            :error="errors.first_name"
            :required="true"
          />
        </div>
        <div class="col-md-6">
          <app-form-field
            v-model="form.last_name"
            label="Nom"
            placeholder="Nom"
            :error="errors.last_name"
            :required="true"
          />
        </div>
        <div class="col-md-6">
          <app-form-field
            v-model="form.type"
            type="select"
            label="Type"
            input-class="form-select"
            :error="errors.type"
            :required="true"
          >
            <template #options>
              <option value="">Selectionner un type</option>
              <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </template>
          </app-form-field>
        </div>
        <div class="col-md-6">
          <app-form-field
            v-model="form.risk_level"
            type="select"
            label="Niveau de risque"
            input-class="form-select"
            :error="errors.risk_level"
            :required="true"
          >
            <template #options>
              <option value="">Selectionner un niveau</option>
              <option v-for="option in riskOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </template>
          </app-form-field>
        </div>
        <div class="col-md-6">
          <beneficiary-reference-select
            v-model="form.commune_id"
            label="Commune"
            placeholder="Selectionner une commune"
            :options="communes"
            :error="errors.commune_id"
            :required="true"
          />
        </div>
        <div class="col-md-6">
          <beneficiary-reference-select
            v-model="form.school_id"
            label="Ecole"
            :placeholder="form.commune_id ? 'Selectionner une ecole' : 'Selectionner une commune d abord'"
            :options="availableSchools"
            :error="errors.school_id"
            :required="true"
            :disabled="!form.commune_id"
            :help="form.commune_id && availableSchools.length === 0 ? 'Aucune ecole disponible pour cette commune.' : ''"
          />
        </div>
        <div class="col-md-6">
          <beneficiary-reference-select
            v-model="form.family_profile_id"
            label="Famille"
            placeholder="Selectionner une famille"
            :options="families"
            :option-label-fn="getFamilyLabel"
            :error="errors.family_profile_id"
          />
        </div>
        <div class="col-md-6">
          <beneficiary-reference-select
            v-model="form.sponsor_id"
            label="Sponsor"
            placeholder="Selectionner un sponsor"
            :options="sponsors"
            :option-label-fn="getSponsorLabel"
            :error="errors.sponsor_id"
            :disabled="isEditing"
            :help="isEditing ? 'Le sponsor n est utilise qu a la creation.' : ''"
          />
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn btn-secondary" :disabled="saving" @click="handleClose">
        Annuler
      </button>
      <button type="button" class="btn btn-primary" :disabled="saving" @click="handleSubmit">
        <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
        {{ isEditing ? 'Mettre a jour' : 'Creer le beneficiaire' }}
      </button>
    </template>
  </app-modal>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import BeneficiaryReferenceSelect from '@/components/beneficiaries/BeneficiaryReferenceSelect.vue'
import AppFormField from '@/components/ui/AppFormField.vue'
import AppModal from '@/components/ui/AppModal.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  beneficiary: { type: Object, default: null },
  referenceData: { type: Object, default: () => ({}) },
  saving: { type: Boolean, default: false },
  formError: { type: String, default: '' },
})

const emit = defineEmits(['close', 'submit'])

const form = reactive({
  unique_code: '',
  first_name: '',
  last_name: '',
  type: '',
  risk_level: '',
  commune_id: '',
  school_id: '',
  family_profile_id: '',
  sponsor_id: '',
})

const errors = reactive({})

const typeOptions = [
  { value: 'active', label: 'Active' },
  { value: 'alumni', label: 'Alumni' },
]

const riskOptions = [
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyen' },
  { value: 'high', label: 'Eleve' },
]

const isEditing = computed(() => Boolean(props.beneficiary?.id))
const modalTitle = computed(() => (isEditing.value ? 'Modifier le beneficiaire' : 'Nouveau beneficiaire'))
const communes = computed(() => normalizeList(props.referenceData.communes))
const schools = computed(() => normalizeList(props.referenceData.schools))
const sponsors = computed(() => normalizeList(props.referenceData.sponsors))
const families = computed(() =>
  normalizeList(props.referenceData.families || props.referenceData.family_profiles || props.referenceData.familyProfiles),
)

const availableSchools = computed(() => {
  if (!form.commune_id) return []

  return schools.value.filter((school) => {
    if (school.commune_id === undefined || school.commune_id === null) return true
    return String(school.commune_id) === String(form.commune_id)
  })
})

watch(
  () => [props.show, props.beneficiary],
  () => {
    if (!props.show) return
    populateForm()
  },
  { immediate: true },
)

watch(
  () => form.commune_id,
  () => {
    if (!form.school_id) return
    const stillExists = availableSchools.value.some((school) => String(school.id) === String(form.school_id))
    if (!stillExists) {
      form.school_id = ''
    }
  },
)

function normalizeList(value) {
  return Array.isArray(value) ? value : []
}

function resetErrors() {
  Object.keys(errors).forEach((key) => delete errors[key])
}

function populateForm() {
  resetErrors()
  form.unique_code = props.beneficiary?.unique_code || ''
  form.first_name = props.beneficiary?.first_name || ''
  form.last_name = props.beneficiary?.last_name || ''
  form.type = props.beneficiary?.type || ''
  form.risk_level = props.beneficiary?.risk_level || ''
  form.commune_id = props.beneficiary?.commune_id ? String(props.beneficiary.commune_id) : ''
  form.school_id = props.beneficiary?.school_id ? String(props.beneficiary.school_id) : ''
  form.family_profile_id = props.beneficiary?.family_profile_id ? String(props.beneficiary.family_profile_id) : ''
  form.sponsor_id = props.beneficiary?.sponsor_id ? String(props.beneficiary.sponsor_id) : ''
}

function getFamilyLabel(option) {
  return option?.guardian_name || option?.family_name || `Famille #${option?.id || ''}`
}

function getSponsorLabel(option) {
  return option?.name || option?.email || `Sponsor #${option?.id || ''}`
}

function validateForm() {
  resetErrors()
  if (!form.unique_code.trim()) errors.unique_code = "Le numero d'inscription est requis."
  if (!form.first_name.trim()) errors.first_name = 'Le prenom est requis.'
  if (!form.last_name.trim()) errors.last_name = 'Le nom est requis.'
  if (!form.type) errors.type = 'Le type est requis.'
  if (!form.risk_level) errors.risk_level = 'Le niveau de risque est requis.'
  if (!form.commune_id) errors.commune_id = 'La commune est requise.'
  if (!form.school_id) errors.school_id = 'L ecole est requise.'
  return Object.keys(errors).length === 0
}

function buildPayload() {
  const payload = {
    unique_code: form.unique_code.trim(),
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    type: form.type,
    risk_level: form.risk_level,
    commune_id: Number(form.commune_id),
    school_id: Number(form.school_id),
    family_profile_id: form.family_profile_id ? Number(form.family_profile_id) : null,
  }

  if (!isEditing.value && form.sponsor_id) {
    payload.sponsor_id = Number(form.sponsor_id)
  }

  return payload
}

function handleSubmit() {
  if (!validateForm()) return
  emit('submit', { id: props.beneficiary?.id || null, payload: buildPayload() })
}

function handleClose() {
  emit('close')
}
</script>
