<template>
  <q-page class="q-pa-md">
    <div class="q-mb-lg">
      <h6 class="text-h6 text-weight-medium text-grey-8">Major Final Outputs (MFO)</h6>
      <q-separator class="q-mt-sm" />
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="flex justify-center q-pa-lg">
      <q-spinner-hourglass color="green" size="3em" />
    </div>

    <!-- Table inside a responsive card -->
    <q-card flat bordered class="full-width shadow-1">
      <table class="mfo-table full-width">
        <thead>
          <tr>
            <th class="category-column">
              <div class="header-content">
                <span class="text-subtitle1 text-weight-bold">A. STRATEGIC FUNCTION</span>
                <q-btn icon="add" size="sm" flat round dense color="primary" @click="openAddModal('strategic')"
                  class="q-ml-sm" />
              </div>
            </th>
            <th class="category-column">
              <div class="header-content">
                <span class="text-subtitle1 text-weight-bold">B. CORE FUNCTION</span>
                <q-btn icon="add" size="sm" flat round dense color="primary" @click="openAddModal('core')"
                  class="q-ml-sm" />
              </div>
            </th>
            <th class="category-column">
              <div class="header-content">
                <span class="text-subtitle1 text-weight-bold">C. SUPPORT FUNCTION</span>
                <q-btn icon="add" size="sm" flat round dense color="primary" @click="openAddModal('support')"
                  class="q-ml-sm" />
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
                    <q-btn size="xs" flat round dense color="grey-7" @click.stop="toggleMfoExpansion(mfo.id)"
                      :icon="expandedMfos.includes(mfo.id) ? 'expand_less' : 'expand_more'" class="q-mr-xs" />
                    <div class="mfo-title" @click="toggleMfoExpansion(mfo.id)">
                      <div class="mfo-number">{{ `MFO ${index + 1}.` }}</div>
                      <strong class="mfo-name">{{ mfo.name }}</strong>
                    </div>
                    <div class="mfo-actions">
                      <q-btn icon="edit" size="xs" flat round dense color="grey-7" @click="editMfo(mfo, 'strategic')" />
                      <q-btn icon="delete" size="xs" flat round dense color="negative" @click="confirmDelete(mfo)" />
                    </div>
                  </div>
                  <q-slide-transition>
                    <div v-show="expandedMfos.includes(mfo.id)">
                      <ul class="output-list">
                        <li v-for="(output, outputIndex) in getOutputsForMfo(mfo.id)" :key="output.id"
                          class="output-item">
                          <div class="output-content">
                            <div class="output-number">{{ `OUTPUT ${outputIndex + 1}.` }}</div>
                            <strong class="output-name">{{ output.name }}</strong>
                            <div class="output-actions">
                              <q-btn icon="edit" size="xs" flat round dense color="grey-7"
                                @click="editOutput(output, mfo, 'strategic')" />
                              <q-btn icon="delete" size="xs" flat round dense color="negative"
                                @click="confirmDeleteOutput(output)" />
                            </div>
                          </div>
                        </li>
                      </ul>
                      <div class="row justify-center q-mt-sm">
                        <q-btn label="Add Output" size="xs" dense color="primary"
                          @click="openAddOutputModal(mfo, 'strategic')" class="add-output-btn" />
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
                    <q-btn size="xs" flat round dense color="grey-7" @click.stop="toggleMfoExpansion(mfo.id)"
                      :icon="expandedMfos.includes(mfo.id) ? 'expand_less' : 'expand_more'" class="q-mr-xs" />
                    <div class="mfo-title" @click="toggleMfoExpansion(mfo.id)">
                      <div class="mfo-number">{{ `MFO ${index + 1}.` }}</div>
                      <strong class="mfo-name">{{ mfo.name }}</strong>
                    </div>
                    <div class="mfo-actions">
                      <q-btn icon="edit" size="xs" flat round dense color="grey-7" @click="editMfo(mfo, 'core')" />
                      <q-btn icon="delete" size="xs" flat round dense color="negative" @click="confirmDelete(mfo)" />
                    </div>
                  </div>
                  <q-slide-transition>
                    <div v-show="expandedMfos.includes(mfo.id)">
                      <ul class="output-list">
                        <li v-for="(output, outputIndex) in getOutputsForMfo(mfo.id)" :key="output.id"
                          class="output-item">
                          <div class="output-content">
                            <div class="output-number">{{ `OUTPUT ${outputIndex + 1}.` }}</div>
                            <strong class="output-name">{{ output.name }}</strong>
                            <div class="output-actions">
                              <q-btn icon="edit" size="xs" flat round dense color="grey-7"
                                @click="editOutput(output, mfo, 'core')" />
                              <q-btn icon="delete" size="xs" flat round dense color="negative"
                                @click="confirmDeleteOutput(output)" />
                            </div>
                          </div>
                        </li>
                      </ul>
                      <div class="row justify-center q-mt-sm">
                        <q-btn label="Add Output" size="xs" dense color="primary"
                          @click="openAddOutputModal(mfo, 'core')" class="add-output-btn" />
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
                      <div class="output-number">{{ `OUTPUT ${index + 1}.` }}</div>
                      <strong class="output-name">{{ output.name }}</strong>
                    </div>
                    <div class="mfo-actions">
                      <q-btn icon="edit" size="xs" flat round dense color="grey-7" @click="editSupport(output)" />
                      <q-btn icon="delete" size="xs" flat round dense color="negative"
                        @click="confirmDeleteOutput(output)" />
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
        <q-card-section class="row items-center q-pb-none" style="background-color: #00703C">
          <div class="text-subtitle1 text-white">{{ modal.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="closeModal" class="text-white"
            style="margin-right: -8px" />
        </q-card-section>

        <!-- Scrollable content -->
        <div class="modal-scrollable-content" ref="modalContent">
          <q-card-section class="q-pt-md">
            <!-- Category Display -->
            <div v-if="form.category" class="q-mb-md">
              <div class="text-caption text-grey-6">Category</div>
              <div class="text-body1 text-weight-medium">{{ form.category.name }}</div>
            </div>

            <!-- Single input for edit mode -->
            <template v-if="modal.mode === 'edit'">
              <div :ref="'itemContainer_0'">
                <q-input v-model="form.items[0].name"
                  :label="form.isOutput ? 'Output Name' : (isSupportCategory ? 'Support Output Name' : 'MFO Name')"
                  class="q-mt-sm modern-input" outlined dense :rules="[]" :error="errors.name"
                  error-message="This field is required" ref="nameInput" />
              </div>
            </template>

            <!-- Dynamic inputs for add mode -->
            <template v-else>
              <div v-for="(item, index) in form.items" :key="index" class="q-mb-md" :ref="'itemContainer_' + index">
                <div class="row items-center">
                  <q-input v-model="item.name" :label="getInputLabel(index)" class="col-grow q-mr-sm modern-input"
                    outlined dense :rules="[]" :error="errors[`item_${index}`]" error-message="This field is required"
                    :ref="'itemInput_' + index" />
                  <q-btn v-if="index > 0 || form.items.length > 1" icon="remove" flat round dense color="negative"
                    @click="removeItem(index)" class="q-ml-sm" />
                </div>
              </div>
            </template>
          </q-card-section>
        </div>

        <!-- Fixed actions at the bottom -->
        <q-card-actions align="right" class="q-pa-md modal-fixed-actions">
          <q-btn v-if="modal.mode === 'add'" label="Add Another" flat dense color="primary" @click="addNewItem"
            class="q-mr-sm" />
          <q-btn label="Save" color="primary" @click="confirmSave" :loading="modal.loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="confirmDialog.show" persistent>
      <q-card class="modal-card" style="min-width: 500px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none" style="background-color: #00703C">
          <div class="text-subtitle1 text-white">Confirm Details</div>
          <q-space />
          <q-icon name="task_alt" size="md" class="text-white" />
        </q-card-section>

        <div class="modal-scrollable-content">
          <q-card-section class="q-pt-md">
            <div class="text-subtitle2 text-grey-8 q-mb-sm">Please review the details before saving:</div>

            <!-- Category/Function first -->
            <q-item>
              <q-item-section avatar>
                <q-icon name="category" color="orange" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Category/Function</q-item-label>
                <q-item-label caption>{{ form.category.name }}</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Parent MFO if exists -->
            <q-item v-if="form.parentMfo">
              <q-item-section avatar>
                <q-icon name="account_tree" color="green" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Parent MFO</q-item-label>
                <q-item-label caption>{{ form.parentMfo.name }}</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Items list -->
            <q-list bordered separator class="rounded-borders q-mt-sm">
              <q-item v-for="(item, index) in form.items" :key="index">
                <q-item-section avatar>
                  <q-icon :name="form.isOutput ? 'description' : 'folder'" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ form.isOutput ? 'Output' : 'MFO' }} {{ index + 1 }}
                  </q-item-label>
                  <q-item-label caption>{{ item.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </div>

        <q-card-actions align="right" class="q-pa-md modal-fixed-actions">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn label="Confirm & Save" color="primary" @click="proceedWithSave" icon="save" unelevated
            class="q-px-sm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { api } from 'src/boot/axios';
import { useUserStore } from 'src/stores/userStore';
import { mapState } from 'pinia';
import Swal from 'sweetalert2';

export default {
  name: "MFOComponent",
  data() {
    return {
      loading: true,
      mfos: [],
      outputs: [],
      categories: [],
      expandedMfos: [],
      errors: {},
      firstInvalidFieldFocused: false,
      modal: {
        show: false,
        title: "Add MFO / Output",
        mode: "add",
        loading: false,
        context: null
      },
      confirmDialog: {
        show: false
      },
      form: {
        category: null,
        items: [{ name: "" }],
        isOutput: false,
        parentMfo: null
      },
      touchedFields: {}
    };
  },
  computed: {
    ...mapState(useUserStore, ['user']),
    categoryOptions() {
      const standardCategories = [
        { id: 1, name: "A. STRATEGIC FUNCTION", type: "strategic" },
        { id: 2, name: "B. CORE FUNCTION", type: "core" },
        { id: 3, name: "C. SUPPORT FUNCTION", type: "support" }
      ];

      if (this.categories && this.categories.length > 0) {
        const existingCategoryNames = this.categories.map(c => c.name);
        const missingCategories = standardCategories.filter(
          sc => !existingCategoryNames.some(name => name.includes(sc.name.split(' ')[0]))
        );
        return [...this.categories, ...missingCategories];
      }
      return standardCategories;
    },
    isSupportCategory() {
      return this.form.category &&
        (this.form.category.name.includes("SUPPORT") ||
          this.form.category.name.includes("C."));
    },
    supportCategory() {
      return this.categoryOptions.find(cat =>
        cat.name.includes("SUPPORT") ||
        cat.name.includes("C.")
      );
    },
    strategicMfos() {
      return this.mfos.filter(mfo =>
        mfo.category && (
          mfo.category.name?.includes("STRATEGIC") ||
          mfo.category.name?.includes("A.")
        )
      );
    },
    coreMfos() {
      return this.mfos.filter(mfo =>
        mfo.category && (
          mfo.category.name?.includes("CORE") ||
          mfo.category.name?.includes("B.")
        )
      );
    },
    supportOutputs() {
      if (!this.supportCategory) return [];
      return this.outputs.filter(output =>
        output.f_category_id === this.supportCategory.id &&
        (!output.mfo_id || output.mfo_id === null)
      );
    },
  },
  created() {
    this.fetchData();
  },
  methods: {
    toggleMfoExpansion(mfoId) {
      const index = this.expandedMfos.indexOf(mfoId);
      if (index === -1) {
        this.expandedMfos.push(mfoId);
      } else {
        this.expandedMfos.splice(index, 1);
      }
    },
    validateField(fieldName, force = false) {
      if (!force && !this.touchedFields[fieldName]) {
        return true;
      }

      let isValid = false;
      if (fieldName === 'name') {
        isValid = !!this.form.items[0]?.name?.trim();
      } else if (fieldName.startsWith('item_')) {
        const index = parseInt(fieldName.split('_')[1]);
        isValid = !!this.form.items[index]?.name?.trim();
      }
      this.errors[fieldName] = !isValid;
      return isValid;
    },
    validateForm() {
      this.errors = {};
      let isValid = true;
      let firstInvalidIndex = -1;

      this.form.items.forEach((item, index) => {
        const fieldName = this.modal.mode === 'edit' && index === 0 ? 'name' : `item_${index}`;
        if (!this.validateField(fieldName, true)) {
          isValid = false;
          if (firstInvalidIndex === -1) {
            firstInvalidIndex = index;
          }
        }
      });

      if (!isValid) {
        this.$nextTick(() => {
          this.shakeInvalidFields();
          this.scrollToInvalidField(firstInvalidIndex);
        });
      }

      return isValid;
    },
    async confirmSave() {
      if (!this.validateForm()) {
        return;
      }

      // Temporarily close the modal while showing SweetAlert
      const modalWasOpen = this.modal.show;
      this.modal.show = false;

      try {
        const result = await Swal.fire({
          title: 'Confirm Save',
          text: 'Do you want to save these changes?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#00703C', // Your app's primary color
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, save it!',
          allowOutsideClick: false, // Prevent closing by clicking outside
          backdrop: 'rgba(0,0,0,0.5)', // Semi-transparent backdrop
          focusConfirm: false // Don't auto-focus the confirm button
        });

        if (result.isConfirmed) {
          await this.proceedWithSave();
        } else if (modalWasOpen) {
          this.modal.show = true; // Reopen modal if canceled
        }
      } catch (error) {
        console.error('Confirmation error:', error);
        if (modalWasOpen) this.modal.show = true;
      }
    },


    async proceedWithSave() {
      try {
        this.modal.loading = true;

        // Save logic based on form type
        if (this.form.isOutput) {
          await this.saveOutputs();
        } else if (!this.isSupportCategory) {
          await this.saveMfos();
        } else {
          await this.saveOutputs();
          return;
        }

        // Show success message
        await Swal.fire({
          title: 'Success!',
          text: this.getSuccessMessage(),
          icon: 'success',
          confirmButtonColor: '#00703C',
          timer: 2000, // Auto-close after 2 seconds
          timerProgressBar: true,
          showConfirmButton: false
        });

        await this.fetchData();
        this.closeModal();
      } catch (error) {
        console.error('Save error:', error);

        // Show error message
        await Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to save entries',
          icon: 'error',
          confirmButtonColor: '#d33'
        });

        // Reopen modal on error
        this.modal.show = true;
      } finally {
        this.modal.loading = false;
      }
    },

    getSuccessMessage() {
      if (this.modal.mode === 'add') {
        return this.form.isOutput
          ? 'Output added successfully!'
          : 'MFO added successfully!';
      } else {
        return this.form.isOutput
          ? 'Output updated successfully!'
          : 'MFO updated successfully!';
      }
    },
    shakeInvalidFields() {
      this.$nextTick(() => {
        Object.keys(this.errors).forEach(fieldName => {
          if (this.errors[fieldName]) {
            const index = fieldName === 'name' ? 0 : parseInt(fieldName.split('_')[1]);
            const refName = `itemInput_${index}`;
            if (this.$refs[refName]) {
              const input = Array.isArray(this.$refs[refName]) ?
                this.$refs[refName][0].$el :
                this.$refs[refName].$el;

              input.classList.remove('shake-animation');
              void input.offsetWidth;
              input.classList.add('shake-animation');

              setTimeout(() => {
                input.classList.remove('shake-animation');
              }, 500);
            }
          }
        });
      });
    },


    scrollToInvalidField(index) {
      this.$nextTick(() => {
        const containerRef = `itemContainer_${index}`;
        if (this.$refs[containerRef]) {
          const container = Array.isArray(this.$refs[containerRef]) ?
            this.$refs[containerRef][0] :
            this.$refs[containerRef];

          if (container && this.$refs.modalContent) {
            const containerTop = container.offsetTop;
            const modalHeight = this.$refs.modalContent.offsetHeight;
            const scrollPosition = Math.min(
              containerTop - 20,
              this.$refs.modalContent.scrollHeight - modalHeight
            );

            this.$refs.modalContent.scrollTo({
              top: scrollPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    },

    scrollToNewField() {
      this.$nextTick(() => {
        const lastIndex = this.form.items.length - 1;
        const containerRef = `itemContainer_${lastIndex}`;
        if (this.$refs[containerRef] && this.$refs.modalContent) {
          const container = Array.isArray(this.$refs[containerRef]) ?
            this.$refs[containerRef][0] :
            this.$refs[containerRef];

          if (container) {
            const containerTop = container.offsetTop;
            const modalHeight = this.$refs.modalContent.offsetHeight;
            const scrollPosition = Math.min(
              containerTop - 20,
              this.$refs.modalContent.scrollHeight - modalHeight
            );

            this.$refs.modalContent.scrollTo({
              top: scrollPosition,
              behavior: 'smooth'
            });

            const inputRef = `itemInput_${lastIndex}`;
            if (this.$refs[inputRef]) {
              const input = Array.isArray(this.$refs[inputRef]) ?
                this.$refs[inputRef][0] :
                this.$refs[inputRef];
              input.focus();
            }
          }
        }
      });
    },
    async fetchData() {
      this.loading = true;
      try {
        const userStore = useUserStore();
        await userStore.loadUserData();
        this.mfos = userStore.mfos;

        const categoriesResponse = await api.get('/fetch_f_category');
        this.categories = categoriesResponse.data;

        const outputsResponse = await api.get('/allOutputs', {
          params: {
            office_id: this.user.office_id
          }
        });

        this.outputs = outputsResponse.data.map(output => {
          return {
            ...output,
            category: this.categories.find(c => c.id === output.f_category_id),
            mfo: this.mfos.find(m => m.id === output.mfo_id)
          };
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load data. Please try again.',
          position: 'top'
        });
      } finally {
        this.loading = false;
      }
    },
    getOutputsForMfo(mfoId) {
      return this.outputs.filter(output => output.mfo_id === mfoId);
    },
    getInputLabel(index) {
      if (this.form.isOutput) {
        return this.isSupportCategory ? `Support Output ${index + 1}` : `Output ${index + 1}`;
      }
      return `MFO ${index + 1}`;
    },
    addNewItem() {
      this.form.items.push({ name: "" });
      this.scrollToNewField();
    },
    removeItem(index) {
      if (this.form.items.length > 1) {
        this.form.items.splice(index, 1);
        this.errors = {};
        const fieldName = `item_${index}`;
        delete this.touchedFields[fieldName];

        for (let i = index + 1; i < this.form.items.length + 1; i++) {
          if (this.touchedFields[`item_${i}`]) {
            this.touchedFields[`item_${i - 1}`] = this.touchedFields[`item_${i}`];
            delete this.touchedFields[`item_${i}`];
          }
        }
      }
    },
    resetForm() {
      this.form = {
        category: null,
        items: [{ name: "" }],
        isOutput: false,
        parentMfo: null
      };
      this.errors = {};
      this.touchedFields = {};
      this.firstInvalidFieldFocused = false;
    },
    openAddModal(categoryType) {
      this.resetForm();
      const isSupport = categoryType === 'support';

      this.modal = {
        show: true,
        title: isSupport ? 'Add Support Output' : `Add ${this.getCategoryName(categoryType)}`,
        mode: "add",
        loading: false,
        context: { categoryType }
      };

      const categoryForType = this.findCategoryByType(categoryType);
      if (!categoryForType) {
        console.error('Could not find appropriate category for type:', categoryType);
        this.$q.notify({
          type: 'negative',
          message: 'Failed to set category. Please try again.',
          position: 'top'
        });
        this.closeModal();
        return;
      }

      this.form.category = categoryForType;
      this.form.isOutput = isSupport;
      this.form.parentMfo = null;
    },
    openAddOutputModal(mfo, categoryType) {
      this.resetForm();
      this.modal = {
        show: true,
        title: "Add Outputs",
        mode: "add",
        loading: false,
        context: { mfo, categoryType }
      };

      this.form.category = this.findCategoryByType(categoryType);
      this.form.parentMfo = mfo;
      this.form.isOutput = true;
    },
    editMfo(mfo, categoryType) {
      this.resetForm();
      this.modal = {
        show: true,
        title: "Edit MFO",
        mode: "edit",
        loading: false,
        context: {
          mfo: { ...mfo },
          categoryType
        }
      };

      this.form.category = mfo.category || this.findCategoryByType(categoryType);
      this.form.items = [{ name: mfo.name }];
      this.form.isOutput = false;
    },
    editOutput(output, mfo, categoryType) {
      this.resetForm();
      this.modal = {
        show: true,
        title: "Edit Output",
        mode: "edit",
        loading: false,
        context: { output, mfo, categoryType }
      };

      this.form.category = mfo.category || this.findCategoryByType(categoryType);
      this.form.parentMfo = mfo;
      this.form.items = [{ name: output.name }];
      this.form.isOutput = true;
    },
    editSupport(mfo) {
      this.resetForm();
      this.modal = {
        show: true,
        title: "Edit Support Output",
        mode: "edit",
        loading: false,
        context: { mfo }
      };

      this.form.category = this.findCategoryByType('support');
      this.form.items = [{ name: mfo.name }];
      this.form.isOutput = true;
    },
    findCategoryByType(categoryType) {
      return this.categoryOptions.find(cat => {
        if (categoryType === 'strategic') {
          return cat.name.includes("STRATEGIC") || cat.name.includes("A.");
        } else if (categoryType === 'core') {
          return cat.name.includes("CORE") || cat.name.includes("B.");
        } else {
          return cat.name.includes("SUPPORT") || cat.name.includes("C.");
        }
      });
    },
    getCategoryName(categoryType) {
      switch (categoryType) {
        case 'strategic': return 'Strategic MFO';
        case 'core': return 'Core MFO';
        case 'support': return 'Support Output';
        default: return 'MFO/Output';
      }
    },
    async saveEntry() {
      // This is now handled by confirmSave and proceedWithSave
    },
    async saveMfos() {
      try {
        if (this.modal.mode === 'add') {
          const promises = this.form.items.map(item => {
            return api.post('/add_mfo', {
              office_id: this.user.office_id,
              name: item.name,
              f_category_id: this.form.category.id
            });
          });
          await Promise.all(promises);
        } else {
          const mfoId = this.modal.context?.mfo?.id;
          if (!mfoId) {
            throw new Error("MFO ID is missing");
          }

          await api.post(`/mfos/${mfoId}`, {
            office_id: this.user.office_id,
            name: this.form.items[0].name,
            f_category_id: this.form.category.id
          });
        }
      } catch (error) {
        console.error('Error saving MFO:', error);
        throw error;
      }
    },
    async saveOutputs() {
      try {
        if (this.modal.mode === 'add') {
          const promises = this.form.items.map(item => {
            const payload = {
              name: item.name,
              f_category_id: this.form.category.id,
              office_id: this.user.office_id
            };

            if (!this.isSupportCategory && this.form.parentMfo) {
              payload.mfo_id = this.form.parentMfo.id;
            }

            return api.post('/add_output', payload);
          });

          await Promise.all(promises);
        } else {
          const outputId = this.modal.context?.output?.id || this.modal.context?.mfo?.id;
          if (!outputId) {
            throw new Error("Output ID is missing");
          }

          const payload = {
            name: this.form.items[0].name,
            f_category_id: this.form.category.id,
            office_id: this.user.office_id
          };

          if (!this.isSupportCategory && this.form.parentMfo) {
            payload.mfo_id = this.form.parentMfo.id;
          }

          await api.post(`/outputs/${outputId}`, payload);
        }
      } catch (error) {
        console.error('Error saving outputs:', error);
        throw error;
      }
    },

    async confirmDelete(mfo) {
      const modalWasOpen = this.modal.show;
      this.modal.show = false;

      try {
        const result = await Swal.fire({
          title: 'Delete MFO?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#00703C',
          confirmButtonText: 'Yes, delete it!',
          backdrop: 'rgba(0,0,0,0.5)',
          allowOutsideClick: false
        });

        if (result.isConfirmed) {
          await this.deleteMfo(mfo);
          await Swal.fire({
            title: 'Deleted!',
            text: 'MFO has been deleted.',
            icon: 'success',
            confirmButtonColor: '#00703C',
            timer: 1500,
            showConfirmButton: false
          });
        } else if (modalWasOpen) {
          this.modal.show = true;
        }
      } catch (error) {
        console.error('Delete error:', error);
        if (modalWasOpen) this.modal.show = true;
      }
    },
    async confirmDeleteOutput(output) {
      const modalWasOpen = this.modal.show;
      this.modal.show = false;

      try {
        const result = await Swal.fire({
          title: 'Confirm Delete',
          text: 'Are you sure you want to delete this output?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#00703C',
          confirmButtonText: 'Yes, delete it!',
          allowOutsideClick: false,
          focusConfirm: false,
          backdrop: true
        });

        if (result.isConfirmed) {
          await this.deleteOutput(output);
        } else if (modalWasOpen) {
          this.modal.show = true;
        }
      } catch (error) {
        console.error('Delete confirmation error:', error);
        if (modalWasOpen) {
          this.modal.show = true;
        }
      }
    },
    async deleteMfo(mfo) {
      try {
        await api.delete(`/mfos/${mfo.id}`);
        this.$q.notify({
          type: 'positive',
          message: 'MFO deleted successfully',
          position: 'top'
        });
        await this.fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to delete MFO',
          position: 'top'
        });
      }
    },
    async deleteOutput(output) {
      try {
        await api.delete(`/outputs/${output.id}`);
        this.$q.notify({
          type: 'positive',
          message: 'Output deleted successfully',
          position: 'top'
        });
        await this.fetchData();
      } catch (error) {
        console.error('Delete output error:', error);
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to delete output',
          position: 'top'
        });
      }
    },
    closeModal() {
      this.modal.show = false;
      this.resetForm();
    }
  }
};
</script>

<style scoped>
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
  font-weight: bold;
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
  font-weight: bold;
  word-break: break-word;
  flex-grow: 1;
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

.modern-input {
  :deep(.q-field__control) {
    border-radius: 6px;
    transition: all 0.3s ease;
  }

  :deep(.q-field__control:hover) {
    border-color: #a0c0e8;
  }

  :deep(.q-field--focused .q-field__control) {
    border-color: #1976d2;
    box-shadow: 0 0 0 1px rgba(25, 118, 210, 0.2);
  }

  :deep(.q-field--error .q-field__control) {
    border-color: #f44336;
    box-shadow: 0 0 0 1px rgba(244, 67, 54, 0.2);
  }

  :deep(.q-field__native) {
    font-size: 0.95rem;
  }
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
}

.add-output-btn {
  background-color: #00703C !important;
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

.confirmation-list {
  margin-left: 20px;
  margin-top: 8px;
}

.confirmation-list li {
  margin-bottom: 4px;
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
</style>
