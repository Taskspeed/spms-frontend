  //employeeStore.js
  import { defineStore } from 'pinia'
  import { api } from 'src/boot/axios'
  import { useUserStore } from '../userStore'

  export const useEmployeeStore = defineStore('employee', {
    state: () => ({
      employees: [],
      loading: false,
      error: null,
      currentOfficeId: null,
      userOffice: null,
      assignedEmployees: [],
      unassignedEmployees: [],
      currentNode: null,
      softDeletedEmployees: [],
      searchedEmployees: [],
      employeeCounts: null
    }),

    actions: {


    async updateEmployeeRank(employeeId, newRank) {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post( // Changed to PUT to match REST conventions
        `/employees/${employeeId}/rank`,
        { rank: newRank },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update the local employee data
        const employee = this.employees.find(e => e.id === employeeId);
        if (employee) {
          employee.rank = newRank;
        }
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to update rank');
    } catch (error) {
      console.error('Failed to update employee rank:', error);
      throw error;
    }
  },

      async fetchEmployeeCounts(officeId) {
        this.loading = true;
        this.error = null;
        try {
          const token = localStorage.getItem('token');
          const response = await api.get('/employee/counts', {
            headers: { Authorization: `Bearer ${token}` },
            params: { office_id: officeId }
          });

          if (response.data.success) {
            this.employeeCounts = response.data.data;
            return response.data.data;
          }
          throw new Error(response.data.message || 'Failed to fetch employee counts');
        } catch (error) {
          console.error('Failed to fetch employee counts:', error);
          this.error = error.message || 'Failed to fetch employee counts';
          throw error;
        } finally {
          this.loading = false;
        }
      },

      async fetchAllEmployees() {
        return this._fetchEmployees({ show_all: true, unassigned_only: true });
      },

      async fetchEmployeesByNode(node) {
        this.loading = true;
        this.error = null;
        this.currentNode = node;

        try {
          const token = localStorage.getItem('token');
          const userStore = useUserStore();
          const params = { office_id: userStore.user?.office_id };

          if (node) {
            if (node.type === 'division') params.division = node.name;
            else if (node.type === 'section') params.section = node.name;
            else if (node.type === 'unit') params.unit = node.name;
          }

          const response = await api.get('/fetch_employees', {
            headers: { Authorization: `Bearer ${token}` },
            params
          });

          if (response.data.success) {
            this.assignedEmployees = response.data.data.map(emp => ({
              id: emp.id,
              name: emp.name,
              position_id: emp.position_id,
              position: emp.position,
              office_id: emp.office_id,
              office: emp.office,
              division: emp.division,
              section: emp.section,
              unit: emp.unit,
              rank: emp.rank || '',
              selected: false
            }));
          } else {
            throw new Error(response.data.message || 'Failed to fetch employees');
          }
        } catch (error) {
          console.error('Failed to fetch employees:', error);
          this.error = error.message || 'Failed to fetch employees';
          throw error;
        } finally {
          this.loading = false;
        }
      },

      async fetchUnassignedEmployees() {
        return this._fetchEmployees({ show_all: false, unassigned_only: true });
      },

      async _fetchEmployees(params) {
        this.loading = true;
        this.error = null;
        this.searchedEmployees = [];

        try {
          const token = localStorage.getItem('token');
          const response = await api.get('/employees-by-office', {
            headers: { Authorization: `Bearer ${token}` },
            params
          });

          if (response.data.success) {
            const employees = response.data.data.map(emp => ({
              id: emp.id || null,
              name: emp.name,
              position: emp.position,
              office: emp.office,
              selected: false
            }));

            if (params.unassigned_only) {
              this.unassignedEmployees = employees;
            } else {
              this.employees = employees;
            }

            this.userOffice = response.data.user_office;
            return employees;
          }
          throw new Error(response.data.message || 'Failed to fetch employees');
        } catch (error) {
          console.error('Failed to fetch employees:', error);
          this.error = error.message || 'Failed to fetch employees';
          throw error;
        } finally {
          this.loading = false;
        }
      },



      // In your employeeStore.js
  async addEmployees(payload) {
    this.loading = true;
    this.error = null;

    try {
      const token = localStorage.getItem('token');

      // First, fetch all positions to validate
      const positionsResponse = await api.get('/position', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const positions = positionsResponse.data;

      // Validate position_id for each employee
      const validatedEmployees = payload.employees.map(emp => {
        const position = positions.find(p => p.name === emp.position);
        if (!position) {
          throw new Error(`Position "${emp.position}" not found`);
        }
        return {
          ...emp,
          position_id: position.id // Ensure we're using the correct position_id
        };
      });

      const response = await api.post(
        '/add/employee',
        { employees: validatedEmployees },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (this.currentNode) {
          await this.fetchEmployeesByNode(this.currentNode);
        } else {
          await this.fetchUnassignedEmployees();
        }
        await this.fetchEmployeeCounts(this.currentOfficeId || useUserStore().user?.office_id);
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to add employees');
    } catch (error) {
      console.error('Failed to add employees:', error);
      this.error = error.message || 'Failed to add employees';
      throw error;
    } finally {
      this.loading = false;
    }
  },

      async searchEmployees(searchTerm) {
        this.loading = true;
        try {
          const token = localStorage.getItem('token');
          const response = await api.get('/search-employees', {
            headers: { Authorization: `Bearer ${token}` },
            params: { search: searchTerm, unassigned_only: true }
          });

          if (response.data.success) {
            this.searchedEmployees = response.data.data.map(emp => ({
              ...emp,
              selected: false
            }));
            return this.searchedEmployees;
          }
          throw new Error(response.data.message || 'Search failed');
        } catch (error) {
          console.error('Search failed:', error);
          this.error = error.message || 'Search failed';
          throw error;
        } finally {
          this.loading = false;
        }
      }
    }
  });
