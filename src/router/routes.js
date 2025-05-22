import { useUserStore } from 'src/stores/userStore'
import AuthLayout from 'src/layouts/AuthLayout.vue'
import AdminLayout from 'src/layouts/MainLayout.vue'
import Login from 'src/pages/Auth/LoginPage.vue'

// HR Admin Pages
import hrDashboard from 'src/pages/hr_Screen/dashboard.vue'
import hrSpms from 'src/pages/hr_Screen/spms.vue'
import opcr from 'src/pages/hr_Screen/opcr.vue'
import ipcr from 'src/pages/hr_Screen/ipcr.vue'
import user from 'src/pages/hr_Screen/user.vue'
import hrProfile from 'src/pages/hr_Screen/profile.vue'

// Office Admin Pages

import officeDashboard from 'src/pages/office_Screen/dashboard.vue'
import employee from 'src/pages/office_Screen/employee.vue'
import officeSpms from 'src/pages/office_Screen/spms.vue'
import officeProfile from 'src/pages/office_Screen/profile.vue'
import unitworkplan from 'src/pages/office_Screen/unit_work_plan.vue'
import library from 'src/pages/office_Screen/library.vue'
import rating from 'src/pages/office_Screen/ratingModule.vue'

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
      // HR Admin Routes
      {
        path: 'hr/dashboard',
        component: hrDashboard,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/spms',
        component: hrSpms,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/opcr',
        component: opcr,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/ipcr',
        component: ipcr,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/account/user',
        component: user,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/account/profile',
        component: hrProfile,
        meta: { role: 'hr-admin' },
      },
      //   path: 'hr/library',
      //   component:Library,
      //   meta: { role: 'hr-admin' },
      // },

      // Office Admin Routes
      // Office Admin Routes
      {
        path: 'office/dashboard',
        component: officeDashboard,
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/employee',
        component: employee,
        meta: { role: 'office-admin' },
      },

      {
        path: '/unitworkplan',
        name: 'unitworkplan',
        component: unitworkplan,
      },
      {
        path: 'office/library',
        component: library,
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/spms',
        component: officeSpms,
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/profile',
        component: officeProfile,
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/rating',
        component: rating,
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
