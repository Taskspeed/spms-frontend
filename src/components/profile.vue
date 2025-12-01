<template>
<<<<<<< HEAD
  <div class="account">
    <!-- Header -->
    <header class="account__header">
      <div class="account__title-group">
        <h1 class="account__title">Account</h1>
        <p class="account__subtitle">Profile & credentials</p>
      </div>

      <div class="account__actions">
        <q-btn
          flat
          dense
          color="primary"
          icon="edit"
          label="Edit"
          @click="openEditModal"
          aria-label="Edit account"
        />
      </div>
    </header>

    <!-- Content Grid (now vertical) -->
    <main class="account__grid">
      <!-- Profile Card -->
      <q-card flat bordered class="card card--profile">
        <q-card-section class="card__body">
          <div class="card__col">
            <div class="card__info">
              <dt class="label">Employee</dt>
              <q-input v-model="userName" outlined readonly size="xs"></q-input>
            </div>

            <div class="card__info">
              <dt class="label">Position</dt>
              <q-input v-model="userDesignation" outlined readonly size="xs"></q-input>
            </div>

            <div class="card__info">
              <dt class="label">Office</dt>
              <q-input v-model="userOffice" outlined readonly size="xs"></q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Credentials Card -->
      <q-card flat bordered class="card card--credentials">
        <q-card-section class="card__body">
          <div class="card__col">
            <div class="card__info">
              <dt class="label">Username</dt>
              <q-input v-model="userName" outlined readonly size="xs"></q-input>
            </div>

            <div class="card__info">
              <dt class="label">Password</dt>
              <q-input label="••••••••" outlined readonly size="xs"></q-input>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="card__footer">
          <div class="card__footer-left">
            <span class="muted">Last updated</span>
          </div>
          <div class="card__footer-right">
            <span class="muted value">{{ formattedLastUpdated }}</span>
          </div>
        </q-card-section>
      </q-card>
    </main>

    <!-- Edit Modal (simple, focused) -->
    <q-dialog v-model="isModalOpen" persistent>
      <q-card class="modal">
        <q-card-section class="modal__header">
          <div>
            <h3 class="modal__title">Edit Credentials</h3>
            <p class="modal__subtitle muted">Update your password</p>
          </div>
          <q-btn flat dense icon="close" @click="closeEditModal" aria-label="Close" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit.prevent="saveChanges" class="modal__form" ref="formRef">
            <q-input v-model="form.username" label="Username" dense readonly hide-bottom-space />

            <q-input
              v-model="form.oldPassword"
              :type="showOld ? 'text' : 'password'"
              label="Current password"
              dense
              :rules="[(val) => !!val || 'Required']"
              class="q-mt-sm"
            >
              <template v-slot:append>
                <q-icon
                  :name="showOld ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showOld = !showOld"
                />
              </template>
            </q-input>

            <q-input
              v-model="form.newPassword"
              :type="showNew ? 'text' : 'password'"
              label="New password"
              dense
              class="q-mt-sm"
              :rules="[
                (val) => !val || val.length >= 6 || 'Min 6 chars',
                (val) => !val || val !== form.oldPassword || 'Must differ from current',
              ]"
            >
              <template v-slot:append>
                <q-icon
                  :name="showNew ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showNew = !showNew"
                />
              </template>
            </q-input>

            <q-input
              v-model="form.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              label="Confirm new password"
              dense
              class="q-mt-sm"
              :rules="[
                (val) => !form.newPassword || val === form.newPassword || 'Passwords do not match',
              ]"
            >
              <template v-slot:append>
                <q-icon
                  :name="showConfirm ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirm = !showConfirm"
                />
              </template>
            </q-input>

            <div class="modal__actions row justify-end q-mt-md">
              <q-btn flat label="Cancel" color="grey" @click="closeEditModal" />
              <q-btn
                class="q-ml-sm"
                color="primary"
                label="Save"
                :loading="isSaving"
                :disable="!isFormValid"
                @click="saveChanges"
              />
            </div>
          </q-form>
        </q-card-section>
