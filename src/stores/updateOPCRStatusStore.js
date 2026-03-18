import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useOpcrUpdateStatusStore = defineStore('opcrUpdateStatus', {
  state: () => ({
    loading: false,
    error: null,
    lastResponse: null,
  }),

  actions: {
    clearError() {
      this.error = null
    },

    async updateStatus(payload) {
      // payload example:
      // { office_opcr_id: 6, status: "approve", remarks: "test" }

      this.loading = true
      this.error = null
      this.lastResponse = null

      try {
        const res = await api.post('/planning/opcr/update-status', payload)
        this.lastResponse = res?.data
        return res?.data
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Request failed'
        this.error = message
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
