<template>
  <q-dialog
    v-model="isOpen"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="date-wizard-modal">
      <!-- Header -->
      <q-card-section class="header">
        <span class="text-h6">{{ stepTitle }}</span>
        <q-btn icon="close" flat round dense @click="confirmClose" />
      </q-card-section>

      <!-- Progress -->
      <q-linear-progress :value="step / 3" color="primary" />
      <div class="stepper-nav">
        <q-chip
          :color="step >= 1 ? 'blue-4' : 'grey-4'"
          :text-color="step >= 1 ? 'white' : 'grey-7'"
          icon="event"
          size="md"
        >
          1. Select Date
        </q-chip>
        <q-chip
          :color="step >= 2 ? 'blue-4' : 'grey-4'"
          :text-color="step >= 2 ? 'white' : 'grey-7'"
          icon="assignment"
          size="md"
        >
          2. Rate Performance
        </q-chip>
        <q-chip
          :color="step >= 3 ? 'blue-4' : 'grey-4'"
          :text-color="step >= 3 ? 'white' : 'grey-7'"
          icon="check_circle"
          size="md"
        >
          3. Review
        </q-chip>
      </div>

      <!-- Content -->
      <q-card-section class="content">
        <!-- STEP 1: Date Selection -->
        <div v-if="step === 1" class="step-container">
          <div class="title">Choose a Date to Rate Performance</div>
          <p class="text-grey-7">
            Select the date for which you want to submit your performance rating
          </p>

          <div class="date-section">
            <q-date
              v-model="selectedDate"
              color="primary"
              today-btn
              mask="YYYY-MM-DD"
              class="calendar"
            />
          </div>
        </div>

        <!-- STEP 2: Performance Standards -->
        <div v-else-if="step === 2">
          <div class="title">Rate Your Performance Standards</div>

          <!-- Performance Standards List -->
          <q-card
            v-for="(standard, index) in sampleData.performanceStandards"
            :key="'standard-' + index"
            flat
            bordered
            class="standard-card"
          >
            <q-card-section class="standard-header" @click="standard.expanded = !standard.expanded">
              <div class="header-content">
                <span>Performance Standard {{ index + 1 }}: {{ standard.category }}</span>
                <q-badge v-if="isStandardComplete(standard)" color="positive" class="q-ml-sm">
                  Complete
                </q-badge>
              </div>
              <q-icon :name="standard.expanded ? 'expand_less' : 'expand_more'" />
            </q-card-section>

            <q-slide-transition>
              <div v-show="standard.expanded" class="standard-body">
                <!-- Standard Outcome Table -->
                <!-- <div class="section-title">Standard Outcome Reference</div> -->
                <q-table
                  :rows="standard.standardOutcomeRows"
                  :columns="columns"
                  row-key="rating"
                  hide-bottom
                  flat
                  dense
                  bordered
                  :rows-per-page-options="[0]"
                  class="q-mb-md outcome-table"
                />

                <!-- Details Grid - MFO, Success Indicators, Competencies in same row -->
                <!-- <div class="section-title">Details & Competencies</div> -->
                <div class="details-grid-three">
                  <!-- MFO Details -->
                  <q-card flat bordered>
                    <q-card-section class="bg-grey-2 q-pa-sm">
                      <strong>MFO Details</strong>
                    </q-card-section>
                    <q-card-section>
                      <div class="detail-item">
                        <small>Category</small>
                        <span style="font-size: small">{{ standard.category }}</span>
                      </div>
                      <div class="detail-item">
                        <small>MFO</small>
                        <span style="font-size: small">{{ standard.mfo }}</span>
                      </div>
                      <div class="detail-item">
                        <small>Output</small>
                        <span style="font-size: small">{{ standard.output }}</span>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- Success Indicators -->
                  <q-card flat bordered>
                    <q-card-section class="bg-grey-2 q-pa-sm">
                      <strong>Success Indicators</strong>
                    </q-card-section>
                    <q-card-section>
                      <div class="detail-item">
                        <small>Output Name</small>
                        <span style="font-size: small">{{ standard.outputName }}</span>
                      </div>
                      <div class="detail-item">
                        <small>Performance Indicator</small>
                        <span style="font-size: small">{{ standard.indicatorName }}</span>
                      </div>
                      <div class="detail-item">
                        <small>Success Indicator</small>
                        <span style="font-size: small">{{ standard.successIndicator }}</span>
                      </div>
                      <div class="detail-item">
                        <small>Required Output</small>
                        <span style="font-size: small">{{ standard.requiredOutput }}</span>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- Competencies -->
                  <q-card flat bordered>
                    <q-card-section class="bg-grey-2 q-pa-sm">
                      <strong>Competencies</strong>
                    </q-card-section>
                    <q-card-section>
                      <div class="detail-item">
                        <small>Core</small>
                        <span v-if="standard.competencies.core.length">
                          {{
                            standard.competencies.core.map((c) => `${c.code}-${c.level}`).join(', ')
                          }}
                        </span>
                        <span v-else class="text-grey-5">None</span>
                      </div>
                      <div class="detail-item">
                        <small>Technical</small>
                        <span v-if="standard.competencies.technical.length">
                          {{
                            standard.competencies.technical
                              .map((c) => `${c.code}-${c.level}`)
                              .join(', ')
                          }}
                        </span>
                        <span v-else class="text-grey-5">None</span>
                      </div>
                      <div class="detail-item">
                        <small>Leadership</small>
                        <span v-if="standard.competencies.leadership.length">
                          {{
                            standard.competencies.leadership
                              .map((c) => `${c.code}-${c.level}`)
                              .join(', ')
                          }}
                        </span>
                        <span v-else class="text-grey-5">None</span>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Performance Inputs - USER INPUT SECTION -->
                <div class="section-title">
                  <q-icon name="edit" class="q-mr-sm" />
                  Enter Your Performance Data
                </div>
                <q-card flat bordered class="input-card">
                  <q-card-section>
                    <div class="inputs-grid">
                      <q-input
                        v-model="standard.inputs.quantity"
                        label="Quantity *"
                        type="number"
                        outlined
                        dense
                        :rules="[(val) => !!val || 'Quantity is required']"
                      >
                        <template #prepend>
                          <q-icon name="format_list_numbered" color="primary" />
                        </template>
                      </q-input>

                      <q-input
                        v-model="standard.inputs.effectiveness"
                        label="Effectiveness *"
                        type="textarea"
                        outlined
                        dense
                        autogrow
                        :rules="[(val) => !!val || 'Effectiveness is required']"
                      >
                        <template #prepend>
                          <q-icon name="check_circle" color="primary" />
                        </template>
                      </q-input>

                      <q-input
                        v-model="standard.inputs.timeliness"
                        label="Timeliness *"
                        type="textarea"
                        outlined
                        dense
                        autogrow
                        :rules="[(val) => !!val || 'Timeliness is required']"
                      >
                        <template #prepend>
                          <q-icon name="schedule" color="primary" />
                        </template>
                      </q-input>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </q-slide-transition>
          </q-card>

          <!-- Progress Indicator -->
          <q-card flat bordered class="q-mt-md bg-grey-1">
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <strong>Completion Progress</strong>
                  <div class="text-caption text-grey-7">
                    {{ completedStandards }} of
                    {{ sampleData.performanceStandards.length }} standards completed
                  </div>
                </div>
                <q-circular-progress
                  :value="completionPercentage"
                  size="50px"
                  :thickness="0.2"
                  color="primary"
                  track-color="grey-3"
                  show-value
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- STEP 3: Review -->
        <div v-else-if="step === 3">
          <div class="title">Review Your Submission</div>
          <p class="text-grey-7">Please review all information before final submission</p>

          <q-banner class="bg-blue-1 q-mb-md" rounded>
            <template #avatar><q-icon name="info" color="primary" /></template>
            <div>
              <strong>Submission Summary</strong>
              <div>
                You are about to submit performance ratings for
                <strong>{{ formattedSelectedDate }}</strong>
              </div>
            </div>
          </q-banner>

          <!-- Review Info -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="bg-grey-2 q-pa-sm">
              <strong>Rating Information</strong>
            </q-card-section>
            <q-card-section>
              <div class="info-grid">
                <div class="info-item">
                  <small>Target Period</small>
                  <span>{{ sampleData.targetPeriod }}</span>
                </div>
                <div class="info-item">
                  <small>Selected Date</small>
                  <span>{{ formattedSelectedDate }}</span>
                </div>
                <div class="info-item">
                  <small>Employee</small>
                  <span>{{ sampleData.employee.name }}</span>
                </div>
                <div class="info-item">
                  <small>Position</small>
                  <span>{{ sampleData.employee.position }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Performance Standards Summary -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="bg-grey-2 q-pa-sm">
              <strong>Performance Standards Summary</strong>
            </q-card-section>
            <q-list separator>
              <q-item
                v-for="(std, i) in sampleData.performanceStandards"
                :key="'review-' + i"
                class="review-item-block"
              >
                <q-item-section>
                  <q-item-label class="row items-center">
                    <span class="text-weight-bold">Standard {{ i + 1 }}: {{ std.category }}</span>
                    <q-badge
                      :color="isStandardComplete(std) ? 'positive' : 'negative'"
                      class="q-ml-sm"
                    >
                      {{ isStandardComplete(std) ? 'Complete' : 'Incomplete' }}
                    </q-badge>
                  </q-item-label>
                  <q-item-label caption class="q-mb-sm">{{ std.output }}</q-item-label>

                  <div class="review-values">
                    <div class="review-value-item">
                      <small>Quantity</small>
                      <span :class="{ 'text-negative': !std.inputs.quantity }">
                        {{ std.inputs.quantity || 'Not provided' }}
                      </span>
                    </div>
                    <div class="review-value-item">
                      <small>Effectiveness</small>
                      <span :class="{ 'text-negative': !std.inputs.effectiveness }">
                        {{ std.inputs.effectiveness || 'Not provided' }}
                      </span>
                    </div>
                    <div class="review-value-item">
                      <small>Timeliness</small>
                      <span :class="{ 'text-negative': !std.inputs.timeliness }">
                        {{ std.inputs.timeliness || 'Not provided' }}
                      </span>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>

          <!-- Warning -->
          <q-banner class="bg-orange-1 q-mb-md" rounded>
            <template #avatar><q-icon name="warning" color="warning" /></template>
            <div>
              <strong>Important Notice</strong>
              <div>
                Once submitted, this rating cannot be easily modified. Please ensure all information
                is accurate.
              </div>
            </div>
          </q-banner>

          <!-- Final Completion Status -->
          <q-card flat bordered :class="allStandardsComplete ? 'bg-green-1' : 'bg-red-1'">
            <q-card-section>
              <div class="row items-center">
                <q-icon
                  :name="allStandardsComplete ? 'check_circle' : 'error'"
                  :color="allStandardsComplete ? 'positive' : 'negative'"
                  size="md"
                  class="q-mr-md"
                />
                <div>
                  <strong>{{
                    allStandardsComplete ? 'Ready to Submit' : 'Incomplete Submission'
                  }}</strong>
                  <div class="text-caption">
                    {{
                      allStandardsComplete
                        ? 'All performance standards have been completed.'
                        : "Some performance standards are incomplete.  You can still submit, but it's recommended to complete all fields."
                    }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="actions">
        <q-btn v-if="step > 1" flat color="grey-7" label="Back" icon="arrow_back" @click="step--" />
        <q-btn v-else flat color="grey-7" label="Cancel" @click="confirmClose" />
        <q-space />
        <q-btn
          v-if="step < 3"
          color="primary"
          :label="step === 1 ? 'Continue to Rate' : 'Review Submission'"
          :icon-right="'arrow_forward'"
          :disable="!canProceed"
          @click="step++"
        />
        <q-btn v-else color="positive" label="Submit Rating" icon="send" @click="submitForm" />
      </q-card-actions>

      <!-- Confirmation Dialog -->
      <q-dialog v-model="showConfirmDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <q-icon name="warning" color="warning" size="md" class="q-mr-sm" />
            <span class="text-h6">Confirm Close</span>
          </q-card-section>

          <q-card-section>
            Are you sure you want to close? Any unsaved changes will be lost.
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="grey-7" v-close-popup />
            <q-btn flat label="Close" color="negative" @click="forceClose" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Submit Confirmation Dialog -->
      <q-dialog v-model="showSubmitDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <q-icon
              :name="allStandardsComplete ? 'check_circle' : 'warning'"
              :color="allStandardsComplete ? 'positive' : 'warning'"
              size="md"
              class="q-mr-sm"
            />
            <span class="text-h6">Confirm Submission</span>
          </q-card-section>

          <q-card-section>
            {{
              allStandardsComplete
                ? 'Are you sure you want to submit these performance ratings?'
                : 'Some standards are incomplete. Do you still want to submit?'
            }}
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="grey-7" v-close-popup />
            <q-btn flat label="Submit" color="positive" @click="doSubmit" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>
  </q-dialog>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'DateWizardModal',

  props: {
    modelValue: { type: Boolean, default: false },
  },

  emits: ['update:modelValue', 'submit'],

  data() {
    return {
      isOpen: this.modelValue,
      step: 1,
      selectedDate: null,
      showConfirmDialog: false,
      showSubmitDialog: false,
      columns: [
        {
          name: 'rating',
          label: 'Rating',
          field: 'rating',
          align: 'center',
          style: 'width: 10%; font-weight: bold;',
        },
        {
          name: 'quantity',
          label: 'Quantity',
          field: 'quantity',
          align: 'center',
          style: 'width: 30%',
        },
        {
          name: 'effectiveness',
          label: 'Effectiveness',
          field: 'effectiveness',
          align: 'center',
          style: 'width: 30%',
        },
        {
          name: 'timeliness',
          label: 'Timeliness',
          field: 'timeliness',
          align: 'center',
          style: 'width: 30%',
        },
      ],
      sampleData: {
        targetPeriod: 'January - June 2025',
        status: 'In Progress',
        ratingId: 1042,
        employee: {
          name: 'Juan Dela Cruz',
          position: 'Software Engineer II',
          rank: 'Technical Function',
          department: 'Information Technology',
        },
        performanceStandards: [
          {
            expanded: true,
            category: 'Strategic Function',
            mfo: 'MFO-001: IT Infrastructure Management',
            output: 'Maintain 99.9% system uptime',
            outputName: 'System Availability Report',
            indicatorName: 'Uptime Percentage',
            successIndicator: 'Achieve 99.9% uptime monthly',
            requiredOutput: 'Monthly uptime report with analysis',
            standardOutcomeRows: [
              {
                rating: 5,
                quantity: '100%',
                effectiveness: 'Zero downtime',
                timeliness: 'Within 24 hours',
              },
              {
                rating: 4,
                quantity: '99.9%',
                effectiveness: 'Minor issues resolved quickly',
                timeliness: 'Within 48 hours',
              },
              {
                rating: 3,
                quantity: '99. 5%',
                effectiveness: 'Issues resolved with minimal impact',
                timeliness: 'Within 72 hours',
              },
              {
                rating: 2,
                quantity: '99%',
                effectiveness: 'Some service disruption',
                timeliness: 'Within 1 week',
              },
              {
                rating: 1,
                quantity: 'Below 99%',
                effectiveness: 'Significant service disruption',
                timeliness: 'More than 1 week',
              },
            ],
            competencies: {
              core: [
                { code: 'CC', level: 3 },
                { code: 'CC', level: 2 },
              ],
              technical: [
                { code: 'TC', level: 4 },
                { code: 'TC', level: 3 },
              ],
              leadership: [],
            },
            inputs: { quantity: '', effectiveness: '', timeliness: '' },
          },
          {
            expanded: false,
            category: 'Core Function',
            mfo: 'MFO-002: Software Development',
            output: 'Deliver quality software solutions',
            outputName: 'Completed Software Modules',
            indicatorName: 'Code Quality Score',
            successIndicator: 'Maintain code quality score above 85%',
            requiredOutput: 'Functional software modules with documentation',
            standardOutcomeRows: [
              {
                rating: 5,
                quantity: '10+ modules',
                effectiveness: '95%+ quality score',
                timeliness: 'Before deadline',
              },
              {
                rating: 4,
                quantity: '8-9 modules',
                effectiveness: '90-94% quality score',
                timeliness: 'On deadline',
              },
              {
                rating: 3,
                quantity: '6-7 modules',
                effectiveness: '85-89% quality score',
                timeliness: 'Within 3 days',
              },
              {
                rating: 2,
                quantity: '4-5 modules',
                effectiveness: '80-84% quality score',
                timeliness: 'Within 1 week',
              },
              {
                rating: 1,
                quantity: 'Below 4',
                effectiveness: 'Below 80% quality',
                timeliness: 'More than 1 week late',
              },
            ],
            competencies: {
              core: [{ code: 'CC', level: 3 }],
              technical: [
                { code: 'TC', level: 4 },
                { code: 'TC', level: 3 },
              ],
              leadership: [{ code: 'LC', level: 2 }],
            },
            inputs: { quantity: '', effectiveness: '', timeliness: '' },
          },
          {
            expanded: false,
            category: 'Support Function',
            mfo: 'MFO-003: Technical Support',
            output: 'Resolve technical issues efficiently',
            outputName: 'Resolved Support Tickets',
            indicatorName: 'Resolution Rate',
            successIndicator: 'Resolve 95% of tickets within SLA',
            requiredOutput: 'Weekly support metrics report',
            standardOutcomeRows: [
              {
                rating: 5,
                quantity: '100+ tickets',
                effectiveness: '98%+ SLA compliance',
                timeliness: 'Same day',
              },
              {
                rating: 4,
                quantity: '80-99 tickets',
                effectiveness: '95-97% SLA compliance',
                timeliness: 'Within 24 hours',
              },
              {
                rating: 3,
                quantity: '60-79 tickets',
                effectiveness: '90-94% SLA compliance',
                timeliness: 'Within 48 hours',
              },
              {
                rating: 2,
                quantity: '40-59 tickets',
                effectiveness: '85-89% SLA compliance',
                timeliness: 'Within 72 hours',
              },
              {
                rating: 1,
                quantity: 'Below 40',
                effectiveness: 'Below 85% SLA',
                timeliness: 'More than 72 hours',
              },
            ],
            competencies: {
              core: [{ code: 'CC', level: 4 }],
              technical: [{ code: 'TC', level: 4 }],
              leadership: [],
            },
            inputs: { quantity: '', effectiveness: '', timeliness: '' },
          },
        ],
      },
    }
  },

  computed: {
    stepTitle() {
      const titles = {
        1: 'Step 1: Select Rating Date',
        2: 'Step 2: Rate Performance Standards',
        3: 'Step 3: Review & Submit',
      }
      return titles[this.step] || 'Performance Rating'
    },
    formattedSelectedDate() {
      return this.selectedDate ? date.formatDate(this.selectedDate, 'dddd, MMMM D, YYYY') : ''
    },
    canProceed() {
      if (this.step === 1) return !!this.selectedDate
      if (this.step === 2) return this.completedStandards > 0
      return true
    },
    completedStandards() {
      return this.sampleData.performanceStandards.filter((std) => this.isStandardComplete(std))
        .length
    },
    completionPercentage() {
      return (this.completedStandards / this.sampleData.performanceStandards.length) * 100
    },
    allStandardsComplete() {
      return this.completedStandards === this.sampleData.performanceStandards.length
    },
    hasUnsavedData() {
      return this.sampleData.performanceStandards.some(
        (std) => std.inputs.quantity || std.inputs.effectiveness || std.inputs.timeliness,
      )
    },
  },

  watch: {
    modelValue(val) {
      this.isOpen = val
    },
    isOpen(val) {
      this.$emit('update:modelValue', val)
      if (!val) {
        this.resetForm()
      }
    },
  },

  methods: {
    isStandardComplete(standard) {
      return !!(
        standard.inputs.quantity &&
        standard.inputs.effectiveness &&
        standard.inputs.timeliness
      )
    },

    confirmClose() {
      // Check if there's any unsaved data or user is past step 1
      if (this.hasUnsavedData || this.step > 1) {
        this.showConfirmDialog = true
      } else {
        this.forceClose()
      }
    },

    forceClose() {
      this.showConfirmDialog = false
      this.isOpen = false
    },

    resetForm() {
      setTimeout(() => {
        this.step = 1
        this.selectedDate = null
        this.showConfirmDialog = false
        this.showSubmitDialog = false
        this.sampleData.performanceStandards.forEach((std, index) => {
          std.inputs.quantity = ''
          std.inputs.effectiveness = ''
          std.inputs.timeliness = ''
          std.expanded = index === 0
        })
      }, 300)
    },

    submitForm() {
      this.showSubmitDialog = true
    },

    doSubmit() {
      const formData = {
        date: this.selectedDate,
        employee: this.sampleData.employee,
        performanceStandards: this.sampleData.performanceStandards.map((std) => ({
          category: std.category,
          mfo: std.mfo,
          output: std.output,
          inputs: { ...std.inputs },
        })),
      }

      console.log('Submitted Data:', formData)
      this.$emit('submit', formData)

      this.showSubmitDialog = false

      // Show success notification if Quasar Notify plugin is available
      if (this.$q && this.$q.notify) {
        this.$q.notify({
          color: 'positive',
          message: 'Performance ratings submitted successfully!',
          icon: 'check_circle',
          position: 'top',
        })
      } else {
        alert('Performance ratings submitted successfully!')
      }

      this.isOpen = false
    },
  },
}
</script>

<style lang="scss" scoped>
.date-wizard-modal {
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  margin: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--q-primary);
  color: white;
  padding: 12px 16px;
}

