import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'
import { useUserStore } from 'src/stores/userStore'

export const useOrganizationStore = defineStore('organization', {
  state: () => ({
    spms: ref([]),
    structure: ref([]),
    loading: ref(false),
    error: ref(null),
    officeName: '',
  }),

  getters: {
    /**
     * Get SPMS count/completion for a specific node
     * @param {string} nodeId - The node ID
     * @returns {Object} - { completed: number, total: number, isCompleted: boolean, ratio: string }
     */
    getNodeCompletion: (state) => (nodeId) => {
      if (state.spms && state.spms[nodeId]) {
        const completion = state.spms[nodeId]
        let parts = []

        // Handle different formats:  "1/5" or { completed: 1, total: 5 }
        if (typeof completion === 'string') {
          parts = completion.split('/').map(Number)
        } else if (typeof completion === 'object' && completion.completed !== undefined) {
          parts = [completion.completed, completion.total]
        }

        if (parts.length === 2) {
          const [completed, total] = parts
          return {
            completed,
            total,
            isCompleted: completed === total && total > 0,
            ratio: `${completed}/${total}`,
          }
        }
      }
      return { completed: 0, total: 0, isCompleted: false, ratio: '0/0' }
    },

    /**
     * Get incomplete subordinate levels for validation messages
     */
    getIncompleteSubordinates: (state) => (nodeId) => {
      const findNode = (nodes, id) => {
        if (!nodes) return null
        return (
          nodes.find((n) => n.id === id) ||
          nodes.reduce((acc, n) => acc || findNode(n.children, id), null)
        )
      }

      const node = findNode(state.structure, nodeId)
      if (!node) return []

      const hierarchyLevels = ['unit', 'section', 'division', 'group', 'office2', 'office']
      const nodeLevel = hierarchyLevels.indexOf(node.type)
      const incomplete = []

      const checkSubordinates = (currentNode, minLevel) => {
        if (!currentNode.children) return

        for (const child of currentNode.children) {
          const childLevel = hierarchyLevels.indexOf(child.type)
          if (childLevel < minLevel && child.type !== 'employee') {
            const completion = state.spms?.[child.id]
            if (completion) {
              let parts = []
              if (typeof completion === 'string') {
                parts = completion.split('/').map(Number)
              } else if (typeof completion === 'object') {
                parts = [completion.completed, completion.total]
              }

              if (parts.length === 2) {
                const [c, t] = parts
                if (c !== t && t > 0) {
                  incomplete.push({
                    id: child.id,
                    label: child.label,
                    type: child.type,
                    completion: typeof completion === 'string' ? completion : `${c}/${t}`,
                  })
                }
              }
            }
            checkSubordinates(child, minLevel)
          }
        }
      }

      checkSubordinates(node, nodeLevel)
      return incomplete
    },
  },

  actions: {
    async fetchSPMSCount() {
      this.loading = true
      try {
        const response = await api.get('/spms/count')
        this.spms = response.data
        this.error = null
      } catch (err) {
        this.error = 'Failed to fetch spms count'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async fetchStructure() {
      this.loading = true
      try {
        const userStore = useUserStore()
        const { officeId } = userStore

        const { data: structureData } = await api.get('Spms/office/structure', {
          params: { office_id: officeId },
        })

        let employees = []
        try {
          const employeeResponse = await api.get('spms/fetch_employees', {
            params: { office_id: officeId },
          })

          if (Array.isArray(employeeResponse.data)) {
            employees = employeeResponse.data
          } else if (employeeResponse.data?.data && Array.isArray(employeeResponse.data.data)) {
            employees = employeeResponse.data.data
          } else if (
            employeeResponse.data?.employees &&
            Array.isArray(employeeResponse.data.employees)
          ) {
            employees = employeeResponse.data.employees
          }
        } catch (empErr) {
          console.error('Error fetching employees:', empErr)
          employees = []
        }

        console.log('Structure Data:', structureData)
        console.log('Employees Data:', employees)

        if (structureData?.length) {
          this.officeName = structureData[0].office
          this.structure = this.transformStructure(structureData[0], employees)
          console.log('Transformed Structure:', this.structure)
        } else {
          this.structure = []
        }
      } catch (err) {
        this.error = err.message
        this.structure = []
        console.error('Error fetching structure:', err)
      } finally {
        this.loading = false
      }
    },

    transformStructure(officeData, employees) {
      if (!officeData) return []

      const headRanks = [
        'office-head',
        'office2-head',
        'group-head',
        'division-head',
        'section-head',
        'unit-head',
      ]

      const isHeadByRank = (rank) => rank && headRanks.some((h) => rank.toLowerCase().includes(h))

      // Create employee node
      const createEmployeeNode = (emp) => ({
        id: 'emp_' + emp.id,
        label: emp.name,
        position: emp.position?.name || 'N/A',
        rank: emp.rank,
        ipcrStatus: emp.ipcr_status || 'pending',
        type: 'employee',
        isHead: isHeadByRank(emp.rank),
        employeeData: emp,
        children: [],
      })

      // Group employees by their MOST SPECIFIC location (lowest hierarchy level they belong to)
      const employeesByLocation = new Map()

      employees.forEach((emp) => {
        let key = ''

        // Determine the MOST SPECIFIC location (highest priority = most specific)
        if (emp.unit) {
          key = `unit_${this.slugify(emp.unit)}`
        } else if (emp.section) {
          key = `section_${this.slugify(emp.section)}`
        } else if (emp.division) {
          key = `division_${this.slugify(emp.division)}`
        } else if (emp.group) {
          key = `group_${this.slugify(emp.group)}`
        } else if (emp.office2) {
          key = `office2_${this.slugify(emp.office2)}`
        } else {
          key = 'office_root'
        }

        if (!employeesByLocation.has(key)) {
          employeesByLocation.set(key, [])
        }
        employeesByLocation.get(key).push(createEmployeeNode(emp))
      })

      console.log('Employees by Location:', employeesByLocation)

      // Build unit nodes
      const buildUnit = (unitName) => {
        const key = `unit_${this.slugify(unitName)}`
        const emps = employeesByLocation.get(key) || []
        return {
          id: key,
          label: unitName,
          type: 'unit',
          children: [...emps],
          count: emps.length,
        }
      }

      // Build section nodes
      const buildSection = (sectionName, units) => {
        const key = `section_${this.slugify(sectionName)}`
        const emps = employeesByLocation.get(key) || []
        const builtUnits = units && units.length > 0 ? units.map((u) => buildUnit(u)) : []
        const children = [...emps, ...builtUnits]
        return {
          id: key,
          label: sectionName,
          type: 'section',
          children,
          count: emps.length,
        }
      }

      // Build division nodes
      const buildDivision = (divisionData) => {
        const key = `division_${this.slugify(divisionData.division)}`
        const emps = employeesByLocation.get(key) || []
        const children = [...emps]

        // Add sections
        if (divisionData.sections && divisionData.sections.length > 0) {
          divisionData.sections.forEach((sec) => {
            children.push(buildSection(sec.section, sec.units || []))
          })
        }

        // Add units without section
        if (divisionData.units_without_section && divisionData.units_without_section.length > 0) {
          divisionData.units_without_section.forEach((unit) => {
            children.push(buildUnit(unit))
          })
        }

        return {
          id: key,
          label: divisionData.division,
          type: 'division',
          children,
          count: emps.length,
        }
      }

      // Build group nodes
      const buildGroup = (groupData) => {
        // If group is null, return children array to be spread into parent
        if (groupData.group === null) {
          const children = []

          if (groupData.divisions && groupData.divisions.length > 0) {
            groupData.divisions.forEach((div) => {
              children.push(buildDivision(div))
            })
          }

          if (
            groupData.sections_without_division &&
            groupData.sections_without_division.length > 0
          ) {
            groupData.sections_without_division.forEach((sec) => {
              children.push(buildSection(sec.section, sec.units || []))
            })
          }

          if (groupData.units_without_division && groupData.units_without_division.length > 0) {
            groupData.units_without_division.forEach((unit) => {
              children.push(buildUnit(unit))
            })
          }

          return children
        }

        // For named groups
        const key = `group_${this.slugify(groupData.group)}`
        const emps = employeesByLocation.get(key) || []
        const children = [...emps]

        if (groupData.divisions && groupData.divisions.length > 0) {
          groupData.divisions.forEach((div) => {
            children.push(buildDivision(div))
          })
        }

        if (groupData.sections_without_division && groupData.sections_without_division.length > 0) {
          groupData.sections_without_division.forEach((sec) => {
            children.push(buildSection(sec.section, sec.units || []))
          })
        }

        if (groupData.units_without_division && groupData.units_without_division.length > 0) {
          groupData.units_without_division.forEach((unit) => {
            children.push(buildUnit(unit))
          })
        }

        return {
          id: key,
          label: groupData.group,
          type: 'group',
          children,
          count: emps.length,
        }
      }

      // Build office2 nodes
      const buildOffice2 = (office2Data) => {
        // If office2 is null, return children array to be spread into parent
        if (office2Data.office2 === null) {
          const children = []

          if (office2Data.group && office2Data.group.length > 0) {
            office2Data.group.forEach((grp) => {
              const result = buildGroup(grp)
              if (Array.isArray(result)) {
                children.push(...result)
              } else {
                children.push(result)
              }
            })
          }

          return children
        }

        // Only create office2 node if office2 has a name
        const key = `office2_${this.slugify(office2Data.office2)}`
        const emps = employeesByLocation.get(key) || []
        const children = [...emps]

        // Handle groups under office2
        if (office2Data.group && office2Data.group.length > 0) {
          office2Data.group.forEach((grp) => {
            const result = buildGroup(grp)
            if (Array.isArray(result)) {
              children.push(...result)
            } else {
              children.push(result)
            }
          })
        }

        return {
          id: key,
          label: office2Data.office2,
          type: 'office2',
          children,
          count: emps.length,
        }
      }

      // Build main office node
      const rootEmps = employeesByLocation.get('office_root') || []
      const children = [...rootEmps]

      console.log('Root Employees:', rootEmps)

      // FIXED: Process named office2 FIRST, then null office2 groups
      if (officeData.office2 && officeData.office2.length > 0) {
        // First pass: Add named office2 entries
        officeData.office2.forEach((office2Data) => {
          if (office2Data.office2 !== null) {
            const result = buildOffice2(office2Data)
            if (Array.isArray(result)) {
              children.push(...result)
            } else {
              children.push(result)
            }
          }
        })

        // Second pass:  Spread groups from null office2 entries
        officeData.office2.forEach((office2Data) => {
          if (office2Data.office2 === null) {
            const result = buildOffice2(office2Data)
            if (Array.isArray(result)) {
              children.push(...result)
            }
          }
        })
      }

      const officeNode = {
        id: 'office_' + this.slugify(officeData.office),
        label: officeData.office,
        type: 'office',
        children,
        count: rootEmps.length,
      }

      console.log('Final Office Node:', officeNode)

      return [officeNode]
    },

    slugify(text) {
      return (
        text
          ?.toString()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '') || ''
      )
    },

    /**
     * Validate if a node can create Unit Work Plan
     * Returns:  { canCreate: boolean, message: string, incompleteItems: Array }
     */
    validateUWPCreation(nodeId) {
      const node = this._findNode(nodeId)
      if (!node) {
        return {
          canCreate: false,
          message: 'Node not found',
          incompleteItems: [],
        }
      }

      // Check if current node is completed
      const nodeCompletion = this.getNodeCompletion(nodeId)
      if (!nodeCompletion.isCompleted && nodeCompletion.total > 0) {
        return {
          canCreate: false,
          message: `${node.label} is not completed. Current status: ${nodeCompletion.ratio}`,
          incompleteItems: [],
        }
      }

      // Check all subordinate levels
      const incomplete = this.getIncompleteSubordinates(nodeId)
      if (incomplete.length > 0) {
        const levelMap = {
          unit: 'Unit',
          section: 'Section',
          division: 'Division',
          group: 'Group',
          office2: 'Office',
          office: 'Main Office',
        }

        const groupedByType = {}
        incomplete.forEach((item) => {
          if (!groupedByType[item.type]) {
            groupedByType[item.type] = []
          }
          groupedByType[item.type].push(item)
        })

        const messages = Object.entries(groupedByType)
          .map(([type, items]) => {
            return `${levelMap[type] || type} (${items.length}): ${items.map((i) => `${i.label} [${i.completion}]`).join(', ')}`
          })
          .join('\n')

        return {
          canCreate: false,
          message: `Cannot create Unit Work Plan.  The following subordinate levels are incomplete:\n\n${messages}`,
          incompleteItems: incomplete,
        }
      }

      return {
        canCreate: true,
        message: 'Ready to create Unit Work Plan',
        incompleteItems: [],
      }
    },

    _findNode(nodeId, nodes = this.structure) {
      if (!nodes) return null
      return (
        nodes.find((n) => n.id === nodeId) ||
        nodes.reduce((acc, n) => acc || this._findNode(nodeId, n.children), null)
      )
    },
  },
})
