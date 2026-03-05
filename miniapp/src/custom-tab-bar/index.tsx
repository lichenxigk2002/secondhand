import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { setTabBarSelected, subscribeTabBar, getTabBarSelected } from '@/utils/tabbar-state'
import './index.scss'

import homeIcon from '../assets/home.png'
import homeActiveIcon from '../assets/home-active.png'
import addIcon from '../assets/add.png'
import addActiveIcon from '../assets/add-active.png'
import userIcon from '../assets/user.png'
import userActiveIcon from '../assets/user-active.png'

const TAB_LIST = [
  { path: '/pages/index/index', text: '首页', icon: homeIcon, activeIcon: homeActiveIcon },
  { path: '/pages/publish/index', text: '发布', icon: addIcon, activeIcon: addActiveIcon },
  { path: '/pages/user/index', text: '我的', icon: userIcon, activeIcon: userActiveIcon },
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
              position: isPublish ? 'relative' : 'static',
              overflow: 'visible'
            }}
          >
            {isPublish ? (
              <View className="publish-icon-wrap" style={{
                width: '100rpx',
                height: '100rpx',
                background: '#FFD100',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8rpx 20rpx rgba(255, 209, 0, 0.4)',
                marginBottom: '4rpx',
                position: 'absolute',
                top: '-48rpx'
              }}>
                <Image src={addIcon} className="publish-icon" style={{ width: '50rpx', height: '50rpx', display: 'block' }} />
              </View>
            ) : (
              <Image 
                src={isSelected ? tab.activeIcon : tab.icon} 
                className="tab-icon"
                style={{ width: '56rpx', height: '56rpx', display: 'block', marginBottom: '4rpx' }}
              />
            )}
            <Text
              className="tab-text"
              style={{ 
                color: isSelected ? '#222' : '#999',
                fontWeight: isSelected ? '600' : 'normal',
                fontSize: '20rpx',
                marginTop: isPublish ? '56rpx' : '4rpx'
              }}
            >
              {tab.text}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
