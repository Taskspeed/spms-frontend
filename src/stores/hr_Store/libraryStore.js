import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useLibraryStore = defineStore('library', {
  state: () => ({
    verbs: [],
    ranks: [],
    targetPeriods: [],
    categories: [],
    loading: false,
    error: null,
  }),

  getters: {
    sortedVerbs: (state) => {
      return [...state.verbs].sort((a, b) =>
        (a.indicator_name || '')
          .toLowerCase()
          .localeCompare((b.indicator_name || '').toLowerCase()),
      )
    },

    sortedRanks: (state) => {
      return [...state.ranks].sort((a, b) =>
        (a.rank_name || '').toLowerCase().localeCompare((b.rank_name || '').toLowerCase()),
      )
    },

    sortedTargetPeriods: (state) => {
      return [...state.targetPeriods].sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year
        }
        const semesterOrder = { 'January-June': 0, 'July-December': 1 }
        return (semesterOrder[a.semester] || 0) - (semesterOrder[b.semester] || 0)
      })
    },

    // Get category by ID
    getCategoryById: (state) => (id) => {
      return state.categories.find((cat) => cat.id === id)
    },
  },

  actions: {
    // ==================== CATEGORIES ====================
    async fetchCategories() {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.get('/hr/category', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (Array.isArray(response.data)) {
          this.categories = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          this.categories = response.data.data
        } else {
          this.categories = []
        }

        return this.categories
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        this.error = error.response?.data?.message || 'Failed to load categories'
        this.categories = []
        throw error
      } finally {
        this.loading = false
      }
    },

    // ==================== VERBS ====================
    async fetchVerbs() {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.get('/hr/indicator', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (Array.isArray(response.data)) {
          this.verbs = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          this.verbs = response.data.data
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

    async addVerb(name, categoryId) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.post(
          '/hr/indicator/store',
          {
            indicator_name: name.trim(),
            category_id: categoryId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        let newVerb = null
        if (response.data.data) {
          newVerb = response.data.data
        } else if (response.data.indicator) {
          newVerb = response.data.indicator
        } else if (response.data.id) {
          newVerb = response.data
        }

        if (newVerb) {
          this.verbs.push(newVerb)
        } else {
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
     * Update a verb's category
     */
    async updateVerbCategory(id, categoryId) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')

        // Find the verb to get its current name
        const verb = this.verbs.find((v) => v.id === id)
        if (!verb) {
          throw new Error('Verb not found')
        }

        const response = await api.put(
          `/hr/indicator/update/${id}`,
          {
            indicator_name: verb.indicator_name, // Include the existing name
            category_id: categoryId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        // Update local state
        const index = this.verbs.findIndex((v) => v.id === id)
        if (index !== -1) {
          this.verbs[index] = {
            ...this.verbs[index],
            category_id: categoryId,
          }
        }

        return response.data
      } catch (error) {
        console.error('Failed to update verb category:', error)
        this.error = error.response?.data?.message || 'Failed to update verb category'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteVerbs(verbIds) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const ids = Array.isArray(verbIds) ? verbIds : [verbIds]

        await Promise.all(
          ids.map((id) =>
            api.delete(`/hr/indicator/delete/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ),
        )

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

    verbExists(verbName, categoryId = null) {
      if (categoryId) {
        return this.verbs.some(
          (v) =>
            (v.indicator_name || '').toLowerCase().trim() === verbName.toLowerCase().trim() &&
            v.category_id === categoryId,
        )
      }
      return this.verbs.some(
        (v) => (v.indicator_name || '').toLowerCase().trim() === verbName.toLowerCase().trim(),
      )
    },

    // ==================== RANKS ====================
    async fetchRanks() {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.get('/hr/rank', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (Array.isArray(response.data)) {
          this.ranks = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          this.ranks = response.data.data
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

    async addRank(rankName) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.post(
          '/hr/rank/store',
          { rank_name: rankName.trim() },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        let newRank = null
        if (response.data.data) {
          newRank = response.data.data
        } else if (response.data.rank) {
          newRank = response.data.rank
        } else if (response.data.id) {
          newRank = response.data
        }

        if (newRank) {
          this.ranks.push(newRank)
        } else {
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

    async updateRank(rankId, rankName) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.put(
          `/hr/rank/update/${rankId}`,
          { rank_name: rankName.trim() },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

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

    async deleteRanks(rankIds) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const ids = Array.isArray(rankIds) ? rankIds : [rankIds]

        await Promise.all(
          ids.map((id) =>
            api.delete(`/hr/rank/delete/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ),
        )

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

    rankExists(rankName) {
      return this.ranks.some(
        (r) => (r.rank_name || '').toLowerCase().trim() === rankName.toLowerCase().trim(),
      )
    },

    // ==================== TARGET PERIODS ====================
    async fetchTargetPeriods() {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.get('/targetPeriod', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (Array.isArray(response.data)) {
          this.targetPeriods = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          this.targetPeriods = response.data.data
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

    async addTargetPeriod(semester, year) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await api.post(
          '/targetPeriod/store',
          {
            semester: semester.trim(),
            year: parseInt(year),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        let newTargetPeriod = null
        if (response.data.data) {
          newTargetPeriod = response.data.data
        } else if (response.data.targetPeriod) {
          newTargetPeriod = response.data.targetPeriod
        } else if (response.data.id) {
          newTargetPeriod = response.data
        }

        if (newTargetPeriod) {
          this.targetPeriods.push(newTargetPeriod)
        } else {
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

    async deleteTargetPeriods(targetPeriodIds) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const ids = Array.isArray(targetPeriodIds) ? targetPeriodIds : [targetPeriodIds]

        await Promise.all(
          ids.map((id) =>
            api.delete(`/targetPeriod/delete/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ),
        )

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

    targetPeriodExists(semester, year) {
      return this.targetPeriods.some(
        (tp) => tp.semester === semester && tp.year.toString() === year.toString(),
      )
    },

    // ==================== UTILITY ====================
    clearState() {
      this.verbs = []
      this.ranks = []
      this.targetPeriods = []
      this.categories = []
      this.error = null
    },
  },
})
