import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'

export const useUserStore = defineStore('user', () => {
  // --- State ---
  const user = ref(null)
  const mfos = ref([])
  const categories = ref([])
  const officeId = ref(null)
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

  // FIX: Changed from office?. name to office?. Office
  const officeName = computed(() => user.value?.office?.Office || 'Unknown Office')

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

  // --- Actions ---
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
      const response = await api.get('/user', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = response.data

      // Debug:  inspect the raw response to understand shape when something goes wrong
      // console.debug('user_data response:', data)

      // Unauthenticated handling (API may return this sentinel)
      if (data?.message === 'Unauthenticated.' || data?.data?.message === 'Unauthenticated.') {
        console.log('User is unauthenticated, redirecting to login')
        handleUnauthenticated(router)
        return
      }

      // Support both top-level and nested `data` shapes
      const payloadUser = data?.user ?? data?.data?.user ?? null
      const payloadMfos = Array.isArray(data?.mfos)
        ? data.mfos
        : Array.isArray(data?.data?.mfos)
          ? data.data.mfos
          : []

      user.value = payloadUser
      officeId.value = payloadUser?.office_id ?? null

      // Normalize and flatten MFOs, outputs and categories
      const allMfos = []
      const allOutputs = []
      const categoryMap = new Map()

      if (Array.isArray(payloadMfos)) {
        for (const mfo of payloadMfos) {
          if (!mfo || typeof mfo !== 'object') continue

          // Category may be missing or null
          const category = mfo.category ?? null
          const categoryId = category?.id ?? null
          const categoryName = category?.name ?? null

          if (categoryId != null && !categoryMap.has(categoryId)) {
            categoryMap.set(categoryId, { id: categoryId, name: categoryName })
          }

          allMfos.push({
            ...mfo,
            f_category_id: categoryId,
            category: categoryId != null ? { id: categoryId, name: categoryName } : null,
          })

          // Accept both correct 'outputs' and common typo 'outpots'
          const outputsArr = Array.isArray(mfo.outputs)
            ? mfo.outputs
            : Array.isArray(mfo.outpots)
              ? mfo.outpots
              : []

          if (Array.isArray(outputsArr)) {
            for (const output of outputsArr) {
              if (!output || typeof output !== 'object') continue
              allOutputs.push({
                ...output,
                mfo_id: mfo.id ?? null,
                f_category_id: categoryId,
              })
            }
          }
        }
      }

      const allCategories = Array.from(categoryMap.values())

      // Populate the store
      mfos.value = allMfos
      categories.value = allCategories
      outputs.value = allOutputs
    } catch (error) {
      console.error('Failed to load user data:', error)

      // If unauthorized, redirect to login
      if (error.response?.data?.message === 'Unauthenticated.' || error.response?.status === 401) {
        console.log('Authentication error, redirecting to login')
        handleUnauthenticated(router)
        return
      }

      throw error
    }
  }

  /**
   * Update user credentials.
   * If updatedData contains an `id` property, it will be used in the URL:
   *   POST /user/update/credentials/: id
   * Otherwise it will post to /user/update/credentials
   */
  async function updateUserCredentials(updatedData = {}, router = null) {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const idSegment = updatedData?.id ? `/${updatedData.id}` : ''
      const response = await api.post(`/user/update/credentials${idSegment}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (
        response.data?.message === 'Unauthenticated.' ||
        response.data?.data?.message === 'Unauthenticated.'
      ) {
        handleUnauthenticated(router)
        return
      }

      return response.data
    } catch (error) {
      console.error('Failed to update user credentials:', error)
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
      await api.post('/user/logout', {}, { headers: { Authorization: `Bearer ${token}` } })
    } catch (error) {
      console.error('Logout failed (continuing to clear local state):', error)
    } finally {
      clearUser()
      if (router) router.push('/login')
    }
  }

  function setUser(newUser) {
    user.value = newUser
    try {
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch {
      // ignore storage errors
    }
  }

  function clearUser() {
    user.value = null
    mfos.value = []
    categories.value = []
    outputs.value = []
    officeId.value = null
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } catch {
      // ignore storage errors
    }
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
