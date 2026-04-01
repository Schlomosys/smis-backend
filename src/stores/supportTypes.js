import { defineStore } from 'pinia'
import supportTypeService from '@/services/supportTypeService.js'

function normalizeCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function normalizeRecord(payload) {
  if (payload?.data && !Array.isArray(payload.data)) {
    return payload.data
  }
  return payload
}

export const useSupportTypeStore = defineStore('supportTypes', {
  state: () => ({
    items: [],
    dropdownItems: [],
    current: null,
    loading: false,
    saving: false,
    loadingDropdown: false,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    },
    filters: {
      search: '',
      sort_by: 'name',
      sort_direction: 'asc',
    },
    error: null,
    dropdownError: null,
  }),

  getters: {
    getById: (state) => (id) => {
      return state.items.find((item) => String(item.id) === String(id)) || null
    },
  },

  actions: {
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await supportTypeService.getAll({
          page: this.pagination.current_page,
          per_page: this.pagination.per_page,
          ...this.filters,
          ...params,
        })

        this.items = normalizeCollection(response)
        this.pagination = {
          current_page: response?.current_page || 1,
          last_page: response?.last_page || 1,
          per_page: response?.per_page || this.pagination.per_page,
          total: response?.total || this.items.length,
        }

        return this.items
      } catch (error) {
        console.error('Error fetching support types:', error)
        this.error =
          error.response?.data?.message || error.message || 'Erreur lors du chargement des types d appui'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id) {
      this.loading = true
      this.error = null

      try {
        const response = await supportTypeService.getById(id)
        const item = normalizeRecord(response)
        this.current = item

        const index = this.items.findIndex((entry) => String(entry.id) === String(id))
        if (index !== -1) {
          this.items[index] = item
        }

        return item
      } catch (error) {
        console.error('Error fetching support type:', error)
        this.error =
          error.response?.data?.message || error.message || 'Erreur lors du chargement du type d appui'
        throw error
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      this.saving = true
      this.error = null

      try {
        const response = await supportTypeService.create(data)
        return normalizeRecord(response)
      } catch (error) {
        console.error('Error creating support type:', error)
        this.error =
          error.response?.data?.message || error.message || 'Erreur lors de la creation du type d appui'
        throw error
      } finally {
        this.saving = false
      }
    },

    async update(id, data) {
      this.saving = true
      this.error = null

      try {
        const response = await supportTypeService.update(id, data)
        const item = normalizeRecord(response)

        const index = this.items.findIndex((entry) => String(entry.id) === String(id))
        if (index !== -1) {
          this.items[index] = item
        }

        if (this.current && String(this.current.id) === String(id)) {
          this.current = item
        }

        return item
      } catch (error) {
        console.error('Error updating support type:', error)
        this.error =
          error.response?.data?.message || error.message || 'Erreur lors de la mise a jour du type d appui'
        throw error
      } finally {
        this.saving = false
      }
    },

    async remove(id) {
      this.saving = true
      this.error = null

      try {
        await supportTypeService.delete(id)

        this.items = this.items.filter((item) => String(item.id) !== String(id))
        this.dropdownItems = this.dropdownItems.filter((item) => String(item.id) !== String(id))

        if (this.current && String(this.current.id) === String(id)) {
          this.current = null
        }

        if (this.pagination.total > 0) {
          this.pagination.total -= 1
        }
      } catch (error) {
        console.error('Error deleting support type:', error)
        this.error =
          error.response?.data?.message || error.message || 'Erreur lors de la suppression du type d appui'
        throw error
      } finally {
        this.saving = false
      }
    },

    async fetchDropdownList(params = {}) {
      this.loadingDropdown = true
      this.dropdownError = null

      try {
        const response = await supportTypeService.getDropdownList(params)
        this.dropdownItems = normalizeCollection(response)
        return this.dropdownItems
      } catch (error) {
        console.error('Error fetching support type dropdown list:', error)
        this.dropdownError =
          error.response?.data?.message || error.message || 'Erreur lors du chargement de la liste des types d appui'
        throw error
      } finally {
        this.loadingDropdown = false
      }
    },

    setFilters(filters = {}) {
      this.filters = {
        ...this.filters,
        ...filters,
      }
    },

    clearFilters() {
      this.filters = {
        search: '',
        sort_by: 'name',
        sort_direction: 'asc',
      }
    },

    resetPagination() {
      this.pagination.current_page = 1
    },
  },
})
