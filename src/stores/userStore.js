import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'

export const useUserStore = defineStore('user', () => {
  // --- State ---
  const user = ref(null)
  const mfos = ref([])
  const categories = ref([])
  const officeId = ref(null)
  // Add support for outputs if needed
  const outputs = ref([])

  // --- Getters (computed) ---
  const role = computed(() => {
    if (!user.value) return null
    const roleMap = {
      3: 'hr-admin',
      1: 'office-admin',
      2: 'planning-admin',
    }
    return roleMap[user.value.role_id] || null
  })

  const officeName = computed(() => user.value?.office?.name || 'Unknown Office')

  const groupedMfos = computed(() => {
    const grouped = {}
    mfos.value.forEach((mfo) => {
      const categoryName = mfo.category?.name || 'Uncategorized'
      if (!grouped[categoryName]) {
        grouped[categoryName] = []
      }
      grouped[categoryName].push(mfo)
    })
    return grouped
  })

  // Helper function to handle unauthenticated errors
  function handleUnauthenticated(router) {
    clearUser()
    if (router) {
      router.push('/login')
    }
  }
  async function loadUserData(router = null) {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('No token found')
      if (router) {
        router.push('/login')
      }
      return
    }

    try {
      const response = await api.get('/user_data', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = response.data

      // Check for unauthenticated message
      if (data.message === 'Unauthenticated.') {
        console.log('User is unauthenticated, redirecting to login')
        handleUnauthenticated(router)
        return
      }

      user.value = data.user
      officeId.value = data.user.office_id

      // Flatten all MFOs across categories
      let allMfos = []
      let allOutputs = []
      let allCategories = []

      // Extract categories from mfos
      const categoryMap = new Map()

      for (const mfo of data.mfos) {
        const category = mfo.category
        if (category) {
          // Ensure each category is only added once
          if (!categoryMap.has(category.id)) {
            categoryMap.set(category.id, { id: category.id, name: category.name })
          }

          allMfos.push({
            ...mfo,
            f_category_id: category.id,
            category: { id: category.id, name: category.name },
          })

          // Each output gets its category, mfo_id, etc.
          if (Array.isArray(mfo.outpots)) {
            for (const output of mfo.outpots) {
              allOutputs.push({
                ...output,
                mfo_id: mfo.id,
                f_category_id: category.id,
              })
            }
          }
        }
      }

      // Add all categories to the list (unique ones only)
      allCategories = Array.from(categoryMap.values())

      // Populate the store
      mfos.value = allMfos
      categories.value = allCategories
      outputs.value = allOutputs
    } catch (error) {
      console.error('Failed to load user data:', error)

      // Check if the error response contains the unauthenticated message
      if (error.response?.data?.message === 'Unauthenticated.' || error.response?.status === 401) {
        console.log('Authentication error, redirecting to login')
        handleUnauthenticated(router)
        return
      }

      throw error
    }
  }

  async function updateUserCredentials(updatedData, router = null) {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await api.post(`/user/update/credentials/{id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Check for unauthenticated message
      if (response.data.message === 'Unauthenticated.') {
        handleUnauthenticated(router)
        return
      }

      return response.data
    } catch (error) {
      console.error('Failed to update user credentials:', error)

      // Check if the error response contains the unauthenticated message
      if (error.response?.data?.message === 'Unauthenticated.' || error.response?.status === 401) {
        handleUnauthenticated(router)
        return
      }

      throw error
    }
  }

  async function logout(router) {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await api.post('/user_logout', {}, { headers: { Authorization: `Bearer ${token}` } })
      clearUser()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      clearUser()
      router.push('/login')
    }
  }

  function setUser(newUser) {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  function clearUser() {
    user.value = null
    mfos.value = []
    categories.value = []
    outputs.value = []
    officeId.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // Return state, getters, actions for the store
  return {
    user,
    mfos,
    categories,
    outputs,
    officeId,
    role,
    officeName,
    groupedMfos,
    loadUserData,
    updateUserCredentials,
    logout,
    setUser,
    clearUser,
    handleUnauthenticated,
  }
})
