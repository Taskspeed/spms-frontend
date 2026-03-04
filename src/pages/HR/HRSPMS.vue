<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page padding class="q-pa-md">
        <!-- Main Content -->
        <div class="row q-mb-lg">
          <!-- ================================================================
               LEFT PANEL: Organization Tree
          ================================================================ -->
          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section>
                <!-- Semester and Year Filters -->
                <div class="row q-gutter-sm items-center q-mb-sm">
                  <q-select
                    v-model="selectedSemester"
                    :options="availableSemesters"
                    label="Semester"
                    outlined
                    dense
                    emit-value
                    map-options
                    class="col"
                    @update:model-value="onSemesterChange"
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
                    class="col"
                    @update:model-value="onYearChange"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" size="xs" />
                    </template>
                  </q-select>
                </div>

                <!-- Office Dropdown -->
                <div class="row q-mb-md">
                  <q-select
                    v-model="selectedOffice"
                    :options="filteredOfficeOptions"
                    option-label="name"
                    label="Select Office"
                    dense
                    outlined
                    clearable
                    use-input
                    hide-selected
                    fill-input
                    input-debounce="300"
                    color="red-10"
                    class="full-width office-select"
                    :loading="userManageStore.loading"
                    @filter="filterOffices"
                    @update:model-value="onOfficeChange"
                  >
                    <template v-slot:prepend>
                      <q-icon name="business" />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">No offices found</q-item-section>
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

                <!-- No Office Selected Placeholder -->
                <div v-if="!selectedOffice" class="text-center q-pa-lg">
                  <q-icon name="business" size="3rem" color="grey-5" />
                  <div class="text-grey-7 q-mt-sm">
                    Please select an office to view the organization structure
                  </div>
                </div>

                <!-- Organization Tree (shown when office is selected) -->
                <template v-else>
                  <div class="row q-mb-md">
                    <q-input
                      v-model="treeFilter"
                      placeholder="Search organization..."
                      dense
                      outlined
                      class="full-width"
                    />
                  </div>

                  <q-tree
                    :nodes="organizationTree"
                    node-key="id"
                    v-model:selected="selectedNodeId"
                    :filter="treeFilter"
                    :filter-method="filterMethod"
                    :loading="orgStore.loading"
                    default-expand-all
                    class="org-tree"
                    @update:selected="onNodeSelect"
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
                            <div class="node-label">{{ scope.node.label }}</div>

                            <!-- Leaf node: show employee count badge -->
                            <q-badge
                              v-if="isLeafNode(scope.node.id)"
                              :color="getLeafBadgeColor(scope.node.id)"
                              class="q-ml-xs"
                            >
                              {{ getNodeCount(scope.node.id) }}
                            </q-badge>

                            <!-- Parent node: show completion ratio badge -->
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

                            <!-- Head rank badge -->
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
                </template>
              </q-card-section>
            </q-card>
          </div>

          <!-- ================================================================
               RIGHT PANEL: Employee Table
          ================================================================ -->
          <div class="col-12 col-md-8">
            <q-card flat bordered>
              <q-card-section>
                <!-- No Office Selected Placeholder -->
                <div v-if="!selectedOffice" class="text-center q-pa-xl">
                  <q-icon name="folder_open" size="4rem" color="grey-5" />
                  <div class="text-h6 text-grey-7 q-mt-md">No Office Selected</div>
                  <div class="text-grey-6 q-mt-sm">
                    Select an office from the dropdown to view employees
                  </div>
                </div>

                <template v-else>
                  <!-- Header breadcrumb -->
                  <div class="row items-center justify-between q-mb-md" v-if="selectedNode">
                    <div class="office-title">{{ selectedNodeBreadcrumb }}</div>
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

                  <!-- Employee Search -->
                  <div class="row q-mb-md">
                    <q-input
                      v-model="employeeFilter"
                      placeholder="Search employees..."
                      dense
                      outlined
                      class="full-width"
                    />
                  </div>

                  <!-- Employee Table -->
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
                        <!-- Name Column -->
                        <q-td key="name" :props="props">
                          <div class="row items-center no-wrap full-width">
                            <q-icon
                              :name="props.row.isHead ? 'supervisor_account' : 'person'"
                              :color="props.row.isHead ? 'blue' : 'grey'"
                              size="sm"
                              class="q-mr-sm flex-shrink-0"
                            />
                            <div class="employee-info full-width">
                              <div>{{ props.row.label }}</div>
                              <div class="text-caption text-grey-7">{{ props.row.position }}</div>
                            </div>
                          </div>
                        </q-td>

                        <!-- Rank Column -->
                        <q-td key="rank" :props="props">
                          <q-badge v-if="isHeadRank(props.row.rank)" color="green" class="q-mr-xs">
                            {{ props.row.rank || '-' }}
                          </q-badge>
                          <span v-else class="text-body2">{{ props.row.rank || '-' }}</span>
                        </q-td>

                        <!-- Status Column -->
                        <q-td key="ipcr_status" :props="props">
                          <q-badge
                            :color="getStatusColor(props.row)"
                            :label="props.row.ipcrStatus || '-'"
                            class="status-badge"
                          />
                        </q-td>

                        <!-- Target Period Column -->
                        <q-td key="target_period" :props="props" class="text-center">
                          <q-icon
                            v-if="props.row.hasTargetPeriod"
                            name="check_circle"
                            color="positive"
                            size="sm"
                          />
                          <q-icon v-else name="cancel" color="negative" size="sm" />
                        </q-td>

                        <!-- Actions Column -->
                        <q-td key="actions" :props="props" class="text-center">
                          <div class="row justify-center q-gutter-xs">
                            <!-- QPEF: Only for CASUAL, CONTRACTUAL, HONORARIUM -->
                            <q-btn
                              v-if="canShowQPEF(props.row)"
                              class="neu-button"
                              flat
                              round
                              color="purple"
                              icon="assignment_ind"
                              size="md"
                              @click="show_qpef_Modal(props.row)"
                            >
                              <q-tooltip>QPEF</q-tooltip>
                            </q-btn>

                            <!-- OPCR: Only for Managerial rank -->
                            <q-btn
                              v-if="canShowOPCR(props.row)"
                              class="neu-button"
                              flat
                              round
                              color="red"
                              icon="assignment_ind"
                              size="md"
                              @click="show_opcr_Modal(props.row)"
                            >
                              <q-tooltip>OPCR</q-tooltip>
                            </q-btn>

                            <!-- IPCR: Only if NOT CONTRACTUAL or HONORARIUM, and NOT Managerial -->
                            <q-btn
                              v-if="canShowIPCR(props.row)"
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

  <!-- ================================================================
       MODALS
  ================================================================ -->

  <!-- Unit Work Plan Report Modal -->
  <q-dialog v-model="showUnitWorkPlanModalOpen" full-width>
    <UWPModalHR
      :targetPeriod="currentTargetPeriod"
      :filteredDivisions="filteredRow"
      :officeStructure="officeStructure"
      :firstSubLevel="firstSubLevel"
      :selectedNodeId="selectedNodeId"
      :selectedNodeLabel="selectedNode?.label || ''"
      :officeId="resolvedOfficeId"
      @close="closeUnitWorkPlanModal"
    />
  </q-dialog>

  <q-dialog v-model="show_ipcr_ModalOpen" full-width>
    <ipcr_Report
      :employee="selectedEmployee"
      :targetPeriod="currentTargetPeriod"
      :levels="selectedEmployee?.levels"
      :supervisorySignatory="selectedEmployee?.supervisorySignatory"
      :managerialSignatory="selectedEmployee?.managerialSignatory"
      @close="close_ipcr_Modal"
      @status-updated="handleStatusUpdated"
    />
  </q-dialog>

  <!-- OPCR Modal -->
  <q-dialog v-model="show_opcr_ModalOpen">
    <OPCRModal
      :employee="selectedEmployee"
      :targetPeriod="currentTargetPeriod"
      @close="close_opcr_Modal"
    />
  </q-dialog>

  <!-- QPEF Modal -->
  <q-dialog v-model="show_qpef_ModalOpen">
    <QPEFModal
      :employee="selectedEmployee"
      :targetPeriod="currentTargetPeriod"
      :levels="selectedEmployee?.levels"
      :supervisorySignatory="selectedEmployee?.supervisorySignatory"
      :managerialSignatory="selectedEmployee?.managerialSignatory"
      @close="close_qpef_Modal"
    />
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useOrganizationStore } from 'src/stores/office/spmsStore'
import { useUserStore } from 'src/stores/userStore'
import { useUserManageStore } from 'src/stores/hr_Store/account_manage_Store'
import { useQuasar } from 'quasar'
import ipcr_Report from 'src/components/IPCRReportHR.vue'
import OPCRModal from 'src/components/OPCRModalHR.vue'
import QPEFModal from 'src/components/QPEFModal.vue'
import UWPModalHR from 'src/components/UWPModalHR.vue'

