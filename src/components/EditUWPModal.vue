<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-card>
    <!-- Top Header Row -->
    <div class="row items-center justify-between q-mb-md q-pl-lg q-pr-lg">
      <div class="column items-start">
        <h1 class="text-h6 q-mb-none">EDIT UNIT WORK PLAN - {{ selectedEmployee.name }}</h1>
        <p class="text-grey-7 q-mt-xs">{{ breadcrumbDisplay }}</p>
        <p class="text-caption text-grey-6 q-mt-xs">
          Editing work plan for: <strong>{{ selectedEmployee.name }}</strong>
          <span class="q-ml-md">
            Position: <strong>{{ selectedEmployee.position }}</strong>
          </span>
        </p>
      </div>
      <div class="column items-end">
        <q-btn flat dense icon="arrow_back" label="Back" color="grey-8" @click="onBack" />
      </div>
    </div>

    <!-- Target Period Details Card -->
    <div class="col-12 q-mb-md">
      <q-card flat bordered>
        <q-card-section class="q-pa-sm">
          <div class="text-subtitle2">Target Period Details</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-sm">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="column q-gutter-sm">
                <q-input
                  v-model="uwpData.targetPeriod.semester"
                  readonly
                  label="Semester"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template #prepend>
                    <q-icon name="calendar_view_month" size="xs" />
                  </template>
                </q-input>

                <q-separator />

                <q-input v-model="hierarchyLabels.office" label="Office" outlined dense readonly>
                  <template #prepend>
                    <q-icon name="account_balance" size="xs" />
                  </template>
                </q-input>

                <q-input
                  v-model="hierarchyLabels.office2"
                  label="Sub-Office"
                  outlined
                  dense
                  readonly
                >
                  <template #prepend>
                    <q-icon name="business" size="xs" />
                  </template>
                </q-input>

                <q-input v-model="hierarchyLabels.group" label="Group" outlined dense readonly>
                  <template #prepend>
                    <q-icon name="group_work" size="xs" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="column q-gutter-sm">
                <q-input
                  v-model="uwpData.targetPeriod.year"
                  readonly
                  label="Year"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template #prepend>
                    <q-icon name="event" size="xs" />
                  </template>
                </q-input>

                <q-separator />

                <q-input
                  v-model="hierarchyLabels.division"
                  label="Division"
                  outlined
                  dense
                  readonly
                >
                  <template #prepend>
                    <q-icon name="business" size="xs" />
                  </template>
                </q-input>

                <q-input v-model="hierarchyLabels.section" label="Section" outlined dense readonly>
                  <template #prepend>
                    <q-icon name="account_tree" size="xs" />
                  </template>
                </q-input>

                <q-input v-model="hierarchyLabels.unit" label="Unit" outlined dense readonly>
                  <template #prepend>
                    <q-icon name="layers" size="xs" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Employee Information -->
    <div class="col-12">
      <q-card flat bordered>
        <q-card-section class="q-pa-sm">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle2">Employee Information</div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-input
                v-model="selectedEmployee.name"
                label="Employee Name"
                outlined
                dense
                readonly
              >
                <template #prepend>
                  <q-icon name="person" size="xs" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-input v-model="selectedEmployee.rank" label="Function" outlined dense readonly>
                    <template #prepend>
                      <q-icon name="military_tech" size="xs" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="selectedEmployee.position"
                    label="Position"
                    outlined
                    dense
                    readonly
                  >
                    <template #prepend>
                      <q-icon name="work" size="xs" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Standards Section -->
          <div v-if="currentEmployee" class="q-mt-md">
            <q-separator class="q-mb-md" />

            <div class="q-mt-md">
              <div
                v-for="(standard, index) in currentEmployee.performanceStandards"
                :key="'perf-std-' + index"
                class="q-mb-md"
              >
                <q-card flat bordered>
                  <q-card-section class="q-pa-sm bg-grey-2">
                    <div class="row items-center justify-between">
                      <div class="text-subtitle2">Performance Standard {{ index + 1 }}</div>
                      <div>
                        <q-btn
                          flat
                          round
                          dense
                          :icon="standard.expanded ? 'expand_less' : 'expand_more'"
                          @click="standard.expanded = !standard.expanded"
                          :aria-label="standard.expanded ? 'Collapse' : 'Expand'"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          icon="delete"
                          color="negative"
                          @click="removePerformanceStandard(index)"
                          aria-label="Remove"
                        />
                      </div>
                    </div>
                  </q-card-section>

                  <q-slide-transition>
                    <div v-show="standard.expanded">
                      <q-separator />
                      <q-card-section class="q-pa-sm">
                        <div class="row q-col-gutter-md">
                          <!-- MFO Details Card -->
                          <div class="col-md-6">
                            <q-card flat bordered class="full-height">
                              <q-card-section class="q-pa-sm">
                                <div class="text-subtitle2">MFO Details</div>
                              </q-card-section>

                              <q-separator />

                              <q-card-section class="q-pa-sm">
                                <div class="column q-gutter-sm">
                                  <q-select
                                    outlined
                                    dense
                                    v-model="standard.rows.category"
                                    label="Select Category"
                                    :options="categoryOptions"
                                    option-value="id"
                                    option-label="label"
                                    emit-value
                                    map-options
                                    @update:model-value="clearDependentFields(index, 1)"
                                  >
                                    <template #prepend>
                                      <q-icon name="category" size="xs" />
                                    </template>
                                  </q-select>

                                  <q-select
                                    v-if="!isSupportCategory(standard.rows.category)"
                                    outlined
                                    dense
                                    v-model="standard.rows.mfo"
                                    label="Select MFO"
                                    :options="getFilteredMfoOptions(index)"
                                    option-value="id"
                                    option-label="label"
                                    emit-value
                                    map-options
                                    use-input
                                    input-debounce="300"
                                    @filter="(val, update) => filterMfos(val, update, index)"
                                    clearable
                                    @update:model-value="clearDependentFields(index, 2)"
                                  >
                                    <template #prepend>
                                      <q-icon name="list_alt" size="xs" />
                                    </template>
                                    <template #option="scope">
                                      <q-item v-bind="scope.itemProps" dense>
                                        <q-item-section>
                                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                                          <q-item-label caption v-if="scope.opt.code">
                                            Code: {{ scope.opt.code }}
                                          </q-item-label>
                                        </q-item-section>
                                      </q-item>
                                    </template>
                                  </q-select>

                                  <q-select
                                    outlined
                                    dense
                                    v-model="standard.rows.output"
                                    label="Select Output"
                                    :options="getFilteredOutputOptions(index)"
                                    option-value="id"
                                    option-label="label"
                                    emit-value
                                    map-options
                                    use-input
                                    input-debounce="300"
                                    @filter="(val, update) => filterOutputs(val, update, index)"
                                    clearable
                                  >
                                    <template #prepend>
                                      <q-icon name="output" size="xs" />
                                    </template>
                                    <template #option="scope">
                                      <q-item v-bind="scope.itemProps" dense>
                                        <q-item-section>
                                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                                          <q-item-label caption v-if="scope.opt.code">
                                            Code: {{ scope.opt.code }}
                                          </q-item-label>
                                        </q-item-section>
                                      </q-item>
                                    </template>
                                  </q-select>
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>

                          <!-- Competencies Card -->
                          <div class="col-md-6">
                            <q-card flat bordered class="full-height">
                              <q-card-section class="q-pa-sm">
                                <div class="text-subtitle2">Competencies</div>
                              </q-card-section>

                              <q-separator />

                              <q-card-section class="q-pa-sm">
                                <div class="row q-col-gutter-sm">
                                  <div class="col-md-4">
                                    <q-card flat bordered class="full-height">
                                      <q-card-section class="q-pa-sm">
                                        <div class="text-caption text-weight-medium">Core</div>
                                      </q-card-section>
                                      <q-separator />
                                      <q-card-section class="q-pa-sm">
                                        <div class="competency-list">
                                          <div
                                            v-if="coreCompetencies.length === 0"
                                            class="text-grey-6 text-center"
                                          >
                                            No core competencies
                                          </div>
                                          <div
                                            v-for="comp in coreCompetencies"
                                            :key="comp.code"
                                            class="competency-item q-pb-xs"
                                          >
                                            <div class="text-caption">
                                              {{ comp.code }} - {{ numberCom(comp.value) }}
                                            </div>
                                          </div>
                                        </div>
                                      </q-card-section>
                                    </q-card>
                                  </div>

                                  <div class="col-md-4">
                                    <q-card flat bordered class="full-height">
                                      <q-card-section class="q-pa-sm">
                                        <div class="text-caption text-weight-medium">Technical</div>
                                      </q-card-section>
                                      <q-separator />
                                      <q-card-section class="q-pa-sm">
                                        <div class="competency-list">
                                          <div
                                            v-if="technicalCompetencies.length === 0"
                                            class="text-grey-6 text-center"
                                          >
                                            No technical competencies
                                          </div>
                                          <div
                                            v-for="comp in technicalCompetencies"
                                            :key="comp.code"
                                            class="competency-item q-pb-xs"
                                          >
                                            <div class="text-caption">
                                              {{ comp.code }} - {{ numberCom(comp.value) }}
                                            </div>
                                          </div>
                                        </div>
                                      </q-card-section>
                                    </q-card>
                                  </div>

                                  <div class="col-md-4">
                                    <q-card flat bordered class="full-height">
                                      <q-card-section class="q-pa-sm">
                                        <div class="text-caption text-weight-medium">
                                          Leadership
                                        </div>
                                      </q-card-section>
                                      <q-separator />
                                      <q-card-section class="q-pa-sm">
                                        <div class="competency-list">
                                          <div
                                            v-if="leadershipCompetencies.length === 0"
                                            class="text-grey-6 text-center"
                                          >
                                            No leadership competencies
                                          </div>
                                          <div
                                            v-for="comp in leadershipCompetencies"
                                            :key="comp.code"
                                            class="competency-item q-pb-xs"
                                          >
                                            <div class="text-caption">
                                              {{ comp.code }} - {{ numberCom(comp.value) }}
                                            </div>
                                          </div>
                                        </div>
                                      </q-card-section>
                                    </q-card>
                                  </div>
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>
                        </div>

                        <!-- Success Indicators Card -->
                        <q-card flat bordered class="q-mt-md">
                          <q-card-section class="q-pa-sm">
                            <div class="text-subtitle2">Success Indicators</div>
                          </q-card-section>
                          <q-separator />
                          <q-card-section class="q-pa-sm">
                            <div class="row q-col-gutter-sm">
                              <div class="col-md-5">
                                <div class="column q-gutter-mt-sm">
                                  <q-input
                                    outlined
                                    v-model="standard.outputName"
                                    label="Output Name"
                                    dense
                                    class="full-width"
                                    @update:model-value="generateSuccessIndicator(index)"
                                  />
                                  <q-select
                                    outlined
                                    v-model="standard.indicatorName"
                                    label="Performance Indicator"
                                    dense
                                    class="full-width q-pt-sm"
                                    use-input
                                    input-debounce="300"
                                    @filter="filterPerformanceIndicators"
                                    :options="filteredVerbs"
                                    option-value="id"
                                    option-label="name"
                                    emit-value
                                    map-options
                                    clearable
                                    @update:model-value="generateSuccessIndicator(index)"
                                  >
                                    <template #prepend>
                                      <q-icon name="flag" size="xs" />
                                    </template>
                                    <template #option="scope">
                                      <q-item v-bind="scope.itemProps" dense>
                                        <q-item-section>
                                          <q-item-label>{{ scope.opt.name }}</q-item-label>
                                          <q-item-label caption v-if="scope.opt.description">
                                            {{ scope.opt.description }}
                                          </q-item-label>
                                        </q-item-section>
                                      </q-item>
                                    </template>
                                    <template #no-option>
                                      <q-item>
                                        <q-item-section class="text-grey"
                                          >No performance indicators found</q-item-section
                                        >
                                      </q-item>
                                    </template>
                                  </q-select>
                                </div>
                              </div>

                              <div class="col-md-3">
                                <q-input
                                  outlined
                                  v-model="standard.successIndicator"
                                  type="textarea"
                                  label="Success Indicator"
                                  class="autogrow-textarea"
                                  autogrow
                                  readonly
                                  hint="Auto-generated"
                                  :input-style="{ minHeight: '80px' }"
                                  :min-rows="2"
                                />
                              </div>

                              <div class="col-md-4">
                                <q-input
                                  outlined
                                  v-model="standard.requiredOutput"
                                  type="textarea"
                                  label="Required Output"
                                  class="autogrow-textarea"
                                  autogrow
                                  :input-style="{ minHeight: '80px' }"
                                  :min-rows="2"
                                />
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>

                        <div class="q-mt-sm">
                          <div class="row items-center justify-between q-mt-sm">
                            <div class="text-subtitle2">Standard Outcome</div>
                            <div>
                              <q-btn flat round dense icon="more_vert">
                                <q-menu>
                                  <q-list style="min-width: 250px">
                                    <q-item-label header>Quantity Options</q-item-label>
                                    <q-separator />
                                    <q-item
                                      v-for="option in quantityIndicator"
                                      :key="'qty-' + option.value"
                                    >
                                      <q-item-section>
                                        <div class="row items-center">
                                          <q-radio
                                            v-model="standard.quantityIndicatorType"
                                            :val="option.value"
                                            @update:model-value="
                                              onQuantityOptionSelect(option.value, index)
                                            "
                                          />
                                          <div class="q-ml-sm">{{ option.label }}</div>
                                        </div>
                                      </q-item-section>
                                    </q-item>

                                    <q-separator spaced />
                                    <q-item-label header>Timeliness Options</q-item-label>
                                    <q-separator />

                                    <q-item>
                                      <q-item-section>
                                        <div class="row items-center">
                                          <q-radio
                                            v-model="standard.timelinessIndicatorType"
                                            val="beforeDeadline"
                                            @update:model-value="
                                              onTimelinessTypeSelect('beforeDeadline', index)
                                            "
                                          />
                                          <div class="q-ml-sm">Before Deadline</div>
                                        </div>
                                      </q-item-section>
                                    </q-item>

                                    <q-item
                                      v-if="standard.timelinessIndicatorType === 'beforeDeadline'"
                                      dense
                                      class="q-pl-lg"
                                    >
                                      <q-item-section>
                                        <div class="column">
                                          <div class="text-subtitle2 q-pb-xs">Input Types:</div>
                                          <div class="row items-center q-gutter-md">
                                            <q-checkbox
                                              v-model="standard.timelinessInputs.range"
                                              label="Range"
                                            />
                                            <q-checkbox
                                              v-model="standard.timelinessInputs.date"
                                              label="Date"
                                            />
                                            <q-checkbox
                                              v-model="standard.timelinessInputs.description"
                                              label="Description"
                                            />
                                          </div>
                                          <q-btn
                                            color="primary"
                                            label="Apply"
                                            size="sm"
                                            class="q-mt-sm"
                                            @click="applyTimelinessInputs('beforeDeadline', index)"
                                          />
                                        </div>
                                      </q-item-section>
                                    </q-item>

                                    <q-item>
                                      <q-item-section>
                                        <div class="row items-center">
                                          <q-radio
                                            v-model="standard.timelinessIndicatorType"
                                            val="onDeadline"
                                            @update:model-value="
                                              onTimelinessTypeSelect('onDeadline', index)
                                            "
                                          />
                                          <div class="q-ml-sm">On Deadline</div>
                                        </div>
                                      </q-item-section>
                                    </q-item>

                                    <q-item
                                      v-if="standard.timelinessIndicatorType === 'onDeadline'"
                                      dense
                                      class="q-pl-lg"
                                    >
                                      <q-item-section>
                                        <div class="column">
                                          <div class="text-subtitle2 q-pb-xs">Input Types:</div>
                                          <div class="row items-center q-gutter-md">
                                            <q-checkbox
                                              v-model="standard.timelinessInputs.range"
                                              label="Range"
                                            />
                                            <q-checkbox
                                              v-model="standard.timelinessInputs.date"
                                              label="Date"
                                            />
                                            <q-checkbox
                                              v-model="standard.timelinessInputs.description"
                                              label="Description"
                                            />
                                          </div>
                                          <q-btn
                                            color="primary"
                                            label="Apply"
                                            size="sm"
                                            class="q-mt-sm"
                                            @click="applyTimelinessInputs('onDeadline', index)"
                                          />
                                        </div>
                                      </q-item-section>
                                    </q-item>
                                  </q-list>
                                </q-menu>
                              </q-btn>
                            </div>
                          </div>

                          <div class="q-pa-md table-container">
                            <q-table
                              :rows="standard.standardOutcomeRows"
                              :columns="standardOutcomeColumns"
                              row-key="rating"
                              hide-bottom
                              bordered
                              flat
                              dense
                              class="standard-outcome-table"
                            >
                              <template #header-cell="props">
                                <q-th :props="props" :style="`width: ${props.col.width}`">
                                  {{ props.col.label }}
                                  <q-icon
                                    v-if="props.col.name === 'effectiveness'"
                                    name="error_outline"
                                    color="negative"
                                    size="xs"
                                    class="q-ml-xs"
                                    v-show="
                                      !hasMinimumEffectivenessValues(index) &&
                                      formInteracted &&
                                      shouldValidate
                                    "
                                  >
                                    <q-tooltip
                                      >At least 2 effectiveness values are required</q-tooltip
                                    >
                                  </q-icon>
                                </q-th>
                              </template>

                              <template #body-cell-quantity="props">
                                <q-td
                                  :props="props"
                                  class="input-cell"
                                  :style="`width: ${props.col.width}`"
                                >
                                  <q-input
                                    v-if="standard.quantityIndicatorType === 'numeric'"
                                    v-model="props.row.quantity"
                                    dense
                                    outlined
                                    placeholder="Enter target"
                                    :rules="[validateStrictNumeric]"
                                    @keydown="blockInvalidChars"
                                    @update:model-value="
                                      onQuantityUpdate(props.row, 'quantity', index)
                                    "
                                  />
                                  <div v-else class="numeric-display">
                                    {{ props.row.quantity || '-' }}
                                  </div>
                                </q-td>
                              </template>

                              <template #body-cell-timeliness="props">
                                <q-td
                                  :props="props"
                                  class="input-cell"
                                  :style="`width: ${props.col.width}`"
                                >
                                  <div class="row q-col-gutter-sm">
                                    <div
                                      v-if="standard.activeTimelinessInputs.range"
                                      :class="timelinessColumnClass(standard, 'range')"
                                    >
                                      <q-input
                                        v-model="props.row.timelinessRange"
                                        dense
                                        outlined
                                        placeholder="Range"
                                        :rules="[validateStrictNumeric]"
                                        @keydown="blockInvalidChars"
                                        @update:model-value="
                                          onTimelinessUpdate(props.row, 'timelinessRange', index)
                                        "
                                      />
                                    </div>

                                    <div
                                      v-if="standard.activeTimelinessInputs.date"
                                      :class="timelinessColumnClass(standard, 'date')"
                                    >
                                      <q-input
                                        v-model="props.row.timelinessDate"
                                        dense
                                        outlined
                                        placeholder="Date"
                                        mask="date"
                                        :rules="['date']"
                                        @update:model-value="generateSuccessIndicator(index)"
                                      >
                                        <template #append>
                                          <q-icon name="event" class="cursor-pointer">
                                            <q-popup-proxy
                                              cover
                                              transition-show="scale"
                                              transition-hide="scale"
                                            >
                                              <q-date v-model="props.row.timelinessDate">
                                                <div class="row items-center justify-end">
                                                  <q-btn
                                                    v-close-popup
                                                    label="Close"
                                                    color="primary"
                                                    flat
                                                  />
                                                </div>
                                              </q-date>
                                            </q-popup-proxy>
                                          </q-icon>
                                        </template>
                                      </q-input>
                                    </div>

                                    <div
                                      v-if="standard.activeTimelinessInputs.description"
                                      :class="timelinessColumnClass(standard, 'description')"
                                    >
                                      <q-input
                                        v-model="props.row.timelinessText"
                                        dense
                                        outlined
                                        placeholder="Description"
                                        @update:model-value="generateSuccessIndicator(index)"
                                      />
                                    </div>

                                    <div
                                      v-if="
                                        !standard.activeTimelinessInputs.range &&
                                        !standard.activeTimelinessInputs.date &&
                                        !standard.activeTimelinessInputs.description
                                      "
                                      class="col numeric-display"
                                    >
                                      {{ props.row.timeliness || 'Select input types' }}
                                    </div>
                                  </div>
                                </q-td>
                              </template>

                              <template #body-cell-effectiveness="props">
                                <q-td
                                  :props="props"
                                  class="input-cell"
                                  :style="`width: ${props.col.width}`"
                                  :class="{
                                    'effectiveness-error':
                                      !hasMinimumEffectivenessValues(index) &&
                                      formInteracted &&
                                      shouldValidate &&
                                      !props.row.effectiveness,
                                  }"
                                >
                                  <q-input
                                    v-model="props.row.effectiveness"
                                    type="textarea"
                                    dense
                                    autogrow
                                    outlined
                                    placeholder="Enter criteria"
                                    class="effectiveness-textarea"
                                    :input-style="{ minHeight: '40px' }"
                                    :min-rows="1"
                                    @focus="onEffectivenessFieldFocus"
                                    @update:model-value="onEffectivenessUpdate(props.row, index)"
                                    :error="
                                      !hasMinimumEffectivenessValues(index) &&
                                      formInteracted &&
                                      shouldValidate &&
                                      !props.row.effectiveness
                                    "
                                  />
                                </q-td>
                              </template>
                            </q-table>

                            <div
                              v-if="
                                !hasMinimumEffectivenessValues(index) &&
                                formInteracted &&
                                shouldValidate
                              "
                              class="text-negative q-mt-sm"
                            >
                              At least 2 effectiveness values must be filled out.
                            </div>
                          </div>
                        </div>
                      </q-card-section>
                    </div>
                  </q-slide-transition>
                </q-card>
              </div>

              <div class="row justify-center q-mt-md">
                <q-btn
                  color="green-7"
                  icon="add"
                  label="Add Performance Standard"
                  @click="addPerformanceStandard"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Quantity Input Modal -->
    <q-dialog v-model="showQuantityModal" persistent>
      <q-card style="min-width: 400px; border-radius: 8px">
        <q-card-section class="modal-header">
          <div class="text-h6">Enter Target Output</div>
        </q-card-section>

        <q-card-section class="modal-body">
          <q-input
            v-model.number="quantityValue"
            label="Target Output"
            type="number"
            outlined
            dense
            :rules="[(val) => val > 0 || 'Must be greater than 0']"
            @keypress="blockInvalidChars"
          />
        </q-card-section>

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup @click="cancelQuantityInput" />
          <q-btn label="Calculate" color="green" unelevated @click="computeQuantities" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="row justify-end q-mt-lg q-gutter-sm">
      <q-btn label="Cancel" color="grey" flat dense @click="onBack" />
      <q-btn
        label="Update"
        color="green-7"
        icon="save"
        @click="onSubmit"
        :disable="!isFormValid || uwpStore.loading"
        :loading="uwpStore.loading"
      />
    </div>
  </q-card>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { useMfoStore } from 'src/stores/office/officeLibrary'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useUnitWorkPlanStore } from 'src/stores/office/unitWorkPlanStore'
