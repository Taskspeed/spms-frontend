<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page padding>
    <!-- Header with Target Period Dropdown -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h6 class="text-h6 q-mb-xs text-green text-weight-bold">Performance Dashboard</h6>
        <div class="text-subtitle3 text-grey-8">
          <q-select
            v-model="selectedPeriod"
            :options="periodOptions"
            label="Select Target Period"
            dense
            outlined
            color="primary"
            class="target-period-dropdown"
            @update:model-value="updateData"
          />
        </div>
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
                <div class="text-h6 text-weight-bold">{{ currentData.elected }}</div>
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
                <div class="text-h6 text-weight-bold">{{ currentData.appointed }}</div>
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
                <div class="text-h6 text-weight-bold">{{ currentData.coterminus }}</div>
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
                <div class="text-h6 text-weight-bold">{{ currentData.temporary }}</div>
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
                <div class="text-h6 text-weight-bold">{{ currentData.permanent }}</div>
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
                <div class="text-h6 text-weight-bold">{{ currentData.casual }}</div>
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
                <div class="text-h6 text-weight-bold">{{ currentData.contract }}</div>
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
                <div class="text-h6 text-weight-bold">{{ currentData.honorarium }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Comparative Line Chart -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-xs-12">
        <q-card class="bg-white shadow-3">
          <q-card-section class="q-pa-md">
            <div class="text-h6 text-center q-mb-md">Employee Status Comparison Across Periods</div>
            <canvas id="lineChart" height="400"></canvas>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Percentage Changes Section -->
    <div class="row q-col-gutter-md">
      <div class="col-xs-12">
        <q-card class="bg-white shadow-3">
          <q-card-section class="q-pa-md">
            <div class="text-h6 text-center q-mb-md">Percentage Changes From Previous Period</div>
            <div class="row q-col-gutter-md">
              <!-- Elected Percentage -->
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="percentage-change text-center">
                  <div
                    class="text-h5"
                    :class="percentageChange.elected >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    {{ percentageChange.elected >= 0 ? '+' : '' }}{{ percentageChange.elected }}%
                  </div>
                  <div class="text-h6">{{ currentData.elected }}</div>
                  <div class="text-subtitle2 text-grey-7">Elected</div>
                </div>
              </div>

              <!-- Appointed Percentage -->
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="percentage-change text-center">
                  <div
                    class="text-h5"
                    :class="percentageChange.appointed >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    {{ percentageChange.appointed >= 0 ? '+' : ''
                    }}{{ percentageChange.appointed }}%
                  </div>
                  <div class="text-h6">{{ currentData.appointed }}</div>
                  <div class="text-subtitle2 text-grey-7">Appointed</div>
                </div>
              </div>

              <!-- Coterminus Percentage -->
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="percentage-change text-center">
                  <div
                    class="text-h5"
                    :class="percentageChange.coterminus >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    {{ percentageChange.coterminus >= 0 ? '+' : ''
                    }}{{ percentageChange.coterminus }}%
                  </div>
                  <div class="text-h6">{{ currentData.coterminus }}</div>
                  <div class="text-subtitle2 text-grey-7">Coterminus</div>
                </div>
              </div>

              <!-- Temporary Percentage -->
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="percentage-change text-center">
                  <div
                    class="text-h5"
                    :class="percentageChange.temporary >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    {{ percentageChange.temporary >= 0 ? '+' : ''
                    }}{{ percentageChange.temporary }}%
                  </div>
                  <div class="text-h6">{{ currentData.temporary }}</div>
                  <div class="text-subtitle2 text-grey-7">Temporary</div>
                </div>
              </div>

              <!-- Permanent Percentage -->
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="percentage-change text-center">
                  <div
                    class="text-h5"
                    :class="percentageChange.permanent >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    {{ percentageChange.permanent >= 0 ? '+' : ''
                    }}{{ percentageChange.permanent }}%
                  </div>
                  <div class="text-h6">{{ currentData.permanent }}</div>
                  <div class="text-subtitle2 text-grey-7">Permanent</div>
                </div>
              </div>

              <!-- Casual Percentage -->
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="percentage-change text-center">
                  <div
                    class="text-h5"
                    :class="percentageChange.casual >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    {{ percentageChange.casual >= 0 ? '+' : '' }}{{ percentageChange.casual }}%
                  </div>
                  <div class="text-h6">{{ currentData.casual }}</div>
                  <div class="text-subtitle2 text-grey-7">Casual</div>
                </div>
              </div>

              <!-- Contract of Service Percentage -->
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="percentage-change text-center">
                  <div
                    class="text-h5"
                    :class="percentageChange.contract >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    {{ percentageChange.contract >= 0 ? '+' : '' }}{{ percentageChange.contract }}%
                  </div>
                  <div class="text-h6">{{ currentData.contract }}</div>
                  <div class="text-subtitle2 text-grey-7">Contract of Service</div>
                </div>
              </div>

              <!-- Honorarium Percentage -->
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="percentage-change text-center">
                  <div
                    class="text-h5"
                    :class="percentageChange.honorarium >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    {{ percentageChange.honorarium >= 0 ? '+' : ''
                    }}{{ percentageChange.honorarium }}%
                  </div>
                  <div class="text-h6">{{ currentData.honorarium }}</div>
                  <div class="text-subtitle2 text-grey-7">Honorarium</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import Chart from 'chart.js/auto'

