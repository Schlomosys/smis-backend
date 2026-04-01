import { defineStore } from 'pinia'
import countryService from '@/services/countryService.js'

export const useCountryStore = defineStore('countries', {
  state: () => ({
    items: [],
    current: null,
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

    totalCountries: (state) => state.items.length
  },

  actions: {
    // Fetch all countries with pagination and filters
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await countryService.getAll({
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
        console.error('Error fetching countries:', error)
        this.error = error.message || 'Erreur lors du chargement des pays'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Fetch single country
    async fetchOne(id) {
      this.loading = true
      this.error = null

      try {
        const data = await countryService.getById(id)
        this.current = data

        // Update item in list if exists
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index] = this.current
        }
      } catch (error) {
        console.error('Error fetching country:', error)
        this.error = error.message || 'Erreur lors du chargement du pays'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Create country
    async create(data) {
      this.saving = true
      this.error = null

      try {
        const newItem = await countryService.create(data)
        this.items.unshift(newItem)
        this.pagination.total++
        return newItem
      } catch (error) {
        console.error('Error creating country:', error)
        this.error = error.message || 'Erreur lors de la création du pays'
        throw error
      } finally {
        this.saving = false
      }
    },

    // Update country
    async update(id, data) {
      this.saving = true
      this.error = null

      try {
        const updatedItem = await countryService.update(id, data)

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
        console.error('Error updating country:', error)
        this.error = error.message || 'Erreur lors de la mise à jour du pays'
        throw error
      } finally {
        this.saving = false
      }
    },

    // Delete country
    async remove(id) {
      this.saving = true
      this.error = null

      try {
        await countryService.delete(id)

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
        console.error('Error deleting country:', error)
        this.error = error.message || 'Erreur lors de la suppression du pays'
        throw error
      } finally {
        this.saving = false
      }
    },

    // Clear filters
    clearFilters() {
      this.filters.search = ''
      this.filters.sort_by = 'name'
      this.filters.sort_direction = 'asc'
    },

    // Reset pagination
    resetPagination() {
      this.pagination.current_page = 1
    }
  }
})