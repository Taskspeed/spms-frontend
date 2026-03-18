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
          <span class="q-ml-md"
            >Position: <strong>{{ selectedEmployee.position }}</strong></span
          >
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
                  <template #prepend><q-icon name="calendar_view_month" size="xs" /></template>
                </q-input>
                <q-separator />
                <q-input
                  v-model="targetPeriodDetails.office"
                  label="Office"
                  outlined
                  dense
                  readonly
                >
                  <template #prepend><q-icon name="account_balance" size="xs" /></template>
                </q-input>
                <q-input
                  v-model="targetPeriodDetails.office2"
                  label="Sub-Office"
                  outlined
                  dense
                  readonly
                >
                  <template #prepend><q-icon name="business" size="xs" /></template>
                </q-input>
                <q-input v-model="targetPeriodDetails.group" label="Group" outlined dense readonly>
                  <template #prepend><q-icon name="group_work" size="xs" /></template>
                </q-input>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="column q-gutter-sm">
                <q-input v-model="targetPeriodDetails.year" readonly label="Year" outlined dense>
                  <template #prepend><q-icon name="event" size="xs" /></template>
                </q-input>
                <q-separator />
                <q-input
                  v-model="targetPeriodDetails.division"
                  label="Division"
                  outlined
                  dense
                  readonly
                >
                  <template #prepend><q-icon name="business" size="xs" /></template>
                </q-input>
                <q-input
                  v-model="targetPeriodDetails.section"
                  label="Section"
                  outlined
                  dense
                  readonly
                >
                  <template #prepend><q-icon name="account_tree" size="xs" /></template>
                </q-input>
                <q-input v-model="targetPeriodDetails.unit" label="Unit" outlined dense readonly>
                  <template #prepend><q-icon name="layers" size="xs" /></template>
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
                  <template #prepend><q-icon name="person" size="xs" /></template>
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
                      <template #prepend><q-icon name="military_tech" size="xs" /></template>
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
                      <template #prepend><q-icon name="work" size="xs" /></template>
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
                          <q-badge v-if="standard.quantityRestriction" color="info" class="q-mr-sm"
                            >Restricted</q-badge
                          >
                          <q-btn
                            flat
                            round
                            dense
                            :icon="standard.expanded ? 'expand_less' : 'expand_more'"
                            @click="standard.expanded = !standard.expanded"
                          />
                          <q-btn
                            flat
                            round
                            dense
                            icon="delete"
                            color="negative"
                            @click="removePerformanceStandard(index)"
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
                                    <!-- Category -->
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
                                      <template #prepend
                                        ><q-icon name="category" size="xs"
                                      /></template>
                                      <template #selected>
                                        <span v-if="standard.rows.category">{{
                                          getCategoryLabel(standard.rows.category)
                                        }}</span>
                                      </template>
                                    </q-select>

                                    <!-- MFO
                                         Non-Office-Head employees only see MFOs the Office Head
                                         has already included in their plan (headMfoNames). -->
                                    <q-select
                                      v-if="!isSupportCategory(standard.rows.category)"
                                      outlined
                                      dense
                                      v-model="standard.rows.mfo"
                                      :label="
                                        isFetchingHeadMfos && !isCurrentEmployeeOfficeHead
                                          ? 'Loading MFOs…'
                                          : 'Select MFO'
                                      "
                                      :loading="isFetchingHeadMfos && !isCurrentEmployeeOfficeHead"
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
                                      <template #prepend
                                        ><q-icon name="list_alt" size="xs"
                                      /></template>
                                      <template #selected>
                                        <span v-if="standard.rows.mfo">{{
                                          getMfoLabel(standard.rows.mfo)
                                        }}</span>
                                      </template>
                                      <template #option="scope">
                                        <q-item v-bind="scope.itemProps" dense>
                                          <q-item-section>
                                            <q-item-label>{{ scope.opt.label }}</q-item-label>
                                            <q-item-label caption v-if="scope.opt.code"
                                              >Code: {{ scope.opt.code }}</q-item-label
                                            >
                                          </q-item-section>
                                        </q-item>
                                      </template>
                                      <template #no-option>
                                        <q-item>
                                          <q-item-section class="text-grey">
                                            {{
                                              isFetchingHeadMfos && !isCurrentEmployeeOfficeHead
                                                ? 'Loading MFOs from Office Head plan…'
                                                : 'No MFOs found matching your search'
                                            }}
                                          </q-item-section>
                                        </q-item>
                                      </template>
                                    </q-select>

                                    <!-- Output
                                         - Office Head + non-support → hidden
                                         - Office Head + support     → shown, unique per standard
                                         - All other employees       → always shown -->
                                    <q-select
                                      v-if="shouldShowOutput(standard)"
                                      outlined
                                      dense
                                      v-model="standard.rows.output"
                                      label="Select Output"
                                      :options="getAvailableOutputOptions(index)"
                                      option-value="id"
                                      option-label="label"
                                      emit-value
                                      map-options
                                      use-input
                                      input-debounce="300"
                                      @filter="(val, update) => filterOutputs(val, update, index)"
                                      clearable
                                    >
                                      <template #prepend
                                        ><q-icon name="output" size="xs"
                                      /></template>
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
                                            <q-item-label caption v-if="scope.opt.code"
                                              >Code: {{ scope.opt.code }}</q-item-label
                                            >
                                          </q-item-section>
                                        </q-item>
                                      </template>
                                      <template #no-option>
                                        <q-item>
                                          <q-item-section class="text-grey">
                                            {{ getOutputNoOptionMessage(index) }}
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
                                    <!-- Core Competencies -->
                                    <div class="col-md-4">
                                      <q-card flat bordered class="full-height">
                                        <q-card-section class="q-pa-sm">
                                          <div class="text-caption text-weight-medium">
                                            Core (Auto-populated)
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
                                              <div class="text-caption">
                                                {{ comp.code }} - {{ comp.value }} ({{
                                                  comp.level
                                                }})
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
                                      @update:model-value="
                                        async (value) => {
                                          generateSuccessIndicator(index)
                                          const std = currentEmployee.performanceStandards[index]
                                          if (std?.rows?.mfo && !isCurrentEmployeeOfficeHead) {
                                            if (value && value.length > 0) {
                                              await checkAndApplyRestriction(index)
                                            } else {
                                              std.quantityRestriction = null
                                            }
                                          }
                                        }
                                      "
                                    >
                                      <template #prepend><q-icon name="flag" size="xs" /></template>
                                      <template #option="scope">
                                        <q-item v-bind="scope.itemProps" dense>
                                          <q-item-section side
                                            ><q-checkbox :model-value="scope.selected"
                                          /></q-item-section>
                                          <q-item-section>
                                            <q-item-label>{{ scope.opt.name }}</q-item-label>
                                            <q-item-label caption v-if="scope.opt.description">{{
                                              scope.opt.description
                                            }}</q-item-label>
                                          </q-item-section>
                                        </q-item>
                                      </template>
                                      <template #no-option>
                                        <q-item
                                          ><q-item-section class="text-grey"
                                            >No performance indicators found</q-item-section
                                          ></q-item
                                        >
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
                                      :hint="getQuantityHint(standard)"
                                      :error="isQuantityExceeded(standard, props.row)"
                                      :error-message="getQuantityErrorMessage(standard)"
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

                              <!-- Quantity Restriction Info -->
                              <div
                                v-if="
                                  standard.quantityRestriction &&
                                  standard.quantityIndicatorType !== 'C'
                                "
                                class="q-mt-sm"
                              >
                                <q-banner
                                  :class="
                                    standard.quantityRestriction.restrictionType === 'error'
                                      ? 'bg-negative'
                                      : standard.quantityRestriction.restrictionType === 'warning'
                                        ? 'bg-warning'
                                        : 'bg-info'
                                  "
                                  class="text-white q-pa-sm"
                                  dense
                                >
                                  <template v-slot:avatar>
                                    <q-icon
                                      :name="
                                        standard.quantityRestriction.restrictionType === 'error'
                                          ? 'error'
                                          : 'info'
                                      "
                                    />
                                  </template>
                                  {{ standard.quantityRestriction.message }}
                                </q-banner>
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
          <div v-if="currentQuantityRestriction" class="text-caption text-red-9 q-mt-xs">
            Max allowed: {{ currentQuantityRestriction.maxQuantity || 'Unlimited' }}
          </div>
          <div
            v-else-if="
              currentEmployee?.performanceStandards?.[currentStandardIndex]?.targetOutputValue
            "
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
            :rules="[
              (val) => val > 0 || 'Must be greater than 0',
              (val) =>
                !currentQuantityRestriction?.maxQuantity ||
                val <= currentQuantityRestriction.maxQuantity ||
                `Cannot exceed ${currentQuantityRestriction.maxQuantity}`,
            ]"
            @keypress="blockInvalidChars"
            :error="quantityExceedsMax"
            :error-message="
              quantityExceedsMax
                ? `Maximum allowed is ${currentQuantityRestriction?.maxQuantity}`
                : ''
            "
          />
        </q-card-section>
        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup @click="cancelQuantityInput" />
          <q-btn
            label="Calculate"
            color="green"
            unelevated
            @click="computeQuantities('B', currentStandardIndex)"
            :disable="quantityExceedsMax"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Competency Selection Modal -->
    <q-dialog v-model="showCompetencyModal" persistent>
      <q-card style="min-width: 700px; max-width: 900px; border-radius: 8px">
        <q-card-section class="modal-header">
          <div class="text-h6">
            Select {{ competencyType.charAt(0).toUpperCase() + competencyType.slice(1) }} Competency
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Based on SG: {{ currentEmployee?.sg }} | Level:
            {{ getLevelText(currentEmployee?.level) }}
          </div>
        </q-card-section>
        <q-card-section class="modal-body">
          <div class="q-gutter-md">
            <div
              v-for="(competency, index) in competencySelections"
              :key="index"
              class="competency-row"
            >
              <div class="row q-col-gutter-md items-start">
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
                          <q-item-label caption
                            >Required Level: {{ scope.opt.requiredLevel }}</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
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
                  />
                </div>
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
import { useCascadeStore } from 'src/stores/cascadeStore'
import { useQuantityRestriction } from 'src/composables/useQuantityRestriction'
import { useMFOHeadStore } from 'src/stores/mfoHeadStore'

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
    const cascadeStore = useCascadeStore()
    const quantityRestriction = useQuantityRestriction()
    const mfoHeadStore = useMFOHeadStore()

    // ===========================================================================
    // 1. LOADING STATES
    // ===========================================================================

    const isLoading = ref(true)
    const isLoadingTargetPeriod = ref(true)
    const isLoadingEmployeeInfo = ref(true)
    const isLoadingStandards = ref(true)
    const isAddingStandard = ref(false)
    const isLoadingFilteredEmployees = ref(false)

    // ===========================================================================
    // 2. REACTIVE STATE
    // ===========================================================================

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
    const currentQuantityRestriction = ref(null)

    // Head MFO filter — names of MFOs the Office Head has set in their plan.
    // Non-Office-Head employees may only pick from this list (per category).
    // Populated by fetchHeadMfos() in onMounted.
    const headMfoNames = ref(new Set())
    const isFetchingHeadMfos = ref(false)

    // Competency modal state
    const showCompetencyModal = ref(false)
    const competencyType = ref('technical')
    const currentStandardIndexForCompetency = ref(0)
    const selectedCompetency = ref(null)
    const selectedLevel = ref(null)
    const filteredCompetencyOptions = ref([])
    const showCompetencyError = ref([])
    const competencySelections = ref([{ selectedCompetency: null, selectedLevel: null }])
    const filteredCompetencyOptionsByRow = ref([])

    // ===========================================================================
    // 3. CONSTANTS
    // ===========================================================================

    const COMPETENCY_DEFINITIONS = {
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

    const LEVEL_MAP = {
      Basic: { label: 'Basic', value: '1' },
      Intermediate: { label: 'Intermediate', value: '2' },
      Advanced: { label: 'Advanced', value: '3' },
      Superior: { label: 'Superior', value: '4' },
    }

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

    // ===========================================================================
    // 4. FACTORY FUNCTIONS
    // ===========================================================================

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

    const createDefaultStandardRows = () =>
      ['5', '4', '3', '2', '1'].map((rating) => ({ ...createEmptyStandardRow(), rating }))

    const createDefaultPerformanceStandard = () => ({
      id: uuidv4(),
      expanded: true,
      outputName: '',
      indicatorName: [],
      successIndicator: '',
      requiredOutput: '',
      modeOfVerification: '',
      rows: { category: null, mfo: null, output: null, supervisory_control_no: null },
      quantityIndicatorType: 'numeric',
      timelinessIndicatorType: 'beforeDeadline',
      timelinessInputs: { range: true, date: false, description: false },
      activeTimelinessInputs: { range: true, date: false, description: false },
      competencies: { core: [], technical: [], leadership: [] },
      standardOutcomeRows: createDefaultStandardRows(),
      quantityRestriction: null,
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
      supervisorySignatory: null,
      performanceStandards: [createDefaultPerformanceStandard()],
    })

    // ===========================================================================
    // 5. HELPER FUNCTIONS
    // ===========================================================================

    const getLevelText = (level) => {
      if (level === '1') return '1st Level'
      if (level === '2') return '2nd Level'
      return `Level ${level}`
    }

    const timelinessColumnClass = (standard) => {
      const { range, date, description } = standard.activeTimelinessInputs
      const count = [range, date, description].filter(Boolean).length
      if (count === 1) return 'col'
      if (count === 2) return 'col-6'
      return 'col-4'
    }

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

    /**
     * True ONLY when the employee being edited has job_title === 'office head' (exact match).
     * Section heads, division heads, etc. are intentionally excluded.
     */
    const isCurrentEmployeeOfficeHead = computed(() => {
      if (!currentEmployee.value) return false
      const jobTitle = (
        currentEmployee.value.employeeData?.job_title ||
        currentEmployee.value.employeeData?.jobTitle ||
        currentEmployee.value.job_title ||
        currentEmployee.value.jobTitle ||
        ''
      )
        .toLowerCase()
        .trim()
      return jobTitle === 'office head'
    })

    /**
     * Whether the output select should be shown.
     * - Office Head + non-support category → hidden
     * - Office Head + support category     → shown
     * - Everyone else                      → always shown
     */
    const shouldShowOutput = (standard) => {
      if (!isCurrentEmployeeOfficeHead.value) return true
      return isSupportCategory(standard.rows.category)
    }

    // ===========================================================================
    // 6. LABEL RESOLVERS
    // ===========================================================================

    const getCategoryLabel = (categoryValue) => {
      if (!categoryValue) return ''
      if (typeof categoryValue === 'string' && isNaN(Number(categoryValue))) return categoryValue
      if (typeof categoryValue === 'object' && categoryValue !== null)
        return categoryValue.name || categoryValue.label || ''
      const id = typeof categoryValue === 'object' ? categoryValue.id : categoryValue
      const cat = officeLibraryStore.categories.find((c) => c.id === id)
      return cat?.name || cat?.label || ''
    }

    const getMfoLabel = (mfoValue) => {
      if (!mfoValue) return ''
      if (typeof mfoValue === 'string' && isNaN(Number(mfoValue))) return mfoValue
      if (typeof mfoValue === 'object' && mfoValue !== null)
        return mfoValue.name || mfoValue.label || ''
      const id = typeof mfoValue === 'object' ? mfoValue.id : mfoValue
      const mfo = officeLibraryStore.mfos.find((m) => m.id === id)
      return mfo?.name || mfo?.label || ''
    }

    const getOutputLabel = (outputValue, categoryValue, mfoValue) => {
      if (!outputValue) return ''
      if (typeof outputValue === 'string' && isNaN(Number(outputValue))) return outputValue
      if (typeof outputValue === 'object' && outputValue !== null)
        return outputValue.name || outputValue.label || ''
      const id = typeof outputValue === 'object' ? outputValue.id : outputValue
      const catId = categoryValue
        ? typeof categoryValue === 'object'
          ? categoryValue.id
          : categoryValue
        : null
      const isSupport = catId ? isSupportCategory(catId) : false
      if (isSupport) {
        const output = officeLibraryStore.category_outputs.find((o) => o.id === id)
        return output?.name || output?.label || ''
      }
      const mfoId = mfoValue ? (typeof mfoValue === 'object' ? mfoValue.id : mfoValue) : null
      const output = officeLibraryStore.outputs.find(
        (o) => o.id === id && o.f_category_id === catId && (!mfoId || o.mfo_id === mfoId),
      )
      return output?.name || output?.label || ''
    }

    // ===========================================================================
    // 7. HEAD MFO FETCH
    // ===========================================================================

    /**
     * Fetches the Office Head's existing performance standards via useMFOHeadStore
     * and builds headMfoNames — a Set of lowercased MFO name strings.
     *
     * Non-Office-Head employees' MFO dropdowns are restricted to this set so they
     * can only select MFOs that the Office Head has already planned.
     *
     * In the Edit modal we have props.semester and props.year directly. We build
     * the payload using the currentEmployee's data (if it's the head itself) or
     * from the office info stored in targetPeriodDetails after fetchEmployeeData runs.
     *
     * Strategy:
     *   1. If currentEmployee IS the Office Head → skip (they see all MFOs)
     *   2. Use props.employee (passed by parent) to find the head employee info
     *   3. Fall back to targetPeriodDetails.office + props.year as minimal payload
     */
    const fetchHeadMfos = async () => {
      // Office Head sees the full MFO list — no need to fetch a restriction set
      if (isCurrentEmployeeOfficeHead.value) return

      const semester = props.semester
      const year = props.year
      if (!semester || !year) return

      // Build the payload. The API needs an employee object to scope to the right office.
      // We use props.employee if provided (it contains the full employee record from the parent),
      // otherwise fall back to what we know from targetPeriodDetails.
      let empData = null

      // Props.employee passed by the parent component (the employee being edited)
      // may be a non-head — but we need to pass the Office Head's info, not this employee.
      // The parent should pass the office_id which the server uses to find the head.
      // We'll use the office info we have and let the server resolve the head by office.
      if (props.employee) {
        const e = props.employee
        empData = {
          ControlNo: e.ControlNo || e.control_no || e.id || null,
          name: e.name || e.label || '',
          office: e.office || e.office_name || targetPeriodDetails.value.office || '',
          job_title: 'Office Head',
          office_id: e.office_id || e.officeId || null,
        }
      }

      if (!empData) {
        empData = {
          ControlNo: null,
          name: targetPeriodDetails.value.office || '',
          office: targetPeriodDetails.value.office || '',
          job_title: 'Office Head',
          office_id: null,
        }
      }

      const payload = { employee: empData }
      console.log('[EDIT-UWP] fetchHeadMfos payload:', payload)

      isFetchingHeadMfos.value = true
      try {
        const result = await mfoHeadStore.fetchMFOHead(semester, year, payload)
        const standards =
          result?.target_period?.performance_standards || result?.performance_standards || []
        headMfoNames.value = new Set(
          standards.map((ps) => (ps.mfo || '').trim().toLowerCase()).filter(Boolean),
        )
        console.log('[EDIT-UWP] headMfoNames loaded:', [...headMfoNames.value])
      } catch (err) {
        console.error('[EDIT-UWP] fetchHeadMfos error:', err)
        // On failure leave headMfoNames empty — MFO list falls back to full library
        headMfoNames.value = new Set()
      } finally {
        isFetchingHeadMfos.value = false
      }
    }

    // ===========================================================================
    // 8. SUPERVISOR RESOLUTION (MFO+OUTPUT AWARE)
    // ===========================================================================

    const calculateSupervisorySignatory = (
      employee,
      cascadeSource = null,
      mfoValue = null,
      outputName = null,
    ) => {
      const source = cascadeSource || cascadeStore.cascadeData
      const normalise = (s) => (s || '').toLowerCase().trim()

      if (!source) {
        return employee?.supervisorySignatory
          ? {
              controlNo: employee.supervisorySignatory.controlNo,
              name: employee.supervisorySignatory.name,
              rank: employee.supervisorySignatory.rank,
              job_title:
                employee.supervisorySignatory.job_title || employee.supervisorySignatory.jobTitle,
            }
          : null
      }

      const knownControlNo =
        employee?.supervisorySignatory?.controlNo ||
        employee?.employeeData?.existing_target_period?.supervisory_control_no ||
        null

      console.log('[EDIT-UWP] Resolving signatory:', employee?.name || employee?.label, {
        knownControlNo,
        rootControlNo: source.controlNo,
        mfoValue,
        outputName,
      })

      const fromSup = (sup) => ({
        controlNo: sup.controlNo,
        name: sup.name,
        rank: sup.rank,
        job_title: sup.job_title,
      })
      const fromRoot = () => ({
        controlNo: source.controlNo,
        name: source.name,
        rank: source.rank,
        job_title: source.job_title,
      })

      if (!mfoValue) return fromRoot()

      const knownSup = knownControlNo
        ? (source.supervisories || []).find((s) => s.controlNo === knownControlNo)
        : null

      if (outputName) {
        if (knownSup) {
          const hasIt = (knownSup.mfos || []).some(
            (m) =>
              normalise(m.mfo) === normalise(mfoValue) &&
              normalise(m.output) === normalise(outputName),
          )
          if (hasIt) {
            console.log('[EDIT-UWP] ✅ Known supervisor has MFO+output:', knownSup.name)
            return fromSup(knownSup)
          }
          console.log('[EDIT-UWP] Known supervisor lacks this MFO+output → Office Head')
          return fromRoot()
        }
        console.log('[EDIT-UWP] controlNo not in supervisories[] → Office Head')
        return fromRoot()
      }

      console.log('[EDIT-UWP] No output selected → using Office Head')
      return fromRoot()
    }

    // ===========================================================================
    // 9. COMPUTED PROPERTIES
    // ===========================================================================

    const semesterOptions = computed(() => uwpStore.getSemesterOptions)
    const yearOptions = computed(() => uwpStore.getYearOptions)

    const breadcrumbDisplay = computed(() => {
      if (!currentEmployee.value?.employeeData?.target_periods?.[0]) return 'Loading...'
      const tp = currentEmployee.value.employeeData.target_periods[0]
      return (
        [tp.office, tp.division, tp.section, tp.unit].filter(Boolean).join(' / ') ||
        'Organization Structure'
      )
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

    const filteredCompetencyOptionsByType = computed(() => {
      const { sg } = currentEmployee.value || {}
      if (!sg) return []
      const row = competencyStore.getBySG(sg)
      if (!row) return []
      return (COMPETENCY_DEFINITIONS[competencyType.value] || [])
        .filter((comp) => row[comp.code] && row[comp.code] !== '-')
        .map((comp) => ({
          code: comp.code,
          description: comp.description,
          label: `${comp.code} - ${comp.description}`,
          requiredLevel: row[comp.code],
        }))
    })

    const competencyOptions = computed(() => filteredCompetencyOptionsByType.value)

    const isAnyCompetencyValid = computed(() =>
      competencySelections.value.some((c) => c.selectedCompetency && c.selectedLevel),
    )

    const quantityExceedsMax = computed(() => {
      const max = currentQuantityRestriction.value?.maxQuantity
      if (max == null) return false
      return quantityValue.value > max
    })

    const isFormValid = computed(() => {
      if (!currentEmployee.value?.employeeId) return false
      if (!targetPeriodDetails.value?.semester || !targetPeriodDetails.value?.year) return false
      return currentEmployee.value.performanceStandards?.every((std) => {
        const filled =
          std.standardOutcomeRows?.filter((r) => r.effectiveness?.trim()?.length > 0).length || 0
        if (filled < 2) return false
        const { core = [], technical = [], leadership = [] } = std.competencies || {}
        return core.length + technical.length + leadership.length >= 1
      })
    })

    // ===========================================================================
    // 10. OUTPUT UNIQUENESS
    // ===========================================================================

    const extractRowId = (val) => {
      if (val == null) return null
      if (typeof val === 'object') return val.id ?? null
      return val
    }

    const getUsedOutputIdsForMfo = (currentIndex) => {
      const standards = currentEmployee.value?.performanceStandards
      if (!standards) return new Set()
      const currentStd = standards[currentIndex]

      const currentMfoId = extractRowId(currentStd?.rows?.mfo)
      if (currentMfoId == null) return new Set()

      const used = new Set()
      standards.forEach((std, idx) => {
        if (idx === currentIndex) return
        const stdMfoId = extractRowId(std?.rows?.mfo)
        if (stdMfoId == null || stdMfoId !== currentMfoId) return
        const outId = extractRowId(std?.rows?.output)
        if (outId != null) used.add(outId)
      })
      return used
    }

    const getAvailableOutputOptions = (index) => {
      const allOptions = getFilteredOutputOptions(index)
      const usedIds = getUsedOutputIdsForMfo(index)
      if (!usedIds.size) return allOptions

      const currentStd = currentEmployee.value?.performanceStandards?.[index]
      const currentOutputId = extractRowId(currentStd?.rows?.output)

      return allOptions.filter((opt) => !usedIds.has(opt.value) || opt.value === currentOutputId)
    }

    const getOutputNoOptionMessage = (index) => {
      const std = currentEmployee.value?.performanceStandards?.[index]
      if (!std?.rows?.category) return 'Select a category first'

      const all = getFilteredOutputOptions(index)
      const usedIds = getUsedOutputIdsForMfo(index)

      if (all.length === 0) return 'No outputs found matching your search'
      if (all.every((opt) => usedIds.has(opt.value))) {
        return 'All outputs for this MFO are already used in other performance standards'
      }
      return 'No outputs found matching your search'
    }

    // ===========================================================================
    // 11. CASCADE RESTRICTION LOGIC
    // ===========================================================================

    const checkAndApplyRestriction = async (standardIndex) => {
      // Office Head is the cascade root — no restriction applies to them.
      if (isCurrentEmployeeOfficeHead.value) return null

      const standard = currentEmployee.value?.performanceStandards?.[standardIndex]
      if (!standard?.rows?.mfo || !standard.indicatorName?.length) return null

      const mfoId = standard.rows.mfo
      const outputId = standard.rows.output
        ? typeof standard.rows.output === 'object'
          ? standard.rows.output.id
          : standard.rows.output
        : null

      const mfoIdResolved = typeof mfoId === 'object' ? mfoId.id : mfoId
      const selectedMfo = officeLibraryStore.mfos.find((m) => m.id === mfoIdResolved)
      const mfoValue = selectedMfo?.name || String(mfoIdResolved)

      const selectedOutputObj = outputId
        ? officeLibraryStore.outputs?.find((o) => o.id === outputId) ||
          officeLibraryStore.category_outputs?.find((o) => o.id === outputId)
        : null
      const outputName =
        selectedOutputObj?.name ||
        (typeof standard.rows.output === 'object' ? standard.rows.output?.name : null) ||
        null

      const semester = targetPeriodDetails.value?.semester
      const year = targetPeriodDetails.value?.year
      if (!semester || !year) return null

      const loadingNotif = $q.notify({
        message: 'Loading cascade data…',
        color: 'info',
        position: 'top',
        timeout: 0,
        spinner: true,
        group: false,
      })

      try {
        await cascadeStore.fetchCascade(semester, year, mfoValue)
        const raw = cascadeStore.cascadeData
        if (!raw) throw new Error('No cascade data found')

        const signatoryResult = calculateSupervisorySignatory(
          currentEmployee.value?.employeeData || currentEmployee.value,
          raw,
          mfoValue,
          outputName,
        )

        const isRootSupervisor = signatoryResult?.controlNo === raw.controlNo
        let sourceMfo = null
        let resolvedSignatory = signatoryResult

        if (isRootSupervisor) {
          sourceMfo = (raw.mfos || []).find(
            (m) => m.mfo === mfoValue || m.mfo === selectedMfo?.name,
          )
        } else {
          const matchedSup = (raw.supervisories || []).find(
            (sup) => sup.controlNo === signatoryResult?.controlNo,
          )
          sourceMfo = (matchedSup?.mfos || []).find(
            (m) => m.mfo === mfoValue || m.mfo === selectedMfo?.name,
          )

          if (!sourceMfo) {
            sourceMfo = (raw.mfos || []).find(
              (m) => m.mfo === mfoValue || m.mfo === selectedMfo?.name,
            )
            resolvedSignatory = {
              controlNo: raw.controlNo,
              name: raw.name,
              rank: raw.rank,
              job_title: raw.job_title,
            }
          }
        }

        if (resolvedSignatory) {
          currentEmployee.value.supervisorySignatory = resolvedSignatory
          // Stamp supervisory_control_no on this standard's rows immediately
          if (resolvedSignatory?.controlNo) {
            standard.rows.supervisory_control_no = resolvedSignatory.controlNo
          }
        }

        const signatoryControlNo = resolvedSignatory?.controlNo || 'root'

        standard._signatoryControlNo = signatoryControlNo
        standard._mfoValue = mfoValue
        standard._outputName = outputName || null

        const getStandardClaim = (s) => {
          const qty = s.standardOutcomeRows?.find((r) => r.rating === '5')?.quantity
          return parseFloat(s.targetOutputValue) || parseFloat(qty) || 0
        }
        const matchesPool = (s) => {
          if (!s._signatoryControlNo || s._signatoryControlNo !== signatoryControlNo) return false
          if (!s._mfoValue || s._mfoValue !== mfoValue) return false
          if (!isRootSupervisor && s._outputName !== outputName) return false
          return true
        }

        let claimedInSession = 0
        currentEmployee.value?.performanceStandards?.forEach((s, idx) => {
          if (idx === standardIndex) return
          if (matchesPool(s)) claimedInSession += getStandardClaim(s)
        })

        const buildMfoEntry = (mfo) => {
          if (!mfo) return null
          const totalTarget = mfo.total_target || 0
          const apiAvailable = mfo.available ?? Math.max(0, totalTarget - (mfo.claimed || 0))
          const sessionAvailable = isRootSupervisor
            ? Math.max(0, apiAvailable - claimedInSession)
            : Math.max(0, totalTarget - claimedInSession)
          return {
            ...mfo,
            total_target: totalTarget,
            claimed: claimedInSession,
            available: sessionAvailable,
          }
        }

        const fetchedData = sourceMfo
          ? {
              ...raw,
              name: resolvedSignatory?.name,
              rank: resolvedSignatory?.rank,
              job_title: resolvedSignatory?.job_title,
              controlNo: resolvedSignatory?.controlNo,
              mfos: [buildMfoEntry(sourceMfo)],
            }
          : {
              ...raw,
              name: resolvedSignatory?.name,
              rank: resolvedSignatory?.rank,
              job_title: resolvedSignatory?.job_title,
            }

        const restriction = quantityRestriction.determineRestriction({
          selectedEmployee: { ...currentEmployee.value, supervisorySignatory: resolvedSignatory },
          selectedIndicators: standard.indicatorName,
          quantityType: standard.quantityIndicatorType,
          verbs: officeLibraryIndicatorStore.verbs,
          cascadeData: fetchedData,
        })

        standard.quantityRestriction = restriction

        loadingNotif()
        $q.notify({
          message: 'Cascade data loaded',
          color: 'positive',
          position: 'top',
          timeout: 2000,
        })

        return restriction
      } catch (error) {
        loadingNotif()
        console.error('[EDIT-UWP] Cascade error:', error)
        $q.notify({
          message: error.message || 'Failed to load cascade data',
          color: 'negative',
          position: 'top',
        })
        return null
      }
    }

    // ===========================================================================
    // 12. COMPETENCY METHODS
    // ===========================================================================

    const autoPopulateCoreCompetencies = (standard, sg, level) => {
      if (!sg || !level) return
      const row = competencyStore.getBySG(sg)
      if (!row) return
      standard.competencies.core = COMPETENCY_DEFINITIONS.core
        .filter((comp) => row[comp.code] && row[comp.code] !== '-')
        .map((comp) => ({
          code: comp.code,
          description: comp.description,
          value: LEVEL_MAP[row[comp.code]]?.value || '1',
          level: row[comp.code],
        }))
    }

    const getLevelOptionsForCompetency = (competency) => {
      if (!competency) return []
      const rl = competency.requiredLevel
      return rl && LEVEL_MAP[rl] ? [LEVEL_MAP[rl]] : []
    }

    const openCompetencyModal = (type, standardIndex) => {
      if (!currentEmployee.value?.sg || !currentEmployee.value?.level) {
        $q.notify({
          message: 'Employee SG and Level are required',
          color: 'warning',
          position: 'top',
        })
        return
      }
      competencyType.value = type
      currentStandardIndexForCompetency.value = standardIndex
      competencySelections.value = [{ selectedCompetency: null, selectedLevel: null }]
      filteredCompetencyOptionsByRow.value = [[...filteredCompetencyOptionsByType.value]]
      showCompetencyModal.value = true
    }

    const filterCompetencies = (val, update, rowIndex) => {
      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()
          const filtered = filteredCompetencyOptionsByType.value.filter(
            (c) =>
              c.code.toLowerCase().includes(needle) || c.description.toLowerCase().includes(needle),
          )
          if (!filteredCompetencyOptionsByRow.value[rowIndex])
            filteredCompetencyOptionsByRow.value[rowIndex] = []
          filteredCompetencyOptionsByRow.value[rowIndex] = filtered
        })
      }
    }

    const getAvailableCompetencies = (rowIndex) => {
      const taken = competencySelections.value
        .map((sel, i) =>
          i !== rowIndex && sel.selectedCompetency ? sel.selectedCompetency.code : null,
        )
        .filter(Boolean)
      const options =
        filteredCompetencyOptionsByRow.value[rowIndex] || filteredCompetencyOptionsByType.value
      return options.filter((c) => !taken.includes(c.code))
    }

    const addCompetencyRow = () => {
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
      let added = 0
      competencySelections.value.forEach(({ selectedCompetency: sc, selectedLevel: sl }) => {
        if (!sc || !sl) return
        const already = standard.competencies[competencyType.value].some((e) => e.code === sc.code)
        if (!already) {
          standard.competencies[competencyType.value].push({
            code: sc.code,
            description: sc.description,
            value: sl.value,
            level: sl.label,
          })
          added++
        }
      })
      if (added)
        $q.notify({
          message: `${added} competenc${added > 1 ? 'ies' : 'y'} added`,
          color: 'positive',
          position: 'top',
        })
      competencySelections.value = [{ selectedCompetency: null, selectedLevel: null }]
      filteredCompetencyOptionsByRow.value = [[...filteredCompetencyOptionsByType.value]]
      showCompetencyModal.value = false
      validateCompetencies(currentStandardIndexForCompetency.value)
    }

    const removeCompetency = (type, compIndex, standardIndex) => {
      const standard = currentEmployee.value?.performanceStandards[standardIndex]
      if (!standard?.competencies[type]) return
      $q.dialog({
        title: 'Confirm Removal',
        message: `Remove ${standard.competencies[type][compIndex].code} competency?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        standard.competencies[type].splice(compIndex, 1)
        $q.notify({ message: 'Competency removed', color: 'positive', position: 'top' })
        validateCompetencies(standardIndex)
      })
    }

    const validateCompetencies = (standardIndex) => {
      const std = currentEmployee.value?.performanceStandards[standardIndex]
      if (!std) return
      const { core = [], technical = [], leadership = [] } = std.competencies
      showCompetencyError.value[standardIndex] =
        core.length + technical.length + leadership.length === 0
    }

    const cancelCompetencySelection = () => {
      showCompetencyModal.value = false
      competencySelections.value = [{ selectedCompetency: null, selectedLevel: null }]
      filteredCompetencyOptionsByRow.value = [[...filteredCompetencyOptionsByType.value]]
    }

    // ===========================================================================
    // 13. MFO / OUTPUT FILTER METHODS
    // ===========================================================================

    const getUsedMfoIdsForHead = (currentIndex) => {
      const used = new Set()
      if (!isCurrentEmployeeOfficeHead.value) return used
      currentEmployee.value?.performanceStandards?.forEach((s, idx) => {
        if (idx === currentIndex) return
        const mfoId = extractRowId(s?.rows?.mfo)
        if (mfoId != null) used.add(mfoId)
      })
      return used
    }

    /**
     * MFO option list for a given standard index.
     *
     * Office Head     → full list for selected category (no restriction).
     * Everyone else   → restricted to MFOs in the Office Head's plan (headMfoNames Set).
     *                   Falls back to full list when headMfoNames is empty.
     */
    const getFilteredMfoOptions = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard?.rows.category) return []
      const categoryId =
        typeof standard.rows.category === 'object'
          ? standard.rows.category.id
          : standard.rows.category
      const currentMfoId = extractRowId(standard.rows.mfo)
      const usedIds = getUsedMfoIdsForHead(index)

      let list = officeLibraryStore.mfos
        .filter((mfo) => {
          if (mfo.f_category_id !== categoryId) return false
          if (isCurrentEmployeeOfficeHead.value && usedIds.has(mfo.id) && mfo.id !== currentMfoId)
            return false
          return true
        })
        .map((mfo) => ({
          id: mfo.id,
          label: mfo.name,
          value: mfo.id,
          name: mfo.name,
          code: mfo.code || '',
          description: mfo.description || '',
        }))

      // Non-Office-Head employees: restrict to head's MFOs when available
      if (!isCurrentEmployeeOfficeHead.value && headMfoNames.value.size > 0) {
        list = list.filter((m) => headMfoNames.value.has((m.name || '').trim().toLowerCase()))
      }

      return list
    }

    const getFilteredOutputOptions = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard?.rows?.category) return []
      const categoryId =
        typeof standard.rows.category === 'object'
          ? standard.rows.category.id
          : standard.rows.category
      if (!categoryId) return []

      if (isSupportCategory(categoryId)) {
        return officeLibraryStore.category_outputs
          .filter((o) => o.f_category_id === categoryId)
          .map((o) => ({
            id: o.id,
            label: o.name,
            value: o.id,
            name: o.name,
            code: o.code || '',
            description: o.description || '',
          }))
      }

      const mfoId = standard.rows.mfo
        ? typeof standard.rows.mfo === 'object'
          ? standard.rows.mfo.id
          : standard.rows.mfo
        : null

      return officeLibraryStore.outputs
        .filter((o) => {
          if (o.f_category_id !== categoryId) return false
          if (mfoId) return o.mfo_id === mfoId
          return o.mfo_id === null
        })
        .map((o) => ({
          id: o.id,
          label: o.name,
          value: o.id,
          name: o.name,
          code: o.code || '',
          description: o.description || '',
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
      const catId =
        typeof standard.rows.category === 'object'
          ? standard.rows.category.id
          : standard.rows.category
      const currentMfoId = extractRowId(standard.rows.mfo)
      const usedIds = getUsedMfoIdsForHead(index)

      update(() => {
        let list = officeLibraryStore.mfos
          .filter((m) => {
            if (m.f_category_id !== catId) return false
            if (isCurrentEmployeeOfficeHead.value && usedIds.has(m.id) && m.id !== currentMfoId)
              return false
            if (
              needle &&
              !m.name?.toLowerCase().includes(needle) &&
              !m.code?.toLowerCase().includes(needle) &&
              !m.description?.toLowerCase().includes(needle)
            )
              return false
            return true
          })
          .map((m) => ({
            id: m.id,
            label: m.name,
            value: m.id,
            name: m.name,
            code: m.code || '',
            description: m.description || '',
          }))

        // Non-Office-Head employees: restrict to head's MFOs when available
        if (!isCurrentEmployeeOfficeHead.value && headMfoNames.value.size > 0) {
          list = list.filter((m) => headMfoNames.value.has((m.name || '').trim().toLowerCase()))
        }

        filteredMfoOptions.value[index] = list
      })
    }

    const filterOutputs = (val, update, index) => {
      if (typeof update !== 'function') return
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard?.rows.category) return update(() => (filteredOutputOptions.value[index] = []))

      const needle = (val || '').toLowerCase()
      const available = getAvailableOutputOptions(index)
      update(() => {
        filteredOutputOptions.value[index] = available.filter(
          (o) =>
            o.label.toLowerCase().includes(needle) ||
            o.code?.toLowerCase().includes(needle) ||
            o.description?.toLowerCase().includes(needle),
        )
      })
    }

    const filterPerformanceIndicators = (val, update) => {
      const base = officeLibraryIndicatorStore.verbs.map((verb) => ({
        id: verb.id,
        label: verb.indicator_name || verb.name,
        value: verb.id,
        name: verb.indicator_name || verb.name,
        description: verb.description || '',
      }))
      const needle = (val || '').toLowerCase()
      const filtered = base.filter(
        (v) =>
          v.label.toLowerCase().includes(needle) || v.description.toLowerCase().includes(needle),
      )
      if (typeof update === 'function') update(() => (filteredVerbs.value = filtered))
      else filteredVerbs.value = filtered
    }

    // ===========================================================================
    // 14. SUCCESS INDICATOR GENERATION
    // ===========================================================================

    const getQuantityComponent = (index) => {
      const std = currentEmployee.value?.performanceStandards?.[index]
      if (!std) return ''
      if (std.quantityIndicatorType === 'numeric')
        return std.standardOutcomeRows.find((r) => r.rating === '5')?.quantity || ''
      if (std.quantityIndicatorType === 'B')
        return std.targetOutputValue || std.apiData?.config?.target_output || ''
      if (std.quantityIndicatorType === 'C') return '100%'
      return ''
    }

    const getEffectivenessComponent = (index) => {
      const std = currentEmployee.value?.performanceStandards?.[index]
      return std?.standardOutcomeRows.find((r) => r.rating === '5')?.effectiveness || ''
    }

    const getTimelinessComponent = (index) => {
      const std = currentEmployee.value?.performanceStandards?.[index]
      if (!std) return ''
      const row =
        std.timelinessIndicatorType === 'beforeDeadline'
          ? std.standardOutcomeRows[2]
          : std.standardOutcomeRows[0]
      const parts = []
      if (std.activeTimelinessInputs.range && row.timelinessRange) parts.push(row.timelinessRange)
      if (std.activeTimelinessInputs.date && row.timelinessDate)
        parts.push(`by ${row.timelinessDate}`)
      if (std.activeTimelinessInputs.description && row.timelinessText)
        parts.push(row.timelinessText)
      const joined = parts.join(' ')
      return joined ? `, ${joined}` : ''
    }

    const generateSuccessIndicator = (index) => {
      if (!currentEmployee.value?.performanceStandards) return
      const indices = Number.isInteger(index)
        ? [index]
        : currentEmployee.value.performanceStandards.map((_, i) => i)

      indices.forEach((i) => {
        const std = currentEmployee.value.performanceStandards[i]
        if (!std) return
        const qtyPart = getQuantityComponent(i)
        const outputPart = std.outputName?.trim() || ''
        let indicatorPart = ''
        if (Array.isArray(std.indicatorName) && std.indicatorName.length > 0) {
          const names = std.indicatorName
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
          if (names.length === 1) indicatorPart = names[0]
          else if (names.length === 2) indicatorPart = names.join(' and ')
          else indicatorPart = `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
        }
        const effectPart = getEffectivenessComponent(i)
        const timePart = getTimelinessComponent(i)
        std.successIndicator = [qtyPart, outputPart, indicatorPart, effectPart, timePart]
          .filter((p) => p?.trim())
          .join(' ')
      })
    }

    // ===========================================================================
    // 15. VALIDATION HELPERS
    // ===========================================================================

    const hasMinimumEffectivenessValues = (index) => {
      const std = currentEmployee.value?.performanceStandards?.[index]
      if (!std) return false
      return std.standardOutcomeRows.filter((r) => r.effectiveness?.trim()?.length > 0).length >= 2
    }

    const validateStrictNumeric = (value) => {
      if (!value) return true
      return /^\d+(?:-\d+)?$/.test(value) || 'Enter a valid number or range (e.g., 10 or 10-20)'
    }

    const blockInvalidChars = (event) => {
      const allowed = [
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
      if (allowed.includes(event.key)) return
      if (event.key >= '0' && event.key <= '9') return
      if (event.key === '-') {
        if (event.target.value.includes('-')) event.preventDefault()
        return
      }
      event.preventDefault()
    }

    const sanitizeNumericInput = (row, field) => {
      if (!row[field]) return
      row[field] = row[field].replace(/[^0-9-]/g, '')
      const hyphens = row[field].split('-').length - 1
      if (hyphens > 1) row[field] = row[field].substring(0, row[field].lastIndexOf('-'))
    }

    const getQuantityHint = (standard) => {
      const r = standard.quantityRestriction
      return r != null && r.maxQuantity != null ? `Max: ${r.maxQuantity}` : ''
    }

    const isQuantityExceeded = (standard, row) => {
      if (standard.quantityIndicatorType !== 'numeric') return false
      const r = standard.quantityRestriction
      if (!r || r.maxQuantity == null) return false
      const val = parseInt(row.quantity)
      return !isNaN(val) && val > r.maxQuantity
    }

    const getQuantityErrorMessage = (standard) => {
      const r = standard.quantityRestriction
      return r != null && r.maxQuantity != null ? `Cannot exceed ${r.maxQuantity}` : ''
    }

    // ===========================================================================
    // 16. QUANTITY COMPUTATION
    // ===========================================================================

    const onQuantityOptionSelect = (value, index) => {
      const std = currentEmployee.value?.performanceStandards?.[index]
      if (!std) return
      std.quantityIndicatorType = value
      currentStandardIndex.value = index
      if (value === 'B') {
        if (std.apiData?.config) {
          const existing = std.apiData.config.targetOutput || std.apiData.config.target_output
          if (existing) {
            quantityValue.value = existing
            std.targetOutputValue = existing
          }
        }
        currentQuantityRestriction.value = std.quantityRestriction
        showQuantityModal.value = true
      } else if (value === 'C') {
        computeQuantities('C', index)
      } else {
        std.standardOutcomeRows.forEach((r) => (r.quantity = ''))
        std.targetOutputValue = null
        generateSuccessIndicator(index)
      }
    }

    const computeQuantities = (type = null, index = null) => {
      const idx = index !== null ? index : currentStandardIndex.value
      const std = currentEmployee.value?.performanceStandards?.[idx]
      if (!std) return
      const currentType = type || std.quantityIndicatorType

      if (currentType === 'B') {
        if (!quantityValue.value || isNaN(quantityValue.value) || quantityValue.value <= 0) {
          $q.notify({
            message: 'Please enter a valid number greater than 0',
            color: 'negative',
            position: 'top',
          })
          return
        }
        if (
          std.quantityRestriction?.maxQuantity != null &&
          quantityValue.value > std.quantityRestriction.maxQuantity
        ) {
          $q.notify({
            message: `Target cannot exceed ${std.quantityRestriction.maxQuantity}`,
            color: 'warning',
            position: 'top',
          })
          return
        }
        const base = Number(quantityValue.value)
        std.targetOutputValue = base.toString()
        const max130 = Math.round(base * 1.3)
        const max115 = Math.round(base * 1.15)
        const max50 = Math.round(base * 0.5)
        const cap =
          std.quantityRestriction?.maxQuantity != null ? std.quantityRestriction.maxQuantity : null
        if (cap != null) {
          std.standardOutcomeRows[0].quantity = `${Math.min(max130, cap)} and above`
          std.standardOutcomeRows[1].quantity = `${Math.min(max115, cap)}-${Math.min(max130 - 1, cap)}`
          std.standardOutcomeRows[2].quantity = `${Math.min(base, cap)}-${Math.min(max115 - 1, cap)}`
          std.standardOutcomeRows[3].quantity = `${Math.min(max50 + 1, cap)}-${Math.min(base - 1, cap)}`
          std.standardOutcomeRows[4].quantity = `${Math.min(max50, cap)} and below`
        } else {
          std.standardOutcomeRows[0].quantity = `${max130} and above`
          std.standardOutcomeRows[1].quantity = `${max115}-${max130 - 1}`
          std.standardOutcomeRows[2].quantity = `${base}-${max115 - 1}`
          std.standardOutcomeRows[3].quantity = `${max50 + 1}-${base - 1}`
          std.standardOutcomeRows[4].quantity = `${max50} and below`
        }
        quantityValue.value = null
        currentQuantityRestriction.value = null
        showQuantityModal.value = false
        generateSuccessIndicator(idx)
        $q.notify({ message: 'Quantities calculated (Type B)', color: 'positive', position: 'top' })
      } else if (currentType === 'C') {
        std.targetOutputValue = '100%'
        std.standardOutcomeRows[0].quantity = '100% and above'
        std.standardOutcomeRows[1].quantity = '88%-99%'
        std.standardOutcomeRows[2].quantity = '77%-87%'
        std.standardOutcomeRows[3].quantity = '38%-76%'
        std.standardOutcomeRows[4].quantity = '37% and below'
        generateSuccessIndicator(idx)
        $q.notify({ message: 'Quantities set (Type C)', color: 'positive', position: 'top' })
      } else {
        std.targetOutputValue = null
        generateSuccessIndicator(idx)
      }
    }

    const cancelQuantityInput = () => {
      const std = currentEmployee.value?.performanceStandards?.[currentStandardIndex.value]
      if (std) std.quantityIndicatorType = 'numeric'
      showQuantityModal.value = false
      currentQuantityRestriction.value = null
    }

    // ===========================================================================
    // 17. TIMELINESS METHODS
    // ===========================================================================

    const onTimelinessTypeSelect = (value, index) => {
      const std = currentEmployee.value?.performanceStandards?.[index]
      if (!std) return
      std.timelinessIndicatorType = value
      Object.assign(std.timelinessInputs, { range: true, date: false, description: false })
      generateSuccessIndicator(index)
    }

    const applyTimelinessInputs = (type, index) => {
      const std = currentEmployee.value?.performanceStandards?.[index]
      if (!std) return
      Object.assign(std.activeTimelinessInputs, std.timelinessInputs)
      if (
        !std.activeTimelinessInputs.range &&
        !std.activeTimelinessInputs.date &&
        !std.activeTimelinessInputs.description
      ) {
        std.activeTimelinessInputs.range = true
        std.timelinessInputs.range = true
      }
      std.standardOutcomeRows.forEach((row) => {
        if (!std.activeTimelinessInputs.range) row.timelinessRange = ''
        if (!std.activeTimelinessInputs.date) row.timelinessDate = ''
        if (!std.activeTimelinessInputs.description) row.timelinessText = ''
      })
      $q.notify({
        message: `Applied ${type === 'beforeDeadline' ? 'Before Deadline' : 'On Deadline'} input types`,
        color: 'positive',
        position: 'top',
      })
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

    const onQuantityUpdate = async (row, field, index) => {
      sanitizeNumericInput(row, field)
      const std = currentEmployee.value?.performanceStandards?.[index]
      if (
        row.rating === '5' &&
        std?.rows?.mfo &&
        std.indicatorName?.length &&
        !isCurrentEmployeeOfficeHead.value
      ) {
        await checkAndApplyRestriction(index)
      }
      if (std?.quantityRestriction?.maxQuantity != null) {
        const val = parseInt(row.quantity)
        if (!isNaN(val) && val > std.quantityRestriction.maxQuantity) {
          $q.notify({
            message: `Quantity cannot exceed ${std.quantityRestriction.maxQuantity}`,
            color: 'warning',
            position: 'top',
            timeout: 3000,
          })
        }
      }
      generateSuccessIndicator(index)
    }

    // ===========================================================================
    // 18. PERFORMANCE STANDARD MANAGEMENT
    // ===========================================================================

    const addPerformanceStandard = async () => {
      isAddingStandard.value = true
      try {
        if (!currentEmployee.value) currentEmployee.value = createDefaultEmployeeData()
        if (!currentEmployee.value.performanceStandards)
          currentEmployee.value.performanceStandards = []
        const newStd = createDefaultPerformanceStandard()
        if (currentEmployee.value.sg && currentEmployee.value.level) {
          autoPopulateCoreCompetencies(
            newStd,
            currentEmployee.value.sg,
            currentEmployee.value.level,
          )
        }
        currentEmployee.value.performanceStandards.push(newStd)
        $q.notify({
          message: `Added performance standard ${currentEmployee.value.performanceStandards.length}`,
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
      if (standards.length <= 1)
        return $q.notify({
          message: 'Cannot remove the only performance standard',
          color: 'negative',
          position: 'top',
        })
      $q.dialog({
        title: 'Confirm Deletion',
        message: `Remove Performance Standard ${index + 1}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        standards.splice(index, 1)
        showCompetencyError.value.splice(index, 1)
        $q.notify({ message: 'Performance standard removed', color: 'positive', position: 'top' })
      })
    }

    // ===========================================================================
    // 19. DATA FETCHING
    // ===========================================================================

    const fetchEmployeeData = async (controlNo, semester, year) => {
      isLoadingFilteredEmployees.value = true
      try {
        const employeeData = await uwpStore.fetchEmployeeByControlNo(controlNo, semester, year)
        if (!employeeData?.length) {
          currentEmployee.value = createDefaultEmployeeData()
          currentEmployee.value.name = 'Unknown Employee'
          currentEmployee.value.controlNo = controlNo
          $q.notify({
            message: 'No existing work plan found. Creating new template.',
            color: 'info',
            position: 'top',
          })
          return
        }

        const employee = employeeData[0]
        currentEmployee.value = {
          id: `emp_${employee.id || employee.employeeId}`,
          name: employee.name || 'Unknown Employee',
          employeeId: employee.id || employee.employeeId,
          controlNo: employee.controlNo || employee.employeeData?.ControlNo || controlNo,
          sg: employee.sg || employee.employeeData?.sg || '',
          level: employee.level || employee.employeeData?.level || '',
          rank: employee.rank || employee.employeeData?.rank || 'Employee',
          position: employee.position || employee.employeeData?.position || '',
          supervisorySignatory: employee.supervisorySignatory || null,
          performanceStandards: [],
          employeeData: employee.employeeData || employee,
          hierarchy: {},
        }

        let targetPeriod =
          employee.employeeData?.target_periods?.[0] || employee.target_periods?.[0] || null

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
          currentEmployee.value.hierarchy = { ...targetPeriodDetails.value }

          const performanceStandards = targetPeriod.performance_standards || []
          if (performanceStandards.length > 0) {
            currentEmployee.value.performanceStandards = performanceStandards.map((ps) => {
              const config = ps.config || targetPeriod.config || {}
              const timelinessType = config.timelinessType || {}

              let quantityIndicatorType = 'numeric'
              if (config.quantityIndicator === 'C' || config.quantity_indicator === 'C')
                quantityIndicatorType = 'C'
              else if (config.quantityIndicator === 'B' || config.quantity_indicator === 'B')
                quantityIndicatorType = 'B'

              let timelinessIndicatorType = 'beforeDeadline'
              if (
                config.timelinessIndicator === 'onDeadline' ||
                config.timeliness_indicator === 'onDeadline'
              )
                timelinessIndicatorType = 'onDeadline'

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
                  (m) =>
                    m.name?.toLowerCase() === mfoName?.toLowerCase() &&
                    m.f_category_id === categoryObj.id,
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
                    (o) =>
                      o.name?.toLowerCase() === outputName?.toLowerCase() &&
                      o.f_category_id === categoryObj.id,
                  ) || { id: null, name: outputName, label: outputName }
                } else {
                  outputObj = officeLibraryStore.outputs?.find(
                    (o) =>
                      o.name?.toLowerCase() === outputName?.toLowerCase() &&
                      o.f_category_id === categoryObj.id &&
                      (!mfoObj || o.mfo_id === mfoObj.id),
                  ) || { id: null, name: outputName, label: outputName }
                }
              }

              const indicatorName = uwpStore.resolvePerformanceIndicators(
                ps.performance_indicator,
                officeLibraryIndicatorStore.verbs || [],
              )

              const mapComp = (comp) => ({
                code: comp.code,
                description: comp.description || '',
                value: comp.level || '1',
                level:
                  Object.entries({
                    Basic: '1',
                    Intermediate: '2',
                    Advanced: '3',
                    Superior: '4',
                  }).find(([, v]) => v === comp.level)?.[0] || 'Basic',
              })

              const ratings = ps.ratings || []
              const standardOutcomeRows = createDefaultStandardRows().map((row) => {
                const ratingData = ratings.find((r) => r.rating?.toString() === row.rating)
                if (!ratingData) return row
                const parsed = uwpStore.parseTimelinessFromApi(ratingData.timeliness || '')
                return {
                  ...row,
                  quantity: ratingData.quantity || '',
                  effectiveness: ratingData.effectiveness || '',
                  timeliness: ratingData.timeliness || '',
                  timelinessRange: parsed.range || '',
                  timelinessText: parsed.text || '',
                  timelinessDate: parsed.date || '',
                }
              })

              const standard = {
                id: `ps_${ps.id || Date.now()}`,
                expanded: true,
                outputName: ps.output_name || '',
                indicatorName,
                successIndicator: ps.success_indicator || '',
                requiredOutput: ps.required_output || '',
                modeOfVerification: '',
                rows: {
                  category: categoryObj,
                  mfo: mfoObj,
                  output: outputObj,
                  supervisory_control_no: ps.supervisory_control_no || null,
                },
                quantityIndicatorType,
                timelinessIndicatorType,
                timelinessInputs,
                activeTimelinessInputs: { ...timelinessInputs },
                standardOutcomeRows,
                competencies: {
                  core: (ps.core || ps.core_competency || []).map(mapComp),
                  technical: (ps.technical || ps.technical_competency || []).map(mapComp),
                  leadership: (ps.leadership || ps.leadership_competency || []).map(mapComp),
                },
                quantityRestriction: null,
                apiData: ps,
                targetOutputValue: null,
              }

              if (quantityIndicatorType === 'B') {
                const existing = config.targetOutput || config.target_output
                if (existing) standard.targetOutputValue = existing
              }

              return standard
            })
          } else {
            currentEmployee.value.performanceStandards = [createDefaultPerformanceStandard()]
          }
        } else {
          targetPeriodDetails.value = {
            semester,
            year,
            office: employee.office || '',
            office2: '',
            group: '',
            division: '',
            section: '',
            unit: '',
          }
          currentEmployee.value.performanceStandards = [createDefaultPerformanceStandard()]
        }

        if (currentEmployee.value.sg && currentEmployee.value.level) {
          currentEmployee.value.performanceStandards.forEach((std) =>
            autoPopulateCoreCompetencies(
              std,
              currentEmployee.value.sg,
              currentEmployee.value.level,
            ),
          )
        }

        currentEmployee.value.performanceStandards.forEach((_, idx) => {
          setTimeout(() => generateSuccessIndicator(idx), 100)
        })
      } catch (error) {
        console.error('[EDIT-UWP] Error fetching employee data:', error)
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
          $q.notify({ message: 'Missing required parameters', color: 'warning', position: 'top' })
          currentEmployee.value = createDefaultEmployeeData()
        }
      } catch (error) {
        console.error('[EDIT-UWP] Failed to initialize UWP data:', error)
        currentEmployee.value = createDefaultEmployeeData()
      } finally {
        setTimeout(() => {
          isLoading.value = false
        }, 500)
      }
    }

    // ===========================================================================
    // 20. FORM SUBMISSION
    // ===========================================================================

    const onSubmit = async () => {
      shouldValidate.value = true
      formInteracted.value = true

      if (!currentEmployee.value?.employeeId)
        return $q.notify({
          message: 'Please select an employee',
          color: 'negative',
          position: 'top',
        })

      const invalid = []
      currentEmployee.value.performanceStandards?.forEach((std, idx) => {
        const errors = []
        const filled = std.standardOutcomeRows.filter(
          (r) => r.effectiveness?.trim()?.length > 0,
        ).length
        if (filled < 2) errors.push('requires at least 2 effectiveness values')
        const { core = [], technical = [], leadership = [] } = std.competencies || {}
        if (core.length + technical.length + leadership.length < 1)
          errors.push('requires at least 1 competency')
        if (std.quantityIndicatorType === 'B' && std.quantityRestriction?.maxQuantity) {
          const tv = parseFloat(std.targetOutputValue)
          if (!isNaN(tv) && tv > std.quantityRestriction.maxQuantity)
            errors.push(`quantity exceeds max (${std.quantityRestriction.maxQuantity})`)
        }
        if (errors.length) invalid.push(`${idx + 1} (${errors.join(', ')})`)
      })

      if (invalid.length)
        return $q.notify({
          message: `Please complete required fields for standards: ${invalid.join(', ')}`,
          color: 'negative',
          position: 'top',
          timeout: 5000,
        })

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
            supervisorySignatory: currentEmployee.value.supervisorySignatory,
            performanceStandards: currentEmployee.value.performanceStandards?.map((std) => ({
              ...std,
              indicatorName: Array.isArray(std.indicatorName)
                ? std.indicatorName
                : std.indicatorName
                  ? [std.indicatorName]
                  : [],
              rows: {
                category: std.rows?.category?.id ?? std.rows?.category,
                mfo: std.rows?.mfo?.id ?? std.rows?.mfo,
                output: std.rows?.output?.id ?? std.rows?.output,
                supervisory_control_no: std.rows?.supervisory_control_no || null,
              },
            })),
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
        console.error('[EDIT-UWP] Update error:', error.response?.data || error)
        if (error.response?.data?.errors?.['supervisory_control_no']) {
          $q.notify({
            message: 'Missing supervisory signatory. Please ensure the employee has a supervisor.',
            color: 'negative',
            position: 'top',
            timeout: 5000,
          })
        }
      }
    }

    // ===========================================================================
    // 21. WATCHERS
    // ===========================================================================

    watch(
      () => ({ sg: currentEmployee.value?.sg, level: currentEmployee.value?.level }),
      ({ sg, level }) => {
        if (sg && level && currentEmployee.value?.performanceStandards) {
          currentEmployee.value.performanceStandards.forEach((std) =>
            autoPopulateCoreCompetencies(std, sg, level),
          )
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
      (stds) => stds?.forEach((_, i) => validateCompetencies(i)),
      { deep: true },
    )

    watch(
      () => competencySelections.value.map((s) => s.selectedCompetency),
      () => {
        competencySelections.value.forEach((sel) => {
          if (sel.selectedCompetency && !sel.selectedLevel) {
            const opts = getLevelOptionsForCompetency(sel.selectedCompetency)
            if (opts.length) sel.selectedLevel = opts[0]
          }
        })
      },
      { deep: true },
    )

    watch(
      () =>
        currentEmployee.value?.performanceStandards?.map((s) => ({
          id: s.id,
          indicatorName: JSON.stringify(s.indicatorName),
          mfo: typeof s.rows?.mfo === 'object' ? s.rows?.mfo?.id : s.rows?.mfo,
          output: typeof s.rows?.output === 'object' ? s.rows?.output?.id : s.rows?.output,
        })),
      async (newStds, oldStds) => {
        if (isCurrentEmployeeOfficeHead.value) return
        if (!newStds || !oldStds || newStds.length !== oldStds.length) return
        for (let i = 0; i < newStds.length; i++) {
          if (!newStds[i] || !oldStds[i]) continue
          const indicatorChanged = newStds[i].indicatorName !== oldStds[i].indicatorName
          const outputChanged = newStds[i].output !== oldStds[i].output
          if (!indicatorChanged && !outputChanged) continue
          const std = currentEmployee.value.performanceStandards[i]
          if (!std) continue
          std.quantityRestriction = null
          if (std.rows?.mfo && std.indicatorName?.length) await checkAndApplyRestriction(i)
        }
      },
      { deep: true },
    )

    watch(
      () => competencyType.value,
      () => {
        filteredCompetencyOptionsByRow.value = [[...filteredCompetencyOptionsByType.value]]
      },
    )

    watch(
      () => currentEmployee.value?.performanceStandards?.map((s) => s.rows?.category),
      () => {
        if (!isCurrentEmployeeOfficeHead.value) return
        currentEmployee.value?.performanceStandards?.forEach((std) => {
          if (!isSupportCategory(std.rows?.category) && std.rows?.output != null)
            std.rows.output = null
        })
      },
      { deep: true },
    )

    // Re-run fetchHeadMfos once currentEmployee is loaded (non-head employees only)
    watch(
      () => currentEmployee.value?.employeeId,
      (newId) => {
        if (newId && !isCurrentEmployeeOfficeHead.value) {
          fetchHeadMfos()
        }
      },
    )

    // ===========================================================================
    // 22. LIFECYCLE HOOKS
    // ===========================================================================

    onMounted(async () => {
      try {
        await Promise.all([
          officeLibraryStore.fetchAllData(1),
          officeLibraryIndicatorStore.fetchVerbs(),
        ])

        filterPerformanceIndicators('', null)

        await initializeUWPData()

        // Always fetch head MFOs after employee data is loaded.
        // The watcher above handles the case when currentEmployee loads after this.
        // This call covers the synchronous case and non-head employees.
        fetchHeadMfos()
      } catch (error) {
        console.error('[EDIT-UWP] Error loading data:', error)
        $q.notify({
          message: 'Failed to load library data: ' + error.message,
          color: 'negative',
          position: 'top',
        })
      } finally {
        isLoading.value = false
      }
    })

    // ===========================================================================
    // 23. EXPOSE TO TEMPLATE
    // ===========================================================================

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
      currentQuantityRestriction,
      quantityExceedsMax,
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
      filteredCompetencyOptions,
      showCompetencyError,
      competencySelections,
      filteredCompetencyOptionsByRow,
      isAnyCompetencyValid,
      filteredCompetencyOptionsByType,

      // Head MFO filter
      headMfoNames,
      isFetchingHeadMfos,
      fetchHeadMfos,

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

      // Helper functions
      getLevelText,
      getCategoryLabel,
      getMfoLabel,
      getOutputLabel,
      isSupportCategory,
      hasMinimumEffectivenessValues,
      timelinessColumnClass,
      isCurrentEmployeeOfficeHead,
      shouldShowOutput,
      getLevelOptionsForCompetency,
      getQuantityHint,
      isQuantityExceeded,
      getQuantityErrorMessage,

      // Output uniqueness
      getAvailableOutputOptions,
      getOutputNoOptionMessage,

      // Filter methods
      filterPerformanceIndicators,
      getFilteredMfoOptions,
      getFilteredOutputOptions,
      clearDependentFields,
      filterMfos,
      filterOutputs,

      // Success indicator
      generateSuccessIndicator,

      // Quantity/Timeliness/Effectiveness handlers
      onQuantityUpdate,
      onTimelinessUpdate,
      onEffectivenessUpdate,
      onEffectivenessFieldFocus,
      onQuantityOptionSelect,
      onTimelinessTypeSelect,
      applyTimelinessInputs,
      computeQuantities,
      cancelQuantityInput,

      // Performance standard management
      addPerformanceStandard,
      removePerformanceStandard,

      // Restriction
      checkAndApplyRestriction,

      // Submit
      onSubmit,
      validateStrictNumeric,
      blockInvalidChars,
      uwpStore,

      // Competency methods
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
  transition: box-shadow 0.2s ease;
}
.q-card:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}
.clean-table {
  border-radius: 8px;
}
.status-badge {
  border-radius: 4px;
  padding: 4px 8px;
}
.competency-card,
.full-height {
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
.table-container {
  overflow-x: auto;
  max-width: 100%;
}
.bg-info {
  background-color: #1976d2;
}
.bg-warning {
  background-color: #f2c037;
}
.bg-negative {
  background-color: #c10015;
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
