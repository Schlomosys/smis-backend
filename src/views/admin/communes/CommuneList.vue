<template>
  <div class="commune-list-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 mb-0">Communes</h1>
        <p class="text-muted small mb-0">Gestion des communes par region</p>
      </div>
      <router-link to="/admin/communes/create" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i>
        Nouvelle commune
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
                placeholder="Nom de la commune"
                @input="applyFilters"
              />
            </div>
          </div>

          <div class="col-md-6 col-lg-4">
            <label class="form-label small fw-semibold">Region</label>
            <select
              v-model="filters.region_id"
              class="form-select"
              :disabled="communeStore.loadingReferenceData"
              @change="applyFilters"
            >
              <option value="">Toutes les regions</option>
              <option
                v-for="region in communeStore.referenceData.regions"
                :key="region.id"
                :value="String(region.id)"
              >
                {{ region.name }}
              </option>
            </select>
          </div>

          <div
            v-if="filters.search || filters.region_id"
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

    <div v-if="communeStore.error" class="alert alert-danger" role="alert">
      {{ communeStore.error }}
    </div>

    <app-spinner v-if="communeStore.loading" />

    <div v-else class="card">
      <div class="card-body border-bottom d-flex justify-content-between align-items-center">
        <span class="badge bg-primary">
          {{ communeStore.pagination.total }}
          <small>communes</small>
        </span>
      </div>

      <app-table
        :columns="tableColumns"
        :rows="communeStore.items"
        :loading="communeStore.loading"
        @row-click="handleRowClick"
      >
        <template #cell-name="{ row }">
          <strong>{{ row.name }}</strong>
        </template>

        <template #cell-region="{ row }">
          <span class="badge bg-light text-dark">
            {{ row.region?.name || getRegionName(row.region_id) || '-' }}
          </span>
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

    <div v-if="!communeStore.loading" class="mt-4">
      <app-pagination
        :current-page="communeStore.pagination.current_page"
        :total-pages="communeStore.pagination.last_page"
        :total-items="communeStore.pagination.total"
        :per-page="communeStore.pagination.per_page"
        :show-info="true"
        @page-changed="handlePageChange"
      />
    </div>

    <app-modal
      v-if="showDeleteModal"
      title="Supprimer la commune"
      centered
      @close="closeDeleteModal"
    >
      <p class="mb-2">
        Voulez-vous vraiment supprimer
        <strong>{{ selectedCommune ? selectedCommune.name : '' }}</strong>
        ?
      </p>
      <p class="text-muted small mb-0">Cette action est irreversible.</p>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="communeStore.saving"
          @click="closeDeleteModal"
        >
          Annuler
        </button>
        <button
          type="button"
          class="btn btn-danger"
          :disabled="communeStore.saving"
          @click="confirmDelete"
        >
          <span v-if="communeStore.saving" class="spinner-border spinner-border-sm me-2"></span>
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
import { useCommuneStore } from '@/stores/communes.js'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppModal from '@/components/ui/AppModal.vue'

export default defineComponent({
  name: 'CommuneList',
  components: {
    AppPagination,
    AppSpinner,
    AppTable,
    AppModal,
  },
  setup() {
    const router = useRouter()
    const communeStore = useCommuneStore()
    const { showToast } = useToast()

    return {
      router,
      communeStore,
      showToast,
    }
  },
  data() {
    return {
      filters: {
        search: '',
        region_id: '',
      },
      showDeleteModal: false,
      selectedCommune: null,
      tableColumns: [
        { key: 'name', label: 'Nom' },
        { key: 'region', label: 'Region' },
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
        await this.communeStore.loadReferenceData()
        await this.fetchCommunes()
      } catch {
        this.showToast({
          type: 'error',
          message: 'Erreur lors du chargement des communes',
        })
      }
    },

    async fetchCommunes() {
      this.communeStore.setFilters({
        search: this.filters.search.trim(),
        region_id: this.filters.region_id,
      })

      try {
        await this.communeStore.fetchAll()
      } catch {
        this.showToast({
          type: 'error',
          message: 'Impossible de charger la liste des communes',
        })
      }
    },

    applyFilters() {
      this.communeStore.resetPagination()
      this.fetchCommunes()
    },

    resetFilters() {
      this.filters = {
        search: '',
        region_id: '',
      }
      this.communeStore.clearFilters()
      this.communeStore.resetPagination()
      this.fetchCommunes()
    },

    goToEdit(id) {
      this.router.push(`/admin/communes/${id}/edit`)
    },

    handlePageChange(page) {
      this.communeStore.pagination.current_page = page
      this.fetchCommunes()
    },

    handleRowClick(row) {
      this.router.push(`/admin/communes/${row.id}/edit`)
    },

    getRegionName(regionId) {
      const region = this.communeStore.referenceData.regions.find(
        (item) => String(item.id) === String(regionId),
      )
      return region?.name || ''
    },

    openDeleteModal(commune) {
      this.selectedCommune = commune
      this.showDeleteModal = true
    },

    closeDeleteModal() {
      this.showDeleteModal = false
      this.selectedCommune = null
    },

    async confirmDelete() {
      if (!this.selectedCommune) return

      const communeName = this.selectedCommune.name

      try {
        await this.communeStore.remove(this.selectedCommune.id)

        this.closeDeleteModal()

        if (this.communeStore.items.length === 0 && this.communeStore.pagination.current_page > 1) {
          this.communeStore.pagination.current_page -= 1
        }

        await this.fetchCommunes()

        this.showToast({
          type: 'success',
          message: `${communeName} a ete supprimee avec succes`,
        })
      } catch {
        this.showToast({
          type: 'error',
          message: 'Erreur lors de la suppression de la commune',
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
