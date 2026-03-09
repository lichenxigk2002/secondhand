import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Map, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { IconFont } from '@/components/iconfont'
import { goodsApi, Goods } from '@/services/api'
import GoodCard from '@/components/GoodCard'
import { setTabBarSelected } from '@/utils/tabbar-state'
import './index.scss'

const CATEGORIES = [
  { name: '全部', icon: 'apps', color: '#FFD100' },
  { name: '数码', icon: 'phone', color: '#36cfc9' },
  { name: '书籍', icon: 'book', color: '#597ef7' },
  { name: '生活', icon: 'basket', color: '#73d13d' },
  { name: '服饰', icon: 'shirt', color: '#ff7a45' },
  { name: '其他', icon: 'grid', color: '#9254de' }
]
const CAMPUSES = ['全部', '南校区', '北校区', '东区', '西区', '其他']

export default function Index() {
  const [list, setList] = useState<Goods[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [category, setCategory] = useState('全部')
  const [campus, setCampus] = useState('全部')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    loadLocationAndGoods()
  }, [category, campus, keyword])

  Taro.useDidShow(() => setTabBarSelected(0))

  const loadLocationAndGoods = async () => {
    setLoading(true)
    try {
      const params: any = { page: 1, pageSize: 20 }
      if (category && category !== '全部') params.category = category
      if (campus && campus !== '全部') params.campus = campus
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
      try {
        const res = await goodsApi.list({ page: 1, pageSize: 20 }, { silent: true })
        setList(res?.list || [])
      } catch {
        setList([])
      }
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
    <View className="index-page tab-bar-page">
      <View className="header-bg" />
      
      <View className="search-section">
        <View className="search-bar">
          <IconFont name="search" size={20} color="#999" className="search-icon" />
          <Input
            className="search-input"
            placeholder="搜索好物..."
            placeholderClass="search-placeholder"
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={onSearch}
          />
          <View className="search-btn" onClick={onSearch}>搜索</View>
        </View>
      </View>

      <View className="category-grid">
        {CATEGORIES.map((c) => (
          <View
            key={c.name}
            className={`cat-item ${category === c.name ? 'active' : ''}`}
            onClick={() => setCategory(c.name)}
          >
            <View className="icon-box" style={{ background: category === c.name ? '#FFD100' : '#f5f6f8' }}>
              <IconFont 
                name={c.icon} 
                size={28} 
                color={category === c.name ? '#222' : c.color} 
              />
            </View>
            <Text className="name">{c.name}</Text>
          </View>
        ))}
      </View>

      <View className="filter-section">
        <ScrollView scrollX className="campus-bar" enhanced showScrollbar={false}>
          {CAMPUSES.map((c) => (
            <Text
              key={c}
              className={`chip ${campus === c ? 'active' : ''}`}
              onClick={() => setCampus(c)}
            >
              {c}
            </Text>
          ))}
        </ScrollView>
        
        <View className="view-toggle">
          <View
            className={`toggle-item ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <IconFont name="list" size={20} color={viewMode === 'list' ? '#222' : '#999'} />
          </View>
          <View
            className={`toggle-item ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <IconFont name="map" size={20} color={viewMode === 'map' ? '#222' : '#999'} />
          </View>
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
              <IconFont name="folder" size={64} color="#ccc" />
              <Text className="empty-text">暂无商品</Text>
              <View
                className="empty-btn"
                onClick={() => Taro.switchTab({ url: '/pages/publish/index' })}
              >
                去发布
              </View>
            </View>
          ) : (
            <View className="goods-grid">
              <View className="column">
                {list.filter((_, i) => i % 2 === 0).map((item) => (
                  <GoodCard key={item.id} goods={item} />
                ))}
              </View>
              <View className="column">
                {list.filter((_, i) => i % 2 !== 0).map((item) => (
                  <GoodCard key={item.id} goods={item} />
                ))}
              </View>
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
