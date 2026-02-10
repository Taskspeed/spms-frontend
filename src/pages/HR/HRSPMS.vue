//hr-spms
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page padding class="q-pa-md">
        <!-- Main Content -->
        <div class="row q-mb-lg">
          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section>
                <!-- Target Period Selection -->
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

                <!-- No Office Selected Message -->
                <div v-if="!selectedOffice" class="text-center q-pa-lg">
                  <q-icon name="business" size="3rem" color="grey-5" />
                  <div class="text-grey-7 q-mt-sm">
                    Please select an office to view the organization structure
                  </div>
                </div>

                <!-- Organization Tree Search -->
                <template v-else>
                  <div class="row q-mb-md">
                    <q-input
                      dense
                      outlined
                      v-model="treeFilter"
                      placeholder="Search organization..."
                      class="full-width"
                    >
                      <!-- <template v-slot:append>
                        <q-icon name="search" />
                      </template> -->
                    </q-input>
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
                            <div class="node-label">
                              {{ scope.node.label }}
                            </div>

                            <!-- For bottom-level org nodes (leaf org nodes) show employee count -->
                            <q-badge
                              v-if="isLeafNode(scope.node.id)"
                              :color="getLeafBadgeColor(scope.node.id)"
                              class="q-ml-xs"
                            >
                              {{ getNodeCount(scope.node.id) }}
                            </q-badge>

                            <!-- For parent nodes, show child org unit completion -->
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
                </template>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-8">
            <q-card flat bordered>
              <q-card-section>
                <!-- Header with breadcrumb and actions -->
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

                <!-- No Office Selected Message for Table -->
                <div v-if="!selectedOffice" class="text-center q-pa-xl">
                  <q-icon name="folder_open" size="4rem" color="grey-5" />
                  <div class="text-h6 text-grey-7 q-mt-md">No Office Selected</div>
                  <div class="text-grey-6 q-mt-sm">
                    Select an office from the dropdown to view employees
                  </div>
                </div>

                <template v-else>
                  <!-- Search Input -->
                  <div class="row q-mb-md">
                    <q-input
                      dense
                      outlined
                      v-model="employeeFilter"
                      placeholder="Search employees..."
                      class="full-width"
                    >
                      <!-- <template v-slot:append>
                        <q-icon name="search" />
                      </template> -->
                    </q-input>
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
                              color="red"
                              icon="assignment_ind"
                              size="md"
                              @click="show_opcr_Modal(props.row)"
                            >
                              <q-tooltip>OPCR</q-tooltip>
                            </q-btn>
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

  <!-- Unit Work Plan Report -->
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
      :levels="selectedEmployee?.levels"
      :supervisorySignatory="selectedEmployee?.supervisorySignatory"
      :managerialSignatory="selectedEmployee?.managerialSignatory"
      @close="close_ipcr_Modal"
    />
  </q-dialog>

  <!-- OPCR Modal -->
  <q-dialog v-model="show_opcr_ModalOpen" full-width>
    <OPCRModal
      :employee="selectedEmployee"
      :targetPeriod="currentTargetPeriod"
      @close="close_opcr_Modal"
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
import { api } from 'boot/axios'
import { useOrganizationStore } from 'src/stores/office/spmsStore'
import { useUserStore } from 'src/stores/userStore'
import { useUserManageStore } from 'src/stores/hr_Store/account_manage_Store'
import unitWorkplan_report from 'src/components/unitworkplant_Report.vue'
import EditUWP from 'src/components/EditUWPModal.vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ipcr_Report from 'src/components/ipcr_Report.vue'
import OPCRModal from 'src/components/office/InputPage.vue'

const $q = useQuasar()
const orgStore = useOrganizationStore()
const userStore = useUserStore()
const userManageStore = useUserManageStore()
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
const show_opcr_ModalOpen = ref(false)
const uwpValidationDialog = ref(false)
const uwpValidationMessage = ref('')
const uwpIncompleteItems = ref([])

// Office dropdown state
const selectedOffice = ref(null)
const filteredOfficeOptions = ref([])

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

