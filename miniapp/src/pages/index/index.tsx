import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Map } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { goodsApi, Goods } from '@/services/api'
import GoodCard from '@/components/GoodCard'
import { setTabBarSelected } from '@/utils/tabbar-state'
import './index.scss'

const CATEGORIES = [
  { name: '全部', icon: 'app' },
  { name: '数码', icon: 'mobile' },
  { name: '书籍', icon: 'book' },
  { name: '生活用品', icon: 'shop' },
  { name: '服饰', icon: 'browse' },
  { name: '其他', icon: 'ellipsis' },
]
const AREAS = ['全部', '宿舍区', '教学区', '图书馆', '食堂周边', '运动场', '快递点', '其他']

export default function Index() {
  const [list, setList] = useState<Goods[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLabel, setLocationLabel] = useState('未开启定位')
  const [category, setCategory] = useState('全部')
  const [area, setArea] = useState('全部')
  const [keyword, setKeyword] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    loadLocationAndGoods()
  }, [category, area, keyword])

  Taro.useDidShow(() => setTabBarSelected(0))

  const loadLocationAndGoods = async () => {
    setLoading(true)
    try {
      const params: any = { page: 1, pageSize: 20 }
      if (category && category !== '全部') params.category = category
      if (area && area !== '全部') params.campus = area
      if (keyword.trim()) params.keyword = keyword.trim()

      let loc = location
      if (!loc) {
        try {
          const res = await Taro.getLocation({ type: 'gcj02' })
          loc = { lat: res.latitude, lng: res.longitude }
          setLocation(loc)
          setLocationLabel('已开启附近模式')
          params.lat = loc.lat
          params.lng = loc.lng
          params.radius = 10
        } catch {
          setLocationLabel('未获取到定位，展示全站商品')
          // 定位失败则用普通列表
        }
      } else {
        params.lat = loc.lat
        params.lng = loc.lng
        params.radius = 10
      }

      const res = await goodsApi.list(params)
      setList(res?.list || [])
      setLastUpdated(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      console.error(e)
      try {
        const res = await goodsApi.list({ page: 1, pageSize: 20 }, { silent: true })
        setList(res?.list || [])
        setLocationLabel('接口异常，已切换普通列表')
        setLastUpdated(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
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

  const resetFilters = () => {
    setCategory('全部')
    setArea('全部')
    setKeyword('')
  }

  const quickFilters = [
    { key: 'all', label: '最新上架', action: () => resetFilters() },
    { key: 'nearby', label: '离我最近', action: () => loadLocationAndGoods() },
    { key: 'digital', label: '数码专区', action: () => setCategory('数码') },
  ]

  return (
    <View className="index-page tab-bar-page">
      <View className="header-bg" />
      
      <View className="search-section">
        <View className="search-shell">
          <t-search
            value={keyword}
            placeholder="搜索物品、型号或关键词"
            shape="round"
            action="搜索"
            clearable
            onChange={(e) => setKeyword(e.detail.value)}
            onSubmit={onSearch}
            onActionClick={onSearch}
          />
        </View>
      </View>

      <View className="hero-card">
        <View className="hero-copy">
          <Text className="hero-title">邻物集</Text>
          <Text className="hero-subtitle">把校内闲置按距离、区域和分类整理好，方便约在熟悉的位置面交。</Text>
        </View>
        <View className="hero-meta">
          <View className="hero-pill">
            <t-icon name="location" size="28rpx" />
            <Text>{locationLabel}</Text>
          </View>
          <View className="hero-pill muted">
            <t-icon name="application" size="28rpx" />
            <Text>当前 {list.length} 件商品</Text>
          </View>
        </View>
        <ScrollView scrollX className="quick-bar" enhanced showScrollbar={false}>
          {quickFilters.map((item) => (
            <Text key={item.key} className="quick-chip" onClick={item.action}>
              {item.label}
            </Text>
          ))}
        </ScrollView>
      </View>

      <View className="category-grid">
        {CATEGORIES.map((c) => (
          <View
            key={c.name}
            className={`cat-item ${category === c.name ? 'active' : ''}`}
            onClick={() => setCategory(c.name)}
          >
            <t-icon name={c.icon} size="34rpx" />
            <Text className="cat-text">{c.name}</Text>
          </View>
        ))}
      </View>

      <View className="filter-section">
        <ScrollView scrollX className="campus-bar" enhanced showScrollbar={false}>
          {AREAS.map((c) => (
            <Text
              key={c}
              className={`chip ${area === c ? 'active' : ''}`}
              onClick={() => setArea(c)}
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
            <t-icon name="view-list" size="28rpx" />
          </View>
          <View
            className={`toggle-item ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <t-icon name="map-3d" size="28rpx" />
          </View>
        </View>
      </View>

      <View className="result-bar">
        <View>
          <Text className="result-title">{keyword.trim() ? `“${keyword.trim()}” 的结果` : '为你整理的商品'}</Text>
          <Text className="result-subtitle">
            {category !== '全部' || area !== '全部'
              ? `筛选条件：${category} / ${area}`
              : '默认按最新与附近信息综合展示'}
          </Text>
        </View>
        <View className="result-actions">
          <Text className="refresh-text">{lastUpdated ? `更新于 ${lastUpdated}` : '尚未更新'}</Text>
          {(category !== '全部' || area !== '全部' || keyword.trim()) && (
            <Text className="reset-text" onClick={resetFilters}>重置</Text>
          )}
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
              <View className="empty-icon">
                <t-icon name="browse-off" size="68rpx" />
              </View>
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

      {viewMode === 'map' && (
        location ? (
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
              iconPath: '',
            }))}
          />
        ) : (
          <View className="map-empty">
            <View className="map-empty-icon">
              <t-icon name="location-error" size="72rpx" />
            </View>
            <Text className="map-empty-title">地图模式需要定位权限</Text>
            <Text className="map-empty-desc">开启定位后，可以直接看到你附近的商品分布。</Text>
            <Text className="map-empty-btn" onClick={loadLocationAndGoods}>重新获取位置</Text>
          </View>
        )
      )}
    </View>
  )
}