// ============================================================================
// INITIALIZATION
// ============================================================================

const $q = useQuasar()
const orgStore = useOrganizationStore()
const userStore = useUserStore()
const userManageStore = useUserManageStore()

// ============================================================================
// STATE
// ============================================================================

const selectedEmployee = ref(null)
const selectedNodeId = ref(null)
const filteredRows = ref([])
const loading = ref(false)
const treeFilter = ref('')
const employeeFilter = ref('')
const showUnitWorkPlanModalOpen = ref(false)

// Modal visibility
const show_ipcr_ModalOpen = ref(false)
const show_opcr_ModalOpen = ref(false)
const show_qpef_ModalOpen = ref(false)

// Office dropdown — stores the full office object (NOT emit-value)
const selectedOffice = ref(null)
const filteredOfficeOptions = ref([])

// ============================================================================
// CONSTANTS
// ============================================================================

const EXCLUDED_STATUSES = ['CONTRACTUAL', 'HONORARIUM']

const HEAD_RANKS = [
  'office-head',
  'division-head',
  'section-head',
  'unit-head',
  'group-head',
  'office2-head',
]

const columns = ref([
  { name: 'name', align: 'left', label: 'Name', field: 'label', sortable: true },
  { name: 'rank', align: 'left', label: 'Rank', field: 'rank', sortable: true },
  { name: 'ipcr_status', align: 'left', label: 'Status', field: 'ipcrStatus', sortable: true },
  {
    name: 'target_period',
    align: 'center',
    label: 'Targets',
    field: 'hasTargetPeriod',
    sortable: false,
  },
  { name: 'actions', align: 'center', label: 'Actions', field: 'actions' },
])

