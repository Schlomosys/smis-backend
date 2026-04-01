import { defineStore } from 'pinia'
import communeService from '@/services/CommuneService.js'
import regionService from '@/services/regionService.js'

export const useCommuneStore = defineStore('communes', {
  state: () => ({
    items: [],
    current: null,
    referenceData: {
      regions: [],
    },
    loading: false,
    saving: false,
    loadingReferenceData: false,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    },
    filters: {
      search: '',
      region_id: '',
      sort_by: 'name',
      sort_direction: 'asc',
    },
    error: null,
  }),

  getters: {
    getById: (state) => (id) => state.items.find((item) => item.id === id) || null,
    totalCommunes: (state) => state.pagination.total,
  },

  actions: {
    async loadReferenceData(params = {}) {
      this.loadingReferenceData = true
      this.error = null

      try {
        const response = await regionService.getAll({
          per_page: 1000,
          sort_by: 'name',
          sort_direction: 'asc',
          ...params,
        })

        this.referenceData.regions = Array.isArray(response.data) ? response.data : []
        return this.referenceData.regions
      } catch (error) {
        console.error('Error loading regions:', error)
        this.error = error.response?.data?.message || error.message || 'Erreur lors du chargement des regions'
        throw error
      } finally {
        this.loadingReferenceData = false
      }
    },

    async fetchAll(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await communeService.getAll({
          page: this.pagination.current_page,
          per_page: this.pagination.per_page,
          ...this.filters,
          ...params,
        })

        this.items = Array.isArray(response.data) ? response.data : []
        this.pagination = {
          current_page: response.current_page || 1,
          last_page: response.last_page || 1,
          per_page: response.per_page || this.pagination.per_page,
          total: response.total || this.items.length,
        }

        return this.items
      } catch (error) {
        console.error('Error fetching communes:', error)
        this.error = error.response?.data?.message || error.message || 'Erreur lors du chargement des communes'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id) {
      this.loading = true
      this.error = null

      try {
        const data = await communeService.getById(id)
        this.current = data

        const index = this.items.findIndex((item) => String(item.id) === String(id))
        if (index !== -1) {
          this.items[index] = data
        }

        return data
      } catch (error) {
        console.error('Error fetching commune:', error)
        this.error = error.response?.data?.message || error.message || 'Erreur lors du chargement de la commune'
        throw error
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      this.saving = true
      this.error = null

      try {
        const created = await communeService.create(data)
        return created
      } catch (error) {
        console.error('Error creating commune:', error)
        this.error = error.response?.data?.message || error.message || 'Erreur lors de la creation de la commune'
        throw error
      } finally {
        this.saving = false
      }
    },

    async update(id, data) {
      this.saving = true
      this.error = null

      try {
        const updated = await communeService.update(id, data)

        const index = this.items.findIndex((item) => String(item.id) === String(id))
        if (index !== -1) {
          this.items[index] = updated
        }

        if (this.current && String(this.current.id) === String(id)) {
          this.current = updated
        }

        return updated
      } catch (error) {
        console.error('Error updating commune:', error)
        this.error = error.response?.data?.message || error.message || 'Erreur lors de la mise a jour de la commune'
        throw error
      } finally {
        this.saving = false
      }
    },

    async remove(id) {
      this.saving = true
      this.error = null

      try {
        await communeService.delete(id)

        this.items = this.items.filter((item) => String(item.id) !== String(id))
        if (this.current && String(this.current.id) === String(id)) {
          this.current = null
        }

        if (this.pagination.total > 0) {
          this.pagination.total -= 1
        }
      } catch (error) {
        console.error('Error deleting commune:', error)
        this.error = error.response?.data?.message || error.message || 'Erreur lors de la suppression de la commune'
        throw error
      } finally {
        this.saving = false
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
        region_id: '',
        sort_by: 'name',
        sort_direction: 'asc',
      }
    },

    resetPagination() {
      this.pagination.current_page = 1
    },
  },
})
