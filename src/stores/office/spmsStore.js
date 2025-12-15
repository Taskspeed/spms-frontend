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
          this.calculateCompletionMap(this.structure)
        } else {
          this.structure = []
          this.completionMap = {}
        }

        this.error = null
      } catch (err) {
        this.error = err.message
        this.structure = []
        this.completionMap = {}
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
        position:
          typeof emp.position === 'object' ? emp.position?.name || 'N/A' : emp.position || 'N/A',
        rank: emp.rank,
        ipcrStatus: emp.ipcr_status || 'pending',
        type: 'employee',
        isHead: isHeadByRank(emp.rank),
        hasTargetPeriod: emp.has_target_period === true,
        employeeData: emp,
        children: [],
        directCount: 1,
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

        if (!employeesByLocation.has(key)) employeesByLocation.set(key, [])
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
          directCount: emps.length, // Direct employees only
        }
      }

      const buildSection = (sectionName, units) => {
        const key = `section_${this.slugify(sectionName)}`
        const emps = employeesByLocation.get(key) || []
        const builtUnits = (units || []).map((u) => buildUnit(u))
        const children = [...emps, ...builtUnits]

        // Direct employees + all employees in direct child units
        const employeesInChildUnits = builtUnits.reduce((sum, unit) => sum + unit.directCount, 0)
        const directCount = emps.length + employeesInChildUnits

        return {
          id: key,
          label: sectionName,
          type: 'section',
          children,
          directCount,
        }
      }

      const buildDivision = (divisionData) => {
        const key = `division_${this.slugify(divisionData.division)}`
        const emps = employeesByLocation.get(key) || []
        const children = [...emps]
        let directOrgChildCount = 0

        if (divisionData.sections && divisionData.sections.length > 0) {
          divisionData.sections.forEach((sec) => {
            children.push(buildSection(sec.section, sec.units || []))
            directOrgChildCount++
          })
        }

        if (divisionData.units_without_section && divisionData.units_without_section.length > 0) {
          divisionData.units_without_section.forEach((unit) => {
            children.push(buildUnit(unit))
            directOrgChildCount++
          })
        }

        const directCount = emps.length + directOrgChildCount
        return {
          id: key,
          label: divisionData.division,
          type: 'division',
          children,
          directCount,
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
        let directOrgChildCount = 0

        if (groupData.divisions && groupData.divisions.length > 0) {
          groupData.divisions.forEach((div) => {
            children.push(buildDivision(div))
            directOrgChildCount++
          })
        }

        if (groupData.sections_without_division && groupData.sections_without_division.length > 0) {
          groupData.sections_without_division.forEach((sec) => {
            children.push(buildSection(sec.section, sec.units || []))
            directOrgChildCount++
          })
        }

        if (groupData.units_without_division && groupData.units_without_division.length > 0) {
          groupData.units_without_division.forEach((unit) => {
            children.push(buildUnit(unit))
            directOrgChildCount++
          })
        }

        const directCount = emps.length + directOrgChildCount
        return {
          id: key,
          label: groupData.group,
          type: 'group',
          children,
          directCount,
        }
      }

      const buildOffice2 = (office2Data) => {
        if (office2Data.office2 === null) {
          const children = []
          if (office2Data.group && office2Data.group.length > 0) {
            office2Data.group.forEach((grp) => {
              const result = buildGroup(grp)
              if (Array.isArray(result)) children.push(...result)
              else children.push(result)
            })
          }
          return children
        }

        const key = `office2_${this.slugify(office2Data.office2)}`
        const emps = employeesByLocation.get(key) || []
        const children = [...emps]
        let directOrgChildCount = 0

        if (office2Data.group && office2Data.group.length > 0) {
          office2Data.group.forEach((grp) => {
            const result = buildGroup(grp)
            if (Array.isArray(result)) {
              children.push(...result)
              directOrgChildCount += result.length
            } else {
              children.push(result)
              directOrgChildCount++
            }
          })
        }

        const directCount = emps.length + directOrgChildCount
        return {
          id: key,
          label: office2Data.office2,
          type: 'office2',
          children,
          directCount,
        }
      }

      const rootEmps = employeesByLocation.get('office_root') || []
      const children = [...rootEmps]
      let officeDirectOrgChildCount = 0

      if (officeData.office2 && officeData.office2.length > 0) {
        officeData.office2.forEach((office2Data) => {
          if (office2Data.office2 !== null) {
            const result = buildOffice2(office2Data)
            if (Array.isArray(result)) {
              children.push(...result)
              officeDirectOrgChildCount += result.length
            } else {
              children.push(result)
              officeDirectOrgChildCount++
            }
          }
        })

        officeData.office2.forEach((office2Data) => {
          if (office2Data.office2 === null) {
            const result = buildOffice2(office2Data)
            if (Array.isArray(result)) {
              children.push(...result)
              officeDirectOrgChildCount += result.length
            }
          }
        })
      }

      const officeNode = {
        id: 'office_' + this.slugify(officeData.office),
        label: officeData.office,
        type: 'office',
        children,
        directCount: rootEmps.length + officeDirectOrgChildCount,
      }

      const computeLeafFlags = (node) => {
        if (!node) return

        if (node.type === 'employee') {
          node.isLeaf = false
          return
        }

        let hasOrgChild = false

        if (Array.isArray(node.children) && node.children.length > 0) {
          for (const child of node.children) {
            computeLeafFlags(child)
            if (child.type !== 'employee') hasOrgChild = true
          }
        }

        node.isLeaf = !hasOrgChild
      }

      computeLeafFlags(officeNode)

      return [officeNode]
    },

    calculateCompletionMap(nodes) {
      const map = {}

      const processNode = (node) => {
        if (!node) return

        if (Array.isArray(node.children) && node.children.length > 0) {
          node.children.forEach((child) => {
            processNode(child)
          })
        }

        if (node.type === 'employee') {
          map[node.id] = {
            completed: node.hasTargetPeriod ? 1 : 0,
            total: 1,
            isLeafNode: false,
          }
          return
        }

        if (node.isLeaf) {
          // For leaf organizational nodes, count all employees
          const countAllEmployees = (n) => {
            if (!n) return 0
            if (n.type === 'employee') return 1

            let total = 0
            if (n.children && n.children.length > 0) {
              for (const child of n.children) {
                total += countAllEmployees(child)
              }
            }
            return total
          }

          const countAllCompletedEmployees = (n) => {
            if (!n) return 0
            if (n.type === 'employee') return n.hasTargetPeriod ? 1 : 0

            let total = 0
            if (n.children && n.children.length > 0) {
              for (const child of n.children) {
                total += countAllCompletedEmployees(child)
              }
            }
            return total
          }

          const totalEmployees = countAllEmployees(node)
          const completedEmployees = countAllCompletedEmployees(node)

          map[node.id] = {
            completed: completedEmployees,
            total: totalEmployees,
            isLeafNode: true,
          }
        } else {
          // For parent nodes, count BOTH direct employees AND direct child organizational nodes
          const directChildren = node.children || []

          let completedChildren = 0
          let totalDirectItems = 0

          directChildren.forEach((child) => {
            totalDirectItems++

            if (child.type === 'employee') {
              // Employee is "complete" if they have a target period
              if (child.hasTargetPeriod) {
                completedChildren++
              }
            } else {
              // Org unit is "complete" if all its subordinates are complete
              const childEntry = map[child.id]
              if (childEntry && childEntry.total > 0 && childEntry.completed === childEntry.total) {
                completedChildren++
              }
            }
          })

          map[node.id] = {
            completed: completedChildren,
            total: totalDirectItems,
            isLeafNode: false,
          }
        }
      }

      if (Array.isArray(nodes)) {
        nodes.forEach((n) => processNode(n))
      } else if (nodes) {
        processNode(nodes)
      }

      this.completionMap = map
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

      if (node.isLeaf) {
        return {
          canCreate: true,
          message: 'Ready to create Unit Work Plan (leaf level)',
          incompleteItems: [],
        }
      }

      const findIncompleteSubordinates = (currentNode) => {
        const incomplete = []
        if (!currentNode || !currentNode.children) return incomplete

        for (const child of currentNode.children) {
          if (child.type === 'employee') continue
          const completion = this.completionMap[child.id]
          if (completion && completion.total > 0 && completion.completed !== completion.total) {
            incomplete.push({
              id: child.id,
              label: child.label,
              type: child.type,
              completion: `${completion.completed}/${completion.total}`,
            })
          }
          incomplete.push(...findIncompleteSubordinates(child))
        }
        return incomplete
      }

      const incomplete = findIncompleteSubordinates(node)

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
          if (!groupedByType[item.type]) groupedByType[item.type] = []
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
  },
})
