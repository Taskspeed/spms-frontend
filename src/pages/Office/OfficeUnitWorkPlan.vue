<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="q-pa-md">
    <!-- Top Header Row -->
    <div class="row items-center justify-between q-mb-md q-pl-lg q-pr-lg">
      <div class="column items-start">
        <h1 class="text-h6 q-mb-none">UNIT WORK PLAN - {{ selectedNodeLabel }}</h1>
        <p class="text-grey-7 q-mt-xs">{{ breadcrumbDisplay }}</p>
        <p class="text-caption text-grey-6 q-mt-xs">
          <!-- Show available employees to select -->
          Available Employees:
          <strong>{{ uwpData.employeesWithoutTargetPeriod?.length || 0 }}</strong>
          <span v-if="employeeTabs.length > 0" class="q-ml-md">
            Selected: <strong>{{ getSelectedEmployeeIds().length }}</strong>
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
            <!-- Left Side:  Division, Section, Unit -->
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
                  <template v-slot:prepend>
                    <q-icon name="calendar_view_month" size="xs" />
                  </template>
                </q-input>

                <q-separator />

                <!-- Office -->
                <q-input v-model="hierarchyLabels.office" label="Office" outlined dense readonly>
                  <template v-slot:prepend>
                    <q-icon name="account_balance" size="xs" />
                  </template>
                </q-input>

                <!-- Office2 -->
                <q-input
                  v-model="hierarchyLabels.office2"
                  label="Sub-Ofiice"
                  outlined
                  dense
                  readonly
                >
                  <template v-slot:prepend>
                    <q-icon name="business" size="xs" />
                  </template>
                </q-input>

                <!-- Group -->
                <q-input v-model="hierarchyLabels.group" label="Group" outlined dense readonly>
                  <template v-slot:prepend>
                    <q-icon name="group_work" size="xs" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Right Side:  Semester, Year -->
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
                  <template v-slot:prepend>
                    <q-icon name="event" size="xs" />
                  </template>
                </q-input>

                <q-separator />

                <!-- Division -->
                <q-input
                  v-model="hierarchyLabels.division"
                  label="Division"
                  outlined
                  dense
                  readonly
                >
                  <template v-slot:prepend>
                    <q-icon name="business" size="xs" />
                  </template>
                </q-input>

                <!-- Section -->
                <q-input v-model="hierarchyLabels.section" label="Section" outlined dense readonly>
                  <template v-slot:prepend>
                    <q-icon name="account_tree" size="xs" />
                  </template>
                </q-input>

                <!-- Unit -->
                <q-input v-model="hierarchyLabels.unit" label="Unit" outlined dense readonly>
                  <template v-slot:prepend>
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
        <!-- Employee Tabs -->
        <div class="employee-tabs-container">
          <q-tabs
            v-model="activeEmployeeTab"
            dense
            class="text-grey"
            active-color="green-9"
            indicator-color="green-9"
            align="left"
            narrow-indicator
          >
            <!-- Show only the first maxVisibleTabs -->
            <q-tab
              v-for="(employee, index) in visibleEmployeeTabs"
              :key="employee.id"
              :name="employee.id"
              :label="`Employee ${index + 1}${employee.name ? ':  ' + employee.name : ''}`"
              @click="switchToEmployee(employee.id)"
            />

            <!-- More menu for overflow tabs -->
            <q-btn
              v-if="hasOverflowTabs"
              flat
              round
              dense
              color="grey-7"
              icon="more_horiz"
              class="q-ml-sm"
            >
              <q-menu>
                <q-list style="min-width: 150px">
                  <q-item-label header>More Employees</q-item-label>
                  <q-separator />
                  <q-item
                    v-for="emp in overflowEmployeeTabs"
                    :key="`overflow-${emp.id}`"
                    clickable
                    v-close-popup
                    @click="switchToEmployee(emp.id)"
                    :active="activeEmployeeTab === emp.id"
                  >
                    <q-item-section>
                      <q-item-label>{{
                        emp.name || `Employee ${getEmployeeIndex(emp.id) + 1}`
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="activeEmployeeTab === emp.id">
                      <q-icon name="check" color="green-7" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-tabs>

          <!-- Add Employee button -->
          <q-btn
            flat
            round
            dense
            icon="add"
            color="green-7"
            class="q-ml-auto"
            @click="addEmployeeTab"
            :disable="allEmployeesSelected"
            aria-label="Add Employee"
          >
            <q-tooltip v-if="allEmployeesSelected">All employees already selected</q-tooltip>
          </q-btn>
        </div>

        <q-card-section class="q-pa-sm">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle2">Employee Information</div>

            <!-- Remove Employee Button -->
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="removeEmployeeTab(activeEmployeeTab)"
              :disable="employeeTabs.length <= 1"
              aria-label="Remove Employee"
            >
              <q-tooltip>Remove this employee</q-tooltip>
            </q-btn>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-select
                v-model="currentEmployee.employeeId"
                :options="availableEmployeesForTab"
                label="Employee"
                outlined
                dense
                use-input
                input-debounce="300"
                @filter="filterEmployees"
                option-value="id"
                option-label="label"
                emit-value
                map-options
                clearable
                @update:model-value="onEmployeeSelected"
              >
                <template v-slot:prepend>
                  <q-icon name="person" size="xs" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" dense>
                    <q-item-section avatar>
                      <q-avatar color="primary" text-color="white" size="sm">
                        {{ (scope.opt.label || 'U').charAt(0).toUpperCase() }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label || 'Unnamed Employee' }}</q-item-label>
                      <q-item-label caption lines="1">{{
                        scope.opt.position || 'No position'
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No available employees</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-6" v-if="currentEmployee.employeeId">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-input v-model="selectedEmployee.rank" label="Function" outlined dense readonly>
                    <template v-slot:prepend>
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
                    <template v-slot:prepend>
                      <q-icon name="work" size="xs" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Display SG and Level -->
          <!-- <div v-if="currentEmployee.employeeId" class="q-mt-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="selectedEmployee.sg"
                  label="Salary Grade (SG)"
                  outlined
                  dense
                  readonly
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_money" size="xs" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="selectedEmployee.level" label="Level" outlined dense readonly>
                  <template v-slot:prepend>
                    <q-icon name="trending_up" size="xs" />
                  </template>
                </q-input>
              </div>
            </div>
          </div> -->

          <!-- Performance Standards Section -->
          <div v-if="currentEmployee.employeeId" class="q-mt-md">
            <q-separator class="q-mb-md" />

            <!-- Performance Standards Collection -->
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
                        <!-- Horizontal layout for MFO Details and Competencies -->
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
                                  <!-- Category Select -->
                                  <q-select
                                    outlined
                                    dense
                                    v-model="standard.rows.category"
                                    label="Select Category"
                                    :options="categoryOptions"
                                    option-value="value"
                                    option-label="label"
                                    emit-value
                                    map-options
                                    @update:model-value="clearDependentFields(index, 1)"
                                  >
                                    <template v-slot:prepend>
                                      <q-icon name="category" size="xs" />
                                    </template>
                                  </q-select>

                                  <!-- MFO Select with search -->
                                  <q-select
                                    v-if="!isSupportCategory(standard.rows.category)"
                                    outlined
                                    dense
                                    v-model="standard.rows.mfo"
                                    label="Select MFO"
                                    :options="getFilteredMfoOptions(index)"
                                    option-value="value"
                                    option-label="label"
                                    emit-value
                                    map-options
                                    use-input
                                    input-debounce="300"
                                    @filter="(val, update) => filterMfos(val, update, index)"
                                    clearable
                                    @update:model-value="clearDependentFields(index, 2)"
                                  >
                                    <template v-slot:prepend>
                                      <q-icon name="list_alt" size="xs" />
                                    </template>
                                    <template v-slot:option="scope">
                                      <q-item v-bind="scope.itemProps" dense>
                                        <q-item-section>
                                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                                          <q-item-label caption v-if="scope.opt.code">
                                            Code: {{ scope.opt.code }}
                                          </q-item-label>
                                        </q-item-section>
                                      </q-item>
                                    </template>
                                    <template v-slot:no-option>
                                      <q-item>
                                        <q-item-section class="text-grey">
                                          No MFOs found matching your search
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
                                    option-value="value"
                                    option-label="label"
                                    emit-value
                                    map-options
                                    use-input
                                    input-debounce="300"
                                    @filter="(val, update) => filterOutputs(val, update, index)"
                                    clearable
                                  >
                                    <template v-slot:prepend>
                                      <q-icon name="output" size="xs" />
                                    </template>
                                    <template v-slot:option="scope">
                                      <q-item v-bind="scope.itemProps" dense>
                                        <q-item-section>
                                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                                          <q-item-label caption v-if="scope.opt.code">
                                            Code: {{ scope.opt.code }}
                                          </q-item-label>
                                          <q-item-label
                                            caption
                                            v-if="scope.opt.description"
                                            lines="2"
                                          >
                                            {{ scope.opt.description }}
                                          </q-item-label>
                                        </q-item-section>
                                      </q-item>
                                    </template>
                                    <template v-slot:no-option>
                                      <q-item>
                                        <q-item-section class="text-grey">
                                          No outputs found matching your search
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
                                <!-- <div
                                  class="text-caption text-grey-7"
                                  v-if="currentEmployee.sg && currentEmployee.level"
                                >
                                  Based on SG {{ currentEmployee.sg }} (Level
                                  {{ getLevelText(currentEmployee.level) }})
                                </div> -->
                              </q-card-section>

                              <q-separator />

                              <q-card-section class="q-pa-sm">
                                <div class="row q-col-gutter-sm">
                                  <!-- Core Competencies -->
                                  <div class="col-md-4">
                                    <q-card flat bordered class="full-height">
                                      <q-card-section class="q-pa-sm">
                                        <div class="text-caption text-weight-medium">Core</div>
                                      </q-card-section>
                                      <q-separator />
                                      <q-card-section class="q-pa-sm">
                                        <div class="competency-list">
                                          <div
                                            v-if="!hasValidCompetencyData"
                                            class="text-grey-6 text-center"
                                          >
                                            No SG and Level
                                          </div>
                                          <div
                                            v-else-if="coreCompetencies.length === 0"
                                            class="text-grey-6 text-center"
                                          >
                                            No core competencies
                                          </div>
                                          <div
                                            v-else
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

                                  <!-- Technical Competencies -->
                                  <div class="col-md-4">
                                    <q-card flat bordered class="full-height">
                                      <q-card-section class="q-pa-sm">
                                        <div class="text-caption text-weight-medium">Technical</div>
                                      </q-card-section>
                                      <q-separator />
                                      <q-card-section class="q-pa-sm">
                                        <div class="competency-list">
                                          <div
                                            v-if="!hasValidCompetencyData"
                                            class="text-grey-6 text-center"
                                          >
                                            No SG and Level
                                          </div>
                                          <div
                                            v-else-if="technicalCompetencies.length === 0"
                                            class="text-grey-6 text-center"
                                          >
                                            No technical competencies
                                          </div>
                                          <div
                                            v-else
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

                                  <!-- Leadership Competencies -->
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
                                            v-if="!hasValidCompetencyData"
                                            class="text-grey-6 text-center"
                                          >
                                            No SG and Level
                                          </div>
                                          <div
                                            v-else-if="leadershipCompetencies.length === 0"
                                            class="text-grey-6 text-center"
                                          >
                                            No leadership competencies
                                          </div>
                                          <div
                                            v-else
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
                              <!-- Output & Indicator Names -->
                              <div class="col-md-5">
                                <div class="column q-gutter-mt-sm">
                                  <q-input
                                    outlined
                                    v-model="standard.outputName"
                                    label="Output Name"
                                    dense
                                    class="full-width"
                                    @update:model-value="generateSuccessIndicator(index)"
                                  >
                                  </q-input>

                                  <!-- Performance Indicator - Searchable Dropdown -->
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
                                    <template v-slot:prepend>
                                      <q-icon name="flag" size="xs" />
                                    </template>
                                    <template v-slot:option="scope">
                                      <q-item v-bind="scope.itemProps" dense>
                                        <q-item-section>
                                          <q-item-label>{{ scope.opt.name }}</q-item-label>
                                          <q-item-label caption v-if="scope.opt.description">
                                            {{ scope.opt.description }}
                                          </q-item-label>
                                        </q-item-section>
                                      </q-item>
                                    </template>
                                    <template v-slot:no-option>
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
                                    <!-- Quantity Options Section -->
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

                                    <!-- Timeliness Options -->
                                    <q-separator spaced />
                                    <q-item-label header>Timeliness Options</q-item-label>
                                    <q-separator />

                                    <!-- Before Deadline Option -->
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

                                    <!-- Before Deadline Sub-options -->
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

                                    <!-- On Deadline Option -->
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

                                    <!-- On Deadline Sub-options -->
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
                              <!-- Header cells -->
                              <template v-slot:header-cell="props">
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

                              <!-- Body cells with inputs -->
                              <template v-slot:body-cell-quantity="props">
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

                              <template v-slot:body-cell-timeliness="props">
                                <q-td
                                  :props="props"
                                  class="input-cell"
                                  :style="`width: ${props.col.width}`"
                                >
                                  <div class="row q-col-gutter-sm">
                                    <!-- Range Input Type -->
                                    <div
                                      v-if="standard.activeTimelinessInputs.range"
                                      :class="{
                                        col:
                                          !standard.activeTimelinessInputs.date &&
                                          !standard.activeTimelinessInputs.description,
                                        'col-4':
                                          standard.activeTimelinessInputs.date &&
                                          standard.activeTimelinessInputs.description,
                                        'col-6':
                                          (standard.activeTimelinessInputs.date &&
                                            !standard.activeTimelinessInputs.description) ||
                                          (!standard.activeTimelinessInputs.date &&
                                            standard.activeTimelinessInputs.description),
                                      }"
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

                                    <!-- Date Input Type -->
                                    <div
                                      v-if="standard.activeTimelinessInputs.date"
                                      :class="{
                                        col:
                                          !standard.activeTimelinessInputs.range &&
                                          !standard.activeTimelinessInputs.description,
                                        'col-4':
                                          standard.activeTimelinessInputs.range &&
                                          standard.activeTimelinessInputs.description,
                                        'col-6':
                                          (standard.activeTimelinessInputs.range &&
                                            !standard.activeTimelinessInputs.description) ||
                                          (!standard.activeTimelinessInputs.range &&
                                            standard.activeTimelinessInputs.description),
                                      }"
                                    >
                                      <q-input
                                        v-model="props.row.timelinessDate"
                                        dense
                                        outlined
                                        placeholder="Date"
                                        mask="date"
                                        :rules="['date']"
                                        @update:model-value="
                                          onTimelinessDateUpdate(props.row, index)
                                        "
                                      >
                                        <template v-slot:append>
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

                                    <!-- Description Input Type -->
                                    <div
                                      v-if="standard.activeTimelinessInputs.description"
                                      :class="{
                                        col:
                                          !standard.activeTimelinessInputs.range &&
                                          !standard.activeTimelinessInputs.date,
                                        'col-4':
                                          standard.activeTimelinessInputs.range &&
                                          standard.activeTimelinessInputs.date,
                                        'col-6':
                                          (standard.activeTimelinessInputs.range &&
                                            !standard.activeTimelinessInputs.date) ||
                                          (!standard.activeTimelinessInputs.range &&
                                            standard.activeTimelinessInputs.date),
                                      }"
                                    >
                                      <q-input
                                        v-model="props.row.timelinessText"
                                        dense
                                        outlined
                                        placeholder="Description"
                                        @update:model-value="generateSuccessIndicator(index)"
                                      />
                                    </div>

                                    <!-- No inputs selected -->
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

                              <template v-slot:body-cell-effectiveness="props">
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

                            <!-- Error message for effectiveness validation -->
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

              <!-- Add Performance Standard Button -->
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
          <q-btn label="Calculate" color="green" unelevated @click="() => computeQuantities('B')" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="row justify-end q-mt-lg q-gutter-sm">
      <q-btn label="Cancel" color="grey" flat dense @click="onBack" />
      <q-btn
        label="Submit"
        color="green-7"
        icon="save"
        @click="onSubmit"
        :disable="!isFormValid || uwpStore.loading"
        :loading="uwpStore.loading"
      />
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { useMfoStore } from 'src/stores/office/officeLibrary'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useUnitWorkPlanStore } from 'src/stores/office/unitWorkPlanStore'
import { useCompetencyStore } from 'src/stores/competencyStore'

