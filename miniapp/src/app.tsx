import React from 'react'
import { View, Text } from '@tarojs/components'
import { useLaunch } from '@tarojs/taro'
import 'taro-icons/scss/Ionicons.scss'
import './app.scss'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown) {
    const message =
      error instanceof Error ? error.message : typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error)
    return { hasError: true, message: message || '加载异常' }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ padding: '40rpx' }}>
          <Text>页面异常：{this.state.message}</Text>
        </View>
      )
    }
    return this.props.children
  }
}

function App(props) {
  const { children } = props
  useLaunch(() => {
    try {
      console.log('App launched.')
    } catch (e) {
      console.error('Launch error:', e instanceof Error ? e.message : e)
    }
  })

  return <ErrorBoundary>{children}</ErrorBoundary>
}

export default App
