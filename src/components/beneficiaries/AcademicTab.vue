<template>
  <section class="tab-panel">
    <div class="tab-header">
      <div>
        <h2 class="tab-title">Historique scolaire</h2>
        <p class="tab-copy">
          Suivez les performances annuelles, les moyennes et le taux de présence.
        </p>
      </div>

      <button type="button" class="primary-button" @click="openModal">Ajouter un historique</button>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
      <span>Chargement des dossiers scolaires...</span>
    </div>

    <div v-else-if="records.length === 0" class="empty-card">Aucun dossier scolaire enregistré</div>

    <div v-else class="list-grid">
      <article
        v-for="record in records"
        :key="record.id || `${record.academic_year}-${record.class_name}`"
        class="list-card"
      >
        <div class="list-card__row">
          <span class="meta-label">Année académique</span>
          <strong>{{ record.academic_year || '-' }}</strong>
        </div>
        <div class="list-card__row">
          <span class="meta-label">Classe</span>
          <strong>{{ record.class_name || record.class || '-' }}</strong>
        </div>
        <div class="list-card__row">
          <span class="meta-label">École</span>
          <strong>{{ record.school?.name || findSchoolName(record.school_id) || '-' }}</strong>
        </div>
        <div class="list-card__row">
          <span class="meta-label">Moyenne</span>
          <strong>{{ record.average_score ?? '-' }}</strong>
        </div>
        <div class="list-card__row">
          <span class="meta-label">Taux de présence</span>
          <strong>{{
            record.attendance_rate !== null && record.attendance_rate !== undefined
              ? `${record.attendance_rate}%`
              : '-'
          }}</strong>
        </div>
      </article>
    </div>

    <app-modal v-if="showModal" title="Ajouter un historique scolaire" centered @close="closeModal">
      <div v-if="formError" class="alert alert-danger" role="alert">
        {{ formError }}
      </div>

      <form class="modal-form" @submit.prevent="submitRecord">
        <div class="field-block">
          <label class="field-label" for="academic_year">Année académique</label>
          <AcademicYearSelect id="academic_year" v-model="form.academic_year" />
          <p v-if="errors.academic_year" class="field-error">{{ errors.academic_year }}</p>
        </div>

        <div class="field-block">
          <label class="field-label" for="class_name">Classe</label>
          <input
            id="class_name"
            v-model="form.class_name"
            type="text"
            class="field-input"
            placeholder="Ex: CM1, 6ème..."
          />
          <p v-if="errors.class_name" class="field-error">{{ errors.class_name }}</p>
        </div>

        <div class="field-block">
          <label class="field-label" for="school_id">École</label>
          <select id="school_id" v-model="form.school_id" class="field-input">
            <option value="">Sélectionner une école</option>
            <option v-for="school in schools" :key="school.id" :value="String(school.id)">
              {{ school.name || school.school_name || `École #${school.id}` }}
            </option>
          </select>
          <p v-if="errors.school_id" class="field-error">{{ errors.school_id }}</p>
        </div>

        <div class="field-block">
          <label class="field-label" for="average_score">Moyenne</label>
          <input
            id="average_score"
            v-model="form.average_score"
            type="number"
            step="0.01"
            class="field-input"
            placeholder="Ex: 14.5"
          />
        </div>

        <div class="field-block">
          <label class="field-label" for="attendance_rate">Taux de présence (%)</label>
          <input
            id="attendance_rate"
            v-model="form.attendance_rate"
            type="number"
            step="0.01"
            class="field-input"
            placeholder="Ex: 95"
          />
        </div>
      </form>

      <template #footer>
        <button type="button" class="ghost-button" :disabled="saving" @click="closeModal">
          Annuler
        </button>
        <button type="button" class="primary-button" :disabled="saving" @click="submitRecord">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Enregistrer
        </button>
      </template>
    </app-modal>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import beneficiaryService from '@/services/beneficiaryService'
import AcademicYearSelect from '@/components/shared/AcademicYearSelect.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  beneficiaryId: { type: [String, Number], required: true },
  schools: { type: Array, default: () => [] },
})

const emit = defineEmits(['updated'])
const { showToast } = useToast()

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const formError = ref('')
const records = ref([])

const form = reactive({
  academic_year: '',
  class_name: '',
  school_id: '',
  average_score: '',
  attendance_rate: '',
})

const errors = reactive({
  academic_year: '',
  class_name: '',
  school_id: '',
})

onMounted(loadRecords)

function normalizeCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.academic_records)) return payload.academic_records
  if (Array.isArray(payload?.records)) return payload.records
  if (Array.isArray(payload?.academicRecords)) return payload.academicRecords
  if (Array.isArray(payload?.academic_records?.data)) return payload.academic_records.data
  return []
}

async function loadRecords() {
  loading.value = true

  try {
    const response = await beneficiaryService.getAcademicRecords(props.beneficiaryId)
    records.value = normalizeCollection(response)
  } catch (error) {
    showToast({
      type: 'error',
      message: error.response?.data?.message || "Impossible de charger l'historique scolaire.",
    })
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.academic_year = ''
  form.class_name = ''
  form.school_id = ''
  form.average_score = ''
  form.attendance_rate = ''
  formError.value = ''
  errors.academic_year = ''
  errors.class_name = ''
  errors.school_id = ''
}

function openModal() {
  resetForm()
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function validate() {
  errors.academic_year = form.academic_year ? '' : "L'année académique est requise."
  errors.class_name = form.class_name.trim() ? '' : 'La classe est requise.'
  errors.school_id = form.school_id ? '' : "L'école est requise."
  return !errors.academic_year && !errors.class_name && !errors.school_id
}

function findSchoolName(schoolId) {
  if (!schoolId) return ''
  const match = props.schools.find((school) => String(school.id) === String(schoolId))
  return match?.name || match?.school_name || ''
}

async function submitRecord() {
  formError.value = ''
  if (!validate()) return

  saving.value = true

  try {
    await beneficiaryService.addAcademicRecord(props.beneficiaryId, {
      academic_year: form.academic_year,
      class_name: form.class_name.trim(),
      school_id: Number(form.school_id),
      average_score: form.average_score === '' ? null : Number(form.average_score),
      attendance_rate: form.attendance_rate === '' ? null : Number(form.attendance_rate),
    })

    showToast({ type: 'success', message: 'Historique scolaire enregistré avec succès.' })
    closeModal()
    await loadRecords()
    emit('updated')
  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const validationErrors = error.response.data.errors
      errors.academic_year = validationErrors.academic_year?.[0] || errors.academic_year
      errors.class_name =
        validationErrors.class_name?.[0] || validationErrors.class?.[0] || errors.class_name
      errors.school_id = validationErrors.school_id?.[0] || errors.school_id
      formError.value = "Veuillez corriger le formulaire de l'historique scolaire."
    } else {
      formError.value =
        error.response?.data?.message || "Impossible d'enregistrer l'historique scolaire."
    }

    showToast({
      type: 'error',
      message: formError.value || "Impossible d'enregistrer l'historique scolaire.",
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