export default {
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const officeLibraryStore = useMfoStore()
    const officeLibraryIndicatorStore = useLibraryStore()
    const uwpStore = useUnitWorkPlanStore()
    const competencyStore = useCompetencyStore()

    // Refs
    const filteredMfoOptions = ref({})
    const filteredOutputOptions = ref({})
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
      availableEmployees: [],
      filteredAvailableEmployees: [],
      employeesWithoutTargetPeriod: [],
      totalAvailableEmployees: 0,
      filteredAvailableEmployeesCount: 0,
      employeesWithoutTargetPeriodCount: 0,
      selectedEmployees: [],
      timestamp: null,
    })

    const formInteracted = ref(false)
    const shouldValidate = ref(false)
    const maxVisibleTabs = ref(3)
    const activeEmployeeTab = ref(null)
    const employeeTabs = ref([])
    const isLoadingFilteredEmployees = ref(false)
    const form = ref({
      unit: null,
      section: null,
      division: null,
      semester: null,
      year: new Date().getFullYear(),
    })
    const filteredVerbs = ref([])
    const filteredEmployees = ref([])
    const skipMfo = ref(false)
    const currentStandardIndex = ref(0)
    const showQuantityModal = ref(false)
    const quantityValue = ref(null)

    // Competencies data
    const coreCompetencies = ref([])
    const technicalCompetencies = ref([])
    const leadershipCompetencies = ref([])

    // Organization data
    const units = ref([
      { id: 1, name: 'Finance Department' },
      { id: 2, name: 'Operations Department' },
      { id: 3, name: 'IT Department' },
    ])
    const sections = ref([
      { id: 1, name: 'Accounting', unitId: 1 },
      { id: 2, name: 'Budget', unitId: 1 },
      { id: 3, name: 'Production', unitId: 2 },
      { id: 4, name: 'Logistics', unitId: 2 },
      { id: 5, name: 'Development', unitId: 3 },
      { id: 6, name: 'Infrastructure', unitId: 3 },
    ])
    const divisions = ref([
      { id: 1, name: 'Accounts Payable', sectionId: 1 },
      { id: 2, name: 'Accounts Receivable', sectionId: 1 },
      { id: 3, name: 'Financial Planning', sectionId: 2 },
      { id: 4, name: 'Manufacturing', sectionId: 3 },
      { id: 5, name: 'Quality Control', sectionId: 3 },
      { id: 6, name: 'Frontend', sectionId: 5 },
      { id: 7, name: 'Backend', sectionId: 5 },
    ])

    // Columns
    const standardOutcomeColumns = [
      {
        name: 'rating',
        label: 'Rating',
        field: 'rating',
        align: 'center',
        width: '80px',
      },
      {
        name: 'quantity',
        label: 'Quantity',
        field: 'quantity',
        align: 'center',
        width: '200px',
      },
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

    const quantityIndicator = [
      { label: 'Quantity (A.  Custom Target)', value: 'numeric' },
      { label: 'Quantity (B. Can exceed 100%)', value: 'B' },
      { label: 'Quantity (C. Cannot exceed 100%)', value: 'C' },
    ]

    // Helper functions
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
      performanceStandards: [createDefaultPerformanceStandard()],
    })

    // Helper to get employee name
    const getEmployeeName = (employee) => {
      if (!employee) return 'Unnamed Employee'
      return employee.label || employee.name || employee.employeeData?.name || 'Unnamed Employee'
    }

    // Helper to get employee position
    const getEmployeePosition = (employee) => {
      if (!employee) return 'No position'
      return employee.position || employee.rank || employee.employeeData?.position || 'No position'
    }

    // Helper to get employee initial
    const getEmployeeInitial = (employee) => {
      const name = getEmployeeName(employee)
      return name.charAt(0).toUpperCase()
    }

    // Convert competency values to numbers
    const numberCom = (value) => {
      if (!value || value === '-') return '-'
      const mapping = {
        Basic: '1',
        Intermediate: '2',
        Advanced: '3',
        Superior: '4',
      }
      return mapping[value] || value
    }

    const initializeUWPData = () => {
      try {
        const stored = sessionStorage.getItem('uwpData')
        if (stored) {
          const parsed = JSON.parse(stored)
          uwpData.value = parsed
        }
      } catch (error) {
        console.error('❌ Failed to parse UWP data:', error)
      }
    }

    const initializeEmployeeTabs = () => {
      const defaultEmp = createDefaultEmployeeData()
      employeeTabs.value = [defaultEmp]
      activeEmployeeTab.value = defaultEmp.id
    }

    // Helper to get level text
    const getLevelText = (level) => {
      if (!level) return ''
      const levelStr = level.toString()
      if (levelStr === '1') return '1st Level'
      if (levelStr === '2') return '2nd Level'
      return `Level ${levelStr}`
    }

    // Helper to get the SG range from the competency store
    const getSGRange = (sg, level) => {
      if (!sg || !level) return ''
      const levelText = getLevelText(level)
      if (!levelText) return sg.toString()
      const salaryGrades = competencyStore.getSalaryGrades(levelText)
      if (!salaryGrades) return sg.toString()
      for (const range of salaryGrades) {
        if (range.includes('-')) {
          const [min, max] = range.split('-').map(Number)
          if (parseInt(sg) >= min && parseInt(sg) <= max) return range
        } else {
          if (parseInt(sg) === parseInt(range)) return range
        }
      }
      return sg.toString()
    }

    // Add this computed property
    const hasValidCompetencyData = computed(() => {
      const employee = currentEmployee.value
      return !!(employee?.sg && employee?.level)
    })

    const updateEmployeeCompetencies = (employee) => {
      console.log('Updating competencies for employee:', employee)

      // Reset competencies initially
      coreCompetencies.value = []
      technicalCompetencies.value = []
      leadershipCompetencies.value = []

      // Check if we have valid SG and Level
      if (!employee || !employee.sg || !employee.level) {
        console.log('No valid SG or Level yet for employee:', {
          sg: employee?.sg,
          level: employee?.level,
          employeeId: employee?.employeeId,
        })
        return // Just return, no warning needed
      }

      const levelText = getLevelText(employee.level)
      console.log('Level Text:', levelText)

      if (!levelText) {
        console.log('Could not determine level text from:', employee.level)
        return
      }

      const sgRange = getSGRange(employee.sg, employee.level)
      console.log('SG Range:', sgRange)

      if (!sgRange) {
        console.log('Could not determine SG range from:', employee.sg)
        return
      }

      // Ensure competency store is initialized
      if (!competencyStore.isInitialized) {
        console.log('Competency store not initialized')
        return
      }

      const competencyRow = competencyStore.getRow(levelText, sgRange)
      console.log('Competency Row:', competencyRow)

      if (!competencyRow) {
        console.log('No competency row found for:', { levelText, sgRange })
        return
      }

      // Get core competencies
      coreCompetencies.value = [
        {
          code: 'DSE',
          value: competencyRow.DSE || '-',
          description: competencyStore.descriptions?.core?.DSE || '',
        },
        {
          code: 'EI',
          value: competencyRow.EI || '-',
          description: competencyStore.descriptions?.core?.EI || '',
        },
        {
          code: 'IS',
          value: competencyRow.IS || '-',
          description: competencyStore.descriptions?.core?.IS || '',
        },
      ].filter((comp) => comp.value && comp.value !== '-')

      // Get technical competencies
      technicalCompetencies.value = [
        {
          code: 'P&O',
          value: competencyRow['P&O'] || '-',
          description: competencyStore.descriptions?.technical?.['P&O'] || '',
        },
        {
          code: 'M&E',
          value: competencyRow['M&E'] || '-',
          description: competencyStore.descriptions?.technical?.['M&E'] || '',
        },
        {
          code: 'RM',
          value: competencyRow.RM || '-',
          description: competencyStore.descriptions?.technical?.RM || '',
        },
        {
          code: 'P&N',
          value: competencyRow['P&N'] || '-',
          description: competencyStore.descriptions?.technical?.['P&N'] || '',
        },
        {
          code: 'PM',
          value: competencyRow.PM || '-',
          description: competencyStore.descriptions?.technical?.PM || '',
        },
        {
          code: 'AD',
          value: competencyRow.AD || '-',
          description: competencyStore.descriptions?.technical?.AD || '',
        },
      ].filter((comp) => comp.value && comp.value !== '-')

      // Get leadership competencies
      leadershipCompetencies.value = [
        {
          code: 'TSC',
          value: competencyRow.TSC || '-',
          description: competencyStore.descriptions?.leadership?.TSC || '',
        },
        {
          code: 'PSDM',
          value: competencyRow.PSDM || '-',
          description: competencyStore.descriptions?.leadership?.PSDM || '',
        },
        {
          code: 'BCIWR',
          value: competencyRow.BCIWR || '-',
          description: competencyStore.descriptions?.leadership?.BCIWR || '',
        },
        {
          code: 'MPCR',
          value: competencyRow.MPCR || '-',
          description: competencyStore.descriptions?.leadership?.MPCR || '',
        },
      ].filter((comp) => comp.value && comp.value !== '-')

      console.log('Loaded competencies:', {
        core: coreCompetencies.value,
        technical: technicalCompetencies.value,
        leadership: leadershipCompetencies.value,
      })
    }

    // const getVerbLabel = (idOrText) => {
    //   if (typeof idOrText === 'string' && isNaN(Number(idOrText))) return idOrText || ''
    //   const verbId = typeof idOrText === 'string' ? Number(idOrText) : idOrText
    //   const foundVerb = officeLibraryIndicatorStore.verbs.find((v) => v.id === verbId)
    //   return foundVerb?.indicator_name || foundVerb?.name || ''
    // }

    // Computed
    const semesterOptions = computed(() => uwpStore.getSemesterOptions)
    const yearOptions = computed(() => uwpStore.getYearOptions)

    const breadcrumbDisplay = computed(() => {
      return !uwpData.value.breadcrumb || uwpData.value.breadcrumb.length === 0
        ? 'Organization Structure'
        : uwpData.value.breadcrumb.join(' / ')
    })

    const selectedNodeLabel = computed(() => uwpData.value.selectedNodeLabel || 'Work Plan')

    const currentEmployee = computed(() => {
      const activeEmployee = employeeTabs.value.find((emp) => emp.id === activeEmployeeTab.value)
      return activeEmployee || employeeTabs.value[0] || createDefaultEmployeeData()
    })

    const hierarchyLabels = computed(() => ({
      office: uwpData.value.hierarchy.office?.label || '',
      office2: uwpData.value.hierarchy.office2?.label || '',
      group: uwpData.value.hierarchy.group?.label || '',
      division: uwpData.value.hierarchy.division?.label || '',
      section: uwpData.value.hierarchy.section?.label || '',
      unit: uwpData.value.hierarchy.unit?.label || '',
    }))

    const visibleEmployeeTabs = computed(() => employeeTabs.value.slice(0, maxVisibleTabs.value))
    const overflowEmployeeTabs = computed(() => employeeTabs.value.slice(maxVisibleTabs.value))
    const hasOverflowTabs = computed(() => employeeTabs.value.length > maxVisibleTabs.value)

    const getEmployeeIndex = (id) => employeeTabs.value.findIndex((emp) => emp.id === id)

    const getSelectedEmployeeIds = () =>
      employeeTabs.value.filter((emp) => emp.employeeId !== null).map((emp) => emp.employeeId)

    const allEmployeesSelected = computed(() => {
      if (
        !uwpData.value.employeesWithoutTargetPeriod ||
        uwpData.value.employeesWithoutTargetPeriod.length === 0
      )
        return false
      const selectedIds = getSelectedEmployeeIds()
      const totalEmployees = uwpData.value.employeesWithoutTargetPeriod.length
      return totalEmployees > 0 && selectedIds.length >= totalEmployees
    })

    const availableEmployeesForTab = computed(() => {
      const allAvailableEmployees = [...(uwpData.value.employeesWithoutTargetPeriod || [])]
      const uniqueEmployees = []
      const seenIds = new Set()

      allAvailableEmployees.forEach((emp) => {
        if (emp.id && !seenIds.has(emp.id)) {
          seenIds.add(emp.id)
          uniqueEmployees.push(emp)
        }
      })

      if (uniqueEmployees.length === 0) return []

      const selectedIds = getSelectedEmployeeIds()
      const currentTabId = activeEmployeeTab.value
      const currentTabEmployeeId = employeeTabs.value.find(
        (emp) => emp.id === currentTabId,
      )?.employeeId

      const filtered = uniqueEmployees.filter((emp) => {
        if (!selectedIds.includes(emp.id)) return true
        if (emp.id === currentTabEmployeeId) return true
        return false
      })

      return filtered
    })

    const selectedEmployee = computed(() => {
      const currentTab = employeeTabs.value.find((emp) => emp.id === activeEmployeeTab.value)
      if (currentTab && currentTab.employeeId) {
        if (currentTab.rank) {
          return {
            rank: currentTab.rank,
            position: currentTab.position || '',
            sg: currentTab.sg || '',
            level: currentTab.level || '',
          }
        }
        const emp = uwpData.value.employeesWithoutTargetPeriod?.find(
          (e) => e.id === currentTab.employeeId,
        )
        if (emp) {
          return {
            rank: emp.rank || emp.employeeData?.rank || '',
            position: emp.position || emp.employeeData?.position || '',
            sg: emp.employeeData?.sg || '',
            level: emp.employeeData?.level || '',
          }
        }
      }
      return { rank: '', position: '', sg: '', level: '' }
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

    const filteredSections = computed(() => {
      if (!form.value.division) return []
      const division = divisions.value.find((d) => d.id === form.value.division)
      return sections.value.filter((section) => section.id === division?.sectionId)
    })

    const filteredUnits = computed(() => {
      if (!form.value.section) return []
      const section = sections.value.find((s) => s.id === form.value.section)
      return units.value.filter((unit) => unit.id === section?.unitId)
    })

    const hasMinimumEffectivenessValues = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return false
      const filledValues = standard.standardOutcomeRows.filter(
        (row) => row.effectiveness && row.effectiveness.trim().length > 0,
      ).length
      return filledValues >= 2
    }

    const getEffectivenessErrorCount = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      return !standard
        ? 5
        : standard.standardOutcomeRows.filter(
            (row) => !row.effectiveness || row.effectiveness.trim().length === 0,
          ).length
    }

    const isFormValid = computed(() => {
      if (employeeTabs.value.length === 0) return false
      const hasTargetPeriod =
        uwpData.value.targetPeriod?.semester && uwpData.value.targetPeriod?.year
      if (!hasTargetPeriod) return false

      const allEmployeesValid = employeeTabs.value.every((emp) => {
        if (!emp.employeeId) return false
        const allStandardsValid = emp.performanceStandards.every((standard) => {
          if (!standard.standardOutcomeRows) return false
          const filledValues = standard.standardOutcomeRows.filter(
            (row) => row.effectiveness && row.effectiveness.trim().length > 0,
          ).length
          return filledValues >= 2
        })
        return allStandardsValid
      })

      return hasTargetPeriod && allEmployeesValid
    })

    const hasMfosForCategory = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard || !standard.rows.category) return false
      const categoryId = standard.rows.category
      const mfosInCategory = officeLibraryStore.mfos.filter(
        (mfo) => mfo.f_category_id === categoryId,
      )
      return mfosInCategory.length > 0
    }

    // Methods
    const onBack = () => router.back()

    const filterPerformanceIndicators = (val, update) => {
      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()
          filteredVerbs.value = officeLibraryIndicatorStore.verbs
            .map((verb) => ({
              id: verb.id,
              label: verb.indicator_name || verb.name,
              value: verb.id,
              name: verb.indicator_name || verb.name,
              description: verb.description || '',
            }))
            .filter(
              (verb) =>
                verb.label.toLowerCase().includes(needle) ||
                (verb.description && verb.description.toLowerCase().includes(needle)),
            )
        })
      } else {
        filteredVerbs.value = officeLibraryIndicatorStore.verbs.map((verb) => ({
          id: verb.id,
          label: verb.indicator_name || verb.name,
          value: verb.id,
          name: verb.indicator_name || verb.name,
          description: verb.description || '',
        }))
      }
    }

    // Helper to detect Support Function (Category C)
    const isSupportCategory = (category) => {
      if (!category) return false
      const nameFromObject = category.name || category.label
      if (nameFromObject) {
        return (
          nameFromObject.toLowerCase().includes('support') ||
          nameFromObject.trim().toUpperCase().startsWith('C')
        )
      }
      const cat = officeLibraryStore.categories.find((c) => c.id === category)
      if (!cat) return false
      return (
        cat.name?.toLowerCase().includes('support') ||
        cat.label?.toLowerCase().includes('support') ||
        cat.name?.trim().toUpperCase().startsWith('C') ||
        cat.label?.trim().toUpperCase().startsWith('C')
      )
    }

    const getFilteredMfoOptions = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard || !standard.rows.category) return []

      const categoryId = standard.rows.category
      const categoryMfos = officeLibraryStore.mfos.filter((mfo) => mfo.f_category_id === categoryId)

      if (filteredMfoOptions.value[index]) {
        return filteredMfoOptions.value[index]
      }

      const allMfos = categoryMfos.map((mfo) => ({
        id: mfo.id,
        label: mfo.name,
        value: mfo.id,
        name: mfo.name,
        code: mfo.code || '',
        description: mfo.description || '',
      }))

      return allMfos
    }

    const getFilteredOutputOptions = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard || !standard.rows.category) return []

      const categoryId = standard.rows.category

      // For Support category, show category_outputs instead of MFO-based outputs
      if (isSupportCategory(categoryId)) {
        const filteredOutputs = officeLibraryStore.category_outputs.filter(
          (output) => output.f_category_id === categoryId,
        )
        return filteredOutputs.map((output) => ({
          id: output.id,
          label: output.name,
          value: output.id,
          name: output.name,
          code: output.code || '',
          description: output.description || '',
        }))
      }

      // For other categories (A, B), show MFO-based outputs
      const mfoId = standard.rows.mfo
      if (!officeLibraryStore.outputs || officeLibraryStore.outputs.length === 0) return []

      const filteredOutputs = officeLibraryStore.outputs.filter((output) => {
        if (output.f_category_id !== standard.rows.category) return false
        if (mfoId) return output.mfo_id === mfoId
        return output.mfo_id === null
      })

      return filteredOutputs.map((output) => ({
        id: output.id,
        label: output.name,
        value: output.id,
        name: output.name,
        code: output.code || '',
        description: output.description || '',
      }))
    }

    const clearDependentFields = (standardIndex, fieldIndex) => {
      const standard = currentEmployee.value.performanceStandards[standardIndex]
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
      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()
          const standard = currentEmployee.value.performanceStandards[index]

          if (!standard || !standard.rows.category) {
            filteredMfoOptions.value[index] = []
            return
          }

          const categoryId = standard.rows.category
          const allMfos = officeLibraryStore.mfos
            .filter((mfo) => mfo.f_category_id === categoryId)
            .map((mfo) => ({
              id: mfo.id,
              label: mfo.name,
              value: mfo.id,
              name: mfo.name,
              code: mfo.code || '',
              description: mfo.description || '',
            }))

          filteredMfoOptions.value[index] = allMfos.filter(
            (mfo) =>
              mfo.label.toLowerCase().includes(needle) ||
              (mfo.code && mfo.code.toLowerCase().includes(needle)) ||
              (mfo.description && mfo.description.toLowerCase().includes(needle)),
          )
        })
      }
    }

    const filterOutputs = (val, update, index) => {
      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()
          const standard = currentEmployee.value.performanceStandards[index]

          if (!standard || !standard.rows.category) {
            filteredOutputOptions.value[index] = []
            return
          }

          const categoryId = standard.rows.category

          // For Support category, filter from category_outputs
          if (isSupportCategory(categoryId)) {
            const allOutputs = officeLibraryStore.category_outputs.filter(
              (output) => output.f_category_id === categoryId,
            )
            const outputOptions = allOutputs.map((output) => ({
              id: output.id,
              label: output.name,
              value: output.id,
              name: output.name,
              code: output.code || '',
              description: output.description || '',
            }))
            filteredOutputOptions.value[index] = outputOptions.filter(
              (output) =>
                output.label.toLowerCase().includes(needle) ||
                (output.code && output.code.toLowerCase().includes(needle)) ||
                (output.description && output.description.toLowerCase().includes(needle)),
            )
          } else {
            // For other categories (A, B), filter from MFO-based outputs
            const mfoId = standard.rows.mfo
            const allOutputs = officeLibraryStore.outputs.filter((output) => {
              if (output.f_category_id !== categoryId) return false
              if (mfoId && output.mfo_id !== mfoId) return false
              if (!mfoId && output.mfo_id !== null) return false
              return true
            })
            const outputOptions = allOutputs.map((output) => ({
              id: output.id,
              label: output.name,
              value: output.id,
              name: output.name,
              code: output.code || '',
              description: output.description || '',
            }))
            filteredOutputOptions.value[index] = outputOptions.filter(
              (output) =>
                output.label.toLowerCase().includes(needle) ||
                (output.code && output.code.toLowerCase().includes(needle)) ||
                (output.description && output.description.toLowerCase().includes(needle)),
            )
          }
        })
      }
    }

    const addEmployeeTab = () => {
      if (allEmployeesSelected.value) {
        $q.notify({
          message: 'All available employees have been added',
          color: 'warning',
          position: 'top',
        })
        return
      }
      const newEmployee = createDefaultEmployeeData()
      employeeTabs.value.push(newEmployee)
      activeEmployeeTab.value = newEmployee.id
      $q.notify({
        message: 'Added new employee tab',
        color: 'positive',
        position: 'top',
      })
    }

    const removeEmployeeTab = (tabId) => {
      if (employeeTabs.value.length <= 1) {
        $q.notify({
          message: 'Cannot remove the only employee tab',
          color: 'negative',
          position: 'top',
        })
        return
      }
      $q.dialog({
        title: 'Confirm Removal',
        message: 'Remove this employee from the plan?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        const index = employeeTabs.value.findIndex((emp) => emp.id === tabId)
        if (index !== -1) {
          employeeTabs.value.splice(index, 1)
          if (tabId === activeEmployeeTab.value) {
            activeEmployeeTab.value = employeeTabs.value[0]?.id
          }
          $q.notify({
            message: 'Employee removed',
            color: 'positive',
            position: 'top',
          })
        }
      })
    }

    const switchToEmployee = (tabId) => {
      activeEmployeeTab.value = tabId
      const employee = employeeTabs.value.find((emp) => emp.id === tabId)
      updateEmployeeCompetencies(employee)
    }

    const onEmployeeSelected = async (employeeId) => {
      if (employeeId === null || employeeId === undefined) {
        const tabIndex = employeeTabs.value.findIndex((emp) => emp.id === activeEmployeeTab.value)
        if (tabIndex !== -1) {
          employeeTabs.value[tabIndex].name = ''
          employeeTabs.value[tabIndex].employeeId = null
          employeeTabs.value[tabIndex].employeeData = null
          employeeTabs.value[tabIndex].rank = ''
          employeeTabs.value[tabIndex].position = ''
          employeeTabs.value[tabIndex].sg = null
          employeeTabs.value[tabIndex].level = null

          // Clear competencies
          coreCompetencies.value = []
          technicalCompetencies.value = []
          leadershipCompetencies.value = []
        }
        return
      }

      const selectedEmp = uwpData.value.employeesWithoutTargetPeriod?.find(
        (emp) => emp.id === employeeId,
      )

      if (selectedEmp && activeEmployeeTab.value) {
        const tabIndex = employeeTabs.value.findIndex((emp) => emp.id === activeEmployeeTab.value)
        if (tabIndex !== -1) {
          employeeTabs.value[tabIndex].name = selectedEmp.label || selectedEmp.name || ''
          employeeTabs.value[tabIndex].employeeId = selectedEmp.id
          employeeTabs.value[tabIndex].employeeData = selectedEmp
          employeeTabs.value[tabIndex].rank = selectedEmp.rank || ''
          employeeTabs.value[tabIndex].position = selectedEmp.position || ''

          // Try to get SG and Level from different possible locations
          employeeTabs.value[tabIndex].sg =
            selectedEmp.sg ||
            selectedEmp.employeeData?.sg ||
            selectedEmp.employeeData?.employeeData?.sg ||
            null

          employeeTabs.value[tabIndex].level =
            selectedEmp.level ||
            selectedEmp.employeeData?.level ||
            selectedEmp.employeeData?.employeeData?.level ||
            null

          console.log('Employee SG:', employeeTabs.value[tabIndex].sg)
          console.log('Employee Level:', employeeTabs.value[tabIndex].level)

          // Update competencies based on the new employee data
          updateEmployeeCompetencies(employeeTabs.value[tabIndex])
        }
      }
    }

    const filterEmployees = (val, update) => {
      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()
          filteredEmployees.value = availableEmployeesForTab.value.filter((emp) => {
            const name = (emp.label || emp.name || '').toLowerCase()
            const position = (emp.position || emp.rank || '').toLowerCase()
            return name.includes(needle) || position.includes(needle)
          })
        })
      } else {
        filteredEmployees.value = availableEmployeesForTab.value
      }
    }

    const getQuantityComponent = (index) => {
      const standard = currentEmployee.value?.performanceStandards?.[index]
      if (!standard) return ''

      if (standard.quantityIndicatorType === 'numeric') {
        // Type A: Get value from rating row 5
        const row5 = standard.standardOutcomeRows.find((row) => row.rating === '5')
        return row5?.quantity || ''
      }

      if (standard.quantityIndicatorType === 'B') {
        // Type B: Get the target output value from the standard
        return standard.targetOutputValue?.toString() || ''
      }

      if (standard.quantityIndicatorType === 'C') {
        // Type C: Fixed at 100%
        return '100%'
      }

      return ''
    }

    const getTimelinessComponent = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return ''

      const highestRating = standard.standardOutcomeRows[0]
      const midRating = standard.standardOutcomeRows[2]
      let result = []

      if (standard.timelinessIndicatorType === 'beforeDeadline') {
        if (standard.activeTimelinessInputs.range && midRating.timelinessRange)
          result.push(midRating.timelinessRange)
        if (standard.activeTimelinessInputs.date && midRating.timelinessDate)
          result.push(`by ${midRating.timelinessDate}`)
        if (standard.activeTimelinessInputs.description && midRating.timelinessText)
          result.push(midRating.timelinessText)
      } else if (standard.timelinessIndicatorType === 'onDeadline') {
        if (standard.activeTimelinessInputs.range && highestRating.timelinessRange)
          result.push(highestRating.timelinessRange)
        if (standard.activeTimelinessInputs.date && highestRating.timelinessDate)
          result.push(`by ${highestRating.timelinessDate}`)
        if (standard.activeTimelinessInputs.description && highestRating.timelinessText)
          result.push(highestRating.timelinessText)
      }

      return result.join(' ')
    }

    const getEffectivenessComponent = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return ''
      const rating5Row = standard.standardOutcomeRows.find((row) => row.rating === '5')
      return rating5Row?.effectiveness || ''
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

        // Build success indicator parts
        const parts = []

        // Add quantity part if it exists
        if (quantityPart && quantityPart.trim()) {
          parts.push(quantityPart)
        }

        // Add output name
        if (outputNamePart) {
          parts.push(outputNamePart)
        }

        // Add indicator name
        if (indicatorNamePart) {
          parts.push(indicatorNamePart)
        }

        // Add effectiveness
        if (effectivenessPart && effectivenessPart.trim()) {
          parts.push(effectivenessPart)
        }

        // Add timeliness
        if (timelinessPart && timelinessPart.trim()) {
          parts.push(timelinessPart)
        }

        standard.successIndicator = parts.join(' ')

        // Debug logging
        console.log(`Success Indicator for standard ${i + 1}:`, {
          quantityType: standard.quantityIndicatorType,
          quantityValue: quantityPart,
          outputName: outputNamePart,
          indicatorName: indicatorNamePart,
          effectiveness: effectivenessPart,
          timeliness: timelinessPart,
          final: standard.successIndicator,
        })
      })
    }

    const sanitizeNumericInput = (row, field) => {
      if (!row[field]) return
      row[field] = row[field].replace(/[^0-9-]/g, '')
      const hyphens = row[field].split('-').length - 1
      if (hyphens > 1) {
        row[field] = row[field].substring(0, row[field].lastIndexOf('-'))
      }
    }

    const validateStrictNumeric = (val) => {
      if (!val) return true
      const regex = /^[0-9]+(-[0-9]+)?$/
      return regex.test(val) || 'Enter a number or range (e.g., 10 or 10-20)'
    }

    const blockInvalidChars = (e) => {
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '-']
      const isNumber = /[0-9]/.test(e.key)
      if (!isNumber && !allowedKeys.includes(e.key)) {
        e.preventDefault()
      }
    }

    const onQuantityUpdate = (row, field, index) => {
      sanitizeNumericInput(row, field)
      generateSuccessIndicator(index)
    }

    const onTimelinessUpdate = (row, field, index) => {
      sanitizeNumericInput(row, field)

      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return

      const timelinessParts = []
      if (standard.activeTimelinessInputs.range && row.timelinessRange) {
        timelinessParts.push(row.timelinessRange)
      }
      if (standard.activeTimelinessInputs.date && row.timelinessDate) {
        timelinessParts.push(`by ${row.timelinessDate}`)
      }
      if (standard.activeTimelinessInputs.description && row.timelinessText) {
        timelinessParts.push(row.timelinessText)
      }
      row.timeliness = timelinessParts.join(' ')

      generateSuccessIndicator(index)
    }

    // Add this to your component methods
    const onTimelinessDateUpdate = (row, index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return

      const timelinessParts = []
      if (standard.activeTimelinessInputs.range && row.timelinessRange) {
        timelinessParts.push(row.timelinessRange)
      }
      if (standard.activeTimelinessInputs.date && row.timelinessDate) {
        timelinessParts.push(`by ${row.timelinessDate}`)
      }
      if (standard.activeTimelinessInputs.description && row.timelinessText) {
        timelinessParts.push(row.timelinessText)
      }
      row.timeliness = timelinessParts.join(' ')

      generateSuccessIndicator(index)
    }

    const onEffectivenessUpdate = (row, index) => {
      formInteracted.value = true
      generateSuccessIndicator(index)
    }

    const onEffectivenessFieldFocus = () => {
      formInteracted.value = true
    }

    const onDivisionChange = () => {
      form.value.section = null
      form.value.unit = null
    }

    const onSectionChange = () => {
      form.value.unit = null
    }

    const onTimelinessTypeSelect = (value, index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return
      standard.timelinessIndicatorType = value
      Object.assign(standard.timelinessInputs, {
        range: true,
        date: false,
        description: false,
      })
      generateSuccessIndicator(index)
    }

    // In your component methods, update applyTimelinessInputs:
    const applyTimelinessInputs = (type, index) => {
      const standard = currentEmployee.value.performanceStandards[index]
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

      // Generate timeliness for ALL rows based on the selected type
      standard.standardOutcomeRows.forEach((row) => {
        // Clear existing timeliness data
        row.timelinessRange = ''
        row.timelinessDate = ''
        row.timelinessText = ''
        row.timeliness = '' // Clear the combined timeliness field too

        // Only set the data that's currently enabled
        if (!standard.activeTimelinessInputs.range) row.timelinessRange = ''
        if (!standard.activeTimelinessInputs.date) row.timelinessDate = ''
        if (!standard.activeTimelinessInputs.description) row.timelinessText = ''

        // Rebuild timeliness for this row
        const timelinessParts = []
        if (standard.activeTimelinessInputs.range && row.timelinessRange) {
          timelinessParts.push(row.timelinessRange)
        }
        if (standard.activeTimelinessInputs.date && row.timelinessDate) {
          timelinessParts.push(`by ${row.timelinessDate}`)
        }
        if (standard.activeTimelinessInputs.description && row.timelinessText) {
          timelinessParts.push(row.timelinessText)
        }
        row.timeliness = timelinessParts.join(' ')
      })

      $q.notify({
        message: `Applied ${
          type === 'beforeDeadline' ? 'Before Deadline' : 'On Deadline'
        } input types`,
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
        // Store the computed quantities for Type C
        standard.targetOutputValue = '100%'
        computeQuantities('C', index)
      } else {
        // Type A: Clear any stored target output value
        standard.targetOutputValue = null
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
        if (!quantityValue.value || isNaN(quantityValue.value)) {
          $q.notify({
            message: 'Please enter a valid number',
            color: 'negative',
            position: 'top',
          })
          return
        }

        const base = Number(quantityValue.value)

        // Store the target output value for Type B
        standard.targetOutputValue = base.toString()

        // Calculate values
        const above130 = Math.ceil(base * 1.3)
        const between115and130Min = Math.ceil(base * 1.15)
        const between115and130Max = Math.floor(base * 1.3) - 1
        const between100and115Min = base
        const between100and115Max = Math.floor(base * 1.15) - 1
        const between51and99Min = Math.ceil(base * 0.51)
        const between51and99Max = Math.floor(base * 0.99)
        const below51 = Math.floor(base * 0.5)

        // Assign values to rows - make sure we have valid ranges
        standard.standardOutcomeRows[0].quantity = `${above130} and above`
        standard.standardOutcomeRows[1].quantity =
          between115and130Max >= between115and130Min
            ? `${between115and130Min}-${between115and130Max}`
            : `${between115and130Min}`
        standard.standardOutcomeRows[2].quantity =
          between100and115Max >= base ? `${between100and115Min}-${between100and115Max}` : `${base}`
        standard.standardOutcomeRows[3].quantity =
          between51and99Max >= between51and99Min
            ? `${between51and99Min}-${between51and99Max}`
            : `${between51and99Min}`
        standard.standardOutcomeRows[4].quantity = `${below51} and below`

        // Update the success indicator
        generateSuccessIndicator(idx)

        $q.notify({
          message: 'Quantities calculated successfully',
          color: 'positive',
          position: 'top',
        })

        // Close modal and reset value
        showQuantityModal.value = false
        quantityValue.value = null
      } else if (currentType === 'C') {
        // Type C logic remains the same
        standard.targetOutputValue = '100%'
        standard.standardOutcomeRows[0].quantity = '100% and above'
        standard.standardOutcomeRows[1].quantity = '88%-99%'
        standard.standardOutcomeRows[2].quantity = '77%-87%'
        standard.standardOutcomeRows[3].quantity = '38%-76%'
        standard.standardOutcomeRows[4].quantity = '37% and below'

        generateSuccessIndicator(idx)
      }
    }

    const cancelQuantityInput = () => {
      const index = currentStandardIndex.value
      const standard = currentEmployee.value.performanceStandards[index]
      if (standard) {
        standard.quantityIndicatorType = 'numeric'
      }
      showQuantityModal.value = false
    }

    const addPerformanceStandard = () => {
      currentEmployee.value.performanceStandards.push(createDefaultPerformanceStandard())
      $q.notify({
        message: `Added new performance standard ${currentEmployee.value.performanceStandards.length}`,
        color: 'positive',
        position: 'top',
      })
    }

    const removePerformanceStandard = (index) => {
      if (currentEmployee.value.performanceStandards.length <= 1) {
        $q.notify({
          message: 'Cannot remove the only performance standard',
          color: 'negative',
          position: 'top',
        })
        return
      }
      $q.dialog({
        title: 'Confirm Deletion',
        message: `Are you sure you want to remove Performance Standard ${index + 1}? `,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        currentEmployee.value.performanceStandards.splice(index, 1)
        $q.notify({
          message: 'Performance standard removed',
          color: 'positive',
          position: 'top',
        })
      })
    }

    const hasMinimumEffectivenessValuesForEmployee = (employee, index) => {
      if (
        !employee ||
        !employee.performanceStandards ||
        index >= employee.performanceStandards.length
      ) {
        return false
      }

      const standard = employee.performanceStandards[index]
      if (!standard || !standard.standardOutcomeRows) return false

      const filledValues = standard.standardOutcomeRows.filter(
        (row) => row.effectiveness && row.effectiveness.trim().length > 0,
      ).length

      return filledValues >= 2
    }

    const onSubmit = async () => {
      shouldValidate.value = true
      formInteracted.value = true

      const invalidEmployees = []

      employeeTabs.value.forEach((emp, empIndex) => {
        if (!emp.employeeId) {
          invalidEmployees.push(`Employee ${empIndex + 1}`)
          return
        }

        const invalidStandards = emp.performanceStandards
          .map((_, i) => i)
          .filter((index) => !hasMinimumEffectivenessValuesForEmployee(emp, index))

        if (invalidStandards.length > 0) {
          invalidEmployees.push(
            `${emp.name || 'Employee ' + (empIndex + 1)} (Standards ${invalidStandards.map((i) => i + 1).join(', ')})`,
          )
        }
      })

      if (invalidEmployees.length > 0) {
        $q.notify({
          message: `Please complete required fields for:  ${invalidEmployees.join(', ')}`,
          color: 'negative',
          position: 'top',
          timeout: 3000,
        })
        return
      }

      try {
        uwpStore.setUWPData(uwpData.value)
        uwpStore.setFormData(form.value)
        uwpStore.setEmployeeData(employeeTabs.value)

        const submissionData = {
          uwpData: uwpData.value,
          form: {
            semester: uwpData.value.targetPeriod?.semester || '',
            year: uwpData.value.targetPeriod?.year || new Date().getFullYear(),
          },
          employees: employeeTabs.value
            .filter((emp) => emp.employeeId !== null)
            .map((emp) => {
              // Find full employee data
              const fullEmployeeData = uwpData.value.employeesWithoutTargetPeriod?.find(
                (e) => e.id === emp.employeeId,
              )

              return {
                ...emp,
                employeeId: emp.employeeId,
                employeeData: fullEmployeeData || emp.employeeData,

                // ADD COMPETENCIES HERE
                coreCompetencies: coreCompetencies.value.map((comp) => ({
                  code: comp.code,
                  value: comp.value,
                  description: comp.description,
                })),
                technicalCompetencies: technicalCompetencies.value.map((comp) => ({
                  code: comp.code,
                  value: comp.value,
                  description: comp.description,
                })),
                leadershipCompetencies: leadershipCompetencies.value.map((comp) => ({
                  code: comp.code,
                  value: comp.value,
                  description: comp.description,
                })),

                performanceStandards: emp.performanceStandards.map((standard) => ({
                  ...standard,
                  outputName: standard.outputName || '',
                  requiredOutput: standard.requiredOutput || '',
                  rows: {
                    category: standard.rows.category,
                    mfo: standard.rows.mfo,
                    output: standard.rows.output,
                  },
                  activeTimelinessInputs: standard.activeTimelinessInputs,
                  timelinessInputs: standard.timelinessInputs,
                })),
              }
            }),
          timestamp: new Date().toISOString(),
        }

        // Pass BOTH stores to saveUWP
        await uwpStore.saveUWP(submissionData, officeLibraryIndicatorStore, officeLibraryStore)

        $q.notify({
          message: 'Unit Work Plan saved successfully',
          color: 'positive',
          icon: 'check_circle',
          position: 'top',
        })

        router.push('/office/spms')
      } catch (error) {
        $q.notify({
          message: error.message || 'Failed to save Unit Work Plan',
          color: 'negative',
          position: 'top',
        })
        console.error('❌ Submit error:', error)
      }
    }

    // Watchers
    watch(
      () => {
        return currentEmployee.value.performanceStandards.map((s) => ({
          outputName: s.outputName,
          indicatorName: s.indicatorName,
          quantityType: s.quantityIndicatorType,
          timelinessType: s.timelinessIndicatorType,
          standardOutcomeRows: s.standardOutcomeRows,
          activeTimelinessInputs: s.activeTimelinessInputs,
        }))
      },
      () => {
        currentEmployee.value.performanceStandards.forEach((_, index) => {
          generateSuccessIndicator(index)
        })
      },
      { deep: true },
    )

    watch([() => form.value.division, () => form.value.section, () => form.value.unit], () => {
      filterEmployees()
    })

    watch(
      () => currentEmployee.value,
      (newEmployee) => {
        updateEmployeeCompetencies(newEmployee)
      },
      { deep: true },
    )

    // Update your watch to be more specific
    watch(
      () => ({
        employeeId: currentEmployee.value?.employeeId,
        sg: currentEmployee.value?.sg,
        level: currentEmployee.value?.level,
      }),
      (newVal, oldVal) => {
        console.log('Employee changed:', {
          old: oldVal?.employeeId,
          new: newVal?.employeeId,
          sg: newVal?.sg,
          level: newVal?.level,
        })

        // Only update if we have a valid employee ID AND valid SG/Level
        if (newVal?.employeeId && newVal?.sg && newVal?.level) {
          updateEmployeeCompetencies(currentEmployee.value)
        }
      },
      { deep: true, immediate: false }, // Set immediate to false to avoid initial warning
    )

    // Lifecycle
    onMounted(async () => {
      initializeUWPData()
      initializeEmployeeTabs()
      const officeId = uwpData.value.hierarchy.office?.id || 1

      try {
        // Load all required data
        await Promise.all([
          officeLibraryStore.fetchAllData(officeId),
          officeLibraryIndicatorStore.fetchVerbs(),
          (competencyStore.isInitialized = true), // Ensure competency store is loaded
        ])

        console.log('Competency store initialized:', competencyStore.isInitialized)
      } catch (error) {
        console.error('❌ Error loading data:', error)
        $q.notify({
          message: 'Failed to load data',
          color: 'negative',
          position: 'top',
        })
      }
    })

    return {
      // Data
      uwpData,
      breadcrumbDisplay,
      selectedNodeLabel,
      hierarchyLabels,
      semesterOptions,
      yearOptions,
      form,
      numberCom,
      filteredSections,
      filteredUnits,
      divisionOptions: divisions.value,
      filteredEmployees,
      selectedEmployee,
      employeeTabs,
      activeEmployeeTab,
      currentEmployee,
      maxVisibleTabs,
      visibleEmployeeTabs,
      overflowEmployeeTabs,
      hasOverflowTabs,
      formInteracted,
      shouldValidate,
      isFormValid,
      allEmployeesSelected,
      availableEmployeesForTab,
      skipMfo,
      categoryOptions,
      coreCompetencies,
      technicalCompetencies,
      leadershipCompetencies,
      filteredMfoOptions,
      filteredOutputOptions,
      filteredVerbs,
      performanceIndicatorOptions,
      standardOutcomeColumns,
      showQuantityModal,
      quantityValue,
      currentStandardIndex,
      quantityIndicator,
      uwpStore,
      isLoadingFilteredEmployees,

      // Methods
      addEmployeeTab,
      removeEmployeeTab,
      switchToEmployee,
      onEmployeeSelected,
      getEmployeeIndex,
      getSelectedEmployeeIds,
      hasMinimumEffectivenessValues,
      getEffectivenessErrorCount,
      hasOrganizationalSelection: computed(
        () =>
          form.value.division !== null || form.value.section !== null || form.value.unit !== null,
      ),
      isSupportCategory,
      getFilteredMfoOptions,
      getFilteredOutputOptions,
      hasMfosForCategory,
      hasValidCompetencyData,
      filterMfos,
      filterOutputs,
      filterPerformanceIndicators,
      addPerformanceStandard,
      removePerformanceStandard,
      generateSuccessIndicator,
      filterEmployees,
      onDivisionChange,
      onSectionChange,
      clearDependentFields,
      sanitizeNumericInput,
      computeQuantities,
      cancelQuantityInput,
      onEffectivenessFieldFocus,
      onQuantityOptionSelect,
      onTimelinessTypeSelect,
      applyTimelinessInputs,
      onSubmit,
      onQuantityUpdate,
      onTimelinessUpdate,
      onTimelinessDateUpdate,
      onEffectivenessUpdate,
      onBack,
      getLevelText,
      getEmployeeName,
      getEmployeePosition,
      getEmployeeInitial,
      validateStrictNumeric,
      blockInvalidChars,
    }
  },
}
</script>

<style scoped>
.q-page {
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

.employee-tabs-container {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 8px;
  background-color: #f8f8f8;
  overflow-x: hidden;
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
