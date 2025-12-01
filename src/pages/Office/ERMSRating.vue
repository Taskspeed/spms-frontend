<template>
  <q-page class="q-pa-md">
    <!-- Main table view -->
    <div v-if="!showDetails && !showPerformanceDisplay">
      <h6 class="text-h6 q-mb-md">Ratings</h6>

      <div class="row q-mb-md">
        <q-input
          dense
          outlined
          v-model="filter"
          placeholder="Search target period"
          class="full-width"
          clearable
          debounce="300"
        >
          <template v-slot:append><q-icon name="search" /></template>
        </q-input>
      </div>

      <q-table
        :rows="filteredData"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
      >
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-6">
            <q-icon name="search_off" size="2em" class="q-mr-sm" />
            No matching records found
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr
            :props="props"
            @click="showPeriodDetails(props.row)"
            class="cursor-pointer hover-highlight"
          >
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <template v-if="col.name === 'status'">
                <q-badge :color="getStatusColor(col.value)">
                  {{ col.value }}
                </q-badge>
              </template>
              <template v-else-if="col.name === 'actions'">
                <div class="q-gutter-sm" @click.stop>
                  <q-btn
                    flat
                    round
                    dense
                    color="primary"
                    icon="star_rate"
                    @click="handleAction('Rate', props.row)"
                  >
                    <q-tooltip>Rate</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    dense
                    color="info"
                    icon="description"
                    @click="handleAction('Reports', props.row)"
                  >
                    <q-tooltip>Reports</q-tooltip>
                  </q-btn>
                </div>
              </template>
              <template v-else>
                {{ col.value }}
              </template>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <!-- Details view (Step 1) -->
    <div v-else-if="showDetails && !showPerformanceDisplay">
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center">
          <h6 class="text-h6 q-mb-md">{{ selectedPeriod.targetPeriod }}</h6>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          color="red-7"
          @click="backToTable"
          class="close-button"
        >
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </div>

      <div class="row justify-between items-center q-mb-md">
        <div class="row q-col-gutter-md items-center">
          <div class="col-auto">
            <q-btn-toggle
              v-model="dateFilterType"
              toggle-color="primary"
              :options="[
                { label: 'Specific Date', value: 'single' },
                { label: 'Date Range', value: 'range' },
              ]"
              size="sm"
              unelevated
              rounded
            />
          </div>

          <div v-if="dateFilterType === 'single'" class="col-auto">
            <q-input
              outlined
              dense
              readonly
              v-model="specificDateText"
              placeholder="Select Specific Date"
              class="col-auto cursor-pointer"
              style="min-width: 200px"
              @click="() => $refs.specificDateProxy.show()"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="primary" class="cursor-pointer" />
              </template>
              <template v-slot:append>
                <q-icon name="arrow_drop_down" color="primary" class="cursor-pointer" />
              </template>
            </q-input>
            <q-popup-proxy ref="specificDateProxy" anchor="bottom left" self="top left">
              <q-date
                v-model="specificDate"
                landscape
                today-btn
                mask="YYYY-MM-DD"
                color="primary"
                :default-year-month="defaultYearMonth"
                :default-date="currentDate"
                @update:model-value="onSpecificDateChange"
              >
                <div class="row items-center justify-end q-gutter-x-sm">
                  <q-btn
                    label="Clear"
                    class="bg-negative text-white"
                    rounded
                    flat
                    size="sm"
                    @click="clearSpecificDate"
                    v-if="specificDate"
                  />
                  <q-btn
                    label="Apply"
                    class="bg-primary text-white"
                    rounded
                    flat
                    size="sm"
                    v-close-popup
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </div>

          <div v-if="dateFilterType === 'range'" class="col-auto">
            <q-input
              outlined
              dense
              readonly
              v-model="dateRangeText"
              placeholder="Select Date Range"
              class="col-auto cursor-pointer"
              style="min-width: 200px"
              @click="() => $refs.dateRangeProxy.show()"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="primary" class="cursor-pointer" />
              </template>
              <template v-slot:append>
                <q-icon name="arrow_drop_down" color="primary" class="cursor-pointer" />
              </template>
            </q-input>
            <q-popup-proxy ref="dateRangeProxy" anchor="bottom left" self="top left">
              <q-date
                v-model="dateRange"
                range
                landscape
                today-btn
                mask="YYYY-MM-DD"
                color="primary"
                :default-year-month="defaultYearMonth"
                :default-date="currentDate"
                @update:model-value="onDateRangeChange"
              >
                <div class="row items-center justify-end q-gutter-x-sm">
                  <q-btn
                    label="Clear"
                    class="bg-negative text-white"
                    rounded
                    flat
                    size="sm"
                    @click="clearDateRange"
                    v-if="dateRange.from || dateRange.to"
                  />
                  <q-btn
                    label="Apply"
                    class="bg-primary text-white"
                    rounded
                    flat
                    size="sm"
                    v-close-popup
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </div>
        </div>
      </div>

      <q-table
        :rows="filteredFunctionData"
        :columns="functionColumns"
        row-key="id"
        :loading="detailsLoading"
        @row-click="onRowClick"
        class="cursor-pointer"
      >
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-6">
            <q-icon name="search_off" size="2em" class="q-mr-sm" />
            No matching records found
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" @click="onRowClick(props.row)" class="hover-highlight">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.value }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <!-- Step 2: Performance Display -->
    <performance-display
      v-else-if="showPerformanceDisplay"
      :selected-period="selectedPeriod"
      :selected-rating="selectedRating"
      :selected-rating-date="selectedRatingDate"
      :performance-data="performanceData"
      @back="backToDetails"
      @edit="onEditPerformance"
      @submit="onSubmitPerformance"
    />

    <!-- Report Modal Dialog -->
    <q-dialog v-model="show_ipcr_ModalOpen" full-width>
      <ipcr-report @close="close_ipcr_Modal" />
    </q-dialog>

    <!-- Date Wizard Modal Dialog -->

    <date-wizard-modal
      v-model="showDateWizard"
      :target-period="selectedPeriod?.targetPeriod || 'January - June 2025'"
      :status="selectedPeriod?.status || 'In Progress'"
      :rating-id="functionData.length + 1"
      :performance-data="performanceData"
      @submit="handleDateWizardSubmit"
    />
  </q-page>
