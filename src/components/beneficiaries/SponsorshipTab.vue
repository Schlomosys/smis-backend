<template>
  <section class="tab-panel">
    <div class="tab-header">
      <div>
        <h2 class="tab-title">Sponsorships</h2>
        <p class="tab-copy">View sponsor engagements and attach new sponsorship entries to the beneficiary.</p>
      </div>

      <button type="button" class="primary-button" @click="openModal">
        Add Sponsorship
      </button>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
      <span>Loading sponsorships...</span>
    </div>

    <div v-else-if="sponsorships.length === 0" class="empty-card">
      No data
    </div>

    <div v-else class="list-grid">
      <article v-for="item in sponsorships" :key="item.id || `${item.sponsor_id}-${item.start_date}`" class="list-card">
        <div class="list-card__row">
          <span class="meta-label">Sponsor</span>
          <strong>{{ getSponsorName(item) }}</strong>
        </div>
        <div class="list-card__row">
          <span class="meta-label">Status</span>
          <strong>{{ item.status || '-' }}</strong>
        </div>
        <div class="list-card__row">
          <span class="meta-label">Start date</span>
          <strong>{{ formatDate(item.start_date) }}</strong>
        </div>
      </article>
    </div>

    <app-modal v-if="showModal" title="Add Sponsorship" size="lg" centered @close="closeModal">
      <div class="form-shell">
        <div class="form-hero">
          <h3 class="form-hero__title">New Sponsorship</h3>
          <p class="form-hero__copy">
            Capture sponsor, start date, amount, duration, and any helpful notes.
          </p>
        </div>

        <div v-if="formError" class="form-alert" role="alert">
          {{ formError }}
        </div>

        <form class="sponsorship-form" @submit.prevent="submitSponsorship">
          <div class="field-group">
            <label class="field-label" for="sponsor_id">Sponsor</label>
            <select id="sponsor_id" v-model="form.sponsor_id" class="field-input">
              <option value="">Select sponsor</option>
              <option v-for="option in sponsorOptions" :key="option.id" :value="String(option.id)">
                {{ option.name || option.full_name || `Sponsor #${option.id}` }}
              </option>
            </select>
            <p v-if="errors.sponsor_id" class="field-error">{{ errors.sponsor_id }}</p>
          </div>

          <div class="field-group">
            <label class="field-label" for="status">Status</label>
            <select id="status" v-model="form.status" class="field-input">
              <option value="">Select status</option>
              <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <p v-if="errors.status" class="field-error">{{ errors.status }}</p>
          </div>

          <div class="field-group">
            <label class="field-label" for="start_date">Start date</label>
            <input id="start_date" v-model="form.start_date" type="date" class="field-input" />
            <p v-if="errors.start_date" class="field-error">{{ errors.start_date }}</p>
          </div>

          <div class="field-group field-group--accent">
            <label class="field-label" for="annual_amount">Annual amount</label>
            <input
              id="annual_amount"
              v-model="form.annual_amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="field-input"
            />
            <p v-if="errors.annual_amount" class="field-error">{{ errors.annual_amount }}</p>
          </div>

          <div class="field-group field-group--accent">
            <label class="field-label" for="duration_months">Duration (months)</label>
            <input
              id="duration_months"
              v-model="form.duration_months"
              type="number"
              min="0"
              step="1"
              placeholder="12"
              class="field-input"
            />
            <p v-if="errors.duration_months" class="field-error">{{ errors.duration_months }}</p>
          </div>

          <div class="field-group field-group--wide">
            <label class="field-label" for="notes">Notes</label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="4"
              placeholder="Add any relevant sponsorship context or follow-up notes..."
              class="field-input field-input--textarea"
            ></textarea>
            <p v-if="errors.notes" class="field-error">{{ errors.notes }}</p>
          </div>
        </form>
      </div>

      <template #footer>
        <button type="button" class="ghost-button" :disabled="saving" @click="closeModal">Cancel</button>
        <button type="button" class="primary-button" :disabled="saving" @click="submitSponsorship">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Save sponsorship
        </button>
      </template>
    </app-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import beneficiaryService from '@/services/beneficiaryService'
import sponsorService from '@/services/sponsorService'
import AppModal from '@/components/ui/AppModal.vue'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  beneficiaryId: { type: [String, Number], required: true },
  sponsors: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['updated'])
const { showToast } = useToast()

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const formError = ref('')
const sponsorships = ref([])
const localSponsors = ref([])
const statusOptions = ['active', 'paused', 'ended']

const form = reactive({
  sponsor_id: '',
  start_date: '',
  status: 'active',
  annual_amount: '',
  duration_months: '',
  notes: '',
})

const errors = reactive({
  sponsor_id: '',
  start_date: '',
  status: '',
  annual_amount: '',
  duration_months: '',
  notes: '',
})

const sponsorOptions = computed(() => {
  const source = props.sponsors.length ? props.sponsors : localSponsors.value
  return Array.isArray(source) ? source : []
})

onMounted(async () => {
  await Promise.all([loadSponsorships(), loadSponsorsIfNeeded()])
})

function normalizeCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.sponsorships)) return payload.sponsorships
  if (Array.isArray(payload?.sponsorships?.data)) return payload.sponsorships.data
  return []
}

async function loadSponsorsIfNeeded() {
  if (props.sponsors.length) return

  try {
    const response = await sponsorService.getAll({ per_page: 1000 })
    localSponsors.value = normalizeCollection(response)
  } catch {
    localSponsors.value = []
  }
}

async function loadSponsorships() {
  loading.value = true

  try {
    const response = await beneficiaryService.getSponsorships(props.beneficiaryId)
    sponsorships.value = normalizeCollection(response)
  } catch (error) {
    showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load sponsorships.' })
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.sponsor_id = ''
  form.start_date = ''
  form.status = 'active'
  form.annual_amount = ''
  form.duration_months = ''
  form.notes = ''
  formError.value = ''
  errors.sponsor_id = ''
  errors.start_date = ''
  errors.status = ''
  errors.annual_amount = ''
  errors.duration_months = ''
  errors.notes = ''
}

function openModal() {
  resetForm()
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function validate() {
  errors.sponsor_id = form.sponsor_id ? '' : 'Sponsor is required.'
  errors.start_date = form.start_date ? '' : 'Start date is required.'
  errors.status = form.status.trim() ? '' : 'Status is required.'
  errors.annual_amount = ''
  errors.duration_months = ''

  if (form.annual_amount !== '' && Number(form.annual_amount) < 0) {
    errors.annual_amount = 'Annual amount must be 0 or greater.'
  }

  if (form.duration_months !== '' && Number(form.duration_months) < 0) {
    errors.duration_months = 'Duration must be 0 or greater.'
  }

  return !errors.sponsor_id
    && !errors.start_date
    && !errors.status
    && !errors.annual_amount
    && !errors.duration_months
}

function getSponsorName(item) {
  return item.sponsor?.name
    || sponsorOptions.value.find((option) => String(option.id) === String(item.sponsor_id))?.name
    || `Sponsor #${item.sponsor_id || 'N/A'}`
}

function formatDate(value) {
  if (!value) return '-'
  return String(value).slice(0, 10)
}

async function submitSponsorship() {
  formError.value = ''
  if (!validate()) return

  saving.value = true

  try {
    await beneficiaryService.addSponsorship(props.beneficiaryId, {
      sponsor_id: Number(form.sponsor_id),
      start_date: form.start_date,
      status: form.status.trim(),
      annual_amount: form.annual_amount === '' ? null : Number(form.annual_amount),
      duration_months: form.duration_months === '' ? null : Number(form.duration_months),
      notes: form.notes.trim() || null,
    })

    showToast({ type: 'success', message: 'Sponsorship added successfully.' })
    closeModal()
    await loadSponsorships()
    emit('updated')
  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const validationErrors = error.response.data.errors
      errors.sponsor_id = validationErrors.sponsor_id?.[0] || errors.sponsor_id
      errors.start_date = validationErrors.start_date?.[0] || errors.start_date
      errors.status = validationErrors.status?.[0] || errors.status
      errors.annual_amount = validationErrors.annual_amount?.[0] || errors.annual_amount
      errors.duration_months = validationErrors.duration_months?.[0] || errors.duration_months
      errors.notes = validationErrors.notes?.[0] || errors.notes
      formError.value = 'Please correct the sponsorship form.'
    } else {
      formError.value = error.response?.data?.message || 'Unable to save sponsorship.'
    }

    showToast({ type: 'error', message: formError.value || 'Unable to save sponsorship.' })
  } finally {
    saving.value = false
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
.list-card {
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
  padding: 2rem 1rem;
  text-align: center;
  color: #64748b;
  font-weight: 600;
}

.list-grid {
  display: grid;
  gap: 1rem;
}

.list-card {
  padding: 1rem;
}

.list-card__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: #334155;
}

.list-card__row + .list-card__row {
  margin-top: 0.7rem;
}

.meta-label {
  color: #64748b;
}

.form-shell {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-hero {
  border: 1px solid #dbeafe;
  border-radius: 1.4rem;
  padding: 1.15rem 1.2rem;
  background: linear-gradient(135deg, #ecfeff, #ffffff 48%, #f8fafc);
}

.form-hero__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 700;
}

.form-hero__copy {
  margin: 0.45rem 0 0;
  color: #64748b;
}

.form-alert {
  border: 1px solid #fecdd3;
  border-radius: 1rem;
  padding: 0.85rem 1rem;
  background: #fff1f2;
  color: #be123c;
  font-size: 0.92rem;
}

.sponsorship-form {
  display: grid;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 1.15rem;
  background: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.field-group--accent {
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.field-group--wide {
  grid-column: 1 / -1;
}

.field-label {
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 600;
}

.field-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.95rem;
  padding: 0.9rem 1rem;
  background: #fff;
  color: #0f172a;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.field-input:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.12);
}

.field-input--textarea {
  min-height: 132px;
  resize: vertical;
}

.field-error {
  margin: 0;
  color: #e11d48;
  font-size: 0.85rem;
}

.ghost-button,
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.75rem 1.1rem;
  font-weight: 600;
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

@media (min-width: 992px) {
  .list-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sponsorship-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
