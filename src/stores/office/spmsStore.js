import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'boot/axios';
import { useUserStore } from 'src/stores/userStore';

export const useOrganizationStore = defineStore('organization', {
  state: () => ({
    structure: ref([]),
    loading: ref(false),
    error: ref(null),
    officeName: '',
    officeHead: null
  }),

  actions: {
    async fetchStructure() {
      this.loading = true;
      try {
        const { officeId } = useUserStore();
        const { data: structureData } = await api.get('Spms/office/structure', { params: { office_id: officeId } });
        if (structureData?.length) {
          this.officeName = structureData[0].office;
          const { data: { data: employees = [] } } = await api.get('Spms/fetch_employees', { params: { office_id: officeId } });
          this.structure = this.transformStructure(structureData[0], employees);
        } else this.structure = [];
      } catch (err) {
        this.error = err.message;
        this.structure = [];
      } finally {
        this.loading = false;
      }
    },

    transformStructure(officeData, employees) {
      if (!officeData) return [];
      const assigned = new Map();
      const headRanks = ['office-head', 'division-head', 'section-head', 'unit-head'];
      const isHeadByRank = rank => rank && headRanks.some(h => rank.toLowerCase().includes(h));
      this.isHeadByRank = isHeadByRank;

      const findHead = (emps, level) => emps.find(emp => emp.rank && emp.rank.toLowerCase().includes(`${level}-head`)) ||
        emps.find(emp => emp.position?.toLowerCase().includes(`${level} head`));

      const categorize = () => {
        const unitMap = new Map(), sectionMap = new Map(), divisionMap = new Map(), officeList = [];
        employees.forEach(emp => {
          if (assigned.has(emp.id)) return;
          const node = {
            id: 'emp_' + emp.id, label: emp.name, position: emp.position, rank: emp.rank,
            ipcrStatus: emp.ipcr_status || 'pending', type: 'employee', isHead: isHeadByRank(emp.rank), employeeData: emp
          };
          if (emp.unit) {
            const key = [emp.division, emp.section, emp.unit].filter(Boolean).join('|');
            if (!unitMap.has(key)) unitMap.set(key, []);
            unitMap.get(key).push(node);
            assigned.set(emp.id, true);
          } else if (emp.section) {
            const key = [emp.division, emp.section].filter(Boolean).join('|');
            if (!sectionMap.has(key)) sectionMap.set(key, []);
            sectionMap.get(key).push(node);
            assigned.set(emp.id, true);
          } else if (emp.division) {
            if (!divisionMap.has(emp.division)) divisionMap.set(emp.division, []);
            divisionMap.get(emp.division).push(node);
            assigned.set(emp.id, true);
          } else {
            officeList.push(node);
            assigned.set(emp.id, true);
          }
        });
        return { unitMap, sectionMap, divisionMap, officeList };
      };

      const { unitMap, sectionMap, divisionMap, officeList } = categorize();

      const getEmployees = (map, ...keys) => {
        for (const key of [
          keys.filter(Boolean).join('|'),
          ...keys.slice(1).map((k, i) => keys.slice(i + 1).filter(Boolean).join('|')),
          keys[keys.length - 1]
        ]) if (map.has(key)) return map.get(key);
        return [];
      };

      const officeHead = findHead(officeList, 'office');
      const officeNode = {
        id: 'office_' + this.slugify(officeData.office),
        label: officeData.office,
        headName: officeHead?.label || null,
        headRank: officeHead?.rank || null,
        isHead: true,
        type: 'office',
        children: []
      };
      const regularOfficeEmployees = officeList.filter(emp => emp !== officeHead);

      const buildUnit = (division, section, unit) => {
        const emps = getEmployees(unitMap, division, section, unit);
        const head = findHead(emps, 'unit');
        return {
          id: 'unit_' + this.slugify(unit),
          label: unit,
          headName: head?.label || null,
          headRank: head?.rank || null,
          isHead: true,
          type: 'unit',
          children: [ ...(head ? [head] : []), ...emps.filter(e => e !== head) ]
        };
      };

      const buildSection = (division, section, units) => {
        const emps = getEmployees(sectionMap, division, section);
        const head = findHead(emps, 'section');
        return {
          id: 'section_' + this.slugify(section),
          label: section,
          headName: head?.label || null,
          headRank: head?.rank || null,
          isHead: true,
          type: 'section',
          children: [
            ...(head ? [head] : []),
            ...emps.filter(e => e !== head),
            ...(units || []).map(unit => buildUnit(division, section, unit))
          ]
        };
      };

      const buildDivision = division => {
        const emps = getEmployees(divisionMap, division.division);
        const head = findHead(emps, 'division');
        return {
          id: 'division_' + this.slugify(division.division),
          label: division.division,
          headName: head?.label || null,
          headRank: head?.rank || null,
          isHead: true,
          type: 'division',
          children: [
            ...(head ? [head] : []),
            ...emps.filter(e => e !== head),
            ...(division.sections || []).map(section =>
              buildSection(division.division, section.section, section.units)
            ),
            ...(division.units_without_section || []).map(unit =>
              buildUnit(division.division, null, unit)
            )
          ]
        };
      };

      if (officeData.divisions?.length)
        officeNode.children.push(...officeData.divisions.map(buildDivision));
      if (officeData.sections_without_division?.length)
        officeNode.children.push(...officeData.sections_without_division.map(section =>
          buildSection(null, section.section, section.units)
        ));
      if (officeData.units_without_division?.length)
        officeNode.children.push(...officeData.units_without_division.map(unit =>
          buildUnit(null, null, unit)
        ));
      if (officeHead) officeNode.children.unshift(officeHead);
      officeNode.children.push(...regularOfficeEmployees);

      return [officeNode];
    },

    slugify(text) {
      return text?.toString().toLowerCase()
        .replace(/\s+/g, '-')
        // eslint-disable-next-line no-useless-escape
        .replace(/[^\w\-]+/g, '')
        // eslint-disable-next-line no-useless-escape
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '') || '';
    }
  },
});
