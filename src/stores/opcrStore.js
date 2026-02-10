// stores/opcrStore.js
import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useOpcrStore = defineStore('opcr', {
  state: () => ({
    loading: false,
    saving: false,
    error: null,
    opcrData: null,
    performanceStandards: [],
    currentEmployee: null,
  }),

  getters: {
    // Get performance standards by category
    strategicFunctions: (state) => {
      return state.performanceStandards.filter((ps) => ps.category === 'A. STRATEGIC FUNCTION')
    },

    coreFunctions: (state) => {
      return state.performanceStandards.filter((ps) => ps.category === 'B. CORE FUNCTION')
    },

    supportFunctions: (state) => {
      return state.performanceStandards.filter((ps) => ps.category === 'C. SUPPORT FUNCTION')
    },

    // Check if data is loaded
    hasData: (state) => {
      return state.opcrData !== null && state.performanceStandards.length > 0
    },

    // Get employee info
    employeeInfo: (state) => {
      if (!state.opcrData) return null
      return {
        id: state.opcrData.id,
        controlNo: state.opcrData.ControlNo,
        name: state.opcrData.name,
      }
    },
  },

  actions: {
    // Fetch OPCR data from API
    async fetchOpcrData(controlNo, semester, year) {
      this.loading = true
      this.error = null

      try {
        const response = await api.get(`/opcr/${controlNo}/${semester}/${year}`)
        this.opcrData = response.data

        // Extract performance standards from target periods
        if (response.data.target_periods && response.data.target_periods.length > 0) {
          const targetPeriod = response.data.target_periods.find(
            (tp) => tp.semester === semester && tp.year === year,
          )

          if (targetPeriod && targetPeriod.performance_standards) {
            this.performanceStandards = targetPeriod.performance_standards
          }
        }

        this.currentEmployee = {
          controlNo,
          semester,
          year,
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch OPCR data'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Submit/Update OPCR data
    async submitOpcr(opcrFormData) {
      this.saving = true
      this.error = null

      try {
        // Map form data to match API requirements exactly
        const performanceStandards = opcrFormData.map((item) => ({
          performance_standard_id: item.id,
          compentency:
            item.competency && item.competency.length > 0
              ? item.competency
              : ['Default Competency'], // Provide default if empty
          budget: item.budget || '',
          accountable: item.accountable || '',
          accomplishment: item.accomplishment || '',
          rating_q: parseFloat(item.rating_q) || 0,
          rating_e: parseFloat(item.rating_e) || 0,
          rating_t: parseFloat(item.rating_t) || 0,
          rating_a: parseFloat(item.rating_a) || 0,
          profiency:
            item.proficiency && item.proficiency.length > 0
              ? item.proficiency
              : ['Default Proficiency'], // Provide default if empty
          remarks: item.remarks || '',
        }))

        const response = await api.post('/opcr/store', performanceStandards)

        // Refresh data after successful save
        const { controlNo, semester, year } = this.currentEmployee
        await this.fetchOpcrData(controlNo, semester, year)

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to submit OPCR data'
        console.error('OPCR Submission Error:', error.response?.data)
        throw error
      } finally {
        this.saving = false
      }
    },

    // Update a specific performance standard's OPCR data locally
    updatePerformanceStandard(id, opcrData) {
      const index = this.performanceStandards.findIndex((ps) => ps.id === id)
      if (index !== -1) {
        this.performanceStandards[index] = {
          ...this.performanceStandards[index],
          opcr: opcrData,
        }
      }
    },

    // Reset store
    reset() {
      this.loading = false
      this.saving = false
      this.error = null
      this.opcrData = null
      this.performanceStandards = []
      this.currentEmployee = null
    },
  },
})
