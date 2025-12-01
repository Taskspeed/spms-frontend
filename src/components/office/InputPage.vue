<template>
  <q-card style="width: 90vw; max-width: 1200px; border-radius: 12px">
    <q-card-section
      class="header-section row items-center justify-between"
      style="
        background-color: #00703c;
        height: 50px;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      "
    >
      <div class="text-h6 text-white q-pl-md">Office Performance Commitment and Review (OPCR)</div>
    </q-card-section>

    <q-card-section style="overflow-y: auto; max-height: 70vh; padding: 16px">
      <!-- 1. STRATEGIC FUNCTION Table -->
      <div class="section-container q-mb-lg" v-if="strategicFunctions.length > 0">
        <div class="section-title q-mb-sm">A. STRATEGIC FUNCTION</div>
        <div class="competency-table">
          <table class="fixed-table">
            <thead>
              <tr>
                <th class="text-center" rowspan="2" style="width: 20%">Function</th>
                <th class="text-center" colspan="3" style="width: 25%">
                  Required Competency & Proficiency Level
                </th>
                <th class="text-center" rowspan="2" style="width: 15%">Alloted Budget</th>
                <th class="text-center" rowspan="2" style="width: 15%">
                  Division/Individual Accountable
                </th>
                <th class="text-center" rowspan="2" style="width: 15%">Actual Accomplishment</th>
              </tr>
              <tr>
                <th class="text-center">Core</th>
                <th class="text-center">Technical</th>
                <th class="text-center">Leadership</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in strategicFunctions" :key="'strategic-' + index">
                <td class="text-center word-wrap">
                  {{ item.mfo || 'Strategic Function ' + (index + 1) }}
                </td>
                <td class="text-center word-wrap">
                  <span v-if="item.core_competency">
                    <div
                      v-for="(level, competency) in item.core_competency"
                      :key="'core-' + competency"
                    >
                      {{ getCompetencyCode('core', competency) }} ({{ getProficiencyLevel(level) }})
                    </div>
                  </span>
                </td>
                <td class="text-center word-wrap">
                  <span v-if="item.technical_competency">
                    <div
                      v-for="(level, competency) in item.technical_competency"
                      :key="'tech-' + competency"
                    >
                      {{ getCompetencyCode('technical', competency) }} ({{
                        getProficiencyLevel(level)
                      }})
                    </div>
                  </span>
                </td>
                <td class="text-center word-wrap">
                  <span v-if="item.leadership_competency">
                    <div
                      v-for="(level, competency) in item.leadership_competency"
                      :key="'leader-' + competency"
                    >
                      {{ getCompetencyCode('leadership', competency) }} ({{
                        getProficiencyLevel(level)
                      }})
                    </div>
                  </span>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="strategicBudget[index]"
                    placeholder="Enter budget"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`strategicBudget${index}`] }"
                    :error="errors[`strategicBudget${index}`]"
                    error-message="Field is required"
                    lazy-rules
                    @blur="validateField(`strategicBudget${index}`)"
                    :ref="`strategicBudgetRef${index}`"
                  >
                    <template v-slot:prepend>
                      <q-icon name="money" />
                    </template>
                  </q-input>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="strategicAccountable[index]"
                    placeholder="Enter division/individual"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`strategicAccountable${index}`] }"
                    :error="errors[`strategicAccountable${index}`]"
                    error-message="Field is required"
                    lazy-rules
                    @blur="validateField(`strategicAccountable${index}`)"
                    :ref="`strategicAccountableRef${index}`"
                  >
                    <template v-slot:prepend>
                      <q-icon name="people" />
                    </template>
                  </q-input>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="strategicAccomplishment[index]"
                    placeholder="Enter actual accomplishment"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`strategicAccomplishment${index}`] }"
                    :error="errors[`strategicAccomplishment${index}`]"
                    error-message="Field is required"
                    lazy-rules
                    @blur="validateField(`strategicAccomplishment${index}`)"
                    :ref="`strategicAccomplishmentRef${index}`"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" />
                    </template>
                  </q-input>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. CORE FUNCTION Table -->
      <div class="section-container q-mb-lg" v-if="coreFunctions.length > 0">
        <div class="section-title q-mb-sm">B. CORE FUNCTION</div>
        <div class="competency-table">
          <table class="fixed-table">
            <thead>
              <tr>
                <th class="text-center" rowspan="2" style="width: 20%">Function</th>
                <th class="text-center" colspan="3" style="width: 25%">
                  Required Competency & Proficiency Level
                </th>
                <th class="text-center" rowspan="2" style="width: 15%">Alloted Budget</th>
                <th class="text-center" rowspan="2" style="width: 15%">
                  Division/Individual Accountable
                </th>
                <th class="text-center" rowspan="2" style="width: 15%">Actual Accomplishment</th>
              </tr>
              <tr>
                <th class="text-center">Core</th>
                <th class="text-center">Technical</th>
                <th class="text-center">Leadership</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in coreFunctions" :key="'core-' + index">
                <td class="text-center word-wrap">
                  {{ item.mfo || 'Core Function ' + (index + 1) }}
                </td>
                <td class="text-center word-wrap">
                  <span v-if="item.core_competency">
                    <div
                      v-for="(level, competency) in item.core_competency"
                      :key="'core-' + competency"
                    >
                      {{ getCompetencyCode('core', competency) }} ({{ getProficiencyLevel(level) }})
                    </div>
                  </span>
                </td>
                <td class="text-center word-wrap">
                  <span v-if="item.technical_competency">
                    <div
                      v-for="(level, competency) in item.technical_competency"
                      :key="'tech-' + competency"
                    >
                      {{ getCompetencyCode('technical', competency) }} ({{
                        getProficiencyLevel(level)
                      }})
                    </div>
                  </span>
                </td>
                <td class="text-center word-wrap">
                  <span v-if="item.leadership_competency">
                    <div
                      v-for="(level, competency) in item.leadership_competency"
                      :key="'leader-' + competency"
                    >
                      {{ getCompetencyCode('leadership', competency) }} ({{
                        getProficiencyLevel(level)
                      }})
                    </div>
                  </span>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="coreBudget[index]"
                    placeholder="Enter budget"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`coreBudget${index}`] }"
                    :error="errors[`coreBudget${index}`]"
                    error-message="Field is required"
                    lazy-rules
                    @blur="validateField(`coreBudget${index}`)"
                    :ref="`coreBudgetRef${index}`"
                  >
                    <template v-slot:prepend>
                      <q-icon name="money" />
                    </template>
                  </q-input>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="coreAccountable[index]"
                    placeholder="Enter division/individual"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`coreAccountable${index}`] }"
                    :error="errors[`coreAccountable${index}`]"
                    error-message="Field is required"
                    lazy-rules
                    @blur="validateField(`coreAccountable${index}`)"
                    :ref="`coreAccountableRef${index}`"
                  >
                    <template v-slot:prepend>
                      <q-icon name="people" />
                    </template>
                  </q-input>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="coreAccomplishment[index]"
                    placeholder="Enter actual accomplishment"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`coreAccomplishment${index}`] }"
                    :error="errors[`coreAccomplishment${index}`]"
                    error-message="Field is required"
                    lazy-rules
                    @blur="validateField(`coreAccomplishment${index}`)"
                    :ref="`coreAccomplishmentRef${index}`"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" />
                    </template>
                  </q-input>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. SUPPORT FUNCTION Table -->
      <div class="section-container q-mb-lg" v-if="supportFunctions.length > 0">
        <div class="section-title q-mb-sm">C. SUPPORT FUNCTION</div>
        <div class="competency-table">
          <table class="fixed-table">
            <thead>
              <tr>
                <th class="text-center" rowspan="2" style="width: 20%">Function</th>
                <th class="text-center" colspan="3" style="width: 25%">
                  Required Competency & Proficiency Level
                </th>
                <th class="text-center" rowspan="2" style="width: 15%">Alloted Budget</th>
                <th class="text-center" rowspan="2" style="width: 15%">
                  Division/Individual Accountable
                </th>
                <th class="text-center" rowspan="2" style="width: 15%">Actual Accomplishment</th>
              </tr>
              <tr>
                <th class="text-center" colspan="3">Not Applicable</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in supportFunctions" :key="'support-' + index">
                <td class="text-center word-wrap">
                  {{ item.output || 'Support Function ' + (index + 1) }}
                </td>
                <td class="text-center word-wrap" colspan="3">Not Applicable</td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="supportBudget[index]"
                    placeholder="Enter budget"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`supportBudget${index}`] }"
                    :error="errors[`supportBudget${index}`]"
                    error-message="Field is required"
                    lazy-rules
                    @blur="validateField(`supportBudget${index}`)"
                    :ref="`supportBudgetRef${index}`"
                  >
                    <template v-slot:prepend>
                      <q-icon name="money" />
                    </template>
                  </q-input>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="supportAccountable[index]"
                    placeholder="Enter division/individual"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`supportAccountable${index}`] }"
                    :error="errors[`supportAccountable${index}`]"
                    error-message="Field is required"
                    lazy-rules
                    @blur="validateField(`supportAccountable${index}`)"
                    :ref="`supportAccountableRef${index}`"
                  >
                    <template v-slot:prepend>
                      <q-icon name="people" />
                    </template>
                  </q-input>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="supportAccomplishment[index]"
                    placeholder="Enter actual accomplishment"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`supportAccomplishment${index}`] }"
                    :error="errors[`supportAccomplishment${index}`]"
                    error-message="Field is required"
                    lazy-rules
                    @blur="validateField(`supportAccomplishment${index}`)"
                    :ref="`supportAccomplishmentRef${index}`"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" />
                    </template>
                  </q-input>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="right" class="q-pa-md">
      <q-btn
        label="Cancel"
        color="grey"
        unelevated
        @click="$emit('close')"
        rounded
        class="action-btn q-mr-sm"
      />
      <q-btn
        label="Save"
        icon="save"
        color="primary"
        unelevated
        @click="showConfirmDialog"
        rounded
        class="action-btn"
      />
    </q-card-actions>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="confirmDialogOpen" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="help_outline" color="primary" text-color="white" />
          <span class="q-ml-sm text-h6">Confirm Save</span>
        </q-card-section>

        <q-card-section> Are you sure you want to save this OPCR form? </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="validateAndSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Success Dialog -->
    <q-dialog v-model="successDialogOpen">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="check_circle" color="positive" text-color="white" />
          <span class="q-ml-sm text-h6">Success</span>
        </q-card-section>

        <q-card-section> OPCR form has been successfully saved! </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="positive" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useOpcrStore } from 'src/stores/office/opcrStore'
