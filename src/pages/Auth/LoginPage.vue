<template>
  <div class="login-page">
    <div class="overlay">
      <q-card class="login-card">
        <q-img
          src="https://phshirt.com/wp-content/uploads/2021/11/City-of-Tagum-Logo.png"
          class="logo"
          spinner-color="white"
          spinner-size="40px"
        />
        <h2 class="title">Performance Management System</h2>
        <p class="subtitle">Login</p>
        <q-form class="login-form" @submit.prevent="login">
          <!-- Username Input -->
          <div class="input-container">
            <q-input
              v-model="username"
              label="Username"
              filled
              class="input"
              color="green-8"
              @blur="validateUsername"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>
            <q-slide-transition>
              <div v-if="usernameError" class="validation">
                {{ usernameError }}
              </div>
            </q-slide-transition>
          </div>

          <!-- Password Input -->
          <div class="input-container">
            <q-input
              v-model="password"
              label="Password"
              filled
              :type="isPwd ? 'password' : 'text'"
              class="input"
              color="green-8"
              @blur="validatePassword"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
            <q-slide-transition>
              <div v-if="passwordError" class="validation">
                {{ passwordError }}
              </div>
            </q-slide-transition>
          </div>

          <!-- Remember Me and Forgot Password -->
          <div class="row items-center justify-between q-mb-md">
            <q-checkbox
              v-model="rememberMe"
              label="Remember me"
              color="green-8"
              class="text-white custom-checkbox"
            />
          </div>

          <!-- Login Button -->
          <q-btn
            type="submit"
            label="Sign in"
            class="login-button"
            :loading="isLoading"
            :disable="isLoading"
          />
        </q-form>
      </q-card>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

import { useRouter } from 'vue-router'
import { api } from '../../boot/axios'
import {

  QImg,
  QIcon,
  QInput,
  QSlideTransition,
  QCheckbox,
  QBtn,
  QForm,
  QCard,
} from 'quasar'
import { useUserStore } from '../../stores/userStore'

export default {
  name: 'LoginPage',
  components: {
    QImg,
    QIcon,
    QInput,
    QSlideTransition,
    QCheckbox,
    QBtn,
    QForm,
    QCard,
  },
  setup() {
    const router = useRouter()
    const imageLoaded = ref(false)
    const username = ref('')
    const password = ref('')
    const isPwd = ref(true)
    const usernameError = ref('')
    const passwordError = ref('')
    const rememberMe = ref(false)
    const isLoading = ref(false)

    const onImageLoad = () => {
      imageLoaded.value = true
    }


    const login = async () => {
      usernameError.value = ''
      passwordError.value = ''
      isLoading.value = true

  try {
    const response = await api.post('/login', {
      name: username.value,
      password: password.value,
    })

    const { token, user } = response.data

    // Store token and user data
    localStorage.setItem('token', token)
    const userStore = useUserStore()
    userStore.setUser(user)

    // Redirect based on role
    const role = userStore.role
    if (role === 'hr-admin') {
      router.push('/hr/dashboard')
    } else if (role === 'office-admin') {
      router.push('/office/dashboard')
    } else if (role === 'planning-admin') {
      router.push('/planning/dashboard')
    } else {
      router.push('/login')
    }

  } catch (error) {
    const errors = error.response?.data?.errors || {}

    if (errors.name) {
      usernameError.value = errors.name[0]
    }

    if (errors.password) {
      passwordError.value = errors.password[0]
    }

  } finally {
    isLoading.value = false
  }
}


    return {
      username,
      password,
      isPwd,
      usernameError,
      passwordError,
      rememberMe,
      isLoading,
      imageLoaded,
      login,
      onImageLoad,
    }
  },
}
</script>

<style src="../../assets/office/login.css" scoped></style>
