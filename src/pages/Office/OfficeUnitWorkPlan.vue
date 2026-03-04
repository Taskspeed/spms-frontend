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
                <div class="col-12 col-md-6">
                  <q-input v-model="selectedEmployee.sg" label="SG" outlined dense readonly>
                    <template v-slot:prepend>
                      <q-icon name="work" size="xs" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="selectedEmployee.level" label="Level" outlined dense readonly>
                    <template v-slot:prepend>
                      <q-icon name="work" size="xs" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

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
                                <div class="text-subtitle2">
                                  Competencies(for IPCR each MFO should have competency)
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
                                  <!-- Core Competencies -->
                                  <div class="col-md-4">
                                    <q-card flat bordered class="full-height">
                                      <q-card-section class="q-pa-sm">
                                        <div class="row items-center justify-between">
                                          <div class="text-caption text-weight-medium">
                                            Core (Auto-populated)
                                          </div>
                                          <!-- Removed the add button -->
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
                                            v-for="(comp, compIndex) in standard.competencies.core"
                                            :key="'core-' + index + '-' + compIndex"
                                            class="competency-item q-pb-xs"
                                          >
                                            <div class="row items-center justify-between">
                                              <div class="text-caption">
                                                {{ comp.code }} - {{ comp.value }} ({{
                                                  comp.level
                                                }})
                                              </div>
                                              <!-- Core competencies cannot be removed as they're auto-populated -->
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
                                    multiple
                                    use-chips
                                    clearable
                                    @update:model-value="generateSuccessIndicator(index)"
                                  >
                                    <template v-slot:prepend>
                                      <q-icon name="flag" size="xs" />
                                    </template>
                                    <template v-slot:option="scope">
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
                                        placeholder="Number or Range"
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

    <!-- Competency Selection Modal -->
    <q-dialog v-model="showCompetencyModal" persistent>
      <q-card style="min-width: 700px; max-width: 900px; border-radius: 8px">
        <q-card-section class="modal-header">
          <div class="text-h6">
            Select {{ competencyType.charAt(0).toUpperCase() + competencyType.slice(1) }} Competency
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Based on SG: {{ currentEmployee.sg }} | Level: {{ currentEmployee.level }}
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
                    <template v-slot:option="scope">
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

                <!-- Level Selection (Read-only since it's auto-populated) -->
                <div class="col-3">
                  <q-select
                    v-model="competency.selectedLevel"
                    :options="levelOptions"
                    label="Level"
                    outlined
                    dense
                    readonly
                    option-value="value"
                    option-label="label"
                    :rules="[(val) => !!val || 'Level is required']"
                  >
                    <template v-slot:option="scope">
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
                :disable="competencySelections.length >= competencyOptions.length"
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

    // Competency Modal Refs
    const showCompetencyModal = ref(false)
    const competencyType = ref('core') // 'core', 'technical', 'leadership'
    const currentStandardIndexForCompetency = ref(0)
    const selectedCompetency = ref(null)
    const selectedLevel = ref(null)
    const filteredCompetencyOptions = ref([])
    const showCompetencyError = ref([])

    // NEW: Multiple competency selection refs
    const competencySelections = ref([{ selectedCompetency: null, selectedLevel: null }])
    const filteredCompetencyOptionsByRow = ref([])

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

    // Competency Data
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

    const levelOptions = computed(() => {
      if (!selectedCompetency.value) return []

      // Get the required level from the competency row
      const requiredLevel = selectedCompetency.value.requiredLevel

      // Map to the level options format
      const levelMap = {
        Basic: { label: 'Basic', value: '1' },
        Intermediate: { label: 'Intermediate', value: '2' },
        Advanced: { label: 'Advanced', value: '3' },
        Superior: { label: 'Superior', value: '4' },
      }

      return requiredLevel ? [levelMap[requiredLevel]] : []
    })

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

      if (!currentTab || !currentTab.employeeId) {
        return { rank: '', position: '', sg: '', level: '' }
      }

      // Get values from the tab (which we set in onEmployeeSelected)
      return {
        rank: currentTab.rank || '',
        position: currentTab.position || '',
        sg: currentTab.sg || '',
        level: currentTab.level || '',
      }
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

    // Auto-populate core competencies based on employee's SG and Level
    const autoPopulateCoreCompetencies = (standard, sg, level) => {
      if (!sg || !level) {
        console.log('Cannot auto-populate: missing SG or Level', { sg, level })
        return
      }

      console.log('Auto-populating core competencies for SG:', sg, 'Level:', level)

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

      console.log('Core competencies from data:', coreCompetencies)

      // For each core competency, check if it's required for this SG
      coreCompetencies.forEach((comp) => {
        const requiredLevel = competencyRow[comp.code]

        console.log(`Checking ${comp.code}:`, { requiredLevel })

        // Only add if the competency is required (has a level and not '-')
        if (requiredLevel && requiredLevel !== '-') {
          // Map the level text to value
          const levelMap = {
            Basic: '1',
            Intermediate: '2',
            Advanced: '3',
            Superior: '4',
          }

          standard.competencies.core.push({
            code: comp.code,
            description: comp.description,
            value: levelMap[requiredLevel] || '1',
            level: requiredLevel,
          })

          console.log(`Added ${comp.code} with level ${requiredLevel}`)
        }
      })

      console.log('Final core competencies:', standard.competencies.core)
    }

    const competencyOptions = computed(() => {
      if (!currentEmployee.value?.sg || !currentEmployee.value?.level) {
        return []
      }

      const sg = currentEmployee.value.sg
      // const level = currentEmployee.value.level

      // Get the competency row for this SG and Level
      const competencyRow = competencyStore.getBySG(sg)

      if (!competencyRow) return []

      // Get competencies based on type and filter only those with values
      const typeCompetencies = competencyData[competencyType.value] || []

      return typeCompetencies
        .filter((comp) => {
          const competencyLevel = competencyRow[comp.code]
          // Only include competencies that are required (have a level value)
          return competencyLevel && competencyLevel !== '-'
        })
        .map((comp) => ({
          code: comp.code,
          description: comp.description,
          label: `${comp.code} - ${comp.description}`,
          requiredLevel: competencyRow[comp.code],
        }))
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

    const hasMinimumCompetencies = (employee, standardIndex) => {
      if (
        !employee ||
        !employee.performanceStandards ||
        standardIndex >= employee.performanceStandards.length
      ) {
        return false
      }

      const standard = employee.performanceStandards[standardIndex]
      if (!standard || !standard.competencies) return false

      const { core, technical, leadership } = standard.competencies
      const totalCompetencies =
        (core?.length || 0) + (technical?.length || 0) + (leadership?.length || 0)

      return totalCompetencies >= 1
    }

    const isFormValid = computed(() => {
      if (employeeTabs.value.length === 0) return false
      const hasTargetPeriod =
        uwpData.value.targetPeriod?.semester && uwpData.value.targetPeriod?.year
      if (!hasTargetPeriod) return false

      const allEmployeesValid = employeeTabs.value.every((emp) => {
        if (!emp.employeeId) return false

        // Check performance standards
        const allStandardsValid = emp.performanceStandards.every((standard) => {
          // Check effectiveness values (at least 2)
          if (!standard.standardOutcomeRows) return false
          const filledEffectivenessValues = standard.standardOutcomeRows.filter(
            (row) => row.effectiveness && row.effectiveness.trim().length > 0,
          ).length
          if (filledEffectivenessValues < 2) return false

          // Check competencies (at least 1 from any category)
          const { core, technical, leadership } = standard.competencies
          const totalCompetencies =
            (core?.length || 0) + (technical?.length || 0) + (leadership?.length || 0)

          return totalCompetencies >= 1
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

    // NEW: Computed property to check if any competency selection is valid
    const isAnyCompetencyValid = computed(() => {
      return competencySelections.value.some(
        (comp) => comp.selectedCompetency && comp.selectedLevel,
      )
    })

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

    // Competency Methods
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

      competencySelections.value = [{ selectedCompetency: null, selectedLevel: null }]
      filteredCompetencyOptionsByRow.value = [competencyOptions.value]

      showCompetencyModal.value = true
    }

    const filterCompetencies = (val, update, rowIndex) => {
      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()
          const filtered = competencyOptions.value.filter(
            (comp) =>
              comp.code.toLowerCase().includes(needle) ||
              comp.description.toLowerCase().includes(needle),
          )

          if (!filteredCompetencyOptionsByRow.value[rowIndex]) {
            filteredCompetencyOptionsByRow.value[rowIndex] = []
          }
          filteredCompetencyOptionsByRow.value[rowIndex] = filtered
        })
      } else {
        if (!filteredCompetencyOptionsByRow.value[rowIndex]) {
          filteredCompetencyOptionsByRow.value[rowIndex] = []
        }
        filteredCompetencyOptionsByRow.value[rowIndex] = competencyOptions.value
      }
    }
    // NEW: Get available competencies for a specific row (excluding already selected)
    const getAvailableCompetencies = (rowIndex) => {
      const selectedCodes = competencySelections.value
        .map((sel, idx) =>
          idx !== rowIndex && sel.selectedCompetency ? sel.selectedCompetency.code : null,
        )
        .filter(Boolean)

      const options = filteredCompetencyOptionsByRow.value[rowIndex] || competencyOptions.value
      return options.filter((comp) => !selectedCodes.includes(comp.code))
    }

    // NEW: Add a competency row
    const addCompetencyRow = () => {
      competencySelections.value.push({ selectedCompetency: null, selectedLevel: null })
      filteredCompetencyOptionsByRow.value.push(competencyOptions.value)
    }

    // NEW: Remove a competency row
    const removeCompetencyRow = (index) => {
      if (competencySelections.value.length > 1) {
        competencySelections.value.splice(index, 1)
        filteredCompetencyOptionsByRow.value.splice(index, 1)
      }
    }

    const addAllSelectedCompetencies = () => {
      const standard =
        currentEmployee.value.performanceStandards[currentStandardIndexForCompetency.value]
      if (!standard) return

      let addedCount = 0

      competencySelections.value.forEach((selection) => {
        if (selection.selectedCompetency && selection.selectedLevel) {
          const competency = {
            code: selection.selectedCompetency.code,
            description: selection.selectedCompetency.description,
            value: selection.selectedLevel.value, // This will be 1,2,3,4
            level: selection.selectedLevel.label, // This will be Basic, Intermediate, etc.
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
      filteredCompetencyOptionsByRow.value = [competencyOptions.value]
      showCompetencyModal.value = false
      validateCompetencies(currentStandardIndexForCompetency.value)
    }

    const removeCompetency = (type, compIndex, standardIndex) => {
      const standard = currentEmployee.value.performanceStandards[standardIndex]
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
        // Check if we still have at least one competency
        validateCompetencies(standardIndex)
      })
    }

    const validateCompetencies = (standardIndex) => {
      const standard = currentEmployee.value.performanceStandards[standardIndex]
      if (!standard) return

      const { core, technical, leadership } = standard.competencies
      const totalCompetencies =
        (core?.length || 0) + (technical?.length || 0) + (leadership?.length || 0)

      showCompetencyError.value[standardIndex] = totalCompetencies === 0

      // Core competencies are auto-populated, so we don't need to validate them separately
      // The total count already includes core competencies
    }

    const cancelCompetencySelection = () => {
      showCompetencyModal.value = false
      competencySelections.value = [{ selectedCompetency: null, selectedLevel: null }]
      filteredCompetencyOptionsByRow.value = [competencyOptions.value]
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
          employeeTabs.value[tabIndex].sg = ''
          employeeTabs.value[tabIndex].level = ''
        }
        return
      }

      const selectedEmp = uwpData.value.employeesWithoutTargetPeriod?.find(
        (emp) => emp.id === employeeId,
      )

      console.log('Selected employee data:', selectedEmp)

      if (selectedEmp && activeEmployeeTab.value) {
        const tabIndex = employeeTabs.value.findIndex((emp) => emp.id === activeEmployeeTab.value)
        if (tabIndex !== -1) {
          employeeTabs.value[tabIndex].name = selectedEmp.label || selectedEmp.name || ''
          employeeTabs.value[tabIndex].employeeId = selectedEmp.id
          employeeTabs.value[tabIndex].employeeData = selectedEmp
          employeeTabs.value[tabIndex].rank = selectedEmp.rank || ''
          employeeTabs.value[tabIndex].position = selectedEmp.position || ''

          // Capture SG and Level
          const sg = selectedEmp.employeeData?.sg || selectedEmp.sg || selectedEmp.SG || ''
          const level = selectedEmp.employeeData?.level || selectedEmp.level || ''

          employeeTabs.value[tabIndex].sg = sg
          employeeTabs.value[tabIndex].level = level

          console.log('Captured SG and Level:', { sg, level })

          // Auto-populate core competencies for all performance standards
          if (employeeTabs.value[tabIndex].performanceStandards) {
            employeeTabs.value[tabIndex].performanceStandards.forEach((standard) => {
              autoPopulateCoreCompetencies(standard, sg, level)
            })
          }
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

        // Handle multiple indicators with "and" before the last one
        let indicatorNamePart = ''
        if (Array.isArray(standard.indicatorName) && standard.indicatorName.length > 0) {
          // Map each indicator (could be ID or string) to its name
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

          // Join with commas and "and" before the last item
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

        // Build success indicator parts
        const parts = []

        if (quantityPart && quantityPart.trim()) {
          parts.push(quantityPart)
        }

        if (outputNamePart) {
          parts.push(outputNamePart)
        }

        if (indicatorNamePart) {
          parts.push(indicatorNamePart)
        }

        if (effectivenessPart && effectivenessPart.trim()) {
          parts.push(effectivenessPart)
        }

        if (timelinessPart && timelinessPart.trim()) {
          parts.push(timelinessPart)
        }

        standard.successIndicator = parts.join(' ')

        // Debug logging
        console.log(`Success Indicator for standard ${i + 1}:`, {
          quantityType: standard.quantityIndicatorType,
          quantityValue: quantityPart,
          outputName: outputNamePart,
          indicatorNames: indicatorNamePart,
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
        // Type B: Show modal for target input
        quantityValue.value = null
        showQuantityModal.value = true

        // Optionally, clear existing quantities when switching to B
        standard.standardOutcomeRows.forEach((row) => (row.quantity = ''))
      } else if (value === 'C') {
        // Type C: Auto-set quantities to percentage ranges
        computeQuantities('C', index)
      } else {
        // Type A: Clear any stored target output value
        standard.targetOutputValue = null

        // For Type A, quantities are entered manually, so we don't auto-calculate
        // Optionally, clear all quantities when switching from B/C to A
        // standard.standardOutcomeRows.forEach((row) => (row.quantity = ''))

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

        // Store target output
        standard.targetOutputValue = base.toString()

        // Rounded thresholds (rounded once to avoid gaps)
        const max130 = Math.round(base * 1.3)
        const max115 = Math.round(base * 1.15)
        const max50 = Math.round(base * 0.5)

        // Continuous ranges (no gaps, no overlaps)
        const above130Min = max130

        const range115to129Min = max115
        const range115to129Max = max130 - 1

        const range100to114Min = base
        const range100to114Max = max115 - 1

        const range51to99Min = max50 + 1
        const range51to99Max = base - 1

        const below50Max = max50

        // Assign quantities
        standard.standardOutcomeRows[0].quantity = `${above130Min} and above`
        standard.standardOutcomeRows[1].quantity = `${range115to129Min}-${range115to129Max}`
        standard.standardOutcomeRows[2].quantity = `${range100to114Min}-${range100to114Max}`
        standard.standardOutcomeRows[3].quantity = `${range51to99Min}-${range51to99Max}`
        standard.standardOutcomeRows[4].quantity = `${below50Max} and below`

        generateSuccessIndicator(idx)

        $q.notify({
          message: 'Quantities calculated successfully for Type B',
          color: 'positive',
          position: 'top',
        })

        showQuantityModal.value = false
        quantityValue.value = null
      } else if (currentType === 'C') {
        standard.targetOutputValue = '100%'

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
      const newStandard = createDefaultPerformanceStandard()

      // Auto-populate core competencies for the new standard using current employee's SG and Level
      if (currentEmployee.value?.sg && currentEmployee.value?.level) {
        autoPopulateCoreCompetencies(
          newStandard,
          currentEmployee.value.sg,
          currentEmployee.value.level,
        )
      }

      currentEmployee.value.performanceStandards.push(newStandard)

      // Initialize competency error tracking for new standard
      showCompetencyError.value[currentEmployee.value.performanceStandards.length - 1] = false

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
        // Remove the corresponding competency error
        showCompetencyError.value.splice(index, 1)
        $q.notify({
          message: 'Performance standard removed',
          color: 'positive',
          position: 'top',
        })
      })
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
          .map((standard, standardIndex) => {
            const errors = []

            // Check effectiveness values
            if (!standard.standardOutcomeRows) {
              errors.push('no standard rows')
            } else {
              const filledEffectivenessValues = standard.standardOutcomeRows.filter(
                (row) => row.effectiveness && row.effectiveness.trim().length > 0,
              ).length
              if (filledEffectivenessValues < 2) {
                errors.push('requires at least 2 effectiveness values')
              }
            }

            // Check competencies
            const { core, technical, leadership } = standard.competencies
            const totalCompetencies =
              (core?.length || 0) + (technical?.length || 0) + (leadership?.length || 0)

            if (totalCompetencies < 1) {
              errors.push('requires at least 1 competency')
            }

            return errors.length > 0 ? `${standardIndex + 1} (${errors.join(', ')})` : null
          })
          .filter(Boolean)

        if (invalidStandards.length > 0) {
          invalidEmployees.push(
            `${emp.name || 'Employee ' + (empIndex + 1)} (Standards ${invalidStandards.join('; ')})`,
          )
        }
      })

      if (invalidEmployees.length > 0) {
        $q.notify({
          message: `Please complete required fields for: ${invalidEmployees.join(', ')}`,
          color: 'negative',
          position: 'top',
          timeout: 5000,
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
              const fullEmployeeData = uwpData.value.employeesWithoutTargetPeriod?.find(
                (e) => e.id === emp.employeeId,
              )

              return {
                ...emp,
                employeeId: emp.employeeId,
                employeeData: fullEmployeeData || emp.employeeData,
                performanceStandards: emp.performanceStandards.map((standard) => ({
                  ...standard,
                  outputName: standard.outputName || '',
                  requiredOutput: standard.requiredOutput || '',
                  indicatorName: Array.isArray(standard.indicatorName)
                    ? standard.indicatorName
                    : standard.indicatorName
                      ? [standard.indicatorName]
                      : [],
                  rows: {
                    category: standard.rows.category,
                    mfo: standard.rows.mfo,
                    output: standard.rows.output,
                  },
                  activeTimelinessInputs: standard.activeTimelinessInputs,
                  timelinessInputs: standard.timelinessInputs,
                  competencies: standard.competencies,
                })),
              }
            }),
          timestamp: new Date().toISOString(),
        }

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
      () => ({
        sg: currentEmployee.value?.sg,
        level: currentEmployee.value?.level,
        employeeId: currentEmployee.value?.employeeId,
      }),
      (newValues) => {
        console.log('SG/Level changed:', newValues)
        if (
          newValues.sg &&
          newValues.level &&
          newValues.employeeId &&
          currentEmployee.value?.performanceStandards
        ) {
          currentEmployee.value.performanceStandards.forEach((standard) => {
            autoPopulateCoreCompetencies(standard, newValues.sg, newValues.level)
          })
        }
      },
      { deep: true },
    )

    watch(
      () => competencySelections.value.map((sel) => sel.selectedCompetency),
      () => {
        competencySelections.value.forEach((selection) => {
          if (selection.selectedCompetency && !selection.selectedLevel) {
            // Auto-populate the level from the competency's required level
            const requiredLevel = selection.selectedCompetency.requiredLevel
            const levelMap = {
              Basic: { label: 'Basic', value: '1' },
              Intermediate: { label: 'Intermediate', value: '2' },
              Advanced: { label: 'Advanced', value: '3' },
              Superior: { label: 'Superior', value: '4' },
            }
            selection.selectedLevel = levelMap[requiredLevel] || null
          }
        })
      },
      { deep: true },
    )

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

    // Add watcher for competency validation
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
        ])
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

      // Competency Modal Data
      showCompetencyModal,
      competencyType,
      selectedCompetency,
      selectedLevel,
      competencyOptions,
      levelOptions,
      filteredCompetencyOptions,
      showCompetencyError,
      competencySelections, // NEW
      filteredCompetencyOptionsByRow, // NEW
      isAnyCompetencyValid, // NEW

      // Methods
      addEmployeeTab,
      removeEmployeeTab,
      switchToEmployee,
      onEmployeeSelected,
      getEmployeeIndex,
      getSelectedEmployeeIds,
      hasMinimumEffectivenessValues,
      getEffectivenessErrorCount,
      hasMinimumCompetencies,
      hasOrganizationalSelection: computed(
        () =>
          form.value.division !== null || form.value.section !== null || form.value.unit !== null,
      ),
      isSupportCategory,
      getFilteredMfoOptions,
      getFilteredOutputOptions,
      hasMfosForCategory,
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
      getEmployeeName,
      getEmployeePosition,
      getEmployeeInitial,
      validateStrictNumeric,
      blockInvalidChars,

      // Competency Methods
      openCompetencyModal,
      filterCompetencies,
      addAllSelectedCompetencies, // UPDATED
      removeCompetency,
      cancelCompetencySelection,
      validateCompetencies,
      getAvailableCompetencies, // NEW
      addCompetencyRow, // NEW
      removeCompetencyRow, // NEW
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

.preview-section {
  margin-top: 16px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
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
