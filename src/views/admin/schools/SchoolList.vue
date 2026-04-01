<template>
  <div class="school-list-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 mb-0">Ecoles</h1>
        <p class="text-muted small mb-0">Gestion des etablissements scolaires</p>
      </div>
      <router-link to="/admin/schools/create" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i>
        Nouvelle ecole
      </router-link>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6 col-lg-4">
            <label class="form-label small fw-semibold">Recherche</label>
            <div class="input-group">
              <span class="input-group-text bg-light">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="filters.search"
                type="text"
                class="form-control"
                placeholder="Nom de l'ecole"
                @input="applyFilters"
              />
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <label class="form-label small fw-semibold">Type</label>
            <select v-model="filters.type" class="form-select" @change="applyFilters">
              <option value="">Tous les types</option>
              <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="col-md-6 col-lg-3">
            <label class="form-label small fw-semibold">Commune</label>
            <select
              v-model="filters.commune_id"
              class="form-select"
              :disabled="schoolStore.loadingReferenceData"
              @change="applyFilters"
            >
              <option value="">Toutes les communes</option>
              <option
                v-for="commune in schoolStore.referenceData.communes"
                :key="commune.id"
                :value="String(commune.id)"
              >
                {{ commune.name }}
              </option>
            </select>
          </div>

          <div
            v-if="filters.search || filters.type || filters.commune_id"
            class="col-lg-auto d-flex align-items-end"
          >
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="bi bi-arrow-clockwise"></i>
              Reinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="schoolStore.error" class="alert alert-danger" role="alert">
      {{ schoolStore.error }}
    </div>

    <app-spinner v-if="schoolStore.loading" />

    <div v-else class="card">
      <div class="card-body border-bottom d-flex justify-content-between align-items-center">
        <span class="badge bg-primary">
          {{ schoolStore.pagination.total }}
          <small>ecoles</small>
        </span>
      </div>

      <app-table
        :columns="tableColumns"
        :rows="schoolStore.items"
        :loading="schoolStore.loading"
        @row-click="handleRowClick"
      >
        <template #cell-name="{ row }">
          <strong>{{ row.name }}</strong>
        </template>

        <template #cell-type="{ row }">
          <span class="badge bg-light text-dark">
            {{ getTypeLabel(row.type) }}
          </span>
        </template>

        <template #cell-commune="{ row }">
          {{ row.commune?.name || getCommuneName(row.commune_id) || '-' }}
        </template>

        <!--<template #cell-actions="{ row }">
          <div class="btn-group btn-group-sm">
            <router-link
              :to="`/admin/schools/${row.id}/edit`"
              class="btn btn-outline-warning"
              title="Modifier"
              @click.stop
            >
              <i class="bi bi-pencil"></i>
            </router-link>
            <button
              class="btn btn-outline-danger"
              title="Supprimer"
              @click.stop="openDeleteModal(row)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </template>-->

        <template #cell-actions="{ row }">
          <div class="action-row">
            <button
              type="button"
              class="icon-action icon-action--secondary"
              @click.stop="goToEdit(row.id)"
            >
              Modifier
            </button>
            <button
              type="button"
              class="icon-action icon-action--danger"
              @click.stop="openDeleteModal(row)"
            >
              Supprimer
            </button>
          </div>
        </template>
      </app-table>
    </div>

    <div v-if="!schoolStore.loading" class="mt-4">
      <app-pagination
        :current-page="schoolStore.pagination.current_page"
        :total-pages="schoolStore.pagination.last_page"
        :total-items="schoolStore.pagination.total"
        :per-page="schoolStore.pagination.per_page"
        :show-info="true"
        @page-changed="handlePageChange"
      />
    </div>

    <app-modal v-if="showDeleteModal" title="Supprimer l'ecole" centered @close="closeDeleteModal">
      <p class="mb-2">
        Voulez-vous vraiment supprimer
        <strong>{{ selectedSchool ? selectedSchool.name : '' }}</strong>
        ?
      </p>
      <p class="text-muted small mb-0">Cette action est irreversible.</p>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="schoolStore.saving"
          @click="closeDeleteModal"
        >
          Annuler
        </button>
        <button
          type="button"
          class="btn btn-danger"
          :disabled="schoolStore.saving"
          @click="confirmDelete"
        >
          <span v-if="schoolStore.saving" class="spinner-border spinner-border-sm me-2"></span>
          Supprimer
        </button>
      </template>
    </app-modal>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { useSchoolStore } from '@/stores/schools.js'