import { useUserStore } from 'src/stores/userStore'

export default {
  emits: ['save', 'close', 'error'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const opcrStore = useOpcrStore()
    const userStore = useUserStore()

    // Dynamic data for functions
    const strategicFunctions = ref([])
    const coreFunctions = ref([])
    const supportFunctions = ref([])
    const refs = ref({})

    // Initialize form data arrays
    const strategicBudget = ref([])
    const strategicAccountable = ref([])
    const strategicAccomplishment = ref([])

    const coreBudget = ref([])
    const coreAccountable = ref([])
    const coreAccomplishment = ref([])

    const supportBudget = ref([])
    const supportAccountable = ref([])
    const supportAccomplishment = ref([])

    // Load office head functions
    onMounted(async () => {
      try {
        const functions = await opcrStore.fetchOfficeHeadFunctions(userStore.user.office_id)

        // Process strategic function
        if (functions.strategic_function && functions.strategic_function.items) {
          strategicFunctions.value = functions.strategic_function.items
          strategicBudget.value = Array(strategicFunctions.value.length).fill('')
          strategicAccountable.value = Array(strategicFunctions.value.length).fill('')
          strategicAccomplishment.value = Array(strategicFunctions.value.length).fill('')
        }

        // Process core function (array of categories)
        if (functions.core_function && functions.core_function.length > 0) {
          // Flatten all core function items into one array
          coreFunctions.value = functions.core_function.flatMap((category) => category.items)
          coreBudget.value = Array(coreFunctions.value.length).fill('')
          coreAccountable.value = Array(coreFunctions.value.length).fill('')
          coreAccomplishment.value = Array(coreFunctions.value.length).fill('')
        }

        // Process support function
        if (functions.support_function && functions.support_function.items) {
          supportFunctions.value = functions.support_function.items
          supportBudget.value = Array(supportFunctions.value.length).fill('')
          supportAccountable.value = Array(supportFunctions.value.length).fill('')
          supportAccomplishment.value = Array(supportFunctions.value.length).fill('')
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load office head functions',
          position: 'top',
        })
        console.error('Error loading functions:', error)
      }
    })

    // Helper functions
    const getCompetencyCode = (type, competency) => {
      return opcrStore.codeMappings[type][competency] || competency.substring(0, 3).toUpperCase()
    }

    const getProficiencyLevel = (level) => {
      const levels = {
        1: 'B',
        2: 'I',
        3: 'A',
        4: 'S',
      }
      return levels[level] || 'N/A'
    }

    // Dialog controls
    const confirmDialogOpen = ref(false)
    const successDialogOpen = ref(false)

    // Error handling
    const errors = ref({})
    const firstInvalidFieldFocused = ref(false)

    const validateField = (fieldName) => {
      // Extract the index from the field name (e.g., "strategicBudget0" -> index 0)
      const index = parseInt(fieldName.match(/\d+/)?.[0] || 0)

      let isValid = false

      if (fieldName.startsWith('strategicBudget')) {
        isValid = !!strategicBudget.value[index]
      } else if (fieldName.startsWith('strategicAccountable')) {
        isValid = !!strategicAccountable.value[index]
      } else if (fieldName.startsWith('strategicAccomplishment')) {
        isValid = !!strategicAccomplishment.value[index]
      } else if (fieldName.startsWith('coreBudget')) {
        isValid = !!coreBudget.value[index]
      } else if (fieldName.startsWith('coreAccountable')) {
        isValid = !!coreAccountable.value[index]
      } else if (fieldName.startsWith('coreAccomplishment')) {
        isValid = !!coreAccomplishment.value[index]
      } else if (fieldName.startsWith('supportBudget')) {
        isValid = !!supportBudget.value[index]
      } else if (fieldName.startsWith('supportAccountable')) {
        isValid = !!supportAccountable.value[index]
      } else if (fieldName.startsWith('supportAccomplishment')) {
        isValid = !!supportAccomplishment.value[index]
      }

      errors.value[fieldName] = !isValid
      return isValid
    }

    const validateForm = () => {
      let isValid = true
      firstInvalidFieldFocused.value = false

      // Validate strategic functions
      strategicFunctions.value.forEach((_, index) => {
        if (!validateField(`strategicBudget${index}`)) isValid = false
        if (!validateField(`strategicAccountable${index}`)) isValid = false
        if (!validateField(`strategicAccomplishment${index}`)) isValid = false
      })

      // Validate core functions
      coreFunctions.value.forEach((_, index) => {
        if (!validateField(`coreBudget${index}`)) isValid = false
        if (!validateField(`coreAccountable${index}`)) isValid = false
        if (!validateField(`coreAccomplishment${index}`)) isValid = false
      })

      // Validate support functions
      supportFunctions.value.forEach((_, index) => {
        if (!validateField(`supportBudget${index}`)) isValid = false
        if (!validateField(`supportAccountable${index}`)) isValid = false
        if (!validateField(`supportAccomplishment${index}`)) isValid = false
      })

      return isValid
    }

    const shakeAllInvalidFields = () => {
      Object.keys(errors.value).forEach((field) => {
        if (errors.value[field]) {
          const refName = `${field}Ref`
          const ref = refs.value[refName]?.[0]
          if (ref) {
            ref.$el.classList.remove('shake-animation')
            void ref.$el.offsetWidth
            ref.$el.classList.add('shake-animation')
          }
        }
      })
    }

    const showConfirmDialog = () => {
      firstInvalidFieldFocused.value = false

      if (!validateForm()) {
        emit('error', 'Please fill all required fields')
        shakeAllInvalidFields()
        return
      }

      confirmDialogOpen.value = true
    }

    const validateAndSave = async () => {
      confirmDialogOpen.value = false

      const opcrData = {
        strategic: strategicFunctions.value.map((item, index) => ({
          function: item.mfo || `Strategic Function ${index + 1}`,
          budget: strategicBudget.value[index],
          accountable: strategicAccountable.value[index],
          accomplishment: strategicAccomplishment.value[index],
        })),
        core: coreFunctions.value.map((item, index) => ({
          function: item.mfo || `Core Function ${index + 1}`,
          budget: coreBudget.value[index],
          accountable: coreAccountable.value[index],
          accomplishment: coreAccomplishment.value[index],
        })),
        support: supportFunctions.value.map((item, index) => ({
          function: item.output || `Support Function ${index + 1}`,
          budget: supportBudget.value[index],
          accountable: supportAccountable.value[index],
          accomplishment: supportAccomplishment.value[index],
        })),
      }

      try {
        // Show success dialog
        successDialogOpen.value = true

        // Also show success notification
        $q.notify({
          type: 'positive',
          message: 'OPCR saved successfully!',
          position: 'top',
          timeout: 2500,
          actions: [{ icon: 'close', color: 'white' }],
        })

        emit('save', opcrData)
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to save OPCR',
          position: 'top',
        })
      }
    }

    return {
      strategicFunctions,
      coreFunctions,
      supportFunctions,
      strategicBudget,
      strategicAccountable,
      strategicAccomplishment,
      coreBudget,
      coreAccountable,
      coreAccomplishment,
      supportBudget,
      supportAccountable,
      supportAccomplishment,
      errors,
      validateField,
      showConfirmDialog,
      validateAndSave,
      confirmDialogOpen,
      successDialogOpen,
      getCompetencyCode,
      getProficiencyLevel,
      refs,
    }
  },
}
</script>

