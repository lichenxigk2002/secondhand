import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { browseApi, Goods } from '@/services/api'
import GoodCard from '@/components/GoodCard'
import './index.scss'

export default function BrowseHistory() {
  const [list, setList] = useState<Goods[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = () => {
    if (!Taro.getStorageSync('token')) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      Taro.switchTab({ url: '/pages/user/index' })
      return
    }
    setLoading(true)
    browseApi
      .list()
      .then((res) => setList(res.list || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  if (!Taro.getStorageSync('token')) {
    return (
      <View className="browse-history-page">
        <View className="login-tip">
          <Text>登录后查看浏览历史</Text>
          <Text className="btn" onClick={() => Taro.switchTab({ url: '/pages/user/index' })}>
            去登录
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="browse-history-page">
      <ScrollView scrollY className="list" onScrollToUpper={load}>
        {loading ? (
          <Text className="loading">加载中...</Text>
        ) : list.length === 0 ? (
          <View className="empty">
            <Text className="empty-icon">👀</Text>
            <Text className="empty-text">暂无浏览记录</Text>
            <Text className="empty-btn" onClick={() => Taro.switchTab({ url: '/pages/index/index' })}>
              去逛逛
            </Text>
          </View>
        ) : (
          <View className="goods-grid">
            {list.map((item) => (
              <GoodCard key={item.id} goods={item} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
