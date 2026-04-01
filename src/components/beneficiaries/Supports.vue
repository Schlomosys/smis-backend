<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h5 class="mb-1">Appuis</h5>
        <p class="text-muted small mb-0">Suivi des appuis recus</p>
      </div>
      <button type="button" class="btn btn-sm btn-primary" @click="showModal = true">
        <i class="bi bi-plus-lg me-1"></i>
        Ajouter
      </button>
    </div>

    <div v-if="supports.length === 0" class="alert alert-info mb-0">Aucun appui enregistre.</div>

    <div v-else class="row g-3">
      <div v-for="support in supports" :key="support.id" class="col-lg-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <h6 class="mb-1">{{ getSupportTypeName(support) }}</h6>
                <p class="text-muted small mb-2">{{ formatDate(support.provided_at || support.date) || '-' }}</p>
              </div>
              <span class="badge bg-light text-dark">{{ formatAmount(support.amount) }}</span>
            </div>
            <p class="mb-0 text-muted">{{ support.notes || support.description || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <app-modal v-if="showModal" title="Ajouter un appui" size="lg" centered @close="closeModal">
      <div v-if="formError" class="alert alert-danger" role="alert">{{ formError }}</div>

      <div class="row g-3">
        <div class="col-md-6">
          <beneficiary-reference-select
            v-model="form.support_type_id"
            label="Type d appui"
            placeholder="Selectionner un type d appui"
            :options="supportTypes"
            :error="errors.support_type_id"
            :required="true"
          />
        </div>
        <div class="col-md-6">
          <app-form-field v-model="form.amount" type="number" label="Montant" step="0.01" :error="errors.amount" />
        </div>
        <div class="col-md-6">
          <app-form-field v-model="form.provided_at" type="date" label="Date" :error="errors.provided_at" />
        </div>
        <div class="col-12">
          <app-form-field v-model="form.notes" type="textarea" label="Notes" :rows="4" :error="errors.notes" />
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
import AppFormField from '@/components/ui/AppFormField.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { useToast } from '@/composables/useToast'
import beneficiaryService from '@/services/beneficiaryService.js'
import { useBeneficiaryStore } from '@/stores/beneficiaries'
import { formatCurrency, formatDate } from '@/utils/formatters.js'

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
  support_type_id: '',
  amount: '',
  provided_at: '',
  notes: '',
})

const supports = computed(() => {
  const value = props.beneficiary?.supports || props.beneficiary?.supports?.data
  return Array.isArray(value) ? value : []
})
const supportTypes = computed(() => props.referenceData.supportTypes || props.referenceData.support_types || [])

function resetErrors() {
  Object.keys(errors).forEach((key) => delete errors[key])
}

function closeModal() {
  showModal.value = false
  formError.value = ''
  resetErrors()
}

function getSupportTypeName(support) {
  return support.supportType?.name || support.support_type?.name || supportTypes.value.find((item) => String(item.id) === String(support.support_type_id))?.name || 'Type inconnu'
}

function formatAmount(value) {
  if (value === null || value === undefined || value === '') return '-'
  return formatCurrency(Number(value))
}

function validateForm() {
  resetErrors()
  if (!form.support_type_id) errors.support_type_id = 'Le type d appui est requis.'
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  submitting.value = true
  formError.value = ''

  try {
    await beneficiaryService.addSupport(props.beneficiaryId, {
      beneficiary_id: Number(props.beneficiaryId),
      support_type_id: Number(form.support_type_id),
      amount: form.amount === '' ? null : Number(form.amount),
      provided_at: form.provided_at || null,
      notes: form.notes.trim() || null,
    })

    await beneficiaryStore.fetchOne(props.beneficiaryId)
    closeModal()
    showToast({ type: 'success', message: 'Appui ajoute avec succes' })
  } catch (error) {
    formError.value = error.response?.data?.message || error.message || 'Erreur lors de l ajout de l appui'
    showToast({ type: 'error', message: 'Impossible d ajouter l appui' })
  } finally {
    submitting.value = false
  }
}
</script>
