import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_APP_API || 'http://10.10.31.129:5002'

/**
 * 修复图片 URL
 * 如果图片是 localhost 或相对路径，将其转换为基于 BASE_URL 的绝对路径
 * 同时兼容微信本地临时路径 (wxfile://, http://tmp/)
 */
export function fixImageUrl(url: string): string {
  if (!url) return 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
  
  // 微信临时路径直接返回，用于本地预览
  if (url.startsWith('http://tmp/') || url.startsWith('wxfile://')) {
    return url
  }

  if (url.startsWith('http')) {
    // 替换 localhost 或 127.0.0.1 为实际的 BASE_URL 域名
    return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5002/g, BASE_URL.replace(/\/$/, ''))
  }
  if (url.startsWith('/')) {
    return `${BASE_URL.replace(/\/$/, '')}${url}`
  }
  // 如果是纯文件名（如 xxx.png），补全 /uploads/ 前缀
  if (url && !url.includes('/') && !url.includes(':')) {
    return `${BASE_URL.replace(/\/$/, '')}/uploads/${url}`
  }
  return url
}

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
