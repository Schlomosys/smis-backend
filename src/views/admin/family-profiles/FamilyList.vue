<template>
  <div class="family-list-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 mb-0">Profils familiaux</h1>
        <p class="text-muted small mb-0">Gestion des familles et de leurs revenus</p>
      </div>
      <router-link to="/admin/family-profiles/create" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i>
        Nouvelle famille
      </router-link>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-lg-5">
            <label class="form-label small fw-semibold">Recherche</label>
            <div class="input-group">
              <span class="input-group-text bg-light">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="filters.search"
                type="text"
                class="form-control"
                placeholder="Rechercher par famille ou tuteur"
                @input="applyFilters"
              />
            </div>
            <small class="text-muted">
              Recherche sur <strong>family_name</strong> et <strong>guardian_name</strong>
            </small>
          </div>

          <div v-if="filters.search" class="col-lg-auto d-flex align-items-end">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="bi bi-arrow-clockwise"></i>
              Reinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="familyStore.error" class="alert alert-danger" role="alert">
      {{ familyStore.error }}
    </div>

    <app-spinner v-if="familyStore.loading" />

    <div v-else class="card">
      <div class="card-body border-bottom d-flex justify-content-between align-items-center">
        <span class="badge bg-primary">
          {{ familyStore.pagination.total }}
          <small>familles</small>
        </span>
      </div>

      <app-table
        :columns="tableColumns"
        :rows="familyStore.items"
        :loading="familyStore.loading"
        @row-click="handleRowClick"
      >
        <template #cell-family_name="{ row }">
          <div>
            <strong>{{ row.family_name }}</strong>
            <div class="small text-muted">{{ row.guardian_name }}</div>
          </div>
        </template>

        <template #cell-phone="{ row }">
          {{ row.phone || '-' }}
        </template>

        <template #cell-children_count="{ row }">
          <span class="badge bg-light text-dark">
            {{ row.children_count ?? 0 }}
          </span>
        </template>

        <template #cell-monthly_income="{ row }">
          <strong>{{ formatIncome(row.monthly_income) }}</strong>
        </template>

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

    <div v-if="!familyStore.loading" class="mt-4">
      <app-pagination
        :current-page="familyStore.pagination.current_page"
        :total-pages="familyStore.pagination.last_page"
        :total-items="familyStore.pagination.total"
        :per-page="familyStore.pagination.per_page"
        :show-info="true"
        @page-changed="handlePageChange"
      />
    </div>

    <app-modal
      v-if="showDeleteModal"
      title="Supprimer le profil familial"
      centered
      @close="closeDeleteModal"
    >
      <p class="mb-2">
        Voulez-vous vraiment supprimer le profil de
        <strong>{{ selectedFamily ? selectedFamily.family_name : '' }}</strong>
        ?
      </p>
      <p class="text-muted small mb-0">Cette action est irreversible.</p>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="familyStore.saving"
          @click="closeDeleteModal"
        >
          Annuler
        </button>
        <button
          type="button"
          class="btn btn-danger"
          :disabled="familyStore.saving"
          @click="confirmDelete"
        >
          <span v-if="familyStore.saving" class="spinner-border spinner-border-sm me-2"></span>
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
import { formatCurrency } from '@/utils/formatters.js'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { useFamilyProfileStore } from '@/stores/familyProfiles.js'

export default defineComponent({
  name: 'FamilyList',
  components: {
    AppPagination,
    AppSpinner,
    AppTable,
    AppModal,
  },
  setup() {
    const router = useRouter()
    const familyStore = useFamilyProfileStore()
    const { showToast } = useToast()

    return {
      router,
      familyStore,
      showToast,
    }
  },
  data() {
    return {
      filters: {
        search: '',
      },
      showDeleteModal: false,
      selectedFamily: null,
      tableColumns: [
        { key: 'family_name', label: 'Famille / Tuteur' },
        { key: 'phone', label: 'Telephone' },
        { key: 'children_count', label: 'Enfants' },
        { key: 'monthly_income', label: 'Revenu mensuel' },
        { key: 'actions', label: 'Actions', width: '120px' },
      ],
    }
  },
  async mounted() {
    await this.fetchFamilies()
  },
  methods: {
    async fetchFamilies() {
      this.familyStore.setFilters({
        search: this.filters.search.trim(),
      })

      try {
        await this.familyStore.fetchAll()
      } catch {
        this.showToast({
          type: 'error',
          message: 'Impossible de charger la liste des familles',
        })
      }
    },

    applyFilters() {
      this.familyStore.resetPagination()
      this.fetchFamilies()
    },

    resetFilters() {
      this.filters.search = ''
      this.familyStore.clearFilters()
      this.familyStore.resetPagination()
      this.fetchFamilies()
    },

    goToEdit(id) {
      this.router.push(`/admin/family-profiles/${id}/edit`)
    },

    handlePageChange(page) {
      this.familyStore.pagination.current_page = page
      this.fetchFamilies()
    },

    handleRowClick(row) {
      this.router.push(`/admin/family-profiles/${row.id}/edit`)
    },

    formatIncome(value) {
      const amount = Number(value || 0)
      return formatCurrency(Number.isNaN(amount) ? 0 : amount)
    },

    openDeleteModal(family) {
      this.selectedFamily = family
      this.showDeleteModal = true
    },

    closeDeleteModal() {
      this.showDeleteModal = false
      this.selectedFamily = null
    },

    async confirmDelete() {
      if (!this.selectedFamily) return

      const familyName = this.selectedFamily.family_name

      try {
        await this.familyStore.remove(this.selectedFamily.id)

        this.closeDeleteModal()

        if (this.familyStore.items.length === 0 && this.familyStore.pagination.current_page > 1) {
          this.familyStore.pagination.current_page -= 1
        }

        await this.fetchFamilies()

        this.showToast({
          type: 'success',
          message: `${familyName} a ete supprime avec succes`,
        })
      } catch {
        this.showToast({
          type: 'error',
          message: 'Erreur lors de la suppression du profil familial',
        })
      }
    },
  },
})
</script>

<style scoped>
.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.icon-action {
  border: 0;
  border-radius: 999px;
  background: #ff6900;
  color: #ffffff;
  padding: 0.55rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 700;
  transition: all 0.2s ease;
  cursor: pointer;
}

.icon-action:hover {
  transform: translateY(-1px);
}

.icon-action--secondary {
  background: #045480;
}

.icon-action--danger {
  background: #fff1e8;
  color: #cc5200;
}
</style>
