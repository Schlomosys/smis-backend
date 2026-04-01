<template>
  <section class="beneficiary-list-page">
    <header class="page-hero">
      <div>
        <p class="page-hero__eyebrow">Beneficiaries</p>
        <h1 class="page-hero__title">Gestion des beneficiaires</h1>
        <p class="page-hero__copy">
          Recherchez, filtrez et suivez les beneficiaires du programme dans une vue plus claire et
          plus rapide.
        </p>
      </div>

      <button type="button" class="cta-button" @click="goToCreate">
        <span class="cta-button__icon">+</span>
        Ajouter un beneficiaire
      </button>
    </header>

    <section class="summary-grid">
      <article class="summary-card">
        <span class="summary-card__label">Total</span>
        <strong>{{ beneficiaryStore.pagination.total || 0 }}</strong>
        <small>beneficiaires enregistres</small>
      </article>

      <article class="summary-card">
        <span class="summary-card__label">Actifs</span>
        <strong>{{ activeCount }}</strong>
        <small>profils actuellement actifs</small>
      </article>

      <article class="summary-card">
        <span class="summary-card__label">Alumni</span>
        <strong>{{ alumniCount }}</strong>
        <small>beneficiaires sortis du programme</small>
      </article>
    </section>

    <section class="panel-card filter-panel">
      <div class="filter-panel__header">
        <div>
          <h2 class="panel-title">Recherche et filtres</h2>
          <p class="panel-copy">Affinez rapidement la liste avec des criteres combinables.</p>
        </div>

        <div class="view-toggle">
          <button
            type="button"
            class="view-toggle__button"
            :class="{ 'view-toggle__button--active': viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            Tableau
          </button>
          <button
            type="button"
            class="view-toggle__button"
            :class="{ 'view-toggle__button--active': viewMode === 'cards' }"
            @click="viewMode = 'cards'"
          >
            Cartes
          </button>
        </div>
      </div>

      <div class="filter-grid">
        <div class="field-block field-block--search">
          <label class="field-label" for="search">Recherche</label>
          <div class="search-input">
            <span class="search-input__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            <input
              id="search"
              v-model="filters.search"
              type="text"
              class="field-input"
              placeholder="Nom ou code du beneficiaire"
              @input="applyFilters"
            />
          </div>
        </div>

        <div class="field-block">
          <beneficiary-reference-select
            v-model="filters.commune_id"
            label="Commune"
            placeholder="Toutes les communes"
            :options="communes"
            @update:model-value="applyFilters"
          />
        </div>

        <div class="field-block">
          <app-form-field
            v-model="filters.type"
            type="select"
            label="Type"
            input-class="form-select"
            wrapper-class="mb-0"
            @change="applyFilters"
          >
            <template #options>
              <option value="">Tous les types</option>
              <option value="active">Actifs</option>
              <option value="alumni">Alumni</option>
            </template>
          </app-form-field>
        </div>

        <div class="field-block">
          <app-form-field
            v-model="filters.risk_level"
            type="select"
            label="Niveau de risque"
            input-class="form-select"
            wrapper-class="mb-0"
            @change="applyFilters"
          >
            <template #options>
              <option value="">Tous les niveaux</option>
              <option value="low">Faible</option>
              <option value="medium">Moyen</option>
              <option value="high">Eleve</option>
            </template>
          </app-form-field>
        </div>
      </div>

      <div v-if="hasActiveFilters" class="active-chips">
        <span v-if="filters.search" class="filter-chip">Recherche: {{ filters.search }}</span>
        <span v-if="filters.commune_id" class="filter-chip">Commune filtree</span>
        <span v-if="filters.type" class="filter-chip">Type: {{ filters.type }}</span>
        <span v-if="filters.risk_level" class="filter-chip">Risque: {{ filters.risk_level }}</span>
        <button type="button" class="filter-reset" @click="resetFilters">Reinitialiser</button>
      </div>
    </section>

    <div v-if="beneficiaryStore.error" class="alert alert-danger" role="alert">
      {{ beneficiaryStore.error }}
    </div>

    <section class="panel-card results-panel">
      <div class="results-panel__header">
        <div>
          <h2 class="panel-title">Liste des beneficiaires</h2>
          <p class="panel-copy">Vue responsive avec table detaillee ou cartes rapides.</p>
        </div>
        <span class="results-count">{{ beneficiaryStore.pagination.total || 0 }} resultats</span>
      </div>

      <div v-if="viewMode === 'table'">
        <app-table
          :columns="tableColumns"
          :rows="beneficiaryStore.items"
          :loading="beneficiaryStore.loading"
        >
          <template #cell-full_name="{ row }">
            <div class="person-cell">
              <UserAvatar
                :first-name="row.first_name || 'N'"
                :last-name="row.last_name || 'A'"
                :photo-url="resolvePhoto(row)"
                size="sm"
              />
              <div>
                <div class="person-cell__name">{{ getFullName(row) }}</div>
                <div class="person-cell__meta">{{ row.unique_code || 'Code indisponible' }}</div>
              </div>
            </div>
          </template>

          <template #cell-type="{ row }">
            <span :class="['status-pill', row.type === 'alumni' ? 'status-pill--muted' : 'status-pill--active']">
              {{ row.type === 'alumni' ? 'Alumni' : 'Actif' }}
            </span>
          </template>

          <template #cell-risk_level="{ row }">
            <risk-badge :level="row.risk_level || 'low'" />
          </template>

          <template #cell-commune="{ row }">
            {{ row.commune?.name || findById(communes, row.commune_id)?.name || '-' }}
          </template>

          <template #cell-school="{ row }">
            {{ row.school?.name || findById(schools, row.school_id)?.name || '-' }}
          </template>

          <template #cell-actions="{ row }">
            <div class="action-row">
              <button type="button" class="icon-action" @click.stop="goToDetails(row.id)">Voir</button>
              <button type="button" class="icon-action icon-action--secondary" @click.stop="goToEdit(row.id)">
                Modifier
              </button>
              <button type="button" class="icon-action icon-action--danger" @click.stop="openDeleteModal(row)">
                Supprimer
              </button>
            </div>
          </template>
        </app-table>
      </div>

      <div v-else class="card-grid">
        <article
          v-for="row in beneficiaryStore.items"
          :key="row.id"
          class="beneficiary-card"
          @click="goToDetails(row.id)"
        >
          <div class="beneficiary-card__header">
            <UserAvatar
              :first-name="row.first_name || 'N'"
              :last-name="row.last_name || 'A'"
              :photo-url="resolvePhoto(row)"
              size="md"
            />
            <div>
              <h3 class="beneficiary-card__name">{{ getFullName(row) }}</h3>
              <p class="beneficiary-card__meta">{{ row.unique_code || 'Code indisponible' }}</p>
            </div>
          </div>

          <div class="beneficiary-card__tags">
            <span :class="['status-pill', row.type === 'alumni' ? 'status-pill--muted' : 'status-pill--active']">
              {{ row.type === 'alumni' ? 'Alumni' : 'Actif' }}
            </span>
            <risk-badge :level="row.risk_level || 'low'" />
          </div>

          <dl class="beneficiary-card__details">
            <div>
              <dt>Commune</dt>
              <dd>{{ row.commune?.name || findById(communes, row.commune_id)?.name || '-' }}</dd>
            </div>
            <div>
              <dt>Ecole</dt>
              <dd>{{ row.school?.name || findById(schools, row.school_id)?.name || '-' }}</dd>
            </div>
          </dl>

          <div class="beneficiary-card__actions">
            <button type="button" class="icon-action" @click.stop="goToDetails(row.id)">Voir</button>
            <button type="button" class="icon-action icon-action--secondary" @click.stop="goToEdit(row.id)">
              Modifier
            </button>
          </div>
        </article>

        <div v-if="!beneficiaryStore.loading && !beneficiaryStore.items.length" class="empty-state">
          Aucun beneficiaire trouve avec les filtres actuels.
        </div>
      </div>
    </section>

    <div v-if="!beneficiaryStore.loading" class="pagination-wrap">
      <app-pagination
        :current-page="beneficiaryStore.pagination.current_page"
        :total-pages="beneficiaryStore.pagination.last_page"
        :total-items="beneficiaryStore.pagination.total"
        :per-page="beneficiaryStore.pagination.per_page"
        @page-changed="handlePageChange"
      />
    </div>

    <app-modal v-if="showDeleteModal" title="Supprimer le beneficiaire" centered @close="closeDeleteModal">
      <p class="mb-2">
        Voulez-vous vraiment supprimer
        <strong>{{ selectedBeneficiary ? getFullName(selectedBeneficiary) : '' }}</strong>
        ?
      </p>
      <p class="text-muted small mb-0">Cette action est irreversible.</p>

      <template #footer>
        <button type="button" class="btn btn-secondary" :disabled="beneficiaryStore.saving" @click="closeDeleteModal">
          Annuler
        </button>
        <button type="button" class="btn btn-danger" :disabled="beneficiaryStore.saving" @click="confirmDelete">
          <span v-if="beneficiaryStore.saving" class="spinner-border spinner-border-sm me-2"></span>
          Supprimer
        </button>
      </template>
    </app-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BeneficiaryReferenceSelect from '@/components/beneficiaries/BeneficiaryReferenceSelect.vue'
