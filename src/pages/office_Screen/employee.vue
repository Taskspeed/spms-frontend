<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="employee-container">
    <!-- Organization Panel -->
    <div class="organization-panel">
      <div v-if="loading" class="loading-container">
        <q-spinner-gears color="cyan" />
        <span>Loading organization structure...</span>
      </div>
      <q-tree
        v-else
        :nodes="treeNodes"
        node-key="id"
        v-model:expanded="expandedNodes"
        v-model:selected="selectedNodeId"
        @update:expanded="updateExpanded"
        @update:selected="selectNode"
        default-expand-all
      >
        <template v-slot:default-header="{ node }">
          <div class="node-label">
            <q-icon :name="node.icon" class="node-icon" />
            {{ node.label }}
            <span class="employee-count">{{ node.count || 0 }}</span>
          </div>
        </template>
      </q-tree>
    </div>

    <!-- Employee List Panel -->
    <div class="employee-list-panel">
      <div class="employee-list-container">
        <div class="table-title-container">
          <h3>{{ selectedNodeTitle || 'Select an office, division, or section' }}</h3>
          <button v-if="selectedNode" class="add-employee-btn" @click="openAddModal">
            <q-icon name="add" />
            Select Employees
          </button>
        </div>

        <div class="employee-table">
          <q-table
            v-if="selectedNode && !loading && !employeeStore.loading"
            :rows="filteredEmployees"
            :columns="columns"
            row-key="id"
            flat
            bordered
            :loading="employeeStore.loading"
            :pagination="{ rowsPerPage: 10 }"
            :rows-per-page-options="[10, 20, 50]"
          >
            <template v-slot:loading>
              <div class="loading-container">
                <q-spinner-gears color="cyan" />
                <span>Loading employees...</span>
              </div>
            </template>

            <template v-slot:no-data>
              <div class="empty-row">No employees found</div>
            </template>

            <template v-slot:body-cell-rank="props">
              <q-td :props="props">
                <q-select
                  v-model="props.row.rank"
                  :options="rankOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  dense
                  outlined
                  @update:model-value="(val) => updateEmployeeRank(props.row, val)"
                  :option-disable="(opt) => (opt.disable ? opt.disable(props.row) : false)"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  icon="delete"
                  color="negative"
                  flat
                  dense
                  @click="deleteEmployee(props.row.id)"
                />
              </q-td>
            </template>
          </q-table>

          <div v-if="loading || employeeStore.loading" class="loading-container">
            <q-spinner-gears color="cyan" />
            <span>Loading employees...</span>
          </div>
        </div>
      </div>
    </div>

    <AddEmployeeModal v-model:showModal="showAddModal" @add="handleAddEmployees" />
  </div>
</template>

<script>
import AddEmployeeModal from '../../components/add_employee_Modal.vue'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/userStore'
import { useEmployeeStore } from 'stores/office/employeeStore'

