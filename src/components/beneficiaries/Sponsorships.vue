<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h5 class="mb-1">Parrainages</h5>
        <p class="text-muted small mb-0">Historique des parrainages associes</p>
      </div>
      <button type="button" class="btn btn-sm btn-primary" @click="showModal = true">
        <i class="bi bi-plus-lg me-1"></i>
        Ajouter
      </button>
    </div>

    <div v-if="sponsorships.length === 0" class="alert alert-info mb-0">Aucun parrainage enregistre.</div>

    <div v-else class="row g-3">
      <div v-for="sponsorship in sponsorships" :key="sponsorship.id" class="col-lg-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <h6 class="mb-1">{{ getSponsorName(sponsorship) }}</h6>
                <p class="text-muted small mb-2">
                  {{ formatDate(sponsorship.start_date) || '-' }}
                  <span v-if="sponsorship.end_date"> - {{ formatDate(sponsorship.end_date) }}</span>
                </p>
              </div>
              <span class="badge bg-primary-subtle text-primary">{{ formatAmount(sponsorship.amount) }}</span>
            </div>
            <p class="mb-0 text-muted">{{ sponsorship.notes || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <app-modal v-if="showModal" title="Ajouter un parrainage" size="lg" centered @close="closeModal">
      <div v-if="formError" class="alert alert-danger" role="alert">{{ formError }}</div>

      <div class="row g-3">
        <div class="col-md-6">
          <beneficiary-reference-select
            v-model="form.sponsor_id"
            label="Sponsor"
            placeholder="Selectionner un sponsor"
            :options="sponsors"
            :error="errors.sponsor_id"
            :required="true"
          />
        </div>
        <div class="col-md-6">
          <app-form-field v-model="form.amount" type="number" label="Montant" step="0.01" :error="errors.amount" />
        </div>
        <div class="col-md-6">
          <app-form-field v-model="form.start_date" type="date" label="Date de debut" :error="errors.start_date" :required="true" />
        </div>
        <div class="col-md-6">
          <app-form-field v-model="form.end_date" type="date" label="Date de fin" :error="errors.end_date" />
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
  sponsor_id: '',
  amount: '',
  start_date: '',
  end_date: '',
  notes: '',
})

const sponsorships = computed(() => {
  const value = props.beneficiary?.sponsorships || props.beneficiary?.sponsorships?.data
  return Array.isArray(value) ? value : []
})
const sponsors = computed(() => (Array.isArray(props.referenceData.sponsors) ? props.referenceData.sponsors : []))

function resetErrors() {
  Object.keys(errors).forEach((key) => delete errors[key])
}

function closeModal() {
  showModal.value = false
  formError.value = ''
  resetErrors()
}

function getSponsorName(sponsorship) {
  return sponsorship.sponsor?.name || sponsors.value.find((item) => String(item.id) === String(sponsorship.sponsor_id))?.name || 'Sponsor inconnu'
}

function formatAmount(value) {
  if (value === null || value === undefined || value === '') return '-'
  return formatCurrency(Number(value))
}

function validateForm() {
  resetErrors()
  if (!form.sponsor_id) errors.sponsor_id = 'Le sponsor est requis.'
  if (!form.start_date) errors.start_date = 'La date de debut est requise.'
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  submitting.value = true
  formError.value = ''

  try {
    await beneficiaryService.addSponsorship(props.beneficiaryId, {
      beneficiary_id: Number(props.beneficiaryId),
      sponsor_id: Number(form.sponsor_id),
      amount: form.amount === '' ? null : Number(form.amount),
      start_date: form.start_date,
      end_date: form.end_date || null,
      notes: form.notes.trim() || null,
    })

    await beneficiaryStore.fetchOne(props.beneficiaryId)
    closeModal()
    showToast({ type: 'success', message: 'Parrainage ajoute avec succes' })
  } catch (error) {
    formError.value = error.response?.data?.message || error.message || 'Erreur lors de l ajout du parrainage'
    showToast({ type: 'error', message: 'Impossible d ajouter le parrainage' })
  } finally {
    submitting.value = false
  }
}
</script>
