// src/stores/office/monitorStatusStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'

export const useMonitorStatusStore = defineStore('monitorStatus', () => {
  const loading = ref(false)
  const error = ref('')

  const storeStatus = async (payload) => {
    loading.value = true
    error.value = ''

    try {
      const response = await api.post('/hr/unit-work-plan/update-status', payload)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update status'
      throw err
    } finally {
      loading.value = false
    }
  }

  const ipcrApproveStatus = async (payload) => {
    loading.value = true
    error.value = ''

    try {
      // Make sure payload contains targetperiodId
      const response = await api.put(`/ipcr/update-status/${payload.targetperiodId}`, payload)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update status'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { loading, error, storeStatus, ipcrApproveStatus }
})
