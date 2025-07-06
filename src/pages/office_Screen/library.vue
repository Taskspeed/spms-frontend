<!-- eslint-disable vue/multi-word-component-names -->
<template>
<div v-if="loading" class="full-page-loader">
    <div class="loader-content">
      <q-spinner-hourglass
        color="primary"
        size="4em"
        :thickness="3"
      />
      <div class="text-h6 q-mt-md text-primary">Loading MFO Data...</div>
    </div>
  </div>
  <q-page class="q-px-md q-pb-md">
    <div class="q-mb-md">
      <h6 class="text-h5 q-mb-md">Major Final Outputs (MFO)</h6>

      <q-separator class="q-mt-sm" />
    </div>

    <!-- Loading indicator -->
    <!-- <div v-if="loading" class="flex justify-center q-pa-lg">
      <q-spinner-hourglass color="green" size="3em" />
    </div> -->

    <!-- Table inside a responsive card -->
    <q-card flat bordered class="full-width shadow-1">
      <table class="mfo-table full-width">
        <thead>
          <tr>
            <th class="category-column">
              <div class="header-content">
                <span class="text-subtitle2 text-weight-bold">A. Strategic Function</span>
                <q-btn
                  icon="add"
                  size="md"
                  flat
                  round
                  dense
                  color="primary"
                  @click="openAddModal('strategic')"
                  class="q-ml-sm"
                />
              </div>
            </th>
            <th class="category-column">
              <div class="header-content">
                <span class="text-subtitle2 text-weight-bold">B. Core Function</span>
                <q-btn
                  icon="add"
                  size="md"
                  flat
                  round
                  dense
                  color="primary"
                  @click="openAddModal('core')"
                  class="q-ml-sm"
                />
              </div>
            </th>
            <th class="category-column">
              <div class="header-content">
                <span class="text-subtitle2 text-weight-bold">C. Support Function</span>
                <q-btn
                  icon="add"
                  size="md"
                  flat
                  round
                  dense
                  color="primary"
                  @click="openAddModal('support')"
                  class="q-ml-sm"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="category-cell">
              <ul class="mfo-list">
                <li v-for="(mfo, index) in strategicMfos" :key="mfo.id" class="mfo-item">
                  <div class="mfo-content">
                    <q-btn
                      size="xs"
                      flat
                      round
                      dense
                      color="grey-7"
                      @click.stop="toggleMfoExpansion(mfo.id)"
                      :icon="expandedMfos.includes(mfo.id) ? 'expand_less' : 'expand_more'"
                      class="q-mr-xs"
                    />
                    <div class="mfo-title" @click="toggleMfoExpansion(mfo.id)">
                      <div class="mfo-number"><strong>{{ `MFO ${index + 1}.` }}</strong></div>
                     <p class="mfo-name">{{ mfo.name }}</p>

                    </div>
                    <div class="mfo-actions">
                      <q-btn
                        icon="edit"
                        size="md"
                        flat
                        round
                        dense
                        color="grey-7"
                        @click="editMfo(mfo, 'strategic')"
                      />
                      <q-btn
                        icon="delete"
                        size="md"
                        flat
                        round
                        dense
                        color="negative"
                        @click="confirmDelete(mfo)"
                      />
                    </div>
                  </div>
                  <q-slide-transition>
                    <div v-show="expandedMfos.includes(mfo.id)">
                      <ul class="output-list">
                        <li
                          v-for="(output, outputIndex) in getOutputsForMfo(mfo.id)"
                          :key="output.id"
                          class="output-item"
                        >
                          <div class="output-content">
                            <div class="output-number"><strong>{{ `OUTPUT ${outputIndex + 1}.` }}</strong></div>
                            <!-- <strong class="output-name">{{ output.name }}</strong> -->
                            <p class="output-name">{{ output.name }}</p>
                            <div class="output-actions">
                              <q-btn
                                icon="edit"
                                size="md"
                                flat
                                round
                                dense
                                color="grey-7"
                                @click="editOutput(output, mfo, 'strategic')"
                              />
                              <q-btn
                                icon="delete"
                                size="md"
                                flat
                                round
                                dense
                                color="negative"
                                @click="confirmDeleteOutput(output)"
                              />
                            </div>
                          </div>
                        </li>
                      </ul>
                      <div class="row justify-center q-mt-sm">
                          <q-btn
                            label="Add output"
                            size="md"
                            dense
                            color="primary"
                            @click="openAddOutputModal(mfo, 'strategic')"
                            class="add-output-btn"
                          />
                        </div>
                    </div>
                  </q-slide-transition>
                </li>
              </ul>
              <div v-if="strategicMfos.length === 0" class="empty-state">
                <q-icon name="info" size="sm" color="grey-5" class="q-mr-xs" />
                <span class="text-grey-6">No strategic functions available</span>
              </div>
            </td>

            <td class="category-cell">
              <ul class="mfo-list">
                <li v-for="(mfo, index) in coreMfos" :key="mfo.id" class="mfo-item">
                  <div class="mfo-content">
                    <q-btn
                      size="xs"
                      flat
                      round
                      dense
                      color="grey-7"
                      @click.stop="toggleMfoExpansion(mfo.id)"
                      :icon="expandedMfos.includes(mfo.id) ? 'expand_less' : 'expand_more'"
                      class="q-mr-xs"
                    />
                    <div class="mfo-title" @click="toggleMfoExpansion(mfo.id)">
                      <div class="mfo-number"><strong>{{ `MFO ${index + 1}.` }}</strong></div>
                      <!-- <strong class="mfo-name">{{ mfo.name }}</strong> -->
                      <p class="mfo-name">{{ mfo.name }} </p>
                    </div>
                    <div class="mfo-actions">
                      <q-btn
                        icon="edit"
                        size="md"
                        flat
                        round
                        dense
                        color="grey-7"
                        @click="editMfo(mfo, 'core')"
                      />
                      <q-btn
                        icon="delete"
                        size="md"
                        flat
                        round
                        dense
                        color="negative"
                        @click="confirmDelete(mfo)"
                      />
                    </div>
                  </div>
                  <q-slide-transition>
                    <div v-show="expandedMfos.includes(mfo.id)">
                      <ul class="output-list">
                        <li
                          v-for="(output, outputIndex) in getOutputsForMfo(mfo.id)"
                          :key="output.id"
                          class="output-item"
                        >
                          <div class="output-content">
                            <div class="output-number"><strong>{{ `OUTPUT ${outputIndex + 1}.` }}</strong></div>
                            <!-- <strong class="output-name">{{ output.name }}</strong> -->
                            <p class="output-name">{{ output.name }}</p>
                            <div class="output-actions">
                              <q-btn
                                icon="edit"
                                 size="md"
                                flat
                                round
                                dense
                                color="grey-7"
                                @click="editOutput(output, mfo, 'core')"
                              />
                              <q-btn
                                icon="delete"
                                   size="md"
                                flat
                                round
                                dense
                                color="negative"
                                @click="confirmDeleteOutput(output)"
                              />
                            </div>
                          </div>
                        </li>
                      </ul>
                      <div class="row justify-center q-mt-sm">
                        <q-btn
                          label="Add Output"
                          size="md"
                          dense
                          color="primary"
                          @click="openAddOutputModal(mfo, 'core')"
                          class="add-output-btn"
                        />
                      </div>
                    </div>
                  </q-slide-transition>
                </li>
              </ul>
              <div v-if="coreMfos.length === 0" class="empty-state">
                <q-icon name="info" size="sm" color="grey-5" class="q-mr-xs" />
                <span class="text-grey-6">No core functions available</span>
              </div>
            </td>

            <td class="category-cell">
              <ul class="mfo-list">
                <li v-for="(output, index) in supportOutputs" :key="output.id" class="mfo-item">
                  <div class="mfo-content">
                    <div class="mfo-title">
                      <div class="output-number"><strong>{{ `OUTPUT ${index + 1}.` }}</strong></div>
                      <!-- <strong class="output-name">{{ output.name }}</strong> -->
                      <p class="output-name">{{ output.name }}</p>
                    </div>
                    <div class="mfo-actions">
                      <q-btn
                        icon="edit"
                           size="md"
                        flat
                        round
                        dense
                        color="grey-7"
                        @click="editSupport(output)"
                      />
                      <q-btn
                        icon="delete"
                          size="md"
                        flat
                        round
                        dense
                        color="negative"
                        @click="confirmDeleteOutput(output)"
                      />
                    </div>
                  </div>
                </li>
              </ul>
              <div v-if="supportOutputs.length === 0" class="empty-state">
                <q-icon name="info" size="sm" color="grey-5" class="q-mr-xs" />
                <span class="text-grey-6">No support outputs available</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </q-card>

    <!-- Add/Edit Modal -->
    <q-dialog v-model="modal.show" persistent>
      <q-card class="modal-card" style="min-width: 500px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none" style="background-color: #00703c">
          <div class="text-subtitle1 text-white">{{ modal.title }}</div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            @click="closeModal"
            class="text-white"
            style="margin-right: -8px"
          />
        </q-card-section>

        <!-- Scrollable content -->
        <div class="modal-scrollable-content" ref="modalContent">
          <q-card-section class="q-pt-md">
            <!-- Category Display -->
            <div v-if="form.category" class="q-mb-md">
              <div class="text-caption text-grey-6">Category</div>
              <div class="text-body1 text-weight-medium">{{ form.category.name }}</div>
            </div>

            <!-- Parent MFO Display (for outputs) -->
            <div v-if="form.parentMfo" class="q-mb-md">
              <div class="text-caption text-grey-6">MFO</div>
              <div class="text-body1 text-weight-medium">{{ form.parentMfo.name }}</div>
            </div>

            <!-- Single input for edit mode -->
            <template v-if="modal.mode === 'edit'">
              <div :ref="'itemContainer_0'">
                <q-input
                  v-model="form.items[0].name"
                  :label="
                    form.isOutput
                      ? 'Name'
                      : isSupportCategory
                        ? 'Name'
                        : 'Name'
                  "
                  class="q-mt-sm modern-input"
                  outlined
                  dense
                  :rules="[]"
                  :error="errors.name"
                  error-message="This field is required"
                  ref="nameInput"
                />
              </div>
            </template>

            <!-- Dynamic inputs for add mode -->
            <template v-else>
              <div
                v-for="(item, index) in form.items"
                :key="index"
                class="q-mb-md"
                :ref="'itemContainer_' + index"
              >
                <div class="row items-center">
                  <q-input
                    v-model="item.name"
                    :label="getInputLabel(index)"
                    class="col-grow q-mr-sm modern-input"
                    outlined
                    dense
                    :rules="[]"
                    :error="errors[`item_${index}`]"
                    error-message="This field is required"
                    :ref="'itemInput_' + index"
                  />
                  <q-btn
                    v-if="index > 0 || form.items.length > 1"
                    icon="remove"
                    flat
                    round
                    dense
                    color="negative"
                    @click="removeItem(index)"
                    class="q-ml-sm"
                  />
                </div>
              </div>
            </template>
          </q-card-section>
        </div>

        <!-- Fixed actions at the bottom -->
        <q-card-actions align="right" class="q-pa-md modal-fixed-actions">
          <q-btn
            v-if="modal.mode === 'add'"
            label="Add Another"
            flat
            dense
            color="primary"
            @click="addNewItem"
            class="q-mr-sm"
          />
          <q-btn
            label="Save"
            color="primary"
            @click="confirmSave"
            :loading="modal.loading"
            :disable="modal.loading || isProcessing"
            size="md"

          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useUserStore } from '/src/stores/userStore'
