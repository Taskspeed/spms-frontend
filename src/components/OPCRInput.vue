<template>
  <q-card class="opcr-dialog">
    <!-- Header -->
    <q-card-section class="bg-green-9 text-white row items-center q-py-sm">
      <div class="text-h6 q-pl-md">
        {{ hasExistingData ? 'Update' : 'Input' }} Office Performance Commitment and Review (OPCR)
      </div>
      <q-space />
      <q-btn flat round dense icon="close" @click="$emit('close')" />
    </q-card-section>

    <!-- Loading State -->
    <q-card-section v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="green-9" size="3rem" />
      <div class="text-grey-7 q-mt-md">Loading OPCR data...</div>
    </q-card-section>

    <!-- Error State -->
    <q-card-section v-else-if="error" class="text-center q-pa-xl">
      <q-icon name="error_outline" color="negative" size="3rem" />
      <div class="text-negative q-mt-md">{{ error }}</div>
      <q-btn flat color="green-9" label="Retry" @click="loadOpcrData" class="q-mt-md" />
    </q-card-section>

    <!-- Main Content -->
    <q-card-section
      v-else
      class="q-pa-md"
      style="max-height: 70vh; overflow-y: auto; overflow-x: hidden"
    >
      <!-- Dynamic Categories -->
      <template v-for="(category, catIndex) in categories" :key="catIndex">
        <q-card v-if="getCategoryStandards(category).length > 0" flat bordered class="q-mb-md">
          <q-card-section class="bg-grey-2">
            <div class="text-subtitle1 text-weight-medium">{{ category }}</div>
          </q-card-section>

          <q-card-section class="q-pa-none">
            <q-markup-table flat dense separator="cell" wrap-cells>
              <thead class="bg-grey-9 text-white">
                <tr>
                  <th class="text-left" style="width: 20%">MFO/Function</th>
                  <th class="text-left" style="width: 15%">Success Indicator</th>
                  <th class="text-left" style="width: 15%">Alloted Budget</th>
                  <th class="text-left" style="width: 20%">Division/Individual Accountable</th>
                  <th class="text-left" style="width: 30%">Actual Accomplishment</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(standard, stdIndex) in getCategoryStandards(category)"
                  :key="`std-${stdIndex}`"
                >
                  <!-- MFO/Function -->
                  <td style="width: 20%; word-wrap: break-word; white-space: normal">
                    <div class="text-body2">
                      {{ standard.mfo || standard.output || 'N/A' }}
                    </div>
                  </td>

                  <!-- Success Indicator -->
                  <td style="width: 15%; word-wrap: break-word; white-space: normal">
                    <div class="text-body2">
                      {{ standard.success_indicator || 'N/A' }}
                    </div>
                  </td>

                  <!-- Alloted Budget (Changed to text/varchar) -->
                  <td style="width: 15%">
                    <q-input
                      dense
                      outlined
                      v-model="standard.opcr.budget"
                      placeholder="e.g., ₱50,000 or N/A"
                      type="text"
                      :error="errors[`budget_${standard.id}`]"
                      error-message="Required"
                      @blur="validateField(`budget_${standard.id}`, standard.opcr.budget)"
                    >
                      <template v-slot:prepend>
                        <q-icon name="attach_money" size="xs" color="green-9" />
                      </template>
                    </q-input>
                  </td>

                  <!-- Division/Individual Accountable -->
                  <td style="width: 20%">
                    <q-input
                      dense
                      outlined
                      v-model="standard.opcr.accountable"
                      placeholder="Enter division"
                      :error="errors[`accountable_${standard.id}`]"
                      error-message="Required"
                      @blur="validateField(`accountable_${standard.id}`, standard.opcr.accountable)"
                    >
                      <template v-slot:prepend>
                        <q-icon name="people" size="xs" />
                      </template>
                    </q-input>
                  </td>

                  <!-- Actual Accomplishment -->
                  <td style="width: 30%">
                    <q-input
                      dense
                      outlined
                      v-model="standard.opcr.accomplishment"
                      placeholder="Enter accomplishment"
                      type="textarea"
                      rows="2"
                      :error="errors[`accomplishment_${standard.id}`]"
                      error-message="Required"
                      @blur="
                        validateField(`accomplishment_${standard.id}`, standard.opcr.accomplishment)
                      "
                    >
                      <template v-slot:prepend>
                        <q-icon name="description" size="xs" />
                      </template>
                    </q-input>
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card-section>
        </q-card>
      </template>

      <!-- No Data State -->
      <q-card v-if="categories.length === 0" flat bordered class="text-center q-pa-xl">
        <q-icon name="inbox" color="grey" size="3rem" />
        <div class="text-grey-7 q-mt-md">No performance standards available</div>
      </q-card>
    </q-card-section>

    <!-- Actions -->
    <q-separator />
    <q-card-actions align="right" class="q-pa-md">
      <q-btn label="Cancel" color="grey" flat @click="$emit('close')" class="q-mr-sm" />
      <q-btn
        :label="hasExistingData ? 'Update' : 'Save'"
        :icon="hasExistingData ? 'edit' : 'save'"
        :color="hasExistingData ? 'orange-9' : 'green-9'"
        unelevated
        @click="showConfirmDialog"
        :loading="saving"
        :disable="loading"
      />
    </q-card-actions>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="confirmDialogOpen" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar
            :icon="hasExistingData ? 'edit' : 'help_outline'"
            :color="hasExistingData ? 'orange-9' : 'green-9'"
            text-color="white"
          />
          <span class="q-ml-sm text-h6">
            {{ hasExistingData ? 'Confirm Update' : 'Confirm Save' }}
          </span>
        </q-card-section>

        <q-card-section>
          {{
            hasExistingData
              ? 'Are you sure you want to update this OPCR form?'
              : 'Are you sure you want to save this OPCR form?'
          }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn
            flat
            :label="hasExistingData ? 'Update' : 'Save'"
            :color="hasExistingData ? 'orange-9' : 'green-9'"
            @click="validateAndSave"
          />
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

        <q-card-section>
          OPCR form has been successfully {{ hasExistingData ? 'updated' : 'saved' }}!
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="positive" v-close-popup @click="handleSuccessClose" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useOpcrStore } from 'src/stores/office/opcrStore'

