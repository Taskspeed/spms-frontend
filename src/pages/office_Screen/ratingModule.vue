<template>
  <q-page class="q-px-md q-pb-md">
    <!-- Main table view -->
    <div v-if="!showDetails">
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

    <!-- Details view -->
    <div v-else>
      <!-- The details view code remains the same -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center">
          <h6 class="text-h6 q-mb-md">{{ selectedPeriod.targetPeriod }}</h6>
        </div>
        <!-- X button in the top right -->
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

      <!-- Enhanced Date Filter Implementation -->
      <!-- Date filter code remains the same -->
      <div class="row justify-between items-center q-mb-md">
        <!-- Date filter content -->
        <div class="row q-col-gutter-md items-center">
          <!-- Date filter type selector -->
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

          <!-- Single date picker -->
          <div v-if="dateFilterType === 'single'" class="col-auto">
            <!-- Single date picker code -->
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
            <!-- Detached popup proxy with no transition -->
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

          <!-- Date range picker -->
          <div v-if="dateFilterType === 'range'" class="col-auto">
            <!-- Date range picker code -->
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
            <!-- Detached popup proxy with no transition -->
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
      >
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-6">
            <q-icon name="search_off" size="2em" class="q-mr-sm" />
            No matching records found
          </div>
        </template>
      </q-table>
    </div>

    <!-- Report Modal Dialog -->
    <q-dialog v-model="show_ipcr_ModalOpen" full-width>
      <ipcr-report @close="close_ipcr_Modal" />
    </q-dialog>

    <!-- Date Wizard Modal Dialog -->
    <date-wizard-modal v-model="showDateWizard" @submit="handleDateWizardSubmit" />
  </q-page>
</template>

<script>
import { date } from 'quasar'
import IpcrReport from 'src/components/ipcr_Report.vue'
import DateWizardModal from 'src/components/office/DateWizardModal.vue'

export default {
  name: 'IPCRTable',
  components: {
    'ipcr-report': IpcrReport,
    'date-wizard-modal': DateWizardModal,
  },
  data() {
    // Current date based on the provided timestamp
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
      show_ipcr_ModalOpen: false,
      showDateWizard: false, // New flag for date wizard modal
      selectedPeriod: null,
      detailsLoading: false,

      // Current date for defaults
      currentDate: currentDate,
      defaultYearMonth: '2025/06', // Format YYYY/MM for default calendar view

      // Date filter options
      dateFilterType: 'single', // 'single' or 'range'

      // Single date filter
      specificDate: '',

      // Date range filter
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
      originalFunctionData: [], // Will hold a copy of the original data for filtering
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
      // Handle specific date filter
      if (this.dateFilterType === 'single' && this.specificDate) {
        return this.functionData.filter((item) => {
          // Compare only the date part (ignore time)
          const itemDate = item.date.substring(0, 10) // Extract YYYY-MM-DD part
          return itemDate === this.specificDate
        })
      }

      // Handle date range filter
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

      // No filter applied, return all data
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
    // Store original function data for filtering
    this.originalFunctionData = [...this.functionData]
  },
  methods: {
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
        // Open the report modal
        this.selectedPeriod = row
        this.show_ipcr_ModalOpen = true
      } else if (action === 'Rate') {
        // Open the date wizard modal
        this.selectedPeriod = row
        this.showDateWizard = true
      }
    },
    handleDateWizardSubmit(formData) {
      console.log('Date wizard submitted:', formData)

      // Display success notification
      this.$q.notify({
        color: 'positive',
        textColor: 'white',
        icon: 'check_circle',
        message: `Rating for ${this.selectedPeriod.targetPeriod} on ${date.formatDate(formData.date, 'MMM D, YYYY')} submitted successfully.`,
        position: 'bottom-right',
        timeout: 3000,
      })
    },
    showPeriodDetails(row) {
      this.selectedPeriod = row
      this.showDetails = true
      this.loadPeriodFunctionData()
    },
    backToTable() {
      this.showDetails = false
      this.selectedPeriod = null
      this.clearAllDateFilters()
    },
    loadPeriodFunctionData() {
      this.detailsLoading = true

      // For demo purposes, we're just using mock data with a timeout
      setTimeout(() => {
        // The mock data is already set in data()
        this.detailsLoading = false
      }, 500)
    },
    onDateRangeChange() {
      // Filter is automatically applied through the computed property
      console.log('Date range changed:', this.dateRange)
    },
    onSpecificDateChange() {
      // Filter is automatically applied through the computed property
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
    // Added missing close method for the report modal
    close_ipcr_Modal() {
      this.show_ipcr_ModalOpen = false
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

/* Add styling for table headers */
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
</style>
