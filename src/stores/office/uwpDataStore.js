// stores/office/uwpDataStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/userStore'

export const useUnitWorkPlanReportStore = defineStore('unitWorkPlanReport', {
  state: () => ({
    data: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchUnitWorkPlan(filters = {}) {
      this.loading = true
      this.error = null

      try {
        const userStore = useUserStore()

        const payload = {
          office_name:
            filters.hierarchyPath?.split(' / ')[0] ||
            userStore.officeData?.Office ||
            userStore.userData?.office_name ||
            'City Human Resource Management Office',
          organization: filters.organization || filters.division || '',
          semester: filters.semester || '',
          year: filters.year || '',
          hierarchyPath: filters.hierarchyPath || '',
          nodeId: filters.nodeId || '',
          nodeType: filters.nodeType || '',
        }

        console.log('Sending payload to API:', payload)

        const response = await api.post('/unit_work_plan', payload)
        this.data = response.data

        // Transform the data for the report
        this.transformDataForReport(response.data)

        return this.data
      } catch (error) {
        console.error('Error fetching unit work plan:', error)

        if (error.response) {
          this.error = error.response.data?.message || `Server error: ${error.response.status}`
          console.error('API Error Response:', error.response.data)
        } else if (error.request) {
          this.error = 'No response from server. Please check your connection.'
        } else {
          this.error = error.message || 'An error occurred'
        }

        return null
      } finally {
        this.loading = false
      }
    },

    transformDataForReport(apiData) {
      console.log('🔧 Raw API data for transformation:', apiData)

      const employees = []
      const mfoGroups = {}

      // 1. Collect all MFOs from office employee
      const officeMfos = []

      if (apiData.office && apiData.office.employee) {
        const officeEmployee = apiData.office.employee
        const officeTargetPeriods = apiData.office.target_periods || []

        console.log('🔧 Office employee:', officeEmployee)
        console.log('🔧 Office target periods:', officeTargetPeriods)

        officeTargetPeriods.forEach((targetPeriod) => {
          const performanceStandards = targetPeriod.performance_standards || []
          console.log('🔧 Office performance standards:', performanceStandards)

          performanceStandards.forEach((standard) => {
            const mfoName = standard.mfo || 'Unnamed MFO'
            const mfoId = mfoName.toLowerCase().replace(/\s+/g, '-')

            console.log(`🔧 Processing office MFO: ${mfoName} (ID: ${mfoId})`)

            // Initialize MFO group
            if (!mfoGroups[mfoId]) {
              mfoGroups[mfoId] = {
                name: mfoName,
                officeOutput: null,
                orgEmployees: [],
              }
            }

            // Store office output for this MFO
            const standards = this.mapStandardOutcomes(standard.standard_outcomes || [])
            console.log('🔧 Office standards:', standards)

            mfoGroups[mfoId].officeOutput = {
              mfoId: mfoId,
              name: mfoName,
              core: this.parseCompetencies(standard.core_competencies).join(', ') || 'N/A',
              technical:
                this.parseCompetencies(standard.technical_competencies).join(', ') || 'N/A',
              leadership:
                this.parseCompetencies(standard.leadership_competencies).join(', ') || 'N/A',
              indicator: standard.success_indicator || standard.performance_indicator || '',
              required: standard.required_output || '',
              standard5: standards[5] || 'N/A',
              standard4: standards[4] || 'N/A',
              standard3: standards[3] || 'N/A',
              standard2: standards[2] || 'N/A',
              standard1: standards[1] || 'N/A',
            }

            console.log('🔧 Created office output:', mfoGroups[mfoId].officeOutput)

            // Add to office MFOs list
            if (!officeMfos.some((mfo) => mfo.id === mfoId)) {
              officeMfos.push({
                id: mfoId,
                name: mfoName,
                employee: officeEmployee,
                output: mfoGroups[mfoId].officeOutput,
              })
            }
          })
        })
      }

      // 2. Process organization employees and group them by MFO
      if (apiData.organization && apiData.organization.employees) {
        console.log('🔧 Organization employees:', apiData.organization.employees)

        apiData.organization.employees.forEach((employeeData, empIndex) => {
          const orgEmployee = employeeData.employee
          const employeeTargetPeriods = employeeData.target_periods || []

          console.log(`🔧 Processing org employee ${empIndex}:`, orgEmployee.name)
          console.log('🔧 Org employee target periods:', employeeTargetPeriods)

          employeeTargetPeriods.forEach((targetPeriod, tpIndex) => {
            const performanceStandards = targetPeriod.performance_standards || []
            console.log(`🔧 Target period ${tpIndex} performance standards:`, performanceStandards)

            performanceStandards.forEach((standard, stdIndex) => {
              const mfoName = standard.mfo || standard.category || 'Unnamed MFO'
              const mfoId = mfoName.toLowerCase().replace(/\s+/g, '-')

              console.log(`🔧 Standard ${stdIndex} MFO: ${mfoName} (ID: ${mfoId})`)
              console.log('🔧 Standard data:', standard)

              // Check if this MFO exists in office employee's MFOs
              if (mfoGroups[mfoId]) {
                console.log(`🔧 MFO ${mfoId} found in office MFOs`)

                // Check if this employee already exists for this MFO
                let existingEmployee = mfoGroups[mfoId].orgEmployees.find(
                  (emp) => emp.employee.name === orgEmployee.name,
                )

                if (!existingEmployee) {
                  console.log(`🔧 Adding new org employee ${orgEmployee.name} to MFO ${mfoId}`)
                  mfoGroups[mfoId].orgEmployees.push({
                    employee: orgEmployee,
                    outputs: [],
                  })
                }

                // Find the employee and add output
                const employeeToUpdate = mfoGroups[mfoId].orgEmployees.find(
                  (emp) => emp.employee.name === orgEmployee.name,
                )

                if (employeeToUpdate) {
                  const standards = this.mapStandardOutcomes(standard.standard_outcomes || [])
                  console.log('🔧 Org employee standards:', standards)

                  const outputName = standard.output || standard.output_name || ''
                  console.log('🔧 Output name from standard:', outputName)

                  const outputData = {
                    mfoId: mfoId,
                    name: outputName,
                    core: this.parseCompetencies(standard.core).join(', ') || 'N/A',
                    technical: this.parseCompetencies(standard.technical).join(', ') || 'N/A',
                    leadership: this.parseCompetencies(standard.leadership).join(', ') || 'N/A',
                    indicator: standard.success_indicator || standard.performance_indicator || '',
                    required: standard.required_output || '',
                    standard5: standards[5] || 'N/A',
                    standard4: standards[4] || 'N/A',
                    standard3: standards[3] || 'N/A',
                    standard2: standards[2] || 'N/A',
                    standard1: standards[1] || 'N/A',
                  }

                  console.log(`🔧 Adding output to org employee ${orgEmployee.name}:`, outputData)
                  employeeToUpdate.outputs.push(outputData)
                }
              } else {
                console.log(`⚠️ MFO ${mfoId} not found in office MFOs, creating new group`)

                if (!mfoGroups[mfoId]) {
                  mfoGroups[mfoId] = {
                    name: mfoName,
                    officeOutput: null,
                    orgEmployees: [],
                  }
                }

                mfoGroups[mfoId].orgEmployees.push({
                  employee: orgEmployee,
                  outputs: [],
                })

                const employeeToUpdate = mfoGroups[mfoId].orgEmployees.find(
                  (emp) => emp.employee.name === orgEmployee.name,
                )

                if (employeeToUpdate) {
                  const standards = this.mapStandardOutcomes(standard.standard_outcomes || [])
                  const outputName = standard.output || standard.output_name || ''

                  const outputData = {
                    mfoId: mfoId,
                    name: outputName,
                    core: this.parseCompetencies(standard.core).join(', ') || 'N/A',
                    technical: this.parseCompetencies(standard.technical).join(', ') || 'N/A',
                    leadership: this.parseCompetencies(standard.leadership).join(', ') || 'N/A',
                    indicator: standard.success_indicator || standard.performance_indicator || '',
                    required: standard.required_output || '',
                    standard5: standards[5] || 'N/A',
                    standard4: standards[4] || 'N/A',
                    standard3: standards[3] || 'N/A',
                    standard2: standards[2] || 'N/A',
                    standard1: standards[1] || 'N/A',
                  }

                  console.log(`🔧 Adding output to org employee in new MFO group:`, outputData)
                  employeeToUpdate.outputs.push(outputData)
                }
              }
            })
          })
        })
      }

      // 3. Build the final employees array
      console.log('🔧 Office MFOs to process:', officeMfos)
      console.log('🔧 MFO Groups:', mfoGroups)

      officeMfos.forEach((mfo, index) => {
        console.log(`🔧 Processing office MFO ${index}: ${mfo.name}`)
        const mfoGroup = mfoGroups[mfo.id]

        if (mfoGroup.officeOutput) {
          const officeHeadData = {
            name: mfo.employee.name,
            position: mfo.employee.position || 'Office Head',
            sg: mfo.employee.sg,
            level: mfo.employee.level,
            rank: mfo.employee.rank || 'Office-Head',
            isOfficeHead: true,
            isMfoHeader: true,
            mfoName: mfo.name,
            outputs: [mfoGroup.officeOutput],
          }
          console.log('🔧 Adding office head:', officeHeadData)
          employees.push(officeHeadData)
        }

        console.log(`🔧 Org employees for MFO ${mfo.name}:`, mfoGroup.orgEmployees)
        mfoGroup.orgEmployees.forEach((orgEmpData, empIndex) => {
          const orgEmployeeData = {
            name: orgEmpData.employee.name,
            position: orgEmpData.employee.position || '',
            sg: orgEmpData.employee.sg,
            level: orgEmpData.employee.level,
            rank: orgEmpData.employee.rank || '',
            isOfficeHead: false,
            isMfoHeader: false,
            mfoName: '',
            outputs: orgEmpData.outputs,
          }
          console.log(`🔧 Adding org employee ${empIndex}:`, orgEmployeeData)
          employees.push(orgEmployeeData)
        })
      })

      // Also add any MFOs that only have org employees (no office head)
      Object.keys(mfoGroups).forEach((mfoId) => {
        const mfoGroup = mfoGroups[mfoId]

        if (officeMfos.some((mfo) => mfo.id === mfoId)) {
          return
        }

        if (mfoGroup.orgEmployees.length > 0) {
          console.log(`🔧 Processing MFO ${mfoId} with only org employees`)

          mfoGroup.orgEmployees.forEach((orgEmpData) => {
            const orgEmployeeData = {
              name: orgEmpData.employee.name,
              position: orgEmpData.employee.position || '',
              sg: orgEmpData.employee.sg,
              level: orgEmpData.employee.level,
              rank: orgEmpData.employee.rank || '',
              isOfficeHead: false,
              isMfoHeader: false,
              mfoName: '',
              outputs: orgEmpData.outputs,
            }
            console.log(`🔧 Adding org employee from non-office MFO:`, orgEmployeeData)
            employees.push(orgEmployeeData)
          })
        }
      })

      // ✅ FIX: Preserve the original office object so unitworkplan_status is accessible
      this.data = {
        name: apiData.organization?.name || apiData.office?.name || 'Division Report',
        employees: employees,
        office: apiData.office || null,
      }

      console.log('✅ Final transformed data:', this.data)
    },

    parseCompetencies(competencies) {
      try {
        if (!competencies) return []
        if (typeof competencies === 'string') {
          const parsed = JSON.parse(competencies)
          return Array.isArray(parsed) ? parsed : []
        }
        if (Array.isArray(competencies)) {
          return competencies
        }
        return []
      } catch (error) {
        console.warn('Error parsing competencies:', error)
        return []
      }
    },

    mapStandardOutcomes(standardOutcomes) {
      const standards = {}

      if (!standardOutcomes || !Array.isArray(standardOutcomes)) {
        console.log('⚠️ No standard outcomes or not an array:', standardOutcomes)
        return standards
      }

      console.log('🔧 Mapping standard outcomes:', standardOutcomes)

      standardOutcomes.forEach((outcome) => {
        const rating = parseInt(outcome.rating)
        if (!isNaN(rating) && rating >= 1 && rating <= 5) {
          standards[rating] = this.formatStandard(outcome)
          console.log(`🔧 Added standard for rating ${rating}:`, standards[rating])
        } else {
          console.log('⚠️ Invalid rating:', outcome.rating)
        }
      })

      return standards
    },

    formatStandard(outcome) {
      const parts = []
      parts.push(`Q - ${outcome.quantity_target || '-'}`)
      parts.push(`E - ${outcome.effectiveness_criteria || '-'}`)
      parts.push(`T - ${outcome.timeliness_range || '-'}`)
      return parts.join('\n')
    },

    clearData() {
      this.data = null
      this.error = null
    },
  },

  getters: {
    getReportData: (state) => {
      if (!state.data) return null

      if (state.data.name && state.data.employees) {
        return state.data
      }

      return {
        name: 'Division Report',
        employees: [],
      }
    },

    isLoading: (state) => state.loading,
    hasError: (state) => state.error !== null,
    getError: (state) => state.error,
  },
})