export default {
  name: 'OpcrFormDialog',

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

  emits: ['save', 'close', 'error'],

  setup(props, { emit }) {
    const $q = useQuasar()
    const opcrStore = useOpcrStore()

    // State
    const loading = ref(false)
    const saving = ref(false)
    const error = ref(null)
    const performanceStandards = ref([])
    const confirmDialogOpen = ref(false)
    const successDialogOpen = ref(false)
    const errors = ref({})

    // ✅ FIXED: Check if opcr.id exists to determine if it's an update
    const hasExistingData = computed(() => {
      if (!performanceStandards.value || performanceStandards.value.length === 0) return false

      // Check if ANY standard has opcr with an id (meaning it exists in database)
      return performanceStandards.value.some((standard) => {
        return standard.opcr && standard.opcr.id
      })
    })

    const categories = computed(() => {
      const cats = new Set(performanceStandards.value.map((s) => s.category))
      return Array.from(cats)
    })

    // Methods
    const getCategoryStandards = (category) => {
      return performanceStandards.value.filter((s) => s.category === category)
    }

    const getControlNo = () => {
      return (
        props.employee?.employeeData?.ControlNo ||
        props.employee?.ControlNo ||
        props.employee?.control_no
      )
    }

    const loadOpcrData = async () => {
      loading.value = true
      error.value = null

      const controlNo = getControlNo()

      if (!controlNo) {
        error.value = 'Employee control number is missing'
        loading.value = false
        return
      }

      if (!props.targetPeriod?.semester || !props.targetPeriod?.year) {
        error.value = 'Target period is missing'
        loading.value = false
        return
      }

      try {
        const data = await opcrStore.fetchOpcr(
          controlNo,
          props.targetPeriod.semester,
          props.targetPeriod.year,
        )

        const currentPeriod = data?.target_periods?.find(
          (tp) =>
            tp.semester === props.targetPeriod.semester && tp.year === props.targetPeriod.year,
        )

        if (currentPeriod?.performance_standards) {
          performanceStandards.value = currentPeriod.performance_standards.map((standard) => ({
            ...standard,
            opcr: standard.opcr || {
              budget: '',
              accountable: '',
              accomplishment: '',
              rating_q: null,
              rating_e: null,
              rating_t: null,
              rating_a: null,
              proficiency_result: null,
              remarks: '',
            },
          }))
        } else {
          performanceStandards.value = []
          error.value = 'No performance standards found for this period'
        }
      } catch (err) {
        console.error('Failed to load OPCR:', err)
        error.value = err.response?.data?.message || err.message || 'Failed to load OPCR data'
        performanceStandards.value = []
      } finally {
        loading.value = false
      }
    }

    const validateField = (fieldName, value) => {
      const isValid = !!value && value.toString().trim() !== ''
      errors.value[fieldName] = !isValid
      return isValid
    }

    const validateForm = () => {
      let isValid = true
      const newErrors = {}

      performanceStandards.value.forEach((standard) => {
        const fields = ['budget', 'accountable', 'accomplishment']

        fields.forEach((field) => {
          const fieldKey = `${field}_${standard.id}`
          if (!standard.opcr[field] || standard.opcr[field].toString().trim() === '') {
            newErrors[fieldKey] = true
            isValid = false
          }
        })
      })

      errors.value = newErrors
      return isValid
    }

    const showConfirmDialog = () => {
      if (!validateForm()) {
        $q.notify({
          type: 'warning',
          message: 'Please fill all required fields',
          position: 'top',
          timeout: 2500,
        })
        return
      }

      confirmDialogOpen.value = true
    }

    const validateAndSave = async () => {
      // Prevent double-click
      if (saving.value) {
        return
      }

      confirmDialogOpen.value = false
      saving.value = true

      // Create array payload
      const payload = performanceStandards.value.map((standard) => ({
        performance_standard_id: standard.id,
        budget: standard.opcr.budget, // Keep as string/varchar
        accountable: standard.opcr.accountable,
        accomplishment: standard.opcr.accomplishment,
        rating_q: standard.opcr.rating_q || null,
        rating_e: standard.opcr.rating_e || null,
        rating_t: standard.opcr.rating_t || null,
        rating_a: standard.opcr.rating_a || null,
        proficiency_result: standard.opcr.proficiency_result || null,
        remarks: standard.opcr.remarks || '',
      }))

      try {
        // Use update or save based on hasExistingData
        if (hasExistingData.value) {
          console.log('Calling UPDATE endpoint')
          await opcrStore.updateOpcr(payload)
        } else {
          console.log('Calling SAVE endpoint')
          await opcrStore.saveOpcr(payload)
        }

        successDialogOpen.value = true

        $q.notify({
          type: 'positive',
          message: `OPCR ${hasExistingData.value ? 'updated' : 'saved'} successfully!`,
          position: 'top',
          timeout: 2500,
          actions: [{ icon: 'close', color: 'white' }],
        })

        emit('save', payload)
      } catch (err) {
        console.error('Failed to save OPCR:', err)
        $q.notify({
          type: 'negative',
          message:
            err.response?.data?.message ||
            `Failed to ${hasExistingData.value ? 'update' : 'save'} OPCR`,
          position: 'top',
          timeout: 3000,
        })
        emit('error', err.message || `Failed to ${hasExistingData.value ? 'update' : 'save'} OPCR`)
      } finally {
        saving.value = false
      }
    }

    const handleSuccessClose = () => {
      successDialogOpen.value = false
      emit('close')
    }

    // Lifecycle
    onMounted(() => {
      loadOpcrData()
    })

    return {
      loading,
      saving,
      error,
      performanceStandards,
      categories,
      errors,
      confirmDialogOpen,
      successDialogOpen,
      hasExistingData,
      getCategoryStandards,
      validateField,
      showConfirmDialog,
      validateAndSave,
      handleSuccessClose,
      loadOpcrData,
    }
  },
}
</script>

<style scoped>
.opcr-dialog {
  width: 90vw;
  max-width: 1200px;
}
</style>
