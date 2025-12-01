<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
<<<<<<< HEAD
      <q-page padding class="q-pa-md">
        <div class="row items-center justify-between q-mb-lg">
          <div class="row q-gutter-sm"></div>
        </div>
        <div class="row q-mb-lg">
          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="row q-mb-sm">
                  <q-input
                    dense
                    outlined
                    v-model="treeFilter"
                    placeholder="Search organization..."
                    class="full-width"
                  >
                    <template v-slot:append><q-icon name="search" /></template>
                  </q-input>
                </div>
                <q-tree
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
=======
      <q-page class="page-background">
        <!-- Header Section -->
        <div class="page-header q-pa-lg">
          <div class="row items-center justify-between">
            <div>
              <h4 class="page-title q-my-none">Organization Management</h4>
              <p class="page-subtitle q-my-none text-grey-6">
                Manage organizational structure and employee data
              </p>
            </div>
            <q-btn
              unelevated
              color="primary"
              icon="refresh"
              label="Refresh Data"
              @click="refreshData"
              :loading="loading"
              class="modern-btn"
            />
          </div>
        </div>

        <div class="row q-col-gutter-lg q-px-lg q-pb-lg ">
          <!-- Organization Tree Panel -->
          <div class="col-12 col-lg-4 q-mt-lg">
            <q-card class="modern-card full-height">
              <q-card-section class="card-header">
                <div class="row items-center q-gutter-sm">
                  <q-icon name="account_tree" color="primary" size="24px" />
                  <span class="text-h6 text-weight-medium">Organization Structure</span>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section class="q-pa-none">
                <!-- Search Input -->
                <div class="q-pa-md">
                  <q-input
                    v-model="treeFilter"
                    placeholder="Search organization..."
                    outlined
                    dense
                    clearable
                    class="search-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="grey-6" />
                    </template>
                  </q-input>
                </div>

                <!-- Organization Tree -->
                <div class="tree-container">
                  <q-tree
                    :nodes="organizationTree"
                    node-key="id"
                    v-model:selected="selectedNodeId"
                    :filter="treeFilter"
                    :filter-method="filterMethod"
                    default-expand-all
                    @update:selected="onNodeSelect"
                    :loading="orgStore.loading"
                    class="modern-tree"
                  >
                    <template v-slot:default-header="scope">
                      <div class="tree-node-content">
                        <q-avatar
                          :icon="getNodeIcon(scope.node)"
                          :color="getNodeColor(scope.node)"
                          text-color="white"
                          size="28px"
                          class="node-avatar"
                        />
                        <div class="node-details">
                          <div class="node-name" :class="{ 'text-weight-bold': scope.node.isHead }">
                            {{ scope.node.label }}
                          </div>
                          <div class="node-meta" v-if="scope.node.position">
                            {{ scope.node.position }}
                          </div>
                          <q-chip
                            v-if="scope.node.type === 'employee' && isHeadRank(scope.node.rank)"
                            :label="scope.node.rank"
                            color="positive"
                            text-color="white"
                            size="sm"
                            class="rank-chip"
                          />
                        </div>
                      </div>
                    </template>
                  </q-tree>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Employee Details Panel -->
          <div class="col-12 col-lg-8  q-mt-lg">
            <q-card class="modern-card full-height">
              <q-card-section class="card-header">
                <div class="row items-center justify-between">
                  <div class="row items-center q-gutter-sm">
                    <q-icon name="groups" color="primary" size="24px" />
                    <span class="text-h6 text-weight-medium">
                      {{ selectedNode?.label || 'Select an Organization Unit' }}
                    </span>
                    <q-chip
                      v-if="selectedNode"
                      :label="selectedNode.type"
                      color="grey-3"
                      text-color="grey-7"
                      size="sm"
                      class="type-chip"
                    />
                  </div>

                  <div class="row q-gutter-sm" v-if="selectedNode">
                    <q-btn
                      unelevated
                      color="positive"
                      icon="add_task"
                      label="Create UWP"
                      @click="createUnitWorkPlan"
                      class="modern-btn"
                      size="sm"
                    />
                    <q-btn
                      unelevated
                      color="info"
                      icon="preview"
                      label="Preview UWP"
                      @click="showUnitWorkPlanModal"
                      class="modern-btn"
                      size="sm"
                    />
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section class="q-pa-none">
                <!-- Employee Search -->
                <div class="q-pa-md">
                  <q-input
                    v-model="employeeFilter"
                    placeholder="Search employees..."
                    outlined
                    dense
                    clearable
                    class="search-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person_search" color="grey-6" />
                    </template>
                  </q-input>
                </div>

                <!-- Employee Table -->
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
                <q-table
                  :rows="filteredEmployees"
                  :columns="columns"
                  row-key="id"
                  flat
