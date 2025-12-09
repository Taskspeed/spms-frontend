import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useMfoStore = defineStore('mfo', {
  state: () => ({
    categories: [],
    mfos: [],
    outputs: [],
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Get all standard category options
     */
    categoryOptions: (state) => {
      const standardCategories = [
        { id: 1, name: 'A.  STRATEGIC FUNCTION', type: 'strategic' },
        { id: 2, name: 'B. CORE FUNCTION', type: 'core' },
        { id: 3, name: 'C. SUPPORT FUNCTION', type: 'support' },
      ]

      if (state.categories && state.categories.length > 0) {
        const existingCategoryNames = state.categories.map((c) => c.name)
        const missingCategories = standardCategories.filter(
          (sc) => !existingCategoryNames.some((name) => name.includes(sc.name.split(' ')[0])),
        )
        return [...state.categories, ...missingCategories]
      }
      return standardCategories
    },

    /**
     * Get all strategic MFOs
     */
    strategicMfos: (state) => {
      return state.mfos.filter(
        (mfo) =>
          mfo.category &&
          (mfo.category.name?.includes('STRATEGIC') || mfo.category.name?.includes('A.')),
      )
    },

    /**
     * Get all core MFOs
     */
    coreMfos: (state) => {
      return state.mfos.filter(
        (mfo) =>
          mfo.category &&
          (mfo.category.name?.includes('CORE') || mfo.category.name?.includes('B.')),
      )
    },

    /**
     * Get support category
     */
    supportCategory: (state) => {
      return state.categories.find((cat) => cat.name.includes('SUPPORT') || cat.name.includes('C.'))
    },

    /**
     * Get all support outputs (outputs with no MFO ID in support category)
     */
    supportOutputs: (state) => {
      const supportCat = state.categories.find(
        (cat) => cat.name.includes('SUPPORT') || cat.name.includes('C. '),
      )
      if (!supportCat) return []
      return state.outputs.filter(
        (output) =>
          output.f_category_id === supportCat.id && (!output.mfo_id || output.mfo_id === null),
      )
    },
  },

  actions: {
    /**
     * Fetch all data:  categories, MFOs, and outputs
     * API response structure:
     * {
     *   "categories": [
     *     {
     *       "id": 1,
     *       "name": "A.  STRATEGIC FUNCTION",
     *       "mfos": [... ],
     *       "category_outputs": [...]
     *     }
     *   ]
     * }
     */
    async fetchAllData(officeId) {
      this.loading = true
      this.error = null

      try {
        // Fetch the main data with categories, MFOs, and outputs
        const response = await api.get('/office/mfo', {
          params: {
            office_id: officeId,
          },
        })

        // Parse the response
        let categoriesData = response.data

        // Handle if response has a categories property
        if (categoriesData && typeof categoriesData === 'object' && categoriesData.categories) {
          categoriesData = categoriesData.categories
        }

        // Ensure categoriesData is an array
        if (!Array.isArray(categoriesData)) {
          console.warn('Categories data is not an array:', categoriesData)
          categoriesData = []
        }

        // Store base categories
        this.categories = categoriesData.map((cat) => ({
          id: cat.id,
          name: cat.name,
          created_at: cat.created_at,
          updated_at: cat.updated_at,
        }))

        // Extract and process MFOs from categories
        this.mfos = []
        this.outputs = []

        categoriesData.forEach((category) => {
          const categoryObj = this.categories.find((c) => c.id === category.id)

          // Process MFOs
          if (category.mfos && Array.isArray(category.mfos)) {
            const categoryMfos = category.mfos.map((mfo) => ({
              ...mfo,
              f_category_id: category.id,
              category: categoryObj,
            }))
            this.mfos.push(...categoryMfos)
          }

          // Process category outputs (support outputs)
          if (category.category_outputs && Array.isArray(category.category_outputs)) {
            const categoryOutputs = category.category_outputs.map((output) => ({
              ...output,
              f_category_id: category.id,
              category: categoryObj,
            }))
            this.outputs.push(...categoryOutputs)
          }
        })

        // Extract and process outputs from MFOs
        categoriesData.forEach((category) => {
          if (category.mfos && Array.isArray(category.mfos)) {
            category.mfos.forEach((mfo) => {
              const mfoObj = this.mfos.find((m) => m.id === mfo.id)
              const categoryObj = this.categories.find((c) => c.id === category.id)

              // Process outputs within MFO
              if (mfo.outputs && Array.isArray(mfo.outputs)) {
                const mfoOutputs = mfo.outputs.map((output) => ({
                  ...output,
                  mfo_id: mfo.id,
                  f_category_id: category.id,
                  mfo: mfoObj,
                  category: categoryObj,
                }))
                this.outputs.push(...mfoOutputs)
              }
            })
          }
        })

        return true
      } catch (error) {
        console.error('Error fetching data:', error)
        this.error = error.message || 'Failed to load data'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Set MFOs data (called from component with userStore data)
     */
    setMfos(mfos) {
      if (!Array.isArray(mfos)) {
        this.mfos = []
        return
      }

      this.mfos = mfos.map((mfo) => ({
        ...mfo,
        category: this.categories.find((c) => c.id === mfo.f_category_id),
      }))
    },

    /**
     * Fetch categories only
     */
    async fetchCategories() {
      try {
        const response = await api.get('/fetch_f_category')
        let categoriesData = response.data

        // Handle different response structures
        if (categoriesData && typeof categoriesData === 'object' && categoriesData.categories) {
          categoriesData = categoriesData.categories
        }

        if (Array.isArray(categoriesData)) {
          this.categories = categoriesData.map((cat) => ({
            id: cat.id,
            name: cat.name,
            created_at: cat.created_at,
            updated_at: cat.updated_at,
          }))
        }

        return this.categories
      } catch (error) {
        console.error('Error fetching categories:', error)
        this.error = error.message
        throw error
      }
    },

    /**
     * Fetch MFOs and outputs for an office
     */
    async fetchMfosAndOutputs(officeId) {
      try {
        const response = await api.get('/office/mfo', {
          params: {
            office_id: officeId,
          },
        })

        let categoriesData = response.data

        if (categoriesData && typeof categoriesData === 'object' && categoriesData.categories) {
          categoriesData = categoriesData.categories
        }

        if (!Array.isArray(categoriesData)) {
          categoriesData = []
        }

        // Process MFOs and outputs
        this.mfos = []
        this.outputs = []

        categoriesData.forEach((category) => {
          const categoryObj = this.categories.find((c) => c.id === category.id)

          // Process MFOs
          if (category.mfos && Array.isArray(category.mfos)) {
            const categoryMfos = category.mfos.map((mfo) => ({
              ...mfo,
              f_category_id: category.id,
              category: categoryObj,
            }))
            this.mfos.push(...categoryMfos)
          }

          // Process category outputs
          if (category.category_outputs && Array.isArray(category.category_outputs)) {
            const categoryOutputs = category.category_outputs.map((output) => ({
              ...output,
              f_category_id: category.id,
              category: categoryObj,
            }))
            this.outputs.push(...categoryOutputs)
          }
        })

        return { mfos: this.mfos, outputs: this.outputs }
      } catch (error) {
        console.error('Error fetching MFOs and outputs:', error)
        this.error = error.message
        throw error
      }
    },

    /**
     * Add a new MFO
     */
    async addMfo(mfoData, officeId) {
      try {
        const payload = {
          office_id: officeId,
          name: mfoData.name,
          f_category_id: mfoData.categoryId,
        }

        const response = await api.post('/add_mfo', payload)
        return response.data
      } catch (error) {
        console.error('Error adding MFO:', error)
        this.error = error.message
        throw error
      }
    },

    /**
     * Add multiple MFOs
     */
    async addMultipleMfos(mfosData, officeId) {
      try {
        const promises = mfosData.map((mfo) => {
          return api.post('/add_mfo', {
            office_id: officeId,
            name: mfo.name,
            f_category_id: mfo.categoryId,
          })
        })

        const results = await Promise.all(promises)
        return results.map((res) => res.data)
      } catch (error) {
        console.error('Error adding multiple MFOs:', error)
        this.error = error.message
        throw error
      }
    },

    /**
     * Update an MFO
     */
    async updateMfo(mfoId, mfoData, officeId) {
      try {
        const payload = {
          office_id: officeId,
          name: mfoData.name,
          f_category_id: mfoData.categoryId,
        }

        const response = await api.post(`/mfos/${mfoId}`, payload)
        return response.data
      } catch (error) {
        console.error('Error updating MFO:', error)
        this.error = error.message
        throw error
      }
    },

    /**
     * Delete an MFO
     */
    async deleteMfo(mfoId) {
      try {
        const response = await api.delete(`/mfos/${mfoId}`)
        return response.data
      } catch (error) {
        console.error('Error deleting MFO:', error)
        this.error = error.message
        throw error
      }
    },

    /**
     * Add a new output
     */
    async addOutput(outputData, officeId) {
      try {
        const payload = {
          name: outputData.name,
          f_category_id: outputData.categoryId,
          office_id: officeId,
        }

        if (outputData.mfoId) {
          payload.mfo_id = outputData.mfoId
        }

        const response = await api.post('/add_output', payload)
        return response.data
      } catch (error) {
        console.error('Error adding output:', error)
        this.error = error.message
        throw error
      }
    },

    /**
     * Add multiple outputs
     */
    async addMultipleOutputs(outputsData, officeId) {
      try {
        const promises = outputsData.map((output) => {
          const payload = {
            name: output.name,
            f_category_id: output.categoryId,
            office_id: officeId,
          }

          if (output.mfoId) {
            payload.mfo_id = output.mfoId
          }

          return api.post('/add_output', payload)
        })

        const results = await Promise.all(promises)
        return results.map((res) => res.data)
      } catch (error) {
        console.error('Error adding multiple outputs:', error)
        this.error = error.message
        throw error
      }
    },

    /**
     * Update an output
     */
    async updateOutput(outputId, outputData, officeId) {
      try {
        const payload = {
          name: outputData.name,
          f_category_id: outputData.categoryId,
          office_id: officeId,
        }

        if (outputData.mfoId) {
          payload.mfo_id = outputData.mfoId
        }

        const response = await api.post(`/outputs/${outputId}`, payload)
        return response.data
      } catch (error) {
        console.error('Error updating output:', error)
        this.error = error.message
        throw error
      }
    },

    /**
     * Delete an output
     */
    async deleteOutput(outputId) {
      try {
        const response = await api.delete(`/outputs/${outputId}`)
        return response.data
      } catch (error) {
        console.error('Error deleting output:', error)
        this.error = error.message
        throw error
      }
    },

    /**
     * Get outputs for a specific MFO
     */
    getOutputsForMfo(mfoId) {
      return this.outputs.filter((output) => output.mfo_id === mfoId)
    },

    /**
     * Find category by type
     */
    findCategoryByType(categoryType) {
      return this.categoryOptions.find((cat) => {
        if (categoryType === 'strategic') {
          return cat.name.includes('STRATEGIC') || cat.name.includes('A.')
        } else if (categoryType === 'core') {
          return cat.name.includes('CORE') || cat.name.includes('B.')
        } else {
          return cat.name.includes('SUPPORT') || cat.name.includes('C.')
        }
      })
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null
    },

    /**
     * Reset store state
     */
    reset() {
      this.categories = []
      this.mfos = []
      this.outputs = []
      this.loading = false
      this.error = null
    },
  },
})
