<template>
  <q-card style="width: 90vw; max-width: 1200px; border-radius: 12px">
    <!-- Header -->
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
      <q-btn flat round dense icon="close" color="white" @click="$emit('close')" class="q-mr-sm" />
    </q-card-section>

    <!-- Loading State -->
    <q-inner-loading :showing="opcrStore.loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>

    <!-- Content -->
    <q-card-section
      v-if="!opcrStore.loading"
      style="overflow-y: auto; max-height: 70vh; padding: 16px"
    >
      <!-- Employee Info -->
      <div v-if="opcrStore.employeeInfo" class="q-mb-md">
        <div class="text-h6">{{ opcrStore.employeeInfo.name }}</div>
        <div class="text-caption text-grey-7">
          Control No: {{ opcrStore.employeeInfo.controlNo }}
        </div>
      </div>

      <!-- 1. STRATEGIC FUNCTION Table -->
      <div v-if="strategicData.length > 0" class="section-container q-mb-lg">
        <div class="section-title q-mb-sm">A. STRATEGIC FUNCTION</div>
        <div class="competency-table">
          <table class="fixed-table">
            <thead>
              <tr>
                <th class="text-center" style="width: 20%">MFO/Output</th>
                <th class="text-center" style="width: 25%">Success Indicator</th>
                <th class="text-center" style="width: 15%">Alloted Budget</th>
                <th class="text-center" style="width: 20%">Division/Individual Accountable</th>
                <th class="text-center" style="width: 20%">Actual Accomplishment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in strategicData" :key="item.id">
                <td class="text-center word-wrap">{{ item.mfo || item.output }}</td>
                <td class="text-center word-wrap">{{ item.success_indicator }}</td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="item.budget"
                    placeholder="Enter budget"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`strategic_budget_${idx}`] }"
                    :error="errors[`strategic_budget_${idx}`]"
                    error-message="Field is required"
                  >
                    <template v-slot:prepend>
                      <q-icon name="money" size="xs" />
                    </template>
                  </q-input>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="item.accountable"
                    placeholder="Enter division/individual"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`strategic_accountable_${idx}`] }"
                    :error="errors[`strategic_accountable_${idx}`]"
                    error-message="Field is required"
                  >
                    <template v-slot:prepend>
                      <q-icon name="people" size="xs" />
                    </template>
                  </q-input>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="item.accomplishment"
                    placeholder="Enter actual accomplishment"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`strategic_accomplishment_${idx}`] }"
                    :error="errors[`strategic_accomplishment_${idx}`]"
                    error-message="Field is required"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" size="xs" />
                    </template>
                  </q-input>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. CORE FUNCTION Table -->
      <div v-if="coreData.length > 0" class="section-container q-mb-lg">
        <div class="section-title q-mb-sm">B. CORE FUNCTION</div>
        <div class="competency-table">
          <table class="fixed-table">
            <thead>
              <tr>
                <th class="text-center" style="width: 20%">MFO/Output</th>
                <th class="text-center" style="width: 25%">Success Indicator</th>
                <th class="text-center" style="width: 15%">Alloted Budget</th>
                <th class="text-center" style="width: 20%">Division/Individual Accountable</th>
                <th class="text-center" style="width: 20%">Actual Accomplishment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in coreData" :key="item.id">
                <td class="text-center word-wrap">{{ item.mfo || item.output }}</td>
                <td class="text-center word-wrap">{{ item.success_indicator }}</td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="item.budget"
                    placeholder="Enter budget"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`core_budget_${idx}`] }"
                    :error="errors[`core_budget_${idx}`]"
                    error-message="Field is required"
                  >
                    <template v-slot:prepend>
                      <q-icon name="money" size="xs" />
                    </template>
                  </q-input>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="item.accountable"
                    placeholder="Enter division/individual"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`core_accountable_${idx}`] }"
                    :error="errors[`core_accountable_${idx}`]"
                    error-message="Field is required"
                  >
                    <template v-slot:prepend>
                      <q-icon name="people" size="xs" />
                    </template>
                  </q-input>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="item.accomplishment"
                    placeholder="Enter actual accomplishment"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`core_accomplishment_${idx}`] }"
                    :error="errors[`core_accomplishment_${idx}`]"
                    error-message="Field is required"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" size="xs" />
                    </template>
                  </q-input>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. SUPPORT FUNCTION Table -->
      <div v-if="supportData.length > 0" class="section-container q-mb-lg">
        <div class="section-title q-mb-sm">C. SUPPORT FUNCTION</div>
        <div class="competency-table">
          <table class="fixed-table">
            <thead>
              <tr>
                <th class="text-center" style="width: 20%">Output</th>
                <th class="text-center" style="width: 25%">Success Indicator</th>
                <th class="text-center" style="width: 15%">Alloted Budget</th>
                <th class="text-center" style="width: 20%">Division/Individual Accountable</th>
                <th class="text-center" style="width: 20%">Actual Accomplishment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in supportData" :key="item.id">
                <td class="text-center word-wrap">{{ item.output }}</td>
                <td class="text-center word-wrap">{{ item.success_indicator }}</td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="item.budget"
                    placeholder="Enter budget"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`support_budget_${idx}`] }"
                    :error="errors[`support_budget_${idx}`]"
                    error-message="Field is required"
                  >
                    <template v-slot:prepend>
                      <q-icon name="money" size="xs" />
                    </template>
                  </q-input>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="item.accountable"
                    placeholder="Enter division/individual"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`support_accountable_${idx}`] }"
                    :error="errors[`support_accountable_${idx}`]"
                    error-message="Field is required"
                  >
                    <template v-slot:prepend>
                      <q-icon name="people" size="xs" />
                    </template>
                  </q-input>
                </td>
                <td class="text-center">
                  <q-input
                    dense
                    outlined
                    v-model="item.accomplishment"
                    placeholder="Enter actual accomplishment"
                    class="full-width modern-input"
                    :class="{ 'shake-animation': errors[`support_accomplishment_${idx}`] }"
                    :error="errors[`support_accomplishment_${idx}`]"
                    error-message="Field is required"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" size="xs" />
                    </template>
                  </q-input>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </q-card-section>

    <!-- Actions -->
    <q-card-actions align="right" class="q-pa-md">
      <q-btn
        label="Cancel"
        color="grey"
        unelevated
        @click="handleCancel"
        rounded
        class="action-btn q-mr-sm"
        :disable="opcrStore.saving"
      />
      <q-btn
        label="Save"
        icon="save"
        color="primary"
        unelevated
        @click="showConfirmDialog"
        rounded
        class="action-btn"
        :loading="opcrStore.saving"
        :disable="opcrStore.loading"
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
          <q-btn flat label="Save" color="primary" @click="handleSave" />
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
          <q-btn flat label="OK" color="positive" v-close-popup @click="$emit('close')" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useOpcrStore } from 'src/stores/opcrStore'

