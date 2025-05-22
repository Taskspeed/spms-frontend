<!--AddEmployeeeModal-->
<template>
  <q-dialog :model-value="showModal" @update:model-value="closeModal" persistent>
    <q-card class="employee-selection-modal">
      <q-card-section class="modal-header">
        <div class="text-h6">Select Employees</div>
      </q-card-section>

      <q-card-section class="filter-section">
        <div class="row q-gutter-md items-center">
          <q-input v-model="searchTerm" placeholder="Search by name, position, or office..." dense outlined clearable
            @keyup.enter="handleSearch" @update:model-value="handleSearchDebounced" class="col-grow"
            @clear="handleClearSearch">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn label="Search" color="primary" @click="handleSearch" class="search-button"
            :loading="employeeStore.loading" />
        </div>
      </q-card-section>

      <q-card-section class="table-section">
        <q-table :rows="filteredEmployees" :columns="columns" row-key="name" flat bordered :pagination="pagination"
          class="employee-table" :loading="employeeStore.loading">
          <template v-slot:body-cell-selection="props">
            <q-td :props="props">
              <q-checkbox v-model="props.row.selected" dense />
            </q-td>
          </template>

          <template v-slot:body-cell-office="props">
            <q-td :props="props">
              {{ props.row.office }}
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey q-gutter-sm">
              <span v-if="isSearching && !employeeStore.loading">
                No employees found matching your search
              </span>
              <span v-else>
                No employees available
              </span>
            </div>
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions align="right" class="modal-actions">
        <q-btn label="Cancel" color="grey" flat @click="closeModal" class="action-btn" />
        <q-btn label="Add Employee" color="primary" :disable="!hasSelection" @click="addEmployee" icon="add"
          class="action-btn" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch,} from 'vue'
import { useEmployeeStore } from 'src/stores/office/employeeStore'
import { debounce } from 'quasar'

const props = defineProps({
  showModal: Boolean
})
const emit = defineEmits(['update:showModal', 'add'])

const searchTerm = ref('')
const isSearching = ref(false)
const showAllOffices = ref(false)
const employeeStore = useEmployeeStore()

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

const columns = [
  {
    name: 'selection',
    label: 'Select',
    field: 'selected',
    align: 'left'
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'position',
    label: 'Position',
    field: 'position',
    align: 'left',
    sortable: true
  },
]

const employees = computed(() => employeeStore.unassignedEmployees)

// Create debounced search function
const handleSearchDebounced = debounce(async () => {
  await handleSearch()
}, 500)

watch([() => props.showModal, showAllOffices], async ([showModalValue, showAll]) => {
  if (showModalValue) {
    if (showAll) {
      await employeeStore.fetchAllEmployees()
    } else {
      await employeeStore.fetchUnassignedEmployees()
    }
    isSearching.value = false
    searchTerm.value = '' // Clear search term when modal opens
  }
}, { immediate: true })

const filteredEmployees = computed(() => {
  if (isSearching.value) {
    return employeeStore.searchedEmployees
  }

  let filtered = employees.value

  if (!showAllOffices.value && employeeStore.userOffice) {
    filtered = filtered.filter(emp => emp.office === employeeStore.userOffice)
  }

  return filtered
})

const hasSelection = computed(() => {
  const employeesToCheck = isSearching.value
    ? employeeStore.searchedEmployees
    : employees.value
  return employeesToCheck.some(emp => emp.selected)
})

async function handleClearSearch() {
  searchTerm.value = ''
  isSearching.value = false
  await employeeStore.fetchUnassignedEmployees()
}

async function handleSearch() {
  try {
    if (searchTerm.value.trim()) {
      isSearching.value = true
      await employeeStore.searchEmployees(searchTerm.value)
    } else {
      await handleClearSearch()
    }
  } catch (error) {
    console.error('Search failed:', error)
    isSearching.value = false
  }
}

function closeModal() {
  // Clear selections from all employee lists
  employeeStore.unassignedEmployees.forEach(emp => emp.selected = false)
  employeeStore.searchedEmployees.forEach(emp => emp.selected = false)

  searchTerm.value = ''
  isSearching.value = false
  showAllOffices.value = false
  emit('update:showModal', false)
}

async function addEmployee() {
  const selectedEmployees = (isSearching.value ? employeeStore.searchedEmployees : employees.value)
    .filter(emp => emp.selected)
    .map(({ id, name, position }) => ({
      id,
      name,
      position
    }))

  emit('add', selectedEmployees)
  closeModal()
}
</script>

<style scoped lang="scss">
.employee-selection-modal {
  width: 900px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .modal-header {
    padding-bottom: 0;
  }

  .filter-section {
    padding-bottom: 0;
  }

  .table-section {
    padding-top: 0;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .employee-table {
    flex: 1;

    :deep(.q-table__middle) {
      max-height: calc(70vh - 150px);
      overflow-y: auto;
    }

    :deep(.q-table__top) {
      padding-top: 0;
    }
  }

  .modal-actions {
    padding: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    .action-btn {
      min-width: 120px;
    }
  }
}
</style>