<<<<<<< HEAD
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
                          <q-badge v-if="isHeadRank(props.row.rank)" color="green" class="q-mr-xs">
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
                          <!-- <q-btn
                            class="neu-button"
                            flat
                            round
                            color="green"
                            icon="article"
                            size="md"
                            @click="unitWorkPlanEmployee(props.row)"
                          >
                            <q-tooltip>Unit Work Plan</q-tooltip>
                          </q-btn> -->
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
=======
                  class="modern-table"
                  :pagination="{ rowsPerPage: 10 }"
                  :loading="loading"
                  :filter="employeeFilter"
                  separator="cell"
                >
                  <template v-slot:body="props">
                    <q-tr :props="props" class="table-row">
                      <q-td key="name" :props="props">
                        <div class="employee-cell">
                          <q-avatar
                            :icon="props.row.isHead ? 'supervisor_account' : 'person'"
                            :color="props.row.isHead ? 'primary' : 'grey-5'"
                            text-color="white"
                            size="32px"
                          />
                          <div class="employee-details">
                            <div class="employee-name" :class="{ 'text-weight-bold': props.row.isHead }">
                              {{ props.row.label }}
                            </div>
                            <div class="employee-position">{{ props.row.position }}</div>
                          </div>
                        </div>
                      </q-td>

                      <q-td key="rank" :props="props">
                        <q-chip
                          v-if="props.row.rank"
                          :label="props.row.rank"
                          :color="isHeadRank(props.row.rank) ? 'positive' : 'grey-4'"
                          :text-color="isHeadRank(props.row.rank) ? 'white' : 'grey-7'"
                          size="sm"
                        />
                        <span v-else class="text-grey-5">-</span>
                      </q-td>

                      <q-td key="ipcr_status" :props="props">
                        <q-badge
                          :color="getStatusColor(props.row)"
                          :label="props.row.ipcrStatus || 'Not Set'"
                          class="status-badge"
                        />
                      </q-td>

                      <q-td key="actions" :props="props">
                        <div class="action-buttons">
                          <q-btn
                            round
                            flat
                            color="info"
                            icon="assignment_ind"
                            size="sm"
                            @click="show_ipcr_Modal(props.row)"
                            class="action-btn"
                          >
                            <q-tooltip class="bg-info">View IPCR</q-tooltip>
                          </q-btn>

                          <q-btn
                            round
                            flat
                            color="positive"
                            icon="description"
                            size="sm"
                            @click="unitWorkPlanEmployee(props.row)"
                            class="action-btn"
                          >
                            <q-tooltip class="bg-positive">Unit Work Plan</q-tooltip>
                          </q-btn>

                          <q-btn
                            round
                            flat
                            color="warning"
                            icon="edit"
                            size="sm"
                            @click="editEmployee(props.row)"
                            class="action-btn"
                          >
                            <q-tooltip class="bg-warning">Edit Employee</q-tooltip>
                          </q-btn>

                          <q-btn
                            round
                            flat
                            color="negative"
                            icon="delete_outline"
                            size="sm"
                            @click="confirmDeleteEmployee(props.row)"
                            class="action-btn"
                          >
                            <q-tooltip class="bg-negative">Delete Employee</q-tooltip>
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
                          </q-btn>
                        </div>
                      </q-td>
                    </q-tr>
                  </template>
<<<<<<< HEAD
                  <template v-slot:no-data>
                    <div class="text-center q-pa-md col-12">
                      <q-icon name="error_outline" size="2rem" color="grey" />
                      <div class="text-grey-7 q-mt-sm">
                        No employees found in this {{ selectedNode?.type || 'node' }}
                      </div>
                    </div>
