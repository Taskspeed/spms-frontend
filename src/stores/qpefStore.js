import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useQPEFStore = defineStore('qpef', {
  state: () => ({
    currentQPEF: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchQPEF(controlNo, quarter, year) {
      this.loading = true
      this.error = null

      try {
        const response = await api.get(`/qpef/${controlNo}/${quarter}/${year}`)
        this.currentQPEF = response.data
        return response.data
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.currentQPEF = null
          return null
        }

        this.error = error.response?.data?.message || 'Failed to fetch QPEF data'
        console.error('Error fetching QPEF:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveQPEF(payload) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/qpef/store', payload)
        this.currentQPEF = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to save QPEF'
        console.error('Error saving QPEF:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateQPEF(id, payload) {
      this.loading = true
      this.error = null

      try {
        const response = await api.put(`/qpef/update/${id}`, payload)
        this.currentQPEF = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update QPEF'
        console.error('Error updating QPEF:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    clearCurrentQPEF() {
      this.currentQPEF = null
      this.error = null
    },
  },
})
