<<<<<<< HEAD
<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h6 class="text-h6 q-mb-xs">User Management</h6>
        <div class="text-caption text-grey-7">Create and manage system users</div>
      </div>
      <q-btn unelevated rounded color="primary" label="Create User" @click="showOfficeModal = true" icon="person_add">
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
      <q-card style="width: 100%; max-width: 50vw;">
        <q-card-section>
          <div class="text-h6">Select Office</div>
          <div class="text-caption text-grey-7">Step 1 of 3</div>
        </q-card-section>
        <q-card-section>
          <p class="text-grey-8 q-mb-md">Select the office where the user will be assigned.</p>

          <q-input v-model="officeSearch" label="Search Office" outlined dense clearable
          @update:model-value="filterOffices" :loading="store.loading">
=======
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="user-management-page">
    <div class="page-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="title-section">
            <h4 class="page-title">User Management</h4>
            <p class="page-subtitle">Create and manage system users</p>
          </div>
          <q-btn
            unelevated
            rounded
            color="primary"
            :label="$q.screen.xs ? '' : 'Create User'"
            :icon="$q.screen.xs ? 'person_add' : 'person_add'"
            @click="showOfficeModal = true"
            class="create-btn"
            :size="$q.screen.xs ? 'md' : 'lg'"
          >
            <q-tooltip>Create a new system user</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-section">
        <q-table
          :rows="store.users"
          :columns="responsiveColumns"
          row-key="id"
          :loading="store.loading"
          :grid="$q.screen.xs"
          :rows-per-page-options="[10, 25, 50]"
          class="user-table"
          flat
          bordered
        >
          <!-- Grid Mode for Mobile -->
          <template v-slot:item="props" v-if="$q.screen.xs">
            <q-card class="user-card q-ma-sm" flat bordered>
              <q-card-section>
                <div class="user-card-header">
                  <div class="user-name">{{ props.row.name }}</div>
                  <q-chip
                    :label="getRoleName(props.row.role_id)"
                    color="primary"
                    text-color="white"
                    size="sm"
                  />
                </div>
                <div class="user-details">
                  <div class="detail-item">
                    <q-icon name="business" size="sm" class="detail-icon" />
                    <span>{{ props.row.office_name }}</span>
                  </div>
                  <div class="detail-item">
                    <q-icon name="calendar_today" size="sm" class="detail-icon" />
                    <span>{{ props.row.datecreated }}</span>
                  </div>
                </div>
              </q-card-section>
              <q-card-actions align="center">
                <q-btn flat round color="info" icon="visibility" @click="viewUser(props.row)" size="sm">
                  <q-tooltip>View User</q-tooltip>
                </q-btn>
                <q-btn flat round color="primary" icon="edit" @click="editUser(props.row)" size="sm">
                  <q-tooltip>Edit User</q-tooltip>
                </q-btn>
                <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row)" size="sm">
                  <q-tooltip>Delete User</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </template>

          <!-- Table Mode for Desktop/Tablet -->
          <template v-slot:body-cell-role="props">
            <q-td :props="props" class="text-center">
              <q-chip
                :label="getRoleName(props.row.role_id)"
                color="primary"
                text-color="white"
                size="sm"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-action="props">
            <q-td :props="props" class="text-center">
              <q-btn-group
                :spread="!$q.screen.lg"
                flat
                class="action-buttons"
              >
                <q-btn
                  flat
                  round
                  color="info"
                  icon="visibility"
                  @click="viewUser(props.row)"
                  :size="$q.screen.sm ? 'sm' : 'md'"
                >
                  <q-tooltip>View User</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="edit"
                  @click="editUser(props.row)"
                  :size="$q.screen.sm ? 'sm' : 'md'"
                >
                  <q-tooltip>Edit User</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  @click="confirmDelete(props.row)"
                  :size="$q.screen.sm ? 'sm' : 'md'"
                >
                  <q-tooltip>Delete User</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Office Selection Modal -->
    <q-dialog
      v-model="showOfficeModal"
      persistent
      transition-show="scale"
      transition-hide="scale"
      :maximized="$q.screen.xs"
    >
      <q-card :style="modalStyle">
        <q-card-section class="modal-header">
          <div class="modal-title">Select Office</div>
          <div class="modal-step">Step 1 of 3</div>
        </q-card-section>

        <q-card-section class="modal-content">
          <p class="modal-description">Select the office where the user will be assigned.</p>

          <q-input
            v-model="store.officeSearch"
            label="Search Office"
            outlined
            dense
            clearable
            @update:model-value="store.filterOffices"
            :loading="store.loading"
            class="search-input"
          >
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