// Office structure computed properties
const officeStructure = computed(() => {
  const structure = orgStore.structure || []

  // Find the office node that matches the selected office
  const findUserOffice = (nodes) => {
    if (!nodes) return null

    for (const node of nodes) {
      if (node.type === 'office') {
        // Check if this is the selected office
        if (selectedOffice.value && node.label.includes(selectedOffice.value.name)) {
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

// Get the first sub-level nodes under the office
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

// Helper function to recursively collect all employees under a node
const getAllEmployeesUnderNode = (nodeId, nodes = orgStore.structure) => {
  const employees = []

  const collectEmployees = (node) => {
    if (!node) return

    if (node.type === 'employee') {
      employees.push({
        id: node.id,
        label: node.label,
        position: node.position,
        rank: node.rank,
        ipcrStatus: node.ipcrStatus,
        isHead: node.isHead,
        hasTargetPeriod: node.hasTargetPeriod,
        employeeData: node.employeeData,
      })
    } else if (node.children) {
      node.children.forEach((child) => collectEmployees(child))
    }
  }

  const findAndCollect = (currentNodes, targetId) => {
    if (!currentNodes) return false

    for (const node of currentNodes) {
      if (node.id === targetId) {
        collectEmployees(node)
        return true
      }

      if (node.children && findAndCollect(node.children, targetId)) {
        return true
      }
    }
    return false
  }

  findAndCollect(nodes, nodeId)
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

  const node = orgStore._findNode(nodeId)
  if (node && node.isLeaf) {
    return completion.ratio
  }

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

    if (node.isLeaf) {
      return countAllEmployees(node)
    }

    return node.directCount || 0
  } catch {
    return 0
  }
}

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

// Office dropdown filter function
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

// Helper method to extract hierarchy levels from employee data
const getEmployeeLevels = (employee) => {
  if (!employee) {
    return {
      office: null,
      office2: null,
      group: null,
      division: null,
      section: null,
      unit: null,
    }
  }

  return {
    office: employee.employeeData?.office || employee.office || null,
    office2: employee.employeeData?.office2 || employee.office2 || null,
    group: employee.employeeData?.group || employee.group || null,
    division: employee.employeeData?.division || employee.division || null,
    section: employee.employeeData?.section || employee.section || null,
    unit: employee.employeeData?.unit || employee.unit || null,
  }
}

// Helper to get parent organizational node for an employee
const getParentOrgNode = (employeeNode) => {
  if (!employeeNode || employeeNode.type !== 'employee') {
    return selectedNode.value
  }

  const levels = getEmployeeLevels(employeeNode)

  console.log('🔍 Finding parent org node for levels:', levels)

  if (levels.unit) {
    const nodeId = `unit_${orgStore.slugify(levels.unit)}`
    console.log('🔍 Looking for unit node:', nodeId)
    const node = orgStore._findNode(nodeId)
    if (node) {
      console.log('✅ Found unit node:', node.label)
      return node
    }
  }

  if (levels.section) {
    const nodeId = `section_${orgStore.slugify(levels.section)}`
    console.log('🔍 Looking for section node:', nodeId)
    const node = orgStore._findNode(nodeId)
    if (node) {
      console.log('✅ Found section node:', node.label)
      return node
    }
  }

  if (levels.division) {
    const nodeId = `division_${orgStore.slugify(levels.division)}`
    console.log('🔍 Looking for division node:', nodeId)
    const node = orgStore._findNode(nodeId)
    if (node) {
      console.log('✅ Found division node:', node.label)
      return node
    }
  }

  if (levels.group) {
    const nodeId = `group_${orgStore.slugify(levels.group)}`
    console.log('🔍 Looking for group node:', nodeId)
    const node = orgStore._findNode(nodeId)
    if (node) {
      console.log('✅ Found group node:', node.label)
      return node
    }
  }

  if (levels.office2) {
    const nodeId = `office2_${orgStore.slugify(levels.office2)}`
    console.log('🔍 Looking for office2 node:', nodeId)
    const node = orgStore._findNode(nodeId)
    if (node) {
      console.log('✅ Found office2 node:', node.label)
      return node
    }
  }

  if (levels.office) {
    const nodeId = `office_${orgStore.slugify(levels.office)}`
    console.log('🔍 Looking for office node:', nodeId)
    const node = orgStore._findNode(nodeId)
    if (node) {
      console.log('✅ Found office node:', node.label)
      return node
    }
  }

  console.log('❌ No parent org node found')
  return null
}

// Updated method to find supervisory signatory at the same level
const getSupervisoryAtSameLevel = (employee, levels, allEmployees) => {
  if (!employee || !levels || !allEmployees) {
    console.log('❌ Missing required parameters for supervisory search')
    return null
  }

  const employeeRank = employee.rank?.toLowerCase()
  console.log('📋 Employee rank:', employeeRank)

  if (
    employeeRank === 'supervisory' ||
    employeeRank === 'managerial' ||
    employeeRank?.includes('supervisory') ||
    employeeRank?.includes('managerial')
  ) {
    console.log('⚠️ Employee is already supervisory/managerial')
    return null
  }

  console.log('👥 Searching through employees:', allEmployees.length)

  const supervisoryEmployee = allEmployees.find((emp) => {
    if (emp.id === employee.id) {
      console.log('⏭️ Skipping same employee')
      return false
    }

    const empRank = emp.rank?.toLowerCase()
    console.log(`🔍 Checking employee ${emp.label} with rank ${empRank}`)

    const isSupervisory =
      empRank === 'supervisory' ||
      empRank?.includes('supervisory') ||
      empRank?.includes('head') ||
      (empRank?.includes('supervisor') && !empRank?.includes('non-supervisory'))

    if (!isSupervisory) {
      console.log(`❌ ${emp.label} is not supervisory`)
      return false
    }

    console.log(`✅ ${emp.label} is supervisory, checking levels...`)

    const empLevels = getEmployeeLevels(emp)

    if (levels.unit && empLevels.unit === levels.unit) {
      console.log(`✅ Same unit: ${levels.unit}`)
      return true
    }
    if (levels.section && empLevels.section === levels.section) {
      console.log(`✅ Same section: ${levels.section}`)
      return true
    }
    if (levels.division && empLevels.division === levels.division) {
      console.log(`✅ Same division: ${levels.division}`)
      return true
    }
    if (levels.group && empLevels.group === levels.group) {
      console.log(`✅ Same group: ${levels.group}`)
      return true
    }
    if (levels.office2 && empLevels.office2 === levels.office2) {
      console.log(`✅ Same office2: ${levels.office2}`)
      return true
    }
    if (levels.office && empLevels.office === levels.office) {
      console.log(`✅ Same office: ${levels.office}`)
      return true
    }

    console.log(`❌ ${emp.label} is not at same level`)
    return false
  })

  console.log('🔍 Final supervisory employee found:', supervisoryEmployee)
  return supervisoryEmployee
}

// Updated method to find managerial signatory at office level
const getManagerialInOffice = (levels, allEmployees) => {
  if (!levels.office || !allEmployees) {
    console.log('❌ No office level specified or no employees provided')
    return null
  }

  console.log(`👥 Searching through employees for managerial: ${allEmployees.length}`)

  const managerialEmployee = allEmployees.find((emp) => {
    const empRank = emp.rank?.toLowerCase()
    console.log(`🔍 Checking ${emp.label} with rank ${empRank}`)

    const isManagerial =
      empRank === 'managerial' ||
      empRank?.includes('managerial') ||
      empRank?.includes('manager') ||
      empRank?.includes('department head') ||
      empRank?.includes('office head')

    if (!isManagerial) {
      console.log(`❌ ${emp.label} is not managerial`)
      return false
    }

    console.log(`✅ ${emp.label} is managerial, checking office...`)

    const empLevels = getEmployeeLevels(emp)

    if (empLevels.office === levels.office) {
      console.log(`✅ Same office: ${levels.office}`)
      return true
    }

    console.log(`❌ ${emp.label} is not in same office`)
    return false
  })

  console.log('🔍 Final managerial employee found:', managerialEmployee)
  return managerialEmployee
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

const onOfficeChange = async (office) => {
  if (office) {
    employeeFilter.value = ''
    treeFilter.value = ''

    userStore.officeId = office.id
    await refreshData()

    // After refreshing, automatically select the office node
    // Find the office node in the structure
    const findOfficeNode = (nodes) => {
      if (!nodes) return null
      for (const node of nodes) {
        if (node.type === 'office') {
          return node
        }
        const found = findOfficeNode(node.children)
        if (found) return found
      }
      return null
    }

    const officeNode = findOfficeNode(orgStore.structure)
    if (officeNode) {
      selectedNodeId.value = officeNode.id
    }
  } else {
    userStore.officeId = null
    orgStore.structure = []
    selectedNodeId.value = null
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

const show_opcr_Modal = (employee) => {
  selectedEmployee.value = employee
  show_opcr_ModalOpen.value = true
}

const close_opcr_Modal = () => {
  show_opcr_ModalOpen.value = false
}

const show_ipcr_Modal = (employee) => {
  console.log('🔍 Selected employee for IPCR:', employee)

  const levels = getEmployeeLevels(employee)
  console.log('📊 Employee levels:', levels)

  const parentOrgNode = getParentOrgNode(employee)
  console.log('🏢 Parent organizational node:', parentOrgNode)

  if (!parentOrgNode) {
    console.error('❌ Could not find parent organizational node')
    $q.notify({
      message: 'Could not determine organizational hierarchy',
      color: 'negative',
      position: 'top',
    })
    return
  }

  const directEmployees = getNodeEmployees(parentOrgNode.id)
  console.log('👥 Direct employees in parent org unit:', directEmployees.length)

  const allEmployees = getAllEmployeesUnderNode(parentOrgNode.id)
  console.log('👥 All employees under parent org unit:', allEmployees.length)
  console.log(
    '👥 All employees:',
    allEmployees.map((e) => ({ name: e.label, rank: e.rank })),
  )

  const supervisory = getSupervisoryAtSameLevel(employee, levels, directEmployees)
  console.log('👨‍💼 Supervisory signatory found:', supervisory)

  let managerialAllEmployees = allEmployees

  if (levels.office) {
    const officeNodeId = `office_${orgStore.slugify(levels.office)}`
    const officeNode = orgStore._findNode(officeNodeId)
    if (officeNode) {
      managerialAllEmployees = getAllEmployeesUnderNode(officeNode.id)
      console.log(
        '👥 Searching for managerial in office-level employees:',
        managerialAllEmployees.length,
      )
    }
  }

  const managerial = getManagerialInOffice(levels, managerialAllEmployees)
  console.log('👩‍💼 Managerial signatory found:', managerial)

  selectedEmployee.value = {
    ...employee,
    levels: levels,
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

  console.log('✅ Final employee data with signatories:', selectedEmployee.value)

  show_ipcr_ModalOpen.value = true
}

const close_ipcr_Modal = () => {
  show_ipcr_ModalOpen.value = false
}

const showEditModal = (employee) => {
  const controlNo = employee.employeeData?.ControlNo || employee.ControlNo || employee.control_no

  const currentPeriod = currentTargetPeriod.value

  console.log('🔍 Current period from store:', currentPeriod)
  console.log('🔍 Selected semester in store:', orgStore.selectedSemester)
  console.log('🔍 Selected year in store:', orgStore.selectedYear)

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

  if (!semester || !year) {
    $q.notify({
      message: 'Cannot open edit mode: Semester or Year is not selected',
      color: 'negative',
      position: 'top',
    })
    return
  }

  employeeToEdit.value = {
    ...employee,
    controlNo: controlNo,
    semester: semester,
    year: year,
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

  router.push({
    name: 'unitworkplan',
    query: {
      type,
      id: selectedNode.value.id,
    },
  })
}

// const confirmDeleteEmployee = (employee) => {
//   employeeToDelete.value = employee
//   confirmDeleteDialog.value = true
// }

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
  () => userManageStore.offices,
  (offices) => {
    if (offices && offices.length > 0) {
      filteredOfficeOptions.value = offices
    }
  },
)

// Lifecycle
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
