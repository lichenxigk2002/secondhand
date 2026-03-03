import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Map, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { goodsApi, Goods } from '@/services/api'
import GoodCard from '@/components/GoodCard'
import './index.scss'

const CATEGORIES = ['全部', '数码', '书籍', '生活用品', '服饰', '其他']

export default function Index() {
  const [list, setList] = useState<Goods[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [category, setCategory] = useState('全部')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    loadLocationAndGoods()
  }, [category, keyword])

  const loadLocationAndGoods = async () => {
    setLoading(true)
    try {
      const params: any = { page: 1, pageSize: 20 }
      if (category && category !== '全部') params.category = category
      if (keyword.trim()) params.keyword = keyword.trim()

      let loc = location
      if (!loc) {
        try {
          const res = await Taro.getLocation({ type: 'gcj02' })
          loc = { lat: res.latitude, lng: res.longitude }
          setLocation(loc)
          params.lat = loc.lat
          params.lng = loc.lng
          params.radius = 10
        } catch {
          // 定位失败则用普通列表
        }
      } else {
        params.lat = loc.lat
        params.lng = loc.lng
        params.radius = 10
      }

      const res = await goodsApi.list(params)
      setList(res?.list || [])
    } catch (e) {
      console.error(e)
      const res = await goodsApi.list({ page: 1, pageSize: 20 })
      setList(res?.list || [])
    } finally {
      setLoading(false)
    }
  }

  const onSearch = () => {
    loadLocationAndGoods()
  }

  const onPullDownRefresh = () => {
    loadLocationAndGoods().then(() => Taro.stopPullDownRefresh())
  }

  return (
    <View className="index-page">
      <View className="search-bar">
        <Input
          className="search-input"
          placeholder="搜索商品"
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          onConfirm={onSearch}
        />
        <Text className="search-btn" onClick={onSearch}>搜索</Text>
      </View>

      <ScrollView scrollX className="category-bar" enhanced showScrollbar={false}>
        {CATEGORIES.map((c) => (
          <Text
            key={c}
            className={`cat-item ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </Text>
        ))}
      </ScrollView>

      <View className="tabs">
        <View
          className={`tab ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <Text>列表</Text>
          {viewMode === 'list' && <View className="tab-indicator" />}
        </View>
        <View
          className={`tab ${viewMode === 'map' ? 'active' : ''}`}
          onClick={() => setViewMode('map')}
        >
          <Text>地图</Text>
          {viewMode === 'map' && <View className="tab-indicator" />}
        </View>
      </View>

      {viewMode === 'list' && (
        <ScrollView
          scrollY
          className="goods-list"
          onScrollToUpper={onPullDownRefresh}
          enableBackToTop
        >
          {loading ? (
            <View className="loading-box">
              <Text className="loading-text">加载中...</Text>
            </View>
          ) : list.length === 0 ? (
            <View className="empty-box">
              <Text className="empty-icon">📦</Text>
              <Text className="empty-text">暂无附近商品</Text>
              <Text className="empty-hint">去发布一个吧</Text>
              <Text
                className="empty-btn"
                onClick={() => Taro.switchTab({ url: '/pages/publish/index' })}
              >
                立即发布
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
      )}

      {viewMode === 'map' && location && (
        <Map
          className="map"
          latitude={location.lat}
          longitude={location.lng}
          scale={14}
          markers={list.map((g, i) => ({
            id: i,
            latitude: g.lat,
            longitude: g.lng,
            title: g.title,
            iconPath: '', // 空字符串使用默认标记
          }))}
        />
      )}
    </View>
  )
}
