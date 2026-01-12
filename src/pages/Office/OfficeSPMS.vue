<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page padding class="q-pa-md">
        <!-- Main Content -->
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
                <div class="row q-mb-md">
                  <q-input
                    dense
                    outlined
                    v-model="treeFilter"
                    placeholder="Search organization..."
                    class="full-width"
                  >
                    <!-- <template v-slot: append>
                      <q-icon name="search" />
                    </template> -->
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
                        color="green"
                        size="sm"
                        class="q-mr-sm tree-icon"
                      />
                      <div class="column tree-label full-width">
                        <div class="row items-center">
                          <div class="node-label">
                            {{ scope.node.label }}
                          </div>

                          <!-- Debug info -->
                          <!-- <q-badge color="grey" class="q-ml-xs">
                            Type: {{ scope.node.type }}, Leaf: {{ scope.node.isLeaf }}, Direct:
                            {{ scope.node.directCount }}
                          </q-badge> -->
                          <!-- End debug -->

                          <!-- For bottom-level org nodes (leaf org nodes) show employee count instead of an X/check -->
                          <q-badge
                            v-if="isLeafNode(scope.node.id)"
                            :color="getLeafBadgeColor(scope.node.id)"
                            class="q-ml-xs"
                          >
                            {{ getNodeCount(scope.node.id) }}
                          </q-badge>

                          <q-badge
                            v-else-if="
                              scope.node.type !== 'employee' &&
                              getNodeCompletionRatio(scope.node.id) !== '0/0'
                            "
                            :color="getCompletionColor(scope.node.id)"
                            class="q-ml-sm"
                          >
                            {{ getNodeCompletionRatio(scope.node.id) }}
                          </q-badge>

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
                  <div class="office-title">{{ selectedNodeBreadcrumb }}</div>
                  <div class="row q-gutter-sm button-container">
                    <q-btn
                      class="neu-button-rect"
                      flat
                      size="sm"
                      color="green"
                      icon="person_add"
                      label="Create UWP"
                      @click="createUnitWorkPlan"
                      v-if="canCreateUWP"
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
                      v-if="canCreateUWP"
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
                    <!-- <template v-slot: append>
                      <q-icon name="search" />
                    </template> -->
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
                      <q-td key="target_period" :props="props" class="text-center">
                        <q-icon
                          v-if="props.row.hasTargetPeriod"
                          name="check_circle"
                          color="positive"
                          size="sm"
                        />
                        <q-icon v-else name="cancel" color="negative" size="sm" />
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
                            @click="showEditModal(props.row)"
                          >
                            <q-tooltip>Edit</q-tooltip>
                          </q-btn>
                          <!-- <q-btn
                            class="neu-button"
                            flat
                            round
                            color="negative"
                            icon="delete"
                            size="md"
                            @click="confirmDeleteEmployee(props.row)"
                          >
                            <q-tooltip>Delete</q-tooltip>
                          </q-btn> -->
                        </div>
                      </q-td>
                    </q-tr>
                  </template>

                  <template v-slot: no-data>
                    <div class="text-center q-pa-md col-12">
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

  <!-- Unit Work Plan Modal -->
  <q-dialog v-model="showUnitWorkPlanModalOpen" full-width>
    <unitWorkplan_report
      :targetPeriod="currentTargetPeriod"
      :filteredDivisions="filteredRows"
      @close="closeUnitWorkPlanModal"
    />
  </q-dialog>

  <!-- In your parent component template -->
  <q-dialog v-model="showEditModalOpen" full-width persistent>
    <EditUWP
      v-if="employeeToEdit"
      :employee="employeeToEdit"
      :controlNo="employeeToEdit.controlNo"
      :semester="employeeToEdit.semester || currentTargetPeriod?.semester"
      :year="employeeToEdit.year || currentTargetPeriod?.year"
      @close="closeEditModal"
      @saved="handleEmployeeSaved"
    />
  </q-dialog>

  <!-- Delete Confirmation Dialog -->
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

  <!-- IPCR Modal -->
  <q-dialog v-model="show_ipcr_ModalOpen" full-width>
    <ipcr_Report
      :employee="selectedEmployee"
      :targetPeriod="currentTargetPeriod"
      @close="close_ipcr_Modal"
    />
  </q-dialog>

  <!-- UWP Validation Error Dialog -->
  <q-dialog v-model="uwpValidationDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center">
        <q-avatar icon="info" color="warning" text-color="white" size="lg" />
        <span class="q-ml-md text-h6">Cannot Create Unit Work Plan</span>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-none">
        <div v-if="uwpIncompleteItems.length > 0" class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm font-weight-bold">Incomplete Items:</div>
          <q-list bordered separator>
            <q-item v-for="item in uwpIncompleteItems" :key="item.id">
              <q-item-section avatar>
                <q-icon
                  :name="getNodeIcon({ type: item.type })"
                  :color="getNodeColor({ type: item.type })"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.label }}</q-item-label>
                <q-item-label caption>{{ item.type }} - Status: {{ item.completion }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useOrganizationStore } from 'src/stores/office/spmsStore'
