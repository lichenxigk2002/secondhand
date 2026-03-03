import { useState, useEffect } from 'react'
import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { goodsApi } from '@/services/api'
import { uploadImages } from '@/utils/upload'
import './index.scss'

const CATEGORIES = ['数码', '书籍', '生活用品', '服饰', '其他']

export default function Publish() {
  const [editId, setEditId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [desc, setDesc] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    const id = Number(Taro.getCurrentInstance().router?.params?.id)
    if (id) {
      setEditId(id)
      setLoadingData(true)
      goodsApi.get(id).then((g) => {
        setTitle(g.title)
        setPrice(String(g.price))
        setDesc(g.description || '')
        setImages(g.images || [])
        if (g.lat && g.lng) {
          setLocation({
            lat: g.lat,
            lng: g.lng,
            name: (g as any).address || '已选位置',
          })
        }
        const c = CATEGORIES.find((x) => x === (g as any).category)
        if (c) setCategory(c)
      }).catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => setLoadingData(false))
    }
  }, [])

  const chooseImage = () => {
    Taro.chooseMedia({
      count: 5 - images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
    }).then((res) => {
      const temps = res.tempFiles.map((f) => f.tempFilePath)
      setImages((prev) => [...prev, ...temps].slice(0, 5))
    })
  }

  const chooseLocation = () => {
    Taro.chooseLocation({
      latitude: location?.lat,
      longitude: location?.lng,
    }).then((loc) => {
      setLocation({ lat: loc.latitude, lng: loc.longitude, name: loc.address || loc.name })
    }).catch(() => {
      Taro.showToast({ title: '需要授权位置', icon: 'none' })
    })
  }

  const submit = async () => {
    if (!Taro.getStorageSync('token')) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      Taro.switchTab({ url: '/pages/user/index' })
      return
    }
    if (!title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' })
      return
    }
    if (!price || isNaN(Number(price))) {
      Taro.showToast({ title: '请输入有效价格', icon: 'none' })
      return
    }
    if (!category) {
      Taro.showToast({ title: '请选择分类', icon: 'none' })
      return
    }
    if (images.length === 0) {
      Taro.showToast({ title: '请上传至少一张图片', icon: 'none' })
      return
    }
    if (!location) {
      Taro.showToast({ title: '请选择位置', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      let imageUrls = images
      if (images.some((u) => !u.startsWith('http'))) {
        Taro.showLoading({ title: '上传中...' })
        imageUrls = await uploadImages(images)
        Taro.hideLoading()
      }
      const payload = {
        title: title.trim(),
        price: Number(price),
        category,
        description: desc.trim(),
        images: imageUrls,
        lat: location.lat,
        lng: location.lng,
      }
      if (editId) {
        await goodsApi.update(editId, payload)
        Taro.showToast({ title: '修改成功' })
        setTimeout(() => Taro.navigateBack(), 1500)
      } else {
        await goodsApi.create({ ...payload, status: 1 })
        Taro.showToast({ title: '发布成功' })
        setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 1500)
      }
    } catch (e) {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <View className="publish-page">
        <Text className="loading-tip">加载中...</Text>
      </View>
    )
  }

  return (
    <View className="publish-page">
      <View className="form">
        <View className="row">
          <Text className="label">图片</Text>
          <View className="imgs">
            {images.map((url, i) => (
              <Image key={i} src={url} className="img" mode="aspectFill" />
            ))}
            {images.length < 5 && (
              <View className="add-img" onClick={chooseImage}>
                <Text>+</Text>
              </View>
            )}
          </View>
        </View>
        <View className="row">
          <Text className="label">标题</Text>
          <Input
            className="input"
            placeholder="请输入商品标题"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
          />
        </View>
        <View className="row">
          <Text className="label">价格</Text>
          <Input
            className="input"
            type="digit"
            placeholder="0.00"
            value={price}
            onInput={(e) => setPrice(e.detail.value)}
          />
        </View>
        <View className="row">
          <Text className="label">分类</Text>
          <View className="categories">
            {CATEGORIES.map((c) => (
              <Text
                key={c}
                className={`tag ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </Text>
            ))}
          </View>
        </View>
        <View className="row">
          <Text className="label">描述</Text>
          <Textarea
            className="textarea"
            placeholder="选填"
            value={desc}
            onInput={(e) => setDesc(e.detail.value)}
          />
        </View>
        <View className="row">
          <Text className="label">位置</Text>
          <Text className="location-btn" onClick={chooseLocation}>
            {location ? location.name : '点击选择位置'}
          </Text>
        </View>
      </View>
      <Button className="submit" onClick={submit} loading={loading}>
        {editId ? '保存修改' : '发布'}
      </Button>
    </View>
  )
}
