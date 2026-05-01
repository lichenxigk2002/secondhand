import { View, Text } from '@tarojs/components'
import './index.scss'

export type LineIconName =
  | 'home'
  | 'user'
  | 'plus'
  | 'message'
  | 'help'
  | 'settings'
  | 'logout'
  | 'order'
  | 'sparkles'
  | 'bookmark'
  | 'bag'
  | 'search'
  | 'chevron-right'

interface Props {
  name: LineIconName
  size?: number
  className?: string
  active?: boolean
  tone?: 'default' | 'brand' | 'green' | 'gold' | 'blue' | 'purple' | 'danger'
}

export default function LineIcon({
  name,
  size = 32,
  className = '',
  active = false,
  tone = 'default',
}: Props) {
  const cls = `line-icon ${name} tone-${tone} ${active ? 'active' : ''} ${className}`.trim()
  const style = { width: `${size}rpx`, height: `${size}rpx` }

  if (name === 'home') {
    return (
      <View className={cls} style={style}>
        <View className="home-roof left" />
        <View className="home-roof right" />
        <View className="home-body" />
      </View>
    )
  }

  if (name === 'user') {
    return (
      <View className={cls} style={style}>
        <View className="user-head" />
        <View className="user-body" />
      </View>
    )
  }

  if (name === 'plus') {
    return (
      <View className={cls} style={style}>
        <View className="plus-circle" />
        <View className="plus-h" />
        <View className="plus-v" />
      </View>
    )
  }

  if (name === 'message') {
    return (
      <View className={cls} style={style}>
        <View className="message-box" />
        <View className="message-tail" />
        <View className="message-dot dot-1" />
        <View className="message-dot dot-2" />
        <View className="message-dot dot-3" />
      </View>
    )
  }

  if (name === 'help') {
    return (
      <View className={cls} style={style}>
        <View className="circle-shell" />
        <Text className="glyph">?</Text>
      </View>
    )
  }

  if (name === 'settings') {
    return (
      <View className={cls} style={style}>
        <View className="gear-ring outer" />
        <View className="gear-ring inner" />
        <View className="gear-tick tick-top" />
        <View className="gear-tick tick-right" />
        <View className="gear-tick tick-bottom" />
        <View className="gear-tick tick-left" />
      </View>
    )
  }

  if (name === 'logout') {
    return (
      <View className={cls} style={style}>
        <View className="logout-door" />
        <View className="logout-line" />
        <View className="logout-arrow top" />
        <View className="logout-arrow bottom" />
      </View>
    )
  }

  if (name === 'order') {
    return (
      <View className={cls} style={style}>
        <View className="order-sheet" />
        <View className="order-line line-1" />
        <View className="order-line line-2" />
        <View className="order-line line-3" />
      </View>
    )
  }

  if (name === 'sparkles') {
    return (
      <View className={cls} style={style}>
        <Text className="glyph">✦</Text>
      </View>
    )
  }

  if (name === 'bookmark') {
    return (
      <View className={cls} style={style}>
        <View className="bookmark-body" />
        <View className="bookmark-notch" />
      </View>
    )
  }

  if (name === 'bag') {
    return (
      <View className={cls} style={style}>
        <View className="bag-handle" />
        <View className="bag-body" />
      </View>
    )
  }

  if (name === 'search') {
    return (
      <View className={cls} style={style}>
        <View className="search-ring" />
        <View className="search-handle" />
      </View>
    )
  }

  return (
    <View className={cls} style={style}>
      <View className="chevron-line top" />
      <View className="chevron-line bottom" />
    </View>
  )
}