import { useUserStore } from 'src/stores/userStore'
import unitWorkplan_report from 'src/components/unitworkplant_Report.vue'
import EditUWP from 'src/components/EditUWPModal.vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ipcr_Report from 'src/components/ipcr_Report.vue'
import { api } from 'boot/axios'

const $q = useQuasar()
const orgStore = useOrganizationStore()
const userStore = useUserStore()
const router = useRouter()

// State
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
const uwpValidationDialog = ref(false)
const uwpValidationMessage = ref('')
const uwpIncompleteItems = ref([])

// Edit Employee State
const showEditModalOpen = ref(false)
const employeeToEdit = ref(null)

// Table columns
const columns = ref([
  { name: 'name', align: 'left', label: 'Name', field: 'label', sortable: true },
  { name: 'rank', align: 'left', label: 'Rank', field: 'rank', sortable: true },
  {
    name: 'ipcr_status',
    align: 'left',
    label: 'Status',
    field: 'ipcrStatus',
    sortable: true,
  },
  {
    name: 'target_period',
    align: 'center',
    label: 'Targets',
    field: 'hasTargetPeriod',
    sortable: false,
  },
  { name: 'actions', align: 'center', label: 'Actions', field: 'actions' },
])

// Computed properties
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
const currentTargetPeriod = computed(() => orgStore.getCurrentTargetPeriod)
const organizationTree = computed(() => orgStore.structure)

const selectedNode = computed(() => {
  const findNode = (nodes) => {
    if (!nodes) return null
    return (
      nodes.find((node) => node.id === selectedNodeId.value) ||
      nodes.reduce((acc, node) => acc || findNode(node.children), null)
    )
  }
  return selectedNodeId.value ? findNode(orgStore.structure) : null
})

const getNodePath = (nodeId, nodes = orgStore.structure) => {
  const path = []

  const findPath = (targetId, currentNodes, currentPath) => {
    if (!currentNodes) return false

    for (const node of currentNodes) {
      const newPath = [...currentPath, node.label]

      if (node.id === targetId) {
        path.push(...newPath)
        return true
      }

      if (node.children && findPath(targetId, node.children, newPath)) {
        return true
      }
    }
    return false
  }

  findPath(nodeId, nodes, [])
  return path
}

const selectedNodeBreadcrumb = computed(() => {
  if (!selectedNode.value) return ''
  const path = getNodePath(selectedNodeId.value)
  return path.length > 3 ? `...   / ${path.slice(-2).join('/')}` : path.join(' / ')
})

const getHierarchyPath = (nodeId, nodes = orgStore.structure) => {
  const path = {
    office: null,
    office2: null,
    group: null,
    division: null,
    section: null,
    unit: null,
  }

  const hierarchyLevels = ['office', 'office2', 'group', 'division', 'section', 'unit']
  let found = false

  const traverse = (currentNodes, currentPath = []) => {
    if (found || !currentNodes) return

    for (const node of currentNodes) {
      if (node.id === nodeId) {
        currentPath.forEach((n) => {
          if (hierarchyLevels.includes(n.type)) {
            path[n.type] = {
              id: n.id,
              label: n.label,
              type: n.type,
            }
          }
        })

        if (hierarchyLevels.includes(node.type)) {
          path[node.type] = {
            id: node.id,
            label: node.label,
            type: node.type,
          }
        }

        found = true
        return
      }

      if (node.children) {
        traverse(node.children, [...currentPath, node])
      }
    }
  }

  traverse(nodes)
  return path
}

