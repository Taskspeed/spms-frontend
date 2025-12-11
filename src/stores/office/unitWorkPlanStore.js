import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useUnitWorkPlanStore = defineStore('unitWorkPlan', {
  state: () => ({
    uwpData: null,
    formData: null,
    employeeData: [],
    loading: false,
    error: null,
    savedUWPs: [],
    officeLibraryIndicatorStore: null,
  }),

  getters: {
    getCurrentSemester: () => {
      const month = new Date().getMonth() + 1
      return month >= 1 && month <= 6 ? 'January-June' : 'July-December'
    },

    getCurrentYear: () => {
      return new Date().getFullYear()
    },

    getSemesterOptions(state) {
      const current = state.getCurrentSemester
      return [current, current === 'January-June' ? 'July-December' : 'January-June']
    },

    getYearOptions(state) {
      const currentYear = state.getCurrentYear
      return [currentYear, currentYear + 1]
    },
  },

  actions: {
    // Initialize UWP data from session storage
    initializeUWPData() {
      try {
        const stored = sessionStorage.getItem('uwpData')
        if (stored) {
          this.uwpData = JSON.parse(stored)
          console.log('✅ UWP Data loaded from sessionStorage:', this.uwpData)
          return this.uwpData
        }
      } catch (error) {
        console.error('❌ Failed to load UWP data:', error)
        this.error = error.message
      }
      return null
    },

    // Set UWP data
    setUWPData(data) {
      this.uwpData = data
      sessionStorage.setItem('uwpData', JSON.stringify(data))
      console.log('✅ UWP Data saved to sessionStorage')
    },

    // Set form data
    setFormData(data) {
      this.formData = {
        semester: data.semester,
        year: data.year,
      }
      console.log('✅ Form data set:', this.formData)
    },

    // Set employee data
    setEmployeeData(employees) {
      this.employeeData = employees
      console.log('✅ Employee data set:', this.employeeData.length, 'employees')
    },

    // Build payload
    buildPayload(submissionData) {
      return {
        uwpData: this.uwpData,
        formData: this.formData,
        employeeData: this.employeeData,
        submissionData: submissionData,
        timestamp: new Date().toISOString(),
      }
    },

    async saveUWP(submissionData, officeLibraryIndicatorStore) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        // ✅ STORE THE REFERENCE
        this.officeLibraryIndicatorStore = officeLibraryIndicatorStore

        const payload = this.transformPayload(submissionData)

        console.log('📤 Saving UWP with payload:', payload)

        const response = await api.post('/unit_work_plan/store', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          console.log('✅ UWP saved successfully:', response.data)

          this.savedUWPs.push({
            id: response.data.data?.id,
            semester: this.formData.semester,
            year: this.formData.year,
            savedAt: new Date().toISOString(),
          })

          sessionStorage.removeItem('uwpData')
          this.uwpData = null

          return response.data
        }

        throw new Error(response.data.message || 'Failed to save UWP')
      } catch (error) {
        console.error('❌ Error saving UWP:', error)
        this.error = error.message || 'Failed to save UWP'
        throw error
      } finally {
        this.loading = false
      }
    },

    transformPayload(submissionData) {
      return {
        employees: submissionData.employees.map((emp) => {
          const officeData = submissionData.uwpData.hierarchy.office || {}
          const office2Data = submissionData.uwpData.hierarchy.office2 || {}
          const groupData = submissionData.uwpData.hierarchy.group || {}
          const divisionData = submissionData.uwpData.hierarchy.division || {}
          const sectionData = submissionData.uwpData.hierarchy.section || {}
          const unitData = submissionData.uwpData.hierarchy.unit || {}

          // ✅ FIX: Get control_no from availableEmployees
          const availableEmployee = submissionData.uwpData.availableEmployees.find(
            (availEmp) => availEmp.id === emp.employeeId,
          )
          const controlNo = availableEmployee?.ControlNo || availableEmployee?.control_no || ''

          return {
            control_no: controlNo,
            semester: submissionData.form.semester || '',
            year: submissionData.form.year || new Date().getFullYear(),
            office: officeData.label || officeData.name || '',
            office2: office2Data.label || office2Data.name || null,
            group: groupData.label || groupData.name || null,
            division: divisionData.label || divisionData.name || null,
            section: sectionData.label || sectionData.name || null,
            unit: unitData.label || unitData.name || null,
            performance_standards: (emp.performanceStandards || []).map((standard) => {
              // ✅ Get performance_indicator correctly
              let performanceIndicator = ''

              if (standard.indicatorName) {
                if (typeof standard.indicatorName === 'number' || !isNaN(standard.indicatorName)) {
                  // It's an ID - find from the indicator store
                  if (this.officeLibraryIndicatorStore && this.officeLibraryIndicatorStore.verbs) {
                    const foundVerb = this.officeLibraryIndicatorStore.verbs.find(
                      (v) => v.id === standard.indicatorName,
                    )
                    performanceIndicator = foundVerb?.indicator_name || foundVerb?.name || ''
                  }
                } else {
                  // Already a string
                  performanceIndicator = standard.indicatorName.toString().trim()
                }
              }

              return {
                category: standard.categoryName || '',
                mfo: standard.mfoName || '',
                output: standard.outputName || '',
                core_competency: standard.coreCompetencies || [],
                technical_competency: standard.technicalCompetencies || [],
                leadership_competency: standard.leadershipCompetencies || [],
                success_indicator: standard.successIndicator || '',
                performance_indicator: performanceIndicator || '',
                required_output: standard.requiredOutput || '',
                ratings: (standard.standardOutcomeRows || [])
                  .map((row) => ({
                    rating: parseInt(row.rating) || 0,
                    quantity: row.quantity || '',
                    effectiveness: row.effectiveness || '',
                    timeliness: row.timeliness || row.timelinessRange || '',
                  }))
                  .filter((rating) => rating.rating > 0),
              }
            }),
          }
        }),
      }
    },

    // Fetch saved UWPs
    async fetchSavedUWPs() {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        const response = await api.get('/unit_work_plan', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          this.savedUWPs = response.data.data || []
          console.log('✅ Fetched saved UWPs:', this.savedUWPs)
          return this.savedUWPs
        }

        throw new Error(response.data.message || 'Failed to fetch UWPs')
      } catch (error) {
        console.error('❌ Error fetching UWPs:', error)
        this.error = error.message || 'Failed to fetch UWPs'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Get UWP by ID
    async getUWPById(id) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        const response = await api.get(`/unit_work_plan/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          console.log('✅ Fetched UWP:', response.data.data)
          return response.data.data
        }

        throw new Error(response.data.message || 'Failed to fetch UWP')
      } catch (error) {
        console.error('❌ Error fetching UWP:', error)
        this.error = error.message || 'Failed to fetch UWP'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update UWP
    async updateUWP(id, submissionData) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        const payload = this.buildPayload(submissionData)

        const response = await api.put(`/unit_work_plan/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          console.log('✅ UWP updated successfully:', response.data)
          return response.data
        }

        throw new Error(response.data.message || 'Failed to update UWP')
      } catch (error) {
        console.error('❌ Error updating UWP:', error)
        this.error = error.message || 'Failed to update UWP'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Delete UWP
    async deleteUWP(id) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        const response = await api.delete(`/unit_work_plan/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          console.log('✅ UWP deleted successfully')

          // Remove from saved list
          this.savedUWPs = this.savedUWPs.filter((uwp) => uwp.id !== id)

          return response.data
        }

        throw new Error(response.data.message || 'Failed to delete UWP')
      } catch (error) {
        console.error('❌ Error deleting UWP:', error)
        this.error = error.message || 'Failed to delete UWP'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Clear all data
    clearAllData() {
      this.uwpData = null
      this.formData = null
      this.employeeData = []
      this.error = null
      sessionStorage.removeItem('uwpData')
      console.log('✅ All UWP data cleared')
    },
  },
})
