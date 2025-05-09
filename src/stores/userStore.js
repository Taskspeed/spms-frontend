//UserStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    mfos: [],
    categories: [],
    officeId: null,

  }),

  getters: {
    role: (state) => {
      if (!state.user) return null
      const roleMap = {
        3: 'hr-admin',
        1: 'office-admin',
        2: 'planning-admin',
      }
      return roleMap[state.user.role_id] || null
    },
    officeName: (state) => state.user?.office?.name || 'Unknown Office',
    
    groupedMfos: (state) => {
      const grouped = {}
      state.mfos.forEach((mfo) => {
        const categoryName = mfo.category?.name || 'Uncategorized'
        if (!grouped[categoryName]) {
          grouped[categoryName] = []
        }
        grouped[categoryName].push(mfo)
      })
      return grouped
    },
  },

  actions: {
    async loadUserData() {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const response = await api.get('/user_data', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.user = response.data.user
        this.mfos = response.data.mfos
        this.categories = [
          ...new Map(this.mfos.map((mfo) => [mfo.category?.id, mfo.category])).values(),
        ]
        this.officeId = response.data.user.office_id // Add this line

      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    },

    async updateUserCredentials(updatedData) {
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
    },
    async logout(router) {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        await api.post('/user_logout', {}, { headers: { Authorization: `Bearer ${token}` } })
        this.clearUser()
        router.push('/login')
      } catch (error) {
        console.error('Logout failed:', error)
        this.clearUser()
        router.push('/login')
      }
    },

    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },

    clearUser() {
      this.user = null
      this.mfos = []
      this.categories = []
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
  },
})
