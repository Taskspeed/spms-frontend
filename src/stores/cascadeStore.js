import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useCascadeStore = defineStore('cascade', {
  state: () => ({
    cascadeData: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCascade(semester, year, mfo) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/unit_work_plan/managerial/${year}/${semester}/${mfo}`)
        this.opcrData = response.data
        return this.opcrData
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Failed to fetch OPCR data'
        throw error
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.cascadeDataData = null
      this.error = null
    },
  },
})
