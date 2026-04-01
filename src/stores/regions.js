import { defineStore } from 'pinia'
import regionService from '@/services/regionService.js'
import countryService from '@/services/countryService.js'

export const useRegionStore = defineStore('regions', {
  state: () => ({
    items: [],
    current: null,
    referenceData: {
      countries: []
    },
    loading: false,
    saving: false,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0
    },
    filters: {
      search: '',
      country_id: '',
      sort_by: 'name',
      sort_direction: 'asc'
    },
    error: null
  }),

  getters: {
    getById: (state) => (id) => {
      return state.items.find(item => item.id === id) || null
    },

    filteredItems: (state) => {
      let items = [...state.items]

      // Apply search filter
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase()
        items = items.filter(item =>
          item.name.toLowerCase().includes(search)
        )
      }

      // Apply country filter
      if (state.filters.country_id) {
        items = items.filter(item => item.country_id === state.filters.country_id)
      }

      // Apply sorting
      items.sort((a, b) => {
        const aValue = a[state.filters.sort_by]
        const bValue = b[state.filters.sort_by]

        let result = 0
        if (aValue < bValue) result = -1
        if (aValue > bValue) result = 1

        return state.filters.sort_direction === 'desc' ? -result : result
      })

      return items
    },

    totalRegions: (state) => state.items.length
  },

  actions: {
    // Load reference data (countries)
    async loadReferenceData() {
      try {
        const countriesResponse = await countryService.getAll({ per_page: 1000 }) // Load all countries
        this.referenceData.countries = countriesResponse.data
      } catch (error) {
        console.error('Error loading reference data:', error)
        throw error
      }
    },

    // Fetch all regions with pagination and filters
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await regionService.getAll({
          page: this.pagination.current_page,
          per_page: this.pagination.per_page,
          ...this.filters,
          ...params
        })

        this.items = response.data
        this.pagination = {
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total
        }
      } catch (error) {
        console.error('Error fetching regions:', error)
        this.error = error.message || 'Erreur lors du chargement des régions'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Fetch single region
    async fetchOne(id) {
      this.loading = true
      this.error = null

      try {
        const data = await regionService.getById(id)
        this.current = data

        // Update item in list if exists
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index] = this.current
        }
      } catch (error) {
        console.error('Error fetching region:', error)
        this.error = error.message || 'Erreur lors du chargement de la région'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Create region
    async create(data) {
      this.saving = true
      this.error = null

      try {
        const newItem = await regionService.create(data)
        this.items.unshift(newItem)
        this.pagination.total++
        return newItem
      } catch (error) {
        console.error('Error creating region:', error)
        this.error = error.message || 'Erreur lors de la création de la région'
        throw error
      } finally {
        this.saving = false
      }
    },

    // Update region
    async update(id, data) {
      this.saving = true
      this.error = null

      try {
        const updatedItem = await regionService.update(id, data)

        // Update in list
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index] = updatedItem
        }

        // Update current if it's the same
        if (this.current && this.current.id === id) {
          this.current = updatedItem
        }

        return updatedItem
      } catch (error) {
        console.error('Error updating region:', error)
        this.error = error.message || 'Erreur lors de la mise à jour de la région'
        throw error
      } finally {
        this.saving = false
      }
    },

    // Delete region
    async remove(id) {
      this.saving = true
      this.error = null

      try {
        await regionService.delete(id)

        // Remove from list
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items.splice(index, 1)
          this.pagination.total--
        }

        // Clear current if it's the same
        if (this.current && this.current.id === id) {
          this.current = null
        }
      } catch (error) {
        console.error('Error deleting region:', error)
        this.error = error.message || 'Erreur lors de la suppression de la région'
        throw error
      } finally {
        this.saving = false
      }
    },

    // Clear filters
    clearFilters() {
      this.filters.search = ''
      this.filters.country_id = ''
      this.filters.sort_by = 'name'
      this.filters.sort_direction = 'asc'
    },

    // Reset pagination
    resetPagination() {
      this.pagination.current_page = 1
    }
  }
})