import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useOpcrStore = defineStore('opcr', {
  state: () => ({
    opcrData: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchOpcr(controlNo, semester, year) {
      this.loading = true
      this.error = null

      try {
        const response = await api.get(`/opcr/${controlNo}/${semester}/${year}`)
        this.opcrData = response.data
        return this.opcrData
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Failed to fetch OPCR data'
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveOpcr(opcrEntries) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post(`/opcr/store`, opcrEntries)
        this.opcrData = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Failed to save OPCR data'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateOpcr(opcrEntries) {
      this.loading = true
      this.error = null

      try {
        const response = await api.put(`/opcr/update`, opcrEntries)
        this.opcrData = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Failed to update OPCR data'
        throw error
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.opcrData = null
      this.error = null
    },
  },
})