const getNodeEmployees = (nodeId, nodes = orgStore.structure) => {
  const employees = []

  const traverse = (currentNodes, targetId) => {
    if (!currentNodes) return false

    for (const node of currentNodes) {
      if (node.id === targetId) {
        if (node.children) {
          node.children.forEach((child) => {
            if (child.type === 'employee') {
              employees.push({
                id: child.id,
                label: child.label,
                position: child.position,
                rank: child.rank,
                ipcrStatus: child.ipcrStatus,
                isHead: child.isHead,
                hasTargetPeriod: child.hasTargetPeriod,
                employeeData: child.employeeData,
              })
            }
          })
        }
        return true
      }

      if (node.children && traverse(node.children, targetId)) {
        return true
      }
    }
  }

  traverse(nodes, nodeId)
  return employees
}

const employees = computed(() => {
  if (!selectedNode.value) return []

  if (selectedNode.value.type === 'employee') {
    return [selectedNode.value]
  }

  return selectedNode.value.children?.filter((child) => child.type === 'employee') || []
})

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

const canCreateUWP = computed(() => {
  if (!selectedNode.value) return false
  return ['office', 'office2', 'group', 'division', 'section', 'unit'].includes(
    selectedNode.value.type,
  )
})

const headRanks = [
  'office-head',
  'division-head',
  'section-head',
  'unit-head',
  'group-head',
  'office2-head',
]

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

const isLeafNode = (nodeId) => {
  const completion = orgStore.getNodeCompletion(nodeId)
  return completion.isLeafNode === true
}

const getNodeCompletionRatio = (nodeId) => {
  const completion = orgStore.getNodeCompletion(nodeId)

  // For leaf nodes, show employee completion (e.g., "1/5")
  const node = orgStore._findNode(nodeId)
  if (node && node.isLeaf) {
    return completion.ratio
  }

  // For parent nodes, show child org unit completion
  // Always return the ratio (even if it's '0/0')
  return completion.ratio
}

const getCompletionColor = (nodeId) => {
  const completion = orgStore.getNodeCompletion(nodeId)
  if (completion.isCompleted) {
    return 'positive'
  }
  if (completion.total === 0) {
    return 'grey-7'
  }
  return 'warning'
}

const getNodeCount = (nodeId) => {
  try {
    const node = orgStore._findNode(nodeId)
    if (!node) return 0

    // If it's a leaf organizational node, count all employees in it
    if (node.isLeaf) {
      return countAllEmployees(node)
    }

    // For non-leaf nodes (parent nodes), return direct children count
    // This includes both direct employees + direct org child nodes
    return node.directCount || 0
  } catch {
    return 0
  }
}

// Helper function to recursively count all employees in a node
const countAllEmployees = (node) => {
  if (!node) return 0

  if (node.type === 'employee') {
    return 1
  }

  let total = 0
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      total += countAllEmployees(child)
    }
  }

  return total
}

