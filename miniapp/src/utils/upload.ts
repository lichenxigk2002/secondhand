import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_APP_API || 'http://10.10.31.129:5002'

/**
 * 判断是否是本地临时文件路径
 */
export function isTempPath(path: string): boolean {
  if (!path) return false
  return path.startsWith('http://tmp/') || path.startsWith('wxfile://') || !path.startsWith('http')
}

export async function uploadImage(filePath: string): Promise<string> {
  const token = Taro.getStorageSync('token') || ''
  return new Promise((resolve, reject) => {
    Taro.uploadFile({
      url: `${BASE_URL}/api/upload/image`,
      filePath,
      name: 'file',
      header: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(res.data)
            resolve(data.url || '')
          } catch {
            reject(new Error('解析失败'))
          }
        } else {
          reject(new Error('上传失败'))
        }
      },
      fail: reject,
    })
  })
}

export async function uploadImages(filePaths: string[]): Promise<string[]> {
  const urls: string[] = []
  for (const path of filePaths) {
    const url = await uploadImage(path)
    urls.push(url)
  }
  return urls
}
