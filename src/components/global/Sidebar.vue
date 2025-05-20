<template>
  <div>
    <!-- Main Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="230"
      :class="['sidebar', roleColorClass]"
      :breakpoint="600"
      :overlay="$q.screen.lt.md"
    >
      <!-- Logo and Office Name -->
      <div class="sidebar__header">
        <img
          class="sidebar__logo"
          alt="City of Tagum Logo"
          src="https://phshirt.com/wp-content/uploads/2021/11/City-of-Tagum-Logo.png"
        />
        <div class="sidebar__title-container">
          <h3 class="sidebar__title">{{ userStore.officeName }}</h3>
        </div>
      </div>

      <!-- Navigation Menu -->
      <q-list class="sidebar__menu">
        <template v-for="(item, index) in menuItems" :key="index">
          <!-- Menu with Submenu - Fixed alignment -->
          <q-expansion-item
            v-if="item.children"
            expand-separator
            class="sidebar__expansion-item"
            header-class="sidebar__expansion-header"
          >
            <template v-slot:header>
              <q-item-section avatar class="sidebar__avatar-section">
                <q-icon :name="item.icon" class="sidebar__icon" />
              </q-item-section>
              <q-item-section class="sidebar__menu-text">{{ item.label }}</q-item-section>
            </template>
            <q-list class="sidebar__submenu">
              <q-item
                v-for="(subItem, subIndex) in item.children"
                :key="subIndex"
                clickable
                v-ripple
                :to="subItem.route"
                class="sidebar__menu-item"
                active-class="sidebar__menu-item--active"
                exact-active-class="sidebar__menu-item--active"
              >
                <q-item-section avatar>
                  <q-icon :name="subItem.icon" class="sidebar__icon" />
                </q-item-section>
                <q-item-section>{{ subItem.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <!-- Simple Menu Item -->
          <q-item
            v-else
            clickable
            v-ripple
            :to="item.route"
            class="sidebar__menu-item"
            active-class="sidebar__menu-item--active"
            exact-active-class="sidebar__menu-item--active"
          >
            <q-item-section avatar class="sidebar__avatar-section">
              <q-icon :name="item.icon" class="sidebar__icon" />
            </q-item-section>
            <q-item-section class="sidebar__menu-text">{{ item.label }}</q-item-section>
          </q-item>
        </template>
      </q-list>

      <!-- Logout Button -->
      <div class="sidebar__logout-container">
        <q-btn flat class="sidebar__logout-btn" @click="logout" v-ripple>
          <q-icon name="logout" class="sidebar__logout-icon" />
          <span>Logout</span>
        </q-btn>
      </div>
    </q-drawer>

    <!-- Mobile Menu Toggle Button -->
    <q-btn
      v-if="$q.screen.lt.md"
      dense
      round
      icon="menu"
      class="sidebar__mobile-toggle"
      @click="leftDrawerOpen = !leftDrawerOpen"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/userStore'

export default {
  name: 'AppSidebar',
  setup() {
    // Composition API setup
    const router = useRouter()
    const userStore = useUserStore()
    const leftDrawerOpen = ref(true)

    // Load user data on component mount
    onMounted(() => {
      userStore.loadUserData()
    })

    // Role-based styling
    const roleColorClass = computed(() => {
      const role = userStore.user?.role_id
      const classes = {
        1: 'bg-office-admin',
        2: 'bg-planning-admin',
        3: 'bg-hr-admin',
      }
      return classes[role] || 'bg-primary'
    })

    // Dynamic menu items based on user role
    const menuItems = computed(() => {
      const role = userStore.user?.role_id

      const items = {
        // Office Admin
        1: [
          { label: 'Dashboard', icon: 'dashboard', route: '/office/dashboard' },
          { label: 'SPMS', icon: 'fact_check', route: '/office/spms' },
          {
            label: 'Library',
            icon: 'fact_check',
            children: [
              { label: 'Employee', icon: 'people', route: '/office/employee' },
              { label: 'MFO', icon: 'assignment', route: '/office/library' },
            ],
          },
          { label: 'Account', icon: 'person', route: '/office/account' },
        ],
        // Planning Admin
        2: [
          { label: 'Dashboard', icon: 'dashboard', route: '/planning/dashboard' },
          { label: 'SPMS', icon: 'event_note', route: '/planning/spms' },
          { label: 'Account', icon: 'person', route: '/planning/account' },
        ],
        // HR Admin
        3: [
          { label: 'Dashboard', icon: 'dashboard', route: '/hr/dashboard' },
          { label: 'SPMS', icon: 'event_note', route: '/hr/spms' },
          {
            label: 'Account',
            icon: 'person',
            children: [
              { label: 'User', icon: 'group', route: '/hr/account/user' },
              { label: 'Profile', icon: 'person_outline', route: '/hr/account/profile' },
            ],
          },
        ],
      }

      return items[role] || []
    })

    // Logout handler
    const logout = async () => {
      try {
        await userStore.logout(router)
      } catch (error) {
        console.error('Logout failed:', error)
        router.push('/login')
      }
    }

    return {
      leftDrawerOpen,
      menuItems,
      roleColorClass,
      logout,
      userStore,
    }
  },
}
</script>

<style>
/* Base sidebar styles */
.sidebar {
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  max-width: 230px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
}

/* Header section */
.sidebar__header {
  text-align: center;
  padding: 0.5rem 1.5rem;
}

.sidebar__logo {
  width: 70px;
  height: auto;
  margin: 1.25rem 0;
}

.sidebar__title-container {
  text-align: center;
}

.sidebar__title {
  font-size: 14px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  letter-spacing: -0.01em;
  line-height: 1.4;
  margin: 0;
  padding: 0 1rem;
  color: white;
}

/* Menu styles */
.sidebar__menu {
  flex: 1;
  overflow-y: hidden;
  padding: 0.5rem 0;
  padding-bottom: calc(1rem + 64px);
}

/* Fixed expansion item styling for vertical alignment */
.sidebar__expansion-item {
  margin: 0.25rem 1rem;
  border-radius: 0.5rem;
  opacity: 0.85;
  transition: all 0.2s ease-in-out;
}

.sidebar__expansion-header {
  min-height: 40px; /* Match the height of regular menu items */
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  border-radius: 0.5rem;
  color: white !important;
}

.sidebar__expansion-header:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  opacity: 1;
  transform: translateX(4px);
}

.sidebar__menu-item {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: white !important;
  transition: all 0.2s ease-in-out;
  font-size: 0.9375rem;
  font-family: 'Poppins', sans-serif;
  margin: 0.25rem 1rem;
  opacity: 0.85;
  white-space: nowrap;
  width: calc(100% - 2rem);
  display: flex;
  align-items: center;
  min-height: 40px; /* Ensure consistent height */
}

.sidebar__menu-item:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  opacity: 1;
  transform: translateX(4px);
}

