<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Select Competency</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeDialog" />
      </q-card-section>

      <q-card-section>
        <q-select
          v-model="selectedCompetency"
          :options="competencyOptions"
          label="Choose a competency"
          outlined
          emit-value
          map-options
          option-label="label"
          option-value="value"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.code }} - {{ scope.opt.name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.category }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey" @click="closeDialog" />
        <q-btn
          unelevated
          label="Select"
          color="primary"
          @click="confirmSelection"
          :disable="!selectedCompetency"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'CompetencyDialog',

  setup(props, { emit }) {
    const showDialog = ref(false)
    const selectedCompetency = ref(null)

    const competencyOptions = [
      // CORE COMPETENCY
      {
        code: 'DSE',
        name: 'Delivering Service Excellence',
        category: 'Core Competency',
        value: 'DSE',
        label: 'DSE - Delivering Service Excellence',
      },
      {
        code: 'EI',
        name: 'Exemplifying Integrity',
        category: 'Core Competency',
        value: 'EI',
        label: 'EI - Exemplifying Integrity',
      },
      {
        code: 'IS',
        name: 'Interpersonal Skills',
        category: 'Core Competency',
        value: 'IS',
        label: 'IS - Interpersonal Skills',
      },

      // TECHNICAL COMPETENCY
      {
        code: 'P&O',
        name: 'Planning and Organizing',
        category: 'Technical Competency',
        value: 'P&O',
        label: 'P&O - Planning and Organizing',
      },
      {
        code: 'M&E',
        name: 'Monitoring and Evaluation',
        category: 'Technical Competency',
        value: 'M&E',
        label: 'M&E - Monitoring and Evaluation',
      },
      {
        code: 'RM',
        name: 'Records Management',
        category: 'Technical Competency',
        value: 'RM',
        label: 'RM - Records Management',
      },
      {
        code: 'P&N',
        name: 'Partnering and Networking',
        category: 'Technical Competency',
        value: 'P&N',
        label: 'P&N - Partnering and Networking',
      },
      {
        code: 'PM',
        name: 'Process Management',
        category: 'Technical Competency',
        value: 'PM',
        label: 'PM - Process Management',
      },
      {
        code: 'AD',
        name: 'Attention to Details',
        category: 'Technical Competency',
        value: 'AD',
        label: 'AD - Attention to Details',
      },

      // LEADERSHIP COMPETENCY
      {
        code: 'TSC',
        name: 'Thinking Strategically and Creatively',
        category: 'Leadership Competency',
        value: 'TSC',
        label: 'TSC - Thinking Strategically and Creatively',
      },
      {
        code: 'PSDM',
        name: 'Problem Solving and Decision Making',
        category: 'Leadership Competency',
        value: 'PSDM',
        label: 'PSDM - Problem Solving and Decision Making',
      },
      {
        code: 'BCIWR',
        name: 'Building Collaborative and Inclusive Working Relationships',
        category: 'Leadership Competency',
        value: 'BCIWR',
        label: 'BCIWR - Building Collaborative and Inclusive Working Relationships',
      },
      {
        code: 'MPCR',
        name: 'Managing Performance and Coaching for Results',
        category: 'Leadership Competency',
        value: 'MPCR',
        label: 'MPCR - Managing Performance and Coaching for Results',
      },
    ]

    const openDialog = () => {
      showDialog.value = true
      selectedCompetency.value = null
    }

    const closeDialog = () => {
      showDialog.value = false
      selectedCompetency.value = null
    }

    const confirmSelection = () => {
      if (selectedCompetency.value) {
        const selected = competencyOptions.find((c) => c.value === selectedCompetency.value)
        emit('competency-selected', selected)
        closeDialog()
      }
    }

    return {
      showDialog,
      selectedCompetency,
      competencyOptions,
      openDialog,
      closeDialog,
      confirmSelection,
    }
  },
}
</script>
