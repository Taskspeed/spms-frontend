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
    // Head position titles for auto-detection
    headPositionTitles: [
      'office head',
      'sub-office head',
      'group head',
      'division head',
      'section head',
      'unit head',
    ],
  }),

  getters: {
    getLatestPeriod: (state) => {
      if (!state.targetPeriods || state.targetPeriods.length === 0) return null

      const semesterOrder = {
        'July-December': 2,
        'july-december': 2,
        'Jan-June': 1,
        'jan-june': 1,
      }

      return state.targetPeriods.sort((a, b) => {
        const yearDiff = parseInt(b.year) - parseInt(a.year)
        if (yearDiff !== 0) return yearDiff
        return (semesterOrder[b.semester] || 0) - (semesterOrder[a.semester] || 0)
      })[0]
    },

    getAvailableYears: (state) => {
      const years = new Set()
      state.targetPeriods.forEach((period) => years.add(period.year))
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
      if (!state.selectedSemester || !state.selectedYear) return null
      return { semester: state.selectedSemester, year: state.selectedYear }
    },

    getNodeCompletion: (state) => (nodeId) => {
      const completion = state.completionMap[nodeId]
      if (!completion) {
        return { completed: 0, total: 0, isCompleted: false, ratio: '0/0', isLeafNode: false }
      }
      return {
        completed: completion.completed,
        total: completion.total,
        isCompleted: completion.completed === completion.total && completion.total > 0,
        ratio: `${completion.completed}/${completion.total}`,
        isLeafNode: completion.isLeafNode || false,
      }
    },

    // Get all employees with head positions in the organization
    getHeadEmployees: (state) => {
      const headEmployees = []

      const traverseForHeads = (nodes) => {
        if (!nodes) return
        for (const node of nodes) {
          if (node.type === 'employee') {
            const jobTitle = node.employeeData?.job_title || node.jobTitle || ''
            const lowerTitle = jobTitle.toLowerCase()
            if (state.headPositionTitles.some((title) => lowerTitle.includes(title))) {
              headEmployees.push(node)
            }
          }
          if (node.children) {
            traverseForHeads(node.children)
          }
        }
      }

      traverseForHeads(state.structure)
      return headEmployees
    },
  },

  actions: {
    // =========================================================================
    // HEAD POSITION DETECTION
    // =========================================================================

    /**
     * Check if an employee has a head position
     */
    isHeadPosition(employee) {
      if (!employee) return false
      const jobTitle = employee.employeeData?.job_title || employee.jobTitle || ''
      const lowerTitle = jobTitle.toLowerCase()
      return this.headPositionTitles.some((title) => lowerTitle.includes(title))
    },

    // =========================================================================
    // OFFICE HEAD VALIDATION
    // =========================================================================

    /**
     * Find the Office Head employee at the office (root) level.
     * Identified by job_title === 'Office Head' (case-insensitive).
     * Returns the employee node or null if not found.
     */
    getOfficeHeadEmployee() {
      const officeNode = this.structure?.[0]
      if (!officeNode) return null

      // Only look at direct children of the office node
      const directEmployees = (officeNode.children || []).filter(
        (child) => child.type === 'employee',
      )

      return (
        directEmployees.find((emp) => {
          const jobTitle =
            emp.employeeData?.job_title?.toLowerCase() || emp.jobTitle?.toLowerCase() || ''
          return jobTitle === 'office head'
        }) || null
      )
    },

    /**
     * Returns true if the Office Head employee has has_target_period = true.
     * Returns false if no Office Head exists or their target period is not set.
     */
    isOfficeHeadReady() {
      const officeHead = this.getOfficeHeadEmployee()
      if (!officeHead) return false
      return officeHead.hasTargetPeriod === true
    },

    /**
     * Get all employees with head positions for auto-selection in UWP
     */
    getHeadEmployeesForAutoSelection() {
      const headEmployees = []

      const traverse = (nodes) => {
        if (!nodes) return
        for (const node of nodes) {
          if (node.type === 'employee') {
            const jobTitle = node.employeeData?.job_title || node.jobTitle || ''
            const lowerTitle = jobTitle.toLowerCase()
            if (this.headPositionTitles.some((title) => lowerTitle.includes(title))) {
              headEmployees.push(node.employeeData || node)
            }
          }
          if (node.children) {
            traverse(node.children)
          }
        }
      }

      traverse(this.structure)
      return headEmployees
    },

    // =========================================================================
    // TARGET PERIOD
    // =========================================================================

    async fetchListTargetPeriod() {
      this.loading = true
      try {
        const response = await api.get('/targetPeriod')
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

    // =========================================================================
    // EMPLOYEE STATUS HELPERS
    // =========================================================================

    isExcludedStatus(status) {
      if (!status) return false
      return ['CONTRACTUAL', 'HONORARIUM'].includes(status.toUpperCase())
    },

    shouldCountEmployee(employee) {
      if (!employee) return false
      const status = employee.status || employee.employeeData?.status
      return !this.isExcludedStatus(status)
    },

    // =========================================================================
    // FETCH STRUCTURE
    // =========================================================================

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
          const employeeParams = { office_id: officeId }
          if (this.selectedSemester && this.selectedYear) {
            employeeParams.semester = this.selectedSemester
            employeeParams.year = this.selectedYear
          }

          const employeeResponse = await api.get('spms/fetch_employees', {
            params: employeeParams,
          })

          if (Array.isArray(employeeResponse.data)) {
            employees = employeeResponse.data
          } else if (Array.isArray(employeeResponse.data?.data)) {
            employees = employeeResponse.data.data
          } else if (Array.isArray(employeeResponse.data?.employees)) {
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

    async fetchStructureHR() {
      this.loading = true
      try {
        const userStore = useUserStore()
        const { officeId } = userStore

        const { data: structureData } = await api.get('spms/office/structure', {
          params: { office_id: officeId },
        })

        let employees = []
        try {
          const employeeParams = { office_id: officeId }
          if (this.selectedSemester && this.selectedYear) {
            employeeParams.semester = this.selectedSemester
            employeeParams.year = this.selectedYear
          }

          const employeeResponse = await api.get('spms/employees-requested', {
            params: employeeParams,
          })

          if (Array.isArray(employeeResponse.data)) {
            employees = employeeResponse.data
          } else if (Array.isArray(employeeResponse.data?.data)) {
            employees = employeeResponse.data.data
          } else if (Array.isArray(employeeResponse.data?.employees)) {
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

    // =========================================================================
    // TRANSFORM STRUCTURE
    // =========================================================================

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

      const createEmployeeNode = (emp) => {
        let ipcrStatus = ''

        if (Array.isArray(emp.existing_target_period) && emp.existing_target_period.length > 0) {
          ipcrStatus = emp.existing_target_period[0]?.status || 'pending'
        } else if (emp.existing_target_period && typeof emp.existing_target_period === 'object') {
          ipcrStatus = emp.existing_target_period.status || 'pending'
        } else if (emp.ipcr_status) {
          ipcrStatus = emp.ipcr_status
        }

        if (emp.target_period?.status) {
          ipcrStatus = emp.target_period.status
        }

        return {
          id: 'emp_' + emp.id,
          label: emp.name,
          position:
            typeof emp.position === 'object' ? emp.position?.name || 'N/A' : emp.position || 'N/A',
          rank: emp.rank,
          // Store job_title directly on the node for easy access
          jobTitle: emp.job_title || '',
          ipcrStatus,
          type: 'employee',
          isHead: isHeadByRank(emp.rank) || this.isHeadPosition(emp),
          hasTargetPeriod: emp.has_target_period === true,
          employeeData: emp,
          children: [],
          directCount: 1,
        }
      }

      // Group employees by their lowest-level org unit
      const employeesByLocation = new Map()
      employees.forEach((emp) => {
        let key = ''
        if (emp.unit) key = `unit_${this.slugify(emp.unit)}`
        else if (emp.section) key = `section_${this.slugify(emp.section)}`
        else if (emp.division) key = `division_${this.slugify(emp.division)}`
        else if (emp.group) key = `group_${this.slugify(emp.group)}`
        else if (emp.office2) key = `office2_${this.slugify(emp.office2)}`
        else key = 'office_root'

        if (!employeesByLocation.has(key)) employeesByLocation.set(key, [])
        employeesByLocation.get(key).push(createEmployeeNode(emp))
      })

      const buildUnit = (unitName) => {
        const key = `unit_${this.slugify(unitName)}`
        const allEmps = employeesByLocation.get(key) || []
        const countableEmps = allEmps.filter((emp) => this.shouldCountEmployee(emp))
        return {
          id: key,
          label: unitName,
          type: 'unit',
          children: [...allEmps],
          directCount: countableEmps.length,
        }
      }

      const buildSection = (sectionName, units) => {
        const key = `section_${this.slugify(sectionName)}`
        const allEmps = employeesByLocation.get(key) || []
        const countableEmps = allEmps.filter((emp) => this.shouldCountEmployee(emp))
        const builtUnits = (units || []).map((u) => buildUnit(u))
        const employeesInChildUnits = builtUnits.reduce((sum, u) => sum + u.directCount, 0)
        return {
          id: key,
          label: sectionName,
          type: 'section',
          children: [...allEmps, ...builtUnits],
          directCount: countableEmps.length + employeesInChildUnits,
        }
      }

      const buildDivision = (divisionData) => {
        const key = `division_${this.slugify(divisionData.division)}`
        const allEmps = employeesByLocation.get(key) || []
        const countableEmps = allEmps.filter((emp) => this.shouldCountEmployee(emp))
        const children = [...allEmps]
        let directOrgChildCount = 0

        ;(divisionData.sections || []).forEach((sec) => {
          children.push(buildSection(sec.section, sec.units || []))
          directOrgChildCount++
        })
        ;(divisionData.units_without_section || []).forEach((unit) => {
          children.push(buildUnit(unit))
          directOrgChildCount++
        })

        return {
          id: key,
          label: divisionData.division,
          type: 'division',
          children,
          directCount: countableEmps.length + directOrgChildCount,
        }
      }

      const buildGroup = (groupData) => {
        const children = []

        const addGroupChildren = (target) => {
          let count = 0
          ;(groupData.divisions || []).forEach((div) => {
            target.push(buildDivision(div))
            count++
          })
          ;(groupData.sections_without_division || []).forEach((sec) => {
            target.push(buildSection(sec.section, sec.units || []))
            count++
          })
          ;(groupData.units_without_division || []).forEach((unit) => {
            target.push(buildUnit(unit))
            count++
          })
          return count
        }

        if (groupData.group === null) {
          addGroupChildren(children)
          return children
        }

        const key = `group_${this.slugify(groupData.group)}`
        const allEmps = employeesByLocation.get(key) || []
        const countableEmps = allEmps.filter((emp) => this.shouldCountEmployee(emp))
        children.push(...allEmps)
        const directOrgChildCount = addGroupChildren(children)

        return {
          id: key,
          label: groupData.group,
          type: 'group',
          children,
          directCount: countableEmps.length + directOrgChildCount,
        }
      }

      const buildOffice2 = (office2Data) => {
        const children = []

        const addOffice2Children = (target) => {
          let count = 0
          ;(office2Data.group || []).forEach((grp) => {
            const result = buildGroup(grp)
            if (Array.isArray(result)) {
              target.push(...result)
              count += result.length
            } else {
              target.push(result)
              count++
            }
          })
          return count
        }

        if (office2Data.office2 === null) {
          addOffice2Children(children)
          return children
        }

        const key = `office2_${this.slugify(office2Data.office2)}`
        const allEmps = employeesByLocation.get(key) || []
        const countableEmps = allEmps.filter((emp) => this.shouldCountEmployee(emp))
        children.push(...allEmps)
        const directOrgChildCount = addOffice2Children(children)

        return {
          id: key,
          label: office2Data.office2,
          type: 'office2',
          children,
          directCount: countableEmps.length + directOrgChildCount,
        }
      }

      // Build office root
      const rootEmps = employeesByLocation.get('office_root') || []
      const countableRootEmps = rootEmps.filter((emp) => this.shouldCountEmployee(emp))
      const officeChildren = [...rootEmps]
      let officeDirectOrgChildCount = 0

      ;(officeData.office2 || []).forEach((office2Data) => {
        const result = buildOffice2(office2Data)
        if (Array.isArray(result)) {
          officeChildren.push(...result)
          officeDirectOrgChildCount += result.length
        } else {
          officeChildren.push(result)
          officeDirectOrgChildCount++
        }
      })

      const officeNode = {
        id: 'office_' + this.slugify(officeData.office),
        label: officeData.office,
        type: 'office',
        children: officeChildren,
        directCount: countableRootEmps.length + officeDirectOrgChildCount,
      }

      // Compute leaf flags
      const computeLeafFlags = (node) => {
        if (!node || node.type === 'employee') return
        let hasOrgChild = false
        ;(node.children || []).forEach((child) => {
          computeLeafFlags(child)
          if (child.type !== 'employee') hasOrgChild = true
        })
        node.isLeaf = !hasOrgChild
      }
      computeLeafFlags(officeNode)

      return [officeNode]
    },

    // =========================================================================
    // COMPLETION MAP
    // =========================================================================

    calculateCompletionMap(nodes) {
      const map = {}

      const countEmployees = (node, countFn) => {
        if (!node) return 0
        if (node.type === 'employee') return countFn(node) ? 1 : 0
        return (node.children || []).reduce((sum, child) => sum + countEmployees(child, countFn), 0)
      }

      const processNode = (node) => {
        if (!node) return
        ;(node.children || []).forEach((child) => processNode(child))

        if (node.type === 'employee') {
          const shouldCount = this.shouldCountEmployee(node)
          map[node.id] = {
            completed: shouldCount && node.hasTargetPeriod ? 1 : 0,
            total: shouldCount ? 1 : 0,
            isLeafNode: false,
          }
          return
        }

        if (node.isLeaf) {
          const total = countEmployees(node, (emp) => this.shouldCountEmployee(emp))
          const completed = countEmployees(
            node,
            (emp) => this.shouldCountEmployee(emp) && emp.hasTargetPeriod,
          )
          map[node.id] = { completed, total, isLeafNode: true }
        } else {
          let completedChildren = 0
          let totalDirectItems = 0

          ;(node.children || []).forEach((child) => {
            if (child.type === 'employee') {
              if (this.shouldCountEmployee(child)) {
                totalDirectItems++
                if (child.hasTargetPeriod) completedChildren++
              }
            } else {
              totalDirectItems++
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

      if (Array.isArray(nodes)) nodes.forEach((n) => processNode(n))
      else if (nodes) processNode(nodes)

      this.completionMap = map
    },

    // =========================================================================
    // UTILITIES
    // =========================================================================

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
