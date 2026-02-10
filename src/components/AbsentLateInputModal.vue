<!-- AbsentLateInputModal.vue -->
<template>
  <q-dialog v-model="showModal" persistent>
    <q-card>
      <!-- Header -->
      <q-card-section class="bg-green-9 text-white">
        <div class="text-h6">{{ employeeName }}</div>
        <div class="text-subtitle2">{{ targetPeriodLabel }}</div>
      </q-card-section>

      <!-- Tabs -->
      <q-tabs
        v-model="activeMonth"
        dense
        class="text-grey"
        active-color="green-9"
        indicator-color="green-9"
        align="justify"
      >
        <q-tab
          v-for="month in displayMonths"
          :key="month.value"
          :name="month.value"
          :label="month.short"
        />
      </q-tabs>

      <q-separator />

      <!-- Content -->
      <q-tab-panels v-model="activeMonth" animated>
        <q-tab-panel v-for="month in displayMonths" :key="month.value" :name="month.value">
          <div class="q-gutter-md">
            <!-- Absent Days -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle2 text-weight-medium q-mb-md">Absent (Days)</div>
                <div class="row items-center justify-center q-gutter-md">
                  <div
                    v-for="week in 5"
                    :key="`absent-${week}`"
                    class="col-xs-6 col-sm-4 col-md-2 col"
                  >
                    <q-input
                      v-model="data[month.value].absent[week - 1]"
                      type="text"
                      outlined
                      dense
                      :label="`Wk ${week}`"
                      input-class="text-center"
                      @update:model-value="validateNumber($event, month.value, 'absent', week - 1)"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Late Minutes -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle2 text-weight-medium q-mb-md">Late (Minutes)</div>
                <div class="row items-center justify-center q-gutter-md">
                  <div
                    v-for="week in 5"
                    :key="`late-${week}`"
                    class="col-xs-6 col-sm-4 col-md-2 col"
                  >
                    <q-input
                      v-model="data[month.value].late[week - 1]"
                      type="text"
                      outlined
                      dense
                      :label="`Wk ${week}`"
                      suffix="min"
                      input-class="text-center"
                      @update:model-value="validateNumber($event, month.value, 'late', week - 1)"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Summary -->
            <q-card flat bordered class="bg-grey-2">
              <q-card-section class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="text-caption text-grey-7">Total Absent</div>
                  <div class="text-h5 text-weight-bold">{{ getTotalAbsent(month.value) }}</div>
                  <div class="text-caption">days</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Total Late</div>
                  <div class="text-h5 text-weight-bold">{{ getTotalLate(month.value) }}</div>
                  <div class="text-caption">
                    minutes ({{ formatMinutesToHours(getTotalLate(month.value)) }})
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <!-- Actions -->
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn unelevated label="Save" color="green-9" @click="save" :loading="saving" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

