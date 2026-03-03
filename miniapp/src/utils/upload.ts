import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_APP_API || 'http://localhost:5000'

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
