//mfoStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useMfoStore = defineStore('mfo', {
  state: () => ({
    categories: [],
    mfos: [],
    outputs: [],
    loading: false,
    error: null,
    skipMfo: false,
    supportOutputs: []

  }),

  actions: {
        async fetchCategories() {
          this.loading = true
          this.error = null
          try {
            const response = await api.get('/f_category')
            this.categories = response.data
          } catch (error) {
            console.error('Error fetching categories:', error)
            this.error = error
            throw error
          } finally {
            this.loading = false
          }
        },


async fetchMfosByCategory(categoryId) {
  this.loading = true
  this.error = null
  try {
    const numericCategoryId = Number(categoryId)
    if (isNaN(numericCategoryId)) {
      throw new Error('Invalid category ID')
    }

    const response = await api.get('/mfo', {
      params: { category_id: numericCategoryId }
    })

    // Sort MFOs by ID or name to maintain consistent numbering
    this.mfos = (response.data.mfos || []).sort((a, b) => a.id - b.id)
    this.supportOutputs = (response.data.support_outputs || []).sort((a, b) => a.id - b.id)
    this.skipMfo = response.data.skip_mfo || false

    if (this.skipMfo && this.supportOutputs.length === 1) {
      this.rows[2].output = this.supportOutputs[0].value
    }
  } catch (error) {
    console.error('Error fetching MFOs:', error)
    this.error = error
    throw error
  } finally {
    this.loading = false
  }
},
    async fetchSupportOutputs(categoryId) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/getSupportOutputs', {
          params: { category_id: categoryId }
        })
        this.supportOutputs = response.data
      } catch (error) {
        console.error('Error fetching support outputs:', error)
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },



async fetchOutputsByMfo(mfoId) {
  this.loading = true
  try {
    const response = await api.get('/output', {
      params: { mfo_id: mfoId }
    })
    // Sort outputs by ID or name to maintain consistent numbering
    this.outputs = (response.data || []).sort((a, b) => a.id - b.id)
  } catch (error) {
    console.error('Error fetching outputs:', error)
    throw error
  } finally {
    this.loading = false
  }
}
  }
})