import UserAvatar from '@/components/shared/UserAvatar.vue'
import RiskBadge from '@/components/shared/RiskBadge.vue'
import AppFormField from '@/components/ui/AppFormField.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppTable from '@/components/ui/AppTable.vue'
import { useToast } from '@/composables/useToast'
import { useBeneficiaryStore } from '@/stores/beneficiaries'

const router = useRouter()
const beneficiaryStore = useBeneficiaryStore()
const { showToast } = useToast()

const filters = reactive({
  search: '',
  commune_id: '',
  type: '',
  risk_level: '',
})

const tableColumns = [
  { key: 'full_name', label: 'Beneficiaire' },
  { key: 'type', label: 'Type' },
  { key: 'risk_level', label: 'Risque' },
  { key: 'commune', label: 'Commune' },
  { key: 'school', label: 'Ecole' },
  { key: 'actions', label: 'Actions', width: '220px' },
]

const selectedBeneficiary = ref(null)
const showDeleteModal = ref(false)
const viewMode = ref('table')

const communes = computed(() => beneficiaryStore.referenceData.communes || [])
const schools = computed(() => beneficiaryStore.referenceData.schools || [])
const hasActiveFilters = computed(() => Boolean(filters.search || filters.commune_id || filters.type || filters.risk_level))
const activeCount = computed(() => beneficiaryStore.items.filter((item) => item.type !== 'alumni').length)
const alumniCount = computed(() => beneficiaryStore.items.filter((item) => item.type === 'alumni').length)

