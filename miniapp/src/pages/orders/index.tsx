import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { orderApi, OrderItem } from '@/services/api'
import { fixImageUrl } from '@/utils/request'
import './index.scss'

const STATUS_MAP: Record<number, string> = {
  0: '待发出',
  1: '待收货',
  2: '已完成',
  3: '已取消',
}

export default function Orders() {
  const [list, setList] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'all' | 'buyer' | 'seller'>('all')
  const [status, setStatus] = useState<number | 'all'>('all')

  useEffect(() => {
    const type = Taro.getCurrentInstance().router?.params?.type
    if (type === 'sold') setRole('seller')
    if (type === 'bought') setRole('buyer')
  }, [])

  useEffect(() => {
    load()
  }, [role, status])

  Taro.useDidShow(() => {
    if (Taro.getStorageSync('token')) {
      load()
    }
  })

  const load = () => {
    if (!Taro.getStorageSync('token')) {
      Taro.switchTab({ url: '/pages/user/index' })
      return
    }
    setLoading(true)
    orderApi
      .mine({
        role: role === 'all' ? undefined : role,
        status: status === 'all' ? undefined : status,
      }, { silent: true })
      .then((res) => setList(res.list || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  const send = (o: OrderItem) => {
    Taro.showModal({
      title: '确认发出',
      content: '确认已将商品交给买家或已发出？确认后买家即可确认收货。',
      success: (res) => {
        if (res.confirm) {
          orderApi.send(o.id).then(() => {
            Taro.showToast({ title: '已发出' })
            load()
          })
        }
      },
    })
  }

  const complete = (o: OrderItem) => {
    Taro.showModal({
      title: '确认收货',
      content: '确认已收到商品且交易无误？确认后交易将正式完成，其他意向订单将自动关闭。',
      success: (res) => {
        if (res.confirm) {
          orderApi.complete(o.id).then(() => {
            Taro.showToast({ title: '交易完成' })
            load()
          })
        }
      },
    })
  }

  const goEvaluate = (o: OrderItem) => {
    Taro.navigateTo({
      url: `/pages/evaluate/index?orderId=${o.id}&toUserId=${o.toUserId}`,
    })
  }

  const goDetail = (gid: number) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${gid}` })
  }

  const roleTabs = [
    { key: 'all', label: '全部' },
    { key: 'buyer', label: '我买到的' },
    { key: 'seller', label: '我卖出的' },
  ] as const

  const statusTabs = [
    { key: 'all', label: '全部状态' },
    { key: 0, label: '待发出' },
    { key: 1, label: '待收货' },
    { key: 2, label: '已完成' },
  ] as const

  if (!Taro.getStorageSync('token')) {
    return null
  }

  return (
    <View className="orders-page">
      <View className="filter-card">
        <View className="tab-row">
          {roleTabs.map((item) => (
            <Text
              key={item.key}
              className={`filter-chip ${role === item.key ? 'active' : ''}`}
              onClick={() => setRole(item.key)}
            >
              {item.label}
            </Text>
          ))}
        </View>
        <View className="tab-row compact">
          {statusTabs.map((item) => (
            <Text
              key={String(item.key)}
              className={`filter-chip subtle ${status === item.key ? 'active' : ''}`}
              onClick={() => setStatus(item.key)}
            >
              {item.label}
            </Text>
          ))}
        </View>
      </View>
      <ScrollView scrollY className="list" onScrollToUpper={load}>
        <View className="list-inner">
        {loading ? (
          <Text className="loading">加载中...</Text>
        ) : list.length === 0 ? (
          <View className="empty">
            <Text className="empty-icon">📋</Text>
            <Text className="empty-text">暂无订单</Text>
            <Text className="empty-hint">联系卖家后会生成意向订单</Text>
          </View>
        ) : (
          list.map((o) => (
            <View key={o.id} className="order-item">
              <View className="order-head">
                <Text className="order-no">订单号 {o.orderNo}</Text>
                <Text className={`status s${o.status}`}>{STATUS_MAP[o.status]}</Text>
              </View>
              <View
                className="goods-row"
                onClick={() => o.goods && goDetail(o.goods.id)}
              >
                <Image
                  src={fixImageUrl(o.goods?.images?.[0] || '')}
                  className="thumb"
                  mode="aspectFill"
                />
                <View className="info">
                  <Text className="title">{o.goods?.title || '商品'}</Text>
                  <Text className="amount">¥{o.amount}</Text>
                  <Text className="role-tag">{o.isBuyer ? '我是买家' : '我是卖家'}</Text>
                </View>
              </View>
              <View className="actions">
                {o.status === 0 && !o.isBuyer && (
                  <Button
                    className="btn primary"
                    size="mini"
                    onClick={() => send(o)}
                  >
                    确认发出
                  </Button>
                )}
                {o.status === 1 && o.isBuyer && (
                  <Button
                    className="btn primary"
                    size="mini"
                    onClick={() => complete(o)}
                  >
                    确认收货
                  </Button>
                )}
                {o.status === 2 && o.canEvaluate && (
                  <Button
                    className="btn primary"
                    size="mini"
                    onClick={() => goEvaluate(o)}
                  >
                    去评价
                  </Button>
                )}
                {o.goods?.id && (
                  <Button className="btn secondary" size="mini" onClick={() => goDetail(o.goods!.id)}>
                    查看商品
                  </Button>
                )}
              </View>
            </View>
          ))
        )}
        </View>
      </ScrollView>
    </View>
  )
}
