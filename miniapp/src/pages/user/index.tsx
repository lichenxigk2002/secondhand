import { useState, useEffect } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { IconFont } from '@/components/iconfont'
import { userApi, messageApi } from '@/services/api'
import type { User, UserStats } from '@/services/api'
import { setTabBarSelected } from '@/utils/tabbar-state'
import './index.scss'

const defaultStats: UserStats = { myGoodsCount: 0, favoriteCount: 0, browseHistoryCount: 0 }

export default function UserPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats>(defaultStats)

  useEffect(() => {
    loadUser()
    updateMessageBadge()
  }, [])

  useEffect(() => {
    if (Taro.getStorageSync('token')) loadStats()
  }, [user])

  const loadStats = () => {
    userApi.getStats({ silent: true }).then(setStats).catch(() => setStats(defaultStats))
  }

  Taro.useDidShow(() => {
    setTabBarSelected(2)
    updateMessageBadge()
    if (Taro.getStorageSync('token')) loadStats()
  })

  const updateMessageBadge = () => {
    if (!Taro.getStorageSync('token')) {
      Taro.removeTabBarBadge({ index: 2 }).catch(() => {})
      return
    }
    messageApi
      .getUnreadCount({ silent: true })
      .then((res) => {
        const n = res?.count ?? 0
        if (n > 0) {
          Taro.setTabBarBadge({ index: 2, text: n > 99 ? '99+' : String(n) })
        } else {
          Taro.removeTabBarBadge({ index: 2 }).catch(() => {})
        }
      })
      .catch(() => Taro.removeTabBarBadge({ index: 2 }).catch(() => {}))
  }

  const loadUser = () => {
    const token = Taro.getStorageSync('token')
    if (!token) return
    userApi.getProfile({ silent: true }).then(setUser).catch(() => {})
  }

  const login = () => {
    Taro.login({
      success: (res) => {
        if (res.code) {
          userApi.login(res.code)
            .then((data) => {
              Taro.setStorageSync('token', data.token)
              setUser(data.user)
            })
            .catch(() => Taro.showToast({ title: '登录失败', icon: 'none' }))
        }
      },
    })
  }

  const goTo = (url: string) => {
    Taro.navigateTo({ url })
  }

  if (!Taro.getStorageSync('token')) {
    return (
      <View className="user-page tab-bar-page">
        <View className="login-tip">
          <Image src="https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0" className="logo" />
          <Text className="title">欢迎来到校园二手</Text>
          <Text className="subtitle">登录后使用完整功能</Text>
          <Button className="btn-login" onClick={login}>微信一键登录</Button>
        </View>
      </View>
    )
  }

  return (
    <View className="user-page tab-bar-page">
      <View className="header">
        <View className="user-card">
          <Image src={user?.avatar || ''} className="avatar" />
          <View className="info">
            <Text className="name">{user?.nickName || '用户'}</Text>
            {user?.creditScore != null && (
              <View className="credit-tag">
                <Text>信用分 {user.creditScore}</Text>
              </View>
            )}
          </View>
          <View className="edit-btn" onClick={() => goTo('/pages/profile-edit/index')}>
            <Text>编辑资料</Text>
          </View>
        </View>
        
        <View className="stats-row">
          <View className="stat-item" onClick={() => goTo('/pages/my-goods/index')}>
            <Text className="num">{stats.myGoodsCount}</Text>
            <Text className="label">我发布的</Text>
          </View>
          <View className="stat-item" onClick={() => goTo('/pages/favorites/index')}>
            <Text className="num">{stats.favoriteCount}</Text>
            <Text className="label">我收藏的</Text>
          </View>
          <View className="stat-item" onClick={() => goTo('/pages/browse-history/index')}>
            <Text className="num">{stats.browseHistoryCount}</Text>
            <Text className="label">浏览历史</Text>
          </View>
        </View>
      </View>

      <View className="menu-group">
        <View className="menu-title">我的交易</View>
        <View className="menu-grid">
          <View className="grid-item" onClick={() => goTo('/pages/orders/index')}>
            <View className="icon-box" style={{ background: '#fff7e6' }}>
              <IconFont name="order" size={26} color="#fa8c16" />
            </View>
            <Text>我的订单</Text>
          </View>
          <View className="grid-item" onClick={() => goTo('/pages/evaluations-received/index')}>
            <View className="icon-box" style={{ background: '#feffe6' }}>
              <IconFont name="star" size={26} color="#fadb14" />
            </View>
            <Text>我的评价</Text>
          </View>
          <View className="grid-item" onClick={() => goTo('/pages/orders/index?type=sold')}>
            <View className="icon-box" style={{ background: '#e6f7ff' }}>
              <IconFont name="receipt" size={26} color="#1890ff" />
            </View>
            <Text>我卖出的</Text>
          </View>
          <View className="grid-item" onClick={() => goTo('/pages/orders/index?type=bought')}>
            <View className="icon-box" style={{ background: '#f9f0ff' }}>
              <IconFont name="cart" size={26} color="#722ed1" />
            </View>
            <Text>我买到的</Text>
          </View>
        </View>
      </View>

      <View className="menu-list">
        <View className="list-item" onClick={() => goTo('/pages/chat-list/index')}>
          <View className="left">
            <IconFont name="chat" size={22} color="#52c41a" />
            <Text className="label">消息中心</Text>
          </View>
          <IconFont name="arrow" size={18} color="#ccc" />
        </View>
        <View className="list-item" onClick={() => {
          Taro.showModal({
            title: '帮助与反馈',
            content: '如有问题请联系管理员或稍后再试',
            showCancel: false,
          })
        }}>
          <View className="left">
            <IconFont name="help" size={22} color="#faad14" />
            <Text className="label">帮助与反馈</Text>
          </View>
          <IconFont name="arrow" size={18} color="#ccc" />
        </View>
        <View className="list-item" onClick={() => Taro.openSetting()}>
          <View className="left">
            <IconFont name="setting" size={22} color="#1890ff" />
            <Text className="label">设置</Text>
          </View>
          <IconFont name="arrow" size={18} color="#ccc" />
        </View>
      </View>
    </View>
  )
}
