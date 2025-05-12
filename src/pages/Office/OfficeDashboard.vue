<template>
  <q-page class="q-pa-md">
    <div class="q-mb-sm">
      <h1 class="text-h6 q-mb-none">Target Setting</h1>
      <p class="text-grey-7">Add targets for employee indicator</p>
    </div>

    <div class="row q-col-gutter-sm">
      <!-- Left Side Column -->
      <div class="col-12 col-md-3">
        <div class="column q-gutter-sm">
          <!-- Target Period Details Card -->
          <q-card flat bordered>
            <q-card-section class="q-pa-sm">
              <div class="text-subtitle2">Target Period Details</div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pa-sm">
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

                <q-separator />

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
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Right Side Column -->
      <div class="col-12 col-md-9">
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

            <!-- Performance Indicators Section -->
            <div v-if="form.employee" class="q-mt-md">
              <q-separator class="q-mb-md" />

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
                          v-model="rows[0].category"
                          label="Select Category"
                          :options="categoryOptions"
                          map-options
                          @update:model-value="clearDependentFields(1)"
                        >
                          <template v-slot:prepend>
                            <q-icon name="category" size="xs" />
                          </template>
                        </q-select>

                        <q-select
                          v-if="!skipMfo"
                          outlined
                          dense
                          v-model="rows[1].mfo"
                          label="Select MFO"
                          :options="filteredMfoOptions"
                          :disable="!rows[0].category"
                          @update:model-value="clearDependentFields(2)"
                        >
                          <template v-slot:prepend>
                            <q-icon name="list_alt" size="xs" />
                          </template>
                        </q-select>

                        <q-select
                          outlined
                          dense
                          v-model="rows[2].output"
                          label="Select Output"
                          :options="filteredOutputOptions"
                          :disable="(!rows[1].mfo && !skipMfo) || !rows[0].category"
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
                              <div class="text-caption text-weight-medium">Core Competencies</div>
                            </q-card-section>
                            <q-separator />
                            <q-card-section class="q-pa-sm">
                              <div class="competency-list">
                                <template v-if="Object.keys(mergedCoreCompetency).length > 0">
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
                                Technical Competencies
                              </div>
                            </q-card-section>
                            <q-separator />
                            <q-card-section class="q-pa-sm">
                              <div class="competency-list">
                                <template v-if="Object.keys(mergedTechnicalCompetency).length > 0">
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
                                Leadership Competencies
                              </div>
                            </q-card-section>
                            <q-separator />
                            <q-card-section class="q-pa-sm">
                              <div class="competency-list">
                                <template v-if="Object.keys(mergedLeadershipCompetency).length > 0">
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
                    <div class="col-md-4">
                      <q-input
                        outlined
                        dense
                        v-model="mergedSuccessIndicator"
                        type="textarea"
                        label="Success Indicator"
                        autogrow
                      />
                    </div>
                    <div class="col-md-4">
                      <q-input
                        outlined
                        dense
                        v-model="mergedRequiredOutput"
                        type="textarea"
                        label="Required Output"
                        autogrow
                      />
                    </div>
                    <div class="col-md-4">
                      <q-input
                        outlined
                        dense
                        v-model="mergedMVerification"
                        type="textarea"
                        label="Mode of Verification"
                        autogrow
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Standard Outcome Section -->
              <q-card flat bordered class="q-mt-md">
                <q-card-section class="q-pa-sm">
                  <div class="text-subtitle2">Standard Outcome</div>
                </q-card-section>
                <q-separator />
                <q-card-section class="q-pa-sm">
                  <div class="q-pa-md" style="max-width: 100%">
                    <q-table
                      :rows="standardOutcomeRows"
                      :columns="standardOutcomeColumns"
                      row-key="rating"
                      hide-bottom
                      bordered
                      flat
                      dense
                      class="standard-outcome-table"
                    >
                      <!-- Header with dropdown only for quantity -->
                      <template v-slot:header-cell-quantity="props">
                        <q-th :props="props" class="header-dropdown-cell">
                          <q-select
                            v-model="quantityIndicatorType"
                            :options="quantityIndicator"
                            dense
                            outlined
                            emit-value
                            map-options
                            behavior="menu"
                            class="header-select"
                          />
                        </q-th>
                      </template>

                      <!-- Simple headers for timeliness and effectiveness -->
                      <template v-slot:header-cell-timeliness="props">
                        <q-th :props="props">Timeliness</q-th>
                      </template>
                      <template v-slot:header-cell-effectiveness="props">
                        <q-th :props="props">Effectiveness</q-th>
                      </template>

                      <!-- Body cells with inputs -->
                      <template v-slot:body-cell-quantity="props">
                        <q-td :props="props" class="input-cell">
                          <q-input
                            v-if="quantityIndicatorType === 'numeric'"
                            v-model="props.row.quantity"
                            dense
                            outlined
                            placeholder="Enter custom target"
                            :rules="[validateStrictNumeric]"
                            @keydown="blockInvalidChars"
                            @update:model-value="sanitizeNumericInput(props.row, 'quantity')"
                          />
                          <div v-else class="numeric-display">
                            {{ props.row.quantity || '-' }}
                          </div>
                        </q-td>
                      </template>

                      <template v-slot:body-cell-effectiveness="props">
                        <q-td :props="props" class="input-cell">
                          <q-input
                            v-model="props.row.effectiveness"
                            type="textarea"
                            dense
                            autogrow
                            outlined
                            placeholder="Enter effectiveness criteria"
                          />
                        </q-td>
                      </template>

                      <template v-slot:body-cell-timeliness="props">
                        <q-td :props="props" class="input-cell">
                          <q-input
                            v-model="props.row.timeliness"
                            type="textarea"
                            dense
                            autogrow
                            outlined
                            placeholder="Enter timeliness criteria"
                          />
                        </q-td>
                      </template>
                    </q-table>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Target Input Modal -->
    <q-dialog v-model="showTargetModal" persistent>
      <q-card style="min-width: 400px; border-radius: 8px">
        <q-card-section class="modal-header">
          <div class="text-h6">Enter Target Output</div>
        </q-card-section>

        <q-card-section class="modal-body">
          <q-input
            v-model.number="targetValue"
            label="Target Output"
            type="number"
            outlined
            dense
            :rules="[(val) => val > 0 || 'Must be greater than 0']"
            @keypress="blockInvalidChars"
          />
        </q-card-section>

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup @click="cancelTargetInput" />
          <q-btn label="Calculate" color="green" unelevated @click="computeQuantities" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="row justify-end q-mt-sm">
      <q-btn label="Cancel" color="grey" flat dense class="q-mr-sm" @click="onCancel" />
      <q-btn label="Submit" color="primary" dense @click="onSubmit" :disable="!isFormValid" />
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'

