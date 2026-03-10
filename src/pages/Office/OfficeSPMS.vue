<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page padding class="q-pa-md">
        <!-- Main Content -->
        <div class="row q-mb-lg">
          <!-- Left Panel: Organization Tree -->
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

                <!-- Tree Search -->
                <div class="q-mb-md">
                  <q-input
                    dense
                    outlined
                    v-model="treeFilter"
                    placeholder="Search organization..."
                    class="full-width"
                  />
                </div>

                <!-- Organization Tree -->
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
                          <div class="node-label">{{ scope.node.label }}</div>

                          <!-- Leaf node: show employee count badge -->
                          <q-badge
                            v-if="isLeafNode(scope.node.id)"
                            :color="getLeafBadgeColor(scope.node.id)"
                            class="q-ml-xs"
                          >
                            {{ getNodeCount(scope.node.id) }}
                          </q-badge>

                          <!-- Parent org node: show completion ratio -->
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

                          <!-- Head rank badge for employees -->
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

          <!-- Right Panel: Employee Table -->
          <div class="col-12 col-md-8">
            <q-card flat bordered>
              <q-card-section>
                <!-- Header with Actions -->
                <div class="row items-center justify-between q-mb-md" v-if="selectedNode">
                  <div class="office-title">{{ selectedNodeBreadcrumb }}</div>
                  <div class="row q-gutter-sm button-container">
                    <!-- Show UWP buttons only for valid org node types -->
                    <template v-if="isOrgNode(selectedNode)">
                      <!-- Create UWP Button -->
                      <q-btn
                        class="neu-button-rect"
                        flat
                        size="sm"
                        color="green"
                        icon="person_add"
                        label="Create UWP"
                        @click="createUnitWorkPlan"
                        :disable="!canCreateUWP"
                      >
                        <q-tooltip>
                          {{ canCreateUWP ? 'Create Unit Work Plan' : uwpBlockedReason }}
                        </q-tooltip>
                      </q-btn>

                      <!-- Preview UWP Button -->
                      <q-btn
                        class="neu-button-rect"
                        flat
                        size="sm"
                        color="primary"
                        label="Preview UWP"
                        icon="print"
                        @click="showUnitWorkPlanModal"
                      >
                      </q-btn>
                    </template>
                  </div>
                </div>

                <!-- Employee Search -->
                <div class="q-mb-md">
                  <q-input
                    dense
                    outlined
                    v-model="employeeFilter"
                    placeholder="Search employees..."
                    class="full-width"
                  />
                </div>

                <!-- Employee Table (always shown when a node is selected) -->
                <template v-if="selectedNode">
                  <q-table
                    :rows="filteredEmployees"
                    :columns="columns"
                    row-key="id"
                    flat
                    bordered
                    class="clean-table"
                    :pagination="{ rowsPerPage: 10 }"
                    :loading="loading"
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
                          <span v-else>{{ props.row.rank || '-' }}</span>
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
                            <!-- QPEF: CASUAL, CONTRACTUAL, HONORARIUM only -->
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

                            <!-- OPCR: Office Head job_title only -->
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

                            <!-- IPCR: Not CONTRACTUAL/HONORARIUM, not Office Head -->
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

                            <!-- Edit: Not CONTRACTUAL/HONORARIUM -->
                            <q-btn
                              v-if="canShowEdit(props.row)"
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

  <!-- ======================================================================
       MODALS
  ====================================================================== -->

  <!-- Unit Work Plan Report Modal -->
  <q-dialog v-model="showUnitWorkPlanModalOpen" full-width>
    <unitWorkplan_report
      :targetPeriod="currentTargetPeriod"
      :filteredDivisions="filteredRow"
      :officeStructure="officeStructure"
      :firstSubLevel="firstSubLevel"
      :selectedNodeId="selectedNodeId"
      :selectedNodeLabel="selectedNode?.label || ''"
      @close="closeUnitWorkPlanModal"
    />
  </q-dialog>

  <!-- Edit UWP Modal -->
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

  <!-- IPCR Modal -->
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
import OPCRModal from 'src/components/OPCRModal.vue'
import QPEFModal from 'src/components/QPEFModal.vue'

// ============================================================================
// INITIALIZATION
// ============================================================================