import { useCompetencyStore } from 'src/stores/competencyStore'

const quantityIndicator = [
  { label: 'Quantity (A.   Custom Target)', value: 'numeric' },
  { label: 'Quantity (B.  Can exceed 100%)', value: 'B' },
  { label: 'Quantity (C. Cannot exceed 100%)', value: 'C' },
]

const createEmptyStandardRow = () => ({
  rating: '',
  quantity: '',
  effectiveness: '',
  timeliness: '',
  timelinessRange: '',
  timelinessText: '',
  timelinessDeadline: '',
  timelinessDate: '',
})

const createDefaultStandardRows = () => [
  { ...createEmptyStandardRow(), rating: '5' },
  { ...createEmptyStandardRow(), rating: '4' },
  { ...createEmptyStandardRow(), rating: '3' },
  { ...createEmptyStandardRow(), rating: '2' },
  { ...createEmptyStandardRow(), rating: '1' },
]

const createDefaultPerformanceStandard = () => ({
  id: uuidv4(),
  expanded: true,
  outputName: '',
  indicatorName: '',
  successIndicator: '',
  requiredOutput: '',
  modeOfVerification: '',
  rows: { category: null, mfo: null, output: null },
  quantityIndicatorType: 'numeric',
  timelinessIndicatorType: 'beforeDeadline',
  timelinessInputs: { range: true, date: false, description: false },
  activeTimelinessInputs: { range: true, date: false, description: false },
  standardOutcomeRows: createDefaultStandardRows(),
})