// ============================================================================
// COMPUTED — Store Bindings
// ============================================================================

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

// ============================================================================
// COMPUTED — Resolved Office ID
// ✅ FIX: handles both officeId and id field names from the API
// ============================================================================

const resolvedOfficeId = computed(() => {
  if (!selectedOffice.value) return null
  // API returns { officeId: "1", office: "..." } — check both field names
  return selectedOffice.value.officeId || selectedOffice.value.id || null
})

// ============================================================================
// COMPUTED — Derived UI Data
// ============================================================================

const officeStructure = computed(() => {
  const structure = orgStore.structure || []

  const findUserOffice = (nodes) => {
    if (!nodes) return null

    for (const node of nodes) {
      if (node.type === 'office') {
        const userOffice = userStore.officeData?.Office || ''
        if (node.label.includes(userOffice) || userOffice.includes(node.label)) {
          return node
        }
      }
      const found = findUserOffice(node.children)
      if (found) return found
    }
    return null
  }

  const userOfficeNode = findUserOffice(structure)
  return userOfficeNode ? [userOfficeNode] : structure
})

const firstSubLevel = computed(() => {
  if (!selectedNode.value) return []

  const getOfficeNode = (nodes) => {
    if (!nodes) return null
    for (const node of nodes) {
      if (node.type === 'office') return node
      const found = getOfficeNode(node.children)
      if (found) return found
    }
    return null
  }

  const officeNode = getOfficeNode(orgStore.structure)
  if (!officeNode || !officeNode.children) return []

  return officeNode.children.filter(
    (child) =>
      child.type !== 'employee' &&
      ['office2', 'group', 'division', 'section', 'unit'].includes(child.type),
  )
})

