import { defineStore } from 'pinia'
import beneficiaryService from '@/services/beneficiaryService.js'

export const useBeneficiaryStore = defineStore('beneficiaries', {
  state: () => ({
    items: [],
    current: null,
    referenceData: {
      countries: [],
      regions: [],
      communes: [],
      schools: [],
      supportTypes: [],
      sponsors: [],
      families: [],
      vulnerabilityTypes: []
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
      commune_id: '',
      type: '',
      risk_level: '',
      is_disabled: '',
      sort_by: 'created_at',
      sort_direction: 'desc'
    },
    statistics: null,
    error: null
  }),

  getters: {
    getById: (state) => (id) => {
      return state.items.find(item => item.id === id) || null
    },

    filteredItems: (state) => {
      let items = [...state.items]

      // Apply filters
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase()
        items = items.filter(item =>
          item.first_name.toLowerCase().includes(search) ||
          item.last_name.toLowerCase().includes(search) ||
          item.unique_code.toLowerCase().includes(search)
        )
      }

      if (state.filters.commune_id) {
        items = items.filter(item => item.commune_id === state.filters.commune_id)
      }

      if (state.filters.type) {
        items = items.filter(item => item.type === state.filters.type)
      }

      if (state.filters.risk_level) {
        items = items.filter(item => item.risk_level === state.filters.risk_level)
      }

      if (state.filters.is_disabled !== '') {
        const isDisabled = state.filters.is_disabled === 'true'
        items = items.filter(item => item.is_disabled === isDisabled)
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

    activeBeneficiaries: (state) => {
      return state.items.filter(item => item.type === 'active')
    },

    alumniBeneficiaries: (state) => {
      return state.items.filter(item => item.type === 'alumni')
    },

    highRiskBeneficiaries: (state) => {
      return state.items.filter(item => item.risk_level === 'high')
    },

    totalBeneficiaries: (state) => state.items.length,

    totalActive: (state) => state.activeBeneficiaries.length,

    totalAlumni: (state) => state.alumniBeneficiaries.length,

    totalHighRisk: (state) => state.highRiskBeneficiaries.length
  },

  actions: {
    // Load reference data
    async loadReferenceData() {
      try {
        const data = await beneficiaryService.getReferenceData()
        this.referenceData = {
          ...data,
          supportTypes: data.supportTypes || data.support_types || [],
          sponsors: data.sponsors || [],
          families: data.families || data.family_profiles || data.familyProfiles || [],
        }
      } catch (error) {
        console.error('Error loading reference data:', error)
        throw error
      }
    },

    // Fetch all beneficiaries with pagination and filters
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await beneficiaryService.getAll({
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
        console.error('Error fetching beneficiaries:', error)
        this.error = error.message || 'Erreur lors du chargement des bénéficiaires'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Fetch single beneficiary
    async fetchOne(id) {
      this.loading = true
      this.error = null

      try {
        const data = await beneficiaryService.getById(id)
        this.current = data.beneficiary || data.data || data

        // Update item in list if exists
        const index = this.items.findIndex(item => String(item.id) === String(id))
        if (index !== -1) {
          this.items[index] = this.current
        }
      } catch (error) {
        console.error('Error fetching beneficiary:', error)
        this.error = error.message || 'Erreur lors du chargement du bénéficiaire'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Create beneficiary
    async create(data) {
      this.saving = true
      this.error = null

      try {
        const response = await beneficiaryService.create(data)
        const newItem = response.beneficiary || response.data || response
        this.items.unshift(newItem)
        this.pagination.total++
        return newItem
      } catch (error) {
        console.error('Error creating beneficiary:', error)
        this.error = error.message || 'Erreur lors de la création'
        throw error
      } finally {
        this.saving = false
      }
    },

    // Update beneficiary
    async update(id, data) {
      this.saving = true
      this.error = null

      try {
        const response = await beneficiaryService.update(id, data)
        const updatedItem = response.beneficiary || response.data || response

        // Update in list
        const index = this.items.findIndex(item => String(item.id) === String(id))
        if (index !== -1) {
          this.items[index] = updatedItem
        }

        // Update current if it's the same
        if (this.current && String(this.current.id) === String(id)) {
          this.current = updatedItem
        }

        return updatedItem
      } catch (error) {
        console.error('Error updating beneficiary:', error)
        this.error = error.message || 'Erreur lors de la mise à jour'
        throw error
      } finally {
        this.saving = false
      }
    },

    // Delete beneficiary
    async remove(id) {
      this.saving = true
      this.error = null

      try {
        await beneficiaryService.delete(id)

        // Remove from list
        this.items = this.items.filter(item => String(item.id) !== String(id))

        // Clear current if it's the same
        if (this.current && String(this.current.id) === String(id)) {
          this.current = null
        }

        if (this.pagination.total > 0) {
          this.pagination.total--
        }
      } catch (error) {
        console.error('Error deleting beneficiary:', error)
        this.error = error.message || 'Erreur lors de la suppression'
        throw error
      } finally {
        this.saving = false
      }
    },

    // Academic Records
    async addAcademicRecord(data) {
      try {
        const record = await beneficiaryService.addAcademicRecord(data.beneficiary_id, data)

        if (this.current && this.current.id === data.beneficiary_id) {
          if (!this.current.academicRecords) {
            this.current.academicRecords = []
          }
          this.current.academicRecords.push(record)
        }

        return record
      } catch (error) {
        console.error('Error adding academic record:', error)
        throw error
      }
    },

    // Family Profile
    async saveFamilyProfile(data) {
      try {
        const profile = await beneficiaryService.saveFamilyProfile(data.beneficiary_id, data)

        if (this.current && this.current.id === data.beneficiary_id) {
          this.current.familyProfile = profile
        }

        return profile
      } catch (error) {
        console.error('Error saving family profile:', error)
        throw error
      }
    },

    // Supports
    async addSupport(data) {
      try {
        const support = await beneficiaryService.addSupport(data.beneficiary_id, data)

        if (this.current && this.current.id === data.beneficiary_id) {
          if (!this.current.supports) {
            this.current.supports = []
          }
          this.current.supports.push(support)
        }

        return support
      } catch (error) {
        console.error('Error adding support:', error)
        throw error
      }
    },

    // Sponsorships
    async addSponsorship(data) {
      try {
        const sponsorship = await beneficiaryService.addSponsorship(data.beneficiary_id, data)

        if (this.current && this.current.id === data.beneficiary_id) {
          if (!this.current.sponsorships) {
            this.current.sponsorships = []
          }
          this.current.sponsorships.push(sponsorship)
        }

        return sponsorship
      } catch (error) {
        console.error('Error adding sponsorship:', error)
        throw error
      }
    },

    // Documents
    async uploadDocument(formData) {
      try {
        const document = await beneficiaryService.uploadDocument(formData.get('beneficiary_id'), formData)

        if (this.current && this.current.id === formData.get('beneficiary_id')) {
          if (!this.current.documents) {
            this.current.documents = []
          }
          this.current.documents.push(document)
        }

        return document
      } catch (error) {
        console.error('Error uploading document:', error)
        throw error
      }
    },

    async deleteDocument(documentId) {
      try {
        await beneficiaryService.deleteDocument(this.current.id, documentId)

        if (this.current && this.current.documents) {
          this.current.documents = this.current.documents.filter(doc => doc.id !== documentId)
        }
      } catch (error) {
        console.error('Error deleting document:', error)
        throw error
      }
    },

    // Statistics
    async loadStatistics(params = {}) {
      try {
        this.statistics = await beneficiaryService.getStatistics(params)
      } catch (error) {
        console.error('Error loading statistics:', error)
        throw error
      }
    },

    // Bulk operations
    async bulkUpdate(data) {
      this.saving = true
      try {
        const result = await beneficiaryService.bulkUpdate(data)

        // Refresh the list
        await this.fetchAll()

        return result
      } catch (error) {
        console.error('Error in bulk update:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async bulkDelete(ids) {
      this.saving = true
      try {
        const result = await beneficiaryService.bulkDelete(ids)

        // Remove from list
        this.items = this.items.filter(item => !ids.includes(item.id))
        this.pagination.total -= ids.length

        return result
      } catch (error) {
        console.error('Error in bulk delete:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    // Search
    async search(query) {
      this.loading = true
      try {
        const results = await beneficiaryService.search(query)
        return results
      } catch (error) {
        console.error('Error searching:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Risk assessment
    async updateRiskLevel(id, riskLevel, notes = '') {
      try {
        const result = await beneficiaryService.updateRiskLevel(id, riskLevel, notes)

        // Update in list
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index].risk_level = riskLevel
        }

        // Update current
        if (this.current && this.current.id === id) {
          this.current.risk_level = riskLevel
        }

        return result
      } catch (error) {
        console.error('Error updating risk level:', error)
        throw error
      }
    },

    // Global score
    async updateGlobalScore(id, score, notes = '') {
      try {
        const result = await beneficiaryService.updateGlobalScore(id, score, notes)

        // Update in list
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index].global_score = score
        }

        // Update current
        if (this.current && this.current.id === id) {
          this.current.global_score = score
        }

        return result
      } catch (error) {
        console.error('Error updating global score:', error)
        throw error
      }
    },

    // Exit management
    async exitBeneficiary(id, exitData) {
      try {
        const result = await beneficiaryService.exitBeneficiary(id, exitData)

        // Update in list
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index] = result
        }

        // Update current
        if (this.current && this.current.id === id) {
          this.current = result
        }

        return result
      } catch (error) {
        console.error('Error exiting beneficiary:', error)
        throw error
      }
    },

    async reactivateBeneficiary(id, data = {}) {
      try {
        const result = await beneficiaryService.reactivateBeneficiary(id, data)

        // Update in list
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index] = result
        }

        // Update current
        if (this.current && this.current.id === id) {
          this.current = result
        }

        return result
      } catch (error) {
        console.error('Error reactivating beneficiary:', error)
        throw error
      }
    },

    // Filter management
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    resetFilters() {
      this.filters = {
        search: '',
        commune_id: '',
        type: '',
        risk_level: '',
        is_disabled: '',
        sort_by: 'created_at',
        sort_direction: 'desc'
      }
    },

    // Pagination
    setPage(page) {
      this.pagination.current_page = page
    },

    setPerPage(perPage) {
      this.pagination.per_page = perPage
      this.pagination.current_page = 1
    },

    // Clear state
    clearCurrent() {
      this.current = null
    },

    clearError() {
      this.error = null
    }
  }
})