export default {
  setup() {
    const $q = useQuasar()

    const form = ref({
      unit: null,
      section: null,
      division: null,
      semester: null,
      year: new Date().getFullYear(),
      employee: null,
    })

    // Add MFO and Competencies related data
    const rows = ref([{ category: null }, { mfo: null }, { output: null }])

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

    const filteredMfoOptions = computed(() => {
      if (!rows.value[0].category) return []
      return mfoOptions.value.filter((mfo) => mfo.category === rows.value[0].category?.value)
    })

    const filteredOutputOptions = computed(() => {
      if (!rows.value[1].mfo) return []
      return outputOptions.value.filter((out) => out.mfo === rows.value[1].mfo?.value)
    })

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

    const mergedSuccessIndicator = ref(
      'Successfully complete all assigned projects with 95% quality rating',
    )
    const mergedRequiredOutput = ref('5 completed projects with documentation')
    const mergedMVerification = ref('Project reports and client feedback')

    // Standard Outcome related data
    const standardOutcomeColumns = [
      { name: 'rating', label: 'Rating', field: 'rating', align: 'center' },
      { name: 'quantity', label: 'Quantity', field: 'quantity', align: 'center' },
      { name: 'effectiveness', label: 'Effectiveness', field: 'effectiveness', align: 'center' },
      { name: 'timeliness', label: 'Timeliness', field: 'timeliness', align: 'center' },
    ]

    const standardOutcomeRows = ref([
      { rating: '5', quantity: '', effectiveness: '', timeliness: '' },
      { rating: '4', quantity: '', effectiveness: '', timeliness: '' },
      { rating: '3', quantity: '', effectiveness: '', timeliness: '' },
      { rating: '2', quantity: '', effectiveness: '', timeliness: '' },
      { rating: '1', quantity: '', effectiveness: '', timeliness: '' },
    ])

    const quantityIndicator = [
      { label: 'Quantity (A. Custom Target)', value: 'numeric' },
      { label: 'Quantity (B. Can exceed 100%)', value: 'B' },
      { label: 'Quantity (C. Cannot exceed 100%)', value: 'C' },
    ]

    const quantityIndicatorType = ref('numeric')
    const showTargetModal = ref(false)
    const targetValue = ref(null)

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

    const employeesFilter = ref('')
    const filteredEmployees = ref([])
    const semesterOptions = ['January-June', 'July-December']
    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
    const divisionOptions = divisions.value

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

    const isFormValid = computed(() => {
      return form.value.employee && form.value.year && form.value.semester
    })

    watch([() => form.value.division, () => form.value.section, () => form.value.unit], () => {
      filterEmployees()
      form.value.employee = null // Reset employee selection when org structure changes
    })

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
      return [] // Return empty array when no organizational unit selected
    }

    const onDivisionChange = () => {
      form.value.section = null
      form.value.unit = null
    }

    const onSectionChange = () => {
      form.value.unit = null
    }

    const clearDependentFields = (index) => {
      // Clear fields that depend on the changed field
      for (let i = index; i < rows.value.length; i++) {
        rows.value[i] = { ...rows.value[i], [Object.keys(rows.value[i])[0]]: null }
      }
    }

    // Standard Outcome methods
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

      // Case 1: Single number
      if (!val.includes('-')) {
        return !isNaN(val) || 'Must be a number'
      }

      // Case 2: Range
      const parts = val.split('-')
      if (parts.length !== 2 || parts.some((p) => !p)) return 'Use format: min-max'

      const min = Number(parts[0])
      const max = Number(parts[1])

      if (isNaN(min) || isNaN(max)) return 'Both must be numbers'
      if (min >= max) return 'Min must be less than max'

      return true
    }

    const computeQuantities = () => {
      if (quantityIndicatorType.value === 'B' && (!targetValue.value || isNaN(targetValue.value))) {
        $q.notify({
          message: 'Please enter a valid number',
          color: 'negative',
          position: 'top',
        })
        return
      }

      // Reset rows
      standardOutcomeRows.value.forEach((row) => {
        row.quantity = ''
      })

      if (quantityIndicatorType.value === 'B') {
        const base = Number(targetValue.value)
        standardOutcomeRows.value[0].quantity = `${Math.ceil(base * 1.3)} and above`
        standardOutcomeRows.value[1].quantity = `${Math.ceil(base * 1.15)}-${Math.floor(base * 1.3) - 1}`
        standardOutcomeRows.value[2].quantity = `${base}-${Math.floor(base * 1.15) - 1}`
        standardOutcomeRows.value[3].quantity = `${Math.ceil(base * 0.51)}-${Math.floor(base * 0.99)}`
        standardOutcomeRows.value[4].quantity = `${Math.floor(base * 0.5)} and below`

        $q.notify({
          message: 'Quantities calculated successfully',
          color: 'positive',
          position: 'top',
        })
      } else if (quantityIndicatorType.value === 'C') {
        standardOutcomeRows.value[0].quantity = '100% and above'
        standardOutcomeRows.value[1].quantity = '88%-99%'
        standardOutcomeRows.value[2].quantity = '77%-87%'
        standardOutcomeRows.value[3].quantity = '38%-76%'
        standardOutcomeRows.value[4].quantity = '37% and below'
      }
      showTargetModal.value = false
    }

    const cancelTargetInput = () => {
      quantityIndicatorType.value = 'numeric'
      showTargetModal.value = false
    }

    watch(quantityIndicatorType, (val) => {
      if (val === 'B') {
        targetValue.value = null
        showTargetModal.value = true
      } else if (val === 'C') {
        computeQuantities()
      } else if (val === 'numeric') {
        standardOutcomeRows.value.forEach((row) => {
          row.quantity = ''
        })
      }
    })

    const onSubmit = () => {
      $q.notify({
        message: 'Form submitted successfully',
        color: 'positive',
        icon: 'check_circle',
      })
      console.log('Form submitted:', form.value)
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
    }

    onMounted(() => {
      form.value.semester = semesterOptions[0]
      filteredEmployees.value = [] // Initialize with empty array
    })

    return {
      form,
      divisionOptions,
      filteredSections,
      filteredUnits,
      semesterOptions,
      yearOptions,
      filteredEmployees,
      employeesFilter,
      selectedEmployee,
      isFormValid,
      hasOrganizationalSelection,
      filterEmployees,
      onDivisionChange,
      onSectionChange,
      onSubmit,
      onCancel,
      // MFO and Competencies related
      rows,
      skipMfo,
      categoryOptions,
      filteredMfoOptions,
      filteredOutputOptions,
      mergedCoreCompetency,
      mergedTechnicalCompetency,
      mergedLeadershipCompetency,
      mergedSuccessIndicator,
      mergedRequiredOutput,
      mergedMVerification,
      clearDependentFields,
      // Standard Outcome related
      standardOutcomeColumns,
      standardOutcomeRows,
      quantityIndicator,
      quantityIndicatorType,
      showTargetModal,
      targetValue,
      blockInvalidChars,
      sanitizeNumericInput,
      validateStrictNumeric,
      computeQuantities,
      cancelTargetInput,
    }
  },
}
</script>

<style scoped>
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

.auto-expand-textarea {
  min-height: 100px;
}

.q-field--dense .q-field__control {
  height: 40px;
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

/* Standard Outcome table styles */
.standard-outcome-table {
  width: 100%;
}

.header-dropdown-cell {
  padding: 0;
}

.header-select {
  width: 100%;
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
</style>
