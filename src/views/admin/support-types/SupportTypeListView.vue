<template>
  <div class="support-type-list-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 mb-0">Types d'appui</h1>
        <p class="text-muted small mb-0">Gestion des types d'appui</p>
      </div>
      <button type="button" class="btn btn-primary" @click="openCreateModal">
        <i class="bi bi-plus-lg"></i>
        Nouveau type d'appui
      </button>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-8 col-lg-5">
            <label class="form-label small fw-semibold">Recherche</label>
            <div class="input-group">
              <span class="input-group-text bg-light">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="filters.search"
                type="text"
                class="form-control"
                placeholder="Rechercher par nom"
                @input="applyFilters"
              />
            </div>
          </div>

          <div v-if="filters.search" class="col-lg-auto">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="bi bi-arrow-clockwise"></i>
              Reinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="supportTypeStore.error" class="alert alert-danger" role="alert">
      {{ supportTypeStore.error }}
    </div>

    <div class="card">
      <div class="card-body border-bottom d-flex justify-content-between align-items-center">
        <span class="badge bg-primary">
          {{ supportTypeStore.pagination.total }}
          <small>types d'appui</small>
        </span>
      </div>

      <app-table
        :columns="tableColumns"
        :rows="supportTypeStore.items"
        :loading="supportTypeStore.loading"
      >
        <template #cell-name="{ row }">
          <div class="fw-semibold">{{ row.name }}</div>
        </template>

        <template #cell-description="{ row }">
          <span class="text-muted">
            {{ row.description || '-' }}
          </span>
        </template>

        <template #cell-actions="{ row }">
          <div class="action-row">
            <button
              type="button"
              class="icon-action icon-action--secondary"
              @click.stop="openEditModal(row)"
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

    <div v-if="!supportTypeStore.loading" class="mt-4">
      <app-pagination
        :current-page="supportTypeStore.pagination.current_page"
        :total-pages="supportTypeStore.pagination.last_page"
        :total-items="supportTypeStore.pagination.total"
        :per-page="supportTypeStore.pagination.per_page"
        @page-changed="handlePageChange"
      />
    </div>

    <support-type-modal-form
      :show="showFormModal"
      :support-type="selectedSupportType"
      :saving="supportTypeStore.saving"
      :form-error="formError"
      @close="closeFormModal"
      @submit="handleSave"
    />

    <app-modal
      v-if="showDeleteModal"
      title="Supprimer le type d'appui"
      centered
      @close="closeDeleteModal"
    >
      <p class="mb-2">
        Voulez-vous vraiment supprimer
        <strong>{{ selectedSupportType ? selectedSupportType.name : '' }}</strong>
        ?
      </p>
      <p class="text-muted small mb-0">Cette action est irreversible.</p>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="supportTypeStore.saving"
          @click="closeDeleteModal"
        >
          Annuler
        </button>
        <button
          type="button"
          class="btn btn-danger"
          :disabled="supportTypeStore.saving"
          @click="confirmDelete"
        >
          <span v-if="supportTypeStore.saving" class="spinner-border spinner-border-sm me-2"></span>
          Supprimer
        </button>
      </template>
    </app-modal>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useToast } from '@/composables/useToast'
import { useSupportTypeStore } from '@/stores/supportTypes.js'
import SupportTypeModalForm from '@/components/support-types/SupportTypeModalForm.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppTable from '@/components/ui/AppTable.vue'

export default defineComponent({
  name: 'SupportTypeList',
  components: {
    SupportTypeModalForm,
    AppModal,
    AppPagination,
    AppTable,
  },
  setup() {
    const supportTypeStore = useSupportTypeStore()
    const { showToast } = useToast()

    return {
      supportTypeStore,
      showToast,
    }
  },
  data() {
    return {
      filters: {
        search: '',
      },
      showFormModal: false,
      showDeleteModal: false,
      selectedSupportType: null,
      formError: '',
      tableColumns: [
        { key: 'name', label: 'Nom' },
        { key: 'description', label: 'Description' },
        { key: 'actions', label: 'Actions', width: '160px' },
      ],
    }
  },
  async mounted() {
    await this.fetchSupportTypes()
  },
  methods: {
    async fetchSupportTypes() {
      this.supportTypeStore.setFilters({
        search: this.filters.search.trim(),
      })

      try {
        await this.supportTypeStore.fetchAll()
      } catch {
        this.showToast({
          type: 'error',
          message: "Impossible de charger la liste des types d'appui",
        })
      }
    },

    applyFilters() {
      this.supportTypeStore.resetPagination()
      this.fetchSupportTypes()
    },

    resetFilters() {
      this.filters.search = ''
      this.supportTypeStore.clearFilters()
      this.supportTypeStore.resetPagination()
      this.fetchSupportTypes()
    },

    handlePageChange(page) {
      this.supportTypeStore.pagination.current_page = page
      this.fetchSupportTypes()
    },

    openCreateModal() {
      this.formError = ''
      this.selectedSupportType = null
      this.showFormModal = true
    },

    openEditModal(row) {
      this.formError = ''
      this.selectedSupportType = { ...row }
      this.showFormModal = true
    },

    closeFormModal() {
      this.formError = ''
      this.showFormModal = false
      this.selectedSupportType = null
    },

    async handleSave({ id, payload }) {
      this.formError = ''

      try {
        if (id) {
          await this.supportTypeStore.update(id, payload)
          this.showToast({
            type: 'success',
            message: "Type d'appui mis a jour avec succes",
          })
        } else {
          await this.supportTypeStore.create(payload)
          this.showToast({
            type: 'success',
            message: "Type d'appui cree avec succes",
          })
        }

        this.closeFormModal()
        await this.fetchSupportTypes()
        await this.supportTypeStore.fetchDropdownList().catch(() => {})
      } catch (error) {
        if (error.response?.status === 422 && error.response.data?.message) {
          this.formError = error.response.data.message
          return
        }

        if (error.response?.status === 422 && error.response.data?.errors) {
          this.formError = Object.values(error.response.data.errors).flat().join(' ')
          return
        }

        this.formError =
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la sauvegarde du type d'appui"
      }
    },

    openDeleteModal(row) {
      this.selectedSupportType = row
      this.showDeleteModal = true
    },

    closeDeleteModal() {
      this.showDeleteModal = false
      this.selectedSupportType = null
    },

    async confirmDelete() {
      if (!this.selectedSupportType) return

      const supportTypeName = this.selectedSupportType.name

      try {
        await this.supportTypeStore.remove(this.selectedSupportType.id)

        this.closeDeleteModal()

        if (
          this.supportTypeStore.items.length === 0 &&
          this.supportTypeStore.pagination.current_page > 1
        ) {
          this.supportTypeStore.pagination.current_page -= 1
        }

        await this.fetchSupportTypes()
        await this.supportTypeStore.fetchDropdownList().catch(() => {})

        this.showToast({
          type: 'success',
          message: `${supportTypeName} a ete supprime avec succes`,
        })
      } catch {
        this.showToast({
          type: 'error',
          message: "Erreur lors de la suppression du type d'appui",
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
