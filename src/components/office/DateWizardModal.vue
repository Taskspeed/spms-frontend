<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="date-wizard-modal">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Rate</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-stepper v-model="step" ref="stepper" color="primary" animated flat>
          <!-- Step 1: Date Selection -->
          <q-step :name="1" title="Select Date" icon="event" :done="step > 1" class="date-step">
            <div class="column items-center q-xs-md">
              <div class="text-subtitle1 q-md-md">Choose a date from the calendar</div>

              <!-- Large Calendar -->
              <div class="calendar-container">
                <q-date
                  v-model="selectedDate"
                  :default-year-month="defaultYearMonth"
                  :default-date="currentDate"
                  color="primary"
                  today-btn
                  mask="YYYY-MM-DD"
                  class="full-width big-calendar no-header"
                >
                  <div class="row justify-between q-mt-sm">
                    <div class="text-subtitle2 q-pl-md" v-if="selectedDate">
                      Selected: {{ formattedSelectedDate }}
                    </div>
                  </div>
                </q-date>
              </div>
            </div>
          </q-step>

          <!-- Step 2 -->
          <q-step :name="2" title="Rate your Performance" icon="assignment" :done="step > 2">
            <div class="q-pa-md">
              <p class="text-subtitle1">Rate your Performance</p>
              <p class="text-subtitle2 q-mb-sm">Date selected: {{ formattedSelectedDate }}</p>

              <q-list bordered separator>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Date</q-item-label>
                    <q-item-label>{{ formattedSelectedDate }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Title</q-item-label>
                    <q-item-label>{{ title || 'Not provided' }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Description</q-item-label>
                    <q-item-label>{{ description || 'Not provided' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input v-model="title" label="Title" outlined dense />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="description"
                    label="Description"
                    type="textarea"
                    outlined
                    autogrow
                  />
                </div>
              </div>
            </div>
          </q-step>

          <!-- Step 3 -->
          <q-step :name="3" title="Review" icon="check_circle">
            <div class="q-pa-md">
              <p class="text-h6">Review Your Ratings</p>

              <q-list bordered separator>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Date</q-item-label>
                    <q-item-label>{{ formattedSelectedDate }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Title</q-item-label>
                    <q-item-label>{{ title || 'Not provided' }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Description</q-item-label>
                    <q-item-label>{{ description || 'Not provided' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-step>
        </q-stepper>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          v-if="step > 1"
          flat
          color="grey-7"
          label="Back"
          @click="prevStep"
          :disable="step === 1"
        />
        <q-space />
        <q-btn
          v-if="step < 3"
          color="primary"
          label="Next"
          @click="nextStep"
          :disable="!canContinue"
        />
        <q-btn v-if="step === 3" color="positive" label="Submit" @click="submitForm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'DateWizardModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    // Current date based on the provided timestamp
    const currentDate = '2025-06-18'

    return {
      isOpen: this.value,
      step: 1,
      selectedDate: currentDate,
      currentDate: currentDate,
      defaultYearMonth: '2025/06',
      title: '',
      description: '',
    }
  },
  computed: {
    formattedSelectedDate() {
      if (!this.selectedDate) return ''
      return date.formatDate(this.selectedDate, 'dddd, MMMM D, YYYY')
    },
    canContinue() {
      if (this.step === 1) {
        return !!this.selectedDate
      }
      if (this.step === 2) {
        return !!this.title // Require at least a title to continue
      }
      return true
    },
  },
  watch: {
    value(val) {
      this.isOpen = val
    },
    isOpen(val) {
      this.$emit('input', val)
      if (!val) {
        // Reset form when closing
        setTimeout(() => {
          this.step = 1
          this.title = ''
          this.description = ''
          // Keep the selected date as it was
        }, 300)
      }
    },
  },
  methods: {
    nextStep() {
      if (this.step < 3) {
        this.step++
      }
    },
    prevStep() {
      if (this.step > 1) {
        this.step--
      }
    },
    submitForm() {
      const formData = {
        date: this.selectedDate,
        title: this.title,
        description: this.description,
      }

      this.$emit('submit', formData)
      this.$q.notify({
        color: 'positive',
        message: 'Form submitted successfully!',
        icon: 'check_circle',
      })
      this.isOpen = false
    },
  },
}
</script>

<style lang="scss" scoped>
.date-wizard-modal {
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.calendar-container {
  width: 100%;
  margin: 0 auto;
}

.big-calendar {
  :deep(.q-date__content) {
    font-size: 1em;
  }

  :deep(.q-date__calendar-item) {
    font-size: 1em;
  }

  :deep(.q-date__calendar-item div) {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.q-date__header) {
    display: none !important; /* Remove the blue header */
  }

  :deep(.q-date__navigation div) {
    font-size: 1.1em;
  }

  /* Add margin to the top to compensate for the removed header */
  :deep(.q-date__content) {
    margin-top: 8px;
  }
}

/* For larger screens, make the calendar a bit bigger */
@media (min-width: 1024px) {
  .big-calendar {
    :deep(.q-date__calendar-item div) {
      width: 45px;
      height: 45px;
    }
  }
}

.date-step {
  min-height: 400px;
}
</style>
