import { useState, useEffect } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { userApi, messageApi } from '@/services/api'
import type { User, UserStats } from '@/services/api'
import { setTabBarSelected } from '@/utils/tabbar-state'
import './index.scss'

const defaultStats: UserStats = { myGoodsCount: 0, favoriteCount: 0, browseHistoryCount: 0 }

export default function UserPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats>(defaultStats)
  const [unreadCount, setUnreadCount] = useState(0)

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
    loadUser()
    updateMessageBadge()
    if (Taro.getStorageSync('token')) loadStats()
  })

  const updateMessageBadge = () => {
    if (!Taro.getStorageSync('token')) {
      setUnreadCount(0)
      Taro.removeTabBarBadge({ index: 2 }).catch(() => {})
      return
    }
    messageApi
      .getUnreadCount({ silent: true })
      .then((res) => {
        const n = res?.count ?? 0
        setUnreadCount(n)
        if (n > 0) {
          Taro.setTabBarBadge({ index: 2, text: n > 99 ? '99+' : String(n) })
        } else {
          Taro.removeTabBarBadge({ index: 2 }).catch(() => {})
        }
      })
      .catch(() => {
        setUnreadCount(0)
        Taro.removeTabBarBadge({ index: 2 }).catch(() => {})
      })
  }

  const loadUser = () => {
    const token = Taro.getStorageSync('token')
    if (!token) return
    userApi.getProfile({ silent: true }).then((profile) => {
      setUser(profile)
      Taro.setStorageSync('user_info', profile)
    }).catch(() => {})
  }

  const login = () => {
    Taro.login({
      success: (res) => {
        if (res.code) {
          userApi.login(res.code)
            .then((data) => {
              Taro.setStorageSync('token', data.token)
              Taro.setStorageSync('user_info', data.user)
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

  const logout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '退出后仍可浏览商品，但需要重新登录才能发布、聊天和下单。',
      success: (res) => {
        if (!res.confirm) return
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('user_info')
        setUser(null)
        setStats(defaultStats)
        setUnreadCount(0)
        Taro.removeTabBarBadge({ index: 2 }).catch(() => {})
      },
    })
  }

  if (!Taro.getStorageSync('token')) {
    return (
      <View className="user-page tab-bar-page">
        <View className="login-tip">
          <Image src="https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0" className="logo" />
          <Text className="title">欢迎来到邻物集</Text>
          <Text className="subtitle">登录后发布物品、联系卖家和管理交易</Text>
          <Button className="btn-login" onClick={login}>微信一键登录</Button>
        </View>
      </View>
    )
  }

  return (
    <View className="user-page tab-bar-page">
      <View className="summary-panel">
        <Text className="summary-title">个人中心</Text>
        <Text className="summary-subtitle">
          {unreadCount > 0
            ? `当前有 ${unreadCount} 条未读消息，建议优先回复，避免错过交易。`
            : '这里汇总你的交易、收藏、浏览和消息状态。'}
        </Text>
      </View>
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

      <View className="overview-card">
        <View className="overview-item">
          <Text className="overview-label">信用状态</Text>
          <Text className="overview-value">{user?.creditScore ?? 0}</Text>
          <Text className="overview-desc">保持真实描述与及时回复，更容易成交</Text>
        </View>
        <View className="overview-item">
          <Text className="overview-label">消息状态</Text>
          <Text className="overview-value">{unreadCount}</Text>
          <Text className="overview-desc">{unreadCount > 0 ? '有待处理会话' : '消息已处理完毕'}</Text>
        </View>
      </View>

      <View className="menu-group">
        <View className="menu-title">我的交易</View>
        <View className="menu-grid">
          <View className="grid-item" onClick={() => goTo('/pages/orders/index')}>
            <View className="icon-box" style={{ background: '#fff7e6' }}>
              <t-icon name="assignment" size="38rpx" color="#d46b08" />
            </View>
            <Text>我的订单</Text>
          </View>
          <View className="grid-item" onClick={() => goTo('/pages/evaluations-received/index')}>
            <View className="icon-box" style={{ background: '#feffe6' }}>
              <t-icon name="chat-bubble-1" size="38rpx" color="#2f54eb" />
            </View>
            <Text>我的评价</Text>
          </View>
          <View className="grid-item" onClick={() => goTo('/pages/orders/index?type=sold')}>
            <View className="icon-box" style={{ background: '#e6f7ff' }}>
              <t-icon name="shop" size="38rpx" color="#08979c" />
            </View>
            <Text>我卖出的</Text>
          </View>
          <View className="grid-item" onClick={() => goTo('/pages/orders/index?type=bought')}>
            <View className="icon-box" style={{ background: '#f9f0ff' }}>
              <t-icon name="cart" size="38rpx" color="#722ed1" />
            </View>
            <Text>我买到的</Text>
          </View>
        </View>
      </View>

      <View className="menu-list">
        <t-cell-group>
          <t-cell
            title="消息中心"
            leftIcon="chat-message"
            note={unreadCount > 0 ? (unreadCount > 99 ? '99+' : String(unreadCount)) : ''}
            arrow
            hover
            onClick={() => goTo('/pages/chat-list/index')}
          />
          <t-cell
            title="帮助与反馈"
            leftIcon="help-circle"
            arrow
            hover
            onClick={() => {
          Taro.showModal({
            title: '帮助与反馈',
            content: '如有问题请联系管理员或稍后再试',
            showCancel: false,
          })
            }}
          />
          <t-cell title="设置" leftIcon="setting" arrow hover onClick={() => Taro.openSetting()} />
          <t-cell title="退出登录" leftIcon="logout" arrow hover onClick={logout} />
        </t-cell-group>
      </View>
    </View>
  )
}
