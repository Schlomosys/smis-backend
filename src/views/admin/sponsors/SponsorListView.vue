<template>
  <div class="sponsor-list-view">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 mb-0">Sponsors</h1>
        <p class="text-muted small">Gestion complète des sponsors</p>
      </div>
      <div class="btn-group" role="group">
        <button
          @click="handleExportCSV"
          class="btn btn-outline-secondary"
          title="Exporter en CSV"
        >
          <i class="bi bi-download"></i>
          Exporter
        </button>
        <router-link to="/admin/sponsors/create" class="btn btn-primary">
          <i class="bi bi-plus-lg"></i>
          Ajouter un sponsor
        </router-link>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <!-- Search Input -->
          <div class="col-md-6 col-lg-6">
            <label class="form-label small fw-semibold">Recherche</label>
            <div class="input-group">
              <span class="input-group-text bg-light">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Nom, email ou téléphone..."
                @input="applyFilters"
              />
            </div>
          </div>

          <!-- Reset Button -->
          <div class="col-md-6 col-lg-6 d-flex align-items-end">
            <button
              v-if="searchQuery"
              class="btn btn-outline-secondary btn-sm w-100"
              @click="handleResetFilters"
            >
              <i class="bi bi-arrow-clockwise"></i>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- BULK ACTIONS BAR -->
    <div v-if="selectedIds.size > 0" class="alert alert-info d-flex justify-content-between align-items-center mb-4">
      <div>
        <i class="bi bi-exclamation-circle"></i>
        <strong>{{ selectedIds.size }} sponsor(s) sélectionné(s)</strong>
      </div>
      <div class="btn-group btn-group-sm">
        <button
          @click="handleResetSelection"
          class="btn btn-outline-secondary"
        >
          <i class="bi bi-x-lg"></i>
          Annuler
        </button>
        <button
          @click="handleBulkDelete"
          class="btn btn-outline-danger"
          :disabled="sponsorStore.deleting"
        >
          <i v-if="sponsorStore.deleting" class="bi bi-hourglass-split"></i>
          <i v-else class="bi bi-trash"></i>
          Supprimer sélection
        </button>
      </div>
    </div>

    <!-- LOADING SPINNER -->
    <div v-if="sponsorStore.loading" class="text-center py-5">
      <app-spinner />
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="sponsorStore.filteredItems.length === 0" class="alert alert-info text-center py-5">
      <i class="bi bi-inbox"></i>
      <p class="mb-0 mt-2">Aucun sponsor trouvé</p>
    </div>

    <!-- TABLE -->
    <div v-else class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 3%">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :checked="allSelected"
                  @change="toggleSelectAll"
                />
              </th>
              <th style="width: 22%">
                <a href="#" @click.prevent="sortBy('name')" class="text-decoration-none">
                  Nom <i v-if="isSortedBy('name')" :class="sortIcon" class="bi bi-arrow-down"></i>
                </a>
              </th>
              <th style="width: 22%">Email</th>
              <th style="width: 18%">Téléphone</th>
              <th style="width: 15%">Pays</th>
              <th style="width: 20%" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sponsor in sponsorStore.filteredItems" :key="sponsor.id">
              <td>
                <input
                  type="checkbox"
                  class="form-check-input"
                  :checked="selectedIds.has(sponsor.id)"
                  @change="(e) => toggleSelect(sponsor.id, e.target.checked)"
                />
              </td>
              <td class="fw-semibold">
                <router-link
                  :to="{ name: 'admin-sponsors-detail', params: { id: sponsor.id } }"
                  class="text-decoration-none"
                >
                  {{ sponsor.name }}
                </router-link>
              </td>
              <td>
                <a v-if="sponsor.email" :href="`mailto:${sponsor.email}`" class="text-decoration-none">
                  {{ sponsor.email }}
                </a>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <a v-if="sponsor.phone" :href="`tel:${sponsor.phone}`" class="text-decoration-none">
                  {{ sponsor.phone }}
                </a>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ sponsor.country || '-' }}</td>
              <td class="text-center">
                <div class="btn-group btn-group-sm" role="group">
                  <router-link
                    :to="{ name: 'admin-sponsors-detail', params: { id: sponsor.id } }"
                    class="btn btn-outline-info"
                    title="Voir détails"
                  >
                    <i class="bi bi-eye"></i>
                  </router-link>
                  <router-link
                    :to="{ name: 'admin-sponsors-edit', params: { id: sponsor.id } }"
                    class="btn btn-outline-primary"
                    title="Modifier"
                  >
                    <i class="bi bi-pencil"></i>
                  </router-link>
                  <button
                    @click="handleDelete(sponsor.id, sponsor.name)"
                    class="btn btn-outline-danger"
                    title="Supprimer"
                    :disabled="sponsorStore.deleting"
                  >
                    <i v-if="sponsorStore.deleting && deletingId === sponsor.id" class="bi bi-hourglass-split"></i>
                    <i v-else class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGINATION -->
    <div v-if="sponsorStore.pagination.last_page > 1" class="mt-4">
      <app-pagination
        :current-page="sponsorStore.pagination.current_page"
        :last-page="sponsorStore.pagination.last_page"
        :total="sponsorStore.pagination.total"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSponsorStore } from '@/stores/sponsors.js'
