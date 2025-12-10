import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'
import { useUserStore } from 'src/stores/userStore'

export const useOrganizationStore = defineStore('organization', {
  state: () => ({
    structure: ref([]),
    loading: ref(false),
    error: ref(null),
    officeName: '',
    targetPeriods: ref([]),
    selectedSemester: ref(null),
    selectedYear: ref(null),
    completionMap: ref({}),
    leafNodeTypes: ref([]),
  }),

  getters: {
    getLatestPeriod: (state) => {
      if (!state.targetPeriods || state.targetPeriods.length === 0) {
        return null
      }

      const semesterOrder = {
        'July-December': 2,
        'july-december': 2,
        'Jan-June': 1,
        'jan-june': 1,
      }

      return state.targetPeriods.sort((a, b) => {
        const yearDiff = parseInt(b.year) - parseInt(a.year)
        if (yearDiff !== 0) return yearDiff

        const semesterAPriority = semesterOrder[a.semester] || 0
        const semesterBPriority = semesterOrder[b.semester] || 0
        return semesterBPriority - semesterAPriority
      })[0]
    },

    getAvailableYears: (state) => {
      const years = new Set()
      state.targetPeriods.forEach((period) => {
        years.add(period.year)
      })
      return Array.from(years).sort().reverse()
    },

    getAvailableSemesters: (state) => {
      if (!state.selectedYear) return []
      return state.targetPeriods
        .filter((period) => period.year === state.selectedYear)
        .map((period) => period.semester)
        .filter((sem, idx, arr) => arr.indexOf(sem) === idx)
    },

    getCurrentTargetPeriod: (state) => {
      if (!state.selectedSemester || !state.selectedYear) {
        return null
      }
      return {
        semester: state.selectedSemester,
        year: state.selectedYear,
      }
    },

    getNodeCompletion: (state) => (nodeId) => {
      const completion = state.completionMap[nodeId]

      if (!completion) {
        return {
          completed: 0,
          total: 0,
          isCompleted: false,
          ratio: '0/0',
          isLeafNode: false,
        }
      }

      return {
        completed: completion.completed,
        total: completion.total,
        isCompleted: completion.completed === completion.total && completion.total > 0,
        ratio: `${completion.completed}/${completion.total}`,
        isLeafNode: completion.isLeafNode || false,
      }
    },

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
            const completion = state.completionMap[child.id]
            if (completion && completion.total > 0) {
              if (completion.completed !== completion.total) {
                incomplete.push({
                  id: child.id,
                  label: child.label,
                  type: child.type,
                  completion: `${completion.completed}/${completion.total}`,
                })
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
    async fetchListTargetPeriod() {
      this.loading = true
      try {
        const response = await api.get('/spms/target_periods/semester-year')

        this.targetPeriods = response.data || []

        const latestPeriod = this.getLatestPeriod
        if (latestPeriod) {
          this.selectedSemester = latestPeriod.semester
          this.selectedYear = latestPeriod.year
        }

        this.error = null
      } catch {
        this.error = 'Failed to fetch target periods'
        this.targetPeriods = []
      } finally {
        this.loading = false
      }
    },

    async setTargetPeriod(semester, year) {
      this.selectedSemester = semester
      this.selectedYear = year
      await this.fetchStructure()
    },

    detectLeafNodeTypes(nodes) {
      const leafTypes = new Set()

      const traverse = (currentNodes) => {
        if (!currentNodes || currentNodes.length === 0) return

        currentNodes.forEach((node) => {
          if (node.type === 'employee') return

          const hasNonEmployeeChildren = node.children?.some((child) => child.type !== 'employee')

          if (!hasNonEmployeeChildren) {
            leafTypes.add(node.type)
          }

          if (node.children) {
            traverse(node.children)
          }
        })
      }

      traverse(nodes)
      this.leafNodeTypes = Array.from(leafTypes)
    },

    calculateCompletionMap(nodes, employees) {
      const map = {}
      this.detectLeafNodeTypes(nodes)

      const hierarchyLevels = ['office', 'office2', 'group', 'division', 'section', 'unit']

      const getChildrenOfType = (node, targetType) => {
        if (!node.children) return []
        return node.children.filter((child) => child.type === targetType)
      }

      const isLeafNode = (nodeType) => {
        return this.leafNodeTypes.includes(nodeType)
      }

      const getNextLevelDown = (currentType) => {
        const currentIndex = hierarchyLevels.indexOf(currentType)
        if (currentIndex === -1) return null

        for (let i = currentIndex + 1; i < hierarchyLevels.length; i++) {
          if (this.leafNodeTypes.includes(hierarchyLevels[i])) {
            return hierarchyLevels[i]
          }
        }

        return null
      }

      const processNode = (node) => {
        if (!node.children || node.children.length === 0) return

        node.children.forEach((child) => {
          if (child.type !== 'employee') {
            processNode(child)
          }
        })

        if (isLeafNode(node.type)) {
          // Leaf node:  count employees with has_target_period
          const nodeEmps = employees.filter((emp) => {
            if (node.type === 'unit') return emp.unit === node.label
            if (node.type === 'section') return emp.section === node.label
            if (node.type === 'division') return emp.division === node.label
            if (node.type === 'group') return emp.group === node.label
            if (node.type === 'office2') return emp.office2 === node.label
            if (node.type === 'office') return emp.office === node.label
            return false
          })

          const completed = nodeEmps.filter((emp) => emp.has_target_period === true).length
          const total = nodeEmps.length

          if (total > 0) {
            map[node.id] = {
              completed,
              total,
              isLeafNode: true,
            }
          }
        } else {
          // Non-leaf node: count completed child organizational units
          const nextLevel = getNextLevelDown(node.type)

          if (nextLevel) {
            const childNodes = getChildrenOfType(node, nextLevel)
            let completedChildren = 0

            childNodes.forEach((child) => {
              const childCompletion = map[child.id]
              if (
                childCompletion &&
                childCompletion.completed === childCompletion.total &&
                childCompletion.total > 0
              ) {
                completedChildren++
              }
            })

            if (childNodes.length > 0) {
              map[node.id] = {
                completed: completedChildren,
                total: childNodes.length,
                isLeafNode: false,
              }
            }
          }
        }
      }

      nodes.forEach((node) => {
        processNode(node)
      })

      this.completionMap = map
    },

    async fetchStructure() {
      this.loading = true
      try {
        const userStore = useUserStore()
        const { officeId } = userStore

        const { data: structureData } = await api.get('spms/office/structure', {
          params: { office_id: officeId },
        })

        let employees = []
        try {
          const employeeParams = {
            office_id: officeId,
          }

          if (this.selectedSemester && this.selectedYear) {
            employeeParams.semester = this.selectedSemester
            employeeParams.year = this.selectedYear
          }

          const employeeResponse = await api.get('spms/fetch_employees', {
            params: employeeParams,
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
        } catch {
          employees = []
        }

        if (structureData?.length) {
          this.officeName = structureData[0].office
          this.structure = this.transformStructure(structureData[0], employees)
          this.calculateCompletionMap(this.structure, employees)
        } else {
          this.structure = []
        }

        this.error = null
      } catch (err) {
        this.error = err.message
        this.structure = []
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

      const createEmployeeNode = (emp) => ({
        id: 'emp_' + emp.id,
        label: emp.name,
        position: emp.position?.name || 'N/A',
        rank: emp.rank,
        ipcrStatus: emp.ipcr_status || 'pending',
        type: 'employee',
        isHead: isHeadByRank(emp.rank),
        hasTargetPeriod: emp.has_target_period,
        employeeData: emp,
        children: [],
      })

      const employeesByLocation = new Map()

      employees.forEach((emp) => {
        let key = ''

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

      const buildDivision = (divisionData) => {
        const key = `division_${this.slugify(divisionData.division)}`
        const emps = employeesByLocation.get(key) || []
        const children = [...emps]

        if (divisionData.sections && divisionData.sections.length > 0) {
          divisionData.sections.forEach((sec) => {
            children.push(buildSection(sec.section, sec.units || []))
          })
        }

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

      const buildGroup = (groupData) => {
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

      const buildOffice2 = (office2Data) => {
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

        const key = `office2_${this.slugify(office2Data.office2)}`
        const emps = employeesByLocation.get(key) || []
        const children = [...emps]

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

      const rootEmps = employeesByLocation.get('office_root') || []
      const children = [...rootEmps]

      if (officeData.office2 && officeData.office2.length > 0) {
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

    validateUWPCreation(nodeId) {
      const node = this._findNode(nodeId)
      if (!node) {
        return {
          canCreate: false,
          message: 'Node not found',
          incompleteItems: [],
        }
      }

      const nodeCompletion = this.getNodeCompletion(nodeId)

      // Leaf nodes can ALWAYS create UWP
      if (nodeCompletion.isLeafNode) {
        return {
          canCreate: true,
          message: 'Ready to create Unit Work Plan',
          incompleteItems: [],
        }
      }

      // For parent nodes, check if all subordinate child units are complete
      const incomplete = this.getIncompleteSubordinates(nodeId)

      if (incomplete.length > 0) {
        const levelMap = {
          unit: 'Unit',
          section: 'Section',
          division: 'Division',
          group: 'Group',
          office2: 'Office2',
          office: 'Office',
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
            return `${levelMap[type] || type} (${items.length}): ${items
              .map((i) => `${i.label} [${i.completion}]`)
              .join(', ')}`
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
