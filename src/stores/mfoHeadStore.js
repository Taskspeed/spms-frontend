import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useMFOHeadStore = defineStore('fetchMFOHead', {
  state: () => ({
    loading: false,
    error: null,
    lastResponse: null,
  }),

  actions: {
    clearError() {
      this.error = null
    },

    async fetchMFOHead(semester, year, payload) {
      this.loading = true
      this.error = null
      this.lastResponse = null

      try {
        const res = await api.get(`/office/head-mfo/${semester}/${year}`, payload)
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
