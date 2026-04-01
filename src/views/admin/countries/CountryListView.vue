<template>
  <div class="country-list-view">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 mb-0">Pays</h1>
        <p class="text-muted small">Gestion des pays</p>
      </div>
      <router-link to="/admin/countries/create" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i>
        Nouveau pays
      </router-link>
    </div>

    <!-- FILTER BAR -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <!-- Search Input -->
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
                placeholder="Nom du pays..."
                @input="applyFilters"
              />
            </div>
          </div>

          <!-- Reset Button -->
          <div v-if="filters.search" class="col-12 col-lg-auto d-flex align-items-end">
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
          {{ countryStore.items.length }}
          <small>pays</small>
        </span>
      </div>
    </div>

    <!-- LOADING SPINNER -->
    <app-spinner v-if="countryStore.loading" />

    <!-- TABLE -->
    <div v-show="!countryStore.loading" class="card">
      <div v-if="countryStore.items.length === 0" class="card-body text-center">
        <div class="text-muted py-5">
          <i class="bi bi-inbox" style="font-size: 3rem; opacity: 0.3"></i>
          <p class="mt-3">Aucun pays trouvé</p>
        </div>
      </div>

      <app-table
        v-else
        :columns="tableColumns"
        :rows="countryStore.items"
        clickable
        @row-click="handleRowClick"
      >
        <!-- Name -->
        <template #name="{ row }">
          <strong>{{ row.name }}</strong>
        </template>

        <!-- Actions -->
        <template #actions="{ row }">
          <div class="btn-group btn-group-sm">
            <!-- Edit Button -->
            <router-link
              :to="`/admin/countries/${row.id}/edit`"
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
    <div v-show="!countryStore.loading" class="mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <small class="text-muted">
          Affichage
          <strong>{{ getPaginationStart() }}-{{ getPaginationEnd() }}</strong>
          sur
          <strong>{{ countryStore.pagination.total }}</strong>
          résultats
        </small>
        <app-pagination
          v-model="countryStore.pagination.current_page"
          :total-pages="countryStore.pagination.last_page"
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
              Êtes-vous sûr de vouloir supprimer le pays
              <strong>{{ selectedCountry?.name }}</strong>
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
              :disabled="countryStore.saving"
              @click="handleConfirmDelete"
            >
              <span
                v-if="countryStore.saving"
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
import { useCountryStore } from '@/stores/countries'
import { useToast } from '@/composables/useToast'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'

export default defineComponent({
  name: 'CountryListView',
  components: {
    AppTable,
    AppPagination,
    AppSpinner,
  },
  setup() {
    const router = useRouter()
    const countryStore = useCountryStore()
    const { showToast } = useToast()

    return {
      router,
      countryStore,
      showToast,
    }
  },
  data() {
    return {
      selectedCountry: null,
      filters: {
        search: '',
      },
      tableColumns: [
        { key: 'name', label: 'Nom du pays' },
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
        await this.fetchCountries()
      } catch (error) {
        console.error('Initialization error:', error)
        this.showToast({
          type: 'error',
          message: 'Erreur lors du chargement des données',
        })
      }
    },

    async fetchCountries() {
      try {
        await this.countryStore.fetchAll({
          page: this.countryStore.pagination.current_page,
          per_page: this.countryStore.pagination.per_page,
          search: this.filters.search,
        })
      } catch (error) {
        console.error('Error fetching countries:', error)
        this.showToast({
          type: 'error',
          message: 'Erreur lors du chargement de la liste',
        })
      }
    },

    applyFilters() {
      // Reset to first page when filters change
      this.countryStore.resetPagination()
      this.fetchCountries()
    },

    handleResetFilters() {
      this.filters.search = ''
      this.countryStore.clearFilters()
      this.countryStore.resetPagination()
      this.fetchCountries()
    },

    handlePageChange(page) {
      this.countryStore.pagination.current_page = page
      this.fetchCountries()
    },

    handleRowClick(row) {
      this.router.push(`/admin/countries/${row.id}/edit`)
    },

    handleDeleteClick(country) {
      this.selectedCountry = country
      const deleteModal = new window.bootstrap.Modal(document.getElementById('deleteModal'))
      deleteModal.show()
    },

    async handleConfirmDelete() {
      if (!this.selectedCountry) return

      const countryName = this.selectedCountry.name

      try {
        await this.countryStore.remove(this.selectedCountry.id)

        // Close modal
        const deleteModal = window.bootstrap.Modal.getInstance(
          document.getElementById('deleteModal'),
        )
        deleteModal.hide()

        this.selectedCountry = null

        this.showToast({
          type: 'success',
          message: `${countryName} a été supprimé avec succès`,
        })

        // Refresh list
        this.fetchCountries()
      } catch (error) {
        console.error('Error deleting country:', error)
        this.showToast({
          type: 'error',
          message: 'Erreur lors de la suppression du pays',
        })
      }
    },

    getPaginationStart() {
      const { current_page, per_page } = this.countryStore.pagination
      return (current_page - 1) * per_page + 1
    },

    getPaginationEnd() {
      const { current_page, per_page, total } = this.countryStore.pagination
      const end = current_page * per_page
      return Math.min(end, total)
    },
  },
})
</script>