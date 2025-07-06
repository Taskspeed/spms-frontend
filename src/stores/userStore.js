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
  async function loadUserData() {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('No token found')
      return
    }

    try {
      const response = await api.get('/user_data', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = response.data

      user.value = data.user
      officeId.value = data.user.office_id

      // Flatten all MFOs across categories
      let allMfos = []
      let allOutputs = []
      let allCategories = []

      for (const cat of data.categories) {
        // Attach category info to each MFO for easier filtering later
        if (cat.mfos && cat.mfos.length) {
          for (const mfo of cat.mfos) {
            allMfos.push({
              ...mfo,
              f_category_id: cat.id,
              category: { id: cat.id, name: cat.name },
            })
            // Each output gets its category, mfo_id, etc.
            if (Array.isArray(mfo.outpots)) {
              for (const output of mfo.outpots) {
                allOutputs.push({
                  ...output,
                  mfo_id: mfo.id,
                  f_category_id: cat.id,
                })
              }
            }
          }
        }
        // Category outputs are outputs not attached to any MFO
        if (cat.category_outputs && cat.category_outputs.length) {
          for (const output of cat.category_outputs) {
            allOutputs.push({
              ...output,
              mfo_id: null,
              f_category_id: cat.id,
            })
          }
        }

        allCategories.push({ id: cat.id, name: cat.name })
      }

      mfos.value = allMfos
      categories.value = allCategories
      outputs.value = allOutputs

      // Optionally: console.log({mfos: allMfos, outputs: allOutputs, categories: allCategories})

    } catch (error) {
      console.error('Failed to load user data:', error)
      throw error
    }
  }


  async function updateUserCredentials(updatedData) {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await api.post(`/user/update/credentials/{id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error('Failed to update user credentials:', error)
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
  }
})
