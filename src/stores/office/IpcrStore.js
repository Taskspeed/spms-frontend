import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useIpcrStore = defineStore('Ipcr', {
  state: () => ({
    // Data for each tab
    employeeIpcr: null,
    performanceStandard: null,
    monthlyPerformance: null,
    summaryMonthlyPerformance: null,

    // Loading states for each tab
    loadingIpcr: false,
    loadingPerformanceStandard: false,
    loadingMonthlyPerformance: false,
    loadingSummaryMonthlyPerformance: false,

    // Error states
    error: null,

    // Cache to avoid redundant API calls
    cache: {
      ipcr: {},
      performanceStandard: {},
      monthlyPerformance: {},
      summaryMonthlyPerformance: {},
    },
  }),

  getters: {
    // Check if any data is loading
    isLoading: (state) =>
      state.loadingIpcr ||
      state.loadingPerformanceStandard ||
      state.loadingMonthlyPerformance ||
      state.loadingSummaryMonthlyPerformance,

    // Get target period ID from IPCR data
    targetPeriodId: (state) => {
      if (!state.employeeIpcr) return null

      // Check if target_periods array exists and has items
      if (state.employeeIpcr.target_periods && state.employeeIpcr.target_periods.length > 0) {
        return state.employeeIpcr.target_periods[0].id
      }

      // Fallback to checking other possible locations
      return (
        state.employeeIpcr.targetPeriodId ||
        state.employeeIpcr.TargetPeriodId ||
        state.employeeIpcr.target_period_id ||
        state.employeeIpcr.id ||
        null
      )
    },
  },

  actions: {
    /**
     * Fetch Employee IPCR data
     * @param {string} controlNo - Employee control number
     * @param {number} year - Target year
     * @param {string} semester - Semester (e.g., "January-June")
     */
    async fetchEmployeeIpcr(controlNo, year, semester) {
      const cacheKey = `${controlNo}_${year}_${semester}`

      // Return cached data if available
      if (this.cache.ipcr[cacheKey]) {
        this.employeeIpcr = this.cache.ipcr[cacheKey]
        return this.employeeIpcr
      }

      this.loadingIpcr = true
      this.error = null

      try {
        const response = await api.get(`/ipcr/employee/${controlNo}/${year}/${semester}`)

        console.log('✅ IPCR Data fetched:', response.data)

        // Extract targetPeriodId from target_periods array
        const targetPeriodId = response.data?.target_periods?.[0]?.id

        console.log('🔍 Target Period ID extracted:', {
          targetPeriodId: targetPeriodId,
          hasTargetPeriods: !!response.data?.target_periods,
          targetPeriodsLength: response.data?.target_periods?.length || 0,
          firstTargetPeriod: response.data?.target_periods?.[0],
        })

        this.employeeIpcr = response.data
        this.cache.ipcr[cacheKey] = response.data

        return response.data
      } catch (error) {
        console.error('❌ Error fetching IPCR data:', error)
        this.error = error.response?.data?.message || error.message || 'Failed to fetch IPCR data'
        throw error
      } finally {
        this.loadingIpcr = false
      }
    },

    /**
     * Fetch Performance Standard data
     * @param {number} targetPeriodId - Target period ID
     */
    async fetchPerformanceStandard(targetPeriodId) {
      const cacheKey = `${targetPeriodId}`

      // Return cached data if available
      if (this.cache.performanceStandard[cacheKey]) {
        this.performanceStandard = this.cache.performanceStandard[cacheKey]
        return this.performanceStandard
      }

      this.loadingPerformanceStandard = true
      this.error = null

      try {
        const response = await api.get(`/ipcr/performance-standard/${targetPeriodId}`)

        console.log('✅ Performance Standard data fetched:', response.data)

        this.performanceStandard = response.data
        this.cache.performanceStandard[cacheKey] = response.data

        return response.data
      } catch (error) {
        console.error('❌ Error fetching Performance Standard:', error)
        this.error =
          error.response?.data?.message || error.message || 'Failed to fetch Performance Standard'
        throw error
      } finally {
        this.loadingPerformanceStandard = false
      }
    },

    /**
     * Fetch Monthly Performance data
     * The API returns an array with this structure:
     * [
     *   {
     *     id, target_period_id, category, mfo,
     *     monthly_ratings: {
     *       monthly: [
     *         {
     *           month: "January 2026",
     *           quantity: { week1, week2, week3, week4, week5, average },
     *           effectiveness: { week1, week2, week3, week4, week5, average },
     *           timeliness: { week1, week2, week3, week4, week5, average }
     *         },
     *         ...
     *       ],
     *       whole_average: { quantity, effectiveness, timeliness, overall }
     *     }
     *   },
     *   ...
     * ]
     *
     * @param {number} targetPeriodId - Target period ID
     */
    async fetchMonthlyPerformance(targetPeriodId) {
      const cacheKey = `${targetPeriodId}`

      // Return cached data if available
      if (this.cache.monthlyPerformance[cacheKey]) {
        this.monthlyPerformance = this.cache.monthlyPerformance[cacheKey]
        return this.monthlyPerformance
      }

      this.loadingMonthlyPerformance = true
      this.error = null

      try {
        const response = await api.get(`/ipcr/monthly-performance/${targetPeriodId}`)

        console.log('✅ Monthly Performance data fetched:', response.data)
        console.log('📊 Data structure check:', {
          isArray: Array.isArray(response.data),
          length: response.data?.length,
          firstItem: response.data?.[0],
          hasMonthlyRatings: !!response.data?.[0]?.monthly_ratings,
          hasMonthly: !!response.data?.[0]?.monthly_ratings?.monthly,
          monthlyLength: response.data?.[0]?.monthly_ratings?.monthly?.length,
        })

        // Store the raw array response
        this.monthlyPerformance = response.data
        this.cache.monthlyPerformance[cacheKey] = response.data

        return response.data
      } catch (error) {
        console.error('❌ Error fetching Monthly Performance:', error)
        this.error =
          error.response?.data?.message || error.message || 'Failed to fetch Monthly Performance'
        throw error
      } finally {
        this.loadingMonthlyPerformance = false
      }
    },

    /**
     * Fetch Summary Monthly Performance data
     * @param {number} targetPeriodId - Target period ID
     */
    async fetchSummaryMonthlyPerformance(targetPeriodId) {
      const cacheKey = `${targetPeriodId}`

      // Return cached data if available
      if (this.cache.summaryMonthlyPerformance[cacheKey]) {
        this.summaryMonthlyPerformance = this.cache.summaryMonthlyPerformance[cacheKey]
        return this.summaryMonthlyPerformance
      }

      this.loadingSummaryMonthlyPerformance = true
      this.error = null

      try {
        const response = await api.get(`/ipcr/summary-monthly-performance/${targetPeriodId}`)

        console.log('✅ Summary Monthly Performance data fetched:', response.data)

        this.summaryMonthlyPerformance = response.data
        this.cache.summaryMonthlyPerformance[cacheKey] = response.data

        return response.data
      } catch (error) {
        console.error('❌ Error fetching Summary Monthly Performance:', error)
        this.error =
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch Summary Monthly Performance'
        throw error
      } finally {
        this.loadingSummaryMonthlyPerformance = false
      }
    },

    /**
     * Clear all cached data
     */
    clearCache() {
      this.cache = {
        ipcr: {},
        performanceStandard: {},
        monthlyPerformance: {},
        summaryMonthlyPerformance: {},
      }
    },

    /**
     * Reset store to initial state
     */
    resetStore() {
      this.employeeIpcr = null
      this.performanceStandard = null
      this.monthlyPerformance = null
      this.summaryMonthlyPerformance = null
      this.error = null
      this.clearCache()
    },
  },
})