=======

                  <template v-slot:no-data>
               <div class="no-data-container ">
                    <q-icon name="person_off" size="48px" color="grey-4" />
                    <div class="text-h6 text-grey-6 q-mt-md  ">No employees found</div>
                    <div class="text-body2 text-grey-5">
                      {{ selectedNode ? `No employees in this ${selectedNode.type}` : 'Select an organization unit to view employees' }}
                    </div>
                  </div>
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
<<<<<<< HEAD
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
=======

    <!-- Dialogs -->
    <q-dialog v-model="showUnitWorkPlanModalOpen" maximized transition-show="slide-up">
      <unitWorkplan_report
        :targetPeriod="targetPeriod"
        :filteredDivisions="filteredRows"
        @close="closeUnitWorkPlanModal"
      />
    </q-dialog>

    <q-dialog v-model="confirmDeleteDialog" persistent>
      <q-card class="delete-dialog">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar icon="warning" color="negative" text-color="white" size="40px" />
          <div>
            <div class="text-h6">Confirm Deletion</div>
            <div class="text-body2 text-grey-7">
              Are you sure you want to delete <strong>{{ employeeToDelete?.label }}</strong>?
              <br>This action cannot be undone.
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancel"
            color="grey"
            v-close-popup
            class="q-mr-sm"
          />
          <q-btn
            unelevated
            label="Delete"
            color="negative"
            @click="performDeleteEmployee"
            v-close-popup
            icon="delete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="show_ipcr_ModalOpen" maximized transition-show="slide-up">
      <ipcr_Report
        :employee="selectedEmployee"
        :targetPeriod="targetPeriod"
        @close="close_ipcr_Modal"
      />
    </q-dialog>
  </q-layout>
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
<<<<<<< HEAD
import { useOrganizationStore } from 'src/stores/office/spmsStore'
=======
import { useOrganizationStore } from 'src/stores/office/spms_Store'
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
import { useUserStore } from 'src/stores/userStore'
import unitWorkplan_report from 'src/components/unitworkplant_Report.vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ipcr_Report from 'src/components/ipcr_Report.vue'
<<<<<<< HEAD
=======

>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
const $q = useQuasar(),
  orgStore = useOrganizationStore(),
  userStore = useUserStore(),
  router = useRouter()
const selectedEmployee = ref(null),
  selectedNodeId = ref(null),
  loading = ref(false),
  treeFilter = ref(''),
  employeeFilter = ref('')
const confirmDeleteDialog = ref(false),
  employeeToDelete = ref(null),
  showUnitWorkPlanModalOpen = ref(false),
  filteredRows = ref([])
const show_ipcr_ModalOpen = ref(false)
<<<<<<< HEAD
const columns = ref([
  { name: 'name', align: 'left', label: 'Name', field: 'label', sortable: true },
  { name: 'rank', align: 'left', label: 'Rank', field: 'rank', sortable: true },
  { name: 'ipcr_status', align: 'left', label: 'Status', field: 'ipcrStatus', sortable: true },
  { name: 'actions', align: 'center', label: 'Actions', field: 'actions' },
])
=======

const columns = ref([
  { name: 'name', align: 'left', label: 'Employee', field: 'label', sortable: true },
  { name: 'rank', align: 'left', label: 'Rank', field: 'rank', sortable: true },
  { name: 'ipcr_status', align: 'center', label: 'IPCR Status', field: 'ipcrStatus', sortable: true },
  { name: 'actions', align: 'center', label: 'Actions', field: 'actions' },
])

>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
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

const headRanks = ['office-head', 'division-head', 'section-head', 'unit-head']

const isHeadRank = (rank) => !!rank && headRanks.some((h) => rank.toLowerCase().includes(h))
<<<<<<< HEAD
const getNodeColor = (node) => {
  // Always return the color based on node type, ignoring head status
  return (
    {
      office: 'green',
      division: 'red',
      section: 'blue',
      unit: 'indigo',
      employee: node.isHead || isHeadRank(node.rank) ? 'blue' : 'grey',
    }[node.type] || 'grey'
  )
}