const $q = useQuasar()
const orgStore = useOrganizationStore()
const userStore = useUserStore()
const router = useRouter()

// ============================================================================
// STATE
// ============================================================================

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
const show_opcr_ModalOpen = ref(false)
const show_qpef_ModalOpen = ref(false)
const showEditModalOpen = ref(false)
const employeeToEdit = ref(null)

// ============================================================================
// CONSTANTS
// ============================================================================

const EXCLUDED_STATUSES = ['CONTRACTUAL', 'HONORARIUM']
const ORG_NODE_TYPES = ['office', 'office2', 'group', 'division', 'section', 'unit']

const HEAD_RANKS = [
  'office-head',
  'division-head',
  'section-head',
  'unit-head',
  'group-head',
  'office2-head',
]

/**
 * Job title hierarchy levels — higher index = higher authority.
 * Used to determine supervisory relationships within the same org unit.
 *
 * Structure:  Office > Office2 > Group > Division > Section > Unit
 * Job titles: Office Head > Division Head > Section Head > Unit Head > Employee
 */
const JOB_TITLE_HIERARCHY = [
  'employee',
  'unit head',
  'section head',
  'division head',
  'group head',
  'office2 head',
  'office head',
]

/**
 * The cascading UWP level order.
 * Office is always the top. Each subsequent level requires the level above
 * to have its head employee's hasTargetPeriod = true before it can create.
 *
 * Order: office → office2 → group → division → section → unit
 *
 * The head job_title for each level is defined here for lookup.
 */
// const UWP_LEVEL_ORDER = ['office', 'office2', 'group', 'division', 'section', 'unit']

const UWP_LEVEL_HEAD_JOB_TITLE = {
  office: 'office head',
  office2: 'office2 head',
  group: 'group head',
  division: 'division head',
  section: 'section head',
  unit: 'unit head',
}

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
// STORE BINDINGS
// ============================================================================

const selectedSemester = computed({
  get: () => orgStore.selectedSemester,
  set: (v) => {
    orgStore.selectedSemester = v
  },
})

const selectedYear = computed({
  get: () => orgStore.selectedYear,
  set: (v) => {
    orgStore.selectedYear = v
  },
})

const availableSemesters = computed(() => orgStore.getAvailableSemesters)
const availableYears = computed(() => orgStore.getAvailableYears)
const currentTargetPeriod = computed(() => orgStore.getCurrentTargetPeriod)
const organizationTree = computed(() => orgStore.structure)

// ============================================================================
// HELPER: RANK & JOB TITLE CHECKS
// ============================================================================

const isHeadRank = (rank) => !!rank && HEAD_RANKS.some((h) => rank.toLowerCase().includes(h))

const isExcludedStatus = (status) => {
  if (!status) return false
  return EXCLUDED_STATUSES.includes(status.toUpperCase())
}

/**
 * Returns the normalized job_title string from an employee node.
 * Reads from employeeData.job_title first, then falls back to node.jobTitle.
 */
const getJobTitle = (employee) => {
  return (
    employee?.employeeData?.job_title?.toLowerCase().trim() ||
    employee?.jobTitle?.toLowerCase().trim() ||
    ''
  )
}

/**
 * Returns true if the employee is the Office Head based on job_title.
 */
const isOfficeHead = (employee) => getJobTitle(employee) === 'office head'

/**
 * Returns the numeric hierarchy level of a job title.
 * Higher number = higher authority.
 */
const getJobTitleLevel = (jobTitle) => {
  if (!jobTitle) return 0
  const normalized = jobTitle.toLowerCase().trim()
  const idx = JOB_TITLE_HIERARCHY.indexOf(normalized)
  return idx === -1 ? 0 : idx
}

// ============================================================================
// HELPER: NODE UTILITIES
// ============================================================================

/** Returns true if the node is an organizational unit (not an employee) */
const isOrgNode = (node) => node && ORG_NODE_TYPES.includes(node.type)

// ============================================================================
// UWP CASCADING LOCK LOGIC
// ============================================================================

/**
 * Checks whether a given org node has any countable employees (non-excluded).
 * Used to skip empty levels in the cascading check.
 */
