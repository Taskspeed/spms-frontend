import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useLibraryStore = defineStore('library', {
  state: () => ({
    verbs: [],
    ranks: [],
    targetPeriods: [],
    loading: false,
    error: null,
  }),

  getters: {
    // Get verbs sorted alphabetically
    sortedVerbs: (state) => {
      return [...state.verbs].sort((a, b) =>
        (a.indicator_name || '')
          .toLowerCase()
          .localeCompare((b.indicator_name || '').toLowerCase()),
      )
    },

    // Get ranks sorted alphabetically
    sortedRanks: (state) => {
      return [...state.ranks].sort((a, b) =>
        (a.rank_name || '').toLowerCase().localeCompare((b.rank_name || '').toLowerCase()),
      )
    },

    // Get target periods sorted by year and semester
    sortedTargetPeriods: (state) => {
      return [...state.targetPeriods].sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year // Descending year
        }
        // Semester order: July-December comes after January-June
        const semesterOrder = { 'January-June': 0, 'July-December': 1 }
        return (semesterOrder[a.semester] || 0) - (semesterOrder[b.semester] || 0)
      })
    },

    // Check if a verb already exists
    verbExists: (state) => (verbName) => {
      return state.verbs.some(
        (v) => (v.indicator_name || '').toLowerCase().trim() === verbName.toLowerCase().trim(),
      )
    },

    // Check if a rank already exists
    rankExists: (state) => (rankName) => {
      return state.ranks.some(
        (r) => (r.rank_name || '').toLowerCase().trim() === rankName.toLowerCase().trim(),
      )
    },

    // Check if a target period already exists
    targetPeriodExists: (state) => (semester, year) => {
      return state.targetPeriods.some(
        (tp) => tp.semester === semester && tp.year.toString() === year.toString(),
      )
    },
  },

  actions: {
    /**
     * Fetch all verbs (indicators)
     */
    async fetchVerbs() {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.get('/hr/indicator', {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Handle both array and object responses
        if (Array.isArray(response.data)) {
          this.verbs = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          this.verbs = response.data.data
        } else if (response.data.success && Array.isArray(response.data.indicators)) {
          this.verbs = response.data.indicators
        } else {
          this.verbs = []
        }

        return this.verbs
      } catch (error) {
        console.error('Failed to fetch verbs:', error)
        this.error = error.response?.data?.message || 'Failed to load verbs'
        this.verbs = []
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Add a new verb
     */
    async addVerb(verbName) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.post(
          '/hr/indicator/store',
          { indicator_name: verbName.trim() },
          { headers: { Authorization: `Bearer ${token}` } },
        )

        // Extract the new verb from response
        let newVerb = null
        if (response.data.data) {
          newVerb = response.data.data
        } else if (response.data.indicator) {
          newVerb = response.data.indicator
        } else if (response.data.id) {
          newVerb = response.data
        }

        // Add to local state
        if (newVerb) {
          this.verbs.push(newVerb)
        } else {
          // Fallback:  create a temporary entry and refresh
          await this.fetchVerbs()
        }

        return newVerb
      } catch (error) {
        console.error('Failed to add verb:', error)
        this.error = error.response?.data?.message || 'Failed to add verb'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update a verb
     */
    async updateVerb(verbId, verbName) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.put(
          `/indicator/update/${verbId}`,
          { indicator_name: verbName.trim() },
          { headers: { Authorization: `Bearer ${token}` } },
        )

        // Update local state
        const index = this.verbs.findIndex((v) => v.id === verbId)
        if (index !== -1) {
          this.verbs[index] = {
            ...this.verbs[index],
            indicator_name: verbName.trim(),
          }
        }

        return response.data
      } catch (error) {
        console.error('Failed to update verb:', error)
        this.error = error.response?.data?.message || 'Failed to update verb'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete verb(s)
     */
    async deleteVerbs(verbIds) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const ids = Array.isArray(verbIds) ? verbIds : [verbIds]

        // Delete each verb
        await Promise.all(
          ids.map((id) =>
            api.delete(`/hr/indicator/delete/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ),
        )

        // Remove from local state
        const idSet = new Set(ids)
        this.verbs = this.verbs.filter((v) => !idSet.has(v.id))

        return true
      } catch (error) {
        console.error('Failed to delete verbs:', error)
        this.error = error.response?.data?.message || 'Failed to delete verbs'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch all ranks
     */
    async fetchRanks() {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.get('/hr/rank', {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Handle both array and object responses
        if (Array.isArray(response.data)) {
          this.ranks = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          this.ranks = response.data.data
        } else if (response.data.success && Array.isArray(response.data.ranks)) {
          this.ranks = response.data.ranks
        } else {
          this.ranks = []
        }

        return this.ranks
      } catch (error) {
        console.error('Failed to fetch ranks:', error)
        this.error = error.response?.data?.message || 'Failed to load ranks'
        this.ranks = []
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Add a new rank
     */
    async addRank(rankName) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const payload = {
          rank_name: rankName.trim(),
        }

        const response = await api.post('/hr/rank/store', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Extract the new rank from response
        let newRank = null
        if (response.data.data) {
          newRank = response.data.data
        } else if (response.data.rank) {
          newRank = response.data.rank
        } else if (response.data.id) {
          newRank = response.data
        }

        // Add to local state
        if (newRank) {
          this.ranks.push(newRank)
        } else {
          // Fallback: refresh from server
          await this.fetchRanks()
        }

        return newRank
      } catch (error) {
        console.error('Failed to add rank:', error)
        this.error = error.response?.data?.message || 'Failed to add rank'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update a rank
     */
    async updateRank(rankId, rankName) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const payload = {
          rank_name: rankName.trim(),
        }

        const response = await api.put(`/hr/rank/update/${rankId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Update local state
        const index = this.ranks.findIndex((r) => r.id === rankId)
        if (index !== -1) {
          this.ranks[index] = {
            ...this.ranks[index],
            rank_name: rankName.trim(),
          }
        }

        return response.data
      } catch (error) {
        console.error('Failed to update rank:', error)
        this.error = error.response?.data?.message || 'Failed to update rank'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete rank(s)
     */
    async deleteRanks(rankIds) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const ids = Array.isArray(rankIds) ? rankIds : [rankIds]

        // Delete each rank
        await Promise.all(
          ids.map((id) =>
            api.delete(`/hr/rank/delete/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ),
        )

        // Remove from local state
        const idSet = new Set(ids)
        this.ranks = this.ranks.filter((r) => !idSet.has(r.id))

        return true
      } catch (error) {
        console.error('Failed to delete ranks:', error)
        this.error = error.response?.data?.message || 'Failed to delete ranks'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch all target periods
     */
    async fetchTargetPeriods() {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.get('/targetPeriod', {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Handle both array and object responses
        if (Array.isArray(response.data)) {
          this.targetPeriods = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          this.targetPeriods = response.data.data
        } else if (response.data.success && Array.isArray(response.data.targetPeriods)) {
          this.targetPeriods = response.data.targetPeriods
        } else {
          this.targetPeriods = []
        }

        return this.targetPeriods
      } catch (error) {
        console.error('Failed to fetch target periods:', error)
        this.error = error.response?.data?.message || 'Failed to load target periods'
        this.targetPeriods = []
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Add a new target period
     */
    async addTargetPeriod(semester, year) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const payload = {
          semester: semester.trim(),
          year: parseInt(year),
        }

        const response = await api.post('/targetPeriod/store', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Extract the new target period from response
        let newTargetPeriod = null
        if (response.data.data) {
          newTargetPeriod = response.data.data
        } else if (response.data.targetPeriod) {
          newTargetPeriod = response.data.targetPeriod
        } else if (response.data.id) {
          newTargetPeriod = response.data
        }

        // Add to local state
        if (newTargetPeriod) {
          this.targetPeriods.push(newTargetPeriod)
        } else {
          // Fallback: refresh from server
          await this.fetchTargetPeriods()
        }

        return newTargetPeriod
      } catch (error) {
        console.error('Failed to add target period:', error)
        this.error = error.response?.data?.message || 'Failed to add target period'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete target period(s)
     */
    async deleteTargetPeriods(targetPeriodIds) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const ids = Array.isArray(targetPeriodIds) ? targetPeriodIds : [targetPeriodIds]

        // Delete each target period
        await Promise.all(
          ids.map((id) =>
            api.delete(`/targetPeriod/delete/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ),
        )

        // Remove from local state
        const idSet = new Set(ids)
        this.targetPeriods = this.targetPeriods.filter((tp) => !idSet.has(tp.id))

        return true
      } catch (error) {
        console.error('Failed to delete target periods:', error)
        this.error = error.response?.data?.message || 'Failed to delete target periods'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Clear all state
     */
    clearState() {
      this.verbs = []
      this.ranks = []
      this.targetPeriods = []
      this.error = null
    },
  },
})
