import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { IconFont } from '@/components/iconfont'
import { setTabBarSelected, subscribeTabBar, getTabBarSelected } from '@/utils/tabbar-state'
import './index.scss'

const TAB_LIST = [
  { path: '/pages/index/index', text: '首页', icon: 'home' },
  { path: '/pages/publish/index', text: '发布', icon: 'add' },
  { path: '/pages/user/index', text: '我的', icon: 'user' },
]

export default function CustomTabBar() {
  const [selected, setSelected] = useState(getTabBarSelected())

  useEffect(() => {
    // 初始化时更新一次
    setSelected(getTabBarSelected())
    // 订阅状态变更
    const unsubscribe = subscribeTabBar(() => {
      setSelected(getTabBarSelected())
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const switchTo = (index: number, path: string) => {
    setTabBarSelected(index)
    Taro.switchTab({ url: path })
  }

  return (
    <View className="custom-tab-bar" style={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      height: '110rpx', 
      background: '#fff', 
      display: 'flex', 
      alignItems: 'flex-end', 
      justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom)',
      borderTop: '1rpx solid rgba(0,0,0,0.05)',
      boxShadow: '0 -4rpx 16rpx rgba(0,0,0,0.03)',
      zIndex: 9999
    }}>
      {TAB_LIST.map((tab, index) => {
        const isSelected = selected === index
        const isPublish = index === 1 // 中间的是发布按钮
        
        return (
          <View
            key={tab.path}
            className={`tab-item ${isPublish ? 'publish-btn' : ''}`}
            onClick={() => switchTo(index, tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              paddingBottom: '8rpx',
            }}
          >
            {isPublish ? (
              <View className="publish-icon-wrap">
                <IconFont name="add" size={36} color="#1a1a1a" className="publish-icon" />
                <Text className="publish-text">发布</Text>
              </View>
            ) : (
              <IconFont
                name={tab.icon}
                size={28}
                color={isSelected ? '#222' : '#999'}
                className="tab-icon"
                style={{ marginBottom: '4rpx' }}
              />
            )}
            {!isPublish && (
              <Text
                className="tab-text"
                style={{ 
                  color: isSelected ? '#222' : '#999',
                  fontWeight: isSelected ? '600' : 'normal',
                  fontSize: '20rpx',
                  marginTop: '4rpx'
                }}
              >
                {tab.text}
              </Text>
            )}
          </View>
        )
      })}
    </View>
  )
}
