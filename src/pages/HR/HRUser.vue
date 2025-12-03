<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h6 class="text-h6 q-mb-xs">User Management</h6>
        <div class="text-caption text-grey-7">Create and manage system users</div>
      </div>
      <q-btn
        unelevated
        rounded
        color="primary"
        label="Create User"
        @click="showOfficeModal = true"
        icon="person_add"
      >
        <q-tooltip>Create a new system user</q-tooltip>
      </q-btn>
    </div>

    <q-table :rows="store.users" :columns="columns" row-key="id" :loading="store.loading">
      <template v-slot:body-cell-action="props">
        <q-td :props="props" class="text-center">
          <q-btn-group spread flat>
            <q-btn flat round color="info" icon="visibility" @click="viewUser(props.row)">
              <q-tooltip>View User</q-tooltip>
            </q-btn>
            <q-btn flat round color="primary" icon="edit" @click="editUser(props.row)">
              <q-tooltip>Edit User</q-tooltip>
            </q-btn>
            <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row)">
              <q-tooltip>Delete User</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Office Selection Modal -->
    <q-dialog v-model="showOfficeModal" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 50vw">
        <q-card-section>
          <div class="text-h6">Select Office</div>
          <div class="text-caption text-grey-7">Step 1 of 3</div>
        </q-card-section>
        <q-card-section>
          <p class="text-grey-8 q-mb-md">Select the office where the user will be assigned.</p>

          <q-input
            v-model="officeSearch"
            label="Search Office"
            outlined
            dense
            clearable
            @update:model-value="filterOffices"
            :loading="store.loading"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-table
            :rows="filteredOffices"
            :columns="officeColumns"
            row-key="id"
            :loading="store.loading"
            virtual-scroll
          >
            <template v-slot:body="props">
              <q-tr
                :props="props"
                @click="selectOffice(props.row)"
                class="office-row"
                :class="{ selected: isOfficeSelected(props.row) }"
              >
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Next"
            color="primary"
            @click="openEmployeeModal"
            :disabled="!selectedOffice"
            :loading="loading"
          >
            <q-tooltip v-if="!selectedOffice">Please select an office to continue</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Employee Selection Modal -->
    <q-dialog
      v-model="showEmployeeModal"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 100%; max-width: 50vw">
        <q-card-section>
          <div class="text-h6">Select Employee</div>
          <div class="text-caption text-grey-7">Step 2 of 3</div>
        </q-card-section>
        <q-card-section>
          <p class="text-grey-8 q-mb-md">Search and select an employee to assign user access.</p>
          <q-input
            v-model="search"
            label="Search Employee"
            outlined
            dense
            clearable
            @update:model-value="filterEmployees"
            :loading="loading"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-table
            :rows="filteredEmployees"
            :columns="employeeColumns"
            row-key="ControlNo"
            :loading="loading"
            virtual-scroll
          >
            <template v-slot:body="props">
              <q-tr
                :props="props"
                @click="selectEmployee(props.row)"
                class="employee-row"
                :class="{ selected: isEmployeeSelected(props.row) }"
              >
                <q-td key="name4" :props="props">
                  {{ props.row.name4 }}
                </q-td>
                <q-td key="Designation" :props="props">
                  {{ props.row.Designation }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Back" color="grey-7" @click="goBackToOfficeModal" />
          <q-btn
            unelevated
            label="Next"
            color="primary"
            @click="openRoleModal"
            :disabled="!selectedEmployee"
            :loading="loading"
          >
            <q-tooltip v-if="!selectedEmployee">Please select an employee to continue</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Role Selection Modal -->
    <q-dialog v-model="showRoleModal" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 50vw">
        <q-card-section>
          <div class="text-h6">Assign Role</div>
          <div class="text-caption text-grey-7">Step 3 of 3</div>
        </q-card-section>
        <q-card-section>
          <p class="text-grey-8 q-mb-md">Select the appropriate role for this user.</p>
          <q-select
            v-model="selectedRole"
            :options="roles"
            label="Role *"
            option-label="label"
            :rules="[(val) => !!val || 'Role is required']"
            :loading="loading"
          >
            <template v-slot:prepend>
              <q-icon name="security" />
            </template>
          </q-select>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Back" color="grey-7" @click="goBackToEmployeeModal" />
          <q-btn
            unelevated
            label="Save"
            color="primary"
            @click="saveUser"
            :disabled="!selectedRole"
            :loading="saving"
          >
            <q-tooltip v-if="!selectedRole">Please select a role to continue</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmation" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 50vw">
        <q-card-section>
          <div class="text-h6">Confirm User Creation</div>
        </q-card-section>
        <q-card-section>
          <p class="text-grey-8 q-mb-md">Please review the details before creating the user.</p>
          <div>
            <div class="q-mb-md">
              <div class="text-weight-medium">Office:</div>
              <div>{{ selectedOffice?.name }}</div>
            </div>
            <div class="q-mb-md">
              <div class="text-weight-medium">Employee:</div>
              <div>{{ selectedEmployee?.name4 }}</div>
              <div class="text-caption">{{ selectedEmployee?.Designation }}</div>
            </div>
            <div>
              <div class="text-weight-medium">Role:</div>
              <div>{{ selectedRole?.label }}</div>
              <div class="text-caption">{{ selectedRole?.description }}</div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Back" color="grey-7" @click="showConfirmation = false" />
          <q-btn unelevated label="Confirm" color="primary" @click="confirmSave" :loading="saving">
            <q-tooltip>Create user with selected details</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- View User Modal -->
    <q-dialog v-model="showViewModal">
      <q-card style="width: 100%; max-width: 50vw">
        <q-card-section>
          <div class="text-h6">User Details</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="text-weight-medium">Name:</div>
              <div>{{ selectedUser?.name }}</div>
            </div>
            <div class="col-12">
              <div class="text-weight-medium">Office:</div>
              <div>{{ selectedUser?.office_name }}</div>
            </div>
            <div class="col-12">
              <div class="text-weight-medium">Role:</div>
              <div>{{ getRoleName(selectedUser?.role_id) }}</div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Delete</div>
        </q-card-section>
        <q-card-section> Are you sure you want to delete this user? </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useUserManageStore } from 'src/stores/hr_Store/account_manage_Store'

