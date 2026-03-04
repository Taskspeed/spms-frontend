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
          <span class="q-ml-md" v-if="selectedEmployee.sg && selectedEmployee.level">
            SG: <strong>{{ selectedEmployee.sg }}</strong> | Level:
            <strong>{{ getLevelText(selectedEmployee.level) }}</strong>
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

                                    <!-- MFO DROPDOWN -->
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

                                    <!-- OUTPUT DROPDOWN -->
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
                                  <div class="text-subtitle2">
                                    Competencies (for IPCR each MFO should have competency)
                                  </div>

                                  <!-- Competency Error Message -->
                                  <div
                                    v-if="showCompetencyError[index]"
                                    class="text-negative q-mt-xs q-mb-sm text-caption"
                                  >
                                    Please add at least one competency (Core, Technical, or
                                    Leadership)
                                  </div>
                                </q-card-section>
                                <q-separator />
                                <q-card-section class="q-pa-sm">
                                  <div class="row q-col-gutter-sm">
                                    <!-- Core Competencies - Auto-populated based on SG/Level -->
                                    <div class="col-md-4">
                                      <q-card flat bordered class="full-height">
                                        <q-card-section class="q-pa-sm">
                                          <div class="row items-center justify-between">
                                            <div class="text-caption text-weight-medium">
                                              Core (Auto-populated)
                                            </div>
                                            <!-- No add button for core competencies -->
                                          </div>
                                        </q-card-section>
                                        <q-separator />
                                        <q-card-section class="q-pa-sm">
                                          <div class="competency-list">
                                            <div
                                              v-if="
                                                !standard.competencies ||
                                                standard.competencies.core.length === 0
                                              "
                                              class="text-grey-6 text-center"
                                            >
                                              No core competencies required for this SG/Level
                                            </div>
                                            <div
                                              v-else
                                              v-for="(comp, compIndex) in standard.competencies
                                                .core"
                                              :key="'core-' + index + '-' + compIndex"
                                              class="competency-item q-pb-xs"
                                            >
                                              <div class="row items-center justify-between">
                                                <div class="text-caption">
                                                  {{ comp.code }} - {{ comp.value }} ({{
                                                    comp.level
                                                  }})
                                                </div>
                                                <!-- Core competencies cannot be removed -->
                                              </div>
                                            </div>
                                          </div>
                                        </q-card-section>
                                      </q-card>
                                    </div>

                                    <!-- Technical Competencies -->
                                    <div class="col-md-4">
                                      <q-card flat bordered class="full-height">
                                        <q-card-section class="q-pa-sm">
                                          <div class="row items-center justify-between">
                                            <div class="text-caption text-weight-medium">
                                              Technical
                                            </div>
                                            <q-btn
                                              flat
                                              round
                                              dense
                                              icon="add"
                                              size="xs"
                                              color="primary"
                                              @click="openCompetencyModal('technical', index)"
                                            >
                                              <q-tooltip>Add Technical Competency</q-tooltip>
                                            </q-btn>
                                          </div>
                                        </q-card-section>
                                        <q-separator />
                                        <q-card-section class="q-pa-sm">
                                          <div class="competency-list">
                                            <div
                                              v-if="
                                                !standard.competencies ||
                                                standard.competencies.technical.length === 0
                                              "
                                              class="text-grey-6 text-center"
                                            >
                                              No technical competencies added
                                            </div>
                                            <div
                                              v-else
                                              v-for="(comp, compIndex) in standard.competencies
                                                .technical"
                                              :key="'technical-' + index + '-' + compIndex"
                                              class="competency-item q-pb-xs"
                                            >
                                              <div class="row items-center justify-between">
                                                <div class="text-caption">
                                                  {{ comp.code }} - {{ comp.value }}
                                                </div>
                                                <q-btn
                                                  flat
                                                  round
                                                  dense
                                                  icon="close"
                                                  size="xs"
                                                  color="negative"
                                                  @click="
                                                    removeCompetency('technical', compIndex, index)
                                                  "
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </q-card-section>
                                      </q-card>
                                    </div>

                                    <!-- Leadership Competencies -->
                                    <div class="col-md-4">
                                      <q-card flat bordered class="full-height">
                                        <q-card-section class="q-pa-sm">
                                          <div class="row items-center justify-between">
                                            <div class="text-caption text-weight-medium">
                                              Leadership
                                            </div>
                                            <q-btn
                                              flat
                                              round
                                              dense
                                              icon="add"
                                              size="xs"
                                              color="primary"
                                              @click="openCompetencyModal('leadership', index)"
                                            >
                                              <q-tooltip>Add Leadership Competency</q-tooltip>
                                            </q-btn>
                                          </div>
                                        </q-card-section>
                                        <q-separator />
                                        <q-card-section class="q-pa-sm">
                                          <div class="competency-list">
                                            <div
                                              v-if="
                                                !standard.competencies ||
                                                standard.competencies.leadership.length === 0
                                              "
                                              class="text-grey-6 text-center"
                                            >
                                              No leadership competencies added
                                            </div>
                                            <div
                                              v-else
                                              v-for="(comp, compIndex) in standard.competencies
                                                .leadership"
                                              :key="'leadership-' + index + '-' + compIndex"
                                              class="competency-item q-pb-xs"
                                            >
                                              <div class="row items-center justify-between">
                                                <div class="text-caption">
                                                  {{ comp.code }} - {{ comp.value }}
                                                </div>
                                                <q-btn
                                                  flat
                                                  round
                                                  dense
                                                  icon="close"
                                                  size="xs"
                                                  color="negative"
                                                  @click="
                                                    removeCompetency('leadership', compIndex, index)
                                                  "
                                                />
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
                                      multiple
                                      use-chips
                                      clearable
                                      @update:model-value="generateSuccessIndicator(index)"
                                    >
                                      <template #prepend>
                                        <q-icon name="flag" size="xs" />
                                      </template>
                                      <template #option="scope">
                                        <q-item v-bind="scope.itemProps" dense>
                                          <q-item-section side>
                                            <q-checkbox :model-value="scope.selected" />
                                          </q-item-section>
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
                                          <q-item-section class="text-grey">
                                            No performance indicators found
                                          </q-item-section>
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

                          <!-- Standard Outcome Section -->
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
                                        :class="timelinessColumnClass(standard)"
                                      >
                                        <q-input
                                          v-model="props.row.timelinessRange"
                                          dense
                                          outlined
                                          placeholder="Number or Range"
                                          :rules="[validateStrictNumeric]"
                                          @keydown="blockInvalidChars"
                                          @update:model-value="
                                            onTimelinessUpdate(props.row, 'timelinessRange', index)
                                          "
                                        />
                                      </div>

                                      <div
                                        v-if="standard.activeTimelinessInputs.date"
                                        :class="timelinessColumnClass(standard)"
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
                                        :class="timelinessColumnClass(standard)"
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
          <div
            v-if="currentEmployee?.performanceStandards?.[currentStandardIndex]?.targetOutputValue"
            class="text-caption text-grey q-mt-xs"
          >
            Current value:
            {{ currentEmployee.performanceStandards[currentStandardIndex].targetOutputValue }}
          </div>
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
          <q-btn
            label="Calculate"
            color="green"
            unelevated
            @click="computeQuantities('B', currentStandardIndex)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Competency Selection Modal -->
    <q-dialog v-model="showCompetencyModal" persistent>
      <q-card style="min-width: 700px; max-width: 900px; border-radius: 8px">
        <q-card-section class="modal-header">
          <div class="text-h6">
            Select {{ competencyType.charAt(0).toUpperCase() + competencyType.slice(1) }}
            Competency
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Based on SG: {{ currentEmployee?.sg }} | Level:
            {{ getLevelText(currentEmployee?.level) }}
          </div>
        </q-card-section>

        <q-card-section class="modal-body">
          <div class="q-gutter-md">
            <!-- Competency Rows -->
            <div
              v-for="(competency, index) in competencySelections"
              :key="index"
              class="competency-row"
            >
              <div class="row q-col-gutter-md items-start">
                <!-- Competency Selection -->
                <div class="col-8">
                  <q-select
                    v-model="competency.selectedCompetency"
                    :options="getAvailableCompetencies(index)"
                    label="Select Competency"
                    outlined
                    dense
                    use-input
                    input-debounce="300"
                    @filter="(val, update) => filterCompetencies(val, update, index)"
                    option-value="code"
                    option-label="label"
                    clearable
                    :rules="[(val) => !!val || 'Competency is required']"
                  >
                    <template #option="scope">
                      <q-item v-bind="scope.itemProps" dense>
                        <q-item-section>
                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                          <q-item-label caption>
                            Required Level: {{ scope.opt.requiredLevel }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <!-- Level Selection (Auto-populated based on required level) -->
                <div class="col-3">
                  <q-select
                    v-model="competency.selectedLevel"
                    :options="getLevelOptionsForCompetency(competency.selectedCompetency)"
                    label="Level"
                    outlined
                    dense
                    readonly
                    option-value="value"
                    option-label="label"
                    :rules="[(val) => !!val || 'Level is required']"
                  >
                    <template #option="scope">
                      <q-item v-bind="scope.itemProps" dense>
                        <q-item-section>
                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <!-- Remove Button -->
                <div class="col-1 flex items-center">
                  <q-btn
                    v-if="competencySelections.length > 1"
                    flat
                    dense
                    round
                    icon="close"
                    color="negative"
                    size="sm"
                    @click="removeCompetencyRow(index)"
                  >
                    <q-tooltip>Remove</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>

            <!-- Add Another Button -->
            <div class="row q-mt-md">
              <q-btn
                flat
                dense
                icon="add"
                label="Add Another Competency"
                color="primary"
                @click="addCompetencyRow"
                class="q-ml-sm"
                :disable="competencySelections.length >= filteredCompetencyOptionsByType.length"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="modal-actions q-pa-md">
          <q-btn
            flat
            label="Cancel"
            color="grey-7"
            v-close-popup
            @click="cancelCompetencySelection"
          />
          <q-btn
            label="Add Selected Competencies"
            color="green"
            unelevated
            @click="addAllSelectedCompetencies"
            :disable="!isAnyCompetencyValid"
          />
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

    // Loading states
    const isLoading = ref(true)
    const isLoadingTargetPeriod = ref(true)
    const isLoadingEmployeeInfo = ref(true)
    const isLoadingStandards = ref(true)
    const isAddingStandard = ref(false)
    const isLoadingFilteredEmployees = ref(false)

    // Data refs
    const filteredMfoOptions = ref({})
    const filteredOutputOptions = ref({})
    const filteredVerbs = ref([])
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
    const currentStandardIndex = ref(0)
    const showQuantityModal = ref(false)
    const quantityValue = ref(null)

    // Competency Modal Refs
    const showCompetencyModal = ref(false)
    const competencyType = ref('technical')
    const currentStandardIndexForCompetency = ref(0)
    const selectedCompetency = ref(null)
    const selectedLevel = ref(null)
    const filteredCompetencyOptions = ref([])
    const showCompetencyError = ref([])
    const competencySelections = ref([{ selectedCompetency: null, selectedLevel: null }])
    const filteredCompetencyOptionsByRow = ref([])

    // Competency Data - Base definitions
    const competencyData = {
      core: [
        { code: 'DSE', description: 'Delivering Service Excellence' },
        { code: 'EI', description: 'Exemplifying Integrity' },
        { code: 'IS', description: 'Interpersonal Skills' },
      ],
      technical: [
        { code: 'P&O', description: 'Planning and Organizing' },
        { code: 'M&E', description: 'Monitoring and Evaluation' },
        { code: 'RM', description: 'Records Management' },
        { code: 'P&N', description: 'Partnering and Networking' },
        { code: 'PM', description: 'Process Management' },
        { code: 'AD', description: 'Attention to Details' },
      ],
      leadership: [
        { code: 'TSC', description: 'Thinking Strategically and Creatively' },
        { code: 'PSDM', description: 'Problem Solving and Decision Making' },
        {
          code: 'BCIWR',
          description: 'Building Collaborative and Inclusive Working Relationships',
        },
        { code: 'MPCR', description: 'Managing Performance and Coaching for Results' },
      ],
    }

    const levelOptions = [
      { label: 'Basic', value: '1' },
      { label: 'Intermediate', value: '2' },
      { label: 'Advanced', value: '3' },
      { label: 'Superior', value: '4' },
    ]

    const quantityIndicator = [
      { label: 'Quantity (A. Custom Target)', value: 'numeric' },
      { label: 'Quantity (B. Can exceed 100%)', value: 'B' },
      { label: 'Quantity (C. Cannot exceed 100%)', value: 'C' },
    ]

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

    // ==================== HELPER FUNCTIONS ====================

    const getLevelText = (level) => {
      if (level === '1') return '1st Level'
      if (level === '2') return '2nd Level'
      return `Level ${level}`
    }

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
      indicatorName: [],
      successIndicator: '',
      requiredOutput: '',
      modeOfVerification: '',
      rows: { category: null, mfo: null, output: null },
      quantityIndicatorType: 'numeric',
      timelinessIndicatorType: 'beforeDeadline',
      timelinessInputs: { range: true, date: false, description: false },
      activeTimelinessInputs: { range: true, date: false, description: false },
      competencies: {
        core: [],
        technical: [],
        leadership: [],
      },
      standardOutcomeRows: createDefaultStandardRows(),
      targetOutputValue: null,
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

    const timelinessColumnClass = (standard) => {
      const { range, date, description } = standard.activeTimelinessInputs
      const activeCount = [range, date, description].filter(Boolean).length
      if (activeCount === 1) return 'col'
      if (activeCount === 2) return 'col-6'
      return 'col-4'
    }

    // ==================== LABEL RESOLVERS ====================

    const getCategoryLabel = (categoryValue) => {
      if (!categoryValue) return ''
      if (typeof categoryValue === 'string' && isNaN(Number(categoryValue))) {
        return categoryValue
      }
      if (typeof categoryValue === 'object' && categoryValue !== null) {
        return categoryValue.name || categoryValue.label || ''
      }
      const categoryId = typeof categoryValue === 'object' ? categoryValue.id : categoryValue
      const category = officeLibraryStore.categories.find((cat) => cat.id === categoryId)
      return category?.name || category?.label || ''
    }

    const getMfoLabel = (mfoValue) => {
      if (!mfoValue) return ''
      if (typeof mfoValue === 'string' && isNaN(Number(mfoValue))) {
        return mfoValue
      }
      if (typeof mfoValue === 'object' && mfoValue !== null) {
        return mfoValue.name || mfoValue.label || ''
      }
      const mfoId = typeof mfoValue === 'object' ? mfoValue.id : mfoValue
      const mfo = officeLibraryStore.mfos.find((m) => m.id === mfoId)
      return mfo?.name || mfo?.label || ''
    }

    const getOutputLabel = (outputValue, categoryValue, mfoValue) => {
      if (!outputValue) return ''
      if (typeof outputValue === 'string' && isNaN(Number(outputValue))) {
        return outputValue
      }
      if (typeof outputValue === 'object' && outputValue !== null) {
        return outputValue.name || outputValue.label || ''
      }
      const outputId = typeof outputValue === 'object' ? outputValue.id : outputValue
      const categoryId = categoryValue
        ? typeof categoryValue === 'object'
          ? categoryValue.id
          : categoryValue
        : null
      const isSupport = categoryId ? isSupportCategory(categoryId) : false

      if (isSupport) {
        const output = officeLibraryStore.category_outputs.find((o) => o.id === outputId)
        return output?.name || output?.label || ''
      } else {
        const mfoId = mfoValue ? (typeof mfoValue === 'object' ? mfoValue.id : mfoValue) : null
        const output = officeLibraryStore.outputs.find(
          (o) =>
            o.id === outputId && o.f_category_id === categoryId && (!mfoId || o.mfo_id === mfoId),
        )
        return output?.name || output?.label || ''
      }
    }

    // ==================== COMPETENCY STORE INTEGRATION ====================

    // Get filtered competencies based on SG and Level
    const getFilteredCompetenciesByType = (type) => {
      if (!currentEmployee.value?.sg || !currentEmployee.value?.level) {
        return []
      }

      const sg = currentEmployee.value.sg
      const competencyRow = competencyStore.getBySG(sg)

      if (!competencyRow) return []

      // Get competencies based on type and filter only those with values
      const typeCompetencies = competencyData[type] || []

      return typeCompetencies
        .filter((comp) => {
          const competencyLevel = competencyRow[comp.code]
          // Only include competencies that are required (have a level value and not '-')
          return competencyLevel && competencyLevel !== '-'
        })
        .map((comp) => ({
          code: comp.code,
          description: comp.description,
          label: `${comp.code} - ${comp.description}`,
          requiredLevel: competencyRow[comp.code],
        }))
    }

    // Computed property for filtered competency options based on current type
    const filteredCompetencyOptionsByType = computed(() => {
      return getFilteredCompetenciesByType(competencyType.value)
    })

    // Computed property for filtered competency options (for backward compatibility)
    // const filteredCompetencyOptions = computed(() => {
    //   return filteredCompetencyOptionsByType.value
    // })

    // Get level options for a specific competency
    const getLevelOptionsForCompetency = (competency) => {
      if (!competency) return []

      const requiredLevel = competency.requiredLevel
      const levelMap = {
        Basic: { label: 'Basic', value: '1' },
        Intermediate: { label: 'Intermediate', value: '2' },
        Advanced: { label: 'Advanced', value: '3' },
        Superior: { label: 'Superior', value: '4' },
      }

      return requiredLevel ? [levelMap[requiredLevel]] : []
    }

    // ==================== CORE COMPETENCY AUTO-POPULATION ====================

    const autoPopulateCoreCompetencies = (standard, sg, level) => {
      if (!sg || !level) {
        console.log('Cannot auto-populate: missing SG or Level', { sg, level })
        return
      }

      console.log('Auto-populating core competencies for SG:', sg, 'Level:', level)

      // Get the competency row using the store's getBySG method
      const competencyRow = competencyStore.getBySG(sg)

      if (!competencyRow) {
        console.log('No competency row found for SG:', sg)
        return
      }

      console.log('Competency row:', competencyRow)

      // Clear existing core competencies first
      standard.competencies.core = []

      // Get core competencies from competencyData
      const coreCompetencies = competencyData.core || []

      // For each core competency, check if it's required for this SG
      coreCompetencies.forEach((comp) => {
        const requiredLevel = competencyRow[comp.code]

        // Only add if the competency is required (has a level and not '-')
        if (requiredLevel && requiredLevel !== '-') {
          // Map the level text to value
          const valueMap = {
            Basic: '1',
            Intermediate: '2',
            Advanced: '3',
            Superior: '4',
          }

          standard.competencies.core.push({
            code: comp.code,
            description: comp.description,
            value: valueMap[requiredLevel] || '1',
            level: requiredLevel,
          })

          console.log(`Added ${comp.code} with level ${requiredLevel}`)
        }
      })

      console.log('Final core competencies:', standard.competencies.core)
    }

    // ==================== COMPUTED PROPERTIES ====================

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

    const competencyOptions = computed(() => {
      return filteredCompetencyOptionsByType.value
    })

    const isAnyCompetencyValid = computed(() => {
      return competencySelections.value.some(
        (comp) => comp.selectedCompetency && comp.selectedLevel,
      )
    })

    const isFormValid = computed(() => {
      if (!currentEmployee.value?.employeeId) return false
      const hasTargetPeriod = targetPeriodDetails.value?.semester && targetPeriodDetails.value?.year
      if (!hasTargetPeriod) return false

      return currentEmployee.value.performanceStandards?.every((standard) => {
        const filled =
          standard.standardOutcomeRows?.filter((row) => row.effectiveness?.trim()?.length > 0)
            .length || 0
        if (filled < 2) return false

        const { core, technical, leadership } = standard.competencies || {}
        const totalCompetencies =
          (core?.length || 0) + (technical?.length || 0) + (leadership?.length || 0)

        return totalCompetencies >= 1
      })
    })

    // ==================== MFO/OUTPUT FILTERING ====================

    const isSupportCategory = (categoryId) => {
      if (!categoryId) return false
      const id = typeof categoryId === 'object' ? categoryId.id : categoryId
      if (!id) return false
      const category = officeLibraryStore.categories.find((cat) => cat.id === id)
      return (
        category &&
        (category.name === 'C. SUPPORT FUNCTION' ||
          category.name?.toLowerCase().includes('support'))
      )
    }

    const getFilteredMfoOptions = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard?.rows.category) return []

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
    }

    const getFilteredOutputOptions = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard?.rows?.category) return []

      const category = standard.rows.category
      if (!category) return []

      const categoryId = typeof category === 'object' ? category.id : category

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

    const filterPerformanceIndicators = (val, update) => {
      const needle = (val || '').toLowerCase()
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

    // ==================== SUCCESS INDICATOR GENERATION ====================

    const getQuantityComponent = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard) return ''

      if (standard.quantityIndicatorType === 'numeric') {
        return standard.standardOutcomeRows.find((row) => row.rating === '5')?.quantity || ''
      }
      if (standard.quantityIndicatorType === 'B') {
        return (
          standard.targetOutputValue ||
          standard.apiData?.config?.targetOutput ||
          standard.apiData?.config?.target_output ||
          ''
        )
      }
      if (standard.quantityIndicatorType === 'C') {
        return '100%'
      }
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

      const result = parts.join(' ')
      return result ? `, ${result}` : ''
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

        let indicatorNamePart = ''
        if (Array.isArray(standard.indicatorName) && standard.indicatorName.length > 0) {
          const indicatorNames = standard.indicatorName
            .map((idOrText) => {
              if (typeof idOrText === 'number' || !isNaN(idOrText)) {
                const verb = officeLibraryIndicatorStore.verbs.find(
                  (v) => v.id === Number(idOrText),
                )
                return verb?.indicator_name || verb?.name || ''
              }
              return idOrText
            })
            .filter(Boolean)

          if (indicatorNames.length === 1) {
            indicatorNamePart = indicatorNames[0]
          } else if (indicatorNames.length === 2) {
            indicatorNamePart = indicatorNames.join(' and ')
          } else if (indicatorNames.length > 2) {
            const allButLast = indicatorNames.slice(0, -1).join(', ')
            const last = indicatorNames[indicatorNames.length - 1]
            indicatorNamePart = `${allButLast}, and ${last}`
          }
        }

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

    // ==================== QUANTITY/TIMELINESS HANDLERS ====================

    const sanitizeNumericInput = (row, field) => {
      if (!row[field]) return
      row[field] = row[field].replace(/[^0-9-]/g, '')
      const hyphens = row[field].split('-').length - 1
      if (hyphens > 1) row[field] = row[field].substring(0, row[field].lastIndexOf('-'))
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

      // If there's existing API data with targetOutput, store it but still show modal for manual input
      if (standard.apiData?.config && value === 'B') {
        const config = standard.apiData.config
        const targetOutput = config.targetOutput || config.target_output
        if (targetOutput) {
          // Store the existing value but don't auto-calculate
          quantityValue.value = targetOutput
          standard.targetOutputValue = targetOutput
          // Don't return here - allow modal to show
        }
      }

      if (value === 'B') {
        // Always show modal for type B when manually selected
        showQuantityModal.value = true
      } else if (value === 'C') {
        computeQuantities('C', index)
      } else {
        standard.standardOutcomeRows.forEach((row) => (row.quantity = ''))
        generateSuccessIndicator(index)
      }
    }

    const computeQuantities = (type = null, index = null) => {
      const idx = index !== null ? index : currentStandardIndex.value
      const standard = currentEmployee.value?.performanceStandards?.[idx]
      if (!standard) return

      const currentType = type || standard.quantityIndicatorType

      if (currentType === 'B') {
        // Always use the current quantityValue from modal input
        let targetValue = quantityValue.value

        if (!targetValue || isNaN(targetValue) || targetValue <= 0) {
          $q.notify({
            message: 'Please enter a valid number greater than 0',
            color: 'negative',
            position: 'top',
          })
          return
        }

        // Update the standard with the new value
        standard.targetOutputValue = targetValue.toString()

        const base = Number(targetValue)

        const max130 = Math.round(base * 1.3)
        const max115 = Math.round(base * 1.15)
        const max50 = Math.round(base * 0.5)

        const above130Min = max130
        const range115to129Min = max115
        const range115to129Max = max130 - 1
        const range100to114Min = base
        const range100to114Max = max115 - 1
        const range51to99Min = max50 + 1
        const range51to99Max = base - 1
        const below50Max = max50

        standard.standardOutcomeRows[0].quantity = `${above130Min} and above`
        standard.standardOutcomeRows[1].quantity = `${range115to129Min}-${range115to129Max}`
        standard.standardOutcomeRows[2].quantity = `${range100to114Min}-${range100to114Max}`
        standard.standardOutcomeRows[3].quantity = `${range51to99Min}-${range51to99Max}`
        standard.standardOutcomeRows[4].quantity = `${below50Max} and below`

        quantityValue.value = null
        showQuantityModal.value = false

        generateSuccessIndicator(idx)

        $q.notify({
          message: 'Quantities calculated successfully for Type B',
          color: 'positive',
          position: 'top',
        })
      } else if (currentType === 'C') {
        standard.targetOutputValue = '100%'
        if (quantityValue.value) {
          quantityValue.value = null
        }

        standard.standardOutcomeRows[0].quantity = '100% and above'
        standard.standardOutcomeRows[1].quantity = '88%-99%'
        standard.standardOutcomeRows[2].quantity = '77%-87%'
        standard.standardOutcomeRows[3].quantity = '38%-76%'
        standard.standardOutcomeRows[4].quantity = '37% and below'

        generateSuccessIndicator(idx)

        $q.notify({
          message: 'Quantities set for Type C (cannot exceed 100%)',
          color: 'positive',
          position: 'top',
        })
      } else {
        standard.targetOutputValue = null
        if (quantityValue.value) {
          quantityValue.value = null
        }
        standard.standardOutcomeRows.forEach((row) => {
          row.quantity = row.quantity || ''
        })
        generateSuccessIndicator(idx)
      }
    }

    const cancelQuantityInput = () => {
      const index = currentStandardIndex.value
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (standard) standard.quantityIndicatorType = 'numeric'
      showQuantityModal.value = false
    }

    const hasMinimumEffectivenessValues = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard || !standard.standardOutcomeRows) return false
      const filledValues = standard.standardOutcomeRows.filter(
        (row) => row.effectiveness && row.effectiveness.trim().length > 0,
      ).length
      return filledValues >= 2
    }

    // ==================== COMPETENCY MODAL METHODS ====================

    const openCompetencyModal = (type, standardIndex) => {
      if (!currentEmployee.value?.sg || !currentEmployee.value?.level) {
        $q.notify({
          message: 'Employee SG and Level are required to select competencies',
          color: 'warning',
          position: 'top',
        })
        return
      }

      competencyType.value = type
      currentStandardIndexForCompetency.value = standardIndex

      // Reset selections
      competencySelections.value = [{ selectedCompetency: null, selectedLevel: null }]

      // Initialize filtered options with all available competencies for this type
      filteredCompetencyOptionsByRow.value = [[...filteredCompetencyOptionsByType.value]]

      showCompetencyModal.value = true
    }

    const filterCompetencies = (val, update, rowIndex) => {
      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()

          // Get the base options from filteredCompetencyOptionsByType
          const baseOptions = filteredCompetencyOptionsByType.value

          // Filter based on search term
          const filtered = baseOptions.filter(
            (comp) =>
              comp.code.toLowerCase().includes(needle) ||
              comp.description.toLowerCase().includes(needle),
          )

          // Ensure the array exists for this row
          if (!filteredCompetencyOptionsByRow.value[rowIndex]) {
            filteredCompetencyOptionsByRow.value[rowIndex] = []
          }

          // Set the filtered options
          filteredCompetencyOptionsByRow.value[rowIndex] = filtered
        })
      }
    }

    const getAvailableCompetencies = (rowIndex) => {
      // Get all selected competency codes from other rows
      const selectedCodes = competencySelections.value
        .map((sel, idx) =>
          idx !== rowIndex && sel.selectedCompetency ? sel.selectedCompetency.code : null,
        )
        .filter(Boolean)

      // Get the options for this row (either filtered or all available)
      const options =
        filteredCompetencyOptionsByRow.value[rowIndex] || filteredCompetencyOptionsByType.value

      // Filter out already selected competencies
      return options.filter((comp) => !selectedCodes.includes(comp.code))
    }

    const addCompetencyRow = () => {
      // Don't add if we've reached the maximum available competencies
      if (competencySelections.value.length >= filteredCompetencyOptionsByType.value.length) {
        $q.notify({
          message: 'No more competencies available to add',
          color: 'warning',
          position: 'top',
        })
        return
      }

      competencySelections.value.push({ selectedCompetency: null, selectedLevel: null })
      filteredCompetencyOptionsByRow.value.push([...filteredCompetencyOptionsByType.value])
    }

    const removeCompetencyRow = (index) => {
      if (competencySelections.value.length > 1) {
        competencySelections.value.splice(index, 1)
        filteredCompetencyOptionsByRow.value.splice(index, 1)
      }
    }

    const addAllSelectedCompetencies = () => {
      const standard =
        currentEmployee.value?.performanceStandards[currentStandardIndexForCompetency.value]
      if (!standard) return

      let addedCount = 0
      competencySelections.value.forEach((selection) => {
        if (selection.selectedCompetency && selection.selectedLevel) {
          const competency = {
            code: selection.selectedCompetency.code,
            description: selection.selectedCompetency.description,
            value: selection.selectedLevel.value,
            level: selection.selectedLevel.label,
          }
          const alreadyExists = standard.competencies[competencyType.value].some(
            (existing) => existing.code === competency.code,
          )
          if (!alreadyExists) {
            standard.competencies[competencyType.value].push(competency)
            addedCount++
          }
        }
      })

      if (addedCount > 0) {
        $q.notify({
          message: `${addedCount} competenc${addedCount > 1 ? 'ies' : 'y'} added`,
          color: 'positive',
          position: 'top',
        })
      }

      competencySelections.value = [{ selectedCompetency: null, selectedLevel: null }]
      filteredCompetencyOptionsByRow.value = [filteredCompetencyOptionsByType.value]
      showCompetencyModal.value = false
      validateCompetencies(currentStandardIndexForCompetency.value)
    }

    const removeCompetency = (type, compIndex, standardIndex) => {
      const standard = currentEmployee.value?.performanceStandards[standardIndex]
      if (!standard || !standard.competencies[type]) return

      $q.dialog({
        title: 'Confirm Removal',
        message: `Remove ${standard.competencies[type][compIndex].code} competency?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        standard.competencies[type].splice(compIndex, 1)
        $q.notify({
          message: 'Competency removed',
          color: 'positive',
          position: 'top',
        })
        validateCompetencies(standardIndex)
      })
    }

    const validateCompetencies = (standardIndex) => {
      const standard = currentEmployee.value?.performanceStandards[standardIndex]
      if (!standard) return
      const { core, technical, leadership } = standard.competencies
      const totalCompetencies =
        (core?.length || 0) + (technical?.length || 0) + (leadership?.length || 0)
      showCompetencyError.value[standardIndex] = totalCompetencies === 0
    }

    const cancelCompetencySelection = () => {
      showCompetencyModal.value = false
      competencySelections.value = [{ selectedCompetency: null, selectedLevel: null }]
      filteredCompetencyOptionsByRow.value = [[...filteredCompetencyOptionsByType.value]]
    }

    // ==================== PERFORMANCE STANDARD MANAGEMENT ====================

    const addPerformanceStandard = async () => {
      isAddingStandard.value = true
      try {
        if (!currentEmployee.value) currentEmployee.value = createDefaultEmployeeData()
        if (!currentEmployee.value.performanceStandards)
          currentEmployee.value.performanceStandards = []

        const newStandard = createDefaultPerformanceStandard()

        // Auto-populate core competencies for the new standard
        if (currentEmployee.value.sg && currentEmployee.value.level) {
          autoPopulateCoreCompetencies(
            newStandard,
            currentEmployee.value.sg,
            currentEmployee.value.level,
          )
        }

        currentEmployee.value.performanceStandards.push(newStandard)

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

    // ==================== VALIDATION ====================

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

    // ==================== DATA FETCHING ====================

    const fetchEmployeeData = async (controlNo, semester, year) => {
      isLoadingFilteredEmployees.value = true
      try {
        const employeeData = await uwpStore.fetchEmployeeByControlNo(controlNo, semester, year)
        console.log('📊 Employee data fetched:', employeeData)

        if (employeeData?.length) {
          const employee = employeeData[0]

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

          console.log('📊 Employee SG/Level:', {
            sg: currentEmployee.value.sg,
            level: currentEmployee.value.level,
          })

          let targetPeriod = null

          if (employee.employeeData?.target_periods?.[0]) {
            targetPeriod = employee.employeeData.target_periods[0]
          } else if (employee.target_periods?.[0]) {
            targetPeriod = employee.target_periods[0]
          }

          if (targetPeriod) {
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

            currentEmployee.value.hierarchy = {
              office: targetPeriod.office || employee.office || '',
              office2: targetPeriod.office2 || '',
              group: targetPeriod.group || '',
              division: targetPeriod.division || '',
              section: targetPeriod.section || '',
              unit: targetPeriod.unit || '',
            }

            const performanceStandards = targetPeriod.performance_standards || []

            if (performanceStandards.length > 0) {
              currentEmployee.value.performanceStandards = performanceStandards.map((ps) => {
                const config = ps.config || targetPeriod.config || {}

                let quantityIndicatorType = 'numeric'
                if (config.quantityIndicator === 'C' || config.quantity_indicator === 'C') {
                  quantityIndicatorType = 'C'
                } else if (config.quantityIndicator === 'B' || config.quantity_indicator === 'B') {
                  quantityIndicatorType = 'B'
                }

                let timelinessIndicatorType = 'beforeDeadline'
                if (
                  config.timelinessIndicator === 'onDeadline' ||
                  config.timeliness_indicator === 'onDeadline'
                ) {
                  timelinessIndicatorType = 'onDeadline'
                }

                const timelinessType = config.timelinessType || {}
                const timelinessInputs = {
                  range: timelinessType.range === true,
                  date: timelinessType.date === true,
                  description: timelinessType.description === true,
                }

                const categoryName = ps.category || ''
                const categoryObj = officeLibraryStore.categories?.find(
                  (cat) => cat.name?.toLowerCase() === categoryName?.toLowerCase(),
                ) || { id: null, name: categoryName, label: categoryName }

                const mfoName = ps.mfo || ''
                let mfoObj = null
                if (categoryObj.id && mfoName) {
                  mfoObj = officeLibraryStore.mfos?.find(
                    (mfo) =>
                      mfo.name?.toLowerCase() === mfoName?.toLowerCase() &&
                      mfo.f_category_id === categoryObj.id,
                  ) || { id: null, name: mfoName, label: mfoName }
                }

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

                let indicatorName = []
                if (ps.performance_indicator) {
                  if (Array.isArray(ps.performance_indicator)) {
                    indicatorName = ps.performance_indicator
                  } else {
                    indicatorName = [ps.performance_indicator]
                  }
                }

                // Process competencies from API
                const coreCompetencies = (ps.core || []).map((comp) => ({
                  code: comp.code,
                  description: competencyStore.descriptions.core[comp.code] || '',
                  value: comp.level || '1',
                  level:
                    Object.keys({
                      Basic: '1',
                      Intermediate: '2',
                      Advanced: '3',
                      Superior: '4',
                    }).find(
                      (key) =>
                        ({ Basic: '1', Intermediate: '2', Advanced: '3', Superior: '4' })[key] ===
                        comp.level,
                    ) || 'Basic',
                }))

                const technicalCompetencies = (ps.technical || []).map((comp) => ({
                  code: comp.code,
                  description: competencyStore.descriptions.technical[comp.code] || '',
                  value: comp.level || '1',
                  level:
                    Object.keys({
                      Basic: '1',
                      Intermediate: '2',
                      Advanced: '3',
                      Superior: '4',
                    }).find(
                      (key) =>
                        ({ Basic: '1', Intermediate: '2', Advanced: '3', Superior: '4' })[key] ===
                        comp.level,
                    ) || 'Basic',
                }))

                const leadershipCompetencies = (ps.leadership || []).map((comp) => ({
                  code: comp.code,
                  description: competencyStore.descriptions.leadership[comp.code] || '',
                  value: comp.level || '1',
                  level:
                    Object.keys({
                      Basic: '1',
                      Intermediate: '2',
                      Advanced: '3',
                      Superior: '4',
                    }).find(
                      (key) =>
                        ({ Basic: '1', Intermediate: '2', Advanced: '3', Superior: '4' })[key] ===
                        comp.level,
                    ) || 'Basic',
                }))

                const ratings = ps.ratings || []
                const standardOutcomeRows = createDefaultStandardRows().map((row) => {
                  const ratingData = ratings.find((r) => r.rating?.toString() === row.rating)

                  if (ratingData) {
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

                const standard = {
                  id: `ps_${ps.id || Date.now()}`,
                  expanded: true,
                  outputName: ps.output_name || '',
                  indicatorName: indicatorName || '',
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
                  competencies: {
                    core: coreCompetencies,
                    technical: technicalCompetencies,
                    leadership: leadershipCompetencies,
                  },
                  apiData: ps,
                  targetOutputValue: null,
                }

                if (quantityIndicatorType === 'B') {
                  const targetOutput = config.targetOutput || config.target_output
                  if (targetOutput) {
                    standard.targetOutputValue = targetOutput
                    quantityValue.value = targetOutput
                  }
                }

                return standard
              })
            } else {
              currentEmployee.value.performanceStandards = [createDefaultPerformanceStandard()]
            }
          } else {
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

          // Auto-populate core competencies for all standards
          if (currentEmployee.value.sg && currentEmployee.value.level) {
            currentEmployee.value.performanceStandards.forEach((standard) => {
              autoPopulateCoreCompetencies(
                standard,
                currentEmployee.value.sg,
                currentEmployee.value.level,
              )
            })
          }

          currentEmployee.value.performanceStandards?.forEach((_, idx) => {
            setTimeout(() => generateSuccessIndicator(idx), 100)
          })

          console.log('✅ Final currentEmployee:', currentEmployee.value)
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
        isLoadingTargetPeriod.value = false
        isLoadingEmployeeInfo.value = false
        isLoadingStandards.value = false
      }
    }

    const initializeUWPData = async () => {
      try {
        isLoading.value = true
        isLoadingTargetPeriod.value = true
        isLoadingEmployeeInfo.value = true
        isLoadingStandards.value = true

        const { controlNo, semester, year } = props

        targetPeriodDetails.value.semester = semester
        targetPeriodDetails.value.year = year

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
        setTimeout(() => {
          isLoading.value = false
        }, 500)
      }
    }

    // ==================== SUBMIT ====================

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
      currentEmployee.value.performanceStandards?.forEach((standard, idx) => {
        const errors = []

        const filledEffectivenessValues = standard.standardOutcomeRows.filter(
          (row) => row.effectiveness?.trim()?.length > 0,
        ).length
        if (filledEffectivenessValues < 2) {
          errors.push('requires at least 2 effectiveness values')
        }

        const { core, technical, leadership } = standard.competencies || {}
        const totalCompetencies =
          (core?.length || 0) + (technical?.length || 0) + (leadership?.length || 0)

        if (totalCompetencies < 1) {
          errors.push('requires at least 1 competency')
        }

        if (errors.length > 0) {
          invalid.push(`${idx + 1} (${errors.join(', ')})`)
        }
      })

      if (invalid.length) {
        return $q.notify({
          message: `Please complete required fields for standards: ${invalid.join(', ')}`,
          color: 'negative',
          position: 'top',
          timeout: 5000,
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
            controlNo: props.controlNo,
            performanceStandards: currentEmployee.value.performanceStandards?.map((standard) => {
              return {
                ...standard,
                indicatorName: Array.isArray(standard.indicatorName)
                  ? standard.indicatorName
                  : standard.indicatorName
                    ? [standard.indicatorName]
                    : [],
                rows: {
                  category: standard.rows?.category?.id || standard.rows?.category,
                  mfo: standard.rows?.mfo?.id || standard.rows?.mfo,
                  output: standard.rows?.output?.id || standard.rows?.output,
                },
              }
            }),
          },
        }

        await uwpStore.updateUWP(updateData, officeLibraryIndicatorStore, officeLibraryStore)

        $q.notify({
          message: 'Unit Work Plan updated successfully',
          color: 'positive',
          icon: 'check_circle',
          position: 'top',
        })

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

    // ==================== WATCHERS ====================

    // Watch for SG/Level changes to update core competencies
    watch(
      () => ({
        sg: currentEmployee.value?.sg,
        level: currentEmployee.value?.level,
      }),
      (newValues) => {
        console.log('SG/Level changed:', newValues)
        if (newValues.sg && newValues.level && currentEmployee.value?.performanceStandards) {
          currentEmployee.value.performanceStandards.forEach((standard) => {
            autoPopulateCoreCompetencies(standard, newValues.sg, newValues.level)
          })
        }
      },
      { deep: true, immediate: true },
    )

    watch(
      () => currentEmployee.value?.performanceStandards,
      (standards) => {
        if (!standards) return
        standards.forEach((standard, index) => {
          watch(
            () => standard.rows.category,
            () => {
              filteredMfoOptions.value[index] = null
              filteredOutputOptions.value[index] = null
            },
            { deep: true },
          )
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
      () => currentEmployee.value?.performanceStandards,
      (newStandards) => {
        if (newStandards) {
          newStandards.forEach((_, index) => {
            validateCompetencies(index)
          })
        }
      },
      { deep: true },
    )

    // Watch for competency type changes to update filtered options
    watch(
      () => competencyType.value,
      () => {
        filteredCompetencyOptionsByRow.value = [filteredCompetencyOptionsByType.value]
      },
    )

    // Auto-populate level when competency is selected
    watch(
      () => competencySelections.value.map((sel) => sel.selectedCompetency),
      () => {
        competencySelections.value.forEach((selection) => {
          if (selection.selectedCompetency && !selection.selectedLevel) {
            const levelOptions = getLevelOptionsForCompetency(selection.selectedCompetency)
            if (levelOptions.length > 0) {
              selection.selectedLevel = levelOptions[0]
            }
          }
        })
      },
      { deep: true },
    )

    // ==================== LIFECYCLE ====================

    onMounted(async () => {
      const officeId = 1

      try {
        await officeLibraryStore.fetchAllData(officeId)
        await officeLibraryIndicatorStore.fetchVerbs()

        await initializeUWPData()
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

    return {
      // State
      targetPeriodDetails,
      currentEmployee,
      filteredMfoOptions,
      filteredOutputOptions,
      filteredVerbs,
      formInteracted,
      shouldValidate,
      showQuantityModal,
      quantityValue,
      currentStandardIndex,
      isLoadingFilteredEmployees,
      isLoading,
      isLoadingTargetPeriod,
      isLoadingEmployeeInfo,
      isLoadingStandards,
      isAddingStandard,
      showCompetencyModal,
      competencyType,
      selectedCompetency,
      selectedLevel,
      competencyOptions,
      levelOptions,
      filteredCompetencyOptions,
      showCompetencyError,
      competencySelections,
      filteredCompetencyOptionsByRow,
      isAnyCompetencyValid,
      filteredCompetencyOptionsByType,

      // Computed
      breadcrumbDisplay,
      selectedEmployee,
      semesterOptions,
      yearOptions,
      categoryOptions,
      performanceIndicatorOptions,
      standardOutcomeColumns,
      isFormValid,

      // Constants
      quantityIndicator,

      // Helper Functions
      getLevelText,
      getCategoryLabel,
      getMfoLabel,
      getOutputLabel,
      isSupportCategory,
      hasMinimumEffectivenessValues,
      timelinessColumnClass,
      getLevelOptionsForCompetency,

      // Methods
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
      onBack: () => emit('close'),
      validateStrictNumeric,
      blockInvalidChars,
      uwpStore,

      // Competency Methods
      openCompetencyModal,
      filterCompetencies,
      addAllSelectedCompetencies,
      removeCompetency,
      cancelCompetencySelection,
      validateCompetencies,
      getAvailableCompetencies,
      addCompetencyRow,
      removeCompetencyRow,
    }
  },
}
</script>

<style scoped>
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
