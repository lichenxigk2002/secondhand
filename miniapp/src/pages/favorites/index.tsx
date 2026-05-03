import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { favoriteApi, Goods } from '@/services/api'
import { fixImageUrl } from '@/utils/request'
import './index.scss'

export default function Favorites() {
  const [list, setList] = useState<Goods[]>([])
  const [loading, setLoading] = useState(true)

  Taro.useDidShow(() => {
    load()
  })

  const load = () => {
    if (!Taro.getStorageSync('token')) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      Taro.switchTab({ url: '/pages/user/index' })
      return
    }
    setLoading(true)
    favoriteApi
      .list()
      .then((res) => setList(res.list || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  const goDetail = (g: Goods) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${g.id}` })
  }

  if (!Taro.getStorageSync('token')) {
    return (
      <View className="favorites-page">
        <View className="login-tip">
          <Text>登录后查看收藏</Text>
          <Text
            className="btn"
            onClick={() => Taro.switchTab({ url: '/pages/user/index' })}
          >
            去登录
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="favorites-page">
      <ScrollView scrollY className="list" onScrollToUpper={load}>
        {loading ? (
          <Text className="loading">加载中...</Text>
        ) : list.length === 0 ? (
          <View className="empty">
            <Text className="empty-icon">❤️</Text>
            <Text className="empty-text">暂无收藏</Text>
            <Text
              className="empty-btn"
              onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
            >
              去逛逛
            </Text>
          </View>
        ) : (
          <View className="goods-list">
            {list.map((g) => (
              <View key={g.id} className="item" onClick={() => goDetail(g)}>
                <Image
                  src={fixImageUrl(g.images?.[0] || '')}
                  className="thumb"
                  mode="aspectFill"
                />
                <View className="info">
                  <Text className="title">{g.title}</Text>
                  <Text className="price">¥{g.price}</Text>
                  <View className="user-row">
                    <Image
                      src={fixImageUrl(g.user?.avatar || '')}
                      className="avatar"
                      mode="aspectFill"
                    />
                    <Text className="name">{g.user?.nickName || '用户'}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
