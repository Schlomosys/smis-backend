import { defineStore } from 'pinia'

export const useAcademicStore = defineStore('academic', {
  state: () => ({ records: [], loading: false }),
  actions: {
    async fetchByBeneficiary(_id) {
      this.loading = true
      try {
        // TODO: implémenter via academicService
      } finally {
        this.loading = false
      }
    },
  },
})
