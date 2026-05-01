import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { userApi, evaluationApi, reportApi } from '@/services/api'
import './index.scss'

interface EvalItem {
  id: number
  orderId: number
  fromUser: { nickName: string; avatar?: string } | null
  role: string
  star: number
  comment: string
  createTime: string
}

export default function EvaluationsReceived() {
  const [list, setList] = useState<EvalItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

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
    userApi
      .getProfile()
      .then((u) => evaluationApi.listByUser(u.id))
      .then((res) => setList(res?.list || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  const report = (e: EvalItem) => {
    const reasons = ['虚假评价', '恶意差评', '不当言论', '其他']
    Taro.showActionSheet({
      itemList: reasons,
      success: (res) => {
        const reason = reasons[res.tapIndex]
        reportApi
          .create('evaluation', e.id, reason)
          .then(() => Taro.showToast({ title: '举报已提交' }))
      },
    })
  }

  if (!Taro.getStorageSync('token')) return null

  return (
    <View className="evals-page">
      <View className="summary-card">
        <Text className="summary-title">收到的评价</Text>
        <Text className="summary-subtitle">
          查看交易反馈和信用沉淀，发现异常评价也可以直接举报。
        </Text>
      </View>
      <ScrollView scrollY className="list" onScrollToUpper={load}>
        {loading ? (
          <Text className="loading">加载中...</Text>
        ) : list.length === 0 ? (
          <View className="empty">
            <Text className="empty-icon">⭐</Text>
            <Text className="empty-text">暂无收到的评价</Text>
          </View>
        ) : (
          list.map((e) => (
            <View key={e.id} className="eval-item">
              <View className="head">
                <Text className="from">{e.fromUser?.nickName || '用户'}</Text>
                <Text className="role">{e.role === 'buyer' ? '买家' : '卖家'}</Text>
                <Text className="stars">{'★'.repeat(e.star)}{'☆'.repeat(5 - e.star)}</Text>
                <Text className="report-btn" onClick={() => report(e)}>举报</Text>
              </View>
              {e.comment ? <Text className="comment">{e.comment}</Text> : null}
              <Text className="time">{e.createTime?.slice(0, 16)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
