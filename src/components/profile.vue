<template>
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
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { useUserStore } from 'src/stores/userStore'

export default {
  name: 'UserAccountVertical',
  setup() {
    const $q = useQuasar()
    const userStore = useUserStore()

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
      username: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })

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
        username: userStore.user?.name || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
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
      } finally {
        isSaving.value = false
      }
    }

    onMounted(() => {
      userStore.loadUserData()
    })

    return {
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
      saveChanges,
    }
  },
}
</script>

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
  }
}
</style>
