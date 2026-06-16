<template>
  <section class="tab-panel">
    <div class="tab-header">
      <div>
        <h2 class="tab-title">Profil familial</h2>
        <p class="tab-copy">
          Consultez l'historique des tuteurs et liez un nouveau profil familial si nécessaire.
        </p>
      </div>

      <button type="button" class="primary-button" @click="openModal">Lier une famille</button>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
      <span>Chargement de l'historique familial...</span>
    </div>

    <div v-else-if="familyHistory.length === 0" class="empty-card">
      Aucun profil familial enregistré
    </div>

    <div v-else class="list-grid">
      <article
        v-for="item in familyHistory"
        :key="item.id || `${item.family_profile_id}-${item.start_date}`"
        class="list-card"
      >
        <div class="list-card__row">
          <span class="meta-label">Tuteur</span>
          <strong>{{ item.guardian_name || getFamilyLabel(item) }}</strong>
        </div>
        <div class="list-card__row">
          <span class="meta-label">Téléphone</span>
          <strong>{{
            item.phone || item.guardian_phone || item.family_profile?.phone || '-'
          }}</strong>
        </div>
        <div class="list-card__row">
          <span class="meta-label">Date de début</span>
          <strong>{{ formatDate(item.start_date) }}</strong>
        </div>
        <div class="list-card__row">
          <span class="meta-label">Date de fin</span>
          <strong>{{ formatDate(item.end_date) }}</strong>
        </div>
      </article>
    </div>

    <app-modal v-if="showModal" title="Lier une famille" centered @close="closeModal">
      <div v-if="formError" class="alert alert-danger" role="alert">
        {{ formError }}
      </div>

      <form class="modal-form" @submit.prevent="submitFamilyAssignment">
        <div class="field-block">
          <label class="field-label" for="family_profile_id">Profil familial</label>
          <select id="family_profile_id" v-model="form.family_profile_id" class="field-input">
            <option value="">Sélectionner un profil familial</option>
            <option v-for="option in familyOptions" :key="option.id" :value="String(option.id)">
              {{ getFamilyLabel(option) }}
            </option>
          </select>
          <p v-if="errors.family_profile_id" class="field-error">{{ errors.family_profile_id }}</p>
        </div>

        <div class="field-block">
          <label class="field-label" for="start_date">Date de début</label>
          <input id="start_date" v-model="form.start_date" type="date" class="field-input" />
          <p v-if="errors.start_date" class="field-error">{{ errors.start_date }}</p>
        </div>

        <div class="field-block">
          <label class="field-label" for="end_date">Date de fin</label>
          <input id="end_date" v-model="form.end_date" type="date" class="field-input" />
          <p v-if="errors.end_date" class="field-error">{{ errors.end_date }}</p>
        </div>
      </form>

      <template #footer>
        <button type="button" class="ghost-button" :disabled="saving" @click="closeModal">
          Annuler
        </button>
        <button
          type="button"
          class="primary-button"
          :disabled="saving"
          @click="submitFamilyAssignment"
        >
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Enregistrer
        </button>
      </template>
    </app-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import beneficiaryService from '@/services/beneficiaryService'
import familyProfileService from '@/services/FamilyProfileService'
import AppModal from '@/components/ui/AppModal.vue'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  beneficiaryId: { type: [String, Number], required: true },
  families: {
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
const familyHistory = ref([])
const localFamilies = ref([])

const form = reactive({
  family_profile_id: '',
  start_date: '',
  end_date: '',
})

const errors = reactive({
  family_profile_id: '',
  start_date: '',
  end_date: '',
})

const familyOptions = computed(() => {
  const source = props.families.length ? props.families : localFamilies.value
  return Array.isArray(source) ? source : []
})

onMounted(async () => {
  await Promise.all([loadFamilyHistory(), loadFamiliesIfNeeded()])
})

function normalizeCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.family_history)) return payload.family_history
  if (Array.isArray(payload?.familyHistory)) return payload.familyHistory
  if (Array.isArray(payload?.history)) return payload.history
  if (payload?.family_profile) return [payload.family_profile]
  if (payload?.data && !Array.isArray(payload.data)) return [payload.data]
  if (payload && typeof payload === 'object') return [payload]
  return []
}

async function loadFamiliesIfNeeded() {
  if (props.families.length) return

  try {
    const response = await familyProfileService.getAll({ per_page: 1000 })
    localFamilies.value = normalizeCollection(response)
  } catch {
    localFamilies.value = []
  }
}

async function loadFamilyHistory() {
  loading.value = true

  try {
    const response = await beneficiaryService.getFamilyHistory(props.beneficiaryId)
    familyHistory.value = normalizeCollection(response).map((item) => ({
      ...item,
      family_profile_id: item.family_profile_id || item.id || item.pivot?.family_profile_id,
      guardian_name: item.guardian_name || item.family_profile?.guardian_name,
      phone: item.phone || item.family_profile?.phone || item.guardian_phone,
      start_date: item.start_date || item.pivot?.start_date || item.pivot?.created_at || '',
      end_date: item.end_date || item.pivot?.end_date || '',
    }))
  } catch (error) {
    showToast({
      type: 'error',
      message: error.response?.data?.message || "Impossible de charger l'historique familial.",
    })
  } finally {
    loading.value = false
  }
}

function getFamilyLabel(item) {
  return (
    item.guardian_name ||
    item.family_profile?.guardian_name ||
    item.family_name ||
    item.name ||
    `Famille #${item.id || item.family_profile_id || 'N/A'}`
  )
}

function formatDate(value) {
  if (!value) return '-'
  return String(value).slice(0, 10)
}

function resetForm() {
  form.family_profile_id = ''
  form.start_date = ''
  form.end_date = ''
  formError.value = ''
  errors.family_profile_id = ''
  errors.start_date = ''
  errors.end_date = ''
}

function openModal() {
  resetForm()
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function validate() {
  errors.family_profile_id = form.family_profile_id ? '' : 'Le profil familial est requis.'
  errors.start_date = form.start_date ? '' : 'La date de début est requise.'
  errors.end_date = ''

  if (form.end_date && form.start_date && form.end_date < form.start_date) {
    errors.end_date = 'La date de fin ne peut pas être antérieure à la date de début.'
  }

  return !errors.family_profile_id && !errors.start_date && !errors.end_date
}

async function submitFamilyAssignment() {
  formError.value = ''
  if (!validate()) return

  saving.value = true

  try {
    await beneficiaryService.addFamilyHistory(props.beneficiaryId, {
      family_profile_id: Number(form.family_profile_id),
      start_date: form.start_date,
      end_date: form.end_date || null,
    })

    showToast({ type: 'success', message: 'Liaison familiale enregistrée avec succès.' })
    closeModal()
    await loadFamilyHistory()
    emit('updated')
  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const validationErrors = error.response.data.errors
      errors.family_profile_id = validationErrors.family_profile_id?.[0] || errors.family_profile_id
      errors.start_date = validationErrors.start_date?.[0] || errors.start_date
      errors.end_date = validationErrors.end_date?.[0] || errors.end_date
      formError.value = 'Veuillez corriger le formulaire de liaison familiale.'
    } else {
      formError.value =
        error.response?.data?.message || "Impossible d'enregistrer la liaison familiale."
    }

    showToast({
      type: 'error',
      message: formError.value || "Impossible d'enregistrer la liaison familiale.",
    })
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

.modal-form {
  display: grid;
  gap: 1rem;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field-label {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 600;
}

.field-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.85rem;
  padding: 0.8rem 0.95rem;
}

.field-error {
  margin: 0;
  color: #dc2626;
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
}
</style>
