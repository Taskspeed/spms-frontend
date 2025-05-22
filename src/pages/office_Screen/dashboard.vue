<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page padding>
    <!-- Header with Target Period -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h6 class="text-h6 q-mb-xs text-green text-weight-bold">Performance Dashboard</h6>
        <div class="text-subtitle3 text-grey-8">
          Current Target Period: <strong>{{ currentTargetPeriod }}</strong>
        </div>
      </div>
    </div>

    <!-- Cards Row -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Employee Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="bg-white shadow-3 full-height clickable-card" @click="$router.push('/office/employee')">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="people" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">Total Employees</div>
                <div class="text-h6 text-weight-bold">435</div>
              </div>
            </div>
            <div class="q-mt-md">
              <div class="row justify-between q-mb-xs">
                <span class="text-caption">Office: <strong>125</strong></span>
                <span class="text-caption">Division: <strong>150</strong></span>
              </div>
              <q-linear-progress size="xs" :value="125 / 435" color="blue" class="q-mb-sm" />
              <div class="row justify-between q-mb-xs">
                <span class="text-caption">Section: <strong>85</strong></span>
                <span class="text-caption">Unit: <strong>75</strong></span>
              </div>
              <q-linear-progress size="xs" :value="85 / 435" color="teal" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- OPCR Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="bg-white shadow-3 full-height clickable-card" @click="$router.push('/office/opcr')">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="assessment" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">OPCR Status</div>
                <div class="text-h6 text-weight-bold q-mb-sm">25</div>
              </div>
            </div>
            <div class="q-mb-sm">
              <q-linear-progress size="xs" :value="15 / 25" color="positive" />
              <span class="text-caption">Approved: <strong class="text-positive">15</strong></span>
            </div>
            <div class="q-mb-sm">
              <q-linear-progress size="xs" :value="5 / 25" color="warning" />
              <span class="text-caption">Pending: <strong class="text-warning">5</strong></span>
            </div>
            <div>
              <q-linear-progress size="xs" :value="5 / 25" color="grey" />
              <span class="text-caption">Draft: <strong class="text-grey">5</strong></span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- IPCR Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="bg-white shadow-3 full-height clickable-card" @click="$router.push('/office/ipcr')">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="assignment_ind" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">IPCR Status</div>
                <div class="text-h6 text-weight-bold q-mb-sm">25</div>
              </div>
            </div>
            <div class="q-mb-sm">
              <q-linear-progress size="xs" :value="12 / 25" color="positive" />
              <span class="text-caption">Approved: <strong class="text-positive">12</strong></span>
            </div>
            <div class="q-mb-sm">
              <q-linear-progress size="xs" :value="8 / 25" color="warning" />
              <span class="text-caption">Pending: <strong class="text-warning">8</strong></span>
            </div>
            <div>
              <q-linear-progress size="xs" :value="5 / 25" color="grey" />
              <span class="text-caption">Draft: <strong class="text-grey">5</strong></span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Unit Work Plan Card -->
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="bg-white shadow-3 full-height clickable-card" @click="$router.push('/office/unit-work-plan')">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="domain" color="primary" size="md" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-grey-7">Unit Work Plan</div>
                <div class="text-h6 text-weight-bold q-mb-sm">10</div>
              </div>
            </div>
            <div class="q-mb-sm">
              <q-linear-progress size="xs" :value="6 / 10" color="positive" />
              <span class="text-caption">Approved: <strong class="text-positive">6</strong></span>
            </div>
            <div class="q-mb-sm">
              <q-linear-progress size="xs" :value="3 / 10" color="warning" />
              <span class="text-caption">Pending: <strong class="text-warning">3</strong></span>
            </div>
            <div>
              <q-linear-progress size="xs" :value="1 / 10" color="grey" />
              <span class="text-caption">Draft: <strong class="text-grey">1</strong></span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Activity Logs Section -->
    <q-card class="bg-white shadow-3">
      <q-card-section class="q-pa-md">
        <div class="text-h6 q-mb-md">Activity Logs</div>
        <q-table :rows="activityLogs" :columns="activityColumns" row-key="id" flat bordered
          :pagination="{ rowsPerPage: 5 }" class="dashboard-table">
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';

// Current target period calculation
const currentTargetPeriod = computed(() => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  if (month >= 0 && month <= 5) {
    return `January - June ${year}`;
  } else {
    return `July - December ${year}`;
  }
});

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
  }
]);

const activityColumns = [
  { name: 'date', label: 'Date & Time', field: 'date', align: 'left', sortable: true },
  { name: 'action', label: 'Action', field: 'action', align: 'left', sortable: true },
  { name: 'username', label: 'Username', field: 'username', align: 'left', sortable: true }
];
</script>

<style scoped>
.clickable-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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
  margin-bottom: 24px;
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