import { schoolTypeOptions } from '@/components/schools/SchoolFormFields.vue'

//const selectedSchool = ref(null)
//const showDeleteModal = ref(false)
export default defineComponent({
  name: 'SchoolList',
  components: {
    AppPagination,
    AppSpinner,
    AppTable,
    AppModal,
  },
  setup() {
    const router = useRouter()
    const schoolStore = useSchoolStore()
    const { showToast } = useToast()

    return { router, schoolStore, showToast } // ✅ plus de selectedSchool/deleteModal ici
  },
  data() {
    return {
      filters: { search: '', type: '', commune_id: '' },
      showDeleteModal: false, // ✅ ajouté
      selectedSchool: null, // ✅ ajouté
      typeOptions: schoolTypeOptions,
      tableColumns: [
        { key: 'name', label: 'Nom' },
        { key: 'type', label: 'Type' },
        { key: 'commune', label: 'Commune' },
        { key: 'actions', label: 'Actions', width: '120px' },
      ],
    }
  },
  async mounted() {
    await this.initialize()
  },
  methods: {
    async initialize() {
      try {
        await this.schoolStore.loadReferenceData()
        await this.fetchSchools()
      } catch {
        this.showToast({
          type: 'error',
          message: 'Erreur lors du chargement des ecoles',
        })
      }
    },

    async fetchSchools() {
      this.schoolStore.setFilters({
        search: this.filters.search.trim(),
        type: this.filters.type,
        commune_id: this.filters.commune_id,
      })

      try {
        await this.schoolStore.fetchAll()
      } catch {
        this.showToast({
          type: 'error',
          message: 'Impossible de charger la liste des ecoles',
        })
      }
    },

    applyFilters() {
      this.schoolStore.resetPagination()
      this.fetchSchools()
    },

    resetFilters() {
      this.filters = {
        search: '',
        type: '',
        commune_id: '',
      }
      this.schoolStore.clearFilters()
      this.schoolStore.resetPagination()
      this.fetchSchools()
    },
    goToEdit(id) {
      this.router.push(`/admin/schools/${id}/edit`)
    },

    handlePageChange(page) {
      this.schoolStore.pagination.current_page = page
      this.fetchSchools()
    },

    handleRowClick(row) {
      this.router.push(`/admin/schools/${row.id}/edit`)
    },

    getTypeLabel(type) {
      return this.typeOptions.find((option) => option.value === type)?.label || type || '-'
    },

    getCommuneName(communeId) {
      const commune = this.schoolStore.referenceData.communes.find(
        (item) => String(item.id) === String(communeId),
      )
      return commune?.name || ''
    },

    openDeleteModal(row) {
      this.selectedSchool = row // ✅ pas de .value
      this.showDeleteModal = true // ✅ pas de .value
    },

    closeDeleteModal() {
      this.showDeleteModal = false // ✅
      this.selectedSchool = null // ✅
    },
    async confirmDelete() {
      if (!this.selectedSchool) return // ✅ déjà correct, mais ça marchera maintenant

      const schoolName = this.selectedSchool.name
      try {
        await this.schoolStore.remove(this.selectedSchool.id)
        this.closeDeleteModal() // ✅ utiliser la méthode pour réinitialiser
        await this.fetchSchools()
        this.showToast({ type: 'success', message: `${schoolName} a été supprimée avec succès` })
      } catch {
        this.showToast({ type: 'error', message: "Erreur lors de la suppression de l'école" })
      }
    },
  },
})
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
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
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
