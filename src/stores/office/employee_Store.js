import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { useUserStore } from '../userStore'

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    employees: [], // Full list loaded once on mount
    loading: false,
    error: null,
    currentOfficeId: null,
    userOffice: null,
    assignedEmployees: [], // Filtered for selected node
    unassignedEmployees: [],
    currentNode: null,
    softDeletedEmployees: [],
    searchedEmployees: [],
    employeeCounts: {
      office: 0,
      office2: {},
      groups: {},
      divisions: {},
      sections: {},
      units: {},
    },
  }),

  getters: {
    getEmployeesByFilter: (state) => (filter) => {
      if (!filter) return state.assignedEmployees
      return state.assignedEmployees.filter((emp) => {
        if (filter.unit) return emp.unit === filter.unit
        if (filter.section) return emp.section === filter.section && !emp.unit
        if (filter.division) return emp.division === filter.division && !emp.section && !emp.unit
        if (filter.group)
          return emp.group === filter.group && !emp.division && !emp.section && !emp.unit
        if (filter.office2)
          return (
            emp.office2 === filter.office2 &&
            !emp.group &&
            !emp.division &&
            !emp.section &&
            !emp.unit
          )
        if (filter.office_id)
          return (
            emp.office_id === filter.office_id &&
            !emp.office2 &&
            !emp.group &&
            !emp.division &&
            !emp.section &&
            !emp.unit
          )
        return true
      })
    },

    getEmployeeCountByLevel: (state) => (level, name) => {
      if (level === 'office') return state.employeeCounts.office || 0
      if (level === 'office2') return state.employeeCounts.office2?.[name]?.count || 0
      if (level === 'group') return state.employeeCounts.groups?.[name]?.count || 0
      if (level === 'division') return state.employeeCounts.divisions?.[name]?.count || 0
      if (level === 'section') return state.employeeCounts.sections?.[name]?.count || 0
      if (level === 'unit') return state.employeeCounts.units?.[name]?.count || 0
      return 0
    },
  },

  actions: {
    // Load full employee list once and compute counts locally
    async loadAllEmployees() {
      if (this.employees && this.employees.length > 0) return this.employees

      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        console.log('Loading employees from /employee endpoint')

        const response = await api.get('/employee', {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log('Response from /employee:', response.data)

        // The endpoint returns data directly as an array
        if (Array.isArray(response.data)) {
          this.employees = response.data.map((emp) => ({
            id: emp.id || null,
            ControlNo: emp.ControlNo || null,
            name: emp.name,
            position: emp.position.name || emp.position,
            position_id: emp.position_id || null,
            office: emp.office,
            office_id: emp.office_id,
            office2: emp.office2 || null,
            group: emp.group || null,
            division: emp.division || null,
            section: emp.section || null,
            unit: emp.unit || null,
            rank: emp.rank || '',
            selected: false,
          }))

          // Compute counts from the loaded employee list
          this.computeCountsFromEmployees()

          console.log('Employees loaded successfully:', this.employees.length)
          console.log('Employee counts:', this.employeeCounts)

          return this.employees
        } else if (response.data && response.data.success) {
          // Fallback for wrapped response
          this.employees = response.data.data.map((emp) => ({
            id: emp.id || null,
            ControlNo: emp.ControlNo || null,
            name: emp.name,
            position: typeof emp.position === 'object' ? emp.position.name : emp.position,
            position_id: emp.position_id || null,
            office: emp.office,
            office_id: emp.office_id,
            office2: emp.office2 || null,
            group: emp.group || null,
            division: emp.division || null,
            section: emp.section || null,
            unit: emp.unit || null,
            rank: emp.rank || '',
            selected: false,
          }))

          this.userOffice = response.data.user_office || null
          this.computeCountsFromEmployees()

          return this.employees
        } else {
          throw new Error('Invalid response format from /employee endpoint')
        }
      } catch (error) {
        console.error('Failed to load employees:', error.message, error.response?.data)
        this.error = error.message || 'Failed to load employees'
        this.employees = []
        this.employeeCounts = {
          office: 0,
          office2: {},
          groups: {},
          divisions: {},
          sections: {},
          units: {},
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    // Compute counts from the employees array - COUNT AT LOWEST LEVEL
    computeCountsFromEmployees() {
      const counts = {
        office: 0,
        office2: {},
        groups: {},
        divisions: {},
        sections: {},
        units: {},
      }

      if (!Array.isArray(this.employees)) return counts

      this.employees.forEach((emp) => {
        // Count at the LOWEST level the employee is assigned to

        // UNIT LEVEL:   Has unit (deepest level)
        if (emp.unit) {
          counts.units[emp.unit] = counts.units[emp.unit] || { name: emp.unit, count: 0 }
          counts.units[emp.unit].count++
          return
        }

        // SECTION LEVEL: Has section but NO unit
        if (emp.section) {
          counts.sections[emp.section] = counts.sections[emp.section] || {
            name: emp.section,
            count: 0,
          }
          counts.sections[emp.section].count++
          return
        }

        // DIVISION LEVEL: Has division but NO section or unit
        if (emp.division) {
          counts.divisions[emp.division] = counts.divisions[emp.division] || {
            name: emp.division,
            count: 0,
          }
          counts.divisions[emp.division].count++
          return
        }

        // GROUP LEVEL: Has group but NO division, section, or unit
        if (emp.group) {
          counts.groups[emp.group] = counts.groups[emp.group] || { name: emp.group, count: 0 }
          counts.groups[emp.group].count++
          return
        }

        // OFFICE2 LEVEL: Has office2 but NO group, division, section, or unit
        if (emp.office2) {
          counts.office2[emp.office2] = counts.office2[emp.office2] || {
            name: emp.office2,
            count: 0,
          }
          counts.office2[emp.office2].count++
          return
        }

        // OFFICE LEVEL: Employee has no hierarchy assignments at all
        if (!emp.office2 && !emp.group && !emp.division && !emp.section && !emp.unit) {
          counts.office++
          return
        }
      })

      this.employeeCounts = counts
      return counts
    },

    // Fetch employees for a node (filter from loaded list, no API call after first load)
    async fetchEmployeesByNode(node) {
      this.loading = true
      this.error = null
      this.currentNode = node

      try {
        // Ensure full employee list is loaded
        if (!this.employees || this.employees.length === 0) {
          await this.loadAllEmployees()
        }

        if (!node) {
          this.assignedEmployees = []
          return this.assignedEmployees
        }

        // Filter employees locally based on node type - SHOW AT LOWEST LEVEL
        let filtered = []

        if (node.type === 'unit') {
          // Unit:   Show employees with this unit
          filtered = this.employees.filter((emp) => emp.unit === node.name)
        } else if (node.type === 'section') {
          // Section: Show employees with this section and NO unit
          filtered = this.employees.filter((emp) => emp.section === node.name && !emp.unit)
        } else if (node.type === 'division') {
          // Division: Show employees with this division but NO section or unit
          filtered = this.employees.filter(
            (emp) => emp.division === node.name && !emp.section && !emp.unit,
          )
        } else if (node.type === 'group') {
          // Group:   Show employees with this group but NO division, section, or unit
          filtered = this.employees.filter(
            (emp) => emp.group === node.name && !emp.division && !emp.section && !emp.unit,
          )
        } else if (node.type === 'office2') {
          // Office2: Show employees with this office2 but NO group, division, section, or unit
          filtered = this.employees.filter(
            (emp) =>
              emp.office2 === node.name && !emp.group && !emp.division && !emp.section && !emp.unit,
          )
        } else if (node.type === 'office') {
          // Office: Show employees with NO hierarchy assignments at all
          filtered = this.employees.filter(
            (emp) => !emp.office2 && !emp.group && !emp.division && !emp.section && !emp.unit,
          )
        }

        this.assignedEmployees = filtered.map((emp) => ({
          id: emp.id,
          ControlNo: emp.ControlNo || null,
          name: emp.name,
          position_id: emp.position_id,
          position: emp.position,
          office_id: emp.office_id,
          office: emp.office,
          office2: emp.office2 || null,
          group: emp.group || null,
          division: emp.division || null,
          section: emp.section || null,
          unit: emp.unit || null,
          rank: emp.rank || '',
          selected: emp.selected || false,
        }))

        return this.assignedEmployees
      } catch (error) {
        console.error('Failed to fetch employees by node:', error)
        this.error = error.message || 'Failed to fetch employees'
        this.assignedEmployees = []
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUnassignedEmployees() {
      return this._fetchEmployees({ show_all: false, unassigned_only: true })
    },

    async fetchAllEmployees() {
      return this._fetchEmployees({ show_all: true, unassigned_only: false })
    },

    async _fetchEmployees(params) {
      this.loading = true
      this.error = null
      this.searchedEmployees = []

      try {
        const token = localStorage.getItem('token')
        const userStore = useUserStore()

        const response = await api.get('/employees-by-office', {
          headers: { Authorization: `Bearer ${token}` },
          params,
        })

        if (response.data.success) {
          const employees = response.data.data.map((emp) => ({
            id: emp.id || null,
            ControlNo: emp.ControlNo || null,
            name: emp.name,
            position: typeof emp.position === 'object' ? emp.position.name : emp.position,
            position_id: emp.position_id || null,
            office: emp.office,
            office_id: emp.office_id || userStore.user?.office_id,
            office2: emp.office2 || null,
            group: emp.group || null,
            division: emp.division || null,
            section: emp.section || null,
            unit: emp.unit || null,
            rank: emp.rank || '',
            selected: false,
          }))

          if (params.unassigned_only) {
            this.unassignedEmployees = employees
          } else {
            this.employees = employees
            this.computeCountsFromEmployees()
          }

          this.userOffice = response.data.user_office
          return employees
        }
        throw new Error(response.data.message || 'Failed to fetch employees')
      } catch (error) {
        console.error('Failed to fetch employees:', error)
        this.error = error.message || 'Failed to fetch employees'
        throw error
      } finally {
        this.loading = false
      }
    },

    async addEmployees(payload) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        const positionsResponse = await api.get('/position', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const positions = positionsResponse.data

        const validatedEmployees = payload.employees.map((emp) => {
          const position = positions.find((p) => p.name === emp.position)
          if (!position) {
            throw new Error(`Position "${emp.position}" not found`)
          }
          return {
            ControlNo: emp.ControlNo || '',
            name: emp.name,
            position: emp.position,
            position_id: position.id,
            office_id: emp.office_id,
            office: emp.office,
            office2: emp.office2 || null,
            group: emp.group || null,
            division: emp.division || null,
            section: emp.section || null,
            unit: emp.unit || null,
            rank: emp.rank || 'Employee',
          }
        })

        console.log('Validated Employees Payload:', validatedEmployees)

        const response = await api.post(
          '/add/employee',
          { employees: validatedEmployees },
          { headers: { Authorization: `Bearer ${token}` } },
        )

        if (response.data.success) {
          // Reload the full employee list and recompute counts
          this.employees = []
          await this.loadAllEmployees()

          // Refresh the current node's employees
          if (this.currentNode) {
            await this.fetchEmployeesByNode(this.currentNode)
          }

          return response.data
        }
        throw new Error(response.data.message || 'Failed to add employees')
      } catch (error) {
        console.error('Failed to add employees:', error)
        this.error = error.message || 'Failed to add employees'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateEmployeeRank(employeeId, newRank) {
      try {
        const token = localStorage.getItem('token')
        const response = await api.post(
          `/employees/${employeeId}/rank`,
          { rank: newRank },
          { headers: { Authorization: `Bearer ${token}` } },
        )

        if (response.data.success) {
          const updateEmployee = (empList) => {
            const employee = empList.find((e) => e.id === employeeId)
            if (employee) {
              employee.rank = newRank
            }
          }

          updateEmployee(this.employees)
          updateEmployee(this.assignedEmployees)
          updateEmployee(this.unassignedEmployees)

          return response.data
        }
        throw new Error(response.data.message || 'Failed to update rank')
      } catch (error) {
        console.error('Failed to update employee rank:', error)
        throw error
      }
    },

    async softDeleteEmployee(employeeId) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')
        const response = await api.delete(`/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          this.assignedEmployees = this.assignedEmployees.filter((e) => e.id !== employeeId)
          this.employees = this.employees.filter((e) => e.id !== employeeId)

          // Recompute counts after deletion
          this.computeCountsFromEmployees()

          return response.data
        }
        throw new Error(response.data.message || 'Failed to delete employee')
      } catch (error) {
        console.error('Failed to delete employee:', error)
        this.error = error.message || 'Failed to delete employee'
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchEmployees(searchTerm) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')
        const userStore = useUserStore()

        const response = await api.get('/search-employees', {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: searchTerm, unassigned_only: true },
        })

        if (response.data.success) {
          this.searchedEmployees = response.data.data.map((emp) => ({
            id: emp.id,
            ControlNo: emp.ControlNo || null,
            name: emp.name,
            position: typeof emp.position === 'object' ? emp.position.name : emp.position,
            position_id: emp.position_id || null,
            office: emp.office,
            office_id: emp.office_id || userStore.user?.office_id,
            office2: emp.office2 || null,
            group: emp.group || null,
            division: emp.division || null,
            section: emp.section || null,
            unit: emp.unit || null,
            rank: emp.rank || '',
            selected: false,
          }))
          return this.searchedEmployees
        }
        throw new Error(response.data.message || 'Search failed')
      } catch (error) {
        console.error('Search failed:', error)
        this.error = error.message || 'Search failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearState() {
      this.employees = []
      this.assignedEmployees = []
      this.unassignedEmployees = []
      this.softDeletedEmployees = []
      this.searchedEmployees = []
      this.currentNode = null
      this.error = null
      this.employeeCounts = {
        office: 0,
        office2: {},
        groups: {},
        divisions: {},
        sections: {},
        units: {},
      }
    },
  },
})
