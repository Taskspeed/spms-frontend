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
    officeHead: null,
  }),

  actions: {
    async fetchStructure() {
      this.loading = true
      try {
        const { officeId } = useUserStore()
        const { data: structureData } = await api.get('Spms/office/structure', {
          params: { office_id: officeId },
        })
        if (structureData?.length) {
          this.officeName = structureData[0].office
          const {
            data: { data: employees = [] },
          } = await api.get('Spms/fetch_employees', { params: { office_id: officeId } })
          this.structure = this.transformStructure(structureData[0], employees)
        } else this.structure = []
      } catch (err) {
        this.error = err.message
        this.structure = []
      } finally {
        this.loading = false
      }
    },

    transformStructure(officeData, employees) {
      if (!officeData) return []
      const assigned = new Map()
      const headRanks = [
        'office-head',
        'office2-head',
        'group-head',
        'division-head',
        'section-head',
        'unit-head',
      ]
      const isHeadByRank = (rank) => rank && headRanks.some((h) => rank.toLowerCase().includes(h))
      this.isHeadByRank = isHeadByRank

      const findHead = (emps, level) =>
        emps.find((emp) => emp.rank && emp.rank.toLowerCase().includes(`${level}-head`)) ||
        emps.find((emp) => emp.position?.toLowerCase().includes(`${level} head`))

      const categorize = () => {
        const unitMap = new Map(),
          sectionMap = new Map(),
          divisionMap = new Map(),
          groupMap = new Map(),
          office2Map = new Map(),
          officeList = []

        employees.forEach((emp) => {
          if (assigned.has(emp.id)) return
          const node = {
            id: 'emp_' + emp.id,
            label: emp.name,
            position: emp.position,
            rank: emp.rank,
            ipcrStatus: emp.ipcr_status || 'pending',
            type: 'employee',
            isHead: isHeadByRank(emp.rank),
            employeeData: emp,
          }

          if (emp.unit) {
            const key = [emp.office2, emp.group, emp.division, emp.section, emp.unit]
              .filter(Boolean)
              .join('|')
            if (!unitMap.has(key)) unitMap.set(key, [])
            unitMap.get(key).push(node)
            assigned.set(emp.id, true)
          } else if (emp.section) {
            const key = [emp.office2, emp.group, emp.division, emp.section]
              .filter(Boolean)
              .join('|')
            if (!sectionMap.has(key)) sectionMap.set(key, [])
            sectionMap.get(key).push(node)
            assigned.set(emp.id, true)
          } else if (emp.division) {
            const key = [emp.office2, emp.group, emp.division].filter(Boolean).join('|')
            if (!divisionMap.has(key)) divisionMap.set(key, [])
            divisionMap.get(key).push(node)
            assigned.set(emp.id, true)
          } else if (emp.group) {
            const key = [emp.office2, emp.group].filter(Boolean).join('|')
            if (!groupMap.has(key)) groupMap.set(key, [])
            groupMap.get(key).push(node)
            assigned.set(emp.id, true)
          } else if (emp.office2) {
            if (!office2Map.has(emp.office2)) office2Map.set(emp.office2, [])
            office2Map.get(emp.office2).push(node)
            assigned.set(emp.id, true)
          } else {
            officeList.push(node)
            assigned.set(emp.id, true)
          }
        })
        return { unitMap, sectionMap, divisionMap, groupMap, office2Map, officeList }
      }

      const { unitMap, sectionMap, divisionMap, groupMap, office2Map, officeList } = categorize()

      const getEmployees = (map, ...keys) => {
        for (const key of [
          keys.filter(Boolean).join('|'),
          ...keys.slice(1).map((k, i) =>
            keys
              .slice(i + 1)
              .filter(Boolean)
              .join('|'),
          ),
          keys[keys.length - 1],
        ])
          if (map.has(key)) return map.get(key)
        return []
      }

      const buildUnit = (office2, group, division, section, unit) => {
        const emps = getEmployees(unitMap, office2, group, division, section, unit)
        const head = findHead(emps, 'unit')
        return {
          id: 'unit_' + this.slugify(unit),
          label: unit,
          headName: head?.label || null,
          headRank: head?.rank || null,
          isHead: !!head,
          type: 'unit',
          children: [...(head ? [head] : []), ...emps.filter((e) => e !== head)],
        }
      }

      const buildSection = (office2, group, division, section, units) => {
        const emps = getEmployees(sectionMap, office2, group, division, section)
        const head = findHead(emps, 'section')
        return {
          id: 'section_' + this.slugify(section),
          label: section,
          headName: head?.label || null,
          headRank: head?.rank || null,
          isHead: !!head,
          type: 'section',
          children: [
            ...(head ? [head] : []),
            ...emps.filter((e) => e !== head),
            ...(units || []).map((unit) => buildUnit(office2, group, division, section, unit)),
          ],
        }
      }

      const buildDivision = (office2, group, divisionData) => {
        const emps = getEmployees(divisionMap, office2, group, divisionData.division)
        const head = findHead(emps, 'division')
        return {
          id: 'division_' + this.slugify(divisionData.division),
          label: divisionData.division,
          headName: head?.label || null,
          headRank: head?.rank || null,
          isHead: !!head,
          type: 'division',
          children: [
            ...(head ? [head] : []),
            ...emps.filter((e) => e !== head),
            ...(divisionData.sections || []).map((section) =>
              buildSection(office2, group, divisionData.division, section.section, section.units),
            ),
            ...(divisionData.units_without_section || []).map((unit) =>
              buildUnit(office2, group, divisionData.division, null, unit),
            ),
          ],
        }
      }

      const buildGroup = (office2, groupData) => {
        // If group is null, return children directly without creating a group node
        if (groupData.group === null) {
          const children = []

          // Process divisions
          if (groupData.divisions?.length) {
            children.push(...groupData.divisions.map((div) => buildDivision(office2, null, div)))
          }

          // Process sections without division
          if (groupData.sections_without_division?.length) {
            children.push(
              ...groupData.sections_without_division.map((section) =>
                buildSection(office2, null, null, section.section, section.units),
              ),
            )
          }

          // Process units without division
          if (groupData.units_without_division?.length) {
            children.push(
              ...groupData.units_without_division.map((unit) =>
                buildUnit(office2, null, null, null, unit),
              ),
            )
          }

          return children
        }

        // Normal group processing
        const emps = getEmployees(groupMap, office2, groupData.group)
        const head = findHead(emps, 'group')

        return {
          id: 'group_' + this.slugify(groupData.group),
          label: groupData.group,
          headName: head?.label || null,
          headRank: head?.rank || null,
          isHead: !!head,
          type: 'group',
          children: [
            ...(head ? [head] : []),
            ...emps.filter((e) => e !== head),
            ...(groupData.divisions || []).map((div) =>
              buildDivision(office2, groupData.group, div),
            ),
            ...(groupData.sections_without_division || []).map((section) =>
              buildSection(office2, groupData.group, null, section.section, section.units),
            ),
            ...(groupData.units_without_division || []).map((unit) =>
              buildUnit(office2, groupData.group, null, null, unit),
            ),
          ],
        }
      }

      const buildOffice2 = (office2Data) => {
        // If office2 is null, process groups directly
        if (office2Data.office2 === null) {
          const children = []

          // Process groups array
          if (Array.isArray(office2Data.group) && office2Data.group.length) {
            office2Data.group.forEach((groupData) => {
              const groupResult = buildGroup(null, groupData)
              if (Array.isArray(groupResult)) {
                children.push(...groupResult)
              } else {
                children.push(groupResult)
              }
            })
          }

          return children
        }

        // Normal office2 processing
        const emps = getEmployees(office2Map, office2Data.office2)
        const head = findHead(emps, 'office2')

        const office2Children = []

        // Add head and regular employees
        if (head) office2Children.push(head)
        office2Children.push(...emps.filter((e) => e !== head))

        // Process groups array (changed from office2Data.groups to office2Data.group)
        if (Array.isArray(office2Data.group) && office2Data.group.length) {
          office2Data.group.forEach((groupData) => {
            const groupResult = buildGroup(office2Data.office2, groupData)
            if (Array.isArray(groupResult)) {
              office2Children.push(...groupResult)
            } else {
              office2Children.push(groupResult)
            }
          })
        }

        return {
          id: 'office2_' + this.slugify(office2Data.office2),
          label: office2Data.office2,
          headName: head?.label || null,
          headRank: head?.rank || null,
          isHead: !!head,
          type: 'office2',
          children: office2Children,
        }
      }

      // Build main office node
      const officeHead = findHead(officeList, 'office')
      const officeNode = {
        id: 'office_' + this.slugify(officeData.office),
        label: officeData.office,
        headName: officeHead?.label || null,
        headRank: officeHead?.rank || null,
        isHead: true,
        type: 'office',
        children: [],
      }
      const regularOfficeEmployees = officeList.filter((emp) => emp !== officeHead)

      // Add office head first
      if (officeHead) officeNode.children.push(officeHead)

      // Add regular office employees
      officeNode.children.push(...regularOfficeEmployees)

      // Process office2 array
      if (Array.isArray(officeData.office2) && officeData.office2.length) {
        officeData.office2.forEach((office2Data) => {
          const office2Result = buildOffice2(office2Data)
          if (Array.isArray(office2Result)) {
            officeNode.children.push(...office2Result)
          } else {
            officeNode.children.push(office2Result)
          }
        })
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
  },
})
