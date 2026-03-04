// src/stores/office/IpcrStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useIpcrStore = defineStore('Ipcr', {
  state: () => ({
    // Data stores
    employeeIpcr: null,
    performanceStandard: null,
    monthlyPerformance: null,
    summaryMonthlyPerformance: null,

    // Loading states
    loadingStates: {
      ipcr: false,
      performanceStandard: false,
      monthlyPerformance: false,
      summaryMonthlyPerformance: false,
    },

    // Error states
    errors: {
      ipcr: null,
      performanceStandard: null,
      monthlyPerformance: null,
      summaryMonthlyPerformance: null,
    },
  }),

  getters: {
    // Individual loading getters
    isLoadingIpcr: (state) => state.loadingStates.ipcr,
    isLoadingPerformanceStandard: (state) => state.loadingStates.performanceStandard,
    isLoadingMonthlyPerformance: (state) => state.loadingStates.monthlyPerformance,
    isLoadingSummaryMonthlyPerformance: (state) => state.loadingSummaryMonthlyPerformance,

    // Combined loading getter
    isLoading: (state) => Object.values(state.loadingStates).some((status) => status),

    // Individual error getters
    ipcrError: (state) => state.errors.ipcr,
    performanceStandardError: (state) => state.errors.performanceStandard,
    monthlyPerformanceError: (state) => state.errors.monthlyPerformance,
    summaryMonthlyPerformanceError: (state) => state.errors.summaryMonthlyPerformance,

    // Target period ID extraction
    targetPeriodId: (state) => {
      if (!state.employeeIpcr) return null

      // Check various possible locations for the target period ID
      const sources = [
        () => state.employeeIpcr.target_periods?.[0]?.id,
        () => state.employeeIpcr.targetPeriodId,
        () => state.employeeIpcr.TargetPeriodId,
        () => state.employeeIpcr.target_period_id,
        () => state.employeeIpcr.id,
      ]

      for (const source of sources) {
        const id = source()
        if (id) return id
      }

      return null
    },
  },

  actions: {
    // ================ DATA FETCHING ================

    /**
     * Generic fetch method
     */
    async fetchData({ endpoint, dataKey, loadingKey, errorKey, params = {} }) {
      // Set loading state
      this.loadingStates[loadingKey] = true
      this.errors[errorKey] = null

      try {
        // Make API call with timestamp to prevent browser caching
        const timestamp = new Date().getTime()
        const finalParams = { ...params, _t: timestamp }

        const response = await api.get(endpoint, { params: finalParams })

        // Update store state
        this[dataKey] = response.data

        console.log(`✅ ${dataKey} data fetched successfully`)

        return response.data
      } catch (error) {
        // Handle error
        const errorMessage =
          error.response?.data?.message || error.message || `Failed to fetch ${dataKey}`
        this.errors[errorKey] = errorMessage

        console.error(`❌ Error fetching ${dataKey}:`, error)
        throw error
      } finally {
        // Clear loading state
        this.loadingStates[loadingKey] = false
      }
    },

    /**
     * Fetch Employee IPCR data
     */
    async fetchEmployeeIpcr(controlNo, year, semester) {
      return this.fetchData({
        endpoint: `/ipcr/employee/${controlNo}/${year}/${semester}`,
        dataKey: 'employeeIpcr',
        loadingKey: 'ipcr',
        errorKey: 'ipcr',
      })
    },

    /**
     * Fetch Performance Standard data
     */
    async fetchPerformanceStandard(targetPeriodId) {
      return this.fetchData({
        endpoint: `/ipcr/performance-standard/${targetPeriodId}`,
        dataKey: 'performanceStandard',
        loadingKey: 'performanceStandard',
        errorKey: 'performanceStandard',
      })
    },

    /**
     * Fetch Monthly Performance data
     */
    async fetchMonthlyPerformance(targetPeriodId) {
      return this.fetchData({
        endpoint: `/ipcr/monthly-performance/${targetPeriodId}`,
        dataKey: 'monthlyPerformance',
        loadingKey: 'monthlyPerformance',
        errorKey: 'monthlyPerformance',
      })
    },

    /**
     * Fetch Summary Monthly Performance data
     */
    async fetchSummaryMonthlyPerformance(targetPeriodId) {
      return this.fetchData({
        endpoint: `/ipcr/summary-monthly-performance/${targetPeriodId}`,
        dataKey: 'summaryMonthlyPerformance',
        loadingKey: 'summaryMonthlyPerformance',
        errorKey: 'summaryMonthlyPerformance',
      })
    },

    // ================ DATA MANAGEMENT ================

    /**
     * Clear specific data
     */
    clearData(dataKey) {
      if (this[dataKey] !== undefined) {
        this[dataKey] = null
        console.log(`🗑️ Cleared ${dataKey} data`)
      }
    },

    /**
     * Clear all IPCR data
     */
    clearAllData() {
      this.employeeIpcr = null
      this.performanceStandard = null
      this.monthlyPerformance = null
      this.summaryMonthlyPerformance = null

      // Clear errors
      Object.keys(this.errors).forEach((key) => {
        this.errors[key] = null
      })

      console.log('🗑️ Cleared all IPCR data')
    },

    /**
     * Clear loading states
     */
    clearLoadingStates() {
      Object.keys(this.loadingStates).forEach((key) => {
        this.loadingStates[key] = false
      })
    },

    /**
     * Clear error states
     */
    clearErrors() {
      Object.keys(this.errors).forEach((key) => {
        this.errors[key] = null
      })
    },

    /**
     * Reset store to initial state
     */
    resetStore() {
      this.clearAllData()
      this.clearLoadingStates()
      this.clearErrors()
      console.log('🔄 Store reset to initial state')
    },

    // ================ UTILITY METHODS ================

    /**
     * Force refresh specific data
     */
    async forceRefresh(dataType, ...params) {
      // Clear the data first
      this.clearData(this.getDataKey(dataType))

      // Fetch fresh data
      switch (dataType) {
        case 'ipcr':
          return this.fetchEmployeeIpcr(...params)
        case 'performanceStandard':
          return this.fetchPerformanceStandard(...params)
        case 'monthlyPerformance':
          return this.fetchMonthlyPerformance(...params)
        case 'summaryMonthlyPerformance':
          return this.fetchSummaryMonthlyPerformance(...params)
        default:
          throw new Error(`Unknown data type: ${dataType}`)
      }
    },

    /**
     * Get data key from data type
     */
    getDataKey(dataType) {
      const map = {
        ipcr: 'employeeIpcr',
        performanceStandard: 'performanceStandard',
        monthlyPerformance: 'monthlyPerformance',
        summaryMonthlyPerformance: 'summaryMonthlyPerformance',
      }
      return map[dataType]
    },
  },
})
