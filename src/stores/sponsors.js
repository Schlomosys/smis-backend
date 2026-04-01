import { defineStore } from 'pinia'
import sponsorService from '@/services/sponsorService.js'

export const useSponsorStore = defineStore('sponsors', {
  state: () => ({
    items: [],
    current: null,
    loading: false,
    saving: false,
    deleting: false,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0
    },
    filters: {
      search: '',
      sort_by: 'created_at',
      sort_direction: 'desc'
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
          (item.name && item.name.toLowerCase().includes(search)) ||
          (item.email && item.email.toLowerCase().includes(search)) ||
          (item.phone && item.phone.toLowerCase().includes(search))
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

    totalSponsors: (state) => state.items.length
  },

  actions: {
    // Fetch all sponsors with pagination and filters
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await sponsorService.getAll({
          page: this.pagination.current_page,
          per_page: this.pagination.per_page,
          ...this.filters,
          ...params
        })

        // Handle both paginated and non-paginated responses
        if (Array.isArray(response)) {
          this.items = response
        } else if (response.data) {
          this.items = response.data
          // Update pagination if available
          if (response.current_page !== undefined) {
            this.pagination = {
              current_page: response.current_page,
              last_page: response.last_page,
              per_page: response.per_page,
              total: response.total
            }
          }
        }
      } catch (error) {
        console.error('Error fetching sponsors:', error)
        this.error = error.response?.data?.message || error.message || 'Erreur lors du chargement des sponsors'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Fetch single sponsor
    async fetchOne(id) {
      this.loading = true
      this.error = null

      try {
        const response = await sponsorService.getById(id)
        this.current = response.data || response
        return this.current
      } catch (error) {
        console.error('Error fetching sponsor:', error)
        this.error = error.response?.data?.message || error.message || 'Erreur lors du chargement du sponsor'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Create sponsor
    async create(data) {
      this.saving = true
      this.error = null

      try {
        const response = await sponsorService.create(data)
        const newSponsor = response.data || response
        this.items.unshift(newSponsor)
        this.current = newSponsor
        return newSponsor
      } catch (error) {
        console.error('Error creating sponsor:', error)
        this.error = error.response?.data?.message || error.message || 'Erreur lors de la création du sponsor'
        throw error
      } finally {
        this.saving = false
      }
    },

    // Update sponsor
    async update(id, data) {
      this.saving = true
      this.error = null

      try {
        const response = await sponsorService.update(id, data)
        const updatedSponsor = response.data || response

        // Update in items list
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index] = updatedSponsor
        }

        // Update current
        if (this.current?.id === id) {
          this.current = updatedSponsor
        }

        return updatedSponsor
      } catch (error) {
        console.error('Error updating sponsor:', error)
        this.error = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du sponsor'
        throw error
      } finally {
        this.saving = false
      }
    },

    // Delete sponsor
    async delete(id) {
      this.deleting = true
      this.error = null

      try {
        await sponsorService.delete(id)

        // Remove from items list
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items.splice(index, 1)
        }

        // Clear current if deleted
        if (this.current?.id === id) {
          this.current = null
        }
      } catch (error) {
        console.error('Error deleting sponsor:', error)
        this.error = error.response?.data?.message || error.message || 'Erreur lors de la suppression du sponsor'
        throw error
      } finally {
        this.deleting = false
      }
    },

    // Update filters
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.current_page = 1 // Reset to first page
    },

    // Reset filters
    resetFilters() {
      this.filters = {
        search: '',
        sort_by: 'created_at',
        sort_direction: 'desc'
      }
      this.pagination.current_page = 1
    },

    // Set pagination
    setPagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination }
    },

    // Clear state
    clearError() {
      this.error = null
    },

    // Bulk delete sponsors
    async bulkDelete(ids) {
      this.deleting = true
      this.error = null

      try {
        // Delete each sponsor sequentially
        for (const id of ids) {
          await sponsorService.delete(id)
        }

        // Remove deleted items from list
        this.items = this.items.filter(item => !ids.includes(item.id))

        // Clear current if deleted
        if (this.current && ids.includes(this.current.id)) {
          this.current = null
        }
      } catch (error) {
        console.error('Error bulk deleting sponsors:', error)
        this.error = error.response?.data?.message || error.message || 'Erreur lors de la suppression'
        throw error
      } finally {
        this.deleting = false
      }
    }
  }
})
