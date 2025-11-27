<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div class="col-auto">
        <div class="text-h6 text-grey-7">Library</div>
      </div>

      <div class="col-auto row items-center q-col-gutter-sm">
        <div>
          <q-input
            dense
            outlined
            color="green"
            v-model="newVerb"
            label="Add verb (e.g. facilitate)"
            @keyup.enter="addVerb"
            clearable
          />
        </div>

        <div class="col-auto">
          <q-btn color="green-9" label="Add" @click="addVerb" :loading="loading" />
        </div>
      </div>
    </div>
    <q-card flat bordered class="q-pa-md">
      <div class="row items-center q-col-gutter-sm">
        <div class="col-12 col-md-4">
          <q-input
            dense
            outlined
            color="green"
            v-model="search"
            placeholder="Search verbs..."
            clearable
            class="q-pr-md"
            debounce="150"
            @input="onSearch"
          />
        </div>

        <div class="col" />

        <div class="col-auto">
          <q-btn
            flat
            color="negative"
            :disabled="!selectedIds.length"
            label="Delete selected"
            icon="delete"
            @click="confirmDeleteSelected"
          />
        </div>
      </div>

      <div class="q-mt-xl">
        <!-- 4-column q-list layout using filteredVerbs -->
        <q-list class="verbs-grid">
          <q-item v-for="verb in filteredVerbs" :key="verb.id" class="verb-item q-pa-sm" clickable>
            <q-item-section side class="col-auto">
              <q-checkbox
                dense
                v-model="selectedIds"
                :val="verb.id"
                :true-value="verb.id"
                :false-value="null"
                color="primary"
              />
            </q-item-section>

            <q-item-section class="q-pl-sm">
              <q-item-label class="text-body1 ellipsis">
                {{ verb.verb }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="!filteredVerbs.length" class="text-center q-pa-md">
          No verbs found. Add one above or adjust your search.
        </div>
      </div>
    </q-card>

    <!-- Confirm dialog for deleting selected items -->
    <q-dialog v-model="dialogConfirm">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm delete</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to permanently delete
          <strong>{{ idsToDelete.length }}</strong> item(s)?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup @click="dialogConfirm = false" />
          <q-btn color="negative" label="Delete" @click="deleteSelected" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  name: 'LibraryPage',
  data() {
    return {
      verbs: [],
      selectedIds: [],
      newVerb: '',
      search: '',
      loading: false,
      dialogConfirm: false,
      idsToDelete: [],
    }
  },
  created() {
    this.fetchVerbs()
  },
  computed: {
    searchLower() {
      return (this.search || '').toLowerCase().trim()
    },
    filteredVerbs() {
      if (!this.searchLower) return this.verbs
      return this.verbs.filter((v) => (v.verb || '').toLowerCase().includes(this.searchLower))
    },
  },
  methods: {
    onSearch() {
      // keep placeholder for any future debounce/server search
    },

    async fetchVerbs() {
      this.loading = true
      try {
        // Replace with your API call if available:
        // const res = await axios.get('/api/verbs')
        // this.verbs = res.data

        // demo/local fallback seed
        if (!this.verbs.length) {
          this.verbs = [
            { id: 1, verb: 'facilitate' },
            { id: 2, verb: 'review' },
            { id: 3, verb: 'observe' },
            { id: 4, verb: 'create' },
            { id: 5, verb: 'analyze' },
            { id: 6, verb: 'design' },
          ]
        }
      } catch (err) {
        console.error('Failed to fetch verbs', err)
        this.$q.notify({ type: 'negative', message: 'Failed to load verbs.' })
      } finally {
        this.loading = false
      }
    },

    addVerb() {
      const text = (this.newVerb || '').trim()
      if (!text) {
        this.$q.notify({ type: 'warning', message: 'Please enter a verb.' })
        return
      }

      this.loading = true
      try {
        // Uncomment / adapt to call a backend:
        // const res = await axios.post('/api/verbs', { verb: text })
        // this.verbs.unshift(res.data)

        const nextId = this.verbs.length ? Math.max(...this.verbs.map((v) => v.id)) + 1 : 1
        this.verbs.unshift({ id: nextId, verb: text })

        this.newVerb = ''
        this.$q.notify({ type: 'positive', message: 'Verb added.' })
      } catch (err) {
        console.error('Add verb failed', err)
        this.$q.notify({ type: 'negative', message: 'Failed to add verb.' })
      } finally {
        this.loading = false
      }
    },

    confirmDeleteSelected() {
      if (!this.selectedIds.length) return
      this.idsToDelete = [...this.selectedIds]
      this.dialogConfirm = true
    },

    confirmDelete(ids) {
      this.idsToDelete = ids
      this.dialogConfirm = true
    },

    async deleteSelected() {
      this.dialogConfirm = false
      if (!this.idsToDelete.length) return

      this.loading = true
      try {
        // Example API batch delete (uncomment and adapt)
        // await axios.delete('/api/verbs', { data: { ids: this.idsToDelete } })

        const idSet = new Set(this.idsToDelete)
        this.verbs = this.verbs.filter((v) => !idSet.has(v.id))

        // clear selection
        this.selectedIds = this.selectedIds.filter((id) => !idSet.has(id))

        this.idsToDelete = []
        this.$q.notify({ type: 'positive', message: 'Deleted.' })
      } catch (err) {
        console.error('Delete failed', err)
        this.$q.notify({ type: 'negative', message: 'Failed to delete.' })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.verbs-grid {
  display: grid;

  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  align-items: start;
}

/* Make each verb look like a simple card inside the grid */
.verb-item {
  border: 1px solid transparent;
  border-radius: 6px;
  min-height: 48px;
  align-items: center;
  padding-left: 12px;
  padding-right: 12px;
  display: flex;
  background: white;
}

/* Vertical outline between columns:
   Add left border on every item except the first item in each row.
   Adjust nth-child selectors for responsive column counts. */
.verb-item {
  border-left: 1px solid var(--q-color-grey-3);
}
/* 4 columns: remove left border on first col items */
.verb-item:nth-child(4n + 1) {
  border-left: none;
}

/* Responsive adjustments - 3 columns */
@media (max-width: 1024px) {
  .verbs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .verb-item {
    border-left: 1px solid var(--q-color-grey-3);
  }
  .verb-item:nth-child(3n + 1) {
    border-left: none;
  }
}

/* 2 columns */
@media (max-width: 720px) {
  .verbs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .verb-item {
    border-left: 1px solid var(--q-color-grey-3);
  }
  .verb-item:nth-child(2n + 1) {
    border-left: none;
  }
}

/* 1 column - no vertical outlines needed */
@media (max-width: 420px) {
  .verbs-grid {
    grid-template-columns: repeat(1, 1fr);
  }
  .verb-item {
    border-left: none;
  }
}

/* hover/focus states */
.verb-item:hover,
.verb-item:focus {
  background: var(--q-color-grey-1);
  cursor: pointer;
}

/* minor spacing / text */
.q-item-label {
  margin: 0;
}
</style>
