import { Image } from '@tarojs/components'
import './index.scss'

const ICONS = {
  all: '/assets/ui-icons/all.png',
  phone: '/assets/ui-icons/phone.png',
  book: '/assets/ui-icons/book.png',
  life: '/assets/ui-icons/life.png',
  clothes: '/assets/ui-icons/clothes.png',
  other: '/assets/ui-icons/other.png',
  'tab-home': '/assets/ui-icons/tab-home.png',
  'tab-home-active': '/assets/ui-icons/tab-home-active.png',
  'tab-add': '/assets/ui-icons/tab-add.png',
  'tab-user': '/assets/ui-icons/tab-user.png',
  'tab-user-active': '/assets/ui-icons/tab-user-active.png',
  'trade-order': '/assets/ui-icons/trade-order.png',
  'trade-star': '/assets/ui-icons/trade-star.png',
  'trade-sold': '/assets/ui-icons/trade-sold.png',
  'trade-bag': '/assets/ui-icons/trade-bag.png',
  'menu-message': '/assets/ui-icons/menu-message.svg',
  'menu-help': '/assets/ui-icons/menu-help.svg',
  'menu-setting': '/assets/ui-icons/menu-setting.svg',
  'menu-logout': '/assets/ui-icons/menu-logout.svg',
  'arrow-right-modern': '/assets/ui-icons/arrow-right-modern.svg',
  'search-modern': '/assets/ui-icons/search-modern.svg',
}

export type AppIconName = keyof typeof ICONS

interface Props {
  name: AppIconName
  size?: number
  className?: string
}

export default function AppIcon({ name, size = 28, className = '' }: Props) {
  return (
    <Image
      className={`app-icon ${className}`}
      src={ICONS[name]}
      mode="aspectFit"
      style={{ width: `${size}rpx`, height: `${size}rpx` }}
    />
  )
}
