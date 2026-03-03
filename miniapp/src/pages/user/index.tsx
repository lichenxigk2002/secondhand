import { useState, useEffect } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { userApi } from '@/services/api'
import type { User } from '@/services/api'
import './index.scss'

export default function UserPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = () => {
    const token = Taro.getStorageSync('token')
    if (!token) return
    userApi.getProfile().then(setUser).catch(() => {})
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
      <View className="user-page">
        <View className="login-tip">
          <Text>登录后使用完整功能</Text>
          <Button className="btn-login" onClick={login}>微信登录</Button>
        </View>
      </View>
    )
  }

  return (
    <View className="user-page">
      <View className="header">
        <Image src={user?.avatar || ''} className="avatar" />
        <Text className="name">{user?.nickName || '用户'}</Text>
        {user?.creditScore != null && (
          <Text className="credit">信用分 {user.creditScore}</Text>
        )}
      </View>
      <View className="menu">
        <View className="item" onClick={() => goTo('/pages/my-goods/index')}>
          <Text>我的发布</Text>
          <Text className="arrow">&gt;</Text>
        </View>
        <View className="item" onClick={() => goTo('/pages/profile-edit/index')}>
          <Text>编辑资料</Text>
          <Text className="arrow">&gt;</Text>
        </View>
        <View className="item" onClick={() => goTo('/pages/favorites/index')}>
          <Text>我的收藏</Text>
          <Text className="arrow">&gt;</Text>
        </View>
        <View className="item" onClick={() => goTo('/pages/browse-history/index')}>
          <Text>浏览历史</Text>
          <Text className="arrow">&gt;</Text>
        </View>
        <View className="item" onClick={() => goTo('/pages/orders/index')}>
          <Text>我的订单</Text>
          <Text className="arrow">&gt;</Text>
        </View>
        <View className="item" onClick={() => goTo('/pages/chat-list/index')}>
          <Text>我的消息</Text>
          <Text className="arrow">&gt;</Text>
        </View>
      </View>
    </View>
  )
}
