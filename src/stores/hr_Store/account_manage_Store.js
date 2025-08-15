import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import { ref } from 'vue'
export const useUserManageStore = defineStore('userManage', () => {
  // State
  const users = ref([])
  const offices = ref([])
  const employees = ref([])
  const filteredOffices = ref([])
  const filteredEmployees = ref([])
  const selectedOffice = ref(null)
  const selectedEmployee = ref(null)
  const selectedRole = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const search = ref('')
  const officeSearch = ref('')
  const selectedPermissions = ref([])

  const roles = ref([
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
  ])

  const permissions = ref([
    { label: 'View Dashboard', value: 'view_dashboard' },
    { label: 'Edit Users', value: 'edit_users' },
    { label: 'Manage Roles', value: 'manage_roles' },
    { label: 'Access Reports', value: 'access_reports' }
  ])

  // Actions
  const fetchUserAccounts = async () => {
    loading.value = true
    try {
      const response = await api.get("/user_account")
      if (Array.isArray(response.data)) {
        users.value = response.data
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
      loading.value = false
    }
  }

  const fetchOffices = async () => {
    loading.value = true
    try {
      const response = await api.get("/fetch_office")
      offices.value = response.data
      filteredOffices.value = response.data
    } catch (error) {
      console.error("Error fetching offices:", error)
      Notify.create({
        message: "Failed to fetch offices. Please try again.",
        color: "negative",
      })
    } finally {
      loading.value = false
    }
  }

  const fetchEmployees = async (officeName = null) => {
    loading.value = true
    try {
      let url = "/employee/designation"
      if (officeName) {
        url += `?office_name=${encodeURIComponent(officeName)}`
      }
      const response = await api.get(url)
      employees.value = response.data
      filteredEmployees.value = response.data
    } catch (error) {
      console.error("Error fetching employees:", error)
      Notify.create({
        message: "Failed to fetch employees. Please try again.",
        color: "negative",
      })
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData) => {
    saving.value = true
    try {
      const response = await api.post("/user_assign", userData)
      if (response.data) {
        Notify.create({
          message: "User has been created successfully!",
          color: "positive",
          position: "top",
          timeout: 2500,
        })
        await fetchUserAccounts()
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
      saving.value = false
    }
  }

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/user_assign/${userId}`)
      await fetchUserAccounts()
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
  }

  const updateUser = async (userId, userData) => {
    try {
      await api.put(`/user_assign/${userId}`, userData)
      await fetchUserAccounts()
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
  }

  const filterOffices = () => {
    const searchTerm = officeSearch.value?.toLowerCase().trim() || ""
    filteredOffices.value = offices.value.filter((office) =>
      office.name.toLowerCase().includes(searchTerm)
    )
  }

  const filterEmployees = () => {
    const searchTerm = search.value?.toLowerCase().trim() || ""
    filteredEmployees.value = employees.value.filter(
      (emp) =>
        emp.name4.toLowerCase().includes(searchTerm) ||
        emp.Designation.toLowerCase().includes(searchTerm)
    )
  }

  const resetForm = () => {
    selectedOffice.value = null
    selectedEmployee.value = null
    selectedRole.value = null
    search.value = ""
    officeSearch.value = ""
    filteredOffices.value = offices.value
    filteredEmployees.value = employees.value
    selectedPermissions.value = []
  }

  return {
    // State
    users,
    offices,
    employees,
    filteredOffices,
    filteredEmployees,
    selectedOffice,
    selectedEmployee,
    selectedRole,
    loading,
    saving,
    search,
    officeSearch,
    roles,
    permissions,
    selectedPermissions,

    // Actions
    fetchUserAccounts,
    fetchOffices,
    fetchEmployees,
    createUser,
    deleteUser,
    updateUser,
    filterOffices,
    filterEmployees,
    resetForm
  }
})
