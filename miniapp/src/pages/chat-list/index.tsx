import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { messageApi, Conversation } from '@/services/api'
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
          <Text>登录后查看消息</Text>
          <Text
            className="btn"
            onClick={() => Taro.switchTab({ url: '/pages/user/index' })}
          >
            去登录
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="chat-list-page">
      <ScrollView scrollY className="list" onScrollToUpper={load}>
        {loading ? (
          <Text className="loading">加载中...</Text>
        ) : list.length === 0 ? (
          <View className="empty">
            <Text className="empty-icon">💬</Text>
            <Text className="empty-text">暂无会话</Text>
            <Text className="empty-hint">在商品详情页联系卖家开始聊天</Text>
          </View>
        ) : (
          list.map((c) => (
            <View
              key={c.id}
              className="item"
              onClick={() => goChat(c)}
            >
              <Image
                src={c.otherUser?.avatar || ''}
                className="avatar"
                mode="aspectFill"
              />
              <View className="info">
                <View className="row">
                  <Text className="name">{c.otherUser?.nickName || '用户'}</Text>
                  <Text className="time">{formatTime(c.lastMessageAt)}</Text>
                </View>
                <View className="row">
                  <Text className="last-msg" numberOfLines={1}>
                    {c.lastMessage || '暂无消息'}
                  </Text>
                  {c.unread > 0 && (
                    <View className="unread">
                      <Text>{c.unread > 99 ? '99+' : c.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
