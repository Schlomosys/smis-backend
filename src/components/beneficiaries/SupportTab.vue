<template>
  <section class="tab-panel">
    <div class="tab-header">
      <div>
        <h2 class="tab-title">Supports</h2>
        <p class="tab-copy">Track direct support received by this beneficiary and attach new entries when needed.</p>
      </div>

      <div class="header-actions">
        <router-link :to="`/admin/beneficiaries/${beneficiaryId}/supports-report`" class="ghost-button">
          View Support Details
        </router-link>
        <button type="button" class="primary-button" @click="openModal">
          Add Support
        </button>
      </div>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
      <span>Loading supports...</span>
    </div>

    <div v-else-if="supports.length === 0" class="empty-card">
      <div class="empty-card__content">
        <h3>No supports yet</h3>
        <p>Add the first support record to start tracking beneficiary assistance.</p>
      </div>
    </div>

    <div v-else class="table-shell">
      <div class="table-scroll">
        <table class="supports-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Amount</th>
              <th>Support Type</th>
              <th>Frequency</th>
              <th>Sponsor</th>
              <th class="actions-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in supports" :key="item.id || `${item.year}-${item.support_type_id}`">
              <td>{{ item.year || '-' }}</td>
              <td>{{ formatAmount(item.amount) }}</td>
              <td>{{ getSupportTypeName(item) }}</td>
              <td>{{ item.frequency || '-' }}</td>
              <td>{{ getSponsorName(item) }}</td>
              <td class="actions-cell">
                <button
                  type="button"
                  class="danger-link"
                  :disabled="deletingId === item.id"
                  @click="openDeleteModal(item)"
                >
                  <span
                    v-if="deletingId === item.id"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <app-modal v-if="showModal" title="Add Support" size="lg" centered @close="closeModal">
      <div class="space-y-6">
        <div class="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-teal-50 p-5">
          <h3 class="text-lg font-semibold text-slate-900">New Support Record</h3>
          <p class="mt-1 text-sm text-slate-600">
            Add structured support details including year, type, amount, frequency, and optional sponsorship.
          </p>
        </div>

        <div
          v-if="formError"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          role="alert"
        >
          {{ formError }}
        </div>

        <form class="grid gap-5 md:grid-cols-2" @submit.prevent="submitSupport">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700" for="year">Year</label>
            <input id="year" v-model="form.year" type="number" step="1" placeholder="2026" class="tailwind-input" />
            <p v-if="errors.year" class="text-sm text-rose-600">{{ errors.year }}</p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700" for="support_type_id">Support type</label>
            <select id="support_type_id" v-model="form.support_type_id" class="tailwind-input">
              <option value="">Select support type</option>
              <option v-for="option in supportTypeOptions" :key="option.id" :value="String(option.id)">
                {{ option.name || option.label || `Support type #${option.id}` }}
              </option>
            </select>
            <p v-if="errors.support_type_id" class="text-sm text-rose-600">{{ errors.support_type_id }}</p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700" for="amount">Amount</label>
            <input
              id="amount"
              v-model="form.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="tailwind-input"
            />
            <p v-if="errors.amount" class="text-sm text-rose-600">{{ errors.amount }}</p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700" for="frequency">Frequency</label>
            <select id="frequency" v-model="form.frequency" class="tailwind-input">
              <option value="">Select frequency</option>
              <option v-for="option in frequencyOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <p v-if="errors.frequency" class="text-sm text-rose-600">{{ errors.frequency }}</p>
          </div>

          <div class="space-y-2 md:col-span-2">
            <label class="text-sm font-medium text-slate-700" for="sponsorship_id">Sponsorship</label>
            <select id="sponsorship_id" v-model="form.sponsorship_id" class="tailwind-input">
              <option value="">No sponsorship linked</option>
              <option v-for="option in sponsorshipOptions" :key="option.id" :value="String(option.id)">
                {{ getSponsorshipOptionLabel(option) }}
              </option>
            </select>
            <p class="text-xs text-slate-500">Optional. Limited to sponsorships linked to this beneficiary.</p>
            <p v-if="errors.sponsorship_id" class="text-sm text-rose-600">{{ errors.sponsorship_id }}</p>
          </div>

          <div class="space-y-2 md:col-span-2">
            <label class="text-sm font-medium text-slate-700" for="notes">Notes</label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="4"
              placeholder="Add any context, purpose, or follow-up information..."
              class="tailwind-textarea"
            ></textarea>
            <p v-if="errors.notes" class="text-sm text-rose-600">{{ errors.notes }}</p>
          </div>
        </form>
      </div>

      <template #footer>
        <button type="button" class="ghost-button" :disabled="saving" @click="closeModal">Cancel</button>
        <button type="button" class="primary-button" :disabled="saving" @click="submitSupport">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Save support
        </button>
      </template>
    </app-modal>

    <app-modal v-if="showDeleteModal" title="Delete Support" centered @close="closeDeleteModal">
      <div class="space-y-4">
        <div class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          This will permanently remove the selected support record.
        </div>
        <p class="delete-copy">
          Delete
          <strong>{{ getSupportTypeName(selectedSupport) }}</strong>
          for
          <strong>{{ selectedSupport?.year || '-' }}</strong>
          ?
        </p>
      </div>

      <template #footer>
        <button type="button" class="ghost-button" :disabled="deletingId === selectedSupport?.id" @click="closeDeleteModal">
          Cancel
        </button>
        <button type="button" class="danger-button" :disabled="deletingId === selectedSupport?.id" @click="deleteSupport">
          <span
            v-if="deletingId === selectedSupport?.id"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          Delete support
        </button>
      </template>
    </app-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import beneficiaryService from '@/services/beneficiaryService'
