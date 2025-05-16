//office unit_work_plantStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/userStore'

export const useUnitWorkPlanStore = defineStore('unitWorkPlan', {
  state: () => ({
    selectedDivision: null,
    divisionOptions: [],
    selectedEmployee: null,
    targetPeriods: [],
    employeesWithWorkPlans: [],
    selectedTargetPeriod: null,
    employeeOptions: [],
    rank: '',
    position: '',
    targetPeriod: '',
    targetYear: new Date().getFullYear().toString(),
    periodOptions: ['January - June', 'July - December'],
    yearOptions: Array.from({ length: 10 }, (_, i) =>
      (new Date().getFullYear() + i - 5).toString(),
    ),
    filteredYears: [],
    loading: false,
    error: null,
    divisions: [],
    performanceStandards: [
      {
        coreCompetency: 'DSE-4',
        leadershipCompetency: 'TSC-4',
        technicalCompetency: 'RM-3',
      },
    ],
    employeePositionMap: {},
    codeMappings: {
      core: {
        'Delivering Service Excellence': 'DSE',
        'Exemplifying Integrity': 'EI',
        'Interpersonal Skills': 'IS',
      },
      technical: {
        'Planning and Organizing': 'P&O',
        'Monitoring and Evaluation': 'M&E',
        'Records Management': 'RM',
        'Partnering and Networking': 'P&N',
        'Process Management': 'PM',
        'Attention to Detail': 'AD',
      },
      leadership: {
        'Thinking Strategically and Creatively': 'TSC',
        'Problem Solving and Decision Making': 'PSDM',
        'Building Collaborative & Inclusive Working Relationships': 'BCIWR',
        'Managing Performance & Coaching for Results': 'MPCR',
      },
    },
  }),

  actions: {
    formatCompetencies(competencies, type) {
      if (!competencies) return ''
      const entries = Object.entries(competencies)
      if (entries.length === 0) return ''

      return entries
        .map(([key, val]) => {
          const code = this.codeMappings[type]?.[key] || key
          const value = typeof val === 'object' ? val.value : val
          return `${code}-${value}`
        })
        .join('<br>')
    },

    async fetchDivisionsWithWorkPlans(targetPeriod = null) {
      this.loading = true
      try {
        const response = await api.get('/division/status')

        // Access the nested data array from the response
        let divisions = response.data.data.filter((division) => division.status)

        if (targetPeriod) {
          const [periodPart, yearPart] = targetPeriod.split(/(?=\d{4}$)/)
          const period = periodPart.trim()
          const year = yearPart.trim()

          divisions = divisions.filter((division) => {
            const divPeriod = division.target_period
            return divPeriod.includes(period) && divPeriod.includes(year)
          })
        }

        this.divisions = divisions
        this.error = null
        return divisions
      } catch (err) {
        this.error = 'Failed to fetch divisions'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchDivisionDetails(division, targetPeriod) {
      this.loading = true
      try {
        const [period, year] = targetPeriod.split(/(?=\d{4}$)/)

        const response = await api.get('/division/employee/performance', {
          params: {
            division,
            target_period: period.trim(),
            year: year.trim(),
          },

        })

        console.log('API Response:', response.data) // Debug raw data

        const employeesMap = {}

        response.data.forEach((emp) => {
          if (!emp.employee_id) {
            console.warn('Employee missing ID:', emp)
            return
          }

          if (!employeesMap[emp.employee_id]) {
            employeesMap[emp.employee_id] = {
              id: emp.employee_id,
              name: emp.employee_name || 'Unknown',
              position: emp.position || 'N/A',
              rank: emp.rank || 'N/A',
              outputs: [],
            }
          }

          // Handle performance standards array
          if (emp.performance_standards && emp.performance_standards.length > 0) {
            emp.performance_standards.forEach((standard) => {
              employeesMap[emp.employee_id].outputs.push({
                name: standard.mfo
                  ? `${standard.mfo}<br><br>${standard.output}`
                  : standard.output || 'N/A',
                core: standard.core_competency
                  ? this.formatCompetencies(standard.core_competency, 'core')
                  : 'N/A',
                technical: standard.technical_competency
                  ? this.formatCompetencies(standard.technical_competency, 'technical')
                  : 'N/A',
                leadership: standard.leadership_competency
                  ? this.formatCompetencies(standard.leadership_competency, 'leadership')
                  : 'N/A',
                indicator: standard.success_indicator || 'N/A',
                required: standard.required_output || 'N/A',
                standard5: standard.standard_outcomes
                  ? this.formatStandard(standard.standard_outcomes, 5)
                  : 'N/A',
                standard4: standard.standard_outcomes
                  ? this.formatStandard(standard.standard_outcomes, 4)
                  : 'N/A',
                standard3: standard.standard_outcomes
                  ? this.formatStandard(standard.standard_outcomes, 3)
                  : 'N/A',
                standard2: standard.standard_outcomes
                  ? this.formatStandard(standard.standard_outcomes, 2)
                  : 'N/A',
                standard1: standard.standard_outcomes
                  ? this.formatStandard(standard.standard_outcomes, 1)
                  : 'N/A',
              })
            })
          } else {
            console.warn('Missing performance standards for employee:', emp.employee_name)
            employeesMap[emp.employee_id].outputs.push({
              name: 'No performance data',
              core: 'N/A',
              technical: 'N/A',
              leadership: 'N/A',
              indicator: 'N/A',
              required: 'N/A',
              standard5: 'N/A',
              standard4: 'N/A',
              standard3: 'N/A',
              standard2: 'N/A',
              standard1: 'N/A',
            })
          }
        })

        const formattedData = {
          name: division,
          employees: Object.values(employeesMap),
        }

        console.log('Formatted Data:', formattedData) // Debug final structure
        return formattedData
      } catch (err) {
        console.error('Error fetching division details:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    formatStandard(standards, rating) {
      if (!standards || !Array.isArray(standards)) {
        console.warn('Invalid standards:', standards)
        return 'N/A'
      }

      const standard = standards.find((s) => s.rating == rating) // Note: using == instead of === to handle string/number
      if (!standard) return 'N/A'

      return `Q - ${standard.quantity || 'N/A'}<br>
          E - ${standard.effectiveness || 'N/A'}<br>
          T - ${standard.timeliness || 'N/A'}`
    },
    setSelectedDivision(division) {
      this.selectedDivision = division
    },

    setTargetPeriod(period) {
      this.targetPeriod = period
    },

    async fetchDivisionsWithStatus() {
      this.loading = true
      try {
        const response = await api.get('/division/status')
        // Return the response data which contains the data and total_divisions
        this.divisions = response.data.data // Access the nested data
        this.error = null
        return response.data // Return the full response
      } catch (err) {
        this.error = 'Failed to fetch divisions'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchEmployeesByDivision(division, targetPeriod) {
      this.loading = true

      try {
        // Validate targetPeriod format first
        if (!targetPeriod || typeof targetPeriod !== 'string') {
          throw new Error('Invalid target period format')
        }

        // Split targetPeriod into period and year
        const [periodPart, yearPart] = targetPeriod.split(/(?=\d{4}$)/)
        const period = periodPart?.trim() || ''
        const year = yearPart?.trim() || ''

        // Make sure we have both parts
        if (!period || !year) {
          throw new Error(
            'Target period must include both period and year (e.g. "January - June 2023")',
          )
        }

        const response = await api.get('/division/employee/performance', {
          params: {
            division,
            target_period: period,
            year: year,
          },
        })

        // Group performance standards by employee
        const groupedEmployees = {}
        response.data.forEach((emp) => {
          if (!groupedEmployees[emp.employee_id]) {
            groupedEmployees[emp.employee_id] = {
              id: emp.employee_id,
              name: emp.employee_name,
              position: emp.position,
              rank: emp.rank,
              status: emp.status || 'Pending',
              performanceStandards: [],
            }
          }
          groupedEmployees[emp.employee_id].performanceStandards.push(...emp.performance_standards)
        })

        this.employeesWithWorkPlans = Object.values(groupedEmployees)
        this.error = null
        return Object.values(groupedEmployees) // Return the data for use in components
      } catch (err) {
        this.error = 'Failed to fetch employees: ' + (err.response?.data?.message || err.message)
        console.error('Error fetching employees by division:', err)
        throw err // Re-throw the error to handle it in components
      } finally {
        this.loading = false
      }
    },

    clearSelection() {
      this.selectedDivision = null
      this.selectedTargetPeriod = null
      this.employeesWithWorkPlans = []
    },



    async saveWorkPlan(workPlans) {
      const userStore = useUserStore()
      if (!userStore.officeId) {
        throw new Error('User office not found')
      }

      try {
        // Validation: Check effectiveness and timeliness
        for (const plan of workPlans) {
          for (const standard of plan.performanceData || []) {
            const outcomes = standard.standardOutcomeRows || []

            const effectivenessFilled = outcomes.filter((o) => o.effectiveness.trim() !== '').length
            const timelinessFilled = outcomes.filter((o) => o.timeliness.trim() !== '').length

            if (effectivenessFilled < 2 && timelinessFilled < 2) {
              throw new Error(
                `Please complete at least 2 values in either effectiveness or timeliness`,
              )
            }
          }
        }

        // Prepare payload
        const payload = {
          office_id: userStore.officeId,
          division: this.selectedDivision,
          target_period: this.targetPeriod,
          year: parseInt(this.targetYear),
          employee_work_plans: workPlans
            .map((plan) => {
              if (!plan.performanceData || plan.performanceData.length === 0) {
                console.warn(`No performance data for employee ID: ${plan.employeeId}`)
                return null
              }

              return {
                employee_id: plan.employeeId,
                rank: plan.rank,
                position: plan.position,
                performance_standards: plan.performanceData.map((standard) => ({
                  category: standard.rows[0]?.category || null,
                  mfo: standard.rows[1]?.mfo || null,
                  output: standard.rows[2]?.output || null,
                  success_indicator: standard.successIndicator || '',
                  mode: standard.mode || '',
                  required_output: standard.requiredOutput || '',
                  standard_outcomes: standard.standardOutcomeRows.map((outcome) => ({
                    rating: outcome.rating,
                    quantity: outcome.quantity || '',
                    effectiveness: outcome.effectiveness || '',
                    timeliness: outcome.timeliness || '',
                  })),
                  core_competency: standard.coreCompetency || null,
                  technical_competency: standard.technicalCompetency || null,
                  leadership_competency: standard.leadershipCompetency || null,
                })),
              }
            })
            .filter(Boolean),
        }

        const response = await api.post('/unit_work_plan/store', payload)
        return response.data
      } catch (error) {
        console.error('Error saving work plan:', error)
        throw error
      }
    },

    async fetchDivisions() {
      const userStore = useUserStore()
      if (!userStore.officeId) return

      try {
        const response = await api.get(`/employees/divisions?office_id=${userStore.officeId}`)
        this.divisionOptions = response.data
        this.resetEmployeeSelection()
      } catch (error) {
        console.error('Error fetching divisions:', error)
        throw error
      }
    },

    async fetchEmployees() {
      this.loading = true
      try {
        const userStore = useUserStore()
        if (!userStore.officeId || !this.selectedDivision) {
          throw new Error('Office or division not selected')
        }

        // First get basic employee info
        const employeesResponse = await api.get('/employees', {
          params: {
            office_id: userStore.officeId,
            division: this.selectedDivision,
          },
        })

        this.employeeOptions = employeesResponse.data.map((emp) => ({
          id: emp.id,
          name: emp.name,
          position: emp.position,
          positionId: emp.position_id,
          rank: emp.rank,
          isOfficeHead: emp.rank.toLowerCase().includes('office-head'),
        }))

        // If we have a target period, also fetch their performance data
        if (this.targetPeriod) {
          await this.fetchEmployeesByDivision(this.selectedDivision, this.targetPeriod)
        }

        this.resetEmployeeSelection()
        return this.employeeOptions
      } catch (error) {
        console.error('Error fetching employees:', error)
        this.$q.notify({
          message: 'Failed to fetch employees: ' + (error.response?.data?.message || error.message),
          color: 'negative',
          icon: 'error',
        })
        throw error
      } finally {
        this.loading = false
      }
    },
    async fetchEmployeeCompetencies(employeeId) {
      try {
        const response = await api.get(`/employee/${employeeId}/competencies`)
        return response.data.data
      } catch (error) {
        console.error('Error fetching competencies:', error)
        throw error
      }
    },

    async fillEmployeeDetails(employeeId, empIndex) {
      const employee = this.employeeOptions.find((e) => e.id === employeeId)
      if (employee) {
        this.employeeWorkPlans[empIndex].rank = employee.rank || ''
        this.employeeWorkPlans[empIndex].position = employee.position || ''
        this.employeeWorkPlans[empIndex].employeeName = employee.name || ''

        try {
          const competencies = await this.fetchEmployeeCompetencies(employeeId)
          this.employeeWorkPlans[empIndex].competencies = competencies

          if (this.employeeWorkPlans[empIndex].performanceStandards.length > 0) {
            const firstStandard = this.employeeWorkPlans[empIndex].performanceStandards[0]

            if (competencies.core && Object.keys(competencies.core).length > 0) {
              const firstCore = Object.entries(competencies.core)[0]
              firstStandard.coreCompetency = `${firstCore[0]}-${firstCore[1].value}`
            }

            if (competencies.technical && Object.keys(competencies.technical).length > 0) {
              const firstTech = Object.entries(competencies.technical)[0]
              firstStandard.technicalCompetency = `${firstTech[0]}-${firstTech[1].value}`
            }

            if (competencies.leadership && Object.keys(competencies.leadership).length > 0) {
              const firstLeader = Object.entries(competencies.leadership)[0]
              firstStandard.leadershipCompetency = `${firstLeader[0]}-${firstLeader[1].value}`
            }
          }
        } catch (error) {
          console.error('Error loading competencies:', error)
        }
      }
    },

    filterYears(val, update) {
      if (val === '') {
        update(() => {
          this.filteredYears = this.yearOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.filteredYears = this.yearOptions.filter((v) => v.toLowerCase().indexOf(needle) > -1)
      })
    },

    resetForm() {
      const currentYear = new Date().getFullYear().toString()
      this.selectedDivision = null
      this.selectedEmployee = null
      this.rank = ''
      this.position = ''
      this.targetPeriod = ''
      this.targetYear = currentYear
      this.performanceStandards = [{}]
    },

    addPerformanceStandard(employeeIndex) {
      const employee = this.employeeWorkPlans[employeeIndex]
      this.employeeWorkPlans[employeeIndex].performanceStandards.push({
        coreCompetency: employee.competencies?.core || {},
        technicalCompetency: employee.competencies?.technical || {},
        leadershipCompetency: employee.competencies?.leadership || {},
      })
    },

    removePerformanceStandard(index) {
      this.performanceStandards.splice(index, 1)
    },

    resetEmployeeSelection() {
      this.selectedEmployee = null
      this.rank = ''
      this.position = ''
    },
  },
})