import { useMfoStore } from 'src/stores/office/mfo_Store'
import { useQuasar } from 'quasar'
import Swal from 'sweetalert2'

const userStore = useUserStore()
const mfoStore = useMfoStore()
const $q = useQuasar()

const loading = ref(false)
const expandedMfos = ref([])
const errors = reactive({})
const isProcessing = ref(false)

// Modal state
const modal = reactive({
  show: false,
  title: '',
  mode: 'add',
  loading: false
})

// Form state
const form = reactive({
  category: null,
  parentMfo: null,
  isOutput: false,
  items: [{ name: '' }]
})

// Computed properties for categorized MFOs
const strategicMfos = computed(() => userStore.mfos.filter(mfo => mfo.f_category_id === 1))
const coreMfos = computed(() => userStore.mfos.filter(mfo => mfo.f_category_id === 2))
const supportOutputs = computed(() => userStore.outputs.filter(output => output.f_category_id === 3 && !output.mfo_id))

const getOutputsForMfo = (mfoId) => userStore.outputs.filter(output => output.mfo_id === mfoId)

// Check if current category is support
const isSupportCategory = computed(() => form.category?.id === 3)

// Methods
const loadUserData = async () => {
  loading.value = true
  try {
    await userStore.loadUserData()
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Failed to load user data' })
  } finally {
    loading.value = false
  }
}

