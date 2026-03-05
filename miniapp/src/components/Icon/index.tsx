import { View, Text, Image } from '@tarojs/components'
import './index.scss'

export type IconName =
  | 'add'
  | 'camera'
  | 'location'
  | 'title'
  | 'price'
  | 'category'
  | 'desc'
  | 'delete'
  | 'check'
  | 'close'
  | 'arrow-right'
  | 'home'
  | 'user'

interface IconProps {
  name: IconName
  size?: number
  color?: string
  className?: string
}

const ICON_MAP: Record<IconName, string> = {
  add: '+',
  camera: '📷',
  location: '📍',
  title: '✏️',
  price: '¥',
  category: '📁',
  desc: '📝',
  delete: '×',
  check: '✓',
  close: '×',
  'arrow-right': '›',
  home: '⌂',
  user: '👤',
}

export function Icon({ name, size = 44, color, className = '' }: IconProps) {
  const char = ICON_MAP[name]
  const isSimple = ['add', 'delete', 'check', 'close', 'arrow-right', 'price'].includes(name)

  return (
    <View
      className={`icon-wrap ${isSimple ? 'icon-simple' : ''} ${className}`}
      style={{
        width: `${size}rpx`,
        height: `${size}rpx`,
        fontSize: `${size * 0.6}rpx`,
        color: color || (isSimple ? '#07c160' : 'inherit'),
      }}
    >
      <Text className="icon-char">{char}</Text>
    </View>
  )
}