<style scoped>
/* Fixed table layout to prevent resizing */
.fixed-table {
  table-layout: fixed;
  width: 100%;
}

/* Word wrapping for table cells */
.word-wrap {
  word-wrap: break-word;
  white-space: normal;
  overflow-wrap: break-word;
}

/* Ensure consistent column widths across all tables */
.competency-table table {
  min-width: 100%;
}

.competency-table th,
.competency-table td {
  padding: 8px 10px;
}

/* Make sure the tables align properly */
.section-container {
  margin-bottom: 24px;
}

.header-section {
  padding-left: 16px;
  padding-right: 8px;
}

.section-container {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 16px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.section-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a2433;
  padding-left: 10px;
  border-left: 4px solid #1976d2;
  margin-bottom: 12px;
}

.mfo-header {
  border-radius: 6px;
  background-color: #f5f7fa;
  font-weight: 500;
  text-align: center;
}

.competency-table {
  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid #e0e0e0;
  }

  th,
  td {
    border: 1px solid #e0e0e0;
    padding: 10px;
    vertical-align: middle;
    color: #333;
  }

  :deep(th),
  :deep(td) {
    border: 1px solid #e0e0e0;
    padding: 8px;
    vertical-align: middle;
  }

  thead {
    background-color: #263238;
  }

  :deep(thead) {
    background-color: #f5f5f5;
  }

  th {
    font-weight: 500;
    color: #ffffff;
    font-size: 0.9rem;
  }

  :deep(thead th) {
    font-weight: 500;
    color: #424242;
  }

  :deep(tbody) {
    background-color: white;
  }

  :deep(tbody tr:hover) {
    background-color: #fafafa;
  }
}