onMounted(loadUserData)

const toggleMfoExpansion = (mfoId) => {
  const index = expandedMfos.value.indexOf(mfoId)
  if (index > -1) {
    expandedMfos.value.splice(index, 1)
  } else {
    expandedMfos.value.push(mfoId)
  }
}

// Single confirmation dialog for Save
const confirmSave = async () => {
  if (isProcessing.value) return

  // Validate form first
  let hasErrors = false
  Object.keys(errors).forEach(key => delete errors[key])

  if (modal.mode === 'edit') {
    if (!form.items[0].name.trim()) {
      errors.name = true
      hasErrors = true
    }
  } else {
    form.items.forEach((item, index) => {
      if (!item.name.trim()) {
        errors[`item_${index}`] = true
        hasErrors = true
      }
    })
  }

  if (hasErrors) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    })
    return
  }

  // Create confirmation message
  let confirmationMessage = ''
  let itemType = ''

  if (modal.mode === 'edit') {
    itemType = form.isOutput ? 'output' : 'MFO'
    confirmationMessage = `Are you sure you want to update "${form.items[0].name}"?`
  } else {
    itemType = form.isOutput ? 'output' : 'MFO'
    if (form.items.length === 1) {
      confirmationMessage = `Are you sure you want to add "${form.items[0].name}"?`
    } else {
      const itemNames = form.items.map(item => item.name).join('", "')
      confirmationMessage = `Are you sure you want to add the following ${itemType}s?<br><br><strong>"${itemNames}"</strong>`
    }
  }

  // Set processing flag
  isProcessing.value = true

  // Temporarily hide the modal to show SweetAlert properly
  const originalModalState = modal.show
  modal.show = false

  try {
    // Small delay to ensure modal is hidden
    await new Promise(resolve => setTimeout(resolve, 100))

    const result = await Swal.fire({
      title: `${modal.mode === 'edit' ? 'Update' : 'Add'} ${itemType.toUpperCase()}`,
      html: confirmationMessage,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00703c',
      cancelButtonColor: '#d33',
      confirmButtonText: `Confirm`,
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      allowEscapeKey: true
    })

    if (result.isConfirmed) {
      await proceedWithSave()
    } else {
      // Restore modal if user cancels
      modal.show = originalModalState
      isProcessing.value = false
    }
  } catch (error) {
    console.error('SweetAlert error:', error)
    // Restore modal on error
    modal.show = originalModalState
    isProcessing.value = false
  }
}

