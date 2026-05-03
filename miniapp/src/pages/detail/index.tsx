import { useState, useEffect } from 'react'
import { View, Text, Image, Button, Swiper, SwiperItem, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { goodsApi, favoriteApi, browseApi, reportApi, goodsCommentApi, Goods, GoodsCommentItem } from '@/services/api'
import { fixImageUrl } from '@/utils/request'
import './index.scss'

export default function Detail() {
  const [goods, setGoods] = useState<Goods | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)
  const [comments, setComments] = useState<GoodsCommentItem[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const token = Taro.getStorageSync('token')
  const currentUser = Taro.getStorageSync('user_info')

  const loadComments = (gid: number) => {
    goodsCommentApi.list(gid).then((res) => setComments(res?.list || [])).catch(() => setComments([]))
  }

  useEffect(() => {
    const r = Taro.getCurrentInstance().router?.params
    const idNum = Number(r?.id)
    if (idNum) {
      goodsApi
        .get(idNum)
        .then((g) => {
          setGoods(g)
          loadComments(g.id)
          if (token) {
            browseApi.record(g.id).catch(() => {})
          }
        })
        .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
        .finally(() => setLoading(false))
      if (token) {
        favoriteApi.check(idNum).then((res) => setFavorited(res.favorited))
      }
    } else {
      setLoading(false)
    }
  }, [])

  const toggleFavorite = () => {
    if (!goods || !token) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    favoriteApi.toggle(goods.id).then((res) => {
      setFavorited(res.favorited)
      Taro.showToast({ title: res.favorited ? '已收藏' : '已取消', icon: 'none' })
    })
  }

  const chat = () => {
    if (!goods) return
    if ((goods as any).auditStatus === 0) {
      Taro.showToast({ title: '该商品审核中', icon: 'none' })
      return
    }
    if ((goods as any).auditStatus === 2) {
      Taro.showToast({ title: '该商品未通过审核', icon: 'none' })
      return
    }
    if ((goods as any).status === 0) {
      Taro.showToast({ title: '该商品已下架', icon: 'none' })
      return
    }
    if ((goods as any).status === 2) {
      Taro.showToast({ title: '该商品已售出', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/pages/chat/index?targetId=${goods.userId}&goodsId=${goods.id}`,
    })
  }

  const report = () => {
    if (!goods) return
    const reasons = ['虚假信息', '违规内容', '欺诈行为', '侵权', '其他']
    Taro.showActionSheet({
      itemList: reasons,
      success: (res) => {
        const reason = reasons[res.tapIndex]
        reportApi
          .create('goods', goods.id, reason)
          .then(() => Taro.showToast({ title: '举报已提交' }))
      },
    })
  }

  const submitComment = () => {
    if (!goods) return
    const content = commentInput.trim()
    if (!content) {
      Taro.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }
    if (!token) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    setCommentSubmitting(true)
    goodsCommentApi
      .create(goods.id, content)
      .then((newComment) => {
        setComments((prev) => [newComment, ...prev])
        setCommentInput('')
        Taro.showToast({ title: '评论成功' })
      })
      .catch(() => {})
      .finally(() => setCommentSubmitting(false))
  }

  const formatCommentTime = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const statusMap: Record<number, string> = {
    0: '已下架',
    1: '在售中',
    2: '已售出',
  }

  const auditMap: Record<number, string> = {
    0: '审核中',
    1: '已通过',
    2: '未通过',
  }

  const goEdit = () => {
    if (!goods) return
    Taro.navigateTo({ url: `/pages/publish-edit/index?id=${goods.id}` })
  }

  if (loading) {
    return (
      <View className="detail-page loading">
        <View className="skeleton banner" />
        <View className="skeleton title" />
        <View className="skeleton price" />
      </View>
    )
  }

  if (!goods) {
    return (
      <View className="detail-page">
        <Text className="error-msg">商品不存在或已下架</Text>
      </View>
    )
  }

  const imgs = goods.images?.length ? goods.images : ['']
  const hasDesc = typeof goods.description === 'string' ? goods.description.trim() : ''
  const isOwner = !!token && Number(currentUser?.id || 0) === goods.userId

  return (
    <View className="detail-page">
      <Swiper className="banner" autoplay circular indicatorDots>
        {imgs.map((url, i) => (
          <SwiperItem key={i}>
            <Image src={fixImageUrl(url || '')} mode="aspectFill" className="main-img" />
          </SwiperItem>
        ))}
      </Swiper>
      <View className="info">
        <View className="price-row">
          <Text className="price">¥{String(goods.price ?? '')}</Text>
          <Text
            className={`fav-btn ${favorited ? 'active' : ''}`}
            onClick={toggleFavorite}
          >
            {favorited ? '❤️' : '🤍'} 收藏
          </Text>
        </View>
        <Text className="title">{String(goods.title ?? '')}</Text>
        <View className="status-row">
          <Text className={`status-tag s${(goods as any).status ?? 1}`}>{statusMap[(goods as any).status ?? 1] || '状态未知'}</Text>
          <Text className={`audit-tag a${(goods as any).auditStatus ?? 1}`}>{auditMap[(goods as any).auditStatus ?? 1] || '审核未知'}</Text>
        </View>
        <View className="meta-row">
          {goods.viewCount != null && <Text className="view-count">浏览 {goods.viewCount}</Text>}
          {goods.distance != null && <Text className="distance">距离 {goods.distance.toFixed(1)} km</Text>}
          <Text className="view-count">分类 {String((goods as any).category || '未分类')}</Text>
        </View>
      </View>
      <View className="trade-card">
        <Text className="trade-title">交易说明</Text>
        <Text className="trade-item">建议当面验货后再交易，避免只凭文字确认商品状态。</Text>
        <Text className="trade-item">如遇异常商品、冒用信息或恶意引导，请直接举报。</Text>
      </View>
      {hasDesc && (
        <View className="desc-section">
          <Text className="desc-label">商品描述</Text>
          <Text className="desc">{hasDesc}</Text>
        </View>
      )}
      <View className="user-bar">
        <Image
          src={fixImageUrl(goods.user?.avatar || '')}
          className="avatar"
          mode="aspectFill"
        />
        <View className="user-info">
          <Text className="user-name">{String(goods.user?.nickName ?? '用户')}</Text>
          {goods.user?.creditScore != null && (
            <Text className="credit">信用分 {goods.user.creditScore}</Text>
          )}
        </View>
      </View>
      <View className="btns">
        {isOwner ? (
          <Button className="btn-chat" onClick={goEdit}>
            编辑商品
          </Button>
        ) : (
          <Button className="btn-chat" onClick={chat}>
            联系卖家
          </Button>
        )}
        {!isOwner && <Text className="report-link" onClick={report}>举报</Text>}
      </View>

      <View className="comment-section">
        <Text className="comment-title">评论 ({comments.length})</Text>
        <View className="comment-input-row">
          <Input
            className="comment-input"
            placeholder="说点什么..."
            value={commentInput}
            onInput={(e) => setCommentInput(e.detail.value)}
            maxlength={500}
          />
          <Button className="comment-submit" size="mini" onClick={submitComment} loading={commentSubmitting}>
            发送
          </Button>
        </View>
        <Text className="comment-meta">{commentInput.trim().length}/500</Text>
        <View className="comment-list">
          {comments.length === 0 ? (
            <Text className="comment-empty">暂无评论</Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} className="comment-item">
                <Image
                  src={fixImageUrl(c.user?.avatar || '')}
                  className="comment-avatar"
                  mode="aspectFill"
                />
                <View className="comment-body">
                  <Text className="comment-user">{String(c.user?.nickName ?? '用户')}</Text>
                  <Text className="comment-content">{String(c.content ?? '')}</Text>
                  <Text className="comment-time">{formatCommentTime(c.createTime)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  )
}