const nodeHasCountableEmployees = (nodeId) => {
  const node = orgStore._findNode(nodeId)
  if (!node) return false
  const count = (n) => {
    if (!n) return 0
    if (n.type === 'employee') return shouldCountEmployee(n) ? 1 : 0
    return (n.children || []).reduce((sum, c) => sum + count(c), 0)
  }
  return count(node) > 0
}

/**
 * Finds the head employee of a specific org node based on the expected job_title
 * for that node type (e.g. 'division head' for a division node).
 *
 * Searches only the DIRECT employee children of the node.
 * Returns the employee node or null.
 */
const findNodeHeadEmployee = (node) => {
  if (!node) return null
  const expectedTitle = UWP_LEVEL_HEAD_JOB_TITLE[node.type]
  if (!expectedTitle) return null

  const directEmployees = (node.children || []).filter((c) => c.type === 'employee')
  return (
    directEmployees.find((emp) => {
      const jobTitle =
        emp.employeeData?.job_title?.toLowerCase().trim() ||
        emp.jobTitle?.toLowerCase().trim() ||
        ''
      return jobTitle === expectedTitle
    }) || null
  )
}

/**
 * Finds the ancestor node of a given type in the org tree.
 * Walks up from the selected node toward the root.
 *
 * Returns the ancestor node or null if not found.
 */
// const findAncestorOfType = (nodeId, targetType, nodes = orgStore.structure, parent = null) => {
//   if (!nodes) return null
//   for (const node of nodes) {
//     if (node.id === nodeId) return parent?.type === targetType ? parent : null
//     if (node.children) {
//       const found = findAncestorOfType(nodeId, targetType, node.children, node)
//       if (found !== null) return found
//     }
//   }
//   return null
// }

/**
 * Walks up the full ancestor chain of a node and returns all ancestor nodes
 * in order from root (office) down to direct parent.
 *
 * Example for a unit:
 *   [officeNode, divisionNode, sectionNode]  ← unit's ancestors, root-first
 */
const getAncestorChain = (nodeId, nodes = orgStore.structure, chain = []) => {
  for (const node of nodes) {
    if (node.id === nodeId) return chain
    if (node.children) {
      const result = getAncestorChain(nodeId, node.children, [...chain, node])
      if (result !== null) return result
    }
  }
  return null
}

/**
 * Core cascading UWP lock computation.
 *
 * Rules:
 * 1. Office level: ALWAYS allowed. The Office Head creates first at this level.
 *
 * 2. For all other levels (office2, group, division, section, unit):
 *    Walk UP the ancestor chain from root (office) to the selected node's direct parent.
 *    For each ancestor that is an org node type:
 *      a. If the ancestor has NO countable employees → SKIP (treat as ready).
 *      b. If the ancestor HAS countable employees → find its head employee.
 *         - If head exists and hasTargetPeriod = true → level is READY, continue.
 *         - If head does NOT exist → SKIP this level (no head to block).
 *         - If head exists but hasTargetPeriod = false → BLOCKED.
 *
 * 3. If all ancestors pass → ALLOWED.
 */
const uwpLockStatus = computed(() => {
  if (!selectedNode.value || !isOrgNode(selectedNode.value)) {
    return { allowed: false, reason: 'Select a valid organizational unit.' }
  }

  const currentType = selectedNode.value.type

  // Office level: always allowed — this is where it all starts
  if (currentType === 'office') {
    return { allowed: true, reason: '' }
  }

  // For sub-levels: check all ancestors from root down to direct parent
  const ancestors = getAncestorChain(selectedNode.value.id)

  if (!ancestors || ancestors.length === 0) {
    // No ancestors found — just allow it
    return { allowed: true, reason: '' }
  }

  // Walk each ancestor from root → direct parent
  for (const ancestor of ancestors) {
    // Only check org nodes (skip employee nodes in chain — shouldn't happen but safe)
    if (!ORG_NODE_TYPES.includes(ancestor.type)) continue

    // If this ancestor level has no countable employees → skip, treat as ready
    if (!nodeHasCountableEmployees(ancestor.id)) continue

    // Find the head of this ancestor node
    const headEmployee = findNodeHeadEmployee(ancestor)

    // No head employee found in this level → skip (no one to be blocked by)
    if (!headEmployee) continue

    // Head exists but hasn't completed their UWP targets → BLOCKED
    if (!headEmployee.hasTargetPeriod) {
      const levelLabel = ancestor.label || ancestor.type
      const headName = headEmployee.label || headEmployee.name || 'Head'
      return {
        allowed: false,
        reason: `"${headName}" (${levelLabel}) has not yet completed their UWP targets. Complete the ${ancestor.type} level first before proceeding to ${currentType}.`,
      }
    }
    // Head has hasTargetPeriod = true → this level is clear, continue to next
  }

  // All ancestor levels passed
  return { allowed: true, reason: '' }
})

