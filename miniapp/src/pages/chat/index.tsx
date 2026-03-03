import { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { messageApi, orderApi, ChatMessage } from '@/services/api'
import './index.scss'

export default function Chat() {
  const [conversationId, setConversationId] = useState(0)
  const [targetId, setTargetId] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<any>()

  useEffect(() => {
    const r = Taro.getCurrentInstance().router?.params
    const cid = Number(r?.conversationId)
    const tid = Number(r?.targetId)
    const gid = Number(r?.goodsId || 0)

    if (cid) {
      setConversationId(cid)
      setTargetId(tid)
      loadMessages(cid)
    } else if (tid) {
      messageApi
        .getOrCreateConversation(tid, gid || undefined)
        .then((res) => {
          const conv = res.conversation
          setConversationId(conv.id)
          setTargetId(conv.otherUser?.id || tid)
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
  }, [])

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
    messageApi
      .sendMessage(conversationId, text)
      .then((msg) => {
        setMessages((prev) => [...prev, msg])
        setTimeout(() => scrollRef.current?.scrollTo({ scrollTop: 99999 }), 100)
      })
      .catch(() => setContent(text))
      .finally(() => setSending(false))
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
        ref={scrollRef}
        scrollY
        className="message-list"
        scrollIntoView={`msg-${messages.length - 1}`}
      >
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
