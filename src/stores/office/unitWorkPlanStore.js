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

    // Also update the createDefaultPerformanceStandard function to use sorted rows:
    createDefaultPerformanceStandard(standard = {}) {
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
        // ✅ Ensure these configuration fields are included
        quantityIndicatorType: standard.quantity_indicator_type || 'numeric',
        timelinessIndicatorType: standard.timeliness_indicator_type || 'beforeDeadline',
        timelinessInputs: { range: true, date: false, description: false },
        activeTimelinessInputs: { range: true, date: false, description: false },
        // ✅ Include target output data if available
        targetOutput: standard.target_output || {
          baseTarget: null,
          calculated: [],
        },
        coreCompetencies: standard.core || [],
        technicalCompetencies: standard.technical || [],
        leadershipCompetencies: standard.leadership || [],
        standardOutcomeRows: this.createSortedDefaultRows(),
      }
    },

    // In your unitWorkPlanStore.js, update the transformApiResponseToForm function:
    transformApiResponseToForm(employeesData) {
      if (!employeesData || !Array.isArray(employeesData) || employeesData.length === 0) {
        console.warn('⚠️ No employees data to transform')
        return []
      }

      console.log('🔄 Transforming employees data:', employeesData.length, 'employees')

      return employeesData.map((emp) => {
        // Get the first target period (should match the selected semester/year)
        const targetPeriod = emp.target_periods?.[0]

        // Get performance standards from target period
        const performanceStandards = targetPeriod?.performance_standards || []

        // Get standard outcomes from target period
        const standardOutcomes = targetPeriod?.standard_outcomes || []

        console.log(`🔄 Employee ${emp.name} data:`, {
          name: emp.name,
          rank: emp.rank,
          position: emp.position,
          performanceStandards: performanceStandards.length,
          standardOutcomes: standardOutcomes.length,
        })

        // Transform performance standards with their corresponding standard outcomes
        const transformedStandards = performanceStandards.map((standard, stdIndex) => {
          // Find standard outcomes for this standard (if any)
          const standardRows = this.mapStandardOutcomesToRows(standardOutcomes, stdIndex)

          console.log(`🔄 Standard ${stdIndex} outcomes mapped:`, standardRows)

          // Create the performance standard with proper data
          const perfStandard = this.createDefaultPerformanceStandard(standard)

          // Update the standard outcome rows with actual data from API
          if (standardRows.length > 0) {
            perfStandard.standardOutcomeRows = standardRows
          }

          // Set other properties from API
          perfStandard.outputName = standard.output_name || standard.output || ''
          perfStandard.indicatorName = standard.performance_indicator || ''
          perfStandard.successIndicator = standard.success_indicator || ''
          perfStandard.requiredOutput = standard.required_output || ''

          return perfStandard
        })

        // If no performance standards from API, create a default one
        if (transformedStandards.length === 0) {
          transformedStandards.push(this.createDefaultPerformanceStandard())
        }

        return {
          id: uuidv4(), // Generate new ID for the tab
          name: emp.name || '',
          employeeId: emp.id, // This should be the employee ID (18)
          employeeData: emp, // The full employee object from API
          performanceStandards: transformedStandards,
          // Store the rank for quick access
          rank: emp.rank || '',
          position: emp.position || '',
        }
      })
    },

    // In unitWorkPlanStore.js, update the mapStandardOutcomesToRows function:
    mapStandardOutcomesToRows(standardOutcomes) {
      if (!standardOutcomes || standardOutcomes.length === 0) {
        console.log('⚠️ No standard outcomes found')
        return this.createSortedDefaultRows()
      }

      try {
        // Group outcomes by rating
        const outcomesByRating = {}

        standardOutcomes.forEach((outcome) => {
          if (outcome.rating) {
            outcomesByRating[outcome.rating] = {
              rating: outcome.rating.toString(),
              quantity: outcome.quantity_target || '',
              effectiveness: outcome.effectiveness_criteria || '',
              timeliness: outcome.timeliness_range || '',
              timelinessRange: outcome.timeliness_range || '',
              timelinessDate: outcome.timeliness_date || '',
              timelinessText: outcome.timeliness_description || '',
            }
          }
        })

        console.log('📊 Mapped outcomes by rating:', outcomesByRating)

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
            timelinessDeadline: '',
          }
        })

        console.log('📊 Final rows in descending order:', rows)
        return rows
      } catch (error) {
        console.error('❌ Error mapping standard outcomes:', error)
        return this.createSortedDefaultRows()
      }
    },

    // Add this helper method to create default rows in descending order
    createSortedDefaultRows() {
      return [
        {
          rating: '5',
          quantity: '',
          effectiveness: '',
          timeliness: '',
          timelinessRange: '',
          timelinessDate: '',
          timelinessText: '',
          timelinessDeadline: '',
        },
        {
          rating: '4',
          quantity: '',
          effectiveness: '',
          timeliness: '',
          timelinessRange: '',
          timelinessDate: '',
          timelinessText: '',
          timelinessDeadline: '',
        },
        {
          rating: '3',
          quantity: '',
          effectiveness: '',
          timeliness: '',
          timelinessRange: '',
          timelinessDate: '',
          timelinessText: '',
          timelinessDeadline: '',
        },
        {
          rating: '2',
          quantity: '',
          effectiveness: '',
          timeliness: '',
          timelinessRange: '',
          timelinessDate: '',
          timelinessText: '',
          timelinessDeadline: '',
        },
        {
          rating: '1',
          quantity: '',
          effectiveness: '',
          timeliness: '',
          timelinessRange: '',
          timelinessDate: '',
          timelinessText: '',
          timelinessDeadline: '',
        },
      ]
    },

    async fetchFilteredEmployeesData() {
      this.loading = true
      this.error = null

      try {
        console.log('🚀 Starting fetchFilteredEmployeesData')

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

        console.log('📥 API Response received:', response.data)

        // The data is an array directly in response.data
        if (Array.isArray(response.data)) {
          console.log('✅ Data found as array:', response.data.length)
          const transformedData = this.transformApiResponseToForm(response.data)
          console.log('✅ Transformed employees:', transformedData)
          this.filteredEmployeesData = transformedData
          return transformedData
        }

        console.log('⚠️ Unexpected response structure:', response.data)
        return []
      } catch (error) {
        console.error('❌ Error fetching filtered employees data:', error)
        console.error('❌ Error response:', error.response?.data)
        this.error = error.message || 'Failed to fetch filtered employees data'
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

        // ✅ IMPORTANT: Pass the submissionData directly, not wrapped
        const payload = this.transformPayload(submissionData)

        console.log('📤 Saving UWP with payload:', JSON.stringify(payload, null, 2))

        const response = await api.post('/unit_work_plan/store', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          console.log('✅ UWP saved successfully:', response.data)

          this.savedUWPs.push({
            id: response.data.data?.id,
            semester: submissionData.form.semester, // Use from submissionData
            year: submissionData.form.year, // Use from submissionData
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

    // In your unitWorkPlanStore.js, update the transformPayload function:
    transformPayload(submissionData) {
      console.log('🔍 Building payload from submissionData:', submissionData)

      // Ensure we have the form data with semester and year
      const semester =
        submissionData.form?.semester || submissionData.uwpData?.targetPeriod?.semester || ''
      const year =
        submissionData.form?.year ||
        submissionData.uwpData?.targetPeriod?.year ||
        new Date().getFullYear()

      console.log('📅 Using semester/year:', { semester, year })

      const payload = {
        employees: submissionData.employees.map((emp, empIndex) => {
          console.log(`👤 Processing employee ${empIndex}:`, emp.name || emp.employeeId)

          const officeData = submissionData.uwpData?.hierarchy?.office || {}
          const office2Data = submissionData.uwpData?.hierarchy?.office2 || {}
          const groupData = submissionData.uwpData?.hierarchy?.group || {}
          const divisionData = submissionData.uwpData?.hierarchy?.division || {}
          const sectionData = submissionData.uwpData?.hierarchy?.section || {}
          const unitData = submissionData.uwpData?.hierarchy?.unit || {}

          // Get employee data - ensure we have values
          const controlNo =
            emp.employeeData?.employeeData?.ControlNo ||
            emp.employeeData?.ControlNo ||
            emp.ControlNo ||
            ''
          const employeeName =
            emp.name ||
            emp.employeeData?.name ||
            emp.employeeData?.employeeData?.name ||
            'Unknown Employee'
          const employeeId = emp.employeeId || emp.employeeData?.id || 0

          const employeePayload = {
            control_no: String(controlNo),
            employee_id: Number(employeeId),
            employee_name: String(employeeName),
            semester: String(semester),
            year: Number(year),
            office: String(officeData.label || officeData.name || ''),
            office2:
              office2Data.label || office2Data.name
                ? String(office2Data.label || office2Data.name)
                : null,
            group:
              groupData.label || groupData.name ? String(groupData.label || groupData.name) : null,
            division:
              divisionData.label || divisionData.name
                ? String(divisionData.label || divisionData.name)
                : null,
            section:
              sectionData.label || sectionData.name
                ? String(sectionData.label || sectionData.name)
                : null,
            unit: unitData.label || unitData.name ? String(unitData.label || unitData.name) : null,
            performance_standards: [],
          }

          console.log(`📝 Employee ${empIndex} base data:`, {
            semester: employeePayload.semester,
            year: employeePayload.year,
            control_no: employeePayload.control_no,
          })

          // Process performance standards
          if (emp.performanceStandards && Array.isArray(emp.performanceStandards)) {
            employeePayload.performance_standards = emp.performanceStandards.map(
              (standard, stdIndex) => {
                console.log(`   📋 Processing standard ${stdIndex} for employee ${empIndex}`)

                // Resolve category, mfo, output as strings
                let categoryValue = ''
                let mfoValue = ''
                let outputValue = ''

                // Try multiple sources for category
                if (standard.rows?.category?.name) {
                  categoryValue = standard.rows.category.name
                } else if (standard.categoryName) {
                  categoryValue = standard.categoryName
                } else if (standard.rows?.category) {
                  categoryValue = String(standard.rows.category)
                } else if (standard.category) {
                  categoryValue = String(standard.category)
                }

                // Try multiple sources for MFO
                if (standard.rows?.mfo?.name) {
                  mfoValue = standard.rows.mfo.name
                } else if (standard.mfoName) {
                  mfoValue = standard.mfoName
                } else if (standard.rows?.mfo) {
                  mfoValue = String(standard.rows.mfo)
                } else if (standard.mfo) {
                  mfoValue = String(standard.mfo)
                }

                // Try multiple sources for output
                if (standard.rows?.output?.name) {
                  outputValue = standard.rows.output.name
                } else if (standard.outputName) {
                  outputValue = standard.outputName
                } else if (standard.rows?.output) {
                  outputValue = String(standard.rows.output)
                } else if (standard.output) {
                  outputValue = String(standard.output)
                }

                console.log(`   📊 Standard ${stdIndex} values:`, {
                  category: categoryValue,
                  mfo: mfoValue,
                  output: outputValue,
                })

                // Resolve performance indicator
                let performanceIndicator = ''
                if (standard.indicatorName) {
                  if (
                    typeof standard.indicatorName === 'number' ||
                    !isNaN(standard.indicatorName)
                  ) {
                    const verbId = Number(standard.indicatorName)
                    if (
                      this.officeLibraryIndicatorStore?.verbs &&
                      Array.isArray(this.officeLibraryIndicatorStore.verbs)
                    ) {
                      const foundVerb = this.officeLibraryIndicatorStore.verbs.find(
                        (v) => v.id === verbId,
                      )
                      if (foundVerb) {
                        performanceIndicator = foundVerb.indicator_name || foundVerb.name || ''
                      }
                    }
                  } else {
                    performanceIndicator = String(standard.indicatorName).trim()
                  }
                }

                // Build ratings array
                const ratings = []
                let defaultTimelinessValue = '' // Store a default timeliness value

                if (standard.standardOutcomeRows && Array.isArray(standard.standardOutcomeRows)) {
                  standard.standardOutcomeRows.forEach((row) => {
                    if (row.rating) {
                      // Determine timeliness
                      let timelinessValue = ''

                      if (
                        standard.timelinessIndicatorType === 'beforeDeadline' &&
                        row.rating === '3'
                      ) {
                        if (standard.timelinessInputs?.range && row.timelinessRange) {
                          timelinessValue = row.timelinessRange
                        }
                        if (standard.timelinessInputs?.date && row.timelinessDate) {
                          timelinessValue = timelinessValue
                            ? `${timelinessValue} by ${row.timelinessDate}`
                            : `by ${row.timelinessDate}`
                        }
                        if (standard.timelinessInputs?.description && row.timelinessText) {
                          timelinessValue = timelinessValue
                            ? `${timelinessValue} ${row.timelinessText}`
                            : row.timelinessText
                        }
                      } else if (
                        standard.timelinessIndicatorType === 'onDeadline' &&
                        row.rating === '5'
                      ) {
                        if (standard.timelinessInputs?.range && row.timelinessRange) {
                          timelinessValue = row.timelinessRange
                        }
                        if (standard.timelinessInputs?.date && row.timelinessDate) {
                          timelinessValue = timelinessValue
                            ? `${timelinessValue} by ${row.timelinessDate}`
                            : `by ${row.timelinessDate}`
                        }
                        if (standard.timelinessInputs?.description && row.timelinessText) {
                          timelinessValue = timelinessValue
                            ? `${timelinessValue} ${row.timelinessText}`
                            : row.timelinessText
                        }
                      }

                      // Fallback
                      if (!timelinessValue) {
                        timelinessValue = row.timeliness || row.timelinessRange || ''
                      }

                      // Store default timeliness value if not set yet
                      if (!defaultTimelinessValue && timelinessValue) {
                        defaultTimelinessValue = timelinessValue
                      }

                      ratings.push({
                        rating: Number(row.rating) || 0,
                        quantity: String(row.quantity || ''),
                        effectiveness: String(row.effectiveness || ''),
                        timeliness: String(timelinessValue),
                        timeliness_range: String(row.timelinessRange || ''),
                        timeliness_date: String(row.timelinessDate || ''),
                        timeliness_description: String(row.timelinessText || ''),
                      })
                    }
                  })
                }

                console.log(`   📈 Standard ${stdIndex} has ${ratings.length} ratings`)

                // FIXED: Build the complete config object with all required fields
                const quantityType = standard.quantityIndicatorType || 'numeric'
                const timelinessType = standard.timelinessIndicatorType || 'beforeDeadline'
                const timelinessInputs = standard.timelinessInputs || {
                  range: true,
                  date: false,
                  description: false,
                }

                // Find the appropriate row for quantity and timeliness values
                const quantityRow =
                  standard.standardOutcomeRows?.find((row) => row.rating === '5') || {}
                const timelinessRow =
                  timelinessType === 'beforeDeadline'
                    ? standard.standardOutcomeRows?.find((row) => row.rating === '3') || {}
                    : standard.standardOutcomeRows?.find((row) => row.rating === '5') || {}

                // Get required output - if empty, use a default
                const requiredOutput =
                  standard.requiredOutput?.trim() || standard.outputName?.trim() || 'N/A'

                // Use default timeliness value if timelinessRow doesn't have one
                const timelinessValue = timelinessRow.timeliness || defaultTimelinessValue || 'N/A'
                const timelinessQuantity = timelinessRow.quantity || quantityRow.quantity || 'N/A'

                const config = {
                  quantity_indicator_type: {
                    type: String(quantityType),
                    quantity: String(quantityRow.quantity || 'N/A'),
                    timeliness: String(timelinessValue),
                  },
                  timeliness_indicator_type: {
                    type: String(timelinessType),
                    quantity: String(timelinessQuantity),
                    timeliness: String(timelinessValue),
                  },
                  timeliness_inputs: {
                    type: 'object',
                    quantity: String(timelinessQuantity),
                    timeliness: String(timelinessValue),
                  },
                  target_output: {
                    type: 'object',
                    quantity: String(quantityRow.quantity || 'N/A'),
                    timeliness: String(timelinessValue),
                  },
                }

                // Add timeliness input types if they exist
                if (timelinessInputs.range !== undefined) {
                  config.timeliness_inputs.range = Boolean(timelinessInputs.range)
                }
                if (timelinessInputs.date !== undefined) {
                  config.timeliness_inputs.date = Boolean(timelinessInputs.date)
                }
                if (timelinessInputs.description !== undefined) {
                  config.timeliness_inputs.description = Boolean(timelinessInputs.description)
                }

                // Add target output details if available
                if (standard.targetOutput) {
                  config.target_output.baseTarget = standard.targetOutput.baseTarget || null
                  config.target_output.calculated = standard.targetOutput.calculated || []
                }

                // Build the final standard object
                const standardPayload = {
                  category: String(categoryValue || ''),
                  mfo: String(mfoValue || ''),
                  output: String(outputValue || ''),
                  core_competency: Array.isArray(standard.coreCompetencies)
                    ? standard.coreCompetencies
                    : [],
                  technical_competency: Array.isArray(standard.technicalCompetencies)
                    ? standard.technicalCompetencies
                    : [],
                  leadership_competency: Array.isArray(standard.leadershipCompetencies)
                    ? standard.leadershipCompetencies
                    : [],
                  success_indicator: String(standard.successIndicator || ''),
                  performance_indicator: String(performanceIndicator || ''),
                  required_output: String(requiredOutput), // Fixed: Now has a value
                  ratings: ratings.length > 0 ? ratings : [],
                  config: config,
                }

                console.log(`   ✅ Built standard ${stdIndex}:`, {
                  category: standardPayload.category,
                  required_output: standardPayload.required_output,
                  ratingsCount: standardPayload.ratings.length,
                  hasConfig: !!standardPayload.config,
                  configFields: standardPayload.config ? Object.keys(standardPayload.config) : [],
                })

                return standardPayload
              },
            )
          }

          console.log(
            `✅ Employee ${empIndex} payload ready with ${employeePayload.performance_standards.length} standards`,
          )
          return employeePayload
        }),
      }

      // Final validation
      console.log('🔍 Final payload validation:')
      payload.employees.forEach((emp, idx) => {
        console.log(`  Employee ${idx}:`, {
          hasSemester: !!emp.semester,
          semester: emp.semester,
          standards: emp.performance_standards?.length || 0,
          firstStandard: emp.performance_standards?.[0]
            ? {
                category: emp.performance_standards[0].category,
                required_output: emp.performance_standards[0].required_output,
                hasRatings: emp.performance_standards[0].ratings?.length > 0,
                hasConfig: !!emp.performance_standards[0].config,
                configFields: emp.performance_standards[0].config
                  ? Object.keys(emp.performance_standards[0].config)
                  : [],
              }
            : null,
        })
      })

      return payload
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