const createDefaultEmployeeData = () => ({
  id: uuidv4(),
  name: '',
  employeeId: null,
  employeeData: null,
  sg: null,
  level: null,
  rank: '',
  position: '',
  performanceStandards: [createDefaultPerformanceStandard()],
})

const numberCom = (value) => {
  if (!value || value === '-') return '-'
  return { Basic: '1', Intermediate: '2', Advanced: '3', Superior: '4' }[value] || value
}

const timelinessColumnClass = (standard) => {
  const { range, date, description } = standard.activeTimelinessInputs
  const activeCount = [range, date, description].filter(Boolean).length
  if (activeCount === 1) return 'col'
  if (activeCount === 2) return 'col-6'
  return 'col-4'
}

export default {
  props: {
    employee: { type: Object, default: null },
    controlNo: { type: [String, Number], required: true },
    semester: { type: [String, Number], required: true },
    year: { type: [String, Number], required: true },
  },

  setup(props) {
    const $q = useQuasar()
    const router = useRouter()
    const officeLibraryStore = useMfoStore()
    const officeLibraryIndicatorStore = useLibraryStore()
    const uwpStore = useUnitWorkPlanStore()
    const competencyStore = useCompetencyStore()

    const filteredMfoOptions = ref({})
    const filteredOutputOptions = ref({})
    const filteredVerbs = ref([])

    const uwpData = ref({
      type: null,
      selectedNodeId: null,
      selectedNodeLabel: null,
      breadcrumb: [],
      targetPeriod: { semester: null, year: null },
      hierarchy: {
        office: null,
        office2: null,
        group: null,
        division: null,
        section: null,
        unit: null,
      },
      editingEmployee: null,
    })

    const formInteracted = ref(false)
    const shouldValidate = ref(false)
    const currentEmployee = ref(null)
    const isLoadingFilteredEmployees = ref(false)
    const currentStandardIndex = ref(0)
    const showQuantityModal = ref(false)
    const quantityValue = ref(null)

    const coreCompetencies = ref([])
    const technicalCompetencies = ref([])
    const leadershipCompetencies = ref([])

    const standardOutcomeColumns = [
      { name: 'rating', label: 'Rating', field: 'rating', align: 'center', width: '80px' },
      { name: 'quantity', label: 'Quantity', field: 'quantity', align: 'center', width: '200px' },
      {
        name: 'effectiveness',
        label: 'Effectiveness',
        field: 'effectiveness',
        align: 'center',
        width: '300px',
      },
      {
        name: 'timeliness',
        label: 'Timeliness',
        field: 'timeliness',
        align: 'center',
        width: '300px',
      },
    ]

    const semesterOptions = computed(() => uwpStore.getSemesterOptions)
    const yearOptions = computed(() => uwpStore.getYearOptions)

    const breadcrumbDisplay = computed(() =>
      !uwpData.value.breadcrumb || uwpData.value.breadcrumb.length === 0
        ? 'Organization Structure'
        : uwpData.value.breadcrumb.join(' / '),
    )

    const selectedEmployee = computed(() => {
      if (!currentEmployee.value) return { name: '', rank: '', position: '', sg: '', level: '' }
      const { name = '', rank = '', position = '', sg = '', level = '' } = currentEmployee.value
      return { name, rank, position, sg, level }
    })

    const hierarchyLabels = computed(() => ({
      office: uwpData.value.hierarchy.office?.label || '',
      office2: uwpData.value.hierarchy.office2?.label || '',
      group: uwpData.value.hierarchy.group?.label || '',
      division: uwpData.value.hierarchy.division?.label || '',
      section: uwpData.value.hierarchy.section?.label || '',
      unit: uwpData.value.hierarchy.unit?.label || '',
    }))

    const categoryOptions = computed(() =>
      officeLibraryStore.categories.map((cat) => ({
        id: cat.id,
        label: cat.name,
        value: cat.id,
        name: cat.name,
      })),
    )

    const performanceIndicatorOptions = computed(() =>
      officeLibraryIndicatorStore.verbs.map((verb) => ({
        id: verb.id,
        label: verb.indicator_name || verb.name,
        value: verb.id,
        name: verb.indicator_name || verb.name,
        description: verb.description || '',
      })),
    )

    const hasMinimumEffectivenessValues = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard) return false
      const filledValues = standard.standardOutcomeRows.filter(
        (row) => row.effectiveness?.trim()?.length > 0,
      ).length
      return filledValues >= 2
    }

    const isFormValid = computed(() => {
      if (!currentEmployee.value?.employeeId) return false
      const hasTargetPeriod =
        uwpData.value.targetPeriod?.semester && uwpData.value.targetPeriod?.year
      if (!hasTargetPeriod) return false

      return currentEmployee.value.performanceStandards?.every((standard) => {
        const filled =
          standard.standardOutcomeRows?.filter((row) => row.effectiveness?.trim()?.length > 0)
            .length || 0
        return filled >= 2
      })
    })

    const filterPerformanceIndicators = (val, update) => {
      const needle = (val || '').toLowerCase()
      const base = performanceIndicatorOptions.value
      const filtered = base.filter(
        (verb) =>
          verb.label.toLowerCase().includes(needle) ||
          verb.description.toLowerCase().includes(needle),
      )
      if (typeof update === 'function') update(() => (filteredVerbs.value = filtered))
      else filteredVerbs.value = filtered
    }

    const isSupportCategory = (categoryId) => {
      const category = officeLibraryStore.categories.find((cat) => cat.id === categoryId)
      return category && category.name === 'C. SUPPORT FUNCTION'
    }

    const getFilteredMfoOptions = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard?.rows.category) return []
      if (filteredMfoOptions.value[index]) return filteredMfoOptions.value[index]

      return officeLibraryStore.mfos
        .filter((mfo) => mfo.f_category_id === standard.rows.category)
        .map((mfo) => ({
          id: mfo.id,
          label: mfo.name,
          value: mfo.id,
          name: mfo.name,
          code: mfo.code || '',
          description: mfo.description || '',
        }))
    }

    const getFilteredOutputOptions = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard?.rows.category) return []

      const categoryId = standard.rows.category

      if (isSupportCategory(categoryId)) {
        return officeLibraryStore.category_outputs
          .filter((output) => output.f_category_id === categoryId)
          .map((output) => ({
            id: output.id,
            label: output.name,
            value: output.id,
            name: output.name,
            code: output.code || '',
            description: output.description || '',
          }))
      }

      const mfoId = standard.rows.mfo
      return officeLibraryStore.outputs
        .filter((output) => {
          if (output.f_category_id !== categoryId) return false
          if (mfoId) return output.mfo_id === mfoId
          return output.mfo_id === null
        })
        .map((output) => ({
          id: output.id,
          label: output.name,
          value: output.id,
          name: output.name,
          code: output.code || '',
          description: output.description || '',
        }))
    }

    const clearDependentFields = (standardIndex, fieldIndex) => {
      const standard = currentEmployee.value?.performanceStandards?.[standardIndex]
      if (!standard) return
      if (fieldIndex === 1) {
        standard.rows.mfo = null
        standard.rows.output = null
        filteredMfoOptions.value[standardIndex] = null
        filteredOutputOptions.value[standardIndex] = null
      } else if (fieldIndex === 2) {
        standard.rows.output = null
        filteredOutputOptions.value[standardIndex] = null
      }
    }

    const filterMfos = (val, update, index) => {
      if (typeof update !== 'function') return
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard?.rows.category) return update(() => (filteredMfoOptions.value[index] = []))

      const needle = (val || '').toLowerCase()
      const all = officeLibraryStore.mfos
        .filter((mfo) => mfo.f_category_id === standard.rows.category)
        .map((mfo) => ({
          id: mfo.id,
          label: mfo.name,
          value: mfo.id,
          name: mfo.name,
          code: mfo.code || '',
          description: mfo.description || '',
        }))

      update(() => {
        filteredMfoOptions.value[index] = all.filter(
          (mfo) =>
            mfo.label.toLowerCase().includes(needle) ||
            mfo.code?.toLowerCase().includes(needle) ||
            mfo.description?.toLowerCase().includes(needle),
        )
      })
    }

    const filterOutputs = (val, update, index) => {
      if (typeof update !== 'function') return
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard?.rows.category) return update(() => (filteredOutputOptions.value[index] = []))

      const needle = (val || '').toLowerCase()
      const categoryId = standard.rows.category

      if (isSupportCategory(categoryId)) {
        const outputs = officeLibraryStore.category_outputs
          .filter((output) => output.f_category_id === categoryId)
          .map((output) => ({
            id: output.id,
            label: output.name,
            value: output.id,
            name: output.name,
            code: output.code || '',
            description: output.description || '',
          }))
        return update(() => {
          filteredOutputOptions.value[index] = outputs.filter(
            (o) =>
              o.label.toLowerCase().includes(needle) ||
              o.code?.toLowerCase().includes(needle) ||
              o.description?.toLowerCase().includes(needle),
          )
        })
      }

      const mfoId = standard.rows.mfo
      const outputs = officeLibraryStore.outputs
        .filter((output) => {
          if (output.f_category_id !== categoryId) return false
          if (mfoId && output.mfo_id !== mfoId) return false
          if (!mfoId && output.mfo_id !== null) return false
          return true
        })
        .map((output) => ({
          id: output.id,
          label: output.name,
          value: output.id,
          name: output.name,
          code: output.code || '',
          description: output.description || '',
        }))

      update(() => {
        filteredOutputOptions.value[index] = outputs.filter(
          (o) =>
            o.label.toLowerCase().includes(needle) ||
            o.code?.toLowerCase().includes(needle) ||
            o.description?.toLowerCase().includes(needle),
        )
      })
    }

    const sanitizeNumericInput = (row, field) => {
      if (!row[field]) return
      row[field] = row[field].replace(/[^0-9-]/g, '')
      const hyphens = row[field].split('-').length - 1
      if (hyphens > 1) row[field] = row[field].substring(0, row[field].lastIndexOf('-'))
    }

    const getQuantityComponent = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard) return ''
      if (standard.quantityIndicatorType === 'numeric') {
        return standard.standardOutcomeRows.find((row) => row.rating === '5')?.quantity || ''
      }
      if (standard.quantityIndicatorType === 'B') return quantityValue.value?.toString() || ''
      if (standard.quantityIndicatorType === 'C') return '100%'
      return ''
    }

    const getEffectivenessComponent = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard) return ''
      return standard.standardOutcomeRows.find((row) => row.rating === '5')?.effectiveness || ''
    }

    const getTimelinessComponent = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard) return ''
      const highestRating = standard.standardOutcomeRows[0]
      const midRating = standard.standardOutcomeRows[2]
      const parts = []

      if (standard.timelinessIndicatorType === 'beforeDeadline') {
        if (standard.activeTimelinessInputs.range && midRating.timelinessRange)
          parts.push(midRating.timelinessRange)
        if (standard.activeTimelinessInputs.date && midRating.timelinessDate)
          parts.push(`by ${midRating.timelinessDate}`)
        if (standard.activeTimelinessInputs.description && midRating.timelinessText)
          parts.push(midRating.timelinessText)
      } else {
        if (standard.activeTimelinessInputs.range && highestRating.timelinessRange)
          parts.push(highestRating.timelinessRange)
        if (standard.activeTimelinessInputs.date && highestRating.timelinessDate)
          parts.push(`by ${highestRating.timelinessDate}`)
        if (standard.activeTimelinessInputs.description && highestRating.timelinessText)
          parts.push(highestRating.timelinessText)
      }

      return parts.join(' ')
    }

    const generateSuccessIndicator = (index) => {
      if (!currentEmployee.value?.performanceStandards) return
      const applyIndex = Number.isInteger(index)
        ? [index]
        : currentEmployee.value.performanceStandards.map((_, i) => i)

      applyIndex.forEach((i) => {
        const standard = currentEmployee.value.performanceStandards[i]
        if (!standard) return

        const quantityPart = getQuantityComponent(i)
        const outputNamePart = standard.outputName?.trim() || ''
        const indicatorNamePart =
          typeof standard.indicatorName === 'number' || !isNaN(standard.indicatorName)
            ? officeLibraryIndicatorStore.verbs.find((v) => v.id === standard.indicatorName)
                ?.indicator_name ||
              officeLibraryIndicatorStore.verbs.find((v) => v.id === standard.indicatorName)
                ?.name ||
              ''
            : (standard.indicatorName || '').trim()

        const effectivenessPart = getEffectivenessComponent(i)
        const timelinessPart = getTimelinessComponent(i)

        standard.successIndicator = [
          quantityPart,
          outputNamePart,
          indicatorNamePart,
          effectivenessPart,
          timelinessPart,
        ]
          .filter(Boolean)
          .join(' ')
      })
    }

    const onQuantityUpdate = (row, field, index) => {
      sanitizeNumericInput(row, field)
      generateSuccessIndicator(index)
    }

    const onTimelinessUpdate = (row, field, index) => {
      sanitizeNumericInput(row, field)
      generateSuccessIndicator(index)
    }

    const onEffectivenessUpdate = (row, index) => {
      formInteracted.value = true
      generateSuccessIndicator(index)
    }

    const onEffectivenessFieldFocus = () => {
      formInteracted.value = true
    }

    const onTimelinessTypeSelect = (value, index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard) return
      standard.timelinessIndicatorType = value
      Object.assign(standard.timelinessInputs, { range: true, date: false, description: false })
      generateSuccessIndicator(index)
    }

    const applyTimelinessInputs = (type, index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard) return
      Object.assign(standard.activeTimelinessInputs, standard.timelinessInputs)

      if (
        !standard.activeTimelinessInputs.range &&
        !standard.activeTimelinessInputs.date &&
        !standard.activeTimelinessInputs.description
      ) {
        standard.activeTimelinessInputs.range = true
        standard.timelinessInputs.range = true
      }

      standard.standardOutcomeRows.forEach((row) => {
        if (!standard.activeTimelinessInputs.range) row.timelinessRange = ''
        if (!standard.activeTimelinessInputs.date) row.timelinessDate = ''
        if (!standard.activeTimelinessInputs.description) row.timelinessText = ''
      })

      $q.notify({
        message: `Applied ${type === 'beforeDeadline' ? 'Before Deadline' : 'On Deadline'} input types`,
        color: 'positive',
        position: 'top',
      })
      generateSuccessIndicator(index)
    }

    const onQuantityOptionSelect = (value, index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard) return
      standard.quantityIndicatorType = value
      currentStandardIndex.value = index

      if (value === 'B') {
        quantityValue.value = null
        showQuantityModal.value = true
      } else if (value === 'C') {
        computeQuantities()
      } else {
        standard.standardOutcomeRows.forEach((row) => (row.quantity = ''))
        generateSuccessIndicator(index)
      }
    }

    const computeQuantities = () => {
      const index = currentStandardIndex.value
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard) return

      if (
        standard.quantityIndicatorType === 'B' &&
        (!quantityValue.value || isNaN(quantityValue.value))
      ) {
        return $q.notify({
          message: 'Please enter a valid number',
          color: 'negative',
          position: 'top',
        })
      }

      standard.standardOutcomeRows.forEach((row) => (row.quantity = ''))

      if (standard.quantityIndicatorType === 'B') {
        const base = Number(quantityValue.value)
        standard.standardOutcomeRows[0].quantity = `${Math.ceil(base * 1.3)} and above`
        standard.standardOutcomeRows[1].quantity = `${Math.ceil(base * 1.15)}-${Math.floor(base * 1.3) - 1}`
        standard.standardOutcomeRows[2].quantity = `${base}-${Math.floor(base * 1.15) - 1}`
        standard.standardOutcomeRows[3].quantity = `${Math.ceil(base * 0.51)}-${Math.floor(base * 0.99)}`
        standard.standardOutcomeRows[4].quantity = `${Math.floor(base * 0.5)} and below`
        $q.notify({
          message: 'Quantities calculated successfully',
          color: 'positive',
          position: 'top',
        })
      } else if (standard.quantityIndicatorType === 'C') {
        standard.standardOutcomeRows[0].quantity = '100% and above'
        standard.standardOutcomeRows[1].quantity = '88%-99%'
        standard.standardOutcomeRows[2].quantity = '77%-87%'
        standard.standardOutcomeRows[3].quantity = '38%-76%'
        standard.standardOutcomeRows[4].quantity = '37% and below'
      }

      showQuantityModal.value = false
      generateSuccessIndicator(index)
    }

    const cancelQuantityInput = () => {
      const index = currentStandardIndex.value
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (standard) standard.quantityIndicatorType = 'numeric'
      showQuantityModal.value = false
    }

    const addPerformanceStandard = () => {
      if (!currentEmployee.value) currentEmployee.value = createDefaultEmployeeData()
      if (!currentEmployee.value.performanceStandards)
        currentEmployee.value.performanceStandards = []
      currentEmployee.value.performanceStandards.push(createDefaultPerformanceStandard())
      $q.notify({
        message: `Added new performance standard ${currentEmployee.value.performanceStandards.length}`,
        color: 'positive',
        position: 'top',
      })
    }

    const removePerformanceStandard = (index) => {
      const standards = currentEmployee.value?.performanceStandards
      if (!standards) return
      if (standards.length <= 1) {
        return $q.notify({
          message: 'Cannot remove the only performance standard',
          color: 'negative',
          position: 'top',
        })
      }

      $q.dialog({
        title: 'Confirm Deletion',
        message: `Are you sure you want to remove Performance Standard ${index + 1}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        standards.splice(index, 1)
        $q.notify({ message: 'Performance standard removed', color: 'positive', position: 'top' })
      })
    }

    const validateStrictNumeric = (value) => {
      if (!value) return true
      const pattern = /^\d+(?:-\d+)?$/
      return pattern.test(value) || 'Enter a valid number or range (e.g., 10 or 10-20)'
    }

    const blockInvalidChars = (event) => {
      const allowedKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
      ]
      if (allowedKeys.includes(event.key)) return
      if (event.key >= '0' && event.key <= '9') return
      if (event.key === '-') {
        if (event.target.value.includes('-')) event.preventDefault()
        return
      }
      event.preventDefault()
    }

    const parseDateFromString = (dateStr) => {
      if (!dateStr) return ''
      const dateMatch = dateStr.match(/\d{4}-\d{2}-\d{2}/)
      return dateMatch ? dateMatch[0] : ''
    }

    const getLevelText = (level) => {
      if (level === '1') return '1st Level'
      if (level === '2') return '2nd Level'
      return `Level ${level}`
    }

    const getSGRange = (sg, level) => {
      const levelText = getLevelText(level)
      const salaryGrades = competencyStore.getSalaryGrades(levelText)
      if (!salaryGrades) return sg?.toString?.() || ''

      for (const range of salaryGrades) {
        if (range.includes('-')) {
          const [min, max] = range.split('-').map(Number)
          if (Number(sg) >= min && Number(sg) <= max) return range
        } else if (Number(sg) === Number(range)) return range
      }
      return sg?.toString?.() || ''
    }

    const updateEmployeeCompetencies = (employee) => {
      if (!employee?.sg || !employee?.level) {
        coreCompetencies.value = []
        technicalCompetencies.value = []
        leadershipCompetencies.value = []
        return
      }

      const levelText = getLevelText(employee.level)
      const sgRange = getSGRange(employee.sg, employee.level)
      const row = competencyStore.getRow(levelText, sgRange)
      if (!row) {
        coreCompetencies.value = []
        technicalCompetencies.value = []
        leadershipCompetencies.value = []
        return
      }

      coreCompetencies.value = [
        { code: 'DSE', value: row.DSE, description: competencyStore.descriptions.core.DSE },
        { code: 'EI', value: row.EI, description: competencyStore.descriptions.core.EI },
        { code: 'IS', value: row.IS, description: competencyStore.descriptions.core.IS },
      ].filter((c) => c.value && c.value !== '-')

      technicalCompetencies.value = [
        {
          code: 'P&O',
          value: row['P&O'],
          description: competencyStore.descriptions.technical['P&O'],
        },
        {
          code: 'M&E',
          value: row['M&E'],
          description: competencyStore.descriptions.technical['M&E'],
        },
        { code: 'RM', value: row.RM, description: competencyStore.descriptions.technical.RM },
        {
          code: 'P&N',
          value: row['P&N'],
          description: competencyStore.descriptions.technical['P&N'],
        },
        { code: 'PM', value: row.PM, description: competencyStore.descriptions.technical.PM },
        { code: 'AD', value: row.AD, description: competencyStore.descriptions.technical.AD },
      ].filter((c) => c.value && c.value !== '-')

      leadershipCompetencies.value = [
        { code: 'TSC', value: row.TSC, description: competencyStore.descriptions.leadership.TSC },
        {
          code: 'PSDM',
          value: row.PSDM,
          description: competencyStore.descriptions.leadership.PSDM,
        },
        {
          code: 'BCIWR',
          value: row.BCIWR,
          description: competencyStore.descriptions.leadership.BCIWR,
        },
        {
          code: 'MPCR',
          value: row.MPCR,
          description: competencyStore.descriptions.leadership.MPCR,
        },
      ].filter((c) => c.value && c.value !== '-')
    }

    const initializeUWPData = async () => {
      try {
        const stored = sessionStorage.getItem('uwpData')
        if (stored) uwpData.value = JSON.parse(stored)

        const { controlNo, semester, year } = props
        if (semester && year) uwpData.value.targetPeriod = { semester, year }

        if (controlNo && semester && year) {
          await fetchEmployeeData(controlNo, semester, year)
          return
        }

        const routeSemester = router.currentRoute.value.query.semester
        const routeYear = router.currentRoute.value.query.year
        if (routeSemester && routeYear) {
          await fetchEmployeeData(controlNo, routeSemester, routeYear)
          return
        }

        $q.notify({
          message: 'Missing semester and year parameters',
          color: 'warning',
          position: 'top',
        })
        currentEmployee.value = createDefaultEmployeeData()
      } catch (error) {
        console.error('Failed to initialize UWP data:', error)
        currentEmployee.value = createDefaultEmployeeData()
      }
    }

    const fetchEmployeeData = async (controlNo, semester, year) => {
      isLoadingFilteredEmployees.value = true
      try {
        const employeeData = await uwpStore.fetchEmployeeByControlNo(controlNo, semester, year)
        if (employeeData?.length) {
          currentEmployee.value = employeeData[0]
          uwpData.value.editingEmployee = currentEmployee.value

          if (currentEmployee.value.hierarchy)
            Object.assign(uwpData.value.hierarchy, currentEmployee.value.hierarchy)
          if (currentEmployee.value.targetPeriod) {
            uwpData.value.targetPeriod = {
              ...uwpData.value.targetPeriod,
              ...currentEmployee.value.targetPeriod,
            }
          }

          if (!currentEmployee.value.performanceStandards?.length) {
            currentEmployee.value.performanceStandards = [createDefaultPerformanceStandard()]
          } else {
            currentEmployee.value.performanceStandards =
              currentEmployee.value.performanceStandards.map((standard) => {
                const defaultStandard = createDefaultPerformanceStandard()
                const apiStandard = standard.apiData || {}
                const configurations = apiStandard.configurations || []

                let timelinessInputs = { range: true, date: false, description: false }
                let activeTimelinessInputs = { ...timelinessInputs }
                const objectConfig = configurations.find((config) => config.type === 'object')

                if (objectConfig) {
                  const timelinessStr = objectConfig.timeliness || ''
                  const hasDate = /\d{4}-\d{2}-\d{2}/.test(timelinessStr)
                  const hasRange = /(\d+-\d+|as per schedule)/i.test(timelinessStr)
                  const hasDescription =
                    timelinessStr &&
                    !hasDate &&
                    !hasRange &&
                    !/^\d+(?:-\d+)?$/.test(timelinessStr) &&
                    !/^\d{4}-\d{2}-\d{2}$/.test(timelinessStr)

                  timelinessInputs = { range: hasRange, date: hasDate, description: hasDescription }
                  activeTimelinessInputs = { ...timelinessInputs }
                }

                let quantityIndicatorType = 'numeric'
                if (configurations.some((config) => config.type === 'B'))
                  quantityIndicatorType = 'B'
                else if (configurations.some((config) => config.type === 'C'))
                  quantityIndicatorType = 'C'

                let timelinessIndicatorType = 'beforeDeadline'
                if (configurations.some((config) => config.type === 'onDeadline'))
                  timelinessIndicatorType = 'onDeadline'

                const updatedRows = (
                  standard.standardOutcomeRows || defaultStandard.standardOutcomeRows
                ).map((row) => {
                  const apiOutcome =
                    apiStandard.standardOutcomes?.find(
                      (out) => out.rating?.toString() === row.rating,
                    ) || {}
                  return {
                    ...row,
                    quantity: apiOutcome.quantity_target || row.quantity || '',
                    effectiveness: apiOutcome.effectiveness_criteria || row.effectiveness || '',
                    timeliness: apiOutcome.timeliness_range || row.timeliness || '',
                    timelinessRange: timelinessInputs.range
                      ? apiOutcome.timeliness_range || row.timelinessRange || ''
                      : '',
                    timelinessText: timelinessInputs.description
                      ? apiOutcome.timeliness_range || row.timelinessText || ''
                      : '',
                    timelinessDate:
                      timelinessInputs.date && apiOutcome.timeliness_range
                        ? parseDateFromString(apiOutcome.timeliness_range)
                        : row.timelinessDate || '',
                  }
                })

                return {
                  ...defaultStandard,
                  ...standard,
                  id: standard.id || defaultStandard.id,
                  outputName: apiStandard.output_name || standard.outputName || '',
                  indicatorName: apiStandard.performance_indicator || standard.indicatorName || '',
                  successIndicator:
                    apiStandard.success_indicator || standard.successIndicator || '',
                  requiredOutput: apiStandard.required_output || standard.requiredOutput || '',
                  rows: {
                    category: apiStandard.category || standard.rows?.category || null,
                    mfo: apiStandard.mfo || standard.rows?.mfo || null,
                    output: apiStandard.output || standard.rows?.output || null,
                  },
                  quantityIndicatorType,
                  timelinessIndicatorType,
                  timelinessInputs,
                  activeTimelinessInputs,
                  standardOutcomeRows: updatedRows,
                  apiData: apiStandard,
                }
              })
          }

          updateEmployeeCompetencies(currentEmployee.value)
          currentEmployee.value.performanceStandards?.forEach((_, idx) =>
            generateSuccessIndicator(idx),
          )
        } else {
          currentEmployee.value = createDefaultEmployeeData()
          currentEmployee.value.name = 'Unknown Employee'
          currentEmployee.value.controlNo = controlNo
          $q.notify({
            message: 'No existing work plan found. Creating new template.',
            color: 'info',
            position: 'top',
          })
        }
      } catch (error) {
        console.error('Error fetching employee data:', error)
        $q.notify({
          message: 'Failed to load employee data: ' + (error.message || 'Unknown error'),
          color: 'negative',
          position: 'top',
        })
        currentEmployee.value = createDefaultEmployeeData()
        currentEmployee.value.controlNo = controlNo
      } finally {
        isLoadingFilteredEmployees.value = false
      }
    }

    const onSubmit = async () => {
      shouldValidate.value = true
      formInteracted.value = true

      if (!currentEmployee.value?.employeeId) {
        return $q.notify({
          message: 'Please select an employee',
          color: 'negative',
          position: 'top',
        })
      }

      const invalid = []
      currentEmployee.value.performanceStandards?.forEach((_, idx) => {
        if (!hasMinimumEffectivenessValues(idx)) invalid.push(idx + 1)
      })

      if (invalid.length) {
        return $q.notify({
          message: `Please complete effectiveness criteria for standards: ${invalid.join(', ')}`,
          color: 'negative',
          position: 'top',
          timeout: 3000,
        })
      }

      try {
        const updateData = {
          uwpData: uwpData.value,
          form: {
            semester: uwpData.value.targetPeriod?.semester || '',
            year: uwpData.value.targetPeriod?.year || new Date().getFullYear(),
          },
          employee: {
            ...currentEmployee.value,
            performanceStandards: currentEmployee.value.performanceStandards?.map((standard) => {
              const categoryName =
                standard.rows?.category?.name ||
                standard.rows?.category?.label ||
                standard.rows?.category ||
                ''
              const mfoName =
                standard.rows?.mfo?.name || standard.rows?.mfo?.label || standard.rows?.mfo || ''
              const outputName =
                standard.rows?.output?.name ||
                standard.rows?.output?.label ||
                standard.rows?.output ||
                ''
              return {
                ...standard,
                rows: {
                  category: {
                    id:
                      typeof standard.rows?.category === 'object'
                        ? standard.rows.category.id
                        : standard.rows?.category,
                    name: categoryName,
                  },
                  mfo: {
                    id:
                      typeof standard.rows?.mfo === 'object'
                        ? standard.rows.mfo.id
                        : standard.rows?.mfo,
                    name: mfoName,
                  },
                  output: {
                    id:
                      typeof standard.rows?.output === 'object'
                        ? standard.rows.output.id
                        : standard.rows?.output,
                    name: outputName,
                  },
                },
              }
            }),
          },
          timestamp: new Date().toISOString(),
        }

        await uwpStore.updateUWP(updateData, officeLibraryIndicatorStore)

        $q.notify({
          message: 'Unit Work Plan updated successfully',
          color: 'positive',
          icon: 'check_circle',
          position: 'top',
        })
        router.push('/office/spms')
      } catch (error) {
        $q.notify({
          message: error.message || 'Failed to update Unit Work Plan',
          color: 'negative',
          position: 'top',
        })
        console.error('Update error:', error)
      }
    }

    onMounted(async () => {
      await initializeUWPData()
      if (currentEmployee.value) updateEmployeeCompetencies(currentEmployee.value)

      const officeId = uwpData.value.hierarchy.office?.id || 1
      try {
        await officeLibraryStore.fetchAllData(officeId)
        await officeLibraryIndicatorStore.fetchVerbs()
      } catch (error) {
        console.error('Error loading data:', error)
        $q.notify({ message: 'Failed to load data', color: 'negative', position: 'top' })
      }
    })

    watch(
      () => currentEmployee.value?.performanceStandards,
      () =>
        currentEmployee.value?.performanceStandards?.forEach((_, idx) =>
          generateSuccessIndicator(idx),
        ),
      { deep: true },
    )

    watch(
      () => currentEmployee.value,
      (emp) => updateEmployeeCompetencies(emp),
      { deep: true },
    )

    return {
      // state
      uwpData,
      currentEmployee,
      coreCompetencies,
      technicalCompetencies,
      leadershipCompetencies,
      filteredMfoOptions,
      filteredOutputOptions,
      filteredVerbs,
      formInteracted,
      shouldValidate,
      showQuantityModal,
      quantityValue,
      currentStandardIndex,
      isLoadingFilteredEmployees,

      // computed
      breadcrumbDisplay,
      selectedEmployee,
      hierarchyLabels,
      semesterOptions,
      yearOptions,
      categoryOptions,
      performanceIndicatorOptions,
      standardOutcomeColumns,
      isFormValid,

      // constants
      quantityIndicator,

      // methods
      isSupportCategory,
      hasMinimumEffectivenessValues,
      filterPerformanceIndicators,
      getFilteredMfoOptions,
      getFilteredOutputOptions,
      clearDependentFields,
      filterMfos,
      filterOutputs,
      generateSuccessIndicator,
      onQuantityUpdate,
      onTimelinessUpdate,
      onEffectivenessUpdate,
      onEffectivenessFieldFocus,
      onQuantityOptionSelect,
      onTimelinessTypeSelect,
      applyTimelinessInputs,
      computeQuantities,
      cancelQuantityInput,
      addPerformanceStandard,
      removePerformanceStandard,
      onSubmit,
      onBack: () => router.back(),
      validateStrictNumeric,
      blockInvalidChars,
      timelinessColumnClass,
      numberCom,
      uwpStore,
    }
  },
}
</script>

<style scoped>
.q-card {
  padding: 5px;
  background-color: #f7fafc;
}

.clean-table {
  border-radius: 8px;
}

.status-badge {
  border-radius: 4px;
  padding: 4px 8px;
}

.competency-card {
  height: 100%;
}

.competency-list {
  min-height: 100px;
  max-height: 150px;
  overflow-y: auto;
  padding: 4px;
}

.competency-item {
  padding: 4px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.competency-item:last-child {
  border-bottom: none;
}

.autogrow-textarea {
  width: 100%;
}

.autogrow-textarea .q-field__native {
  resize: none;
  transition: min-height 0.2s ease;
}

.autogrow-textarea .q-field__control {
  height: auto !important;
  min-height: 56px;
}

.effectiveness-textarea .q-field__control {
  height: auto !important;
  min-height: 45px;
}

.effectiveness-textarea .q-field__native {
  resize: none;
}

.effectiveness-error {
  background-color: rgba(255, 0, 0, 0.05);
}

.q-field--dense .q-field__marginal {
  height: 40px;
}

.text-subtitle {
  font-weight: 500;
  font-size: 1rem;
}

.text-subtitle2 {
  font-weight: 500;
  font-size: 0.875rem;
}

.full-height {
  height: 100%;
}

.standard-outcome-table {
  width: 100%;
  table-layout: fixed !important;
}

.standard-outcome-table th,
.standard-outcome-table td {
  overflow: hidden;
  white-space: normal;
  word-wrap: break-word;
}

.fixed-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
}

.input-cell {
  padding: 8px;
}

.numeric-display {
  padding: 8px;
  text-align: center;
}

.modal-header {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.modal-body {
  padding: 20px;
}

.modal-actions {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.q-slide-transition {
  transition: all 0.3s ease;
}

.bg-grey-2 {
  background-color: #f5f5f5;
}

.justify-center .q-btn {
  transition: transform 0.2s ease;
}

.justify-center .q-btn:hover {
  transform: scale(1.05);
}

.q-card {
  transition: box-shadow 0.2s ease;
}

.q-card:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.org-hierarchy-card {
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.table-container {
  overflow-x: auto;
  max-width: 100%;
}

@media (max-width: 768px) {
  .col-md-2,
  .col-md-3,
  .col-md-4,
  .col-md-5,
  .col-md-6,
  .col-md-8 {
    width: 100%;
    margin-bottom: 16px;
  }

  .competency-list > div {
    white-space: normal;
  }

  .employee-tabs-container {
    flex-direction: column;
  }

  .q-tabs {
    width: 100%;
    overflow-x: auto;
  }
}
</style>
