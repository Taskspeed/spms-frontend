import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useOpcrStore = defineStore('opcr', {
  state: () => ({
    divisions: [],
    officeHeadFunctions: null,
    loading: false,
    error: null,
    showGenerateModal: false,
    codeMappings: {
      core: {
        'Delivering Service Excellence': 'DSE',
        'Exemplifying Integrity': 'EI',
        'Interpersonal Skills': 'IS',
      },
      technical: {
        'Planning and Organizing': 'P&O',
        'Monitoring and Evaluation': 'M&E',
        'Records Management': 'RM',
        'Partnering and Networking': 'P&N',
        'Process Management': 'PM',
        'Attention to Detail': 'AD',
      },
      leadership: {
        'Thinking Strategically and Creatively': 'TSC',
        'Problem Solving and Decision Making': 'PSDM',
        'Building Collaborative & Inclusive Working Relationships': 'BCIWR',
        'Managing Performance & Coaching for Results': 'MPCR',
      },
    },
  }),

  actions: {
    async fetchDivisions() {
      this.loading = true
      try {
        const response = await api.get('/opcr/divisions')
        this.divisions = response.data
        this.error = null
      } catch (err) {
        this.error = 'Failed to fetch divisions'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async fetchOfficeHeadFunctions(officeId) {
      this.loading = true
      try {
        const response = await api.get(`/opcr/office-head-functions/${officeId}`)
        this.officeHeadFunctions = response.data
        this.error = null
        return response.data
      } catch (err) {
        this.error = 'Failed to fetch office head functions'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // async saveOpcr(formData) {
    //   this.loading = true;
    //   try {
    //     const userStore = useUserStore();
    //     const officeId = userStore.user.office_id;

    //     const payload = {
    //       office_id: officeId,
    //       ...formData
    //     };

    //     const response = await api.post('/opcr/save', payload);
    //     return response.data;
    //   } catch (err) {
    //     this.error = 'Failed to save OPCR';
    //     console.error(err);
    //     throw err;
    //   } finally {
    //     this.loading = false;
    //   }
    // }

    async saveOpcr(formData) {
      this.loading = true
      try {
        const response = await api.post('/opcr/save', formData)
        return response.data
      } catch (err) {
        this.error = 'Failed to save OPCR'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOpcr(id) {
      this.loading = true
      try {
        const response = await api.get(`/opcr/${id}`)
        return response.data
      } catch (err) {
        this.error = 'Failed to fetch OPCR'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateOpcr({ id, formData }) {
      this.loading = true
      try {
        const response = await api.put(`/opcr/${id}`, formData)
        return response.data
      } catch (err) {
        this.error = 'Failed to update OPCR'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOfficeOpcrs(officeId) {
      this.loading = true
      try {
        const response = await api.get(`/opcr/view/${officeId}`)
        return response.data
      } catch (err) {
        this.error = 'Failed to fetch office OPCRs'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
