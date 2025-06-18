<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="q-px-md q-pb-md">
    <!-- Header with Target Period and User Info -->
    <div class="row items-center q-mb-xs">
      <div>
        <h6 class="text-h6 q-mb-xs text-green text-weight-bold">Performance Dashboard</h6>
        <div class="text-subtitle1 text-grey-8">
          Current Target Period: <strong>{{ currentTargetPeriod }}</strong>
        </div>
      </div>
    </div>

    <!-- Centered Cards Row -->
    <div class="flex justify-center">
      <div class="row q-col-gutter-md q-mb-lg" style="max-width: 1200px; width: 100%">
        <!-- Employee Card -->
        <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
          <q-card
            class="bg-white shadow-3 full-height clickable-card"
            @click="$router.push('/office/employee')"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center q-mb-md">
                <q-icon name="people" color="primary" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">Total Employees</div>
                  <div class="text-h6 text-weight-bold">435</div>
                </div>
              </div>
              <div>
                <div class="row justify-between q-mb-sm">
                  <span class="text-caption">Division: <strong>12</strong></span>
                </div>
                <div class="row justify-between q-mb-sm">
                  <span class="text-caption">Section: <strong>10</strong></span>
                </div>
                <div class="row justify-between">
                  <span class="text-caption">Unit: <strong>15</strong></span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- IPCR Card -->
        <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
          <q-card
            class="bg-white shadow-3 full-height clickable-card"
            @click="$router.push('/office/ipcr')"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center q-mb-md">
                <q-icon name="assignment_ind" color="primary" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">IPCR Status</div>
                  <div class="text-h6 text-weight-bold">434</div>
                </div>
              </div>
              <div>
                <div class="q-mb-sm">
                  <q-linear-progress size="xs" :value="120 / 434" color="positive" />
                  <span class="text-caption"
                    >Approved: <strong class="text-positive">120</strong></span
                  >
                </div>
                <div class="q-mb-sm">
                  <q-linear-progress size="xs" :value="80 / 434" color="warning" />
                  <span class="text-caption"
                    >Pending: <strong class="text-warning">80</strong></span
                  >
                </div>
                <div>
                  <q-linear-progress size="xs" :value="134 / 434" color="grey" />
                  <span class="text-caption">Draft: <strong class="text-grey">134</strong></span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Unit Work Plan Card -->
        <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
          <q-card
            class="bg-white shadow-3 full-height clickable-card"
            @click="$router.push('/office/unit-work-plan')"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center q-mb-md">
                <q-icon name="domain" color="primary" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">Unit Work Plan</div>
                  <div class="text-h6 text-weight-bold text-grey-8">Pending</div>
                </div>
              </div>
              <div>
                <div class="row justify-between q-mb-xs">
                  <span class="text-caption">Divisions: <strong>8/12</strong></span>
                  <span class="text-caption text-positive">66%</span>
                </div>
                <q-linear-progress size="xs" :value="8 / 12" color="primary" class="q-mb-sm" />

                <div class="row justify-between q-mb-xs">
                  <span class="text-caption">Sections: <strong>6/10</strong></span>
                  <span class="text-caption text-positive">60%</span>
                </div>
                <q-linear-progress size="xs" :value="6 / 10" color="primary" class="q-mb-sm" />

                <div class="row justify-between q-mb-xs">
                  <span class="text-caption">Units: <strong>10/15</strong></span>
                  <span class="text-caption text-positive">66%</span>
                </div>
                <q-linear-progress size="xs" :value="10 / 15" color="primary" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- No IPCR Employee List Section -->
    <q-card class="bg-white shadow-3 q-mb-lg">
      <q-card-section class="q-pa-md">
        <div class="text-subtitle1">Employees with No IPCR</div>
        <q-table
          :rows="noIpcrEmployees"
          :columns="noIpcrColumns"
          row-key="id"
          flat
          bordered
          :pagination="{ rowsPerPage: 5 }"
          class="dashboard-table"
        >
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Activity Logs Section -->
    <q-card class="bg-white shadow-3">
      <q-card-section class="q-pa-md">
        <div class="text-subtitle1">Activity Logs</div>
        <q-table
          :rows="activityLogs"
          :columns="activityColumns"
          row-key="id"
          flat
          bordered
          :pagination="{ rowsPerPage: 5 }"
          class="dashboard-table"
        >
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

