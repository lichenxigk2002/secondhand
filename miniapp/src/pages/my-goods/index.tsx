import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { goodsApi, Goods } from '@/services/api'
import './index.scss'

const STATUS_MAP: Record<number, string> = {
  0: '已下架',
  1: '上架中',
  2: '已售出',
}

export default function MyGoods() {
  const [list, setList] = useState<Goods[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<number | 'all'>('all')

  useEffect(() => {
    load()
  }, [tab])

  Taro.useDidShow(() => {
    if (Taro.getStorageSync('token')) {
      load()
    }
  })

  const load = () => {
    if (!Taro.getStorageSync('token')) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      Taro.switchTab({ url: '/pages/user/index' })
      return
    }
    setLoading(true)
    const params = tab === 'all' ? {} : { status: tab }
    goodsApi
      .mine(params)
      .then((res) => setList(res.list || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  const toggleStatus = (g: Goods, e: any) => {
    e.stopPropagation()
    const next = g.status === 1 ? 0 : 1
    const tip = next === 1 ? '确定上架？' : '确定下架？'
    Taro.showModal({
      title: '提示',
      content: tip,
      success: (res) => {
        if (res.confirm) {
          goodsApi.setStatus(g.id, next).then(() => {
            Taro.showToast({ title: '操作成功' })
            load()
          })
        }
      },
    })
  }

  const del = (g: Goods, e: any) => {
    e.stopPropagation()
    Taro.showModal({
      title: '提示',
      content: '确定删除该商品？',
      success: (res) => {
        if (res.confirm) {
          goodsApi.delete(g.id).then(() => {
            Taro.showToast({ title: '已删除' })
            load()
          })
        }
      },
    })
  }

  const goDetail = (g: Goods) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${g.id}` })
  }

  const goEdit = (g: Goods, e: any) => {
    e.stopPropagation()
    Taro.navigateTo({ url: `/pages/publish-edit/index?id=${g.id}` })
  }

  if (!Taro.getStorageSync('token')) {
    return (
      <View className="my-goods-page">
        <View className="login-tip">
          <Text>登录后查看我的发布</Text>
          <Button className="btn-login" onClick={() => Taro.switchTab({ url: '/pages/user/index' })}>
            去登录
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className="my-goods-page">
      <View className="tabs">
        {(['all', 1, 0, 2] as const).map((s) => (
          <Text
            key={String(s)}
            className={`tab ${tab === s ? 'active' : ''}`}
            onClick={() => setTab(s)}
          >
            {s === 'all' ? '全部' : STATUS_MAP[s]}
          </Text>
        ))}
      </View>
      <ScrollView scrollY className="list" onScrollToUpper={load}>
        {loading ? (
          <Text className="loading">加载中...</Text>
        ) : list.length === 0 ? (
          <View className="empty">
            <Text className="empty-icon">📦</Text>
            <Text className="empty-text">暂无发布</Text>
            <Text
              className="empty-btn"
              onClick={() => Taro.switchTab({ url: '/pages/publish/index' })}
            >
              去发布
            </Text>
          </View>
        ) : (
          list.map((g) => (
            <View key={g.id} className="item" onClick={() => goDetail(g)}>
              <Image
                src={g.images?.[0] || ''}
                className="thumb"
                mode="aspectFill"
              />
              <View className="info">
                <Text className="title">{g.title}</Text>
                <Text className="price">¥{g.price}</Text>
                <Text className={`status s${g.status}`}>{STATUS_MAP[g.status]}</Text>
                <View className="actions">
                  {g.status !== 2 && (
                    <Text
                      className="action"
                      onClick={(e) => goEdit(g, e)}
                    >
                      编辑
                    </Text>
                  )}
                  {g.status !== 2 && (
                    <Text
                      className="action"
                      onClick={(e) => toggleStatus(g, e)}
                    >
                      {g.status === 1 ? '下架' : '上架'}
                    </Text>
                  )}
                  <Text
                    className="action danger"
                    onClick={(e) => del(g, e)}
                  >
                    删除
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