const filteredRow = computed(() => {
  if (!selectedNode.value) return []

  const getSubNodes = (node) => {
    if (!node.children) return []
    return node.children.filter(
      (child) =>
        child.type !== 'employee' &&
        ['office2', 'group', 'division', 'section', 'unit'].includes(child.type),
    )
  }

  return getSubNodes(selectedNode.value)
})

const selectedNode = computed(() => {
  const findNode = (nodes) => {
    if (!nodes) return null
    return (
      nodes.find((n) => n.id === selectedNodeId.value) ||
      nodes.reduce((acc, n) => acc || findNode(n.children), null)
    )
  }
  return selectedNodeId.value ? findNode(orgStore.structure) : null
})

const selectedNodeBreadcrumb = computed(() => {
  if (!selectedNode.value) return ''
  const path = getNodePath(selectedNodeId.value)
  return path.length > 3 ? `... / ${path.slice(-2).join(' / ')}` : path.join(' / ')
})

const employees = computed(() => {
  if (!selectedNode.value) return []
  if (selectedNode.value.type === 'employee') return [selectedNode.value]
  return selectedNode.value.children?.filter((c) => c.type === 'employee') || []
})

const filteredEmployees = computed(() => {
  if (!employeeFilter.value) return employees.value
  const term = employeeFilter.value.toLowerCase()
  return employees.value.filter(
    (emp) =>
      emp.label?.toLowerCase().includes(term) ||
      emp.position?.toLowerCase().includes(term) ||
      emp.rank?.toLowerCase().includes(term),
  )
})

// Add this method to SPMSDashboard.vue
const handleStatusUpdated = async () => {
  console.log('🔄 Status updated, refreshing data...')

  // Refresh the organization data to get updated statuses
  await refreshData()

  // Also refresh the target periods list
  await orgStore.fetchListTargetPeriod()

  $q.notify({
    message: 'Employee status updated successfully',
    color: 'positive',
    position: 'top',
    timeout: 2000,
  })
}

// ============================================================================
// UTILITY — Status & Rank Checks
// ============================================================================

const isExcludedStatus = (status) => !!status && EXCLUDED_STATUSES.includes(status.toUpperCase())

const isHeadRank = (rank) => !!rank && HEAD_RANKS.some((h) => rank.toLowerCase().includes(h))

const shouldCountEmployee = (employee) =>
  !!employee?.employeeData && !isExcludedStatus(employee.employeeData.status)

// ============================================================================
// UTILITY — Button Visibility
// ============================================================================

/** QPEF: shown only for CASUAL, CONTRACTUAL, HONORARIUM */
const canShowQPEF = (employee) => {
  const status = employee?.employeeData?.status?.toUpperCase()
  return ['CASUAL', 'CONTRACTUAL', 'HONORARIUM'].includes(status)
}

/** OPCR: shown only for Managerial rank */
const canShowOPCR = (employee) => {
  const rank = employee?.rank?.toLowerCase()
  return !!rank && (rank === 'managerial' || rank.includes('managerial'))
}

/** IPCR: shown only if NOT excluded status AND NOT Managerial */
const canShowIPCR = (employee) => {
  if (!employee?.employeeData) return false
  if (isExcludedStatus(employee.employeeData.status)) return false
  const rank = employee.rank?.toLowerCase()
  return !(rank === 'managerial' || rank?.includes('managerial'))
}

// ============================================================================
// UTILITY — Node Display Helpers
// ============================================================================