onMounted(async () => {
  await initialize()
})

async function initialize() {
  try {
    await beneficiaryStore.loadReferenceData()
    await fetchBeneficiaries()
  } catch {
    showToast({ type: 'error', message: 'Erreur lors du chargement des beneficiaires' })
  }
}

async function fetchBeneficiaries() {
  beneficiaryStore.setFilters({
    search: filters.search.trim(),
    commune_id: filters.commune_id,
    type: filters.type,
    risk_level: filters.risk_level,
  })

  try {
    await beneficiaryStore.fetchAll()
  } catch {
    showToast({ type: 'error', message: 'Impossible de charger la liste des beneficiaires' })
  }
}

function applyFilters() {
  beneficiaryStore.setPage(1)
  fetchBeneficiaries()
}

function resetFilters() {
  filters.search = ''
  filters.commune_id = ''
  filters.type = ''
  filters.risk_level = ''
  beneficiaryStore.resetFilters()
  beneficiaryStore.setPage(1)
  fetchBeneficiaries()
}

function handlePageChange(page) {
  beneficiaryStore.setPage(page)
  fetchBeneficiaries()
}

function getFullName(row) {
  return [row.first_name, row.last_name].filter(Boolean).join(' ') || '-'
}

function findById(items, id) {
  return items.find((item) => String(item.id) === String(id)) || null
}

function resolvePhoto(row) {
  return row.photo_url || row.photo || row.photo_path || row.image_url || row.avatar_url || ''
}

function goToCreate() {
  router.push('/admin/beneficiaries/create')
}

function goToEdit(id) {
  router.push(`/admin/beneficiaries/${id}/edit`)
}

function goToDetails(id) {
  router.push(`/admin/beneficiaries/${id}`)
}

function openDeleteModal(row) {
  selectedBeneficiary.value = row
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  selectedBeneficiary.value = null
}

async function confirmDelete() {
  if (!selectedBeneficiary.value) return

  const name = getFullName(selectedBeneficiary.value)

  try {
    await beneficiaryStore.remove(selectedBeneficiary.value.id)

    if (beneficiaryStore.items.length === 0 && beneficiaryStore.pagination.current_page > 1) {
      beneficiaryStore.setPage(beneficiaryStore.pagination.current_page - 1)
    }

    closeDeleteModal()
    await fetchBeneficiaries()
    showToast({ type: 'success', message: `${name} a ete supprime avec succes` })
  } catch {
    showToast({ type: 'error', message: 'Erreur lors de la suppression du beneficiaire' })
  }
}
</script>

