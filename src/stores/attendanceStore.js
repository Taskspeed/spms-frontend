// stores/attendanceStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'

export const useAttendanceStore = defineStore('attendance', () => {
  const saving = ref(false)
  const error = ref('')

  const saveAttendance = async (payload) => {
    saving.value = true
    error.value = ''

    try {
      const response = await api.post('/ipcr/attendance', payload)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to save attendance'
      throw err
    } finally {
      saving.value = false
    }
  }

  return {
    saving,
    error,
    saveAttendance,
  }
})
