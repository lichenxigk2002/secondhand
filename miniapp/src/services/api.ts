import { api } from '@/utils/request'

export interface User {
  id: number
  nickName: string
  avatar: string
  phone?: string
  campus?: string
  creditScore?: number
}

export interface Goods {
  id: number
  title: string
  description?: string
  price: number
  viewCount?: number
  images: string[]
  category?: string
  lat: number
  lng: number
  distance?: number
  userId: number
  user?: User
  status: number
  createTime: string
}

export interface GoodsListParams {
  lat?: number
  lng?: number
  radius?: number
  category?: string
  keyword?: string
  campus?: string
  page?: number
  pageSize?: number
}

export interface UserStats {
  myGoodsCount: number
  favoriteCount: number
  browseHistoryCount: number
}

export const userApi = {
  login: (code: string) => api.post<{ token: string; user: User }>('/api/user/login', { code }),
  getProfile: (opts?: { silent?: boolean }) => api.get<User>('/api/user/profile', undefined, opts),
  getStats: (opts?: { silent?: boolean }) => api.get<UserStats>('/api/user/stats', undefined, opts),
  updateProfile: (data: Partial<User>) => api.put<User>('/api/user/profile', data),
}

export interface Conversation {
  id: number
  otherUser: User | null
  goodsId: number
  lastMessage: string
  lastMessageAt: string
  unread: number
}

export interface ChatMessage {
  id: number
  fromUserId: number
  toUserId: number
  content: string
  msgType: string
  isFromMe: boolean
  createTime: string
}

export interface OrderItem {
  id: number
  orderNo: string
  buyerId: number
  sellerId: number
  goodsId: number
  amount: number
  status: number
  goods?: Goods
  buyer?: User
  seller?: User
  isBuyer: boolean
  toUserId?: number
  canEvaluate?: boolean
  createTime: string
  completeTime?: string
}

export const orderApi = {
  mine: (params?: { role?: string; status?: number }, opts?: { silent?: boolean }) =>
    api.get<{ list: OrderItem[] }>('/api/order/mine', params, opts),
  create: (goodsId: number) =>
    api.post<{ order: OrderItem }>('/api/order/create', { goodsId }),
  complete: (orderId: number) =>
    api.put<{ order: OrderItem }>(`/api/order/${orderId}/complete`),
}

export const evaluationApi = {
  create: (orderId: number, toUserId: number, star: number, comment?: string) =>
    api.post('/api/evaluation', { orderId, toUserId, star, comment }),
  listByUser: (userId: number, page = 1) =>
    api.get<{ list: any[]; total: number }>(`/api/evaluation/user/${userId}`, { page }),
}

export const messageApi = {
  getUnreadCount: (opts?: { silent?: boolean }) =>
    api.get<{ count: number }>('/api/message/unread-count', undefined, opts),
  listConversations: () =>
    api.get<{ list: Conversation[] }>('/api/message/conversations'),
  getOrCreateConversation: (targetId: number, goodsId?: number) =>
    api.post<{ conversation: Conversation }>('/api/message/conversation', {
      targetId,
      goodsId: goodsId || 0,
    }),
  listMessages: (conversationId: number, page = 1) =>
    api.get<{ list: ChatMessage[]; total: number }>(
      `/api/message/conversations/${conversationId}/messages`,
      { page, pageSize: 50 }
    ),
  sendMessage: (conversationId: number, content: string) =>
    api.post<ChatMessage>(
      `/api/message/conversations/${conversationId}/messages`,
      { content }
    ),
}

export const reportApi = {
  create: (targetType: 'goods' | 'user' | 'evaluation', targetId: number, reason: string, content?: string) =>
    api.post('/api/report', { targetType, targetId, reason, content }),
}

export const browseApi = {
  record: (goodsId: number) =>
    api.post('/api/browse/record', { goodsId }),
  list: () => api.get<{ list: Goods[] }>('/api/browse'),
}

export const favoriteApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    api.get<{ list: Goods[]; total: number }>('/api/favorite', params),
  check: (goodsId: number) =>
    api.get<{ favorited: boolean }>(`/api/favorite/check/${goodsId}`),
  toggle: (goodsId: number) =>
    api.post<{ favorited: boolean }>(`/api/favorite/toggle/${goodsId}`),
}

export interface GoodsCommentItem {
  id: number
  goodsId: number
  userId: number
  content: string
  createTime: string
  user?: User
}

export const goodsCommentApi = {
  list: (goodsId: number, page = 1) =>
    api.get<{ list: GoodsCommentItem[]; total: number }>(`/api/goods/${goodsId}/comments`, { page, pageSize: 20 }),
  create: (goodsId: number, content: string) =>
    api.post<GoodsCommentItem>(`/api/goods/${goodsId}/comments`, { content }),
}

export const goodsApi = {
  list: (params?: GoodsListParams, opts?: { silent?: boolean }) =>
    api.get<{ list: Goods[]; total: number }>('/api/goods', params, opts),
  nearby: (lat: number, lng: number, radius = 5) =>
    api.get<{ list: Goods[] }>('/api/goods/nearby', { lat, lng, radius }),
  mine: (params?: { page?: number; pageSize?: number; status?: number }) =>
    api.get<{ list: Goods[]; total: number }>('/api/goods/mine', params),
  get: (id: number) => api.get<Goods>(`/api/goods/${id}`),
  create: (data: Partial<Goods>) => api.post<Goods>('/api/goods', data),
  update: (id: number, data: Partial<Goods>) => api.put<Goods>(`/api/goods/${id}`, data),
  setStatus: (id: number, status: number) =>
    api.put<Goods>(`/api/goods/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/api/goods/${id}`),
}