<style scoped>
.beneficiary-list-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-hero,
.filter-panel__header,
.results-panel__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.page-hero {
  border-radius: 1.75rem;
  background: linear-gradient(135deg, #02334d 0%, #045480 55%, #006fb8 100%);
  color: #ffffff;
  padding: 1.5rem;
  box-shadow: 0 24px 50px rgba(4, 84, 128, 0.18);
}

.page-hero__eyebrow,
.summary-card__label {
  margin: 0 0 0.35rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.page-hero__title {
  margin: 0;
  font-size: clamp(1.8rem, 2.6vw, 2.6rem);
  font-weight: 800;
}

.page-hero__copy,
.panel-copy {
  margin: 0.55rem 0 0;
  max-width: 42rem;
  color: rgba(255, 255, 255, 0.84);
}

.panel-copy {
  color: #61788b;
}

.cta-button,
.icon-action,
.filter-reset,
.view-toggle__button {
  border: 0;
  transition: all 0.2s ease;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  border-radius: 999px;
  background: #ff6900;
  color: #ffffff;
  padding: 0.9rem 1.25rem;
  font-weight: 700;
}

.cta-button:hover,
.icon-action:hover,
.filter-reset:hover,
.view-toggle__button:hover {
  transform: translateY(-1px);
}

.cta-button__icon {
  display: inline-flex;
  width: 1.4rem;
  height: 1.4rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
}

.summary-grid,
.filter-grid,
.card-grid {
  display: grid;
  gap: 1rem;
}

.summary-card,
.panel-card,
.beneficiary-card {
  border: 1px solid #d9e7f1;
  border-radius: 1.5rem;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(4, 84, 128, 0.08);
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 1.25rem;
}

.summary-card__label {
  color: #006fb8;
}

.summary-card strong {
  color: #02334d;
  font-size: 1.8rem;
}

.summary-card small {
  color: #688093;
}

.panel-card {
  padding: 1.5rem;
}

.panel-title {
  margin: 0;
  color: #02334d;
  font-size: 1.15rem;
  font-weight: 800;
}

.view-toggle {
  display: inline-flex;
  gap: 0.4rem;
  border-radius: 999px;
  background: #e6f3fb;
  padding: 0.3rem;
}

.view-toggle__button {
  border-radius: 999px;
  background: transparent;
  color: #045480;
  padding: 0.7rem 1rem;
  font-weight: 700;
}

.view-toggle__button--active {
  background: #ffffff;
  color: #ff6900;
  box-shadow: 0 10px 24px rgba(4, 84, 128, 0.12);
}

.field-block :deep(.form-label),
.field-label {
  color: #02334d;
  font-weight: 700;
}

.field-input,
.field-block :deep(.form-control),
.field-block :deep(.form-select) {
  border: 1px solid #cfd8e0;
  border-radius: 1rem;
  min-height: 3.2rem;
}

.field-block :deep(.form-control:focus),
.field-block :deep(.form-select:focus),
.field-input:focus {
  border-color: #045480;
  box-shadow: 0 0 0 4px rgba(4, 84, 128, 0.12);
}

.search-input {
  position: relative;
}

.search-input__icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  z-index: 1;
  width: 1rem;
  height: 1rem;
  color: #688093;
  transform: translateY(-50%);
}

.search-input .field-input {
  padding-left: 2.8rem;
}

.active-chips,
.beneficiary-card__tags,
.action-row,
.beneficiary-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.filter-chip,
.results-count,
.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-weight: 700;
}

.filter-chip {
  background: #e6f3fb;
  color: #045480;
  padding: 0.55rem 0.8rem;
}

.filter-reset {
  border-radius: 999px;
  background: transparent;
  color: #ff6900;
  font-weight: 700;
}

.results-count {
  background: #02334d;
  color: #ffffff;
  padding: 0.6rem 0.9rem;
}

.person-cell,
.beneficiary-card__header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.person-cell__name,
.beneficiary-card__name {
  color: #02334d;
  font-weight: 800;
}

.person-cell__meta,
.beneficiary-card__meta {
  color: #6e8395;
  font-size: 0.88rem;
}

.status-pill {
  padding: 0.45rem 0.8rem;
  font-size: 0.82rem;
}

.status-pill--active {
  background: rgba(77, 163, 217, 0.16);
  color: #045480;
}

.status-pill--muted {
  background: rgba(252, 185, 0, 0.18);
  color: #9a6c00;
}

.icon-action {
  border-radius: 999px;
  background: #ff6900;
  color: #ffffff;
  padding: 0.55rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 700;
}

.icon-action--secondary {
  background: #045480;
}

.icon-action--danger {
  background: #fff1e8;
  color: #cc5200;
}

.beneficiary-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.beneficiary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 22px 46px rgba(4, 84, 128, 0.14);
}

.beneficiary-card__details {
  display: grid;
  gap: 0.85rem;
  margin: 0;
}

.beneficiary-card__details dt {
  color: #688093;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.beneficiary-card__details dd {
  margin: 0.2rem 0 0;
  color: #02334d;
  font-weight: 700;
}

.empty-state,
.pagination-wrap {
  display: flex;
  justify-content: center;
}

.empty-state {
  grid-column: 1 / -1;
  border: 1px dashed #cfd8e0;
  border-radius: 1.5rem;
  background: #fbfdff;
  color: #688093;
  padding: 2rem;
  text-align: center;
}

@media (min-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1200px) {
  .filter-grid {
    grid-template-columns: 1.3fr repeat(3, minmax(0, 1fr));
  }

  .card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