<<<<<<< HEAD
          <q-table :rows="filteredOffices" :columns="officeColumns" row-key="id" :loading="store.loading" virtual-scroll>
            <template v-slot:body="props">
              <!-- <q-tr :props="props" @click="selectedOffice = props.row">
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
              </q-tr> -->
              <q-tr
    :props="props"
    @click="selectedOffice = props.row"
    class="office-row"
    :class="{ 'selected': selectedOffice && selectedOffice.id === props.row.id }"
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
          <q-btn unelevated label="Next" color="primary" @click="openEmployeeModal" :disabled="!selectedOffice"
            :loading="loading">
            <q-tooltip v-if="!selectedOffice">Please select an office to continue</q-tooltip>
=======
          <q-table
            :rows="store.filteredOffices"
            :columns="officeColumns"
            row-key="id"
            :loading="store.loading"
            virtual-scroll
            :hide-header="$q.screen.xs"
            flat
            class="selection-table"
          >
            <template v-slot:body="props">
              <q-tr
                :props="props"
                @click="store.selectedOffice = props.row"
                class="office-row"
                :class="{ 'selected': store.selectedOffice && store.selectedOffice.id === props.row.id }"
              >
                <q-td key="name" :props="props">
                  <div class="office-item">
                    <q-icon name="business" class="office-icon" />
                    <span>{{ props.row.name }}</span>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Next"
            color="primary"
            @click="openEmployeeModal"
            :disabled="!store.selectedOffice"
            :loading="store.loading"
          >
            <q-tooltip v-if="!store.selectedOffice">Please select an office to continue</q-tooltip>
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Employee Selection Modal -->
<<<<<<< HEAD
    <q-dialog v-model="showEmployeeModal" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 50vw;">
        <q-card-section>
          <div class="text-h6">Select Employee</div>
          <div class="text-caption text-grey-7">Step 2 of 3</div>
        </q-card-section>
        <q-card-section>
          <p class="text-grey-8 q-mb-md">Search and select an employee to assign user access.</p>
          <q-input v-model="search" label="Search Employee" outlined dense clearable
            @update:model-value="filterEmployees" :loading="loading">
=======
    <q-dialog
      v-model="showEmployeeModal"
      persistent
      transition-show="scale"
      transition-hide="scale"
      :maximized="$q.screen.xs"
    >
      <q-card :style="modalStyle">
        <q-card-section class="modal-header">
          <div class="modal-title">Select Employee</div>
          <div class="modal-step">Step 2 of 3</div>
        </q-card-section>

        <q-card-section class="modal-content">
          <p class="modal-description">Search and select an employee to assign user access.</p>

          <q-input
            v-model="store.search"
            label="Search Employee"
            outlined
            dense
            clearable
            @update:model-value="store.filterEmployees"
            :loading="store.loading"
            class="search-input"
          >
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

<<<<<<< HEAD
          <!-- <q-table :rows="filteredEmployees" :columns="employeeColumns" row-key="id" :loading="loading" virtual-scroll>
            <template v-slot:body="props">
              <q-tr
                :props="props"
                @click="selectedEmployee = props.row"
                class="employee-row"
                :class="{ 'selected': selectedEmployee && selectedEmployee.id === props.row.id }"
              >
                <q-td key="name4" :props="props">
                  {{ props.row.name4 }}
                </q-td>
                <q-td key="Designation" :props="props">
=======
          <q-table
            :rows="store.filteredEmployees"
            :columns="employeeColumns"
            row-key="id"
            :loading="store.loading"
            virtual-scroll
            :hide-header="$q.screen.xs"
            flat
            class="selection-table"
          >
            <template v-slot:body="props">
              <q-tr
                :props="props"
                @click="store.selectedEmployee = props.row"
                class="employee-row"
                :class="{ 'selected': store.selectedEmployee && store.selectedEmployee.id === props.row.id }"
                :key="props.row.id"
              >
                <q-td key="name4" :props="props">
                  <div class="employee-item">
                    <q-icon name="person" class="employee-icon" />
                    <div class="employee-info">
                      <div class="employee-name">{{ props.row.name4 }}</div>
                      <div class="employee-designation">{{ props.row.Designation }}</div>
                    </div>
                  </div>
                </q-td>
                <q-td key="Designation" :props="props" v-if="!$q.screen.xs">
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
                  {{ props.row.Designation }}
                </q-td>
              </q-tr>
            </template>
