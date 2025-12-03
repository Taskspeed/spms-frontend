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
import { useEmployeeStore } from 'src/stores/office/employee_Store'

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
          case 'office2':
            baseOptions.push({
              value: 'Office2-Head',
              label: 'Office2-Head',
              disable: (employee) => this.isHeadOptionDisabled(employee, 'Office2-Head'),
            })
            break
          case 'group':
            baseOptions.push({
              value: 'Group-Head',
              label: 'Group-Head',
              disable: (employee) => this.isHeadOptionDisabled(employee, 'Group-Head'),
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
          case 'unit':
            baseOptions.push({
              value: 'Unit-Head',
              label: 'Unit-Head',
              disable: (employee) => this.isHeadOptionDisabled(employee, 'Unit-Head'),
            })
            break
        }
      }

      return baseOptions
    },
    filteredEmployees() {
      if (!this.selectedNode) return []

      return this.employeeStore.assignedEmployees.filter((emp) => {
        // Match by unit
        if (emp.unit) {
          return this.selectedNode.type === 'unit' && emp.unit === this.selectedNode.name
        }
        // Match by section
        if (emp.section) {
          return (
            this.selectedNode.type === 'section' &&
            emp.section === this.selectedNode.name &&
            !emp.unit
          )
        }
        // Match by division
        if (emp.division) {
          return (
            this.selectedNode.type === 'division' &&
            emp.division === this.selectedNode.name &&
            !emp.section &&
            !emp.unit
          )
        }
        // Match by group
        if (emp.group) {
          return (
            this.selectedNode.type === 'group' &&
            emp.group === this.selectedNode.name &&
            !emp.division &&
            !emp.section &&
            !emp.unit
          )
        }
        // Match by office2
        if (emp.office2) {
          return (
            this.selectedNode.type === 'office2' &&
            emp.office2 === this.selectedNode.name &&
            !emp.group &&
            !emp.division &&
            !emp.section &&
            !emp.unit
          )
        }
        // Match by office (top level)
        return (
          this.selectedNode.type === 'office' &&
          !emp.office2 &&
          !emp.group &&
          !emp.division &&
          !emp.section &&
          !emp.unit
        )
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
      let nodeIdCounter = 1

      const generateId = (prefix) => {
        return `${prefix}-${nodeIdCounter++}`
      }

      // Main office node
      const officeNode = {
        id: generateId('office'),
        label: this.officeName,
        name: this.officeName,
        type: 'office',
        icon: 'business',
        count: counts.office || 0,
        children: [],
      }

      // Process office2 array
      if (Array.isArray(officeData.office2) && officeData.office2.length > 0) {
        officeData.office2.forEach((office2Data) => {
          // Only create office2 node if office2 has a value
          if (office2Data.office2) {
            const office2Node = {
              id: generateId('office2'),
              label: office2Data.office2,
              name: office2Data.office2,
              type: 'office2',
              icon: 'domain',
              count: counts.office2?.[office2Data.office2]?.count || 0,
              children: [],
            }

            // Process groups
            this.processGroups(office2Data.groups, office2Node, counts, generateId)
            officeNode.children.push(office2Node)
          } else {
            // No office2, directly process groups under office
            this.processGroups(office2Data.groups, officeNode, counts, generateId)
          }
        })
      }

      return officeNode
    },

    processGroups(groupsData, parentNode, counts, generateId) {
      if (Array.isArray(groupsData) && groupsData.length > 0) {
        groupsData.forEach((groupData) => {
          // Only create group node if group has a value
          if (groupData.group) {
            const groupNode = {
              id: generateId('group'),
              label: groupData.group,
              name: groupData.group,
              type: 'group',
              icon: 'workspaces',
              count: counts.groups?.[groupData.group]?.count || 0,
              children: [],
            }

            // Process divisions
            this.processDivisions(groupData, groupNode, counts, generateId)

            // Process sections without division
            this.processSectionsWithoutDivision(
              groupData.sections_without_division,
              groupNode,
              counts,
              generateId,
            )

            // Process units without division
            this.processUnitsWithoutDivision(
              groupData.units_without_division,
              groupNode,
              counts,
              generateId,
            )

            parentNode.children.push(groupNode)
          } else {
            // No group, directly process divisions under parent
            this.processDivisions(groupData, parentNode, counts, generateId)
            this.processSectionsWithoutDivision(
              groupData.sections_without_division,
              parentNode,
              counts,
              generateId,
            )
            this.processUnitsWithoutDivision(
              groupData.units_without_division,
              parentNode,
              counts,
              generateId,
            )
          }
        })
      }
    },

    processDivisions(groupData, parentNode, counts, generateId) {
      if (Array.isArray(groupData.divisions) && groupData.divisions.length > 0) {
        groupData.divisions.forEach((divData) => {
          const divisionNode = {
            id: generateId('div'),
            label: divData.division,
            name: divData.division,
            type: 'division',
            icon: 'apartment',
            count: counts.divisions?.[divData.division]?.count || 0,
            children: [],
          }

          // Process sections within division
          this.processSections(divData.sections, divisionNode, counts, generateId)

          // Process units without section
          this.processUnitsWithoutSection(
            divData.units_without_section,
            divisionNode,
            counts,
            generateId,
          )

          parentNode.children.push(divisionNode)
        })
      }
    },

    processSections(sectionsData, parentNode, counts, generateId) {
      if (Array.isArray(sectionsData) && sectionsData.length > 0) {
        sectionsData.forEach((secData) => {
          const sectionNode = {
            id: generateId('sec'),
            label: secData.section,
            name: secData.section,
            type: 'section',
            icon: 'group',
            count: counts.sections?.[secData.section]?.count || 0,
            children: [],
          }

          // Process units within section
          this.processUnits(secData.units, sectionNode, counts, generateId)

          parentNode.children.push(sectionNode)
        })
      }
    },

    processSectionsWithoutDivision(sectionsData, parentNode, counts, generateId) {
      if (Array.isArray(sectionsData) && sectionsData.length > 0) {
        sectionsData.forEach((secData) => {
          const sectionNode = {
            id: generateId('sec'),
            label: secData.section,
            name: secData.section,
            type: 'section',
            icon: 'group',
            count: counts.sections?.[secData.section]?.count || 0,
            children: [],
          }

          // Process units within section
          this.processUnits(secData.units, sectionNode, counts, generateId)

          parentNode.children.push(sectionNode)
        })
      }
    },

    processUnits(unitsData, parentNode, counts, generateId) {
      if (Array.isArray(unitsData) && unitsData.length > 0) {
        unitsData.forEach((unitName) => {
          const unitNode = {
            id: generateId('unit'),
            label: unitName,
            name: unitName,
            type: 'unit',
            icon: 'people',
            count: counts.units?.[unitName]?.count || 0,
            children: [],
          }
          parentNode.children.push(unitNode)
        })
      }
    },

    processUnitsWithoutSection(unitsData, parentNode, counts, generateId) {
      if (Array.isArray(unitsData) && unitsData.length > 0) {
        unitsData.forEach((unitName) => {
          const unitNode = {
            id: generateId('unit'),
            label: unitName,
            name: unitName,
            type: 'unit',
            icon: 'people',
            count: counts.units?.[unitName]?.count || 0,
            children: [],
          }
          parentNode.children.push(unitNode)
        })
      }
    },

    processUnitsWithoutDivision(unitsData, parentNode, counts, generateId) {
      if (Array.isArray(unitsData) && unitsData.length > 0) {
        unitsData.forEach((unitName) => {
          const unitNode = {
            id: generateId('unit'),
            label: unitName,
            name: unitName,
            type: 'unit',
            icon: 'people',
            count: counts.units?.[unitName]?.count || 0,
            children: [],
          }
          parentNode.children.push(unitNode)
        })
      }
    },

    updateTreeCounts() {
      this.employeeStore.fetchEmployeeCounts(useUserStore().user?.office_id).then((counts) => {
        const updateNodeCounts = (node) => {
          if (node.type === 'office') {
            node.count = counts.office || 0
          } else if (node.type === 'office2') {
            node.count = counts.office2?.[node.name]?.count || 0
          } else if (node.type === 'group') {
            node.count = counts.groups?.[node.name]?.count || 0
          } else if (node.type === 'division') {
            node.count = counts.divisions?.[node.name]?.count || 0
          } else if (node.type === 'section') {
            node.count = counts.sections?.[node.name]?.count || 0
          } else if (node.type === 'unit') {
            node.count = counts.units?.[node.name]?.count || 0
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
              ? 'Unable to determine office.  Please make sure you are properly authenticated.'
              : 'Please select an office, division, or section before adding employees.',
          )
        }

        const employeesToAdd = selectedEmployees.map((emp) => ({
          name: emp.name,
          position: emp.position,
          office_id: officeId,
          office: officeName,
          office2: this.getOffice2ForSelectedNode(),
          group: this.getGroupForSelectedNode(),
          division: this.getDivisionForSelectedNode(),
          section: this.getSectionForSelectedNode(),
          unit: this.getUnitForSelectedNode(),
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

    getOffice2ForSelectedNode() {
      if (this.selectedNode.type === 'office2') return this.selectedNode.name
      if (['group', 'division', 'section', 'unit'].includes(this.selectedNode.type)) {
        return this.findParentByType(this.treeNodes, this.selectedNode.id, 'office2')
      }
      return null
    },

    getGroupForSelectedNode() {
      if (this.selectedNode.type === 'group') return this.selectedNode.name
      if (['division', 'section', 'unit'].includes(this.selectedNode.type)) {
        return this.findParentByType(this.treeNodes, this.selectedNode.id, 'group')
      }
      return null
    },

    getDivisionForSelectedNode() {
      if (this.selectedNode.type === 'division') return this.selectedNode.name
      if (['section', 'unit'].includes(this.selectedNode.type)) {
        return this.findParentByType(this.treeNodes, this.selectedNode.id, 'division')
      }
      return null
    },

    getSectionForSelectedNode() {
      if (this.selectedNode.type === 'section') return this.selectedNode.name
      if (this.selectedNode.type === 'unit') {
        return this.findParentByType(this.treeNodes, this.selectedNode.id, 'section')
      }
      return null
    },

    getUnitForSelectedNode() {
      if (this.selectedNode.type === 'unit') return this.selectedNode.name
      return null
    },

    findParentByType(nodes, childId, parentType) {
      for (const node of nodes) {
        if (node.children) {
          // Check if any direct child matches
          const directChild = node.children.find((child) => child.id === childId)
          if (directChild && node.type === parentType) {
            return node.name
          }
          // Recursively search in children
          const found = this.findParentByType(node.children, childId, parentType)
          if (found) return found
        }
      }
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
            if (
              [
                'Office-Head',
                'Office2-Head',
                'Group-Head',
                'Division-Head',
                'Section-Head',
                'Unit-Head',
              ].includes(newRank)
            ) {
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
      // Check unit level
      if (this.selectedNode?.type === 'unit') {
        return emp1.unit === emp2.unit && emp1.unit === this.selectedNode.name
      }

      // Check section level
      if (this.selectedNode?.type === 'section') {
        return (
          emp1.section === emp2.section &&
          emp1.section === this.selectedNode.name &&
          !emp1.unit &&
          !emp2.unit
        )
      }

      // Check division level
      if (this.selectedNode?.type === 'division') {
        return (
          emp1.division === emp2.division &&
          emp1.division === this.selectedNode.name &&
          !emp1.section &&
          !emp2.section &&
          !emp1.unit &&
          !emp2.unit
        )
      }

      // Check group level
      if (this.selectedNode?.type === 'group') {
        return (
          emp1.group === emp2.group &&
          emp1.group === this.selectedNode.name &&
          !emp1.division &&
          !emp2.division &&
          !emp1.section &&
          !emp2.section &&
          !emp1.unit &&
          !emp2.unit
        )
      }

      // Check office2 level
      if (this.selectedNode?.type === 'office2') {
        return (
          emp1.office2 === emp2.office2 &&
          emp1.office2 === this.selectedNode.name &&
          !emp1.group &&
          !emp2.group &&
          !emp1.division &&
          !emp2.division &&
          !emp1.section &&
          !emp2.section &&
          !emp1.unit &&
          !emp2.unit
        )
      }

      // Check office level (top)
      if (this.selectedNode?.type === 'office') {
        return (
          emp1.office_id === emp2.office_id &&
          !emp1.office2 &&
          !emp2.office2 &&
          !emp1.group &&
          !emp2.group &&
          !emp1.division &&
          !emp2.division &&
          !emp1.section &&
          !emp2.section &&
          !emp1.unit &&
          !emp2.unit
        )
      }

      return false
    },
  },
}
</script>

<style src="../../assets/office/employee.css" scoped></style>