.sidebar__menu-item--active {
  background: rgba(255, 255, 255, 0.2) !important;
  opacity: 1;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar__icon {
  color: white;
  font-size: 1.25rem;
  opacity: 0.9;
  min-width: 24px;
}

.sidebar__avatar-section {
  min-width: 40px !important;
  padding-right: 0 !important;
}

.sidebar__menu-text {
  color: white;
}

.sidebar__submenu {
  overflow: hidden;
  padding: 0;
}

/* Logout section */
.sidebar__logout-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem 1.25rem;
  background: inherit;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.sidebar__logout-btn {
  color: white !important;
  width: 100%;
  text-transform: none;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  padding: 0.875rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar__logout-btn:hover {
  opacity: 1;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.15);
}

.sidebar__logout-icon {
  font-size: 1.25rem;
}

/* Mobile menu button */
.sidebar__mobile-toggle {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  background: var(--q-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 999;
  padding: 0.75rem;
  transition: all 0.2s ease;
}

.sidebar__mobile-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* Role-based background colors */
.bg-office-admin {
  background-color: #205540;
}

.bg-planning-admin {
  background-color: #f7899c;
}

.bg-hr-admin {
  background-color: #722b2b;
}

/* Responsive styles */
@media (max-width: 600px) {
  .sidebar {
    padding-top: 2rem;
  }

  .sidebar__menu-item {
    margin: 0.25rem 0.75rem;
  }

  .sidebar__expansion-item {
    margin: 0.25rem 0.75rem;
  }

  .sidebar__logout-container {
    padding: 0.75rem;
    border-top-width: 2px;
  }

  .sidebar__menu {
    padding-bottom: calc(1rem + 56px);
  }
}
</style>
