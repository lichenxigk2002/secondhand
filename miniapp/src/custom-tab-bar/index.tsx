import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { setTabBarSelected, subscribeTabBar, getTabBarSelected } from '@/utils/tabbar-state'
import './index.scss'

const TAB_LIST = [
  { path: '/pages/index/index', text: '首页', icon: 'home', activeIcon: 'home' },
  { path: '/pages/publish/index', text: '发布', icon: 'add-circle', activeIcon: 'add-circle' },
  { path: '/pages/user/index', text: '我的', icon: 'user-circle', activeIcon: 'user-circle' },
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
    <View className="custom-tab-bar">
      {TAB_LIST.map((tab, index) => {
        const isSelected = selected === index
        const isPublish = index === 1
        
        return (
          <View
            key={tab.path}
            className={`tab-item ${isPublish ? 'publish-btn' : ''} ${isSelected ? 'active' : ''}`}
            onClick={() => switchTo(index, tab.path)}
          >
            {isPublish ? (
              <View className="publish-icon-wrap">
                <t-icon
                  name={isSelected ? tab.activeIcon : tab.icon}
                  size="34rpx"
                  color={isSelected ? '#8a5a00' : '#17233d'}
                />
                <Text className="publish-text">发布</Text>
              </View>
            ) : (
              <View className="tab-icon">
                <t-icon
                  name={isSelected ? tab.activeIcon : tab.icon}
                  size="40rpx"
                  color={isSelected ? '#17233d' : '#8a919f'}
                />
              </View>
            )}
            {!isPublish && (
              <Text className="tab-text">
                {tab.text}
              </Text>
            )}
          </View>
        )
      })}
    </View>
  )
}