import AppModal from '@/components/ui/AppModal.vue'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  beneficiaryId: { type: [String, Number], required: true },
  supportTypes: { type: Array, default: () => [] },
  sponsorships: { type: Array, default: () => [] },
})

const emit = defineEmits(['updated'])
const { showToast } = useToast()

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const formError = ref('')
const supports = ref([])
const selectedSupport = ref(null)
const deletingId = ref(null)

const frequencyOptions = ['ponctuel', 'mensuel', 'annuel']

const form = reactive({
  year: String(new Date().getFullYear()),
  amount: '',
  support_type_id: '',
  frequency: 'ponctuel',
  notes: '',
  sponsorship_id: '',
})

const errors = reactive({
  year: '',
  amount: '',
  support_type_id: '',
  frequency: '',
  notes: '',
  sponsorship_id: '',
})

const supportTypeOptions = computed(() => (Array.isArray(props.supportTypes) ? props.supportTypes : []))
const sponsorshipOptions = computed(() => {
  const list = Array.isArray(props.sponsorships) ? props.sponsorships : []
  return list.filter((item) => {
    if (!item) return false
    if (!item.beneficiary_id) return true
    return String(item.beneficiary_id) === String(props.beneficiaryId)
  })
})

onMounted(loadSupports)

function normalizeCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.supports)) return payload.supports
  if (Array.isArray(payload?.supports?.data)) return payload.supports.data
  return []
}