</template>

<script>
import { date } from 'quasar'
import IpcrReport from 'src/components/ipcr_Report.vue'
import DateWizardModal from 'src/components/office/DatePickerModal.vue'
import PerformanceDisplay from 'src/components/office/RatingForm.vue'

export default {
  name: 'IPCRTable',
  components: {
    'ipcr-report': IpcrReport,
    'date-wizard-modal': DateWizardModal,
    'performance-display': PerformanceDisplay,
  },
  data() {
    const currentDate = '2025-06-18'

    return {
      // Main table data
      loading: false,
      filter: '',
      pagination: {
        sortBy: 'targetPeriod',
        descending: true,
        page: 1,
        rowsPerPage: 10,
      },
      columns: [
        {
          name: 'targetPeriod',
          required: true,
          label: 'Target Period',
          align: 'left',
          field: (row) => row.targetPeriod,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: 'status',
          required: true,
          label: 'IPCR Status',
          align: 'left',
          field: 'status',
          sortable: true,
        },
        {
          name: 'actions',
          required: true,
          label: 'Actions',
          align: 'center',
          field: 'actions',
          sortable: false,
        },
      ],
      data: [
        {
          id: 1,
          targetPeriod: 'January - June 2025',
          status: 'In Progress',
        },
        {
          id: 2,
          targetPeriod: 'July - December 2024',
          status: 'Completed',
        },
        {
          id: 3,
          targetPeriod: 'January - June 2024',
          status: 'Completed',
        },
        {
          id: 4,
          targetPeriod: 'July - December 2023',
          status: 'Completed',
        },
        {
          id: 5,
          targetPeriod: 'January - June 2023',
          status: 'Completed',
        },
      ],

      // View state flags
      showDetails: false,
      showPerformanceDisplay: false,
      show_ipcr_ModalOpen: false,
      showDateWizard: false,
      selectedPeriod: null,
      selectedRating: null,
      selectedRatingDate: null,
      detailsLoading: false,

      // Current date for defaults
      currentDate: currentDate,
      defaultYearMonth: '2025/06',

      // Date filter options
      dateFilterType: 'single',
      specificDate: '',
      dateRange: {
        from: '',
        to: '',
      },

      functionColumns: [
        {
          name: 'date',
          required: true,
          label: 'Date',
          align: 'left',
          field: 'date',
          sortable: true,
          format: (val) => date.formatDate(val, 'MMMM D, YYYY'),
        },
        {
          name: 'strategicFunction',
          align: 'center',
          label: 'Strategic Function',
          field: 'strategicFunction',
          sortable: true,
        },
        {
          name: 'coreFunction',
          align: 'center',
          label: 'Core Function',
          field: 'coreFunction',
          sortable: true,
        },
        {
          name: 'supportFunction',
          align: 'center',
          label: 'Support Function',
          field: 'supportFunction',
          sortable: true,
        },
      ],
      functionData: [
        {
          id: 1,
          date: '2025-01-15',
          strategicFunction: '5',
          coreFunction: '5',
          supportFunction: '5',
        },
        {
          id: 2,
          date: '2025-02-05',
          strategicFunction: '5',
          coreFunction: '5',
          supportFunction: '5',
        },
        {
          id: 3,
          date: '2025-03-18',
          strategicFunction: '5',
          coreFunction: '5',
          supportFunction: '5',
        },
        {
          id: 4,
          date: '2025-04-22',
          strategicFunction: '5',
          coreFunction: '5',
          supportFunction: '5',
        },
        {
          id: 5,
          date: '2025-05-10',
          strategicFunction: '5',
          coreFunction: '5',
          supportFunction: '5',
        },
      ],
      originalFunctionData: [],

      // Performance Data
      performanceData: {
        employee: {
          name: 'Juan Dela Cruz',
          position: 'Software Engineer II',
          rank: 'Technical Function',
        },
        performanceStandards: [
          {
            expanded: true,
            category: 'Strategic Function',
            mfo: 'Digital Transformation Services',
            output: 'Software Applications Developed',
            outputName: 'Mobile Application',
            indicatorName: 'Number of applications delivered',
            successIndicator: 'Successfully developed and deployed mobile applications on time',
            requiredOutput: 'Fully functional mobile application with all required features',
            competencies: {
              core: [
                { code: 'CC1', value: '5', legend: 'Excellence' },
                { code: 'CC2', value: '4', legend: 'Very Good' },
              ],
              technical: [
                { code: 'TC1', value: '5', legend: 'Expert' },
                { code: 'TC2', value: '5', legend: 'Expert' },
              ],
              leadership: [{ code: 'LC1', value: '4', legend: 'Proficient' }],
            },
            standardOutcomeRows: [
              {
                rating: '5',
                quantity: '120% or more',
                effectiveness: 'All features implemented with zero critical bugs',
                timelinessRange: '7',
                timelinessDate: '2025/06/15',
                timelinessText: 'Before deadline',
              },
              {
                rating: '4',
                quantity: '100% to 119%',
                effectiveness: 'All features implemented with minor bugs',
                timelinessRange: '3',
                timelinessDate: '2025/06/20',
                timelinessText: 'On time',
              },
              {
                rating: '3',
                quantity: '80% to 99%',
                effectiveness: 'Most features implemented with some bugs',
                timelinessRange: '0',
                timelinessDate: '2025/06/30',
                timelinessText: 'On deadline',
              },
              {
                rating: '2',
                quantity: '60% to 79%',
                effectiveness: 'Some features missing or multiple bugs',
                timelinessRange: '',
                timelinessDate: '',
                timelinessText: 'Delayed',
              },
              {
                rating: '1',
                quantity: 'Below 60%',
                effectiveness: 'Incomplete or not functional',
                timelinessRange: '',
                timelinessDate: '',
                timelinessText: 'Significantly delayed',
              },
            ],
            timelinessType: ['range', 'date', 'description'],
            inputs: {
              quantity: '',
              effectiveness: '',
              timelinessRange: '',
              timelinessDate: '',
              timelinessDescription: '',
            },
          },
          {
            expanded: false,
            category: 'Core Function',
            mfo: 'System Maintenance',
            output: 'System Updates Completed',
            outputName: 'Security Patches',
            indicatorName: 'Number of patches deployed',
            successIndicator: 'All critical security patches deployed within SLA',
            requiredOutput: 'Zero security vulnerabilities in production systems',
            competencies: {
              core: [
                { code: 'CC1', value: '4', legend: 'Very Good' },
                { code: 'CC3', value: '5', legend: 'Excellence' },
              ],
              technical: [
                { code: 'TC3', value: '5', legend: 'Expert' },
                { code: 'TC4', value: '4', legend: 'Advanced' },
              ],
              leadership: [],
            },
            standardOutcomeRows: [
              {
                rating: '5',
                quantity: '100% patches deployed',
                effectiveness: 'Zero security incidents, all patches tested',
                timelinessRange: '5',
                timelinessDate: '',
                timelinessText: 'Within 24 hours of release',
              },
              {
                rating: '4',
                quantity: '95% to 99%',
                effectiveness: 'Minor security incidents resolved quickly',
                timelinessRange: '2',
                timelinessDate: '',
                timelinessText: 'Within 48 hours',
              },
              {
                rating: '3',
                quantity: '85% to 94%',
                effectiveness: 'Some security gaps identified and patched',
                timelinessRange: '0',
                timelinessDate: '',
                timelinessText: 'Within 72 hours',
              },
              {
                rating: '2',
                quantity: '70% to 84%',
                effectiveness: 'Multiple security vulnerabilities exist',
                timelinessRange: '',
                timelinessDate: '',
                timelinessText: 'Beyond 72 hours',
              },
              {
                rating: '1',
                quantity: 'Below 70%',
                effectiveness: 'Critical vulnerabilities unpatched',
                timelinessRange: '',
                timelinessDate: '',
                timelinessText: 'Significantly delayed',
              },
            ],
            timelinessType: ['range', 'description'],
            inputs: {
              quantity: '',
              effectiveness: '',
              timelinessRange: '',
              timelinessDate: '',
              timelinessDescription: '',
            },
          },
        ],
      },
    }
  },
  computed: {
    filteredData() {
      if (!this.filter) {
        return this.data
      }

      const searchTerm = this.filter.toLowerCase()
      return this.data.filter((item) => {
        return (
          item.targetPeriod.toLowerCase().includes(searchTerm) ||
          item.status.toLowerCase().includes(searchTerm)
        )
      })
    },
    filteredFunctionData() {
      if (this.dateFilterType === 'single' && this.specificDate) {
        return this.functionData.filter((item) => {
          const itemDate = item.date.substring(0, 10)
          return itemDate === this.specificDate
        })
      }

      if (this.dateFilterType === 'range' && (this.dateRange.from || this.dateRange.to)) {
        return this.functionData.filter((item) => {
          const itemDate = item.date

          if (this.dateRange.from && this.dateRange.to) {
            return itemDate >= this.dateRange.from && itemDate <= this.dateRange.to
          } else if (this.dateRange.from) {
            return itemDate >= this.dateRange.from
          } else if (this.dateRange.to) {
            return itemDate <= this.dateRange.to
          }
        })
      }

      return this.functionData
    },
    dateRangeText() {
      if (!this.dateRange.from && !this.dateRange.to) {
        return ''
      }

      if (this.dateRange.from && this.dateRange.to) {
        return `${date.formatDate(this.dateRange.from, 'MMM D, YYYY')} - ${date.formatDate(this.dateRange.to, 'MMM D, YYYY')}`
      } else if (this.dateRange.from) {
        return `From: ${date.formatDate(this.dateRange.from, 'MMM D, YYYY')}`
      } else if (this.dateRange.to) {
        return `Until: ${date.formatDate(this.dateRange.to, 'MMM D, YYYY')}`
      }

      return ''
    },
    specificDateText() {
      return this.specificDate ? date.formatDate(this.specificDate, 'MMM D, YYYY') : ''
    },
  },
  created() {
    this.originalFunctionData = [...this.functionData]
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        return date.formatDate(dateString, 'MMMM D, YYYY')
      } catch {
        return dateString
      }
    },
    getStatusColor(status) {
      switch (status) {
        case 'Completed':
          return 'positive'
        case 'In Progress':
          return 'warning'
        case 'Pending':
          return 'negative'
        default:
          return 'grey'
      }
    },
    handleAction(action, row) {
      console.log(`${action} action for period: ${row.targetPeriod}`)

      if (action === 'Reports') {
        this.selectedPeriod = row
        this.show_ipcr_ModalOpen = true
      } else if (action === 'Rate') {
        this.selectedPeriod = row
        this.showDateWizard = true
      }
    },
    handleDateWizardSubmit(formData) {
      console.log('Date wizard submitted:', formData)

      this.performanceData.performanceStandards = formData.performanceStandards

      this.$q.notify({
        color: 'positive',
        textColor: 'white',
        icon: 'check_circle',
        message: `Performance rating for ${date.formatDate(formData.date, 'MMM D, YYYY')} submitted successfully. `,
        position: 'bottom-right',
        timeout: 3000,
      })
    },
    showPeriodDetails(row) {
      this.selectedPeriod = row
      this.showDetails = true
      this.loadPeriodFunctionData()
    },
    onRowClick(row) {
      this.selectedRating = row
      this.selectedRatingDate = row.date
      this.showPerformanceDisplay = true
    },
    backToTable() {
      this.showDetails = false
      this.showPerformanceDisplay = false
      this.selectedPeriod = null
      this.selectedRating = null
      this.selectedRatingDate = null
      this.clearAllDateFilters()
    },
    backToDetails() {
      this.showPerformanceDisplay = false
      this.selectedRating = null
      this.selectedRatingDate = null
    },
    loadPeriodFunctionData() {
      this.detailsLoading = true

      setTimeout(() => {
        this.detailsLoading = false
      }, 500)
    },
    onDateRangeChange() {
      console.log('Date range changed:', this.dateRange)
    },
    onSpecificDateChange() {
      console.log('Specific date changed:', this.specificDate)
    },
    clearDateRange() {
      this.dateRange = { from: '', to: '' }
    },
    clearSpecificDate() {
      this.specificDate = ''
    },
    clearAllDateFilters() {
      this.clearDateRange()
      this.clearSpecificDate()
    },
    close_ipcr_Modal() {
      this.show_ipcr_ModalOpen = false
    },
    onEditPerformance() {
      this.$q.notify({
        color: 'info',
        message: 'Edit mode activated',
        icon: 'edit',
        position: 'top',
      })
    },
    onSubmitPerformance(updatedStandards) {
      this.$q.notify({
        color: 'positive',
        message: 'Performance standards submitted successfully',
        icon: 'check_circle',
        position: 'top',
      })

      // Update the performance data with the submitted values
      this.performanceData.performanceStandards = updatedStandards

      // Navigate back or reset
      this.backToTable()
    },
  },
}
</script>

<style scoped>
.q-table__title {
  font-size: 1.2rem;
  font-weight: 500;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-highlight:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.q-table thead tr th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.close-button {
  transition: transform 0.2s;
}

.close-button:hover {
  transform: scale(1.1);
  color: #000;
}

@media (max-width: 1023px) {
  .col-md-3,
  .col-md-4,
  .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>
