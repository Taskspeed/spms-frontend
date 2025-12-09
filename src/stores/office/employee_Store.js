import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { useUserStore } from '../userStore'

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    employees: [],
    loading: false,
    error: null,
    currentOfficeId: null,
    userOffice: null,
    assignedEmployees: [],
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
    async fetchEmployeeCounts(officeId) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.get('/employee/counts', {
          headers: { Authorization: `Bearer ${token}` },
          params: { office_id: officeId },
        })

        if (response.data.success) {
          const data = response.data.data

          const officeCount = parseInt(data.office) || 0

          const office2Counts = {}
          if (data.office2 && typeof data.office2 === 'object') {
            Object.keys(data.office2).forEach((key) => {
              office2Counts[key] = {
                name: data.office2[key].office2 || key,
                count: parseInt(data.office2[key].count) || 0,
              }
            })
          }

          const groupCounts = {}
          if (data.groups && typeof data.groups === 'object') {
            Object.keys(data.groups).forEach((key) => {
              groupCounts[key] = {
                name: data.groups[key].group || key,
                count: parseInt(data.groups[key].count) || 0,
              }
            })
          }

          const divisionCounts = {}
          if (data.divisions && typeof data.divisions === 'object') {
            Object.keys(data.divisions).forEach((key) => {
              divisionCounts[key] = {
                name: data.divisions[key].division || key,
                count: parseInt(data.divisions[key].count) || 0,
              }
            })
          }

          const sectionCounts = {}
          if (data.sections && typeof data.sections === 'object') {
            Object.keys(data.sections).forEach((key) => {
              sectionCounts[key] = {
                name: data.sections[key].section || key,
                count: parseInt(data.sections[key].count) || 0,
              }
            })
          }

          const unitCounts = {}
          if (data.units && typeof data.units === 'object' && !Array.isArray(data.units)) {
            Object.keys(data.units).forEach((key) => {
              unitCounts[key] = {
                name: data.units[key].unit || key,
                count: parseInt(data.units[key].count) || 0,
              }
            })
          }

          this.employeeCounts = {
            office: officeCount,
            office2: office2Counts,
            groups: groupCounts,
            divisions: divisionCounts,
            sections: sectionCounts,
            units: unitCounts,
          }

          return this.employeeCounts
        }
        throw new Error(response.data.message || 'Failed to fetch employee counts')
      } catch (error) {
        console.error('Failed to fetch employee counts:', error)
        this.error = error.message || 'Failed to fetch employee counts'
        this.employeeCounts = {
          office: 0,
          office2: {},
          groups: {},
          divisions: {},
          sections: {},
          units: {},
        }
        return this.employeeCounts
      } finally {
        this.loading = false
      }
    },

    async fetchEmployeesByNode(node) {
      this.loading = true
      this.error = null
      this.currentNode = node

      try {
        const token = localStorage.getItem('token')
        const userStore = useUserStore()
        const params = { office_id: userStore.user?.office_id }

        if (node) {
          if (node.type === 'office2' && node.name) {
            params.office2 = node.name
          } else if (node.type === 'group' && node.name) {
            params.group = node.name
          } else if (node.type === 'division' && node.name) {
            params.division = node.name
          } else if (node.type === 'section' && node.name) {
            params.section = node.name
          } else if (node.type === 'unit' && node.name) {
            params.unit = node.name
          }
        }

        const response = await api.get('/fetch_employees', {
          headers: { Authorization: `Bearer ${token}` },
          params,
        })

        if (response.data.success) {
          this.assignedEmployees = response.data.data.map((emp) => ({
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
            selected: false,
          }))
          return this.assignedEmployees
        } else {
          throw new Error(response.data.message || 'Failed to fetch employees')
        }
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
            position: emp.position,
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
            ControlNo: emp.ControlNo || null,
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
          if (this.currentNode) {
            await this.fetchEmployeesByNode(this.currentNode)
          } else {
            await this.fetchUnassignedEmployees()
          }
          await this.fetchEmployeeCounts(this.currentOfficeId || useUserStore().user?.office_id)
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

          await this.fetchEmployeeCounts(this.currentOfficeId || useUserStore().user?.office_id)

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
            position: emp.position,
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