export default {
  name: 'OPCRModal',

  props: {
    employee: {
      type: Object,
      required: true,
    },
    targetPeriod: {
      type: Object,
      required: true,
    },
  },

  emits: ['close'],

  setup(props, { emit }) {
    const $q = useQuasar()
    const opcrStore = useOpcrStore()

    // State
    const confirmDialogOpen = ref(false)
    const successDialogOpen = ref(false)
    const errors = ref({})

    // Reactive data for form inputs
    const strategicData = ref([])
    const coreData = ref([])
    const supportData = ref([])

    // Initialize form data from store
    const initializeFormData = () => {
      // Strategic functions
      strategicData.value = opcrStore.strategicFunctions.map((item) => ({
        ...item,
        budget: item.opcr?.budget || '',
        accountable: item.opcr?.accountable || '',
        accomplishment: item.opcr?.accomplishment || '',
        competency: item.opcr?.competency || [],
        rating_q: item.opcr?.rating_q || 0,
        rating_e: item.opcr?.rating_e || 0,
        rating_t: item.opcr?.rating_t || 0,
        rating_a: item.opcr?.rating_a || 0,
        proficiency: item.opcr?.proficiency || [],
        remarks: item.opcr?.remarks || '',
      }))

      // Core functions
      coreData.value = opcrStore.coreFunctions.map((item) => ({
        ...item,
        budget: item.opcr?.budget || '',
        accountable: item.opcr?.accountable || '',
        accomplishment: item.opcr?.accomplishment || '',
        competency: item.opcr?.competency || [],
        rating_q: item.opcr?.rating_q || 0,
        rating_e: item.opcr?.rating_e || 0,
        rating_t: item.opcr?.rating_t || 0,
        rating_a: item.opcr?.rating_a || 0,
        proficiency: item.opcr?.proficiency || [],
        remarks: item.opcr?.remarks || '',
      }))

      // Support functions
      supportData.value = opcrStore.supportFunctions.map((item) => ({
        ...item,
        budget: item.opcr?.budget || '',
        accountable: item.opcr?.accountable || '',
        accomplishment: item.opcr?.accomplishment || '',
        competency: item.opcr?.competency || [],
        rating_q: item.opcr?.rating_q || 0,
        rating_e: item.opcr?.rating_e || 0,
        rating_t: item.opcr?.rating_t || 0,
        rating_a: item.opcr?.rating_a || 0,
        proficiency: item.opcr?.proficiency || [],
        remarks: item.opcr?.remarks || '',
      }))
    }

    // Validate form
    const validateForm = () => {
      let isValid = true
      errors.value = {}

      // Validate strategic
      strategicData.value.forEach((item, idx) => {
        if (!item.budget) {
          errors.value[`strategic_budget_${idx}`] = true
          isValid = false
        }
        if (!item.accountable) {
          errors.value[`strategic_accountable_${idx}`] = true
          isValid = false
        }
        if (!item.accomplishment) {
          errors.value[`strategic_accomplishment_${idx}`] = true
          isValid = false
        }
      })

      // Validate core
      coreData.value.forEach((item, idx) => {
        if (!item.budget) {
          errors.value[`core_budget_${idx}`] = true
          isValid = false
        }
        if (!item.accountable) {
          errors.value[`core_accountable_${idx}`] = true
          isValid = false
        }
        if (!item.accomplishment) {
          errors.value[`core_accomplishment_${idx}`] = true
          isValid = false
        }
      })

      // Validate support
      supportData.value.forEach((item, idx) => {
        if (!item.budget) {
          errors.value[`support_budget_${idx}`] = true
          isValid = false
        }
        if (!item.accountable) {
          errors.value[`support_accountable_${idx}`] = true
          isValid = false
        }
        if (!item.accomplishment) {
          errors.value[`support_accomplishment_${idx}`] = true
          isValid = false
        }
      })

      return isValid
    }

    // Show confirmation dialog
    const showConfirmDialog = () => {
      if (!validateForm()) {
        $q.notify({
          type: 'negative',
          message: 'Please fill all required fields',
          position: 'top',
          timeout: 2500,
        })
        return
      }
      confirmDialogOpen.value = true
    }

    // Handle cancel
    const handleCancel = () => {
      emit('close')
    }

    // Handle save
    const handleSave = async () => {
      confirmDialogOpen.value = false

      try {
        // Prepare data for submission - combine all categories
        const allData = [...strategicData.value, ...coreData.value, ...supportData.value]

        // Map to the required API format
        const formData = allData.map((item) => ({
          id: item.id, // performance_standard_id
          budget: item.budget,
          accountable: item.accountable,
          accomplishment: item.accomplishment,
          competency: item.competency || [],
          rating_q: item.rating_q || 0,
          rating_e: item.rating_e || 0,
          rating_t: item.rating_t || 0,
          rating_a: item.rating_a || 0,
          proficiency: item.proficiency || [],
          remarks: item.remarks || '',
        }))

        // Submit to store
        await opcrStore.submitOpcr(formData)

        // Show success
        successDialogOpen.value = true

        $q.notify({
          type: 'positive',
          message: 'OPCR saved successfully!',
          position: 'top',
          timeout: 2500,
          actions: [{ icon: 'close', color: 'white' }],
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message || 'Failed to save OPCR',
          position: 'top',
          timeout: 3000,
        })
      }
    }

    // Load data on mount
    onMounted(async () => {
      try {
        const controlNo = props.employee.employeeData?.ControlNo || props.employee.ControlNo
        const semester = props.targetPeriod?.semester
        const year = props.targetPeriod?.year

        if (!controlNo || !semester || !year) {
          $q.notify({
            type: 'warning',
            message: 'Missing employee or target period information',
            position: 'top',
          })
          return
        }

        await opcrStore.fetchOpcrData(controlNo, semester, year)
        initializeFormData()
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Failed to load OPCR data',
          position: 'top',
        })
      }
    })

    return {
      opcrStore,
      confirmDialogOpen,
      successDialogOpen,
      errors,
      strategicData,
      coreData,
      supportData,
      showConfirmDialog,
      handleCancel,
      handleSave,
    }
  },
}
</script>

<style scoped>
.fixed-table {
  table-layout: fixed;
  width: 100%;
}

.word-wrap {
  word-wrap: break-word;
  white-space: normal;
  overflow-wrap: break-word;
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

  thead {
    background-color: #767575;
  }

  th {
    font-weight: 500;
    color: #ffffff;
    font-size: 0.9rem;
  }

  tbody {
    background-color: white;
  }

  tbody tr:hover {
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
</style>
