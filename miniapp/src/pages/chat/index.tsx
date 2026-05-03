import { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { messageApi, orderApi, ChatMessage } from '@/services/api'
import { wsManager } from '@/utils/websocket'
import './index.scss'

export default function Chat() {
  const [conversationId, setConversationId] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    const r = Taro.getCurrentInstance().router?.params
    const cid = Number(r?.conversationId)
    const tid = Number(r?.targetId)
    const gid = Number(r?.goodsId || 0)

    if (cid) {
      setConversationId(cid)
      loadMessages(cid)
    } else if (tid) {
      messageApi
        .getOrCreateConversation(tid, gid || undefined)
        .then((res) => {
          const conv = res.conversation
          setConversationId(conv.id)
          loadMessages(conv.id)
          if (gid) {
            orderApi.create(gid).catch(() => {})
          }
        })
        .catch(() => {
          setLoading(false)
          Taro.showToast({ title: '加载失败', icon: 'none' })
        })
    } else {
      setLoading(false)
    }

    wsManager.connect()
    const removeListener = wsManager.addListener((data) => {
      if (data.type === 'message' && data.message?.conversationId === conversationId) {
        const m = data.message as ChatMessage & { conversationId: number }
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.id > 1700000000000 && last.content === m.content && m.isFromMe) {
            return [...prev.slice(0, -1), m]
          }
          if (prev.find(existing => existing.id === m.id)) return prev
          return [...prev, m]
        })
        scrollToBottom()
      }
    })

    return () => {
      removeListener()
    }
  }, [conversationId])

  const scrollToBottom = () => {
    // 方案一：使用 scrollIntoView
    setMessages((prev) => [...prev]) // 触发重绘以确保 ID 存在
    // 方案二：手动设置 scrollTop
    setTimeout(() => {
      setScrollTop((prev) => prev + 1) // 稍微抖动一下强制触发
      setScrollTop(99999)
    }, 100)
  }

  const loadMessages = (cid: number) => {
    setLoading(true)
    messageApi
      .listMessages(cid)
      .then((res) => setMessages(res.list || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }

  const send = () => {
    const text = content.trim()
    if (!text || !conversationId || sending) return
    setSending(true)
    setContent('')

    // 构造临时消息实现“即时上屏”
    const tempId = Date.now()
    const tempMsg: ChatMessage = {
      id: tempId,
      content: text,
      fromUserId: 0, // 临时占位
      toUserId: 0,
      createTime: new Date().toISOString(),
      isFromMe: true,
    }
    setMessages((prev) => [...prev, tempMsg])
    scrollToBottom()

    const payload = {
      type: 'send',
      conversationId,
      content: text,
    }

    if (wsManager.isReady()) {
      wsManager.send(payload)
      // 发送后移除临时消息的任务交给 onMessage 的正式消息（正式消息 ID 会覆盖或追加）
      // 为了简单起见，我们这里只处理发送状态
      setSending(false)
    } else {
      // 回退到 HTTP 发送
      messageApi
        .sendMessage(conversationId, text)
        .then((msg) => {
          // 替换掉刚才的临时消息
          setMessages((prev) => prev.map(m => m.id === tempId ? msg : m))
          scrollToBottom()
        })
        .catch(() => {
          setContent(text)
          // 移除发送失败的临时消息
          setMessages((prev) => prev.filter(m => m.id !== tempId))
        })
        .finally(() => setSending(false))
    }
  }

  const formatTime = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  if (!Taro.getStorageSync('token')) {
    Taro.showToast({ title: '请先登录', icon: 'none' })
    Taro.navigateBack()
    return null
  }

  return (
    <View className="chat-page">
      <ScrollView
          scrollY
          className="message-list"
          scrollTop={scrollTop}
          scrollWithAnimation
          scrollIntoView={`msg-${messages.length - 1}`}
        >
          <View className="message-list-inner">
            {loading ? (
              <Text className="loading">加载中...</Text>
            ) : messages.length === 0 ? (
              <Text className="empty-tip">暂无消息，发一句打招呼吧</Text>
            ) : (
              messages.map((m) => (
                <View
                  key={m.id}
                  id={`msg-${m.id}`}
                  className={`msg-row ${m.isFromMe ? 'me' : ''}`}
                >
                  <View className={`bubble ${m.isFromMe ? 'me' : ''}`}>
                    <Text className="text">{m.content}</Text>
                    <Text className="time">{formatTime(m.createTime)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      <View className="input-bar">
        <Input
          className="input"
          placeholder="输入消息..."
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          onConfirm={send}
          confirmType="send"
        />
        <Button
          className="send-btn"
          onClick={send}
          disabled={!content.trim() || sending}
        >
          发送
        </Button>
      </View>
    </View>
  )
}
