import { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { messageApi, Conversation } from '@/services/api'
import { wsManager } from '@/utils/websocket'
import { fixImageUrl } from '@/utils/request'
import './index.scss'

function formatTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  if (diff < 86400000 * 2) return '昨天'
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

export default function ChatList() {
  const [list, setList] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const unreadCount = list.reduce((sum, item) => sum + (item.unread || 0), 0)

  useEffect(() => {
    load()
    wsManager.connect()
    
    const removeListener = wsManager.addListener((data) => {
      if (data.type === 'message') {
        const m = data.message
        setList((prev) => {
          const newList = [...prev]
          const idx = newList.findIndex((c) => c.id === m.conversationId)
          if (idx > -1) {
            const conv = { ...newList[idx] }
            conv.lastMessage = m.content
            conv.lastMessageAt = m.createTime
            if (!m.isFromMe) {
              conv.unread = (conv.unread || 0) + 1
            }
            newList.splice(idx, 1)
            newList.unshift(conv)
            return newList
          } else {
            // 新会话，异步重新加载
            setTimeout(() => load(), 0)
            return prev
          }
        })
      }
    })

    return () => {
      removeListener()
    }
  }, [])

  Taro.useDidShow(() => {
    if (Taro.getStorageSync('token')) {
      load()
      wsManager.connect()
    }
  })

  const load = () => {
    if (!Taro.getStorageSync('token')) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      Taro.switchTab({ url: '/pages/user/index' })
      return
    }
    setLoading(true)
    messageApi
      .listConversations()
      .then((res) => setList(res.list || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  const goChat = (c: Conversation) => {
    Taro.navigateTo({
      url: `/pages/chat/index?conversationId=${c.id}&targetId=${c.otherUser?.id || 0}`,
    })
  }

  if (!Taro.getStorageSync('token')) {
    return (
      <View className="chat-list-page">
        <View className="login-tip">
          <Text className="tip-text">登录后查看消息</Text>
          <View
            className="btn"
            onClick={() => Taro.switchTab({ url: '/pages/user/index' })}
          >
            去登录
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="chat-list-page">
      <View className="summary-card">
        <Text className="summary-title">消息中心</Text>
        <Text className="summary-subtitle">
          {unreadCount > 0 ? `你有 ${unreadCount} 条未读消息，建议优先回复活跃买家。` : '当前没有未读消息，沟通会记录在这里。'}
        </Text>
      </View>
      <ScrollView scrollY className="list" onScrollToUpper={load}>
        <View className="list-inner">
        {loading ? (
          <View className="loading-box">
            <Text className="loading-text">加载中...</Text>
          </View>
        ) : list.length === 0 ? (
          <View className="empty">
            <Image src="https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0" className="empty-img" />
            <Text className="empty-text">暂无会话</Text>
            <Text className="empty-hint">在商品详情页联系卖家开始聊天</Text>
          </View>
        ) : (
          <View className="list-content">
            {list.map((c) => (
              <View
                key={c.id}
                className="item"
                onClick={() => goChat(c)}
              >
                <View className="avatar-wrap">
                  <Image
                    src={fixImageUrl(c.otherUser?.avatar || '')}
                    className="avatar"
                    mode="aspectFill"
                  />
                  {c.unread > 0 && (
                    <View className="badge">
                      <Text>{c.unread > 99 ? '99+' : c.unread}</Text>
                    </View>
                  )}
                </View>
                <View className="info">
                  <View className="row top">
                    <Text className="name">{c.otherUser?.nickName || '用户'}</Text>
                    <Text className="time">{formatTime(c.lastMessageAt)}</Text>
                  </View>
                  <View className="row bottom">
                    <Text className="last-msg">
                      {c.lastMessage || '暂无消息'}
                    </Text>
                    {c.goodsId ? <Text className="goods-tag">商品会话</Text> : null}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        </View>
      </ScrollView>
    </View>
  )
}
