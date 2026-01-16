<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="employee-container">
    <!-- Organization Panel -->
    <div class="organization-panel">
      <!-- <div v-if="loading" class="loading-container">
        <q-spinner-gears color="cyan" />
        <span>Loading organization structure...</span>
      </div> -->

      <div v-if="loading" class="loading-container">
        <q-spinner  size="2em" class="q-mr-sm" color="green" />
      Loading organization structure...
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
              <!-- <div class="loading-container">
                <q-spinner-gears color="cyan" />
                <span>Loading employees...</span>
              </div> -->

            <div class="loading-container">
                  <q-spinner  size="2em" class="q-mr-sm" color="green" />
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
               @click="confirmDeleteEmployee(props.row)"
                />
              </q-td>
            </template>
          </q-table>

          <!-- <div v-if="loading || employeeStore.loading" class="loading-container">
            <q-spinner-gears color="cyan" />
            <span>Loading employees...</span>
          </div> -->


         <div v-if="loading || employeeStore.loading" class="loading-container">
              <q-spinner  size="2em" class="q-mr-sm" color="green" />
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
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useMessage } from 'src/composables/message'

export default {
  components: { AddEmployeeModal },
  setup() {
    const employeeStore = useEmployeeStore()
    const libraryStore = useLibraryStore()
    const { confirm, success, error } = useMessage()
    return { employeeStore, libraryStore,
    confirm,
    success,
    error, }
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
      const baseOptions = this.libraryStore.ranks.map((rank) => ({
        value: rank.rank_name,
        label: rank.rank_name,
        id: rank.id,
      }))

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
        if (emp.unit) {
          return this.selectedNode.type === 'unit' && emp.unit === this.selectedNode.name
        }
        if (emp.section) {
          return (
            this.selectedNode.type === 'section' &&
            emp.section === this.selectedNode.name &&
            !emp.unit
          )
        }
        if (emp.division) {
          return (
            this.selectedNode.type === 'division' &&
            emp.division === this.selectedNode.name &&
            !emp.section &&
            !emp.unit
          )
        }
        if (emp.group) {
          return (
            this.selectedNode.type === 'group' &&
            emp.group === this.selectedNode.name &&
            !emp.division &&
            !emp.section &&
            !emp.unit
          )
        }
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
      const userStore = useUserStore()
      // FIX: Use office.Office instead of officeName
      return userStore.user?.office?.name || 'Unknown Office'
    },
  },
  async created() {
    try {
      await this.libraryStore.fetchRanks()
    } catch (error) {
      console.error('Failed to fetch ranks:', error)
      this.$q.notify({
        type: 'warning',
        message: 'Failed to load rank options.   Using default ranks.',
      })
      this.libraryStore.ranks = [
        { id: 4, rank_name: 'Office-Head' },
        { id: 5, rank_name: 'Employee' },
        { id: 6, rank_name: 'Supervisor' },
        { id: 7, rank_name: 'Rank-in-File' },
        { id: 8, rank_name: 'Managerial' },
      ]
    }

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
    // async deleteEmployee(employeeId) {
    //   this.$q
    //     .dialog({
    //       title: 'Confirm Delete',
    //       message: 'Are you sure you want to delete this employee?',
    //       cancel: true,
    //       persistent: true,
    //     })
    //     .onOk(async () => {
    //       try {
    //         const result = await this.employeeStore.softDeleteEmployee(employeeId)
    //         if (result?.success) {
    //           this.$q.notify({
    //             type: 'positive',
    //             message: 'Employee moved to trash',
    //           })

    //           this.employeeStore.employees = [...this.employeeStore.employees]
    //           this.employeeStore.assignedEmployees = [...this.employeeStore.assignedEmployees]

    //           this.updateTreeCounts()

    //           this.$nextTick(() => {
    //             this.$forceUpdate()
    //           })
    //         } else {
    //           throw new Error('Failed to delete employee')
    //         }
    //       } catch (error) {
    //         this.$q.notify({
    //           type: 'negative',
    //           message: error.message || 'Failed to delete employee',
    //         })
    //       }
    //     })
    // },
        async confirmDeleteEmployee(employee) {
        const confirmed = await this.confirm({
          title: 'Delete Employee',
          text: `Are you sure you want to delete ${employee.name}?`,
          confirmText: 'Yes, delete',
          cancelText: 'Cancel',
          icon: 'warning',
        })

        if (!confirmed) return

        try {
          // Use the correct method from your store
          const result = await this.employeeStore.deleteEmployee(employee.id)

          if (result?.success) {
            await this.employeeStore.fetchEmployeesByNode(this.selectedNode)
            this.updateTreeCounts()

            await this.success('Employee deleted successfully')
          } else {
            throw new Error('Failed to delete employee')
          }
        } catch (err) {
          console.error(err)
          await this.error(err.message || 'Failed to delete employee')
        }
      },



    async fetchOrganizationStructure() {
      this.loading = true
      try {
        const structureResponse = await api.get('/office/structure')

        console.log('API Response:', structureResponse.data) // DEBUG

        // FIX: Get the correct office name from userStore
        const userStore = useUserStore()
        const currentOfficeName = userStore.user?.office?.name

        console.log('Looking for office:', currentOfficeName) // DEBUG

        const officeData = structureResponse.data.find(
          (office) => office.office === currentOfficeName,
        )

        console.log('Office Data Found:', officeData) // DEBUG

        if (officeData) {
          await this.employeeStore.loadAllEmployees()

          const counts = this.employeeStore.employeeCounts
          this.treeNodes = [this.processOrganizationData(officeData, counts)]
          this.expandedNodes = [this.treeNodes[0].id]
          this.selectedNodeId = this.treeNodes[0].id
          this.selectedNode = this.treeNodes[0]
          this.employeeStore.currentNode = this.selectedNode

          await this.employeeStore.fetchEmployeesByNode(this.selectedNode)
        } else {
          console.error('No office found matching:', currentOfficeName)
          console.error(
            'Available offices:',
            structureResponse.data.map((o) => o.office),
          )
          this.$q.notify({
            type: 'warning',
            message: `No structure found for office: ${currentOfficeName}`,
          })
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

      const officeNode = {
        id: generateId('office'),
        label: officeData.office,
        name: officeData.office,
        type: 'office',
        icon: 'business',
        count: counts.office || 0,
        children: [],
      }

      // FIX: Handle office2 array properly
      if (Array.isArray(officeData.office2) && officeData.office2.length > 0) {
        const office2WithValues = []
        const groupsWithoutOffice2 = []

        officeData.office2.forEach((office2Data) => {
          if (office2Data.office2) {
            // This office2 has a name, process it
            office2WithValues.push(office2Data)
          } else {
            // This is actually groups without office2 wrapper
            if (Array.isArray(office2Data.group)) {
              groupsWithoutOffice2.push(...office2Data.group)
            }
          }
        })

        // Process office2 nodes with values
        office2WithValues.forEach((office2Data) => {
          const office2Node = {
            id: generateId('office2'),
            label: office2Data.office2,
            name: office2Data.office2,
            type: 'office2',
            icon: 'domain',
            count: counts.office2?.[office2Data.office2]?.count || 0,
            children: [],
          }

          this.processGroups(office2Data.group || [], office2Node, counts, generateId)
          officeNode.children.push(office2Node)
        })

        // Process groups without office2
        this.processGroups(groupsWithoutOffice2, officeNode, counts, generateId)
      }

      return officeNode
    },

    processGroups(groupsData, parentNode, counts, generateId) {
      if (!Array.isArray(groupsData) || groupsData.length === 0) {
        return
      }

      groupsData.forEach((groupData) => {
        if (!groupData) return

        if (groupData.group === null || groupData.group === undefined) {
          // Skip null groups but process their children at parent level
          if (Array.isArray(groupData.divisions)) {
            this.processDivisions(groupData.divisions, parentNode, counts, generateId)
          }
          if (Array.isArray(groupData.sections_without_division)) {
            this.processSectionsWithoutDivision(
              groupData.sections_without_division,
              parentNode,
              counts,
              generateId,
            )
          }
          if (Array.isArray(groupData.units_without_division)) {
            this.processUnitsWithoutDivision(
              groupData.units_without_division,
              parentNode,
              counts,
              generateId,
            )
          }
          return
        }

        const groupNode = {
          id: generateId('group'),
          label: groupData.group,
          name: groupData.group,
          type: 'group',
          icon: 'workspaces',
          count: counts.groups?.[groupData.group]?.count || 0,
          children: [],
        }

        this.processDivisions(groupData.divisions || [], groupNode, counts, generateId)
        this.processSectionsWithoutDivision(
          groupData.sections_without_division || [],
          groupNode,
          counts,
          generateId,
        )
        this.processUnitsWithoutDivision(
          groupData.units_without_division || [],
          groupNode,
          counts,
          generateId,
        )

        parentNode.children.push(groupNode)
      })
    },

    processDivisions(divisionsData, parentNode, counts, generateId) {
      if (!Array.isArray(divisionsData) || divisionsData.length === 0) {
        return
      }

      divisionsData.forEach((divData) => {
        if (!divData || !divData.division) return

        const divisionNode = {
          id: generateId('div'),
          label: divData.division,
          name: divData.division,
          type: 'division',
          icon: 'apartment',
          count: counts.divisions?.[divData.division]?.count || 0,
          children: [],
        }

        this.processSections(divData.sections || [], divisionNode, counts, generateId)
        this.processUnitsWithoutSection(
          divData.units_without_section || [],
          divisionNode,
          counts,
          generateId,
        )

        parentNode.children.push(divisionNode)
      })
    },

    processSections(sectionsData, parentNode, counts, generateId) {
      if (!Array.isArray(sectionsData) || sectionsData.length === 0) {
        return
      }

      sectionsData.forEach((secData) => {
        if (!secData || !secData.section) return

        const sectionNode = {
          id: generateId('sec'),
          label: secData.section,
          name: secData.section,
          type: 'section',
          icon: 'group',
          count: counts.sections?.[secData.section]?.count || 0,
          children: [],
        }

        this.processUnits(secData.units || [], sectionNode, counts, generateId)

        parentNode.children.push(sectionNode)
      })
    },

    processSectionsWithoutDivision(sectionsData, parentNode, counts, generateId) {
      if (!Array.isArray(sectionsData) || sectionsData.length === 0) {
        return
      }

      sectionsData.forEach((secData) => {
        if (!secData || !secData.section) return

        const sectionNode = {
          id: generateId('sec'),
          label: secData.section,
          name: secData.section,
          type: 'section',
          icon: 'group',
          count: counts.sections?.[secData.section]?.count || 0,
          children: [],
        }

        this.processUnits(secData.units || [], sectionNode, counts, generateId)

        parentNode.children.push(sectionNode)
      })
    },

    processUnits(unitsData, parentNode, counts, generateId) {
      if (!Array.isArray(unitsData) || unitsData.length === 0) {
        return
      }

      unitsData.forEach((unitName) => {
        if (!unitName) return

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
    },

    processUnitsWithoutSection(unitsData, parentNode, counts, generateId) {
      if (!Array.isArray(unitsData) || unitsData.length === 0) {
        return
      }

      unitsData.forEach((unitName) => {
        if (!unitName) return

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
    },

    processUnitsWithoutDivision(unitsData, parentNode, counts, generateId) {
      if (!Array.isArray(unitsData) || unitsData.length === 0) {
        return
      }

      unitsData.forEach((unitName) => {
        if (!unitName) return

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
    },

    updateTreeCounts() {
      const counts = this.employeeStore.employeeCounts || {}
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
    },
    async handleAddEmployees(selectedEmployees) {
  const confirmed = await this.confirm({
    title: 'Confirm Add Employee',
    text: 'Are you sure you want to add the selected employees?',
    confirmText: 'Yes, add',
  })

  if (!confirmed) return

  try {
    const userStore = useUserStore()
    const officeId = userStore.user?.office_id
    const officeName = userStore.user?.office?.name

    if (!officeId || !this.selectedNode) {
      throw new Error(
        !officeId
          ? 'Unable to determine office.'
          : 'Please select an office, division, or section first.'
      )
    }

    const employeesToAdd = selectedEmployees.map((emp) => ({
      ControlNo: emp.ControlNo,
      name: emp.name,
      position: emp.position,
      position_id: emp.position_id || emp.positionID,
      office_id: officeId,
      office: officeName,
      office2: this.getOffice2ForSelectedNode(),
      group: this.getGroupForSelectedNode(),
      division: this.getDivisionForSelectedNode(),
      section: this.getSectionForSelectedNode(),
      unit: this.getUnitForSelectedNode(),
      tblStructureID: emp.tblStructureID,
      sg: emp.sg,
      level: emp.level,
      itemNo: emp.itemNo,
      pageNo: emp.pageNo,
    }))

    await this.employeeStore.addEmployees({ employees: employeesToAdd })

    await this.employeeStore.fetchEmployeesByNode(this.selectedNode)
    this.updateTreeCounts()

    await this.success('Employees added successfully')
  } catch (err) {
    console.error(err)
    await this.error(err.message || 'Failed to add employees')
  } finally {
    this.showAddModal = false
  }
},


    // async handleAddEmployees(selectedEmployees) {
    //   try {
    //     const userStore = useUserStore()
    //     const officeId = userStore.user?.office_id
    //     const officeName = userStore.user?.office?.name

    //     if (!officeId || !this.selectedNode) {
    //       throw new Error(
    //         !officeId
    //           ? 'Unable to determine office.   Please make sure you are properly authenticated.'
    //           : 'Please select an office, division, or section before adding employees.',
    //       )
    //     }

    //     const employeesToAdd = selectedEmployees.map((emp) => ({
    //       ControlNo: emp.ControlNo,
    //       name: emp.name,
    //       position: emp.position,
    //       position_id: emp.position_id || emp.positionID,
    //       positionID: emp.positionID || emp.position_id,
    //       office_id: officeId,
    //       office: officeName,
    //       office2: this.getOffice2ForSelectedNode(),
    //       group: this.getGroupForSelectedNode(),
    //       division: this.getDivisionForSelectedNode(),
    //       section: this.getSectionForSelectedNode(),
    //       unit: this.getUnitForSelectedNode(),
    //       tblStructureID: emp.tblStructureID,
    //       sg: emp.sg,
    //       level: emp.level,
    //       itemNo: emp.itemNo,
    //       pageNo: emp.pageNo,
    //     }))

    //     await this.employeeStore.addEmployees({ employees: employeesToAdd })

    //     if (this.selectedNode) {
    //       await this.employeeStore.fetchEmployeesByNode(this.selectedNode)
    //       this.updateTreeCounts()
    //     }

    //     this.$q.notify({ type: 'positive', message: 'Employees added successfully' })
    //   } catch (error) {
    //     console.error('Error adding employees:', error)
    //     this.$q.notify({ type: 'negative', message: error.message || 'Failed to add employees' })
    //   } finally {
    //     this.showAddModal = false
    //   }
    // },

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
          const directChild = node.children.find((child) => child.id === childId)
          if (directChild && node.type === parentType) {
            return node.name
          }
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
                    message: `There is already a ${newRank} (${currentHead.name}) in this unit.  Do you want to demote them to Employee?`,
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
      if (this.selectedNode?.type === 'unit') {
        return emp1.unit === emp2.unit && emp1.unit === this.selectedNode.name
      }

      if (this.selectedNode?.type === 'section') {
        return (
          emp1.section === emp2.section &&
          emp1.section === this.selectedNode.name &&
          !emp1.unit &&
          !emp2.unit
        )
      }

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
