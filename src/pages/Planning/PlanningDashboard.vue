<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="q-px-md q-pb-md">
    <!-- Header with Target Period -->
    <div class="row items-center q-mb-xs">
      <div>
        <h6 class="text-h6 q-mb-xs text-pink-4 text-weight-bold">Planning Dashboard</h6>
        <div class="text-subtitle1 text-grey-8">
          Current Target Period: <strong>{{ currentTargetPeriod }}</strong>
        </div>
      </div>
    </div>

    <!-- Centered Cards Row -->
    <div class="flex justify-center">
      <div class="row q-col-gutter-md q-mb-lg" style="max-width: 1200px; width: 100%">
        <!-- Total OPCR Card -->
        <div class="col-xs-12 col-sm-6 col-md-3">
          <q-card class="bg-white shadow-3 full-height clickable-card">
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <q-icon name="description" color="pink-4" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">Total OPCR</div>
                  <div class="text-h6 text-weight-bold">{{ totalOpcr }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Pending Approval Card -->
        <div class="col-xs-12 col-sm-6 col-md-3">
          <q-card class="bg-white shadow-3 full-height clickable-card">
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <q-icon name="hourglass_empty" color="warning" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">Pending Approval</div>
                  <div class="text-h6 text-weight-bold text-warning">{{ pendingOpcr }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Approved Card -->
        <div class="col-xs-12 col-sm-6 col-md-3">
          <q-card class="bg-white shadow-3 full-height clickable-card">
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <q-icon name="check_circle" color="positive" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">Approved</div>
                  <div class="text-h6 text-weight-bold text-positive">{{ approvedOpcr }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Returned Card -->
        <div class="col-xs-12 col-sm-6 col-md-3">
          <q-card class="bg-white shadow-3 full-height clickable-card">
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <q-icon name="cancel" color="negative" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">Returned</div>
                  <div class="text-h6 text-weight-bold text-negative">{{ returnedOpcr }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- OPCR Pending Approval List -->
    <q-card class="bg-white shadow-3 q-mb-lg">
      <q-card-section class="q-pa-md">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-pink-4 text-weight-medium">OPCR Pending Approval</div>
          <q-input
            dense
            outlined
            color="pink-4"
            v-model="searchFilter"
            placeholder="Search office..."
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="pink-4" />
            </template>
          </q-input>
        </div>
        <q-table
          :rows="filteredPendingOpcr"
          :columns="opcrColumns"
          row-key="id"
          flat
          bordered
          :pagination="{ rowsPerPage: 10 }"
          class="dashboard-table"
          :loading="loading"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="office_name" :props="props">
                <div>{{ props.row.office_name }}</div>
              </q-td>
              <q-td key="submitted_by" :props="props">
                {{ props.row.submitted_by }}
              </q-td>
              <q-td key="submitted_date" :props="props">
                {{ formatDate(props.row.submitted_date) }}
              </q-td>
              <q-td key="status" :props="props">
                <q-badge
                  :color="getStatusColor(props.row.status)"
                  :label="props.row.status"
                  class="status-badge"
                />
              </q-td>
              <q-td key="actions" :props="props" class="text-center">
                <div class="row justify-center q-gutter-xs">
                  <q-btn
                    flat
                    round
                    color="pink-4"
                    icon="visibility"
                    size="sm"
                    @click="viewOpcr(props.row)"
                  >
                    <q-tooltip>View OPCR</q-tooltip>
                  </q-btn>
                  <!-- <q-btn
                    flat
                    round
                    color="positive"
                    icon="check"
                    size="sm"
                    @click="approveOpcr(props.row)"
                  >
                    <q-tooltip>Approve</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="close"
                    size="sm"
                    @click="returnOpcr(props.row)"
                  >
                    <q-tooltip>Return</q-tooltip>
                  </q-btn> -->
                </div>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data>
            <div class="text-center q-pa-lg">
              <q-icon name="check_circle_outline" size="3rem" color="positive" />
              <div class="text-h6 text-grey-7 q-mt-md">All Caught Up!</div>
              <div class="text-grey-6">No pending OPCR for approval</div>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Recently Processed OPCR -->
    <q-card class="bg-white shadow-3">
      <q-card-section class="q-pa-md">
        <div class="text-subtitle1 text-pink-4 text-weight-medium q-mb-md">Recently Processed</div>
        <q-table
          :rows="recentlyProcessed"
          :columns="recentColumns"
          row-key="id"
          flat
          bordered
          :pagination="{ rowsPerPage: 5 }"
          class="dashboard-table"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="office_name" :props="props">
                <div>{{ props.row.office_name }}</div>
              </q-td>
              <q-td key="processed_by" :props="props">
                {{ props.row.processed_by }}
              </q-td>
              <q-td key="processed_date" :props="props">
                {{ formatDate(props.row.processed_date) }}
              </q-td>
              <q-td key="status" :props="props">
                <q-badge
                  :color="getStatusColor(props.row.status)"
                  :label="props.row.status"
                  class="status-badge"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- View OPCR Dialog -->
    <q-dialog v-model="viewDialogOpen" full-width>
      <q-card style="max-width: 900px">
        <q-card-section class="row items-center q-pb-none bg-pink-1">
          <q-icon name="description" color="pink-4" size="sm" class="q-mr-sm" />
          <div class="text-h6 text-pink-4">OPCR Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            {{ selectedOpcr?.office_name }}
          </div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <div class="text-caption text-grey-7">Submitted By</div>
              <div class="text-body1">{{ selectedOpcr?.submitted_by }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-7">Submitted Date</div>
              <div class="text-body1">{{ formatDate(selectedOpcr?.submitted_date) }}</div>
            </div>
          </div>
          <q-separator class="q-my-md" />
          <div class="text-subtitle2 q-mb-sm">OPCR Content Preview</div>
          <div class="bg-grey-2 q-pa-md rounded-borders" style="min-height: 200px">
            <div class="text-grey-7 text-center q-mt-xl">
              OPCR document content will be displayed here
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Close" color="grey" v-close-popup />
          <q-btn flat label="Return" color="negative" @click="returnOpcr(selectedOpcr)" />
          <q-btn unelevated label="Approve" color="pink-4" @click="approveOpcr(selectedOpcr)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Approve Confirmation Dialog -->
    <q-dialog v-model="approveDialogOpen" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-avatar icon="check_circle" color="positive" text-color="white" />
          <span class="q-ml-sm text-h6">Approve OPCR</span>
        </q-card-section>
        <q-card-section>
          Are you sure you want to approve the OPCR for
          <strong>{{ selectedOpcr?.office_name }}</strong
          >?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn
            unelevated
            label="Approve"
            color="positive"
            @click="confirmApprove"
            :loading="processing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Return Dialog -->
    <q-dialog v-model="returnDialogOpen" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <q-avatar icon="replay" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">Return OPCR</span>
        </q-card-section>
        <q-card-section>
          <div class="q-mb-md">
            Return the OPCR for <strong>{{ selectedOpcr?.office_name }}</strong
            >?
          </div>
          <q-input
            v-model="returnRemarks"
            type="textarea"
            outlined
            label="Remarks / Reason for returning"
            placeholder="Please provide the reason for returning this OPCR..."
            :rules="[(val) => !!val || 'Remarks are required']"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn
            unelevated
            label="Return OPCR"
            color="negative"
            @click="confirmReturn"
            :loading="processing"
            :disable="!returnRemarks"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Loading state
const loading = ref(false)
const processing = ref(false)

// Search filter
const searchFilter = ref('')

// Dialog states
const viewDialogOpen = ref(false)
const approveDialogOpen = ref(false)
const returnDialogOpen = ref(false)
const selectedOpcr = ref(null)
const returnRemarks = ref('')

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

// OPCR Data
const pendingOpcrList = ref([
  {
    id: 1,
    office_name: 'OFFICE OF THE CITY MAYOR',
    submitted_by: 'Juan Dela Cruz',
    submitted_date: '2025-05-28',
    status: 'Pending',
  },
  {
    id: 2,
    office_name: 'OFFICE OF THE CITY ADMINISTRATOR',
    submitted_by: 'Maria Santos',
    submitted_date: '2025-05-27',
    status: 'Pending',
  },
  {
    id: 3,
    office_name: 'OFFICE OF THE CITY PLANNING AND DEVELOPMENT COORDINATOR',
    submitted_by: 'Roberto Garcia',
    submitted_date: '2025-05-26',
    status: 'Pending',
  },
  {
    id: 4,
    office_name: 'OFFICE OF THE CITY BUDGET OFFICER',
    submitted_by: 'Ana Reyes',
    submitted_date: '2025-05-25',
    status: 'Pending',
  },
  {
    id: 5,
    office_name: 'OFFICE OF THE CITY ACCOUNTANT',
    submitted_by: 'Michael Tan',
    submitted_date: '2025-05-24',
    status: 'Pending',
  },
])

// Recently processed OPCR
const recentlyProcessed = ref([
  {
    id: 1,
    office_name: 'OFFICE OF THE CITY TREASURER',
    processed_by: 'Admin User',
    processed_date: '2025-05-23',
    status: 'Approved',
  },
  {
    id: 2,
    office_name: 'OFFICE OF THE CITY ENGINEER',
    processed_by: 'Admin User',
    processed_date: '2025-05-22',
    status: 'Approved',
  },
  {
    id: 3,
    office_name: 'OFFICE OF THE CITY HEALTH OFFICER',
    processed_by: 'Admin User',
    processed_date: '2025-05-21',
    status: 'Returned',
  },
  {
    id: 4,
    office_name: 'OFFICE OF THE CITY ASSESSOR',
    processed_by: 'Admin User',
    processed_date: '2025-05-20',
    status: 'Approved',
  },
  {
    id: 5,
    office_name: 'OFFICE OF THE CITY VETERINARIAN',
    processed_by: 'Admin User',
    processed_date: '2025-05-19',
    status: 'Approved',
  },
])

// Summary counts
const totalOpcr = ref(28)
const pendingOpcr = computed(() => pendingOpcrList.value.length)
const approvedOpcr = ref(18)
const returnedOpcr = ref(5)

// Filtered pending OPCR based on search
const filteredPendingOpcr = computed(() => {
  if (!searchFilter.value) return pendingOpcrList.value
  const needle = searchFilter.value.toLowerCase()
  return pendingOpcrList.value.filter(
    (opcr) =>
      opcr.office_name.toLowerCase().includes(needle) ||
      opcr.submitted_by.toLowerCase().includes(needle),
  )
})

// Table columns
const opcrColumns = [
  {
    name: 'office_name',
    label: 'Office Name',
    field: 'office_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'submitted_by',
    label: 'Office Head',
    field: 'submitted_by',
    align: 'left',
    sortable: true,
  },
  {
    name: 'submitted_date',
    label: 'Submitted Date',
    field: 'submitted_date',
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
  },
]

const recentColumns = [
  {
    name: 'office_name',
    label: 'Office Name',
    field: 'office_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'processed_by',
    label: 'Processed By',
    field: 'processed_by',
    align: 'left',
    sortable: true,
  },
  {
    name: 'processed_date',
    label: 'Processed Date',
    field: 'processed_date',
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true,
  },
]

// Helper functions
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusColor = (status) => {
  const statusColors = {
    Pending: 'warning',
    Approved: 'positive',
    Returned: 'negative',
    Draft: 'grey',
  }
  return statusColors[status] || 'grey'
}

// Action functions
const viewOpcr = (opcr) => {
  selectedOpcr.value = opcr
  viewDialogOpen.value = true
}

const approveOpcr = (opcr) => {
  selectedOpcr.value = opcr
  viewDialogOpen.value = false
  approveDialogOpen.value = true
}

const returnOpcr = (opcr) => {
  selectedOpcr.value = opcr
  returnRemarks.value = ''
  viewDialogOpen.value = false
  returnDialogOpen.value = true
}

const confirmApprove = async () => {
  processing.value = true
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Add to recently processed
    recentlyProcessed.value.unshift({
      id: Date.now(),
      office_name: selectedOpcr.value.office_name,
      processed_by: 'Admin User',
      processed_date: new Date().toISOString().split('T')[0],
      status: 'Approved',
    })

    // Remove from pending list
    pendingOpcrList.value = pendingOpcrList.value.filter(
      (opcr) => opcr.id !== selectedOpcr.value.id,
    )
    approvedOpcr.value++

    $q.notify({
      message: `OPCR for ${selectedOpcr.value.office_name} has been approved`,
      color: 'positive',
      icon: 'check_circle',
    })

    approveDialogOpen.value = false
  } catch {
    $q.notify({
      message: 'Failed to approve OPCR',
      color: 'negative',
    })
  } finally {
    processing.value = false
  }
}

const confirmReturn = async () => {
  if (!returnRemarks.value) return

  processing.value = true
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Add to recently processed
    recentlyProcessed.value.unshift({
      id: Date.now(),
      office_name: selectedOpcr.value.office_name,
      processed_by: 'Admin User',
      processed_date: new Date().toISOString().split('T')[0],
      status: 'Returned',
    })

    // Remove from pending list
    pendingOpcrList.value = pendingOpcrList.value.filter(
      (opcr) => opcr.id !== selectedOpcr.value.id,
    )
    returnedOpcr.value++

    $q.notify({
      message: `OPCR for ${selectedOpcr.value.office_name} has been returned`,
      color: 'negative',
      icon: 'replay',
    })

    returnDialogOpen.value = false
  } catch {
    $q.notify({
      message: 'Failed to return OPCR',
      color: 'negative',
    })
  } finally {
    processing.value = false
  }
}

onMounted(() => {
  // Fetch pending OPCR data here
  // fetchPendingOpcr()
})
</script>

<style scoped>
.clickable-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0 2s ease;
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

.search-input {
  width: 250px;
}

.status-badge {
  border-radius: 4px;
  padding: 4px 8px;
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
  background-color: #a6a6a64d;
}

:deep(.q-table__container) {
  border-radius: 8px;
}

:deep(.q-table tbody tr:hover) {
  background-color: #f2f2f2;
}
</style>