=======
  <div class="account-page">
    <!-- Employee Details Card -->
    <q-card class="account-card">
      <q-card-section>
        <div class="account-card__header">
          <h2 class="account-card__title">Employee Details</h2>
          <q-icon name="person" class="account-card__icon" />
        </div>

        <div class="account-details">
          <div class="account-details__column">
            <div class="account-detail">
              <label class="account-detail__label">Employee Name</label>
              <p class="account-detail__value">{{ userStore.user?.name || 'N/A' }}</p>
            </div>
            <div class="account-detail">
              <label class="account-detail__label">Position</label>
              <p class="account-detail__value">{{ userStore.user?.designation || 'N/A' }}</p>
            </div>
          </div>
          <div class="account-details__column">
            <div class="account-detail">
              <label class="account-detail__label">Office</label>
              <p class="account-detail__value">{{ userStore.officeName }}</p>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Account Details Card -->
    <q-card class="account-card">
      <q-card-section>
        <div class="account-card__header">
          <h2 class="account-card__title">Account Details</h2>
          <q-btn
            class="account-card__action"
            icon="edit"
            label="Edit"
            @click="openEditModal"
            outline
            color="primary"
          />
        </div>

        <div class="account-details">
          <div class="account-details__column">
            <div class="account-detail">
              <label class="account-detail__label">Username</label>
              <p class="account-detail__value">{{ userStore.user?.name }}</p>
            </div>
          </div>
          <div class="account-details__column">
            <div class="account-detail">
              <label class="account-detail__label">Password</label>
              <p class="account-detail__value">••••••••</p>
            </div>
          </div>
        </div>

        <div class="account-card__footer">
          <q-icon name="schedule" size="sm" />
          <span>Last updated: {{ formatDate(lastUpdated) }}</span>
        </div>
      </q-card-section>
    </q-card>

    <!-- Edit Modal -->
    <q-dialog v-model="isModalOpen">
      <q-card class="account-modal">
        <q-card-section class="account-modal__header">
          <h3 class="account-modal__title">Edit Account</h3>
        </q-card-section>

        <q-card-section class="account-modal__body">
          <q-input
            v-model="formData.username"
            label="Username"
            outlined
            dense
            class="account-modal__input"
            readonly
          />

          <q-input
            v-model="formData.oldPassword"
            label="Old Password"
            :type="showOldPassword ? 'text' : 'password'"
            outlined
            dense
            class="account-modal__input"
            :rules="[(val) => !!val || 'Old password is required']"
          >
            <template v-slot:append>
              <q-icon
                :name="showOldPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showOldPassword = !showOldPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="formData.newPassword"
            label="New Password"
            :type="showNewPassword ? 'text' : 'password'"
            outlined
            dense
            class="account-modal__input"
            :rules="[
              (val) => !val || val.length >= 6 || 'Password must be at least 6 characters',
              (val) => !val || val !== formData.oldPassword || 'New password must be different',
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="showNewPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showNewPassword = !showNewPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="formData.confirmPassword"
            label="Confirm New Password"
            :type="showConfirmPassword ? 'text' : 'password'"
            outlined
            dense
            class="account-modal__input"
            :rules="[
              (val) =>
                !formData.newPassword || val === formData.newPassword || 'Passwords do not match',
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="account-modal__footer">
          <q-btn flat label="Cancel" v-close-popup color="grey-7" />
          <q-btn
            color="primary"
            label="Save Changes"
            @click="saveChanges"
            :loading="isSaving"
            :disable="!isFormValid"
          />
        </q-card-actions>
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
<<<<<<< HEAD
import { useQuasar, date } from 'quasar'
import { useUserStore } from 'src/stores/userStore'

