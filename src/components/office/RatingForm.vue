<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-md">
      <q-btn flat dense icon="arrow_back" label="Back" color="grey-8" @click="$emit('back')" />
      <div class="column items-end">
        <h1 class="text-h6 q-mb-none">Performance Standard Review</h1>
        <p class="text-grey-7 q-mt-xs">Review and verify performance standards</p>
      </div>
    </div>

    <!-- Target Period Information -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-pa-sm bg-grey-2">
        <div class="text-subtitle2">Target Period Information</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-md-3">
            <div class="text-caption text-grey-7">Target Period</div>
            <div class="text-weight-medium">{{ selectedPeriod.targetPeriod }}</div>
          </div>
          <div class="col-md-3">
            <div class="text-caption text-grey-7">Status</div>
            <q-badge :color="getStatusColor(selectedPeriod.status)">
              {{ selectedPeriod.status }}
            </q-badge>
          </div>
          <div class="col-md-3">
            <div class="text-caption text-grey-7">Selected Date</div>
            <div class="text-weight-medium">{{ formatDate(selectedRatingDate) }}</div>
          </div>
          <div class="col-md-3">
            <div class="text-caption text-grey-7">Rating ID</div>
            <div class="text-weight-medium">#{{ selectedRating.id }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Employee Information -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-pa-sm bg-grey-2">
        <div class="text-subtitle2">Employee Information</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-md-4">
            <div class="text-caption text-grey-7">Employee Name</div>
            <div class="text-weight-medium">{{ performanceData.employee.name }}</div>
          </div>
          <div class="col-md-4">
            <div class="text-caption text-grey-7">Position</div>
            <div class="text-weight-medium">{{ performanceData.employee.position }}</div>
          </div>
          <div class="col-md-4">
            <div class="text-caption text-grey-7">Function</div>
            <div class="text-weight-medium">{{ performanceData.employee.rank }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Performance Standards List -->
    <div
      v-for="(standard, index) in localPerformanceStandards"
      :key="'std-' + index"
      class="q-mb-lg"
    >
      <q-card flat bordered>
        <q-card-section class="q-pa-sm bg-primary text-white">
          <div class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-medium">
              Performance Standard {{ index + 1 }}
            </div>
            <q-btn
              flat
              round
              dense
              :icon="standard.expanded ? 'expand_less' : 'expand_more'"
              color="white"
              @click="toggleStandard(index)"
            />
          </div>
        </q-card-section>

        <q-slide-transition>
          <div v-show="standard.expanded">
            <q-separator />

            <!-- Standard Outcome Section -->
            <q-card-section class="q-pa-md bg-blue-1">
              <div class="text-h6 q-mb-md text-primary">Standard Outcome</div>

              <q-card flat bordered>
                <q-table
                  :rows="standard.standardOutcomeRows"
                  :columns="standardOutcomeColumns"
                  row-key="rating"
                  hide-bottom
                  flat
                  dense
                  :rows-per-page-options="[0]"
                >
                  <template v-slot:body-cell-rating="props">
                    <q-td :props="props" class="text-weight-bold">
                      {{ props.row.rating }}
                    </q-td>
                  </template>

                  <template v-slot:body-cell-quantity="props">
                    <q-td :props="props">
                      <div class="outcome-value">{{ props.row.quantity || '-' }}</div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-effectiveness="props">
                    <q-td :props="props">
                      <div class="outcome-value">{{ props.row.effectiveness || '-' }}</div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-timeliness="props">
                    <q-td :props="props">
                      <div class="outcome-value">
                        <div v-if="props.row.timelinessRange">
                          Range: {{ props.row.timelinessRange }}
                        </div>
                        <div v-if="props.row.timelinessDate">
                          Date: {{ formatDate(props.row.timelinessDate) }}
                        </div>
                        <div v-if="props.row.timelinessText">
                          {{ props.row.timelinessText }}
                        </div>
                        <div
                          v-if="
                            !props.row.timelinessRange &&
                            !props.row.timelinessDate &&
                            !props.row.timelinessText
                          "
                        >
                          -
                        </div>
                      </div>
                    </q-td>
                  </template>
                </q-table>
              </q-card>
            </q-card-section>

            <!-- Performance Standard Section -->
            <q-card-section class="q-pa-md">
              <div class="text-h6 q-mb-md text-primary">Performance Standard</div>

              <!-- MFO Details and Success Indicators Row -->
              <div class="row q-col-gutter-md q-mb-md">
                <!-- MFO Details -->
                <div class="col-md-6">
                  <q-card flat bordered>
                    <q-card-section class="q-pa-sm bg-grey-2">
                      <div class="text-subtitle2">MFO Details</div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-pa-md">
                      <div class="info-item q-mb-sm">
                        <div class="text-caption text-grey-7">Category</div>
                        <div class="text-weight-medium">{{ standard.category }}</div>
                      </div>
                      <div class="info-item q-mb-sm" v-if="standard.mfo">
                        <div class="text-caption text-grey-7">MFO</div>
                        <div class="text-weight-medium">{{ standard.mfo }}</div>
                      </div>
                      <div class="info-item">
                        <div class="text-caption text-grey-7">Output</div>
                        <div class="text-weight-medium">{{ standard.output }}</div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Success Indicators -->
                <div class="col-md-6">
                  <q-card flat bordered>
                    <q-card-section class="q-pa-sm bg-grey-2">
                      <div class="text-subtitle2">Success Indicators</div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-pa-md">
                      <div class="info-item q-mb-sm">
                        <div class="text-caption text-grey-7">Output Name</div>
                        <div class="text-weight-medium">{{ standard.outputName }}</div>
                      </div>
                      <div class="info-item q-mb-sm">
                        <div class="text-caption text-grey-7">Performance Indicator</div>
                        <div class="text-weight-medium">{{ standard.indicatorName }}</div>
                      </div>
                      <div class="info-item q-mb-sm">
                        <div class="text-caption text-grey-7">Success Indicator</div>
                        <div class="text-weight-medium">{{ standard.successIndicator }}</div>
                      </div>
                      <div class="info-item">
                        <div class="text-caption text-grey-7">Required Output</div>
                        <div class="text-weight-medium">{{ standard.requiredOutput }}</div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Competencies Section -->
              <q-card flat bordered class="q-mb-md">
                <q-card-section class="q-pa-sm bg-grey-2">
                  <div class="text-subtitle2">Competencies</div>
                </q-card-section>
                <q-separator />
                <q-card-section class="q-pa-md">
                  <div class="row q-col-gutter-md">
                    <!-- Core Competencies -->
                    <div class="col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="q-pa-sm bg-blue-2">
                          <div class="text-subtitle2 text-center">Core Competencies</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section class="q-pa-md">
                          <div
                            v-if="
                              standard.competencies.core && standard.competencies.core.length > 0
                            "
                          >
                            <div
                              v-for="(comp, idx) in standard.competencies.core"
                              :key="'core-' + idx"
                              class="competency-item q-mb-xs"
                            >
                              <q-chip dense color="blue-3" text-color="black" size="sm">
                                {{ comp.code }}-{{ comp.value }} ({{ comp.legend }})
                              </q-chip>
                            </div>
                          </div>
                          <div v-else class="text-grey-6 text-center">No core competencies</div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- Technical Competencies -->
                    <div class="col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="q-pa-sm bg-orange-2">
                          <div class="text-subtitle2 text-center">Technical Competencies</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section class="q-pa-md">
                          <div
                            v-if="
                              standard.competencies.technical &&
                              standard.competencies.technical.length > 0
                            "
                          >
                            <div
                              v-for="(comp, idx) in standard.competencies.technical"
                              :key="'tech-' + idx"
                              class="competency-item q-mb-xs"
                            >
                              <q-chip dense color="orange-3" text-color="black" size="sm">
                                {{ comp.code }}-{{ comp.value }} ({{ comp.legend }})
                              </q-chip>
                            </div>
                          </div>
                          <div v-else class="text-grey-6 text-center">
                            No technical competencies
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- Leadership Competencies -->
                    <div class="col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="q-pa-sm bg-purple-2">
                          <div class="text-subtitle2 text-center">Leadership Competencies</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section class="q-pa-md">
                          <div
                            v-if="
                              standard.competencies.leadership &&
                              standard.competencies.leadership.length > 0
                            "
                          >
                            <div
                              v-for="(comp, idx) in standard.competencies.leadership"
                              :key="'lead-' + idx"
                              class="competency-item q-mb-xs"
                            >
                              <q-chip dense color="purple-3" text-color="black" size="sm">
                                {{ comp.code }}-{{ comp.value }} ({{ comp.legend }})
                              </q-chip>
                            </div>
                          </div>
                          <div v-else class="text-grey-6 text-center">
                            No leadership competencies
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Input Fields for Quantity, Effectiveness, and Timeliness -->
              <q-card flat bordered>
                <q-card-section class="q-pa-sm bg-grey-2">
                  <div class="text-subtitle2">Performance Inputs</div>
                </q-card-section>
                <q-separator />
                <q-card-section class="q-pa-md">
                  <div class="row q-col-gutter-md">
                    <!-- Quantity Input -->
                    <div class="col-md-4">
                      <q-input
                        v-model="standard.inputs.quantity"
                        label="Quantity"
                        outlined
                        dense
                        type="number"
                        hint="Enter quantity value"
                      >
                        <template v-slot:prepend>
                          <q-icon name="format_list_numbered" color="primary" />
                        </template>
                      </q-input>
                    </div>

                    <!-- Effectiveness Input -->
                    <div class="col-md-4">
                      <q-input
                        v-model="standard.inputs.effectiveness"
                        label="Effectiveness"
                        outlined
                        dense
                        type="textarea"
                        autogrow
                        hint="Enter effectiveness criteria"
                        :input-style="{ minHeight: '40px' }"
                      >
                        <template v-slot:prepend>
                          <q-icon name="check_circle" color="positive" />
                        </template>
                      </q-input>
                    </div>

                    <!-- Timeliness Input -->
                    <div class="col-md-4">
                      <div class="column q-gutter-sm">
                        <q-input
                          v-if="standard.timelinessType.includes('range')"
                          v-model="standard.inputs.timelinessRange"
                          label="Timeliness Range"
                          outlined
                          dense
                          type="number"
                          hint="Enter range value"
                        >
                          <template v-slot:prepend>
                            <q-icon name="schedule" color="warning" />
                          </template>
                        </q-input>

                        <q-input
                          v-if="standard.timelinessType.includes('date')"
                          v-model="standard.inputs.timelinessDate"
                          label="Timeliness Date"
                          outlined
                          dense
                          mask="date"
                          :rules="['date']"
                          hint="Select timeliness date"
                        >
                          <template v-slot:prepend>
                            <q-icon name="event" color="warning" />
                          </template>
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="standard.inputs.timelinessDate">
                                  <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                  </div>
                                </q-date>
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>

                        <q-input
                          v-if="standard.timelinessType.includes('description')"
                          v-model="standard.inputs.timelinessDescription"
                          label="Timeliness Description"
                          outlined
                          dense
                          type="textarea"
                          autogrow
                          hint="Enter timeliness description"
                          :input-style="{ minHeight: '40px' }"
                        >
                          <template v-slot:prepend>
                            <q-icon name="description" color="warning" />
                          </template>
                        </q-input>

                        <div
                          v-if="
                            !standard.timelinessType.includes('range') &&
                            !standard.timelinessType.includes('date') &&
                            !standard.timelinessType.includes('description')
                          "
                        >
                          <q-input
                            label="Timeliness"
                            outlined
                            dense
                            readonly
                            value="No timeliness type selected"
                            hint="Configure timeliness inputs"
                          >
                            <template v-slot:prepend>
                              <q-icon name="schedule" color="grey" />
                            </template>
                          </q-input>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>
    </div>

    <!-- Action Buttons -->
    <div class="row justify-end q-mt-md q-gutter-sm">
      <q-btn label="Back" color="grey" flat @click="$emit('back')" />
      <q-btn label="Edit" color="primary" outline @click="$emit('edit')" />
      <q-btn label="Confirm & Submit" color="green-7" @click="handleSubmit" />
    </div>
  </q-page>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'PerformanceDisplay',

  props: {
    selectedPeriod: {
      type: Object,
      required: true,
    },
    selectedRating: {
      type: Object,
      required: true,
    },
    selectedRatingDate: {
      type: String,
      required: true,
    },
    performanceData: {
      type: Object,
      required: true,
    },
  },

  emits: ['back', 'edit', 'submit'],

  data() {
    return {
      localPerformanceStandards: [],
      standardOutcomeColumns: [
        {
          name: 'rating',
          required: true,
          label: 'Rating',
          align: 'center',
          field: 'rating',
          sortable: false,
          style: 'width: 10%',
        },
        {
          name: 'quantity',
          required: true,
          label: 'Quantity',
          align: 'center',
          field: 'quantity',
          sortable: false,
          style: 'width: 30%',
        },
        {
          name: 'effectiveness',
          required: true,
          label: 'Effectiveness',
          align: 'center',
          field: 'effectiveness',
          sortable: false,
          style: 'width: 30%',
        },
        {
          name: 'timeliness',
          required: true,
          label: 'Timeliness',
          align: 'center',
          field: 'timeliness',
          sortable: false,
          style: 'width: 30%',
        },
      ],
    }
  },

  created() {
    // Clone the performance standards to avoid mutating props
    this.localPerformanceStandards = JSON.parse(
      JSON.stringify(this.performanceData.performanceStandards),
    )
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

    toggleStandard(index) {
      this.localPerformanceStandards[index].expanded =
        !this.localPerformanceStandards[index].expanded
    },

    handleSubmit() {
      this.$q
        .dialog({
          title: 'Confirm Submission',
          message: 'Are you sure you want to submit these performance standards?',
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.$emit('submit', this.localPerformanceStandards)
        })
    },
  },
}
</script>

<style scoped>
.info-item {
  padding: 4px 0;
}

.outcome-value {
  padding: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.competency-item {
  display: inline-block;
  margin-right: 4px;
}

.q-table tbody td {
  padding: 12px 8px;
  vertical-align: top;
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