.stepper-nav {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  flex-wrap: wrap;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.title {
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #1976d2;
}

.step-container {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.date-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.calendar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 500px;
  height: 500px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  small {
    color: #757575;
    font-size: 0.75rem;
  }

  span {
    font-weight: 500;
  }
}

.standard-card {
  margin-bottom: 16px;
  overflow: hidden;
}

.standard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: var(--q-primary);
  color: white;
  padding: 14px 16px;
  font-weight: 500;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  .header-content {
    display: flex;
    align-items: center;
  }
}

.standard-body {
  padding: 20px;
  background: #fafafa;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--q-primary);
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--q-primary);
  display: flex;
  align-items: center;
}

.outcome-table {
  :deep(th) {
    background: #e3f2fd;
    font-weight: 500;
  }

  :deep(td:first-child) {
    font-weight: bold;
    background: #f5f5f5;
  }
}

.details-grid-three {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  small {
    color: #757575;
    font-size: 0.6rem;
  }

  span {
    font-weight: 500;
  }
}

.input-card {
  background: white;
  border: 2px solid var(--q-primary) !important;
}

.inputs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.review-item-block {
  padding: 16px;
}

.review-values {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.review-value-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  small {
    color: #757575;
    font-size: 0 75rem;
    font-weight: 500;
  }

  span {
    font-weight: 500;
    word-break: break-word;
  }
}

.actions {
  background: #f5f5f5;
  padding: 12px 20px;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 992px) {
  .details-grid-three {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
  }

  .review-values {
    grid-template-columns: 1fr;
  }

  .inputs-grid {
    grid-template-columns: 1fr;
  }

  .calendar {
    width: 100%;
    height: auto;
  }
}
</style>
