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
                          <div
                            :class="{ 'text-weight-bold': scope.node.isHead }"
                            class="node-label"
                          >
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
                  <div class="text-h6 office-title">{{ selectedNode.label }}</div>
                  <div class="row q-gutter-sm button-container">
                    <q-btn
                      class="neu-button-rect"
                      flat
                      color="green"
                      icon="person_add"
                      label="Create UWP"
                      @click="createUnitWorkPlan"
                    />
                    <q-btn
                      class="neu-button-rect"
                      flat
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
                            <div :class="{ 'text-weight-bold': props.row.isHead }">
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
                          <q-btn
                            class="neu-button"
                            flat
                            round
                            color="green"
                            icon="article"
                            size="md"
                            @click="unitWorkPlanEmployee(props.row)"
                          >
                            <q-tooltip>Unit Work Plan</q-tooltip>
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
                    <div class="text-center q-pa-md">
                      <q-icon name="error_outline" size="2rem" color="grey" />
                      <div class="text-grey-7 q-mt-sm">
                        No employees found in this {{ selectedNode?.type || 'node' }}
                      </div>
                    </div>
                  </template>
                </q-table>
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
import { useOrganizationStore } from 'src/stores/office/spmsStore'
import { useUserStore } from 'src/stores/userStore'
import unitWorkplan_report from 'src/components/unitworkplant_Report.vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ipcr_Report from 'src/components/ipcr_Report.vue'

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
const columns = ref([
  { name: 'name', align: 'left', label: 'Name', field: 'label', sortable: true },
  { name: 'rank', align: 'left', label: 'Rank', field: 'rank', sortable: true },
  { name: 'ipcr_status', align: 'left', label: 'IPCR Status', field: 'ipcrStatus', sortable: true },
  { name: 'actions', align: 'center', label: 'Actions', field: 'actions' },
])
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
const getNodeIcon = (node) => {
  if (node.type === 'employee') {
    return isHeadRank(node.rank) ? 'supervisor_account' : 'person'
  }

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

const unitWorkPlanEmployee = (employee) =>
  router.push({
    name: 'unitworkplan',
    query: {
      type: 'employee',
      id: employee.employeeData?.id || employee.id.replace('emp_', ''),
      name: employee.label,
    },
  })
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

watch(
  () => userStore.officeId,
  async (id) => {
    if (id) await refreshData()
  },
)
onMounted(async () => {
  await userStore.loadUserData()
  await refreshData()
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
  font-size: 1.1rem; /* Reduced from text-h6 default size */
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
}
</style>