// Props
const props = defineProps({
  employee: Object,
  targetPeriod: Object,
  existingData: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['save', 'close'])
const $q = useQuasar()

// State
const showModal = ref(false)
const activeMonth = ref('')
const saving = ref(false)
const data = ref({})

// Constants
const MONTHS = [
  { value: 'jan', label: 'January', short: 'Jan' },
  { value: 'feb', label: 'February', short: 'Feb' },
  { value: 'mar', label: 'March', short: 'Mar' },
  { value: 'apr', label: 'April', short: 'Apr' },
  { value: 'may', label: 'May', short: 'May' },
  { value: 'jun', label: 'June', short: 'Jun' },
  { value: 'jul', label: 'July', short: 'Jul' },
  { value: 'aug', label: 'August', short: 'Aug' },
  { value: 'sep', label: 'September', short: 'Sep' },
  { value: 'oct', label: 'October', short: 'Oct' },
  { value: 'nov', label: 'November', short: 'Nov' },
  { value: 'dec', label: 'December', short: 'Dec' },
]

// Computed
const employeeName = computed(() => props.employee?.label || props.employee?.name || '')
const targetPeriodLabel = computed(
  () => `${props.targetPeriod?.semester || ''} ${props.targetPeriod?.year || ''}`,
)

const displayMonths = computed(() => {
  const semester = props.targetPeriod?.semester || ''

  // Handle "First Semester" or "Second Semester" format
  if (semester === 'First Semester') return MONTHS.slice(0, 6)
  if (semester === 'Second Semester') return MONTHS.slice(6)

  // Handle "January-June 2026" or "July-December 2026" format
  if (semester.includes('-')) {
    const [startMonth, endPart] = semester.split('-')
    const endMonth = endPart.split(' ')[0] // Remove year

    const startIdx = MONTHS.findIndex(
      (m) => m.label.toLowerCase() === startMonth.trim().toLowerCase(),
    )
    const endIdx = MONTHS.findIndex((m) => m.label.toLowerCase() === endMonth.trim().toLowerCase())

    if (startIdx !== -1 && endIdx !== -1) {
      return MONTHS.slice(startIdx, endIdx + 1)
    }
  }

  return MONTHS
})

// Methods
const init = () => {
  const temp = {}
  displayMonths.value.forEach((m) => {
    const existing = props.existingData?.[m.label]
    temp[m.value] = {
      absent: Array(5)
        .fill(null)
        .map((_, i) => {
          const val = existing?.[i]?.absent
          return val !== undefined && val !== null ? String(val) : ''
        }),
      late: Array(5)
        .fill(null)
        .map((_, i) => {
          const val = existing?.[i]?.late
          return val !== undefined && val !== null ? String(val) : ''
        }),
    }
  })
  data.value = temp
  activeMonth.value = displayMonths.value[0]?.value || ''
}

const validateNumber = (value, month, type, index) => {
  // Allow empty string
  if (value === '' || value === null || value === undefined) {
    data.value[month][type][index] = ''
    return
  }

  // Only allow numbers and decimal point
  const cleaned = String(value).replace(/[^\d.]/g, '')

  // Prevent multiple decimal points
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    data.value[month][type][index] = parts[0] + '.' + parts.slice(1).join('')
    return
  }

  data.value[month][type][index] = cleaned
}

const parseValue = (val) => {
  if (val === '' || val === null || val === undefined) return 0
  const parsed = parseFloat(val)
  return isNaN(parsed) ? 0 : parsed
}

const getTotalAbsent = (month) => {
  return data.value[month]?.absent.reduce((sum, val) => sum + parseValue(val), 0) || 0
}

const getTotalLate = (month) => {
  return data.value[month]?.late.reduce((sum, val) => sum + parseValue(val), 0) || 0
}

const formatMinutesToHours = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

const validate = () => {
  const errors = []
  displayMonths.value.forEach((month) => {
    const d = data.value[month.value]
    d.absent.forEach((val, i) => {
      const num = parseValue(val)
      if (num < 0) errors.push(`${month.label} Week ${i + 1}: Days cannot be negative`)
      if (num > 31) errors.push(`${month.label} Week ${i + 1}: Days cannot exceed 31`)
    })
    d.late.forEach((val, i) => {
      const num = parseValue(val)
      if (num < 0) errors.push(`${month.label} Week ${i + 1}: Minutes cannot be negative`)
    })
  })
  return errors
}

const save = () => {
  const errors = validate()
  if (errors.length) {
    $q.notify({ type: 'negative', message: errors.join('\n'), position: 'top' })
    return
  }

  saving.value = true

  const result = {}

  displayMonths.value.forEach((month) => {
    const monthData = []

    for (let i = 0; i < 5; i++) {
      const absentVal = parseValue(data.value[month.value].absent[i])
      const lateVal = parseValue(data.value[month.value].late[i])

      monthData.push({
        [`Wk${i + 1}`]: {
          absent: absentVal,
          late: lateVal,
        },
      })
    }

    result[month.label] = monthData
  })

  emit('save', {
    employeeId: props.employee?.id,
    controlNo: props.employee?.controlNo || props.employee?.employeeData?.ControlNo,
    targetPeriod: props.targetPeriod,
    attendanceData: result,
    timestamp: new Date().toISOString(),
  })

  $q.notify({ type: 'positive', message: 'Saved successfully!', position: 'top' })
  saving.value = false
  showModal.value = false
}

const openModal = () => {
  init()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  emit('close')
}

defineExpose({ openModal, closeModal })
</script>

<style scoped>
.q-input :deep(input[type='text']) {
  text-align: center;
}
</style>