// Proceed with save after confirmation
const proceedWithSave = async () => {
  try {
    modal.loading = true

    let successMessage = ''

    if (modal.mode === 'edit') {
      // Edit mode - single item
      const item = form.items[0]
      const data = {
        name: item.name,
        office_id: userStore.officeId,
        f_category_id: form.category.id
      }

      if (form.isOutput) {
        // Update output
        if (form.parentMfo) {
          data.mfo_id = form.parentMfo.id
        }
        const response = await mfoStore.updateOutput(item.id, data)
        if (response) {
          successMessage = 'Output has been updated successfully.'
        }
      } else {
        // Update MFO
        const response = await mfoStore.updateMfo(item.id, data)
        if (response) {
          successMessage = 'MFO has been updated successfully.'
        }
      }
    } else {
      // Add mode - can be multiple items
      const items = form.items.map(item => ({
        name: item.name,
        office_id: userStore.officeId,
        f_category_id: form.category.id
      }))

      if (form.items.length === 1) {
        // Single item
        const data = items[0]

        if (form.isOutput) {
          if (form.parentMfo) {
            data.mfo_id = form.parentMfo.id
          }
          const response = await mfoStore.addOutput(data)
          if (response) {
            successMessage = 'Output has been added successfully.'
          }
        } else {
          const response = await mfoStore.addMfo(data)
          if (response) {
            successMessage = 'MFO has been added successfully.'
          }
        }
      } else {
        // Multiple items
        const response = await mfoStore.addMultipleItems(
          items,
          form.isOutput,
          form.parentMfo?.id
        )
        if (response) {
          const itemTypeText = form.isOutput ? 'outputs' : 'MFOs'
          successMessage = `${items.length} ${itemTypeText} have been added successfully.`
        }
      }
    }

    // Close modal first
    closeModal()

    // Reload user data to get updated MFOs/outputs
    await loadUserData()

    // Show success message only once after everything is complete
    if (successMessage) {
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: successMessage,
        confirmButtonColor: '#00703c',
        timer: 2000,
        timerProgressBar: true
      })
    }

  } catch (error) {
    console.error('Error saving:', error)
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to save. Please try again.',
      confirmButtonColor: '#00703c'
    })
    // Restore modal on error
    modal.show = true
  } finally {
    modal.loading = false
    isProcessing.value = false
  }
}