export default {
  name: 'UserAccountVertical',
=======
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/userStore'
import { date } from 'quasar'

export default {
  name: 'UserAccount',

>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
  setup() {
    const $q = useQuasar()
    const userStore = useUserStore()

<<<<<<< HEAD
    // UI state
    const isModalOpen = ref(false)
    const isSaving = ref(false)
    const showOld = ref(false)
    const showNew = ref(false)
    const showConfirm = ref(false)

    // Last updated state (keeps local update time)
    const lastUpdated = ref(new Date())

    // Form model for modal
    const form = ref({
=======
    // State
    const isModalOpen = ref(false)
    const isSaving = ref(false)
    const lastUpdated = ref(new Date())
    const showOldPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)

    const formData = ref({
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
      username: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })

<<<<<<< HEAD
    const formRef = ref(null)

    // Derived/computed for display
    const userName = computed(() => userStore.user?.name || '—')
    const userDesignation = computed(() => userStore.user?.designation || '—')
    const userOffice = computed(() => userStore.officeName || '—')
    const formattedLastUpdated = computed(() => date.formatDate(lastUpdated.value, 'MMMM D, YYYY'))

    // Simple validation used by Save button
    const isFormValid = computed(() => {
      if (!form.value.oldPassword) return false
      if (!form.value.newPassword) return true // allow no-change
      return (
        form.value.newPassword.length >= 6 &&
        form.value.newPassword !== form.value.oldPassword &&
        form.value.newPassword === form.value.confirmPassword
      )
    })

    // Actions
    const openEditModal = () => {
      form.value = {
=======
    // Computed
    const isFormValid = computed(() => {
      return (
        formData.value.oldPassword &&
        (!formData.value.newPassword ||
          (formData.value.newPassword === formData.value.confirmPassword &&
            formData.value.newPassword !== formData.value.oldPassword))
      )
    })

    // Methods
    const formatDate = (dateValue) => {
      return date.formatDate(dateValue, 'MMMM D, YYYY [at] h:mm A')
    }

    const openEditModal = () => {
      formData.value = {
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
        username: userStore.user?.name || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
<<<<<<< HEAD
      showOld.value = showNew.value = showConfirm.value = false
      isModalOpen.value = true
    }

    const closeEditModal = () => {
      isModalOpen.value = false
    }

    const saveChanges = async () => {
      if (!isFormValid.value) {
        $q.notify({ type: 'negative', message: 'Please resolve validation errors.' })
        return
      }

      isSaving.value = true
      try {
        const payload = {
          oldPassword: form.value.oldPassword,
          ...(form.value.newPassword ? { newPassword: form.value.newPassword } : {}),
        }
        await userStore.updateUserCredentials(payload)
        lastUpdated.value = new Date()
        $q.notify({ type: 'positive', message: 'Account updated' })
        isModalOpen.value = false
      } catch (err) {
        $q.notify({ type: 'negative', message: err?.message || 'Update failed' })
=======

      // Reset visibility toggles
      showOldPassword.value = false
      showNewPassword.value = false
      showConfirmPassword.value = false

      isModalOpen.value = true
    }

    const saveChanges = async () => {
      isSaving.value = true
      try {
        const updateData = {
          oldPassword: formData.value.oldPassword,
          ...(formData.value.newPassword && { newPassword: formData.value.newPassword }),
        }

        await userStore.updateUserCredentials(updateData)
        lastUpdated.value = new Date()

        $q.notify({
          type: 'positive',
          message: 'Password updated successfully!',
          position: 'top',
          timeout: 2000,
        })

        isModalOpen.value = false
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message || 'Failed to update password!',
          position: 'top',
          timeout: 2000,
        })
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
      } finally {
        isSaving.value = false
      }
    }

    onMounted(() => {
      userStore.loadUserData()
    })

    return {
<<<<<<< HEAD
      userStore,
      isModalOpen,
      isSaving,
      showOld,
      showNew,
      showConfirm,
      form,
      formRef,
      userName,
      userDesignation,
      userOffice,
      formattedLastUpdated,
      isFormValid,
      openEditModal,
      closeEditModal,
=======
      isModalOpen,
      isSaving,
      userStore,
      formData,
      lastUpdated,
      showOldPassword,
      showNewPassword,
      showConfirmPassword,
      isFormValid,
      formatDate,
      openEditModal,
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
      saveChanges,
    }
  },
}
</script>

<<<<<<< HEAD
<style scoped>
/* Layout tokens */
:root {
  --gap: 12px;
  --card-radius: 10px;
  --muted: #7a7a7a;
}

/* Container */
.account {
  max-width: 80vw;
  margin: 28px auto;
  padding: 16px;
  color: var(--q-dark);
}

/* Header */
.account__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
  margin-bottom: 16px;
}

.account__title-group {
  line-height: 1;
}
.account__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}
.account__subtitle {
  margin: 2px 0 0;
  color: var(--muted);
  font-size: 0.85rem;
}

.account__actions {
  display: flex;
  align-items: center;
}

/* Grid - vertical stacking */
.account__grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Card base */
.card {
  border-radius: var(--card-radius);
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: var(--q-white);
}

.card__body {
  padding: 12px 14px;
}
.card__footer {
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Column layout inside card (vertical) */
.card__col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Info block */
.card__info {
  width: 100%;
  display: block;
}
.label {
  display: block;
  font-size: 0.75rem;
  color: var(--muted);
  margin: 0 0 6px;
}
.value {
  display: block;
  font-size: 0.98rem;
  margin: 0;
  color: var(--q-dark);
  padding: 10px 12px;
  background: var(--q-light);
  border-radius: 8px;
}
.meta {
  font-size: 0.85rem;
  color: #6f6f74;
  margin-top: 6px;
}

/* muted style */
.muted {
  color: var(--muted);
  font-size: 0.85rem;
}

/* Modal */
.modal {
  width: 100%;
  max-width: 460px;
  border-radius: 12px;
  overflow: hidden;
}
.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
}
.modal__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
.modal__subtitle {
  margin: 2px 0 0;
  color: var(--muted);
  font-size: 0.85rem;
}
.modal__form {
  padding: 12px 14px;
}
.modal__actions {
  padding: 8px 0 0;
  display: flex;
  gap: 8px;
}

/* Responsive */
@media (max-width: 520px) {
  .account {
    padding: 12px;
  }
  .card__col {
    gap: 10px;
  }
  .account__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
=======
<style lang="scss" scoped>
.account-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
}

.account-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  border: none;
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--q-primary);
  }

  &__icon {
    font-size: 1.5rem;
    color: var(--q-secondary);
  }

  &__action {
    font-weight: 500;
    padding: 0.5rem 1rem;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--q-grey);
    margin-top: 1rem;
  }
}

.account-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;

  &__column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

.account-detail {
  &__label {
    display: block;
    font-size: 0.875rem;
    color: var(--q-grey);
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  &__value {
    font-size: 1rem;
    color: var(--q-dark);
    margin: 0;
    padding: 0.75rem;
    background: var(--q-light);
    border-radius: 8px;
    word-break: break-word;
  }
}

.account-modal {
  width: 100%;
  max-width: 450px;
  border-radius: 12px;

  &__header {
    border-bottom: 1px solid var(--q-separator);
    padding: 1rem 1.5rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--q-primary);
  }

  &__body {
    padding: 1.5rem;
  }

  &__input {
    margin-bottom: 1rem;
  }

  &__footer {
    border-top: 1px solid var(--q-separator);
    padding: 1rem 1.5rem;
>>>>>>> ac12b6dfdb8cce696abd824c5586a552f008fd1f
  }
}
</style>
