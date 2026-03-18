// src/stores/office/unitWorkPlanStore.js
import { defineStore } from '/node_modules/.q-cache/dev-spa/vite-spa/deps/pinia.js?v=59aa931b'
import { api } from '/src/boot/axios.js'
import { v4 as uuidv4 } from '/node_modules/.q-cache/dev-spa/vite-spa/deps/uuid.js?v=59aa931b'

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

    resolveCategoryLabel(category, officeLibraryStore) {
      if (!category) return ''
      if (typeof category === 'string' && isNaN(Number(category))) return category
      if (typeof category === 'object' && category !== null) {
        if (category.name || category.label || category.categories_name) {
          return category.categories_name || category.name || category.label
        }
      }
      const id = typeof category === 'object' ? category?.id : category
      if (!id) return ''
      const store = officeLibraryStore || this.officeLibraryStore
      const found = store?.categories?.find((c) => c.id === id)
      return found?.categories_name || found?.name || found?.label || ''
    },

    resolveMfoLabel(mfo, officeLibraryStore) {
      if (!mfo) return ''
      if (typeof mfo === 'string' && isNaN(Number(mfo))) return mfo
      if (typeof mfo === 'object' && mfo !== null) {
        if (mfo.name || mfo.label) return mfo.name || mfo.label
      }
      const id = typeof mfo === 'object' ? mfo?.id : mfo
      if (!id) return ''
      const store = officeLibraryStore || this.officeLibraryStore
      const found = store?.mfos?.find((m) => m.id === id)
      return found?.name || found?.label || ''
    },

    resolveOutputLabel(output, categoryId, mfoId, officeLibraryStore) {
      if (!output) return ''
      if (typeof output === 'string' && isNaN(Number(output))) return output
      if (typeof output === 'object' && output !== null) {
        if (output.name || output.label) return output.name || output.label
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

    resolveVerbLabel(idOrText) {
      if (!idOrText) return ''
      if (Array.isArray(idOrText)) {
        return idOrText
          .map((item) => this.resolveVerbLabel(item))
          .filter(Boolean)
          .join(', ')
      }
      if (typeof idOrText === 'string' && isNaN(Number(idOrText))) return idOrText
      const verbId = Number(idOrText)
      const verb = this.officeLibraryIndicatorStore?.verbs?.find((v) => v.id === verbId)
      return verb?.indicator_name || verb?.name || ''
    },

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

    buildTimelinessValue(row, activeTimelinessInputs) {
      if (!row) return ''
      let timelinessValue = ''
      if (activeTimelinessInputs?.range && row.timelinessRange) {
        timelinessValue = timelinessValue
          ? `${timelinessValue} ${row.timelinessRange}`
          : row.timelinessRange
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
      return timelinessValue
    },

    parseTimelinessFromApi(timelinessString) {
      if (!timelinessString) return { range: '', date: '', text: '' }
      if (timelinessString.toLowerCase().includes('lapses')) {
        return { range: '', date: '', text: timelinessString }
      }
      const result = { range: '', date: '', text: '' }
      let remainingText = timelinessString.trim()

      const dateMatch = remainingText.match(/\d{4}[-/]\d{2}[-/]\d{2}/)
      if (dateMatch) {
        result.date = dateMatch[0].replace(/\//g, '-')
        remainingText = remainingText.replace(dateMatch[0], '').trim()
      }

      const rangeMatch = remainingText.match(/(\d+)\s*-\s*(\d+)/)
      if (rangeMatch) {
        result.range = `${rangeMatch[1]}-${rangeMatch[2]}`
        remainingText = remainingText.replace(rangeMatch[0], '').trim()
      }

      remainingText = remainingText.replace(/^by\s+/i, '').trim()

      const knownPatterns = [
        'before schedule',
        'after schedule',
        'as per schedule',
        'on schedule',
        'ahead of schedule',
        'behind schedule',
      ]
      const foundPattern = knownPatterns.find((p) => remainingText.toLowerCase().includes(p))
      if (foundPattern) {
        result.text = foundPattern
        remainingText = remainingText.replace(new RegExp(foundPattern, 'i'), '').trim()
      }

      if (!result.text && remainingText) result.text = remainingText

      console.log('📊 Parsed timeliness:', { input: timelinessString, output: result })
      return result
    },

    /* ----------------------------- NEW: performance indicator resolver ----------------------------- */

    /**
     * Resolve performance_indicator from API into an array of verb IDs (numbers).
     */
    resolvePerformanceIndicators(rawIndicators, verbs) {
      if (!rawIndicators) return []

      const indicatorArray = Array.isArray(rawIndicators) ? rawIndicators : [rawIndicators]

      return indicatorArray
        .map((item) => {
          if (typeof item === 'number') return item
          if (typeof item === 'string' && !isNaN(Number(item)) && item.trim() !== '') {
            return Number(item)
          }

          if (typeof item === 'object' && item !== null) {
            if (item.id && !isNaN(Number(item.id))) return Number(item.id)

            const verbName = (item.value || item.name || item.indicator_name || '')
              .toLowerCase()
              .trim()

            if (verbName && verbs?.length) {
              const matched = verbs.find(
                (v) => (v.indicator_name || v.name || '').toLowerCase().trim() === verbName,
              )
              if (matched) {
                console.log(`[UWP Store] Matched indicator "${verbName}" → id ${matched.id}`)
                return matched.id
              }

              const fuzzy = verbs.find(
                (v) =>
                  (v.indicator_name || v.name || '').toLowerCase().trim().includes(verbName) ||
                  verbName.includes((v.indicator_name || v.name || '').toLowerCase().trim()),
              )
              if (fuzzy) {
                console.log(`[UWP Store] Fuzzy matched indicator "${verbName}" → id ${fuzzy.id}`)
                return fuzzy.id
              }

              console.warn(`[UWP Store] Could not match indicator "${verbName}" to a verb id`)
            }

            return null
          }

          if (typeof item === 'string' && verbs?.length) {
            const needle = item.toLowerCase().trim()
            const matched = verbs.find(
              (v) => (v.indicator_name || v.name || '').toLowerCase().trim() === needle,
            )
            if (matched) return matched.id

            const fuzzy = verbs.find(
              (v) =>
                (v.indicator_name || v.name || '').toLowerCase().trim().includes(needle) ||
                needle.includes((v.indicator_name || v.name || '').toLowerCase().trim()),
            )
            if (fuzzy) return fuzzy.id
          }

          return null
        })
        .filter((id) => id !== null && id !== undefined)
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
        indicatorName: Array.isArray(standard.performance_indicator)
          ? standard.performance_indicator
          : standard.performance_indicator
            ? [standard.performance_indicator]
            : [],
        successIndicator: standard.success_indicator || '',
        requiredOutput: standard.required_output || '',
        modeOfVerification: '',
        rows: {
          category: standard.category_id || standard.category || null,
          mfo: standard.mfo_id || standard.mfo || null,
          output: standard.output || null,
          supervisory_control_no: standard.supervisory_control_no || null,
        },
        quantityIndicatorType: standard.quantity_indicator_type || 'numeric',
        timelinessIndicatorType: standard.timeliness_indicator_type || 'beforeDeadline',
        timelinessInputs: { range: true, date: false, description: false },
        activeTimelinessInputs: { range: true, date: false, description: false },
        targetOutput: standard.target_output || { baseTarget: null, calculated: [] },
        competencies: {
          core: standard.core_competency || standard.core || [],
          technical: standard.technical_competency || standard.technical || [],
          leadership: standard.leadership_competency || standard.leadership || [],
        },
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
              ? { id: standard.mfo, name: standard.mfo, label: standard.mfo, value: standard.mfo }
              : null,
            output: standard.output
              ? {
                  id: standard.output,
                  name: standard.output,
                  label: standard.output,
                  value: standard.output,
                }
              : null,
            supervisory_control_no: standard.supervisory_control_no || null,
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
        .filter((v) => v !== null && v !== undefined && v !== '')
    },

    buildFilteredEmployeeEndpoint() {
      const identifiers = this.extractFilteredEmployeeControlNos()
      if (identifiers.length === 0) return null
      return `/spms/employee/${identifiers.join(',')}`
    },

    /* ----------------------------- payload builders ----------------------------- */

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

          const controlNo =
            emp.employeeData?.employeeData?.ControlNo ||
            emp.employeeData?.ControlNo ||
            emp.employeeData?.controlNo ||
            emp.ControlNo ||
            emp.controlNo ||
            ''

          const supervisoryControlNo =
            emp.supervisorySignatory?.controlNo ||
            emp.employeeData?.supervisorySignatory?.controlNo ||
            null

          const employeeName =
            emp.name ||
            emp.employeeData?.name ||
            emp.employeeData?.label ||
            emp.employeeData?.employeeData?.name ||
            'Unknown Employee'

          const employeeId =
            emp.employeeId || emp.employeeData?.id || emp.employeeData?.employeeId || null

          const performanceStandards = Array.isArray(emp.performanceStandards)
            ? emp.performanceStandards.map((standard) => {
                const coreCompetencies = standard.competencies?.core || []
                const technicalCompetencies = standard.competencies?.technical || []
                const leadershipCompetencies = standard.competencies?.leadership || []

                const categoryId = this.extractId(standard.rows?.category)
                const mfoId = this.extractId(standard.rows?.mfo)
                const outputId = this.extractId(standard.rows?.output)

                // ── supervisory_control_no per standard ──────────────────────
                // Priority:
                //   1. standard.rows.supervisory_control_no — set by the cascade
                //      resolver when the user selects an MFO/indicator (most specific)
                //   2. emp-level supervisoryControlNo — resolved at the employee level
                //      (covers standards that were never opened / cascade not triggered)
                const standardSupervisoryControlNo =
                  standard.rows?.supervisory_control_no || supervisoryControlNo || null

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

                // Build performance indicators
                let performanceIndicators = []
                if (standard.indicatorName) {
                  const items = Array.isArray(standard.indicatorName)
                    ? standard.indicatorName
                    : [standard.indicatorName]

                  performanceIndicators = items
                    .map((item) => {
                      if (typeof item === 'number' || (typeof item === 'string' && !isNaN(item))) {
                        const verb = this.officeLibraryIndicatorStore?.verbs?.find(
                          (v) => v.id === Number(item),
                        )
                        const categoryName = verb?.category?.categories_name || ''
                        return {
                          id: Number(item),
                          name: verb?.indicator_name || verb?.name || '',
                          category_id: verb?.category_id || null,
                          category: categoryName,
                          value: verb?.indicator_name || verb?.name || '',
                        }
                      }
                      return {
                        name: item,
                        id: null,
                        category_id: null,
                        category: '',
                        value: item,
                      }
                    })
                    .filter(Boolean)
                }

                console.log('📊 Final performance indicators for CREATE:', performanceIndicators)

                const requiredOutput = standard.requiredOutput || ''
                const activeInputs = standard.activeTimelinessInputs || standard.timelinessInputs
                const ratings = []

                if (Array.isArray(standard.standardOutcomeRows)) {
                  standard.standardOutcomeRows.forEach((row) => {
                    if (!row.rating) return
                    const timelinessValue = this.buildTimelinessValue(row, activeInputs)
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

                const referenceRating =
                  standard.timelinessIndicatorType === 'onDeadline' ? '5' : '3'
                const referenceRow =
                  standard.standardOutcomeRows?.find((row) => row.rating === referenceRating) || {}
                const referenceTimelinessValue = this.buildTimelinessValue(
                  referenceRow,
                  activeInputs,
                )

                let targetOutput = ''
                if (standard.quantityIndicatorType === 'numeric') {
                  const quantityRow =
                    standard.standardOutcomeRows?.find((row) => row.rating === '5') || {}
                  targetOutput = String(quantityRow.quantity || '')
                } else if (standard.quantityIndicatorType === 'B') {
                  targetOutput = String(standard.targetOutputValue || '')
                } else if (standard.quantityIndicatorType === 'C') {
                  targetOutput = '100%'
                }

                const config = {
                  target_output: targetOutput,
                  quantity_indicator: String(standard.quantityIndicatorType || 'numeric'),
                  timeliness_indicator: String(
                    standard.timelinessIndicatorType || 'beforeDeadline',
                  ),
                  timeliness_value: String(referenceTimelinessValue || ''),
                  timelinessType: {
                    type: String(standard.timelinessIndicatorType || 'beforeDeadline'),
                    range: Boolean(activeInputs.range),
                    date: Boolean(activeInputs.date),
                    description: Boolean(activeInputs.description),
                  },
                }

                return {
                  supervisory_control_no: standardSupervisoryControlNo,
                  category_id: categoryId,
                  mfo_id: mfoId,
                  output_id: outputId,
                  category: String(categoryValue || ''),
                  mfo: String(mfoValue || ''),
                  output: String(outputValue || ''),
                  output_name: String(standard.outputName || ''),
                  success_indicator: String(standard.successIndicator || ''),
                  performance_indicator: performanceIndicators,
                  required_output: String(requiredOutput),
                  core_competency: coreCompetencies.map((comp) => ({
                    code: comp.code || '',
                    level: comp.value || '',
                    description: comp.description || '',
                  })),
                  technical_competency: technicalCompetencies.map((comp) => ({
                    code: comp.code || '',
                    level: comp.value || '',
                    description: comp.description || '',
                  })),
                  leadership_competency: leadershipCompetencies.map((comp) => ({
                    code: comp.code || '',
                    level: comp.value || '',
                    description: comp.description || '',
                  })),
                  ratings: ratings.length > 0 ? ratings : [],
                  config,
                }
              })
            : []

          return {
            control_no: String(controlNo),
            supervisory_control_no: supervisoryControlNo,
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
            performance_standards: performanceStandards,
          }
        }),
      }
    },

    transformUpdatePayload(updateData, officeLibraryStore) {
      console.log('📝 Starting transformUpdatePayload with:', updateData)

      const employee = updateData.employee
      if (!employee) throw new Error('Employee data is required for update')

      const uwpHierarchy = updateData.uwpData?.hierarchy || {}
      const getHierarchyValue = (field) => {
        const value = uwpHierarchy[field]
        if (typeof value === 'string') return value
        if (typeof value === 'object') return value?.label || value?.name || ''
        return ''
      }

      const supervisoryControlNo =
        employee.supervisorySignatory?.controlNo ||
        employee.employeeData?.supervisorySignatory?.controlNo ||
        null

      const base = {
        employee_id: employee.employeeId ? Number(employee.employeeId) : null,
        employee_name: employee.name || '',
        supervisory_control_no: supervisoryControlNo,
        office: getHierarchyValue('office'),
        office2: getHierarchyValue('office2'),
        group: getHierarchyValue('group'),
        division: getHierarchyValue('division'),
        section: getHierarchyValue('section'),
        unit: getHierarchyValue('unit'),
        performance_standards: [],
      }

      if (Array.isArray(employee.performanceStandards)) {
        base.performance_standards = employee.performanceStandards.map((standard) => {
          const coreCompetencies = standard.competencies?.core || []
          const technicalCompetencies = standard.competencies?.technical || []
          const leadershipCompetencies = standard.competencies?.leadership || []

          const categoryId = this.extractId(standard.rows?.category)
          const mfoId = this.extractId(standard.rows?.mfo)
          const outputId = this.extractId(standard.rows?.output)

          // ── supervisory_control_no per standard ──────────────────────────
          // Priority:
          //   1. standard.rows.supervisory_control_no — set by the cascade resolver
          //   2. emp-level supervisoryControlNo — fallback for uncascaded standards
          const standardSupervisoryControlNo =
            standard.rows?.supervisory_control_no || supervisoryControlNo || null

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

          // Build performance indicators
          let performanceIndicators = []
          if (standard.indicatorName) {
            const items = Array.isArray(standard.indicatorName)
              ? standard.indicatorName
              : [standard.indicatorName]

            performanceIndicators = items
              .map((item) => {
                if (typeof item === 'number' || (typeof item === 'string' && !isNaN(item))) {
                  const verb = this.officeLibraryIndicatorStore?.verbs?.find(
                    (v) => v.id === Number(item),
                  )
                  const verbCategoryName = verb?.category?.categories_name || ''
                  return {
                    id: Number(item),
                    name: verb?.indicator_name || verb?.name || '',
                    category_id: verb?.category_id || null,
                    category: verbCategoryName,
                    value: verb?.indicator_name || verb?.name || '',
                  }
                }
                return {
                  name: item,
                  id: null,
                  category_id: null,
                  category: '',
                  value: item,
                }
              })
              .filter(Boolean)
          }

          const activeInputs = standard.activeTimelinessInputs || standard.timelinessInputs
          const ratings = []

          if (Array.isArray(standard.standardOutcomeRows)) {
            standard.standardOutcomeRows.forEach((row) => {
              if (!row.rating) return
              const timelinessValue = this.buildTimelinessValue(row, activeInputs)
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

          const referenceRating = standard.timelinessIndicatorType === 'onDeadline' ? '5' : '3'
          const referenceRow =
            standard.standardOutcomeRows?.find((r) => r.rating === referenceRating) || {}
          const referenceTimelinessValue = this.buildTimelinessValue(referenceRow, activeInputs)

          let targetOutput = ''
          if (standard.quantityIndicatorType === 'numeric') {
            const quantityRow = standard.standardOutcomeRows?.find((r) => r.rating === '5') || {}
            targetOutput = String(quantityRow.quantity || '')
          } else if (standard.quantityIndicatorType === 'B') {
            targetOutput = String(standard.targetOutputValue || '')
          } else if (standard.quantityIndicatorType === 'C') {
            targetOutput = '100%'
          }

          const config = {
            target_output: targetOutput,
            quantity_indicator: String(standard.quantityIndicatorType || 'numeric'),
            timeliness_indicator: String(standard.timelinessIndicatorType || 'beforeDeadline'),
            timeliness_value: String(referenceTimelinessValue || ''),
            timelinessType: {
              type: String(standard.timelinessIndicatorType || 'beforeDeadline'),
              range: Boolean(activeInputs?.range),
              date: Boolean(activeInputs?.date),
              description: Boolean(activeInputs?.description),
            },
          }

          return {
            supervisory_control_no: standardSupervisoryControlNo,
            category_id: categoryId,
            mfo_id: mfoId,
            output_id: outputId,
            category: categoryName,
            mfo: mfoName,
            output: outputName,
            output_name: standard.outputName || '',
            core_competency: coreCompetencies.map((comp) => ({
              code: comp.code || '',
              level: comp.value || '',
              description: comp.description || '',
            })),
            technical_competency: technicalCompetencies.map((comp) => ({
              code: comp.code || '',
              level: comp.value || '',
              description: comp.description || '',
            })),
            leadership_competency: leadershipCompetencies.map((comp) => ({
              code: comp.code || '',
              level: comp.value || '',
              description: comp.description || '',
            })),
            success_indicator: standard.successIndicator || '',
            performance_indicator: performanceIndicators,
            required_output: standard.requiredOutput || '',
            ratings: ratings.length > 0 ? ratings : [],
            config,
          }
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
        const response = await api.get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
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
        this.officeLibraryIndicatorStore = officeLibraryIndicatorStore
        this.officeLibraryStore = officeLibraryStore

        const payload = this.transformCreatePayload(submissionData, officeLibraryStore)
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
        if (error.response?.data?.errors) {
          console.error('Validation errors:', error.response.data.errors)
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUWP(updateData, officeLibraryIndicatorStore, officeLibraryStore) {
      this.loading = true
      this.error = null
      try {
        this.officeLibraryIndicatorStore = officeLibraryIndicatorStore
        this.officeLibraryStore = officeLibraryStore

        const payload = this.transformUpdatePayload(updateData, officeLibraryStore)
        console.log('📤 UPDATE Payload:', JSON.stringify(payload, null, 2))

        const controlNo =
          updateData.employee?.controlNo || updateData.employee?.employeeData?.ControlNo
        const semester = updateData.form?.semester || ''
        const year = updateData.form?.year || ''

        if (!controlNo || !semester || !year) {
          throw new Error('Missing required parameters: controlNo, semester, or year')
        }

        const token = localStorage.getItem('token')
        const response = await api.put(
          `/unit_work_plan/update/${controlNo}/${semester}/${year}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        )

        console.log('✅ Update response:', response.data)
      } catch (error) {
        this.error = error.message || 'Failed to update UWP'
        console.error('❌ Update UWP error:', error.response?.data || error)
        if (error.response?.data?.errors) {
          console.error('Validation errors:', error.response.data.errors)
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch a single employee's work plan data and transform it for the Edit form.
     */
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

        console.log('[Store] Raw API response:', employeeData)

        const transformedEmployee = {
          id: `emp_${employeeData.id}`,
          name: employeeData.name || 'Unknown Employee',
          employeeId: employeeData.id,
          controlNo: employeeData.ControlNo || controlNo,
          sg: employeeData.sg || '',
          level: employeeData.level || '',
          rank: employeeData.rank || 'Employee',
          position: employeeData.position || '',
          supervisorySignatory: employeeData.supervisorySignatory || null,
          performanceStandards: [],
          employeeData,
        }

        if (employeeData.target_periods?.length) {
          const targetPeriod = employeeData.target_periods[0]

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

          if (
            Array.isArray(targetPeriod.performance_standards) &&
            targetPeriod.performance_standards.length
          ) {
            transformedEmployee.performanceStandards = targetPeriod.performance_standards.map(
              (ps, index) => {
                console.log(`[Store] Processing PS ${index + 1}:`, ps)

                const config = targetPeriod.config || ps.config || {}
                const timelinessType = config.timelinessType || {}
                const ratings = ps.ratings || []

                const cleanString = (str) => str?.toString().trim().toLowerCase() || ''

                // Resolve category
                const categoryName = ps.category || ''
                const categoryObj = this.officeLibraryStore?.categories?.find(
                  (cat) => cleanString(cat.name) === cleanString(categoryName),
                ) || {
                  id: ps.category_id,
                  name: categoryName,
                  label: categoryName,
                  categories_name: categoryName,
                }

                // Resolve MFO
                const mfoName = ps.mfo || ''
                let mfoObj = null
                if (categoryObj && mfoName) {
                  mfoObj = this.officeLibraryStore?.mfos?.find(
                    (mfo) =>
                      cleanString(mfo.name) === cleanString(mfoName) &&
                      mfo.f_category_id === categoryObj.id,
                  ) || { id: ps.mfo_id, name: mfoName, label: mfoName }
                }

                // Resolve output
                const outputName = ps.output || ''
                let outputObj = null
                if (outputName) {
                  const isSupport =
                    categoryName.toLowerCase().includes('support') ||
                    categoryName.trim().toUpperCase().startsWith('C')
                  if (isSupport) {
                    outputObj = this.officeLibraryStore?.category_outputs?.find(
                      (o) =>
                        cleanString(o.name) === cleanString(outputName) &&
                        o.f_category_id === categoryObj.id,
                    ) || { id: ps.output_id, name: outputName, label: outputName }
                  } else {
                    outputObj = this.officeLibraryStore?.outputs?.find(
                      (o) =>
                        cleanString(o.name) === cleanString(outputName) &&
                        o.f_category_id === categoryObj.id &&
                        (!mfoObj || o.mfo_id === mfoObj.id),
                    ) || { id: ps.output_id, name: outputName, label: outputName }
                  }
                }

                const resolvedIndicatorIds = this.resolvePerformanceIndicators(
                  ps.performance_indicator,
                  this.officeLibraryIndicatorStore?.verbs || [],
                )

                console.log(`[Store] PS ${index + 1} indicator resolution:`, {
                  raw: ps.performance_indicator,
                  resolved: resolvedIndicatorIds,
                })

                const standardOutcomeRows = this.mapStandardOutcomesToRows(ratings)

                let quantityIndicatorType = 'numeric'
                if (config.quantityIndicator === 'C' || config.quantity_indicator === 'C')
                  quantityIndicatorType = 'C'
                else if (config.quantityIndicator === 'B' || config.quantity_indicator === 'B')
                  quantityIndicatorType = 'B'

                let timelinessIndicatorType = 'beforeDeadline'
                if (
                  config.timelinessIndicator === 'onDeadline' ||
                  config.timeliness_indicator === 'onDeadline'
                ) {
                  timelinessIndicatorType = 'onDeadline'
                }

                const timelinessInputs = {
                  range: timelinessType.range === true,
                  date: timelinessType.date === true,
                  description: timelinessType.description === true,
                }

                const standard = {
                  id: `ps_${ps.id || index}`,
                  expanded: true,
                  outputName: ps.output_name || '',
                  indicatorName: resolvedIndicatorIds,
                  successIndicator: ps.success_indicator || '',
                  requiredOutput: ps.required_output || '',
                  modeOfVerification: '',
                  rows: {
                    category: categoryObj,
                    mfo: mfoObj,
                    output: outputObj,
                    // Preserve supervisory_control_no from the API so edits
                    // don't lose it if the cascade is not re-triggered.
                    supervisory_control_no: ps.supervisory_control_no || null,
                  },
                  quantityIndicatorType,
                  timelinessIndicatorType,
                  timelinessInputs,
                  activeTimelinessInputs: { ...timelinessInputs },
                  apiData: ps,
                  standardOutcomeRows,
                  competencies: {
                    core: ps.core_competency || ps.core || [],
                    technical: ps.technical_competency || ps.technical || [],
                    leadership: ps.leadership_competency || ps.leadership || [],
                  },
                  quantityRestriction: null,
                  targetOutputValue: null,
                }

                if (quantityIndicatorType === 'B') {
                  const existing = config.targetOutput || config.target_output
                  if (existing) standard.targetOutputValue = String(existing)
                }

                return standard
              },
            )
          } else {
            transformedEmployee.performanceStandards = [this.createDefaultPerformanceStandard()]
          }
        } else {
          transformedEmployee.performanceStandards = [this.createDefaultPerformanceStandard()]
        }

        console.log('[Store] ✅ Transformed employee:', transformedEmployee)
        return [transformedEmployee]
      } catch (error) {
        this.error = error.message || 'Failed to fetch employee data'
        console.error('[Store] ❌ Error:', error)
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
