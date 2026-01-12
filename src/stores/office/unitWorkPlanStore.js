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
    resolveCategoryLabel(category) {
      if (!category) return ''
      if (category.name || category.label) return category.name || category.label
      const id = typeof category === 'object' ? category.id : category
      return this.officeLibraryIndicatorStore?.categories?.find((c) => c.id === id)?.name || ''
    },

    resolveMfoLabel(mfo) {
      if (!mfo) return ''
      if (mfo.name || mfo.label) return mfo.name || mfo.label
      const id = typeof mfo === 'object' ? mfo.id : mfo
      return this.officeLibraryIndicatorStore?.mfos?.find((m) => m.id === id)?.name || ''
    },

    resolveOutputLabel(output, categoryId, mfoId) {
      if (!output) return ''
      if (output.name || output.label) return output.name || output.label
      const id = typeof output === 'object' ? output.id : output

      const isSupport =
        this.officeLibraryIndicatorStore?.categories?.find((c) => c.id === categoryId)?.name ===
        'C.  SUPPORT FUNCTION'

      if (isSupport) {
        return (
          this.officeLibraryIndicatorStore?.category_outputs?.find((o) => o.id === id)?.name || ''
        )
      }

      return (
        this.officeLibraryIndicatorStore?.outputs?.find(
          (o) => o.id === id && (!mfoId || o.mfo_id === mfoId),
        )?.name || ''
      )
    },

    resolveVerbLabel(idOrText) {
      if (!idOrText) return ''
      if (typeof idOrText === 'string' && isNaN(Number(idOrText))) return idOrText
      const verbId = Number(idOrText)
      const verb = this.officeLibraryIndicatorStore?.verbs?.find((v) => v.id === verbId) || null
      return verb?.indicator_name || verb?.name || ''
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
      }
    },

    mapStandardOutcomesToRows(standardOutcomes) {
      if (!standardOutcomes || standardOutcomes.length === 0) return sortedDefaultRows()

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

      return [5, 4, 3, 2, 1].map((rating) => {
        const o = outcomesByRating[rating] || {}
        return {
          rating: rating.toString(),
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
          }

          perfStandard.outputName = standard.output_name || ''
          perfStandard.indicatorName = standard.performance_indicator || ''
          perfStandard.successIndicator = standard.success_indicator || ''
          perfStandard.requiredOutput = standard.required_output || ''

          return perfStandard
        })

        if (transformedStandards.length === 0)
          transformedStandards.push(this.createDefaultPerformanceStandard())

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
    transformPayload(submissionData) {
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
            performance_standards: [],
          }

          if (Array.isArray(emp.performanceStandards)) {
            employeePayload.performance_standards = emp.performanceStandards.map((standard) => {
              const categoryId = standard.rows?.category?.id ?? standard.rows?.category
              const mfoId = standard.rows?.mfo?.id ?? standard.rows?.mfo
              const outputId = standard.rows?.output?.id ?? standard.rows?.output

              const categoryValue = this.resolveCategoryLabel(standard.rows?.category || categoryId)
              const mfoValue = this.resolveMfoLabel(standard.rows?.mfo || mfoId)
              const outputValue = this.resolveOutputLabel(outputId, categoryId, mfoId)
              const performanceIndicator = this.resolveVerbLabel(standard.indicatorName)

              const requiredOutput =
                (standard.outputName && standard.outputName.trim()) ||
                (standard.requiredOutput && standard.requiredOutput.trim()) ||
                (outputValue && outputValue.trim()) ||
                'N/A'

              const ratings = []
              let defaultTimelinessValue = ''

              if (Array.isArray(standard.standardOutcomeRows)) {
                standard.standardOutcomeRows.forEach((row) => {
                  if (!row.rating) return

                  let timelinessValue = ''

                  const useBeforeDeadline =
                    standard.timelinessIndicatorType === 'beforeDeadline' && row.rating === '3'
                  const useOnDeadline =
                    standard.timelinessIndicatorType === 'onDeadline' && row.rating === '5'

                  if (useBeforeDeadline || useOnDeadline) {
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

                  if (!timelinessValue)
                    timelinessValue = row.timeliness || row.timelinessRange || ''
                  if (!defaultTimelinessValue && timelinessValue)
                    defaultTimelinessValue = timelinessValue

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

              const quantityType = standard.quantityIndicatorType || 'numeric'
              const timelinessType = standard.timelinessIndicatorType || 'beforeDeadline'
              const timelinessInputs = standard.timelinessInputs || {
                range: true,
                date: false,
                description: false,
              }

              const quantityRow =
                standard.standardOutcomeRows?.find((row) => row.rating === '5') || {}
              const timelinessRow =
                timelinessType === 'beforeDeadline'
                  ? standard.standardOutcomeRows?.find((row) => row.rating === '3') || {}
                  : standard.standardOutcomeRows?.find((row) => row.rating === '5') || {}

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
                  range: Boolean(timelinessInputs.range),
                  date: Boolean(timelinessInputs.date),
                  description: Boolean(timelinessInputs.description),
                },
                target_output: {
                  type: 'object',
                  quantity: String(quantityRow.quantity || 'N/A'),
                  timeliness: String(timelinessValue),
                  baseTarget: standard.targetOutput?.baseTarget || null,
                  calculated: standard.targetOutput?.calculated || [],
                },
              }

              return {
                category: String(categoryValue || ''),
                mfo: String(mfoValue || ''),
                output: String(outputValue || ''), // dropdown selection
                output_name: String(standard.outputName || ''), // free text
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
                required_output: String(requiredOutput),
                ratings: ratings.length > 0 ? ratings : [],
                config,
              }
            })
          }

          return employeePayload
        }),
      }
    },

    transformUpdatePayload(updateData) {
      const semester = updateData.form?.semester || ''
      const year = updateData.form?.year || new Date().getFullYear()
      const employee = updateData.employee

      const base = {
        control_no: employee.controlNo || employee.employeeData?.ControlNo || '',
        employee_id: employee.employeeId || 0,
        employee_name: employee.name || '',
        semester,
        year,
        office: updateData.uwpData?.hierarchy?.office?.label || '',
        office2: updateData.uwpData?.hierarchy?.office2?.label || null,
        group: updateData.uwpData?.hierarchy?.group?.label || null,
        division: updateData.uwpData?.hierarchy?.division?.label || null,
        section: updateData.uwpData?.hierarchy?.section?.label || null,
        unit: updateData.uwpData?.hierarchy?.unit?.label || null,
        performance_standards: [],
      }

      if (Array.isArray(employee.performanceStandards)) {
        base.performance_standards = employee.performanceStandards.map((standard) => {
          const categoryId = standard.rows?.category?.id ?? standard.rows?.category
          const mfoId = standard.rows?.mfo?.id ?? standard.rows?.mfo
          const outputId = standard.rows?.output?.id ?? standard.rows?.output

          const categoryName = this.resolveCategoryLabel(standard.rows?.category || categoryId)
          const mfoName = this.resolveMfoLabel(standard.rows?.mfo || mfoId)
          const outputName = this.resolveOutputLabel(outputId, categoryId, mfoId)
          const performanceIndicator = this.resolveVerbLabel(standard.indicatorName)

          const ratings = []
          if (Array.isArray(standard.standardOutcomeRows)) {
            standard.standardOutcomeRows.forEach((row) => {
              if (!row.rating) return

              let timelinessValue = ''
              const beforeDeadline =
                standard.timelinessIndicatorType === 'beforeDeadline' && row.rating === '3'
              const onDeadline =
                standard.timelinessIndicatorType === 'onDeadline' && row.rating === '5'

              if (beforeDeadline || onDeadline) {
                if (standard.activeTimelinessInputs?.range && row.timelinessRange) {
                  timelinessValue = row.timelinessRange
                }
                if (standard.activeTimelinessInputs?.date && row.timelinessDate) {
                  timelinessValue = timelinessValue
                    ? `${timelinessValue} by ${row.timelinessDate}`
                    : `by ${row.timelinessDate}`
                }
                if (standard.activeTimelinessInputs?.description && row.timelinessText) {
                  timelinessValue = timelinessValue
                    ? `${timelinessValue} ${row.timelinessText}`
                    : row.timelinessText
                }
              }

              ratings.push({
                rating: Number(row.rating) || 0,
                quantity: String(row.quantity || ''),
                effectiveness: String(row.effectiveness || ''),
                timeliness: String(timelinessValue || row.timeliness || ''),
                timeliness_range: String(row.timelinessRange || ''),
                timeliness_date: String(row.timelinessDate || ''),
                timeliness_description: String(row.timelinessText || ''),
              })
            })
          }

          const config = {
            quantity_indicator_type: {
              type: String(standard.quantityIndicatorType || 'numeric'),
              quantity: standard.standardOutcomeRows?.find((r) => r.rating === '5')?.quantity || '',
            },
            timeliness_indicator_type: {
              type: String(standard.timelinessIndicatorType || 'beforeDeadline'),
            },
            timeliness_inputs: {
              range: Boolean(standard.activeTimelinessInputs?.range || false),
              date: Boolean(standard.activeTimelinessInputs?.date || false),
              description: Boolean(standard.activeTimelinessInputs?.description || false),
            },
          }

          return {
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
            ratings,
            config,
          }
        })
      }

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

    async saveUWP(submissionData, officeLibraryIndicatorStore) {
      this.loading = true
      this.error = null

      try {
        this.officeLibraryIndicatorStore = officeLibraryIndicatorStore
        const payload = this.transformPayload(submissionData)

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
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUWP(updateData, officeLibraryIndicatorStore) {
      this.loading = true
      this.error = null

      try {
        this.officeLibraryIndicatorStore = officeLibraryIndicatorStore
        const payload = this.transformUpdatePayload(updateData)

        const token = localStorage.getItem('token')
        const response = await api.put('/unit_work_plan/update', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) return response.data
        throw new Error(response.data.message || 'Failed to update UWP')
      } catch (error) {
        this.error = error.message || 'Failed to update UWP'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchEmployeeByControlNo(controlNo, semester, year) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`spms/employee/${controlNo}/${semester}/${year}`)
        const employeeData = response.data
        if (!employeeData) return []

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
          const standardOutcomes = targetPeriod.standard_outcomes || []
          const configurations = targetPeriod.configurations || []

          if (
            Array.isArray(targetPeriod.performance_standards) &&
            targetPeriod.performance_standards.length
          ) {
            transformedEmployee.performanceStandards = targetPeriod.performance_standards.map(
              (ps) => {
                const relatedConfigs = configurations.filter(
                  (config) => config.performance_standard_id === ps.id.toString(),
                )

                return {
                  id: `ps_${ps.id}`,
                  expanded: true,
                  outputName: ps.output_name || '',
                  indicatorName: ps.performance_indicator || '',
                  successIndicator: ps.success_indicator || '',
                  requiredOutput: ps.required_output || '',
                  modeOfVerification: '',
                  rows: {
                    category: ps.category || null,
                    mfo: ps.mfo || null,
                    output: ps.output || null,
                  },
                  quantityIndicatorType: 'numeric',
                  timelinessIndicatorType: 'beforeDeadline',
                  timelinessInputs: { range: true, date: false, description: false },
                  activeTimelinessInputs: { range: true, date: false, description: false },
                  apiData: {
                    ...ps,
                    standardOutcomes,
                    configurations: relatedConfigs,
                  },
                }
              },
            )
          }

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
        }

        return [transformedEmployee]
      } catch (error) {
        this.error = error.message || 'Failed to fetch employee data'
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