const getNodeIcon = (node) => {
  if (node.type === 'employee') {
    return isHeadRank(node.rank) ? 'supervisor_account' : 'person'
  }
  const icons = {
    office: 'account_balance',
    office2: 'business',
    group: 'group_work',
    division: 'corporate_fare',
    section: 'view_quilt',
    unit: 'widgets',
  }
  return icons[node.type] || 'help_outline'
}

const getStatusColor = (row) => {
  const s = row.ipcrStatus?.toLowerCase() || ''
  if (s.includes('approved')) return 'positive'
  if (s.includes('draft')) return 'info'
  if (s.includes('pending')) return 'warning'
  if (s.includes('review')) return 'purple'
  if (s.includes('rejected')) return 'negative'
  if (s.includes('returned')) return 'negative'
  return 'grey' // Grey for no status
}

const isLeafNode = (nodeId) => orgStore.getNodeCompletion(nodeId).isLeafNode === true

const getNodeCompletionRatio = (nodeId) => orgStore.getNodeCompletion(nodeId).ratio

const getCompletionColor = (nodeId) => {
  const completion = orgStore.getNodeCompletion(nodeId)
  if (completion.isCompleted) return 'positive'
  if (completion.total === 0) return 'grey-7'
  return 'warning'
}

const getNodeCount = (nodeId) => {
  const node = orgStore._findNode(nodeId)
  if (!node) return 0
  return countEmployeesRecursive(node)
}

const countEmployeesRecursive = (node) => {
  if (!node) return 0
  if (node.type === 'employee') return shouldCountEmployee(node) ? 1 : 0
  return node.children?.reduce((sum, child) => sum + countEmployeesRecursive(child), 0) ?? 0
}

const getLeafBadgeColor = (nodeId) => (getNodeCount(nodeId) > 0 ? 'positive' : 'grey-5')

const filterMethod = (node, filter) => {
  if (!filter) return true
  const term = filter.toLowerCase()
  if (node.label?.toLowerCase().includes(term)) return true
  if (
    node.type === 'employee' &&
    (node.position?.toLowerCase().includes(term) || node.rank?.toLowerCase().includes(term))
  )
    return true
  return node.children?.some((child) => filterMethod(child, filter)) ?? false
}

// ============================================================================
// UTILITY — Navigation & Hierarchy
// ============================================================================

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
      if (node.children && findPath(targetId, node.children, newPath)) return true
    }
    return false
  }

  findPath(nodeId, nodes, [])
  return path
}

const getEmployeeLevels = (employee) => ({
  office: employee?.employeeData?.office || employee?.office || null,
  office2: employee?.employeeData?.office2 || employee?.office2 || null,
  group: employee?.employeeData?.group || employee?.group || null,
  division: employee?.employeeData?.division || employee?.division || null,
  section: employee?.employeeData?.section || employee?.section || null,
  unit: employee?.employeeData?.unit || employee?.unit || null,
})

const getParentOrgNode = (employeeNode) => {
  if (!employeeNode || employeeNode.type !== 'employee') return selectedNode.value

  const levels = getEmployeeLevels(employeeNode)
  const levelOrder = ['unit', 'section', 'division', 'group', 'office2', 'office']

  for (const level of levelOrder) {
    if (levels[level]) {
      const nodeId = `${level}_${orgStore.slugify(levels[level])}`
      const node = orgStore._findNode(nodeId)
      if (node) return node
    }
  }

  return null
}

// ============================================================================
// UTILITY — Employees Under a Node
// ============================================================================

const getDirectEmployees = (nodeId) => {
  const employees = []
  const findAndCollect = (nodes, targetId) => {
    if (!nodes) return false
    for (const node of nodes) {
      if (node.id === targetId) {
        node.children?.forEach((child) => {
          if (child.type === 'employee' && shouldCountEmployee(child)) {
            employees.push(child)
          }
        })
        return true
      }
      if (node.children && findAndCollect(node.children, targetId)) return true
    }
    return false
  }
  findAndCollect(orgStore.structure, nodeId)
  return employees
}

