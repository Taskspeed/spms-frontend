<!-- src/components/PieChart.vue -->
<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

export default defineComponent({
  name: 'PieChart',
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
        type: 'pie',
        data: props.chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 15,
                padding: 15,
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || ''
                  const value = context.parsed || 0
                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0)
                  const percentage = Math.round((value / total) * 100)
                  return `${label}: ${value} (${percentage}%)`
                },
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