import { useToast } from '@/composables/useToast.js'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const sponsorStore = useSponsorStore()
const { success, error: showError } = useToast()

const searchQuery = ref('')
const deletingId = ref(null)
const selectedIds = ref(new Set())

const sortIcon = computed(() => {
  return sponsorStore.filters.sort_direction === 'desc'
    ? 'bi-arrow-down'
    : 'bi-arrow-up'
})

const allSelected = computed(() => {
  return (
    sponsorStore.filteredItems.length > 0 &&
    sponsorStore.filteredItems.every(item => selectedIds.value.has(item.id))
  )
})

onMounted(async () => {
  try {
    await sponsorStore.fetchAll()
  } catch {
    showError('Erreur lors du chargement des sponsors')
  }
})

const isSortedBy = (field) => {
  return sponsorStore.filters.sort_by === field
}

const sortBy = (field) => {
  if (isSortedBy(field)) {
    sponsorStore.filters.sort_direction =
      sponsorStore.filters.sort_direction === 'desc' ? 'asc' : 'desc'
  } else {
    sponsorStore.setFilters({
      sort_by: field,
      sort_direction: 'asc'
    })
  }
}

const applyFilters = () => {
  sponsorStore.setFilters({ search: searchQuery.value })
}

const handleResetFilters = () => {
  searchQuery.value = ''
  sponsorStore.resetFilters()
}

const handlePageChange = (page) => {
  sponsorStore.setPagination({ current_page: page })
  sponsorStore.fetchAll()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleDelete = async (id, name) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le sponsor "${name}" ?`)) {
    try {
      deletingId.value = id
      await sponsorStore.delete(id)
      success('Sponsor supprimé avec succès')
    } catch {
      showError(sponsorStore.error || 'Erreur lors de la suppression')
    } finally {
      deletingId.value = null
    }
  }
}

// Bulk Actions
const toggleSelect = (id, checked) => {
  if (checked) {
    selectedIds.value.add(id)
  } else {
    selectedIds.value.delete(id)
  }
}

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    sponsorStore.filteredItems.forEach(item => {
      selectedIds.value.add(item.id)
    })
  } else {
    selectedIds.value.clear()
  }
}

const handleResetSelection = () => {
  selectedIds.value.clear()
}

const handleBulkDelete = async () => {
  const count = selectedIds.value.size
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${count} sponsor(s) ?`)) {
    try {
      await sponsorStore.bulkDelete(Array.from(selectedIds.value))
      success(`${count} sponsor(s) supprimé(s) avec succès`)
      selectedIds.value.clear()
    } catch {
      showError(sponsorStore.error || 'Erreur lors de la suppression')
    }
  }
}

// CSV Export
const handleExportCSV = () => {
  const items = sponsorStore.filteredItems.length > 0 
    ? sponsorStore.filteredItems 
    : sponsorStore.items

  if (items.length === 0) {
    showError('Aucun sponsor à exporter')
    return
  }

  // CSV headers
  const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Pays', 'Créé', 'Modifié']
  
  // CSV rows
  const rows = items.map(sponsor => [
    sponsor.id,
    `"${(sponsor.name || '').replace(/"/g, '""')}"`,
    `"${(sponsor.email || '').replace(/"/g, '""')}"`,
    `"${(sponsor.phone || '').replace(/"/g, '""')}"`,
    `"${(sponsor.country || '').replace(/"/g, '""')}"`,
    new Date(sponsor.created_at).toLocaleDateString('fr-FR'),
    new Date(sponsor.updated_at).toLocaleDateString('fr-FR')
  ])

  // Create CSV content
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `sponsors-${new Date().toISOString().split('T')[0]}.csv`)
  link.click()
  
  URL.revokeObjectURL(url)
  success('Sponsors exportés avec succès')
}
</script>

<style scoped>
.sponsor-list-view {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
