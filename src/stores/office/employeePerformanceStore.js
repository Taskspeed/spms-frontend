// src/stores/employee/employeePerformanceStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { v4 as uuidv4 } from 'uuid'

export const useEmployeePerformanceStore = defineStore('employeePerformance', {
  state: () => ({
    // Employee performance data
    employeeData: null,
    performanceStandards: [],
    standardOutcomes: [],
    targetPeriod: null,

    // Loading and error states
    loading: false,
    error: null,

    // Cache for previously fetched data
    cache: new Map(),

    // Default values
    defaultRows: [
      { rating: '5', quantity: '', effectiveness: '', timeliness: '' },
      { rating: '4', quantity: '', effectiveness: '', timeliness: '' },
      { rating: '3', quantity: '', effectiveness: '', timeliness: '' },
      { rating: '2', quantity: '', effectiveness: '', timeliness: '' },
      { rating: '1', quantity: '', effectiveness: '', timeliness: '' },
    ],
  }),

  getters: {
    // Check if data is loaded
    isLoaded: (state) => state.employeeData !== null && !state.loading,

    // Get formatted performance data for display
    formattedPerformanceData: (state) => {
      if (!state.employeeData || !Array.isArray(state.performanceStandards)) {
        return []
      }

      return state.performanceStandards.map((standard) => ({
        ...standard,
        standardOutcomeRows: state.mapStandardOutcomesToRows(standard.id),
      }))
    },

    // Get employee basic info
    employeeInfo: (state) => {
      if (!state.employeeData) return null

      return {
        name: state.employeeData.name,
        controlNo: state.employeeData.control_no || state.employeeData.ControlNo,
        employeeId: state.employeeData.id,
        rank: state.employeeData.rank,
        position: state.employeeData.position,
        office: state.employeeData.office,
        division: state.employeeData.division,
        section: state.employeeData.section,
        unit: state.employeeData.unit,
      }
    },

    // Get target period info
    periodInfo: (state) => {
      if (!state.targetPeriod) return null

      return {
        semester: state.targetPeriod.semester,
        year: state.targetPeriod.year,
        fullPeriod: `${state.targetPeriod.semester} ${state.targetPeriod.year}`,
      }
    },
  },

  actions: {
    // Generate cache key for storing/retrieving cached data
    generateCacheKey(controlNo, semester, year) {
      return `${controlNo}-${semester}-${year}`
    },

    // Clear all data
    clearData() {
      this.employeeData = null
      this.performanceStandards = []
      this.standardOutcomes = []
      this.targetPeriod = null
      this.error = null
    },

    // Clear cache for specific employee/period
    clearCache(controlNo, semester, year) {
      const cacheKey = this.generateCacheKey(controlNo, semester, year)
      this.cache.delete(cacheKey)
    },

    // Clear entire cache
    clearAllCache() {
      this.cache.clear()
    },

    // Main function: Fetch employee performance data by ControlNo, semester, and year
    async fetchEmployeePerformance(controlNo, semester, year) {
      // Reset state
      this.loading = true
      this.error = null

      // Validate inputs
      if (!controlNo || !semester || !year) {
        this.error = 'ControlNo, semester, and year are required'
        this.loading = false
        throw new Error(this.error)
      }

      // Generate cache key
      const cacheKey = this.generateCacheKey(controlNo, semester, year)

      // Check cache first
      if (this.cache.has(cacheKey)) {
        console.log(`✅ Using cached data for ${cacheKey}`)
        const cached = this.cache.get(cacheKey)
        this.employeeData = cached.employeeData
        this.performanceStandards = cached.performanceStandards
        this.standardOutcomes = cached.standardOutcomes
        this.targetPeriod = cached.targetPeriod
        this.loading = false
        return this.employeeData
      }

      try {
        console.log(`🚀 Fetching employee performance: ${controlNo}, ${semester}, ${year}`)

        const token = localStorage.getItem('token')

        if (!token) {
          throw new Error('Authentication token not found')
        }

        // Make API call
        const response = await api.get(`/spms/employee/${controlNo}/${semester}/${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log('📥 API Response:', response.data)

        if (response.data.success) {
          // Process the response data
          const data = response.data.data || response.data
          await this.processApiResponse(data, semester, year)

          // Cache the data
          this.cache.set(cacheKey, {
            employeeData: this.employeeData,
            performanceStandards: this.performanceStandards,
            standardOutcomes: this.standardOutcomes,
            targetPeriod: this.targetPeriod,
            timestamp: new Date().toISOString(),
          })

          console.log('✅ Employee performance data loaded successfully')
          return this.employeeData
        } else {
          throw new Error(response.data.message || 'Failed to fetch employee data')
        }
      } catch (error) {
        console.error('❌ Error fetching employee performance:', error)

        this.error =
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch employee performance data'

        // Try to extract more details from error response
        if (error.response?.data) {
          console.error('Error details:', error.response.data)
        }

        throw error
      } finally {
        this.loading = false
      }
    },

    // Process API response and structure data
    async processApiResponse(data, semester, year) {
      try {
        console.log('🔄 Processing API response:', data)

        // The API response structure depends on your backend
        // Here are a few possible structures:

        // Structure 1: Direct employee object with nested performance data
        if (data.id || data.control_no || data.ControlNo) {
          this.employeeData = data

          // Extract performance standards
          if (data.performance_standards && Array.isArray(data.performance_standards)) {
            this.performanceStandards = data.performance_standards
          } else if (data.target_periods && Array.isArray(data.target_periods)) {
            // Find the matching target period
            const targetPeriod = data.target_periods.find(
              (period) => period.semester === semester && period.year === parseInt(year),
            )

            if (targetPeriod) {
              this.targetPeriod = {
                semester: targetPeriod.semester,
                year: targetPeriod.year,
              }

              this.performanceStandards = targetPeriod.performance_standards || []
              this.standardOutcomes = targetPeriod.standard_outcomes || []
            }
          }
        }

        // Structure 2: Array response (single employee in array)
        else if (Array.isArray(data) && data.length > 0) {
          this.employeeData = data[0]

          if (this.employeeData.target_periods && Array.isArray(this.employeeData.target_periods)) {
            const targetPeriod = this.employeeData.target_periods.find(
              (period) => period.semester === semester && period.year === parseInt(year),
            )

            if (targetPeriod) {
              this.targetPeriod = {
                semester: targetPeriod.semester,
                year: targetPeriod.year,
              }

              this.performanceStandards = targetPeriod.performance_standards || []
              this.standardOutcomes = targetPeriod.standard_outcomes || []
            }
          }
        }

        // Structure 3: Custom response structure
        else if (data.employee && data.performance) {
          this.employeeData = data.employee
          this.performanceStandards = data.performance.standards || []
          this.standardOutcomes = data.performance.outcomes || []
          this.targetPeriod = {
            semester: data.performance.semester || semester,
            year: data.performance.year || parseInt(year),
          }
        }

        // If no data structure matched, try to set defaults
        if (!this.employeeData) {
          this.employeeData = {
            control_no: data?.control_no || data?.ControlNo || '',
            name: 'Unknown Employee',
            semester: semester,
            year: parseInt(year),
          }
        }

        if (!this.targetPeriod) {
          this.targetPeriod = {
            semester: semester,
            year: parseInt(year),
          }
        }

        console.log('📊 Processed data:', {
          employee: this.employeeData?.name || 'Unknown',
          standardsCount: this.performanceStandards.length,
          outcomesCount: this.standardOutcomes.length,
          targetPeriod: this.targetPeriod,
        })
      } catch (error) {
        console.error('❌ Error processing API response:', error)
        throw new Error('Failed to process employee performance data')
      }
    },

    // Map standard outcomes to rows for a specific performance standard
    mapStandardOutcomesToRows(standardId = null) {
      try {
        // If we have standardOutcomes array, filter by standardId
        let outcomes = []

        if (standardId && this.standardOutcomes.length > 0) {
          outcomes = this.standardOutcomes.filter(
            (outcome) => outcome.performance_standard_id === standardId,
          )
        } else {
          outcomes = this.standardOutcomes
        }

        // Group outcomes by rating
        const outcomesByRating = {}

        outcomes.forEach((outcome) => {
          if (outcome.rating) {
            outcomesByRating[outcome.rating] = {
              rating: outcome.rating.toString(),
              quantity: outcome.quantity_target || outcome.quantity || '',
              effectiveness: outcome.effectiveness_criteria || outcome.effectiveness || '',
              timeliness: outcome.timeliness_range || outcome.timeliness || '',
              timelinessRange: outcome.timeliness_range || '',
              timelinessDate: outcome.timeliness_date || '',
              timelinessText: outcome.timeliness_description || outcome.timeliness_text || '',
            }
          }
        })

        // Create rows in descending order: 5, 4, 3, 2, 1
        const rows = [5, 4, 3, 2, 1].map((rating) => {
          const ratingStr = rating.toString()
          const outcome = outcomesByRating[ratingStr] || {}

          return {
            rating: ratingStr,
            quantity: outcome.quantity || '',
            effectiveness: outcome.effectiveness || '',
            timeliness: outcome.timeliness || '',
            timelinessRange: outcome.timelinessRange || '',
            timelinessDate: outcome.timelinessDate || '',
            timelinessText: outcome.timelinessText || '',
            timelinessDeadline: outcome.timelinessDeadline || '',
          }
        })

        return rows
      } catch (error) {
        console.error('❌ Error mapping standard outcomes:', error)
        return this.defaultRows
      }
    },

    // Transform performance data for display/editing
    transformForDisplay() {
      if (!this.employeeData) return null

      return {
        id: uuidv4(),
        name: this.employeeData.name || '',
        employeeId: this.employeeData.id,
        employeeData: this.employeeData,
        rank: this.employeeData.rank || '',
        position: this.employeeData.position || '',
        performanceStandards: this.transformPerformanceStandards(),
      }
    },

    // Transform performance standards
    transformPerformanceStandards() {
      if (!this.performanceStandards || this.performanceStandards.length === 0) {
        // Return a default standard if none exist
        return [this.createDefaultPerformanceStandard()]
      }

      return this.performanceStandards.map((standard) => {
        // Get standard outcomes for this standard
        const standardRows = this.mapStandardOutcomesToRows(standard.id)

        // Create the performance standard
        const perfStandard = {
          id: uuidv4(),
          expanded: true,
          categoryName: standard.category || standard.category_name || '',
          mfoName: standard.mfo || standard.mfo_name || '',
          outputName: standard.output_name || standard.output || '',
          indicatorName: standard.performance_indicator || standard.indicator_name || '',
          successIndicator: standard.success_indicator || '',
          requiredOutput: standard.required_output || '',
          modeOfVerification: standard.mode_of_verification || '',
          rows: {
            category: standard.category_id || standard.category || null,
            mfo: standard.mfo_id || standard.mfo || null,
            output: standard.output_id || standard.output || null,
          },
          quantityIndicatorType: standard.quantity_indicator_type || 'numeric',
          timelinessIndicatorType: standard.timeliness_indicator_type || 'beforeDeadline',
          timelinessInputs: { range: true, date: false, description: false },
          activeTimelinessInputs: { range: true, date: false, description: false },
          targetOutput: standard.target_output || {
            baseTarget: null,
            calculated: [],
          },
          coreCompetencies: standard.core_competency || standard.core || [],
          technicalCompetencies: standard.technical_competency || standard.technical || [],
          leadershipCompetencies: standard.leadership_competency || standard.leadership || [],
          standardOutcomeRows: standardRows.length > 0 ? standardRows : this.defaultRows,
        }

        return perfStandard
      })
    },

    // Create a default performance standard
    createDefaultPerformanceStandard() {
      return {
        id: uuidv4(),
        expanded: true,
        categoryName: '',
        mfoName: '',
        outputName: '',
        indicatorName: '',
        successIndicator: '',
        requiredOutput: '',
        modeOfVerification: '',
        rows: {
          category: null,
          mfo: null,
          output: null,
        },
        quantityIndicatorType: 'numeric',
        timelinessIndicatorType: 'beforeDeadline',
        timelinessInputs: { range: true, date: false, description: false },
        activeTimelinessInputs: { range: true, date: false, description: false },
        targetOutput: {
          baseTarget: null,
          calculated: [],
        },
        coreCompetencies: [],
        technicalCompetencies: [],
        leadershipCompetencies: [],
        standardOutcomeRows: this.defaultRows,
      }
    },

    // Helper: Check if employee has performance data for the period
    hasPerformanceData() {
      return this.performanceStandards && this.performanceStandards.length > 0
    },

    // Helper: Get summary statistics
    getPerformanceSummary() {
      if (!this.hasPerformanceData()) {
        return {
          totalStandards: 0,
          completedStandards: 0,
          completionRate: '0%',
        }
      }

      const totalStandards = this.performanceStandards.length

      // Count standards with at least 2 effectiveness values
      const completedStandards = this.performanceStandards.filter((standard) => {
        if (!standard.standard_outcomes) return false

        const filledValues = standard.standard_outcomes.filter(
          (outcome) =>
            outcome.effectiveness_criteria && outcome.effectiveness_criteria.trim().length > 0,
        ).length

        return filledValues >= 2
      }).length

      const completionRate =
        totalStandards > 0 ? `${Math.round((completedStandards / totalStandards) * 100)}%` : '0%'

      return {
        totalStandards,
        completedStandards,
        completionRate,
      }
    },

    // Export data for reports
    exportForReport() {
      return {
        employee: this.employeeInfo,
        period: this.periodInfo,
        performanceStandards: this.formattedPerformanceData,
        summary: this.getPerformanceSummary(),
        fetchedAt: new Date().toISOString(),
      }
    },
  },
})
