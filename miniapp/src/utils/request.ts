import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_APP_API || 'https://your-api.com/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const token = Taro.getStorageSync('token') || ''
  const { url, method = 'GET', data, header = {} } = options

  const res = await Taro.request({
    url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...header,
    },
  })

  if (res.statusCode >= 200 && res.statusCode < 300) {
    return res.data as T
  }

  const errMsg = (res.data as any)?.message || `请求失败 ${res.statusCode}`
  Taro.showToast({ title: errMsg, icon: 'none' })
  throw new Error(errMsg)
}

export const api = {
  get: <T>(url: string, data?: any) => request<T>({ url, method: 'GET', data }),
  post: <T>(url: string, data?: any) => request<T>({ url, method: 'POST', data }),
  put: <T>(url: string, data?: any) => request<T>({ url, method: 'PUT', data }),
  delete: <T>(url: string, data?: any) => request<T>({ url, method: 'DELETE', data }),
}
