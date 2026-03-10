// src/stores/cascadeStore.js - Updated to handle MFO name/value

import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useCascadeStore = defineStore('cascade', {
  state: () => ({
    cascadeData: null,
    loading: false,
    error: null,
  }),

  getters: {
    isLoading: (state) => state.loading,
    hasError: (state) => state.error !== null,
    getErrorMessage: (state) => state.error,
  },

  actions: {
    async fetchCascade(semester, year, mfoValue) {
      this.loading = true
      this.error = null

      console.log('Fetching cascade with:', { semester, year, mfo: mfoValue })

      try {
        // Encode the MFO value to handle spaces and special characters
        const encodedMfo = encodeURIComponent(mfoValue)
        const response = await api.get(
          `/unit_work_plan/managerial/${year}/${semester}/${encodedMfo}`,
        )

        console.log('Cascade API response:', response.data)

        // Handle different response formats
        if (response.data) {
          // If the response is already in the expected format
          this.cascadeData = response.data
        } else if (response.data?.data) {
          // If the response has a data wrapper
          this.cascadeData = response.data.data
        } else {
          throw new Error('Invalid response format')
        }

        return this.cascadeData
      } catch (error) {
        this.error =
          error.response?.data?.message || error.message || 'Failed to fetch cascade data'
        console.error('Cascade fetch error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Helper method to get specific MFO data
    getMfoData(mfoKey = '1') {
      if (!this.cascadeData?.mfos) return null
      return this.cascadeData.mfos[mfoKey] || null
    },

    // Clear stored data
    clear() {
      this.cascadeData = null
      this.error = null
      this.loading = false
    },
  },
})
