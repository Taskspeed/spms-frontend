<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page padding class="q-pa-md">
        <div class="row items-center justify-between q-mb-lg">
          <div class="row q-gutter-sm"></div>
        </div>
        <div class="row q-mb-lg">
          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="col-12 col-md-6 q-mb-sm">
                  <div class="row q-gutter-sm items-center">
                    <q-select
                      v-model="selectedSemester"
                      :options="availableSemesters"
                      label="Semester"
                      outlined
                      dense
                      emit-value
                      map-options
                      @update:model-value="onSemesterChange"

                      class="col"
                    >
                      <template v-slot:prepend>
                        <q-icon name="calendar_view_month" size="xs" />
                      </template>
                    </q-select>

                    <q-select
                      v-model="selectedYear"
                      :options="availableYears"
                      label="Year"
                      outlined
                      dense
                      emit-value
                      map-options
                      @update:model-value="onYearChange"
                      class="col"

                    >
                      <template v-slot:prepend>
                        <q-icon name="event" size="xs" />
                      </template>
                    </q-select>
                  </div>
                </div>
                <!-- Office Dropdown -->
                <div class="row q-mb-md">
                  <q-select
                    dense
                    outlined
                    v-model="selectedOffice"
                    :options="filteredOfficeOptions"
                    option-label="name"
                    emit-value
                    map-options
                    label="Select Office"
                    class="full-width office-select"
                    color="red-10"
                    use-input
                    hide-selected
                    fill-input
                    clearable
                    input-debounce="300"
                    @filter="filterOffices"
                    @update:model-value="onOfficeChange"
                    :loading="userManageStore.loading"
                  >
                    <template v-slot:prepend>
                      <q-icon name="business" />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey"> No offices found </q-item-section>
                      </q-item>
                    </template>
                    <template v-slot:selected-item="scope">
                      <div class="selected-office-name" v-if="scope.opt">
                        {{ scope.opt.name || 'Select Office' }}
                      </div>
                    </template>
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label class="office-option-label">{{
                            scope.opt.name
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <!-- Organization Tree Search -->
                <div class="row q-mb-sm">
                  <q-input
                    dense
                    outlined
                    v-model="treeFilter"
                    placeholder="Search organization..."
                    class="full-width"
                    :disable="!selectedOffice"
                  >
                    <template v-slot:append><q-icon name="search" /></template>
                  </q-input>
                </div>
                <!-- No Office Selected Message -->
                <div v-if="!selectedOffice" class="text-center q-pa-lg">
                  <q-icon name="business" size="3rem" color="grey-5" />
                  <div class="text-grey-7 q-mt-sm">
                    Please select an office to view the organization structure
                  </div>
                </div>
                <!-- Organization Tree -->
                <q-tree
                  v-else
                  :nodes="organizationTree"
                  node-key="id"
                  v-model:selected="selectedNodeId"
                  :filter="treeFilter"
                  :filter-method="filterMethod"
                  default-expand-all
                  @update:selected="onNodeSelect"
                  :loading="orgStore.loading"
                  class="org-tree"
                >
                  <template v-slot:default-header="scope">
                    <div class="row items-center no-wrap full-width">
                      <q-icon
                        :name="getNodeIcon(scope.node)"
                        :color="getNodeColor(scope.node)"
                        size="sm"
                        class="q-mr-sm tree-icon"
                      />
                      <div class="column tree-label full-width">
                        <div class="row items-center">
                          <div class="node-label">
                            {{ scope.node.label }}
                          </div>
                          <q-badge
                            v-if="scope.node.type === 'employee' && isHeadRank(scope.node.rank)"
                            color="green"
                            class="q-ml-sm"
                          >
                            {{ scope.node.rank }}
                          </q-badge>
                        </div>
                        <div class="text-caption text-grey-7" v-if="scope.node.position">
                          {{ scope.node.position }}
                        </div>
                      </div>
                    </div>
                  </template>
                </q-tree>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-8">
            <q-card flat bordered>
              <q-card-section>
                <div class="row items-center justify-between q-mb-md" v-if="selectedNode">
                  <div class="office-title">{{ selectedNode.label }}</div>
                  <div class="row q-gutter-sm button-container">
                    <q-btn
                      class="neu-button-rect"
                      flat
                      size="sm"
                      color="green"
                      icon="person_add"
                      label="Create UWP"
                      @click="createUnitWorkPlan"
                    >
                      <q-tooltip>Create Unit Work Plan</q-tooltip>
                    </q-btn>

                    <q-btn
                      class="neu-button-rect"
                      flat
                      size="sm"
                      color="primary"
                      label="Preview UWP"
                      icon="print"
                      @click="showUnitWorkPlanModal"
                    />
                  </div>
                </div>
                <!-- No Office Selected Message for Table -->
                <div v-if="!selectedOffice" class="text-center q-pa-xl">
                  <q-icon name="folder_open" size="4rem" color="grey-5" />
                  <div class="text-h6 text-grey-7 q-mt-md">No Office Selected</div>
                  <div class="text-grey-6 q-mt-sm">
                    Select an office from the dropdown to view employees
                  </div>
                </div>
                <template v-else>
                  <div class="row q-mb-md">
                    <q-input
                      dense
                      outlined
                      v-model="employeeFilter"
                      placeholder="Search employees..."
                      class="full-width"
                    >
                      <template v-slot:append><q-icon name="search" /></template>
                    </q-input>
                  </div>
                  <q-table
                    :rows="filteredEmployees"
                    :columns="columns"
                    row-key="id"
                    flat
                    bordered
                    class="clean-table"
                    :pagination="{ rowsPerPage: 10 }"
                    :loading="loading"
                    :filter="employeeFilter"
                  >
                    <template v-slot:body="props">
                      <q-tr :props="props">
                        <q-td key="name" :props="props">
                          <div class="row items-center no-wrap full-width">
                            <q-icon
                              :name="props.row.isHead ? 'supervisor_account' : 'person'"
                              :color="props.row.isHead ? 'blue' : 'grey'"
                              size="sm"
                              class="q-mr-sm flex-shrink-0"
                            />
                            <div class="employee-info full-width">
                              <div>
                                {{ props.row.label }}
                              </div>
                              <div class="text-caption text-grey-7">{{ props.row.position }}</div>
                            </div>
                          </div>
                        </q-td>
                        <q-td key="rank" :props="props">
                          <div class="text-body2">
                            <q-badge
                              v-if="isHeadRank(props.row.rank)"
                              color="green"
                              class="q-mr-xs"
                            >
                              {{ props.row.rank || '-' }}
                            </q-badge>
                            <span v-else>{{ props.row.rank || '-' }}</span>
                          </div>
                        </q-td>
                        <q-td key="ipcr_status" :props="props">
                          <q-badge
                            :color="getStatusColor(props.row)"
                            :label="props.row.ipcrStatus || '-'"
                            class="status-badge"
                          />
                        </q-td>
                        <q-td key="actions" :props="props" class="text-center">
                          <div class="row justify-center q-gutter-xs">
                            <q-btn
                              class="neu-button"
                              flat
                              round
                              color="blue"
                              icon="assignment_ind"
                              size="md"
                              @click="show_ipcr_Modal(props.row)"
                            >
                              <q-tooltip>IPCR</q-tooltip>
                            </q-btn>
                            <q-btn
                              class="neu-button"
                              flat
                              round
                              color="amber"
                              icon="edit"
                              size="md"
                              @click="editEmployee(props.row)"
                            >
                              <q-tooltip>Edit</q-tooltip>
                            </q-btn>
                            <q-btn
                              class="neu-button"
                              flat
                              round
                              color="negative"
                              icon="delete"
                              size="md"
                              @click="confirmDeleteEmployee(props.row)"
                            >
                              <q-tooltip>Delete</q-tooltip>
                            </q-btn>
                          </div>
                        </q-td>
                      </q-tr>
                    </template>
                    <template v-slot:no-data>
                      <div class="text-center q-pa-md col-12">
                        <q-icon name="error_outline" size="2rem" color="grey" />
                        <div class="text-grey-7 q-mt-sm">
                          No employees found in this {{ selectedNode?.type || 'node' }}
                        </div>
                      </div>
                    </template>
                  </q-table>
                </template>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
  <q-dialog v-model="showUnitWorkPlanModalOpen" full-width>
    <unitWorkplan_report
      :targetPeriod="targetPeriod"
      :filteredDivisions="filteredRows"
      @close="closeUnitWorkPlanModal"
    />
  </q-dialog>
  <q-dialog v-model="confirmDeleteDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="warning" text-color="white" />
        <span class="q-ml-sm">Are you sure you want to delete {{ employeeToDelete?.label }}?</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Delete" color="negative" @click="performDeleteEmployee" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="show_ipcr_ModalOpen" full-width>
    <ipcr_Report
      :employee="selectedEmployee"
      :targetPeriod="targetPeriod"
      @close="close_ipcr_Modal"
    />
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from 'boot/axios'
import { useOrganizationStore } from 'src/stores/office/spmsStore'
import { useUserStore } from 'src/stores/userStore'
import { useUserManageStore } from 'src/stores/hr_Store/account_manage_Store'
import unitWorkplan_report from 'src/components/unitworkplant_Report.vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ipcr_Report from 'src/components/ipcr_Report.vue'

const $q = useQuasar()
const orgStore = useOrganizationStore()
const userStore = useUserStore()
const userManageStore = useUserManageStore()
const router = useRouter()

// Reactive state
const selectedEmployee = ref(null)
const selectedNodeId = ref(null)
const loading = ref(false)
const treeFilter = ref('')
const employeeFilter = ref('')
const confirmDeleteDialog = ref(false)
const employeeToDelete = ref(null)
const showUnitWorkPlanModalOpen = ref(false)
const filteredRows = ref([])
const show_ipcr_ModalOpen = ref(false)
const targetPeriod = ref(null)

// Office dropdown state
const selectedOffice = ref(null)
const filteredOfficeOptions = ref([])

const columns = ref([
  { name: 'name', align: 'left', label: 'Name', field: 'label', sortable: true },
  { name: 'rank', align: 'left', label: 'Rank', field: 'rank', sortable: true },
  { name: 'ipcr_status', align: 'left', label: 'Status', field: 'ipcrStatus', sortable: true },
  { name: 'actions', align: 'center', label: 'Actions', field: 'actions' },
])

// Computed properties
const organizationTree = computed(() => orgStore.structure)

const selectedNode = computed(() => {
  const findNode = (nodes) =>
    nodes?.find((node) => node.id === selectedNodeId.value) ||
    nodes?.reduce((acc, node) => acc || findNode(node.children), null)
  return selectedNodeId.value ? findNode(orgStore.structure) : null
})

const employees = computed(() =>
  !selectedNode.value
    ? []
    : selectedNode.value.type === 'employee'
      ? [selectedNode.value]
      : selectedNode.value.children?.filter((child) => child.type === 'employee') || [],
)

const filteredEmployees = computed(() => {
  if (!employeeFilter.value) return employees.value
  const term = employeeFilter.value.toLowerCase()
  return employees.value.filter(
    (emp) =>
      emp.label.toLowerCase().includes(term) ||
      emp.position?.toLowerCase().includes(term) ||
      emp.rank?.toLowerCase().includes(term),
  )
})

// target period selection

const selectedSemester = computed({
  get: () => orgStore.selectedSemester,
  set: (value) => {
    orgStore.selectedSemester = value
  },
})

const selectedYear = computed({
  get: () => orgStore.selectedYear,
  set: (value) => {
    orgStore.selectedYear = value
  },
})
const availableSemesters = computed(() => orgStore.getAvailableSemesters)
const availableYears = computed(() => orgStore.getAvailableYears)
// const currentTargetPeriod = computed(() => orgStore.getCurrentTargetPeriod)

const onSemesterChange = async () => {
  if (selectedSemester.value && selectedYear.value) {
    await orgStore.setTargetPeriod(selectedSemester.value, selectedYear.value)
  }
}

const onYearChange = async () => {
  if (selectedYear.value) {
    const semesters = availableSemesters.value
    if (semesters.length > 0 && !semesters.includes(selectedSemester.value)) {
      selectedSemester.value = semesters[0]
    }
    if (selectedSemester.value && selectedYear.value) {
      await orgStore.setTargetPeriod(selectedSemester.value, selectedYear.value)
    }
  }
}


// Helper constants and functions
const headRanks = ['office-head', 'division-head', 'section-head', 'unit-head']

const isHeadRank = (rank) => !!rank && headRanks.some((h) => rank.toLowerCase().includes(h))

const getNodeColor = (node) => {
  return (
    {
      office: 'green',
      office2: 'teal',
      group: 'purple',
      division: 'red',
      section: 'blue',
      unit: 'indigo',
      employee: node.isHead || isHeadRank(node.rank) ? 'blue' : 'grey',
    }[node.type] || 'grey'
  )
}

const getNodeIcon = (node) => {
  if (node.type === 'employee') {
    return isHeadRank(node.rank) ? 'supervisor_account' : 'person'
  }
  return (
    {
      office: 'account_balance',
      office2: 'business',
      group: 'group_work',
      division: 'corporate_fare',
      section: 'view_quilt',
      unit: 'widgets',
    }[node.type] || 'help_outline'
  )
}

const getStatusColor = (row) => {
  const s = row.ipcrStatus?.toLowerCase() || ''
  if (s.includes('approved')) return 'positive'
  if (s.includes('pending')) return 'warning'
  if (s.includes('review')) return 'info'
  if (s.includes('rejected')) return 'negative'
  return 'grey'
}

const filterMethod = (node, filter) => {
  if (!filter) return true
  const term = filter.toLowerCase()
  if (node.label?.toLowerCase().includes(term)) return true
  if (
    node.type === 'employee' &&
    (node.position?.toLowerCase().includes(term) || node.rank?.toLowerCase().includes(term))
  )
    return true
  return node.children?.some((child) => filterMethod(child, filter))
}

// Office dropdown filter function - FIX: Changed from "Office" to "name"
const filterOffices = (val, update) => {
  if (val === '') {
    update(() => {
      filteredOfficeOptions.value = userManageStore.offices || []
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    const offices = userManageStore.offices || []
    filteredOfficeOptions.value = offices.filter((office) =>
      (office.name ?? '').toLowerCase().includes(needle),
    )
  })
}

// Handle office selection change
const onOfficeChange = async (office) => {
  if (office) {
    // Reset previous selections
    selectedNodeId.value = null
    employeeFilter.value = ''
    treeFilter.value = ''

    // Set the officeId in userStore, then fetch structure
    userStore.officeId = office.id
    await refreshData()
  } else {
    // Clear the structure if no office is selected
    userStore.officeId = null
    orgStore.structure = []
    selectedNodeId.value = null
  }
}

const onNodeSelect = (nodeId) => {
  selectedNodeId.value = nodeId
  employeeFilter.value = ''
}

const showUnitWorkPlanModal = () => {
  if (!selectedNode.value)
    return $q.notify({
      message: 'Please select a division, section, or unit first',
      color: 'negative',
    })
  filteredRows.value = employees.value
  showUnitWorkPlanModalOpen.value = true
}

const closeUnitWorkPlanModal = () => (showUnitWorkPlanModalOpen.value = false)

const show_ipcr_Modal = (employee) => {
  selectedEmployee.value = employee
  show_ipcr_ModalOpen.value = true
}

const close_ipcr_Modal = () => (show_ipcr_ModalOpen.value = false)

const createUnitWorkPlan = () => {
  if (!selectedNode.value)
    return $q.notify({
      message: 'Please select a division, section, unit, or office first',
      color: 'negative',
    })

  const type = ['office', 'division', 'section', 'unit'].includes(selectedNode.value.type)
    ? selectedNode.value.type
    : null
  if (!type)
    return $q.notify({
      message: 'Please select a division, section, unit, or office',
      color: 'negative',
    })
  router.push({ name: 'unitworkplan', query: { type, id: selectedNode.value.id } })
}

const editEmployee = (employee) =>
  router.push({
    name: 'employee-edit',
    params: { id: employee.employeeData?.id || employee.id.replace('emp_', '') },
  })

const confirmDeleteEmployee = (employee) => {
  employeeToDelete.value = employee
  confirmDeleteDialog.value = true
}

const performDeleteEmployee = async () => {
  if (!employeeToDelete.value) return
  try {
    loading.value = true
    await api.delete(
      `Spms/employee/${employeeToDelete.value.employeeData?.id || employeeToDelete.value.id.replace('emp_', '')}`,
    )
    $q.notify({
      message: `Employee ${employeeToDelete.value.label} deleted successfully`,
      color: 'positive',
    })
    await refreshData()
  } catch (error) {
    $q.notify({
      message: `Failed to delete employee: ${error.message || 'Unknown error'}`,
      color: 'negative',
    })
  } finally {
    loading.value = false
    employeeToDelete.value = null
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await orgStore.fetchStructure()
  } catch (error) {
    $q.notify({
      message: `Failed to refresh data: ${error.message || 'Unknown error'}`,
      color: 'negative',
    })
  } finally {
    loading.value = false
  }
}

// Watch for office changes in userManageStore
watch(
  () => userManageStore.offices,
  (offices) => {
    if (offices && offices.length > 0) {
      filteredOfficeOptions.value = offices
    }
  },
)

onMounted(async () => {
  await userStore.loadUserData()
  // Fetch offices for the dropdown
  await userManageStore.fetchOffices()
  await orgStore.fetchListTargetPeriod()
  filteredOfficeOptions.value = userManageStore.offices || []
})
</script>

<style scoped>
.q-page {
  background-color: #f7fafc;
}

.clean-table {
  border-radius: 8px;
}

.status-badge {
  border-radius: 4px;
  padding: 4px 8px;
}

.neu-button {
  border-radius: 50%;
  box-shadow:
    3px 3px 6px rgba(0, 0, 0, 0.15),
    -3px -3px 6px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  background: #f7fafc;
}

.neu-button:hover {
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.2),
    -2px -2px 4px rgba(255, 255, 255, 0.9);
  transform: translateY(1px);
}

.neu-button:active {
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.2),
    inset -2px -2px 4px rgba(255, 255, 255, 0.9);
  transform: translateY(2px);
}

.neu-button-rect {
  border-radius: 8px;
  box-shadow:
    3px 3px 6px rgba(0, 0, 0, 0.15),
    -3px -3px 6px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  background: #f7fafc;
  padding: 8px 16px;
}

.neu-button-rect:hover {
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.2),
    -2px -2px 4px rgba(255, 255, 255, 0.9);
  transform: translateY(1px);
}

.neu-button-rect:active {
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.2),
    inset -2px -2px 4px rgba(255, 255, 255, 0.9);
  transform: translateY(2px);
}

.office-title {
  font-size: 12pt;
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.button-container {
  flex-wrap: nowrap;
  flex: 0 0 auto;
  justify-content: flex-end;
  min-width: fit-content;
}

.org-tree .q-tree__node-header {
  padding: 4px 8px;
}

.tree-icon {
  flex-shrink: 0;
}

.tree-label {
  min-width: 0;
}

.node-label {
  overflow: visible;
  text-overflow: unset;
  white-space: normal;
  max-width: none;
}

.employee-info {
  min-width: 0;
  overflow: hidden;
}

.employee-info > div {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Office select autogrow styles */
.office-select {
  min-height: 40px;
}

.office-select :deep(.q-field__control) {
  min-height: 40px;
  height: auto !important;
}

.office-select :deep(.q-field__control-container) {
  padding-top: 14px;
  padding-bottom: 6px;
}

.office-select :deep(.q-field__native) {
  min-height: 24px;
  padding: 0;
}

.selected-office-name {
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
  padding: 2px 0;
}

.office-option-label {
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
}
</style>
