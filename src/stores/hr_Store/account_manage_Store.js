import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

export const useUserManageStore = defineStore('userManage', {
  state: () => ({
    users: [],
    offices: [],
    employees: [],
    filteredOffices: [],
    filteredEmployees: [],
    selectedOffice: null,
    selectedEmployee: null,
    selectedRole: null,
    loading: false,
    saving: false,
    search: '',
    officeSearch: '',
    roles: [
      {
        label: "Office-Admin",
        value: 1,
        description: "Can manage office-specific settings and users",
      },
      {
        label: "Planning-Admin",
        value: 2,
        description: "Can manage planning-related functions and users",
      },
      {
        label: "Hr-Admin",
        value: 3,
        description: "Create Account and can manage the system",
      },
    ],
    permissions: [
      { label: 'View Dashboard', value: 'view_dashboard' },
      { label: 'Edit Users', value: 'edit_users' },
      { label: 'Manage Roles', value: 'manage_roles' },
      { label: 'Access Reports', value: 'access_reports' }
    ],
    selectedPermissions: []
  }),

  actions: {
    async fetchUserAccounts() {
      this.loading = true
      try {
        const response = await api.get("/user_account")
        if (Array.isArray(response.data)) {
          this.users = response.data
        } else {
          throw new Error('Invalid data format received')
        }
      } catch (error) {
        console.error("Error fetching user accounts:", error)
        Notify.create({
          message: "Failed to fetch user accounts. Please try again.",
          color: "negative",
        })
      } finally {
        this.loading = false
      }
    },

    async fetchOffices() {
      this.loading = true
      try {
        const response = await api.get("/fetch_office")
        this.offices = response.data
        this.filteredOffices = response.data
      } catch (error) {
        console.error("Error fetching offices:", error)
        Notify.create({
          message: "Failed to fetch offices. Please try again.",
          color: "negative",
        })
      } finally {
        this.loading = false
      }
    },

    async fetchEmployees(officeName = null) {
      this.loading = true
      try {
        let url = "/employee/designation"
        if (officeName) {
          url += `?office_name=${encodeURIComponent(officeName)}`
        }
        const response = await api.get(url)
        this.employees = response.data
        this.filteredEmployees = response.data
      } catch (error) {
        console.error("Error fetching employees:", error)
        Notify.create({
          message: "Failed to fetch employees. Please try again.",
          color: "negative",
        })
      } finally {
        this.loading = false
      }
    },

    async createUser(userData) {
      this.saving = true
      try {
        const response = await api.post("/user_assign", userData)
        if (response.data) {
          Notify.create({
            message: "User has been created successfully!",
            color: "positive",
            position: "top",
            timeout: 2500,
          })
          await this.fetchUserAccounts()
          return true
        }
        return false
      } catch (error) {
        console.error("Error in user creation:", error)
        Notify.create({
          message: "Error creating user. Please try again.",
          color: "negative",
          position: "top",
          timeout: 2500,
        })
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteUser(userId) {
      try {
        await api.delete(`/user_assign/${userId}`)
        await this.fetchUserAccounts()
        Notify.create({
          message: "User deleted successfully",
          color: "positive",
          position: "top",
        })
      } catch (error) {
        console.error("Error deleting user:", error)
        Notify.create({
          message: "Failed to delete user",
          color: "negative",
          position: "top",
        })
      }
    },

    async updateUser(userId, userData) {
      try {
        await api.put(`/user_assign/${userId}`, userData)
        await this.fetchUserAccounts()
        Notify.create({
          message: "User updated successfully",
          color: "positive",
          position: "top",
        })
        return true
      } catch (error) {
        console.error("Error updating user:", error)
        Notify.create({
          message: "Failed to update user",
          color: "negative",
          position: "top",
        })
        return false
      }
    },

    filterOffices() {
      const searchTerm = this.officeSearch?.toLowerCase().trim() || ""
      this.filteredOffices = this.offices.filter((office) =>
        office.name.toLowerCase().includes(searchTerm)
      )
    },

    filterEmployees() {
      const searchTerm = this.search?.toLowerCase().trim() || ""
      this.filteredEmployees = this.employees.filter(
        (emp) =>
          emp.name4.toLowerCase().includes(searchTerm) ||
          emp.Designation.toLowerCase().includes(searchTerm)
      )
    },

    resetForm() {
      this.selectedOffice = null
      this.selectedEmployee = null
      this.selectedRole = null
      this.search = ""
      this.officeSearch = ""
      this.filteredOffices = this.offices
      this.filteredEmployees = this.employees
      this.selectedPermissions = []
    }
  }
})
