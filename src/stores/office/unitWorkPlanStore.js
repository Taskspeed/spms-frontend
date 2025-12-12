import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { v4 as uuidv4 } from 'uuid'

export const useUnitWorkPlanStore = defineStore('unitWorkPlan', {
  state: () => ({
    uwpData: null,
    formData: null,
    employeeData: [],
    loading: false,
    error: null,
    savedUWPs: [],
    officeLibraryIndicatorStore: null,
    filteredEmployeesData: [],
    // ✅ NEW: Default standard rows for fallback
    defaultStandardRows: [
      { rating: '5', quantity: '', effectiveness: '', timeliness: '' },
      { rating: '4', quantity: '', effectiveness: '', timeliness: '' },
      { rating: '3', quantity: '', effectiveness: '', timeliness: '' },
      { rating: '2', quantity: '', effectiveness: '', timeliness: '' },
      { rating: '1', quantity: '', effectiveness: '', timeliness: '' },
    ],
  }),

  getters: {
    getCurrentSemester: () => {
      const month = new Date().getMonth() + 1
      return month >= 1 && month <= 6 ? 'January-June' : 'July-December'
    },

    getCurrentYear: () => {
      return new Date().getFullYear()
    },

    getSemesterOptions(state) {
      const current = state.getCurrentSemester
      return [current, current === 'January-June' ? 'July-December' : 'January-June']
    },

    getYearOptions(state) {
      const currentYear = state.getCurrentYear
      return [currentYear, currentYear + 1]
    },

    getFilteredEmployeesData(state) {
      return state.filteredEmployeesData
    },
  },

  actions: {
    // Initialize UWP data from session storage
    initializeUWPData() {
      try {
        const stored = sessionStorage.getItem('uwpData')
        if (stored) {
          this.uwpData = JSON.parse(stored)
          console.log('✅ UWP Data loaded from sessionStorage:', this.uwpData)
          return this.uwpData
        }
      } catch (error) {
        console.error('❌ Failed to load UWP data:', error)
        this.error = error.message
      }
      return null
    },

    // Set UWP data
    setUWPData(data) {
      this.uwpData = data
      sessionStorage.setItem('uwpData', JSON.stringify(data))
      console.log('✅ UWP Data saved to sessionStorage')
    },

    // Set form data
    setFormData(data) {
      this.formData = {
        semester: data.semester,
        year: data.year,
      }
      console.log('✅ Form data set:', this.formData)
    },

    // Set employee data
    setEmployeeData(employees) {
      this.employeeData = employees
      console.log('✅ Employee data set:', this.employeeData.length, 'employees')
    },

    // Build payload
    buildPayload(submissionData) {
      return {
        uwpData: this.uwpData,
        formData: this.formData,
        employeeData: this.employeeData,
        submissionData: submissionData,
        timestamp: new Date().toISOString(),
      }
    },

    // ✅ UPDATED: Extract ControlNo from filtered available employees
    extractFilteredEmployeeControlNos() {
      if (!this.uwpData) {
        console.warn('⚠️ No UWP data found')
        return []
      }

      // Debug: Log all possible employee sources
      console.log('🔍 Checking UWP data structure:', {
        hasFilteredAvailableEmployees: !!this.uwpData.filteredAvailableEmployees,
        filteredAvailableEmployeesCount: this.uwpData.filteredAvailableEmployees?.length || 0,
        hasAvailableEmployees: !!this.uwpData.availableEmployees,
        availableEmployeesCount: this.uwpData.availableEmployees?.length || 0,
        hasEmployeesWithoutTargetPeriod: !!this.uwpData.employeesWithoutTargetPeriod,
        employeesWithoutTargetPeriodCount: this.uwpData.employeesWithoutTargetPeriod?.length || 0,
      })

      // Check multiple possible sources for filtered employees
      const employees =
        this.uwpData.filteredAvailableEmployees ||
        this.uwpData.availableEmployees ||
        this.uwpData.employeesWithoutTargetPeriod ||
        []

      console.log('🔍 Total employees found:', employees.length)

      if (employees.length === 0) {
        console.warn('⚠️ No employees found in any data source')
        return []
      }

      const controlNos = employees
        .map((emp, index) => {
          console.log(`🔍 Employee ${index}:`, {
            name: emp.name,
            hasEmployeeData: !!emp.employeeData,
            directControlNo: emp.ControlNo,
            employeeDataControlNo: emp.employeeData?.ControlNo,
            id: emp.id,
            fullData: emp,
          })

          // Try to get ControlNo from different possible locations
          const controlNo =
            emp.employeeData?.ControlNo ||
            emp.ControlNo ||
            emp.controlNo ||
            emp.control_no ||
            emp.id || // Fallback to ID if ControlNo not available
            null

          console.log(`🔍 Employee ${index} ControlNo/ID:`, controlNo)
          return controlNo
        })
        .filter((controlNo) => controlNo !== null && controlNo !== undefined && controlNo !== '')

      console.log('✅ Final extracted ControlNos/IDs:', controlNos)
      return controlNos
    },

    // ✅ UPDATED: Build endpoint string from filtered employees
    buildFilteredEmployeeEndpoint() {
      const identifiers = this.extractFilteredEmployeeControlNos()

      if (identifiers.length === 0) {
        console.warn('⚠️ No identifiers found for filtered employees')
        return null
      }

      const endpoint = `/spms/employee/${identifiers.join(',')}`
      console.log('📍 Built endpoint:', endpoint)
      return endpoint
    },

    // ✅ UPDATED: Create default performance standard structure
    createDefaultPerformanceStandard(standard = {}) {
      const standardOutcomes = standard.target_periods?.[0]?.standard_outcomes || []

      // Use provided standard outcomes or fall back to default rows
      const rows =
        standardOutcomes.length > 0
          ? standardOutcomes.map((outcome) => ({
              rating: outcome.rating || '',
              quantity: outcome.quantity_target || outcome.quantity || '',
              effectiveness: outcome.effectiveness_criteria || outcome.effectiveness || '',
              timeliness: outcome.timeliness_range || outcome.timeliness || '',
              timelinessRange: outcome.timeliness_range || '',
              timelinessText: outcome.timeliness_text || '',
              timelinessDeadline: outcome.timeliness_deadline || '',
              timelinessDate: outcome.timeliness_date || '',
            }))
          : [...this.defaultStandardRows] // Deep copy of default rows

      return {
        id: uuidv4(),
        expanded: true,
        categoryName: standard.category || '',
        mfoName: standard.mfo || '',
        outputName: standard.output_name || standard.output || '',
        indicatorName: standard.performance_indicator || '',
        successIndicator: standard.success_indicator || '',
        requiredOutput: standard.required_output || '',
        modeOfVerification: '',
        rows: {
          category: standard.category_id || standard.category || null,
          mfo: standard.mfo_id || standard.mfo || null,
          output: standard.output_id || standard.output || null,
        },
        quantityIndicatorType: standard.quantity_indicator_type || 'numeric',
        timelinessIndicatorType: standard.timeliness_indicator_type || 'beforeDeadline',
        timelinessInputs: { range: true, date: false, description: false },
        activeTimelinessInputs: { range: true, date: false, description: false },
        coreCompetencies: standard.core || [],
        technicalCompetencies: standard.technical || [],
        leadershipCompetencies: standard.leadership || [],
        standardOutcomeRows: rows,
      }
    },

    // ✅ UPDATED: Transform API response to form structure
    transformApiResponseToForm(employeesData) {
      if (!employeesData || !Array.isArray(employeesData) || employeesData.length === 0) {
        console.warn('⚠️ No employees data to transform')
        return []
      }

      console.log('🔄 Transforming employees data:', employeesData.length, 'employees')

      return employeesData.map((emp, index) => {
        console.log(`🔄 Employee ${index}:`, {
          id: emp.id,
          name: emp.name,
          hasTargetPeriods: !!emp.target_periods,
          targetPeriodsCount: emp.target_periods?.length || 0,
        })

        const targetPeriod = emp.target_periods?.[0] // Get first target period
        const performanceStandards = targetPeriod?.performance_standards || []

        console.log(`🔄 Employee ${index} performance standards:`, performanceStandards.length)

        return {
          id: uuidv4(),
          name: emp.name || '',
          employeeId: emp.id,
          employeeData: emp,
          performanceStandards:
            performanceStandards.length > 0
              ? performanceStandards.map((standard, stdIndex) => {
                  console.log(`🔄 Employee ${index}, Standard ${stdIndex}:`, standard)
                  return this.createDefaultPerformanceStandard(standard)
                })
              : [this.createDefaultPerformanceStandard()], // Default empty standard
        }
      })
    },

    // ✅ UPDATED: Fetch filtered employees data
    async fetchFilteredEmployeesData() {
      this.loading = true
      this.error = null

      try {
        console.log('🚀 Starting fetchFilteredEmployeesData')

        // Debug UWP data
        console.log('🔍 Current UWP data:', this.uwpData)

        const token = localStorage.getItem('token')
        const endpoint = this.buildFilteredEmployeeEndpoint()

        if (!endpoint) {
          console.log('⚠️ No endpoint built, returning empty array')
          this.filteredEmployeesData = []
          return []
        }

        console.log('📤 Fetching employee data from:', endpoint)

        const response = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log('📥 API Response received:', {
          success: response.data.success,
          dataLength: response.data.data?.length || 0,
          data: response.data.data,
        })

        if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
          // ✅ Transform the response
          const transformedData = this.transformApiResponseToForm(response.data.data)
          console.log('✅ Transformed employees:', transformedData)

          // ✅ Store the transformed data
          this.filteredEmployeesData = transformedData

          return transformedData
        }

        // If API returns error but with data, still try to transform
        if (response.data.data && Array.isArray(response.data.data)) {
          const transformedData = this.transformApiResponseToForm(response.data.data)
          this.filteredEmployeesData = transformedData
          return transformedData
        }

        console.log('ℹ️ No valid data in response, returning empty array')
        return []
      } catch (error) {
        console.error('❌ Error fetching filtered employees data:', error)
        this.error = error.message || 'Failed to fetch filtered employees data'

        // Return empty array on error instead of throwing
        this.filteredEmployeesData = []
        return []
      } finally {
        this.loading = false
      }
    },

    async saveUWP(submissionData, officeLibraryIndicatorStore) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        // ✅ STORE THE REFERENCE
        this.officeLibraryIndicatorStore = officeLibraryIndicatorStore
        console.log('📚 Store reference set:', this.officeLibraryIndicatorStore)

        const payload = this.transformPayload(submissionData)

        console.log('📤 Saving UWP with payload:', payload)

        const response = await api.post('/unit_work_plan/store', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          console.log('✅ UWP saved successfully:', response.data)

          this.savedUWPs.push({
            id: response.data.data?.id,
            semester: this.formData.semester,
            year: this.formData.year,
            savedAt: new Date().toISOString(),
          })

          sessionStorage.removeItem('uwpData')
          this.uwpData = null

          return response.data
        }

        throw new Error(response.data.message || 'Failed to save UWP')
      } catch (error) {
        console.error('❌ Error saving UWP:', error)
        this.error = error.message || 'Failed to save UWP'
        throw error
      } finally {
        this.loading = false
      }
    },

    transformPayload(submissionData) {
      return {
        employees: submissionData.employees.map((emp) => {
          const officeData = submissionData.uwpData.hierarchy.office || {}
          const office2Data = submissionData.uwpData.hierarchy.office2 || {}
          const groupData = submissionData.uwpData.hierarchy.group || {}
          const divisionData = submissionData.uwpData.hierarchy.division || {}
          const sectionData = submissionData.uwpData.hierarchy.section || {}
          const unitData = submissionData.uwpData.hierarchy.unit || {}

          // ✅ FIX: Use the employeeData already stored in the tab
          const controlNo =
            emp.employeeData?.employeeData?.ControlNo || emp.employeeData?.ControlNo || ''

          return {
            control_no: controlNo,
            employee_id: emp.employeeId,
            employee_name: emp.name || emp.employeeData?.name || '',
            semester: submissionData.form.semester || '',
            year: submissionData.form.year || new Date().getFullYear(),
            office: officeData.label || officeData.name || '',
            office2: office2Data.label || office2Data.name || null,
            group: groupData.label || groupData.name || null,
            division: divisionData.label || divisionData.name || null,
            section: sectionData.label || sectionData.name || null,
            unit: unitData.label || unitData.name || null,
            performance_standards: (emp.performanceStandards || []).map((standard, index) => {
              // ✅ FIX:  Properly resolve the indicator_name from the ID
              let performanceIndicator = ''

              if (standard.indicatorName) {
                // Check if it's an ID (number)
                if (typeof standard.indicatorName === 'number' || !isNaN(standard.indicatorName)) {
                  const verbId = Number(standard.indicatorName)

                  // Look up the verb in the store
                  if (
                    this.officeLibraryIndicatorStore?.verbs &&
                    Array.isArray(this.officeLibraryIndicatorStore.verbs)
                  ) {
                    const foundVerb = this.officeLibraryIndicatorStore.verbs.find(
                      (v) => v.id === verbId,
                    )

                    if (foundVerb) {
                      performanceIndicator = foundVerb.indicator_name || foundVerb.name || ''
                      console.log(`✅ Found verb for ID ${verbId}: `, foundVerb.indicator_name)
                    } else {
                      console.warn(
                        `⚠️ Verb not found for ID ${verbId}. Available verbs:`,
                        this.officeLibraryIndicatorStore.verbs,
                      )
                    }
                  } else {
                    console.warn('⚠️ officeLibraryIndicatorStore.verbs not available')
                  }
                } else {
                  // It's already a string
                  performanceIndicator = String(standard.indicatorName).trim()
                }
              }

              // Ensure it's never empty
              if (!performanceIndicator) {
                console.error(`❌ Performance indicator is empty for standard ${index}: `, standard)
              }

              console.log(`🎯 Standard ${index}: `, {
                inputIndicatorName: standard.indicatorName,
                resolvedIndicator: performanceIndicator,
              })

              return {
                category: standard.categoryName || standard.rows?.category || '',
                mfo: standard.mfoName || standard.rows?.mfo || '',
                output: standard.outputName || standard.rows?.output || '',
                core_competency: standard.coreCompetencies || [],
                technical_competency: standard.technicalCompetencies || [],
                leadership_competency: standard.leadershipCompetencies || [],
                success_indicator: standard.successIndicator || '',
                performance_indicator: performanceIndicator,
                required_output: standard.requiredOutput || '',
                ratings: (standard.standardOutcomeRows || [])
                  .map((row) => ({
                    rating: parseInt(row.rating) || 0,
                    quantity: row.quantity || '',
                    effectiveness: row.effectiveness || '',
                    timeliness: row.timeliness || row.timelinessRange || '',
                  }))
                  .filter((rating) => rating.rating > 0),
              }
            }),
          }
        }),
      }
    },

    // Fetch saved UWPs
    async fetchSavedUWPs() {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        const response = await api.get('/unit_work_plan', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          this.savedUWPs = response.data.data || []
          console.log('✅ Fetched saved UWPs:', this.savedUWPs)
          return this.savedUWPs
        }

        throw new Error(response.data.message || 'Failed to fetch UWPs')
      } catch (error) {
        console.error('❌ Error fetching UWPs:', error)
        this.error = error.message || 'Failed to fetch UWPs'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Get UWP by ID
    async getUWPById(id) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        const response = await api.get(`/unit_work_plan/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          console.log('✅ Fetched UWP:', response.data.data)
          return response.data.data
        }

        throw new Error(response.data.message || 'Failed to fetch UWP')
      } catch (error) {
        console.error('❌ Error fetching UWP:', error)
        this.error = error.message || 'Failed to fetch UWP'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update UWP
    async updateUWP(id, submissionData) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        const payload = this.buildPayload(submissionData)

        const response = await api.put(`/unit_work_plan/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          console.log('✅ UWP updated successfully:', response.data)
          return response.data
        }

        throw new Error(response.data.message || 'Failed to update UWP')
      } catch (error) {
        console.error('❌ Error updating UWP:', error)
        this.error = error.message || 'Failed to update UWP'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Delete UWP
    async deleteUWP(id) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        const response = await api.delete(`/unit_work_plan/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          console.log('✅ UWP deleted successfully')

          // Remove from saved list
          this.savedUWPs = this.savedUWPs.filter((uwp) => uwp.id !== id)

          return response.data
        }

        throw new Error(response.data.message || 'Failed to delete UWP')
      } catch (error) {
        console.error('❌ Error deleting UWP:', error)
        this.error = error.message || 'Failed to delete UWP'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Clear all data
    clearAllData() {
      this.uwpData = null
      this.formData = null
      this.employeeData = []
      this.filteredEmployeesData = []
      this.error = null
      sessionStorage.removeItem('uwpData')
      console.log('✅ All UWP data cleared')
    },
  },
})