:deep(.q-field--outlined .q-field__control) {
  height: 40px;
  min-height: 40px;
  border-radius: 6px;
}

:deep(.q-field--error .q-field__bottom) {
  padding-top: 4px;
  color: #f44336;
  font-size: 0.75rem;
}

.action-btn {
  min-width: 100px;
  padding: 6px 12px;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.shake-animation {
  animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .section-container {
    padding: 12px;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 1rem;
    padding-left: 8px;
    border-left: 3px solid #1976d2;
    margin-bottom: 8px;
  }

  .competency-table :deep(table) {
    font-size: 0.85rem;
  }

  .competency-table th,
  .competency-table td {
    padding: 6px;
  }

  .competency-table :deep(th),
  .competency-table :deep(td) {
    padding: 6px;
  }

  .competency-table :deep(thead th) {
    font-size: 0.8rem;
  }

  .competency-table :deep(tbody tr:hover) {
    background-color: #f9f9f9;
  }

  .action-btn {
    min-width: 80px;
    padding: 4px 8px;
    font-size: 0.85rem;
  }

  :deep(.q-field--outlined .q-field__control) {
    height: 36px;
    min-height: 36px;
  }

  :deep(.q-field--error .q-field__bottom) {
    font-size: 0.7rem;
  }
}

/* Adjust table for horizontal scrolling on smaller screens */
@media (max-width: 576px) {
  .competency-table :deep(table) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .competency-table th,
  .competency-table td {
    font-size: 0.75rem;
    padding: 4px;
  }

  .competency-table :deep(thead th) {
    font-size: 0.75rem;
  }

  .action-btn {
    font-size: 0.75rem;
    padding: 3px 6px;
  }
}
</style>