<<<<<<< HEAD
          </q-table> -->
          <q-table :rows="filteredEmployees" :columns="employeeColumns" row-key="id" :loading="loading" virtual-scroll>
  <template v-slot:body="props">
    <q-tr
      :props="props"
      @click="selectedEmployee = props.row"
      class="employee-row"
      :class="{ 'selected': selectedEmployee && selectedEmployee.id === props.row.id }"
      :key="props.row.id"
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
          <q-btn unelevated label="Next" color="primary" @click="openRoleModal" :disabled="!selectedEmployee"
            :loading="loading">
            <q-tooltip v-if="!selectedEmployee">Please select an employee to continue</q-tooltip>
=======
          </q-table>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <q-btn flat label="Back" color="grey-7" @click="goBackToOfficeModal" />
          <q-btn
            unelevated
            label="Next"
            color="primary"
            @click="openRoleModal"
            :disabled="!store.selectedEmployee"
            :loading="store.loading"
          >
            <q-tooltip v-if="!store.selectedEmployee">Please select an employee to continue</q-tooltip>
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Role Selection Modal -->
<<<<<<< HEAD
    <q-dialog v-model="showRoleModal" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 50vw;">
        <q-card-section>
          <div class="text-h6">Assign Role</div>
          <div class="text-caption text-grey-7">Step 3 of 3</div>
        </q-card-section>
        <q-card-section>
          <p class="text-grey-8 q-mb-md">Select the appropriate role for this user.</p>
          <q-select v-model="selectedRole" :options="roles" label="Role *" option-label="label"
            :rules="[(val) => !!val || 'Role is required']" :loading="loading">
            <template v-slot:prepend>
              <q-icon name="security" />
            </template>
          </q-select>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Back" color="grey-7" @click="goBackToEmployeeModal" />
          <q-btn unelevated label="Save" color="primary" @click="saveUser" :disabled="!selectedRole" :loading="saving">
            <q-tooltip v-if="!selectedRole">Please select a role to continue</q-tooltip>