// Delete functions - these keep their confirmation dialogs since they're called directly
const confirmDelete = async (mfo) => {
  try {
    const result = await mfoStore.deleteMfo(mfo.id, mfo.name)
    if (result) {
      await loadUserData()
    }
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    // Error handling is done in the store
  }
}

const confirmDeleteOutput = async (output) => {
  try {
    const result = await mfoStore.deleteOutput(output.id, output.name)
    if (result) {
      await loadUserData()
    }
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    // Error handling is done in the store
  }
}

// Rest of your existing methods remain the same...
const openAddModal = (categoryType) => {
  Object.assign(form, {
    category: getCategoryByType(categoryType),
    parentMfo: null,
    isOutput: categoryType === 'support',
    items: [{ name: '' }]
  })

  modal.show = true
  modal.mode = 'add'
  modal.title = `Add ${getModalTitle(categoryType)}`

  Object.keys(errors).forEach(key => delete errors[key])
}

const openAddOutputModal = (mfo, categoryType) => {
  Object.assign(form, {
    category: getCategoryByType(categoryType),
    parentMfo: mfo,
    isOutput: true,
    items: [{ name: '' }]
  })

  modal.show = true
  modal.mode = 'add'
  modal.title = 'Add Output'

  Object.keys(errors).forEach(key => delete errors[key])
}

const editMfo = (mfo, categoryType) => {
  Object.assign(form, {
    category: getCategoryByType(categoryType),
    parentMfo: null,
    isOutput: false,
    items: [{ name: mfo.name, id: mfo.id }]
  })

  modal.show = true
  modal.mode = 'edit'
  modal.title = 'Edit MFO'

  Object.keys(errors).forEach(key => delete errors[key])
}

const editOutput = (output, mfo, categoryType) => {
  Object.assign(form, {
    category: getCategoryByType(categoryType),
    parentMfo: mfo,
    isOutput: true,
    items: [{ name: output.name, id: output.id }]
  })

  modal.show = true
  modal.mode = 'edit'
  modal.title = 'Edit Output'

  Object.keys(errors).forEach(key => delete errors[key])
}

const editSupport = (output) => {
  Object.assign(form, {
    category: { id: 3, name: 'C. SUPPORT FUNCTION' },
    parentMfo: null,
    isOutput: true,
    items: [{ name: output.name, id: output.id }]
  })

  modal.show = true
  modal.mode = 'edit'
  modal.title = 'Edit Support Output'

  Object.keys(errors).forEach(key => delete errors[key])
}

const getCategoryByType = (categoryType) => {
  const categories = {
    strategic: { id: 1, name: 'A. STRATEGIC FUNCTION' },
    core: { id: 2, name: 'B. CORE FUNCTION' },
    support: { id: 3, name: 'C. SUPPORT FUNCTION' }
  }
  return categories[categoryType]
}