export default {
  components: { AddEmployeeModal },
  setup() {
    const employeeStore = useEmployeeStore()
    return { employeeStore }
  },
  data() {
    return {
      showAddModal: false,
      selectedNodeId: null,
      selectedNode: null,
      loading: false,
      treeNodes: [],
      expandedNodes: [],
      columns: [
        {
          name: 'name',
          required: true,
          label: 'Name',
          align: 'left',
          field: (row) => row.name,
          sortable: true,
        },
        {
          name: 'position',
          label: 'Position',
          align: 'left',
          field: (row) => row.position,
          sortable: true,
        },
        { name: 'rank', label: 'Rank', align: 'left', field: (row) => row.rank, sortable: true },
        { name: 'actions', label: 'Actions', align: 'center', sortable: false },
      ],
    }
  },
  computed: {
    rankOptions() {
      const baseOptions = [
        { value: 'Employee', label: 'Employee' },
        { value: 'Supervisor', label: 'Supervisor' },
        { value: 'Rank-in-File', label: 'Rank-in-File' },
        { value: 'Managerial', label: 'Managerial' },
      ]

      if (this.selectedNode) {
        switch (this.selectedNode.type) {
          case 'office':
            baseOptions.push({
              value: 'Office-Head',
              label: 'Office-Head',
              disable: (employee) => this.isHeadOptionDisabled(employee, 'Office-Head'),
            })
            break
          case 'division':
            baseOptions.push({
              value: 'Division-Head',
              label: 'Division-Head',
              disable: (employee) => this.isHeadOptionDisabled(employee, 'Division-Head'),
            })
            break
          case 'section':
            baseOptions.push({
              value: 'Section-Head',
              label: 'Section-Head',
              disable: (employee) => this.isHeadOptionDisabled(employee, 'Section-Head'),
            })
            break
        }
      }

      return baseOptions
    },
    filteredEmployees() {
      if (!this.selectedNode) return []

      return this.employeeStore.assignedEmployees.filter((emp) => {
        if (emp.section) {
          return this.selectedNode.type === 'section' && emp.section === this.selectedNode.name
        }
        if (emp.division) {
          return (
            this.selectedNode.type === 'division' &&
            emp.division === this.selectedNode.name &&
            !emp.section
          )
        }
        return this.selectedNode.type === 'office' && !emp.division && !emp.section
      })
    },
    selectedNodeTitle() {
      return this.selectedNode?.label || this.selectedNode?.name || ''
    },
    officeName() {
      return useUserStore().officeName
    },
  },
  async created() {
    await this.fetchOrganizationStructure()
  },
  methods: {
    findNodeById(nodes, id) {
      for (const node of nodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = this.findNodeById(node.children, id)
          if (found) return found
        }
      }
      return null
    },
    isHeadOptionDisabled(employee, headType) {
      if (!this.selectedNode) return false

      return this.filteredEmployees.some((emp) => {
        if (emp.id === employee.id) return false
        if (emp.rank !== headType) return false
        return this.isSameOrganizationalUnit(emp, employee)
      })
    },
    openAddModal() {
      this.showAddModal = true
      this.employeeStore.fetchUnassignedEmployees()
    },
    updateExpanded(expanded) {
      this.expandedNodes = expanded
    },
    async selectNode(nodeId) {
      this.selectedNode = this.findNodeById(this.treeNodes, nodeId)
      this.employeeStore.currentNode = this.selectedNode
      try {
        await this.employeeStore.fetchEmployeesByNode(this.selectedNode)
      } catch (error) {
        console.error('Error fetching employees for node:', error)
        this.$q.notify({ type: 'negative', message: 'Failed to load employees' })
      }
    },
    async deleteEmployee(employeeId) {
      this.$q
        .dialog({
          title: 'Confirm Delete',
          message: 'Are you sure you want to delete this employee?',
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            const result = await this.employeeStore.softDeleteEmployee(employeeId)
            if (result?.success) {
              this.$q.notify({
                type: 'positive',
                message: result.message || 'Employee moved to trash',
              })
              if (result.deletedEmployee) this.updateLocalCountsAfterDelete(result.deletedEmployee)
              if (this.selectedNode)
                await this.employeeStore.fetchEmployeesByNode(this.selectedNode)
            } else {
              throw new Error(result?.message || 'Failed to delete employee')
            }
          } catch (error) {
            this.$q.notify({
              type: 'negative',
              message: error.message || 'Failed to delete employee',
            })
          }
        })
    },
    updateLocalCountsAfterDelete() {
      if (this.employeeStore.employeeCounts?.office > 0) {
        this.employeeStore.employeeCounts.office--
      }
      this.updateTreeCounts()
    },
    async fetchOrganizationStructure() {
      this.loading = true
      try {
        const [structureResponse, counts] = await Promise.all([
          api.get('/office/structure'),
          this.employeeStore.fetchEmployeeCounts(useUserStore().user?.office_id),
        ])

        const officeData = structureResponse.data.find(
          (office) => office.office === this.officeName,
        )

        if (officeData) {
          this.treeNodes = [this.processOrganizationData(officeData, counts)]
          this.expandedNodes = [this.treeNodes[0].id]
          this.selectedNodeId = this.treeNodes[0].id
          this.selectedNode = this.treeNodes[0]
          this.employeeStore.currentNode = this.selectedNode
          await this.employeeStore.fetchEmployeesByNode(this.selectedNode)
        }
      } catch (error) {
        console.error('Error fetching organization structure:', error)
        this.$q.notify({ type: 'negative', message: 'Failed to load organization structure' })
      } finally {
        this.loading = false
      }
    },
    processOrganizationData(officeData, counts) {
      const officeNode = {
        id: `office-${useUserStore().user?.office_id}`, // Prefix with 'office-'
        label: this.officeName,
        name: this.officeName,
        type: 'office',
        icon: 'business',
        count: counts.office || 0,
        children: [],
      }

      const divisions = officeData.divisions.map((div, divIndex) => {
        const divisionCount = counts.divisions[div.division]?.count || 0
        return {
          id: `div-${divIndex + 1}`, // Prefix with 'div-'
          label: div.division,
          name: div.division,
          type: 'division',
          icon: 'apartment',
          count: divisionCount,
          children:
            div.sections?.map((sec, secIndex) => ({
              id: `sec-${(divIndex + 1) * 100 + secIndex + 1}`, // Prefix with 'sec-'
              label: sec.section,
              name: sec.section,
              type: 'section',
              icon: 'group',
              count: counts.sections[sec.section]?.count || 0,
              children: [],
            })) || [],
        }
      })

      if (officeData.sections_without_division?.length) {
        divisions.push({
          id: 'div-9999', // Prefix with 'div-'
          label: 'SECTIONS WITHOUT DIVISION',
          name: 'Sections Without Division',
          type: 'division',
          icon: 'apartment',
          count: 0,
          children: officeData.sections_without_division.map((sec, secIndex) => ({
            id: `sec-9999-${secIndex + 1}`, // Unique prefix
            label: sec.section,
            name: sec.section,
            type: 'section',
            icon: 'group',
            count: counts.sections[sec.section]?.count || 0,
            children: [],
          })),
        })
      }

      officeNode.children = divisions
      return officeNode
    },
    updateTreeCounts() {
      this.employeeStore.fetchEmployeeCounts(useUserStore().user?.office_id).then((counts) => {
        const updateNodeCounts = (node) => {
          if (node.type === 'office') {
            node.count = counts.office || 0
          } else if (node.type === 'division') {
            node.count = counts.divisions[node.name]?.count || 0
          } else if (node.type === 'section') {
            node.count = counts.sections[node.name]?.count || 0
          }
          if (node.children) {
            node.children.forEach((child) => updateNodeCounts(child))
          }
        }
        this.treeNodes.forEach((node) => updateNodeCounts(node))
      })
    },
    async handleAddEmployees(selectedEmployees) {
      try {
        const userStore = useUserStore()
        const officeId = userStore.user?.office_id
        const officeName = userStore.officeName

        if (!officeId || !this.selectedNode) {
          throw new Error(
            !officeId
              ? 'Unable to determine office. Please make sure you are properly authenticated.'
              : 'Please select an office, division, or section before adding employees.',
          )
        }

        const employeesToAdd = selectedEmployees.map((emp) => ({
          name: emp.name,
          position: emp.position,
          office_id: officeId,
          office: officeName,
          division: this.getDivisionForSelectedNode(),
          section: this.getSectionForSelectedNode(),
        }))

        await this.employeeStore.addEmployees({ employees: employeesToAdd })

        if (this.selectedNode) {
          await this.employeeStore.fetchEmployeesByNode(this.selectedNode)
          this.updateTreeCounts()
        }

        this.$q.notify({ type: 'positive', message: 'Employees added successfully' })
      } catch (error) {
        console.error('Error adding employees:', error)
        this.$q.notify({ type: 'negative', message: error.message || 'Failed to add employees' })
      } finally {
        this.showAddModal = false
      }
    },
    getDivisionForSelectedNode() {
      if (this.selectedNode.type === 'division') return this.selectedNode.name
      if (this.selectedNode.type === 'section') {
        const findDivision = (nodes) => {
          for (const node of nodes) {
            if (node.type === 'division') {
              if (node.children.some((child) => child.id === this.selectedNode.id)) {
                return node.name
              }
              const found = findDivision(node.children)
              if (found) return found
            }
          }
          return null
        }
        return findDivision(this.treeNodes)
      }
      return null
    },
    getSectionForSelectedNode() {
      if (this.selectedNode.type === 'section') return this.selectedNode.name
      return null
    },
    async updateEmployeeRank(employee, newRank) {
      const originalRank = employee.rank

      this.$q
        .dialog({
          title: 'Confirm Rank Change',
          message: `Are you sure you want to change ${employee.name}'s rank to ${newRank}?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            if (['Office-Head', 'Division-Head', 'Section-Head'].includes(newRank)) {
              const currentHead = this.filteredEmployees.find(
                (emp) =>
                  emp.id !== employee.id &&
                  this.isSameOrganizationalUnit(emp, employee) &&
                  emp.rank === newRank,
              )

              if (currentHead) {
                this.$q
                  .dialog({
                    title: 'Current Head Exists',
                    message: `There is already a ${newRank} (${currentHead.name}) in this unit. Do you want to demote them to Employee?`,
                    cancel: true,
                    persistent: true,
                  })
                  .onOk(async () => {
                    try {
                      await this.employeeStore.updateEmployeeRank(currentHead.id, 'Employee')
                      currentHead.rank = 'Employee'
                      await this.saveRankChange(employee, newRank)
                    } catch (error) {
                      console.error('Failed to demote current head:', error)
                      employee.rank = originalRank
                      this.$q.notify({
                        type: 'negative',
                        message: 'Failed to demote current head',
                      })
                    }
                  })
                  .onCancel(() => {
                    employee.rank = originalRank
                  })
              } else {
                await this.saveRankChange(employee, newRank)
              }
            } else {
              await this.saveRankChange(employee, newRank)
            }
          } catch (error) {
            console.error('Failed to update rank:', error)
            employee.rank = originalRank
            this.$q.notify({
              type: 'negative',
              message: `Failed to update rank: ${error.message}`,
            })
          }
        })
        .onCancel(() => {
          employee.rank = originalRank
        })
    },
    async saveRankChange(employee, newRank) {
      await this.employeeStore.updateEmployeeRank(employee.id, newRank)
      employee.rank = newRank
      this.$q.notify({
        type: 'positive',
        message: `${employee.name}'s rank updated to ${newRank}`,
      })
    },
    isSameOrganizationalUnit(emp1, emp2) {
      if (this.selectedNode?.type === 'office') {
        return (
          emp1.office_id === emp2.office_id &&
          !emp1.division &&
          !emp1.section &&
          !emp2.division &&
          !emp2.section
        )
      }

      if (this.selectedNode?.type === 'division') {
        return (
          emp1.division === emp2.division &&
          emp1.division === this.selectedNode.name &&
          !emp1.section &&
          !emp2.section
        )
      }

      if (this.selectedNode?.type === 'section') {
        return emp1.section === emp2.section && emp1.section === this.selectedNode.name
      }

      return false
    },
  },
}
</script>

<style src="../../assets/office/employee.css" scoped></style>
