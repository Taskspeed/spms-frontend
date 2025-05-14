<template>
  <q-page class="q-pa-md">
    <div class="q-mb-sm">
      <h1 class="text-h6 q-mb-none">Unit Work Plan</h1>
      <p class="text-grey-7">Add targets for employee indicator</p>
    </div>

    <div class="row q-col-gutter-sm">
      <!-- Target Period Details Card -->
      <div class="col-12">
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
                  <q-select
                    v-model="form.division"
                    :options="divisionOptions"
                    label="Division"
                    outlined
                    dense
                    emit-value
                    map-options
                    option-value="id"
                    option-label="name"
                    clearable
                    @update:model-value="onDivisionChange"
                  >
                    <template v-slot:prepend>
                      <q-icon name="business" size="xs" />
                    </template>
                  </q-select>

                  <q-select
                    v-model="form.section"
                    :options="filteredSections"
                    label="Section"
                    outlined
                    dense
                    emit-value
                    map-options
                    option-value="id"
                    option-label="name"
                    :disable="!form.division"
                    clearable
                    @update:model-value="onSectionChange"
                  >
                    <template v-slot:prepend>
                      <q-icon name="account_tree" size="xs" />
                    </template>
                  </q-select>

                  <q-select
                    v-model="form.unit"
                    :options="filteredUnits"
                    label="Unit"
                    outlined
                    dense
                    emit-value
                    map-options
                    option-value="id"
                    option-label="name"
                    :disable="!form.section"
                    clearable
                  >
                    <template v-slot:prepend>
                      <q-icon name="layers" size="xs" />
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- Right Side: Semester, Year -->
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

                  <q-select v-model="form.year" :options="yearOptions" label="Year" outlined dense>
                    <template v-slot:prepend>
                      <q-icon name="event" size="xs" />
                    </template>
                  </q-select>
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
            <div class="text-subtitle2">Employee Information</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-sm">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.employee"
                  :options="filteredEmployees"
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
                  :disable="!hasOrganizationalSelection"
                  :hint="
                    !hasOrganizationalSelection
                      ? 'Please select Division, Section, or Unit first'
                      : ''
                  "
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
                </q-select>
              </div>

              <div class="col-12 col-md-6" v-if="form.employee">
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-md-6">
                    <q-input v-model="selectedEmployee.rank" label="Rank" outlined dense readonly>
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

            <!-- Performance Standards Section (Modified to contain MFO details) -->
            <div v-if="form.employee" class="q-mt-md">
              <q-separator class="q-mb-md" />

              <!-- Performance Standards Collection -->
              <div class="q-mt-md">
                <div
                  v-for="(standard, index) in performanceStandards"
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
                                    <q-select
                                      outlined
                                      dense
                                      v-model="standard.rows.category"
                                      label="Select Category"
                                      :options="categoryOptions"
                                      map-options
                                      @update:model-value="clearDependentFields(index, 1)"
                                    >
                                      <template v-slot:prepend>
                                        <q-icon name="category" size="xs" />
                                      </template>
                                    </q-select>

                                    <q-select
                                      v-if="!skipMfo"
                                      outlined
                                      dense
                                      v-model="standard.rows.mfo"
                                      label="Select MFO"
                                      :options="getFilteredMfoOptions(index)"
                                      :disable="!standard.rows.category"
                                      @update:model-value="clearDependentFields(index, 2)"
                                    >
                                      <template v-slot:prepend>
                                        <q-icon name="list_alt" size="xs" />
                                      </template>
                                    </q-select>

                                    <q-select
                                      outlined
                                      dense
                                      v-model="standard.rows.output"
                                      label="Select Output"
                                      :options="getFilteredOutputOptions(index)"
                                      :disable="
                                        (!standard.rows.mfo && !skipMfo) || !standard.rows.category
                                      "
                                    >
                                      <template v-slot:prepend>
                                        <q-icon name="output" size="xs" />
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
                                          <div class="text-caption text-weight-medium">
                                            Technical
                                          </div>
                                        </q-card-section>
                                        <q-separator />
                                        <q-card-section class="q-pa-sm">
                                          <div class="competency-list">
                                            <template
                                              v-if="
                                                Object.keys(mergedTechnicalCompetency).length > 0
                                              "
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
                                <!-- Output & Indicator Names (vertically stacked) -->
                                <div class="col-md-3">
                                  <div class="column q-gutter-sm">
                                    <q-input
                                      outlined
                                      v-model="standard.outputName"
                                      label="Output Name"
                                      dense
                                      class="full-width"
                                      @update:model-value="generateSuccessIndicator(index)"
                                    >
                                      <template v-slot:prepend>
                                        <q-icon name="label" size="xs" />
                                      </template>
                                    </q-input>

                                    <q-input
                                      outlined
                                      v-model="standard.indicatorName"
                                      label="Indicator Name"
                                      dense
                                      class="full-width"
                                      @update:model-value="generateSuccessIndicator(index)"
                                    >
                                      <template v-slot:prepend>
                                        <q-icon name="flag" size="xs" />
                                      </template>
                                    </q-input>
                                  </div>
                                </div>

                                <!-- The three original inputs, now with adjusted width -->
                                <div class="col-md-3">
                                  <q-input
                                    outlined
                                    v-model="standard.successIndicator"
                                    type="textarea"
                                    label="Success Indicator"
                                    class="autogrow-textarea"
                                    autogrow
                                    readonly
                                    hint="Auto-generated based on inputs"
                                    :input-style="{ minHeight: '80px' }"
                                    :min-rows="2"
                                  />
                                </div>
                                <div class="col-md-3">
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
                                <div class="col-md-3">
                                  <q-input
                                    outlined
                                    v-model="standard.modeOfVerification"
                                    type="textarea"
                                    label="Mode of Verification"
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
                          <div class="q-mt-md">
                            <div class="row items-center justify-between q-mb-sm">
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
                                              @click="
                                                applyTimelinessInputs('beforeDeadline', index)
                                              "
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

                            <div class="q-pa-md" style="max-width: 100%">
                              <q-table
                                :rows="standard.standardOutcomeRows"
                                :columns="standardOutcomeColumns"
                                row-key="rating"
                                hide-bottom
                                bordered
                                flat
                                dense
                                table-header-class="fixed-header"
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
                                      placeholder="Enter custom target"
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
                                    <!-- Horizontal layout for timeliness inputs -->
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
                                        {{ props.row.timeliness || 'Select input types from menu' }}
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
                                      :error-message="
                                        !props.row.effectiveness &&
                                        getEffectivenessErrorCount(index) < 4 &&
                                        formInteracted &&
                                        shouldValidate
                                          ? 'At least 2 values required'
                                          : ''
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

    <div class="row justify-end q-mt-sm">
      <q-btn label="Cancel" color="grey" flat dense class="q-mr-sm" @click="onCancel" />
      <q-btn
        label="Submit"
        color="green-7"
        icon="save"
        dense
        @click="onSubmit"
        :disable="!isFormValid"
      />
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'

