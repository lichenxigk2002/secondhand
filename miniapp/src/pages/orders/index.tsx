import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { orderApi, OrderItem } from '@/services/api'
import './index.scss'

const STATUS_MAP: Record<number, string> = {
  0: '待确认',
  1: '进行中',
  2: '已完成',
  3: '已取消',
}

export default function Orders() {
  const [list, setList] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = () => {
    if (!Taro.getStorageSync('token')) {
      Taro.switchTab({ url: '/pages/user/index' })
      return
    }
    setLoading(true)
    orderApi
      .mine()
      .then((res) => setList(res.list || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  const complete = (o: OrderItem) => {
    Taro.showModal({
      title: '确认',
      content: '确认交易已完成？',
      success: (res) => {
        if (res.confirm) {
          orderApi.complete(o.id).then(() => {
            Taro.showToast({ title: '已确认' })
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

  if (!Taro.getStorageSync('token')) {
    return null
  }

  return (
    <View className="orders-page">
      <ScrollView scrollY className="list" onScrollToUpper={load}>
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
              <View
                className="goods-row"
                onClick={() => o.goods && goDetail(o.goods.id)}
              >
                <Image
                  src={o.goods?.images?.[0] || ''}
                  className="thumb"
                  mode="aspectFill"
                />
                <View className="info">
                  <Text className="title">{o.goods?.title || '商品'}</Text>
                  <Text className="amount">¥{o.amount}</Text>
                  <Text className={`status s${o.status}`}>{STATUS_MAP[o.status]}</Text>
                </View>
              </View>
              <View className="actions">
                {o.status === 0 && (
                  <Button
                    className="btn"
                    size="mini"
                    onClick={() => complete(o)}
                  >
                    确认完成
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
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
