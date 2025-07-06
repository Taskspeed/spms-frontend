import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import Swal from 'sweetalert2'

export const useMfoStore = defineStore('mfoStore', () => {
  // State
  const loading = ref(false)
  const error = ref(null)

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return { Authorization: `Bearer ${token}` }
  }

  // Helper function to handle API errors
  const handleError = (error, action) => {
    console.error(`Error ${action}:`, error)
    const message = error.response?.data?.message || `Failed to ${action}`

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#00703c'
    })

    throw error
  }

  // Add MFO function (without confirmation - handled in component)
  const addMfo = async (mfoData) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/add_mfo', mfoData, {
        headers: getAuthHeaders()
      })

      return response.data
    } catch (error) {
      handleError(error, 'add MFO')
    } finally {
      loading.value = false
    }
  }

  // Update MFO function (without confirmation - handled in component)
  const updateMfo = async (mfoId, mfoData) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/mfos/${mfoId}`, mfoData, {
        headers: getAuthHeaders()
      })

      return response.data
    } catch (error) {
      handleError(error, 'update MFO')
    } finally {
      loading.value = false
    }
  }

  // Delete MFO function (with confirmation - called directly from component)
  const deleteMfo = async (mfoId, mfoName) => {
    try {
      loading.value = true
      error.value = null

      // Show confirmation dialog with warning
      const result = await Swal.fire({
        title: 'Delete MFO',
        html: `
          <p>Are you sure you want to delete <strong>"${mfoName}"</strong>?</p>
          <p class="text-red-600"><small>This action cannot be undone and will also delete all associated outputs.</small></p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        focusCancel: true
      })

      if (!result.isConfirmed) {
        return null
      }

      const response = await api.delete(`/mfos/${mfoId}`, {
        headers: getAuthHeaders()
      })

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'MFO has been deleted successfully.',
        confirmButtonColor: '#00703c',
        timer: 2000,
        timerProgressBar: true
      })

      return response.data
    } catch (error) {
      handleError(error, 'delete MFO')
    } finally {
      loading.value = false
    }
  }

  // Add Output function (without confirmation - handled in component)
  const addOutput = async (outputData) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/add_output', outputData, {
        headers: getAuthHeaders()
      })

      return response.data
    } catch (error) {
      handleError(error, 'add output')
    } finally {
      loading.value = false
    }
  }

  // Update Output function (without confirmation - handled in component)
  const updateOutput = async (outputId, outputData) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/outputs/${outputId}`, outputData, {
        headers: getAuthHeaders()
      })

      return response.data
    } catch (error) {
      handleError(error, 'update output')
    } finally {
      loading.value = false
    }
  }

  // Delete Output function (with confirmation - called directly from component)
  const deleteOutput = async (outputId, outputName) => {
    try {
      loading.value = true
      error.value = null

      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Delete Output',
        html: `
          <p>Are you sure you want to delete <strong>"${outputName}"</strong>?</p>
          <p class="text-red-600"><small>This action cannot be undone.</small></p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        focusCancel: true
      })

      if (!result.isConfirmed) {
        return null
      }

      const response = await api.delete(`/outputs/${outputId}`, {
        headers: getAuthHeaders()
      })

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Output has been deleted successfully.',
        confirmButtonColor: '#00703c',
        timer: 2000,
        timerProgressBar: true
      })

      return response.data
    } catch (error) {
      handleError(error, 'delete output')
    } finally {
      loading.value = false
    }
  }

  // Batch add function for multiple items (without confirmation - handled in component)
  const addMultipleItems = async (items, isOutput = false, parentMfoId = null) => {
    try {
      loading.value = true
      error.value = null

      const promises = items.map(item => {
        const data = {
          ...item,
          office_id: item.office_id,
          f_category_id: item.f_category_id
        }

        if (isOutput && parentMfoId) {
          data.mfo_id = parentMfoId
        }

        const endpoint = isOutput ? '/add_output' : '/add_mfo'
        return api.post(endpoint, data, {
          headers: getAuthHeaders()
        })
      })

      const responses = await Promise.all(promises)

      return responses.map(response => response.data)
    } catch (error) {
      handleError(error, `add multiple ${isOutput ? 'outputs' : 'MFOs'}`)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    loading,
    error,

    // Actions
    addMfo,
    updateMfo,
    deleteMfo,
    addOutput,
    updateOutput,
    deleteOutput,
    addMultipleItems
  }
})