export default {
  name: 'UserPage',

  setup() {
    const store = useUserManageStore()
    const showOfficeModal = ref(false)
    const showEmployeeModal = ref(false)
    const showRoleModal = ref(false)
    const showConfirmation = ref(false)
    const showViewModal = ref(false)
    const showDeleteDialog = ref(false)
    const selectedUser = ref(null)

    const loading = ref(false)
    const saving = ref(false)
    const selectedOffice = ref(null)
    const selectedEmployee = ref(null)
    const selectedRole = ref(null)
    const selectedPermissions = ref([])
    const search = ref('')
    const officeSearch = ref('')
    const filteredOffices = ref([])
    const filteredEmployees = ref([])

    const employeeColumns = [
      {
        name: 'name4',
        label: 'Name',
        field: 'name4',
        align: 'left',
        sortable: true,
      },
      {
        name: 'Designation',
        label: 'Designation',
        field: 'Designation',
        align: 'left',
        sortable: true,
      },
    ]

    const officeColumns = [
      {
        name: 'name',
        label: 'Office Name',
        field: 'name',
        align: 'left',
        sortable: true,
      },
    ]

    const columns = [
      { name: 'office_name', label: 'OFFICES', align: 'left', field: 'office_name' },
      { name: 'name', label: 'NAME', align: 'center', field: 'name' },
      {
        name: 'datecreated',
        label: 'DATE CREATED',
        align: 'center',
        field: 'datecreated',
        sortable: true,
      },
      {
        name: 'action',
        label: 'ACTIONS',
        align: 'center',
        field: 'action',
      },
    ]

    const roles = [
      {
        label: 'Office-Admin',
        value: 1,
        description: 'Can manage office-specific settings and users',
      },
      {
        label: 'Planning-Admin',
        value: 2,
        description: 'Can manage planning-related functions and users',
      },
      {
        label: 'Hr-Admin',
        value: 3,
        description: 'Create Account and can manage the system',
      },
    ]

    const permissions = [
      { label: 'View Dashboard', value: 'view' },
      { label: 'Edit Users', value: 'edit' },
      { label: 'Manage Roles', value: 'manage_roles' },
      { label: 'Access Reports', value: 'access_reports' },
    ]

    // Selection helper functions for Office
    const selectOffice = (row) => {
      selectedOffice.value = { ...row }
    }

    const isOfficeSelected = (row) => {
      if (!selectedOffice.value || !row) return false
      return selectedOffice.value.id === row.id
    }

    // Selection helper functions for Employee - using ControlNo as unique identifier
    const selectEmployee = (row) => {
      selectedEmployee.value = { ...row }
    }

    const isEmployeeSelected = (row) => {
      if (!selectedEmployee.value || !row) return false
      // Use ControlNo as the unique identifier since employees don't have 'id' field
      return selectedEmployee.value.ControlNo === row.ControlNo
    }

    const filterOffices = () => {
      const searchTerm = officeSearch.value?.toLowerCase().trim() || ''
      filteredOffices.value = store.offices.filter((office) =>
        office.name.toLowerCase().includes(searchTerm),
      )
    }

    const filterEmployees = () => {
      if (!store.employees.length) return

      const searchTerm = search.value?.toLowerCase().trim() || ''
      filteredEmployees.value = store.employees.filter(
        (emp) =>
          emp.name4.toLowerCase().includes(searchTerm) ||
          emp.Designation.toLowerCase().includes(searchTerm),
      )
    }

    const openEmployeeModal = async () => {
      if (selectedOffice.value) {
        loading.value = true
        try {
          await store.fetchEmployees(selectedOffice.value.name)
          filteredEmployees.value = store.employees
          selectedEmployee.value = null
          search.value = ''
          showOfficeModal.value = false
          showEmployeeModal.value = true
        } catch (error) {
          console.error('Error fetching employees:', error)
        } finally {
          loading.value = false
        }
      }
    }

    const goBackToOfficeModal = () => {
      showEmployeeModal.value = false
      showOfficeModal.value = true
      selectedEmployee.value = null
      officeSearch.value = ''
      filteredOffices.value = store.offices
    }

    const goBackToEmployeeModal = () => {
      showRoleModal.value = false
      showEmployeeModal.value = true
    }

    const openRoleModal = () => {
      showEmployeeModal.value = false
      showRoleModal.value = true
    }

    const saveUser = () => {
      showRoleModal.value = false
      showConfirmation.value = true
    }

    const confirmSave = async () => {
      saving.value = true
      try {
        const userData = {
          name: selectedEmployee.value.name4,
          password: `emp${selectedEmployee.value.ControlNo}`,
          designation: selectedEmployee.value.Designation,
          office_id: selectedOffice.value.id,
          role_id: selectedRole.value.value,
          permissions: selectedPermissions.value,
          control_no: selectedEmployee.value.ControlNo,
        }

        const success = await store.createUser(userData)
        if (success) {
          showConfirmation.value = false
          resetForm()
        }
      } finally {
        saving.value = false
      }
    }

    const resetForm = () => {
      selectedOffice.value = null
      selectedEmployee.value = null
      selectedRole.value = null
      selectedPermissions.value = []
      search.value = ''
      officeSearch.value = ''
      filteredOffices.value = store.offices
      filteredEmployees.value = store.employees
      showOfficeModal.value = false
      showEmployeeModal.value = false
      showRoleModal.value = false
      showConfirmation.value = false
    }

    const viewUser = (user) => {
      selectedUser.value = user
      showViewModal.value = true
    }

    const editUser = (user) => {
      selectedUser.value = user
      selectedOffice.value = { id: user.office_id, name: user.office_name }
      selectedRole.value = roles.find((role) => role.value === user.role_id)
      selectedPermissions.value = user.permissions || []
      showRoleModal.value = true
    }

    const confirmDelete = (user) => {
      selectedUser.value = user
      showDeleteDialog.value = true
    }

    const deleteUser = async () => {
      await store.deleteUser(selectedUser.value.id)
      showDeleteDialog.value = false
      selectedUser.value = null
    }

    const getRoleName = (roleId) => {
      const role = roles.find((r) => r.value === roleId)
      return role ? role.label : 'Unknown'
    }

    onMounted(() => {
      store.fetchUserAccounts()
      store.fetchOffices()
    })

    watch(showOfficeModal, (newValue) => {
      if (newValue) {
        officeSearch.value = ''
        selectedOffice.value = null
        filterOffices()
      }
    })

    watch(showEmployeeModal, (newValue) => {
      if (newValue) {
        search.value = ''
        selectedEmployee.value = null
        filterEmployees()
      }
    })

    watch(selectedOffice, async (newOffice) => {
      if (newOffice) {
        loading.value = true
        selectedEmployee.value = null
        try {
          await store.fetchEmployees(newOffice.name)
          filteredEmployees.value = store.employees
        } catch (error) {
          console.error('Error fetching employees:', error)
        } finally {
          loading.value = false
        }
      } else {
        filteredEmployees.value = []
      }
    })

    return {
      store,
      showOfficeModal,
      showEmployeeModal,
      showRoleModal,
      showConfirmation,
      showViewModal,
      showDeleteDialog,
      selectedUser,
      selectedOffice,
      selectedEmployee,
      selectedRole,
      selectedPermissions,
      loading,
      saving,
      search,
      officeSearch,
      filteredOffices,
      filteredEmployees,
      columns,
      employeeColumns,
      officeColumns,
      roles,
      permissions,
      viewUser,
      editUser,
      confirmDelete,
      deleteUser,
      getRoleName,
      filterOffices,
      filterEmployees,
      openEmployeeModal,
      goBackToOfficeModal,
      goBackToEmployeeModal,
      openRoleModal,
      saveUser,
      confirmSave,
      selectOffice,
      isOfficeSelected,
      selectEmployee,
      isEmployeeSelected,
    }
  },
}
</script>

<style scoped>
/* Office styles */
.office-row {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.office-row:hover:not(.selected) {
  background-color: #e5e5e6;
}

.office-row.selected {
  background-color: #ce2f2f !important;
}

.office-row.selected td {
  color: white !important;
}

/* Employee styles */
.employee-row {
  cursor: pointer;
  transition: background-color 0 3s ease;
}

.employee-row:hover:not(.selected) {
  background-color: #e5e5e6;
}

.employee-row.selected {
  background-color: #ce2f2f !important;
}

.employee-row.selected td {
  color: white !important;
}
</style>