// Target period dropdown options
const periodOptions = [
  'January - June 2025',
  'July - December 2025',
  'January - June 2026',
  'July - December 2026',
]

// Selected period
const selectedPeriod = ref(periodOptions[0])

// Chart reference
let chartInstance = ref(null)

// Complete dataset for all periods and statuses
const employmentStatusData = {
  'January - June 2025': {
    elected: 8,
    appointed: 90,
    coterminus: 20,
    temporary: 45,
    permanent: 140,
    casual: 35,
    contract: 25,
    honorarium: 25,
    total: 388,
  },
  'July - December 2025': {
    elected: 10,
    appointed: 100,
    coterminus: 25,
    temporary: 50,
    permanent: 150,
    casual: 40,
    contract: 30,
    honorarium: 30,
    total: 435,
  },
  'January - June 2026': {
    elected: 12,
    appointed: 110,
    coterminus: 30,
    temporary: 55,
    permanent: 160,
    casual: 45,
    contract: 35,
    honorarium: 35,
    total: 482,
  },
  'July - December 2026': {
    elected: 15,
    appointed: 120,
    coterminus: 35,
    temporary: 60,
    permanent: 170,
    casual: 50,
    contract: 40,
    honorarium: 40,
    total: 530,
  },
}

// Current data based on selected period
const currentData = ref({ ...employmentStatusData[selectedPeriod.value] })
const previousData = computed(() => {
  const currentIndex = periodOptions.indexOf(selectedPeriod.value)
  return currentIndex > 0 ? employmentStatusData[periodOptions[currentIndex - 1]] : null
})

// Calculate percentage changes
const percentageChange = computed(() => {
  if (!previousData.value) {
    return {
      elected: 0,
      appointed: 0,
      coterminus: 0,
      temporary: 0,
      permanent: 0,
      casual: 0,
      contract: 0,
      honorarium: 0,
    }
  }

  return {
    elected: calculatePercentageChange('elected'),
    appointed: calculatePercentageChange('appointed'),
    coterminus: calculatePercentageChange('coterminus'),
    temporary: calculatePercentageChange('temporary'),
    permanent: calculatePercentageChange('permanent'),
    casual: calculatePercentageChange('casual'),
    contract: calculatePercentageChange('contract'),
    honorarium: calculatePercentageChange('honorarium'),
  }
})

function calculatePercentageChange(status) {
  const prev = previousData.value[status]
  const curr = currentData.value[status]
  return Math.round(((curr - prev) / prev) * 100)
}

// Update data when period changes
function updateData() {
  currentData.value = { ...employmentStatusData[selectedPeriod.value] }
  if (chartInstance.value) {
    chartInstance.value.update()
  }
}

// Colors for each line
const lineColors = [
  '#1976D2', // Elected - blue
  '#FF9800', // Appointed - orange
  '#4CAF50', // Coterminus - green
  '#9C27B0', // Temporary - purple
  '#F44336', // Permanent - red
  '#00BCD4', // Casual - cyan
  '#607D8B', // Contract of Service - gray
  '#FFC107', // Honorarium - amber
]

// Initialize the comparative line chart
const initChart = () => {
  const ctx = document.getElementById('lineChart')

  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: periodOptions,
      datasets: [
        'elected',
        'appointed',
        'coterminus',
        'temporary',
        'permanent',
        'casual',
        'contract',
        'honorarium',
      ].map((status, index) => {
        let statusName = status.charAt(0).toUpperCase() + status.slice(1)
        if (status === 'contract') {
          statusName = 'Contract of Service'
        }

        return {
          label: statusName,
          data: periodOptions.map((period) => employmentStatusData[period][status]),
          borderColor: lineColors[index],
          backgroundColor: lineColors[index] + '40',
          tension: 0.3,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 7,
        }
      }),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = employmentStatusData[context.label].total
              const percentage = ((context.raw / total) * 100).toFixed(1)
              return `${context.dataset.label}: ${context.raw} (${percentage}%)`
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Target Periods',
            font: {
              weight: 'bold',
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'Number of Employees',
            font: {
              weight: 'bold',
            },
          },
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  })
}

// Initialize chart on mount
onMounted(() => {
  initChart()

  // Add resize observer
  const resizeObserver = new ResizeObserver(() => {
    if (chartInstance.value) {
      chartInstance.value.resize()
    }
  })

  const chartContainer = document.getElementById('lineChart').parentElement
  if (chartContainer) {
    resizeObserver.observe(chartContainer)
  }

  // Store the observer for cleanup
  chartInstance.value.resizeObserver = resizeObserver
})

// Clean up before unmount
onBeforeUnmount(() => {
  if (chartInstance.value) {
    if (chartInstance.value.resizeObserver) {
      chartInstance.value.resizeObserver.disconnect()
    }
    chartInstance.value.destroy()
  }
})
</script>

<style scoped>
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

.text-h4 {
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

.target-period-dropdown {
  width: 300px;
}

.text-positive {
  color: #4caf50;
}

.text-negative {
  color: #f44336;
}

.percentage-change {
  padding: 16px;
  border-radius: 8px;
  background-color: #f5f5f5;
}

#lineChart {
  width: 100% !important;
  height: 400px !important;
  min-height: 400px;
}
</style>
