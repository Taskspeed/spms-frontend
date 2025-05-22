<template>
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
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/userStore'
import { date } from 'quasar'

export default {
  name: 'UserAccount',

  setup() {
    const $q = useQuasar()
    const userStore = useUserStore()

    // State
    const isModalOpen = ref(false)
    const isSaving = ref(false)
    const lastUpdated = ref(new Date())
    const showOldPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)

    const formData = ref({
      username: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })

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
        username: userStore.user?.name || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      }

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
      } finally {
        isSaving.value = false
      }
    }

    onMounted(() => {
      userStore.loadUserData()
    })

    return {
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
      saveChanges,
    }
  },
}
</script>

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
  }
}
</style>
