import { useState, useEffect } from 'react'
import { View, Text, Image, Button, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { goodsApi, favoriteApi, browseApi, reportApi, Goods } from '@/services/api'
import './index.scss'

export default function Detail() {
  const [goods, setGoods] = useState<Goods | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    const r = Taro.getCurrentInstance().router?.params
    const idNum = Number(r?.id)
    if (idNum) {
      goodsApi
        .get(idNum)
        .then((g) => {
          setGoods(g)
          if (Taro.getStorageSync('token')) {
            browseApi.record(g.id).catch(() => {})
          }
        })
        .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
        .finally(() => setLoading(false))
      if (Taro.getStorageSync('token')) {
        favoriteApi.check(idNum).then((res) => setFavorited(res.favorited))
      }
    } else {
      setLoading(false)
    }
  }, [])

  const toggleFavorite = () => {
    if (!goods || !Taro.getStorageSync('token')) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    favoriteApi.toggle(goods.id).then((res) => {
      setFavorited(res.favorited)
      Taro.showToast({ title: res.favorited ? '已收藏' : '已取消', icon: 'none' })
    })
  }

  const chat = () => {
    if (!goods) return
    Taro.navigateTo({
      url: `/pages/chat/index?targetId=${goods.userId}&goodsId=${goods.id}`,
    })
  }

  const report = () => {
    if (!goods) return
    const reasons = ['虚假信息', '违规内容', '欺诈行为', '侵权', '其他']
    Taro.showActionSheet({
      itemList: reasons,
      success: (res) => {
        const reason = reasons[res.tapIndex]
        reportApi
          .create('goods', goods.id, reason)
          .then(() => Taro.showToast({ title: '举报已提交' }))
      },
    })
  }

  if (loading) {
    return (
      <View className="detail-page loading">
        <View className="skeleton banner" />
        <View className="skeleton title" />
        <View className="skeleton price" />
      </View>
    )
  }

  if (!goods) {
    return (
      <View className="detail-page">
        <Text className="error-msg">商品不存在或已下架</Text>
      </View>
    )
  }

  const imgs = goods.images?.length ? goods.images : ['']
  const hasDesc = goods.description?.trim()

  return (
    <View className="detail-page">
      <Swiper className="banner" autoplay circular indicatorDots>
        {imgs.map((url, i) => (
          <SwiperItem key={i}>
            <Image src={url || ''} mode="aspectFill" className="main-img" />
          </SwiperItem>
        ))}
      </Swiper>
      <View className="info">
        <View className="price-row">
          <Text className="price">¥{goods.price}</Text>
          <Text
            className={`fav-btn ${favorited ? 'active' : ''}`}
            onClick={toggleFavorite}
          >
            {favorited ? '❤️' : '🤍'} 收藏
          </Text>
        </View>
        <Text className="title">{goods.title}</Text>
        {goods.viewCount != null && goods.viewCount > 0 && (
          <Text className="view-count">浏览 {goods.viewCount}</Text>
        )}
        {goods.distance != null && (
          <Text className="distance">距离 {goods.distance.toFixed(1)} km</Text>
        )}
      </View>
      {hasDesc && (
        <View className="desc-section">
          <Text className="desc-label">商品描述</Text>
          <Text className="desc">{hasDesc}</Text>
        </View>
      )}
      <View className="user-bar">
        <Image
          src={goods.user?.avatar || ''}
          className="avatar"
          mode="aspectFill"
        />
        <View className="user-info">
          <Text className="user-name">{goods.user?.nickName || '用户'}</Text>
          {goods.user?.creditScore != null && (
            <Text className="credit">信用分 {goods.user.creditScore}</Text>
          )}
        </View>
      </View>
      <View className="btns">
        <Button className="btn-chat" onClick={chat}>
          联系卖家
        </Button>
        <Text className="report-link" onClick={report}>举报</Text>
      </View>
    </View>
  )
}
