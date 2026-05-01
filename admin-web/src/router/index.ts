import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import UsersView from '../views/UsersView.vue'
import GoodsView from '../views/GoodsView.vue'
import ReportsView from '../views/ReportsView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import OrdersView from '../views/OrdersView.vue'
import LogsView from '../views/LogsView.vue'
import EvaluationsView from '../views/EvaluationsView.vue'
import AccountsView from '../views/AccountsView.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/',
    component: AdminLayout,
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: DashboardView },
      { path: 'users', name: 'users', component: UsersView },
      { path: 'goods', name: 'goods', component: GoodsView },
      { path: 'reports', name: 'reports', component: ReportsView },
      { path: 'categories', name: 'categories', component: CategoriesView },
      { path: 'orders', name: 'orders', component: OrdersView },
      { path: 'evaluations', name: 'evaluations', component: EvaluationsView },
      { path: 'accounts', name: 'accounts', component: AccountsView },
      { path: 'logs', name: 'logs', component: LogsView },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    return '/login'
  }
  if (to.path === '/login' && token) {
    return '/dashboard'
  }
  return true
})

export default router
