<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="q-pa-md">
    <!-- Top Header Row -->
    <div class="row items-center justify-between q-mb-md q-pl-lg q-pr-lg">
      <div class="column items-start">
        <h1 class="text-h6 q-mb-none">UNIT WORK PLAN - {{ selectedNodeLabel }}</h1>
        <p class="text-grey-7 q-mt-xs">{{ breadcrumbDisplay }}</p>
        <p class="text-caption text-grey-6 q-mt-xs">
          Available Employees:
          <strong>{{ uwpData.employeesWithoutTargetPeriod?.length || 0 }}</strong>
          <span v-if="employeeTabs.length > 0" class="q-ml-md">
            Selected: <strong>{{ getSelectedEmployeeIds().length }}</strong>
          </span>
          <span v-if="cascadeDomino.headEmployee" class="q-ml-md text-positive">
            Head: <strong>{{ cascadeDomino.headEmployee.name }}</strong>
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
            <!-- Left Side -->
            <div class="col-12 col-md-6">
              <div class="column q-gutter-sm">
                <q-input
                  v-model="uwpData.targetPeriod.semester"
                  readonly
                  label="Semester"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="calendar_view_month" size="xs" />
                  </template>
                </q-input>
                <q-separator />
                <q-input v-model="hierarchyLabels.office" label="Office" outlined dense readonly>
                  <template v-slot:prepend><q-icon name="account_balance" size="xs" /></template>
                </q-input>
                <q-input
                  v-model="hierarchyLabels.office2"
                  label="Sub-Office"
                  outlined
                  dense
                  readonly
                >
                  <template v-slot:prepend><q-icon name="business" size="xs" /></template>
                </q-input>
                <q-input v-model="hierarchyLabels.group" label="Group" outlined dense readonly>
                  <template v-slot:prepend><q-icon name="group_work" size="xs" /></template>
                </q-input>
              </div>
            </div>
            <!-- Right Side -->
            <div class="col-12 col-md-6">
              <div class="column q-gutter-sm">
                <q-input v-model="uwpData.targetPeriod.year" readonly label="Year" outlined dense>
                  <template v-slot:prepend><q-icon name="event" size="xs" /></template>
                </q-input>
                <q-separator />
                <q-input
                  v-model="hierarchyLabels.division"
                  label="Division"
                  outlined
                  dense
                  readonly
                >
                  <template v-slot:prepend><q-icon name="business" size="xs" /></template>
                </q-input>
                <q-input v-model="hierarchyLabels.section" label="Section" outlined dense readonly>
                  <template v-slot:prepend><q-icon name="account_tree" size="xs" /></template>
                </q-input>
                <q-input v-model="hierarchyLabels.unit" label="Unit" outlined dense readonly>
                  <template v-slot:prepend><q-icon name="layers" size="xs" /></template>
                </q-input>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Head employee notice banner -->
      <q-banner
        v-if="showHeadBanner"
        class="q-mt-sm text-white"
        style="background-color: #1565c0; border-radius: 6px"
        dense
      >
        <template v-slot:avatar><q-icon name="info" color="white" /></template>
        <span class="text-caption">
          <strong>Notice:</strong> The supervisor/head employee must complete and save their
          performance targets first before adding other employees to this work plan.
        </span>
      </q-banner>
    </div>

    <!-- Employee Information Card -->
    <div class="col-12">
      <q-card flat bordered>
        <!-- Employee Tabs Row -->
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
            <q-tab
              v-for="(employee, index) in visibleEmployeeTabs"
              :key="employee.id"
              :name="employee.id"
              :label="`Employee ${index + 1}${employee.name ? ':  ' + employee.name : ''}`"
              @click="switchToEmployee(employee.id)"
            >
              <q-badge v-if="cascadeDomino.isHead(employee.id)" color="green" floating>
                HEAD
              </q-badge>
            </q-tab>

            <!-- Overflow menu -->
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
                      <q-item-label>
                        {{ emp.name || `Employee ${getEmployeeIndex(emp.id) + 1}` }}
                        <q-badge v-if="cascadeDomino.isHead(emp.id)" color="green">HEAD</q-badge>
                      </q-item-label>
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
            :disable="allEmployeesSelected || isAddEmployeeDisabled"
            aria-label="Add Employee"
          >
            <q-tooltip v-if="allEmployeesSelected">All employees already selected</q-tooltip>
            <q-tooltip v-else-if="isAddEmployeeDisabled">
              The head employee must set their performance targets before adding other employees
            </q-tooltip>
          </q-btn>
        </div>

        <q-card-section class="q-pa-sm">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle2">Employee Information</div>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="removeEmployeeTab(activeEmployeeTab)"
              :disable="employeeTabs.length <= 1 || cascadeDomino.isHead(activeEmployeeTab)"
              aria-label="Remove Employee"
            >
              <q-tooltip v-if="cascadeDomino.isHead(activeEmployeeTab)">
                Cannot remove head employee
              </q-tooltip>
              <q-tooltip v-else>Remove this employee</q-tooltip>
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
                :disable="cascadeDomino.isHead(currentEmployee.id) && employeeTabs.length > 1"
              >
                <template v-slot:prepend><q-icon name="person" size="xs" /></template>
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
                          v-if="isHeadPosition(scope.opt)"
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
                    <template v-slot:prepend><q-icon name="military_tech" size="xs" /></template>
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
                    <template v-slot:prepend><q-icon name="work" size="xs" /></template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="selectedEmployee.sg" label="SG" outlined dense readonly>
                    <template v-slot:prepend><q-icon name="work" size="xs" /></template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="selectedEmployee.level" label="Level" outlined dense readonly>
                    <template v-slot:prepend><q-icon name="work" size="xs" /></template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Standards Section -->
          <div v-if="currentEmployee.employeeId" class="q-mt-md">
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
                        <q-badge
                          v-if="
                            !cascadeDomino.isHead(currentEmployee.id) &&
                            standard.quantityRestriction
                          "
                          color="info"
                          class="q-mr-sm"
                        >
                          Restricted
                        </q-badge>
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
                          aria-label="Remove"
                        />
                      </div>
                    </div>
                  </q-card-section>

                  <q-slide-transition>
                    <div v-show="standard.expanded">
                      <q-separator />
                      <q-card-section class="q-pa-sm">
                        <!-- MFO Details + Competencies row -->
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

                                  <!-- MFO Select -->
                                  <!-- Non-Office-Head employees only see MFOs the Office Head
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
                                          {{
                                            isFetchingHeadMfos && !isCurrentEmployeeOfficeHead
                                              ? 'Loading MFOs from Office Head plan…'
                                              : getMfoNoOptionMessage(index)
                                          }}
                                        </q-item-section>
                                      </q-item>
                                    </template>
                                  </q-select>

                                  <!-- ============================================================
                                       OUTPUT SELECT
                                       - Office Head + non-support category (A or B) → HIDDEN
                                         (Office Head owns the MFO-level target; output granularity
                                          is not required at this level)
                                       - Office Head + support category (C)           → SHOWN,
                                         filtered unique per standard
                                       - All other employees                           → ALWAYS SHOWN
                                       ============================================================ -->
                                  <q-select
                                    v-if="shouldShowOutput(standard)"
                                    outlined
                                    dense
                                    v-model="standard.rows.output"
                                    label="Select Output"
                                    :options="getAvailableOutputOptions(index)"
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
                                            v-for="(comp, compIndex) in standard.competencies.core"
                                            :key="'core-' + index + '-' + compIndex"
                                            class="competency-item q-pb-xs"
                                          >
                                            <div class="text-caption">
                                              {{ comp.code }} - {{ comp.value }} ({{ comp.level }})
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
                                            await checkAndShowCascadeModal(index)
                                          } else {
                                            std.quantityRestriction = null
                                          }
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

                                    <!-- Before Deadline -->
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

                                    <!-- On Deadline -->
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
                                    <q-tooltip>
                                      At least 2 effectiveness values are required
                                    </q-tooltip>
                                  </q-icon>
                                </q-th>
                              </template>

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
        :disable="!isFormValid || uwpStore.loading || uwpStore.saving"
        :loading="uwpStore.saving"
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
import { useCascadeDomino } from 'src/composables/useCascadeDomino'
import { useMFOHeadStore } from 'src/stores/mfoHeadStore'

