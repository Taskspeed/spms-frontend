import { useUserStore } from 'src/stores/userStore'
import AuthLayout from 'src/layouts/AuthLayout.vue'
import AdminLayout from 'src/layouts/MainLayout.vue'
import Login from 'src/pages/Auth/LoginPage.vue'

// HR Admin Pages
import HRDashboard from 'src/pages/HR/HRDashboard.vue'
import HRSPMS from 'src/pages/HR/SPMS.vue'
import HROPCR from 'src/pages/HR/OPCR.vue'
import HRIPCR from 'src/pages/HR/IPCR.vue'
import UserPage from 'src/pages/HR/UserPage.vue'
import ProfilePage from 'src/pages/HR/ProfilePage.vue'

// Office Admin Pages
import OfficeDashboard from 'src/pages/Office/OfficeDashboard.vue'
import OfficeEmployee from 'src/pages/Office/EmployeePage.vue'
import OfficeSPMS from 'src/pages/Office/SPMS.vue'
import OfficeAccount from 'src/pages/Office/AccountPage.vue'
import UnitWorkPlan from 'src/pages/Office/UnitWorkPlan.vue'
import MFO from 'src/pages/Office/MFOPage.vue'

// Planning Admin Pages
import PlanningDashboard from 'src/pages/Planning/PlanningDashboard.vue'
import SPMS from 'src/pages/Planning/SPMS.vue'
import PlanningAccount from 'src/pages/Planning/AccountPage.vue'

export const routes = [
  {
    path: '/login',
    component: AuthLayout,
    children: [{ path: '', component: Login }],
  },
  {
    path: '/',
    component: AdminLayout,
    children: [
      // Root redirect
      {
        path: '',
        redirect: () => {
          const userStore = useUserStore()
          userStore.loadUserData()
          const role = userStore.role

          if (!role) {
            return '/login'
          }

          switch (role) {
            case 'hr-admin':
              return '/hr/dashboard'
            case 'office-admin':
              return '/office/dashboard'
            case 'planning-admin':
              return '/planning/dashboard'
            default:
              return '/login'
          }
        },
      },

      // HR Admin Routes
      {
        path: 'hr/dashboard',
        component: HRDashboard,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/spms',
        component: HRSPMS,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/opcr',
        component: HROPCR,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/ipcr',
        component: HRIPCR,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/account/user',
        component: UserPage,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/account/profile',
        component: ProfilePage,
        meta: { role: 'hr-admin' },
      },
      //  {
      //   path: 'hr/library',
      //   component:Library,
      //   meta: { role: 'hr-admin' },
      // },

      // Office Admin Routes
      {
        path: 'office/dashboard',
        component: OfficeDashboard,
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/employee',
        component: OfficeEmployee,
        meta: { role: 'office-admin' },
      },

      {
        path: '/unitworkplan',
        name: 'unitworkplan',
        component:UnitWorkPlan

      },
      {
        path: 'office/library',
        component: MFO,
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/spms',
        component: OfficeSPMS,
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/account',
        component: OfficeAccount,
        meta: { role: 'office-admin' },
      },

      // Planning Admin Routes
      {
        path: 'planning/dashboard',
        component: PlanningDashboard,
        meta: { role: 'planning-admin' },
      },
      {
        path: 'planning/spms',
        component: SPMS,
        meta: { role: 'planning-admin' },
      },
      {
        path: 'planning/account',
        component: PlanningAccount,
        meta: { role: 'planning-admin' },
      },
    ],
  },
]

export function setupRouterGuard(router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    // Ensure user data is loaded properly
    // await userStore.loadUser()
    await userStore.loadUserData() // <-- Change this line

    const isAuthenticated = !!userStore.user?.role_id
    const userRole = userStore.role

    // Redirect to login if not authenticated and not already on login
    if (!isAuthenticated && to.path !== '/login') {
      return next('/login')
    }

    // Prevent logged-in users from accessing login
    if (isAuthenticated && to.path === '/login') {
      switch (userRole) {
        case 'hr-admin':
          return next('/hr/dashboard')
        case 'office-admin':
          return next('/office/dashboard')
        case 'planning-admin':
          return next('/planning/dashboard')
        default:
          return next('/login')
      }
    }

    // Role-based access control
    if (to.meta?.role && to.meta.role !== userRole) {
      return next('/login')
    }

    next()
  })
}
