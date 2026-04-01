<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h5 class="mb-1">Suivi scolaire</h5>
        <p class="text-muted small mb-0">Historique academique du beneficiaire</p>
      </div>
      <button type="button" class="btn btn-sm btn-primary" @click="showModal = true">
        <i class="bi bi-plus-lg me-1"></i>
        Ajouter
      </button>
    </div>

    <academic-timeline :records="records" editable @add-record="showModal = true" />

    <app-modal v-if="showModal" title="Ajouter un suivi scolaire" size="lg" centered @close="closeModal">
      <div v-if="formError" class="alert alert-danger" role="alert">
        {{ formError }}
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <app-form-field v-model="form.year" type="number" label="Annee" :error="errors.year" :required="true" />
        </div>
        <div class="col-md-6">
          <beneficiary-reference-select
            v-model="form.school_id"
            label="Ecole"
            placeholder="Selectionner une ecole"
            :options="schools"
            :error="errors.school_id"
            :required="true"
          />
        </div>
        <div class="col-md-6">
          <app-form-field v-model="form.class_name" label="Classe" :error="errors.class_name" :required="true" />
        </div>
        <div class="col-md-6">
          <app-form-field
            v-model="form.result"
            type="select"
            label="Resultat"
            input-class="form-select"
            :error="errors.result"
            :required="true"
          >
            <template #options>
              <option value="">Selectionner un resultat</option>
              <option v-for="option in resultOptions" :key="option" :value="option">{{ option }}</option>
            </template>
          </app-form-field>
        </div>
        <div class="col-md-6">
          <app-form-field v-model="form.score" type="number" label="Score" step="0.01" :error="errors.score" />
        </div>
        <div class="col-md-6 d-flex align-items-end">
          <div class="form-check mb-3">
            <input id="academic-present" v-model="form.is_present" class="form-check-input" type="checkbox" />
            <label class="form-check-label" for="academic-present">Presence confirmee</label>
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="btn btn-secondary" :disabled="submitting" @click="closeModal">Annuler</button>
        <button type="button" class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
          Enregistrer
        </button>
      </template>
    </app-modal>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import BeneficiaryReferenceSelect from '@/components/beneficiaries/BeneficiaryReferenceSelect.vue'
import AcademicTimeline from '@/components/shared/AcademicTimeline.vue'
import AppFormField from '@/components/ui/AppFormField.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { useToast } from '@/composables/useToast'
import beneficiaryService from '@/services/beneficiaryService.js'
import { useBeneficiaryStore } from '@/stores/beneficiaries'

const props = defineProps({
  beneficiaryId: { type: [String, Number], required: true },
  beneficiary: { type: Object, default: () => ({}) },
  referenceData: { type: Object, default: () => ({}) },
})

const beneficiaryStore = useBeneficiaryStore()
const { showToast } = useToast()

const showModal = ref(false)
const submitting = ref(false)
const formError = ref('')
const errors = reactive({})
const form = reactive({
  year: String(new Date().getFullYear()),
  school_id: '',
  class_name: '',
  result: 'En cours',
  score: '',
  is_present: true,
})

const resultOptions = ['En cours', 'Admis', 'Redoublant', 'Abandon']
const records = computed(() => {
  const value = props.beneficiary?.academicRecords || props.beneficiary?.academic_records || props.beneficiary?.academic_records?.data
  return Array.isArray(value) ? value : []
})
const schools = computed(() => (Array.isArray(props.referenceData.schools) ? props.referenceData.schools : []))

function resetErrors() {
  Object.keys(errors).forEach((key) => delete errors[key])
}

function closeModal() {
  showModal.value = false
  formError.value = ''
  resetErrors()
}

function validateForm() {
  resetErrors()
  if (!form.year) errors.year = 'L annee est requise.'
  if (!form.school_id) errors.school_id = 'L ecole est requise.'
  if (!form.class_name.trim()) errors.class_name = 'La classe est requise.'
  if (!form.result) errors.result = 'Le resultat est requis.'
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  submitting.value = true
  formError.value = ''

  try {
    await beneficiaryService.addAcademicRecord(props.beneficiaryId, {
      beneficiary_id: Number(props.beneficiaryId),
      year: Number(form.year),
      school_id: Number(form.school_id),
      class_name: form.class_name.trim(),
      result: form.result,
      score: form.score === '' ? null : Number(form.score),
      is_present: Boolean(form.is_present),
    })

    await beneficiaryStore.fetchOne(props.beneficiaryId)
    closeModal()
    showToast({ type: 'success', message: 'Suivi scolaire ajoute avec succes' })
  } catch (error) {
    formError.value = error.response?.data?.message || error.message || 'Erreur lors de l ajout du suivi scolaire'
    showToast({ type: 'error', message: 'Impossible d ajouter le suivi scolaire' })
  } finally {
    submitting.value = false
  }
}
</script>