export default {
  name: 'UnitWorkPlan',

  setup() {
    // ===========================================================================
    // 1. PLUGIN & STORE INSTANCES
    // ===========================================================================
    const $q = useQuasar()
    const router = useRouter()
    const officeLibraryStore = useMfoStore()
    const officeLibraryIndicatorStore = useLibraryStore()
    const uwpStore = useUnitWorkPlanStore()
    const competencyStore = useCompetencyStore()
    const cascadeStore = useCascadeStore()
    const quantityRestriction = useQuantityRestriction()
    const mfoHeadStore = useMFOHeadStore()

    // ===========================================================================
    // 2. CONSTANTS
    // ===========================================================================

    /** Job titles that identify supervisory/head positions */
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

    /** Maximum employee tabs visible before overflow menu */
    const MAX_VISIBLE_TABS = 3

    /** Maximum retry attempts for auto head-employee selection */
    const MAX_AUTO_SELECTION_ATTEMPTS = 5

    /** Static competency definitions per type */
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

    /** Level label → numeric value map */
    const LEVEL_MAP = {
      Basic: { label: 'Basic', value: '1' },
      Intermediate: { label: 'Intermediate', value: '2' },
      Advanced: { label: 'Advanced', value: '3' },
      Superior: { label: 'Superior', value: '4' },
    }

    /** Table column definitions for Standard Outcome */
    const STANDARD_OUTCOME_COLUMNS = [
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

    /** Quantity indicator type options */
    const QUANTITY_INDICATOR_OPTIONS = [
      { label: 'Quantity (A. Custom Target)', value: 'numeric' },
      { label: 'Quantity (B. Can exceed 100%)', value: 'B' },
      { label: 'Quantity (C. Cannot exceed 100%)', value: 'C' },
    ]

    // ===========================================================================
    // 3. REACTIVE STATE
    // ===========================================================================

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

    const form = ref({
      unit: null,
      section: null,
      division: null,
      semester: null,
      year: new Date().getFullYear(),
    })

    // Employee tab management
    const employeeTabs = ref([])
    const activeEmployeeTab = ref(null)
    const maxVisibleTabs = ref(MAX_VISIBLE_TABS)
    const isLoadingFilteredEmployees = ref(false)

    // Validation flags
    const formInteracted = ref(false)
    const shouldValidate = ref(false)

    // Auto-selection state
    const autoSelectionPerformed = ref(false)
    const autoSelectionAttempts = ref(0)

    // Filtered option caches
    const filteredMfoOptions = ref({})
    const filteredOutputOptions = ref({})
    const filteredVerbs = ref([])
    const filteredEmployees = ref([])

    // Head MFO filter — names of MFOs the Office Head has set in their plan.
    // Non-Office-Head employees may only pick from this list (per category).
    // Populated by fetchHeadMfos() after the head employee tab is resolved.
    const headMfoNames = ref(new Set())
    const isFetchingHeadMfos = ref(false)

    // Quantity modal state
    const showQuantityModal = ref(false)
    const quantityValue = ref(null)
    const currentStandardIndex = ref(0)
    const currentQuantityRestriction = ref(null)

    // Cascade modal state (hidden but logic retained)
    const showCascadeModal = ref(false)
    const cascadeData = ref(null)

    // Competency modal state
    const showCompetencyModal = ref(false)
    const competencyType = ref('core')
    const currentStandardIndexForCompetency = ref(0)
    const selectedCompetency = ref(null)
    const selectedLevel = ref(null)
    const filteredCompetencyOptions = ref([])
    const showCompetencyError = ref([])
    const competencySelections = ref([{ selectedCompetency: null, selectedLevel: null }])
    const filteredCompetencyOptionsByRow = ref([])

    // ===========================================================================
    // 4. COMPOSABLE INITIALIZATION
    // ===========================================================================

    const cascadeDomino = useCascadeDomino({
      uwpStore,
      officeLibraryIndicatorStore,
      quantityRestriction,
      uwpData,
      employeeTabs,
      activeEmployeeTab,
      cascadeData,
      autoApply: true,
      debug: process.env.NODE_ENV === 'development',
    })

    // ===========================================================================
    // 5. FACTORY FUNCTIONS
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
      timelinessInputs: { range: false, date: false, description: true },
      activeTimelinessInputs: { range: false, date: false, description: true },
      competencies: { core: [], technical: [], leadership: [] },
      standardOutcomeRows: createDefaultStandardRows(),
      quantityRestriction: null,
      targetOutputValue: null,
      // Pool metadata — set by checkAndShowCascadeModal for claim tracking
      _signatoryControlNo: null,
      _mfoValue: null,
      _outputName: null,
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
    // 6. HELPER / UTILITY FUNCTIONS
    // ===========================================================================

    const isHeadPosition = (employee) => {
      if (!employee) return false
      const jobTitle = (
        employee.job_title ||
        employee.jobTitle ||
        employee.employeeData?.job_title ||
        ''
      )
        .toLowerCase()
        .trim()
      return HEAD_POSITION_TITLES.some((title) => jobTitle.includes(title))
    }

    const getEmployeeBadgeColor = (employee) => (isHeadPosition(employee) ? 'green' : 'primary')
    const getEmployeeName = (e) =>
      e?.label || e?.name || e?.employeeData?.name || 'Unnamed Employee'
    const getEmployeePosition = (e) =>
      e?.position || e?.rank || e?.employeeData?.position || 'No position'
    const getEmployeeInitial = (e) => getEmployeeName(e).charAt(0).toUpperCase()
    const getEmployeeIndex = (id) => employeeTabs.value.findIndex((e) => e.id === id)
    const getSelectedEmployeeIds = () =>
      employeeTabs.value.filter((e) => e.employeeId !== null).map((e) => e.employeeId)

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

    // ===========================================================================
    // 7. OFFICE HEAD DETECTION — per active employee tab
    // ===========================================================================

    /**
     * True ONLY when the currently active employee tab has job_title === 'office head'
     * (exact, case-insensitive match).
     *
     * Section heads, division heads, unit heads, etc. are intentionally excluded —
     * only the Office Head sits at the cascade root and targets at the MFO level
     * without needing an output selection.
     */
    const isCurrentEmployeeOfficeHead = computed(() => {
      const tab = employeeTabs.value.find((e) => e.id === activeEmployeeTab.value)
      if (!tab) return false

      const jobTitle = (
        tab.employeeData?.job_title ||
        tab.employeeData?.jobTitle ||
        tab.job_title ||
        tab.jobTitle ||
        ''
      )
        .toLowerCase()
        .trim()

      return jobTitle === 'office head'
    })

    /**
     * Whether the Output select should be rendered for a given standard.
     *
     * Rules (mirrors Edit modal's shouldShowOutput):
     *   - Office Head + non-support category (A or B) → HIDDEN
     *     Office Heads target at the MFO level; output is not required.
     *   - Office Head + support category (C)          → SHOWN
     *     Support outputs are still relevant even for heads.
     *   - All other employees                         → ALWAYS SHOWN
     */
    const shouldShowOutput = (standard) => {
      if (!isCurrentEmployeeOfficeHead.value) return true
      return isSupportCategory(standard.rows.category)
    }

    // ===========================================================================
    // 8. HEAD EMPLOYEE COMPUTED
    // ===========================================================================

    /**
     * True when the current employee tab is the root/head employee
     * (i.e. cascadeDomino marks them as head).
     */
    const isCurrentEmployeeHead = computed(() => {
      return cascadeDomino.isHead(activeEmployeeTab.value)
    })

    // ===========================================================================
    // 9. SUPERVISOR RESOLUTION
    // ===========================================================================

    /**
     * Resolve the supervisory signatory for an employee from cascade data.
     *
     * LOGIC:
     *   WITH mfoValue + outputName:
     *     1. Find controlNo in supervisories[].
     *        - Does that supervisory have matching MFO+output? YES → use them.
     *        - NO or not found → fall back to Office Head (root).
     *
     *   WITH mfoValue only (no output):
     *     → Use Office Head (root).
     *
     *   NO mfoValue:
     *     → Use the employee's stored supervisorySignatory directly.
     */
    const calculateSupervisorySignatory = (
      employee,
      cascadeDataSource = null,
      mfoValue = null,
      outputName = null,
    ) => {
      const source = cascadeDataSource || cascadeStore.cascadeData
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

      console.log('[UWP] Resolving signatory for:', employee?.label || employee?.name, {
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
          const supHasMfoOutput = (knownSup.mfos || []).some(
            (m) =>
              normalise(m.mfo) === normalise(mfoValue) &&
              normalise(m.output) === normalise(outputName),
          )
          if (supHasMfoOutput) {
            console.log('[UWP] ✅ Known supervisor has matching MFO+output:', knownSup.name)
            return fromSup(knownSup)
          }
          console.log(
            '[UWP] Known supervisor does NOT have this MFO+output → falling back to Office Head',
            { supervisor: knownSup.name, mfoValue, outputName },
          )
          return fromRoot()
        }
        console.log('[UWP] controlNo not in supervisories[] → using Office Head')
        return fromRoot()
      }

      console.log('[UWP] No output selected → using Office Head')
      return fromRoot()
    }

    // ===========================================================================
    // 10. COMPUTED PROPERTIES
    // ===========================================================================

    const semesterOptions = computed(() => uwpStore.getSemesterOptions)
    const yearOptions = computed(() => uwpStore.getYearOptions)

    const breadcrumbDisplay = computed(() =>
      !uwpData.value.breadcrumb?.length
        ? 'Organization Structure'
        : uwpData.value.breadcrumb.join(' / '),
    )

    const selectedNodeLabel = computed(() => uwpData.value.selectedNodeLabel || 'Work Plan')

    const hierarchyLabels = computed(() => ({
      office: uwpData.value.hierarchy.office?.label || '',
      office2: uwpData.value.hierarchy.office2?.label || '',
      group: uwpData.value.hierarchy.group?.label || '',
      division: uwpData.value.hierarchy.division?.label || '',
      section: uwpData.value.hierarchy.section?.label || '',
      unit: uwpData.value.hierarchy.unit?.label || '',
    }))

    const currentEmployee = computed(() => {
      const active = employeeTabs.value.find((emp) => emp.id === activeEmployeeTab.value)
      return active || employeeTabs.value[0] || createDefaultEmployeeData()
    })

    const selectedEmployee = computed(() => {
      const tab = employeeTabs.value.find((emp) => emp.id === activeEmployeeTab.value)
      if (!tab?.employeeId) return { rank: '', position: '', sg: '', level: '' }
      return {
        rank: tab.rank || '',
        position: tab.position || '',
        sg: tab.sg || '',
        level: tab.level || '',
      }
    })

    const visibleEmployeeTabs = computed(() => employeeTabs.value.slice(0, maxVisibleTabs.value))
    const overflowEmployeeTabs = computed(() => employeeTabs.value.slice(maxVisibleTabs.value))
    const hasOverflowTabs = computed(() => employeeTabs.value.length > maxVisibleTabs.value)

    const allEmployeesSelected = computed(() => {
      const available = uwpData.value.employeesWithoutTargetPeriod || []
      if (!available.length) return false
      return getSelectedEmployeeIds().length >= available.length
    })

    const isAddEmployeeDisabled = computed(() =>
      (uwpData.value.employeesWithoutTargetPeriod || []).some((emp) => isHeadPosition(emp)),
    )

    const showHeadBanner = computed(() =>
      (uwpData.value.employeesWithoutTargetPeriod || []).some((emp) => isHeadPosition(emp)),
    )

    const availableEmployeesForTab = computed(() => {
      const all = uwpData.value.employeesWithoutTargetPeriod || []
      const seen = new Set()
      const unique = all.filter((emp) => {
        if (!emp.id || seen.has(emp.id)) return false
        seen.add(emp.id)
        return true
      })
      const selectedIds = getSelectedEmployeeIds()
      const currentTabEmpId = employeeTabs.value.find(
        (e) => e.id === activeEmployeeTab.value,
      )?.employeeId
      return unique.filter((emp) => !selectedIds.includes(emp.id) || emp.id === currentTabEmpId)
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
      const { sg } = currentEmployee.value || {}
      if (!sg) return []
      const competencyRow = competencyStore.getBySG(sg)
      if (!competencyRow) return []
      return (COMPETENCY_DEFINITIONS[competencyType.value] || [])
        .filter((comp) => {
          const level = competencyRow[comp.code]
          return level && level !== '-'
        })
        .map((comp) => ({
          code: comp.code,
          description: comp.description,
          label: `${comp.code} - ${comp.description}`,
          requiredLevel: competencyRow[comp.code],
        }))
    })

    const levelOptions = computed(() => {
      if (!selectedCompetency.value) return []
      const rl = selectedCompetency.value.requiredLevel
      return rl && LEVEL_MAP[rl] ? [LEVEL_MAP[rl]] : []
    })

    const isAnyCompetencyValid = computed(() =>
      competencySelections.value.some((c) => c.selectedCompetency && c.selectedLevel),
    )

    const isFormValid = computed(() => {
      if (!employeeTabs.value.length) return false
      if (!uwpData.value.targetPeriod?.semester || !uwpData.value.targetPeriod?.year) return false
      return employeeTabs.value.every((emp) => {
        if (!emp.employeeId) return false
        return emp.performanceStandards.every((std) => {
          const filledEffectiveness =
            std.standardOutcomeRows?.filter((r) => r.effectiveness?.trim().length > 0).length || 0
          if (filledEffectiveness < 2) return false
          const { core = [], technical = [], leadership = [] } = std.competencies
          return core.length + technical.length + leadership.length >= 1
        })
      })
    })

    const quantityExceedsMax = computed(() => {
      const max = currentQuantityRestriction.value?.maxQuantity
      if (max == null) return false
      return quantityValue.value > max
    })

    const hasOrganizationalSelection = computed(
      () => form.value.division !== null || form.value.section !== null || form.value.unit !== null,
    )

    // ===========================================================================
    // 11. OUTPUT UNIQUENESS
    // ===========================================================================

    /**
     * Returns the set of output IDs already used by OTHER performance standards
     * in the SAME MFO for the current employee tab.
     */
    const getUsedOutputIdsForMfo = (currentStandardIndex) => {
      const standards = currentEmployee.value?.performanceStandards
      if (!standards) return new Set()
      const currentStd = standards[currentStandardIndex]
      if (!currentStd?.rows?.mfo) return new Set()

      const used = new Set()
      standards.forEach((std, idx) => {
        if (idx === currentStandardIndex) return
        if (!std?.rows?.mfo || !std?.rows?.output) return
        if (std.rows.mfo === currentStd.rows.mfo) {
          used.add(std.rows.output)
        }
      })
      return used
    }

    /**
     * Returns output options filtered to exclude outputs already used in other
     * performance standards with the same MFO.
     */
    const getAvailableOutputOptions = (index) => {
      const allOptions = getFilteredOutputOptions(index)
      const usedIds = getUsedOutputIdsForMfo(index)
      if (!usedIds.size) return allOptions

      const currentStd = currentEmployee.value.performanceStandards[index]
      return allOptions.filter(
        (opt) => !usedIds.has(opt.value) || opt.value === currentStd?.rows?.output,
      )
    }

    /**
     * Returns an appropriate "no option" message for the output dropdown.
     */
    const getOutputNoOptionMessage = (index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std?.rows?.category) return 'Select a category first'

      const allOptions = getFilteredOutputOptions(index)
      const usedIds = getUsedOutputIdsForMfo(index)

      if (allOptions.length === 0) return 'No outputs found matching your search'
      if (allOptions.every((opt) => usedIds.has(opt.value))) {
        return 'All outputs for this MFO are already used in other performance standards'
      }
      return 'No outputs found matching your search'
    }

    /**
     * Returns an appropriate "no option" message for the MFO dropdown.
     */
    const getMfoNoOptionMessage = (index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std?.rows?.category) return 'Select a category first'
      return 'No MFOs found matching your search'
    }

    // ===========================================================================
    // 11b. HEAD MFO FETCH
    // ===========================================================================

    /**
     * Fetches the Office Head's existing performance standards via useMFOHeadStore
     * and builds headMfoNames — a Set of lowercased MFO name strings.
     *
     * Non-Office-Head employees' MFO dropdowns are restricted to this set so they
     * can only select MFOs that the Office Head has already planned.
     *
     * IMPORTANT: The Office Head is often NOT in employeesWithoutTargetPeriod because
     * they already have a target period. We therefore use a 3-strategy lookup:
     *   1. A tab if one exists (Office Head is new this period)
     *   2. uwpData.availableEmployees — full list before the "no target period" filter
     *   3. uwpData.hierarchy.office — last resort; server scopes by office_id anyway
     */
    const fetchHeadMfos = async () => {
      const semester = uwpData.value.targetPeriod?.semester
      const year = uwpData.value.targetPeriod?.year
      if (!semester || !year) return

      // ── Strategy 1: Office Head already in a tab (new this period) ───────────
      let empData = null
      const headTab = employeeTabs.value.find((tab) => {
        const jt = (
          tab.employeeData?.job_title ||
          tab.employeeData?.jobTitle ||
          tab.job_title ||
          tab.jobTitle ||
          ''
        )
          .toLowerCase()
          .trim()
        return jt === 'office head'
      })
      if (headTab?.employeeData) {
        empData = headTab.employeeData
        console.log('[UWP] fetchHeadMfos: using Office Head from tab:', empData.name)
      }

      // ── Strategy 2: Find Office Head in the full available-employees list ────
      // availableEmployees contains ALL employees including those who already have
      // a target period and therefore don't appear in employeesWithoutTargetPeriod.
      if (!empData) {
        const allEmployees = [
          ...(uwpData.value.availableEmployees || []),
          ...(uwpData.value.employeesWithoutTargetPeriod || []),
        ]
        const headEmp = allEmployees.find(
          (emp) => (emp.job_title || emp.jobTitle || '').toLowerCase().trim() === 'office head',
        )
        if (headEmp) {
          empData = headEmp
          console.log('[UWP] fetchHeadMfos: using Office Head from employee list:', empData.name)
        }
      }

      // ── Strategy 3: Derive from uwpData hierarchy (office-scoped fallback) ───
      // Even without a concrete employee record the server can find the head by
      // office_id + semester + year.
      if (!empData) {
        const officeNode = uwpData.value.hierarchy?.office
        if (officeNode) {
          empData = {
            ControlNo: null,
            name: officeNode.label || '',
            office: officeNode.label || '',
            job_title: 'Office Head',
            office_id: officeNode.id || null,
          }
          console.log('[UWP] fetchHeadMfos: using office hierarchy fallback:', empData.office)
        }
      }

      if (!empData) {
        console.warn('[UWP] fetchHeadMfos: cannot resolve Office Head — skipping')
        return
      }

      const payload = {
        employee: {
          ControlNo: empData.ControlNo || empData.control_no || empData.id || null,
          name: empData.name || empData.label || '',
          office: empData.office || empData.office_name || empData.label || '',
          job_title: empData.job_title || empData.jobTitle || 'Office Head',
          office_id: empData.office_id || empData.officeId || null,
        },
      }

      console.log('[UWP] fetchHeadMfos payload:', payload)

      isFetchingHeadMfos.value = true
      try {
        const result = await mfoHeadStore.fetchMFOHead(semester, year, payload)
        // API returns { target_period: { performance_standards: [{ mfo, ... }] } }
        const standards =
          result?.target_period?.performance_standards || result?.performance_standards || []
        headMfoNames.value = new Set(
          standards.map((ps) => (ps.mfo || '').trim().toLowerCase()).filter(Boolean),
        )
        console.log('[UWP] headMfoNames loaded:', [...headMfoNames.value])
      } catch (err) {
        console.error('[UWP] fetchHeadMfos error:', err)
        // On failure leave headMfoNames empty — MFO list falls back to full library
        headMfoNames.value = new Set()
      } finally {
        isFetchingHeadMfos.value = false
      }
    }

    // ===========================================================================
    // 12. INITIALIZATION METHODS
    // ===========================================================================

    const initializeUWPData = () => {
      try {
        const stored = sessionStorage.getItem('uwpData')
        if (stored) {
          uwpData.value = JSON.parse(stored)
          console.log('[UWP] Data initialized from sessionStorage')
        }
      } catch (error) {
        console.error('[UWP] Failed to parse sessionStorage data:', error)
      }
    }

    const initializeEmployeeTabs = () => {
      const defaultEmp = createDefaultEmployeeData()
      employeeTabs.value = [defaultEmp]
      activeEmployeeTab.value = defaultEmp.id
    }

    // ===========================================================================
    // 13. AUTO-SELECTION — HEAD EMPLOYEE
    // ===========================================================================

    const autoSelectHeadEmployees = () => {
      if (autoSelectionPerformed.value) return

      const available = uwpData.value.employeesWithoutTargetPeriod || []
      if (!available.length) {
        if (autoSelectionAttempts.value < MAX_AUTO_SELECTION_ATTEMPTS) {
          autoSelectionAttempts.value++
          setTimeout(autoSelectHeadEmployees, 500)
        }
        return
      }

      const headEmployees = available.filter((emp) => isHeadPosition(emp))
      if (!headEmployees.length) {
        autoSelectionPerformed.value = true
        return
      }

      if (employeeTabs.value.length === 1 && !employeeTabs.value[0].employeeId) {
        employeeTabs.value = []
      }

      headEmployees.forEach((headEmp) => {
        const employeeData = createDefaultEmployeeData()
        Object.assign(employeeData, {
          name: headEmp.label || headEmp.name || '',
          employeeId: headEmp.id,
          employeeData: headEmp,
          rank: headEmp.rank || headEmp.employment_type || '',
          position: headEmp.designation || headEmp.position || '',
          sg: headEmp.salary_grade || headEmp.sg || headEmp.SG || '',
          level: headEmp.employeeStatus || headEmp.level || '',
          supervisorySignatory: calculateSupervisorySignatory(headEmp),
        })

        if (employeeData.sg && employeeData.level) {
          employeeData.performanceStandards.forEach((std) =>
            autoPopulateCoreCompetencies(std, employeeData.sg, employeeData.level),
          )
        }

        employeeTabs.value.push(employeeData)
      })

      activeEmployeeTab.value = employeeTabs.value[0]?.id
      autoSelectionPerformed.value = true

      $q.notify({
        message: `Automatically selected ${headEmployees.length} head employee(s)`,
        color: 'info',
        position: 'top',
        timeout: 3000,
      })
    }

    // ===========================================================================
    // 14. COMPETENCY METHODS
    // ===========================================================================

    const autoPopulateCoreCompetencies = (standard, sg, level) => {
      if (!sg || !level) return
      const row = competencyStore.getBySG(sg)
      if (!row) return
      standard.competencies.core = COMPETENCY_DEFINITIONS.core
        .filter((comp) => {
          const rl = row[comp.code]
          return rl && rl !== '-'
        })
        .map((comp) => ({
          code: comp.code,
          description: comp.description,
          value: LEVEL_MAP[row[comp.code]]?.value || '1',
          level: row[comp.code],
        }))
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
      filteredCompetencyOptionsByRow.value = [competencyOptions.value]
      showCompetencyModal.value = true
    }

    const filterCompetencies = (val, update, rowIndex) => {
      if (typeof update !== 'function') return
      update(() => {
        const needle = (val || '').toLowerCase()
        filteredCompetencyOptionsByRow.value[rowIndex] = competencyOptions.value.filter(
          (c) =>
            c.code.toLowerCase().includes(needle) || c.description.toLowerCase().includes(needle),
        )
      })
    }

    const getAvailableCompetencies = (rowIndex) => {
      const taken = competencySelections.value
        .map((sel, i) =>
          i !== rowIndex && sel.selectedCompetency ? sel.selectedCompetency.code : null,
        )
        .filter(Boolean)
      const options = filteredCompetencyOptionsByRow.value[rowIndex] || competencyOptions.value
      return options.filter((c) => !taken.includes(c.code))
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

      if (added) {
        $q.notify({
          message: `${added} competenc${added > 1 ? 'ies' : 'y'} added`,
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

    const cancelCompetencySelection = () => {
      showCompetencyModal.value = false
      competencySelections.value = [{ selectedCompetency: null, selectedLevel: null }]
      filteredCompetencyOptionsByRow.value = [competencyOptions.value]
    }

    const validateCompetencies = (standardIndex) => {
      const std = currentEmployee.value.performanceStandards[standardIndex]
      if (!std) return
      const { core = [], technical = [], leadership = [] } = std.competencies
      showCompetencyError.value[standardIndex] =
        core.length + technical.length + leadership.length === 0
    }

    // ===========================================================================
    // 15. MFO / OUTPUT FILTER METHODS
    // ===========================================================================

    /**
     * Build the MFO option list for a given standard index.
     *
     * Office Head     → full list for the selected category (no restriction).
     * Everyone else   → restricted to MFOs that appear in the Office Head's plan
     *                   (headMfoNames Set).  Falls back to the full list when
     *                   headMfoNames is empty (e.g. fetch failed or not yet loaded).
     */
    const getFilteredMfoOptions = (index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std?.rows.category) return []

      const baseList =
        filteredMfoOptions.value[index] ||
        officeLibraryStore.mfos
          .filter((m) => m.f_category_id === std.rows.category)
          .map((m) => ({
            id: m.id,
            label: m.name,
            value: m.id,
            name: m.name,
            code: m.code || '',
            description: m.description || '',
          }))

      // Office Head sees everything; apply head-MFO filter only for other employees
      if (isCurrentEmployeeOfficeHead.value || headMfoNames.value.size === 0) {
        return baseList
      }

      return baseList.filter((m) => headMfoNames.value.has((m.name || '').trim().toLowerCase()))
    }

    const getFilteredOutputOptions = (index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std?.rows.category) return []
      const categoryId = std.rows.category

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

      if (!officeLibraryStore.outputs?.length) return []
      return officeLibraryStore.outputs
        .filter(
          (o) =>
            o.f_category_id === categoryId &&
            (std.rows.mfo ? o.mfo_id === std.rows.mfo : o.mfo_id === null),
        )
        .map((o) => ({
          id: o.id,
          label: o.name,
          value: o.id,
          name: o.name,
          code: o.code || '',
          description: o.description || '',
        }))
    }

    const filterMfos = (val, update, index) => {
      if (typeof update !== 'function') return
      update(() => {
        const needle = (val || '').toLowerCase()
        const std = currentEmployee.value.performanceStandards[index]
        if (!std?.rows.category) {
          filteredMfoOptions.value[index] = []
          return
        }

        let baseList = officeLibraryStore.mfos
          .filter((m) => m.f_category_id === std.rows.category)
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
          baseList = baseList.filter((m) =>
            headMfoNames.value.has((m.name || '').trim().toLowerCase()),
          )
        }

        filteredMfoOptions.value[index] = needle
          ? baseList.filter(
              (m) =>
                m.label.toLowerCase().includes(needle) ||
                m.code.toLowerCase().includes(needle) ||
                m.description.toLowerCase().includes(needle),
            )
          : baseList
      })
    }

    const filterOutputs = (val, update, index) => {
      if (typeof update !== 'function') return
      update(() => {
        const needle = (val || '').toLowerCase()
        const std = currentEmployee.value.performanceStandards[index]
        if (!std?.rows.category) {
          filteredOutputOptions.value[index] = []
          return
        }

        const baseOptions = getAvailableOutputOptions(index)
        filteredOutputOptions.value[index] = baseOptions.filter(
          (o) =>
            o.label.toLowerCase().includes(needle) ||
            o.code.toLowerCase().includes(needle) ||
            o.description.toLowerCase().includes(needle),
        )
      })
    }

    const clearDependentFields = (standardIndex, fieldIndex) => {
      const std = currentEmployee.value.performanceStandards[standardIndex]
      if (!std) return
      if (fieldIndex === 1) {
        std.rows.mfo = null
        std.rows.output = null
        filteredMfoOptions.value[standardIndex] = null
        filteredOutputOptions.value[standardIndex] = null
      } else if (fieldIndex === 2) {
        std.rows.output = null
        filteredOutputOptions.value[standardIndex] = null
      }
    }

    // ===========================================================================
    // 16. PERFORMANCE INDICATOR FILTER
    // ===========================================================================

    const filterPerformanceIndicators = (val, update) => {
      const mapVerb = (verb) => ({
        id: verb.id,
        label: verb.indicator_name || verb.name,
        value: verb.id,
        name: verb.indicator_name || verb.name,
        description: verb.description || '',
      })
      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()
          filteredVerbs.value = officeLibraryIndicatorStore.verbs
            .map(mapVerb)
            .filter(
              (v) =>
                v.label.toLowerCase().includes(needle) ||
                v.description.toLowerCase().includes(needle),
            )
        })
      } else {
        filteredVerbs.value = officeLibraryIndicatorStore.verbs.map(mapVerb)
      }
    }

    // ===========================================================================
    // 17. SUCCESS INDICATOR GENERATION
    // ===========================================================================

    const getQuantityComponent = (index) => {
      const std = currentEmployee.value?.performanceStandards?.[index]
      if (!std) return ''
      if (std.quantityIndicatorType === 'numeric')
        return std.standardOutcomeRows.find((r) => r.rating === '5')?.quantity || ''
      if (std.quantityIndicatorType === 'B') return std.targetOutputValue?.toString() || ''
      if (std.quantityIndicatorType === 'C') return '100%'
      return ''
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

    const getEffectivenessComponent = (index) => {
      const std = currentEmployee.value.performanceStandards[index]
      return std?.standardOutcomeRows.find((r) => r.rating === '5')?.effectiveness || ''
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

        const effectivenessPart = getEffectivenessComponent(i)
        const timelinessPart = getTimelinessComponent(i)

        std.successIndicator = [
          qtyPart,
          outputPart,
          indicatorPart,
          effectivenessPart,
          timelinessPart,
        ]
          .filter((p) => p?.trim())
          .join(' ')
      })
    }

    // ===========================================================================
    // 18. VALIDATION HELPERS
    // ===========================================================================

    const hasMinimumEffectivenessValues = (index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std) return false
      return std.standardOutcomeRows.filter((r) => r.effectiveness?.trim().length > 0).length >= 2
    }

    const hasMinimumCompetencies = (employee, standardIndex) => {
      const std = employee?.performanceStandards?.[standardIndex]
      if (!std?.competencies) return false
      const { core = [], technical = [], leadership = [] } = std.competencies
      return core.length + technical.length + leadership.length >= 1
    }

    const validateStrictNumeric = (val) => {
      if (!val) return true
      return /^[0-9]+(-[0-9]+)?$/.test(val) || 'Enter a number or range (e.g., 10 or 10-20)'
    }

    const blockInvalidChars = (e) => {
      const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '-']
      if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) e.preventDefault()
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
    // 19. CASCADE DATA & RESTRICTION LOGIC
    // ===========================================================================

    /**
     * Fetches cascade data for the given standard, resolves the supervisor,
     * and applies quantity restriction to the standard.
     *
     * NOTE: Office Head employees are the CASCADE ROOT — they own the total targets
     * and no restriction is applied to them. Skip entirely for Office Head tabs.
     */
    const checkAndShowCascadeModal = async (standardIndex) => {
      // Office Head is the cascade root — no restriction applies to them.
      if (isCurrentEmployeeOfficeHead.value) return

      const standard = currentEmployee.value.performanceStandards[standardIndex]
      if (!standard?.rows.mfo || !standard.indicatorName?.length) return

      const mfoId = standard.rows.mfo
      const outputId = standard.rows.output

      const selectedMfo = officeLibraryStore.mfos.find((m) => m.id === mfoId)
      const mfoValue = selectedMfo?.name || String(mfoId)

      const selectedOutput = outputId
        ? officeLibraryStore.outputs?.find((o) => o.id === outputId) ||
          officeLibraryStore.category_outputs?.find((o) => o.id === outputId)
        : null
      const outputName = selectedOutput?.name || null

      const semester = uwpData.value.targetPeriod?.semester
      const year = uwpData.value.targetPeriod?.year
      if (!semester || !year) return

      const loadingNotif = $q.notify({
        message: 'Loading cascade data…',
        color: 'info',
        position: 'top',
        timeout: 0,
        spinner: true,
        group: false,
      })

      try {
        const isHeadEmp = cascadeDomino.isHead(currentEmployee.value.id)
        const hasHeadInTabs = !!cascadeDomino.headEmployee

        let fetchedData = null
        let resolvedSignatory = null

        const fetchFromCascadeStore = async () => {
          await cascadeStore.fetchCascade(semester, year, mfoValue)
          const raw = cascadeStore.cascadeData
          if (!raw) throw new Error('No cascade data found')

          const signatoryResult = calculateSupervisorySignatory(
            currentEmployee.value.employeeData || currentEmployee.value,
            raw,
            mfoValue,
            outputName,
          )

          const isRootSupervisor = signatoryResult?.controlNo === raw.controlNo

          let sourceMfo = null

          if (isRootSupervisor) {
            sourceMfo = (raw.mfos || []).find(
              (m) => m.mfo === mfoValue || m.mfo === selectedMfo?.name,
            )
            console.log('[UWP] Signatory is root — using Office Head MFO data:', sourceMfo)
          } else {
            const matchedSup = (raw.supervisories || []).find(
              (sup) => sup.controlNo === signatoryResult?.controlNo,
            )
            sourceMfo = (matchedSup?.mfos || []).find(
              (m) => m.mfo === mfoValue || m.mfo === selectedMfo?.name,
            )
            console.log(
              '[UWP] Signatory is supervisory — using their MFO data:',
              signatoryResult?.name,
              sourceMfo,
            )

            if (!sourceMfo) {
              console.log('[UWP] Supervisory has no MFO entry — falling back to root MFO data')
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

          resolvedSignatory = resolvedSignatory || signatoryResult

          if (sourceMfo) {
            const totalTarget = sourceMfo.total_target || 0
            const signatoryControlNo = resolvedSignatory?.controlNo || 'root'

            const getStandardClaim = (s) => {
              const qty = s.standardOutcomeRows?.find((r) => r.rating === '5')?.quantity
              return parseFloat(s.targetOutputValue) || parseFloat(qty) || 0
            }

            const matchesPool = (s) => {
              if (!s._signatoryControlNo || s._signatoryControlNo !== signatoryControlNo)
                return false
              if (!s._mfoValue || s._mfoValue !== mfoValue) return false
              if (!isRootSupervisor && s._outputName !== outputName) return false
              return true
            }

            let claimedInSession = 0
            employeeTabs.value.forEach((emp) => {
              const isCurrentEmp = emp.id === currentEmployee.value.id
              emp.performanceStandards.forEach((s, idx) => {
                if (isCurrentEmp && idx === standardIndex) return
                if (matchesPool(s)) claimedInSession += getStandardClaim(s)
              })
            })

            standard._signatoryControlNo = signatoryControlNo
            standard._mfoValue = mfoValue
            standard._outputName = outputName || null
            standard.rows.supervisory_control_no =
              signatoryControlNo !== 'root'
                ? signatoryControlNo
                : resolvedSignatory?.controlNo || null

            const apiAvailable =
              sourceMfo.available ?? Math.max(0, totalTarget - (sourceMfo.claimed || 0))
            const sessionAvailable = isRootSupervisor
              ? Math.max(0, apiAvailable - claimedInSession)
              : Math.max(0, totalTarget - claimedInSession)

            return {
              ...raw,
              name: resolvedSignatory.name,
              rank: resolvedSignatory.rank,
              job_title: resolvedSignatory.job_title,
              controlNo: resolvedSignatory.controlNo,
              mfos: [
                {
                  ...sourceMfo,
                  total_target: totalTarget,
                  claimed: claimedInSession,
                  available: sessionAvailable,
                },
              ],
            }
          }

          return {
            ...raw,
            name: resolvedSignatory?.name,
            rank: resolvedSignatory?.rank,
            job_title: resolvedSignatory?.job_title,
            controlNo: resolvedSignatory?.controlNo,
          }
        }

        const headTarget =
          hasHeadInTabs && !isHeadEmp
            ? cascadeDomino.getHeadTarget(mfoId, standard.rows.output)
            : null

        if (!hasHeadInTabs || (hasHeadInTabs && !isHeadEmp && !headTarget)) {
          fetchedData = await fetchFromCascadeStore()
          resolvedSignatory = calculateSupervisorySignatory(
            currentEmployee.value.employeeData || currentEmployee.value,
            fetchedData,
            mfoValue,
            outputName,
          )
        } else if (hasHeadInTabs && !isHeadEmp && headTarget) {
          const totalTarget = parseFloat(headTarget.targetOutputValue) || 0
          let claimedByOthers = 0

          employeeTabs.value.forEach((emp) => {
            if (emp.id === currentEmployee.value.id || emp.id === cascadeDomino.headEmployee.id)
              return
            emp.performanceStandards.forEach((s) => {
              if (s.rows.mfo === mfoId) {
                claimedByOthers +=
                  parseFloat(s.targetOutputValue) ||
                  parseFloat(s.standardOutcomeRows?.find((r) => r.rating === '5')?.quantity) ||
                  0
              }
            })
          })
          const available = Math.max(0, totalTarget - claimedByOthers)

          resolvedSignatory = {
            name: headTarget.headName,
            id: headTarget.headId,
            rank: headTarget.headRank,
            job_title: headTarget.headPosition,
          }

          fetchedData = {
            name: headTarget.headName,
            rank: headTarget.headRank,
            job_title: headTarget.headPosition,
            office: uwpData.value.hierarchy.division?.label || '',
            controlNo: null,
            mfos: [
              {
                mfo: mfoValue,
                total_target: totalTarget,
                claimed: claimedByOthers,
                available,
                output_name: standard.outputName || '',
                success_indicator: headTarget.successIndicator || '',
                performance_indicator: headTarget.indicatorNames?.map((id) => {
                  const verb = officeLibraryIndicatorStore.verbs.find((v) => v.id === Number(id))
                  return { value: verb?.indicator_name || verb?.name || String(id) }
                }),
              },
            ],
          }
        }

        const tabIndex = employeeTabs.value.findIndex((e) => e.id === currentEmployee.value.id)
        if (tabIndex !== -1 && resolvedSignatory) {
          employeeTabs.value[tabIndex].supervisorySignatory = resolvedSignatory
          // Also stamp each standard that doesn't yet have a supervisory_control_no
          // (covers the headTarget path where fetchFromCascadeStore is not called)
          if (standard.rows.supervisory_control_no == null && resolvedSignatory?.controlNo) {
            standard.rows.supervisory_control_no = resolvedSignatory.controlNo
          }
          console.log('[UWP] Supervisory signatory resolved:', resolvedSignatory)
        }

        const restriction = quantityRestriction.determineRestriction({
          selectedEmployee: {
            ...currentEmployee.value,
            supervisorySignatory: resolvedSignatory,
          },
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

        if (headTarget) {
          employeeTabs.value
            .filter(
              (e) => e.id !== currentEmployee.value.id && e.id !== cascadeDomino.headEmployee?.id,
            )
            .forEach((emp) => {
              const needsUpdate = emp.performanceStandards.some((s) => s.rows.mfo === mfoId)
              if (needsUpdate) {
                cascadeDomino.clearRestrictions(emp.id)
                if (activeEmployeeTab.value === emp.id) {
                  setTimeout(() => cascadeDomino.applyToEmployee(emp.id, true), 100)
                }
              }
            })
        }

        return restriction
      } catch (error) {
        loadingNotif()
        console.error('[UWP] Cascade error:', error)
        $q.notify({
          message: error.message || 'Failed to load cascade data',
          color: 'negative',
          position: 'top',
        })
        return null
      }
    }

    // ===========================================================================
    // 20. QUANTITY COMPUTATION
    // ===========================================================================

    const onQuantityOptionSelect = (value, index) => {
      const std = currentEmployee.value?.performanceStandards?.[index]
      if (!std) return
      std.quantityIndicatorType = value
      currentStandardIndex.value = index

      if (value === 'B') {
        quantityValue.value = null
        currentQuantityRestriction.value = std.quantityRestriction
        showQuantityModal.value = true
        std.standardOutcomeRows.forEach((r) => (r.quantity = ''))
      } else if (value === 'C') {
        computeQuantities('C', index)
      } else {
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
        if (!quantityValue.value || isNaN(quantityValue.value)) {
          $q.notify({ message: 'Please enter a valid number', color: 'negative', position: 'top' })
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

        generateSuccessIndicator(idx)
        $q.notify({ message: 'Quantities calculated (Type B)', color: 'positive', position: 'top' })
        showQuantityModal.value = false
        quantityValue.value = null
        currentQuantityRestriction.value = null

        if (cascadeDomino.isHead(currentEmployee.value.id)) cascadeDomino.applyToAllStaff()
      } else if (currentType === 'C') {
        std.targetOutputValue = '100%'
        std.standardOutcomeRows[0].quantity = '100% and above'
        std.standardOutcomeRows[1].quantity = '88%-99%'
        std.standardOutcomeRows[2].quantity = '77%-87%'
        std.standardOutcomeRows[3].quantity = '38%-76%'
        std.standardOutcomeRows[4].quantity = '37% and below'

        generateSuccessIndicator(idx)
        $q.notify({ message: 'Quantities set (Type C)', color: 'positive', position: 'top' })
        if (cascadeDomino.isHead(currentEmployee.value.id)) cascadeDomino.applyToAllStaff()
      } else {
        std.targetOutputValue = null
        generateSuccessIndicator(idx)
      }
    }

    const cancelQuantityInput = () => {
      const std = currentEmployee.value.performanceStandards[currentStandardIndex.value]
      if (std) std.quantityIndicatorType = 'numeric'
      showQuantityModal.value = false
      currentQuantityRestriction.value = null
    }

    // ===========================================================================
    // 21. TIMELINESS METHODS
    // ===========================================================================

    const onTimelinessTypeSelect = (value, index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std) return
      std.timelinessIndicatorType = value
      Object.assign(std.timelinessInputs, { range: true, date: false, description: false })
      generateSuccessIndicator(index)
    }

    const applyTimelinessInputs = (type, index) => {
      const std = currentEmployee.value.performanceStandards[index]
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

        const parts = []
        if (std.activeTimelinessInputs.range && row.timelinessRange) parts.push(row.timelinessRange)
        if (std.activeTimelinessInputs.date && row.timelinessDate)
          parts.push(`by ${row.timelinessDate}`)
        if (std.activeTimelinessInputs.description && row.timelinessText)
          parts.push(row.timelinessText)
        row.timeliness = parts.join(' ')
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
      const std = currentEmployee.value.performanceStandards[index]
      if (!std) return

      const parts = []
      if (std.activeTimelinessInputs.range && row.timelinessRange) parts.push(row.timelinessRange)
      if (std.activeTimelinessInputs.date && row.timelinessDate)
        parts.push(`by ${row.timelinessDate}`)
      if (std.activeTimelinessInputs.description && row.timelinessText)
        parts.push(row.timelinessText)
      row.timeliness = parts.join(' ')

      generateSuccessIndicator(index)
    }

    const onTimelinessDateUpdate = (row, index) => onTimelinessUpdate(row, 'timelinessDate', index)

    // ===========================================================================
    // 22. EFFECTIVENESS METHODS
    // ===========================================================================

    const onEffectivenessUpdate = (row, index) => {
      formInteracted.value = true
      generateSuccessIndicator(index)
    }

    const onEffectivenessFieldFocus = () => {
      formInteracted.value = true
    }

    // ===========================================================================
    // 23. QUANTITY UPDATE METHOD
    // ===========================================================================

    const onQuantityUpdate = async (row, field, index) => {
      sanitizeNumericInput(row, field)
      const std = currentEmployee.value.performanceStandards[index]

      if (row.rating === '5' && !isCurrentEmployeeOfficeHead.value) {
        await checkAndShowCascadeModal(index)
        employeeTabs.value.forEach((emp) => {
          if (emp.id === currentEmployee.value.id) return
          emp.performanceStandards.forEach((s) => {
            if (
              s._signatoryControlNo === std._signatoryControlNo &&
              s._mfoValue === std._mfoValue
            ) {
              s.quantityRestriction = null
            }
          })
        })
      }

      if (std.quantityRestriction?.maxQuantity != null) {
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
    // 24. EMPLOYEE TAB MANAGEMENT
    // ===========================================================================

    const addEmployeeTab = () => {
      if (allEmployeesSelected.value) {
        $q.notify({
          message: 'All available employees have been added',
          color: 'warning',
          position: 'top',
        })
        return
      }
      if (isAddEmployeeDisabled.value) {
        $q.notify({
          message: 'The head employee must set their performance targets first',
          color: 'warning',
          position: 'top',
        })
        return
      }
      const newEmp = createDefaultEmployeeData()
      employeeTabs.value.push(newEmp)
      activeEmployeeTab.value = newEmp.id
      nextTick(() => cascadeDomino.applyToEmployee(newEmp.id))
      $q.notify({ message: 'Added new employee tab', color: 'positive', position: 'top' })
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
      if (cascadeDomino.isHead(tabId)) {
        $q.notify({ message: 'Cannot remove the head employee', color: 'warning', position: 'top' })
        return
      }
      $q.dialog({
        title: 'Confirm Removal',
        message: 'Remove this employee from the plan?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        const idx = employeeTabs.value.findIndex((e) => e.id === tabId)
        if (idx !== -1) {
          employeeTabs.value.splice(idx, 1)
          if (tabId === activeEmployeeTab.value) {
            activeEmployeeTab.value = employeeTabs.value[0]?.id
          }
          $q.notify({ message: 'Employee removed', color: 'positive', position: 'top' })
        }
      })
    }

    const switchToEmployee = (tabId) => {
      activeEmployeeTab.value = tabId
    }

    const onEmployeeSelected = async (employeeId) => {
      const tabIndex = employeeTabs.value.findIndex((e) => e.id === activeEmployeeTab.value)
      if (tabIndex === -1) return

      if (employeeId === null || employeeId === undefined) {
        Object.assign(employeeTabs.value[tabIndex], {
          name: '',
          employeeId: null,
          employeeData: null,
          rank: '',
          position: '',
          sg: '',
          level: '',
          supervisorySignatory: null,
        })
        return
      }

      const selectedEmp = uwpData.value.employeesWithoutTargetPeriod?.find(
        (e) => e.id === employeeId,
      )
      if (!selectedEmp) return

      const initialSignatory = calculateSupervisorySignatory(selectedEmp, cascadeStore.cascadeData)

      Object.assign(employeeTabs.value[tabIndex], {
        name: selectedEmp.label || selectedEmp.name || '',
        employeeId: selectedEmp.id,
        employeeData: selectedEmp,
        rank: selectedEmp.rank || selectedEmp.employment_type || '',
        position: selectedEmp.designation || selectedEmp.position || '',
        sg: selectedEmp.salary_grade || selectedEmp.sg || selectedEmp.SG || '',
        level: selectedEmp.employeeStatus || selectedEmp.level || '',
        supervisorySignatory: initialSignatory,
      })

      employeeTabs.value[tabIndex].performanceStandards?.forEach((std) =>
        autoPopulateCoreCompetencies(
          std,
          employeeTabs.value[tabIndex].sg,
          employeeTabs.value[tabIndex].level,
        ),
      )

      // Clear output on existing standards if newly selected employee is Office Head
      // and their current standards have a non-support category selected
      if (isCurrentEmployeeOfficeHead.value) {
        employeeTabs.value[tabIndex].performanceStandards?.forEach((std) => {
          if (!isSupportCategory(std.rows?.category) && std.rows?.output != null) {
            std.rows.output = null
          }
        })
      }

      if (!cascadeDomino.isHead(employeeTabs.value[tabIndex].id) && cascadeDomino.headEmployee) {
        cascadeDomino.applyToEmployee(employeeTabs.value[tabIndex].id)
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

    // ===========================================================================
    // 25. PERFORMANCE STANDARD MANAGEMENT
    // ===========================================================================

    const addPerformanceStandard = () => {
      const newStd = createDefaultPerformanceStandard()
      if (currentEmployee.value?.sg && currentEmployee.value?.level) {
        autoPopulateCoreCompetencies(newStd, currentEmployee.value.sg, currentEmployee.value.level)
      }
      currentEmployee.value.performanceStandards.push(newStd)
      showCompetencyError.value[currentEmployee.value.performanceStandards.length - 1] = false
      $q.notify({
        message: `Added Performance Standard ${currentEmployee.value.performanceStandards.length}`,
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
        message: `Remove Performance Standard ${index + 1}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        currentEmployee.value.performanceStandards.splice(index, 1)
        showCompetencyError.value.splice(index, 1)
        $q.notify({ message: 'Performance standard removed', color: 'positive', position: 'top' })
      })
    }

    // ===========================================================================
    // 26. FORM SUBMISSION
    // ===========================================================================

    const onSubmit = async () => {
      shouldValidate.value = true
      formInteracted.value = true

      const invalidEmployees = []
      employeeTabs.value.forEach((emp, empIndex) => {
        if (!emp.employeeId) {
          invalidEmployees.push(`Employee ${empIndex + 1}`)
          return
        }
        const badStandards = emp.performanceStandards
          .map((std, stdIndex) => {
            const errors = []
            const filled =
              std.standardOutcomeRows?.filter((r) => r.effectiveness?.trim().length > 0).length || 0
            if (filled < 2) errors.push('needs ≥2 effectiveness values')

            const { core = [], technical = [], leadership = [] } = std.competencies
            if (core.length + technical.length + leadership.length < 1)
              errors.push('needs ≥1 competency')

            if (std.quantityIndicatorType === 'B' && std.quantityRestriction?.maxQuantity != null) {
              const tv = parseFloat(std.targetOutputValue)
              if (!isNaN(tv) && tv > std.quantityRestriction.maxQuantity) {
                errors.push(`quantity exceeds max (${std.quantityRestriction.maxQuantity})`)
              }
            }
            return errors.length ? `${stdIndex + 1} (${errors.join(', ')})` : null
          })
          .filter(Boolean)

        if (badStandards.length) {
          invalidEmployees.push(
            `${emp.name || `Employee ${empIndex + 1}`} — Standards: ${badStandards.join('; ')}`,
          )
        }
      })

      if (invalidEmployees.length) {
        $q.notify({
          message: `Incomplete: ${invalidEmployees.join(' | ')}`,
          color: 'negative',
          position: 'top',
          timeout: 6000,
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
              const fullData = uwpData.value.employeesWithoutTargetPeriod?.find(
                (e) => e.id === emp.employeeId,
              )

              const supervisoryControlNo =
                emp.supervisorySignatory?.controlNo ||
                fullData?.supervisorySignatory?.controlNo ||
                fullData?.employeeData?.supervisorySignatory?.controlNo ||
                null

              console.log(
                `[UWP] Submitting ${emp.name} | supervisory_control_no: ${supervisoryControlNo}`,
              )

              return {
                ...emp,
                employeeId: emp.employeeId,
                employeeData: fullData || emp.employeeData,
                supervisory_control_no: supervisoryControlNo,
                performanceStandards: emp.performanceStandards.map((std) => ({
                  ...std,
                  outputName: std.outputName || '',
                  requiredOutput: std.requiredOutput || '',
                  indicatorName: Array.isArray(std.indicatorName)
                    ? std.indicatorName
                    : std.indicatorName
                      ? [std.indicatorName]
                      : [],
                  rows: {
                    category: std.rows?.category || null,
                    mfo: std.rows?.mfo || null,
                    output: std.rows?.output || null,
                    supervisory_control_no: std.rows?.supervisory_control_no || null,
                  },
                  activeTimelinessInputs: std.activeTimelinessInputs || {
                    range: true,
                    date: false,
                    description: false,
                  },
                  timelinessInputs: std.timelinessInputs || {
                    range: true,
                    date: false,
                    description: false,
                  },
                  competencies: {
                    core: std.competencies?.core || [],
                    technical: std.competencies?.technical || [],
                    leadership: std.competencies?.leadership || [],
                  },
                  quantityRestriction: std.quantityRestriction || null,
                  targetOutputValue: std.targetOutputValue || null,
                  quantityIndicatorType: std.quantityIndicatorType || 'numeric',
                  timelinessIndicatorType: std.timelinessIndicatorType || 'beforeDeadline',
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

        sessionStorage.removeItem('uwpData')
        router.push('/office/spms')
      } catch (error) {
        console.error('[UWP] Submission error:', error)
        if (error.response?.data?.errors?.['employees.0.supervisory_control_no']) {
          $q.notify({
            message:
              'Missing supervisory signatory. Please ensure all employees have a supervisor.',
            color: 'negative',
            position: 'top',
            timeout: 5000,
          })
        } else {
          $q.notify({
            message:
              error.response?.data?.message || error.message || 'Failed to save Unit Work Plan',
            color: 'negative',
            position: 'top',
          })
        }
      }
    }

    const onBack = () => router.back()
    const onDivisionChange = () => {
      form.value.section = null
      form.value.unit = null
    }
    const onSectionChange = () => {
      form.value.unit = null
    }

    // ===========================================================================
    // 27. WATCHERS
    // ===========================================================================

    // Re-populate core competencies when SG / Level / Employee changes
    watch(
      () => ({
        sg: currentEmployee.value?.sg,
        level: currentEmployee.value?.level,
        employeeId: currentEmployee.value?.employeeId,
      }),
      ({ sg, level, employeeId }) => {
        if (sg && level && employeeId) {
          currentEmployee.value.performanceStandards?.forEach((std) =>
            autoPopulateCoreCompetencies(std, sg, level),
          )
        }
      },
      { deep: true },
    )

    // Apply cascade restrictions when switching to a non-head tab.
    // Office Head tabs are exempt — they are the cascade root.
    watch(activeEmployeeTab, (newTabId) => {
      if (!newTabId || cascadeDomino.isHead(newTabId)) return
      if (isCurrentEmployeeOfficeHead.value) return
      nextTick(async () => {
        const emp = employeeTabs.value.find((e) => e.id === newTabId)
        if (!emp) return
        for (let i = 0; i < emp.performanceStandards.length; i++) {
          const s = emp.performanceStandards[i]
          if (s.rows?.mfo && s.indicatorName?.length && s.quantityRestriction === null) {
            await checkAndShowCascadeModal(i)
          }
        }
      })
    })

    // Auto-set level in competency modal when competency is selected
    watch(
      () => competencySelections.value.map((s) => s.selectedCompetency),
      () => {
        competencySelections.value.forEach((sel) => {
          if (sel.selectedCompetency && !sel.selectedLevel) {
            sel.selectedLevel = LEVEL_MAP[sel.selectedCompetency.requiredLevel] || null
          }
        })
      },
      { deep: true },
    )

    // Regenerate success indicator when relevant standard fields change
    watch(
      () =>
        currentEmployee.value.performanceStandards.map((s) => ({
          outputName: s.outputName,
          indicatorName: s.indicatorName,
          quantityType: s.quantityIndicatorType,
          timelinessType: s.timelinessIndicatorType,
          standardOutcomeRows: s.standardOutcomeRows,
          activeTimelinessInputs: s.activeTimelinessInputs,
        })),
      () =>
        currentEmployee.value.performanceStandards.forEach((_, i) => generateSuccessIndicator(i)),
      { deep: true },
    )

    // Re-filter employees when org selection changes
    watch([() => form.value.division, () => form.value.section, () => form.value.unit], () =>
      filterEmployees(),
    )

    // Validate competencies when standards change
    watch(
      () => currentEmployee.value?.performanceStandards,
      (stds) => stds?.forEach((_, i) => validateCompetencies(i)),
      { deep: true },
    )

    // Trigger auto-selection when employee list is populated,
    // then fetch the Office Head's existing MFOs to restrict other employees' dropdowns.
    watch(
      () => uwpData.value.employeesWithoutTargetPeriod,
      (employees) => {
        if (employees?.length && !autoSelectionPerformed.value) {
          nextTick(async () => {
            autoSelectHeadEmployees()
            await nextTick()
            fetchHeadMfos()
          })
        }
      },
      { deep: true, immediate: true },
    )

    // Also watch entire uwpData (covers initial load from sessionStorage)
    watch(
      () => uwpData.value,
      (newVal) => {
        if (newVal.employeesWithoutTargetPeriod?.length && !autoSelectionPerformed.value) {
          nextTick(async () => {
            autoSelectHeadEmployees()
            await nextTick()
            fetchHeadMfos()
          })
        }
      },
      { deep: true, immediate: true },
    )

    // Recalculate restriction when indicator or output selection changes
    // Office Head is exempt — they are the cascade root and have no restrictions.
    watch(
      () =>
        currentEmployee.value?.performanceStandards?.map((s) => ({
          id: s.id,
          indicatorName: JSON.stringify(s.indicatorName),
          mfo: s.rows?.mfo,
          output: s.rows?.output,
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

          if (std.rows?.mfo && std.indicatorName?.length) {
            await checkAndShowCascadeModal(i)
          }
        }
      },
      { deep: true },
    )

    // ── NEW: Office Head output-clearing watcher ──────────────────────────────
    // When the active employee is an Office Head and they change the category
    // on a standard to a non-support type, automatically clear the output field.
    // This keeps the data model consistent with what shouldShowOutput() hides in the UI.
    watch(
      () =>
        currentEmployee.value?.performanceStandards?.map((s) => ({
          id: s.id,
          category: s.rows?.category,
        })),
      () => {
        if (!isCurrentEmployeeOfficeHead.value) return
        currentEmployee.value?.performanceStandards?.forEach((std) => {
          if (!isSupportCategory(std.rows?.category) && std.rows?.output != null) {
            std.rows.output = null
          }
        })
      },
      { deep: true },
    )

    // ===========================================================================
    // 28. LIFECYCLE HOOKS
    // ===========================================================================

    onMounted(async () => {
      initializeUWPData()
      initializeEmployeeTabs()

      console.log('[UWP] uwpData:', JSON.stringify(uwpData.value, null, 2))

      const officeId = uwpData.value.hierarchy.office?.id || 1

      try {
        await Promise.all([
          officeLibraryStore.fetchAllData(officeId),
          officeLibraryIndicatorStore.fetchVerbs(),
        ])

        // KEY FIX: populate filteredVerbs immediately after verbs are fetched.
        filterPerformanceIndicators('', null)

        if (uwpData.value.employeesWithoutTargetPeriod?.length) {
          autoSelectHeadEmployees()
        }

        // Always fetch the Office Head's MFOs on mount, regardless of whether the
        // Office Head appears in employeesWithoutTargetPeriod. When the head already
        // has a target period they won't be in that list, but the API can still find
        // their plan by office_id + semester + year.
        fetchHeadMfos()
      } catch (error) {
        console.error('[UWP] Mount error:', error)
        $q.notify({ message: 'Failed to load data', color: 'negative', position: 'top' })
      }
    })

    // ===========================================================================
    // 29. EXPOSE TO TEMPLATE
    // ===========================================================================

    return {
      // Data
      uwpData,
      form,
      employeeTabs,
      activeEmployeeTab,
      currentEmployee,
      maxVisibleTabs,
      formInteracted,
      shouldValidate,
      isLoadingFilteredEmployees,
      filteredEmployees,
      filteredMfoOptions,
      filteredOutputOptions,
      filteredVerbs,

      // Computed
      semesterOptions,
      yearOptions,
      breadcrumbDisplay,
      selectedNodeLabel,
      hierarchyLabels,
      selectedEmployee,
      visibleEmployeeTabs,
      overflowEmployeeTabs,
      hasOverflowTabs,
      allEmployeesSelected,
      isAddEmployeeDisabled,
      showHeadBanner,
      availableEmployeesForTab,
      categoryOptions,
      performanceIndicatorOptions,
      competencyOptions,
      levelOptions,
      isAnyCompetencyValid,
      isFormValid,
      quantityExceedsMax,
      hasOrganizationalSelection,
      isCurrentEmployeeHead,

      // Office Head field-visibility helpers (NEW)
      isCurrentEmployeeOfficeHead,
      shouldShowOutput,

      // Table / Option constants
      standardOutcomeColumns: STANDARD_OUTCOME_COLUMNS,
      quantityIndicator: QUANTITY_INDICATOR_OPTIONS,

      // Cascade
      showCascadeModal,
      cascadeData,
      cascadeDomino,
      uwpStore,

      // Head MFO filter
      mfoHeadStore,
      headMfoNames,
      isFetchingHeadMfos,
      fetchHeadMfos,

      // Quantity modal
      showQuantityModal,
      quantityValue,
      currentStandardIndex,
      currentQuantityRestriction,

      // Competency modal
      showCompetencyModal,
      competencyType,
      selectedCompetency,
      selectedLevel,
      filteredCompetencyOptions,
      showCompetencyError,
      competencySelections,
      filteredCompetencyOptionsByRow,

      // Helper methods
      isHeadPosition,
      getEmployeeBadgeColor,
      getEmployeeName,
      getEmployeePosition,
      getEmployeeInitial,
      getEmployeeIndex,
      getSelectedEmployeeIds,
      isSupportCategory,

      // Output + MFO methods
      getAvailableOutputOptions,
      getOutputNoOptionMessage,
      getMfoNoOptionMessage,

      // Filter methods
      filterEmployees,
      filterMfos,
      filterOutputs,
      filterPerformanceIndicators,
      getFilteredMfoOptions,
      getFilteredOutputOptions,

      // Validation methods
      hasMinimumEffectivenessValues,
      hasMinimumCompetencies,
      validateStrictNumeric,
      blockInvalidChars,
      getQuantityHint,
      isQuantityExceeded,
      getQuantityErrorMessage,

      // Standard management
      addPerformanceStandard,
      removePerformanceStandard,
      generateSuccessIndicator,
      clearDependentFields,

      // Employee tab management
      addEmployeeTab,
      removeEmployeeTab,
      switchToEmployee,
      onEmployeeSelected,

      // Quantity methods
      onQuantityOptionSelect,
      onQuantityUpdate,
      computeQuantities,
      cancelQuantityInput,

      // Timeliness methods
      onTimelinessTypeSelect,
      applyTimelinessInputs,
      onTimelinessUpdate,
      onTimelinessDateUpdate,

      // Effectiveness methods
      onEffectivenessUpdate,
      onEffectivenessFieldFocus,

      // Competency methods
      openCompetencyModal,
      filterCompetencies,
      getAvailableCompetencies,
      addCompetencyRow,
      removeCompetencyRow,
      addAllSelectedCompetencies,
      removeCompetency,
      cancelCompetencySelection,
      validateCompetencies,

      // Cascade
      checkAndShowCascadeModal,

      // Form lifecycle
      onDivisionChange,
      onSectionChange,
      onSubmit,
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