const getAllEmployeesUnderNode = (nodeId) => {
  const employees = []

  const collect = (node) => {
    if (!node) return
    if (node.type === 'employee') {
      if (shouldCountEmployee(node)) employees.push(node)
    } else {
      node.children?.forEach(collect)
    }
  }

  const findAndCollect = (nodes, targetId) => {
    if (!nodes) return false
    for (const node of nodes) {
      if (node.id === targetId) {
        collect(node)
        return true
      }
      if (node.children && findAndCollect(node.children, targetId)) return true
    }
    return false
  }

  findAndCollect(orgStore.structure, nodeId)
  return employees
}

// ============================================================================
// UTILITY — Signatory Resolution
// ============================================================================

const getSupervisoryAtSameLevel = (employee, levels, allEmployees) => {
  if (!employee || !levels || !allEmployees) return null

  const employeeRank = employee.rank?.toLowerCase()
  if (
    employeeRank === 'supervisory' ||
    employeeRank === 'managerial' ||
    employeeRank?.includes('supervisory') ||
    employeeRank?.includes('managerial')
  )
    return null

  return (
    allEmployees.find((emp) => {
      if (emp.id === employee.id) return false

      const rank = emp.rank?.toLowerCase()
      const isSupervisory =
        rank === 'supervisory' ||
        rank?.includes('supervisory') ||
        rank?.includes('head') ||
        (rank?.includes('supervisor') && !rank?.includes('non-supervisory'))

      if (!isSupervisory) return false

      const empLevels = getEmployeeLevels(emp)
      return (
        (levels.unit && empLevels.unit === levels.unit) ||
        (levels.section && empLevels.section === levels.section) ||
        (levels.division && empLevels.division === levels.division) ||
        (levels.group && empLevels.group === levels.group) ||
        (levels.office2 && empLevels.office2 === levels.office2) ||
        (levels.office && empLevels.office === levels.office)
      )
    }) || null
  )
}

const getManagerialInOffice = (levels, allEmployees) => {
  if (!levels.office || !allEmployees) return null

  return (
    allEmployees.find((emp) => {
      const rank = emp.rank?.toLowerCase()
      const isManagerial =
        rank === 'managerial' ||
        rank?.includes('managerial') ||
        rank?.includes('manager') ||
        rank?.includes('department head') ||
        rank?.includes('office head')

      if (!isManagerial) return false

      const empLevels = getEmployeeLevels(emp)
      return empLevels.office === levels.office
    }) || null
  )
}

const resolveEmployeeWithSignatories = (employee) => {
  const levels = getEmployeeLevels(employee)
  const parentOrgNode = getParentOrgNode(employee)

  if (!parentOrgNode) {
    $q.notify({
      message: 'Could not determine organizational hierarchy',
      color: 'negative',
      position: 'top',
    })
    return null
  }

  const directEmployees = getDirectEmployees(parentOrgNode.id)
  const supervisory = getSupervisoryAtSameLevel(employee, levels, directEmployees)

  let officeEmployees = getAllEmployeesUnderNode(parentOrgNode.id)
  if (levels.office) {
    const officeNode = orgStore._findNode(`office_${orgStore.slugify(levels.office)}`)
    if (officeNode) officeEmployees = getAllEmployeesUnderNode(officeNode.id)
  }

  const managerial = getManagerialInOffice(levels, officeEmployees)

  return {
    ...employee,
    levels,
    supervisorySignatory: supervisory
      ? {
          name: supervisory.label || supervisory.name,
          position: supervisory.position,
          rank: supervisory.rank,
        }
      : null,
    managerialSignatory: managerial
      ? {
          name: managerial.label || managerial.name,
          position: managerial.position,
          rank: managerial.rank,
        }
      : null,
  }
}

// ============================================================================
// EVENT HANDLERS — Tree & Filters
// ============================================================================

const onNodeSelect = (nodeId) => {
  selectedNodeId.value = nodeId
  employeeFilter.value = ''
}

