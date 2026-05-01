import { useState, useEffect } from 'react'
import { View, Text, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { evaluationApi } from '@/services/api'
import './index.scss'

export default function Evaluate() {
  const [orderId, setOrderId] = useState(0)
  const [toUserId, setToUserId] = useState(0)
  const [star, setStar] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const r = Taro.getCurrentInstance().router?.params
    setOrderId(Number(r?.orderId || 0))
    setToUserId(Number(r?.toUserId || 0))
  }, [])

  const submit = () => {
    if (!orderId || !toUserId) {
      Taro.showToast({ title: '参数错误', icon: 'none' })
      return
    }
    setLoading(true)
    evaluationApi
      .create(orderId, toUserId, star, comment)
      .then(() => {
        Taro.showToast({ title: '评价成功' })
        setTimeout(() => Taro.navigateBack(), 1500)
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false))
  }

  return (
    <View className="evaluate-page">
      <View className="hero-card">
        <Text className="hero-title">交易评价</Text>
        <Text className="hero-subtitle">客观评价交易体验，有助于完善校园内的信用体系。</Text>
      </View>
      <View className="form">
        <View className="row">
          <Text className="label">评分</Text>
          <View className="stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <Text
                key={s}
                className={`star ${star >= s ? 'active' : ''}`}
                onClick={() => setStar(s)}
              >
                {star >= s ? '★' : '☆'}
              </Text>
            ))}
          </View>
        </View>
        <View className="row">
          <Text className="label">评价内容</Text>
          <Textarea
            className="textarea"
            placeholder="选填，分享你的交易体验"
            maxlength={200}
            value={comment}
            onInput={(e) => setComment(e.detail.value)}
          />
          <Text className="field-meta">{comment.trim().length}/200</Text>
        </View>
      </View>
      <Button
        className="submit"
        onClick={submit}
        loading={loading}
      >
        提交评价
      </Button>
    </View>
  )
}
