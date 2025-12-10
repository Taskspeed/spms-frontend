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
          Available Employees: <strong>{{ uwpData.totalAvailableEmployees }}</strong>
          <span v-if="employeeTabs.length > 0" class="q-ml-md">
            Selected: <strong>{{ employeeTabs.filter((e) => e.employeeId).length }}</strong>
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
                <q-select
                  v-model="form.semester"
                  :options="semesterOptions"
                  label="Semester"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="calendar_view_month" size="xs" />
                  </template>
                </q-select>

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
                <q-select v-model="form.year" :options="yearOptions" label="Year" outlined dense>
                  <template v-slot: prepend>
                    <q-icon name="event" size="xs" />
                  </template>
                </q-select>

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
                option-label="name"
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
                        {{ scope.opt.name.charAt(0) }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption lines="1">{{ scope.opt.position }}</q-item-label>
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
                                    v-if="standard.rows.category && hasMfosForCategory(index)"
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
                                    :disable="!standard.rows.category"
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
                                          <template
                                            v-if="Object.keys(mergedCoreCompetency).length > 0"
                                          >
                                            <div
                                              v-for="(comp, name) in mergedCoreCompetency"
                                              :key="'core-' + name"
                                              class="q-pb-xs"
                                            >
                                              {{ comp.code }}-{{ comp.value }} ({{ comp.legend }})
                                            </div>
                                          </template>
                                          <div v-else class="text-grey-6 text-center">
                                            No core competencies
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
                                          <template
                                            v-if="Object.keys(mergedTechnicalCompetency).length > 0"
                                          >
                                            <div
                                              v-for="(comp, name) in mergedTechnicalCompetency"
                                              :key="'tech-' + name"
                                              class="q-pb-xs"
                                            >
                                              {{ comp.code }}-{{ comp.value }} ({{ comp.legend }})
                                            </div>
                                          </template>
                                          <div v-else class="text-grey-6 text-center">
                                            No technical competencies
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
                                          <template
                                            v-if="
                                              Object.keys(mergedLeadershipCompetency).length > 0
                                            "
                                          >
                                            <div
                                              v-for="(comp, name) in mergedLeadershipCompetency"
                                              :key="'leader-' + name"
                                              class="q-pb-xs"
                                            >
                                              {{ comp.code }}-{{ comp.value }} ({{ comp.legend }})
                                            </div>
                                          </template>
                                          <div v-else class="text-grey-6 text-center">
                                            No leadership competencies
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

                                  <!-- ✅ Performance Indicator - Searchable Dropdown -->
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
                                        @update:model-value="generateSuccessIndicator(index)"
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
          <q-btn label="Calculate" color="green" unelevated @click="computeQuantities" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="row justify-end q-mt-lg q-gutter-sm">
      <q-btn label="Cancel" color="grey" flat dense @click="onBack" />
      <q-btn label="Submit" color="green-7" icon="save" @click="onSubmit" :disable="!isFormValid" />
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

export default {
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const officeLibraryStore = useMfoStore()
    const officeLibraryIndicatorStore = useLibraryStore()

    // Add these reactive variables for filtered options
    const filteredMfoOptions = ref({}) // Store filtered MFOs by performance standard index
    const filteredOutputOptions = ref({}) // Store filtered outputs by performance standard index

    const uwpData = ref({
      type: null,
      selectedNodeId: null,
      selectedNodeLabel: null,
      breadcrumb: [],
      hierarchy: {
        office: null,
        office2: null,
        group: null,
        division: null,
        section: null,
        unit: null,
      },
      availableEmployees: [],
      totalAvailableEmployees: 0,
      selectedEmployees: [],
      timestamp: null,
    })

    // Initialize UWP data from sessionStorage
    const initializeUWPData = () => {
      try {
        const stored = sessionStorage.getItem('uwpData')
        if (stored) {
          const parsed = JSON.parse(stored)
          uwpData.value = parsed
          console.log('✅ Retrieved UWP Data from sessionStorage:', uwpData.value)
        } else {
          console.warn('⚠️ No UWP data found in sessionStorage')
        }
      } catch (error) {
        console.error('❌ Failed to parse UWP data:', error)
      }
    }

    // Computed:  Get breadcrumb display string
    const breadcrumbDisplay = computed(() => {
      if (!uwpData.value.breadcrumb || uwpData.value.breadcrumb.length === 0) {
        return 'Organization Structure'
      }
      return uwpData.value.breadcrumb.join(' / ')
    })

    // Computed: Get selected node label
    const selectedNodeLabel = computed(() => {
      return uwpData.value.selectedNodeLabel || 'Work Plan'
    })

    const onBack = () => {
      router.back()
    }

    // Configuration for visible tabs
    const maxVisibleTabs = ref(3)

    // Form state tracking
    const formInteracted = ref(false)
    const shouldValidate = ref(false)

    // Employee tabs management
    const activeEmployeeTab = ref(null)
    const employeeTabs = ref([])

    // Create default empty row structure
    const createEmptyStandardRow = () => {
      return {
        rating: '',
        quantity: '',
        effectiveness: '',
        timeliness: '',
        timelinessRange: '',
        timelinessText: '',
        timelinessDeadline: '',
        timelinessDate: '',
      }
    }

    // Create default rows for a standard outcome table
    const createDefaultStandardRows = () => {
      return [
        { ...createEmptyStandardRow(), rating: '5' },
        { ...createEmptyStandardRow(), rating: '4' },
        { ...createEmptyStandardRow(), rating: '3' },
        { ...createEmptyStandardRow(), rating: '2' },
        { ...createEmptyStandardRow(), rating: '1' },
      ]
    }

    // Create default Performance Standard object
    const createDefaultPerformanceStandard = () => {
      return {
        id: uuidv4(),
        expanded: true,
        outputName: '',
        indicatorName: '',
        successIndicator: '',
        requiredOutput: '',
        modeOfVerification: '',
        rows: {
          category: null,
          mfo: null,
          output: null,
        },
        quantityIndicatorType: 'numeric',
        timelinessIndicatorType: 'beforeDeadline',
        timelinessInputs: {
          range: true,
          date: false,
          description: false,
        },
        activeTimelinessInputs: {
          range: true,
          date: false,
          description: false,
        },
        standardOutcomeRows: createDefaultStandardRows(),
      }
    }
    // Create default employee data
    const createDefaultEmployeeData = () => {
      const id = uuidv4()
      return {
        id,
        name: '',
        employeeId: null,
        employeeData: null,
        performanceStandards: [createDefaultPerformanceStandard()],
      }
    }

    // Initialize employee tabs from UWP data
    const initializeEmployeeTabs = () => {
      // Check if availableEmployees exists and has data
      if (!uwpData.value.availableEmployees || uwpData.value.availableEmployees.length === 0) {
        // No employees available, start with empty tab
        const defaultEmp = createDefaultEmployeeData()
        employeeTabs.value = [defaultEmp]
        activeEmployeeTab.value = defaultEmp.id
        console.log('✅ Initialized with empty employee tab (no available employees)')
        return
      }

      // Optional: Start with one empty tab for user to add employees
      const defaultEmp = createDefaultEmployeeData()
      employeeTabs.value = [defaultEmp]
      activeEmployeeTab.value = defaultEmp.id

      console.log(
        '✅ Initialized with empty tab.  Available employees: ',
        uwpData.value.availableEmployees.length,
      )
    }

    // Base form data
    const form = ref({
      unit: null,
      section: null,
      division: null,
      semester: null,
      year: new Date().getFullYear(),
    })

    // Current active employee data
    const currentEmployee = computed(() => {
      const activeEmployee = employeeTabs.value.find((emp) => emp.id === activeEmployeeTab.value)
      return activeEmployee || employeeTabs.value[0] || createDefaultEmployeeData()
    })

    // ✅ Performance Indicators Filter
    const filteredVerbs = ref([])

    // ✅ Just use this simple filter
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
                verb.description.toLowerCase().includes(needle),
            )
        })
      } else {
        // Initialize with all verbs on first load
        filteredVerbs.value = officeLibraryIndicatorStore.verbs.map((verb) => ({
          id: verb.id,
          label: verb.indicator_name || verb.name,
          value: verb.id,
          name: verb.indicator_name || verb.name,
          description: verb.description || '',
        }))
      }
    }

    // ✅ Performance Indicator Options
    const performanceIndicatorOptions = computed(() => {
      return officeLibraryIndicatorStore.verbs.map((verb) => ({
        id: verb.id,
        label: verb.indicator_name || verb.name, // ✅ Handle both formats
        value: verb.id,
        name: verb.indicator_name || verb.name,
        description: verb.description || '',
      }))
    })

    // MFO and Competencies related data
    const skipMfo = ref(false)

    // ✅ Category Options from MFO Store
    const categoryOptions = computed(() => {
      return officeLibraryStore.categories.map((cat) => ({
        id: cat.id,
        label: cat.name,
        value: cat.id,
        name: cat.name,
      }))
    })

    // ✅ Fixed: Check if category has MFOs
    const hasMfosForCategory = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard || !standard.rows.category) {
        return false
      }

      const categoryId = standard.rows.category

      // Filter MFOs by category ID from the store
      const mfosInCategory = officeLibraryStore.mfos.filter(
        (mfo) => mfo.f_category_id === categoryId,
      )

      return mfosInCategory.length > 0
    }

    const getFilteredMfoOptions = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard || !standard.rows.category) {
        return []
      }

      const categoryId = standard.rows.category

      // Return filtered options if available, otherwise return all
      if (filteredMfoOptions.value[index]) {
        return filteredMfoOptions.value[index]
      }

      // Get all MFOs for this category
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

      return allMfos
    }

    // Reset filtered options when category changes
    const clearDependentFields = (standardIndex, fieldIndex) => {
      const standard = currentEmployee.value.performanceStandards[standardIndex]
      if (!standard) return

      if (fieldIndex === 1) {
        // If category changed, reset MFO and output
        standard.rows.mfo = null
        standard.rows.output = null
        // Clear filtered options for this standard
        filteredMfoOptions.value[standardIndex] = null
        filteredOutputOptions.value[standardIndex] = null
      } else if (fieldIndex === 2) {
        // If MFO changed, reset output
        standard.rows.output = null
        filteredOutputOptions.value[standardIndex] = null
      }
    }

    const getFilteredOutputOptions = (index) => {
      // If we have filtered options stored, return those
      if (filteredOutputOptions.value[index] && filteredOutputOptions.value[index].length > 0) {
        return filteredOutputOptions.value[index]
      }

      // Otherwise, return all outputs for the current selection
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard || !standard.rows.category) {
        return []
      }

      const categoryId = standard.rows.category
      const mfoId = standard.rows.mfo

      if (!officeLibraryStore.outputs || officeLibraryStore.outputs.length === 0) {
        return []
      }

      // Filter outputs
      const filteredOutputs = officeLibraryStore.outputs.filter((output) => {
        if (output.f_category_id !== categoryId) return false

        if (mfoId) {
          return output.mfo_id === mfoId
        }

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

    // MFO filtering method
    const filterMfos = (val, update, index) => {
      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()

          // Get all MFOs for the selected category first
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

          // Filter by search term
          filteredMfoOptions.value[index] = allMfos.filter(
            (mfo) =>
              mfo.label.toLowerCase().includes(needle) ||
              (mfo.code && mfo.code.toLowerCase().includes(needle)) ||
              (mfo.description && mfo.description.toLowerCase().includes(needle)),
          )
        })
      }
    }

    // Output filtering method
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
          const mfoId = standard.rows.mfo

          // Get ALL outputs for this category/MFO combination (not filtered)
          const allOutputs = officeLibraryStore.outputs.filter((output) => {
            if (output.f_category_id !== categoryId) return false
            if (mfoId && output.mfo_id !== mfoId) return false
            if (!mfoId && output.mfo_id !== null) return false
            return true
          })

          // Convert to options format
          const outputOptions = allOutputs.map((output) => ({
            id: output.id,
            label: output.name,
            value: output.id,
            name: output.name,
            code: output.code || '',
            description: output.description || '',
          }))

          // Filter by search term
          filteredOutputOptions.value[index] = outputOptions.filter(
            (output) =>
              output.label.toLowerCase().includes(needle) ||
              (output.code && output.code.toLowerCase().includes(needle)) ||
              (output.description && output.description.toLowerCase().includes(needle)),
          )
        })
      }
    }

    // Competencies data
    const mergedCoreCompetency = ref({
      Communication: { code: 'C1', value: 'Advanced', legend: '4' },
      Teamwork: { code: 'C2', value: 'Proficient', legend: '3' },
    })

    const mergedTechnicalCompetency = ref({
      Programming: { code: 'T1', value: 'Advanced', legend: '4' },
      Database: { code: 'T2', value: 'Expert', legend: '5' },
    })

    const mergedLeadershipCompetency = ref({
      'Decision Making': { code: 'L1', value: 'Proficient', legend: '3' },
    })

    // Standard Outcome table configuration
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

    // Variables for the current standard in modal dialogs
    const currentStandardIndex = ref(0)
    const showQuantityModal = ref(false)
    const quantityValue = ref(null)

    // Quantity and Timeliness options
    const quantityIndicator = [
      { label: 'Quantity (A.  Custom Target)', value: 'numeric' },
      { label: 'Quantity (B. Can exceed 100%)', value: 'B' },
      { label: 'Quantity (C. Cannot exceed 100%)', value: 'C' },
    ]

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

    // Form options
    const filteredEmployees = ref([])
    const semesterOptions = ['January-June', 'July-December']
    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
    const divisionOptions = divisions.value

    const hierarchyLabels = computed(() => ({
      office: uwpData.value.hierarchy.office?.label || '',
      office2: uwpData.value.hierarchy.office2?.label || '',
      group: uwpData.value.hierarchy.group?.label || '',
      division: uwpData.value.hierarchy.division?.label || '',
      section: uwpData.value.hierarchy.section?.label || '',
      unit: uwpData.value.hierarchy.unit?.label || '',
    }))

    // Computed properties for tab management
    const visibleEmployeeTabs = computed(() => {
      return employeeTabs.value.slice(0, maxVisibleTabs.value)
    })

    const overflowEmployeeTabs = computed(() => {
      return employeeTabs.value.slice(maxVisibleTabs.value)
    })

    const hasOverflowTabs = computed(() => {
      return employeeTabs.value.length > maxVisibleTabs.value
    })

    const getEmployeeIndex = (id) => {
      return employeeTabs.value.findIndex((emp) => emp.id === id)
    }

    // Track selected employee IDs across all tabs
    const getSelectedEmployeeIds = () => {
      return employeeTabs.value
        .filter((emp) => emp.employeeId !== null)
        .map((emp) => emp.employeeId)
    }

    // Check if all available employees are selected
    const allEmployeesSelected = computed(() => {
      if (!uwpData.value.availableEmployees || uwpData.value.availableEmployees.length === 0) {
        return false
      }

      const selectedIds = getSelectedEmployeeIds()
      return (
        uwpData.value.availableEmployees.length > 0 &&
        uwpData.value.availableEmployees.length <= selectedIds.length &&
        uwpData.value.availableEmployees.every((emp) => selectedIds.includes(emp.id))
      )
    })

    // Filter employees for current tab
    const availableEmployeesForTab = computed(() => {
      if (!uwpData.value.availableEmployees || uwpData.value.availableEmployees.length === 0) {
        return []
      }

      const selectedIds = getSelectedEmployeeIds()
      const currentTabId = activeEmployeeTab.value
      const currentTabEmployeeId = employeeTabs.value.find(
        (emp) => emp.id === currentTabId,
      )?.employeeId

      return uwpData.value.availableEmployees.filter(
        (emp) => !selectedIds.includes(emp.id) || emp.id === currentTabEmployeeId,
      )
    })

    const hasOrganizationalSelection = computed(() => {
      return form.value.division !== null || form.value.section !== null || form.value.unit !== null
    })

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

    const selectedEmployee = computed(() => {
      // Use availableEmployees
      return (
        uwpData.value.availableEmployees.find(
          (emp) => emp.id === currentEmployee.value.employeeId,
        ) || {
          rank: '',
          position: '',
        }
      )
    })

    // Check minimum effectiveness values
    const hasMinimumEffectivenessValues = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return false

      const filledValues = standard.standardOutcomeRows.filter(
        (row) => row.effectiveness && row.effectiveness.trim().length > 0,
      ).length
      return filledValues >= 2
    }

    // Get effectiveness error count
    const getEffectivenessErrorCount = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return 5

      return standard.standardOutcomeRows.filter(
        (row) => !row.effectiveness || row.effectiveness.trim().length === 0,
      ).length
    }

    // Form validity check
    const isFormValid = computed(() => {
      if (employeeTabs.value.length === 0) return false

      const basicRequirements = form.value.year && form.value.semester

      const allEmployeesValid = employeeTabs.value.every((emp) => {
        if (!emp.employeeId) return false

        return emp.performanceStandards.every((_, index) => {
          if (emp.id === activeEmployeeTab.value) {
            return hasMinimumEffectivenessValues(index)
          } else {
            return true
          }
        })
      })

      return basicRequirements && allEmployeesValid
    })

    // Add employee tab
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

    // Remove employee tab
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

    // Switch to employee tab
    const switchToEmployee = (tabId) => {
      activeEmployeeTab.value = tabId
    }

    // Employee selection handler
    const onEmployeeSelected = (employeeId) => {
      if (employeeId === null) return

      // Get from availableEmployees
      const selectedEmp = uwpData.value.availableEmployees.find((emp) => emp.id === employeeId)

      if (selectedEmp && activeEmployeeTab.value) {
        const tabIndex = employeeTabs.value.findIndex((emp) => emp.id === activeEmployeeTab.value)
        if (tabIndex !== -1) {
          employeeTabs.value[tabIndex].name = selectedEmp.name
          employeeTabs.value[tabIndex].employeeId = selectedEmp.id
          employeeTabs.value[tabIndex].employeeData = selectedEmp
        }
      }
    }

    // Filter employees
    const filterEmployees = (val, update) => {
      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()
          filteredEmployees.value = availableEmployeesForTab.value.filter((emp) =>
            emp.name.toLowerCase().includes(needle),
          )
        })
      } else {
        filteredEmployees.value = availableEmployeesForTab.value
      }
    }

    // Get quantity component for success indicator
    const getQuantityComponent = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return ''

      if (standard.quantityIndicatorType === 'numeric') {
        const rating5Row = standard.standardOutcomeRows.find((row) => row.rating === '5')
        return rating5Row?.quantity || ''
      } else if (standard.quantityIndicatorType === 'B') {
        return quantityValue.value?.toString() || ''
      } else if (standard.quantityIndicatorType === 'C') {
        return '100%'
      }
      return ''
    }

    // Get timeliness component for success indicator
    const getTimelinessComponent = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return ''

      const highestRating = standard.standardOutcomeRows[0]
      const midRating = standard.standardOutcomeRows[2]
      let result = []

      if (standard.timelinessIndicatorType === 'beforeDeadline') {
        if (standard.activeTimelinessInputs.range && midRating.timelinessRange) {
          result.push(midRating.timelinessRange)
        }
        if (standard.activeTimelinessInputs.date && midRating.timelinessDate) {
          result.push(`by ${midRating.timelinessDate}`)
        }
        if (standard.activeTimelinessInputs.description && midRating.timelinessText) {
          result.push(midRating.timelinessText)
        }
      } else if (standard.timelinessIndicatorType === 'onDeadline') {
        if (standard.activeTimelinessInputs.range && highestRating.timelinessRange) {
          result.push(highestRating.timelinessRange)
        }
        if (standard.activeTimelinessInputs.date && highestRating.timelinessDate) {
          result.push(`by ${highestRating.timelinessDate}`)
        }
        if (standard.activeTimelinessInputs.description && highestRating.timelinessText) {
          result.push(highestRating.timelinessText)
        }
      }

      return result.join(' ')
    }

    // Get effectiveness component for success indicator
    const getEffectivenessComponent = (index) => {
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return ''

      const rating5Row = standard.standardOutcomeRows.find((row) => row.rating === '5')
      return rating5Row?.effectiveness || ''
    }

    // Auto-generate success indicator
    const generateSuccessIndicator = (index) => {
      // If no index provided, regenerate all
      if (index === undefined || index === null) {
        if (currentEmployee.value.performanceStandards.length > 0) {
          currentEmployee.value.performanceStandards.forEach((_, i) => {
            generateSuccessIndicator(i)
          })
        }
        return
      }

      // Validate index
      if (index < 0 || index >= currentEmployee.value.performanceStandards.length) {
        return
      }

      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return

      const quantityPart = getQuantityComponent(index)
      const outputNamePart = standard.outputName ? standard.outputName.trim() : ''

      // ✅ Get indicator name - find from filteredVerbs if it's an ID
      let indicatorNamePart = ''
      if (standard.indicatorName) {
        if (typeof standard.indicatorName === 'number' || !isNaN(standard.indicatorName)) {
          // It's an ID, find the name from filteredVerbs
          const foundVerb = officeLibraryIndicatorStore.verbs.find(
            (v) => v.id === standard.indicatorName,
          )
          indicatorNamePart = foundVerb?.indicator_name || foundVerb?.name || ''
        } else {
          // It's already a name
          indicatorNamePart = standard.indicatorName.trim()
        }
      }

      const effectivenessPart = getEffectivenessComponent(index)
      const timelinessPart = getTimelinessComponent(index)

      let parts = []

      if (quantityPart) parts.push(quantityPart)
      if (outputNamePart) parts.push(outputNamePart)
      if (indicatorNamePart) parts.push(indicatorNamePart)
      if (effectivenessPart) parts.push(effectivenessPart)
      if (timelinessPart) parts.push(timelinessPart)

      standard.successIndicator = parts.filter((p) => p).join(' ')

      console.log(
        `✅ Success Indicator updated for Standard ${index + 1}:  `,
        standard.successIndicator,
      )
    }

    // Watch for changes - Deep watch all performance standard properties
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

    // Handle updates to quantity
    const onQuantityUpdate = (row, field, index) => {
      sanitizeNumericInput(row, field)
      generateSuccessIndicator(index)
    }

    // Handle updates to timeliness
    const onTimelinessUpdate = (row, field, index) => {
      sanitizeNumericInput(row, field)
      generateSuccessIndicator(index)
    }

    // Handle updates to effectiveness
    const onEffectivenessUpdate = (row, index) => {
      checkEffectivenessValidity(index)
      generateSuccessIndicator(index)
    }

    // Watch for organizational selection changes
    watch([() => form.value.division, () => form.value.section, () => form.value.unit], () => {
      filterEmployees()
    })

    // Change handlers
    const onDivisionChange = () => {
      form.value.section = null
      form.value.unit = null
    }

    const onSectionChange = () => {
      form.value.unit = null
    }

    // Effectiveness validation
    const checkEffectivenessValidity = () => {
      formInteracted.value = true
    }

    const onEffectivenessFieldFocus = () => {
      formInteracted.value = true
    }

    // Input validation helpers
    const blockInvalidChars = (e) => {
      const allowedKeys = [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '-',
        'Backspace',
        'Delete',
        'Tab',
        'ArrowLeft',
        'ArrowRight',
      ]

      if (!allowedKeys.includes(e.key) && !e.ctrlKey) {
        e.preventDefault()
      }
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
      if (!val) return 'Value required'

      if (!val.includes('-')) {
        return !isNaN(val) || 'Must be a number'
      }

      const parts = val.split('-')
      if (parts.length !== 2 || parts.some((p) => !p)) return 'Use format:  min-max'

      const min = Number(parts[0])
      const max = Number(parts[1])

      if (isNaN(min) || isNaN(max)) return 'Both must be numbers'
      if (min >= max) return 'Min must be less than max'

      return true
    }

    // Timeliness and Quantity option handling
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
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return

      standard.quantityIndicatorType = value
      currentStandardIndex.value = index

      if (value === 'B') {
        quantityValue.value = null
        showQuantityModal.value = true
      } else if (value === 'C') {
        computeQuantities()
      } else if (value === 'numeric') {
        standard.standardOutcomeRows.forEach((row) => {
          row.quantity = ''
        })
        generateSuccessIndicator(index)
      }
    }

    const computeQuantities = () => {
      const index = currentStandardIndex.value
      const standard = currentEmployee.value.performanceStandards[index]
      if (!standard) return

      if (
        standard.quantityIndicatorType === 'B' &&
        (!quantityValue.value || isNaN(quantityValue.value))
      ) {
        $q.notify({
          message: 'Please enter a valid number',
          color: 'negative',
          position: 'top',
        })
        return
      }

      standard.standardOutcomeRows.forEach((row) => {
        row.quantity = ''
      })

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
      const standard = currentEmployee.value.performanceStandards[index]
      if (standard) {
        standard.quantityIndicatorType = 'numeric'
      }
      showQuantityModal.value = false
    }

    // Performance standards management
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
        message: `Are you sure you want to remove Performance Standard ${index + 1}?`,
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

    const onSubmit = () => {
      shouldValidate.value = true
      formInteracted.value = true

      const invalidEmployees = []

      employeeTabs.value.forEach((emp, empIndex) => {
        if (!emp.employeeId) {
          invalidEmployees.push(`Employee ${empIndex + 1}`)
          return
        }

        if (emp.id === activeEmployeeTab.value) {
          const invalidStandards = emp.performanceStandards
            .map((_, i) => i)
            .filter((index) => !hasMinimumEffectivenessValues(index))

          if (invalidStandards.length > 0) {
            invalidEmployees.push(
              `${emp.name || 'Employee ' + (empIndex + 1)} (Standards ${invalidStandards.map((i) => i + 1).join(', ')})`,
            )
          }
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

      // Prepare submission data
      const submissionData = {
        uwpData: uwpData.value,
        form: form.value,
        employees: employeeTabs.value,
        timestamp: new Date().toISOString(),
      }

      console.log('📊 Submitting UWP Data:', submissionData)

      $q.notify({
        message: 'Unit Work Plan submitted successfully',
        color: 'positive',
        icon: 'check_circle',
      })

      // You can send this data to your API here
      // Example: await api.post('/uwp/submit', submissionData)
    }

    // onMounted hook
    onMounted(async () => {
      console.log('🚀 UWP Page mounted, initializing. .')

      initializeUWPData()
      initializeEmployeeTabs()

      // Get officeId from hierarchy
      const officeId = uwpData.value.hierarchy.office?.id || 1

      try {
        // ✅ Fetch MFO data
        await officeLibraryStore.fetchAllData(officeId)
        console.log('✅ MFO Data loaded from store')
        console.log('Categories:', officeLibraryStore.categories)
        console.log('MFOs:', officeLibraryStore.mfos)
        console.log('Outputs:', officeLibraryStore.outputs)

        // ✅ Fetch Performance Indicators/Verbs
        await officeLibraryIndicatorStore.fetchVerbs()
        console.log('✅ Performance Indicators loaded:', officeLibraryIndicatorStore.verbs)
      } catch (error) {
        console.error('❌ Error loading data:', error)
        $q.notify({
          message: 'Failed to load data',
          color: 'negative',
          position: 'top',
        })
      }

      form.value.semester = semesterOptions[0]

      console.log('✅ UWP Page initialization complete')
    })

    return {
      // UWP Data
      uwpData,
      breadcrumbDisplay,
      selectedNodeLabel,
      hierarchyLabels,

      // Form data
      form,
      divisionOptions,
      filteredSections,
      filteredUnits,
      semesterOptions,
      yearOptions,
      filteredEmployees,
      selectedEmployee,

      // Employee tabs
      employeeTabs,
      activeEmployeeTab,
      currentEmployee,
      addEmployeeTab,
      removeEmployeeTab,
      switchToEmployee,
      onEmployeeSelected,
      maxVisibleTabs,
      visibleEmployeeTabs,
      overflowEmployeeTabs,
      hasOverflowTabs,
      getEmployeeIndex,

      // Validation states
      formInteracted,
      shouldValidate,
      hasMinimumEffectivenessValues,
      getEffectivenessErrorCount,
      isFormValid,

      // Computed helpers
      hasOrganizationalSelection,
      allEmployeesSelected,
      availableEmployeesForTab,
      getSelectedEmployeeIds,

      // MFO and Competencies data
      skipMfo,
      categoryOptions,
      getFilteredMfoOptions,
      getFilteredOutputOptions,
      mergedCoreCompetency,
      mergedTechnicalCompetency,
      mergedLeadershipCompetency,
      hasMfosForCategory,
      // Filtering methods
      filterMfos,
      filterOutputs,

      // Filtered options
      filteredMfoOptions,
      filteredOutputOptions,

      // ✅ Performance Indicators Data
      filterPerformanceIndicators,
      filteredVerbs,
      performanceIndicatorOptions,

      // Standard Outcome data
      standardOutcomeColumns,
      showQuantityModal,
      quantityValue,
      currentStandardIndex,
      quantityIndicator,

      // Performance Standards
      addPerformanceStandard,
      removePerformanceStandard,

      // Auto-generation method
      generateSuccessIndicator,

      // Methods
      filterEmployees,
      onDivisionChange,
      onSectionChange,
      clearDependentFields,
      blockInvalidChars,
      sanitizeNumericInput,
      validateStrictNumeric,
      computeQuantities,
      cancelQuantityInput,
      checkEffectivenessValidity,
      onEffectivenessFieldFocus,
      onQuantityOptionSelect,
      onTimelinessTypeSelect,
      applyTimelinessInputs,
      onSubmit,

      // Update handlers for auto-generation
      onQuantityUpdate,
      onTimelinessUpdate,
      onEffectivenessUpdate,

      onBack,
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

.competency-list div {
  padding: 4px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
