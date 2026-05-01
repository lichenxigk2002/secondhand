import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_APP_API || 'http://10.10.31.129:5002'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  /** 为 true 时请求失败不弹 toast（用于静默重试） */
  silent?: boolean
}

export interface ApiSilentOpts {
  silent?: boolean
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const token = Taro.getStorageSync('token') || ''
  const { url, method = 'GET', data, header = {}, silent } = options

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
  if (!silent) {
    Taro.showToast({ title: errMsg, icon: 'none' })
  }
  throw new Error(errMsg)
}

function apiGet<T>(url: string, data?: any, opts?: ApiSilentOpts) {
  return request<T>({ url, method: 'GET', data, ...opts })
}
function apiPost<T>(url: string, data?: any, opts?: ApiSilentOpts) {
  return request<T>({ url, method: 'POST', data, ...opts })
}
function apiPut<T>(url: string, data?: any, opts?: ApiSilentOpts) {
  return request<T>({ url, method: 'PUT', data, ...opts })
}
function apiDelete<T>(url: string, data?: any, opts?: ApiSilentOpts) {
  return request<T>({ url, method: 'DELETE', data, ...opts })
}

export const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
}
