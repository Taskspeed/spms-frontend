<template>
  <q-page padding>
    <!-- Tab Navigation -->
    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey-7 q-mb-md"
      active-color="green-9"
      indicator-color="green-9"
      align="left"
    >
      <q-tab name="verbs" label="Verbs Library" icon="description" />
      <q-tab name="ranks" label="Ranks Library" icon="military_tech" />
      <q-tab name="targetperiod" label="Target Period" icon="calendar_today" />
    </q-tabs>

    <q-separator class="q-mb-md" />

    <!-- Tab Panels -->
    <q-tab-panels v-model="activeTab" animated>
      <!-- ========== VERBS TAB ========== -->
      <q-tab-panel name="verbs">
        <div class="row justify-between items-center q-mb-md">
          <div class="col-auto">
            <div class="text-h6 text-grey-7">Verbs for Performance Indicators</div>
            <div class="text-caption text-grey-6">
              Add action verbs to use in performance indicators
            </div>
          </div>

          <div class="col-auto row items-center q-col-gutter-sm">
            <div>
              <q-input
                dense
                outlined
                color="green"
                v-model="newVerb"
                label="Add verb (e.g., facilitate)"
                @keyup.enter="addVerb"
                clearable
              />
            </div>

            <div class="col-auto">
              <q-btn color="green-9" label="Add" @click="addVerb" :loading="libraryStore.loading" />
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
                v-model="verbSearch"
                placeholder="Search verbs..."
                clearable
                class="q-pr-md"
                debounce="150"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <div class="col" />

            <div class="col-auto">
              <q-btn
                flat
                color="negative"
                :disabled="!selectedVerbIds.length"
                :label="`Delete selected (${selectedVerbIds.length})`"
                icon="delete"
                @click="confirmDeleteSelected('verbs')"
              />
            </div>
          </div>

          <div class="q-mt-xl">
            <q-list class="verbs-grid">
              <q-item
                v-for="verb in filteredVerbs"
                :key="verb.id"
                class="item-card verb-card q-pa-sm"
                clickable
              >
                <q-item-section side class="col-auto">
                  <q-checkbox dense v-model="selectedVerbIds" :val="verb.id" color="primary" />
                </q-item-section>

                <q-item-section class="q-pl-sm">
                  <q-item-label class="text-body1 ellipsis">
                    {{ verb.indicator_name }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click.
                    stop="confirmDelete('verbs', [verb.id])"
                  />
                </q-item-section>
              </q-item>
            </q-list>

            <div v-if="!filteredVerbs.length" class="text-center q-pa-md text-grey-6">
              <q-icon name="search_off" size="48px" class="q-mb-sm" />
              <div>No verbs found. Add one above or adjust your search.</div>
            </div>
          </div>
        </q-card>
      </q-tab-panel>

      <!-- ========== RANKS TAB ========== -->
      <q-tab-panel name="ranks">
        <div class="row justify-between items-center q-mb-md">
          <div class="col-auto">
            <div class="text-h6 text-grey-7">Employee Ranks</div>
            <div class="text-caption text-grey-6">Manage organizational rank classifications</div>
          </div>

          <div class="col-auto row items-center q-col-gutter-sm">
            <div>
              <q-input
                dense
                outlined
                color="green"
                v-model="newRank"
                label="Add rank (e. g., Office Head)"
                @keyup.enter="addRank"
                clearable
              />
            </div>

            <div class="col-auto">
              <q-btn color="green-9" label="Add" @click="addRank" :loading="libraryStore.loading" />
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
                v-model="rankSearch"
                placeholder="Search ranks..."
                clearable
                class="q-pr-md"
                debounce="150"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <div class="col" />

            <div class="col-auto">
              <q-btn
                flat
                color="negative"
                :disabled="!selectedRankIds.length"
                :label="`Delete selected (${selectedRankIds.length})`"
                icon="delete"
                @click="confirmDeleteSelected('ranks')"
              />
            </div>
          </div>

          <div class="q-mt-xl">
            <q-list class="ranks-grid">
              <q-item
                v-for="rank in filteredRanks"
                :key="rank.id"
                class="item-card rank-card q-pa-sm"
                clickable
              >
                <q-item-section side class="col-auto">
                  <q-checkbox dense v-model="selectedRankIds" :val="rank.id" color="primary" />
                </q-item-section>

                <q-item-section class="q-pl-sm">
                  <q-item-label class="text-body1 ellipsis">
                    {{ rank.rank_name }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      dense
                      round
                      icon="edit"
                      color="primary"
                      size="sm"
                      @click.stop="editRank(rank)"
                    />
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click.stop="confirmDelete('ranks', [rank.id])"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <div v-if="!filteredRanks.length" class="text-center q-pa-md text-grey-6">
              <q-icon name="search_off" size="48px" class="q-mb-sm" />
              <div>No ranks found. Add one above or adjust your search.</div>
            </div>
          </div>
        </q-card>
      </q-tab-panel>

      <!-- ========== TARGET PERIOD TAB ========== -->
      <q-tab-panel name="targetperiod">
        <div class="row justify-between items-center q-mb-md">
          <div class="col-auto">
            <div class="text-h6 text-grey-7">Target Period</div>
            <div class="text-caption text-grey-6">Manage target period semesters and years</div>
          </div>

          <div class="col-5 row items-center q-col-gutter-sm">
            <div class="col-5">
              <q-select
                dense
                outlined
                colo="green"
                v-model="newTargetPeriod.semester"
                :options="semesterOptions"
                label="Select Semester"
                clearable
                emit-value
                map-options
              />
            </div>

            <div class="col-5">
              <q-select
                dense
                outlined
                color="green"
                v-model="newTargetPeriod.year"
                :options="yearOptions"
                label="Select Year"
                clearable
                emit-value
                map-options
              />
            </div>

            <div class="col-auto">
              <q-btn
                color="green-9"
                label="Add"
                @click="addTargetPeriod"
                :loading="libraryStore.loading"
                :disabled="!newTargetPeriod.semester || !newTargetPeriod.year"
              />
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
                v-model="targetperiodSearch"
                placeholder="Search target periods..."
                clearable
                class="q-pr-md"
                debounce="150"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <div class="col" />

            <div class="col-auto">
              <q-btn
                flat
                color="negative"
                :disabled="!selectedTargetPeriodIds.length"
                :label="`Delete selected (${selectedTargetPeriodIds.length})`"
                icon="delete"
                @click="confirmDeleteSelected('targetperiod')"
              />
            </div>
          </div>

          <div class="q-mt-xl">
            <q-list class="targetperiod-grid">
              <q-item
                v-for="period in filteredTargetPeriods"
                :key="`${period.id}`"
                class="item-card targetperiod-card q-pa-sm"
                clickable
              >
                <q-item-section side class="col-auto">
                  <q-checkbox
                    dense
                    v-model="selectedTargetPeriodIds"
                    :val="period.id"
                    color="primary"
                  />
                </q-item-section>

                <q-item-section class="q-pl-sm">
                  <q-item-label class="text-body1">
                    {{ period.semester }}
                  </q-item-label>
                  <q-item-label class="text-caption text-grey-6">
                    Year: {{ period.year }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click.stop="confirmDelete('targetperiod', [period.id])"
                  />
                </q-item-section>
              </q-item>
            </q-list>

            <div v-if="!filteredTargetPeriods.length" class="text-center q-pa-md text-grey-6">
              <q-icon name="event" size="48px" class="q-mb-sm" />
              <div>No target periods found. Add one above or adjust your search.</div>
            </div>
          </div>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <!-- ========== EDIT RANK DIALOG ========== -->
    <q-dialog v-model="dialogEditRank">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Rank</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            outlined
            color="green"
            v-model="editingRank.rank_name"
            label="Rank Name"
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="green-9"
            label="Save"
            @click="saveRankEdit"
            :loading="libraryStore.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useQuasar } from 'quasar'

export default {
  name: 'LibraryPage',
  setup() {
    const libraryStore = useLibraryStore()
    const $q = useQuasar()
    return { libraryStore, $q }
  },
  data() {
    return {
      activeTab: 'verbs',
      selectedVerbIds: [],
      newVerb: '',
      verbSearch: '',
      selectedRankIds: [],
      newRank: '',
      rankSearch: '',
      dialogEditRank: false,
      editingRank: {
        id: null,
        rank_name: '',
      },
      // Target Period Data
      selectedTargetPeriodIds: [],
      newTargetPeriod: {
        semester: null,
        year: null,
      },
      targetperiodSearch: '',
      semesterOptions: [
        { label: 'January-June', value: 'January-June' },
        { label: 'July-December', value: 'July-December' },
      ],
    }
  },
  computed: {
    filteredVerbs() {
      const search = (this.verbSearch || '').toLowerCase().trim()
      const verbs = this.libraryStore.sortedVerbs
      if (!search) return verbs
      return verbs.filter((v) => (v.indicator_name || '').toLowerCase().includes(search))
    },
    filteredRanks() {
      const search = (this.rankSearch || '').toLowerCase().trim()
      const ranks = this.libraryStore.sortedRanks
      if (!search) return ranks
      return ranks.filter((r) => (r.rank_name || '').toLowerCase().includes(search))
    },
    filteredTargetPeriods() {
      const search = (this.targetperiodSearch || '').toLowerCase().trim()
      const periods = this.libraryStore.sortedTargetPeriods
      if (!search) return periods
      return periods.filter(
        (p) =>
          (p.semester || '').toLowerCase().includes(search) ||
          (p.year || '').toString().includes(search),
      )
    },
    yearOptions() {
      const currentYear = new Date().getFullYear()
      return [currentYear, currentYear + 1, currentYear + 2]
    },
  },
  async created() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      try {
        await Promise.all([
          this.libraryStore.fetchVerbs(),
          this.libraryStore.fetchRanks(),
          this.libraryStore.fetchTargetPeriods(),
        ])
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load library data',
          position: 'top',
        })
      }
    },

    async addVerb() {
      const text = (this.newVerb || '').trim()
      if (!text) {
        this.$q.notify({ type: 'warning', message: 'Please enter a verb.' })
        return
      }

      if (this.libraryStore.verbExists(text)) {
        this.$q.notify({ type: 'warning', message: 'This verb already exists.' })
        return
      }

      try {
        await this.libraryStore.addVerb(text)
        this.newVerb = ''
        this.$q.notify({ type: 'positive', message: 'Verb added successfully.' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to add verb.',
        })
      }
    },

    async addRank() {
      const text = (this.newRank || '').trim()
      if (!text) {
        this.$q.notify({ type: 'warning', message: 'Please enter a rank name.' })
        return
      }

      if (this.libraryStore.rankExists(text)) {
        this.$q.notify({ type: 'warning', message: 'This rank already exists.' })
        return
      }

      try {
        await this.libraryStore.addRank(text)
        this.newRank = ''
        this.$q.notify({ type: 'positive', message: 'Rank added successfully.' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to add rank.',
        })
      }
    },

    async addTargetPeriod() {
      const { semester, year } = this.newTargetPeriod

      if (!semester || !year) {
        this.$q.notify({
          type: 'warning',
          message: 'Please select both semester and year.',
        })
        return
      }

      // FIX: Check if target period already exists
      if (this.libraryStore.targetPeriodExists(semester, year)) {
        this.$q.notify({
          type: 'warning',
          message: 'This target period already exists.',
        })
        return
      }

      try {
        await this.libraryStore.addTargetPeriod(semester, year)
        this.newTargetPeriod = { semester: null, year: null }
        this.$q.notify({ type: 'positive', message: 'Target period added successfully.' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to add target period.',
        })
      }
    },

    editRank(rank) {
      this.editingRank = { ...rank }
      this.dialogEditRank = true
    },

    async saveRankEdit() {
      if (!this.editingRank.rank_name.trim()) {
        this.$q.notify({ type: 'warning', message: 'Rank name cannot be empty.' })
        return
      }

      try {
        await this.libraryStore.updateRank(this.editingRank.id, this.editingRank.rank_name)
        this.dialogEditRank = false
        this.$q.notify({ type: 'positive', message: 'Rank updated successfully.' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to update rank.',
        })
      }
    },

    confirmDeleteSelected(type) {
      let ids = []
      if (type === 'verbs') {
        ids = this.selectedVerbIds
      } else if (type === 'ranks') {
        ids = this.selectedRankIds
      } else if (type === 'targetperiod') {
        ids = this.selectedTargetPeriodIds
      }

      if (!ids.length) return
      this.confirmDelete(type, ids)
    },

    confirmDelete(type, ids) {
      this.$q
        .dialog({
          title: 'Confirm Delete',
          message: `Are you sure you want to delete ${ids.length} item(s)?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          await this.executeDelete(type, ids)
        })
    },

    async executeDelete(type, ids) {
      try {
        if (type === 'verbs') {
          await this.libraryStore.deleteVerbs(ids)
          this.selectedVerbIds = []
        } else if (type === 'ranks') {
          await this.libraryStore.deleteRanks(ids)
          this.selectedRankIds = []
        } else if (type === 'targetperiod') {
          await this.libraryStore.deleteTargetPeriods(ids)
          this.selectedTargetPeriodIds = []
        }
        this.$q.notify({ type: 'positive', message: 'Deleted successfully.' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to delete items.',
        })
      }
    },
  },
}
</script>

<style scoped>
/* VERBS GRID - 4 columns */
.verbs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  align-items: start;
}

/* RANKS GRID - 2 columns */
.ranks-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  align-items: start;
}

/* TARGET PERIOD GRID - 2 columns */
.targetperiod-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  align-items: start;
}

.item-card {
  border: 1px solid var(--q-color-grey-3);
  border-radius: 6px;
  min-height: 56px;
  align-items: center;
  display: flex;
  background: white;
  transition: all 0.2s ease;
}

.item-card:hover {
  background: var(--q-color-grey-1);
  border-color: var(--q-color-green-5);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* ========== VERTICAL LINE SEPARATORS ========== */

/* VERBS - 4 columns:  Add left border except first column */
.verb-card {
  border-left: 2px solid var(--q-color-grey-4);
}

.verb-card:nth-child(4n + 1) {
  border-left: 1px solid var(--q-color-grey-3);
}

/* RANKS - 2 columns: Add left border except first column */
.rank-card {
  border-left: 2px solid var(--q-color-grey-4);
}

.rank-card:nth-child(2n + 1) {
  border-left: 1px solid var(--q-color-grey-3);
}

/* TARGET PERIOD - 2 columns:  Add left border except first column */
.targetperiod-card {
  border-left: 2px solid var(--q-color-grey-4);
}

.targetperiod-card:nth-child(2n + 1) {
  border-left: 1px solid var(--q-color-grey-3);
}

/* ========== RESPONSIVE GRID FOR VERBS ========== */
@media (max-width: 1024px) {
  .verbs-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .verb-card {
    border-left: 2px solid var(--q-color-grey-4);
  }

  .verb-card:nth-child(3n + 1) {
    border-left: 1px solid var(--q-color-grey-3);
  }

  .verb-card:nth-child(4n + 1) {
    border-left: 2px solid var(--q-color-grey-4);
  }
}

@media (max-width: 720px) {
  .verbs-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .verb-card {
    border-left: 2px solid var(--q-color-grey-4);
  }

  .verb-card:nth-child(2n + 1) {
    border-left: 1px solid var(--q-color-grey-3);
  }

  .verb-card:nth-child(3n + 1),
  .verb-card:nth-child(4n + 1) {
    border-left: 2px solid var(--q-color-grey-4);
  }

  .ranks-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .rank-card {
    border-left: 1px solid var(--q-color-grey-3);
  }

  .targetperiod-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .targetperiod-card {
    border-left: 1px solid var(--q-color-grey-3);
  }
}

@media (max-width: 420px) {
  .verbs-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .verb-card {
    border-left: 1px solid var(--q-color-grey-3);
  }
}

.q-item-label .ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
