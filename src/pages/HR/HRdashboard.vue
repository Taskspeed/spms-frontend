<template>
  <q-page padding>
    <div class="col-auto q-pb-md">
      <div class="text-h6 text-green text-weight-bold">Dashboard</div>
      <div class="text-h7 text-green">Current Target Period</div>
    </div>
    <!-- Cards Row -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Employee Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card
          class="bg-white shadow-3 full-height clickable-card"
          @click="$router.push('/office/employee')"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="people" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">Total Employees</div>
                <div class="text-h6 text-weight-bold">3000</div>
              </div>
            </div>
            <div class="q-mt-md">
              <div class="row justify-between q-mb-xs">
                <span class="text-caption">Office: <strong>25</strong></span>
                <span class="text-caption">Division: <strong>150</strong></span>
              </div>

              <div class="row justify-between q-mb-xs">
                <span class="text-caption">Section: <strong>85</strong></span>
                <span class="text-caption">Unit: <strong>75</strong></span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- OPCR Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card
          class="bg-white shadow-3 full-height clickable-card"
          @click="$router.push('/office/opcr')"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="assessment" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">OPCR Status</div>
                <div class="text-h6 text-weight-bold q-mb-sm">25</div>
              </div>
            </div>
            <div class="q-mb-sm">
              <q-linear-progress size="xs" :value="15 / 25" color="positive" />
              <span class="text-caption">Approved: <strong class="text-positive">15</strong></span>
            </div>
            <div class="q-mb-sm">
              <q-linear-progress size="xs" :value="5 / 25" color="warning" />
              <span class="text-caption">Pending: <strong class="text-warning">5</strong></span>
            </div>
            <div>
              <q-linear-progress size="xs" :value="5 / 25" color="grey" />
              <span class="text-caption">Draft: <strong class="text-grey">5</strong></span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- IPCR Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card
          class="bg-white shadow-3 full-height clickable-card"
          @click="$router.push('/office/ipcr')"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="assignment_ind" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">IPCR Status</div>
                <div class="text-h6 text-weight-bold q-mb-sm">2975</div>
              </div>
            </div>
            <div class="q-mb-sm">
              <q-linear-progress size="xs" :value="1365 / 2665" color="positive" />
              <span class="text-caption"
                >Approved: <strong class="text-positive">1375</strong></span
              >
            </div>
            <div class="q-mb-sm">
              <q-linear-progress size="xs" :value="300 / 2665" color="warning" />
              <span class="text-caption">Pending: <strong class="text-warning">600</strong></span>
            </div>
            <div>
              <q-linear-progress size="xs" :value="1000 / 2665" color="grey" />
              <span class="text-caption">Draft: <strong class="text-grey">1000</strong></span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Unit Work Plan Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card
          class="bg-white shadow-3 full-height clickable-card"
          @click="$router.push('/office/unit-work-plan')"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="domain" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">Unit Work Plan</div>
                <div class="text-h6 text-weight-bold q-mb-sm">25</div>
              </div>
            </div>
            <div class="q-mb-sm">
              <q-linear-progress size="xs" :value="15 / 25" color="positive" />
              <span class="text-caption">Approved: <strong class="text-positive">15</strong></span>
            </div>
            <div class="q-mb-sm">
              <q-linear-progress size="xs" :value="5 / 25" color="warning" />
              <span class="text-caption">Pending: <strong class="text-warning">5</strong></span>
            </div>
            <div>
              <q-linear-progress size="xs" :value="5 / 25" color="grey" />
              <span class="text-caption">Draft: <strong class="text-grey">5</strong></span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <!-- Header with User Info and Target Period Dropdown -->
    <div class="row justify-between items-center q-mb-xs">
      <div class="col-auto">
        <div class="text-h7 text-green">Employee Metrics</div>
      </div>

      <div class="col-auto">
        <q-select
          v-model="selectedPeriods"
          :options="availablePeriods"
          label="Compare Periods"
          multiple
          dense
          outlined
          color="primary"
          class="target-period-dropdown q-pb-sm"
          @update:model-value="refreshData"
          style="min-width: 220px"
        />
      </div>
    </div>

    <!-- Cards Row -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Elected Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="bg-white shadow-3 full-height clickable-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="verified_user" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">Elected</div>
                <div class="text-h6 text-weight-bold">
                  {{ getChange('Elected') }}
                </div>
                <div
                  v-if="selectedPeriods.length > 1"
                  class="text-caption"
                  :class="getChangeClass(getChangeValue('Elected'))"
                >
                  {{ formatChange(getChangeValue('Elected')) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Appointed Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="bg-white shadow-3 full-height clickable-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="how_to_reg" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">Appointed</div>
                <div class="text-h6 text-weight-bold">
                  {{ getChange('Appointed') }}
                </div>
                <div
                  v-if="selectedPeriods.length > 1"
                  class="text-caption"
                  :class="getChangeClass(getChangeValue('Appointed'))"
                >
                  {{ formatChange(getChangeValue('Appointed')) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Coterminus Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="bg-white shadow-3 full-height clickable-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="work_outline" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">Coterminus</div>
                <div class="text-h6 text-weight-bold">
                  {{ getChange('Coterminus') }}
                </div>
                <div
                  v-if="selectedPeriods.length > 1"
                  class="text-caption"
                  :class="getChangeClass(getChangeValue('Coterminus'))"
                >
                  {{ formatChange(getChangeValue('Coterminus')) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Temporary Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="bg-white shadow-3 full-height clickable-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="hourglass_empty" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">Temporary</div>
                <div class="text-h6 text-weight-bold">
                  {{ getChange('Temporary') }}
                </div>
                <div
                  v-if="selectedPeriods.length > 1"
                  class="text-caption"
                  :class="getChangeClass(getChangeValue('Temporary'))"
                >
                  {{ formatChange(getChangeValue('Temporary')) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Permanent Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="bg-white shadow-3 full-height clickable-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="lock" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">Permanent</div>
                <div class="text-h6 text-weight-bold">
                  {{ getChange('Permanent') }}
                </div>
                <div
                  v-if="selectedPeriods.length > 1"
                  class="text-caption"
                  :class="getChangeClass(getChangeValue('Permanent'))"
                >
                  {{ formatChange(getChangeValue('Permanent')) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Casual Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="bg-white shadow-3 full-height clickable-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="timer" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">Casual</div>
                <div class="text-h6 text-weight-bold">
                  {{ getChange('Casual') }}
                </div>
                <div
                  v-if="selectedPeriods.length > 1"
                  class="text-caption"
                  :class="getChangeClass(getChangeValue('Casual'))"
                >
                  {{ formatChange(getChangeValue('Casual')) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Contract of Service Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="bg-white shadow-3 full-height clickable-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="assignment" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">Contract of Service</div>
                <div class="text-h6 text-weight-bold">
                  {{ getChange('Contract of Service') }}
                </div>
                <div
                  v-if="selectedPeriods.length > 1"
                  class="text-caption"
                  :class="getChangeClass(getChangeValue('Contract of Service'))"
                >
                  {{ formatChange(getChangeValue('Contract of Service')) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Honorarium Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="bg-white shadow-3 full-height clickable-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="loyalty" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">Honorarium</div>
                <div class="text-h6 text-weight-bold">
                  {{ getChange('Honorarium') }}
                </div>
                <div
                  v-if="selectedPeriods.length > 1"
                  class="text-caption"
                  :class="getChangeClass(getChangeValue('Honorarium'))"
                >
                  {{ formatChange(getChangeValue('Honorarium')) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main comparison chart -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Employment Type Distribution</div>
        <div class="text-caption text-grey q-mb-md">
          Comparing {{ selectedPeriods.length }} periods
          <span v-if="selectedPeriods.length > 1">
            (percentage changes from {{ selectedPeriods[selectedPeriods.length - 1].label }} to
            {{ selectedPeriods[0].label }} shown above bars)
          </span>
        </div>

        <div style="height: 400px" class="q-pa-md">
          <bar-chart-comparison :chart-data="employmentChartData" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Detailed comparison table -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Detailed Comparison by Employment Type</div>

        <q-table
          :rows="comparisonTableData"
          :columns="tableColumns"
          row-key="type"
          dense
          flat
          bordered
          class="q-mt-md"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th auto-width>Employment Type</q-th>
              <q-th v-for="period in selectedPeriods" :key="period.value" class="text-center">
                {{ period.label }}
              </q-th>
              <q-th v-if="selectedPeriods.length > 1" class="text-center"> Change </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width class="text-weight-medium">
                {{ props.row.type }}
              </q-td>
              <q-td v-for="period in selectedPeriods" :key="period.value" class="text-center">
                {{ props.row[period.value] }}
              </q-td>
              <q-td v-if="selectedPeriods.length > 1" class="text-center">
                <q-badge
                  :color="getChangeColor(props.row.change)"
                  :label="formatChange(props.row.change)"
                />
              </q-td>
            </q-tr>
          </template>

          <template v-slot:bottom-row>
            <q-tr>
              <q-td class="text-weight-bold">TOTAL</q-td>
              <q_td
                v-for="period in selectedPeriods"
                :key="period.value"
                class="text-center text-weight-bold"
              >
                {{ periodTotals[period.value] }}
              </q_td>
              <q-td v-if="selectedPeriods.length > 1" class="text-center">
                <q-badge :color="getChangeColor(totalChange)" :label="formatChange(totalChange)" />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Period Distribution Pie Charts -->
    <div class="row q-col-gutter-md q-mt-md">
      <div
        v-for="period in selectedPeriods"
        :key="period.value"
        class="col-12 col-md-6"
        v-show="selectedPeriods.length <= 2"
      >
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ period.label }} Distribution</div>
            <div class="text-caption text-grey q-mb-md">
              Total: {{ periodTotals[period.value] }} employees
            </div>

            <div style="height: 300px" class="q-pa-md">
              <pie-chart :chart-data="getPieChartData(period.value)" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import BarChartComparison from 'src/components/hr/BarChart.vue'
import PieChart from 'src/components/hr/PieChart.vue'

export default defineComponent({
  name: 'EmploymentComparisonPage',
  components: {
    BarChartComparison,
    PieChart,
  },

  setup() {
    // Constants for date and user with the exact format requested
    const currentDateTime = ref('2025-07-02 06:08:02')
    const currentUser = ref('dsfsgs')

    // AVAILABLE PERIODS — NOW BY SEMESTER
    const availablePeriods = [
      { label: 'S1 2023', value: 'jan_jun_2023' },
      { label: 'S2 2023', value: 'jul_dec_2023' },
      { label: 'S1 2024', value: 'jan_jun_2024' },
      { label: 'S2 2024', value: 'jul_dec_2024' },
      { label: 'S1 2025', value: 'jan_jun_2025' },
    ]

    // Default selected periods (newest + previous)
    const selectedPeriods = ref([
      availablePeriods[4], // S1 2025
      availablePeriods[3], // S2 2024
    ])

    // Employment types
    const employmentTypes = [
      'Permanent',
      'Temporary',
      'Appointed',
      'Elected',
      'Coterminus',
      'Casual',
      'Contract of Service',
      'Honorarium',
    ]

    // Employment data
    const employmentData = ref({
      jan_jun_2023: {
        Permanent: 243,
        Temporary: 72,
        Appointed: 46,
        Elected: 45,
        Coterminus: 55,
        Casual: 92,
        'Contract of Service': 178,
        Honorarium: 10,
      },
      jul_dec_2023: {
        Permanent: 251,
        Temporary: 76,
        Appointed: 48,
        Elected: 47,
        Coterminus: 59,
        Casual: 96,
        'Contract of Service': 192,
        Honorarium: 12,
      },
      jan_jun_2024: {
        Permanent: 258,
        Temporary: 79,
        Appointed: 48,
        Elected: 47,
        Coterminus: 60,
        Casual: 104,
        'Contract of Service': 205,
        Honorarium: 14,
      },
      jul_dec_2024: {
        Permanent: 265,
        Temporary: 85,
        Appointed: 51,
        Elected: 47,
        Coterminus: 62,
        Casual: 108,
        'Contract of Service': 214,
        Honorarium: 15,
      },
      jan_jun_2025: {
        Permanent: 284,
        Temporary: 94,
        Appointed: 52,
        Elected: 47,
        Coterminus: 56,
        Casual: 124,
        'Contract of Service': 238,
        Honorarium: 18,
      },
    })

    // Update current date/time on mount
    onMounted(() => {
      updateCurrentDateTime()
    })

    const updateCurrentDateTime = () => {
      const now = new Date()
      const year = now.getUTCFullYear()
      const month = String(now.getUTCMonth() + 1).padStart(2, '0')
      const day = String(now.getUTCDate()).padStart(2, '0')
      const hours = String(now.getUTCHours()).padStart(2, '0')
      const minutes = String(now.getUTCMinutes()).padStart(2, '0')
      const seconds = String(now.getUTCSeconds()).padStart(2, '0')

      currentDateTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    const getCurrentData = (type) => {
      if (selectedPeriods.value.length === 0) return 0
      const currentPeriod = selectedPeriods.value[0].value
      return employmentData.value[currentPeriod][type]
    }

    const getChange = (type) => {
      if (selectedPeriods.value.length < 2) return 0

      const firstPeriod = selectedPeriods.value[0].value
      const lastPeriod = selectedPeriods.value[selectedPeriods.value.length - 1].value

      const firstValue = employmentData.value[firstPeriod][type]
      const lastValue = employmentData.value[lastPeriod][type]

      const change = firstValue - lastValue
      return parseInt(change.toFixed(1))
    }

    const getChangeValue = (type) => {
      if (selectedPeriods.value.length < 2) return 0

      const firstPeriod = selectedPeriods.value[0].value
      const lastPeriod = selectedPeriods.value[selectedPeriods.value.length - 1].value

      const firstValue = employmentData.value[firstPeriod][type]
      const lastValue = employmentData.value[lastPeriod][type]

      const change = ((firstValue - lastValue) / lastValue) * 100
      return parseFloat(change.toFixed(1))
    }

    const getChangeClass = (change) => {
      return change >= 0 ? 'text-positive' : 'text-negative'
    }

    const tableColumns = computed(() => {
      const columns = [
        {
          name: 'type',
          label: 'Employment Type',
          field: 'type',
          align: 'left',
          sortable: true,
        },
      ]

      selectedPeriods.value.forEach((period) => {
        columns.push({
          name: period.value,
          label: period.label,
          field: period.value,
          align: 'center',
          sortable: true,
        })
      })

      if (selectedPeriods.value.length > 1) {
        columns.push({
          name: 'change',
          label: 'Change',
          field: 'change',
          align: 'center',
          sortable: true,
        })
      }

      return columns
    })

    const comparisonTableData = computed(() => {
      return employmentTypes.map((type) => {
        const row = {
          type: type,
        }

        selectedPeriods.value.forEach((period) => {
          row[period.value] = employmentData.value[period.value][type]
        })

        if (selectedPeriods.value.length > 1) {
          const firstPeriod = selectedPeriods.value[0].value
          const lastPeriod = selectedPeriods.value[selectedPeriods.value.length - 1].value

          const firstValue = employmentData.value[firstPeriod][type]
          const lastValue = employmentData.value[lastPeriod][type]

          const change = ((firstValue - lastValue) / lastValue) * 100
          row.change = parseFloat(change.toFixed(1))
        }

        return row
      })
    })

    const periodTotals = computed(() => {
      const totals = {}

      selectedPeriods.value.forEach((period) => {
        totals[period.value] = Object.values(employmentData.value[period.value]).reduce(
          (sum, count) => sum + count,
          0,
        )
      })

      return totals
    })

    const totalChange = computed(() => {
      if (selectedPeriods.value.length < 2) return 0

      const firstPeriod = selectedPeriods.value[0].value
      const lastPeriod = selectedPeriods.value[selectedPeriods.value.length - 1].value

      const firstTotal = periodTotals.value[firstPeriod]
      const lastTotal = periodTotals.value[lastPeriod]

      const change = ((firstTotal - lastTotal) / lastTotal) * 100
      return parseFloat(change.toFixed(1))
    })

    const chartColors = [
      '#1976D2',
      '#388E3C',
      '#D32F2F',
      '#FFA000',
      '#7B1FA2',
      '#0097A7',
      '#E64A19',
      '#5D4037',
    ]

    const employmentChartData = computed(() => {
      const labels = employmentTypes
      const datasets = selectedPeriods.value.map((period, index) => {
        return {
          label: period.label,
          backgroundColor: chartColors[index % chartColors.length],
          data: employmentTypes.map((type) => employmentData.value[period.value][type]),
        }
      })

      return { labels, datasets }
    })

    const getPieChartData = (periodValue) => {
      return {
        labels: employmentTypes,
        datasets: [
          {
            backgroundColor: chartColors,
            data: employmentTypes.map((type) => employmentData.value[periodValue][type]),
          },
        ],
      }
    }

    const formatChange = (change) => {
      return `${change > 0 ? '+' : ''}${change}%`
    }

    const getChangeColor = (change) => {
      if (change > 0) return 'positive'
      if (change < 0) return 'negative'
      return 'grey-8'
    }

    const refreshData = () => {
      updateCurrentDateTime()
    }

    return {
      currentDateTime,
      currentUser,
      availablePeriods,
      selectedPeriods,
      tableColumns,
      comparisonTableData,
      employmentChartData,
      periodTotals,
      totalChange,
      getPieChartData,
      formatChange,
      getChangeColor,
      refreshData,
      getCurrentData,
      getChange,
      getChangeValue,
      getChangeClass,
    }
  },
})
</script>

<style lang="scss" scoped>
.target-period-dropdown {
  width: 100%;
  max-width: 300px;
}

.clickable-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.clickable-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.q-page {
  min-height: 100vh;
  width: 100%;
}

.q-card {
  border-radius: 8px;
}

.text-h6 {
  letter-spacing: -0.5px;
}

.full-height {
  height: 100%;
}

.q-mb-lg {
  margin-bottom: 24px;
}

.q-mb-sm {
  margin-bottom: 8px;
}

.text-positive {
  color: #4caf50;
}

.text-negative {
  color: #f44336;
}

@media (max-width: 768px) {
  .text-right {
    text-align: left !important;
    margin-top: 12px;
  }
}
</style>