const getModalTitle = (categoryType) => {
  const titles = {
    strategic: 'Strategic MFO',
    core: 'Core MFO',
    support: 'Support Output'
  }
  return titles[categoryType]
}

// eslint-disable-next-line no-unused-vars
const getInputLabel = (index) => {
  const baseLabel = form.isOutput
    ? (isSupportCategory.value ? 'Name' : 'Output')
    : 'Name'
  return `${baseLabel} `
} // ${index + 1}

const addNewItem = () => {
  form.items.push({ name: '' })
}

const removeItem = (index) => {
  if (form.items.length > 1) {
    form.items.splice(index, 1)
  }
}

const closeModal = () => {
  modal.show = false
  Object.keys(errors).forEach(key => delete errors[key])
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.full-page-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Your existing styles remain the same */
.mfo-table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

.category-column {
  padding: 16px;
  background-color: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  vertical-align: top;
  width: 33.33%;
}

.category-column:last-child {
  border-right: none;
}

.category-cell {
  padding: 16px;
  vertical-align: top;
  border-right: 1px solid #e0e0e0;
  width: 33.33%;
  height: 100%;
}

.category-cell:last-child {
  border-right: none;
}

.mfo-list,
.output-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mfo-item {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 12px;
  margin-bottom: 12px;
  transition: box-shadow 0.2s ease;
}

.mfo-item:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.output-item {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 10px 12px;
  margin: 8px 0;
}

.mfo-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mfo-title {
  flex-grow: 1;
  padding-right: 12px;
  min-width: 0;
  display: flex;
  align-items: center;
  min-height: 32px;
}

.mfo-number {
  font-size: 0.85rem;
  white-space: nowrap;
  margin-right: 8px;
}

.mfo-name {
   margin-top:13px;
  word-break: break-word;
}

.output-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.output-number {
  font-size: 0.8rem;
  white-space: nowrap;
  margin-right: 8px;
}

.output-name {
  /* font-weight: bold; */
  word-break: break-word;
  flex-grow: 1;
  margin-top: 15px;
}

.mfo-actions {
  display: flex;
  gap: 4px;
  min-width: 56px;
  flex-shrink: 0;
  align-items: center;
}

.output-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #6c757d;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-card {
  border-radius: 8px;
  overflow: hidden;
}

.modal-scrollable-content {
  max-height: 400px;
  overflow-y: auto;
}

.modal-fixed-actions {
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 1;
  border-top: 1px solid #e0e0e0;
}

/* .modern-input {

} */

.modern-input ::v-deep(.q-field__control) {
  border-radius: 6px;
  transition: all 0.3s ease;

}

.modern-input ::v-deep(.q-field__control:hover) {
  border-color: #a0c0e8;

}

.modern-input ::v-deep(.q-field--focused .q-field__control) {
  border-color: #1976d2;
  box-shadow: 0 0 0 1px rgba(25, 118, 210, 0.2);

}

.modern-input ::v-deep(.q-field--error .q-field__control) {
  border-color: #f44336;
  box-shadow: 0 0 0 1px rgba(244, 67, 54, 0.2);

}

.modern-input ::v-deep(.q-field__native) {
  font-size: 0.95rem;

}

.shake-animation {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.add-output-btn {
  background-color: #00703c !important;
  color: white !important;
  border-radius: 20px !important;
  padding: 4px 16px !important;
  text-transform: none !important;
  width: auto !important;
  margin: 8px 0 !important;
}

.output-list {
  margin-top: 8px;
  margin-bottom: 8px;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
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

@media (max-width: 1024px) {
  .category-cell {
    padding: 12px;
  }

  .mfo-item {
    padding: 10px;
  }
}

@media (max-width: 768px) {
  .mfo-table {
    display: block;
    overflow-x: auto;
  }

  .category-column,
  .category-cell {
    min-width: 280px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-content .q-btn {
    margin-left: 0;
    margin-top: 8px;
  }
}
.text-subtitle2{
  font-size: large;
}
</style>
