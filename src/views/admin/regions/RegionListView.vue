<template>
  <div class="region-list-view">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 mb-0">Régions</h1>
        <p class="text-muted small">Gestion des régions</p>
      </div>
      <router-link to="/admin/regions/create" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i>
        Nouvelle région
      </router-link>
    </div>

    <!-- FILTER BAR -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <!-- Search Input -->
          <div class="col-md-6 col-lg-3">
            <label class="form-label small fw-semibold">Recherche</label>
            <div class="input-group">
              <span class="input-group-text bg-light">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="filters.search"
                type="text"
                class="form-control"
                placeholder="Nom de la région..."
                @input="applyFilters"
              />
            </div>
          </div>

          <!-- Country Filter -->
          <div class="col-md-6 col-lg-3">
            <label class="form-label small fw-semibold">Pays</label>
            <select v-model="filters.country_id" class="form-select" @change="applyFilters">
              <option value="">Tous les pays</option>
              <option
                v-for="country in regionStore.referenceData.countries"
                :key="country.id"
                :value="country.id"
              >
                {{ country.name }}
              </option>
            </select>
          </div>

          <!-- Reset Button -->
          <div v-if="filters.search || filters.country_id" class="col-12 col-lg-auto d-flex align-items-end">
            <button class="btn btn-outline-secondary btn-sm w-100" @click="handleResetFilters">
              <i class="bi bi-arrow-clockwise"></i>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- COUNTERS -->
    <div class="row mb-3 g-2">
      <div class="col-auto">
        <span class="badge bg-primary">
          {{ regionStore.items.length }}
          <small>régions</small>
        </span>
      </div>
    </div>

    <!-- LOADING SPINNER -->
    <app-spinner v-if="regionStore.loading" />

    <!-- TABLE -->
    <div v-show="!regionStore.loading" class="card">
      <div v-if="regionStore.items.length === 0" class="card-body text-center">
        <div class="text-muted py-5">
          <i class="bi bi-inbox" style="font-size: 3rem; opacity: 0.3"></i>
          <p class="mt-3">Aucune région trouvée</p>
        </div>
      </div>

      <app-table
        v-else
        :columns="tableColumns"
        :rows="regionStore.items"
        clickable
        @row-click="handleRowClick"
      >
        <!-- Name -->
        <template #name="{ row }">
          <strong>{{ row.name }}</strong>
        </template>

        <!-- Country -->
        <template #country="{ row }">
          <span v-if="row.country" class="badge bg-light text-dark">
            {{ row.country.name }}
          </span>
          <span v-else class="text-muted">-</span>
        </template>

        <!-- Actions -->
        <template #actions="{ row }">
          <div class="btn-group btn-group-sm">
            <!-- Edit Button -->
            <router-link
              :to="`/admin/regions/${row.id}/edit`"
              class="btn btn-outline-warning"
              title="Modifier"
            >
              <i class="bi bi-pencil"></i>
            </router-link>

            <!-- Delete Button -->
            <button
              class="btn btn-outline-danger"
              title="Supprimer"
              @click.stop="handleDeleteClick(row)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </template>
      </app-table>
    </div>

    <!-- PAGINATION -->
    <div v-show="!regionStore.loading" class="mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <small class="text-muted">
          Affichage
          <strong>{{ getPaginationStart() }}-{{ getPaginationEnd() }}</strong>
          sur
          <strong>{{ regionStore.pagination.total }}</strong>
          résultats
        </small>
        <app-pagination
          v-model="regionStore.pagination.current_page"
          :total-pages="regionStore.pagination.last_page"
          @update:model-value="handlePageChange"
        />
      </div>
    </div>

    <!-- DELETE CONFIRMATION MODAL -->
    <div class="modal fade" id="deleteModal" ref="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle"></i>
              Confirmer la suppression
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              Êtes-vous sûr de vouloir supprimer la région
              <strong>{{ selectedRegion?.name }}</strong>
              ?
            </p>
            <p class="text-muted small">
              Cette action est irréversible.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button
              type="button"
              class="btn btn-danger"
              :disabled="regionStore.saving"
              @click="handleConfirmDelete"
            >
              <span
                v-if="regionStore.saving"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useRegionStore } from '@/stores/regions'
import { useToast } from '@/composables/useToast'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'

export default defineComponent({
  name: 'RegionListView',
  components: {
    AppTable,
    AppPagination,
    AppSpinner,
  },
  setup() {
    const router = useRouter()
    const regionStore = useRegionStore()
    const { showToast } = useToast()

    return {
      router,
      regionStore,
      showToast,
    }
  },
  data() {
    return {
      selectedRegion: null,
      filters: {
        search: '',
        country_id: '',
      },
      tableColumns: [
        { key: 'name', label: 'Nom de la région' },
        { key: 'country', label: 'Pays' },
        { key: 'actions', label: 'Actions' },
      ],
    }
  },
  mounted() {
    this.initialize()
  },
  methods: {
    async initialize() {
      try {
        // Load reference data first
        await this.regionStore.loadReferenceData()
        // Then fetch the list
        await this.fetchRegions()
      } catch (error) {
        console.error('Initialization error:', error)
        this.showToast({
          type: 'error',
          message: 'Erreur lors du chargement des données',
        })
      }
    },

    async fetchRegions() {
      try {
        await this.regionStore.fetchAll({
          page: this.regionStore.pagination.current_page,
          per_page: this.regionStore.pagination.per_page,
          search: this.filters.search,
          country_id: this.filters.country_id,
        })
      } catch (error) {
        console.error('Error fetching regions:', error)
        this.showToast({
          type: 'error',
          message: 'Erreur lors du chargement de la liste',
        })
      }
    },

    applyFilters() {
      // Reset to first page when filters change
      this.regionStore.resetPagination()
      this.fetchRegions()
    },

    handleResetFilters() {
      this.filters.search = ''
      this.filters.country_id = ''
      this.regionStore.clearFilters()
      this.regionStore.resetPagination()
      this.fetchRegions()
    },

    handlePageChange(page) {
      this.regionStore.pagination.current_page = page
      this.fetchRegions()
    },

    handleRowClick(row) {
      this.router.push(`/admin/regions/${row.id}/edit`)
    },

    handleDeleteClick(region) {
      this.selectedRegion = region
      const deleteModal = new window.bootstrap.Modal(document.getElementById('deleteModal'))
      deleteModal.show()
    },

    async handleConfirmDelete() {
      if (!this.selectedRegion) return

      const regionName = this.selectedRegion.name

      try {
        await this.regionStore.remove(this.selectedRegion.id)

        // Close modal
        const deleteModal = window.bootstrap.Modal.getInstance(
          document.getElementById('deleteModal'),
        )
        deleteModal.hide()

        this.selectedRegion = null

        this.showToast({
          type: 'success',
          message: `${regionName} a été supprimé avec succès`,
        })

        // Refresh list
        this.fetchRegions()
      } catch (error) {
        console.error('Error deleting region:', error)
        this.showToast({
          type: 'error',
          message: 'Erreur lors de la suppression de la région',
        })
      }
    },

    getPaginationStart() {
      const { current_page, per_page } = this.regionStore.pagination
      return (current_page - 1) * per_page + 1
    },

    getPaginationEnd() {
      const { current_page, per_page, total } = this.regionStore.pagination
      const end = current_page * per_page
      return Math.min(end, total)
    },
  },
})
</script>