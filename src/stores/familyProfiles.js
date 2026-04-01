import { defineStore } from 'pinia'
import familyProfileService from '@/services/FamilyProfileService.js'

export const useFamilyProfileStore = defineStore('familyProfiles', {
  state: () => ({
    items: [],
    current: null,
    loading: false,
    saving: false,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    },
    filters: {
      search: '',
      sort_by: 'family_name',
      sort_direction: 'asc',
    },
    error: null,
  }),

  getters: {
    getById: (state) => (id) => state.items.find((item) => String(item.id) === String(id)) || null,
  },

  actions: {
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await familyProfileService.getAll({
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
        console.error('Error fetching family profiles:', error)
        this.error =
          error.response?.data?.message || error.message || 'Erreur lors du chargement des profils familiaux'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id) {
      this.loading = true
      this.error = null

      try {
        const data = await familyProfileService.getById(id)
        this.current = data

        const index = this.items.findIndex((item) => String(item.id) === String(id))
        if (index !== -1) {
          this.items[index] = data
        }

        return data
      } catch (error) {
        console.error('Error fetching family profile:', error)
        this.error =
          error.response?.data?.message || error.message || 'Erreur lors du chargement du profil familial'
        throw error
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      this.saving = true
      this.error = null

      try {
        return await familyProfileService.create(data)
      } catch (error) {
        console.error('Error creating family profile:', error)
        this.error =
          error.response?.data?.message || error.message || 'Erreur lors de la creation du profil familial'
        throw error
      } finally {
        this.saving = false
      }
    },

    async update(id, data) {
      this.saving = true
      this.error = null

      try {
        const updated = await familyProfileService.update(id, data)

        const index = this.items.findIndex((item) => String(item.id) === String(id))
        if (index !== -1) {
          this.items[index] = updated
        }

        if (this.current && String(this.current.id) === String(id)) {
          this.current = updated
        }

        return updated
      } catch (error) {
        console.error('Error updating family profile:', error)
        this.error =
          error.response?.data?.message || error.message || 'Erreur lors de la mise a jour du profil familial'
        throw error
      } finally {
        this.saving = false
      }
    },

    async remove(id) {
      this.saving = true
      this.error = null

      try {
        await familyProfileService.delete(id)

        this.items = this.items.filter((item) => String(item.id) !== String(id))
        if (this.current && String(this.current.id) === String(id)) {
          this.current = null
        }

        if (this.pagination.total > 0) {
          this.pagination.total -= 1
        }
      } catch (error) {
        console.error('Error deleting family profile:', error)
        this.error =
          error.response?.data?.message || error.message || 'Erreur lors de la suppression du profil familial'
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
        sort_by: 'family_name',
        sort_direction: 'asc',
      }
    },

    resetPagination() {
      this.pagination.current_page = 1
    },
  },
})
