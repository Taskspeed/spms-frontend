<!-- src/components/BarChartComparison.vue -->
<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

export default defineComponent({
  name: 'BarChartComparison',
  props: {
    chartData: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const chartRef = ref(null)
    let chart = null

    const renderChart = () => {
      if (chart) {
        chart.destroy()
      }

      const ctx = chartRef.value.getContext('2d')

      chart = new Chart(ctx, {
        type: 'bar',
        data: props.chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || ''
                  if (label) {
                    label += ': '
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y + ' employees'
                  }
                  return label
                },
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Employees',
              },
            },
          },
        },
      })
    }

    onMounted(() => {
      renderChart()
    })

    watch(
      () => props.chartData,
      () => {
        renderChart()
      },
      { deep: true },
    )

    return {
      chartRef,
    }
  },
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