export default {
  setup() {
    const $q = useQuasar()

    // Form state tracking
    const formInteracted = ref(false)
    const shouldValidate = ref(false)

    // Base form data
    const form = ref({
      unit: null,
      section: null,
      division: null,
      semester: null,
      year: new Date().getFullYear(),
      employee: null,
    })

    // MFO and Competencies related data
    const skipMfo = ref(false)
    const categoryOptions = ref([
      { label: 'Category 1', value: 'cat1' },
      { label: 'Category 2', value: 'cat2' },
      { label: 'Category 3', value: 'cat3' },
    ])

    const mfoOptions = ref([
      { label: 'MFO 1', value: 'mfo1', category: 'cat1' },
      { label: 'MFO 2', value: 'mfo2', category: 'cat1' },
      { label: 'MFO 3', value: 'mfo3', category: 'cat2' },
      { label: 'MFO 4', value: 'mfo4', category: 'cat3' },
    ])

    const outputOptions = ref([
      { label: 'Output 1', value: 'out1', mfo: 'mfo1' },
      { label: 'Output 2', value: 'out2', mfo: 'mfo1' },
      { label: 'Output 3', value: 'out3', mfo: 'mfo2' },
      { label: 'Output 4', value: 'out4', mfo: 'mfo3' },
      { label: 'Output 5', value: 'out5', mfo: 'mfo4' },
    ])

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

    // Performance Standards Collection
    const performanceStandards = ref([createDefaultPerformanceStandard()])

    // Variables for the current standard in modal dialogs
    const currentStandardIndex = ref(0)
    const showQuantityModal = ref(false)
    const quantityValue = ref(null)

    // Quantity and Timeliness options
    const quantityIndicator = [
      { label: 'Quantity (A. Custom Target)', value: 'numeric' },
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

    const allEmployees = ref([
      {
        id: 1,
        name: 'John Smith',
        rank: 'Senior',
        position: 'Accountant',
        unitId: 1,
        sectionId: 1,
        divisionId: 1,
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        rank: 'Manager',
        position: 'Finance Manager',
        unitId: 1,
        sectionId: 2,
        divisionId: 3,
      },
      {
        id: 3,
        name: 'Michael Brown',
        rank: 'Junior',
        position: 'Production Assistant',
        unitId: 2,
        sectionId: 3,
        divisionId: 4,
      },
      {
        id: 4,
        name: 'Emily Davis',
        rank: 'Senior',
        position: 'QA Specialist',
        unitId: 2,
        sectionId: 3,
        divisionId: 5,
      },
      {
        id: 5,
        name: 'David Wilson',
        rank: 'Lead',
        position: 'Frontend Developer',
        unitId: 3,
        sectionId: 5,
        divisionId: 6,
      },
      {
        id: 6,
        name: 'Jessica Lee',
        rank: 'Architect',
        position: 'Backend Developer',
        unitId: 3,
        sectionId: 5,
        divisionId: 7,
      },
    ])

    // Form options
    const filteredEmployees = ref([])
    const semesterOptions = ['January-June', 'July-December']
    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
    const divisionOptions = divisions.value

    // Computed properties
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
      return (
        allEmployees.value.find((emp) => emp.id === form.value.employee) || {
          rank: '',
          position: '',
        }
      )
    })

    // Updated for each standard
    const getFilteredMfoOptions = (index) => {
      const standard = performanceStandards.value[index]
      if (!standard || !standard.rows.category) return []
      return mfoOptions.value.filter((mfo) => mfo.category === standard.rows.category.value)
    }

    // Updated for each standard
    const getFilteredOutputOptions = (index) => {
      const standard = performanceStandards.value[index]
      if (!standard || !standard.rows.mfo) return []
      return outputOptions.value.filter((out) => out.mfo === standard.rows.mfo.value)
    }

    // Updated to check each standard individually
    const hasMinimumEffectivenessValues = (index) => {
      const standard = performanceStandards.value[index]
      if (!standard) return false

      const filledValues = standard.standardOutcomeRows.filter(
        (row) => row.effectiveness && row.effectiveness.trim().length > 0,
      ).length
      return filledValues >= 2
    }

    // Get effectiveness error count for a specific standard
    const getEffectivenessErrorCount = (index) => {
      const standard = performanceStandards.value[index]
      if (!standard) return 5

      return standard.standardOutcomeRows.filter(
        (row) => !row.effectiveness || row.effectiveness.trim().length === 0,
      ).length
    }

    const isFormValid = computed(() => {
      const basicRequirements = form.value.employee && form.value.year && form.value.semester

      // Check if all performance standards have minimum effectiveness values
      const allStandardsValid = performanceStandards.value.every((_, index) =>
        hasMinimumEffectivenessValues(index),
      )

      return basicRequirements && allStandardsValid
    })

    // Helper function to get quantity component for success indicator
    const getQuantityComponent = (index) => {
      const standard = performanceStandards.value[index]
      if (!standard) return ''

      if (standard.quantityIndicatorType === 'numeric') {
        // For custom target, use the highest rating (5) value
        const rating5Row = standard.standardOutcomeRows.find((row) => row.rating === '5')
        return rating5Row?.quantity || ''
      } else if (standard.quantityIndicatorType === 'B') {
        // For "Can exceed 100%", use the target output value
        return quantityValue.value?.toString() || ''
      } else if (standard.quantityIndicatorType === 'C') {
        // For "Cannot exceed 100%", use "100%"
        return '100%'
      }
      return ''
    }

    // Helper function to get timeliness component for success indicator
    const getTimelinessComponent = (index) => {
      const standard = performanceStandards.value[index]
      if (!standard) return ''

      const highestRating = standard.standardOutcomeRows[0] // Rating 5 row
      const midRating = standard.standardOutcomeRows[2] // Rating 3 row
      let result = []

      if (standard.timelinessIndicatorType === 'beforeDeadline') {
        // For before deadline, we look at rating 3 or mid-rating
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
        // For on deadline, use the highest rating (5) value
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

    // Helper function to get effectiveness component for success indicator
    const getEffectivenessComponent = (index) => {
      const standard = performanceStandards.value[index]
      if (!standard) return ''

      // Always use the highest rating (5) effectiveness
      const rating5Row = standard.standardOutcomeRows.find((row) => row.rating === '5')
      return rating5Row?.effectiveness || ''
    }

    // Auto-generate success indicator based on the formula
    const generateSuccessIndicator = (index) => {
      if (index === undefined && performanceStandards.value.length > 0) {
        // If no specific index is provided, update all standards
        performanceStandards.value.forEach((_, i) => {
          generateSuccessIndicator(i)
        })
        return
      }

      if (index === undefined || index < 0 || index >= performanceStandards.value.length) {
        return
      }

      const standard = performanceStandards.value[index]

      const quantityPart = getQuantityComponent(index)
      const outputNamePart = standard.outputName ? standard.outputName.trim() : ''
      const indicatorNamePart = standard.indicatorName ? standard.indicatorName.trim() : ''
      const effectivenessPart = getEffectivenessComponent(index)
      const timelinessPart = getTimelinessComponent(index)

      // Build the success indicator with proper spacing and only including parts that exist
      let parts = []

      if (quantityPart) parts.push(quantityPart)
      if (outputNamePart) parts.push(outputNamePart)
      if (indicatorNamePart) parts.push(indicatorNamePart)
      if (effectivenessPart) parts.push(effectivenessPart)
      if (timelinessPart) parts.push(timelinessPart)

      // Join all available parts with proper spacing
      standard.successIndicator = parts.join(' ')
    }

    // Watch for important changes that should trigger success indicator regeneration
    watch(
      () => performanceStandards.value,
      () => generateSuccessIndicator(),
      { deep: true },
    )

    // Handle updates to quantity that should trigger success indicator regeneration
    const onQuantityUpdate = (row, field, index) => {
      sanitizeNumericInput(row, field)
      generateSuccessIndicator(index)
    }

    // Handle updates to timeliness that should trigger success indicator regeneration
    const onTimelinessUpdate = (row, field, index) => {
      sanitizeNumericInput(row, field)
      generateSuccessIndicator(index)
    }

    // Handle updates to effectiveness that should trigger success indicator regeneration
    const onEffectivenessUpdate = (row, index) => {
      checkEffectivenessValidity(index)
      generateSuccessIndicator(index)
    }

    // Watch for changes
    watch([() => form.value.division, () => form.value.section, () => form.value.unit], () => {
      filterEmployees()
      form.value.employee = null // Reset employee selection when org structure changes
    })

    // Methods
    const filterEmployees = (val, update) => {
      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()
          filteredEmployees.value = getFilteredEmployees().filter((emp) =>
            emp.name.toLowerCase().includes(needle),
          )
        })
      } else {
        filteredEmployees.value = getFilteredEmployees()
      }
    }

    const getFilteredEmployees = () => {
      if (form.value.division) {
        return allEmployees.value.filter((emp) => emp.divisionId === form.value.division)
      }
      if (form.value.section) {
        return allEmployees.value.filter((emp) => emp.sectionId === form.value.section)
      }
      if (form.value.unit) {
        return allEmployees.value.filter((emp) => emp.unitId === form.value.unit)
      }
      return []
    }

    const onDivisionChange = () => {
      form.value.section = null
      form.value.unit = null
    }

    const onSectionChange = () => {
      form.value.unit = null
    }

    const clearDependentFields = (standardIndex, fieldIndex) => {
      const standard = performanceStandards.value[standardIndex]
      if (!standard) return

      if (fieldIndex === 1) {
        // If category changed, reset MFO and output
        standard.rows.mfo = null
        standard.rows.output = null
      } else if (fieldIndex === 2) {
        // If MFO changed, reset output
        standard.rows.output = null
      }
    }

    // Effectiveness validation handling
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
      // Remove all non-numeric chars except hyphen
      row[field] = row[field].replace(/[^0-9-]/g, '')

      // Allow only one hyphen
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
      if (parts.length !== 2 || parts.some((p) => !p)) return 'Use format: min-max'

      const min = Number(parts[0])
      const max = Number(parts[1])

      if (isNaN(min) || isNaN(max)) return 'Both must be numbers'
      if (min >= max) return 'Min must be less than max'

      return true
    }

    // Timeliness and Quantity option handling
    const onTimelinessTypeSelect = (value, index) => {
      const standard = performanceStandards.value[index]
      if (!standard) return

      standard.timelinessIndicatorType = value

      // Reset the timeliness inputs to default when changing types
      Object.assign(standard.timelinessInputs, {
        range: true,
        date: false,
        description: false,
      })

      // Update success indicator when timeliness type changes
      generateSuccessIndicator(index)
    }

    const applyTimelinessInputs = (type, index) => {
      const standard = performanceStandards.value[index]
      if (!standard) return

      // Update the active inputs based on the checkbox selections
      Object.assign(standard.activeTimelinessInputs, standard.timelinessInputs)

      // If no input is selected, default to Range
      if (
        !standard.activeTimelinessInputs.range &&
        !standard.activeTimelinessInputs.date &&
        !standard.activeTimelinessInputs.description
      ) {
        standard.activeTimelinessInputs.range = true
        standard.timelinessInputs.range = true
      }

      // Clear fields no longer being used
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

      // Update success indicator when timeliness inputs change
      generateSuccessIndicator(index)
    }

    const onQuantityOptionSelect = (value, index) => {
      const standard = performanceStandards.value[index]
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
      const standard = performanceStandards.value[index]
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

      // Reset rows
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

      // Update success indicator when quantities are computed
      generateSuccessIndicator(index)
    }

    const cancelQuantityInput = () => {
      const index = currentStandardIndex.value
      const standard = performanceStandards.value[index]
      if (standard) {
        standard.quantityIndicatorType = 'numeric'
      }
      showQuantityModal.value = false
    }

    // Performance standards management
    const addPerformanceStandard = () => {
      performanceStandards.value.push(createDefaultPerformanceStandard())

      // Notify user
      $q.notify({
        message: `Added new performance standard ${performanceStandards.value.length}`,
        color: 'positive',
        position: 'top',
      })
    }

    const removePerformanceStandard = (index) => {
      if (performanceStandards.value.length <= 1) {
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
        performanceStandards.value.splice(index, 1)

        // Notify user
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

      // Check if all performance standards have minimum effectiveness values
      const invalidStandards = performanceStandards.value
        .map((_, i) => i)
        .filter((index) => !hasMinimumEffectivenessValues(index))

      if (invalidStandards.length > 0) {
        $q.notify({
          message: `Please complete effectiveness criteria for Performance Standard ${invalidStandards.map((i) => i + 1).join(', ')}`,
          color: 'negative',
          position: 'top',
        })
        return
      }

      // If validation passes, proceed with submission
      $q.notify({
        message: 'Form submitted successfully',
        color: 'positive',
        icon: 'check_circle',
      })
      console.log('Form submitted:', form.value)
      console.log('Performance Standards:', performanceStandards.value)
    }

    const onCancel = () => {
      $q.notify({
        message: 'Operation cancelled',
        color: 'warning',
        icon: 'warning',
      })
      // Reset form
      form.value = {
        unit: null,
        section: null,
        division: null,
        semester: semesterOptions[0],
        year: new Date().getFullYear(),
        employee: null,
      }
      filteredEmployees.value = []
      formInteracted.value = false
      shouldValidate.value = false

      // Reset all performance standards to default
      performanceStandards.value = [createDefaultPerformanceStandard()]
    }

    onMounted(() => {
      form.value.semester = semesterOptions[0]
      filteredEmployees.value = []
      formInteracted.value = false
      shouldValidate.value = false

      // Initialize all performance standards
      performanceStandards.value.forEach((_, index) => {
        generateSuccessIndicator(index)
      })
    })

    return {
      // Form data
      form,
      divisionOptions,
      filteredSections,
      filteredUnits,
      semesterOptions,
      yearOptions,
      filteredEmployees,
      selectedEmployee,

      // Validation states
      formInteracted,
      shouldValidate,
      hasMinimumEffectivenessValues,
      getEffectivenessErrorCount,
      isFormValid,

      // Computed helpers
      hasOrganizationalSelection,

      // MFO and Competencies data
      skipMfo,
      categoryOptions,
      getFilteredMfoOptions,
      getFilteredOutputOptions,
      mergedCoreCompetency,
      mergedTechnicalCompetency,
      mergedLeadershipCompetency,

      // Standard Outcome data
      standardOutcomeColumns,
      showQuantityModal,
      quantityValue,
      currentStandardIndex,
      quantityIndicator,

      // Performance Standards
      performanceStandards,
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
      onCancel,

      // Update handlers for auto-generation
      onQuantityUpdate,
      onTimelinessUpdate,
      onEffectivenessUpdate,
    }
  },
}
</script>

<style>
.q-card {
  border-radius: 4px;
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

/* Textarea styling */
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

/* Table styles */
.standard-outcome-table {
  width: 100%;
  table-layout: fixed !important; /* Force fixed table layout */
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

/* Modal styles */
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

@media (max-width: 768px) {
  .col-md-2,
  .col-md-3,
  .col-md-4 {
    width: 100%;
    margin-bottom: 16px;
  }

  .competency-list > div {
    white-space: normal;
  }
}

/* Animation styles for expand/collapse */
.q-slide-transition {
  transition: all 0.3s ease;
}

/* Collapsible card styling */
.bg-grey-2 {
  background-color: #f5f5f5;
}

/* Add button styling */
.justify-center .q-btn {
  transition: transform 0.2s ease;
}

.justify-center .q-btn:hover {
  transform: scale(1.05);
}

/* Performance standard card hover effect */
.q-card {
  transition: box-shadow 0.2s ease;
}

.q-card:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}
</style>
