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
            <!-- Left Side: Division, Section, Unit -->
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
                  label="Sub-Office"
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

            <!-- Right Side: Semester, Year -->
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
                      <q-avatar
                        :color="getEmployeeBadgeColor(scope.opt)"
                        text-color="white"
                        size="sm"
                      >
                        {{ (scope.opt.label || 'U').charAt(0).toUpperCase() }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ scope.opt.label || 'Unnamed Employee' }}
                        <q-badge
                          v-if="isHeadPosition(scope.opt.job_title || scope.opt.position)"
                          color="green"
                          class="q-ml-xs"
                          label="Head"
                        />
                      </q-item-label>
                      <q-item-label caption lines="1">
                        {{ scope.opt.position || scope.opt.rank || 'No position' }}
                      </q-item-label>
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
                                    @update:model-value="
                                      (value) => {
                                        clearDependentFields(index, 2)
                                      }
                                    "
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
                                  <!-- Core Competencies -->
                                  <div class="col-md-4">
                                    <q-card flat bordered class="full-height">
                                      <q-card-section class="q-pa-sm">
                                        <div class="row items-center justify-between">
                                          <div class="text-caption text-weight-medium">
                                            Core (Auto-populated)
                                          </div>
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
                                    @update:model-value="
                                      (value) => {
                                        generateSuccessIndicator(index)
                                        // Cascade logic still runs but modal is hidden
                                        if (value && value.length > 0) {
                                          checkAndShowCascadeModal(index)
                                        }
                                      }
                                    "
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
                                  <div v-if="standard.quantityIndicatorType === 'numeric'">
                                    <q-input
                                      v-model="props.row.quantity"
                                      dense
                                      outlined
                                      placeholder="Enter target"
                                      :rules="[validateStrictNumeric]"
                                      @keydown="blockInvalidChars"
                                      @update:model-value="
                                        onQuantityUpdate(props.row, 'quantity', index)
                                      "
                                      :hint="getQuantityHint(standard, index)"
                                      :error="isQuantityExceeded(standard, props.row, index)"
                                      :error-message="getQuantityErrorMessage(standard, index)"
                                    />
                                  </div>
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
          <div v-if="currentQuantityRestriction" class="text-caption text-red-9 q-mt-xs">
            Max allowed: {{ currentQuantityRestriction.maxQuantity || 'Unlimited' }}
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
            @click="() => computeQuantities('B')"
            :disable="quantityExceedsMax"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Cascade Data Modal - Commented Out (Hidden but functionality remains) -->
    <!--
    <q-dialog v-model="showCascadeModal" persistent>
      <q-card style="min-width: 500px; max-width: 600px; border-radius: 8px">
        <q-card-section class="modal-header">
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6">Guide Instruction</div>
              <div class="text-caption3 text-red-9">
                Base your target on whats available in this MFO
              </div>
            </div>

            <q-btn flat round dense icon="close" v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="modal-body">
          <div v-if="cascadeData" class="q-gutter-md">
            <div class="text-subtitle1 text-weight-bold">MFO: {{ cascadeData.mfo }}</div>

            <div v-if="cascadeData.output" class="text-subtitle2 text-grey-8">
              Output: {{ cascadeData.output }}
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-4">
                <q-card flat bordered class="text-center">
                  <q-card-section>
                    <div class="text-caption text-grey-7">Total Target</div>
                    <div class="text-h5 text-primary">{{ cascadeData.total_target }}</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-4">
                <q-card flat bordered class="text-center">
                  <q-card-section>
                    <div class="text-caption text-grey-7">Claimed</div>
                    <div class="text-h5 text-secondary">{{ cascadeData.claimed }}</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-4">
                <q-card flat bordered class="text-center">
                  <q-card-section>
                    <div class="text-caption text-grey-7">Available</div>
                    <div
                      class="text-h5"
                      :class="cascadeData.available > 0 ? 'text-positive' : 'text-negative'"
                    >
                      {{ cascadeData.available }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div v-if="cascadeData.quantityRestriction" class="q-mt-md">
              <q-banner class="bg-info text-white" dense>
                <template v-slot:avatar>
                  <q-icon name="info" />
                </template>
                {{ cascadeData.quantityRestriction.message }}
              </q-banner>
            </div>
          </div>
          <div v-else class="text-center text-grey-7">No cascade data available</div>
        </q-card-section>

        <q-card-actions align="right" class="modal-actions q-pa-md">
          <q-btn label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    -->

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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { useMfoStore } from 'src/stores/office/officeLibrary'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useUnitWorkPlanStore } from 'src/stores/office/unitWorkPlanStore'
import { useCompetencyStore } from 'src/stores/competencyStore'
import { useCascadeStore } from 'src/stores/cascadeStore'
import { useQuantityRestriction } from 'src/composables/useQuantityRestriction'