const getLeafBadgeColor = (nodeId) => {
  const count = getNodeCount(nodeId)
  return count > 0 ? 'positive' : 'grey-5'
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

// Event handlers
const onNodeSelect = (nodeId) => {
  selectedNodeId.value = nodeId
  employeeFilter.value = ''
}

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

const showUnitWorkPlanModal = () => {
  if (!selectedNode.value)
    return $q.notify({
      message: 'Please select a node first',
      color: 'negative',
    })
  filteredRows.value = employees.value
  showUnitWorkPlanModalOpen.value = true
}

const closeUnitWorkPlanModal = () => {
  showUnitWorkPlanModalOpen.value = false
}

const show_ipcr_Modal = (employee) => {
  selectedEmployee.value = employee
  show_ipcr_ModalOpen.value = true
}

const close_ipcr_Modal = () => {
  show_ipcr_ModalOpen.value = false
}

const showEditModal = (employee) => {
  const controlNo = employee.employeeData?.ControlNo || employee.ControlNo || employee.control_no

  // Get current target period - ensure it exists
  const currentPeriod = currentTargetPeriod.value

  // Log for debugging
  console.log('🔍 Current period from store:', currentPeriod)
  console.log('🔍 Selected semester in store:', orgStore.selectedSemester)
  console.log('🔍 Selected year in store:', orgStore.selectedYear)

  // If currentPeriod is empty, try to get from store directly
  const semester = currentPeriod?.semester || orgStore.selectedSemester
  const year = currentPeriod?.year || orgStore.selectedYear

  console.log('🔍 Final values for edit modal:', {
    employeeName: employee.label,
    controlNo: controlNo,
    semester: semester,
    year: year,
    hasSemester: !!semester,
    hasYear: !!year,
  })

  // Validate we have all required data
  if (!semester || !year) {
    $q.notify({
      message: 'Cannot open edit mode: Semester or Year is not selected',
      color: 'negative',
      position: 'top',
    })
    return
  }

  // Pass all necessary data including semester and year
  employeeToEdit.value = {
    ...employee,
    controlNo: controlNo,
    semester: semester, // Pass semester explicitly
    year: year, // Pass year explicitly
  }
  showEditModalOpen.value = true
}

const closeEditModal = () => {
  showEditModalOpen.value = false
  employeeToEdit.value = null
}

const handleEmployeeSaved = async () => {
  try {
    await refreshData()
    $q.notify({
      message: 'Employee updated successfully',
      color: 'positive',
    })
  } catch {
    $q.notify({
      message: 'Failed to refresh data after edit',
      color: 'negative',
    })
  }
}

const createUnitWorkPlan = () => {
  if (!selectedNode.value)
    return $q.notify({
      message: 'Please select a node first',
      color: 'negative',
    })

  const type = ['office', 'office2', 'group', 'division', 'section', 'unit'].includes(
    selectedNode.value.type,
  )
    ? selectedNode.value.type
    : null

  if (!type)
    return $q.notify({
      message:
        'Please select a valid organizational unit (office, office2, group, division, section, or unit)',
      color: 'negative',
    })

  const validation = orgStore.validateUWPCreation(selectedNode.value.id)

  if (!validation.canCreate) {
    uwpValidationMessage.value = validation.message
    uwpIncompleteItems.value = validation.incompleteItems
    uwpValidationDialog.value = true
    return
  }

  const hierarchyPath = getHierarchyPath(selectedNode.value.id)
  if (!hierarchyPath) {
    return $q.notify({
      message: 'Failed to build organizational hierarchy',
      color: 'negative',
    })
  }

  const availableEmployees = getNodeEmployees(selectedNode.value.id)
  const filteredAvailableEmployees = availableEmployees.filter(
    (emp) => emp.hasTargetPeriod === true,
  )
  const employeesWithoutTargetPeriod = availableEmployees.filter(
    (emp) => emp.hasTargetPeriod === false,
  )
  const breadcrumb = getNodePath(selectedNodeId.value)

  const uwpData = {
    type,
    selectedNodeId: selectedNode.value.id,
    selectedNodeLabel: selectedNode.value.label,
    breadcrumb,
    hierarchy: hierarchyPath,
    availableEmployees, // ALL employees (with and without target period)
    filteredAvailableEmployees, // Only employees WITH target period
    employeesWithoutTargetPeriod, // Only employees WITHOUT target period
    totalAvailableEmployees: availableEmployees.length,
    filteredAvailableEmployeesCount: filteredAvailableEmployees.length,
    employeesWithoutTargetPeriodCount: employeesWithoutTargetPeriod.length,
    selectedEmployees: [],
    targetPeriod: currentTargetPeriod.value,
    timestamp: new Date().toISOString(),
  }

  sessionStorage.setItem('uwpData', JSON.stringify(uwpData))

  router.push({
    name: 'unitworkplan',
    query: {
      type,
      id: selectedNode.value.id,
    },
  })
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

// Watchers
watch(
  () => userStore.officeId,
  async (id) => {
    if (id) await refreshData()
  },
)

// Lifecycle
onMounted(async () => {
  await userStore.loadUserData()
  await orgStore.fetchListTargetPeriod()
  await refreshData()
})
</script>

<style scoped>
.q-page {
  background-color: #f7fafc;
}

.target-period-section {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.semester-select,
.year-select {
  min-width: 150px;
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
  font-size: 10pt;
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
  font-size: 10pt;
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

.font-weight-bold {
  font-weight: bold;
}
</style>