// 2. Make sure getNodeIcon is consistent with our color scheme
=======

const getNodeColor = (node) => {
  const colors = {
    office: 'green',
    division: 'deep-orange',
    section: 'blue',
    unit: 'purple',
    employee: node.isHead || isHeadRank(node.rank) ? 'primary' : 'grey-5',
  }
  return colors[node.type] || 'grey-5'
}

>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
const getNodeIcon = (node) => {
  if (node.type === 'employee') {
    return isHeadRank(node.rank) ? 'supervisor_account' : 'person'
  }

<<<<<<< HEAD
  return (
    {
      office: 'account_balance',
      division: 'corporate_fare',
      section: 'view_quilt',
      unit: 'widgets',
    }[node.type] || 'help_outline'
  )
}

// 3. Keep the other color helper functions the same

// 4. Keep the status color logic the same
=======
  const icons = {
    office: 'business',
    division: 'corporate_fare',
    section: 'view_module',
    unit: 'workspaces',
  }
  return icons[node.type] || 'help_outline'
}

>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
const getStatusColor = (row) => {
  const s = row.ipcrStatus?.toLowerCase() || ''
  if (s.includes('approved')) return 'positive'
  if (s.includes('pending')) return 'warning'
  if (s.includes('review')) return 'info'
  if (s.includes('rejected')) return 'negative'
<<<<<<< HEAD
  return 'grey'
=======
  return 'grey-5'
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
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

const onNodeSelect = (nodeId) => {
  selectedNodeId.value = nodeId
  employeeFilter.value = ''
}

const showUnitWorkPlanModal = () => {
  if (!selectedNode.value)
    return $q.notify({
      message: 'Please select a division, section, or unit first',
      color: 'negative',
<<<<<<< HEAD
=======
      icon: 'warning',
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
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
<<<<<<< HEAD
=======
      icon: 'warning',
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
    })

  const type = ['office', 'division', 'section', 'unit'].includes(selectedNode.value.type)
    ? selectedNode.value.type
    : null
  if (!type)
    return $q.notify({
      message: 'Please select a division, section, unit, or office',
      color: 'negative',
<<<<<<< HEAD
=======
      icon: 'warning',
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
    })
  router.push({ name: 'unitworkplan', query: { type, id: selectedNode.value.id } })
}

<<<<<<< HEAD
// const unitWorkPlanEmployee = (employee) =>
//   router.push({
//     name: 'unitworkplan',
//     query: {
//       type: 'employee',
//       id: employee.employeeData?.id || employee.id.replace('emp_', ''),
//       name: employee.label,
//     },
//   })
=======
const unitWorkPlanEmployee = (employee) =>
  router.push({
    name: 'unitworkplan',
    query: {
      type: 'employee',
      id: employee.employeeData?.id || employee.id.replace('emp_', ''),
      name: employee.label,
    },
  })

>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
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
    // eslint-disable-next-line no-undef
    await api.delete(
      `Spms/employee/${employeeToDelete.value.employeeData?.id || employeeToDelete.value.id.replace('emp_', '')}`,
    )
    $q.notify({
      message: `Employee ${employeeToDelete.value.label} deleted successfully`,
      color: 'positive',
<<<<<<< HEAD
=======
      icon: 'check_circle',
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
    })
    await refreshData()
  } catch (error) {
    $q.notify({
      message: `Failed to delete employee: ${error.message || 'Unknown error'}`,
      color: 'negative',
<<<<<<< HEAD
=======
      icon: 'error',
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
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
<<<<<<< HEAD
=======
    $q.notify({
      message: 'Data refreshed successfully',
      color: 'positive',
      icon: 'refresh',
    })
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
  } catch (error) {
    $q.notify({
      message: `Failed to refresh data: ${error.message || 'Unknown error'}`,
      color: 'negative',
<<<<<<< HEAD
=======
      icon: 'error',
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
    })
  } finally {
    loading.value = false
  }
}

watch(
  () => userStore.officeId,
  async (id) => {
    if (id) await refreshData()
  },
)
<<<<<<< HEAD
=======

>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
onMounted(async () => {
  await userStore.loadUserData()
  await refreshData()
})
</script>

<style scoped>
<<<<<<< HEAD
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

/* New rectangular neumorphic button style */
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

/* New styles for the office title and button container */
.office-title {
  font-size: 12pt; /* Reduced from text-h6 default size */
  max-width: 50%; /* Limit width of the title */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.button-container {
  flex-wrap: nowrap; /* Prevent buttons from wrapping */
  flex: 0 0 auto; /* Don't allow shrinking */
  justify-content: flex-end; /* Keep buttons aligned to the right */
  min-width: fit-content; /* Ensure buttons get enough space */
}

/* Organization tree specific styles */
.org-tree .q-tree__node-header {
  padding: 4px 8px;
}

.tree-icon {
  flex-shrink: 0; /* Prevent icon from shrinking */
}

.tree-label {
  min-width: 0; /* Allow text to shrink */
}

.node-label {
  /* Remove truncation styles so full name is shown */
  overflow: visible;
  text-overflow: unset;
  white-space: normal;
  max-width: none;
}

.employee-info {
  min-width: 0; /* Allow content to shrink */
  overflow: hidden;
}

.employee-info > div {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
=======
/* Global Page Styles */
.page-background {
  background: linear-gradient(135deg, #d3dada 0%, #c5c0c0 100%);
  min-height: 100vh;
}

.page-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.page-title {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.75rem;
}

.page-subtitle {
  font-size: 0.95rem;
  margin-top: 4px;
}

/* Modern Card Styles */
.modern-card {
  border-radius: 16px;
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); */
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.modern-card:hover {
  /* box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15); */
  transform: translateY(-2px);
}

.card-header {
  background: rgba(228, 235, 229, 0.336);
  border-bottom: 1px solid rgba(74, 144, 226, 0.1);
}

.full-height {
  height: calc(100vh - 200px);
  min-height: 600px;
}

/* Search Input Styles */
.search-input {
  border-radius: 12px;
}

.search-input .q-field__control {
  border-radius: 12px;
}

/* Tree Styles */
.tree-container {
  max-height: calc(100vh - 350px);
  overflow-y: auto;
  padding: 0 16px 16px;
}

.modern-tree {
  font-size: 14px;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  width: 100%;
}

.node-avatar {
  flex-shrink: 0;
}

.node-details {
  flex: 1;
  min-width: 0;
}

.node-name {
  font-size: 14px;
  color: #2c3e50;
  line-height: 1.4;
}

.node-meta {
  font-size: 12px;
  color: #7f8c8d;
  line-height: 1.3;
  margin-top: 2px;
}

.rank-chip {
  margin-top: 4px;
}

.type-chip {
  text-transform: capitalize;
}

/* Table Styles */
.modern-table {
  border-radius: 12px;
  overflow: hidden;
}

.modern-table .q-table__top {
  background: transparent;
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: rgba(74, 144, 226, 0.04);
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-details {
  flex: 1;
  min-width: 0;
}

.employee-name {
  font-size: 14px;
  color: #2c3e50;
  line-height: 1.4;
}

.employee-position {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 2px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* Status Badge */
.status-badge {
  border-radius: 20px;
  padding: 4px 12px;
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Modern Button Styles */
.modern-btn {
  border-radius: 10px;
  font-weight: 500;
  text-transform: none;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.modern-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* No Data Container */
.no-data-container {
  margin-top: 50px;
  margin-left: 320px;
      /* vertical centering */
  text-align: center;
  height: 65vh;             /* take full viewport height */
  padding: 48px 24px;
   /* optional: if you want stacked items */
}
/* Delete Dialog */
.delete-dialog {
  border-radius: 16px;
  max-width: 450px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    padding: 16px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .full-height {
    height: auto;
    min-height: auto;
  }

  .tree-container {
    max-height: 400px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}

/* Scrollbar Styling */
.tree-container::-webkit-scrollbar {
  width: 6px;
}

.tree-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-thumb {
  background: rgba(74, 144, 226, 0.3);
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 144, 226, 0.5);
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
}
</style>