=======
    <q-dialog
      v-model="showRoleModal"
      persistent
      transition-show="scale"
      transition-hide="scale"
      :maximized="$q.screen.xs"
    >
      <q-card :style="modalStyle">
        <q-card-section class="modal-header">
          <div class="modal-title">Assign Role</div>
          <div class="modal-step">Step 3 of 3</div>
        </q-card-section>

        <q-card-section class="modal-content">
          <p class="modal-description">Select the appropriate role for this user.</p>

          <q-select
            v-model="store.selectedRole"
            :options="store.roles"
            label="Role *"
            option-label="label"
            :rules="[(val) => !!val || 'Role is required']"
            :loading="store.loading"
            outlined
            class="role-select"
          >
            <template v-slot:prepend>
              <q-icon name="security" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <q-btn flat label="Back" color="grey-7" @click="goBackToEmployeeModal" />
          <q-btn
            unelevated
            label="Save"
            color="primary"
            @click="saveUser"
            :disabled="!store.selectedRole"
            :loading="store.saving"
          >
            <q-tooltip v-if="!store.selectedRole">Please select a role to continue</q-tooltip>
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
<<<<<<< HEAD
    <!-- Role Selection Modal -->

    <q-dialog v-model="showRoleModal" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 50vw;">
        <q-card-section>
          <div class="text-h6">Assign Role</div>
          <div class="text-caption text-grey-7">Step 3 of 3</div>
        </q-card-section>

        <q-card-section>
          <p class="text-grey-8 q-mb-md">Select the appropriate role for this user.</p>
          <q-select v-model="selectedRole" :options="roles" label="Role *" option-label="label"
            :rules="[(val) => !!val || 'Role is required']" :loading="loading">
            <template v-slot:prepend>
              <q-icon name="security" />
            </template>
          </q-select>

          <!-- Permissions Checklist -->
          <!-- <div class="q-mt-lg">
            <div class="text-subtitle2 q-mb-sm">Permissions</div>
            <q-option-group v-model="selectedPermissions" :options="permissions" type="checkbox" color="primary" />
          </div> -->
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Back" color="grey-7" @click="goBackToEmployeeModal" />
          <q-btn unelevated label="Save" color="primary" @click="saveUser" :disabled="!selectedRole" :loading="saving">
            <q-tooltip v-if="!selectedRole">Please select a role to continue</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>


    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmation" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 50vw;">
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
=======

    <!-- Confirmation Dialog -->
    <q-dialog
      v-model="showConfirmation"
      persistent
      transition-show="scale"
      transition-hide="scale"
      :maximized="$q.screen.xs"
    >
      <q-card :style="modalStyle">
        <q-card-section class="modal-header">
          <div class="modal-title">Confirm User Creation</div>
        </q-card-section>

        <q-card-section class="modal-content">
          <p class="modal-description">Please review the details before creating the user.</p>

          <div class="confirmation-details">
            <q-card flat bordered class="detail-card">
              <q-card-section>
                <div class="detail-row">
                  <q-icon name="business" class="detail-icon" />
                  <div>
                    <div class="detail-label">Office</div>
                    <div class="detail-value">{{ store.selectedOffice?.name }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="detail-card">
              <q-card-section>
                <div class="detail-row">
                  <q-icon name="person" class="detail-icon" />
                  <div>
                    <div class="detail-label">Employee</div>
                    <div class="detail-value">{{ store.selectedEmployee?.name4 }}</div>
                    <div class="detail-subtitle">{{ store.selectedEmployee?.Designation }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="detail-card">
              <q-card-section>
                <div class="detail-row">
                  <q-icon name="security" class="detail-icon" />
                  <div>
                    <div class="detail-label">Role</div>
                    <div class="detail-value">{{ store.selectedRole?.label }}</div>
                    <div class="detail-subtitle">{{ store.selectedRole?.description }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <q-btn flat label="Back" color="grey-7" @click="showConfirmation = false" />
          <q-btn
            unelevated
            label="Confirm"
            color="primary"
            @click="confirmSave"
            :loading="store.saving"
          >
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
            <q-tooltip>Create user with selected details</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

<<<<<<< HEAD
 <!-- Add new View User Modal -->
 <q-dialog v-model="showViewModal">
      <q-card style="width: 100%; max-width: 50vw;">
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
            <!-- <div class="col-12">
              <div class="text-weight-medium">Permissions:</div>
              <div>
                <q-chip v-for="perm in selectedUser?.permissions"
                       :key="perm"
                       color="primary"
                       text-color="white"
                       small>
                  {{ perm }}
                </q-chip>
              </div>
            </div> -->
          </div>
        </q-card-section>
        <q-card-actions align="right">
=======
    <!-- View User Modal -->
    <q-dialog
      v-model="showViewModal"
      :maximized="$q.screen.xs"
    >
      <q-card :style="modalStyle">
        <q-card-section class="modal-header">
          <div class="modal-title">User Details</div>
        </q-card-section>

        <q-card-section class="modal-content">
          <div class="user-details-grid">
            <q-card flat bordered class="detail-card">
              <q-card-section>
                <div class="detail-row">
                  <q-icon name="person" class="detail-icon" />
                  <div>
                    <div class="detail-label">Name</div>
                    <div class="detail-value">{{ selectedUser?.name }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="detail-card">
              <q-card-section>
                <div class="detail-row">
                  <q-icon name="business" class="detail-icon" />
                  <div>
                    <div class="detail-label">Office</div>
                    <div class="detail-value">{{ selectedUser?.office_name }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="detail-card">
              <q-card-section>
                <div class="detail-row">
                  <q-icon name="security" class="detail-icon" />
                  <div>
                    <div class="detail-label">Role</div>
                    <div class="detail-value">{{ getRoleName(selectedUser?.role_id) }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions">
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

<<<<<<< HEAD
     <!-- Add Delete Confirmation Dialog -->
     <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Delete</div>
        </q-card-section>
        <q-card-section>
          Are you sure you want to delete this user?
        </q-card-section>
        <q-card-actions align="right">
=======
    <!-- Delete Confirmation Dialog -->
    <q-dialog
      v-model="showDeleteDialog"
      :maximized="$q.screen.xs"
    >
      <q-card :style="deleteModalStyle">
        <q-card-section class="modal-header">
          <div class="modal-title text-negative">
            <q-icon name="warning" class="q-mr-sm" />
            Confirm Delete
          </div>
        </q-card-section>

        <q-card-section class="modal-content">
          <p class="delete-warning">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
        </q-card-section>

        <q-card-actions class="modal-actions">
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
<<<<<<< HEAD

  </q-page>
</template>


<script>
import { ref, onMounted,watch} from 'vue'
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

    // Add these refs that were missing
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
        name: "name4",
        label: "Name",
        field: "name4",
        align: "left",
        sortable: true,
      },
      {
        name: "Designation",
        label: "Designation",
        field: "Designation",
        align: "left",
        sortable: true,
      },
    ]

    const officeColumns = [
      {
        name: "name",
        label: "Office Name",
        field: "name",
        align: "left",
        sortable: true,
      },
    ]

    const columns = [
      { name: "office_name", label: "OFFICES", align: "left", field: "office_name" },
      { name: "name", label: "NAME", align: "center", field: "name" },
      {
        name: "datecreated",
        label: "DATE CREATED",
        align: "center",
        field: "datecreated",
        sortable: true,
      },
      {
        name: 'action',
        label: 'ACTIONS',
        align: 'center',
        field: 'action',
      }
    ]

    const roles = [
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
    ]

    const permissions = [
      { label: 'View Dashboard', value: 'view' },
      { label: 'Edit Users', value: 'edit' },
      { label: 'Manage Roles', value: 'manage_roles' },
      { label: 'Access Reports', value: 'access_reports' }
    ]

    const filterOffices = () => {
      const searchTerm = officeSearch.value?.toLowerCase().trim() || ""
      filteredOffices.value = store.offices.filter((office) =>
        office.name.toLowerCase().includes(searchTerm)
      )
    }

    const filterEmployees = () => {
  if (!store.employees.length) return

  const searchTerm = search.value?.toLowerCase().trim() || ""
  filteredEmployees.value = store.employees.filter(
    (emp) =>
      emp.name4.toLowerCase().includes(searchTerm) ||
      emp.Designation.toLowerCase().includes(searchTerm)
  )
}

    // const openEmployeeModal = () => {
    //   if (selectedOffice.value) {
    //     showOfficeModal.value = false
    //     showEmployeeModal.value = true
    //     search.value = ""
    //     store.fetchEmployees(selectedOffice.value.name)
    //   }
    // }
    const openEmployeeModal = async () => {
  if (selectedOffice.value) {
    loading.value = true
    try {
      await store.fetchEmployees(selectedOffice.value.name)
      filteredEmployees.value = store.employees
      selectedEmployee.value = null // Reset employee selection
      search.value = ""
=======
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useUserManageStore } from 'src/stores/hr_Store/account_manage_Store'

// Quasar and Store
const $q = useQuasar()
const store = useUserManageStore()

// Modal states
const showOfficeModal = ref(false)
const showEmployeeModal = ref(false)
const showRoleModal = ref(false)
const showConfirmation = ref(false)
const showViewModal = ref(false)
const showDeleteDialog = ref(false)
const selectedUser = ref(null)

// Computed styles for responsive modals
const modalStyle = computed(() => {
  if ($q.screen.xs) return {}
  if ($q.screen.sm) return { width: '90vw', maxWidth: '600px' }
  if ($q.screen.md) return { width: '70vw', maxWidth: '800px' }
  return { width: '60vw', maxWidth: '900px' }
})

const deleteModalStyle = computed(() => {
  if ($q.screen.xs) return {}
  return { width: '400px', maxWidth: '90vw' }
})

// Responsive columns
const responsiveColumns = computed(() => {
  const baseColumns = [
    {
      name: "office_name",
      label: "Office",
      align: "left",
      field: "office_name",
      sortable: true,
      style: 'min-width: 150px'
    },
    {
      name: "name",
      label: "Name",
      align: "left",
      field: "name",
      sortable: true,
      style: 'min-width: 150px'
    }
  ]

  if (!$q.screen.xs) {
    baseColumns.push({
      name: "role",
      label: "Role",
      align: "center",
      field: row => getRoleName(row.role_id),
      style: 'min-width: 120px'
    })
  }

  if ($q.screen.sm || $q.screen.md || $q.screen.lg || $q.screen.xl) {
    baseColumns.push({
      name: "datecreated",
      label: "Date Created",
      align: "center",
      field: "datecreated",
      sortable: true,
      style: 'min-width: 120px'
    })
  }

  baseColumns.push({
    name: 'action',
    label: 'Actions',
    align: 'center',
    field: 'action',
    style: 'min-width: 120px'
  })

  return baseColumns
})

// Table columns for modals
const employeeColumns = [
  {
    name: "name4",
    label: "Name",
    field: "name4",
    align: "left",
    sortable: true,
  },
  {
    name: "Designation",
    label: "Designation",
    field: "Designation",
    align: "left",
    sortable: true,
  },
]

const officeColumns = [
  {
    name: "name",
    label: "Office Name",
    field: "name",
    align: "left",
    sortable: true,
  },
]

// Methods (keeping all your existing methods)
const openEmployeeModal = async () => {
  if (store.selectedOffice) {
    store.loading = true
    try {
      await store.fetchEmployees(store.selectedOffice.name)
      store.selectedEmployee = null
      store.search = ""
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
      showOfficeModal.value = false
      showEmployeeModal.value = true
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
<<<<<<< HEAD
      loading.value = false
    }
  }
}
    // const goBackToOfficeModal = () => {
    //   showEmployeeModal.value = false
    //   showOfficeModal.value = true
    //   officeSearch.value = ""
    //   filteredOffices.value = store.offices
    // }
    const goBackToOfficeModal = () => {
  showEmployeeModal.value = false
  showOfficeModal.value = true
  selectedEmployee.value = null // Reset employee selection
  officeSearch.value = ""
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
          password: `emp${selectedEmployee.value.id}`,
          designation: selectedEmployee.value.Designation,
          office_id: selectedOffice.value.id,
          role_id: selectedRole.value.value,
          permissions: selectedPermissions.value
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
      search.value = ""
      officeSearch.value = ""
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
      selectedRole.value = roles.find(role => role.value === user.role_id)
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
      const role = roles.find(r => r.value === roleId)
      return role ? role.label : 'Unknown'
    }

    onMounted(() => {
      store.fetchUserAccounts()
      store.fetchOffices()

    }),


    watch(showOfficeModal, (newValue) => {
  if (newValue) {
    // Reset office search and filter when modal opens
    officeSearch.value = ''
    selectedOffice.value = null
    filterOffices()
  }
})

// Watch for employee modal changes
watch(showEmployeeModal, (newValue) => {
  if (newValue) {
    // Reset employee search and selection when modal opens
    search.value = ''
    selectedEmployee.value = null
    filterEmployees()
  }
})

// Watch for office selection changes
watch(selectedOffice, async (newOffice) => {
  if (newOffice) {
    loading.value = true
    selectedEmployee.value = null // Reset employee selection when office changes
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
      confirmSave
    }
  }
}
</script>
<style scoped>
/* Office styles */
.office-row {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.office-row:hover {
  background-color: #e5e5e6;
}

.office-row.selected {
  background-color: #ce2f2f !important; /* Added !important to ensure override */
}

.office-row.selected td {
  color: white !important;
}

/* Employee styles - Modified to fix selection issue */
.employee-row {
  cursor: pointer;
  transition: background-color 0.3s ease;
  position: relative; /* Added for isolation */
}

/* Only apply hover effect to non-selected rows */
.employee-row:not(.selected):hover {
  background-color: #e5e5e6;
}

/* Modified selected state styles */
.employee-row.selected {
  background-color: #ce2f2f !important; /* Added !important to ensure override */
  z-index: 1; /* Added to ensure selected row stays on top */
}

.employee-row.selected td {
  color: white !important;
}

/* Reset hover effect when row is selected */
.employee-row.selected:hover {
  background-color: #ce2f2f !important;
}

=======
      store.loading = false
    }
  }
}

const goBackToOfficeModal = () => {
  showEmployeeModal.value = false
  showOfficeModal.value = true
  store.selectedEmployee = null
  store.officeSearch = ""
  store.filteredOffices = store.offices
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
  store.saving = true
  try {
    const userData = {
      name: store.selectedEmployee.name4,
      password: `emp${store.selectedEmployee.id}`,
      designation: store.selectedEmployee.Designation,
      office_id: store.selectedOffice.id,
      role_id: store.selectedRole.value,
      permissions: store.selectedPermissions
    }

    const success = await store.createUser(userData)
    if (success) {
      showConfirmation.value = false
      resetForm()
    }
  } finally {
    store.saving = false
  }
}

const resetForm = () => {
  store.resetForm()
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
  store.selectedOffice = { id: user.office_id, name: user.office_name }
  store.selectedRole = store.roles.find(role => role.value === user.role_id)
  store.selectedPermissions = user.permissions || []
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
  const role = store.roles.find(r => r.value === roleId)
  return role ? role.label : 'Unknown'
}

// Watchers (keeping all your existing watchers)
watch(showOfficeModal, (newValue) => {
  if (newValue) {
    store.officeSearch = ''
    store.selectedOffice = null
    store.filterOffices()
  }
})

watch(showEmployeeModal, (newValue) => {
  if (newValue) {
    store.search = ''
    store.selectedEmployee = null
    store.filterEmployees()
  }
})

watch(() => store.selectedOffice, async (newOffice) => {
  if (newOffice) {
    store.loading = true
    store.selectedEmployee = null
    try {
      await store.fetchEmployees(newOffice.name)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      store.loading = false
    }
  } else {
    store.filteredEmployees = []
  }
})

// Lifecycle
onMounted(() => {
  store.fetchUserAccounts()
  store.fetchOffices()
})
</script>

<style scoped>
.user-management-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
}

/* Header Section */
.header-section {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 16px;
}

.title-section {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  color: #1a1a1a;
  font-weight: 600;
}

.page-subtitle {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.create-btn {
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

/* Table Section */
.table-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.user-table {
  border-radius: 12px;
}

/* Mobile Grid Cards */
.user-card {
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  color: #1a1a1a;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.detail-icon {
  color: #999;
}

/* Modal Styles */
.modal-header {
  background: linear-gradient(135deg, #be2020 0%, #be2020 100%);
  color: white;
  padding: 20px 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.modal-step {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.modal-content {
  padding: 24px;
}

.modal-description {
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
}

.modal-actions {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  gap: 8px;
}

/* Search Input */
.search-input {
  margin-bottom: 16px;
}

/* Selection Tables */
.selection-table {
  border-radius: 8px;
  max-height: 300px;
}

.office-row, .employee-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.office-row:hover, .employee-row:hover {
  background-color: #f5f5f5;
}

.office-row.selected, .employee-row.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
}

.office-row.selected td, .employee-row.selected td {
  color: white !important;
}

.office-item, .employee-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.office-icon, .employee-icon {
  color: #999;
}

.employee-info {
  flex: 1;
}

.employee-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.employee-designation {
  font-size: 12px;
  color: #666;
}

.office-row.selected .office-icon,
.employee-row.selected .employee-icon,
.employee-row.selected .employee-designation {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* Role Select */
.role-select {
  margin-bottom: 16px;
}

/* Confirmation Details */
.confirmation-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-card {
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.detail-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-row .detail-icon {
  color: #667eea;
  margin-top: 2px;
}

.detail-label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.detail-value {
  font-weight: 500;
  color: #1a1a1a;
  font-size: 14px;
}

.detail-subtitle {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

/* User Details Grid */
.user-details-grid {
  display: grid;
  gap: 16px;
}

/* Delete Warning */
.delete-warning {
  color: #666;
  font-size: 14px;
  text-align: center;
  margin: 16px 0;
}

/* Action Buttons */
.action-buttons {
  gap: 4px;
}

/* Responsive Breakpoints */
@media (max-width: 599px) {
  .page-container {
    padding: 8px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }

  .title-section {
    text-align: center;
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .modal-content {
    padding: 16px;
  }

  .modal-actions {
    padding: 12px 16px;
  }
}

@media (min-width: 600px) and (max-width: 1023px) {
  .header-content {
    padding: 20px;
  }
}

@media (min-width: 1024px) {
  .page-container {
    padding: 24px;
  }

  .header-content {
    padding: 32px;
  }

  .confirmation-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .confirmation-details .detail-card:last-child {
    grid-column: 1 / -1;
  }

  .user-details-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
</style>