async function loadSupports() {
  loading.value = true

  try {
    const response = await beneficiaryService.getSupports(props.beneficiaryId)
    supports.value = normalizeCollection(response)
  } catch (error) {
    showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load supports.' })
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.year = String(new Date().getFullYear())
  form.amount = ''
  form.support_type_id = ''
  form.frequency = 'ponctuel'
  form.notes = ''
  form.sponsorship_id = ''
  formError.value = ''
  errors.year = ''
  errors.amount = ''
  errors.support_type_id = ''
  errors.frequency = ''
  errors.notes = ''
  errors.sponsorship_id = ''
}

function openModal() {
  resetForm()
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function openDeleteModal(item) {
  selectedSupport.value = item
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  selectedSupport.value = null
}

function validate() {
  errors.year = form.year ? '' : 'Year is required.'
  errors.support_type_id = form.support_type_id ? '' : 'Support type is required.'
  errors.amount = ''

  if (form.amount !== '' && Number(form.amount) < 0) {
    errors.amount = 'Amount must be 0 or greater.'
  }

  return !errors.year && !errors.support_type_id && !errors.amount
}

function getSupportTypeName(item) {
  if (!item) return '-'
  return item.supportType?.name
    || item.support_type?.name
    || supportTypeOptions.value.find((option) => String(option.id) === String(item.support_type_id))?.name
    || `Support type #${item.support_type_id || 'N/A'}`
}

function getSponsorName(item) {
  if (!item) return '-'
  const sponsorship = item.sponsorship
    || sponsorshipOptions.value.find((option) => String(option.id) === String(item.sponsorship_id))

  return sponsorship?.sponsor?.name
    || sponsorship?.sponsor_name
    || sponsorship?.name
    || '-'
}

function getSponsorshipOptionLabel(item) {
  const sponsorName = item.sponsor?.name || item.sponsor_name || item.name || `Sponsorship #${item.id}`
  const year = item.start_date ? ` · ${String(item.start_date).slice(0, 10)}` : ''
  return `${sponsorName}${year}`
}

function formatAmount(value) {
  if (value === null || value === undefined || value === '') return '-'
  const amount = Number(value)
  return Number.isNaN(amount)
    ? String(value)
    : amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

async function submitSupport() {
  formError.value = ''
  if (!validate()) return

  saving.value = true

  try {
    await beneficiaryService.addSupport(props.beneficiaryId, {
      year: Number(form.year),
      amount: form.amount === '' ? null : Number(form.amount),
      support_type_id: Number(form.support_type_id),
      frequency: form.frequency || null,
      notes: form.notes.trim() || null,
      sponsorship_id: form.sponsorship_id ? Number(form.sponsorship_id) : null,
    })

    showToast({ type: 'success', message: 'Support added successfully.' })
    closeModal()
    await loadSupports()
    emit('updated')
  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const validationErrors = error.response.data.errors
      errors.year = validationErrors.year?.[0] || errors.year
      errors.amount = validationErrors.amount?.[0] || errors.amount
      errors.support_type_id = validationErrors.support_type_id?.[0] || errors.support_type_id
      errors.frequency = validationErrors.frequency?.[0] || errors.frequency
      errors.notes = validationErrors.notes?.[0] || errors.notes
      errors.sponsorship_id = validationErrors.sponsorship_id?.[0] || errors.sponsorship_id
      formError.value = 'Please correct the support form.'
    } else {
      formError.value = error.response?.data?.message || 'Unable to save support.'
    }

    showToast({ type: 'error', message: formError.value || 'Unable to save support.' })
  } finally {
    saving.value = false
  }
}

async function deleteSupport() {
  if (!selectedSupport.value?.id) return

  deletingId.value = selectedSupport.value.id

  try {
    await beneficiaryService.deleteSupport(props.beneficiaryId, selectedSupport.value.id)
    showToast({ type: 'success', message: 'Support deleted successfully.' })
    closeDeleteModal()
    await loadSupports()
    emit('updated')
  } catch (error) {
    showToast({
      type: 'error',
      message: error.response?.data?.message || 'Unable to delete support.',
    })
  } finally {
    deletingId.value = null
  }
}
</script>

<style scoped>
.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tab-title {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
}

.tab-copy {
  margin: 0.35rem 0 0;
  color: #64748b;
}

.state-card,
.empty-card,
.table-shell {
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
}

.state-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
}

.empty-card {
  padding: 2.25rem 1.25rem;
  text-align: center;
}

.empty-card__content h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 700;
}

.empty-card__content p {
  margin: 0.5rem 0 0;
  color: #64748b;
}

.table-shell {
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

.supports-table {
  width: 100%;
  border-collapse: collapse;
}

.supports-table th,
.supports-table td {
  padding: 1rem 1.1rem;
  text-align: left;
}

.supports-table thead th {
  background: linear-gradient(180deg, #f8fafc, #f1f5f9);
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.supports-table tbody tr + tr td {
  border-top: 1px solid #e2e8f0;
}

.supports-table tbody td {
  color: #0f172a;
  font-size: 0.95rem;
}

.actions-cell {
  width: 1%;
  white-space: nowrap;
}

.danger-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #dc2626;
  font-weight: 600;
}

.danger-link:disabled {
  opacity: 0.65;
}

.delete-copy {
  margin: 0;
  color: #334155;
}

.tailwind-input,
.tailwind-textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  border-radius: 1rem;
  padding: 0.85rem 1rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.tailwind-input:focus,
.tailwind-textarea:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.12);
}

.ghost-button,
.primary-button,
.danger-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.75rem 1.1rem;
  font-weight: 600;
  text-decoration: none;
}

.ghost-button {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
}

.primary-button {
  border: 1px solid #0f766e;
  background: linear-gradient(135deg, #0f766e, #0ea5a4);
  color: #fff;
}

.danger-button {
  border: 1px solid #dc2626;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: #fff;
}
</style>
