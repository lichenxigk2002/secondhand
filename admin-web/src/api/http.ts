import axios from 'axios'

export interface PageResult<T> {
  list: T[]
  total?: number
}

export interface AdminProfile {
  id: number
  username: string
  realName: string
  role: string
}

export interface DashboardOverview {
  userCount: number
  goodsCount: number
  pendingGoodsCount: number
  reportPendingCount: number
  orderCount: number
  completedOrderCount: number
}

export interface DashboardTrendPoint {
  date: string
  users: number
  goods: number
  orders: number
  reports: number
}

export interface AdminUser {
  id: number
  nickName: string
  phone: string
  campus: string
  creditScore: number
  status: number
  goodsCount?: number
  createTime: string
}

export interface AdminGoods {
  id: number
  title: string
  price: number
  category: string
  sellerName: string
  status: number
  auditStatus: number
  viewCount: number
  createTime: string
}

export interface AdminReport {
  id: number
  reporterName: string
  targetType: string
  targetId: number
  reason: string
  content: string
  status: number
  handleRemark: string
  createTime: string
}

export interface AdminCategory {
  id: number
  name: string
  parentId: number
  sortOrder: number
  status: number
  createTime: string
}

export interface AdminOrder {
  id: number
  orderNo: string
  buyerName: string
  sellerName: string
  goodsTitle: string
  amount: number
  status: number
  createTime: string
  completeTime: string
}

export interface AdminLog {
  id: number
  adminName: string
  action: string
  targetType: string
  targetId: number
  detail: string
  ip: string
  createTime: string
}

export interface AdminEvaluation {
  id: number
  orderId: number
  fromUserName: string
  toUserName: string
  role: string
  star: number
  comment: string
  createTime: string
}

export interface AdminAccount {
  id: number
  username: string
  realName: string
  role: string
  status: number
  lastLoginTime: string
  createTime: string
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5002/api/admin',
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const adminApi = {
  login: (payload: { username: string; password: string }) =>
    http.post<{ token: string; admin: AdminProfile }>('/login', payload),
  logout: () => http.post<{ ok: boolean }>('/logout'),
  profile: () => http.get<AdminProfile>('/profile'),
  dashboard: () => http.get<DashboardOverview>('/dashboard/overview'),
  dashboardTrend: (days = 7) => http.get<{ list: DashboardTrendPoint[] }>('/dashboard/trend', { params: { days } }),
  users: (params?: Record<string, unknown>) => http.get<PageResult<AdminUser>>('/users', { params }),
  userDetail: (id: number) => http.get(`/users/${id}`),
  updateUserStatus: (id: number, status: number) => http.put(`/users/${id}/status`, { status }),
  goods: (params?: Record<string, unknown>) => http.get<PageResult<AdminGoods>>('/goods', { params }),
  goodsDetail: (id: number) => http.get(`/goods/${id}`),
  auditGoods: (id: number, auditStatus: number) => http.put(`/goods/${id}/audit`, { auditStatus }),
  updateGoodsStatus: (id: number, status: number) => http.put(`/goods/${id}/status`, { status }),
  reports: (params?: Record<string, unknown>) => http.get<PageResult<AdminReport>>('/reports', { params }),
  reportDetail: (id: number) => http.get(`/reports/${id}`),
  handleReport: (id: number, status: number, handleRemark: string) =>
    http.put(`/reports/${id}/handle`, { status, handleRemark }),
  categories: () => http.get<PageResult<AdminCategory>>('/categories'),
  createCategory: (payload: Partial<AdminCategory>) => http.post('/categories', payload),
  updateCategory: (id: number, payload: Partial<AdminCategory>) => http.put(`/categories/${id}`, payload),
  orders: (params?: Record<string, unknown>) => http.get<PageResult<AdminOrder>>('/orders', { params }),
  orderDetail: (id: number) => http.get(`/orders/${id}`),
  evaluations: (params?: Record<string, unknown>) => http.get<PageResult<AdminEvaluation>>('/evaluations', { params }),
  deleteEvaluation: (id: number) => http.delete(`/evaluations/${id}`),
  accounts: () => http.get<PageResult<AdminAccount>>('/accounts'),
  createAccount: (payload: Partial<AdminAccount> & { password?: string }) => http.post('/accounts', payload),
  updateAccount: (id: number, payload: Partial<AdminAccount> & { password?: string }) => http.put(`/accounts/${id}`, payload),
  logs: (params?: Record<string, unknown>) => http.get<PageResult<AdminLog>>('/logs', { params }),
}