const onSemesterChange = async () => {
  if (selectedSemester.value && selectedYear.value) {
    await orgStore.setTargetPeriod(selectedSemester.value, selectedYear.value)
    if (selectedOffice.value) await refreshData()
  }
}

const onYearChange = async () => {
  if (!selectedYear.value) return
  const semesters = availableSemesters.value
  if (semesters.length > 0 && !semesters.includes(selectedSemester.value)) {
    selectedSemester.value = semesters[0]
  }
  if (selectedSemester.value) {
    await orgStore.setTargetPeriod(selectedSemester.value, selectedYear.value)
    if (selectedOffice.value) await refreshData()
  }
}

const onOfficeChange = async (office) => {
  if (office) {
    employeeFilter.value = ''
    treeFilter.value = ''

    // ✅ FIX: resolve the correct id field from the office object
    const officeId = office.officeId || office.id || null
    console.log('Selected office object:', JSON.stringify(office))
    console.log('Resolved officeId:', officeId)

    userStore.officeId = officeId
    await refreshData()

    // Auto-select the top-level office node
    const findOfficeNode = (nodes) => {
      if (!nodes) return null
      for (const node of nodes) {
        if (node.type === 'office') return node
        const found = findOfficeNode(node.children)
        if (found) return found
      }
      return null
    }
    const officeNode = findOfficeNode(orgStore.structure)
    if (officeNode) selectedNodeId.value = officeNode.id
  } else {
    userStore.officeId = null
    orgStore.structure = []
    selectedNodeId.value = null
  }
}

const filterOffices = (val, update) => {
  update(() => {
    const offices = userManageStore.offices || []
    filteredOfficeOptions.value = val
      ? offices.filter((o) => (o.name ?? '').toLowerCase().includes(val.toLowerCase()))
      : offices
  })
}

// ============================================================================
// EVENT HANDLERS — Modals
// ============================================================================

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
  const resolved = resolveEmployeeWithSignatories(employee)
  if (!resolved) return
  selectedEmployee.value = resolved
  show_ipcr_ModalOpen.value = true
}

const close_ipcr_Modal = () => {
  show_ipcr_ModalOpen.value = false
}

const show_opcr_Modal = (employee) => {
  selectedEmployee.value = employee
  show_opcr_ModalOpen.value = true
}

const close_opcr_Modal = () => {
  show_opcr_ModalOpen.value = false
}

const show_qpef_Modal = (employee) => {
  const resolved = resolveEmployeeWithSignatories(employee)
  if (!resolved) return
  selectedEmployee.value = resolved
  show_qpef_ModalOpen.value = true
}

const close_qpef_Modal = () => {
  show_qpef_ModalOpen.value = false
}

// ============================================================================
// DATA REFRESH
// ============================================================================

const refreshData = async () => {
  loading.value = true
  try {
    await orgStore.fetchStructureHR()
  } catch (error) {
    $q.notify({
      message: `Failed to refresh data: ${error.message || 'Unknown error'}`,
      color: 'negative',
    })
  } finally {
    loading.value = false
  }
}

// ============================================================================
// WATCHERS
// ============================================================================

watch(
  () => userManageStore.offices,
  (offices) => {
    if (offices?.length > 0) filteredOfficeOptions.value = offices
  },
)

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(async () => {
  await userStore.loadUserData()
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

/* Neumorphic round button (action icons) */
.neu-button {
  border-radius: 50%;
  background: #f7fafc;
  box-shadow:
    3px 3px 6px rgba(0, 0, 0, 0.15),
    -3px -3px 6px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
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

/* Breadcrumb title */
.office-title {
  font-size: 10pt;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Organization tree */
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
  white-space: normal;
}

/* Employee table */
.employee-info {
  min-width: 0;
  overflow: hidden;
}

.employee-info > div {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Office select with auto-height */
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

.selected-office-name,
.office-option-label {
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
}

.selected-office-name {
  padding: 2px 0;
}
</style>