// Current date and user info
// const currentDateTime = ref('2025-06-18 01:52:42')
// const currentUser = ref('dsfsgs')

// Current target period calculation
const currentTargetPeriod = computed(() => {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  if (month >= 0 && month <= 5) {
    return `January - June ${year}`
  } else {
    return `July - December ${year}`
  }
})

// No IPCR Employees Data
const noIpcrEmployees = ref([
  {
    id: 1,
    name: 'Juan Dela Cruz',
    position: 'Administrative Officer IV',
    rating: 'N/A',
  },
  {
    id: 2,
    name: 'Maria Santos',
    position: 'Information Technology Officer I',
    rating: 'N/A',
  },
  {
    id: 3,
    name: 'Robert Garcia',
    position: 'Project Development Officer II',
    rating: 'N/A',
  },
  {
    id: 4,
    name: 'Sophia Reyes',
    position: 'Planning Officer III',
    rating: 'N/A',
  },
  {
    id: 5,
    name: 'Michael Tan',
    position: 'Budget Officer II',
    rating: 'N/A',
  },
  {
    id: 6,
    name: 'Ana Gonzales',
    position: 'Human Resource Management Officer I',
    rating: 'N/A',
  },
  {
    id: 7,
    name: 'Paolo Mendoza',
    position: 'Administrative Assistant III',
    rating: 'N/A',
  },
])

const noIpcrColumns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
  { name: 'position', label: 'Position', field: 'position', align: 'left', sortable: true },
  { name: 'rating', label: 'Adjectival Rating', field: 'rating', align: 'center', sortable: true },
]

// Activity Logs Data
const activityLogs = ref([
  {
    id: 1,
    date: '2023-05-15 09:30',
    action: 'OPCR Submission',
    username: 'john.doe',
  },
  {
    id: 2,
    date: '2023-05-14 15:45',
    action: 'IPCR Review',
    username: 'maria.santos',
  },
  {
    id: 3,
    date: '2023-05-14 11:20',
    action: 'Work Plan Update',
    username: 'robert.cruz',
  },
  {
    id: 4,
    date: '2023-05-13 14:10',
    action: 'Performance Rating',
    username: 'susan.reyes',
  },
  {
    id: 5,
    date: '2023-05-12 09:15',
    action: 'OPCR Draft Saved',
    username: 'mark.johnson',
  },
  {
    id: 6,
    date: '2023-05-12 08:30',
    action: 'IPCR Submission',
    username: 'james.wilson',
  },
])

const activityColumns = [
  { name: 'date', label: 'Date & Time', field: 'date', align: 'left', sortable: true },
  { name: 'action', label: 'Action', field: 'action', align: 'left', sortable: true },
  { name: 'username', label: 'Username', field: 'username', align: 'left', sortable: true },
]
</script>

<style scoped>
.clickable-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.clickable-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.q-page {
  min-height: 100vh;
  width: 100%;
}

.q-card {
  border-radius: 8px;
}

.text-h4 {
  letter-spacing: -0.5px;
}

/* Card and table alignment */
.full-height {
  height: 100%;
}

.dashboard-table {
  border-radius: 8px;
  overflow: hidden;
}

/* Consistent spacing */
.q-mb-lg {
  margin-bottom: 14px;
}

.q-mb-sm {
  margin-bottom: 8px;
}

/* Table styling */
:deep(.q-table th) {
  font-weight: 600;
  background-color: #f5f5f5;
}

:deep(.q-table__container) {
  border-radius: 8px;
}
</style>