const canCreateUWP = computed(() => uwpLockStatus.value.allowed)
const uwpBlockedReason = computed(() => uwpLockStatus.value.reason)

// ============================================================================
// COMPUTED: SELECTED NODE & EMPLOYEES
// ============================================================================

const selectedNode = computed(() => {
  if (!selectedNodeId.value) return null
  return orgStore._findNode(selectedNodeId.value) || null
})

const selectedNodeBreadcrumb = computed(() => {
  if (!selectedNode.value) return ''
  const path = getNodePath(selectedNodeId.value)
  return path.length > 3 ? `... / ${path.slice(-2).join(' / ')}` : path.join(' / ')
})

/** Direct employee children of the selected node */
const employees = computed(() => {
  if (!selectedNode.value) return []
  if (selectedNode.value.type === 'employee') return [selectedNode.value]
  return (selectedNode.value.children || []).filter((c) => c.type === 'employee')
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

// ============================================================================
// COMPUTED: REPORT DATA
// ============================================================================

const officeStructure = computed(() => {
  const structure = orgStore.structure || []
  const findUserOffice = (nodes) => {
    if (!nodes) return null
    for (const node of nodes) {
      if (node.type === 'office') {
        const userOffice = userStore.officeData?.Office || ''
        if (node.label.includes(userOffice) || userOffice.includes(node.label)) return node
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
  if (!officeNode?.children) return []
  return officeNode.children.filter((c) => c.type !== 'employee' && ORG_NODE_TYPES.includes(c.type))
})

const filteredRow = computed(() => {
  if (!selectedNode.value) return []
  return (selectedNode.value.children || []).filter(
    (c) => c.type !== 'employee' && ORG_NODE_TYPES.includes(c.type),
  )
})

// ============================================================================
// BUTTON VISIBILITY CHECKS
// ============================================================================

const shouldCountEmployee = (employee) => {
  if (!employee?.employeeData) return false
  return !isExcludedStatus(employee.employeeData.status)
}

const shouldIncludeInUWP = (employee) => shouldCountEmployee(employee)

/** QPEF: CASUAL, CONTRACTUAL, HONORARIUM only */
const canShowQPEF = (employee) => {
  if (!employee?.employeeData) return false
  const s = employee.employeeData.status?.toUpperCase()
  return ['CASUAL', 'CONTRACTUAL', 'HONORARIUM'].includes(s)
}

/**
 * OPCR: Office Head job_title only.
 */
const canShowOPCR = (employee) => isOfficeHead(employee)

/**
 * IPCR: Not excluded status, not Office Head.
 */
const canShowIPCR = (employee) => {
  if (!employee?.employeeData) return false
  if (isExcludedStatus(employee.employeeData.status)) return false
  if (isOfficeHead(employee)) return false
  return true
}

/** Edit: Not excluded status and has target period */
const canShowEdit = (employee) => {
  if (!employee?.employeeData) return false
  if (!employee.hasTargetPeriod) return false
  return !isExcludedStatus(employee.employeeData.status)
}

// ============================================================================
// NODE TREE DISPLAY HELPERS
// ============================================================================

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
  if (s.includes('draft')) return 'info'
  if (s.includes('pending')) return 'warning'
  if (s.includes('review')) return 'purple'
  if (s.includes('rejected')) return 'negative'
  if (s.includes('returned')) return 'negative'
  return 'grey'
}

const isLeafNode = (nodeId) => orgStore.getNodeCompletion(nodeId).isLeafNode === true

const getNodeCompletionRatio = (nodeId) => orgStore.getNodeCompletion(nodeId).ratio

const getCompletionColor = (nodeId) => {
  const c = orgStore.getNodeCompletion(nodeId)
  if (c.isCompleted) return 'positive'
  if (c.total === 0) return 'grey-7'
  return 'warning'
}

const getNodeCount = (nodeId) => {
  const node = orgStore._findNode(nodeId)
  if (!node) return 0
  const count = (n) => {
    if (!n) return 0
    if (n.type === 'employee') return shouldCountEmployee(n) ? 1 : 0
    return (n.children || []).reduce((sum, c) => sum + count(c), 0)
  }
  return count(node)
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
  return node.children?.some((c) => filterMethod(c, filter))
}

// ============================================================================
// NAVIGATION & HIERARCHY HELPERS
// ============================================================================

const getNodePath = (nodeId, nodes = orgStore.structure) => {
  const path = []
  const find = (targetId, currentNodes, current) => {
    if (!currentNodes) return false
    for (const node of currentNodes) {
      const next = [...current, node.label]
      if (node.id === targetId) {
        path.push(...next)
        return true
      }
      if (node.children && find(targetId, node.children, next)) return true
    }
    return false
  }
  find(nodeId, nodes, [])
  return path
}

const getHierarchyPath = (nodeId, nodes = orgStore.structure) => {
  const path = {
    office: null,
    office2: null,
    group: null,
    division: null,
    section: null,
    unit: null,
  }
  const levels = Object.keys(path)
  let found = false

  const traverse = (currentNodes, current = []) => {
    if (found || !currentNodes) return
    for (const node of currentNodes) {
      if (node.id === nodeId) {
        current.forEach((n) => {
          if (levels.includes(n.type)) path[n.type] = { id: n.id, label: n.label, type: n.type }
        })
        if (levels.includes(node.type))
          path[node.type] = { id: node.id, label: node.label, type: node.type }
        found = true
        return
      }
      if (node.children) traverse(node.children, [...current, node])
    }
  }

  traverse(nodes)
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
      const node = orgStore._findNode(`${level}_${orgStore.slugify(levels[level])}`)
      if (node) return node
    }
  }
  return null
}

const getNodeEmployees = (nodeId) => {
  const result = []
  const node = orgStore._findNode(nodeId)
  if (!node) return result
  ;(node.children || []).forEach((child) => {
    if (child.type === 'employee' && shouldCountEmployee(child)) {
      result.push({
        id: child.id,
        label: child.label,
        position: child.position,
        rank: child.rank,
        jobTitle: child.jobTitle || child.employeeData?.job_title || '',
        ipcrStatus: child.ipcrStatus,
        isHead: child.isHead,
        hasTargetPeriod: child.hasTargetPeriod,
        employeeData: child.employeeData,
      })
    }
  })
  return result
}

const getAllEmployeesUnderNode = (nodeId) => {
  const result = []
  const collect = (node) => {
    if (!node) return
    if (node.type === 'employee') {
      if (shouldCountEmployee(node))
        result.push({
          id: node.id,
          label: node.label,
          position: node.position,
          rank: node.rank,
          jobTitle: node.jobTitle || node.employeeData?.job_title || '',
          ipcrStatus: node.ipcrStatus,
          isHead: node.isHead,
          hasTargetPeriod: node.hasTargetPeriod,
          employeeData: node.employeeData,
        })
    } else {
      ;(node.children || []).forEach(collect)
    }
  }
  collect(orgStore._findNode(nodeId))
  return result
}

// ============================================================================
// SIGNATORY FINDERS
// ============================================================================

/**
 * Returns the immediate parent org node ID for a given employee node.
 */
const getImmediateParentNodeId = (employee) => {
  const levels = getEmployeeLevels(employee)
  const levelOrder = ['unit', 'section', 'division', 'group', 'office2', 'office']
  for (const level of levelOrder) {
    if (levels[level]) {
      return `${level}_${orgStore.slugify(levels[level])}`
    }
  }
  return orgStore.structure?.[0]?.id || null
}

/**
 * Returns the parent node ID ONE level above the given org node.
 */
const getParentNodeId = (nodeId, nodes = orgStore.structure, parentId = null) => {
  if (!nodes) return null
  for (const node of nodes) {
    if (node.id === nodeId) return parentId
    if (node.children) {
      const found = getParentNodeId(nodeId, node.children, node.id)
      if (found !== null) return found
    }
  }
  return null
}

/**
 * Finds the supervisory signatory for an employee.
 */
const getSupervisorySignatory = (employee) => {
  if (!employee) return null
  if (isOfficeHead(employee)) return null

  const employeeJobTitleLevel = getJobTitleLevel(getJobTitle(employee))

  const findSupervisorInNode = (nodeId) => {
    const directEmps = getNodeEmployees(nodeId)
    const candidates = directEmps
      .filter((emp) => {
        if (emp.id === employee.id) return false
        return getJobTitleLevel(getJobTitle(emp)) > employeeJobTitleLevel
      })
      .sort((a, b) => getJobTitleLevel(getJobTitle(a)) - getJobTitleLevel(getJobTitle(b)))
    return candidates[0] || null
  }

  const immediateParentId = getImmediateParentNodeId(employee)
  if (!immediateParentId) return null

  const supervisorInParent = findSupervisorInNode(immediateParentId)
  if (supervisorInParent) return supervisorInParent

  let currentNodeId = immediateParentId
  while (currentNodeId) {
    const parentId = getParentNodeId(currentNodeId)
    if (!parentId) break

    const parentNode = orgStore._findNode(parentId)
    if (!parentNode) break

    if (parentNode.type === 'office') break

    const found = findSupervisorInNode(parentId)
    if (found) return found

    currentNodeId = parentId
  }

  return null
}

/**
 * Finds the managerial (Office Head) signatory for any employee.
 */
const getManagerialSignatory = (allEmployees) => {
  if (!allEmployees) return null
  return allEmployees.find((emp) => isOfficeHead(emp)) || null
}

/**
 * Builds the full signatory object for a given employee.
 */
const buildSignatories = (employee) => {
  const levels = getEmployeeLevels(employee)

  const supervisory = getSupervisorySignatory(employee)

  const allOfficeEmployees = getAllEmployeesUnderNode(orgStore.structure?.[0]?.id)
  const managerial = getManagerialSignatory(allOfficeEmployees)

  return {
    levels,
    supervisorySignatory: supervisory
      ? {
          name: supervisory.label || supervisory.name,
          position: supervisory.position,
          rank: supervisory.rank,
          jobTitle: getJobTitle(supervisory),
        }
      : null,
    managerialSignatory: managerial
      ? {
          name: managerial.label || managerial.name,
          position: managerial.position,
          rank: managerial.rank,
          jobTitle: getJobTitle(managerial),
        }
      : null,
  }
}

// ============================================================================
// EVENT HANDLERS: NAVIGATION
// ============================================================================

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

// ============================================================================
// EVENT HANDLERS: MODALS
// ============================================================================

const showUnitWorkPlanModal = () => {
  if (!selectedNode.value)
    return $q.notify({ message: 'Please select a node first', color: 'negative' })
  filteredRows.value = employees.value
  showUnitWorkPlanModalOpen.value = true
}
const closeUnitWorkPlanModal = () => {
  showUnitWorkPlanModalOpen.value = false
}

const show_opcr_Modal = (employee) => {
  selectedEmployee.value = employee
  show_opcr_ModalOpen.value = true
}
const close_opcr_Modal = () => {
  show_opcr_ModalOpen.value = false
}

const show_qpef_Modal = (employee) => {
  if (!getParentOrgNode(employee)) {
    return $q.notify({
      message: 'Could not determine organizational hierarchy',
      color: 'negative',
      position: 'top',
    })
  }
  selectedEmployee.value = { ...employee, ...buildSignatories(employee) }
  show_qpef_ModalOpen.value = true
}
const close_qpef_Modal = () => {
  show_qpef_ModalOpen.value = false
}

const show_ipcr_Modal = (employee) => {
  if (!getParentOrgNode(employee)) {
    return $q.notify({
      message: 'Could not determine organizational hierarchy',
      color: 'negative',
      position: 'top',
    })
  }
  selectedEmployee.value = { ...employee, ...buildSignatories(employee) }
  show_ipcr_ModalOpen.value = true
}
const close_ipcr_Modal = () => {
  show_ipcr_ModalOpen.value = false
}

const showEditModal = (employee) => {
  const controlNo = employee.employeeData?.ControlNo || employee.ControlNo || employee.control_no
  const semester = currentTargetPeriod.value?.semester || orgStore.selectedSemester
  const year = currentTargetPeriod.value?.year || orgStore.selectedYear

  if (!semester || !year) {
    return $q.notify({
      message: 'Cannot open edit mode: Semester or Year is not selected',
      color: 'negative',
      position: 'top',
    })
  }

  employeeToEdit.value = { ...employee, controlNo, semester, year }
  showEditModalOpen.value = true
}
const closeEditModal = () => {
  showEditModalOpen.value = false
  employeeToEdit.value = null
}

const handleEmployeeSaved = async () => {
  try {
    await refreshData()
    $q.notify({ message: 'Employee updated successfully', color: 'positive' })
  } catch {
    $q.notify({ message: 'Failed to refresh data after edit', color: 'negative' })
  }
}

const handleStatusUpdated = async () => {
  await refreshData()
  await orgStore.fetchListTargetPeriod()
  $q.notify({
    message: 'Employee status updated successfully',
    color: 'positive',
    position: 'top',
    timeout: 2000,
  })
}

// ============================================================================
// EVENT HANDLERS: CREATE UWP
// ============================================================================

const createUnitWorkPlan = () => {
  if (!selectedNode.value)
    return $q.notify({ message: 'Please select a node first', color: 'negative' })

  // Check cascading lock at runtime
  if (!canCreateUWP.value) {
    return $q.notify({
      message: uwpBlockedReason.value,
      color: 'warning',
      position: 'top',
      timeout: 5000,
    })
  }

  const type = selectedNode.value.type
  if (!ORG_NODE_TYPES.includes(type)) {
    return $q.notify({ message: 'Please select a valid organizational unit', color: 'negative' })
  }

  const hierarchyPath = getHierarchyPath(selectedNode.value.id)
  if (!hierarchyPath)
    return $q.notify({ message: 'Failed to build organizational hierarchy', color: 'negative' })

  const rawEmployees = getNodeEmployees(selectedNode.value.id)
  const allEmployees = rawEmployees.map((emp) => {
    const supervisorNode = getSupervisorySignatory(emp)
    return {
      ...emp,
      supervisorySignatory: supervisorNode
        ? {
            name: supervisorNode.label || supervisorNode.name,
            position: supervisorNode.position,
            rank: supervisorNode.rank,
            jobTitle: getJobTitle(supervisorNode),
          }
        : null,
    }
  })
  const availableEmployees = allEmployees.filter(shouldIncludeInUWP)
  const filteredAvailableEmployees = availableEmployees.filter((e) => e.hasTargetPeriod === true)
  const employeesWithoutTargetPeriod = availableEmployees.filter((e) => e.hasTargetPeriod === false)

  const uwpData = {
    type,
    selectedNodeId: selectedNode.value.id,
    selectedNodeLabel: selectedNode.value.label,
    breadcrumb: getNodePath(selectedNodeId.value),
    hierarchy: hierarchyPath,
    availableEmployees,
    filteredAvailableEmployees,
    employeesWithoutTargetPeriod,
    totalAvailableEmployees: availableEmployees.length,
    filteredAvailableEmployeesCount: filteredAvailableEmployees.length,
    employeesWithoutTargetPeriodCount: employeesWithoutTargetPeriod.length,
    selectedEmployees: [],
    targetPeriod: currentTargetPeriod.value,
    timestamp: new Date().toISOString(),
  }

  sessionStorage.setItem('uwpData', JSON.stringify(uwpData))
  router.push({ name: 'unitworkplan', query: { type, id: selectedNode.value.id } })
}

// ============================================================================
// EVENT HANDLERS: DELETE
// ============================================================================

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

// ============================================================================
// DATA REFRESH
// ============================================================================

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

// ============================================================================
// WATCHERS & LIFECYCLE
// ============================================================================

watch(
  () => userStore.officeId,
  async (id) => {
    if (id) await refreshData()
  },
)

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
  white-space: normal;
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
</style>