export default {
  name: 'UnitWorkPlan',
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const officeLibraryStore = useMfoStore()
    const officeLibraryIndicatorStore = useLibraryStore()
    const uwpStore = useUnitWorkPlanStore()
    const competencyStore = useCompetencyStore()
    const cascadeStore = useCascadeStore()

    // Initialize the quantity restriction composable
    const { determineRestriction } = useQuantityRestriction()

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
    const currentQuantityRestriction = ref(null)
    const quantityExceedsMax = computed(() => {
      if (!currentQuantityRestriction.value?.maxQuantity) return false
      return quantityValue.value > currentQuantityRestriction.value.maxQuantity
    })

    // Cascade Modal Refs (keep but won't show modal)
    const showCascadeModal = ref(false)
    const cascadeData = ref(null)

    // Competency Modal Refs
    const showCompetencyModal = ref(false)
    const competencyType = ref('core')
    const currentStandardIndexForCompetency = ref(0)
    const selectedCompetency = ref(null)
    const selectedLevel = ref(null)
    const filteredCompetencyOptions = ref([])
    const showCompetencyError = ref([])

    // Multiple competency selection refs
    const competencySelections = ref([{ selectedCompetency: null, selectedLevel: null }])
    const filteredCompetencyOptionsByRow = ref([])

    // Auto-selection flag to prevent multiple initializations
    const autoSelectionPerformed = ref(false)
    const autoSelectionAttempts = ref(0)
    const MAX_AUTO_SELECTION_ATTEMPTS = 5

    // Head position titles for auto-selection - based on your data showing "SECTION HEAD" in designation field
    const HEAD_POSITION_TITLES = [
      'section head',
      'division head',
      'unit head',
      'office head',
      'group head',
      'sub-office head',
      'section-head',
      'division-head',
      'unit-head',
      'office-head',
      'group-head',
      'sub-office-head',
    ]

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
      const requiredLevel = selectedCompetency.value.requiredLevel
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
      { label: 'Quantity (A. Custom Target)', value: 'numeric' },
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
      quantityRestriction: null,
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

    // Helper to check if position is a head position - UPDATED to check designation field first
    const isHeadPosition = (employee) => {
      if (!employee) return false

      // Based on your console logs, the job title is in 'designation' field
      const designation = (employee.designation || employee.employeeData?.designation || '')
        .toLowerCase()
        .trim()

      // Check designation first (primary source)
      if (designation && HEAD_POSITION_TITLES.some((title) => designation.includes(title))) {
        return true
      }

      // Fallback to other fields
      const otherFields = (
        employee.job_title ||
        employee.jobTitle ||
        employee.position ||
        employee.rank ||
        employee.employeeData?.job_title ||
        employee.employeeData?.position ||
        ''
      )
        .toLowerCase()
        .trim()

      return HEAD_POSITION_TITLES.some((title) => otherFields.includes(title))
    }

    // Helper to get badge color based on position
    const getEmployeeBadgeColor = (employee) => {
      return isHeadPosition(employee) ? 'green' : 'primary'
    }

    const initializeUWPData = () => {
      try {
        const stored = sessionStorage.getItem('uwpData')
        if (stored) {
          const parsed = JSON.parse(stored)
          uwpData.value = parsed
          console.log('UWP Data initialized:', parsed)
        }
      } catch (error) {
        console.error('❌ Failed to parse UWP data:', error)
      }
    }

    const initializeEmployeeTabs = () => {
      console.log('Initializing employee tabs...')
      const defaultEmp = createDefaultEmployeeData()
      employeeTabs.value = [defaultEmp]
      activeEmployeeTab.value = defaultEmp.id
      console.log('Default tab created')
    }

    // Auto-select head employees from the available employees - UPDATED to check designation field
    const autoSelectHeadEmployees = () => {
      console.log('🔄 Auto-selection triggered - Attempt:', autoSelectionAttempts.value + 1)

      if (autoSelectionPerformed.value) {
        console.log('✅ Auto-selection already performed, skipping')
        return
      }

      if (
        !uwpData.value.employeesWithoutTargetPeriod ||
        uwpData.value.employeesWithoutTargetPeriod.length === 0
      ) {
        console.log('❌ No employees available for auto-selection')

        if (autoSelectionAttempts.value < MAX_AUTO_SELECTION_ATTEMPTS) {
          autoSelectionAttempts.value++
          setTimeout(() => {
            console.log(
              `⏳ Retrying auto-selection (Attempt ${autoSelectionAttempts.value + 1})...`,
            )
            autoSelectHeadEmployees()
          }, 500)
        }
        return
      }

      console.log('📊 Available employees:', uwpData.value.employeesWithoutTargetPeriod.length)

      // Debug: Log all employees and their designation fields
      uwpData.value.employeesWithoutTargetPeriod.forEach((emp, idx) => {
        console.log(`Employee ${idx + 1}:`, {
          name: emp.label || emp.name,
          designation: emp.designation, // This is the key field!
          employeeData_designation: emp.employeeData?.designation,
          job_title: emp.job_title,
          position: emp.position,
          rank: emp.rank,
        })
      })

      // Find head employees among available employees - check designation FIRST
      const headEmployees = uwpData.value.employeesWithoutTargetPeriod.filter((emp) => {
        // Check designation field (primary - from your logs)
        const designation = (emp.designation || emp.employeeData?.designation || '')
          .toLowerCase()
          .trim()

        // Check other fields as fallback
        const otherFields = (
          emp.job_title ||
          emp.jobTitle ||
          emp.position ||
          emp.rank ||
          emp.employeeData?.job_title ||
          emp.employeeData?.position ||
          ''
        )
          .toLowerCase()
          .trim()

        const isHead = HEAD_POSITION_TITLES.some(
          (title) => designation.includes(title) || otherFields.includes(title),
        )

        if (isHead) {
          console.log(
            `✅ Head employee found: ${emp.label || emp.name} - Designation: ${designation}`,
          )
        }

        return isHead
      })

      console.log(
        `🎯 Found ${headEmployees.length} head employees:`,
        headEmployees.map((e) => ({
          name: e.label || e.name,
          designation: e.designation,
        })),
      )

      if (headEmployees.length === 0) {
        console.log('⚠️ No head employees found for auto-selection')
        autoSelectionPerformed.value = true
        return
      }

      // Clear the default empty tab if it exists
      if (employeeTabs.value.length === 1 && !employeeTabs.value[0].employeeId) {
        employeeTabs.value = []
      }

      // Create tabs for each head employee
      headEmployees.forEach((headEmp, index) => {
        console.log(`Creating tab for head employee ${index + 1}:`, headEmp.label || headEmp.name)

        const employeeData = createDefaultEmployeeData()
        employeeData.name = headEmp.label || headEmp.name || ''
        employeeData.employeeId = headEmp.id
        employeeData.employeeData = headEmp
        employeeData.rank = headEmp.rank || headEmp.employment_type || ''
        employeeData.position = headEmp.designation || headEmp.position || '' // Use designation as position
        employeeData.sg = headEmp.salary_grade || headEmp.sg || headEmp.SG || ''
        employeeData.level = headEmp.employeeStatus || headEmp.level || ''

        employeeTabs.value.push(employeeData)

        // Auto-populate core competencies
        if (employeeData.sg && employeeData.level) {
          employeeData.performanceStandards.forEach((standard) => {
            autoPopulateCoreCompetencies(standard, employeeData.sg, employeeData.level)
          })
        }
      })

      // Set active tab to the first head employee
      if (employeeTabs.value.length > 0) {
        activeEmployeeTab.value = employeeTabs.value[0].id
      }

      autoSelectionPerformed.value = true

      $q.notify({
        message: `Automatically selected ${headEmployees.length} head employee(s)`,
        color: 'info',
        position: 'top',
        timeout: 3000,
      })

      console.log('✅ Auto-selection completed. Total tabs:', employeeTabs.value.length)
    }

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
    }

    // Computed properties
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

    const competencyOptions = computed(() => {
      if (!currentEmployee.value?.sg || !currentEmployee.value?.level) {
        return []
      }

      const sg = currentEmployee.value.sg
      const competencyRow = competencyStore.getBySG(sg)

      if (!competencyRow) return []

      const typeCompetencies = competencyData[competencyType.value] || []

      return typeCompetencies
        .filter((comp) => {
          const competencyLevel = competencyRow[comp.code]
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

        const allStandardsValid = emp.performanceStandards.every((standard) => {
          if (!standard.standardOutcomeRows) return false
          const filledEffectivenessValues = standard.standardOutcomeRows.filter(
            (row) => row.effectiveness && row.effectiveness.trim().length > 0,
          ).length
          if (filledEffectivenessValues < 2) return false

          const { core, technical, leadership } = standard.competencies
          const totalCompetencies =
            (core?.length || 0) + (technical?.length || 0) + (leadership?.length || 0)

          return totalCompetencies >= 1
        })

        return allStandardsValid
      })

      return hasTargetPeriod && allEmployeesValid
    })

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

    const getQuantityHint = (standard) => {
      if (standard.quantityRestriction?.maxQuantity) {
        return `Max: ${standard.quantityRestriction.maxQuantity}`
      }
      return ''
    }

    const isQuantityExceeded = (standard, row) => {
      if (standard.quantityIndicatorType !== 'numeric') return false
      if (!standard.quantityRestriction?.maxQuantity) return false

      const value = parseInt(row.quantity)
      if (isNaN(value)) return false

      return value > standard.quantityRestriction.maxQuantity
    }

    const getQuantityErrorMessage = (standard) => {
      if (standard.quantityRestriction?.maxQuantity) {
        return `Cannot exceed ${standard.quantityRestriction.maxQuantity}`
      }
      return ''
    }

    // Cascade Modal Method - Use Office Head when no supervisories
    const checkAndShowCascadeModal = async (standardIndex) => {
      const standard = currentEmployee.value.performanceStandards[standardIndex]

      if (!standard) {
        console.log('Standard not found')
        return
      }

      if (!standard.rows.mfo) {
        $q.notify({
          message: 'Please select an MFO first',
          color: 'warning',
          position: 'top',
          timeout: 3000,
        })
        return
      }

      if (!standard.indicatorName || standard.indicatorName.length === 0) {
        console.log('No performance indicators selected')
        return
      }

      const mfoId = standard.rows.mfo
      const selectedMfo = officeLibraryStore.mfos.find((m) => m.id === mfoId)
      const mfoValue = selectedMfo?.name || mfoId

      const loadingNotif = $q.notify({
        message: 'Loading cascade data...',
        color: 'info',
        position: 'top',
        timeout: 0,
        spinner: true,
        group: false,
      })

      try {
        const semester = uwpData.value.targetPeriod?.semester
        const year = uwpData.value.targetPeriod?.year

        if (!semester || !year) {
          throw new Error('Semester and year are required')
        }

        await cascadeStore.fetchCascade(semester, year, mfoValue)
        const fetchedData = cascadeStore.cascadeData

        if (!fetchedData) {
          throw new Error('No cascade data found')
        }

        const indicatorIds = Array.isArray(standard.indicatorName) ? standard.indicatorName : []
        const matchedMfo = fetchedData.mfos?.find(
          (mfo) => mfo.mfo === selectedMfo?.name || mfo.mfo === mfoValue,
        )

        const indicatorNames = indicatorIds.map((id) => {
          const verb = officeLibraryIndicatorStore.verbs.find((v) => v.id === Number(id))
          return verb?.indicator_name || verb?.name || id
        })

        // Determine which supervisor to use for restriction
        let supervisorToUse = null

        // Priority 1: Check if employee has their own supervisorySignatory
        if (currentEmployee.value.supervisorySignatory) {
          supervisorToUse = currentEmployee.value.supervisorySignatory
          console.log("Using employee's supervisory signatory:", supervisorToUse)
        }
        // Priority 2: If no employee supervisor, check if cascade has supervisories array with data
        else if (fetchedData.supervisories && fetchedData.supervisories.length > 0) {
          supervisorToUse = fetchedData.supervisories[0]
          console.log('Using first supervisor from cascade:', supervisorToUse)
        }
        // Priority 3: If no supervisors at all, use the Office Head from the main cascade response
        else {
          // Use the main cascade person (Office Head) as the supervisor reference
          // IMPORTANT: Include the mfos array from fetchedData
          supervisorToUse = {
            name: fetchedData.name,
            rank: fetchedData.rank,
            job_title: fetchedData.job_title,
            office: fetchedData.office,
            controlNo: fetchedData.controlNo,
            mfos: fetchedData.mfos || [], // Include MFOs for category checking
            // Calculate total available from all MFOs
            available:
              fetchedData.mfos?.reduce((total, mfo) => total + (mfo.available || 0), 0) || 0,
          }
          console.log('No supervisors found, using Office Head as reference:', supervisorToUse)

          $q.notify({
            message: `Using Office Head (${fetchedData.name}) as reference for quantity restriction`,
            color: 'info',
            position: 'top',
            timeout: 5000,
            icon: 'info',
          })
        }

        // Create employee object for restriction calculation with the determined supervisor
        const employeeForRestriction = {
          ...currentEmployee.value,
          supervisorySignatory: supervisorToUse,
        }

        // Calculate restriction using the determined supervisor
        const restriction = determineRestriction({
          selectedEmployee: employeeForRestriction,
          selectedIndicators: standard.indicatorName,
          quantityType: standard.quantityIndicatorType,
          verbs: officeLibraryIndicatorStore.verbs,
          cascadeData: fetchedData,
        })

        // Assign the restriction to the standard
        standard.quantityRestriction = restriction

        // Prepare cascade data
        cascadeData.value = {
          controlNo: fetchedData.controlNo,
          name: fetchedData.name,
          rank: fetchedData.rank,
          job_title: fetchedData.job_title,
          office: fetchedData.office,
          year: fetchedData.year || year,
          semester: fetchedData.semester || semester,
          mfo: selectedMfo?.name,
          output: standard.rows.output
            ? officeLibraryStore.outputs.find((o) => o.id === standard.rows.output)?.name
            : null,
          output_name: standard.outputName || matchedMfo?.output_name || '',
          performance_indicator: indicatorNames,
          success_indicator: matchedMfo?.success_indicator || standard.successIndicator || '',
          total_target: matchedMfo?.total_target || 0,
          claimed: matchedMfo?.claimed || 0,
          available: matchedMfo?.available || 0,
          quantityRestriction: standard.quantityRestriction,
          supervisorUsed: supervisorToUse,
        }

        if (loadingNotif) {
          loadingNotif()
        }

        // Show appropriate notification
        if (!currentEmployee.value.supervisorySignatory) {
          if (fetchedData.supervisories && fetchedData.supervisories.length > 0) {
            $q.notify({
              message: `Using ${fetchedData.supervisories[0].name} as reference for quantity restriction`,
              color: 'info',
              position: 'top',
              timeout: 4000,
            })
          } else {
            $q.notify({
              message: `Using Office Head (${fetchedData.name}) as reference for quantity restriction`,
              color: 'info',
              position: 'top',
              timeout: 4000,
            })
          }
        }

        $q.notify({
          message: 'Cascade data loaded successfully',
          color: 'positive',
          position: 'top',
          timeout: 2000,
        })

        console.log('Quantity restriction applied:', restriction)
      } catch (error) {
        if (loadingNotif) {
          loadingNotif()
        }

        console.error('Error fetching cascade data:', error)

        $q.notify({
          message: error.message || 'Failed to load cascade data',
          color: 'negative',
          position: 'top',
        })
      }
    }

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

    const getAvailableCompetencies = (rowIndex) => {
      const selectedCodes = competencySelections.value
        .map((sel, idx) =>
          idx !== rowIndex && sel.selectedCompetency ? sel.selectedCompetency.code : null,
        )
        .filter(Boolean)

      const options = filteredCompetencyOptionsByRow.value[rowIndex] || competencyOptions.value
      return options.filter((comp) => !selectedCodes.includes(comp.code))
    }

    const addCompetencyRow = () => {
      competencySelections.value.push({ selectedCompetency: null, selectedLevel: null })
      filteredCompetencyOptionsByRow.value.push(competencyOptions.value)
    }

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

      if (selectedEmp && activeEmployeeTab.value) {
        const tabIndex = employeeTabs.value.findIndex((emp) => emp.id === activeEmployeeTab.value)
        if (tabIndex !== -1) {
          employeeTabs.value[tabIndex].name = selectedEmp.label || selectedEmp.name || ''
          employeeTabs.value[tabIndex].employeeId = selectedEmp.id
          employeeTabs.value[tabIndex].employeeData = selectedEmp
          employeeTabs.value[tabIndex].rank = selectedEmp.rank || selectedEmp.employment_type || ''
          employeeTabs.value[tabIndex].position =
            selectedEmp.designation || selectedEmp.position || '' // Use designation
          employeeTabs.value[tabIndex].sg =
            selectedEmp.salary_grade || selectedEmp.sg || selectedEmp.SG || ''
          employeeTabs.value[tabIndex].level = selectedEmp.employeeStatus || selectedEmp.level || ''

          if (employeeTabs.value[tabIndex].performanceStandards) {
            employeeTabs.value[tabIndex].performanceStandards.forEach((standard) => {
              autoPopulateCoreCompetencies(
                standard,
                employeeTabs.value[tabIndex].sg,
                employeeTabs.value[tabIndex].level,
              )
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
            const position = (emp.designation || emp.position || emp.rank || '').toLowerCase()
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
        const row5 = standard.standardOutcomeRows.find((row) => row.rating === '5')
        return row5?.quantity || ''
      }

      if (standard.quantityIndicatorType === 'B') {
        return standard.targetOutputValue?.toString() || ''
      }

      if (standard.quantityIndicatorType === 'C') {
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

      const standard = currentEmployee.value.performanceStandards[index]
      if (standard.quantityRestriction?.maxQuantity) {
        const value = parseInt(row.quantity)
        if (!isNaN(value) && value > standard.quantityRestriction.maxQuantity) {
          $q.notify({
            message: `Quantity cannot exceed ${standard.quantityRestriction.maxQuantity}`,
            color: 'warning',
            position: 'top',
            timeout: 3000,
          })
        }
      }

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

      standard.standardOutcomeRows.forEach((row) => {
        row.timelinessRange = ''
        row.timelinessDate = ''
        row.timelinessText = ''
        row.timeliness = ''

        if (!standard.activeTimelinessInputs.range) row.timelinessRange = ''
        if (!standard.activeTimelinessInputs.date) row.timelinessDate = ''
        if (!standard.activeTimelinessInputs.description) row.timelinessText = ''

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
        currentQuantityRestriction.value = standard.quantityRestriction
        showQuantityModal.value = true
        standard.standardOutcomeRows.forEach((row) => (row.quantity = ''))
      } else if (value === 'C') {
        computeQuantities('C', index)
      } else {
        standard.targetOutputValue = null
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

        // Check restriction for rating 5 field
        if (
          standard.quantityRestriction?.maxQuantity &&
          quantityValue.value > standard.quantityRestriction.maxQuantity
        ) {
          $q.notify({
            message: `Target output cannot exceed ${standard.quantityRestriction.maxQuantity}`,
            color: 'warning',
            position: 'top',
          })
          return
        }

        const base = Number(quantityValue.value)
        standard.targetOutputValue = base.toString()

        // Calculate the ranges based on the base value
        const max130 = Math.round(base * 1.3)
        const max115 = Math.round(base * 1.15)
        const max50 = Math.round(base * 0.5)

        // Check if any of the calculated values exceed the restriction
        if (standard.quantityRestriction?.maxQuantity) {
          const maxAllowed = standard.quantityRestriction.maxQuantity

          // For rating 5, we want to show "X and above" where X is the maxAllowed if base exceeds it
          if (max130 > maxAllowed) {
            standard.standardOutcomeRows[0].quantity = `${maxAllowed} and above`
          } else {
            standard.standardOutcomeRows[0].quantity = `${max130} and above`
          }

          // For other ratings, ensure they don't exceed maxAllowed
          const adjusted115to129Max = Math.min(max130 - 1, maxAllowed)
          const adjusted115to129Min = Math.min(max115, maxAllowed)

          const adjusted100to114Max = Math.min(max115 - 1, maxAllowed)
          const adjusted100to114Min = Math.min(base, maxAllowed)

          const adjusted51to99Max = Math.min(base - 1, maxAllowed)
          const adjusted51to99Min = Math.min(max50 + 1, maxAllowed)

          const adjusted50Max = Math.min(max50, maxAllowed)

          standard.standardOutcomeRows[0].quantity = `${adjusted115to129Min} and above`
          standard.standardOutcomeRows[1].quantity =
            adjusted115to129Min < adjusted115to129Max
              ? `${adjusted115to129Min}-${adjusted115to129Max}`
              : `${adjusted115to129Min}`
          standard.standardOutcomeRows[2].quantity =
            adjusted100to114Min < adjusted100to114Max
              ? `${adjusted100to114Min}-${adjusted100to114Max}`
              : `${adjusted100to114Min}`
          standard.standardOutcomeRows[3].quantity =
            adjusted51to99Min < adjusted51to99Max
              ? `${adjusted51to99Min}-${adjusted51to99Max}`
              : `${adjusted51to99Min}`
          standard.standardOutcomeRows[4].quantity = `${adjusted50Max} and below`
        } else {
          // No restriction - use original calculation
          standard.standardOutcomeRows[0].quantity = `${max130} and above`
          standard.standardOutcomeRows[1].quantity = `${max115}-${max130 - 1}`
          standard.standardOutcomeRows[2].quantity = `${base}-${max115 - 1}`
          standard.standardOutcomeRows[3].quantity = `${max50 + 1}-${base - 1}`
          standard.standardOutcomeRows[4].quantity = `${max50} and below`
        }

        generateSuccessIndicator(idx)

        $q.notify({
          message: 'Quantities calculated successfully for Type B',
          color: 'positive',
          position: 'top',
        })

        showQuantityModal.value = false
        quantityValue.value = null
        currentQuantityRestriction.value = null
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
      currentQuantityRestriction.value = null
    }

    const addPerformanceStandard = () => {
      const newStandard = createDefaultPerformanceStandard()

      if (currentEmployee.value?.sg && currentEmployee.value?.level) {
        autoPopulateCoreCompetencies(
          newStandard,
          currentEmployee.value.sg,
          currentEmployee.value.level,
        )
      }

      currentEmployee.value.performanceStandards.push(newStandard)
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

            const { core, technical, leadership } = standard.competencies
            const totalCompetencies =
              (core?.length || 0) + (technical?.length || 0) + (leadership?.length || 0)

            if (totalCompetencies < 1) {
              errors.push('requires at least 1 competency')
            }

            if (
              standard.quantityIndicatorType === 'B' &&
              standard.quantityRestriction?.maxQuantity
            ) {
              const targetValue = parseFloat(standard.targetOutputValue)
              if (!isNaN(targetValue) && targetValue > standard.quantityRestriction.maxQuantity) {
                errors.push(
                  `quantity exceeds max allowed (${standard.quantityRestriction.maxQuantity})`,
                )
              }
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
                  quantityRestriction: standard.quantityRestriction,
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

    // Watch for when employeesWithoutTargetPeriod is loaded to trigger auto-selection
    watch(
      () => uwpData.value.employeesWithoutTargetPeriod,
      (newEmployees) => {
        console.log(
          '👀 Watch triggered - employeesWithoutTargetPeriod changed:',
          newEmployees ? newEmployees.length : 0,
        )

        if (newEmployees && newEmployees.length > 0 && !autoSelectionPerformed.value) {
          console.log('📦 Employees data loaded, triggering auto-selection')
          nextTick(() => {
            autoSelectHeadEmployees()
          })
        }
      },
      {
        deep: true,
        immediate: true,
      },
    )

    // Also watch for uwpData itself to be fully loaded
    watch(
      () => uwpData.value,
      (newVal) => {
        console.log('👀 UWP Data changed:', {
          hasEmployees: !!newVal.employeesWithoutTargetPeriod,
          employeeCount: newVal.employeesWithoutTargetPeriod?.length,
        })

        if (newVal.employeesWithoutTargetPeriod?.length > 0 && !autoSelectionPerformed.value) {
          console.log('📦 UWP Data fully loaded, triggering auto-selection')
          nextTick(() => {
            autoSelectHeadEmployees()
          })
        }
      },
      { deep: true, immediate: true },
    )

    // Lifecycle
    onMounted(async () => {
      console.log('🚀 Component mounted')
      initializeUWPData()
      initializeEmployeeTabs()
      const officeId = uwpData.value.hierarchy.office?.id || 1

      try {
        await Promise.all([
          officeLibraryStore.fetchAllData(officeId),
          officeLibraryIndicatorStore.fetchVerbs(),
        ])

        console.log('✅ Data loaded successfully')

        if (uwpData.value.employeesWithoutTargetPeriod?.length > 0) {
          console.log('📦 Employee data already available')
          autoSelectHeadEmployees()
        }
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
      currentQuantityRestriction,
      quantityExceedsMax,

      // Cascade Modal Data - Keep refs but modal is commented out in template
      showCascadeModal,
      cascadeData,

      // Competency Modal Data
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

      // Helper functions
      isHeadPosition,
      getEmployeeBadgeColor,

      // Methods
      addEmployeeTab,
      removeEmployeeTab,
      switchToEmployee,
      onEmployeeSelected,
      getEmployeeIndex,
      getSelectedEmployeeIds,
      hasMinimumEffectivenessValues,
      hasMinimumCompetencies,
      hasOrganizationalSelection: computed(
        () =>
          form.value.division !== null || form.value.section !== null || form.value.unit !== null,
      ),
      isSupportCategory,
      getFilteredMfoOptions,
      getFilteredOutputOptions,
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
      getQuantityHint,
      isQuantityExceeded,
      getQuantityErrorMessage,

      // Cascade Methods - Keep the function but modal is hidden
      checkAndShowCascadeModal,

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

.bg-info {
  background-color: #1976d2;
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
