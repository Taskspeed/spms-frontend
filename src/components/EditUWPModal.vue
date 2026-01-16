<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- Loading overlay -->
  <div v-if="isLoading || isLoadingFilteredEmployees" class="loading-overlay">
    <q-spinner-gears size="50px" color="primary" />
    <div class="q-mt-md text-h6">Loading Work Plan Data...</div>
    <div class="q-mt-sm text-caption text-grey">Please wait while we fetch the data</div>
  </div>

  <!-- Main content - only show when not loading -->
  <q-card v-show="!isLoading && !isLoadingFilteredEmployees">
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
        <q-btn flat dense icon="arrow_back" label="Back" color="grey-8" @click="$emit('close')" />
      </div>
    </div>

    <!-- Target Period Details Card -->
    <div class="col-12 q-mb-md">
      <q-card flat bordered>
        <q-card-section class="q-pa-sm">
          <div class="text-subtitle2">Target Period Details</div>
          <div v-if="isLoadingTargetPeriod" class="loading-skeleton q-mt-sm">
            <q-skeleton type="text" width="60%" class="q-mb-xs" />
            <q-skeleton type="text" width="80%" class="q-mb-xs" />
            <q-skeleton type="text" width="70%" />
          </div>
        </q-card-section>
        <q-separator v-if="!isLoadingTargetPeriod" />
        <q-card-section v-if="!isLoadingTargetPeriod" class="q-pa-sm">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="column q-gutter-sm">
                <q-input
                  v-model="targetPeriodDetails.semester"
                  readonly
                  label="Semester"
                  outlined
                  dense
                >
                  <template #prepend>
                    <q-icon name="calendar_view_month" size="xs" />
                  </template>
                </q-input>

                <q-separator />

                <q-input
                  v-model="targetPeriodDetails.office"
                  label="Office"
                  outlined
                  dense
                  readonly
                >
                  <template #prepend>
                    <q-icon name="account_balance" size="xs" />
                  </template>
                </q-input>

                <q-input
                  v-model="targetPeriodDetails.office2"
                  label="Sub-Office"
                  outlined
                  dense
                  readonly
                >
                  <template #prepend>
                    <q-icon name="business" size="xs" />
                  </template>
                </q-input>

                <q-input v-model="targetPeriodDetails.group" label="Group" outlined dense readonly>
                  <template #prepend>
                    <q-icon name="group_work" size="xs" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="column q-gutter-sm">
                <q-input v-model="targetPeriodDetails.year" readonly label="Year" outlined dense>
                  <template #prepend>
                    <q-icon name="event" size="xs" />
                  </template>
                </q-input>

                <q-separator />

                <q-input
                  v-model="targetPeriodDetails.division"
                  label="Division"
                  outlined
                  dense
                  readonly
                >
                  <template #prepend>
                    <q-icon name="business" size="xs" />
                  </template>
                </q-input>

                <q-input
                  v-model="targetPeriodDetails.section"
                  label="Section"
                  outlined
                  dense
                  readonly
                >
                  <template #prepend>
                    <q-icon name="account_tree" size="xs" />
                  </template>
                </q-input>

                <q-input v-model="targetPeriodDetails.unit" label="Unit" outlined dense readonly>
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
            <div v-if="isLoadingEmployeeInfo" class="loading-skeleton">
              <q-skeleton type="text" width="100px" />
            </div>
          </div>

          <div v-if="isLoadingEmployeeInfo" class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-skeleton type="text" height="40px" class="q-mb-md" />
            </div>
            <div class="col-12 col-md-6">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-skeleton type="text" height="40px" class="q-mb-md" />
                </div>
                <div class="col-12 col-md-6">
                  <q-skeleton type="text" height="40px" class="q-mb-md" />
                </div>
              </div>
            </div>
          </div>

          <div v-else>
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
                    <q-input
                      v-model="selectedEmployee.rank"
                      label="Function"
                      outlined
                      dense
                      readonly
                    >
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

              <div v-if="isLoadingStandards" class="text-center q-pa-xl">
                <q-spinner-gears size="40px" color="primary" />
                <div class="q-mt-md">Loading performance standards...</div>
              </div>

              <div v-else class="q-mt-md">
                <div
                  v-for="(standard, index) in currentEmployee.performanceStandards"
                  :key="'perf-std-' + standard.id"
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
                            v-if="currentEmployee.performanceStandards.length > 1"
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
                                      <template #selected>
                                        <span v-if="standard.rows.category">
                                          {{ getCategoryLabel(standard.rows.category) }}
                                        </span>
                                      </template>
                                    </q-select>

                                    <!-- MFO DROPDOWN - Fixed -->
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
                                      <template #selected>
                                        <span v-if="standard.rows.mfo">
                                          {{ getMfoLabel(standard.rows.mfo) }}
                                        </span>
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

                                    <!-- OUTPUT DROPDOWN - Fixed -->
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
                                      <template #selected>
                                        <span v-if="standard.rows.output">
                                          {{
                                            getOutputLabel(
                                              standard.rows.output,
                                              standard.rows.category,
                                              standard.rows.mfo,
                                            )
                                          }}
                                        </span>
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
                                          <div class="text-caption text-weight-medium">
                                            Technical
                                          </div>
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
                                              @click="
                                                applyTimelinessInputs('beforeDeadline', index)
                                              "
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
                    :loading="isAddingStandard"
                  />
                </div>
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
      <q-btn label="Cancel" color="grey" flat dense @click="$emit('close')" />
      <q-btn
        label="Update"
        color="green-7"
        icon="save"
        @click="onSubmit"
        :disable="!isFormValid || uwpStore.loading || isLoading"
        :loading="uwpStore.loading"
      />
    </div>
  </q-card>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
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
  emits: ['close', 'cancel', 'saved'],
  props: {
    employee: { type: Object, default: null },
    controlNo: { type: [String, Number], required: true },
    semester: { type: [String, Number], required: true },
    year: { type: [String, Number], required: true },
  },

  setup(props, { emit }) {
    const $q = useQuasar()
    const officeLibraryStore = useMfoStore()
    const officeLibraryIndicatorStore = useLibraryStore()
    const uwpStore = useUnitWorkPlanStore()
    const competencyStore = useCompetencyStore()

    // Add loading states
    const isLoading = ref(true)
    const isLoadingTargetPeriod = ref(true)
    const isLoadingEmployeeInfo = ref(true)
    const isLoadingStandards = ref(true)
    const isAddingStandard = ref(false)

    const filteredMfoOptions = ref({})
    const filteredOutputOptions = ref({})
    const filteredVerbs = ref([])

    // FIXED: Add targetPeriodDetails ref to store the actual target period data
    const targetPeriodDetails = ref({
      semester: '',
      year: '',
      office: '',
      office2: '',
      group: '',
      division: '',
      section: '',
      unit: '',
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

    const onBack = () => {
      console.log('Back button clicked')
      // Emit an event to parent component
      emit('close') // or emit('back') or emit('cancel')
    }
    const semesterOptions = computed(() => uwpStore.getSemesterOptions)
    const yearOptions = computed(() => uwpStore.getYearOptions)

    const breadcrumbDisplay = computed(() => {
      if (!currentEmployee.value?.employeeData?.target_periods?.[0]) return 'Loading...'

      const targetPeriod = currentEmployee.value.employeeData.target_periods[0]
      const parts = []
      if (targetPeriod.office) parts.push(targetPeriod.office)
      if (targetPeriod.division) parts.push(targetPeriod.division)
      if (targetPeriod.section) parts.push(targetPeriod.section)
      if (targetPeriod.unit) parts.push(targetPeriod.unit)

      return parts.join(' / ') || 'Organization Structure'
    })

    const selectedEmployee = computed(() => {
      if (!currentEmployee.value) return { name: '', rank: '', position: '', sg: '', level: '' }
      const { name = '', rank = '', position = '', sg = '', level = '' } = currentEmployee.value
      return { name, rank, position, sg, level }
    })

    // Add these functions to resolve labels from IDs/objects
    const getCategoryLabel = (categoryValue) => {
      if (!categoryValue) return ''

      // If it's already a string (label), return it
      if (typeof categoryValue === 'string' && isNaN(Number(categoryValue))) {
        return categoryValue
      }

      // If it's an object with label/name property
      if (typeof categoryValue === 'object' && categoryValue !== null) {
        return categoryValue.name || categoryValue.label || ''
      }

      // If it's an ID, find in store
      const categoryId = typeof categoryValue === 'object' ? categoryValue.id : categoryValue
      const category = officeLibraryStore.categories.find((cat) => cat.id === categoryId)
      return category?.name || category?.label || ''
    }

    const getMfoLabel = (mfoValue) => {
      if (!mfoValue) return ''

      // If it's already a string (label), return it
      if (typeof mfoValue === 'string' && isNaN(Number(mfoValue))) {
        return mfoValue
      }

      // If it's an object with label/name property
      if (typeof mfoValue === 'object' && mfoValue !== null) {
        return mfoValue.name || mfoValue.label || ''
      }

      // If it's an ID, find in store
      const mfoId = typeof mfoValue === 'object' ? mfoValue.id : mfoValue
      const mfo = officeLibraryStore.mfos.find((m) => m.id === mfoId)
      return mfo?.name || mfo?.label || ''
    }

    const getOutputLabel = (outputValue, categoryValue, mfoValue) => {
      if (!outputValue) return ''

      // If it's already a string (label), return it
      if (typeof outputValue === 'string' && isNaN(Number(outputValue))) {
        return outputValue
      }

      // If it's an object with label/name property
      if (typeof outputValue === 'object' && outputValue !== null) {
        return outputValue.name || outputValue.label || ''
      }

      // If it's an ID, find in store
      const outputId = typeof outputValue === 'object' ? outputValue.id : outputValue

      // Get category ID
      const categoryId = categoryValue
        ? typeof categoryValue === 'object'
          ? categoryValue.id
          : categoryValue
        : null

      // Check if it's a support category
      const isSupport = categoryId ? isSupportCategory(categoryId) : false

      if (isSupport) {
        // Look in category_outputs
        const output = officeLibraryStore.category_outputs.find((o) => o.id === outputId)
        return output?.name || output?.label || ''
      } else {
        // Look in regular outputs
        const mfoId = mfoValue ? (typeof mfoValue === 'object' ? mfoValue.id : mfoValue) : null

        const output = officeLibraryStore.outputs.find(
          (o) =>
            o.id === outputId && o.f_category_id === categoryId && (!mfoId || o.mfo_id === mfoId),
        )
        return output?.name || output?.label || ''
      }
    }

    // FIXED: This was incorrect - should use actual target period data
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
      const hasTargetPeriod = targetPeriodDetails.value?.semester && targetPeriodDetails.value?.year
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
      // Use the computed property directly from the store
      const base = officeLibraryIndicatorStore.verbs.map((verb) => ({
        id: verb.id,
        label: verb.indicator_name || verb.name,
        value: verb.id,
        name: verb.indicator_name || verb.name,
        description: verb.description || '',
      }))
      const filtered = base.filter(
        (verb) =>
          verb.label.toLowerCase().includes(needle) ||
          verb.description.toLowerCase().includes(needle),
      )
      if (typeof update === 'function') update(() => (filteredVerbs.value = filtered))
      else filteredVerbs.value = filtered
    }

    const isSupportCategory = (categoryId) => {
      if (!categoryId) return false // Handle null/undefined

      // If categoryId is an object with id property
      const id = typeof categoryId === 'object' ? categoryId.id : categoryId
      if (!id) return false

      const category = officeLibraryStore.categories.find((cat) => cat.id === id)
      return category && category.name === 'C. SUPPORT FUNCTION'
    }

    // In the setup() function, modify these computed-like functions:

    const getFilteredMfoOptions = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard?.rows.category) return []

      // Use computed or watch to make it reactive
      return computed(() => {
        const categoryId =
          typeof standard.rows.category === 'object'
            ? standard.rows.category.id
            : standard.rows.category

        return officeLibraryStore.mfos
          .filter((mfo) => mfo.f_category_id === categoryId)
          .map((mfo) => ({
            id: mfo.id,
            label: mfo.name,
            value: mfo.id,
            name: mfo.name,
            code: mfo.code || '',
            description: mfo.description || '',
          }))
      }).value
    }

    const getFilteredOutputOptions = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard?.rows?.category) return [] // Add optional chaining here

      return computed(() => {
        const category = standard.rows.category
        // Add null check before accessing .id
        if (!category) return []

        const categoryId = typeof category === 'object' ? category.id : category

        if (isSupportCategory(categoryId)) {
          // Handle support category
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

        const mfo = standard.rows.mfo
        const mfoId = mfo ? (typeof mfo === 'object' ? mfo.id : mfo) : null

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
      }).value
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

    const addPerformanceStandard = async () => {
      isAddingStandard.value = true
      try {
        if (!currentEmployee.value) currentEmployee.value = createDefaultEmployeeData()
        if (!currentEmployee.value.performanceStandards)
          currentEmployee.value.performanceStandards = []
        currentEmployee.value.performanceStandards.push(createDefaultPerformanceStandard())
        $q.notify({
          message: `Added new performance standard ${currentEmployee.value.performanceStandards.length}`,
          color: 'positive',
          position: 'top',
        })
      } catch (error) {
        console.error('Error adding standard:', error)
        $q.notify({
          message: 'Failed to add performance standard',
          color: 'negative',
          position: 'top',
        })
      } finally {
        isAddingStandard.value = false
      }
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
        isLoading.value = true
        isLoadingTargetPeriod.value = true
        isLoadingEmployeeInfo.value = true
        isLoadingStandards.value = true

        const { controlNo, semester, year } = props

        // Set default values from props
        targetPeriodDetails.value.semester = semester
        targetPeriodDetails.value.year = year

        console.log('🔍 Initializing with props:', { controlNo, semester, year })

        if (controlNo && semester && year) {
          await fetchEmployeeData(controlNo, semester, year)
        } else {
          $q.notify({
            message: 'Missing required parameters',
            color: 'warning',
            position: 'top',
          })
          currentEmployee.value = createDefaultEmployeeData()
        }
      } catch (error) {
        console.error('Failed to initialize UWP data:', error)
        currentEmployee.value = createDefaultEmployeeData()
      } finally {
        // Set loading to false
        setTimeout(() => {
          isLoading.value = false
        }, 500)
      }
    }

    const fetchEmployeeData = async (controlNo, semester, year) => {
      isLoadingFilteredEmployees.value = true
      try {
        const employeeData = await uwpStore.fetchEmployeeByControlNo(controlNo, semester, year)
        console.log('📊 Employee data fetched:', employeeData)

        if (employeeData?.length) {
          const employee = employeeData[0]
          console.log('📊 Employee raw data:', employee)
          console.log('📊 Target periods from API:', employee.employeeData?.target_periods)

          // Set currentEmployee with basic info
          currentEmployee.value = {
            id: `emp_${employee.id || employee.employeeId}`,
            name: employee.name || 'Unknown Employee',
            employeeId: employee.id || employee.employeeId,
            controlNo: employee.controlNo || employee.employeeData?.ControlNo || controlNo,
            sg: employee.sg || employee.employeeData?.sg || '',
            level: employee.level || employee.employeeData?.level || '',
            rank: employee.rank || employee.employeeData?.rank || 'Employee',
            position: employee.position || employee.employeeData?.position || '',
            performanceStandards: [],
            employeeData: employee.employeeData || employee,
            hierarchy: {},
          }

          // Check if employee data has target periods directly
          let targetPeriod = null

          if (employee.employeeData?.target_periods?.[0]) {
            // Data from fetchEmployeeByControlNo returns with employeeData wrapper
            targetPeriod = employee.employeeData.target_periods[0]
          } else if (employee.target_periods?.[0]) {
            // Data from other sources might have it directly
            targetPeriod = employee.target_periods[0]
          }

          console.log('📊 Target period found:', targetPeriod)

          if (targetPeriod) {
            // Populate target period details
            targetPeriodDetails.value = {
              semester: targetPeriod.semester || semester,
              year: targetPeriod.year || year,
              office: targetPeriod.office || employee.office || '',
              office2: targetPeriod.office2 || '',
              group: targetPeriod.group || '',
              division: targetPeriod.division || '',
              section: targetPeriod.section || '',
              unit: targetPeriod.unit || '',
            }

            console.log('📊 Populated targetPeriodDetails:', targetPeriodDetails.value)

            // Store hierarchy for the employee
            currentEmployee.value.hierarchy = {
              office: targetPeriod.office || employee.office || '',
              office2: targetPeriod.office2 || '',
              group: targetPeriod.group || '',
              division: targetPeriod.division || '',
              section: targetPeriod.section || '',
              unit: targetPeriod.unit || '',
            }

            // Process performance standards
            const performanceStandards = targetPeriod.performance_standards || []
            console.log('📊 Performance standards from API:', performanceStandards)

            if (performanceStandards.length > 0) {
              currentEmployee.value.performanceStandards = performanceStandards.map((ps) => {
                console.log('📊 Processing PS:', ps)

                // Extract config - handle different structures
                const config = ps.config || targetPeriod.config || {}
                console.log('📊 Config for PS:', config)

                // Parse quantity indicator type
                let quantityIndicatorType = 'numeric'
                if (config.quantityIndicator === 'C' || config.quantity_indicator === 'C') {
                  quantityIndicatorType = 'C'
                } else if (config.quantityIndicator === 'B' || config.quantity_indicator === 'B') {
                  quantityIndicatorType = 'B'
                }

                // Parse timeliness indicator type
                let timelinessIndicatorType = 'beforeDeadline'
                if (
                  config.timelinessIndicator === 'onDeadline' ||
                  config.timeliness_indicator === 'onDeadline'
                ) {
                  timelinessIndicatorType = 'onDeadline'
                }

                // Parse timeliness inputs
                const timelinessType = config.timelinessType || {}
                const timelinessInputs = {
                  range: timelinessType.range === true,
                  date: timelinessType.date === true,
                  description: timelinessType.description === true,
                }

                console.log('📊 Parsed settings:', {
                  quantityIndicatorType,
                  timelinessIndicatorType,
                  timelinessInputs,
                })

                // Find category
                const categoryName = ps.category || ''
                const categoryObj = officeLibraryStore.categories?.find(
                  (cat) => cat.name?.toLowerCase() === categoryName?.toLowerCase(),
                ) || { id: null, name: categoryName, label: categoryName }

                // Find MFO
                const mfoName = ps.mfo || ''
                let mfoObj = null
                if (categoryObj.id && mfoName) {
                  mfoObj = officeLibraryStore.mfos?.find(
                    (mfo) =>
                      mfo.name?.toLowerCase() === mfoName?.toLowerCase() &&
                      mfo.f_category_id === categoryObj.id,
                  ) || { id: null, name: mfoName, label: mfoName }
                }

                // Find output
                const outputName = ps.output || ''
                let outputObj = null
                if (outputName) {
                  const isSupport =
                    categoryName.toLowerCase().includes('support') ||
                    categoryName.trim().toUpperCase().startsWith('C')

                  if (isSupport) {
                    outputObj = officeLibraryStore.category_outputs?.find(
                      (output) =>
                        output.name?.toLowerCase() === outputName?.toLowerCase() &&
                        output.f_category_id === categoryObj.id,
                    ) || { id: null, name: outputName, label: outputName }
                  } else {
                    outputObj = officeLibraryStore.outputs?.find(
                      (output) =>
                        output.name?.toLowerCase() === outputName?.toLowerCase() &&
                        output.f_category_id === categoryObj.id &&
                        (!mfoObj || output.mfo_id === mfoObj.id),
                    ) || { id: null, name: outputName, label: outputName }
                  }
                }

                // Build standard outcome rows from ratings
                const ratings = ps.ratings || []
                console.log('📊 Ratings for this PS:', ratings)

                const standardOutcomeRows = createDefaultStandardRows().map((row) => {
                  const ratingData = ratings.find((r) => r.rating?.toString() === row.rating)

                  if (ratingData) {
                    // Parse timeliness
                    const timelinessParsed = uwpStore.parseTimelinessFromApi(
                      ratingData.timeliness || '',
                    )

                    return {
                      ...row,
                      quantity: ratingData.quantity || '',
                      effectiveness: ratingData.effectiveness || '',
                      timeliness: ratingData.timeliness || '',
                      timelinessRange: timelinessParsed.range || '',
                      timelinessText: timelinessParsed.text || '',
                      timelinessDate: timelinessParsed.date || '',
                    }
                  }
                  return row
                })

                return {
                  id: `ps_${ps.id || Date.now()}`,
                  expanded: true,
                  outputName: ps.output_name || '',
                  indicatorName: ps.performance_indicator || '',
                  successIndicator: ps.success_indicator || '',
                  requiredOutput: ps.required_output || '',
                  modeOfVerification: '',
                  rows: {
                    category: categoryObj,
                    mfo: mfoObj,
                    output: outputObj,
                  },
                  quantityIndicatorType,
                  timelinessIndicatorType,
                  timelinessInputs,
                  activeTimelinessInputs: { ...timelinessInputs },
                  standardOutcomeRows,
                  coreCompetencies: ps.core || [],
                  technicalCompetencies: ps.technical || [],
                  leadershipCompetencies: ps.leadership || [],
                  apiData: ps, // Keep original data for reference
                }
              })
            } else {
              console.log('📊 No performance standards found, creating default')
              currentEmployee.value.performanceStandards = [createDefaultPerformanceStandard()]
            }
          } else {
            console.log('📊 No target period found, using props')
            targetPeriodDetails.value = {
              semester: semester,
              year: year,
              office: employee.office || '',
              office2: '',
              group: '',
              division: '',
              section: '',
              unit: '',
            }
            currentEmployee.value.performanceStandards = [createDefaultPerformanceStandard()]
          }

          updateEmployeeCompetencies(currentEmployee.value)

          // Generate success indicators for all standards
          currentEmployee.value.performanceStandards?.forEach((_, idx) => {
            setTimeout(() => generateSuccessIndicator(idx), 100)
          })

          console.log('✅ Final currentEmployee:', currentEmployee.value)
        } else {
          console.log('📊 No employee data returned')
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
        isLoadingTargetPeriod.value = false
        isLoadingEmployeeInfo.value = false
        isLoadingStandards.value = false
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
          uwpData: {
            hierarchy: targetPeriodDetails.value,
            targetPeriod: {
              semester: targetPeriodDetails.value.semester,
              year: targetPeriodDetails.value.year,
            },
          },
          form: {
            semester: targetPeriodDetails.value.semester,
            year: targetPeriodDetails.value.year,
          },
          employee: {
            ...currentEmployee.value,
            controlNo: props.controlNo, // Make sure controlNo is passed
            performanceStandards: currentEmployee.value.performanceStandards?.map((standard) => {
              return {
                ...standard,
                rows: {
                  category: standard.rows?.category?.id || standard.rows?.category,
                  mfo: standard.rows?.mfo?.id || standard.rows?.mfo,
                  output: standard.rows?.output?.id || standard.rows?.output,
                },
              }
            }),
          },
        }

        console.log('📤 Submitting update data:', {
          controlNo: props.controlNo,
          semester: targetPeriodDetails.value.semester,
          year: targetPeriodDetails.value.year,
          updateData,
        })

        await uwpStore.updateUWP(updateData, officeLibraryIndicatorStore, officeLibraryStore)

        $q.notify({
          message: 'Unit Work Plan updated successfully',
          color: 'positive',
          icon: 'check_circle',
          position: 'top',
        })

        // Close the modal after a short delay
        setTimeout(() => {
          emit('close')
        }, 1500)
      } catch (error) {
        $q.notify({
          message: error.message || 'Failed to update Unit Work Plan',
          color: 'negative',
          position: 'top',
        })
        console.error('Update error:', error.response?.data || error)
      }
    }

    onMounted(async () => {
      const officeId = 1 // Default office ID, adjust as needed

      console.log('🔄 Loading store data...')
      try {
        // Load store data FIRST
        await officeLibraryStore.fetchAllData(officeId)
        await officeLibraryIndicatorStore.fetchVerbs()

        console.log('✅ Store data loaded:', {
          categories: officeLibraryStore.categories,
          mfos: officeLibraryStore.mfos,
          outputs: officeLibraryStore.outputs,
          category_outputs: officeLibraryStore.category_outputs,
        })

        // THEN initialize UWP data
        await initializeUWPData()

        if (currentEmployee.value) {
          updateEmployeeCompetencies(currentEmployee.value)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        $q.notify({
          message: 'Failed to load library data: ' + error.message,
          color: 'negative',
          position: 'top',
        })
      } finally {
        isLoading.value = false
      }
    })

    watch(
      () => currentEmployee.value?.performanceStandards,
      (standards) => {
        if (!standards) return

        standards.forEach((standard, index) => {
          // Watch for category changes
          watch(
            () => standard.rows.category,
            () => {
              // Clear the filtered options cache when category changes
              filteredMfoOptions.value[index] = null
              filteredOutputOptions.value[index] = null
            },
            { deep: true },
          )

          // Watch for MFO changes
          watch(
            () => standard.rows.mfo,
            () => {
              filteredOutputOptions.value[index] = null
            },
            { deep: true },
          )
        })
      },
      { deep: true, immediate: true },
    )

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
      targetPeriodDetails,
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

      // loading states
      isLoading,
      isLoadingTargetPeriod,
      isLoadingEmployeeInfo,
      isLoadingStandards,
      isAddingStandard,

      // computed
      breadcrumbDisplay,
      selectedEmployee,
      semesterOptions,
      yearOptions,
      categoryOptions: computed(() =>
        officeLibraryStore.categories.map((cat) => ({
          id: cat.id,
          label: cat.name,
          value: cat.id,
          name: cat.name,
        })),
      ),
      performanceIndicatorOptions: computed(() =>
        officeLibraryIndicatorStore.verbs.map((verb) => ({
          id: verb.id,
          label: verb.indicator_name || verb.name,
          value: verb.id,
          name: verb.indicator_name || verb.name,
          description: verb.description || '',
        })),
      ),
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
      onBack,
      validateStrictNumeric,
      blockInvalidChars,
      timelinessColumnClass,
      numberCom,
      uwpStore,

      // ADD THESE LABEL RESOLVER FUNCTIONS:
      getCategoryLabel,
      getMfoLabel,
      getOutputLabel,
    }
  },
}
</script>

<style scoped>
/* Loading overlay styles */
.loading-overlay {
  background: rgba(255, 255, 255, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-skeleton {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

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
