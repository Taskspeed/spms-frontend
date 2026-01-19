//src\stores\office\unitWorkPlanStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { v4 as uuidv4 } from 'uuid'

/* -------------------------------------------------------------------------- */
/* Helpers & constants                                                        */
/* -------------------------------------------------------------------------- */

const sortedDefaultRows = () => [
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

const currentSemester = () => {
  const month = new Date().getMonth() + 1
  return month >= 1 && month <= 6 ? 'January-June' : 'July-December'
}

const nextSemester = () => (currentSemester() === 'January-June' ? 'July-December' : 'January-June')

const currentYear = () => new Date().getFullYear()

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

export const useUnitWorkPlanStore = defineStore('unitWorkPlan', {
  state: () => ({
    uwpData: null,
    formData: null,
    employeeData: [],
    filteredEmployeesData: [],
    savedUWPs: [],
    loading: false,
    error: null,
    officeLibraryIndicatorStore: null,
    officeLibraryStore: null,
  }),

  getters: {
    getCurrentSemester: () => currentSemester(),
    getCurrentYear: () => currentYear(),
    getSemesterOptions: () => [currentSemester(), nextSemester()],
    getYearOptions: () => [currentYear(), currentYear() + 1],
    getFilteredEmployeesData: (state) => state.filteredEmployeesData,
  },

  actions: {
    /* ----------------------------- label resolvers ----------------------------- */

    /**
     * Resolve category label from ID or object
     */
    resolveCategoryLabel(category, officeLibraryStore) {
      if (!category) return ''

      if (typeof category === 'string' && isNaN(Number(category))) {
        return category
      }

      if (typeof category === 'object' && category !== null) {
        if (category.name || category.label) {
          return category.name || category.label
        }
      }

      const id = typeof category === 'object' ? category?.id : category
      if (!id) return ''

      const store = officeLibraryStore || this.officeLibraryStore
      const found = store?.categories?.find((c) => c.id === id)
      return found?.name || found?.label || ''
    },

    /**
     * Resolve MFO label from ID or object
     */
    resolveMfoLabel(mfo, officeLibraryStore) {
      if (!mfo) return ''

      if (typeof mfo === 'string' && isNaN(Number(mfo))) {
        return mfo
      }

      if (typeof mfo === 'object' && mfo !== null) {
        if (mfo.name || mfo.label) {
          return mfo.name || mfo.label
        }
      }

      const id = typeof mfo === 'object' ? mfo?.id : mfo
      if (!id) return ''

      const store = officeLibraryStore || this.officeLibraryStore
      const found = store?.mfos?.find((m) => m.id === id)
      return found?.name || found?.label || ''
    },

    /**
     * Resolve output label from ID or object
     * Handles both regular outputs and category_outputs (for Support category)
     */
    resolveOutputLabel(output, categoryId, mfoId, officeLibraryStore) {
      if (!output) return ''

      if (typeof output === 'string' && isNaN(Number(output))) {
        return output
      }

      if (typeof output === 'object' && output !== null) {
        if (output.name || output.label) {
          return output.name || output.label
        }
      }

      const id = typeof output === 'object' ? output?.id : output
      if (!id) return ''

      const store = officeLibraryStore || this.officeLibraryStore
      if (!store) return ''

      const resolvedCategoryId = typeof categoryId === 'object' ? categoryId?.id : categoryId

      const category = store.categories?.find((c) => c.id === resolvedCategoryId)
      const isSupport =
        category?.name?.toLowerCase().includes('support') ||
        category?.name?.trim().toUpperCase().startsWith('C')

      if (isSupport) {
        const found = store.category_outputs?.find((o) => o.id === id)
        return found?.name || found?.label || ''
      }

      const resolvedMfoId = typeof mfoId === 'object' ? mfoId?.id : mfoId
      const found = store.outputs?.find(
        (o) =>
          o.id === id &&
          o.f_category_id === resolvedCategoryId &&
          (!resolvedMfoId || o.mfo_id === resolvedMfoId),
      )
      return found?.name || found?.label || ''
    },

    /**
     * Resolve performance indicator (verb) label from ID or text
     */
    resolveVerbLabel(idOrText) {
      if (!idOrText) return ''

      if (typeof idOrText === 'string' && isNaN(Number(idOrText))) {
        return idOrText
      }

      const verbId = Number(idOrText)
      const verb = this.officeLibraryIndicatorStore?.verbs?.find((v) => v.id === verbId)
      return verb?.indicator_name || verb?.name || ''
    },

    /**
     * Extract ID from value (handles both object and primitive)
     */
    extractId(value) {
      if (value === null || value === undefined) return null
      if (typeof value === 'number') return value
      if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
        return Number(value)
      }
      if (typeof value === 'object') {
        if (value.id !== null && value.id !== undefined) {
          return typeof value.id === 'number' ? value.id : Number(value.id)
        }
        if (value.value !== null && value.value !== undefined) {
          return typeof value.value === 'number' ? value.value : Number(value.value)
        }
      }
      return null
    },

    /**
     * Build timeliness value string from row data based on active inputs
     */
    buildTimelinessValue(row, activeTimelinessInputs) {
      if (!row) return ''

      let timelinessValue = ''

      // Build timeliness from active input types
      if (activeTimelinessInputs?.range && row.timelinessRange) {
        timelinessValue = row.timelinessRange
      }
      if (activeTimelinessInputs?.date && row.timelinessDate) {
        timelinessValue = timelinessValue
          ? `${timelinessValue} by ${row.timelinessDate}`
          : `by ${row.timelinessDate}`
      }
      if (activeTimelinessInputs?.description && row.timelinessText) {
        timelinessValue = timelinessValue
          ? `${timelinessValue} ${row.timelinessText}`
          : row.timelinessText
      }

      // FALLBACK: If no active inputs produced a value, try to get from any available field
      if (!timelinessValue) {
        if (row.timelinessText) {
          timelinessValue = row.timelinessText
        } else if (row.timelinessRange) {
          timelinessValue = row.timelinessRange
        } else if (row.timelinessDate) {
          timelinessValue = `by ${row.timelinessDate}`
        } else if (row.timeliness) {
          timelinessValue = row.timeliness
        }
      }

      return timelinessValue
    },

    /**
     * Parse timeliness string from API into components
     * Enhanced version to handle various formats
     */
    parseTimelinessFromApi(timelinessString) {
      if (!timelinessString) return { range: '', date: '', text: '' }

      // Handle "lapses" case specifically
      if (timelinessString.toLowerCase().includes('lapses')) {
        return {
          range: '',
          date: '',
          text: 'lapses',
        }
      }

      const result = { range: '', date: '', text: '' }
      let remainingText = timelinessString.trim()

      // Extract date (format: YYYY-MM-DD or YYYY/MM/DD)
      const dateMatch = remainingText.match(/\d{4}[-/]\d{2}[-/]\d{2}/)
      if (dateMatch) {
        result.date = dateMatch[0].replace(/\//g, '-') // Normalize to YYYY-MM-DD
        remainingText = remainingText.replace(dateMatch[0], '').trim()
      }

      // Extract range (format: number-number or "number - number")
      const rangeMatch = remainingText.match(/(\d+)\s*-\s*(\d+)/)
      if (rangeMatch) {
        result.range = `${rangeMatch[1]}-${rangeMatch[2]}`
        remainingText = remainingText.replace(rangeMatch[0], '').trim()
      }

      // Remove "by" prefix if present
      remainingText = remainingText.replace(/^by\s+/i, '').trim()

      // Check for known description patterns
      const knownPatterns = [
        'before schedule',
        'after schedule',
        'as per schedule',
        'on schedule',
        'ahead of schedule',
        'behind schedule',
      ]

      const foundPattern = knownPatterns.find((pattern) =>
        remainingText.toLowerCase().includes(pattern),
      )

      if (foundPattern) {
        result.text = foundPattern
        remainingText = remainingText.replace(new RegExp(foundPattern, 'i'), '').trim()
      }

      // If there's still text remaining and no pattern was found, use it as description
      if (!result.text && remainingText) {
        result.text = remainingText
      }

      console.log('📊 Parsed timeliness:', {
        input: timelinessString,
        output: result,
      })

      return result
    },

    /* ----------------------------- session helpers ----------------------------- */
    initializeUWPData() {
      try {
        const stored = sessionStorage.getItem('uwpData')
        if (stored) {
          this.uwpData = JSON.parse(stored)
          return this.uwpData
        }
      } catch (error) {
        this.error = error.message
      }
      return null
    },

    setUWPData(data) {
      this.uwpData = data
      sessionStorage.setItem('uwpData', JSON.stringify(data))
    },

    setFormData(data) {
      this.formData = { semester: data.semester, year: data.year }
    },

    setEmployeeData(employees) {
      this.employeeData = employees
    },

    clearAllData() {
      this.uwpData = null
      this.formData = null
      this.employeeData = []
      this.filteredEmployeesData = []
      this.error = null
      sessionStorage.removeItem('uwpData')
    },

    /* ----------------------------- transformations ----------------------------- */
    createDefaultPerformanceStandard(standard = {}) {
      return {
        id: uuidv4(),
        expanded: true,
        categoryName: standard.category || '',
        mfoName: standard.mfo || '',
        outputName: standard.output_name || '',
        indicatorName: standard.performance_indicator || '',
        successIndicator: standard.success_indicator || '',
        requiredOutput: standard.required_output || '',
        modeOfVerification: '',
        rows: {
          category: standard.category_id || standard.category || null,
          mfo: standard.mfo_id || standard.mfo || null,
          output: standard.output || null,
        },
        quantityIndicatorType: standard.quantity_indicator_type || 'numeric',
        timelinessIndicatorType: standard.timeliness_indicator_type || 'beforeDeadline',
        timelinessInputs: { range: true, date: false, description: false },
        activeTimelinessInputs: { range: true, date: false, description: false },
        targetOutput: standard.target_output || { baseTarget: null, calculated: [] },
        coreCompetencies: standard.core || [],
        technicalCompetencies: standard.technical || [],
        leadershipCompetencies: standard.leadership || [],
        standardOutcomeRows: sortedDefaultRows(),
        targetOutputValue: null,
      }
    },

    mapStandardOutcomesToRows(ratings) {
      if (!ratings || ratings.length === 0) return sortedDefaultRows()

      const outcomesByRating = {}
      ratings.forEach((outcome) => {
        if (outcome.rating !== undefined && outcome.rating !== null) {
          const ratingKey = outcome.rating.toString()
          outcomesByRating[ratingKey] = {
            rating: ratingKey,
            quantity: outcome.quantity || '',
            effectiveness: outcome.effectiveness || '',
            timeliness: outcome.timeliness || '',
            timelinessRange: '',
            timelinessDate: '',
            timelinessText: '',
          }

          // Parse timeliness if available
          if (outcome.timeliness) {
            const parsed = this.parseTimelinessFromApi(outcome.timeliness)
            outcomesByRating[ratingKey].timelinessRange = parsed.range
            outcomesByRating[ratingKey].timelinessDate = parsed.date
            outcomesByRating[ratingKey].timelinessText = parsed.text
          }
        }
      })

      return [5, 4, 3, 2, 1].map((rating) => {
        const ratingKey = rating.toString()
        const o = outcomesByRating[ratingKey] || {}
        return {
          rating: ratingKey,
          quantity: o.quantity || '',
          effectiveness: o.effectiveness || '',
          timeliness: o.timeliness || '',
          timelinessRange: o.timelinessRange || '',
          timelinessDate: o.timelinessDate || '',
          timelinessText: o.timelinessText || '',
          timelinessDeadline: '',
        }
      })
    },

    transformApiResponseToForm(employeesData) {
      if (!Array.isArray(employeesData) || employeesData.length === 0) return []

      return employeesData.map((emp) => {
        const targetPeriod = emp.target_periods?.[0]
        const performanceStandards = targetPeriod?.performance_standards || []
        const standardOutcomes = targetPeriod?.standard_outcomes || []

        const transformedStandards = performanceStandards.map((standard) => {
          const perfStandard = this.createDefaultPerformanceStandard(standard)
          const standardRows = this.mapStandardOutcomesToRows(standardOutcomes)
          perfStandard.standardOutcomeRows = standardRows

          perfStandard.rows = {
            category: standard.category
              ? {
                  id: standard.category,
                  name: standard.category,
                  label: standard.category,
                  value: standard.category,
                }
              : null,
            mfo: standard.mfo
              ? {
                  id: standard.mfo,
                  name: standard.mfo,
                  label: standard.mfo,
                  value: standard.mfo,
                }
              : null,
            output: standard.output
              ? {
                  id: standard.output,
                  name: standard.output,
                  label: standard.output,
                  value: standard.output,
                }
              : null,
          }

          perfStandard.outputName = standard.output_name || ''
          perfStandard.indicatorName = standard.performance_indicator || ''
          perfStandard.successIndicator = standard.success_indicator || ''
          perfStandard.requiredOutput = standard.required_output || ''

          return perfStandard
        })

        if (transformedStandards.length === 0) {
          transformedStandards.push(this.createDefaultPerformanceStandard())
        }

        return {
          id: uuidv4(),
          name: emp.name || '',
          employeeId: emp.id,
          employeeData: emp,
          performanceStandards: transformedStandards,
          rank: emp.rank || '',
          position: emp.position || '',
          sg: emp.sg || '',
          level: emp.level || '',
        }
      })
    },

    buildPayload(submissionData) {
      return {
        uwpData: this.uwpData,
        formData: this.formData,
        employeeData: this.employeeData,
        submissionData,
        timestamp: new Date().toISOString(),
      }
    },

    extractFilteredEmployeeControlNos() {
      if (!this.uwpData) return []
      const employees =
        this.uwpData.filteredAvailableEmployees ||
        this.uwpData.availableEmployees ||
        this.uwpData.employeesWithoutTargetPeriod ||
        []

      return employees
        .map(
          (emp) =>
            emp.employeeData?.ControlNo ||
            emp.ControlNo ||
            emp.controlNo ||
            emp.control_no ||
            emp.id,
        )
        .filter((controlNo) => controlNo !== null && controlNo !== undefined && controlNo !== '')
    },

    buildFilteredEmployeeEndpoint() {
      const identifiers = this.extractFilteredEmployeeControlNos()
      if (identifiers.length === 0) return null
      return `/spms/employee/${identifiers.join(',')}`
    },

    /* ----------------------------- payload builders ----------------------------- */

    /**
     * Transform payload for CREATE operation (new UWP)
     */
    transformCreatePayload(submissionData, officeLibraryStore) {
      const semester =
        submissionData.form?.semester || submissionData.uwpData?.targetPeriod?.semester || ''
      const year =
        submissionData.form?.year ||
        submissionData.uwpData?.targetPeriod?.year ||
        new Date().getFullYear()

      return {
        employees: submissionData.employees.map((emp) => {
          const officeData = submissionData.uwpData?.hierarchy || {}

          // Extract control number
          const controlNo =
            emp.employeeData?.employeeData?.ControlNo ||
            emp.employeeData?.ControlNo ||
            emp.employeeData?.controlNo ||
            emp.ControlNo ||
            emp.controlNo ||
            ''

          // Extract employee name
          const employeeName =
            emp.name ||
            emp.employeeData?.name ||
            emp.employeeData?.label ||
            emp.employeeData?.employeeData?.name ||
            'Unknown Employee'

          // Extract employee ID
          const employeeId =
            emp.employeeId || emp.employeeData?.id || emp.employeeData?.employeeId || null

          // Extract competencies from employee data
          const coreCompetencies = emp.coreCompetencies || []
          const technicalCompetencies = emp.technicalCompetencies || []
          const leadershipCompetencies = emp.leadershipCompetencies || []

          // Build performance standards for this employee
          const performanceStandards = Array.isArray(emp.performanceStandards)
            ? emp.performanceStandards.map((standard) => {
                // Extract IDs properly - handle both objects and IDs
                const categoryId = this.extractId(standard.rows?.category)
                const mfoId = this.extractId(standard.rows?.mfo)
                const outputId = this.extractId(standard.rows?.output)

                // Resolve names using the store or existing data
                const categoryValue = categoryId
                  ? this.resolveCategoryLabel(categoryId, officeLibraryStore)
                  : standard.rows?.category?.name ||
                    standard.rows?.category?.label ||
                    standard.rows?.category ||
                    ''

                const mfoValue = mfoId
                  ? this.resolveMfoLabel(mfoId, officeLibraryStore)
                  : standard.rows?.mfo?.name ||
                    standard.rows?.mfo?.label ||
                    standard.rows?.mfo ||
                    ''

                const outputValue = outputId
                  ? this.resolveOutputLabel(outputId, categoryId, mfoId, officeLibraryStore)
                  : standard.rows?.output?.name ||
                    standard.rows?.output?.label ||
                    standard.rows?.output ||
                    ''

                // Get performance indicator - handle both ID and string
                let performanceIndicator = ''
                if (standard.indicatorName) {
                  if (
                    typeof standard.indicatorName === 'number' ||
                    (typeof standard.indicatorName === 'string' && !isNaN(standard.indicatorName))
                  ) {
                    // It's an ID
                    performanceIndicator = this.resolveVerbLabel(Number(standard.indicatorName))
                  } else {
                    // It's already a string name
                    performanceIndicator = standard.indicatorName
                  }
                }

                const requiredOutput = standard.requiredOutput || ''

                const ratings = []
                const activeInputs = standard.activeTimelinessInputs || standard.timelinessInputs

                // Build ratings for all rows
                if (Array.isArray(standard.standardOutcomeRows)) {
                  standard.standardOutcomeRows.forEach((row) => {
                    if (!row.rating) return

                    // Build timeliness value for EACH row independently
                    const timelinessValue = this.buildTimelinessValue(row, activeInputs)

                    // Push ALL ratings with their own timeliness values
                    ratings.push({
                      rating: Number(row.rating) || 0,
                      quantity: String(row.quantity || ''),
                      effectiveness: String(row.effectiveness || ''),
                      timeliness: String(timelinessValue), // Save each row's timeliness
                      timeliness_range: String(row.timelinessRange || ''),
                      timeliness_date: String(row.timelinessDate || ''),
                      timeliness_description: String(row.timelinessText || ''),
                    })
                  })
                }

                // Get quantity for config (rating 5)
                const quantityRow =
                  standard.standardOutcomeRows?.find((row) => row.rating === '5') || {}

                // Determine which rating is the reference for timeliness
                const referenceRating =
                  standard.timelinessIndicatorType === 'onDeadline' ? '5' : '3'
                const referenceRow =
                  standard.standardOutcomeRows?.find((row) => row.rating === referenceRating) || {}
                const referenceTimelinessValue = this.buildTimelinessValue(
                  referenceRow,
                  activeInputs,
                )

                const config = {
                  // String fields - use snake_case
                  target_output: String(quantityRow.quantity || 'N/A'), // Changed
                  quantity_indicator: String(standard.quantityIndicatorType || 'numeric'), // Changed
                  timeliness_indicator: String(
                    standard.timelinessIndicatorType || 'beforeDeadline',
                  ), // Changed
                  timeliness_value: String(referenceTimelinessValue || 'N/A'),

                  // Object field - keep as is
                  timelinessType: {
                    type: String(standard.timelinessIndicatorType || 'beforeDeadline'),
                    range: Boolean(activeInputs.range),
                    date: Boolean(activeInputs.date),
                    description: Boolean(activeInputs.description),
                  },
                }

                return {
                  category_id: categoryId,
                  mfo_id: mfoId,
                  output_id: outputId,
                  category: String(categoryValue || ''),
                  mfo: String(mfoValue || ''),
                  output: String(outputValue || ''),
                  output_name: String(standard.outputName || ''),
                  success_indicator: String(standard.successIndicator || ''),
                  performance_indicator: String(performanceIndicator || ''),
                  required_output: String(requiredOutput),
                  ratings: ratings.length > 0 ? ratings : [],
                  config, // Matches backend expectations
                }
              })
            : []

          return {
            control_no: String(controlNo),
            employee_id: employeeId ? Number(employeeId) : null,
            employee_name: String(employeeName),
            semester: String(semester),
            year: Number(year),
            office: String(officeData.office?.label || officeData.office?.name || ''),
            office2: officeData.office2
              ? String(officeData.office2.label || officeData.office2.name)
              : null,
            group: officeData.group
              ? String(officeData.group.label || officeData.group.name)
              : null,
            division: officeData.division
              ? String(officeData.division.label || officeData.division.name)
              : null,
            section: officeData.section
              ? String(officeData.section.label || officeData.section.name)
              : null,
            unit: officeData.unit ? String(officeData.unit.label || officeData.unit.name) : null,

            // ADD COMPETENCIES TO PAYLOAD
            core_competency: coreCompetencies.map((comp) => ({
              code: comp.code,
              level: comp.value,
              description: comp.description || '',
            })),
            technical_competency: technicalCompetencies.map((comp) => ({
              code: comp.code,
              level: comp.value,
              description: comp.description || '',
            })),
            leadership_competency: leadershipCompetencies.map((comp) => ({
              code: comp.code,
              level: comp.value,
              description: comp.description || '',
            })),

            performance_standards: performanceStandards,
          }
        }),
      }
    },

    /**
     * Transform payload for UPDATE operation (existing UWP)
     * Updated for endpoint: PUT /unit_work_plan/update/{controlNo}/{semester}/{year}
     */
    transformUpdatePayload(updateData, officeLibraryStore) {
      console.log('📝 Starting transformUpdatePayload with:', updateData)

      const employee = updateData.employee

      if (!employee) {
        throw new Error('Employee data is required for update')
      }

      // Get hierarchy data - handle both string and object formats
      const uwpHierarchy = updateData.uwpData?.hierarchy || {}
      const getHierarchyValue = (field) => {
        const value = uwpHierarchy[field]
        if (typeof value === 'string') return value
        if (typeof value === 'object') return value?.label || value?.name || ''
        return ''
      }

      // Build the payload structure expected by the new endpoint
      const base = {
        // Employee information
        employee_id: employee.employeeId ? Number(employee.employeeId) : null,
        employee_name: employee.name || '',

        // Hierarchy information
        office: getHierarchyValue('office'),
        office2: getHierarchyValue('office2'),
        group: getHierarchyValue('group'),
        division: getHierarchyValue('division'),
        section: getHierarchyValue('section'),
        unit: getHierarchyValue('unit'),

        core_competenc: employee.coreCompetencies || [],
        technical_competencies: employee.technicalCompetencies || [],
        leadership_competencies: employee.leadershipCompetencies || [],

        // Performance standards
        performance_standards: [],
      }

      console.log('📝 Base payload:', base)

      if (Array.isArray(employee.performanceStandards)) {
        console.log(`📝 Processing ${employee.performanceStandards.length} performance standards`)

        base.performance_standards = employee.performanceStandards.map((standard, index) => {
          console.log(`📝 Processing standard ${index + 1}:`, standard)

          // Extract IDs properly - handle both objects and IDs
          const categoryId = this.extractId(standard.rows?.category)
          const mfoId = this.extractId(standard.rows?.mfo)
          const outputId = this.extractId(standard.rows?.output)

          console.log('📝 Extracted IDs:', { categoryId, mfoId, outputId })

          // Resolve names using the store or existing data
          const categoryName = categoryId
            ? this.resolveCategoryLabel(categoryId, officeLibraryStore)
            : standard.rows?.category?.name ||
              standard.rows?.category?.label ||
              standard.rows?.category ||
              ''

          const mfoName = mfoId
            ? this.resolveMfoLabel(mfoId, officeLibraryStore)
            : standard.rows?.mfo?.name || standard.rows?.mfo?.label || standard.rows?.mfo || ''

          const outputName = outputId
            ? this.resolveOutputLabel(outputId, categoryId, mfoId, officeLibraryStore)
            : standard.rows?.output?.name ||
              standard.rows?.output?.label ||
              standard.rows?.output ||
              ''

          console.log('📝 Resolved names:', { categoryName, mfoName, outputName })

          // Get performance indicator - handle both ID and string
          let performanceIndicator = ''
          if (standard.indicatorName) {
            if (
              typeof standard.indicatorName === 'number' ||
              (typeof standard.indicatorName === 'string' && !isNaN(standard.indicatorName))
            ) {
              // It's an ID
              performanceIndicator = this.resolveVerbLabel(Number(standard.indicatorName))
            } else {
              // It's already a string name
              performanceIndicator = standard.indicatorName
            }
          }

          console.log('📝 Performance indicator:', performanceIndicator)

          const ratings = []
          const activeInputs = standard.activeTimelinessInputs || standard.timelinessInputs

          console.log('📝 Active timeliness inputs:', activeInputs)
          console.log('📝 Standard outcome rows:', standard.standardOutcomeRows)

          if (Array.isArray(standard.standardOutcomeRows)) {
            standard.standardOutcomeRows.forEach((row, rowIndex) => {
              if (!row.rating) return

              // Build timeliness value
              const timelinessValue = this.buildTimelinessValue(row, activeInputs)

              console.log(`📝 Row ${rowIndex} (rating ${row.rating}):`, {
                quantity: row.quantity,
                effectiveness: row.effectiveness,
                timelinessValue,
                timelinessRange: row.timelinessRange,
                timelinessDate: row.timelinessDate,
                timelinessText: row.timelinessText,
              })

              ratings.push({
                rating: Number(row.rating) || 0,
                quantity: String(row.quantity || ''),
                effectiveness: String(row.effectiveness || ''),
                timeliness: String(timelinessValue),
                timeliness_range: String(row.timelinessRange || ''),
                timeliness_date: String(row.timelinessDate || ''),
                timeliness_description: String(row.timelinessText || ''),
              })
            })
          }

          console.log('📝 Built ratings:', ratings)

          // Get reference row for timeliness based on type
          const referenceRating = standard.timelinessIndicatorType === 'onDeadline' ? '5' : '3'
          const referenceRow =
            standard.standardOutcomeRows?.find((row) => row.rating === referenceRating) || {}
          const referenceTimelinessValue = this.buildTimelinessValue(referenceRow, activeInputs)

          console.log('📝 Reference rating:', referenceRating)
          console.log('📝 Reference timeliness value:', referenceTimelinessValue)

          // Get quantity for rating 5 - this is the target_output
          const quantityRow = standard.standardOutcomeRows?.find((r) => r.rating === '5') || {}
          const targetOutput = quantityRow.quantity || ''

          // Determine quantity indicator type
          let quantityIndicator = standard.quantityIndicatorType || 'numeric'

          // Determine timeliness indicator type
          let timelinessIndicator = standard.timelinessIndicatorType || 'beforeDeadline'

          // Build config object with EXACT field names the backend expects
          const config = {
            // Use snake_case field names as shown in the error
            target_output: String(targetOutput || ''), // Changed from targetOutput
            quantity_indicator: String(quantityIndicator || 'numeric'), // Changed from quantityIndicator
            timeliness_indicator: String(timelinessIndicator || 'beforeDeadline'), // Changed from timelinessIndicator
            timeliness_value: String(referenceTimelinessValue || ''),
            timelinessType: {
              type: String(timelinessIndicator || 'beforeDeadline'),
              range: Boolean(activeInputs?.range),
              date: Boolean(activeInputs?.date),
              description: Boolean(activeInputs?.description),
            },
          }

          console.log('📝 Built config:', config)

          const standardPayload = {
            category_id: categoryId,
            mfo_id: mfoId,
            output_id: outputId,
            category: categoryName,
            mfo: mfoName,
            output: outputName,
            output_name: standard.outputName || '',
            core_competency: standard.coreCompetencies || [],
            technical_competency: standard.technicalCompetencies || [],
            leadership_competency: standard.leadershipCompetencies || [],
            success_indicator: standard.successIndicator || '',
            performance_indicator: performanceIndicator,
            required_output: standard.requiredOutput || '',
            ratings: ratings.length > 0 ? ratings : [],
            config,
          }

          console.log('📝 Standard payload:', standardPayload)
          return standardPayload
        })
      }

      console.log('📤 Final update payload:', JSON.stringify(base, null, 2))
      return base
    },

    /* ----------------------------- API actions ----------------------------- */
    async fetchFilteredEmployeesData() {
      this.loading = true
      this.error = null
      try {
        const endpoint = this.buildFilteredEmployeeEndpoint()
        if (!endpoint) {
          this.filteredEmployeesData = []
          return []
        }

        const token = localStorage.getItem('token')
        const response = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (Array.isArray(response.data)) {
          const transformed = this.transformApiResponseToForm(response.data)
          this.filteredEmployeesData = transformed
          return transformed
        }

        this.filteredEmployeesData = []
        return []
      } catch (error) {
        this.error = error.message || 'Failed to fetch filtered employees data'
        this.filteredEmployeesData = []
        return []
      } finally {
        this.loading = false
      }
    },

    async saveUWP(submissionData, officeLibraryIndicatorStore, officeLibraryStore) {
      this.loading = true
      this.error = null

      try {
        // Store references to both stores
        this.officeLibraryIndicatorStore = officeLibraryIndicatorStore
        this.officeLibraryStore = officeLibraryStore

        const payload = this.transformCreatePayload(submissionData, officeLibraryStore)

        // Debug: Log the final payload
        console.log('📤 CREATE Payload:', JSON.stringify(payload, null, 2))

        const token = localStorage.getItem('token')
        const response = await api.post('/unit_work_plan/store', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          this.savedUWPs.push({
            id: response.data.data?.id,
            semester: submissionData.form.semester,
            year: submissionData.form.year,
            savedAt: new Date().toISOString(),
          })
          sessionStorage.removeItem('uwpData')
          this.uwpData = null
          return response.data
        }

        throw new Error(response.data.message || 'Failed to save UWP')
      } catch (error) {
        this.error = error.message || 'Failed to save UWP'
        console.error('❌ Save UWP error:', error.response?.data || error)

        // Log validation errors if available
        if (error.response?.data?.errors) {
          console.error('Validation errors:', error.response.data.errors)
        }

        throw error
      } finally {
        this.loading = false
      }
    },

    // In your unitWorkPlanStore.js, replace the updateUWP method:
    async updateUWP(updateData, officeLibraryIndicatorStore, officeLibraryStore) {
      this.loading = true
      this.error = null

      try {
        this.officeLibraryIndicatorStore = officeLibraryIndicatorStore
        this.officeLibraryStore = officeLibraryStore

        const payload = this.transformUpdatePayload(updateData, officeLibraryStore)

        // Debug: Log the final payload
        console.log('📤 UPDATE Payload being sent:', JSON.stringify(payload, null, 2))

        // Extract controlNo, semester, and year from updateData
        const controlNo =
          updateData.employee?.controlNo || updateData.employee?.employeeData?.ControlNo
        const semester = updateData.form?.semester || ''
        const year = updateData.form?.year || ''

        if (!controlNo || !semester || !year) {
          throw new Error('Missing required parameters: controlNo, semester, or year')
        }

        console.log('📤 Using endpoint with:', { controlNo, semester, year })

        const token = localStorage.getItem('token')
        const response = await api.put(
          `/unit_work_plan/update/${controlNo}/${semester}/${year}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        console.log('✅ Update response:', response.data)
      } catch (error) {
        this.error = error.message || 'Failed to update UWP'
        console.error('❌ Update UWP error:', error.response?.data || error)

        // Log validation errors if available
        if (error.response?.data?.errors) {
          console.error('Validation errors:', error.response.data.errors)
        }

        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchEmployeeByControlNo(controlNo, semester, year) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.get(`/spms/employee/${controlNo}/${semester}/${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const employeeData = response.data
        if (!employeeData) return []

        console.log('📊 Raw API response for employee:', employeeData)
        console.log('📊 Target periods data:', employeeData.target_periods)
        console.log('📊 First target period:', employeeData.target_periods?.[0])

        if (employeeData.target_periods?.[0]) {
          const targetPeriod = employeeData.target_periods[0]
          console.log('📊 Performance standards:', targetPeriod.performance_standards)
          console.log('📊 Config:', targetPeriod.config)

          if (targetPeriod.performance_standards?.[0]) {
            const ps = targetPeriod.performance_standards[0]
            console.log('📊 First performance standard ratings:', ps.ratings)
          }
        }

        const transformedEmployee = {
          id: `emp_${employeeData.id}`,
          name: employeeData.name || 'Unknown Employee',
          employeeId: employeeData.id,
          controlNo: employeeData.ControlNo || controlNo,
          sg: employeeData.sg || '',
          level: employeeData.level || '',
          rank: employeeData.rank || 'Employee',
          position: employeeData.position || '',
          performanceStandards: [],
          employeeData,
        }

        if (employeeData.target_periods?.length) {
          const targetPeriod = employeeData.target_periods[0]
          console.log('📊 Target period data:', targetPeriod)

          // Store hierarchy for later use
          transformedEmployee.hierarchy = {
            office: targetPeriod.office,
            office2: targetPeriod.office2,
            group: targetPeriod.group,
            division: targetPeriod.division,
            section: targetPeriod.section,
            unit: targetPeriod.unit,
          }

          transformedEmployee.targetPeriod = {
            semester: targetPeriod.semester,
            year: targetPeriod.year,
            status: targetPeriod.status,
          }

          // Transform performance standards if they exist
          if (
            Array.isArray(targetPeriod.performance_standards) &&
            targetPeriod.performance_standards.length
          ) {
            console.log(
              `📊 Found ${targetPeriod.performance_standards.length} performance standards`,
            )

            transformedEmployee.performanceStandards = targetPeriod.performance_standards.map(
              (ps, index) => {
                console.log('📊 Processing performance standard:', ps)
                console.log('📊 PS ratings:', ps.ratings)

                // Extract config from target period
                const config = targetPeriod.config || {}
                console.log('📊 Config from API:', config)

                const timelinessType = config.timelinessType || {}

                // Get ratings from the performance standard itself (not target period)
                const ratings = ps.ratings || []
                console.log('📊 Ratings from API (from PS):', ratings)

                // Helper function to clean strings for comparison
                const cleanString = (str) => str?.toString().trim().toLowerCase() || ''

                // Find category
                const categoryName = ps.category || ''
                const categoryObj = this.officeLibraryStore?.categories?.find(
                  (cat) => cleanString(cat.name) === cleanString(categoryName),
                ) || { id: ps.category_id, name: categoryName, label: categoryName }

                console.log('📊 Found category:', categoryObj)

                // Find MFO
                const mfoName = ps.mfo || ''
                let mfoObj = null
                if (categoryObj && mfoName) {
                  mfoObj = this.officeLibraryStore?.mfos?.find(
                    (mfo) =>
                      cleanString(mfo.name) === cleanString(mfoName) &&
                      mfo.f_category_id === categoryObj.id,
                  ) || { id: ps.mfo_id, name: mfoName, label: mfoName }
                }
                console.log('📊 Found MFO:', mfoObj)

                // Find output
                const outputName = ps.output || ''
                let outputObj = null
                if (outputName) {
                  const isSupport =
                    categoryName.toLowerCase().includes('support') ||
                    categoryName.trim().toUpperCase().startsWith('C')

                  if (isSupport) {
                    outputObj = this.officeLibraryStore?.category_outputs?.find(
                      (output) =>
                        cleanString(output.name) === cleanString(outputName) &&
                        output.f_category_id === categoryObj.id,
                    ) || { id: ps.output_id, name: outputName, label: outputName }
                  } else {
                    outputObj = this.officeLibraryStore?.outputs?.find(
                      (output) =>
                        cleanString(output.name) === cleanString(outputName) &&
                        output.f_category_id === categoryObj.id &&
                        (!mfoObj || output.mfo_id === mfoObj.id),
                    ) || { id: ps.output_id, name: outputName, label: outputName }
                  }
                }
                console.log('📊 Found output:', outputObj)

                // Create standard outcome rows from ratings
                const standardOutcomeRows = this.mapStandardOutcomesToRows(ratings)
                console.log('📊 Standard outcome rows:', standardOutcomeRows)

                // Determine quantity indicator type
                let quantityIndicatorType = 'numeric'
                if (config.quantityIndicator === 'C' || config.quantity_indicator === 'C') {
                  quantityIndicatorType = 'C'
                } else if (config.quantityIndicator === 'B' || config.quantity_indicator === 'B') {
                  quantityIndicatorType = 'B'
                }

                // Determine timeliness indicator type
                let timelinessIndicatorType = 'beforeDeadline'
                if (
                  config.timelinessIndicator === 'onDeadline' ||
                  config.timeliness_indicator === 'onDeadline'
                ) {
                  timelinessIndicatorType = 'onDeadline'
                }

                // Extract timeliness inputs from config
                const timelinessInputs = {
                  range: timelinessType.range || false,
                  date: timelinessType.date || false,
                  description: timelinessType.description || true,
                }

                console.log('📊 Parsed settings:', {
                  quantityIndicatorType,
                  timelinessIndicatorType,
                  timelinessInputs,
                  timelinessType,
                })

                return {
                  id: `ps_${ps.id || index}`,
                  expanded: true,
                  outputName: ps.output_name || '',
                  indicatorName: ps.performance_indicator || '',
                  successIndicator: ps.success_indicator || '',
                  requiredOutput: ps.required_output || '',
                  modeOfVerification: '',
                  rows: {
                    category: categoryObj,
                    mfo: mfoObj,
                    output: outputObj,
                  },
                  quantityIndicatorType,
                  timelinessIndicatorType,
                  timelinessInputs,
                  activeTimelinessInputs: { ...timelinessInputs },
                  apiData: ps,
                  standardOutcomeRows,
                  coreCompetencies: ps.core || [],
                  technicalCompetencies: ps.technical || [],
                  leadershipCompetencies: ps.leadership || [],
                }
              },
            )
          } else {
            console.log('📊 No performance standards found, creating default')
            transformedEmployee.performanceStandards = [this.createDefaultPerformanceStandard()]
          }
        } else {
          console.log('📊 No target period found, creating default')
          transformedEmployee.performanceStandards = [this.createDefaultPerformanceStandard()]
        }

        console.log('✅ Transformed employee data:', transformedEmployee)
        return [transformedEmployee]
      } catch (error) {
        this.error = error.message || 'Failed to fetch employee data'
        console.error('❌ Error fetching employee:', error)
        throw new Error(`Failed to fetch employee data: ${error.message || 'Unknown error'}`)
      } finally {
        this.loading = false
      }
    },

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
          return this.savedUWPs
        }

        throw new Error(response.data.message || 'Failed to fetch UWPs')
      } catch (error) {
        this.error = error.message || 'Failed to fetch UWPs'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getUWPById(id) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')
        const response = await api.get(`/unit_work_plan/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) return response.data.data
        throw new Error(response.data.message || 'Failed to fetch UWP')
      } catch (error) {
        this.error = error.message || 'Failed to fetch UWP'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteUWP(id) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')
        const response = await api.delete(`/unit_work_plan/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          this.savedUWPs = this.savedUWPs.filter((uwp) => uwp.id !== id)
          return response.data
        }

        throw new Error(response.data.message || 'Failed to delete UWP')
      } catch (error) {
        this.error = error.message || 'Failed to delete UWP'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
