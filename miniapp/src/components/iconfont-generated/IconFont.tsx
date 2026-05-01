import { View } from '@tarojs/components'
import { MaterialCommunityIcons } from 'taro-icons'

const NAME_TO_MDI: Record<string, string> = {
  search: 'magnify',
  apps: 'layers-triple-outline',
  phone: 'cellphone',
  book: 'book-open-page-variant-outline',
  basket: 'basket-outline',
  shirt: 'tshirt-crew-outline',
  grid: 'shape-outline',
  list: 'format-list-bulleted',
  map: 'map-marker-radius-outline',
  folder: 'folder-outline',
  home: 'home-variant-outline',
  add: 'plus',
  user: 'account-outline',
  order: 'clipboard-text-outline',
  star: 'star-four-points-outline',
  receipt: 'receipt-text-outline',
  cart: 'shopping-outline',
  chat: 'message-text-outline',
  arrow: 'chevron-right',
  help: 'help-circle-outline',
  setting: 'cog-outline',
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
  const iconName = NAME_TO_MDI[key] || 'help-circle-outline'

  return (
    <View className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <MaterialCommunityIcons name={iconName as any} size={size} color={color} />
    </View>
  )
}
