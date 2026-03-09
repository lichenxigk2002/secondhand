/**
 * 阿里 Iconfont 图标组件（回退版）
 * 未配置 symbol_url 或未执行 npm run iconfont 时使用 Ionicons 作为回退。
 * 在 iconfont.json 中配置 symbol_url 并执行 npm run iconfont 后，此文件会被生成的组件覆盖。
 */
import { View } from '@tarojs/components'
import { Ionicons } from 'taro-icons'

const NAME_TO_IONICONS: Record<string, string> = {
  search: 'ios-search',
  apps: 'ios-apps',
  phone: 'ios-phone-portrait',
  book: 'ios-book',
  basket: 'ios-basket',
  shirt: 'ios-shirt',
  grid: 'ios-grid',
  list: 'ios-list',
  map: 'ios-map',
  folder: 'ios-folder-open',
  home: 'ios-home',
  add: 'ios-add',
  user: 'ios-person',
  order: 'ios-list-box',
  star: 'ios-star',
  receipt: 'ios-card',
  cart: 'ios-basket',
  chat: 'ios-chatbubbles',
  arrow: 'ios-arrow-forward',
  help: 'ios-help-circle',
  setting: 'ios-settings',
}

interface IconFontProps {
  name: string
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

export default function IconFont({ name, size = 24, color = '#333', className = '', style }: IconFontProps) {
  const key = name.replace(/^icon-/, '')
  const ioniconName = NAME_TO_IONICONS[key] || 'ios-help-circle-outline'

  return (
    <View className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <Ionicons name={ioniconName as any} size={size} color={color} />
    </View>
  )
}
